# backend/app/services/model_building.py
"""
建築物省エネ法 モデル建物法（標準入力法）実装
"""
from typing import Dict, Any, Optional
import math

def get_model_building_standards(building_type: str, climate_zone: int, total_floor_area: float) -> Dict[str, Any]:
    """モデル建物法による基準一次エネルギー消費量算出"""
    
    # 建物用途別基準エネルギー消費量原単位 [MJ/㎡年]（最新基準）
    base_energy_intensity = {
        "office": {
            "heating": 100, "cooling": 80, "ventilation": 50, "hot_water": 20, "lighting": 120, "elevator": 30
        },
        "residential": {
            "heating": 150, "cooling": 60, "ventilation": 20, "hot_water": 180, "lighting": 80
        },
        "retail": {
            "heating": 120, "cooling": 100, "ventilation": 40, "hot_water": 30, "lighting": 200
        },
        "hotel": {
            "heating": 180, "cooling": 120, "ventilation": 60, "hot_water": 250, "lighting": 150
        },
        "hospital": {
            "heating": 200, "cooling": 140, "ventilation": 80, "hot_water": 200, "lighting": 180
        },
        "school": {
            "heating": 80, "cooling": 40, "ventilation": 30, "hot_water": 10, "lighting": 100
        }
    }
    
    # 地域係数（暖冷房負荷の地域補正）
    climate_factors = {
        1: {"heating": 1.8, "cooling": 0.6},
        2: {"heating": 1.6, "cooling": 0.7}, 
        3: {"heating": 1.4, "cooling": 0.8},
        4: {"heating": 1.2, "cooling": 0.9},
        5: {"heating": 1.0, "cooling": 1.0},
        6: {"heating": 0.8, "cooling": 1.1},
        7: {"heating": 0.6, "cooling": 1.2},
        8: {"heating": 0.4, "cooling": 1.3}
    }
    
    base_intensity = base_energy_intensity.get(building_type, base_energy_intensity["office"])
    climate_factor = climate_factors.get(climate_zone, climate_factors[5])
    
    # 規模係数（延べ床面積による補正）
    area_factor = calculate_area_factor(building_type, total_floor_area)
    
    # 各用途別基準エネルギー消費量計算
    standard_energy = {}
    total_standard = 0
    
    for use, base_value in base_intensity.items():
        if use in ["heating", "cooling"]:
            # 暖冷房は地域係数適用
            adjusted_value = base_value * climate_factor[use] * area_factor
        else:
            # その他は規模係数のみ
            adjusted_value = base_value * area_factor
        
        standard_energy[use] = adjusted_value * total_floor_area
        total_standard += standard_energy[use]
    
    return {
        "standard_energy_by_use": standard_energy,
        "total_standard_energy": total_standard,
        "area_factor": area_factor,
        "climate_factor": climate_factor,
        "building_type": building_type
    }

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
    """詳細暖房エネルギー計算"""
    # 地域別暖房デグリデー（簡略化）
    heating_degree_days = {1: 4500, 2: 4000, 3: 3500, 4: 3000, 5: 2500, 6: 2000, 7: 1500, 8: 1000}
    dd = heating_degree_days.get(climate_zone, 2500)
    
    # 暖房負荷計算（W）= 床面積 × 単位負荷
    base_load_per_area = 40  # W/㎡（標準値）
    total_load = floor_area * base_load_per_area
    
    # 年間暖房時間（時間）
    annual_hours = dd / 18  # デグリデーから運転時間換算
    
    # 実際のCOP（成績係数）
    actual_cop = heating_system.efficiency if heating_system.efficiency > 0 else 3.0
    
    # 年間暖房エネルギー消費量（MJ）
    annual_energy = (total_load * annual_hours * 3.6) / (1000 * actual_cop)
    
    return annual_energy

def calculate_detailed_cooling_energy(cooling_system, climate_zone: int, floor_area: float) -> float:
    """詳細冷房エネルギー計算"""
    # 地域別冷房デグリデー（簡略化）
    cooling_degree_days = {1: 300, 2: 400, 3: 500, 4: 600, 5: 700, 6: 800, 7: 900, 8: 1000}
    dd = cooling_degree_days.get(climate_zone, 700)
    
    # 冷房負荷計算
    base_load_per_area = 60  # W/㎡
    total_load = floor_area * base_load_per_area
    
    # 年間冷房時間
    annual_hours = dd / 12
    
    # 実際のCOP
    actual_cop = cooling_system.efficiency if cooling_system.efficiency > 0 else 3.5
    
    # 年間冷房エネルギー消費量
    annual_energy = (total_load * annual_hours * 3.6) / (1000 * actual_cop)
    
    return annual_energy

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
    """詳細給湯エネルギー計算"""
    # 建物用途別給湯負荷原単位（L/㎡日）
    hot_water_load_per_area = {
        "office": 5, "residential": 40, "retail": 8, "hotel": 80, "hospital": 60, "school": 3
    }
    
    daily_load = hot_water_load_per_area.get(building_type, 5) * floor_area  # L/日
    
    # 年間給湯負荷（MJ/年）
    # 水温上昇：40K、水の比熱：4.18kJ/kg・K
    annual_thermal_load = daily_load * 365 * 40 * 4.18 / 1000  # MJ/年
    
    # 給湯機器効率
    efficiency = hot_water_system.efficiency if hot_water_system.efficiency > 0 else 0.8
    
    # 年間給湯エネルギー消費量（MJ）
    annual_energy = annual_thermal_load / efficiency
    
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