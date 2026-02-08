"""Utilities for generating official compliance reports via the lowenergy.jp API."""

from __future__ import annotations

from pathlib import Path
from typing import Any, Dict
import io
import logging

import openpyxl
import requests

logger = logging.getLogger(__name__)

# Directory that stores the official Excel templates bundled with this repo.
TEMPLATE_DIR = Path(__file__).resolve().parents[2] / "Excel　書式"
SMALL_TEMPLATE = TEMPLATE_DIR / "SMALLMODEL_inputSheet_for_Ver3.8_beta.xlsx"
STANDARD_TEMPLATE = TEMPLATE_DIR / "MODEL_inputSheet_for_Ver3.8_beta.xlsx"

# Mapping between payload keys and Excel named ranges expected by the template.
CELL_MAPPING: Dict[str, str] = {
    "name": "BuildingName",
    "climate_zone": "Region",
    "building_type": "BuildingType",
    "meeting_place_type": "MeetingPlaceType",
    "total_floor_area": "TotalArea",
    "envelope_system": "EnvelopeSystem",
    "total_floor": "TotalFloor",
    "building_height": "BuildingHeight",
    "outer_circumference": "OuterCircumference",
    "outer_circumference_core": "OuterCircumference_Core",
    "non_ac_core_direction": "NonACCoreDirection",
    "uvalue_exterior_wall": "Uvalue_ExteriorWall",
    "uvalue_roof": "Uvalue_Roof",
    "uvalue_floor": "Uvalue_Floor",
    "ac_heat_source_type_cooling": "HeatSourceType_Cooling",
    "ac_cop_cooling": "HeatSourceCOP_Cooling",
    "ac_heat_source_type_heating": "HeatSourceType_Heating",
    "ac_cop_heating": "HeatSourceCOP_Heating",
    "ac_heatexchanger_efficiency": "HeatExchangerEfficiency",
    "v_equipment": "VentilationEquipment",
    "l_equipment": "LightingEquipment",
    "l_unit_power": "LightingUnitPower",
    "hw_equipment": "HotwaterEquipment",
    "hw_efficiency": "HeatSourceEfficiency",
    "ev_present": "Elevator",
    "ev_control_type": "ElevatorControlType",
}


def _write_data_to_workbook(workbook: openpyxl.Workbook, input_data: Dict[str, Any]) -> None:
    """Populate the provided workbook using the CELL_MAPPING definition."""

    flat_data: Dict[str, Any] = {}
    building = input_data.get("building")
    if isinstance(building, dict):
        flat_data.update(building)

    systems = input_data.get("systems")
    if isinstance(systems, dict):
        for system_data in systems.values():
            if isinstance(system_data, dict):
                flat_data.update(system_data)

    for key, cell_name in CELL_MAPPING.items():
        value = flat_data.get(key)
        if value is None:
            continue
        try:
            destinations = workbook.defined_names[cell_name].destinations
        except KeyError:
            logger.warning("Named range '%s' not found for key '%s'", cell_name, key)
            continue

        for sheet_name, target_cell in destinations:
            workbook[sheet_name][target_cell] = value
        logger.debug("Wrote '%s' -> '%s'", key, cell_name)


def _select_template(total_floor_area: float) -> Path:
    """Return the appropriate Excel template path based on floor area."""

    template = SMALL_TEMPLATE if total_floor_area < 300 else STANDARD_TEMPLATE
    if not template.exists():
        raise FileNotFoundError(f"Excel template not found at {template}")
    return template


def get_official_report_from_api(input_data: Dict[str, Any]) -> bytes:
    """Fill the official Excel template and submit it to the lowenergy.jp API."""

    api_url = "https://api.lowenergy.jp/model/1/beta/reportFromInputSheets"

    building_data = input_data.get("building", {})
    total_area = float(building_data.get("total_floor_area", 0) or 0)

    template_path = _select_template(total_area)
    logger.info("Using template %s for floor area %.2f", template_path, total_area)

    workbook = openpyxl.load_workbook(template_path)
    _write_data_to_workbook(workbook, input_data)

    buffer = io.BytesIO()
    workbook.save(buffer)
    buffer.seek(0)

    files = {
        "file": (
            "input.xlsx",
            buffer,
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        )
    }

    try:
        response = requests.post(api_url, files=files, timeout=90)
        response.raise_for_status()
    except requests.exceptions.RequestException as exc:
        detail = exc.response.text if getattr(exc, "response", None) is not None else ""
        logger.exception("Failed to generate report via %s: %s", api_url, detail)
        raise Exception(f"API request failed: {exc} {detail}") from exc

    logger.info("Received %s bytes from lowenergy.jp", len(response.content))
    return response.content
