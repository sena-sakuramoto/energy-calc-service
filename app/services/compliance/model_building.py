"""Model building (standard + detailed actual energy) helpers."""

from typing import Dict, Any

from app.data.compliance.building_standards import (
    BuildingType,
    ClimateZone,
    calculate_standard_primary_energy,
)
from app.data.compliance.equipment_database import get_default_efficiency


def get_model_building_standards(building_type: str, climate_zone: int, total_floor_area: float) -> Dict[str, Any]:
    mapping = {
        "office": BuildingType.OFFICE,
        "事務所": BuildingType.OFFICE,
        "hotel": BuildingType.HOTEL,
        "ホテル": BuildingType.HOTEL,
        "hospital": BuildingType.HOSPITAL,
        "病院": BuildingType.HOSPITAL,
        "residential": BuildingType.RESIDENTIAL_COLLECTIVE,
        "共同住宅": BuildingType.RESIDENTIAL_COLLECTIVE,
        "shop_department": BuildingType.SHOP_DEPARTMENT,
        "shop_supermarket": BuildingType.SHOP_SUPERMARKET,
        "restaurant": BuildingType.RESTAURANT,
        "assembly": BuildingType.ASSEMBLY,
        "factory": BuildingType.FACTORY,
        "学校": BuildingType.SCHOOL_SMALL,
    }
    bt = mapping.get(building_type, BuildingType.OFFICE)
    try:
        cz = ClimateZone(climate_zone)
    except Exception:
        cz = ClimateZone.ZONE_6
    return calculate_standard_primary_energy(bt, cz, total_floor_area)


def calculate_actual_energy_consumption(systems, building_type: str, climate_zone: int, total_floor_area: float) -> Dict[str, Any]:
    """Compute rough actual primary energy from system specs. Returns per-use MJ and total."""
    actual = {}

    # Heating
    if getattr(systems, "heating", None):
        actual["heating"] = _detailed_heating_energy(systems.heating, climate_zone, total_floor_area)
    else:
        actual["heating"] = 0.0

    # Cooling
    if getattr(systems, "cooling", None):
        actual["cooling"] = _detailed_cooling_energy(systems.cooling, climate_zone, total_floor_area)
    else:
        actual["cooling"] = 0.0

    # Ventilation
    if getattr(systems, "ventilation", None):
        actual["ventilation"] = _detailed_ventilation_energy(systems.ventilation, total_floor_area, building_type)
    else:
        actual["ventilation"] = 0.0

    # Hot water
    if getattr(systems, "hot_water", None):
        actual["hot_water"] = _detailed_hot_water_energy(systems.hot_water, building_type, total_floor_area)
    else:
        actual["hot_water"] = 0.0

    # Lighting
    if getattr(systems, "lighting", None):
        actual["lighting"] = _detailed_lighting_energy(systems.lighting, building_type, total_floor_area)
    else:
        actual["lighting"] = 0.0

    # Elevator (only non-residential)
    if building_type != "residential":
        actual["elevator"] = _elevator_energy(total_floor_area)
    else:
        actual["elevator"] = 0.0

    total = sum(actual.values())
    return {"actual_energy_by_use": actual, "total_actual_energy": total}


def _detailed_heating_energy(heating_system, climate_zone: int, floor_area: float) -> float:
    # HDD base 18C (Japanese standard)
    heating_degree_days = {1: 3800, 2: 3400, 3: 2800, 4: 2200, 5: 1800, 6: 1500, 7: 1000, 8: 500}
    dd = heating_degree_days.get(climate_zone, 1500)
    design_delta_t = 20.0
    annual_hours = (dd * 24) / design_delta_t
    peak_load_factor = 45.0  # W/m2 peak
    part_load_ratio = 0.35
    avg_load_w = floor_area * peak_load_factor * part_load_ratio
    eq_eff = get_default_efficiency("heating", getattr(heating_system, "system_type", ""))
    actual_cop = heating_system.efficiency if heating_system.efficiency > 0 else eq_eff
    op_eff = actual_cop * 0.85
    annual_kwh = (avg_load_w * annual_hours) / (1000 * op_eff)
    return annual_kwh * 3.6


def _detailed_cooling_energy(cooling_system, climate_zone: int, floor_area: float) -> float:
    cooling_degree_days = {1: 83, 2: 160, 3: 297, 4: 459, 5: 608, 6: 835, 7: 1071, 8: 1385}
    dd = cooling_degree_days.get(climate_zone, 835)
    design_delta_t = 15.0
    annual_hours = (dd * 24) / design_delta_t
    peak_load_factor = 80.0  # W/m2 peak
    part_load_ratio = 0.30
    avg_load_w = floor_area * peak_load_factor * part_load_ratio
    eq_eff = get_default_efficiency("cooling", getattr(cooling_system, "system_type", ""))
    actual_cop = cooling_system.efficiency if cooling_system.efficiency > 0 else eq_eff
    op_eff = actual_cop * 0.80
    annual_kwh = (avg_load_w * annual_hours) / (1000 * op_eff)
    return annual_kwh * 3.6


def _detailed_ventilation_energy(ventilation_system, floor_area: float, building_type: str = "office") -> float:
    operating_hours = {
        "office": 2750, "hotel": 6570, "hospital": 8760,
        "residential": 8760, "retail": 3650, "school": 1800,
    }
    air_volume = ventilation_system.air_volume if ventilation_system.air_volume else floor_area * 3.0 * 0.5
    fan_power = ventilation_system.power_consumption if ventilation_system.power_consumption else air_volume * 0.15
    annual_hours = operating_hours.get(building_type, 2750)
    heat_exchange_eff = ventilation_system.heat_exchange_efficiency if ventilation_system.heat_exchange_efficiency else 0.0
    efficiency_factor = 1.0 - (heat_exchange_eff * 0.3)
    annual_energy_mj = fan_power * annual_hours * efficiency_factor * 3.6 / 1000
    return annual_energy_mj


def _detailed_hot_water_energy(hot_water_system, building_type: str, floor_area: float) -> float:
    annual_mj_per_m2 = {
        "office": 1.5,
        "residential": 40.0,
        "retail": 2.0,
        "hotel": 80.0,
        "hospital": 30.0,
        "school": 3.0,
    }
    bt_key = building_type if building_type in annual_mj_per_m2 else "office"
    annual_mj = annual_mj_per_m2[bt_key] * floor_area
    eff = hot_water_system.efficiency if hot_water_system.efficiency > 0 else 0.85
    return annual_mj / eff


def _detailed_lighting_energy(lighting_system, building_type: str, floor_area: float) -> float:
    # Convert W/m2 to MJ/year (W * h -> kWh -> MJ)
    pd = lighting_system.power_density if lighting_system.power_density else 10.0
    annual_kwh = pd * floor_area * 2200.0 / 1000.0
    return annual_kwh * 3.6


def _elevator_energy(floor_area: float) -> float:
    # Simple proportional model
    return max(0.0, 14.0 * floor_area)  # 14 MJ/m2-year baseline

