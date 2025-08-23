# backend/app/schemas/building.py
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

# 建物基本情報
class Building(BaseModel):
    building_type: str = Field(..., description="建物種別（住宅/非住宅）")
    total_floor_area: float = Field(..., description="延床面積(m2)")
    climate_zone: int = Field(..., description="地域区分（1-8）")
    num_stories: int = Field(..., description="階数")
    has_central_heat_source: bool = Field(False, description="集中熱源有無（非住宅のみ）")

# 外皮部位データ
class EnvelopePart(BaseModel):
    part_name: str = Field(..., description="部位名称")
    part_type: str = Field(..., description="部位種別（壁/屋根/窓など）")
    area: float = Field(..., description="面積(m2)")
    u_value: float = Field(..., description="熱貫流率(W/m2K)")
    eta_value: Optional[float] = Field(None, description="日射熱取得率（窓のみ）")
    psi_value: Optional[float] = Field(None, description="線熱貫流率（熱橋）")
    length: Optional[float] = Field(None, description="長さ（熱橋）")

# 外皮全体データ
class Envelope(BaseModel):
    parts: List[EnvelopePart] = Field(..., description="外皮部位リスト")

# 設備システム（暖房）
class HeatingSystem(BaseModel):
    system_type: str = Field(..., description="暖房種別")
    rated_capacity: Optional[float] = Field(None, description="定格能力(kW)")
    efficiency: float = Field(..., description="効率（COP等）")
    control_method: Optional[str] = Field(None, description="制御方式")
    area_served: Optional[float] = Field(None, description="対象床面積(m2)")

# 設備システム（冷房）
class CoolingSystem(BaseModel):
    system_type: str = Field(..., description="冷房種別")
    rated_capacity: Optional[float] = Field(None, description="定格能力(kW)")
    efficiency: float = Field(..., description="効率（COP等）")
    control_method: Optional[str] = Field(None, description="制御方式")
    area_served: Optional[float] = Field(None, description="対象床面積(m2)")

# 設備システム（換気）
class VentilationSystem(BaseModel):
    system_type: str = Field(..., description="換気種別")
    air_volume: float = Field(..., description="風量(m3/h)")
    power_consumption: float = Field(..., description="消費電力(W)")
    heat_exchange_efficiency: Optional[float] = Field(None, description="熱交換効率")

# 設備システム（給湯）
class HotWaterSystem(BaseModel):
    system_type: str = Field(..., description="給湯器種別")
    efficiency: float = Field(..., description="効率")
    rated_capacity: Optional[float] = Field(None, description="定格能力")
    load: Optional[float] = Field(None, description="給湯負荷")

# 設備システム（照明）
class LightingSystem(BaseModel):
    system_type: str = Field(..., description="照明種別")
    power_density: float = Field(..., description="照明密度(W/m2)")
    control_method: Optional[str] = Field(None, description="制御方式")

# 設備システム全体
class Systems(BaseModel):
    heating: Optional[HeatingSystem] = None
    cooling: Optional[CoolingSystem] = None
    ventilation: Optional[VentilationSystem] = None
    hot_water: Optional[HotWaterSystem] = None
    lighting: Optional[LightingSystem] = None
    renewable_energy: Optional[Dict[str, Any]] = None

# 計算入力データ全体
class CalculationInput(BaseModel):
    building: Building
    envelope: Envelope
    systems: Systems