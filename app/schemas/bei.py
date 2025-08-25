"""BEI (Building Energy Index) calculation schemas."""

from typing import List, Optional, Dict, Any, Union
from pydantic import BaseModel, Field


class DesignEnergyCategory(BaseModel):
    """Design energy for a specific category."""
    category: str = Field(..., description="Energy category (e.g., 'lighting', 'cooling')")
    value: float = Field(..., gt=0, description="Energy value")
    unit: Optional[str] = Field(None, description="Energy unit (auto-estimated if not provided)")
    primary_factor: Optional[float] = Field(None, description="Primary energy factor (auto-estimated if not provided)")


class UsageMix(BaseModel):
    """Usage mix for complex building types."""
    use: str = Field(..., description="Building use type (e.g., 'office', 'hotel')")
    zone: str = Field(..., description="Climate zone")
    area_share: Optional[float] = Field(None, ge=0, le=1, description="Area share ratio (0-1)")
    area_m2: Optional[float] = Field(None, gt=0, description="Area in m²")


class BEIRequest(BaseModel):
    """Request for BEI calculation."""
    # Building information
    building_area_m2: float = Field(..., gt=0, description="Building area in m²")
    use: Optional[str] = Field(None, description="Building use type (for single use)")
    zone: Optional[str] = Field(None, description="Climate zone (for single use)")
    
    # For complex buildings
    usage_mix: Optional[List[UsageMix]] = Field(None, description="Usage mix for complex buildings")
    
    # Design energy
    design_energy: List[DesignEnergyCategory] = Field(..., min_length=1, 
                                                     description="Design energy by category")
    
    # Renewable energy deduction
    renewable_energy_deduction_mj: float = Field(0.0, ge=0, 
                                                description="Renewable energy deduction in MJ/year")
    
    # Display settings
    bei_round_digits: int = Field(3, ge=0, le=10, description="Digits for BEI rounding")
    compliance_threshold: float = Field(1.0, gt=0, description="BEI compliance threshold")


class StandardIntensity(BaseModel):
    """Standard intensity data."""
    lighting: Optional[float] = None
    cooling: Optional[float] = None
    heating: Optional[float] = None
    ventilation: Optional[float] = None
    hot_water: Optional[float] = None
    outlet_and_others: Optional[float] = None
    elevator: Optional[float] = None
    total_MJ_per_m2_year: Optional[float] = None


class BEIResponse(BaseModel):
    """Response for BEI calculation."""
    # Results
    bei: float = Field(..., description="Building Energy Index")
    is_compliant: bool = Field(..., description="Whether building meets compliance threshold")
    
    # Energy values
    design_primary_energy_mj: float = Field(..., description="Design primary energy in MJ/year")
    standard_primary_energy_mj: float = Field(..., description="Standard primary energy in MJ/year")
    renewable_deduction_mj: float = Field(..., description="Renewable energy deduction in MJ/year")
    
    # Per unit area
    design_energy_per_m2: float = Field(..., description="Design energy per m² in MJ/m²/year")
    standard_energy_per_m2: float = Field(..., description="Standard energy per m² in MJ/m²/year")
    
    # Building info
    building_area_m2: float
    use_info: Union[str, List[Dict[str, Any]]] = Field(..., description="Building use information")
    
    # Calculation details
    design_energy_breakdown: List[Dict[str, Any]] = Field(..., description="Design energy by category")
    standard_intensity_source: str = Field(..., description="Source of standard intensity data")
    compliance_threshold: float
    bei_round_digits: int
    
    # Notes and warnings
    notes: List[str] = Field(default_factory=list, description="Calculation notes and warnings")


class CatalogUsesResponse(BaseModel):
    """Response for catalog uses listing."""
    uses: List[str] = Field(..., description="Available building use types")


class CatalogZonesResponse(BaseModel):
    """Response for catalog zones listing."""
    zones: List[str] = Field(..., description="Available climate zones")


class CatalogIntensityResponse(BaseModel):
    """Response for catalog intensity data."""
    use: str
    zone: str
    intensities: StandardIntensity
    notes: Optional[str] = None


class CatalogValidateRequest(BaseModel):
    """Request for catalog validation."""
    yaml_path: Optional[str] = Field(None, description="Path to YAML file to validate")
    yaml_data: Optional[Dict[str, Any]] = Field(None, description="YAML data to validate")


class ValidationIssue(BaseModel):
    """Validation issue."""
    severity: str = Field(..., description="Issue severity (error, warning)")
    message: str = Field(..., description="Issue description")
    path: Optional[str] = Field(None, description="Path in YAML where issue occurs")


class CatalogValidateResponse(BaseModel):
    """Response for catalog validation."""
    is_valid: bool = Field(..., description="Whether catalog is valid")
    issues: List[ValidationIssue] = Field(default_factory=list, description="Validation issues")
    summary: Dict[str, int] = Field(..., description="Summary of uses and zones found")