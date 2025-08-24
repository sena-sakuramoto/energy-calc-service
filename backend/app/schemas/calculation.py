# backend/app/schemas/calculation.py
from pydantic import BaseModel, Field
from typing import Optional, List

# 建物情報入力スキーマ
class BuildingInput(BaseModel):
    building_type: str = Field(..., description="建物種別")
    total_floor_area: float = Field(..., description="延床面積 (m2)")
    climate_zone: int = Field(..., description="地域区分 (1-8)")
    num_stories: int = Field(..., description="階数")
    has_central_heat_source: Optional[bool] = Field(False, description="集中熱源の有無")

# 外皮部位入力スキーマ
class EnvelopePartInput(BaseModel):
    part_name: str = Field(..., description="部位名")
    part_type: str = Field(..., description="部位種別")
    area: float = Field(..., description="面積 (m2)")
    u_value: float = Field(..., description="熱貫流率 (W/m2K)")
    eta_value: Optional[float] = Field(None, description="日射熱取得率 (η値) (窓の場合)")

# 外皮情報入力スキーマ
class EnvelopeInput(BaseModel):
    parts: List[EnvelopePartInput] = Field(..., description="外皮部位のリスト")

# 設備情報入力スキーマ (暖房)
class HeatingSystemInput(BaseModel):
    system_type: str = Field(..., description="暖房種別")
    rated_capacity: Optional[float] = Field(None, description="定格能力 (kW)")
    efficiency: float = Field(..., description="効率 (COP等)")
    control_method: Optional[str] = Field(None, description="制御方式")

# 設備情報入力スキーマ (冷房)
class CoolingSystemInput(BaseModel):
    system_type: str = Field(..., description="冷房種別")
    rated_capacity: Optional[float] = Field(None, description="定格能力 (kW)")
    efficiency: float = Field(..., description="効率 (COP等)")
    control_method: Optional[str] = Field(None, description="制御方式")

# 設備情報入力スキーマ (換気)
class VentilationSystemInput(BaseModel):
    system_type: str = Field(..., description="換気種別")
    air_volume: Optional[float] = Field(None, description="風量 (m3/h)")
    power_consumption: Optional[float] = Field(None, description="消費電力 (W)")
    heat_exchange_efficiency: Optional[float] = Field(None, description="熱交換効率")

# 設備情報入力スキーマ (給湯)
class HotWaterSystemInput(BaseModel):
    system_type: str = Field(..., description="給湯種別")
    efficiency: float = Field(..., description="効率")

# 設備情報入力スキーマ (照明)
class LightingSystemInput(BaseModel):
    system_type: str = Field(..., description="照明種別")
    power_density: Optional[float] = Field(None, description="消費電力密度 (W/m2)")
    control_method: Optional[str] = Field(None, description="制御方式")

# 全体設備情報入力スキーマ
class SystemsInput(BaseModel):
    heating: HeatingSystemInput = Field(..., description="暖房設備")
    cooling: CoolingSystemInput = Field(..., description="冷房設備")
    ventilation: VentilationSystemInput = Field(..., description="換気設備")
    hot_water: HotWaterSystemInput = Field(..., description="給湯設備")
    lighting: LightingSystemInput = Field(..., description="照明設備")

# 計算全体の入力スキーマ
class CalculationInput(BaseModel):
    building: BuildingInput = Field(..., description="建物情報")
    envelope: EnvelopeInput = Field(..., description="外皮情報")
    systems: SystemsInput = Field(..., description="設備情報")

# 外皮性能計算の結果スキーマ
class EnvelopeResult(BaseModel):
    ua_value: float = Field(..., description="外皮平均熱貫流率 (UA値) (W/m2K)")
    eta_a_value: float = Field(..., description="冷房期の平均日射熱取得率 (ηA値)")
    is_ua_compliant: bool = Field(..., description="UA値が基準に適合しているか")
    is_eta_a_compliant: bool = Field(..., description="ηA値が基準に適合しているか")

# 一次エネルギー消費量計算の結果スキーマ
class PrimaryEnergyResult(BaseModel):
    total_energy_consumption: float = Field(..., description="一次エネルギー消費量合計 (MJ/年)")
    standard_energy_consumption: float = Field(..., description="基準一次エネルギー消費量 (MJ/年)")
    energy_saving_rate: float = Field(..., description="省エネ率 (%)")
    is_energy_compliant: bool = Field(..., description="一次エネルギー消費量が基準に適合しているか")
    energy_by_use: dict[str, float] = Field(..., description="用途別エネルギー消費量 (MJ)")

# 計算全体の出力スキーマ
class CalculationResult(BaseModel):
    envelope_result: EnvelopeResult = Field(..., description="外皮性能計算結果")
    primary_energy_result: PrimaryEnergyResult = Field(..., description="一次エネルギー消費量計算結果")
    overall_compliance: bool = Field(..., description="全体として省エネ基準に適合しているか")
    message: str = Field(..., description="計算結果メッセージ")