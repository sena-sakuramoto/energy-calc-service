# backend/app/schemas/result.py
from typing import Dict, Any, Optional
from pydantic import BaseModel, Field

class EnvelopeResult(BaseModel):
    ua_value: float = Field(..., description="外皮平均熱貫流率(W/m2K)")
    eta_value: Optional[float] = Field(None, description="平均日射熱取得率")
    ua_standard: float = Field(..., description="基準UA値")
    eta_standard: Optional[float] = Field(None, description="基準η値")
    conformity: bool = Field(..., description="適合/不適合")

class EnergyResult(BaseModel):
    design_energy_total: float = Field(..., description="設計一次エネルギー消費量(GJ/年)")
    standard_energy_total: float = Field(..., description="基準一次エネルギー消費量(GJ/年)")
    bei: float = Field(..., description="BEI値（設計/基準）")
    conformity: bool = Field(..., description="適合/不適合")
    energy_by_use: Dict[str, float] = Field(..., description="用途別エネルギー消費量")
    energy_by_system: Optional[Dict[str, Any]] = Field(None, description="設備区分別エネルギー消費量")
    
class CalculationResult(BaseModel):
    envelope: EnvelopeResult
    energy: EnergyResult
    bels_rating: Optional[int] = Field(None, description="BELS星評価（1-5）")
    zeb_level: Optional[str] = Field(None, description="ZEBレベル")
    overall_conformity: bool = Field(..., description="総合適合/不適合")