"""Tests for billing helpers and endpoints."""

import asyncio

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

import app.models.billing_entitlement  # noqa: F401
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
from app.services import stripe_billing


def _make_db_session():
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    testing_session_local = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)
    session = testing_session_local()
    return engine, session


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
                        "payment_intent": "pi_project_pass",
                        "metadata": {
                            "plan_code": "project_pass",
                            "customer_email": "pass@example.com",
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
            )
        )
    )
    assert payload["session_id"] == "cs_energy_monthly"
    assert payload["checkout_url"] == "https://checkout.example.com/energy_monthly"
    assert payload["mode"] == "subscription"
    assert "plan=energy_monthly" in _FakeStripe.created_kwargs["success_url"]
    assert "session_id=%7BCHECKOUT_SESSION_ID%7D" in _FakeStripe.created_kwargs["success_url"]


def test_create_project_pass_checkout_returns_payment_session(monkeypatch) -> None:
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
                success_url="https://example.com/pricing?redirect=%2Fresidential",
                cancel_url="https://example.com/pricing?redirect=%2Fresidential",
            )
        )
    )
    assert payload["session_id"] == "cs_project_pass"
    assert payload["checkout_url"] == "https://checkout.example.com/project_pass"
    assert payload["mode"] == "payment"
    assert _FakeStripe.created_kwargs["line_items"][0]["price"] == "price_project_pass"
    assert _FakeStripe.created_kwargs["payment_intent_data"]["metadata"]["plan_code"] == "project_pass"


def test_confirm_project_pass_checkout_creates_entitlement(monkeypatch) -> None:
    engine, db = _make_db_session()
    try:
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

        saved = db.query(BillingEntitlement).filter(BillingEntitlement.email == "pass@example.com").one()
        assert saved.entitlement_type == "project_pass"
        assert saved.status == "active"

        status = asyncio.run(subscription_status(email="pass@example.com", db=db))
        assert status["active"] is True
        assert status["type"] == "project_pass"
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)
        engine.dispose()


def test_confirm_project_pass_checkout_is_idempotent(monkeypatch) -> None:
    engine, db = _make_db_session()
    try:
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

        assert first["entitlement_id"] == second["entitlement_id"]
        assert db.query(BillingEntitlement).count() == 1
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)
        engine.dispose()


def test_create_checkout_raises_when_not_configured(monkeypatch) -> None:
    monkeypatch.delenv("STRIPE_SECRET_KEY", raising=False)
    monkeypatch.delenv("STRIPE_PRICE_ID_ENERGY", raising=False)
    monkeypatch.delenv("STRIPE_PRICE_ID_PROJECT_PASS", raising=False)
    monkeypatch.setenv("BILLING_BYPASS", "false")

    try:
        asyncio.run(create_checkout(req=CheckoutRequest(email="active@example.com")))
    except Exception as exc:
        assert getattr(exc, "status_code", None) == 503
        assert "not configured" in str(exc.detail)
    else:  # pragma: no cover - defensive
        raise AssertionError("Expected checkout creation to fail without Stripe config")


def test_construct_and_process_webhook_activates_project_pass(monkeypatch) -> None:
    engine, db = _make_db_session()
    try:
        monkeypatch.setenv("STRIPE_SECRET_KEY", "sk_test")
        monkeypatch.setenv("STRIPE_WEBHOOK_SECRET", "whsec_test")
        monkeypatch.setenv("STRIPE_PRICE_ID_PROJECT_PASS", "price_project_pass")
        monkeypatch.setenv("BILLING_BYPASS", "false")
        monkeypatch.setattr(stripe_billing, "_load_stripe_module", lambda: _FakeStripe)

        event = stripe_billing.construct_webhook_event(payload=b"{}", signature="sig_test")
        result = stripe_billing.process_webhook_event(event=event, db=db)

        assert result["received"] is True
        assert result["action"] == "project_pass_activated"
        assert db.query(BillingEntitlement).count() == 1
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)
        engine.dispose()


def test_process_webhook_marks_refunded_project_pass(monkeypatch) -> None:
    engine, db = _make_db_session()
    try:
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
        saved = db.query(BillingEntitlement).one()
        assert saved.status == "refunded"
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)
        engine.dispose()
