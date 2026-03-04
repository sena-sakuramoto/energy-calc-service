"""Referral (manufacturer introduction) API endpoints."""

from typing import Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel, EmailStr
from sqlalchemy import extract, func as sql_func
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.referral import Referral
from app.services.referral import send_referral_notification

router = APIRouter(prefix="/referral", tags=["Referral"])


class ReferralRequest(BaseModel):
    architect_name: str
    architect_email: EmailStr
    architect_company: Optional[str] = None
    architect_phone: Optional[str] = None
    project_name: Optional[str] = None
    building_use: Optional[str] = None
    building_zone: Optional[int] = None
    floor_area: Optional[float] = None
    product_category: str
    product_id: str
    product_name: str
    manufacturer: str


@router.post("/request")
async def create_referral(req: ReferralRequest, db: Session = Depends(get_db)) -> dict:
    """メーカーへの見積依頼を送信。"""
    referral = Referral(
        architect_name=req.architect_name,
        architect_email=req.architect_email,
        architect_company=req.architect_company,
        architect_phone=req.architect_phone,
        project_name=req.project_name,
        building_use=req.building_use,
        building_zone=req.building_zone,
        floor_area=req.floor_area,
        product_category=req.product_category,
        product_id=req.product_id,
        product_name=req.product_name,
        manufacturer=req.manufacturer,
        status="pending",
    )
    db.add(referral)
    db.commit()
    db.refresh(referral)

    send_referral_notification(req.model_dump())

    return {
        "referral_id": referral.id,
        "status": "pending",
        "message": (
            f"{req.manufacturer}への見積依頼を受け付けました。"
            "担当者から連絡いたします。"
        ),
    }


@router.get("/list")
async def list_referrals(db: Session = Depends(get_db)) -> dict:
    """紹介一覧（管理用）。"""
    referrals = (
        db.query(Referral)
        .order_by(Referral.created_at.desc())
        .limit(100)
        .all()
    )
    return {
        "referrals": [
            {
                "id": r.id,
                "architect_name": r.architect_name,
                "product_name": r.product_name,
                "manufacturer": r.manufacturer,
                "status": r.status,
                "created_at": str(r.created_at),
            }
            for r in referrals
        ]
    }


@router.get("/stats")
async def referral_stats(db: Session = Depends(get_db)) -> dict:
    """紹介実績の集計（パートナー管理用）。"""
    total = db.query(sql_func.count(Referral.id)).scalar() or 0
    by_status = dict(
        db.query(Referral.status, sql_func.count(Referral.id))
        .group_by(Referral.status)
        .all()
    )
    by_manufacturer = dict(
        db.query(Referral.manufacturer, sql_func.count(Referral.id))
        .group_by(Referral.manufacturer)
        .all()
    )
    by_month = (
        db.query(
            extract("year", Referral.created_at).label("year"),
            extract("month", Referral.created_at).label("month"),
            sql_func.count(Referral.id).label("count"),
        )
        .group_by("year", "month")
        .order_by("year", "month")
        .all()
    )

    return {
        "total": total,
        "by_status": by_status,
        "by_manufacturer": by_manufacturer,
        "by_month": [
            {"year": int(r.year), "month": int(r.month), "count": r.count}
            for r in by_month
        ],
    }
