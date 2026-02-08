"""Compliance (official building energy) calculation schemas.

Ported and trimmed from backend to be stateless and usable under app/.
"""

from typing import Optional, List, Dict
from pydantic import BaseModel, Field


# Building input schema
class BuildingInput(BaseModel):
    building_type: str = Field(..., description="Building usage type")
    total_floor_area: float = Field(..., description="Total floor area (m2)")
    climate_zone: int = Field(..., description="Climate zone (1-8)")
    num_stories: int = Field(..., description="Number of stories")
    has_central_heat_source: Optional[bool] = Field(False, description="Has central heat source")


# Envelope part input
class EnvelopePartInput(BaseModel):
    part_name: str = Field(..., description="Part name")
    part_type: str = Field(..., description="Part type")
    area: float = Field(..., description="Area (m2)")
    u_value: float = Field(..., description="U-value (W/m2K)")
    eta_value: Optional[float] = Field(None, description="Solar heat gain coefficient (η)")


class EnvelopeInput(BaseModel):
    parts: List[EnvelopePartInput] = Field(..., description="Envelope parts")


# Systems input
class HeatingSystemInput(BaseModel):
    system_type: str = Field(..., description="Heating system type")
    rated_capacity: Optional[float] = Field(None, description="Rated capacity (kW)")
    efficiency: float = Field(..., description="Efficiency (COP etc.)")
    control_method: Optional[str] = Field(None, description="Control method")


class CoolingSystemInput(BaseModel):
    system_type: str = Field(..., description="Cooling system type")
    rated_capacity: Optional[float] = Field(None, description="Rated capacity (kW)")
    efficiency: float = Field(..., description="Efficiency (COP etc.)")
    control_method: Optional[str] = Field(None, description="Control method")


class VentilationSystemInput(BaseModel):
    system_type: str = Field(..., description="Ventilation system type")
    air_volume: Optional[float] = Field(None, description="Air volume (m3/h)")
    power_consumption: Optional[float] = Field(None, description="Power consumption (W)")
    heat_exchange_efficiency: Optional[float] = Field(None, description="Heat exchange efficiency (0-1)")


class HotWaterSystemInput(BaseModel):
    system_type: str = Field(..., description="Hot water system type")
    efficiency: float = Field(..., description="Efficiency")


class LightingSystemInput(BaseModel):
    system_type: str = Field(..., description="Lighting system type")
    power_density: Optional[float] = Field(None, description="Power density (W/m2)")
    control_method: Optional[str] = Field(None, description="Control method")


class SystemsInput(BaseModel):
    heating: HeatingSystemInput = Field(..., description="Heating")
    cooling: CoolingSystemInput = Field(..., description="Cooling")
    ventilation: VentilationSystemInput = Field(..., description="Ventilation")
    hot_water: HotWaterSystemInput = Field(..., description="Hot water")
    lighting: LightingSystemInput = Field(..., description="Lighting")


class CalculationInput(BaseModel):
    building: BuildingInput = Field(..., description="Building information")
    envelope: EnvelopeInput = Field(..., description="Envelope information")
    systems: SystemsInput = Field(..., description="Systems information")


class EnvelopeResult(BaseModel):
    ua_value: float = Field(..., description="UA (W/m2K)")
    eta_a_value: Optional[float] = Field(None, description="ηA (average SHGC)")
    is_ua_compliant: bool = Field(..., description="UA meets standard")
    is_eta_a_compliant: bool = Field(..., description="ηA meets standard")


class PrimaryEnergyResult(BaseModel):
    total_energy_consumption: float = Field(..., description="Total primary energy (MJ/year)")
    standard_energy_consumption: float = Field(..., description="Standard primary energy (MJ/year)")
    energy_saving_rate: float = Field(..., description="Saving rate (%)")
    is_energy_compliant: bool = Field(..., description="Meets energy standard")
    energy_by_use: Dict[str, float] = Field(..., description="Energy by use (MJ)")
    standard_energy_by_use: Optional[Dict[str, float]] = Field(None, description="Standard energy by use (MJ)")


class CalculationResult(BaseModel):
    envelope_result: EnvelopeResult = Field(..., description="Envelope result")
    primary_energy_result: PrimaryEnergyResult = Field(..., description="Primary energy result")
    overall_compliance: bool = Field(..., description="Overall standard compliance")
    message: str = Field(..., description="Message")

