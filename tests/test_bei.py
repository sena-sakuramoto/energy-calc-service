"""Tests for BEI calculation services."""

import pytest
from app.services.bei import evaluate_bei, get_catalog_uses, get_catalog_zones, get_catalog_intensity
from app.schemas.bei import (
    BEIRequest, DesignEnergyCategory, UsageMix,
    CatalogValidateRequest
)


class TestBEIBasicCalculation:
    """Tests for basic BEI calculation."""
    
    def test_single_use_building(self):
        """Test BEI calculation for single-use office building."""
        design_energy = [
            DesignEnergyCategory(category="lighting", value=50.0, unit="kWh"),
            DesignEnergyCategory(category="cooling", value=100.0, unit="kWh"),
            DesignEnergyCategory(category="heating", value=30.0, unit="kWh"),
            DesignEnergyCategory(category="ventilation", value=40.0, unit="kWh"),
            DesignEnergyCategory(category="hot_water", value=10.0, unit="kWh"),
            DesignEnergyCategory(category="outlet_and_others", value=90.0, unit="kWh")
        ]
        
        request = BEIRequest(
            building_area_m2=1000.0,
            use="office",
            zone="6",
            design_energy=design_energy,
            bei_round_digits=3
        )
        
        result = evaluate_bei(request)
        
        # Design energy: (50+100+30+40+10+90) * 9.76 = 320 * 9.76 = 3123.2 MJ
        # Standard energy: 296 MJ/m²/year * 1000 m² = 296000 MJ (from catalog)
        # BEI: 3123.2 / 296000 ≈ 0.011
        
        assert result.building_area_m2 == 1000.0
        assert result.design_primary_energy_mj == 3123.2
        assert result.standard_primary_energy_mj == 296000.0
        assert result.bei == 0.011
        assert result.is_compliant is True  # BEI < 1.0
        assert "6地域" in str(result.use_info)
    
    def test_bei_with_renewable_deduction(self):
        """Test BEI calculation with renewable energy deduction."""
        design_energy = [
            DesignEnergyCategory(category="lighting", value=100.0, unit="kWh")
        ]
        
        request = BEIRequest(
            building_area_m2=100.0,
            use="office",
            zone="6",
            design_energy=design_energy,
            renewable_energy_deduction_mj=500.0,
            bei_round_digits=4
        )
        
        result = evaluate_bei(request)
        
        # Design energy: 100 * 9.76 = 976 MJ
        # After renewable deduction: 976 - 500 = 476 MJ
        # Standard energy: 296 * 100 = 29600 MJ
        # BEI: 476 / 29600 ≈ 0.0161
        
        assert result.design_primary_energy_mj == 476.0
        assert result.renewable_deduction_mj == 500.0
        assert result.bei == 0.0161
    
    def test_non_compliant_building(self):
        """Test BEI calculation for non-compliant building."""
        design_energy = [
            DesignEnergyCategory(category="lighting", value=1000.0, unit="kWh")  # Very high consumption
        ]
        
        request = BEIRequest(
            building_area_m2=100.0,
            use="office",
            zone="6",
            design_energy=design_energy,
            compliance_threshold=1.0
        )
        
        result = evaluate_bei(request)
        
        # Design energy: 1000 * 9.76 = 9760 MJ
        # Standard energy: 296 * 100 = 29600 MJ
        # BEI: 9760 / 29600 ≈ 0.330
        # Still compliant since BEI < 1.0, but let's test with higher consumption
        
        # Update with much higher consumption
        design_energy[0].value = 5000.0  # Very high
        request.design_energy = design_energy
        result = evaluate_bei(request)
        
        # Design energy: 5000 * 9.76 = 48800 MJ
        # BEI: 48800 / 29600 ≈ 1.649
        assert result.bei > 1.0
        assert result.is_compliant is False


class TestBEIMixedUseBuilding:
    """Tests for mixed-use building BEI calculation."""
    
    def test_mixed_use_with_area_share(self):
        """Test mixed-use building with area share."""
        design_energy = [
            DesignEnergyCategory(category="lighting", value=200.0, unit="kWh"),
            DesignEnergyCategory(category="cooling", value=300.0, unit="kWh")
        ]
        
        usage_mix = [
            UsageMix(use="office", zone="6", area_share=0.7),  # 70% office
            UsageMix(use="hotel", zone="6", area_share=0.3)    # 30% hotel
        ]
        
        request = BEIRequest(
            building_area_m2=2000.0,
            usage_mix=usage_mix,
            design_energy=design_energy
        )
        
        result = evaluate_bei(request)
        
        # Office: 296 MJ/m²/year * 1400 m² = 414400 MJ
        # Hotel: 500 MJ/m²/year * 600 m² = 300000 MJ
        # Total standard: 714400 MJ
        # Design: (200 + 300) * 9.76 = 4880 MJ
        # BEI: 4880 / 714400 ≈ 0.007
        
        assert result.building_area_m2 == 2000.0
        assert result.standard_primary_energy_mj == 714400.0
        assert result.design_primary_energy_mj == 4880.0
        assert isinstance(result.use_info, list)
        assert len(result.use_info) == 2
    
    def test_mixed_use_with_area_m2(self):
        """Test mixed-use building with explicit areas."""
        design_energy = [
            DesignEnergyCategory(category="lighting", value=150.0, unit="kWh")
        ]
        
        usage_mix = [
            UsageMix(use="office", zone="6", area_m2=800.0),
            UsageMix(use="hotel", zone="6", area_m2=1200.0)
        ]
        
        request = BEIRequest(
            building_area_m2=2000.0,
            usage_mix=usage_mix,
            design_energy=design_energy
        )
        
        result = evaluate_bei(request)
        
        # Office: 296 * 800 = 236800 MJ
        # Hotel: 500 * 1200 = 600000 MJ
        # Total: 836800 MJ
        # Design: 150 * 9.76 = 1464 MJ
        # BEI: 1464 / 836800 ≈ 0.002
        
        assert result.standard_primary_energy_mj == 836800.0
        assert result.design_primary_energy_mj == 1464.0


class TestBEICatalogOperations:
    """Tests for BEI catalog operations."""
    
    def test_get_catalog_uses(self):
        """Test getting available uses from catalog."""
        result = get_catalog_uses()
        
        assert len(result.uses) > 0
        assert "office" in result.uses
        assert "hotel" in result.uses
    
    def test_get_catalog_zones(self):
        """Test getting available zones for a use."""
        result = get_catalog_zones("office")
        
        assert len(result.zones) > 0
        assert "6" in result.zones
    
    def test_get_catalog_intensity(self):
        """Test getting intensity data."""
        result = get_catalog_intensity("office", "6")
        
        assert result.use == "office"
        assert result.zone == "6"
        assert result.intensities.lighting == 70
        assert result.intensities.cooling == 44
        assert result.intensities.total_MJ_per_m2_year == 296
    
    def test_get_nonexistent_catalog_data(self):
        """Test getting data for non-existent use/zone."""
        with pytest.raises(ValueError):
            get_catalog_intensity("nonexistent", "99")


class TestBEICustomUnitsAndFactors:
    """Tests for custom units and conversion factors."""
    
    def test_custom_units(self):
        """Test BEI calculation with custom units."""
        design_energy = [
            DesignEnergyCategory(category="heating", value=1000.0, unit="m3_gas"),  # Gas heating
            DesignEnergyCategory(category="lighting", value=50.0, unit="kWh"),      # Electric lighting
        ]
        
        request = BEIRequest(
            building_area_m2=500.0,
            use="office",
            zone="6",
            design_energy=design_energy
        )
        
        result = evaluate_bei(request)
        
        # Gas heating: 1000 * 45.0 (gas factor) = 45000 MJ
        # Electric lighting: 50 * 9.76 (electricity factor) = 488 MJ
        # Total design: 45488 MJ
        # Standard: 296 * 500 = 148000 MJ
        # BEI: 45488 / 148000 ≈ 0.307
        
        assert result.design_primary_energy_mj == 45488.0
        assert result.bei == pytest.approx(0.307, rel=1e-3)
    
    def test_custom_primary_factors(self):
        """Test BEI calculation with custom primary energy factors."""
        design_energy = [
            DesignEnergyCategory(category="lighting", value=100.0, unit="kWh", primary_factor=12.0)  # Custom factor
        ]
        
        request = BEIRequest(
            building_area_m2=200.0,
            use="office", 
            zone="6",
            design_energy=design_energy
        )
        
        result = evaluate_bei(request)
        
        # Design: 100 * 12.0 (custom factor) = 1200 MJ
        # Standard: 296 * 200 = 59200 MJ
        # BEI: 1200 / 59200 ≈ 0.020
        
        assert result.design_primary_energy_mj == 1200.0
        assert result.design_energy_breakdown[0]["primary_factor"] == 12.0


class TestBEILocalization:
    """UI向け文言の日本語化に関するテスト。"""

    def test_single_use_response_messages_are_japanese(self):
        request = BEIRequest(
            building_area_m2=1000.0,
            use="office",
            zone="6",
            design_energy=[DesignEnergyCategory(category="lighting", value=50.0, unit="kWh")],
        )

        result = evaluate_bei(request)

        assert "地域" in str(result.use_info)
        assert "zone" not in str(result.use_info).lower()
        assert all("Using declared total" not in note for note in result.notes)
        assert all("Calculated total from categories" not in note for note in result.notes)
