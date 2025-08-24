# backend/app/validators/building_validators.py
"""
建築物省エネ法計算のバリデーション機能
実務レベルの入力値検証・制約チェック
"""

from typing import Dict, Any, List, Optional, Tuple
from dataclasses import dataclass
from enum import Enum

@dataclass
class ValidationError:
    """バリデーションエラー情報"""
    field: str
    value: Any
    message: str
    severity: str = "error"  # error, warning, info

class ValidationSeverity(Enum):
    """バリデーション重要度"""
    ERROR = "error"      # 計算不可能
    WARNING = "warning"  # 計算可能だが注意
    INFO = "info"       # 情報提供

class BuildingValidator:
    """建築物基本情報バリデーター"""
    
    @staticmethod
    def validate_building_data(building_data: Dict[str, Any]) -> List[ValidationError]:
        """建築物基本情報の総合バリデーション"""
        errors = []
        
        # 建物種別チェック
        if not building_data.get("building_type"):
            errors.append(ValidationError(
                "building_type", None, "建物種別の指定は必須です", "error"
            ))
        else:
            building_type = building_data["building_type"]
            allowed_types = [
                "事務所", "住宅", "ホテル", "病院", "百貨店", "スーパーマーケット",
                "学校", "飲食店", "集会所", "工場", "共同住宅", "office"
            ]
            if building_type not in allowed_types:
                errors.append(ValidationError(
                    "building_type", building_type, 
                    f"対応していない建物種別です。対応種別: {', '.join(allowed_types)}", "error"
                ))
        
        # 延床面積チェック
        floor_area = building_data.get("total_floor_area", 0)
        if not floor_area or floor_area <= 0:
            errors.append(ValidationError(
                "total_floor_area", floor_area, "延床面積は正の値で入力してください", "error"
            ))
        elif floor_area < 10:
            errors.append(ValidationError(
                "total_floor_area", floor_area, "延床面積が小さすぎます（10㎡未満）", "warning"
            ))
        elif floor_area > 100000:
            errors.append(ValidationError(
                "total_floor_area", floor_area, "延床面積が大きすぎます（10万㎡超）", "warning"
            ))
        
        # 地域区分チェック
        climate_zone = building_data.get("climate_zone", 0)
        if not climate_zone or climate_zone not in range(1, 9):
            errors.append(ValidationError(
                "climate_zone", climate_zone, "地域区分は1〜8の範囲で指定してください", "error"
            ))
        
        # 階数チェック
        num_stories = building_data.get("num_stories", 0)
        if not num_stories or num_stories <= 0:
            errors.append(ValidationError(
                "num_stories", num_stories, "階数は正の整数で入力してください", "error"
            ))
        elif num_stories > 100:
            errors.append(ValidationError(
                "num_stories", num_stories, "階数が現実的ではありません（100階超）", "warning"
            ))
        
        return errors

class EnvelopeValidator:
    """外皮性能バリデーター"""
    
    @staticmethod
    def validate_envelope_parts(envelope_parts: List[Dict[str, Any]]) -> List[ValidationError]:
        """外皮部位データの総合バリデーション"""
        errors = []
        
        if not envelope_parts:
            errors.append(ValidationError(
                "envelope.parts", [], "外皮部位データが入力されていません", "error"
            ))
            return errors
        
        total_wall_area = 0
        total_roof_area = 0  
        total_floor_area = 0
        total_window_area = 0
        
        for i, part in enumerate(envelope_parts):
            part_errors = EnvelopeValidator._validate_single_part(part, i)
            errors.extend(part_errors)
            
            # 部位別面積集計
            part_type = part.get("part_type", "")
            area = part.get("area", 0)
            
            if "壁" in part_type:
                total_wall_area += area
            elif "屋根" in part_type:
                total_roof_area += area
            elif "床" in part_type:
                total_floor_area += area
            elif "窓" in part_type:
                total_window_area += area
        
        # 外皮構成バランスチェック
        balance_errors = EnvelopeValidator._validate_envelope_balance(
            total_wall_area, total_roof_area, total_floor_area, total_window_area
        )
        errors.extend(balance_errors)
        
        return errors
    
    @staticmethod
    def _validate_single_part(part: Dict[str, Any], index: int) -> List[ValidationError]:
        """個別外皮部位バリデーション"""
        errors = []
        field_prefix = f"envelope.parts.{index}"
        
        # 部位名チェック
        if not part.get("part_name"):
            errors.append(ValidationError(
                f"{field_prefix}.part_name", "", "部位名は必須です", "error"
            ))
        
        # 部位種別チェック
        part_type = part.get("part_type", "")
        allowed_types = ["壁", "屋根", "床", "窓", "ドア", "熱橋"]
        if not part_type or part_type not in allowed_types:
            errors.append(ValidationError(
                f"{field_prefix}.part_type", part_type, 
                f"無効な部位種別です。対応種別: {', '.join(allowed_types)}", "error"
            ))
        
        # 面積チェック
        area = part.get("area", 0)
        if not area or area <= 0:
            errors.append(ValidationError(
                f"{field_prefix}.area", area, "面積は正の値で入力してください", "error"
            ))
        elif area > 10000:
            errors.append(ValidationError(
                f"{field_prefix}.area", area, "面積が現実的ではありません（1万㎡超）", "warning"
            ))
        
        # 熱貫流率チェック
        u_value = part.get("u_value", 0)
        if not u_value or u_value <= 0:
            errors.append(ValidationError(
                f"{field_prefix}.u_value", u_value, "熱貫流率は正の値で入力してください", "error"
            ))
        else:
            # 部位別U値妥当性チェック
            u_errors = EnvelopeValidator._validate_u_value(part_type, u_value, field_prefix)
            errors.extend(u_errors)
        
        # 日射熱取得率チェック（窓の場合）
        if part_type == "窓":
            eta_value = part.get("eta_value")
            if eta_value is None:
                errors.append(ValidationError(
                    f"{field_prefix}.eta_value", eta_value, "窓の日射熱取得率は必須です", "error"
                ))
            elif eta_value < 0 or eta_value > 1:
                errors.append(ValidationError(
                    f"{field_prefix}.eta_value", eta_value, "日射熱取得率は0〜1の範囲で入力してください", "error"
                ))
        
        return errors
    
    @staticmethod
    def _validate_u_value(part_type: str, u_value: float, field_prefix: str) -> List[ValidationError]:
        """部位別U値妥当性チェック"""
        errors = []
        
        # 部位別現実的U値範囲
        u_value_ranges = {
            "壁": (0.1, 5.0),      # 超高断熱〜無断熱
            "屋根": (0.1, 4.0),    # 超高断熱〜無断熱  
            "床": (0.1, 4.0),      # 超高断熱〜無断熱
            "窓": (0.5, 7.0),      # トリプル〜単板ガラス
            "ドア": (0.8, 5.0),    # 高断熱〜無断熱
            "熱橋": (0.1, 2.0)     # 断熱対策済み〜未対策
        }
        
        if part_type in u_value_ranges:
            min_u, max_u = u_value_ranges[part_type]
            
            if u_value < min_u:
                errors.append(ValidationError(
                    f"{field_prefix}.u_value", u_value, 
                    f"{part_type}のU値が現実的でない高性能値です（{min_u}未満）", "warning"
                ))
            elif u_value > max_u:
                errors.append(ValidationError(
                    f"{field_prefix}.u_value", u_value,
                    f"{part_type}のU値が現実的でない低性能値です（{max_u}超）", "warning"
                ))
        
        return errors
    
    @staticmethod
    def _validate_envelope_balance(wall_area: float, roof_area: float, floor_area: float, window_area: float) -> List[ValidationError]:
        """外皮構成バランスチェック"""
        errors = []
        
        total_envelope_area = wall_area + roof_area + floor_area + window_area
        
        if total_envelope_area == 0:
            errors.append(ValidationError(
                "envelope", None, "外皮面積の合計が0です", "error"
            ))
            return errors
        
        # 窓面積率チェック
        if window_area > 0:
            window_ratio = window_area / total_envelope_area
            if window_ratio > 0.5:
                errors.append(ValidationError(
                    "envelope.window_ratio", window_ratio, 
                    f"窓面積率が高すぎます（{window_ratio:.1%}）", "warning"
                ))
        
        # 必須部位チェック
        if wall_area == 0:
            errors.append(ValidationError(
                "envelope.wall", wall_area, "外壁の入力がありません", "warning"
            ))
        
        if roof_area == 0 and floor_area == 0:
            errors.append(ValidationError(
                "envelope.roof_floor", None, "屋根または床のいずれかは必須です", "warning"
            ))
        
        return errors

class EquipmentValidator:
    """設備システムバリデーター"""
    
    @staticmethod
    def validate_systems(systems_data: Dict[str, Any]) -> List[ValidationError]:
        """設備システム総合バリデーション"""
        errors = []
        
        # 各設備系統のバリデーション
        for system_type in ["heating", "cooling", "ventilation", "hot_water", "lighting"]:
            system_data = systems_data.get(system_type)
            if system_data:
                system_errors = EquipmentValidator._validate_system(system_type, system_data)
                errors.extend(system_errors)
            else:
                errors.append(ValidationError(
                    f"systems.{system_type}", None, 
                    f"{system_type}設備の情報が入力されていません", "warning"
                ))
        
        return errors
    
    @staticmethod
    def _validate_system(system_type: str, system_data: Dict[str, Any]) -> List[ValidationError]:
        """個別設備システムバリデーション"""
        errors = []
        field_prefix = f"systems.{system_type}"
        
        # システム種別チェック
        if not system_data.get("system_type"):
            errors.append(ValidationError(
                f"{field_prefix}.system_type", "", "設備種別は必須です", "error"
            ))
        
        # 効率チェック
        efficiency = system_data.get("efficiency", 0)
        if not efficiency or efficiency <= 0:
            errors.append(ValidationError(
                f"{field_prefix}.efficiency", efficiency, "効率は正の値で入力してください", "error"
            ))
        else:
            # 設備別効率妥当性チェック
            eff_errors = EquipmentValidator._validate_efficiency(system_type, efficiency, field_prefix)
            errors.extend(eff_errors)
        
        # 容量チェック（指定されている場合）
        capacity = system_data.get("rated_capacity")
        if capacity is not None and capacity <= 0:
            errors.append(ValidationError(
                f"{field_prefix}.rated_capacity", capacity, "定格容量は正の値で入力してください", "error"
            ))
        
        return errors
    
    @staticmethod
    def _validate_efficiency(system_type: str, efficiency: float, field_prefix: str) -> List[ValidationError]:
        """設備効率妥当性チェック"""
        errors = []
        
        # 設備種別ごとの現実的効率範囲
        efficiency_ranges = {
            "heating": (1.0, 7.0),      # 電気ヒーター〜高効率HP
            "cooling": (2.0, 7.0),      # 普及品〜高効率HP
            "ventilation": (0.0, 1.0),  # 熱交換効率
            "hot_water": (0.6, 5.0),    # 従来ガス〜高効率HP
            "lighting": (10.0, 200.0)   # 白熱灯〜高効率LED（lm/W）
        }
        
        if system_type in efficiency_ranges:
            min_eff, max_eff = efficiency_ranges[system_type]
            
            if efficiency < min_eff:
                errors.append(ValidationError(
                    f"{field_prefix}.efficiency", efficiency,
                    f"{system_type}設備の効率が現実的でない低い値です（{min_eff}未満）", "warning"
                ))
            elif efficiency > max_eff:
                errors.append(ValidationError(
                    f"{field_prefix}.efficiency", efficiency,
                    f"{system_type}設備の効率が現実的でない高い値です（{max_eff}超）", "warning"
                ))
        
        return errors

def validate_calculation_input(input_data: Dict[str, Any]) -> Tuple[List[ValidationError], bool]:
    """計算入力データの総合バリデーション"""
    all_errors = []
    
    # 建築物基本情報バリデーション
    building_errors = BuildingValidator.validate_building_data(input_data.get("building", {}))
    all_errors.extend(building_errors)
    
    # 外皮情報バリデーション
    envelope_errors = EnvelopeValidator.validate_envelope_parts(
        input_data.get("envelope", {}).get("parts", [])
    )
    all_errors.extend(envelope_errors)
    
    # 設備情報バリデーション
    systems_errors = EquipmentValidator.validate_systems(input_data.get("systems", {}))
    all_errors.extend(systems_errors)
    
    # エラーレベル判定
    has_critical_errors = any(error.severity == "error" for error in all_errors)
    can_calculate = not has_critical_errors
    
    return all_errors, can_calculate

def format_validation_report(errors: List[ValidationError]) -> str:
    """バリデーションレポート生成"""
    if not errors:
        return "✅ 入力データに問題はありません。"
    
    error_count = len([e for e in errors if e.severity == "error"])
    warning_count = len([e for e in errors if e.severity == "warning"])
    
    report = f"🔍 バリデーション結果: エラー{error_count}件、警告{warning_count}件\n\n"
    
    # エラー（重要度順）
    for error in sorted(errors, key=lambda x: x.severity):
        icon = {"error": "❌", "warning": "⚠️", "info": "ℹ️"}[error.severity]
        report += f"{icon} {error.field}: {error.message}\n"
        if error.value is not None:
            report += f"   入力値: {error.value}\n"
    
    return report