"""Tests for DB-backed product service with YAML fallback."""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.db.base import Base
from app.models.product import Product
from app.services.products import get_recommended_products, load_products


def _make_db_session():
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    return engine, session


def test_load_products_falls_back_to_yaml_when_db_empty() -> None:
    engine, db = _make_db_session()
    try:
        products = load_products("windows", db=db)
        assert len(products) > 0
        assert "id" in products[0]
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)
        engine.dispose()


def test_load_products_prefers_db() -> None:
    engine, db = _make_db_session()
    try:
        db.add(
            Product(
                product_id="db-window-1",
                category="windows",
                manufacturer="DBメーカー",
                series="DBシリーズ",
                name="DB窓",
                partner=True,
                specs={"u_value": 1.11, "eta_c": 0.4},
                recommended_zones=[6],
                recommended_uses=["office"],
            )
        )
        db.commit()

        products = load_products("windows", db=db)
        assert len(products) == 1
        assert products[0]["id"] == "db-window-1"
        assert products[0]["u_value"] == 1.11
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)
        engine.dispose()


def test_get_recommended_products_filters_and_sorts() -> None:
    engine, db = _make_db_session()
    try:
        db.add_all(
            [
                Product(
                    product_id="p2",
                    category="windows",
                    manufacturer="A",
                    series="S",
                    name="Non Partner",
                    partner=False,
                    specs={"u_value": 1.4},
                    recommended_zones=[6],
                    recommended_uses=["office"],
                ),
                Product(
                    product_id="p1",
                    category="windows",
                    manufacturer="A",
                    series="S",
                    name="Partner",
                    partner=True,
                    specs={"u_value": 1.2},
                    recommended_zones=[6],
                    recommended_uses=["office"],
                ),
            ]
        )
        db.commit()

        results = get_recommended_products("windows", zone=6, use="office", db=db)
        assert [r["id"] for r in results] == ["p1", "p2"]
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)
        engine.dispose()
