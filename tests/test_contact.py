"""Tests for public contact inquiry handling."""

import asyncio

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

import app.models.contact_inquiry  # noqa: F401
from app.api.v1.contact import ContactInquiryRequest, contact_config, submit_contact_inquiry
from app.db.base import Base
from app.models.contact_inquiry import ContactInquiry
from app.services import contact as contact_service


def _make_db_session():
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    testing_session_local = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)
    session = testing_session_local()
    return engine, session


def test_contact_config_uses_public_email(monkeypatch) -> None:
    monkeypatch.setenv("CONTACT_PUBLIC_EMAIL", "hello@example.com")
    payload = asyncio.run(contact_config())
    assert payload["support_email"] == "hello@example.com"


def test_submit_contact_inquiry_stores_and_notifies(monkeypatch) -> None:
    engine, db = _make_db_session()
    try:
        monkeypatch.setenv("CONTACT_PUBLIC_EMAIL", "support@example.com")

        def _fake_delivery(_inquiry):
            return contact_service.ContactDeliveryResult(
                notification_sent=True,
                auto_reply_sent=True,
            )

        monkeypatch.setattr(contact_service, "send_contact_messages", _fake_delivery)
        monkeypatch.setattr("app.api.v1.contact.send_contact_messages", _fake_delivery)

        payload = asyncio.run(
            submit_contact_inquiry(
                req=ContactInquiryRequest(
                    name="山田太郎",
                    email="yamada@example.com",
                    company="山田設計",
                    category="support",
                    subject="公式BEIの使い方",
                    message="使い方を教えてください。",
                    page_url="https://rakuraku-energy.archi-prisma.co.jp/contact",
                ),
                db=db,
            )
        )

        assert payload["status"] == "received"
        assert payload["stored"] is True
        assert payload["notification_sent"] is True
        assert payload["auto_reply_sent"] is True
        assert payload["support_email"] == "support@example.com"

        saved = db.query(ContactInquiry).one()
        assert saved.status == "notified"
        assert saved.email == "yamada@example.com"
        assert saved.subject == "公式BEIの使い方"
        assert saved.notification_sent_at is not None
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)
        engine.dispose()


def test_submit_contact_inquiry_survives_notification_failure(monkeypatch) -> None:
    engine, db = _make_db_session()
    try:
        def _failed_delivery(_inquiry):
            return contact_service.ContactDeliveryResult(
                notification_sent=False,
                auto_reply_sent=False,
                notification_error="SMTP credentials are not configured.",
                auto_reply_error="SMTP credentials are not configured.",
            )

        monkeypatch.setattr(contact_service, "send_contact_messages", _failed_delivery)
        monkeypatch.setattr("app.api.v1.contact.send_contact_messages", _failed_delivery)

        payload = asyncio.run(
            submit_contact_inquiry(
                req=ContactInquiryRequest(
                    name="佐藤花子",
                    email="sato@example.com",
                    subject="料金について",
                    message="月額の違いを知りたいです。",
                ),
                db=db,
            )
        )

        assert payload["status"] == "received"
        assert payload["stored"] is True
        assert payload["notification_sent"] is False

        saved = db.query(ContactInquiry).one()
        assert saved.status == "stored"
        assert "SMTP credentials" in (saved.notification_error or "")
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)
        engine.dispose()
