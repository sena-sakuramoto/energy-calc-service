"""BEI catalog API endpoints."""

from fastapi import APIRouter, HTTPException
from app.schemas.bei import (
    CatalogUsesResponse, CatalogZonesResponse, CatalogIntensityResponse,
    CatalogValidateRequest, CatalogValidateResponse
)
from app.services.bei import (
    get_catalog_uses, get_catalog_zones, get_catalog_intensity, validate_catalog
)

router = APIRouter()


@router.get("/uses", response_model=CatalogUsesResponse, summary="Get available building use types")
async def list_catalog_uses() -> CatalogUsesResponse:
    """
    Get list of available building use types from the standard intensity catalog.
    """
    try:
        return get_catalog_uses()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving catalog uses: {str(e)}")


@router.get("/uses/{use}/zones", response_model=CatalogZonesResponse, summary="Get available climate zones")
async def list_catalog_zones(use: str) -> CatalogZonesResponse:
    """
    Get list of available climate zones for a specific building use type.
    """
    try:
        return get_catalog_zones(use)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving catalog zones: {str(e)}")


@router.get("/uses/{use}/zones/{zone}", response_model=CatalogIntensityResponse, 
           summary="Get standard intensity data")
async def get_catalog_standard_intensity(use: str, zone: str) -> CatalogIntensityResponse:
    """
    Get standard intensity data for a specific building use type and climate zone.
    Returns energy intensities by category (lighting, cooling, heating, etc.).
    """
    try:
        return get_catalog_intensity(use, zone)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving catalog intensity: {str(e)}")


@router.post("/validate", response_model=CatalogValidateResponse, summary="Validate catalog consistency")
async def validate_catalog_data(request: CatalogValidateRequest) -> CatalogValidateResponse:
    """
    Validate YAML catalog for completeness and consistency.
    Checks for missing categories, total calculation mismatches, and structural issues.
    """
    try:
        return validate_catalog(request)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Catalog validation error: {str(e)}")