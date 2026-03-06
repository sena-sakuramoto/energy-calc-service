"""Bulk onboarding for partner distributor networks (e.g., Technostructure)."""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.onboarding_registration import OnboardingRegistration

router = APIRouter(prefix="/onboarding", tags=["Onboarding"])

VALID_ONBOARDING_STATUSES = {"pending", "contacted", "approved", "rejected"}


class OnboardingRequest(BaseModel):
    company_name: str
    email: EmailStr
    phone: Optional[str] = None
    partner_code: Optional[str] = None
    source: str = "technostructure"


class OnboardingUpdateRequest(BaseModel):
    status: str
    notes: Optional[str] = None


def _serialize_registration(registration: OnboardingRegistration) -> dict:
    return {
        "id": registration.id,
        "company_name": registration.company_name,
        "email": registration.email,
        "phone": registration.phone,
        "partner_code": registration.partner_code,
        "source": registration.source,
        "status": registration.status,
        "notes": registration.notes,
        "created_at": str(registration.created_at),
        "updated_at": str(registration.updated_at),
    }


@router.post("/register")
async def register_partner_user(
    req: OnboardingRequest,
    db: Session = Depends(get_db),
) -> dict:
    """パートナーネットワーク経由のユーザー登録。"""
    source = req.source.strip() or "technostructure"

    registration = (
        db.query(OnboardingRegistration)
        .filter(
            OnboardingRegistration.email == req.email,
            OnboardingRegistration.source == source,
        )
        .order_by(OnboardingRegistration.id.desc())
        .first()
    )

    created = registration is None
    if created:
        registration = OnboardingRegistration(
            company_name=req.company_name.strip(),
            email=req.email,
            phone=(req.phone or "").strip() or None,
            partner_code=(req.partner_code or "").strip() or None,
            source=source,
            status="pending",
        )
        db.add(registration)
    else:
        registration.company_name = req.company_name.strip()
        registration.phone = (req.phone or "").strip() or None
        registration.partner_code = (req.partner_code or "").strip() or None

    db.commit()
    db.refresh(registration)

    return {
        "status": "registered",
        "registration_id": registration.id,
        "created": created,
        "message": f"{req.company_name}様の登録を受け付けました。ご案内メールをお送りします。",
        "source": registration.source,
    }


@router.get("/list")
async def list_partner_users(
    source: Optional[str] = Query(None),
    db: Session = Depends(get_db),
) -> dict:
    """パートナー経由の登録一覧（管理用）。"""
    query = db.query(OnboardingRegistration)
    if source:
        query = query.filter(OnboardingRegistration.source == source)

    registrations = (
        query.order_by(OnboardingRegistration.created_at.desc())
        .limit(100)
        .all()
    )
    return {"registrations": [_serialize_registration(row) for row in registrations]}


@router.patch("/{registration_id}")
async def update_partner_user(
    registration_id: int,
    req: OnboardingUpdateRequest,
    db: Session = Depends(get_db),
) -> dict:
    """パートナー経由の登録ステータス更新。"""
    status = req.status.strip().lower()
    if status not in VALID_ONBOARDING_STATUSES:
        raise HTTPException(
            status_code=422,
            detail=f"status must be one of: {', '.join(sorted(VALID_ONBOARDING_STATUSES))}",
        )

    registration = db.get(OnboardingRegistration, registration_id)
    if registration is None:
        raise HTTPException(status_code=404, detail="registration not found")

    registration.status = status
    if req.notes is not None:
        registration.notes = req.notes.strip() or None

    db.commit()
    db.refresh(registration)
    return _serialize_registration(registration)
