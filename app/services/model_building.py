# backend/app/services/model_building.py
"""
建築物省エネ法 モデル建物法（国土交通省告示準拠）
"""
from typing import Dict, Any, Optional
import math
from app.data.building_standards import (
    BuildingType, ClimateZone, 
    calculate_standard_primary_energy,
    get_envelope_standard
)

def get_model_building_standards(building_type: str, climate_zone: int, total_floor_area: float) -> Dict[str, Any]:
    """モデル建物法による基準一次エネルギー消費量算出（国土交通省告示準拠）"""
    
    # 建物用途マッピング
    building_type_mapping = {
        "office": BuildingType.OFFICE,
        "住宅": BuildingType.RESIDENTIAL_COLLECTIVE,
        "事務所": BuildingType.OFFICE,
        "ホテル": BuildingType.HOTEL,
        "病院": BuildingType.HOSPITAL,
        "百貨店": BuildingType.SHOP_DEPARTMENT,
        "スーパーマーケット": BuildingType.SHOP_SUPERMARKET,
        "学校": BuildingType.SCHOOL_SMALL,
        "飲食店": BuildingType.RESTAURANT,
        "集会所": BuildingType.ASSEMBLY,
        "工場": BuildingType.FACTORY,
        "共同住宅": BuildingType.RESIDENTIAL_COLLECTIVE
    }
    
    # 建物用途を正規化
    mapped_building_type = building_type_mapping.get(building_type, BuildingType.OFFICE)
    
    # 地域区分を正規化
    try:
        mapped_climate_zone = ClimateZone(climate_zone)
    except ValueError:
        mapped_climate_zone = ClimateZone.ZONE_6  # デフォルト6地域
    
    # 公式基準による計算
    result = calculate_standard_primary_energy(
        mapped_building_type, 
        mapped_climate_zone, 
        total_floor_area
    )
    
    return result

def calculate_area_factor(building_type: str, total_floor_area: float) -> float:
    """延べ床面積による規模係数計算"""
    if building_type == "residential":
        # 住宅：床面積による補正なし
        return 1.0
    else:
        # 非住宅：床面積が大きいほど効率向上
        if total_floor_area <= 300:
            return 1.0
        elif total_floor_area <= 1000:
            return 0.95
        elif total_floor_area <= 5000:
            return 0.90
        elif total_floor_area <= 10000:
            return 0.85
        else:
            return 0.80

def calculate_actual_energy_consumption(systems, building_type: str, climate_zone: int, total_floor_area: float) -> Dict[str, Any]:
    """実際のエネルギー消費量計算（設備仕様に基づく詳細計算）"""
    
    actual_energy = {}
    
    # 暖房エネルギー消費量
    if systems.heating:
        actual_energy["heating"] = calculate_detailed_heating_energy(
            systems.heating, climate_zone, total_floor_area
        )
    else:
        actual_energy["heating"] = 0
    
    # 冷房エネルギー消費量
    if systems.cooling:
        actual_energy["cooling"] = calculate_detailed_cooling_energy(
            systems.cooling, climate_zone, total_floor_area
        )
    else:
        actual_energy["cooling"] = 0
    
    # 換気エネルギー消費量
    if systems.ventilation:
        actual_energy["ventilation"] = calculate_detailed_ventilation_energy(
            systems.ventilation, total_floor_area
        )
    else:
        actual_energy["ventilation"] = 0
    
    # 給湯エネルギー消費量
    if systems.hot_water:
        actual_energy["hot_water"] = calculate_detailed_hot_water_energy(
            systems.hot_water, building_type, total_floor_area
        )
    else:
        actual_energy["hot_water"] = 0
    
    # 照明エネルギー消費量
    if systems.lighting:
        actual_energy["lighting"] = calculate_detailed_lighting_energy(
            systems.lighting, building_type, total_floor_area
        )
    else:
        actual_energy["lighting"] = 0
    
    # その他（エレベーター等）- 非住宅のみ
    if building_type != "residential":
        actual_energy["elevator"] = calculate_elevator_energy(total_floor_area)
    else:
        actual_energy["elevator"] = 0
    
    total_actual = sum(actual_energy.values())
    
    return {
        "actual_energy_by_use": actual_energy,
        "total_actual_energy": total_actual
    }

def calculate_detailed_heating_energy(heating_system, climate_zone: int, floor_area: float) -> float:
    """詳細暖房エネルギー計算（精密化）"""
    from app.data.equipment_database import get_default_efficiency
    
    # 地域別暖房デグリデー（気象庁データベース準拠）
    heating_degree_days = {
        1: 4500,  # 1地域：旭川等
        2: 4000,  # 2地域：札幌、青森等 
        3: 3500,  # 3地域：盛岡、山形等
        4: 3000,  # 4地域：仙台、新潟等
        5: 2500,  # 5地域：宇都宮、前橋等
        6: 2000,  # 6地域：東京、大阪等
        7: 1500,  # 7地域：鹿児島等
        8: 1000   # 8地域：沖縄
    }
    dd = heating_degree_days.get(climate_zone, 2000)
    
    # 建物負荷係数（建物性能による補正）
    # UA値0.5を基準とした負荷係数
    base_load_factor = 45.0  # W/㎡（高断熱基準）
    
    # 暖房負荷計算
    heating_load = floor_area * base_load_factor  # W
    
    # 年間暖房時間計算（デグリデー/基準温度差）
    base_temp_diff = 20.0  # 室内外温度差20K基準
    annual_hours = dd / base_temp_diff
    
    # 設備効率取得（システムタイプ別）
    if hasattr(heating_system, 'system_type') and heating_system.system_type:
        equipment_efficiency = get_default_efficiency("heating", heating_system.system_type)
    else:
        equipment_efficiency = 3.8  # 標準エアコンCOP
    
    # 設定効率が指定されている場合は優先
    actual_cop = heating_system.efficiency if heating_system.efficiency > 0 else equipment_efficiency
    
    # 運転効率補正（部分負荷特性）
    operational_efficiency = actual_cop * 0.85  # 実運転効率は定格の85%
    
    # 年間暖房エネルギー消費量（MJ/年）
    annual_energy_kwh = (heating_load * annual_hours) / (1000 * operational_efficiency)
    annual_energy_mj = annual_energy_kwh * 3.6
    
    return annual_energy_mj

def calculate_detailed_cooling_energy(cooling_system, climate_zone: int, floor_area: float) -> float:
    """詳細冷房エネルギー計算（精密化）"""
    from app.data.equipment_database import get_default_efficiency
    
    # 地域別冷房デグリデー（気象庁データ準拠）
    cooling_degree_days = {
        1: 83,    # 1地域：旭川等（冷房需要少）
        2: 160,   # 2地域：札幌等
        3: 297,   # 3地域：盛岡等
        4: 459,   # 4地域：仙台等
        5: 608,   # 5地域：宇都宮等
        6: 835,   # 6地域：東京等
        7: 1071,  # 7地域：鹿児島等
        8: 1385   # 8地域：沖縄（冷房需要大）
    }
    dd = cooling_degree_days.get(climate_zone, 835)
    
    # 冷房負荷係数（日射・内部発熱込み）
    base_load_factor = 80.0  # W/㎡（オフィス標準）
    
    # 冷房負荷計算
    cooling_load = floor_area * base_load_factor  # W
    
    # 年間冷房時間計算
    base_temp_diff = 15.0  # 室内外温度差15K基準
    annual_hours = dd / base_temp_diff
    
    # 設備効率取得
    if hasattr(cooling_system, 'system_type') and cooling_system.system_type:
        equipment_efficiency = get_default_efficiency("cooling", cooling_system.system_type)
    else:
        equipment_efficiency = 3.5  # 標準エアコンCOP
    
    actual_cop = cooling_system.efficiency if cooling_system.efficiency > 0 else equipment_efficiency
    
    # 運転効率補正
    operational_efficiency = actual_cop * 0.80  # 冷房は暖房より部分負荷効率が低い
    
    # 年間冷房エネルギー消費量（MJ/年）
    annual_energy_kwh = (cooling_load * annual_hours) / (1000 * operational_efficiency)
    annual_energy_mj = annual_energy_kwh * 3.6
    
    return annual_energy_mj

def calculate_detailed_ventilation_energy(ventilation_system, floor_area: float) -> float:
    """詳細換気エネルギー計算"""
    # 換気量計算（m³/h）
    air_volume = ventilation_system.air_volume if ventilation_system.air_volume else floor_area * 3.0 * 0.5
    
    # ファン消費電力（W）
    fan_power = ventilation_system.power_consumption if ventilation_system.power_consumption else air_volume * 0.15
    
    # 年間運転時間（時間）
    annual_hours = 8760  # 24時間×365日
    
    # 熱交換効率による補正
    heat_exchange_eff = ventilation_system.heat_exchange_efficiency if ventilation_system.heat_exchange_efficiency else 0.0
    efficiency_factor = 1.0 - (heat_exchange_eff * 0.3)  # 熱交換による省エネ効果
    
    # 年間換気エネルギー消費量（MJ）
    annual_energy = fan_power * annual_hours * efficiency_factor * 3.6 / 1000
    
    return annual_energy

def calculate_detailed_hot_water_energy(hot_water_system, building_type: str, floor_area: float) -> float:
    """詳細給湯エネルギー計算（修正版）"""
    from app.data.equipment_database import get_default_efficiency
    
    # 建物用途別給湯負荷原単位（L/㎡日）- 実態に合わせて修正
    hot_water_load_per_area = {
        "office": 1.5,      # 事務所：手洗い程度
        "residential": 40,   # 住宅：風呂・台所等
        "retail": 2.0,      # 店舗：手洗い・清掃
        "hotel": 80,        # ホテル：客室風呂等
        "hospital": 30,     # 病院：医療用途
        "school": 3.0       # 学校：手洗い・清掃
    }
    
    # 建物用途マッピング
    building_mapping = {
        "事務所": "office",
        "住宅": "residential", 
        "店舗": "retail",
        "ホテル": "hotel",
        "病院": "hospital",
        "学校": "school"
    }
    
    mapped_type = building_mapping.get(building_type, building_type)
    daily_load_per_area = hot_water_load_per_area.get(mapped_type, 1.5)
    daily_load = daily_load_per_area * floor_area  # L/日
    
    # 年間給湯負荷（MJ/年）
    # 給湯温度上昇：35K（10℃→45℃）、水の比熱：4.18kJ/kg・K
    temp_rise = 35.0  # K
    water_specific_heat = 4.18  # kJ/kg・K
    annual_thermal_load = daily_load * 365 * temp_rise * water_specific_heat / 1000  # MJ/年
    
    # 給湯機器効率取得
    if hasattr(hot_water_system, 'system_type') and hot_water_system.system_type:
        equipment_efficiency = get_default_efficiency("hot_water", hot_water_system.system_type)
    else:
        equipment_efficiency = 0.85  # エコジョーズ標準効率
    
    actual_efficiency = hot_water_system.efficiency if hot_water_system.efficiency > 0 else equipment_efficiency
    
    # 配管熱損失・待機損失を考慮（実効効率）
    system_efficiency = actual_efficiency * 0.85  # システム効率補正
    
    # 年間給湯エネルギー消費量（MJ）
    annual_energy = annual_thermal_load / system_efficiency
    
    return annual_energy

def calculate_detailed_lighting_energy(lighting_system, building_type: str, floor_area: float) -> float:
    """詳細照明エネルギー計算"""
    # 照明密度（W/㎡）
    power_density = lighting_system.power_density if lighting_system.power_density else 10.0
    
    # 建物用途別年間点灯時間（時間）
    annual_lighting_hours = {
        "office": 2500, "residential": 1800, "retail": 3500, "hotel": 4000, "hospital": 8000, "school": 2000
    }
    
    hours = annual_lighting_hours.get(building_type, 2500)
    
    # 制御による補正係数
    control_factor = 1.0
    if lighting_system.control_method:
        if "人感センサー" in lighting_system.control_method:
            control_factor *= 0.8
        if "調光" in lighting_system.control_method:
            control_factor *= 0.9
    
    # 年間照明エネルギー消費量（MJ）
    annual_energy = power_density * floor_area * hours * control_factor * 3.6 / 1000
    
    return annual_energy

def calculate_elevator_energy(floor_area: float) -> float:
    """エレベーター等エネルギー計算"""
    # 床面積当たりエレベーター等エネルギー（MJ/㎡年）
    elevator_intensity = 30  # MJ/㎡年
    return elevator_intensity * floor_area