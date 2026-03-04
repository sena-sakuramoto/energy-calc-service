"""Tests for analytics aggregation endpoints."""

import asyncio

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.api.v1.analytics import analytics_overview, manufacturer_report
from app.db.base import Base
from app.models.product_event import ProductEvent
from app.models.referral import Referral


def _make_db_session():
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    return engine, session


def test_manufacturer_report_and_overview() -> None:
    engine, db = _make_db_session()
    try:
        db.add_all(
            [
                ProductEvent(
                    event_type="selected",
                    product_id="ykk-apw430-sliding",
                    product_name="APW 430 引違い窓",
                    manufacturer="YKK AP",
                    category="windows",
                    building_zone=6,
                    building_use="office",
                ),
                ProductEvent(
                    event_type="selected",
                    product_id="ykk-apw330-fix",
                    product_name="APW 330 FIX窓",
                    manufacturer="YKK AP",
                    category="windows",
                    building_zone=5,
                    building_use="office",
                ),
                ProductEvent(
                    event_type="selected",
                    product_id="panasonic-id-standard",
                    product_name="iDシリーズ 一般タイプ",
                    manufacturer="パナソニック",
                    category="lighting",
                    building_zone=6,
                    building_use="office",
                ),
            ]
        )
        db.add(
            Referral(
                architect_name="A",
                architect_email="a@example.com",
                product_category="windows",
                product_id="ykk-apw430-sliding",
                product_name="APW 430 引違い窓",
                manufacturer="YKK AP",
                status="pending",
            )
        )
        db.commit()

        ykk = asyncio.run(manufacturer_report("YKK AP", db=db))
        assert ykk["manufacturer"] == "YKK AP"
        assert ykk["total_selections"] == 2
        assert ykk["total_leads"] == 1
        assert ykk["by_category"]["windows"] == 2
        assert ykk["by_zone"][6] == 1

        overview = asyncio.run(analytics_overview(db=db))
        assert overview["total_calculations"] == 3
        assert overview["total_leads"] == 1
        assert overview["by_manufacturer"]["YKK AP"] == 2
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)
        engine.dispose()
