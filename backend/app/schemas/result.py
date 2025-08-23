# backend/app/schemas/result.py
from typing import Dict, Any, Optional
from pydantic import BaseModel, Field

class EnvelopeResult(BaseModel):
    ua_value: float = Field(..., description="�O�畽�ϔM�ї���(W/m2K)")
    eta_value: Optional[float] = Field(None, description="���ϓ��˔M�擾��")
    ua_standard: float = Field(..., description="�UA�l")
    eta_standard: Optional[float] = Field(None, description="��Œl")
    conformity: bool = Field(..., description="�K��/�s�K��")

class EnergyResult(BaseModel):
    design_energy_total: float = Field(..., description="�݌v�ꎟ�G�l���M�[�����(GJ/�N)")
    standard_energy_total: float = Field(..., description="��ꎟ�G�l���M�[�����(GJ/�N)")
    bei: float = Field(..., description="BEI�l�i�݌v/��j")
    conformity: bool = Field(..., description="�K��/�s�K��")
    energy_by_use: Dict[str, float] = Field(..., description="�p�r�ʃG�l���M�[�����")
    energy_by_system: Optional[Dict[str, Any]] = Field(None, description="�ݔ��敪�ʃG�l���M�[�����")
    
class CalculationResult(BaseModel):
    envelope: EnvelopeResult
    energy: EnergyResult
    bels_rating: Optional[int] = Field(None, description="BELS���]���i1-5�j")
    zeb_level: Optional[str] = Field(None, description="ZEB���x��")
    overall_conformity: bool = Field(..., description="�����K��/�s�K��")