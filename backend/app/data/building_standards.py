# backend/app/data/building_standards.py
"""
建築物省エネ法 モデル建物法 公式基準データ
国土交通省告示に基づく標準エネルギー消費量原単位
"""

from typing import Dict, Any, Optional
from enum import Enum

class BuildingType(Enum):
    """建物用途区分 (国土交通省告示準拠)"""
    OFFICE = "事務所等"
    HOTEL = "ホテル等"
    HOSPITAL = "病院等"
    SHOP_DEPARTMENT = "百貨店等"
    SHOP_SUPERMARKET = "スーパーマーケット"
    SCHOOL_SMALL = "学校等（小中学校）"
    SCHOOL_HIGH = "学校等（高等学校）"
    SCHOOL_UNIVERSITY = "学校等（大学）"
    RESTAURANT = "飲食店等"
    ASSEMBLY = "集会所等"
    FACTORY = "工場等"
    RESIDENTIAL_COLLECTIVE = "共同住宅"

class ClimateZone(Enum):
    """地域区分 (建築物省エネ法)"""
    ZONE_1 = 1  # 北海道（旭川、帯広等）
    ZONE_2 = 2  # 北海道（札幌、函館等）、青森、岩手等
    ZONE_3 = 3  # 宮城、山形、福島、栃木、新潟等
    ZONE_4 = 4  # 茨城、群馬、埼玉、千葉、東京、神奈川等
    ZONE_5 = 5  # 新潟、富山、石川、長野、岐阜等
    ZONE_6 = 6  # 愛知、三重、滋賀、京都、大阪、兵庫等
    ZONE_7 = 7  # 奈良、和歌山、鳥取、島根、岡山等
    ZONE_8 = 8  # 沖縄県

# 建物用途別基準エネルギー消費量原単位 [MJ/m²年]
# 国土交通省告示第1396号（平成28年1月29日）に基づく
STANDARD_ENERGY_CONSUMPTION = {
    BuildingType.OFFICE: {
        "heating": 38.0,        # 暖房
        "cooling": 38.0,        # 冷房  
        "ventilation": 28.0,    # 機械換気
        "hot_water": 3.0,       # 給湯
        "lighting": 70.0,       # 照明
        "elevator": 14.0,       # 昇降機
        "total": 191.0
    },
    BuildingType.HOTEL: {
        "heating": 54.0,
        "cooling": 54.0,
        "ventilation": 28.0,
        "hot_water": 176.0,
        "lighting": 70.0,
        "elevator": 14.0,
        "total": 396.0
    },
    BuildingType.HOSPITAL: {
        "heating": 72.0,
        "cooling": 72.0,
        "ventilation": 89.0,
        "hot_water": 176.0,
        "lighting": 98.0,
        "elevator": 14.0,
        "total": 521.0
    },
    BuildingType.SHOP_DEPARTMENT: {
        "heating": 20.0,
        "cooling": 20.0,
        "ventilation": 28.0,
        "hot_water": 3.0,
        "lighting": 126.0,
        "elevator": 14.0,
        "total": 211.0
    },
    BuildingType.SHOP_SUPERMARKET: {
        "heating": 20.0,
        "cooling": 20.0,
        "ventilation": 28.0,
        "hot_water": 3.0,
        "lighting": 140.0,
        "elevator": 14.0,
        "total": 225.0
    },
    BuildingType.SCHOOL_SMALL: {
        "heating": 58.0,
        "cooling": 23.0,
        "ventilation": 14.0,
        "hot_water": 17.0,
        "lighting": 49.0,
        "elevator": 2.0,
        "total": 163.0
    },
    BuildingType.SCHOOL_HIGH: {
        "heating": 58.0,
        "cooling": 30.0,
        "ventilation": 14.0,
        "hot_water": 17.0,
        "lighting": 49.0,
        "elevator": 2.0,
        "total": 170.0
    },
    BuildingType.SCHOOL_UNIVERSITY: {
        "heating": 43.0,
        "cooling": 30.0,
        "ventilation": 14.0,
        "hot_water": 17.0,
        "lighting": 49.0,
        "elevator": 14.0,
        "total": 167.0
    },
    BuildingType.RESTAURANT: {
        "heating": 54.0,
        "cooling": 54.0,
        "ventilation": 117.0,
        "hot_water": 105.0,
        "lighting": 105.0,
        "elevator": 14.0,
        "total": 449.0
    },
    BuildingType.ASSEMBLY: {
        "heating": 38.0,
        "cooling": 38.0,
        "ventilation": 28.0,
        "hot_water": 17.0,
        "lighting": 70.0,
        "elevator": 14.0,
        "total": 205.0
    },
    BuildingType.FACTORY: {
        "heating": 72.0,
        "cooling": 20.0,
        "ventilation": 28.0,
        "hot_water": 17.0,
        "lighting": 70.0,
        "elevator": 14.0,
        "total": 221.0
    },
    BuildingType.RESIDENTIAL_COLLECTIVE: {
        "heating": 38.0,
        "cooling": 38.0,
        "ventilation": 14.0,
        "hot_water": 105.0,
        "lighting": 42.0,
        "elevator": 14.0,
        "total": 251.0
    }
}

# 地域別補正係数 (暖房・冷房)
# 国土交通省告示に基づく地域区分別のエネルギー需要係数
REGIONAL_CORRECTION_FACTORS = {
    ClimateZone.ZONE_1: {
        "heating": 2.38,
        "cooling": 0.66
    },
    ClimateZone.ZONE_2: {
        "heating": 2.01,
        "cooling": 0.69
    },
    ClimateZone.ZONE_3: {
        "heating": 1.54,
        "cooling": 0.86
    },
    ClimateZone.ZONE_4: {
        "heating": 1.16,
        "cooling": 0.99
    },
    ClimateZone.ZONE_5: {
        "heating": 1.07,
        "cooling": 1.07
    },
    ClimateZone.ZONE_6: {
        "heating": 0.84,
        "cooling": 1.15
    },
    ClimateZone.ZONE_7: {
        "heating": 0.70,
        "cooling": 1.27
    },
    ClimateZone.ZONE_8: {
        "heating": 0.36,
        "cooling": 1.35
    }
}

# 規模係数 (延床面積による補正)
SCALE_FACTORS = {
    # 事務所等
    BuildingType.OFFICE: [
        (300, 1.00),    # 300m²未満: 1.00
        (1000, 0.95),   # 300-1000m²: 0.95
        (5000, 0.90),   # 1000-5000m²: 0.90
        (10000, 0.85),  # 5000-10000m²: 0.85
        (float('inf'), 0.80)  # 10000m²以上: 0.80
    ],
    # ホテル等
    BuildingType.HOTEL: [
        (2000, 1.00),
        (5000, 0.95),
        (10000, 0.90),
        (float('inf'), 0.85)
    ],
    # 病院等
    BuildingType.HOSPITAL: [
        (2000, 1.00),
        (5000, 0.95),
        (10000, 0.90),
        (float('inf'), 0.85)
    ],
    # 百貨店等
    BuildingType.SHOP_DEPARTMENT: [
        (1000, 1.00),
        (5000, 0.95),
        (10000, 0.90),
        (float('inf'), 0.85)
    ],
    # スーパーマーケット
    BuildingType.SHOP_SUPERMARKET: [
        (1000, 1.00),
        (5000, 0.95),
        (10000, 0.90),
        (float('inf'), 0.85)
    ],
    # 学校等（小中学校）
    BuildingType.SCHOOL_SMALL: [
        (2000, 1.00),
        (5000, 0.95),
        (float('inf'), 0.90)
    ],
    # 学校等（高等学校）
    BuildingType.SCHOOL_HIGH: [
        (3000, 1.00),
        (10000, 0.95),
        (float('inf'), 0.90)
    ],
    # 学校等（大学）
    BuildingType.SCHOOL_UNIVERSITY: [
        (3000, 1.00),
        (10000, 0.95),
        (float('inf'), 0.90)
    ],
    # 飲食店等
    BuildingType.RESTAURANT: [
        (300, 1.00),
        (1000, 0.95),
        (float('inf'), 0.90)
    ],
    # 集会所等
    BuildingType.ASSEMBLY: [
        (1000, 1.00),
        (5000, 0.95),
        (float('inf'), 0.90)
    ],
    # 工場等
    BuildingType.FACTORY: [
        (5000, 1.00),
        (20000, 0.95),
        (float('inf'), 0.90)
    ],
    # 共同住宅
    BuildingType.RESIDENTIAL_COLLECTIVE: [
        (1000, 1.00),
        (5000, 0.95),
        (float('inf'), 0.90)
    ]
}

# 外皮基準値 (UA値：外皮平均熱貫流率) [W/(m²·K)]
ENVELOPE_STANDARDS = {
    ClimateZone.ZONE_1: {
        "ua_threshold": 0.46,
        "eta_a_threshold": None  # 1,2地域は日射基準なし
    },
    ClimateZone.ZONE_2: {
        "ua_threshold": 0.46,
        "eta_a_threshold": None
    },
    ClimateZone.ZONE_3: {
        "ua_threshold": 0.56,
        "eta_a_threshold": None
    },
    ClimateZone.ZONE_4: {
        "ua_threshold": 0.75,
        "eta_a_threshold": None
    },
    ClimateZone.ZONE_5: {
        "ua_threshold": 0.87,
        "eta_a_threshold": 3.0
    },
    ClimateZone.ZONE_6: {
        "ua_threshold": 0.87,
        "eta_a_threshold": 2.8
    },
    ClimateZone.ZONE_7: {
        "ua_threshold": 0.87,
        "eta_a_threshold": 2.7
    },
    ClimateZone.ZONE_8: {
        "ua_threshold": 0.87,
        "eta_a_threshold": 6.7
    }
}

def get_standard_energy_consumption(building_type: BuildingType) -> Dict[str, float]:
    """建物用途別の基準エネルギー消費量原単位を取得"""
    return STANDARD_ENERGY_CONSUMPTION.get(building_type, STANDARD_ENERGY_CONSUMPTION[BuildingType.OFFICE])

def get_regional_correction_factor(climate_zone: ClimateZone) -> Dict[str, float]:
    """地域別補正係数を取得"""
    return REGIONAL_CORRECTION_FACTORS.get(climate_zone, REGIONAL_CORRECTION_FACTORS[ClimateZone.ZONE_6])

def get_scale_factor(building_type: BuildingType, floor_area: float) -> float:
    """延床面積による規模係数を取得"""
    scale_ranges = SCALE_FACTORS.get(building_type, SCALE_FACTORS[BuildingType.OFFICE])
    
    for threshold, factor in scale_ranges:
        if floor_area < threshold:
            return factor
    
    return scale_ranges[-1][1]  # 最大の係数を返す

def get_envelope_standard(climate_zone: ClimateZone) -> Dict[str, Optional[float]]:
    """地域区分別の外皮基準値を取得"""
    return ENVELOPE_STANDARDS.get(climate_zone, ENVELOPE_STANDARDS[ClimateZone.ZONE_6])

def calculate_standard_primary_energy(
    building_type: BuildingType, 
    climate_zone: ClimateZone, 
    floor_area: float
) -> Dict[str, float]:
    """モデル建物法による基準一次エネルギー消費量算出"""
    
    # 基準エネルギー消費量原単位取得
    base_consumption = get_standard_energy_consumption(building_type)
    
    # 地域補正係数取得
    regional_factors = get_regional_correction_factor(climate_zone)
    
    # 規模係数取得
    scale_factor = get_scale_factor(building_type, floor_area)
    
    # 用途別エネルギー消費量計算
    standard_energy = {}
    total_standard = 0.0
    
    for use_type, base_value in base_consumption.items():
        if use_type == "total":
            continue
            
        # 暖冷房は地域補正あり、その他は規模補正のみ
        if use_type in ["heating", "cooling"]:
            adjusted_value = base_value * regional_factors[use_type] * scale_factor
        else:
            adjusted_value = base_value * scale_factor
        
        # 床面積をかけて年間エネルギー消費量に変換
        annual_energy = adjusted_value * floor_area
        standard_energy[use_type] = annual_energy
        total_standard += annual_energy
    
    standard_energy["total"] = total_standard
    
    return {
        "standard_energy_by_use": standard_energy,
        "total_standard_energy": total_standard,
        "scale_factor": scale_factor,
        "regional_factors": regional_factors,
        "base_consumption": base_consumption
    }