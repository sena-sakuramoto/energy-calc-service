"""Compliance calculation services (envelope + primary energy)."""

from typing import Dict, Any
from app.schemas.compliance import (
    CalculationInput, CalculationResult, EnvelopeResult, PrimaryEnergyResult
)
from app.data.compliance.building_standards import ClimateZone, get_envelope_standard
from app.services.compliance.model_building import (
    get_model_building_standards, calculate_actual_energy_consumption
)


def get_climate_zone_standards(climate_zone: int) -> Dict[str, Any]:
    try:
        climate_enum = ClimateZone(climate_zone)
    except ValueError:
        climate_enum = ClimateZone.ZONE_6
    env = get_envelope_standard(climate_enum)
    return {
        "ua_threshold": env["ua_threshold"],
        "eta_a_threshold": env["eta_a_threshold"],
        "region_name": f"{climate_zone}地域",
    }


def calculate_envelope_performance(envelope_parts, standards) -> EnvelopeResult:
    total_area = sum(part.area for part in envelope_parts)
    ua_numerator = sum(part.area * part.u_value for part in envelope_parts)
    ua_value = ua_numerator / total_area if total_area > 0 else 0.0

    opening_parts = [p for p in envelope_parts if getattr(p, "eta_value", None) is not None]
    if opening_parts:
        opening_area = sum(p.area for p in opening_parts)
        eta_numerator = sum(p.area * float(p.eta_value) for p in opening_parts)
        eta_a_value = eta_numerator / opening_area if opening_area > 0 else 0.0
    else:
        eta_a_value = 0.0

    ua_threshold = standards.get("ua_threshold", 0.87)
    eta_a_threshold = standards.get("eta_a_threshold")
    is_ua_compliant = ua_value <= ua_threshold
    is_eta_a_compliant = eta_a_threshold is None or (eta_a_value <= eta_a_threshold)

    return EnvelopeResult(
        ua_value=round(ua_value, 3),
        eta_a_value=round(eta_a_value, 3) if eta_a_value > 0 else None,
        is_ua_compliant=is_ua_compliant,
        is_eta_a_compliant=is_eta_a_compliant,
    )


def perform_energy_calculation(input_data: CalculationInput) -> CalculationResult:
    building_type = input_data.building.building_type
    total_floor_area = input_data.building.total_floor_area
    climate_zone = input_data.building.climate_zone

    standards = get_climate_zone_standards(climate_zone)

    # Envelope
    envelope_result = calculate_envelope_performance(input_data.envelope.parts, standards)

    # Standard (model building) and actual detailed consumption
    model_building_standards = get_model_building_standards(
        building_type, climate_zone, total_floor_area
    )
    actual_energy = calculate_actual_energy_consumption(
        input_data.systems, building_type, climate_zone, total_floor_area
    )

    standard_energy = model_building_standards["total_standard_energy"]
    actual_total_energy = actual_energy["total_actual_energy"]
    energy_saving_rate = (
        (standard_energy - actual_total_energy) / standard_energy * 100
        if standard_energy > 0
        else 0.0
    )
    is_energy_compliant = actual_total_energy <= standard_energy

    primary_energy_result = PrimaryEnergyResult(
        total_energy_consumption=round(actual_total_energy, 1),
        standard_energy_consumption=round(standard_energy, 1),
        energy_saving_rate=round(energy_saving_rate, 1),
        is_energy_compliant=is_energy_compliant,
        energy_by_use={k: round(v, 1) for k, v in actual_energy["actual_energy_by_use"].items()},
        standard_energy_by_use={k: round(v, 1) for k, v in model_building_standards.get("standard_energy_by_use", {}).items()},
    )

    overall = envelope_result.is_ua_compliant and (
        envelope_result.is_eta_a_compliant or envelope_result.eta_a_value is None
    ) and primary_energy_result.is_energy_compliant

    return CalculationResult(
        envelope_result=envelope_result,
        primary_energy_result=primary_energy_result,
        overall_compliance=overall,
        message=(
            "Compliant with standards" if overall else "Does not meet one or more standards"
        ),
    )

