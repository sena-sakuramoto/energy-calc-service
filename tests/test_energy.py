"""Tests for energy calculation services."""

import pytest
from app.services.energy import power_from_vi, energy_from_power, cost_from_energy, aggregate_device_usage
from app.schemas.calc import (
    PowerRequest, EnergyRequest, CostRequest, DeviceUsageRequest, DeviceUsage
)


class TestPowerCalculation:
    """Tests for power calculation."""
    
    def test_single_phase_power(self):
        """Test single-phase power calculation."""
        request = PowerRequest(
            voltage=100.0,
            current=10.0,
            power_factor=0.8,
            is_three_phase=False
        )
        result = power_from_vi(request)
        
        assert result.power_w == 800.0
        assert result.power_kw == 0.8
        assert result.is_three_phase is False
    
    def test_three_phase_power(self):
        """Test three-phase power calculation."""
        request = PowerRequest(
            voltage=200.0,
            current=10.0,
            power_factor=0.9,
            is_three_phase=True
        )
        result = power_from_vi(request)
        
        expected_power = 1.732 * 200 * 10 * 0.9  # √3 ≈ 1.732
        assert abs(result.power_w - expected_power) < 1.0
        assert abs(result.power_kw - expected_power / 1000) < 0.001
        assert result.is_three_phase is True


class TestEnergyCalculation:
    """Tests for energy calculation."""
    
    def test_energy_from_kw(self):
        """Test energy calculation from kW."""
        request = EnergyRequest(
            power_kw=5.0,
            duration_hours=10.0
        )
        result = energy_from_power(request)
        
        assert result.energy_kwh == 50.0
        assert result.power_kw == 5.0
        assert result.duration_hours == 10.0
    
    def test_energy_from_watts(self):
        """Test energy calculation from watts."""
        request = EnergyRequest(
            power_w=2000.0,
            duration_hours=5.0
        )
        result = energy_from_power(request)
        
        assert result.energy_kwh == 10.0
        assert result.power_kw == 2.0
        assert result.duration_hours == 5.0


class TestCostCalculation:
    """Tests for cost calculation."""
    
    def test_cost_with_defaults(self):
        """Test cost calculation with default tariff."""
        request = CostRequest(
            energy_kwh=100.0,
            fixed_cost=500.0,
            tax_rate=0.1
        )
        result = cost_from_energy(request)
        
        # Default tariff is 25.0 yen/kWh from settings
        expected_energy_cost = 100.0 * 25.0  # 2500
        expected_subtotal = expected_energy_cost + 500.0  # 3000
        expected_tax = expected_subtotal * 0.1  # 300
        expected_total = expected_subtotal + expected_tax  # 3300
        
        assert result.energy_cost == expected_energy_cost
        assert result.fixed_cost == 500.0
        assert result.tax_amount == expected_tax
        assert result.total_cost == expected_total
        assert result.tariff_per_kwh == 25.0
    
    def test_cost_with_custom_tariff(self):
        """Test cost calculation with custom tariff."""
        request = CostRequest(
            energy_kwh=50.0,
            tariff_per_kwh=30.0,
            fixed_cost=0.0,
            tax_rate=0.08
        )
        result = cost_from_energy(request)
        
        expected_energy_cost = 50.0 * 30.0  # 1500
        expected_tax = expected_energy_cost * 0.08  # 120
        expected_total = expected_energy_cost + expected_tax  # 1620
        
        assert result.energy_cost == expected_energy_cost
        assert result.fixed_cost == 0.0
        assert result.tax_amount == expected_tax
        assert result.total_cost == expected_total
        assert result.tariff_per_kwh == 30.0


class TestDeviceUsageAggregation:
    """Tests for device usage aggregation."""
    
    def test_single_device(self):
        """Test aggregation with single device."""
        devices = [
            DeviceUsage(
                name="LED Light",
                power_kw=0.02,
                usage_hours=12.0,
                quantity=10
            )
        ]
        request = DeviceUsageRequest(devices=devices)
        result = aggregate_device_usage(request)
        
        assert result.total_energy_kwh == 2.4  # 0.02 * 12 * 10
        assert result.total_power_kw == 0.2   # 0.02 * 10
        assert result.device_count == 10
        assert len(result.devices) == 1
        assert result.devices[0]["energy_kwh"] == 2.4
    
    def test_multiple_devices(self):
        """Test aggregation with multiple devices."""
        devices = [
            DeviceUsage(name="LED Light", power_kw=0.02, usage_hours=12.0, quantity=10),
            DeviceUsage(name="Air Conditioner", power_kw=2.5, usage_hours=8.0, quantity=2),
            DeviceUsage(name="Computer", power_kw=0.3, usage_hours=10.0, quantity=5)
        ]
        request = DeviceUsageRequest(devices=devices)
        result = aggregate_device_usage(request)
        
        # LED: 0.02 * 12 * 10 = 2.4 kWh, 0.2 kW
        # AC: 2.5 * 8 * 2 = 40 kWh, 5.0 kW  
        # Computer: 0.3 * 10 * 5 = 15 kWh, 1.5 kW
        
        assert result.total_energy_kwh == 57.4  # 2.4 + 40 + 15
        assert result.total_power_kw == 6.7     # 0.2 + 5.0 + 1.5
        assert result.device_count == 17        # 10 + 2 + 5
        assert len(result.devices) == 3