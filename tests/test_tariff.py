"""Tests for tariff calculation services."""

import pytest
from app.services.tariff import quote_bill
from app.schemas.tariff import (
    QuoteRequest, Tariff, TariffTier, TimeOfUsePeriod, 
    UsageProfile, ContractInfo
)


class TestFlatRateTariff:
    """Tests for flat rate tariff."""
    
    def test_flat_rate_basic(self):
        """Test basic flat rate calculation."""
        tariff = Tariff(
            type="flat",
            flat_rate_per_kwh=25.0,
            basic_charge_per_month=1000.0,
            tax_rate=0.1
        )
        request = QuoteRequest(
            tariff=tariff,
            total_usage_kwh=300.0
        )
        result = quote_bill(request)
        
        # Energy: 300 * 25 = 7500
        # Basic: 1000
        # Subtotal: 8500
        # Tax: 850
        # Total: 9350
        
        assert result.total_before_tax == 8500.0
        assert result.tax_amount == 850.0
        assert result.total_amount == 9350.0
        assert len(result.line_items) == 3  # energy, basic, tax


class TestTieredRateTariff:
    """Tests for tiered rate tariff."""
    
    def test_tiered_rate_multiple_tiers(self):
        """Test tiered rate with multiple tiers."""
        tiers = [
            TariffTier(limit_kwh=100.0, rate_per_kwh=20.0),
            TariffTier(limit_kwh=200.0, rate_per_kwh=25.0),
            TariffTier(limit_kwh=None, rate_per_kwh=30.0)  # Unlimited
        ]
        tariff = Tariff(
            type="tiered",
            tiers=tiers,
            basic_charge_per_ampere=400.0,
            renewable_energy_levy=2.0,
            tax_rate=0.08
        )
        contract = ContractInfo(amperage=30)
        request = QuoteRequest(
            tariff=tariff,
            total_usage_kwh=250.0,
            contract=contract
        )
        result = quote_bill(request)
        
        # Tier 1: 100 * 20 = 2000
        # Tier 2: 100 * 25 = 2500  
        # Tier 3: 50 * 30 = 1500
        # Energy total: 6000
        # Basic (ampere): 30 * 400 = 12000
        # Renewable levy: 250 * 2 = 500
        # Subtotal: 18500
        # Tax: 1480
        # Total: 19980
        
        assert result.total_before_tax == 18500.0
        assert result.tax_amount == 1480.0
        assert result.total_amount == 19980.0
        
        # Check that we have all expected line items
        energy_items = [item for item in result.line_items if "Energy (tier" in item.description]
        assert len(energy_items) == 3


class TestTimeOfUseTariff:
    """Tests for time-of-use tariff."""
    
    def test_tou_with_profile(self):
        """Test time-of-use tariff with usage profile."""
        tou_periods = [
            TimeOfUsePeriod(name="peak", rate_per_kwh=35.0, hours=[13, 14, 15, 16, 17, 18]),
            TimeOfUsePeriod(name="off-peak", rate_per_kwh=15.0, hours=list(range(0, 13)) + list(range(19, 24)))
        ]
        tariff = Tariff(
            type="tou",
            tou_periods=tou_periods,
            demand_charge_per_kw=1000.0,
            fixed_costs=500.0,
            tax_rate=0.1
        )
        
        # Create usage profile: 2 kWh during peak hours, 1 kWh during off-peak
        hourly_usage = [1.0] * 24  # Base 1 kWh per hour
        for hour in [13, 14, 15, 16, 17, 18]:  # Peak hours
            hourly_usage[hour] = 2.0  # 2 kWh during peak
        
        usage_profile = UsageProfile(hourly_usage=hourly_usage)
        contract = ContractInfo(max_demand_kw=10.0)
        
        request = QuoteRequest(
            tariff=tariff,
            usage_profile=usage_profile,
            contract=contract
        )
        result = quote_bill(request)
        
        # Peak usage: 6 hours * 2 kWh = 12 kWh at 35 yen = 420 yen
        # Off-peak usage: 18 hours * 1 kWh = 18 kWh at 15 yen = 270 yen
        # Energy total: 690
        # Demand charge: 10 * 1000 = 10000
        # Fixed costs: 500
        # Subtotal: 11190
        # Tax: 1119
        # Total: 12309
        
        assert result.total_before_tax == 11190.0
        assert result.tax_amount == 1119.0
        assert result.total_amount == 12309.0
        
        # Check for peak and off-peak line items
        energy_items = [item for item in result.line_items if "Energy (" in item.description]
        assert len(energy_items) == 2
    
    def test_tou_without_profile(self):
        """Test time-of-use tariff without usage profile (even distribution)."""
        tou_periods = [
            TimeOfUsePeriod(name="peak", rate_per_kwh=30.0, hours=[9, 10, 11, 12, 13, 14]),
            TimeOfUsePeriod(name="off-peak", rate_per_kwh=20.0, hours=list(range(0, 9)) + list(range(15, 24)))
        ]
        tariff = Tariff(
            type="tou",
            tou_periods=tou_periods,
            tax_rate=0.1
        )
        
        request = QuoteRequest(
            tariff=tariff,
            total_usage_kwh=240.0  # 10 kWh per hour evenly distributed
        )
        result = quote_bill(request)
        
        # Peak: 6 hours * 10 kWh = 60 kWh at 30 yen = 1800 yen
        # Off-peak: 18 hours * 10 kWh = 180 kWh at 20 yen = 3600 yen
        # Energy total: 5400
        # Tax: 540
        # Total: 5940
        
        assert result.total_before_tax == 5400.0
        assert result.tax_amount == 540.0
        assert result.total_amount == 5940.0


class TestComplexTariff:
    """Tests for complex tariff with multiple charges."""
    
    def test_comprehensive_tariff(self):
        """Test tariff with all types of charges."""
        tariff = Tariff(
            type="flat",
            flat_rate_per_kwh=22.0,
            basic_charge_per_month=800.0,
            basic_charge_per_ampere=300.0,
            renewable_energy_levy=1.5,
            fuel_cost_adjustment=0.8,
            demand_charge_per_kw=800.0,
            fixed_costs=200.0,
            tax_rate=0.08,
            round_to_yen=True
        )
        
        contract = ContractInfo(amperage=40, max_demand_kw=8.0)
        request = QuoteRequest(
            tariff=tariff,
            total_usage_kwh=400.0,
            contract=contract
        )
        result = quote_bill(request)
        
        # Energy: 400 * 22 = 8800
        # Basic (monthly): 800
        # Basic (ampere): 40 * 300 = 12000
        # Renewable levy: 400 * 1.5 = 600
        # Fuel adjustment: 400 * 0.8 = 320
        # Demand charge: 8 * 800 = 6400
        # Fixed costs: 200
        # Subtotal: 29120
        # Tax: 2329.6 -> 2329 (rounded)
        # Total: 31449 (rounded)
        
        assert result.total_before_tax == 29120.0
        assert result.tax_amount == 2329.0  # Rounded
        assert result.total_amount == 31449.0  # Rounded
        assert len(result.line_items) == 8  # All charges + tax