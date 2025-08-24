# test_calculation.py - 計算機能のテスト
import sys
import os
sys.path.append(os.path.dirname(__file__))

from app.schemas.calculation import *
from app.services.calculation import perform_energy_calculation

def test_calculation():
    """計算機能のテスト"""
    
    # テスト用入力データ作成
    test_data = CalculationInput(
        building=BuildingInput(
            building_type="office",
            total_floor_area=1000.0,
            climate_zone=6,
            num_stories=3,
            has_central_heat_source=False
        ),
        envelope=EnvelopeInput(
            parts=[
                EnvelopePartInput(
                    part_name="外壁(南)",
                    part_type="wall",
                    area=200.0,
                    u_value=0.4,
                    eta_value=None
                ),
                EnvelopePartInput(
                    part_name="外壁(北)",
                    part_type="wall", 
                    area=200.0,
                    u_value=0.4,
                    eta_value=None
                ),
                EnvelopePartInput(
                    part_name="外壁(東)",
                    part_type="wall",
                    area=150.0,
                    u_value=0.4,
                    eta_value=None
                ),
                EnvelopePartInput(
                    part_name="外壁(西)",
                    part_type="wall",
                    area=150.0,
                    u_value=0.4,
                    eta_value=None
                ),
                EnvelopePartInput(
                    part_name="屋根",
                    part_type="roof",
                    area=400.0,
                    u_value=0.3,
                    eta_value=None
                ),
                EnvelopePartInput(
                    part_name="窓(南)",
                    part_type="window",
                    area=50.0,
                    u_value=2.33,
                    eta_value=0.4
                ),
                EnvelopePartInput(
                    part_name="窓(北)",
                    part_type="window",
                    area=30.0,
                    u_value=2.33,
                    eta_value=0.4
                )
            ]
        ),
        systems=SystemsInput(
            heating=HeatingSystemInput(
                system_type="エアコン",
                rated_capacity=50.0,
                efficiency=4.0,
                control_method="温度制御"
            ),
            cooling=CoolingSystemInput(
                system_type="エアコン",
                rated_capacity=60.0,
                efficiency=3.5,
                control_method="温度制御"
            ),
            ventilation=VentilationSystemInput(
                system_type="機械換気",
                air_volume=3000.0,
                power_consumption=500.0,
                heat_exchange_efficiency=0.7
            ),
            hot_water=HotWaterSystemInput(
                system_type="電気給湯器",
                efficiency=0.9
            ),
            lighting=LightingSystemInput(
                system_type="LED",
                power_density=8.0,
                control_method="人感センサー"
            )
        )
    )
    
    print("=== 建築物省エネ法計算テスト ===")
    print(f"建物種別: {test_data.building.building_type}")
    print(f"延床面積: {test_data.building.total_floor_area}㎡")
    print(f"地域区分: {test_data.building.climate_zone}地域")
    print()
    
    # 計算実行
    result = perform_energy_calculation(test_data)
    
    print("=== 計算結果 ===")
    print(f"結果: {result.message}")
    print()
    
    print("--- 外皮性能 ---")
    print(f"UA値: {result.envelope_result.ua_value} W/m2K")
    if result.envelope_result.eta_a_value:
        print(f"ηA値: {result.envelope_result.eta_a_value}")
    print(f"UA値適合: {'適合' if result.envelope_result.is_ua_compliant else '不適合'}")
    print(f"ηA値適合: {'適合' if result.envelope_result.is_eta_a_compliant else '不適合'}")
    print()
    
    print("--- 一次エネルギー消費量 ---")
    print(f"設計値: {result.primary_energy_result.total_energy_consumption:,.0f} MJ/年")
    print(f"基準値: {result.primary_energy_result.standard_energy_consumption:,.0f} MJ/年")
    print(f"省エネ率: {result.primary_energy_result.energy_saving_rate}%")
    print(f"エネルギー適合: {'適合' if result.primary_energy_result.is_energy_compliant else '不適合'}")
    print()
    
    print("--- 用途別エネルギー消費量 ---")
    for use, consumption in result.primary_energy_result.energy_by_use.items():
        print(f"{use}: {consumption:,.0f} MJ/年")
    print()
    
    print(f"総合判定: {'適合' if result.overall_compliance else '不適合'}")
    
    return result

if __name__ == "__main__":
    test_calculation()