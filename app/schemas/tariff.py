"""Tariff and billing schemas."""

from typing import List, Optional, Dict, Any, Union, Literal
from pydantic import BaseModel, Field


class TariffTier(BaseModel):
    """Tariff tier for tiered pricing."""
    limit_kwh: Optional[float] = Field(None, description="Upper limit for this tier (None for unlimited)")
    rate_per_kwh: float = Field(..., gt=0, description="Rate per kWh for this tier")


class TimeOfUsePeriod(BaseModel):
    """Time-of-use period definition."""
    name: str = Field(..., description="Period name (e.g., 'peak', 'off-peak')")
    rate_per_kwh: float = Field(..., gt=0, description="Rate per kWh for this period")
    hours: List[int] = Field(..., description="Hours of the day (0-23) when this rate applies")


class Tariff(BaseModel):
    """Tariff structure definition."""
    type: Literal["flat", "tiered", "tou"] = Field(..., description="Tariff type")
    
    # Flat rate
    flat_rate_per_kwh: Optional[float] = Field(None, description="Flat rate per kWh")
    
    # Tiered rates
    tiers: Optional[List[TariffTier]] = Field(None, description="Tiered rates")
    
    # Time-of-use rates
    tou_periods: Optional[List[TimeOfUsePeriod]] = Field(None, description="Time-of-use periods")
    
    # Basic charges
    basic_charge_per_month: float = Field(0.0, description="Monthly basic charge")
    basic_charge_per_ampere: float = Field(0.0, description="Basic charge per ampere")
    
    # Adjustments
    renewable_energy_levy: float = Field(0.0, description="Renewable energy levy per kWh")
    fuel_cost_adjustment: float = Field(0.0, description="Fuel cost adjustment per kWh")
    
    # Demand charges
    demand_charge_per_kw: float = Field(0.0, description="Demand charge per kW")
    
    # Fixed costs and taxes
    fixed_costs: float = Field(0.0, description="Other fixed costs")
    tax_rate: float = Field(0.1, description="Tax rate")
    
    # Rounding
    round_to_yen: bool = Field(True, description="Round final amount to nearest yen")


class UsageProfile(BaseModel):
    """Hourly usage profile for time-of-use calculation."""
    hourly_usage: List[float] = Field(..., min_length=24, max_length=24, 
                                     description="Usage for each hour (0-23) in kWh")


class ContractInfo(BaseModel):
    """Contract information."""
    amperage: Optional[int] = Field(None, description="Contract amperage")
    max_demand_kw: Optional[float] = Field(None, description="Maximum demand in kW")


class QuoteRequest(BaseModel):
    """Request for tariff quote."""
    tariff: Tariff
    total_usage_kwh: Optional[float] = Field(None, description="Total monthly usage in kWh")
    usage_profile: Optional[UsageProfile] = Field(None, description="Hourly usage profile")
    contract: Optional[ContractInfo] = Field(None, description="Contract information")


class LineItem(BaseModel):
    """Individual line item in bill."""
    description: str
    amount: float
    unit: Optional[str] = None
    quantity: Optional[float] = None
    rate: Optional[float] = None


class QuoteResponse(BaseModel):
    """Response for tariff quote."""
    total_amount: float = Field(..., description="Total bill amount")
    total_before_tax: float = Field(..., description="Total before tax")
    tax_amount: float = Field(..., description="Tax amount")
    line_items: List[LineItem] = Field(..., description="Detailed line items")
    tariff_summary: Dict[str, Any] = Field(..., description="Summary of tariff used")