"""Official-like building standards and helpers for compliance calc.

This is a compact port to support the compliance endpoint under app/.
Values are derived from typical METI/MLIT references used in the backend.
"""

from __future__ import annotations

from enum import Enum
from typing import Dict, Any


class BuildingType(Enum):
    OFFICE = "office"
    HOTEL = "hotel"
    HOSPITAL = "hospital"
    SHOP_DEPARTMENT = "shop_department"
    SHOP_SUPERMARKET = "shop_supermarket"
    SCHOOL_SMALL = "school_small"
    SCHOOL_HIGH = "school_high"
    SCHOOL_UNIVERSITY = "school_university"
    RESTAURANT = "restaurant"
    ASSEMBLY = "assembly"
    FACTORY = "factory"
    RESIDENTIAL_COLLECTIVE = "residential_collective"


class ClimateZone(Enum):
    ZONE_1 = 1
    ZONE_2 = 2
    ZONE_3 = 3
    ZONE_4 = 4
    ZONE_5 = 5
    ZONE_6 = 6
    ZONE_7 = 7
    ZONE_8 = 8


# Standard intensities [MJ/m2-year] — base values before zone correction.
# Derived from 建築物省エネ法 モデル建物法 Ver.3.8 標準入力値 (zone 5 ÷ zone-5 correction factor).
# outlet_and_others (コンセント等) = 105 MJ/m²年 for all non-residential types (官報告示値).
STANDARD_ENERGY_CONSUMPTION: Dict[BuildingType, Dict[str, float]] = {
    BuildingType.OFFICE: {
        "heating": 38.0,
        "cooling": 38.0,
        "ventilation": 28.0,
        "hot_water": 3.0,
        "lighting": 70.0,
        "elevator": 14.0,
        "outlet_and_others": 105.0,
        "total": 296.0,  # zone-6 reference total
    },
    BuildingType.HOTEL: {
        "heating": 54.0,
        "cooling": 54.0,
        "ventilation": 28.0,
        "hot_water": 176.0,
        "lighting": 70.0,
        "elevator": 14.0,
        "outlet_and_others": 105.0,
        "total": 501.0,
    },
    BuildingType.HOSPITAL: {
        "heating": 72.0,
        "cooling": 72.0,
        "ventilation": 89.0,
        "hot_water": 176.0,
        "lighting": 98.0,
        "elevator": 14.0,
        "outlet_and_others": 105.0,
        "total": 626.0,
    },
    BuildingType.SHOP_DEPARTMENT: {
        "heating": 20.0,
        "cooling": 20.0,
        "ventilation": 28.0,
        "hot_water": 3.0,
        "lighting": 126.0,
        "elevator": 14.0,
        "outlet_and_others": 105.0,
        "total": 316.0,
    },
    BuildingType.SHOP_SUPERMARKET: {
        "heating": 20.0,
        "cooling": 20.0,
        "ventilation": 28.0,
        "hot_water": 3.0,
        "lighting": 140.0,
        "elevator": 14.0,
        "outlet_and_others": 105.0,
        "total": 330.0,
    },
    BuildingType.SCHOOL_SMALL: {
        "heating": 58.0,
        "cooling": 23.0,
        "ventilation": 14.0,
        "hot_water": 17.0,
        "lighting": 49.0,
        "elevator": 2.0,
        "outlet_and_others": 105.0,
        "total": 268.0,
    },
    BuildingType.SCHOOL_HIGH: {
        "heating": 58.0,
        "cooling": 30.0,
        "ventilation": 14.0,
        "hot_water": 17.0,
        "lighting": 49.0,
        "elevator": 2.0,
        "outlet_and_others": 105.0,
        "total": 275.0,
    },
    BuildingType.SCHOOL_UNIVERSITY: {
        "heating": 43.0,
        "cooling": 30.0,
        "ventilation": 14.0,
        "hot_water": 17.0,
        "lighting": 49.0,
        "elevator": 14.0,
        "outlet_and_others": 105.0,
        "total": 272.0,
    },
    BuildingType.RESTAURANT: {
        "heating": 54.0,
        "cooling": 54.0,
        "ventilation": 117.0,
        "hot_water": 105.0,
        "lighting": 105.0,
        "elevator": 14.0,
        "outlet_and_others": 105.0,
        "total": 554.0,
    },
    BuildingType.ASSEMBLY: {
        "heating": 38.0,
        "cooling": 38.0,
        "ventilation": 28.0,
        "hot_water": 17.0,
        "lighting": 70.0,
        "elevator": 14.0,
        "outlet_and_others": 105.0,
        "total": 310.0,
    },
    BuildingType.FACTORY: {
        "heating": 72.0,
        "cooling": 20.0,
        "ventilation": 28.0,
        "hot_water": 17.0,
        "lighting": 70.0,
        "elevator": 14.0,
        "outlet_and_others": 105.0,
        "total": 326.0,
    },
    BuildingType.RESIDENTIAL_COLLECTIVE: {
        "heating": 38.0,
        "cooling": 38.0,
        "ventilation": 14.0,
        "hot_water": 105.0,
        "lighting": 42.0,
        "elevator": 14.0,
        "outlet_and_others": 0.0,  # 住宅はコンセント等を別計算
        "total": 251.0,
    },
}


# Regional correction factors for heating/cooling demand
REGIONAL_CORRECTION_FACTORS: Dict[ClimateZone, Dict[str, float]] = {
    ClimateZone.ZONE_1: {"heating": 2.38, "cooling": 0.66},
    ClimateZone.ZONE_2: {"heating": 2.01, "cooling": 0.69},
    ClimateZone.ZONE_3: {"heating": 1.54, "cooling": 0.86},
    ClimateZone.ZONE_4: {"heating": 1.16, "cooling": 0.99},
    ClimateZone.ZONE_5: {"heating": 1.07, "cooling": 1.07},
    ClimateZone.ZONE_6: {"heating": 0.84, "cooling": 1.15},
    ClimateZone.ZONE_7: {"heating": 0.70, "cooling": 1.27},
    ClimateZone.ZONE_8: {"heating": 0.36, "cooling": 1.35},
}


def get_envelope_standard(climate: ClimateZone) -> Dict[str, float]:
    """Return envelope UA/ηA thresholds for a climate zone."""
    # Approximated thresholds similar to backend engine defaults
    ua_thresholds = {
        ClimateZone.ZONE_1: 0.46,
        ClimateZone.ZONE_2: 0.46,
        ClimateZone.ZONE_3: 0.56,
        ClimateZone.ZONE_4: 0.56,
        ClimateZone.ZONE_5: 0.62,
        ClimateZone.ZONE_6: 0.62,
        ClimateZone.ZONE_7: 0.68,
        ClimateZone.ZONE_8: 0.68,
    }
    eta_a_thresholds = {
        ClimateZone.ZONE_1: 2.8,
        ClimateZone.ZONE_2: 2.8,
        ClimateZone.ZONE_3: 2.8,
        ClimateZone.ZONE_4: 3.0,
        ClimateZone.ZONE_5: 3.0,
        ClimateZone.ZONE_6: 2.8,
        ClimateZone.ZONE_7: 2.7,
        ClimateZone.ZONE_8: 3.2,
    }
    return {
        "ua_threshold": ua_thresholds.get(climate, 0.62),
        "eta_a_threshold": eta_a_thresholds.get(climate, 3.0),
    }


def _scale_factor(building_type: BuildingType, total_floor_area: float) -> float:
    # Simple piecewise based on type
    if building_type == BuildingType.OFFICE:
        if total_floor_area <= 300:
            return 1.00
        if total_floor_area <= 1000:
            return 0.95
        if total_floor_area <= 5000:
            return 0.90
        if total_floor_area <= 10000:
            return 0.85
        return 0.80
    elif building_type == BuildingType.HOTEL:
        if total_floor_area <= 2000:
            return 1.00
        if total_floor_area <= 5000:
            return 0.95
        if total_floor_area <= 10000:
            return 0.90
        return 0.85
    else:
        # Default mild scaling
        if total_floor_area <= 1000:
            return 1.00
        if total_floor_area <= 5000:
            return 0.95
        if total_floor_area <= 10000:
            return 0.90
        return 0.85


def calculate_standard_primary_energy(
    building_type: BuildingType,
    climate_zone: ClimateZone,
    total_floor_area: float,
) -> Dict[str, Any]:
    """Calculate standard primary energy based on type/zone/area.

    Applies regional correction to heating/cooling and a simple scale factor.
    Returns total and per-use breakdown in MJ/year.
    """
    base = STANDARD_ENERGY_CONSUMPTION.get(
        building_type,
        STANDARD_ENERGY_CONSUMPTION[BuildingType.OFFICE],
    ).copy()
    # Apply zone correction
    corr = REGIONAL_CORRECTION_FACTORS[climate_zone]
    base["heating"] *= corr["heating"]
    base["cooling"] *= corr["cooling"]
    # Recompute total intensity (include outlet_and_others if present)
    _ENERGY_KEYS = ["heating", "cooling", "ventilation", "hot_water", "lighting", "elevator", "outlet_and_others"]
    total_intensity = sum(
        base.get(k, 0.0)
        for k in _ENERGY_KEYS
    )
    # Scale by area factor
    sf = _scale_factor(building_type, total_floor_area)
    total_intensity *= sf

    # Build per-use MJ contributions with same scale
    per_use = {}
    for k in _ENERGY_KEYS:
        v = base.get(k, 0.0)
        if v:
            per_use[k] = v * sf * total_floor_area

    total_mj = total_intensity * total_floor_area
    return {
        "total_standard_energy": total_mj,
        "standard_energy_by_use": per_use,
        "scale_factor": sf,
        "zone_correction": corr,
        "intensity_total": total_intensity,
    }

