# backend/app/services/engine.py
from typing import Dict, Any, Tuple

from app.schemas.building import CalculationInput
from app.schemas.result import CalculationResult, EnvelopeResult, EnergyResult

class CalculationEngine:
    """省エネ計算エンジン"""
    
    def __init__(self):
        # 地域区分ごとの基準UA値（例）
        self.standard_ua_values = {
            1: 0.46, 2: 0.46, 3: 0.56, 4: 0.56,
            5: 0.62, 6: 0.62, 7: 0.68, 8: 0.68
        }
        # 地域区分ごとの基準η値（例）
        self.standard_eta_values = {
            1: 2.8, 2: 2.8, 3: 2.8, 4: 3.0,
            5: 3.0, 6: 2.8, 7: 2.7, 8: 3.2
        }
    
    def calculate(self, input_data: CalculationInput) -> CalculationResult:
        """計算を実行する"""
        # 外皮性能計算
        envelope_result = self._calculate_envelope(input_data.building, input_data.envelope)
        
        # 一次エネルギー消費量計算
        energy_result = self._calculate_energy(input_data.building, input_data.systems, envelope_result)
        
        # BELS評価・ZEBレベルの判定
        bels_rating = self._determine_bels_rating(energy_result.bei)
        zeb_level = self._determine_zeb_level(energy_result.bei)
        
        # 総合適合判定（外皮と一次エネ両方に適合）
        overall_conformity = envelope_result.conformity and energy_result.conformity
        
        return CalculationResult(
            envelope=envelope_result,
            energy=energy_result,
            bels_rating=bels_rating,
            zeb_level=zeb_level,
            overall_conformity=overall_conformity
        )
    
    def _calculate_envelope(self, building, envelope) -> EnvelopeResult:
        """外皮性能計算"""
        # 外皮面積合計
        total_area = sum(part.area for part in envelope.parts)
        
        # UA値計算 (Σ(U_i*A_i) / ΣA_i)
        ua_numerator = sum(part.u_value * part.area for part in envelope.parts)
        ua_value = ua_numerator / total_area if total_area > 0 else 0
        
        # η値計算（窓部分のみ）
        window_parts = [part for part in envelope.parts if part.part_type == "窓" and part.eta_value is not None]
        if window_parts:
            window_area = sum(part.area for part in window_parts)
            eta_numerator = sum(part.eta_value * part.area for part in window_parts)
            eta_value = eta_numerator / window_area if window_area > 0 else None
        else:
            eta_value = None
        
        # 基準値取得
        climate_zone = building.climate_zone
        ua_standard = self.standard_ua_values.get(climate_zone, 0.6)  # デフォルト0.6
        eta_standard = self.standard_eta_values.get(climate_zone, 3.0)  # デフォルト3.0
        
        # 適合判定
        conformity = ua_value <= ua_standard
        if eta_value is not None and eta_standard is not None:
            conformity = conformity and eta_value <= eta_standard
        
        return EnvelopeResult(
            ua_value=ua_value,
            eta_value=eta_value,
            ua_standard=ua_standard,
            eta_standard=eta_standard,
            conformity=conformity
        )
    
    def _calculate_energy(self, building, systems, envelope_result) -> EnergyResult:
        """一次エネルギー消費量計算"""
        # 建物用途・規模に基づく基準一次エネルギー消費量（単位面積あたり）
        # 実際には複雑な計算式があるが、ここではシンプルな例として床面積に単位消費量をかける
        if building.building_type == "住宅":
            standard_energy_unit = 330  # GJ/年・m2（例）
        else:  # 非住宅
            standard_energy_unit = 450  # GJ/年・m2（例）
        
        # 基準一次エネルギー消費量
        standard_energy_total = standard_energy_unit * building.total_floor_area / 1000  # GJ/年
        
        # 設計一次エネルギー消費量（各設備ごと）
        energy_by_use = {}
        
        # 暖房エネルギー消費量
        if systems.heating:
            # UAに基づく熱損失係数から暖房負荷を計算（簡易計算例）
            heating_load = envelope_result.ua_value * building.total_floor_area * 1800  # 年間度時
            heating_energy = heating_load / systems.heating.efficiency / 1000  # GJ
            energy_by_use["heating"] = heating_energy
        else:
            energy_by_use["heating"] = 0
        
        # 冷房エネルギー消費量
        if systems.cooling:
            # 簡易計算例
            cooling_load = building.total_floor_area * 100  # 簡易負荷係数
            cooling_energy = cooling_load / systems.cooling.efficiency / 1000  # GJ
            energy_by_use["cooling"] = cooling_energy
        else:
            energy_by_use["cooling"] = 0
        
        # 換気エネルギー消費量
        if systems.ventilation:
            # 稼働時間 x 消費電力
            ventilation_energy = systems.ventilation.power_consumption * 24 * 365 / 1000000 * 9760 / 1000  # 一次エネルギー換算 GJ
            energy_by_use["ventilation"] = ventilation_energy
        else:
            energy_by_use["ventilation"] = 0
        
        # 給湯エネルギー消費量
        if systems.hot_water:
            # 簡易計算例
            hot_water_load = building.total_floor_area * 50  # 簡易負荷係数
            hot_water_energy = hot_water_load / systems.hot_water.efficiency / 1000  # GJ
            energy_by_use["hot_water"] = hot_water_energy
        else:
            energy_by_use["hot_water"] = 0
        
        # 照明エネルギー消費量
        if systems.lighting:
            # 簡易計算例
            lighting_energy = systems.lighting.power_density * building.total_floor_area * 2500 / 1000000 * 9760 / 1000  # GJ
            energy_by_use["lighting"] = lighting_energy
        else:
            energy_by_use["lighting"] = 0
        
        # 設計一次エネルギー消費量合計
        design_energy_total = sum(energy_by_use.values())
        
        # BEI値計算
        bei = design_energy_total / standard_energy_total if standard_energy_total > 0 else 999
        
        # 適合判定
        conformity = bei <= 1.0
        
        return EnergyResult(
            design_energy_total=design_energy_total,
            standard_energy_total=standard_energy_total,
            bei=bei,
            conformity=conformity,
            energy_by_use=energy_by_use,
            energy_by_system=energy_by_use  # 簡易化
        )
    
    def _determine_bels_rating(self, bei: float) -> int:
        """BEI値からBELS星評価を判定"""
        if bei <= 0.6:
            return 5
        elif bei <= 0.7:
            return 4
        elif bei <= 0.8:
            return 3
        elif bei <= 0.9:
            return 2
        else:
            return 1
    
    def _determine_zeb_level(self, bei: float) -> str:
        """BEI値からZEBレベルを判定"""
        if bei <= 0.0:
            return "ZEB"
        elif bei <= 0.25:
            return "Nearly ZEB"
        elif bei <= 0.5:
            return "ZEB Ready"
        elif bei <= 0.6:
            return "ZEB Oriented"
        else:
            return "ZEB非該当"

# エンジンのインスタンス作成（シングルトン）
calculation_engine = CalculationEngine()