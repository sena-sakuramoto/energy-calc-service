"""API v1 routes."""

from fastapi import APIRouter, HTTPException
from app.core.config import settings
from app.schemas.calc import (
    PowerRequest, PowerResponse,
    EnergyRequest, EnergyResponse,
    CostRequest, CostResponse,
    DeviceUsageRequest, DeviceUsageResponse
)
from app.schemas.tariff import QuoteRequest, QuoteResponse
from app.schemas.bei import BEIRequest, BEIResponse
from app.services.energy import (
    power_from_vi, energy_from_power, cost_from_energy, aggregate_device_usage
)
from app.services.tariff import quote_bill
from app.services.bei import evaluate_bei
from app.api.v1.bei_catalog import router as bei_catalog_router
from app.api.v1.compliance import router as compliance_router

router = APIRouter()

# Health endpoint under v1
@router.get("/healthz", summary="API v1 health")
async def v1_health():
    return {"status": "ok", "service": settings.app_name, "scope": "v1"}

# Calculation endpoints
@router.post("/calc/power", response_model=PowerResponse, summary="Calculate power from voltage and current")
async def calculate_power(request: PowerRequest) -> PowerResponse:
    """
    Calculate electrical power from voltage, current, and power factor.
    Supports both single-phase and three-phase calculations.
    """
    try:
        return power_from_vi(request)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Power calculation error: {str(e)}")


@router.post("/calc/energy", response_model=EnergyResponse, summary="Calculate energy from power and time")
async def calculate_energy(request: EnergyRequest) -> EnergyResponse:
    """
    Calculate energy consumption from power and duration.
    Accepts power in watts or kilowatts.
    """
    try:
        return energy_from_power(request)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Energy calculation error: {str(e)}")


@router.post("/calc/cost", response_model=CostResponse, summary="Calculate cost from energy consumption")
async def calculate_cost(request: CostRequest) -> CostResponse:
    """
    Calculate cost from energy consumption and tariff rate.
    Includes fixed costs and tax calculation.
    """
    try:
        return cost_from_energy(request)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Cost calculation error: {str(e)}")


@router.post("/calc/device-usage", response_model=DeviceUsageResponse, summary="Aggregate device energy usage")
async def calculate_device_usage(request: DeviceUsageRequest) -> DeviceUsageResponse:
    """
    Aggregate energy usage from multiple devices.
    Returns total consumption and individual device breakdowns.
    """
    try:
        return aggregate_device_usage(request)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Device usage calculation error: {str(e)}")


# Tariff endpoints
@router.post("/tariffs/quote", response_model=QuoteResponse, summary="Generate tariff quote")
async def generate_quote(request: QuoteRequest) -> QuoteResponse:
    """
    Generate a detailed bill quote based on tariff structure and usage.
    Supports flat, tiered, and time-of-use tariffs with various charges.
    """
    try:
        return quote_bill(request)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Quote generation error: {str(e)}")


# BEI endpoints
@router.post("/bei/evaluate", response_model=BEIResponse, summary="Evaluate Building Energy Index")
async def evaluate_building_bei(request: BEIRequest) -> BEIResponse:
    """
    Evaluate Building Energy Index (BEI) for single or mixed-use buildings.
    Calculates design vs. standard primary energy consumption.
    """
    try:
        return evaluate_bei(request)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"BEI evaluation error: {str(e)}")


# Include BEI catalog routes
router.include_router(bei_catalog_router, prefix="/bei/catalog", tags=["BEI Catalog"])

# Compliance (official calc) routes
router.include_router(compliance_router, prefix="/compliance", tags=["Compliance"]) 
