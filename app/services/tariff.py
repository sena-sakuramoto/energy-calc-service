"""Tariff and billing services."""

import math
from typing import List, Dict, Any
from app.schemas.tariff import (
    QuoteRequest, QuoteResponse, LineItem, Tariff, 
    UsageProfile, ContractInfo
)


def quote_bill(request: QuoteRequest) -> QuoteResponse:
    """Generate bill quote based on tariff and usage."""
    tariff = request.tariff
    usage_kwh = request.total_usage_kwh or 0.0
    usage_profile = request.usage_profile
    contract = request.contract or ContractInfo()
    
    line_items: List[LineItem] = []
    total_before_tax = 0.0
    
    # Calculate energy charges based on tariff type
    if tariff.type == "flat":
        energy_cost = _calculate_flat_rate(usage_kwh, tariff, line_items)
    elif tariff.type == "tiered":
        energy_cost = _calculate_tiered_rate(usage_kwh, tariff, line_items)
    elif tariff.type == "tou":
        energy_cost = _calculate_tou_rate(usage_kwh, usage_profile, tariff, line_items)
    else:
        raise ValueError(f"Unsupported tariff type: {tariff.type}")
    
    total_before_tax += energy_cost
    
    # Basic charges
    if tariff.basic_charge_per_month > 0:
        line_items.append(LineItem(
            description="Basic charge (monthly)",
            amount=tariff.basic_charge_per_month,
            unit="month",
            quantity=1
        ))
        total_before_tax += tariff.basic_charge_per_month
    
    if tariff.basic_charge_per_ampere > 0 and contract.amperage:
        basic_ampere_cost = tariff.basic_charge_per_ampere * contract.amperage
        line_items.append(LineItem(
            description="Basic charge (per ampere)",
            amount=basic_ampere_cost,
            unit="A",
            quantity=contract.amperage,
            rate=tariff.basic_charge_per_ampere
        ))
        total_before_tax += basic_ampere_cost
    
    # Renewable energy levy
    if tariff.renewable_energy_levy > 0 and usage_kwh > 0:
        renewable_cost = usage_kwh * tariff.renewable_energy_levy
        line_items.append(LineItem(
            description="Renewable energy levy",
            amount=renewable_cost,
            unit="kWh",
            quantity=usage_kwh,
            rate=tariff.renewable_energy_levy
        ))
        total_before_tax += renewable_cost
    
    # Fuel cost adjustment
    if tariff.fuel_cost_adjustment > 0 and usage_kwh > 0:
        fuel_cost = usage_kwh * tariff.fuel_cost_adjustment
        line_items.append(LineItem(
            description="Fuel cost adjustment",
            amount=fuel_cost,
            unit="kWh",
            quantity=usage_kwh,
            rate=tariff.fuel_cost_adjustment
        ))
        total_before_tax += fuel_cost
    
    # Demand charges
    if tariff.demand_charge_per_kw > 0 and contract.max_demand_kw:
        demand_cost = contract.max_demand_kw * tariff.demand_charge_per_kw
        line_items.append(LineItem(
            description="Demand charge",
            amount=demand_cost,
            unit="kW",
            quantity=contract.max_demand_kw,
            rate=tariff.demand_charge_per_kw
        ))
        total_before_tax += demand_cost
    
    # Fixed costs
    if tariff.fixed_costs > 0:
        line_items.append(LineItem(
            description="Fixed costs",
            amount=tariff.fixed_costs
        ))
        total_before_tax += tariff.fixed_costs
    
    # Tax calculation
    tax_amount = total_before_tax * tariff.tax_rate
    if tax_amount > 0:
        line_items.append(LineItem(
            description=f"Tax ({tariff.tax_rate*100:.1f}%)",
            amount=tax_amount
        ))
    
    total_amount = total_before_tax + tax_amount
    
    # Rounding
    if tariff.round_to_yen:
        total_amount = math.floor(total_amount)
        total_before_tax = math.floor(total_before_tax)
        tax_amount = total_amount - total_before_tax
    
    # Tariff summary
    tariff_summary = {
        "type": tariff.type,
        "basic_charge_per_month": tariff.basic_charge_per_month,
        "basic_charge_per_ampere": tariff.basic_charge_per_ampere,
        "tax_rate": tariff.tax_rate,
        "round_to_yen": tariff.round_to_yen
    }
    
    if tariff.type == "flat":
        tariff_summary["flat_rate_per_kwh"] = tariff.flat_rate_per_kwh
    
    return QuoteResponse(
        total_amount=total_amount,
        total_before_tax=total_before_tax,
        tax_amount=tax_amount,
        line_items=line_items,
        tariff_summary=tariff_summary
    )


def _calculate_flat_rate(usage_kwh: float, tariff: Tariff, line_items: List[LineItem]) -> float:
    """Calculate flat rate energy cost."""
    if not tariff.flat_rate_per_kwh or usage_kwh <= 0:
        return 0.0
    
    cost = usage_kwh * tariff.flat_rate_per_kwh
    line_items.append(LineItem(
        description="Energy (flat rate)",
        amount=cost,
        unit="kWh",
        quantity=usage_kwh,
        rate=tariff.flat_rate_per_kwh
    ))
    return cost


def _calculate_tiered_rate(usage_kwh: float, tariff: Tariff, line_items: List[LineItem]) -> float:
    """Calculate tiered rate energy cost."""
    if not tariff.tiers or usage_kwh <= 0:
        return 0.0
    
    total_cost = 0.0
    remaining_usage = usage_kwh
    cumulative_limit = 0.0
    
    for i, tier in enumerate(tariff.tiers):
        if remaining_usage <= 0:
            break
        
        # Determine usage for this tier
        if tier.limit_kwh is None:
            # Unlimited tier - use all remaining usage
            tier_usage = remaining_usage
        else:
            # Calculate the actual limit for this tier
            tier_limit = tier.limit_kwh - cumulative_limit
            tier_usage = min(remaining_usage, tier_limit)
            cumulative_limit += tier_usage
        
        # Calculate cost for this tier
        tier_cost = tier_usage * tier.rate_per_kwh
        total_cost += tier_cost
        
        # Add line item
        tier_desc = f"Energy (tier {i+1}"
        if tier.limit_kwh:
            if i == 0:
                tier_desc += f", up to {tier.limit_kwh} kWh"
            else:
                prev_limit = tariff.tiers[i-1].limit_kwh if i > 0 else 0
                tier_desc += f", {prev_limit+1} to {tier.limit_kwh} kWh"
        else:
            tier_desc += f", unlimited"
        tier_desc += ")"
        
        line_items.append(LineItem(
            description=tier_desc,
            amount=tier_cost,
            unit="kWh",
            quantity=tier_usage,
            rate=tier.rate_per_kwh
        ))
        
        remaining_usage -= tier_usage
    
    return total_cost


def _calculate_tou_rate(usage_kwh: float, usage_profile: UsageProfile, 
                      tariff: Tariff, line_items: List[LineItem]) -> float:
    """Calculate time-of-use rate energy cost."""
    if not tariff.tou_periods:
        return 0.0
    
    # If no profile provided, distribute usage evenly
    if not usage_profile:
        hourly_usage = [usage_kwh / 24] * 24
    else:
        hourly_usage = usage_profile.hourly_usage
    
    total_cost = 0.0
    period_usage = {}
    
    # Calculate usage for each TOU period
    for period in tariff.tou_periods:
        period_total = sum(hourly_usage[hour] for hour in period.hours if 0 <= hour <= 23)
        if period_total > 0:
            period_usage[period.name] = {
                "usage": period_total,
                "rate": period.rate_per_kwh,
                "cost": period_total * period.rate_per_kwh
            }
            total_cost += period_usage[period.name]["cost"]
    
    # Add line items
    for period_name, data in period_usage.items():
        line_items.append(LineItem(
            description=f"Energy ({period_name})",
            amount=data["cost"],
            unit="kWh",
            quantity=data["usage"],
            rate=data["rate"]
        ))
    
    return total_cost