# backend/app/data/building_materials.py
"""
建材・建築部品の熱性能データベース
JIS A 1412-1/-2/-3 準拠の熱貫流率・日射熱取得率データ
"""

from typing import Dict, Any, List, Optional
from dataclasses import dataclass

@dataclass
class BuildingMaterial:
    """建材データクラス"""
    name: str
    category: str  # 壁、屋根、床、窓等
    u_value: float  # 熱貫流率 [W/(m²·K)]
    eta_value: Optional[float] = None  # 日射熱取得率（窓のみ）
    manufacturer: str = ""
    thickness: Optional[float] = None  # 厚さ [mm]
    description: str = ""

# 外壁用建材データベース
WALL_MATERIALS = [
    # 断熱材入り外壁
    BuildingMaterial("グラスウール断熱材16K-100mm+構造用合板", "外壁", 0.35, None, "旭ファイバーグラス", 100),
    BuildingMaterial("ロックウール断熱材24K-100mm+構造用合板", "外壁", 0.33, None, "日本ロックウール", 100),
    BuildingMaterial("押出法ポリスチレンフォーム3種-50mm+ALC", "外壁", 0.28, None, "デュポン", 50),
    BuildingMaterial("現場発泡ウレタン-100mm+RC壁", "外壁", 0.25, None, "日本ウレタン工業", 100),
    
    # 高性能外壁
    BuildingMaterial("フェノールフォーム断熱材-100mm", "外壁", 0.20, None, "旭化成建材", 100),
    BuildingMaterial("真空断熱パネル-30mm+グラスウール", "外壁", 0.15, None, "パナソニック", 30),
    BuildingMaterial("木質繊維断熱材-120mm", "外壁", 0.32, None, "シュタイコ", 120),
    
    # 一般的な外壁
    BuildingMaterial("ALC100mm（断熱材なし）", "外壁", 1.88, None, "旭化成建材", 100),
    BuildingMaterial("コンクリート200mm（断熱材なし）", "外壁", 3.49, None, "", 200),
    BuildingMaterial("木造軸組+グラスウール充填", "外壁", 0.53, None, "", 105)
]

# 屋根用建材データベース  
ROOF_MATERIALS = [
    BuildingMaterial("金属屋根+ロックウール200mm", "屋根", 0.19, None, "日本ロックウール", 200),
    BuildingMaterial("陸屋根+押出ポリスチレン100mm", "屋根", 0.28, None, "デュポン", 100),
    BuildingMaterial("瓦屋根+グラスウール200mm", "屋根", 0.20, None, "旭ファイバーグラス", 200),
    BuildingMaterial("折板屋根+現場発泡ウレタン150mm", "屋根", 0.22, None, "日本ウレタン工業", 150),
    BuildingMaterial("アスファルト防水+断熱材なし", "屋根", 3.17, None, "", 0),
    BuildingMaterial("高性能真空断熱パネル屋根", "屋根", 0.12, None, "パナソニック", 40)
]

# 床用建材データベース
FLOOR_MATERIALS = [
    BuildingMaterial("べた基礎+押出ポリスチレン50mm", "床", 0.48, None, "デュポン", 50),
    BuildingMaterial("床下断熱+グラスウール100mm", "床", 0.34, None, "旭ファイバーグラス", 100),
    BuildingMaterial("基礎外断熱+押出ポリスチレン100mm", "床", 0.24, None, "デュポン", 100),
    BuildingMaterial("土間床+断熱材なし", "床", 3.17, None, "", 0),
    BuildingMaterial("高性能基礎断熱システム", "床", 0.15, None, "カネカ", 80)
]

# 窓・開口部データベース
WINDOW_MATERIALS = [
    # 単板ガラス
    BuildingMaterial("アルミサッシ+単板ガラス6mm", "窓", 6.51, 0.88, "YKK AP", 6),
    BuildingMaterial("アルミ樹脂複合+単板ガラス6mm", "窓", 4.65, 0.88, "YKK AP", 6),
    
    # 複層ガラス（一般）
    BuildingMaterial("アルミサッシ+複層ガラス", "窓", 4.65, 0.78, "YKK AP", 12),
    BuildingMaterial("アルミ樹脂複合+複層ガラス", "窓", 3.49, 0.78, "YKK AP", 12),
    BuildingMaterial("樹脂サッシ+複層ガラス", "窓", 2.33, 0.78, "YKK AP", 12),
    
    # Low-E複層ガラス
    BuildingMaterial("アルミ樹脂複合+Low-E複層", "窓", 2.33, 0.60, "YKK AP", 16),
    BuildingMaterial("樹脂サッシ+Low-E複層", "窓", 1.74, 0.60, "YKK AP", 16),
    BuildingMaterial("木製サッシ+Low-E複層", "窓", 1.90, 0.60, "エクセルシャノン", 18),
    
    # トリプルガラス
    BuildingMaterial("樹脂サッシ+トリプルLow-E", "窓", 1.16, 0.40, "YKK AP", 32),
    BuildingMaterial("木製サッシ+トリプルLow-E", "窓", 1.05, 0.40, "エクセルシャノン", 36),
    
    # 高性能窓
    BuildingMaterial("真空ガラス窓（スペーシア）", "窓", 1.40, 0.55, "日本板硝子", 12),
    BuildingMaterial("超高性能トリプル窓", "窓", 0.80, 0.35, "ガデリウス", 44)
]

# ドア・玄関建材
DOOR_MATERIALS = [
    BuildingMaterial("アルミ玄関ドア（断熱なし）", "ドア", 4.65, None, "YKK AP"),
    BuildingMaterial("断熱玄関ドア（一般）", "ドア", 2.33, None, "YKK AP"),
    BuildingMaterial("高断熱玄関ドア", "ドア", 1.74, None, "YKK AP"),
    BuildingMaterial("木製断熱ドア", "ドア", 1.90, None, "LIXIL"),
    BuildingMaterial("超高断熱玄関ドア", "ドア", 1.16, None, "ガデリウス")
]

# 全建材データベース
ALL_MATERIALS = {
    "wall": WALL_MATERIALS,
    "roof": ROOF_MATERIALS, 
    "floor": FLOOR_MATERIALS,
    "window": WINDOW_MATERIALS,
    "door": DOOR_MATERIALS
}

def get_materials_by_category(category: str) -> List[BuildingMaterial]:
    """カテゴリ別建材リスト取得"""
    category_mapping = {
        "壁": "wall",
        "外壁": "wall", 
        "屋根": "roof",
        "床": "floor",
        "窓": "window",
        "ドア": "door",
        "扉": "door"
    }
    
    mapped_category = category_mapping.get(category, category)
    return ALL_MATERIALS.get(mapped_category, [])

def find_material_by_name(name: str) -> Optional[BuildingMaterial]:
    """建材名で検索"""
    for materials_list in ALL_MATERIALS.values():
        for material in materials_list:
            if name in material.name or material.name in name:
                return material
    return None

def get_recommended_materials(category: str, performance_level: str = "standard") -> List[BuildingMaterial]:
    """性能レベル別推奨建材取得"""
    materials = get_materials_by_category(category)
    
    if not materials:
        return []
    
    if performance_level == "high":
        # 高性能：U値が低い上位3つ
        return sorted(materials, key=lambda x: x.u_value)[:3]
    elif performance_level == "low":
        # 低性能：U値が高い下位3つ  
        return sorted(materials, key=lambda x: x.u_value, reverse=True)[:3]
    else:
        # 標準性能：中間レベル
        sorted_materials = sorted(materials, key=lambda x: x.u_value)
        mid_index = len(sorted_materials) // 2
        return sorted_materials[max(0, mid_index-1):mid_index+2]

def calculate_composite_u_value(materials: List[BuildingMaterial], thicknesses: List[float]) -> float:
    """複合建材のU値計算（熱抵抗の加算）"""
    if len(materials) != len(thicknesses):
        raise ValueError("建材数と厚さ数が一致しません")
    
    total_resistance = 0.0
    
    # 各層の熱抵抗を計算
    for material, thickness in zip(materials, thicknesses):
        if material.u_value <= 0:
            continue
        
        # 熱抵抗 = 厚さ[m] / 熱伝導率[W/mK]
        # U値 = 1 / 熱抵抗なので、熱抵抗 = 1 / U値（厚さ調整）
        layer_resistance = (thickness / 1000) / (material.u_value * (material.thickness / 1000) if material.thickness else 1)
        total_resistance += layer_resistance
    
    return 1.0 / total_resistance if total_resistance > 0 else material.u_value

# デフォルト建材推奨値
DEFAULT_MATERIALS = {
    "wall_standard": find_material_by_name("グラスウール断熱材16K-100mm"),
    "roof_standard": find_material_by_name("金属屋根+ロックウール200mm"),
    "floor_standard": find_material_by_name("床下断熱+グラスウール100mm"),
    "window_standard": find_material_by_name("樹脂サッシ+複層ガラス"),
    "door_standard": find_material_by_name("断熱玄関ドア（一般）")
}

def get_default_u_value(part_type: str, performance_level: str = "standard") -> float:
    """部位別デフォルトU値取得"""
    defaults = {
        "wall": {"high": 0.20, "standard": 0.35, "low": 1.88},
        "roof": {"high": 0.15, "standard": 0.22, "low": 3.17}, 
        "floor": {"high": 0.15, "standard": 0.34, "low": 3.17},
        "window": {"high": 0.80, "standard": 2.33, "low": 6.51},
        "door": {"high": 1.16, "standard": 2.33, "low": 4.65}
    }
    
    type_mapping = {
        "壁": "wall", "外壁": "wall",
        "屋根": "roof", "床": "floor",
        "窓": "window", "ドア": "door", "扉": "door"
    }
    
    mapped_type = type_mapping.get(part_type, part_type)
    return defaults.get(mapped_type, {}).get(performance_level, 2.0)

def get_default_eta_value(part_type: str, performance_level: str = "standard") -> Optional[float]:
    """部位別デフォルト日射熱取得率取得"""
    if part_type not in ["窓", "window"]:
        return None
    
    defaults = {
        "high": 0.35,    # 高性能（日射遮蔽重視）
        "standard": 0.60, # 標準
        "low": 0.88      # 低性能（単板ガラス）
    }
    
    return defaults.get(performance_level, 0.60)