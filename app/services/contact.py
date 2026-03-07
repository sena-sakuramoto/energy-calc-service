"""Contact inquiry notification helpers."""

from __future__ import annotations

import logging
import os
import smtplib
from dataclasses import dataclass
from email.mime.text import MIMEText
from typing import Optional

from app.models.contact_inquiry import ContactInquiry

logger = logging.getLogger(__name__)

DEFAULT_CONTACT_EMAIL = "rse-support@archi-prisma.co.jp"


def contact_notify_email() -> str:
    return (
        os.getenv("CONTACT_NOTIFY_EMAIL", "").strip()
        or os.getenv("REFERRAL_NOTIFY_EMAIL", "").strip()
        or DEFAULT_CONTACT_EMAIL
    )


def contact_public_email() -> str:
    return os.getenv("CONTACT_PUBLIC_EMAIL", "").strip() or contact_notify_email()


def _smtp_user() -> str:
    return os.getenv("GMAIL_USER", "").strip()


def _smtp_password() -> str:
    return os.getenv("GMAIL_APP_PASSWORD", "").strip()


def _send_plain_text_email(
    *,
    to_email: str,
    subject: str,
    body: str,
    reply_to: Optional[str] = None,
) -> None:
    smtp_user = _smtp_user()
    smtp_password = _smtp_password()
    if not smtp_user or not smtp_password:
        raise RuntimeError("SMTP credentials are not configured.")

    msg = MIMEText(body, "plain", "utf-8")
    msg["Subject"] = subject
    msg["From"] = smtp_user
    msg["To"] = to_email
    if reply_to:
        msg["Reply-To"] = reply_to

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
        server.login(smtp_user, smtp_password)
        server.send_message(msg)


@dataclass
class ContactDeliveryResult:
    notification_sent: bool
    auto_reply_sent: bool
    notification_error: Optional[str] = None
    auto_reply_error: Optional[str] = None


def send_contact_messages(inquiry: ContactInquiry) -> ContactDeliveryResult:
    """Send notification to support and auto-reply to the sender when possible."""
    notify_error: Optional[str] = None
    auto_reply_error: Optional[str] = None

    support_email = contact_notify_email()
    public_email = contact_public_email()

    notification_subject = f"[楽々省エネ計算] お問い合わせ: {inquiry.subject}"
    notification_body = "\n".join(
        [
            "新しいお問い合わせが届きました。",
            "",
            f"名前: {inquiry.name}",
            f"メール: {inquiry.email}",
            f"会社名: {inquiry.company or '未入力'}",
            f"種別: {inquiry.category or '未選択'}",
            f"件名: {inquiry.subject}",
            f"ページ: {inquiry.page_url or '不明'}",
            "",
            inquiry.message,
        ]
    )

    notification_sent = False
    try:
        _send_plain_text_email(
            to_email=support_email,
            subject=notification_subject,
            body=notification_body,
            reply_to=inquiry.email,
        )
        notification_sent = True
    except Exception as exc:  # pragma: no cover - defensive logging only
        notify_error = str(exc)
        logger.exception("Failed to send contact notification: %s", exc)

    auto_reply_sent = False
    auto_reply_subject = "お問い合わせを受け付けました | 楽々省エネ計算"
    auto_reply_body = "\n".join(
        [
            f"{inquiry.name} 様",
            "",
            "お問い合わせありがとうございます。内容を受け付けました。",
            "通常は 2 営業日以内にご連絡します。",
            "",
            f"件名: {inquiry.subject}",
            f"受付窓口: {public_email}",
            "",
            "このメールは自動送信です。",
        ]
    )

    try:
        _send_plain_text_email(
            to_email=inquiry.email,
            subject=auto_reply_subject,
            body=auto_reply_body,
            reply_to=public_email,
        )
        auto_reply_sent = True
    except Exception as exc:  # pragma: no cover - defensive logging only
        auto_reply_error = str(exc)
        logger.exception("Failed to send contact auto-reply: %s", exc)

    return ContactDeliveryResult(
        notification_sent=notification_sent,
        auto_reply_sent=auto_reply_sent,
        notification_error=notify_error,
        auto_reply_error=auto_reply_error,
    )
