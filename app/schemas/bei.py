"""BEI (Building Energy Index) calculation schemas."""

from typing import List, Optional, Dict, Any, Union
from pydantic import BaseModel, Field


class DesignEnergyCategory(BaseModel):
    """Design energy for a specific category."""
    category: str = Field(..., description="Energy category (e.g., 'lighting', 'cooling')")
    value: float = Field(..., gt=0, description="Energy value")
    unit: Optional[str] = Field(None, description="Energy unit (auto-estimated if not provided)")
    primary_factor: Optional[float] = Field(None, description="Primary energy factor (auto-estimated if not provided)")


class UsageMix(BaseModel):
    """Usage mix for complex building types."""
    use: str = Field(..., description="Building use type (e.g., 'office', 'hotel')")
    zone: str = Field(..., description="Climate zone")
    area_share: Optional[float] = Field(None, ge=0, le=1, description="Area share ratio (0-1)")
    area_m2: Optional[float] = Field(None, gt=0, description="Area in m²")


# ── 公式入力シート用スキーマ (様式A〜I) ──────────────────────────────────


class OfficialBuildingInfo(BaseModel):
    """様式A: 基本情報"""
    sheet_date: Optional[str] = Field(None, description="シート作成月日")
    author: Optional[str] = Field(None, description="入力責任者")
    building_name: str = Field(..., description="建物名称")
    prefecture: Optional[str] = Field(None, description="都道府県")
    city: Optional[str] = Field(None, description="市区町村")
    region: str = Field(..., description="省エネ基準地域区分 (例: '6地域')")
    solar_region: Optional[str] = Field(None, description="年間日射地域区分 (例: 'A3区分')")
    total_area: Optional[float] = Field(None, description="延べ面積 [m2]")
    building_type: str = Field(..., description="建物用途 (例: '事務所モデル')")
    room_type: Optional[str] = Field(None, description="室用途 (集会所の場合のみ)")
    calc_floor_area: float = Field(..., gt=0, description="計算対象部分の床面積 [m2]")
    ac_floor_area: Optional[float] = Field(None, description="空調対象床面積 [m2]")
    floors_above: Optional[int] = Field(None, description="地上階数")
    floors_below: Optional[int] = Field(None, description="地下階数")
    total_height: Optional[float] = Field(None, description="階高の合計 [m]")
    perimeter: Optional[float] = Field(None, description="外周長さ [m]")
    non_ac_core_direction: Optional[str] = Field(None, description="非空調コア部 方位")
    non_ac_core_length: Optional[float] = Field(None, description="非空調コア部 長さ [m]")


class WindowSpec(BaseModel):
    """様式B1: 開口部仕様 (1行)"""
    name: Optional[str] = Field(None, description="建具仕様名称")
    width: Optional[float] = Field(None, description="幅 W [m]")
    height: Optional[float] = Field(None, description="高さ H [m]")
    area: Optional[float] = Field(None, description="窓面積 [m2]")
    window_type: Optional[str] = Field(None, description="建具の種類 (選択)")
    glass_type: Optional[str] = Field(None, description="ガラスの種類 (選択)")
    glass_u_value: Optional[float] = Field(None, description="ガラス熱貫流率 [W/(m2K)]")
    glass_shgc: Optional[float] = Field(None, description="ガラス日射熱取得率 [-]")
    window_u_value: Optional[float] = Field(None, description="窓熱貫流率 [W/(m2K)]")
    window_shgc: Optional[float] = Field(None, description="窓日射熱取得率 [-]")


class InsulationSpec(BaseModel):
    """様式B2: 断熱仕様 (1行)"""
    name: Optional[str] = Field(None, description="断熱仕様名称")
    part_class: Optional[str] = Field(None, description="部位種別 (外壁/屋根/外気に接する床)")
    input_method: Optional[str] = Field(None, description="断熱仕様の入力方法")
    material_category: Optional[str] = Field(None, description="断熱材種類(大分類)")
    material_detail: Optional[str] = Field(None, description="断熱材種類(小分類)")
    conductivity: Optional[float] = Field(None, description="熱伝導率 [W/(mK)]")
    thickness: Optional[float] = Field(None, description="厚み [mm]")
    u_value: Optional[float] = Field(None, description="熱貫流率 [W/(m2K)]")


class EnvelopeSpec(BaseModel):
    """様式B3: 外皮仕様 (1行) ※MODEL(300m2以上)のみ"""
    name: Optional[str] = Field(None, description="外皮名称")
    direction: Optional[str] = Field(None, description="方位")
    width: Optional[float] = Field(None, description="幅 W [m]")
    height: Optional[float] = Field(None, description="高さ H [m]")
    area: Optional[float] = Field(None, description="外皮面積 [m2]")
    insulation_name: Optional[str] = Field(None, description="断熱仕様名称 (B2から転記)")
    window_name: Optional[str] = Field(None, description="建具仕様名称 (B1から転記)")
    window_count: Optional[int] = Field(None, description="建具等個数")
    has_blind: Optional[str] = Field(None, description="ブラインドの有無 (有/無)")
    shade_coeff_cooling: Optional[float] = Field(None, description="日除け効果係数(冷房)")
    shade_coeff_heating: Optional[float] = Field(None, description="日除け効果係数(暖房)")


class HeatSourceSpec(BaseModel):
    """様式C1: 空調熱源 (1行)"""
    name: Optional[str] = Field(None, description="熱源機器名称")
    type: str = Field(..., description="熱源機種 (選択)")
    count: int = Field(1, ge=1, description="台数")
    capacity_cooling: Optional[float] = Field(None, description="定格能力 冷房 [kW/台]")
    capacity_heating: Optional[float] = Field(None, description="定格能力 暖房 [kW/台]")
    power_cooling: Optional[float] = Field(None, description="定格消費電力 冷房 [kW/台]")
    power_heating: Optional[float] = Field(None, description="定格消費電力 暖房 [kW/台]")
    fuel_cooling: Optional[float] = Field(None, description="定格燃料消費量 冷房 [kW/台]")
    fuel_heating: Optional[float] = Field(None, description="定格燃料消費量 暖房 [kW/台]")


class OutdoorAirSpec(BaseModel):
    """様式C2: 空調外気処理 (1行)"""
    name: Optional[str] = Field(None, description="送風機名称")
    count: int = Field(1, ge=1, description="台数")
    supply_airflow: Optional[float] = Field(None, description="設計給気風量 [m3/h/台]")
    exhaust_airflow: Optional[float] = Field(None, description="設計排気風量 [m3/h/台]")
    heat_exchange_eff_cooling: Optional[float] = Field(None, description="全熱交換効率 冷房 [%]")
    heat_exchange_eff_heating: Optional[float] = Field(None, description="全熱交換効率 暖房 [%]")
    auto_bypass: Optional[str] = Field(None, description="自動換気切替機能 (有/無)")
    preheat_stop: Optional[str] = Field(None, description="予熱時外気取り入れ停止 (有/無)")


class PumpSpec(BaseModel):
    """様式C3: 空調二次ポンプ (1行) ※MODEL(300m2以上)のみ"""
    name: Optional[str] = Field(None, description="二次ポンプ名称")
    count: int = Field(1, ge=1, description="台数")
    flow_rate: Optional[float] = Field(None, description="設計流量 [m3/h台]")
    variable_flow: Optional[str] = Field(None, description="変流量制御の有無 (有/無)")
    min_flow_input: Optional[str] = Field(None, description="最小流量比の入力の有無")
    min_flow_ratio: Optional[float] = Field(None, description="変流量時最小流量比 [%]")


class FanSpec(BaseModel):
    """様式C4: 空調送風機 (1行) ※MODEL(300m2以上)のみ"""
    name: Optional[str] = Field(None, description="空調送風機名称")
    count: int = Field(1, ge=1, description="台数")
    airflow: Optional[float] = Field(None, description="設計風量 [m3/h台]")
    variable_airflow: Optional[str] = Field(None, description="変風量制御の有無 (有/無)")
    min_airflow_input: Optional[str] = Field(None, description="最小風量比の入力の有無")
    min_airflow_ratio: Optional[float] = Field(None, description="変風量時最小風量比 [%]")


class VentilationSpec(BaseModel):
    """様式D: 換気 (1行)"""
    room_name: Optional[str] = Field(None, description="室名称")
    room_type: str = Field(..., description="室用途 (機械室/便所/駐車場/厨房)")
    floor_area: Optional[float] = Field(None, description="床面積 [m2]")
    method: Optional[str] = Field(None, description="換気方式 (第一種/第二種/第三種)")
    equipment_name: Optional[str] = Field(None, description="機器名称")
    count: int = Field(1, ge=1, description="台数")
    airflow: Optional[float] = Field(None, description="送風量 [m3/h台]")
    motor_power: Optional[float] = Field(None, description="電動機出力 [W/台]")
    high_eff_motor: Optional[str] = Field(None, description="高効率電動機 (有/無)")
    inverter: Optional[str] = Field(None, description="インバーター (有/無)")
    airflow_control: Optional[str] = Field(None, description="送風量制御 (有/無)")


class LightingSpec(BaseModel):
    """様式E: 照明 (1行)"""
    room_name: Optional[str] = Field(None, description="室名称")
    room_type: Optional[str] = Field(None, description="室用途 (建物用途に依存)")
    floor_area: Optional[float] = Field(None, description="床面積 [m2]")
    room_height: Optional[float] = Field(None, description="室の高さ [m]")
    fixture_name: Optional[str] = Field(None, description="照明器具名称")
    power_per_unit: Optional[float] = Field(None, description="消費電力 [W/台]")
    count: int = Field(1, ge=1, description="台数")
    occupancy_sensor: Optional[str] = Field(None, description="在室検知制御 (有/無)")
    daylight_control: Optional[str] = Field(None, description="明るさ制御 (有/無)")
    schedule_control: Optional[str] = Field(None, description="タイムスケジュール制御 (有/無)")
    initial_illuminance: Optional[str] = Field(None, description="初期照度補正機能 (有/無)")


class HotWaterSpec(BaseModel):
    """様式F: 給湯 (1行)"""
    system_name: Optional[str] = Field(None, description="給湯系統名称")
    use_type: str = Field(..., description="給湯用途 (洗面・手洗い/浴室/厨房)")
    source_name: Optional[str] = Field(None, description="熱源名称")
    count: int = Field(1, ge=1, description="台数")
    heating_capacity: Optional[float] = Field(None, description="定格加熱能力 [kW/台]")
    power_consumption: Optional[float] = Field(None, description="定格消費電力 [kW/台]")
    fuel_consumption: Optional[float] = Field(None, description="定格燃料消費量 [kW/台]")
    insulation_level: Optional[str] = Field(None, description="配管保温仕様")
    water_saving: Optional[str] = Field(None, description="節湯器具 (無/自動給湯栓/節湯B1)")


class ElevatorSpec(BaseModel):
    """様式G: 昇降機 (1行) ※MODEL(300m2以上)のみ"""
    name: Optional[str] = Field(None, description="昇降機名称")
    control_type: str = Field(..., description="速度制御方式")


class SolarPVSpec(BaseModel):
    """様式H: 太陽光発電 (1行)"""
    system_name: Optional[str] = Field(None, description="システム名称")
    cell_type: str = Field(..., description="太陽電池の種類")
    installation_mode: str = Field(..., description="アレイ設置方式")
    capacity_kw: float = Field(..., gt=0, description="アレイのシステム容量 [kW]")
    panel_direction: str = Field(..., description="パネルの設置方位角 [°]")
    panel_angle: str = Field(..., description="パネルの設置傾斜角 [°]")


class CogenerationSpec(BaseModel):
    """様式I: コージェネレーション設備 (1行) ※MODEL(300m2以上)のみ"""
    name: Optional[str] = Field(None, description="コージェネ設備名称")
    rated_output: float = Field(..., gt=0, description="定格発電出力 [kW/台]")
    count: int = Field(1, ge=1, description="台数")
    gen_eff_100: Optional[float] = Field(None, description="発電効率 負荷率100% [%]")
    gen_eff_75: Optional[float] = Field(None, description="発電効率 負荷率75% [%]")
    gen_eff_50: Optional[float] = Field(None, description="発電効率 負荷率50% [%]")
    heat_eff_100: Optional[float] = Field(None, description="排熱効率 負荷率100% [%]")
    heat_eff_75: Optional[float] = Field(None, description="排熱効率 負荷率75% [%]")
    heat_eff_50: Optional[float] = Field(None, description="排熱効率 負荷率50% [%]")
    heat_recovery_for: Optional[str] = Field(None, description="排熱利用先")


class OfficialInput(BaseModel):
    """公式入力シート全体の入力データ (様式A〜I)"""
    building: OfficialBuildingInfo
    windows: Optional[List[WindowSpec]] = Field(default_factory=list, description="様式B1: 開口部")
    insulations: Optional[List[InsulationSpec]] = Field(default_factory=list, description="様式B2: 断熱")
    envelopes: Optional[List[EnvelopeSpec]] = Field(default_factory=list, description="様式B3: 外皮")
    heat_sources: Optional[List[HeatSourceSpec]] = Field(default_factory=list, description="様式C1: 空調熱源")
    outdoor_air: Optional[List[OutdoorAirSpec]] = Field(default_factory=list, description="様式C2: 外気処理")
    pumps: Optional[List[PumpSpec]] = Field(default_factory=list, description="様式C3: ポンプ")
    fans: Optional[List[FanSpec]] = Field(default_factory=list, description="様式C4: 送風機")
    ventilations: Optional[List[VentilationSpec]] = Field(default_factory=list, description="様式D: 換気")
    lightings: Optional[List[LightingSpec]] = Field(default_factory=list, description="様式E: 照明")
    hot_waters: Optional[List[HotWaterSpec]] = Field(default_factory=list, description="様式F: 給湯")
    elevators: Optional[List[ElevatorSpec]] = Field(default_factory=list, description="様式G: 昇降機")
    solar_pvs: Optional[List[SolarPVSpec]] = Field(default_factory=list, description="様式H: 太陽光")
    cogenerations: Optional[List[CogenerationSpec]] = Field(default_factory=list, description="様式I: コージェネ")


class BEIRequest(BaseModel):
    """Request for BEI calculation."""
    # Building information
    building_area_m2: float = Field(..., gt=0, description="Building area in m²")
    use: Optional[str] = Field(None, description="Building use type (for single use)")
    zone: Optional[str] = Field(None, description="Climate zone (for single use)")

    # For complex buildings
    usage_mix: Optional[List[UsageMix]] = Field(None, description="Usage mix for complex buildings")

    # Design energy (既存の簡易計算用 — 後方互換。公式入力シート使用時は空リストでも可)
    design_energy: List[DesignEnergyCategory] = Field(default_factory=list,
                                                     description="Design energy by category")

    # Renewable energy deduction
    renewable_energy_deduction_mj: float = Field(0.0, ge=0,
                                                description="Renewable energy deduction in MJ/year")

    # Display settings
    bei_round_digits: int = Field(3, ge=0, le=10, description="Digits for BEI rounding")
    compliance_threshold: float = Field(1.0, gt=0, description="BEI compliance threshold")

    # 公式入力シート用 (様式A〜I) — 公式PDF生成時に使用
    official_input: Optional[OfficialInput] = Field(None, description="公式入力シート用データ")


class StandardIntensity(BaseModel):
    """Standard intensity data."""
    lighting: Optional[float] = None
    cooling: Optional[float] = None
    heating: Optional[float] = None
    ventilation: Optional[float] = None
    hot_water: Optional[float] = None
    outlet_and_others: Optional[float] = None
    elevator: Optional[float] = None
    total_MJ_per_m2_year: Optional[float] = None


class BEIResponse(BaseModel):
    """Response for BEI calculation."""
    # Results
    bei: float = Field(..., description="Building Energy Index")
    is_compliant: bool = Field(..., description="Whether building meets compliance threshold")
    
    # Energy values
    design_primary_energy_mj: float = Field(..., description="Design primary energy in MJ/year")
    standard_primary_energy_mj: float = Field(..., description="Standard primary energy in MJ/year")
    renewable_deduction_mj: float = Field(..., description="Renewable energy deduction in MJ/year")
    
    # Per unit area
    design_energy_per_m2: float = Field(..., description="Design energy per m² in MJ/m²/year")
    standard_energy_per_m2: float = Field(..., description="Standard energy per m² in MJ/m²/year")
    
    # Building info
    building_area_m2: float
    use_info: Union[str, List[Dict[str, Any]]] = Field(..., description="Building use information")
    
    # Calculation details
    design_energy_breakdown: List[Dict[str, Any]] = Field(..., description="Design energy by category")
    standard_intensity_source: str = Field(..., description="Source of standard intensity data")
    compliance_threshold: float
    bei_round_digits: int
    
    # Notes and warnings
    notes: List[str] = Field(default_factory=list, description="Calculation notes and warnings")


class CatalogUsesResponse(BaseModel):
    """Response for catalog uses listing."""
    uses: List[str] = Field(..., description="Available building use types")


class CatalogZonesResponse(BaseModel):
    """Response for catalog zones listing."""
    zones: List[str] = Field(..., description="Available climate zones")


class CatalogIntensityResponse(BaseModel):
    """Response for catalog intensity data."""
    use: str
    zone: str
    intensities: StandardIntensity
    notes: Optional[str] = None


class CatalogValidateRequest(BaseModel):
    """Request for catalog validation."""
    yaml_path: Optional[str] = Field(None, description="Path to YAML file to validate")
    yaml_data: Optional[Dict[str, Any]] = Field(None, description="YAML data to validate")


class ValidationIssue(BaseModel):
    """Validation issue."""
    severity: str = Field(..., description="Issue severity (error, warning)")
    message: str = Field(..., description="Issue description")
    path: Optional[str] = Field(None, description="Path in YAML where issue occurs")


class CatalogValidateResponse(BaseModel):
    """Response for catalog validation."""
    is_valid: bool = Field(..., description="Whether catalog is valid")
    issues: List[ValidationIssue] = Field(default_factory=list, description="Validation issues")
    summary: Dict[str, int] = Field(..., description="Summary of uses and zones found")