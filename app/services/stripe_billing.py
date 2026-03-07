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

logger = logging.getLogger(__name__)

ACTIVE_SUBSCRIPTION_STATUSES = {"active", "trialing"}
ACTIVE_ENTITLEMENT_STATUSES = {"active"}
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
        return f"{_project_pass_days()}日パス"
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


def _upsert_project_pass_entitlement(
    *,
    db: Session,
    customer_email: str,
    stripe_session_id: str,
    stripe_payment_intent_id: Optional[str],
    notes: Optional[str] = None,
) -> BillingEntitlement:
    normalized_email = _normalize_email(customer_email)
    expires_at = datetime.now(timezone.utc) + timedelta(days=_project_pass_days())

    entitlement = (
        db.query(BillingEntitlement)
        .filter(BillingEntitlement.stripe_session_id == stripe_session_id)
        .first()
    )

    if entitlement is None:
        entitlement = BillingEntitlement(
            email=normalized_email,
            entitlement_type=PLAN_PROJECT_PASS,
            status="active",
            source="stripe_checkout",
            stripe_session_id=stripe_session_id,
            stripe_payment_intent_id=stripe_payment_intent_id,
            expires_at=expires_at,
            notes=notes,
        )
        db.add(entitlement)
    else:
        entitlement.email = normalized_email
        entitlement.entitlement_type = PLAN_PROJECT_PASS
        entitlement.status = "active"
        entitlement.stripe_payment_intent_id = stripe_payment_intent_id
        entitlement.expires_at = expires_at
        if notes is not None:
            entitlement.notes = notes

    db.commit()
    db.refresh(entitlement)
    return entitlement


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
            },
        },
    }


def create_checkout_session(
    *,
    customer_email: str,
    plan: str = PLAN_ENERGY_MONTHLY,
    success_url: Optional[str] = None,
    cancel_url: Optional[str] = None,
) -> dict[str, Any]:
    """Create a Stripe Checkout session for a supported billing plan."""
    if _billing_bypass_enabled():
        return {
            "checkout_url": success_url,
            "session_id": "billing-bypass",
            "mode": "development_bypass",
            "plan": plan,
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

    if plan_code == PLAN_PROJECT_PASS:
        if session.get("payment_status") != "paid":
            return {
                "confirmed": False,
                "active": False,
                "type": PLAN_PROJECT_PASS,
                "reason": "payment_not_completed",
                "customer_email": customer_email,
                "session_id": session_id,
                **config,
            }

        entitlement = _upsert_project_pass_entitlement(
            db=db,
            customer_email=customer_email,
            stripe_session_id=session_id,
            stripe_payment_intent_id=str(session.get("payment_intent") or "") or None,
            notes="Granted from Stripe Checkout project pass purchase.",
        )
        return {
            "confirmed": True,
            "active": True,
            "type": PLAN_PROJECT_PASS,
            "reason": None,
            "customer_email": customer_email,
            "plan": plan_code,
            "session_id": session_id,
            **_serialize_entitlement(entitlement),
            **receipt_links,
            **config,
        }

    status_payload = check_subscription(customer_email, db=db)
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
                entitlement = _upsert_project_pass_entitlement(
                    db=db,
                    customer_email=customer_email,
                    stripe_session_id=str(payload.get("id") or ""),
                    stripe_payment_intent_id=str(payload.get("payment_intent") or "") or None,
                    notes=f"Granted from webhook event {event_type}.",
                )
                return {
                    "received": True,
                    "action": "project_pass_activated",
                    "event_type": event_type,
                    **_serialize_entitlement(entitlement),
                }

    if event_type == "charge.refunded":
        payment_intent_id = str(payload.get("payment_intent") or "")
        entitlement = _set_entitlement_status(
            db=db,
            stripe_payment_intent_id=payment_intent_id or None,
            status="refunded",
            notes="Marked refunded from Stripe webhook.",
        )
        return {
            "received": True,
            "action": "project_pass_refunded" if entitlement else "ignored",
            "event_type": event_type,
        }

    return {
        "received": True,
        "action": "ignored",
        "event_type": event_type,
    }


def check_subscription(customer_email: str, db: Optional[Session] = None) -> dict[str, Any]:
    """Check whether the given email has paid access via subscription or project pass."""
    normalized_email = _normalize_email(customer_email)
    config = billing_public_config()
    payload: dict[str, Any] = {
        "active": False,
        "type": None,
        "reason": None,
        "customer_email": normalized_email or customer_email,
        **config,
    }

    if not normalized_email:
        payload["reason"] = "missing_email"
        return payload

    if config["bypass_enabled"]:
        payload.update({"active": True, "type": "development_bypass", "reason": None})
        return payload

    entitlement = _get_active_entitlement(db, normalized_email)
    if entitlement is not None:
        if _stripe_secret_key():
            stripe_module = _load_stripe_module()
            _configure_stripe(stripe_module)
            payload.update(
                _project_pass_receipt_links(
                    stripe_module,
                    stripe_session_id=entitlement.stripe_session_id,
                    stripe_payment_intent_id=entitlement.stripe_payment_intent_id,
                )
            )
        payload.update(
            {
                "active": True,
                "type": PLAN_PROJECT_PASS,
                "reason": None,
                **_serialize_entitlement(entitlement),
            }
        )
        return payload

    if not _stripe_secret_key():
        payload["reason"] = "stripe_not_configured"
        return payload

    stripe_module = _load_stripe_module()
    _configure_stripe(stripe_module)

    customers = stripe_module.Customer.list(email=normalized_email, limit=10)
    customer_rows = list(getattr(customers, "data", []) or [])
    if not customer_rows:
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

    payload["reason"] = "no_active_subscription"
    return payload
