"""Energy calculation services."""

import math
from typing import List
from app.schemas.calc import (
    PowerRequest, PowerResponse,
    EnergyRequest, EnergyResponse,
    CostRequest, CostResponse,
    DeviceUsageRequest, DeviceUsageResponse,
    DeviceUsage
)
from app.core.config import settings


def power_from_vi(request: PowerRequest) -> PowerResponse:
    """
    Calculate power from voltage, current, and power factor.
    
    For single-phase: P = V × I × cos(φ)
    For three-phase: P = √3 × V × I × cos(φ)
    """
    if request.is_three_phase:
        power_w = math.sqrt(3) * request.voltage * request.current * request.power_factor
    else:
        power_w = request.voltage * request.current * request.power_factor
    
    power_kw = power_w / 1000.0
    
    return PowerResponse(
        power_w=power_w,
        power_kw=power_kw,
        voltage=request.voltage,
        current=request.current,
        power_factor=request.power_factor,
        is_three_phase=request.is_three_phase
    )


def energy_from_power(request: EnergyRequest) -> EnergyResponse:
    """Calculate energy consumption from power and duration."""
    # Convert to kW if needed
    if request.power_kw:
        power_kw = request.power_kw
    else:
        power_kw = request.power_w / 1000.0
    
    energy_kwh = power_kw * request.duration_hours
    
    return EnergyResponse(
        energy_kwh=energy_kwh,
        power_kw=power_kw,
        duration_hours=request.duration_hours
    )


def cost_from_energy(request: CostRequest) -> CostResponse:
    """Calculate cost from energy consumption and tariff."""
    tariff_per_kwh = request.tariff_per_kwh or settings.default_tariff_per_kwh
    
    energy_cost = request.energy_kwh * tariff_per_kwh
    subtotal = energy_cost + request.fixed_cost
    tax_amount = subtotal * request.tax_rate
    total_cost = subtotal + tax_amount
    
    return CostResponse(
        total_cost=total_cost,
        energy_cost=energy_cost,
        fixed_cost=request.fixed_cost,
        tax_amount=tax_amount,
        tariff_per_kwh=tariff_per_kwh
    )


def aggregate_device_usage(request: DeviceUsageRequest) -> DeviceUsageResponse:
    """Aggregate energy usage from multiple devices."""
    device_details = []
    total_energy_kwh = 0.0
    total_power_kw = 0.0
    device_count = 0
    
    for device in request.devices:
        device_energy = device.power_kw * device.usage_hours * device.quantity
        device_power = device.power_kw * device.quantity
        
        device_details.append({
            "name": device.name,
            "power_kw": device.power_kw,
            "usage_hours": device.usage_hours,
            "quantity": device.quantity,
            "total_power_kw": device_power,
            "energy_kwh": device_energy
        })
        
        total_energy_kwh += device_energy
        total_power_kw += device_power
        device_count += device.quantity
    
    return DeviceUsageResponse(
        total_energy_kwh=total_energy_kwh,
        total_power_kw=total_power_kw,
        device_count=device_count,
        devices=device_details
    )