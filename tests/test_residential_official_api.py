"""Tests for residential official envelope API integration."""

from __future__ import annotations

import asyncio
import sys
from pathlib import Path
import xml.etree.ElementTree as ET

from fastapi.testclient import TestClient

project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from app.main import app  # noqa: E402
from app.schemas.residential import ResidentialVerifyRequest  # noqa: E402
from app.services.residential_official_api import OfficialAPIError, parse_calc_result_xml  # noqa: E402
from app.services.residential_xml_builder import build_envelope_xml  # noqa: E402

client = TestClient(app)


def _sample_request(parts: list[dict]) -> ResidentialVerifyRequest:
    return ResidentialVerifyRequest(
        region=6,
        a_env=120.0,
        a_a=50.0,
        parts=parts,
        front_result={"ua_value": 0.52, "eta_a_c": 1.2},
    )


def test_build_envelope_xml_wall_direct() -> None:
    request = _sample_request(
        [
            {
                "type": "wall",
                "orientation": "N",
                "area": 35.0,
                "u_value": 0.45,
                "h_value": 1.0,
            }
        ]
    )

    xml_body = build_envelope_xml(request)
    root = ET.fromstring(xml_body)
    wall = root.find("Wall")
    assert wall is not None
    assert wall.attrib["Type"] == "ExternalWall"
    assert wall.attrib["Direction"] == "N"
    assert wall.attrib["Adjacent"] == "Outside"
    assert wall.attrib["Method"] == "Direct"
    assert wall.attrib["UValue"] == "0.45"


def test_build_envelope_xml_window_specification() -> None:
    request = _sample_request(
        [
            {
                "type": "window",
                "orientation": "S",
                "area": 3.0,
                "u_value": 1.31,
                "h_value": 1.0,
                "eta_d_C": 0.35,
                "sash_type": "resin",
                "glass_type": "double_low_e_gas",
            }
        ]
    )

    xml_body = build_envelope_xml(request)
    root = ET.fromstring(xml_body)
    window = root.find("Window")
    assert window is not None
    assert window.attrib["Direction"] == "S"
    assert window.attrib["SashSpec"] == "Resin"
    assert window.attrib["GlassType"] == "DoublePairLowEG"
    assert window.attrib["UvalueInfo"] == "Specification"


def test_build_envelope_xml_foundation() -> None:
    request = _sample_request(
        [
            {
                "type": "foundation",
                "orientation": "BOTTOM",
                "area": 0.0,
                "u_value": 0.0,
                "h_value": 1.0,
                "psi_value": 0.6,
                "length": 28.0,
            }
        ]
    )

    xml_body = build_envelope_xml(request)
    root = ET.fromstring(xml_body)
    foundation = root.find("Foundation")
    assert foundation is not None
    assert foundation.attrib["OuterLength"] == "28"
    assert foundation.attrib["FloorArea"] == "50"


def test_parse_calc_result_xml() -> None:
    sample_xml = """
<CalcResult BuildingName="サンプル" Region="R6" Description="東京都"
  UA="0.52" UAStandard="0.87"
  EaterAC="1.2" EaterACStandard="2.8"
  EaterAH="0.9" TotalArea="48.05">
  <Components>
    <ComponentResult Name="外壁北" ComponentType="ExternalWall" Area="20.0" U="0.45" />
    <ComponentResult Name="窓-1" ComponentType="Window" Area="3.0" U="1.31" />
  </Components>
</CalcResult>
""".strip()

    parsed = parse_calc_result_xml(sample_xml)
    assert parsed["ua"] == 0.52
    assert parsed["ua_standard"] == 0.87
    assert parsed["eta_ac"] == 1.2
    assert parsed["eta_ac_standard"] == 2.8
    assert parsed["eta_ah"] == 0.9
    assert parsed["total_area"] == 48.05
    assert len(parsed["components"]) == 2


def test_verify_endpoint_returns_official_result(monkeypatch) -> None:
    async def fake_call(_xml: str, timeout: int = 30):  # noqa: ARG001
        return {
            "ua": 0.87,
            "ua_standard": 0.87,
            "eta_ac": 3.5,
            "eta_ac_standard": 2.8,
            "eta_ah": 1.1,
            "total_area": 145.0,
            "components": [],
            "raw_xml": "<CalcResult />",
        }

    monkeypatch.setattr("app.api.v1.residential.call_official_envelope_api", fake_call)

    payload = {
        "region": 6,
        "a_env": 145.0,
        "a_a": 54.0,
        "parts": [
            {"type": "wall", "orientation": "N", "area": 60.0, "u_value": 1.0, "h_value": 1.0},
            {"type": "window", "orientation": "S", "area": 20.0, "u_value": 1.31, "h_value": 1.0, "eta_d_C": 0.4},
        ],
        "front_result": {"ua_value": 0.87, "eta_a_c": 3.5},
    }
    response = client.post("/api/v1/residential/verify", json=payload)
    assert response.status_code == 200

    data = response.json()
    assert data["official_result"] is not None
    assert data["official_result"]["ua"] == 0.87
    assert data["official_result"]["eta_a_c"] == 3.5
    assert isinstance(data["official_comparison"]["ua_match"], bool)
    assert isinstance(data["official_comparison"]["eta_a_c_match"], bool)
    assert data["official_comparison"]["ua_diff"] >= 0
    assert data["official_comparison"]["eta_a_c_diff"] >= 0


def test_verify_endpoint_fallback_on_api_error(monkeypatch) -> None:
    async def fake_call(_xml: str, timeout: int = 30):  # noqa: ARG001
        await asyncio.sleep(0)
        raise OfficialAPIError("official api failed")

    monkeypatch.setattr("app.api.v1.residential.call_official_envelope_api", fake_call)

    payload = {
        "region": 6,
        "a_env": 145.0,
        "a_a": 54.0,
        "parts": [
            {"type": "wall", "orientation": "N", "area": 60.0, "u_value": 1.0, "h_value": 1.0},
            {"type": "window", "orientation": "S", "area": 20.0, "u_value": 1.31, "h_value": 1.0, "eta_d_C": 0.4},
        ],
        "front_result": {"ua_value": 0.87, "eta_a_c": 3.5},
    }
    response = client.post("/api/v1/residential/verify", json=payload)
    assert response.status_code == 200

    data = response.json()
    assert data["backend_result"]["ua_value"] > 0
    assert data["official_result"] is None
    assert data["official_error"] == "official api failed"
    assert "comparison" in data
