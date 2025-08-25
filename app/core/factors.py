"""Primary energy conversion factors."""

from typing import Dict, Optional

# Primary energy conversion factors (MJ per unit)
PRIMARY_ENERGY_FACTORS: Dict[str, float] = {
    # Electricity
    "kWh": 9.76,
    "MWh": 9760.0,
    "Wh": 0.00976,
    
    # Gas
    "m3_gas": 45.0,
    "MJ_gas": 1.0,
    
    # Oil/Kerosene
    "L_kerosene": 36.7,
    "L_oil": 38.2,
    
    # LPG
    "kg_lpg": 50.8,
    "m3_lpg": 24.9,
    
    # District heating/cooling
    "MJ_district_heating": 1.36,
    "MJ_district_cooling": 1.36,
    
    # Coal
    "kg_coal": 25.7,
    
    # Biomass
    "kg_wood": 14.4,
    "m3_wood": 10.8,
}


def get_primary_factor(unit: str) -> Optional[float]:
    """
    Get primary energy conversion factor for given unit.
    
    Args:
        unit: Energy unit (e.g., 'kWh', 'm3_gas', 'L_kerosene')
        
    Returns:
        Primary energy factor in MJ per unit, or None if unit not found
    """
    return PRIMARY_ENERGY_FACTORS.get(unit)


def get_available_units() -> list[str]:
    """Get list of available energy units."""
    return list(PRIMARY_ENERGY_FACTORS.keys())


def estimate_unit_from_category(category: str) -> Optional[str]:
    """
    Estimate likely energy unit from category name.
    
    Args:
        category: Energy category (e.g., 'lighting', 'cooling', 'heating')
        
    Returns:
        Estimated unit or None
    """
    category_lower = category.lower()
    
    # Most categories use electricity
    if any(keyword in category_lower for keyword in ['lighting', 'cooling', 'ventilation', 'outlet', 'elevator']):
        return 'kWh'
    
    # Heating might use gas or oil
    if 'heating' in category_lower:
        return 'm3_gas'  # Default to gas for heating
    
    # Hot water might use gas or electricity
    if 'hot_water' in category_lower or 'dhw' in category_lower:
        return 'm3_gas'  # Default to gas for hot water
    
    # Default to electricity
    return 'kWh'