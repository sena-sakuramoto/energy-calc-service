"""Calculation API schemas."""

from typing import List, Optional, Union
from pydantic import BaseModel, Field, model_validator


class PowerRequest(BaseModel):
    """Request for power calculation."""
    voltage: float = Field(..., gt=0, description="Voltage in V")
    current: float = Field(..., gt=0, description="Current in A")
    power_factor: float = Field(1.0, ge=0, le=1, description="Power factor (0-1)")
    is_three_phase: bool = Field(False, description="Whether it's three-phase power")


class PowerResponse(BaseModel):
    """Response for power calculation."""
    power_w: float = Field(..., description="Power in watts")
    power_kw: float = Field(..., description="Power in kilowatts")
    voltage: float
    current: float
    power_factor: float
    is_three_phase: bool


class EnergyRequest(BaseModel):
    """Request for energy calculation."""
    power_w: Optional[float] = Field(None, gt=0, description="Power in watts")
    power_kw: Optional[float] = Field(None, gt=0, description="Power in kilowatts")
    duration_hours: float = Field(..., gt=0, description="Duration in hours")
    
    @model_validator(mode='after')
    def validate_power(self):
        if not self.power_w and not self.power_kw:
            raise ValueError("Either power_w or power_kw must be provided")
        if self.power_w and self.power_kw:
            raise ValueError("Provide either power_w or power_kw, not both")
        return self


class EnergyResponse(BaseModel):
    """Response for energy calculation."""
    energy_kwh: float = Field(..., description="Energy in kWh")
    power_kw: float = Field(..., description="Power used in calculation (kW)")
    duration_hours: float
    

class CostRequest(BaseModel):
    """Request for cost calculation."""
    energy_kwh: float = Field(..., gt=0, description="Energy consumption in kWh")
    tariff_per_kwh: Optional[float] = Field(None, gt=0, description="Tariff per kWh")
    fixed_cost: float = Field(0.0, ge=0, description="Fixed cost")
    tax_rate: float = Field(0.1, ge=0, le=1, description="Tax rate (0-1)")


class CostResponse(BaseModel):
    """Response for cost calculation."""
    total_cost: float = Field(..., description="Total cost including tax")
    energy_cost: float = Field(..., description="Energy cost before tax")
    fixed_cost: float
    tax_amount: float = Field(..., description="Tax amount")
    tariff_per_kwh: float
    

class DeviceUsage(BaseModel):
    """Individual device usage."""
    name: str = Field(..., description="Device name")
    power_kw: float = Field(..., gt=0, description="Power consumption in kW")
    usage_hours: float = Field(..., gt=0, description="Usage hours")
    quantity: int = Field(1, ge=1, description="Number of devices")


class DeviceUsageRequest(BaseModel):
    """Request for device usage aggregation."""
    devices: List[DeviceUsage] = Field(..., min_length=1, description="List of devices")


class DeviceUsageResponse(BaseModel):
    """Response for device usage aggregation."""
    total_energy_kwh: float = Field(..., description="Total energy consumption in kWh")
    total_power_kw: float = Field(..., description="Total power consumption in kW")
    device_count: int = Field(..., description="Total number of devices")
    devices: List[dict] = Field(..., description="Device details with calculated energy")