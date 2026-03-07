"""Tests for billing helpers and endpoints."""

import asyncio

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

import app.models.billing_entitlement  # noqa: F401
import app.models.billing_project_pass  # noqa: F401
import app.models.project  # noqa: F401
import app.models.user  # noqa: F401
from app.api.v1.billing import (
    CheckoutRequest,
    ConfirmCheckoutRequest,
    billing_config,
    confirm_checkout,
    create_checkout,
    subscription_status,
)
from app.db.base import Base
from app.models.billing_entitlement import BillingEntitlement
from app.models.billing_project_pass import BillingProjectPass
from app.models.project import Project
from app.models.user import User
from app.services import stripe_billing


def _make_db_session():
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    testing_session_local = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)
    session = testing_session_local()
    return engine, session


def _seed_project(db, *, email="pass@example.com", project_id=101, project_name="テスト案件"):
    user = User(
        email=email,
        username=email.split("@")[0],
        hashed_password="hashed",
        is_active=True,
    )
    db.add(user)
    db.flush()

    project = Project(
        id=project_id,
        name=project_name,
        description="billing test project",
        owner_id=user.id,
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


class _FakeStripe:
    api_key = None
    created_kwargs = None

    class Customer:
        @staticmethod
        def list(email, limit=10):
            if email == "active@example.com":
                return type("Obj", (), {"data": [{"id": "cus_active"}]})()
            if email == "circle@example.com":
                return type("Obj", (), {"data": [{"id": "cus_circle"}]})()
            return type("Obj", (), {"data": []})()

    class Subscription:
        @staticmethod
        def list(customer, status="all", limit=50):
            if customer == "cus_active":
                return type(
                    "Obj",
                    (),
                    {
                        "data": [
                            {
                                "id": "sub_energy",
                                "status": "active",
                                "items": {"data": [{"price": {"id": "price_energy", "product": "prod_energy"}}]},
                            }
                        ]
                    },
                )()
            if customer == "cus_circle":
                return type(
                    "Obj",
                    (),
                    {
                        "data": [
                            {
                                "id": "sub_circle",
                                "status": "trialing",
                                "items": {"data": [{"price": {"id": "price_other", "product": "prod_circle"}}]},
                            }
                        ]
                    },
                )()
            return type("Obj", (), {"data": []})()

    class Product:
        @staticmethod
        def retrieve(product_id):
            if product_id == "prod_circle":
                return {"name": "AI circle monthly"}
            return {"name": "energy calc monthly"}

    class Invoice:
        @staticmethod
        def retrieve(invoice_id):
            if invoice_id == "in_project_pass":
                return {
                    "id": "in_project_pass",
                    "hosted_invoice_url": "https://invoice.example.com/project-pass",
                    "invoice_pdf": "https://invoice.example.com/project-pass.pdf",
                    "charge": "ch_project_pass",
                }
            return None

        @staticmethod
        def list(customer=None, subscription=None, status="paid", limit=1):
            if customer == "cus_active" or subscription == "sub_energy":
                return type(
                    "Obj",
                    (),
                    {
                        "data": [
                            {
                                "id": "in_energy_monthly",
                                "hosted_invoice_url": "https://invoice.example.com/energy-monthly",
                                "invoice_pdf": "https://invoice.example.com/energy-monthly.pdf",
                                "charge": "ch_energy_monthly",
                            }
                        ]
                    },
                )()
            return type("Obj", (), {"data": []})()

    class PaymentIntent:
        @staticmethod
        def retrieve(payment_intent_id):
            if payment_intent_id == "pi_project_pass":
                return {"id": "pi_project_pass", "latest_charge": "ch_project_pass"}
            return None

    class Charge:
        @staticmethod
        def retrieve(charge_id):
            if charge_id == "ch_project_pass":
                return {"id": charge_id, "receipt_url": "https://receipt.example.com/project-pass"}
            if charge_id == "ch_energy_monthly":
                return {"id": charge_id, "receipt_url": "https://receipt.example.com/energy-monthly"}
            return None

    class Webhook:
        @staticmethod
        def construct_event(payload, signature, secret):
            if signature != "sig_test":
                raise ValueError("invalid signature")
            return {
                "type": "checkout.session.completed",
                "data": {
                    "object": {
                        "id": "cs_project_pass_paid",
                        "mode": "payment",
                        "payment_status": "paid",
                        "payment_intent": "pi_project_pass",
                        "metadata": {
                            "plan_code": "project_pass",
                            "customer_email": "pass@example.com",
                            "project_id": "101",
                            "project_name": "テスト案件",
                        },
                        "customer_details": {"email": "pass@example.com"},
                    }
                },
            }

    class checkout:
        class Session:
            @staticmethod
            def create(**kwargs):
                _FakeStripe.created_kwargs = kwargs
                plan_code = kwargs["metadata"]["plan_code"]
                return type(
                    "Obj",
                    (),
                    {
                        "id": f"cs_{plan_code}",
                        "url": f"https://checkout.example.com/{plan_code}",
                    },
                )()

            @staticmethod
            def retrieve(session_id):
                if session_id == "cs_project_pass_paid":
                    return {
                        "id": session_id,
                        "mode": "payment",
                        "status": "complete",
                        "payment_status": "paid",
                        "invoice": "in_project_pass",
                        "payment_intent": "pi_project_pass",
                        "metadata": {
                            "plan_code": "project_pass",
                            "customer_email": "pass@example.com",
                            "project_id": "101",
                            "project_name": "テスト案件",
                        },
                        "customer_details": {"email": "pass@example.com"},
                    }
                if session_id == "cs_energy_monthly":
                    return {
                        "id": session_id,
                        "mode": "subscription",
                        "status": "complete",
                        "payment_status": "paid",
                        "metadata": {
                            "plan_code": "energy_monthly",
                            "customer_email": "active@example.com",
                        },
                        "customer_email": "active@example.com",
                    }
                return {
                    "id": session_id,
                    "mode": "payment",
                    "status": "open",
                    "payment_status": "unpaid",
                    "metadata": {
                        "plan_code": "project_pass",
                        "customer_email": "pending@example.com",
                    },
                    "customer_details": {"email": "pending@example.com"},
                }


def test_billing_config_default(monkeypatch) -> None:
    monkeypatch.delenv("STRIPE_SECRET_KEY", raising=False)
    monkeypatch.delenv("STRIPE_PRICE_ID_ENERGY", raising=False)
    monkeypatch.delenv("STRIPE_PRICE_ID_PROJECT_PASS", raising=False)
    monkeypatch.setenv("BILLING_BYPASS", "false")

    payload = asyncio.run(billing_config())
    assert payload["billing_enabled"] is False
    assert payload["checkout_available"] is False
    assert payload["bypass_enabled"] is False
    assert payload["plans"]["energy_monthly"]["available"] is False
    assert payload["plans"]["project_pass"]["available"] is False


def test_subscription_status_detects_energy_subscription(monkeypatch) -> None:
    engine, db = _make_db_session()
    try:
        monkeypatch.setenv("STRIPE_SECRET_KEY", "sk_test")
        monkeypatch.setenv("STRIPE_PRICE_ID_ENERGY", "price_energy")
        monkeypatch.setenv("BILLING_BYPASS", "false")
        monkeypatch.setattr(stripe_billing, "_load_stripe_module", lambda: _FakeStripe)

        payload = asyncio.run(subscription_status(email="active@example.com", db=db))
        assert payload["active"] is True
        assert payload["type"] == "energy_subscriber"
        assert payload["subscription_id"] == "sub_energy"
        assert payload["receipt_url"] == "https://receipt.example.com/energy-monthly"
        assert payload["invoice_pdf_url"] == "https://invoice.example.com/energy-monthly.pdf"
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)
        engine.dispose()


def test_subscription_status_detects_circle_membership_by_product_name(monkeypatch) -> None:
    engine, db = _make_db_session()
    try:
        monkeypatch.setenv("STRIPE_SECRET_KEY", "sk_test")
        monkeypatch.setenv("STRIPE_PRICE_ID_ENERGY", "price_energy")
        monkeypatch.setenv("BILLING_BYPASS", "false")
        monkeypatch.setattr(stripe_billing, "_load_stripe_module", lambda: _FakeStripe)

        payload = asyncio.run(subscription_status(email="circle@example.com", db=db))
        assert payload["active"] is True
        assert payload["type"] == "circle_member"
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)
        engine.dispose()


def test_subscription_status_uses_billing_bypass(monkeypatch) -> None:
    engine, db = _make_db_session()
    try:
        monkeypatch.setenv("BILLING_BYPASS", "true")
        payload = asyncio.run(subscription_status(email="dev@example.com", db=db))
        assert payload["active"] is True
        assert payload["type"] == "development_bypass"
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)
        engine.dispose()


def test_create_monthly_checkout_returns_session(monkeypatch) -> None:
    engine, db = _make_db_session()
    try:
        monkeypatch.setenv("STRIPE_SECRET_KEY", "sk_test")
        monkeypatch.setenv("STRIPE_PRICE_ID_ENERGY", "price_energy")
        monkeypatch.setenv("STRIPE_PRICE_ID_PROJECT_PASS", "price_project_pass")
        monkeypatch.setenv("BILLING_BYPASS", "false")
        monkeypatch.setattr(stripe_billing, "_load_stripe_module", lambda: _FakeStripe)

        payload = asyncio.run(
            create_checkout(
                req=CheckoutRequest(
                    email="active@example.com",
                    plan="energy_monthly",
                    success_url="https://example.com/success",
                    cancel_url="https://example.com/cancel",
                ),
                db=db,
            )
        )
        assert payload["session_id"] == "cs_energy_monthly"
        assert payload["checkout_url"] == "https://checkout.example.com/energy_monthly"
        assert payload["mode"] == "subscription"
        assert "plan=energy_monthly" in _FakeStripe.created_kwargs["success_url"]
        assert "session_id=%7BCHECKOUT_SESSION_ID%7D" in _FakeStripe.created_kwargs["success_url"]
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)
        engine.dispose()


def test_create_project_pass_checkout_returns_payment_session(monkeypatch) -> None:
    engine, db = _make_db_session()
    try:
        _seed_project(db)
        monkeypatch.setenv("STRIPE_SECRET_KEY", "sk_test")
        monkeypatch.setenv("STRIPE_PRICE_ID_ENERGY", "price_energy")
        monkeypatch.setenv("STRIPE_PRICE_ID_PROJECT_PASS", "price_project_pass")
        monkeypatch.setenv("BILLING_BYPASS", "false")
        monkeypatch.setattr(stripe_billing, "_load_stripe_module", lambda: _FakeStripe)

        payload = asyncio.run(
            create_checkout(
                req=CheckoutRequest(
                    email="pass@example.com",
                    plan="project_pass",
                    project_id=101,
                    success_url="https://example.com/pricing?redirect=%2Fresidential",
                    cancel_url="https://example.com/pricing?redirect=%2Fresidential",
                ),
                db=db,
            )
        )
        assert payload["session_id"] == "cs_project_pass"
        assert payload["checkout_url"] == "https://checkout.example.com/project_pass"
        assert payload["mode"] == "payment"
        assert payload["project_id"] == 101
        assert _FakeStripe.created_kwargs["line_items"][0]["price"] == "price_project_pass"
        assert _FakeStripe.created_kwargs["payment_intent_data"]["metadata"]["plan_code"] == "project_pass"
        assert _FakeStripe.created_kwargs["payment_intent_data"]["metadata"]["project_id"] == "101"
        assert _FakeStripe.created_kwargs["payment_intent_data"]["receipt_email"] == "pass@example.com"
        assert _FakeStripe.created_kwargs["invoice_creation"]["enabled"] is True
        assert _FakeStripe.created_kwargs["customer_creation"] == "always"
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)
        engine.dispose()


def test_confirm_project_pass_checkout_creates_project_scoped_pass(monkeypatch) -> None:
    engine, db = _make_db_session()
    try:
        _seed_project(db)
        monkeypatch.setenv("STRIPE_SECRET_KEY", "sk_test")
        monkeypatch.setenv("STRIPE_PRICE_ID_PROJECT_PASS", "price_project_pass")
        monkeypatch.setenv("BILLING_BYPASS", "false")
        monkeypatch.setattr(stripe_billing, "_load_stripe_module", lambda: _FakeStripe)

        payload = asyncio.run(
            confirm_checkout(
                req=ConfirmCheckoutRequest(session_id="cs_project_pass_paid"),
                db=db,
            )
        )
        assert payload["confirmed"] is True
        assert payload["active"] is True
        assert payload["type"] == "project_pass"
        assert payload["expires_at"] is not None
        assert payload["project_id"] == 101
        assert payload["project_name"] == "テスト案件"
        assert payload["receipt_url"] == "https://receipt.example.com/project-pass"
        assert payload["invoice_pdf_url"] == "https://invoice.example.com/project-pass.pdf"

        saved = db.query(BillingProjectPass).filter(BillingProjectPass.email == "pass@example.com").one()
        assert saved.project_id == 101
        assert saved.status == "active"

        status = asyncio.run(subscription_status(email="pass@example.com", project_id=101, db=db))
        assert status["active"] is True
        assert status["type"] == "project_pass"
        assert status["project_name"] == "テスト案件"
        assert status["receipt_url"] == "https://receipt.example.com/project-pass"
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)
        engine.dispose()


def test_project_pass_only_unlocks_bound_project(monkeypatch) -> None:
    engine, db = _make_db_session()
    try:
        _seed_project(db, project_id=101, project_name="案件A")
        _seed_project(db, email="second@example.com", project_id=202, project_name="案件B")
        monkeypatch.setenv("STRIPE_SECRET_KEY", "sk_test")
        monkeypatch.setenv("STRIPE_PRICE_ID_PROJECT_PASS", "price_project_pass")
        monkeypatch.setenv("BILLING_BYPASS", "false")
        monkeypatch.setattr(stripe_billing, "_load_stripe_module", lambda: _FakeStripe)

        stripe_billing.confirm_checkout_session(session_id="cs_project_pass_paid", db=db)

        matched = asyncio.run(subscription_status(email="pass@example.com", project_id=101, db=db))
        assert matched["active"] is True
        assert matched["type"] == "project_pass"

        unscoped = asyncio.run(subscription_status(email="pass@example.com", db=db))
        assert unscoped["active"] is False
        assert unscoped["reason"] == "project_selection_required"
        assert len(unscoped["project_passes"]) == 1

        other_project = asyncio.run(subscription_status(email="pass@example.com", project_id=202, db=db))
        assert other_project["active"] is False
        assert other_project["reason"] == "project_pass_other_project"
        assert other_project["bound_project_id"] == 101
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)
        engine.dispose()


def test_confirm_project_pass_checkout_is_idempotent(monkeypatch) -> None:
    engine, db = _make_db_session()
    try:
        _seed_project(db)
        monkeypatch.setenv("STRIPE_SECRET_KEY", "sk_test")
        monkeypatch.setenv("STRIPE_PRICE_ID_PROJECT_PASS", "price_project_pass")
        monkeypatch.setenv("BILLING_BYPASS", "false")
        monkeypatch.setattr(stripe_billing, "_load_stripe_module", lambda: _FakeStripe)

        first = asyncio.run(
            confirm_checkout(
                req=ConfirmCheckoutRequest(session_id="cs_project_pass_paid"),
                db=db,
            )
        )
        second = asyncio.run(
            confirm_checkout(
                req=ConfirmCheckoutRequest(session_id="cs_project_pass_paid"),
                db=db,
            )
        )

        assert first["project_pass_id"] == second["project_pass_id"]
        assert db.query(BillingProjectPass).count() == 1
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)
        engine.dispose()


def test_create_checkout_raises_when_not_configured(monkeypatch) -> None:
    engine, db = _make_db_session()
    try:
        monkeypatch.delenv("STRIPE_SECRET_KEY", raising=False)
        monkeypatch.delenv("STRIPE_PRICE_ID_ENERGY", raising=False)
        monkeypatch.delenv("STRIPE_PRICE_ID_PROJECT_PASS", raising=False)
        monkeypatch.setenv("BILLING_BYPASS", "false")

        try:
            asyncio.run(create_checkout(req=CheckoutRequest(email="active@example.com"), db=db))
        except Exception as exc:
            assert getattr(exc, "status_code", None) == 503
            assert "not configured" in str(exc.detail)
        else:  # pragma: no cover - defensive
            raise AssertionError("Expected checkout creation to fail without Stripe config")
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)
        engine.dispose()


def test_project_pass_checkout_requires_owned_project(monkeypatch) -> None:
    engine, db = _make_db_session()
    try:
        monkeypatch.setenv("STRIPE_SECRET_KEY", "sk_test")
        monkeypatch.setenv("STRIPE_PRICE_ID_PROJECT_PASS", "price_project_pass")
        monkeypatch.setenv("BILLING_BYPASS", "false")
        monkeypatch.setattr(stripe_billing, "_load_stripe_module", lambda: _FakeStripe)

        try:
            asyncio.run(
                create_checkout(
                    req=CheckoutRequest(
                        email="pass@example.com",
                        plan="project_pass",
                        project_id=999,
                    ),
                    db=db,
                )
            )
        except Exception as exc:
            assert getattr(exc, "status_code", None) == 400
            assert "Selected project" in str(exc.detail)
        else:  # pragma: no cover - defensive
            raise AssertionError("Expected project-scoped checkout to reject unknown projects")
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)
        engine.dispose()


def test_construct_and_process_webhook_activates_project_pass(monkeypatch) -> None:
    engine, db = _make_db_session()
    try:
        _seed_project(db)
        monkeypatch.setenv("STRIPE_SECRET_KEY", "sk_test")
        monkeypatch.setenv("STRIPE_WEBHOOK_SECRET", "whsec_test")
        monkeypatch.setenv("STRIPE_PRICE_ID_PROJECT_PASS", "price_project_pass")
        monkeypatch.setenv("BILLING_BYPASS", "false")
        monkeypatch.setattr(stripe_billing, "_load_stripe_module", lambda: _FakeStripe)

        event = stripe_billing.construct_webhook_event(payload=b"{}", signature="sig_test")
        result = stripe_billing.process_webhook_event(event=event, db=db)

        assert result["received"] is True
        assert result["action"] == "project_pass_activated"
        assert db.query(BillingProjectPass).count() == 1
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)
        engine.dispose()


def test_process_webhook_marks_refunded_project_pass(monkeypatch) -> None:
    engine, db = _make_db_session()
    try:
        _seed_project(db)
        monkeypatch.setenv("STRIPE_SECRET_KEY", "sk_test")
        monkeypatch.setenv("STRIPE_PRICE_ID_PROJECT_PASS", "price_project_pass")
        monkeypatch.setenv("BILLING_BYPASS", "false")
        monkeypatch.setattr(stripe_billing, "_load_stripe_module", lambda: _FakeStripe)

        stripe_billing.confirm_checkout_session(session_id="cs_project_pass_paid", db=db)

        result = stripe_billing.process_webhook_event(
            event={
                "type": "charge.refunded",
                "data": {"object": {"payment_intent": "pi_project_pass"}},
            },
            db=db,
        )

        assert result["action"] == "project_pass_refunded"
        saved = db.query(BillingProjectPass).one()
        assert saved.status == "refunded"
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)
        engine.dispose()
