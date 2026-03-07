"""Stripe billing helpers for subscriptions and one-off project passes."""

from __future__ import annotations

import importlib
import logging
import os
from datetime import datetime, timedelta, timezone
from typing import Any, Optional
from urllib.parse import parse_qsl, urlencode, urlparse, urlunparse

from sqlalchemy.orm import Session

from app.models.billing_entitlement import BillingEntitlement
from app.models.billing_project_pass import BillingProjectPass
from app.models.project import Project
from app.models.user import User

logger = logging.getLogger(__name__)

ACTIVE_SUBSCRIPTION_STATUSES = {"active", "trialing"}
ACTIVE_ENTITLEMENT_STATUSES = {"active"}
ACTIVE_PROJECT_PASS_STATUSES = {"active"}
CIRCLE_KEYWORDS = ("circle", "Circle", "member")
ENERGY_KEYWORDS = ("energy", "Energy")

PLAN_ENERGY_MONTHLY = "energy_monthly"
PLAN_PROJECT_PASS = "project_pass"


class BillingConfigurationError(RuntimeError):
    """Raised when Stripe billing is requested without required configuration."""


def _get_env(name: str, default: str = "") -> str:
    return os.getenv(name, default).strip()


def _billing_bypass_enabled() -> bool:
    return _get_env("BILLING_BYPASS", "false").lower() in {"1", "true", "yes", "on"}


def _public_app_url() -> str:
    return _get_env("APP_PUBLIC_URL", "https://rakuraku-energy.archi-prisma.co.jp")


def _stripe_secret_key() -> str:
    return _get_env("STRIPE_SECRET_KEY")


def _stripe_webhook_secret() -> str:
    return _get_env("STRIPE_WEBHOOK_SECRET")


def _energy_price_id() -> str:
    return _get_env("STRIPE_PRICE_ID_ENERGY")


def _circle_price_id() -> str:
    return _get_env("STRIPE_PRICE_ID_CIRCLE")


def _project_pass_price_id() -> str:
    return _get_env("STRIPE_PRICE_ID_PROJECT_PASS")


def _project_pass_days() -> int:
    raw_value = _get_env("STRIPE_PROJECT_PASS_DAYS", "30")
    try:
        days = int(raw_value)
    except ValueError:
        days = 30
    return max(days, 1)


def _load_stripe_module():
    return importlib.import_module("stripe")


def _configure_stripe(stripe_module: Any) -> None:
    stripe_module.api_key = _stripe_secret_key()


def _normalize_email(customer_email: str) -> str:
    return (customer_email or "").strip().lower()


def _coerce_utc(value: Optional[datetime]) -> Optional[datetime]:
    if value is None:
        return None
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc)


def _clean_value(value: Any) -> Optional[str]:
    text = str(value or "").strip()
    return text or None


def _plan_display_name(plan_code: str) -> str:
    if plan_code == PLAN_PROJECT_PASS:
        return f"1案件パス ({_project_pass_days()}日)"
    return "月額プラン"


def _payment_description(plan_code: str) -> str:
    return f"楽々省エネ計算 {_plan_display_name(plan_code)}"


def _retrieve_stripe_resource(stripe_module: Any, resource_name: str, resource_id: Optional[str]) -> Optional[dict[str, Any]]:
    resource_id = _clean_value(resource_id)
    if not resource_id:
        return None

    resource = getattr(stripe_module, resource_name, None)
    if resource is None or not hasattr(resource, "retrieve"):
        return None

    try:
        return resource.retrieve(resource_id)
    except Exception:  # pragma: no cover - defensive logging only
        logger.exception("Failed to retrieve Stripe %s %s", resource_name, resource_id)
        return None


def _invoice_links(invoice: Optional[dict[str, Any]]) -> dict[str, Any]:
    if not invoice:
        return {}

    payload: dict[str, Any] = {}
    invoice_id = _clean_value(invoice.get("id"))
    hosted_invoice_url = _clean_value(invoice.get("hosted_invoice_url"))
    invoice_pdf_url = _clean_value(invoice.get("invoice_pdf"))

    if invoice_id:
        payload["invoice_id"] = invoice_id
    if hosted_invoice_url:
        payload["invoice_hosted_url"] = hosted_invoice_url
    if invoice_pdf_url:
        payload["invoice_pdf_url"] = invoice_pdf_url
    return payload


def _charge_receipt_link(stripe_module: Any, charge_ref: Any) -> dict[str, Any]:
    charge = charge_ref if isinstance(charge_ref, dict) else _retrieve_stripe_resource(
        stripe_module,
        "Charge",
        _clean_value(charge_ref),
    )
    if not charge:
        return {}

    receipt_url = _clean_value(charge.get("receipt_url"))
    charge_id = _clean_value(charge.get("id"))
    payload: dict[str, Any] = {}
    if charge_id:
        payload["charge_id"] = charge_id
    if receipt_url:
        payload["receipt_url"] = receipt_url
    return payload


def _payment_intent_links(stripe_module: Any, payment_intent_id: Optional[str]) -> dict[str, Any]:
    payment_intent = _retrieve_stripe_resource(stripe_module, "PaymentIntent", payment_intent_id)
    if not payment_intent:
        return {}

    payload: dict[str, Any] = {}
    payment_intent_id = _clean_value(payment_intent.get("id")) or _clean_value(payment_intent_id)
    if payment_intent_id:
        payload["payment_intent_id"] = payment_intent_id

    latest_charge = payment_intent.get("latest_charge")
    if latest_charge:
        payload.update(_charge_receipt_link(stripe_module, latest_charge))
    return payload


def _latest_paid_invoice_links(
    stripe_module: Any,
    *,
    customer_id: Optional[str] = None,
    subscription_id: Optional[str] = None,
) -> dict[str, Any]:
    invoice_resource = getattr(stripe_module, "Invoice", None)
    if invoice_resource is None or not hasattr(invoice_resource, "list"):
        return {}

    list_kwargs: dict[str, Any] = {"status": "paid", "limit": 1}
    customer_id = _clean_value(customer_id)
    subscription_id = _clean_value(subscription_id)
    if customer_id:
        list_kwargs["customer"] = customer_id
    if subscription_id:
        list_kwargs["subscription"] = subscription_id

    try:
        invoices = invoice_resource.list(**list_kwargs)
    except Exception:  # pragma: no cover - defensive logging only
        logger.exception("Failed to list Stripe invoices for customer=%s subscription=%s", customer_id, subscription_id)
        return {}

    invoice_rows = list(getattr(invoices, "data", []) or [])
    if not invoice_rows:
        return {}

    invoice = invoice_rows[0]
    payload = _invoice_links(invoice)
    payload.update(_charge_receipt_link(stripe_module, invoice.get("charge")))
    return payload


def _checkout_receipt_links(stripe_module: Any, session: dict[str, Any]) -> dict[str, Any]:
    payload: dict[str, Any] = {}
    payload.update(_invoice_links(_retrieve_stripe_resource(stripe_module, "Invoice", session.get("invoice"))))
    payload.update(_payment_intent_links(stripe_module, session.get("payment_intent")))
    if "receipt_url" not in payload and session.get("invoice"):
        invoice = _retrieve_stripe_resource(stripe_module, "Invoice", session.get("invoice"))
        payload.update(_charge_receipt_link(stripe_module, (invoice or {}).get("charge")))
    return payload


def _project_pass_receipt_links(
    stripe_module: Any,
    *,
    stripe_session_id: Optional[str],
    stripe_payment_intent_id: Optional[str],
) -> dict[str, Any]:
    payload: dict[str, Any] = {}
    session = None
    checkout_resource = getattr(getattr(stripe_module, "checkout", None), "Session", None)
    if stripe_session_id and checkout_resource is not None and hasattr(checkout_resource, "retrieve"):
        try:
            session = checkout_resource.retrieve(stripe_session_id)
        except Exception:  # pragma: no cover - defensive logging only
            logger.exception("Failed to retrieve Stripe checkout session %s", stripe_session_id)

    if session:
        payload.update(_checkout_receipt_links(stripe_module, session))

    if "receipt_url" not in payload and stripe_payment_intent_id:
        payload.update(_payment_intent_links(stripe_module, stripe_payment_intent_id))

    return payload


def _plan_catalog() -> dict[str, dict[str, Any]]:
    return {
        PLAN_ENERGY_MONTHLY: {
            "label": "standard_monthly",
            "mode": "subscription",
            "price_id": _energy_price_id(),
            "available": bool(_stripe_secret_key() and _energy_price_id()),
        },
        PLAN_PROJECT_PASS: {
            "label": "project_pass_30d",
            "mode": "payment",
            "price_id": _project_pass_price_id(),
            "available": bool(_stripe_secret_key() and _project_pass_price_id()),
            "duration_days": _project_pass_days(),
        },
    }


def _resolve_plan(plan_code: str) -> dict[str, Any]:
    plan = _plan_catalog().get(plan_code)
    if not plan:
        raise BillingConfigurationError(f"Unknown billing plan: {plan_code}")
    if not plan["available"]:
        raise BillingConfigurationError(f"Stripe checkout is not configured for {plan_code}.")
    return {"code": plan_code, **plan}


def _append_query_params(base_url: str, **params: str) -> str:
    parsed = urlparse(base_url)
    query = dict(parse_qsl(parsed.query, keep_blank_values=True))
    for key, value in params.items():
        if value is not None and key not in query:
            query[key] = value
    return urlunparse(parsed._replace(query=urlencode(query)))


def _classify_subscription_item(stripe_module: Any, item: dict[str, Any]) -> Optional[str]:
    price = item.get("price") or {}
    price_id = str(price.get("id") or "")
    product_name = ""

    if _circle_price_id() and price_id == _circle_price_id():
        return "circle_member"
    if _energy_price_id() and price_id == _energy_price_id():
        return "energy_subscriber"

    product_id = price.get("product")
    if product_id:
        try:
            product = stripe_module.Product.retrieve(product_id)
            product_name = str(product.get("name") or "")
        except Exception:  # pragma: no cover - defensive logging only
            logger.exception("Failed to load Stripe product metadata for %s", product_id)

    if any(keyword in product_name for keyword in CIRCLE_KEYWORDS):
        return "circle_member"
    if any(keyword in product_name for keyword in ENERGY_KEYWORDS):
        return "energy_subscriber"
    return None


def _normalize_project_id(project_id: Any) -> Optional[int]:
    text = str(project_id or "").strip()
    if not text:
        return None
    try:
        normalized = int(text)
    except (TypeError, ValueError):
        return None
    return normalized if normalized > 0 else None


def _serialize_entitlement(entitlement: BillingEntitlement) -> dict[str, Any]:
    expires_at = _coerce_utc(entitlement.expires_at)
    return {
        "entitlement_id": entitlement.id,
        "entitlement_type": entitlement.entitlement_type,
        "entitlement_status": entitlement.status,
        "expires_at": expires_at.isoformat() if expires_at else None,
        "stripe_session_id": entitlement.stripe_session_id,
        "stripe_payment_intent_id": entitlement.stripe_payment_intent_id,
    }


def _serialize_project_pass(project_pass: BillingProjectPass) -> dict[str, Any]:
    expires_at = _coerce_utc(project_pass.expires_at)
    return {
        "project_pass_id": project_pass.id,
        "project_id": project_pass.project_id,
        "project_name": project_pass.project_name,
        "project_pass_status": project_pass.status,
        "expires_at": expires_at.isoformat() if expires_at else None,
        "stripe_session_id": project_pass.stripe_session_id,
        "stripe_payment_intent_id": project_pass.stripe_payment_intent_id,
    }


def _find_owned_project(*, db: Optional[Session], customer_email: str, project_id: Any) -> Project:
    if db is None:
        raise ValueError("Database session is required to validate the selected project.")

    normalized_email = _normalize_email(customer_email)
    normalized_project_id = _normalize_project_id(project_id)
    if normalized_project_id is None:
        raise ValueError("project_id is required for the one-project pass.")

    project = (
        db.query(Project)
        .join(User, User.id == Project.owner_id)
        .filter(Project.id == normalized_project_id, User.email == normalized_email)
        .first()
    )
    if project is None:
        raise ValueError("Selected project was not found for this account.")
    return project


def _get_active_entitlement(db: Optional[Session], customer_email: str) -> Optional[BillingEntitlement]:
    if db is None:
        return None

    normalized_email = _normalize_email(customer_email)
    if not normalized_email:
        return None

    now = datetime.now(timezone.utc)
    did_update = False
    entitlements = (
        db.query(BillingEntitlement)
        .filter(
            BillingEntitlement.email == normalized_email,
            BillingEntitlement.status.in_(ACTIVE_ENTITLEMENT_STATUSES),
        )
        .order_by(BillingEntitlement.created_at.desc(), BillingEntitlement.id.desc())
        .all()
    )

    for entitlement in entitlements:
        expires_at = _coerce_utc(entitlement.expires_at)
        if expires_at and expires_at <= now:
            entitlement.status = "expired"
            did_update = True
            continue
        return entitlement

    if did_update:
        db.commit()
    return None


def _get_active_project_passes(db: Optional[Session], customer_email: str) -> list[BillingProjectPass]:
    if db is None:
        return []

    normalized_email = _normalize_email(customer_email)
    if not normalized_email:
        return []

    now = datetime.now(timezone.utc)
    did_update = False
    rows = (
        db.query(BillingProjectPass)
        .filter(
            BillingProjectPass.email == normalized_email,
            BillingProjectPass.status.in_(ACTIVE_PROJECT_PASS_STATUSES),
        )
        .order_by(BillingProjectPass.created_at.desc(), BillingProjectPass.id.desc())
        .all()
    )

    active_rows: list[BillingProjectPass] = []
    for row in rows:
        expires_at = _coerce_utc(row.expires_at)
        if expires_at and expires_at <= now:
            row.status = "expired"
            did_update = True
            continue
        active_rows.append(row)

    if did_update:
        db.commit()
    return active_rows


def _project_pass_summaries(project_passes: list[BillingProjectPass]) -> list[dict[str, Any]]:
    return [_serialize_project_pass(project_pass) for project_pass in project_passes]


def _match_project_pass(
    project_passes: list[BillingProjectPass],
    project_id: Optional[int],
) -> Optional[BillingProjectPass]:
    if project_id is None:
        return None
    for project_pass in project_passes:
        if project_pass.project_id == project_id:
            return project_pass
    return None


def _upsert_project_pass(
    *,
    db: Session,
    customer_email: str,
    project: Project,
    stripe_session_id: str,
    stripe_payment_intent_id: Optional[str],
    notes: Optional[str] = None,
) -> BillingProjectPass:
    normalized_email = _normalize_email(customer_email)
    expires_at = datetime.now(timezone.utc) + timedelta(days=_project_pass_days())

    project_pass = (
        db.query(BillingProjectPass)
        .filter(BillingProjectPass.stripe_session_id == stripe_session_id)
        .first()
    )

    if project_pass is None:
        project_pass = BillingProjectPass(
            email=normalized_email,
            project_id=project.id,
            project_name=project.name,
            status="active",
            source="stripe_checkout",
            stripe_session_id=stripe_session_id,
            stripe_payment_intent_id=stripe_payment_intent_id,
            expires_at=expires_at,
            notes=notes,
        )
        db.add(project_pass)
    else:
        project_pass.email = normalized_email
        project_pass.project_id = project.id
        project_pass.project_name = project.name
        project_pass.status = "active"
        project_pass.stripe_payment_intent_id = stripe_payment_intent_id
        project_pass.expires_at = expires_at
        if notes is not None:
            project_pass.notes = notes

    db.commit()
    db.refresh(project_pass)
    return project_pass


def _set_entitlement_status(
    *,
    db: Session,
    stripe_session_id: Optional[str] = None,
    stripe_payment_intent_id: Optional[str] = None,
    status: str,
    notes: Optional[str] = None,
) -> Optional[BillingEntitlement]:
    query = db.query(BillingEntitlement)

    if stripe_session_id:
        query = query.filter(BillingEntitlement.stripe_session_id == stripe_session_id)
    elif stripe_payment_intent_id:
        query = query.filter(BillingEntitlement.stripe_payment_intent_id == stripe_payment_intent_id)
    else:
        return None

    entitlement = query.first()
    if entitlement is None:
        return None

    entitlement.status = status
    if notes is not None:
        entitlement.notes = notes
    db.commit()
    db.refresh(entitlement)
    return entitlement


def _set_project_pass_status(
    *,
    db: Session,
    stripe_session_id: Optional[str] = None,
    stripe_payment_intent_id: Optional[str] = None,
    status: str,
    notes: Optional[str] = None,
) -> Optional[BillingProjectPass]:
    query = db.query(BillingProjectPass)

    if stripe_session_id:
        query = query.filter(BillingProjectPass.stripe_session_id == stripe_session_id)
    elif stripe_payment_intent_id:
        query = query.filter(BillingProjectPass.stripe_payment_intent_id == stripe_payment_intent_id)
    else:
        return None

    project_pass = query.first()
    if project_pass is None:
        return None

    project_pass.status = status
    if notes is not None:
        project_pass.notes = notes
    db.commit()
    db.refresh(project_pass)
    return project_pass


def billing_public_config() -> dict[str, Any]:
    """Expose non-secret billing configuration to the frontend."""
    bypass_enabled = _billing_bypass_enabled()
    plan_catalog = _plan_catalog()
    return {
        "billing_enabled": not bypass_enabled and bool(_stripe_secret_key()),
        "checkout_available": not bypass_enabled and any(plan["available"] for plan in plan_catalog.values()),
        "bypass_enabled": bypass_enabled,
        "public_app_url": _public_app_url(),
        "plans": {
            PLAN_ENERGY_MONTHLY: {
                "available": not bypass_enabled and plan_catalog[PLAN_ENERGY_MONTHLY]["available"],
                "mode": plan_catalog[PLAN_ENERGY_MONTHLY]["mode"],
            },
            PLAN_PROJECT_PASS: {
                "available": not bypass_enabled and plan_catalog[PLAN_PROJECT_PASS]["available"],
                "mode": plan_catalog[PLAN_PROJECT_PASS]["mode"],
                "duration_days": plan_catalog[PLAN_PROJECT_PASS]["duration_days"],
                "requires_project": True,
            },
        },
    }


def create_checkout_session(
    *,
    customer_email: str,
    plan: str = PLAN_ENERGY_MONTHLY,
    success_url: Optional[str] = None,
    cancel_url: Optional[str] = None,
    project_id: Optional[int] = None,
    db: Optional[Session] = None,
) -> dict[str, Any]:
    """Create a Stripe Checkout session for a supported billing plan."""
    if _billing_bypass_enabled():
        return {
            "checkout_url": success_url,
            "session_id": "billing-bypass",
            "mode": "development_bypass",
            "plan": plan,
            "project_id": project_id,
        }

    normalized_email = _normalize_email(customer_email)
    if not normalized_email:
        raise BillingConfigurationError("customer_email is required")

    plan_info = _resolve_plan(plan)
    stripe_module = _load_stripe_module()
    _configure_stripe(stripe_module)

    base_url = _public_app_url()
    success = _append_query_params(
        success_url or f"{base_url}/pricing?checkout=success",
        plan=plan,
        session_id="{CHECKOUT_SESSION_ID}",
    )
    cancel = _append_query_params(
        cancel_url or f"{base_url}/pricing",
        plan=plan,
    )

    metadata = {
        "product": "energy-calc",
        "plan_code": plan,
        "customer_email": normalized_email,
    }

    selected_project = None
    if plan == PLAN_PROJECT_PASS:
        selected_project = _find_owned_project(db=db, customer_email=normalized_email, project_id=project_id)
        metadata["project_id"] = str(selected_project.id)
        metadata["project_name"] = selected_project.name

    create_kwargs: dict[str, Any] = {
        "mode": plan_info["mode"],
        "payment_method_types": ["card"],
        "customer_email": normalized_email,
        "client_reference_id": normalized_email,
        "line_items": [{"price": plan_info["price_id"], "quantity": 1}],
        "success_url": success,
        "cancel_url": cancel,
        "allow_promotion_codes": True,
        "metadata": metadata,
        "locale": "ja",
    }

    if plan_info["mode"] == "subscription":
        create_kwargs["subscription_data"] = {"metadata": metadata}
    else:
        create_kwargs["customer_creation"] = "always"
        create_kwargs["invoice_creation"] = {
            "enabled": True,
            "invoice_data": {
                "description": _payment_description(plan),
                "metadata": metadata,
                "custom_fields": [
                    {"name": "プラン", "value": _plan_display_name(plan)},
                    {"name": "対象案件", "value": selected_project.name if selected_project else "未設定"},
                ],
            },
        }
        create_kwargs["payment_intent_data"] = {
            "metadata": metadata,
            "receipt_email": normalized_email,
            "description": _payment_description(plan),
        }

    session = stripe_module.checkout.Session.create(**create_kwargs)
    return {
        "checkout_url": session.url,
        "session_id": session.id,
        "mode": plan_info["mode"],
        "plan": plan,
        "project_id": selected_project.id if selected_project else None,
    }


def confirm_checkout_session(*, session_id: str, db: Session) -> dict[str, Any]:
    """Confirm a Stripe Checkout session and grant one-off access when needed."""
    config = billing_public_config()
    if config["bypass_enabled"]:
        return {
            "confirmed": True,
            "active": True,
            "type": "development_bypass",
            "reason": None,
            "session_id": session_id,
            **config,
        }

    if not session_id:
        raise BillingConfigurationError("session_id is required")
    if not _stripe_secret_key():
        raise BillingConfigurationError("Stripe is not configured.")

    stripe_module = _load_stripe_module()
    _configure_stripe(stripe_module)
    session = stripe_module.checkout.Session.retrieve(session_id)
    receipt_links = _checkout_receipt_links(stripe_module, session)

    metadata = session.get("metadata") or {}
    plan_code = str(metadata.get("plan_code") or "")
    if not plan_code:
        plan_code = PLAN_PROJECT_PASS if session.get("mode") == "payment" else PLAN_ENERGY_MONTHLY

    customer_details = session.get("customer_details") or {}
    customer_email = _normalize_email(
        str(
            customer_details.get("email")
            or session.get("customer_email")
            or metadata.get("customer_email")
            or session.get("client_reference_id")
            or ""
        )
    )

    if not customer_email:
        raise BillingConfigurationError("Unable to determine customer email from checkout session.")

    project_id = _normalize_project_id(metadata.get("project_id"))

    if plan_code == PLAN_PROJECT_PASS:
        if session.get("payment_status") != "paid":
            return {
                "confirmed": False,
                "active": False,
                "type": PLAN_PROJECT_PASS,
                "reason": "payment_not_completed",
                "customer_email": customer_email,
                "session_id": session_id,
                "project_id": project_id,
                **config,
            }

        project = _find_owned_project(db=db, customer_email=customer_email, project_id=project_id)
        project_pass = _upsert_project_pass(
            db=db,
            customer_email=customer_email,
            project=project,
            stripe_session_id=session_id,
            stripe_payment_intent_id=str(session.get("payment_intent") or "") or None,
            notes="Granted from Stripe Checkout one-project pass purchase.",
        )
        return {
            "confirmed": True,
            "active": True,
            "type": PLAN_PROJECT_PASS,
            "reason": None,
            "customer_email": customer_email,
            "plan": plan_code,
            "session_id": session_id,
            **_serialize_project_pass(project_pass),
            **receipt_links,
            **config,
        }

    status_payload = check_subscription(customer_email, db=db, project_id=project_id)
    status_payload.update(
        {
            "confirmed": bool(status_payload.get("active")),
            "plan": plan_code,
            "session_id": session_id,
            **receipt_links,
        }
    )
    if not status_payload.get("active") and not status_payload.get("reason"):
        status_payload["reason"] = "subscription_not_active_yet"
    return status_payload


def construct_webhook_event(*, payload: bytes, signature: str) -> dict[str, Any]:
    """Validate and parse a Stripe webhook event."""
    if not _stripe_secret_key() or not _stripe_webhook_secret():
        raise BillingConfigurationError("Stripe webhook is not configured.")
    if not signature:
        raise BillingConfigurationError("Missing Stripe signature header.")

    stripe_module = _load_stripe_module()
    _configure_stripe(stripe_module)
    try:
        return stripe_module.Webhook.construct_event(payload, signature, _stripe_webhook_secret())
    except Exception as exc:  # pragma: no cover - depends on Stripe runtime error type
        raise ValueError(f"Invalid Stripe webhook: {exc}") from exc


def process_webhook_event(*, event: dict[str, Any], db: Session) -> dict[str, Any]:
    """Apply supported Stripe webhook events to local billing state."""
    event_type = str(event.get("type") or "")
    payload = (event.get("data") or {}).get("object") or {}
    metadata = payload.get("metadata") or {}
    plan_code = str(metadata.get("plan_code") or "")

    if event_type in {"checkout.session.completed", "checkout.session.async_payment_succeeded"}:
        if plan_code == PLAN_PROJECT_PASS and payload.get("payment_status") == "paid":
            customer_details = payload.get("customer_details") or {}
            customer_email = _normalize_email(
                str(
                    customer_details.get("email")
                    or payload.get("customer_email")
                    or metadata.get("customer_email")
                    or payload.get("client_reference_id")
                    or ""
                )
            )
            if customer_email:
                project = _find_owned_project(
                    db=db,
                    customer_email=customer_email,
                    project_id=metadata.get("project_id"),
                )
                project_pass = _upsert_project_pass(
                    db=db,
                    customer_email=customer_email,
                    project=project,
                    stripe_session_id=str(payload.get("id") or ""),
                    stripe_payment_intent_id=str(payload.get("payment_intent") or "") or None,
                    notes=f"Granted from webhook event {event_type}.",
                )
                return {
                    "received": True,
                    "action": "project_pass_activated",
                    "event_type": event_type,
                    **_serialize_project_pass(project_pass),
                }

    if event_type == "charge.refunded":
        payment_intent_id = str(payload.get("payment_intent") or "")
        project_pass = _set_project_pass_status(
            db=db,
            stripe_payment_intent_id=payment_intent_id or None,
            status="refunded",
            notes="Marked refunded from Stripe webhook.",
        )
        entitlement = _set_entitlement_status(
            db=db,
            stripe_payment_intent_id=payment_intent_id or None,
            status="refunded",
            notes="Marked refunded from Stripe webhook.",
        )
        return {
            "received": True,
            "action": "project_pass_refunded" if project_pass or entitlement else "ignored",
            "event_type": event_type,
        }

    return {
        "received": True,
        "action": "ignored",
        "event_type": event_type,
    }


def check_subscription(
    customer_email: str,
    db: Optional[Session] = None,
    project_id: Optional[int] = None,
) -> dict[str, Any]:
    """Check whether the given email has paid access via subscription or project pass."""
    normalized_email = _normalize_email(customer_email)
    normalized_project_id = _normalize_project_id(project_id)
    config = billing_public_config()
    payload: dict[str, Any] = {
        "active": False,
        "type": None,
        "reason": None,
        "customer_email": normalized_email or customer_email,
        "project_id": normalized_project_id,
        "project_passes": [],
        **config,
    }

    if not normalized_email:
        payload["reason"] = "missing_email"
        return payload

    if config["bypass_enabled"]:
        payload.update({"active": True, "type": "development_bypass", "reason": None})
        return payload

    project_passes = _get_active_project_passes(db, normalized_email)
    payload["project_passes"] = _project_pass_summaries(project_passes)
    matched_project_pass = _match_project_pass(project_passes, normalized_project_id)
    if matched_project_pass is not None:
        if _stripe_secret_key():
            stripe_module = _load_stripe_module()
            _configure_stripe(stripe_module)
            payload.update(
                _project_pass_receipt_links(
                    stripe_module,
                    stripe_session_id=matched_project_pass.stripe_session_id,
                    stripe_payment_intent_id=matched_project_pass.stripe_payment_intent_id,
                )
            )
        payload.update(
            {
                "active": True,
                "type": PLAN_PROJECT_PASS,
                "reason": None,
                **_serialize_project_pass(matched_project_pass),
            }
        )
        return payload

    legacy_entitlement = _get_active_entitlement(db, normalized_email)
    if legacy_entitlement is not None:
        if _stripe_secret_key():
            stripe_module = _load_stripe_module()
            _configure_stripe(stripe_module)
            payload.update(
                _project_pass_receipt_links(
                    stripe_module,
                    stripe_session_id=legacy_entitlement.stripe_session_id,
                    stripe_payment_intent_id=legacy_entitlement.stripe_payment_intent_id,
                )
            )
        payload.update(
            {
                "active": True,
                "type": "project_pass_legacy",
                "reason": None,
                **_serialize_entitlement(legacy_entitlement),
            }
        )
        return payload

    if not _stripe_secret_key():
        if project_passes:
            payload["reason"] = (
                "project_pass_other_project" if normalized_project_id else "project_selection_required"
            )
            if project_passes:
                payload["bound_project_id"] = project_passes[0].project_id
                payload["bound_project_name"] = project_passes[0].project_name
            return payload
        payload["reason"] = "stripe_not_configured"
        return payload

    stripe_module = _load_stripe_module()
    _configure_stripe(stripe_module)

    customers = stripe_module.Customer.list(email=normalized_email, limit=10)
    customer_rows = list(getattr(customers, "data", []) or [])
    if not customer_rows:
        if project_passes:
            payload["reason"] = (
                "project_pass_other_project" if normalized_project_id else "project_selection_required"
            )
            payload["bound_project_id"] = project_passes[0].project_id
            payload["bound_project_name"] = project_passes[0].project_name
            payload.update(
                _project_pass_receipt_links(
                    stripe_module,
                    stripe_session_id=project_passes[0].stripe_session_id,
                    stripe_payment_intent_id=project_passes[0].stripe_payment_intent_id,
                )
            )
            return payload
        payload["reason"] = "no_customer"
        return payload

    for customer in customer_rows:
        subscriptions = stripe_module.Subscription.list(
            customer=customer.get("id"),
            status="all",
            limit=50,
        )
        for subscription in getattr(subscriptions, "data", []) or []:
            if subscription.get("status") not in ACTIVE_SUBSCRIPTION_STATUSES:
                continue
            for item in subscription.get("items", {}).get("data", []) or []:
                subscription_type = _classify_subscription_item(stripe_module, item)
                if subscription_type:
                    receipt_links = _latest_paid_invoice_links(
                        stripe_module,
                        customer_id=customer.get("id"),
                        subscription_id=subscription.get("id"),
                    )
                    payload.update(
                        {
                            "active": True,
                            "type": subscription_type,
                            "reason": None,
                            "subscription_id": subscription.get("id"),
                            "customer_id": customer.get("id"),
                            **receipt_links,
                        }
                    )
                    return payload

    if project_passes:
        payload["reason"] = (
            "project_pass_other_project" if normalized_project_id else "project_selection_required"
        )
        payload["bound_project_id"] = project_passes[0].project_id
        payload["bound_project_name"] = project_passes[0].project_name
        payload.update(
            _project_pass_receipt_links(
                stripe_module,
                stripe_session_id=project_passes[0].stripe_session_id,
                stripe_payment_intent_id=project_passes[0].stripe_payment_intent_id,
            )
        )
        return payload

    payload["reason"] = "no_active_subscription"
    return payload
