# backend/app/services/calculation.py
from app.schemas.calculation import CalculationInput, CalculationResult, EnvelopeResult, PrimaryEnergyResult

def perform_energy_calculation(input_data: CalculationInput) -> CalculationResult:
    """エネルギー計算ロジックのプレースホルダー"""
    # 実際の計算ロジックはここに実装されます。
    # 例として、入力データの一部を使用してダミーの計算結果を返します。

    # 建物情報
    building_type = input_data.building.building_type
    total_floor_area = input_data.building.total_floor_area
    climate_zone = input_data.building.climate_zone

    # 外皮性能計算のダミー結果
    # 簡易的なUA値とηA値の計算例 (実際はもっと複雑な計算が必要)
    # 外皮面積の合計と熱貫流率の平均を計算
    total_envelope_area = sum(part.area for part in input_data.envelope.parts)
    weighted_u_value_sum = sum(part.area * part.u_value for part in input_data.envelope.parts)
    weighted_eta_value_sum = sum(part.area * part.eta_value for part in input_data.envelope.parts if part.eta_value is not None)

    ua_value = weighted_u_value_sum / total_envelope_area if total_envelope_area > 0 else 0.0
    eta_a_value = weighted_eta_value_sum / total_envelope_area if total_envelope_area > 0 else 0.0

    # 適当な基準値 (地域区分などによって変動する)
    ua_compliant_threshold = 0.6 # 例
    eta_a_compliant_threshold = 2.8 # 例

    is_ua_compliant = ua_value < ua_compliant_threshold
    is_eta_a_compliant = eta_a_value < eta_a_compliant_threshold

    envelope_result = EnvelopeResult(
        ua_value=ua_value,
        eta_a_value=eta_a_value,
        is_ua_compliant=is_ua_compliant,
        is_eta_a_compliant=is_eta_a_compliant,
    )

    # 一次エネルギー消費量計算のダミー結果
    # 設備効率などを考慮した簡易的な計算例
    # 実際は各設備の消費エネルギーを詳細に計算し、係数を乗じる
    heating_energy_calc = input_data.systems.heating.efficiency * 100 # ダミー
    cooling_energy_calc = input_data.systems.cooling.efficiency * 80 # ダミー
    ventilation_energy_calc = input_data.systems.ventilation.power_consumption * 50 # ダミー
    hot_water_energy_calc = input_data.systems.hot_water.efficiency * 120 # ダミー
    lighting_energy_calc = input_data.systems.lighting.power_density * total_floor_area * 10 # ダミー

    total_energy_consumption = heating_energy_calc + cooling_energy_calc + ventilation_energy_calc + hot_water_energy_calc + lighting_energy_calc
    standard_energy_consumption = total_floor_area * 100 # 簡易的な基準値
    energy_saving_rate = (1 - total_energy_consumption / standard_energy_consumption) * 100 if standard_energy_consumption > 0 else 0.0
    is_energy_compliant = total_energy_consumption < standard_energy_consumption

    primary_energy_result = PrimaryEnergyResult(
        total_energy_consumption=total_energy_consumption,
        standard_energy_consumption=standard_energy_consumption,
        energy_saving_rate=energy_saving_rate,
        is_energy_compliant=is_energy_compliant,
        energy_by_use={
            "heating": heating_energy_calc,
            "cooling": cooling_energy_calc,
            "ventilation": ventilation_energy_calc,
            "hot_water": hot_water_energy_calc,
            "lighting": lighting_energy_calc,
        }
    )

    overall_compliance = is_ua_compliant and is_eta_a_compliant and is_energy_compliant
    message = "計算が完了しました。" if overall_compliance else "省エネ基準に適合しませんでした。"

    return CalculationResult(
        envelope_result=envelope_result,
        primary_energy_result=primary_energy_result,
        overall_compliance=overall_compliance,
        message=message,
    )