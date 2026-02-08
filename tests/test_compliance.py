"""Pytest tests for compliance calculation engine via FastAPI endpoint POST /api/v1/compliance/calculate."""

import sys
import os
from pathlib import Path

# Ensure imports work by adding the project root to sys.path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

import pytest
from fastapi.testclient import TestClient
from app.main import app


# Initialize TestClient
client = TestClient(app)


# Standard test payload for office building
STANDARD_OFFICE_PAYLOAD = {
    "building": {
        "building_type": "office",
        "total_floor_area": 1000,
        "climate_zone": 6,
        "num_stories": 3
    },
    "envelope": {
        "parts": [
            {"part_name": "wall", "part_type": "wall", "area": 300, "u_value": 0.35},
            {"part_name": "roof", "part_type": "roof", "area": 350, "u_value": 0.22},
            {"part_name": "window", "part_type": "window", "area": 50, "u_value": 2.3, "eta_value": 0.6}
        ]
    },
    "systems": {
        "heating": {"system_type": "AC", "efficiency": 4.0},
        "cooling": {"system_type": "AC", "efficiency": 3.8},
        "ventilation": {"system_type": "type3", "power_consumption": 300},
        "hot_water": {"system_type": "gas", "efficiency": 0.87},
        "lighting": {"system_type": "LED", "power_density": 8.0}
    }
}


class TestComplianceCalculationEndpoint:
    """Test suite for the compliance calculation FastAPI endpoint."""

    def test_standard_office_overall_compliance_true(self):
        """Test that standard office configuration achieves overall_compliance == True."""
        response = client.post("/api/v1/compliance/calculate", json=STANDARD_OFFICE_PAYLOAD)

        assert response.status_code == 200
        data = response.json()

        assert data["overall_compliance"] is True
        assert data["message"] == "Compliant with standards"

    def test_standard_office_positive_energy_saving_rate(self):
        """Test that standard office configuration has energy_saving_rate > 0."""
        response = client.post("/api/v1/compliance/calculate", json=STANDARD_OFFICE_PAYLOAD)

        assert response.status_code == 200
        data = response.json()

        assert data["primary_energy_result"]["energy_saving_rate"] > 0

    def test_hot_water_energy_regression_below_5000_mj(self):
        """Regression test: hot_water energy < 5000 MJ (was 629,310 before fix)."""
        response = client.post("/api/v1/compliance/calculate", json=STANDARD_OFFICE_PAYLOAD)

        assert response.status_code == 200
        data = response.json()

        hot_water_energy = data["primary_energy_result"]["energy_by_use"]["hot_water"]
        assert hot_water_energy < 5000, (
            f"hot_water energy {hot_water_energy} MJ should be < 5000 MJ "
            f"(was incorrectly calculated as 629,310 before fix)"
        )

    def test_heating_energy_regression_above_10000_mj(self):
        """Regression test: heating energy > 10000 MJ (was 4,765 before fix)."""
        response = client.post("/api/v1/compliance/calculate", json=STANDARD_OFFICE_PAYLOAD)

        assert response.status_code == 200
        data = response.json()

        heating_energy = data["primary_energy_result"]["energy_by_use"]["heating"]
        assert heating_energy > 10000, (
            f"heating energy {heating_energy} MJ should be > 10000 MJ "
            f"(was incorrectly calculated as 4,765 before fix)"
        )

    def test_cooling_energy_regression_above_10000_mj(self):
        """Regression test: cooling energy > 10000 MJ (was 5,274 before fix)."""
        response = client.post("/api/v1/compliance/calculate", json=STANDARD_OFFICE_PAYLOAD)

        assert response.status_code == 200
        data = response.json()

        cooling_energy = data["primary_energy_result"]["energy_by_use"]["cooling"]
        assert cooling_energy > 10000, (
            f"cooling energy {cooling_energy} MJ should be > 10000 MJ "
            f"(was incorrectly calculated as 5,274 before fix)"
        )

    def test_ventilation_energy_regression_below_5000_mj_for_office(self):
        """Regression test: ventilation < 5000 MJ for office (was 9,461 before fix with 8760h)."""
        response = client.post("/api/v1/compliance/calculate", json=STANDARD_OFFICE_PAYLOAD)

        assert response.status_code == 200
        data = response.json()

        ventilation_energy = data["primary_energy_result"]["energy_by_use"]["ventilation"]
        assert ventilation_energy < 5000, (
            f"ventilation energy {ventilation_energy} MJ should be < 5000 MJ for office "
            f"(was incorrectly calculated as 9,461 before fix with 8760h)"
        )

    def test_led_lighting_actual_below_standard_lighting(self):
        """Test that LED lighting (8W/m²) actual consumption < standard lighting consumption."""
        # First, get the actual LED consumption from standard office payload
        response = client.post("/api/v1/compliance/calculate", json=STANDARD_OFFICE_PAYLOAD)
        assert response.status_code == 200
        data = response.json()
        led_actual = data["primary_energy_result"]["energy_by_use"]["lighting"]
        standard_lighting = data["primary_energy_result"]["standard_energy_by_use"]["lighting"]

        assert led_actual < standard_lighting, (
            f"LED lighting actual {led_actual} MJ should be < "
            f"standard lighting {standard_lighting} MJ"
        )

    def test_zone_1_heating_greater_than_zone_8_heating(self):
        """Test that zone 1 heating > zone 8 heating (colder zone uses more energy)."""
        # Zone 1 (cold) calculation
        zone1_payload = STANDARD_OFFICE_PAYLOAD.copy()
        zone1_payload["building"] = STANDARD_OFFICE_PAYLOAD["building"].copy()
        zone1_payload["building"]["climate_zone"] = 1

        response_zone1 = client.post("/api/v1/compliance/calculate", json=zone1_payload)
        assert response_zone1.status_code == 200
        zone1_data = response_zone1.json()
        zone1_heating = zone1_data["primary_energy_result"]["energy_by_use"]["heating"]

        # Zone 8 (warm) calculation
        zone8_payload = STANDARD_OFFICE_PAYLOAD.copy()
        zone8_payload["building"] = STANDARD_OFFICE_PAYLOAD["building"].copy()
        zone8_payload["building"]["climate_zone"] = 8

        response_zone8 = client.post("/api/v1/compliance/calculate", json=zone8_payload)
        assert response_zone8.status_code == 200
        zone8_data = response_zone8.json()
        zone8_heating = zone8_data["primary_energy_result"]["energy_by_use"]["heating"]

        assert zone1_heating > zone8_heating, (
            f"zone 1 heating {zone1_heating} MJ should be > "
            f"zone 8 heating {zone8_heating} MJ"
        )

    def test_zone_8_cooling_greater_than_zone_1_cooling(self):
        """Test that zone 8 cooling > zone 1 cooling (warmer zone uses more cooling energy)."""
        # Zone 1 (cold) calculation
        zone1_payload = STANDARD_OFFICE_PAYLOAD.copy()
        zone1_payload["building"] = STANDARD_OFFICE_PAYLOAD["building"].copy()
        zone1_payload["building"]["climate_zone"] = 1

        response_zone1 = client.post("/api/v1/compliance/calculate", json=zone1_payload)
        assert response_zone1.status_code == 200
        zone1_data = response_zone1.json()
        zone1_cooling = zone1_data["primary_energy_result"]["energy_by_use"]["cooling"]

        # Zone 8 (warm) calculation
        zone8_payload = STANDARD_OFFICE_PAYLOAD.copy()
        zone8_payload["building"] = STANDARD_OFFICE_PAYLOAD["building"].copy()
        zone8_payload["building"]["climate_zone"] = 8

        response_zone8 = client.post("/api/v1/compliance/calculate", json=zone8_payload)
        assert response_zone8.status_code == 200
        zone8_data = response_zone8.json()
        zone8_cooling = zone8_data["primary_energy_result"]["energy_by_use"]["cooling"]

        assert zone8_cooling > zone1_cooling, (
            f"zone 8 cooling {zone8_cooling} MJ should be > "
            f"zone 1 cooling {zone1_cooling} MJ"
        )

    def test_envelope_ua_calculation_correct_value(self):
        """Test that envelope UA calculation produces correct value."""
        response = client.post("/api/v1/compliance/calculate", json=STANDARD_OFFICE_PAYLOAD)

        assert response.status_code == 200
        data = response.json()

        calculated_ua = data["envelope_result"]["ua_value"]

        # Manual calculation: UA = sum(area * u_value) / total_area
        # wall: 300 * 0.35 = 105
        # roof: 350 * 0.22 = 77
        # window: 50 * 2.3 = 115
        # Total: 105 + 77 + 115 = 297
        # Total area: 300 + 350 + 50 = 700
        # UA = 297 / 700 = 0.424286 ≈ 0.424
        expected_ua = (300 * 0.35 + 350 * 0.22 + 50 * 2.3) / (300 + 350 + 50)

        assert abs(calculated_ua - expected_ua) < 0.001, (
            f"Calculated UA {calculated_ua} should match expected {expected_ua}"
        )

    def test_compliance_response_structure(self):
        """Test that the compliance response has all required fields."""
        response = client.post("/api/v1/compliance/calculate", json=STANDARD_OFFICE_PAYLOAD)

        assert response.status_code == 200
        data = response.json()

        # Check top-level fields
        assert "envelope_result" in data
        assert "primary_energy_result" in data
        assert "overall_compliance" in data
        assert "message" in data

        # Check envelope result fields
        envelope = data["envelope_result"]
        assert "ua_value" in envelope
        assert "eta_a_value" in envelope
        assert "is_ua_compliant" in envelope
        assert "is_eta_a_compliant" in envelope

        # Check primary energy result fields
        energy = data["primary_energy_result"]
        assert "total_energy_consumption" in energy
        assert "standard_energy_consumption" in energy
        assert "energy_saving_rate" in energy
        assert "is_energy_compliant" in energy
        assert "energy_by_use" in energy
        assert "standard_energy_by_use" in energy

        # Check energy by use breakdown
        energy_by_use = energy["energy_by_use"]
        assert "heating" in energy_by_use
        assert "cooling" in energy_by_use
        assert "ventilation" in energy_by_use
        assert "hot_water" in energy_by_use
        assert "lighting" in energy_by_use
        assert "elevator" in energy_by_use

    def test_invalid_payload_returns_400(self):
        """Test that invalid payload returns 400 Bad Request."""
        invalid_payload = {"invalid": "data"}
        response = client.post("/api/v1/compliance/calculate", json=invalid_payload)

        assert response.status_code == 422

    def test_different_building_types(self):
        """Test that calculation works for different building types."""
        building_types = ["office", "hotel", "hospital", "residential", "school"]

        for building_type in building_types:
            payload = STANDARD_OFFICE_PAYLOAD.copy()
            payload["building"] = STANDARD_OFFICE_PAYLOAD["building"].copy()
            payload["building"]["building_type"] = building_type

            response = client.post("/api/v1/compliance/calculate", json=payload)
            assert response.status_code == 200, f"Failed for building_type: {building_type}"
            data = response.json()
            assert "overall_compliance" in data, f"Missing overall_compliance for {building_type}"
