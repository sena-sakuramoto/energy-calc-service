"""Residential envelope verification schemas."""

from typing import List, Literal, Optional

from pydantic import BaseModel, Field


PartType = Literal["wall", "window", "door", "roof", "ceiling", "floor", "foundation"]
OrientationType = Literal["N", "NE", "E", "SE", "S", "SW", "W", "NW", "TOP", "BOTTOM"]


class ResidentialEnvelopePart(BaseModel):
    """Envelope part for UA/eta verification."""

    type: PartType
    orientation: OrientationType = "N"
    area: float = Field(0.0, ge=0)
    u_value: float = Field(0.0, ge=0)
    h_value: float = Field(1.0, ge=0)
    eta_d_H: Optional[float] = Field(None, ge=0)
    eta_d_C: Optional[float] = Field(None, ge=0)
    psi_value: Optional[float] = Field(None, ge=0)
    length: Optional[float] = Field(None, ge=0)
    adjacency: Optional[str] = None
    sash_type: Optional[str] = None
    glass_type: Optional[str] = None


class ResidentialFrontResult(BaseModel):
    """Front-end calculation snapshot used for comparison."""

    ua_value: float = Field(..., ge=0)
    eta_a_c: float = Field(..., ge=0)


class ResidentialVerifyRequest(BaseModel):
    """Request payload for /residential/verify."""

    region: int = Field(6, ge=1, le=8)
    a_env: float = Field(..., gt=0)
    a_a: float = Field(..., gt=0)
    parts: List[ResidentialEnvelopePart] = Field(default_factory=list)
    front_result: Optional[ResidentialFrontResult] = None
    project_name: Optional[str] = None
    description: Optional[str] = None


class ResidentialBackendResult(BaseModel):
    """Backend mirror-calculation results."""

    ua_value: float = Field(..., ge=0)
    eta_a_c: float = Field(..., ge=0)


class ResidentialComparison(BaseModel):
    """Comparison flags between front and backend."""

    ua_match: bool
    eta_a_c_match: bool
    ua_diff: float
    eta_a_c_diff: float


class ResidentialOfficialResult(BaseModel):
    """Official API envelope result summary."""

    ua: float = Field(..., ge=0)
    ua_standard: Optional[float] = Field(None, ge=0)
    eta_a_c: float = Field(..., ge=0)
    eta_a_c_standard: Optional[float] = Field(None, ge=0)
    eta_a_h: Optional[float] = Field(None, ge=0)
    total_area: Optional[float] = Field(None, ge=0)


class ResidentialOfficialComparison(BaseModel):
    """Comparison between backend mirror and official API."""

    ua_match: bool
    eta_a_c_match: bool
    ua_diff: float
    eta_a_c_diff: float


class ResidentialVerifyResponse(BaseModel):
    """Response for residential verification endpoint."""

    backend_result: ResidentialBackendResult
    comparison: ResidentialComparison
    official_result: Optional[ResidentialOfficialResult] = None
    official_comparison: Optional[ResidentialOfficialComparison] = None
    official_error: Optional[str] = None
    message: str
