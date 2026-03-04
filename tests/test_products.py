"""Tests for product database API."""

import pytest

from app.services.products import get_recommended_products, load_products


class TestProductLoad:
    def test_load_windows(self) -> None:
        products = load_products("windows")
        assert len(products) > 0
        for p in products:
            assert "id" in p
            assert "manufacturer" in p
            assert "u_value" in p

    def test_load_insulation(self) -> None:
        products = load_products("insulation")
        assert len(products) > 0
        for p in products:
            assert "lambda_value" in p

    def test_load_hvac(self) -> None:
        products = load_products("hvac")
        assert len(products) > 0

    def test_load_lighting(self) -> None:
        products = load_products("lighting")
        assert len(products) > 0

    def test_invalid_category(self) -> None:
        with pytest.raises(FileNotFoundError):
            load_products("nonexistent")


class TestProductRecommendation:
    def test_recommend_windows_by_zone(self) -> None:
        results = get_recommended_products("windows", zone=6)
        assert len(results) > 0
        for product in results:
            zones = product.get("recommended_zones", [])
            if zones:
                assert 6 in zones

    def test_recommend_windows_by_use(self) -> None:
        results = get_recommended_products("windows", use="office")
        assert len(results) > 0

    def test_partner_products_first(self) -> None:
        results = get_recommended_products("windows", zone=6)
        non_partner_seen = False
        for product in results:
            if product.get("partner"):
                assert not non_partner_seen, "Partner products must come before non-partner"
            else:
                non_partner_seen = True
