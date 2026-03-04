"""Manufacturer analytics and data reporting API."""

from fastapi import APIRouter, Depends, Query
from sqlalchemy import extract, func as sql_func
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.product_event import ProductEvent
from app.models.referral import Referral

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/manufacturer/{manufacturer}")
async def manufacturer_report(
    manufacturer: str,
    months: int = Query(3, ge=1, le=12),
    db: Session = Depends(get_db),
) -> dict:
    """メーカー別のデータレポート。スポンサー契約先に提供。"""
    _ = months

    selection_count = (
        db.query(sql_func.count(ProductEvent.id))
        .filter(ProductEvent.manufacturer == manufacturer)
        .filter(ProductEvent.event_type == "selected")
        .scalar()
        or 0
    )

    by_category = dict(
        db.query(ProductEvent.category, sql_func.count(ProductEvent.id))
        .filter(ProductEvent.manufacturer == manufacturer)
        .group_by(ProductEvent.category)
        .all()
    )

    by_zone = dict(
        db.query(ProductEvent.building_zone, sql_func.count(ProductEvent.id))
        .filter(ProductEvent.manufacturer == manufacturer)
        .filter(ProductEvent.building_zone.isnot(None))
        .group_by(ProductEvent.building_zone)
        .all()
    )

    by_use = dict(
        db.query(ProductEvent.building_use, sql_func.count(ProductEvent.id))
        .filter(ProductEvent.manufacturer == manufacturer)
        .filter(ProductEvent.building_use.isnot(None))
        .group_by(ProductEvent.building_use)
        .all()
    )

    by_month = (
        db.query(
            extract("year", ProductEvent.created_at).label("year"),
            extract("month", ProductEvent.created_at).label("month"),
            sql_func.count(ProductEvent.id).label("count"),
        )
        .filter(ProductEvent.manufacturer == manufacturer)
        .group_by("year", "month")
        .order_by("year", "month")
        .all()
    )

    lead_count = (
        db.query(sql_func.count(Referral.id))
        .filter(Referral.manufacturer == manufacturer)
        .scalar()
        or 0
    )

    categories = list(by_category.keys())
    competitors = {}
    for category in categories:
        top_manufacturers = (
            db.query(ProductEvent.manufacturer, sql_func.count(ProductEvent.id).label("cnt"))
            .filter(ProductEvent.category == category)
            .filter(ProductEvent.event_type == "selected")
            .group_by(ProductEvent.manufacturer)
            .order_by(sql_func.count(ProductEvent.id).desc())
            .limit(5)
            .all()
        )
        competitors[category] = [
            {"manufacturer": m, "count": c}
            for m, c in top_manufacturers
        ]

    return {
        "manufacturer": manufacturer,
        "total_selections": selection_count,
        "total_leads": lead_count,
        "by_category": by_category,
        "by_zone": by_zone,
        "by_use": by_use,
        "by_month": [
            {"year": int(r.year), "month": int(r.month), "count": r.count}
            for r in by_month
        ],
        "competitor_comparison": competitors,
    }


@router.get("/overview")
async def analytics_overview(db: Session = Depends(get_db)) -> dict:
    """全体概要（管理者用）。"""
    total_calculations = (
        db.query(sql_func.count(ProductEvent.id))
        .filter(ProductEvent.event_type == "selected")
        .scalar()
        or 0
    )
    total_leads = db.query(sql_func.count(Referral.id)).scalar() or 0
    by_manufacturer = dict(
        db.query(ProductEvent.manufacturer, sql_func.count(ProductEvent.id))
        .filter(ProductEvent.event_type == "selected")
        .group_by(ProductEvent.manufacturer)
        .order_by(sql_func.count(ProductEvent.id).desc())
        .all()
    )

    return {
        "total_calculations": total_calculations,
        "total_leads": total_leads,
        "by_manufacturer": by_manufacturer,
    }
