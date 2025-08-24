# backend/app/data/equipment_database.py
"""
建築設備機器の性能データベース
JRA（日本冷凍空調工業会）準拠の効率・性能データ
"""

from typing import Dict, Any, List, Optional
from dataclasses import dataclass

@dataclass
class EquipmentData:
    """設備機器データクラス"""
    name: str
    category: str  # heating, cooling, ventilation, hot_water, lighting
    efficiency: float  # COP, 効率等
    rated_capacity: Optional[float] = None  # 定格能力 [kW]
    power_consumption: Optional[float] = None  # 消費電力 [W]
    manufacturer: str = ""
    model_year: int = 2024
    description: str = ""

# 暖房設備データベース
HEATING_EQUIPMENT = [
    # ルームエアコン（暖房）
    EquipmentData("ルームエアコン（普及品）", "heating", 3.2, 2.8, None, "各社", 2024),
    EquipmentData("ルームエアコン（省エネ型）", "heating", 4.8, 2.8, None, "ダイキン", 2024),
    EquipmentData("ルームエアコン（最高効率）", "heating", 6.7, 2.8, None, "三菱電機", 2024),
    
    # パッケージエアコン
    EquipmentData("PAC（空冷ヒートポンプ）", "heating", 3.4, 28.0, None, "ダイキン", 2024),
    EquipmentData("PAC（高効率型）", "heating", 4.2, 28.0, None, "東芝", 2024),
    EquipmentData("PAC（インバータ型）", "heating", 5.1, 28.0, None, "三菱重工", 2024),
    
    # セントラル空調
    EquipmentData("空冷ヒートポンプチラー", "heating", 3.2, 100.0, None, "ダイキン", 2024),
    EquipmentData("水冷ヒートポンプチラー", "heating", 4.5, 200.0, None, "東芝", 2024),
    EquipmentData("ガス吸収式冷温水機", "heating", 1.35, 150.0, None, "矢崎エナジーシステム", 2024),
    
    # その他暖房機器
    EquipmentData("ガスファンヒーター", "heating", 0.82, 5.0, None, "リンナイ", 2024),
    EquipmentData("石油ファンヒーター", "heating", 0.85, 4.0, None, "コロナ", 2024),
    EquipmentData("電気ヒーター", "heating", 1.0, 3.0, 3000, "各社", 2024),
    EquipmentData("床暖房（電気式）", "heating", 1.0, 4.0, 4000, "パナソニック", 2024),
    EquipmentData("床暖房（温水式）", "heating", 0.87, 5.0, None, "東京ガス", 2024)
]

# 冷房設備データベース  
COOLING_EQUIPMENT = [
    # ルームエアコン（冷房）
    EquipmentData("ルームエアコン（普及品）", "cooling", 3.0, 2.8, None, "各社", 2024),
    EquipmentData("ルームエアコン（省エネ型）", "cooling", 4.5, 2.8, None, "ダイキン", 2024),
    EquipmentData("ルームエアコン（最高効率）", "cooling", 6.3, 2.8, None, "三菱電機", 2024),
    
    # パッケージエアコン
    EquipmentData("PAC（空冷）", "cooling", 3.2, 28.0, None, "ダイキン", 2024),
    EquipmentData("PAC（高効率型）", "cooling", 4.0, 28.0, None, "東芝", 2024),
    EquipmentData("PAC（インバータ型）", "cooling", 4.8, 28.0, None, "三菱重工", 2024),
    
    # セントラル空調
    EquipmentData("空冷チラー", "cooling", 2.8, 100.0, None, "ダイキン", 2024),
    EquipmentData("水冷チラー", "cooling", 5.2, 200.0, None, "東芝", 2024),
    EquipmentData("ガス吸収式冷凍機", "cooling", 1.25, 150.0, None, "矢崎エナジーシステム", 2024),
    
    # その他冷房機器
    EquipmentData("窓用エアコン", "cooling", 2.5, 2.2, None, "各社", 2024),
    EquipmentData("スポットクーラー", "cooling", 2.0, 3.5, None, "各社", 2024)
]

# 換気設備データベース
VENTILATION_EQUIPMENT = [
    # 第1種換気（熱交換あり）
    EquipmentData("全熱交換器（高効率）", "ventilation", 0.8, None, 200, "三菱電機", 2024, "熱交換効率80%"),
    EquipmentData("全熱交換器（標準）", "ventilation", 0.7, None, 250, "パナソニック", 2024, "熱交換効率70%"),
    EquipmentData("顕熱交換器", "ventilation", 0.75, None, 300, "各社", 2024, "顕熱交換効率75%"),
    
    # 第1種換気（熱交換なし）
    EquipmentData("第1種換気（熱交換なし）", "ventilation", 0.0, None, 400, "各社", 2024),
    
    # 第2種換気
    EquipmentData("第2種換気（給気ファン）", "ventilation", 0.0, None, 350, "各社", 2024),
    
    # 第3種換気
    EquipmentData("第3種換気（排気ファン）", "ventilation", 0.0, None, 150, "各社", 2024),
    EquipmentData("DCモーターファン（省エネ型）", "ventilation", 0.0, None, 80, "パナソニック", 2024),
    
    # 自然換気
    EquipmentData("自然換気", "ventilation", 0.0, None, 0, "", 2024)
]

# 給湯設備データベース
HOT_WATER_EQUIPMENT = [
    # エコキュート（電気ヒートポンプ）
    EquipmentData("エコキュート（高効率）", "hot_water", 4.2, 4.5, None, "三菱電機", 2024),
    EquipmentData("エコキュート（標準）", "hot_water", 3.5, 4.5, None, "パナソニック", 2024),
    EquipmentData("エコキュート（普及品）", "hot_water", 2.8, 4.5, None, "各社", 2024),
    
    # エコジョーズ（ガス潜熱回収型）
    EquipmentData("エコジョーズ（高効率）", "hot_water", 0.95, 24.0, None, "リンナイ", 2024),
    EquipmentData("エコジョーズ（標準）", "hot_water", 0.87, 24.0, None, "ノーリツ", 2024),
    
    # 従来型給湯器
    EquipmentData("ガス給湯器（従来型）", "hot_water", 0.80, 24.0, None, "各社", 2024),
    EquipmentData("石油給湯器（従来型）", "hot_water", 0.85, 25.0, None, "コロナ", 2024),
    EquipmentData("電気温水器", "hot_water", 1.0, 4.5, 4500, "各社", 2024),
    
    # 太陽熱利用システム
    EquipmentData("太陽熱温水器", "hot_water", 2.0, None, 500, "各社", 2024, "太陽熱利用"),
    
    # 業務用給湯器
    EquipmentData("業務用ガス給湯器", "hot_water", 0.82, 50.0, None, "各社", 2024),
    EquipmentData("業務用電気温水器", "hot_water", 0.95, 30.0, 30000, "各社", 2024)
]

# 照明設備データベース
LIGHTING_EQUIPMENT = [
    # LED照明
    EquipmentData("LED照明（高効率）", "lighting", 150.0, None, None, "パナソニック", 2024, "150lm/W"),
    EquipmentData("LED照明（標準）", "lighting", 120.0, None, None, "東芝", 2024, "120lm/W"),
    EquipmentData("LED照明（普及品）", "lighting", 100.0, None, None, "各社", 2024, "100lm/W"),
    
    # 蛍光灯
    EquipmentData("Hf蛍光灯（高周波点灯）", "lighting", 85.0, None, None, "各社", 2024, "85lm/W"),
    EquipmentData("蛍光灯（一般型）", "lighting", 70.0, None, None, "各社", 2024, "70lm/W"),
    
    # HID照明
    EquipmentData("メタルハライドランプ", "lighting", 80.0, None, None, "各社", 2024, "80lm/W"),
    EquipmentData("高圧ナトリウムランプ", "lighting", 100.0, None, None, "各社", 2024, "100lm/W"),
    
    # 白熱灯
    EquipmentData("白熱灯", "lighting", 15.0, None, None, "各社", 2024, "15lm/W"),
    EquipmentData("ハロゲン電球", "lighting", 20.0, None, None, "各社", 2024, "20lm/W")
]

# 全設備データベース
ALL_EQUIPMENT = {
    "heating": HEATING_EQUIPMENT,
    "cooling": COOLING_EQUIPMENT,
    "ventilation": VENTILATION_EQUIPMENT,
    "hot_water": HOT_WATER_EQUIPMENT,
    "lighting": LIGHTING_EQUIPMENT
}

def get_equipment_by_category(category: str) -> List[EquipmentData]:
    """カテゴリ別設備リスト取得"""
    category_mapping = {
        "暖房": "heating",
        "冷房": "cooling", 
        "換気": "ventilation",
        "給湯": "hot_water",
        "照明": "lighting"
    }
    
    mapped_category = category_mapping.get(category, category)
    return ALL_EQUIPMENT.get(mapped_category, [])

def find_equipment_by_name(name: str) -> Optional[EquipmentData]:
    """設備機器名で検索"""
    for equipment_list in ALL_EQUIPMENT.values():
        for equipment in equipment_list:
            if name in equipment.name or equipment.name in name:
                return equipment
    return None

def get_default_efficiency(category: str, system_type: str = "") -> float:
    """設備種別のデフォルト効率取得"""
    
    # 暖房設備
    heating_defaults = {
        "ルームエアコン": 4.0,
        "パッケージエアコン": 3.8,
        "ヒートポンプ": 4.2,
        "ガス": 0.85,
        "石油": 0.85,
        "電気": 1.0
    }
    
    # 冷房設備  
    cooling_defaults = {
        "ルームエアコン": 3.8,
        "パッケージエアコン": 3.5,
        "チラー": 4.0,
        "ガス": 1.25
    }
    
    # 給湯設備
    hot_water_defaults = {
        "エコキュート": 3.5,
        "エコジョーズ": 0.87,
        "ガス": 0.80,
        "電気": 1.0,
        "石油": 0.85
    }
    
    # 照明設備（発光効率 lm/W）
    lighting_defaults = {
        "LED": 120.0,
        "蛍光灯": 75.0,
        "白熱灯": 15.0,
        "HID": 85.0
    }
    
    defaults_map = {
        "heating": heating_defaults,
        "暖房": heating_defaults,
        "cooling": cooling_defaults, 
        "冷房": cooling_defaults,
        "hot_water": hot_water_defaults,
        "給湯": hot_water_defaults,
        "lighting": lighting_defaults,
        "照明": lighting_defaults
    }
    
    category_defaults = defaults_map.get(category, {})
    
    # システムタイプでマッチング
    for key, value in category_defaults.items():
        if key in system_type:
            return value
    
    # デフォルト値
    if category in ["heating", "暖房"]:
        return 3.5
    elif category in ["cooling", "冷房"]:
        return 3.0
    elif category in ["hot_water", "給湯"]:
        return 0.85
    elif category in ["lighting", "照明"]:
        return 100.0
    else:
        return 1.0

def get_recommended_equipment(category: str, performance_level: str = "standard") -> List[EquipmentData]:
    """性能レベル別推奨設備取得"""
    equipment_list = get_equipment_by_category(category)
    
    if not equipment_list:
        return []
    
    # 効率順でソート
    sorted_equipment = sorted(equipment_list, key=lambda x: x.efficiency, reverse=True)
    
    if performance_level == "high":
        return sorted_equipment[:3]  # 高効率上位3機種
    elif performance_level == "low":
        return sorted_equipment[-3:]  # 低効率下位3機種
    else:
        # 標準：中位レベル
        mid_index = len(sorted_equipment) // 2
        return sorted_equipment[max(0, mid_index-1):mid_index+2]

# 計算用の標準効率データ（実用値）
STANDARD_EFFICIENCIES = {
    "heating": {
        "high": 5.5,      # 高効率ヒートポンプ
        "standard": 3.8,  # 標準エアコン
        "low": 1.0        # 電気ヒーター
    },
    "cooling": {
        "high": 5.0,      # 高効率チラー
        "standard": 3.5,  # 標準エアコン
        "low": 2.5        # 普及品
    },
    "hot_water": {
        "high": 4.0,      # 高効率エコキュート
        "standard": 0.85, # エコジョーズ
        "low": 0.80       # 従来型ガス
    },
    "ventilation": {
        "heat_recovery": 0.75,  # 熱交換効率
        "no_recovery": 0.0      # 熱交換なし
    }
}