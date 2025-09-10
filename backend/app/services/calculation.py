# backend/app/services/calculation.py
from typing import Dict, Any
from app.schemas.calculation import CalculationInput, CalculationResult, EnvelopeResult, PrimaryEnergyResult

def get_climate_zone_standards(climate_zone: int) -> Dict[str, Any]:
    """地域区分による基準値取得（国土交通省告示準拠）"""
    from app.data.building_standards import ClimateZone, get_envelope_standard
    
    try:
        climate_enum = ClimateZone(climate_zone)
    except ValueError:
        climate_enum = ClimateZone.ZONE_6
    
    envelope_standard = get_envelope_standard(climate_enum)
    
    return {
        "ua_threshold": envelope_standard["ua_threshold"],
        "eta_a_threshold": envelope_standard["eta_a_threshold"],
        "region_name": f"{climate_zone}地域"
    }

def calculate_envelope_performance(envelope_parts, standards) -> EnvelopeResult:
    """外皮性能計算"""
    total_area = sum(part.area for part in envelope_parts)
    
    # UA値計算（外皮平均熱貫流率）
    ua_numerator = sum(part.area * part.u_value for part in envelope_parts)
    ua_value = ua_numerator / total_area if total_area > 0 else 0.0
    
    # ηA値計算（平均日射熱取得率）- 開口部のみ
    opening_parts = [part for part in envelope_parts if hasattr(part, 'eta_value') and part.eta_value is not None]
    if opening_parts:
        eta_numerator = sum(part.area * part.eta_value for part in opening_parts)
        opening_area = sum(part.area for part in opening_parts)
        eta_a_value = eta_numerator / opening_area if opening_area > 0 else 0.0
    else:
        eta_a_value = 0.0
    
    # 基準値との比較
    ua_threshold = standards.get("ua_threshold", 0.87)
    eta_a_threshold = standards.get("eta_a_threshold")
    
    is_ua_compliant = ua_value <= ua_threshold
    is_eta_a_compliant = eta_a_threshold is None or eta_a_value <= eta_a_threshold
    
    return EnvelopeResult(
        ua_value=round(ua_value, 3),
        eta_a_value=round(eta_a_value, 3) if eta_a_value > 0 else None,
        is_ua_compliant=is_ua_compliant,
        is_eta_a_compliant=is_eta_a_compliant,
    )

def calculate_primary_energy(systems, building_type: str, total_floor_area: float) -> PrimaryEnergyResult:
    """一次エネルギー消費量計算"""
    # 建物用途別基準エネルギー消費量原単位 [MJ/㎡年]
    standard_unit_consumption = {
        "office": 1500,      # 事務所
        "residential": 1200, # 住宅
        "retail": 1800,      # 店舗
        "hotel": 2000,       # ホテル
        "hospital": 2200,    # 病院
        "school": 800,       # 学校
    }
    
    base_standard = standard_unit_consumption.get(building_type, 1500)
    
    # 各用途のエネルギー消費量計算（簡略化）
    heating_energy = calculate_heating_energy(systems.heating, total_floor_area)
    cooling_energy = calculate_cooling_energy(systems.cooling, total_floor_area) 
    ventilation_energy = calculate_ventilation_energy(systems.ventilation, total_floor_area)
    hot_water_energy = calculate_hot_water_energy(systems.hot_water, total_floor_area)
    lighting_energy = calculate_lighting_energy(systems.lighting, total_floor_area)
    
    total_energy = heating_energy + cooling_energy + ventilation_energy + hot_water_energy + lighting_energy
    standard_energy = base_standard * total_floor_area
    
    energy_saving_rate = ((standard_energy - total_energy) / standard_energy * 100) if standard_energy > 0 else 0
    is_compliant = total_energy <= standard_energy
    
    return PrimaryEnergyResult(
        total_energy_consumption=round(total_energy, 1),
        standard_energy_consumption=round(standard_energy, 1),
        energy_saving_rate=round(energy_saving_rate, 1),
        is_energy_compliant=is_compliant,
        energy_by_use={
            "heating": round(heating_energy, 1),
            "cooling": round(cooling_energy, 1), 
            "ventilation": round(ventilation_energy, 1),
            "hot_water": round(hot_water_energy, 1),
            "lighting": round(lighting_energy, 1),
        }
    )

# 個別設備のエネルギー計算関数群
def calculate_heating_energy(heating_system, floor_area: float) -> float:
    """暖房エネルギー計算"""
    base_load = floor_area * 80  # 基準暖房負荷 [MJ/㎡年]
    efficiency_factor = 1.0 / heating_system.efficiency if heating_system.efficiency > 0 else 1.0
    return base_load * efficiency_factor

def calculate_cooling_energy(cooling_system, floor_area: float) -> float:
    """冷房エネルギー計算"""
    base_load = floor_area * 60  # 基準冷房負荷 [MJ/㎡年]
    efficiency_factor = 1.0 / cooling_system.efficiency if cooling_system.efficiency > 0 else 1.0
    return base_load * efficiency_factor

def calculate_ventilation_energy(ventilation_system, floor_area: float) -> float:
    """換気エネルギー計算"""
    return ventilation_system.power_consumption * floor_area * 0.1  # 簡略化

def calculate_hot_water_energy(hot_water_system, floor_area: float) -> float:
    """給湯エネルギー計算"""
    base_load = floor_area * 100  # 基準給湯負荷 [MJ/㎡年]
    efficiency_factor = 1.0 / hot_water_system.efficiency if hot_water_system.efficiency > 0 else 1.0
    return base_load * efficiency_factor

def calculate_lighting_energy(lighting_system, floor_area: float) -> float:
    """照明エネルギー計算"""
    return lighting_system.power_density * floor_area * 24 * 365 * 3.6 / 1000000  # W/㎡ → MJ/年

def perform_energy_calculation(input_data: CalculationInput) -> CalculationResult:
    """建築物省エネ法に基づくエネルギー計算（モデル建物法対応）"""
    from app.services.model_building import get_model_building_standards, calculate_actual_energy_consumption
    
    # 建物情報
    building_type = input_data.building.building_type
    total_floor_area = input_data.building.total_floor_area
    climate_zone = input_data.building.climate_zone
    
    # 地域区分による外皮基準値設定
    standards = get_climate_zone_standards(climate_zone)
    
    print(f"計算開始: {building_type}, 床面積: {total_floor_area}㎡, 地域区分: {climate_zone}")

    # 外皮性能計算
    envelope_result = calculate_envelope_performance(input_data.envelope.parts, standards)
    
    # モデル建物法による基準一次エネルギー消費量計算
    model_building_standards = get_model_building_standards(
        building_type, climate_zone, total_floor_area
    )
    
    # 実際の一次エネルギー消費量計算（設備仕様に基づく詳細計算）
    actual_energy = calculate_actual_energy_consumption(
        input_data.systems, building_type, climate_zone, total_floor_area
    )
    
    # 省エネ率計算
    standard_energy = model_building_standards["total_standard_energy"]
    actual_total_energy = actual_energy["total_actual_energy"]
    energy_saving_rate = ((standard_energy - actual_total_energy) / standard_energy * 100) if standard_energy > 0 else 0
    is_energy_compliant = actual_total_energy <= standard_energy
    
    # 結果作成
    primary_energy_result = PrimaryEnergyResult(
        total_energy_consumption=round(actual_total_energy, 1),
        standard_energy_consumption=round(standard_energy, 1),
        energy_saving_rate=round(energy_saving_rate, 1),
        is_energy_compliant=is_energy_compliant,
        energy_by_use={k: round(v, 1) for k, v in actual_energy["actual_energy_by_use"].items()},
        standard_energy_by_use=model_building_standards.get("standard_energy_by_use")
    )
    
    # 総合判定
    overall_compliance = (
        envelope_result.is_ua_compliant and 
        envelope_result.is_eta_a_compliant and 
        primary_energy_result.is_energy_compliant
    )
    
    # 結果メッセージ生成
    message_parts = []
    if not envelope_result.is_ua_compliant:
        message_parts.append(f"UA値基準不適合 ({envelope_result.ua_value} > {standards['ua_threshold']})")
    if not envelope_result.is_eta_a_compliant and standards.get('eta_a_threshold'):
        message_parts.append(f"ηA値基準不適合 ({envelope_result.eta_a_value} > {standards['eta_a_threshold']})")
    if not primary_energy_result.is_energy_compliant:
        message_parts.append(f"一次エネルギー基準不適合 (省エネ率: {energy_saving_rate:.1f}%)")
        
    if overall_compliance:
        message = f"省エネ基準適合 ({standards['region_name']}, 省エネ率: {energy_saving_rate:.1f}%)"
    else:
        message = f"省エネ基準不適合: {', '.join(message_parts)}"
    
    print(f"計算完了: {message}")
    
    return CalculationResult(
        envelope_result=envelope_result,
        primary_energy_result=primary_energy_result,
        overall_compliance=overall_compliance,
        message=message,
    )
