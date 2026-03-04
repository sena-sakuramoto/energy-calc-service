"""Tests for residential verification API endpoint."""

import sys
from pathlib import Path

from fastapi.testclient import TestClient

project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from app.main import app  # noqa: E402


client = TestClient(app)


SAMPLE_PAYLOAD = {
    "region": 6,
    "a_env": 145.0,
    "a_a": 54.0,
    "parts": [
        {"type": "wall", "orientation": "N", "area": 60.0, "u_value": 1.0, "h_value": 1.0},
        {"type": "roof", "orientation": "TOP", "area": 20.0, "u_value": 0.5, "h_value": 1.0},
        {"type": "floor", "orientation": "BOTTOM", "area": 20.0, "u_value": 0.65, "h_value": 1.0},
        {"type": "foundation", "orientation": "BOTTOM", "area": 0.0, "u_value": 0.0, "h_value": 1.0, "psi_value": 0.4, "length": 10.0},
        {"type": "window", "orientation": "S", "area": 20.0, "u_value": 1.31, "h_value": 1.0, "eta_d_C": 0.4},
        {"type": "window", "orientation": "E", "area": 10.0, "u_value": 1.31, "h_value": 1.0, "eta_d_C": 0.4},
    ],
    "front_result": {
        "ua_value": 0.87,
        "eta_a_c": 3.5,
    },
}


def test_residential_verify_endpoint_exists_and_returns_match_flags() -> None:
    response = client.post("/api/v1/residential/verify", json=SAMPLE_PAYLOAD)
    assert response.status_code == 200

    data = response.json()
    assert "backend_result" in data
    assert "comparison" in data
    assert data["backend_result"]["ua_value"] == 0.87
    assert data["backend_result"]["eta_a_c"] == 3.5
    assert data["comparison"]["ua_match"] is True
    assert data["comparison"]["eta_a_c_match"] is True


def test_residential_verify_detects_mismatch() -> None:
    payload = dict(SAMPLE_PAYLOAD)
    payload["front_result"] = {"ua_value": 0.9, "eta_a_c": 7.9}

    response = client.post("/api/v1/residential/verify", json=payload)
    assert response.status_code == 200

    data = response.json()
    assert data["comparison"]["ua_match"] is False
    assert data["comparison"]["eta_a_c_match"] is False
