"""BEI (Building Energy Index) calculation services."""

from typing import Dict, Any, List, Optional, Union
from app.schemas.bei import (
    BEIRequest, BEIResponse, StandardIntensity,
    CatalogUsesResponse, CatalogZonesResponse, CatalogIntensityResponse,
    CatalogValidateRequest, CatalogValidateResponse, ValidationIssue
)
from app.core.data import load_yaml
from app.core.factors import get_primary_factor, estimate_unit_from_category

USE_LABELS_JA = {
    "office": "事務所等",
    "hotel": "ホテル等",
    "hospital": "病院等",
    "shop_department": "百貨店等",
    "shop_supermarket": "スーパーマーケット",
    "school_small": "学校等（小中学校）",
    "school_high": "学校等（高等学校）",
    "school_university": "学校等（大学）",
    "restaurant": "飲食店等",
    "assembly": "集会所等",
    "factory": "工場等",
    "residential_collective": "共同住宅",
}


def _use_label(use: str) -> str:
    return USE_LABELS_JA.get(use, use)


def evaluate_bei(request: BEIRequest) -> BEIResponse:
    """Evaluate Building Energy Index (BEI)."""
    notes = []
    
    # Calculate design primary energy
    design_primary_energy_mj = 0.0
    design_energy_breakdown = []
    
    for category in request.design_energy:
        # Determine unit and primary factor
        unit = category.unit or estimate_unit_from_category(category.category)
        primary_factor = category.primary_factor or get_primary_factor(unit)
        
        if not primary_factor:
            notes.append(
                f"用途「{category.category}」の単位「{unit}」を判別できないため、既定換算係数 9.76 を使用しました"
            )
            primary_factor = 9.76  # Default to electricity
        
        # Calculate primary energy
        primary_energy = category.value * primary_factor
        design_primary_energy_mj += primary_energy
        
        design_energy_breakdown.append({
            "category": category.category,
            "value": category.value,
            "unit": unit,
            "primary_factor": primary_factor,
            "primary_energy_mj": primary_energy
        })
    
    # Apply renewable energy deduction
    design_primary_energy_mj -= request.renewable_energy_deduction_mj
    
    # Calculate standard primary energy
    if request.usage_mix:
        # Complex building with usage mix
        standard_primary_energy_mj, use_info, intensity_source = _calculate_mixed_standard_energy(
            request.usage_mix, request.building_area_m2, notes
        )
    else:
        # Single use building
        if not request.use or not request.zone:
            raise ValueError("単一用途建物では 'use' と 'zone' の両方が必要です")
        
        standard_intensity = _get_standard_intensity(request.use, request.zone, notes)
        standard_energy_per_m2 = _calculate_total_intensity(standard_intensity, notes)
        standard_primary_energy_mj = standard_energy_per_m2 * request.building_area_m2
        use_info = f"{_use_label(request.use)}（{request.zone}地域）"
        intensity_source = f"カタログ値（{_use_label(request.use)}・{request.zone}地域）"
    
    # Calculate BEI
    if standard_primary_energy_mj <= 0:
        raise ValueError("基準一次エネルギー消費量は 0 より大きい必要があります")
    
    bei_raw = design_primary_energy_mj / standard_primary_energy_mj
    bei = round(bei_raw, request.bei_round_digits)
    
    # Check compliance (use raw value for accurate comparison)
    is_compliant = bei_raw <= request.compliance_threshold
    
    # Per unit area values
    design_energy_per_m2 = design_primary_energy_mj / request.building_area_m2
    standard_energy_per_m2 = standard_primary_energy_mj / request.building_area_m2
    
    return BEIResponse(
        bei=bei,
        is_compliant=is_compliant,
        design_primary_energy_mj=design_primary_energy_mj,
        standard_primary_energy_mj=standard_primary_energy_mj,
        renewable_deduction_mj=request.renewable_energy_deduction_mj,
        design_energy_per_m2=design_energy_per_m2,
        standard_energy_per_m2=standard_energy_per_m2,
        building_area_m2=request.building_area_m2,
        use_info=use_info,
        design_energy_breakdown=design_energy_breakdown,
        standard_intensity_source=intensity_source,
        compliance_threshold=request.compliance_threshold,
        bei_round_digits=request.bei_round_digits,
        notes=notes
    )


def get_catalog_uses() -> CatalogUsesResponse:
    """Get available building use types from catalog."""
    try:
        catalog = load_yaml("data/bei/standard_intensities.yaml")
        uses = list(catalog.get("uses", {}).keys()) if catalog.get("uses") else []
        return CatalogUsesResponse(uses=uses)
    except Exception:
        return CatalogUsesResponse(uses=[])


def get_catalog_zones(use: str) -> CatalogZonesResponse:
    """Get available climate zones for a building use type."""
    try:
        catalog = load_yaml("data/bei/standard_intensities.yaml")
        use_data = catalog.get("uses", {}).get(use, {})
        
        # Handle both structures: zones -> zone_id or direct zone_id
        if "zones" in use_data:
            zones = list(use_data["zones"].keys())
        else:
            # Look for direct zone keys (numeric)
            zones = [key for key in use_data.keys() if key.isdigit()]
        
        return CatalogZonesResponse(zones=zones)
    except Exception:
        return CatalogZonesResponse(zones=[])


def get_catalog_intensity(use: str, zone: str) -> CatalogIntensityResponse:
    """Get standard intensity data for specific use and zone."""
    try:
        catalog = load_yaml("data/bei/standard_intensities.yaml")
        use_data = catalog.get("uses", {}).get(use, {})
        
        # Handle both structures
        if "zones" in use_data:
            zone_data = use_data["zones"].get(zone, {})
        else:
            zone_data = use_data.get(zone, {})
        
        if not zone_data:
            raise ValueError(f"Zone {zone} not found for use {use}")
        
        # Create StandardIntensity object, handling category aliases
        intensity_data = {}
        for key, value in zone_data.items():
            if key in ["lighting", "cooling", "heating", "ventilation", "hot_water", "elevator", "total_MJ_per_m2_year"]:
                intensity_data[key] = value
            elif key in ["others", "outlet", "outlets"]:
                intensity_data["outlet_and_others"] = value
            elif key == "outlet_and_others":
                intensity_data[key] = value
        
        intensity = StandardIntensity(**intensity_data)
        
        return CatalogIntensityResponse(
            use=use,
            zone=zone,
            intensities=intensity
        )
    except Exception as e:
        raise ValueError(f"Error retrieving catalog data: {e}")


def validate_catalog(request: CatalogValidateRequest) -> CatalogValidateResponse:
    """Validate YAML catalog for completeness and consistency."""
    issues = []
    
    try:
        if request.yaml_path:
            catalog = load_yaml(request.yaml_path)
        elif request.yaml_data:
            catalog = request.yaml_data
        else:
            raise ValueError("Either yaml_path or yaml_data must be provided")
        
        uses_count = 0
        zones_count = 0
        
        uses_data = catalog.get("uses", {})
        if not uses_data:
            issues.append(ValidationIssue(
                severity="error",
                message="No 'uses' section found in catalog",
                path="uses"
            ))
        
        for use, use_data in uses_data.items():
            uses_count += 1
            
            # Handle both zone structures
            if "zones" in use_data:
                zone_data = use_data["zones"]
            else:
                zone_data = {k: v for k, v in use_data.items() if k.isdigit()}
            
            if not zone_data:
                issues.append(ValidationIssue(
                    severity="error",
                    message=f"No zones found for use '{use}'",
                    path=f"uses.{use}"
                ))
                continue
            
            for zone, intensity_data in zone_data.items():
                zones_count += 1
                
                # Check for required categories
                required_categories = ["lighting", "cooling", "heating", "ventilation", "hot_water"]
                missing_categories = []
                
                for category in required_categories:
                    if category not in intensity_data:
                        # Check for aliases
                        if category == "outlet_and_others" and not any(alias in intensity_data for alias in ["others", "outlet", "outlets"]):
                            missing_categories.append(category)
                
                if missing_categories:
                    issues.append(ValidationIssue(
                        severity="warning",
                        message=f"Missing categories for {use}, zone {zone}: {', '.join(missing_categories)}",
                        path=f"uses.{use}.{zone}"
                    ))
                
                # Check total consistency
                if "total_MJ_per_m2_year" in intensity_data:
                    calculated_total = sum(
                        intensity_data.get(cat, 0) 
                        for cat in ["lighting", "cooling", "heating", "ventilation", "hot_water", "outlet_and_others", "elevator"]
                        if intensity_data.get(cat) is not None
                    )
                    
                    # Handle aliases for outlet_and_others
                    if "outlet_and_others" not in intensity_data:
                        for alias in ["others", "outlet", "outlets"]:
                            if alias in intensity_data:
                                calculated_total += intensity_data[alias]
                                break
                    
                    declared_total = intensity_data["total_MJ_per_m2_year"]
                    if abs(calculated_total - declared_total) > 0.1:
                        issues.append(ValidationIssue(
                            severity="warning",
                            message=f"Total mismatch for {use}, zone {zone}: calculated {calculated_total}, declared {declared_total}",
                            path=f"uses.{use}.{zone}.total_MJ_per_m2_year"
                        ))
        
        summary = {
            "uses_count": uses_count,
            "zones_count": zones_count,
            "errors": len([i for i in issues if i.severity == "error"]),
            "warnings": len([i for i in issues if i.severity == "warning"])
        }
        
        is_valid = summary["errors"] == 0
        
        return CatalogValidateResponse(
            is_valid=is_valid,
            issues=issues,
            summary=summary
        )
        
    except Exception as e:
        issues.append(ValidationIssue(
            severity="error",
            message=f"Failed to load or parse catalog: {e}",
            path=""
        ))
        
        return CatalogValidateResponse(
            is_valid=False,
            issues=issues,
            summary={"uses_count": 0, "zones_count": 0, "errors": 1, "warnings": 0}
        )


def _get_standard_intensity(use: str, zone: str, notes: List[str]) -> StandardIntensity:
    """Get standard intensity for a specific use and zone."""
    try:
        catalog = load_yaml("data/bei/standard_intensities.yaml")
        use_data = catalog.get("uses", {}).get(use, {})
        
        if not use_data:
            notes.append(f"用途「{_use_label(use)}」のカタログが見つからないため、既定値を使用しました")
            return StandardIntensity()
        
        # Handle both zone structures
        if "zones" in use_data:
            zone_data = use_data["zones"].get(zone, {})
        else:
            zone_data = use_data.get(zone, {})
        
        if not zone_data:
            notes.append(f"用途「{_use_label(use)}」の{zone}地域データがないため、既定値を使用しました")
            return StandardIntensity()
        
        # Parse intensity data, handling aliases
        intensity_data = {}
        for key, value in zone_data.items():
            if key in ["lighting", "cooling", "heating", "ventilation", "hot_water", "elevator", "total_MJ_per_m2_year"]:
                intensity_data[key] = value
            elif key in ["others", "outlet", "outlets"]:
                intensity_data["outlet_and_others"] = value
        
        return StandardIntensity(**intensity_data)
        
    except Exception as e:
        notes.append(f"基準原単位データの読み込みエラー: {e}")
        return StandardIntensity()


def _calculate_total_intensity(intensity: StandardIntensity, notes: List[str]) -> float:
    """Calculate total intensity, preferring explicit total over sum of categories."""
    if intensity.total_MJ_per_m2_year is not None:
        # Use explicit total if available
        calculated_sum = sum(filter(None, [
            intensity.lighting,
            intensity.cooling,
            intensity.heating,
            intensity.ventilation,
            intensity.hot_water,
            intensity.outlet_and_others,
            intensity.elevator
        ]))
        
        if abs(intensity.total_MJ_per_m2_year - calculated_sum) > 0.1:
            notes.append(
                "カテゴリ合計 "
                f"{calculated_sum:.1f} MJ/m²年 ではなく、公表合計 "
                f"{intensity.total_MJ_per_m2_year:.1f} MJ/m²年 を使用しました"
            )
        
        return intensity.total_MJ_per_m2_year
    
    # Calculate sum of categories
    total = sum(filter(None, [
        intensity.lighting,
        intensity.cooling,
        intensity.heating,
        intensity.ventilation,
        intensity.hot_water,
        intensity.outlet_and_others,
        intensity.elevator
    ]))
    
    notes.append(f"カテゴリ合計から基準原単位を算出: {total:.1f} MJ/m²年")
    return total


def _calculate_mixed_standard_energy(usage_mix: List, building_area_m2: float, notes: List[str]) -> tuple:
    """Calculate standard energy for mixed-use building."""
    total_weighted_intensity = 0.0
    total_area = 0.0
    use_details = []
    
    for mix in usage_mix:
        # Get standard intensity for this use/zone combination
        intensity = _get_standard_intensity(mix.use, mix.zone, notes)
        use_intensity = _calculate_total_intensity(intensity, notes)
        
        # Calculate area for this use
        if mix.area_m2:
            use_area = mix.area_m2
        elif mix.area_share:
            use_area = mix.area_share * building_area_m2
        else:
            raise ValueError(f"Either area_m2 or area_share must be specified for use {mix.use}")
        
        # Add to totals
        weighted_intensity = use_intensity * use_area
        total_weighted_intensity += weighted_intensity
        total_area += use_area
        
        use_details.append({
            "use": mix.use,
            "zone": mix.zone,
            "area_m2": use_area,
            "area_share": use_area / building_area_m2,
            "intensity_MJ_per_m2_year": use_intensity,
            "total_MJ_year": weighted_intensity
        })
    
    if abs(total_area - building_area_m2) > 0.1:
        notes.append(
            "複合用途の面積合計"
            f"（{total_area:.1f} m²）が延床面積（{building_area_m2:.1f} m²）と一致していません"
        )
    
    # Calculate area-weighted average intensity
    average_intensity = total_weighted_intensity / building_area_m2 if building_area_m2 > 0 else 0
    standard_primary_energy_mj = average_intensity * building_area_m2
    
    intensity_source = f"{len(usage_mix)}用途の面積加重平均"
    
    return standard_primary_energy_mj, use_details, intensity_source
