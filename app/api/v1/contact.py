"""Public contact inquiry endpoints."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.contact_inquiry import ContactInquiry
from app.services.contact import contact_public_email, send_contact_messages

router = APIRouter(prefix="/contact", tags=["Contact"])


class ContactInquiryRequest(BaseModel):
    name: str
    email: EmailStr
    company: Optional[str] = None
    category: Optional[str] = None
    subject: str
    message: str
    page_url: Optional[str] = None
    user_agent: Optional[str] = None


def _trim(value: Optional[str], *, limit: int) -> Optional[str]:
    text = (value or "").strip()
    if not text:
        return None
    return text[:limit]


@router.get("/config")
async def contact_config() -> dict:
    return {
        "support_email": contact_public_email(),
        "response_window": "2営業日以内",
    }


@router.post("/submit")
async def submit_contact_inquiry(
    req: ContactInquiryRequest,
    db: Session = Depends(get_db),
) -> dict:
    inquiry = ContactInquiry(
        name=req.name.strip(),
        email=str(req.email).strip().lower(),
        company=_trim(req.company, limit=200),
        category=_trim(req.category, limit=50),
        subject=req.subject.strip()[:200],
        message=req.message.strip(),
        page_url=_trim(req.page_url, limit=500),
        user_agent=_trim(req.user_agent, limit=500),
        status="received",
    )
    db.add(inquiry)
    db.commit()
    db.refresh(inquiry)

    delivery = send_contact_messages(inquiry)
    inquiry.status = "notified" if delivery.notification_sent else "stored"
    inquiry.notification_sent_at = datetime.now(timezone.utc) if delivery.notification_sent else None
    errors = [message for message in [delivery.notification_error, delivery.auto_reply_error] if message]
    inquiry.notification_error = " | ".join(errors) if errors else None
    db.commit()
    db.refresh(inquiry)

    return {
        "status": "received",
        "message": "お問い合わせを受け付けました。",
        "inquiry_id": inquiry.id,
        "stored": True,
        "notification_sent": delivery.notification_sent,
        "auto_reply_sent": delivery.auto_reply_sent,
        "support_email": contact_public_email(),
    }
