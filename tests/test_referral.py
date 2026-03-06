"""Tests for referral endpoints and aggregation."""

import asyncio
from unittest.mock import patch

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.api.v1.referral import (
    ReferralRequest,
    ReferralUpdateRequest,
    create_referral,
    list_referrals,
    referral_stats,
    update_referral,
)
from app.db.base import Base


def _make_db_session():
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    return engine, session


def test_create_referral_and_list() -> None:
    engine, db = _make_db_session()
    try:
        req = ReferralRequest(
            architect_name="山田 太郎",
            architect_email="yamada@example.com",
            architect_company="Yamada Architects",
            product_category="windows",
            product_id="ykk-apw430-sliding",
            product_name="APW 430 引違い窓",
            manufacturer="YKK AP",
            building_zone=6,
            building_use="office",
            floor_area=500,
        )

        with patch("app.api.v1.referral.send_referral_notification", return_value=True):
            result = asyncio.run(create_referral(req=req, db=db))

        assert result["status"] == "pending"
        assert "referral_id" in result

        listed = asyncio.run(list_referrals(db=db))
        assert len(listed["referrals"]) == 1
        assert listed["referrals"][0]["manufacturer"] == "YKK AP"
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)
        engine.dispose()


def test_referral_stats() -> None:
    engine, db = _make_db_session()
    try:
        base = {
            "architect_name": "A",
            "architect_email": "a@example.com",
            "product_category": "windows",
            "product_id": "id-1",
            "product_name": "Product",
            "manufacturer": "YKK AP",
        }
        with patch("app.api.v1.referral.send_referral_notification", return_value=True):
            asyncio.run(create_referral(req=ReferralRequest(**base), db=db))
            payload = {**base, "architect_email": "b@example.com", "manufacturer": "パナソニック"}
            asyncio.run(create_referral(req=ReferralRequest(**payload), db=db))

        stats = asyncio.run(referral_stats(db=db))
        assert stats["total"] == 2
        assert stats["by_status"]["pending"] == 2
        assert stats["by_manufacturer"]["YKK AP"] == 1
        assert stats["by_manufacturer"]["パナソニック"] == 1
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)
        engine.dispose()


def test_update_referral_status_and_notes() -> None:
    engine, db = _make_db_session()
    try:
        req = ReferralRequest(
            architect_name="山田 太郎",
            architect_email="yamada@example.com",
            architect_company="Yamada Architects",
            product_category="windows",
            product_id="ykk-apw430-sliding",
            product_name="APW 430 引違い窓",
            manufacturer="YKK AP",
        )

        with patch("app.api.v1.referral.send_referral_notification", return_value=True):
            created = asyncio.run(create_referral(req=req, db=db))

        updated = asyncio.run(
            update_referral(
                referral_id=created["referral_id"],
                req=ReferralUpdateRequest(status="quoted", notes="一次見積を送付済み"),
                db=db,
            )
        )

        assert updated["status"] == "quoted"
        assert updated["notes"] == "一次見積を送付済み"

        listed = asyncio.run(list_referrals(db=db))
        assert listed["referrals"][0]["status"] == "quoted"
        assert listed["referrals"][0]["notes"] == "一次見積を送付済み"
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)
        engine.dispose()
