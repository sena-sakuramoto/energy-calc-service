"""Compliance calculation API endpoints."""

from fastapi import APIRouter, HTTPException
from app.schemas.compliance import CalculationInput, CalculationResult
from app.services.compliance.calculation import perform_energy_calculation


router = APIRouter()


@router.post("/calculate", response_model=CalculationResult, summary="Run official-style compliance calculation")
async def calculate_compliance(input_data: CalculationInput) -> CalculationResult:
    try:
        return perform_energy_calculation(input_data)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Calculation error: {str(e)}")

