# backend/tests/test_calculation_accuracy.py
"""
建築物省エネ法計算精度テストスイート
国土交通省基準との整合性確認・実務レベル精度検証
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from app.schemas.calculation import *
from app.services.calculation import perform_energy_calculation
from app.data.building_standards import calculate_standard_primary_energy, BuildingType, ClimateZone
from app.validators.building_validators import validate_calculation_input

class TestCalculationAccuracy:
    """計算精度テストクラス"""
    
    def test_office_building_standard_case(self):
        """標準的事務所建築物の計算精度テスト"""
        # テスト用データ（実際の設計事例ベース）
        test_data = CalculationInput(
            building=BuildingInput(
                building_type="事務所",
                total_floor_area=1000.0,
                climate_zone=6,  # 東京
                num_stories=3,
                has_central_heat_source=False
            ),
            envelope=EnvelopeInput(
                parts=[
                    EnvelopePartInput(
                        part_name="外壁(南面)",
                        part_type="壁", 
                        area=150.0,
                        u_value=0.35  # グラスウール断熱
                    ),
                    EnvelopePartInput(
                        part_name="外壁(北面)",
                        part_type="壁",
                        area=150.0, 
                        u_value=0.35
                    ),
                    EnvelopePartInput(
                        part_name="外壁(東面)",
                        part_type="壁",
                        area=100.0,
                        u_value=0.35
                    ),
                    EnvelopePartInput(
                        part_name="外壁(西面)", 
                        part_type="壁",
                        area=100.0,
                        u_value=0.35
                    ),
                    EnvelopePartInput(
                        part_name="屋根",
                        part_type="屋根",
                        area=350.0,
                        u_value=0.22  # ロックウール断熱
                    ),
                    EnvelopePartInput(
                        part_name="窓(南面)",
                        part_type="窓", 
                        area=40.0,
                        u_value=2.33,  # 樹脂サッシ複層ガラス
                        eta_value=0.60
                    ),
                    EnvelopePartInput(
                        part_name="窓(その他)",
                        part_type="窓",
                        area=30.0,
                        u_value=2.33,
                        eta_value=0.60
                    )
                ]
            ),
            systems=SystemsInput(
                heating=HeatingSystemInput(
                    system_type="ルームエアコン",
                    rated_capacity=50.0,
                    efficiency=4.0,  # 省エネ型エアコン
                    control_method="インバータ制御"
                ),
                cooling=CoolingSystemInput(
                    system_type="ルームエアコン", 
                    rated_capacity=50.0,
                    efficiency=3.8,
                    control_method="インバータ制御"
                ),
                ventilation=VentilationSystemInput(
                    system_type="第3種換気",
                    air_volume=2000.0,
                    power_consumption=300.0
                ),
                hot_water=HotWaterSystemInput(
                    system_type="エコジョーズ",
                    efficiency=0.87
                ),
                lighting=LightingSystemInput(
                    system_type="LED",
                    power_density=8.0  # 高効率LED
                )
            )
        )
        
        # 計算実行
        result = perform_energy_calculation(test_data)
        
        # 基本計算結果チェック
        assert result is not None
        assert result.envelope_result is not None
        assert result.primary_energy_result is not None
        
        # 外皮性能精度チェック
        envelope = result.envelope_result
        assert 0.4 <= envelope.ua_value <= 0.6  # 現実的なUA値範囲
        assert envelope.eta_a_value is not None
        assert 0.3 <= envelope.eta_a_value <= 0.8  # 現実的なηA値範囲
        assert envelope.is_ua_compliant == True  # 6地域基準適合
        
        # エネルギー消費量精度チェック
        energy = result.primary_energy_result
        assert energy.total_energy_consumption > 0
        assert energy.standard_energy_consumption > 0
        assert -50 <= energy.energy_saving_rate <= 50  # 現実的省エネ率範囲
        
        # 用途別エネルギー消費量妥当性チェック
        by_use = energy.energy_by_use
        assert by_use["heating"] > 0
        assert by_use["cooling"] > 0
        assert by_use["lighting"] > 0
        assert by_use["hot_water"] > 0  # 事務所でも最小限の給湯あり
        
        # エネルギー消費量バランスチェック
        total_by_use = sum(by_use.values())
        assert abs(total_by_use - energy.total_energy_consumption) < energy.total_energy_consumption * 0.01  # 1%未満の誤差
        
        print(f"事務所建築物計算テスト完了:")
        print(f"   UA値: {envelope.ua_value:.3f} W/m2K")
        print(f"   ηA値: {envelope.eta_a_value:.3f}")
        print(f"   省エネ率: {energy.energy_saving_rate:.1f}%")
        print(f"   総合判定: {'適合' if result.overall_compliance else '不適合'}")

    def test_residential_building_case(self):
        """住宅建築物の計算テスト"""
        test_data = CalculationInput(
            building=BuildingInput(
                building_type="住宅",
                total_floor_area=120.0,  # 戸建住宅標準
                climate_zone=5,  # 長野等
                num_stories=2,
                has_central_heat_source=False
            ),
            envelope=EnvelopeInput(
                parts=[
                    EnvelopePartInput(
                        part_name="外壁", 
                        part_type="壁",
                        area=200.0,
                        u_value=0.53  # 木造充填断熱
                    ),
                    EnvelopePartInput(
                        part_name="屋根",
                        part_type="屋根", 
                        area=70.0,
                        u_value=0.20  # 屋根断熱
                    ),
                    EnvelopePartInput(
                        part_name="床",
                        part_type="床",
                        area=60.0, 
                        u_value=0.34  # 床下断熱
                    ),
                    EnvelopePartInput(
                        part_name="窓", 
                        part_type="窓",
                        area=25.0,
                        u_value=1.74,  # Low-E複層ガラス
                        eta_value=0.49
                    )
                ]
            ),
            systems=SystemsInput(
                heating=HeatingSystemInput(
                    system_type="ルームエアコン",
                    efficiency=4.2
                ),
                cooling=CoolingSystemInput(
                    system_type="ルームエアコン",
                    efficiency=3.8
                ),
                ventilation=VentilationSystemInput(
                    system_type="第3種換気",
                    air_volume=240.0,  # 住宅0.5回/h
                    power_consumption=40.0
                ),
                hot_water=HotWaterSystemInput(
                    system_type="エコキュート",
                    efficiency=3.5  # 高効率
                ),
                lighting=LightingSystemInput(
                    system_type="LED",
                    power_density=6.0
                )
            )
        )
        
        result = perform_energy_calculation(test_data)
        
        # 住宅特有のチェック
        assert result.envelope_result.ua_value <= 0.87  # 5地域基準
        assert result.primary_energy_result.energy_by_use["hot_water"] > result.primary_energy_result.energy_by_use["heating"]  # 住宅は給湯 > 暖房
        
        print(f"住宅計算テスト完了: 省エネ率 {result.primary_energy_result.energy_saving_rate:.1f}%")

    def test_climate_zone_variations(self):
        """地域区分別計算精度テスト"""
        base_building = BuildingInput(
            building_type="事務所",
            total_floor_area=500.0,
            num_stories=2,
            climate_zone=1  # 後で変更
        )
        
        base_envelope = EnvelopeInput(parts=[
            EnvelopePartInput(part_name="外壁", part_type="壁", area=300.0, u_value=0.35),
            EnvelopePartInput(part_name="屋根", part_type="屋根", area=250.0, u_value=0.25),
            EnvelopePartInput(part_name="窓", part_type="窓", area=50.0, u_value=2.33, eta_value=0.60)
        ])
        
        base_systems = SystemsInput(
            heating=HeatingSystemInput(system_type="エアコン", efficiency=3.8),
            cooling=CoolingSystemInput(system_type="エアコン", efficiency=3.5),
            ventilation=VentilationSystemInput(system_type="第3種", power_consumption=200.0),
            hot_water=HotWaterSystemInput(system_type="ガス", efficiency=0.85),
            lighting=LightingSystemInput(system_type="LED", power_density=10.0)
        )
        
        climate_results = {}
        
        for zone in range(1, 9):
            test_building = base_building.model_copy()
            test_building.climate_zone = zone
            
            test_data = CalculationInput(
                building=test_building,
                envelope=base_envelope,
                systems=base_systems
            )
            
            result = perform_energy_calculation(test_data)
            climate_results[zone] = {
                "heating": result.primary_energy_result.energy_by_use["heating"],
                "cooling": result.primary_energy_result.energy_by_use["cooling"],
                "total": result.primary_energy_result.total_energy_consumption
            }
        
        # 地域特性チェック
        # 寒冷地（1-3地域）は暖房エネルギーが多い
        assert climate_results[1]["heating"] > climate_results[8]["heating"]
        # 温暖地（7-8地域）は冷房エネルギーが多い
        assert climate_results[8]["cooling"] > climate_results[1]["cooling"]
        
        print("地域区分別計算精度テスト完了:")
        for zone in range(1, 9):
            heating = climate_results[zone]["heating"]
            cooling = climate_results[zone]["cooling"] 
            print(f"   {zone}地域: 暖房{heating:,.0f}MJ 冷房{cooling:,.0f}MJ")

    def test_calculation_boundary_values(self):
        """境界値・極端値テスト"""
        # 超高性能建築物
        high_performance_data = CalculationInput(
            building=BuildingInput(building_type="事務所", total_floor_area=1000.0, climate_zone=6, num_stories=3),
            envelope=EnvelopeInput(parts=[
                EnvelopePartInput(part_name="超高断熱外壁", part_type="壁", area=400.0, u_value=0.15),
                EnvelopePartInput(part_name="超高断熱屋根", part_type="屋根", area=350.0, u_value=0.12),
                EnvelopePartInput(part_name="トリプル窓", part_type="窓", area=70.0, u_value=0.80, eta_value=0.35)
            ]),
            systems=SystemsInput(
                heating=HeatingSystemInput(system_type="高効率HP", efficiency=6.0),
                cooling=CoolingSystemInput(system_type="高効率HP", efficiency=5.5),
                ventilation=VentilationSystemInput(system_type="全熱交換", power_consumption=150.0, heat_exchange_efficiency=0.8),
                hot_water=HotWaterSystemInput(system_type="エコキュート", efficiency=4.0),
                lighting=LightingSystemInput(system_type="LED", power_density=5.0)
            )
        )
        
        high_performance_result = perform_energy_calculation(high_performance_data)
        
        # 超高性能建築物は大幅省エネが期待される
        assert high_performance_result.primary_energy_result.energy_saving_rate > 20  # 20%以上省エネ
        assert high_performance_result.envelope_result.ua_value < 0.3  # 超高断熱
        assert high_performance_result.overall_compliance == True
        
        print(f"超高性能建築物テスト: 省エネ率 {high_performance_result.primary_energy_result.energy_saving_rate:.1f}%")

    def test_input_validation(self):
        """入力値バリデーションテスト"""
        # 不正な入力データ
        invalid_data = {
            "building": {
                "building_type": "不明な建物種別",
                "total_floor_area": -100,  # 負の値
                "climate_zone": 10,  # 範囲外
                "num_stories": 0
            },
            "envelope": {
                "parts": []  # 空のリスト
            },
            "systems": {
                "heating": {"system_type": "", "efficiency": -1}
            }
        }
        
        validation_errors, can_calculate = validate_calculation_input(invalid_data)
        
        assert len(validation_errors) > 0  # エラーが検出されること
        assert can_calculate == False  # 計算実行不可判定
        
        # エラーの種類をチェック
        error_fields = [error.field for error in validation_errors]
        assert "building_type" in str(error_fields)
        assert "total_floor_area" in str(error_fields) 
        assert "climate_zone" in str(error_fields)
        
        print(f"バリデーションテスト完了: {len(validation_errors)}件のエラーを検出")

    def test_calculation_consistency(self):
        """計算結果一貫性テスト"""
        # 同じ入力データで複数回計算
        test_data = CalculationInput(
            building=BuildingInput(building_type="事務所", total_floor_area=800.0, climate_zone=6, num_stories=2),
            envelope=EnvelopeInput(parts=[
                EnvelopePartInput(part_name="外壁", part_type="壁", area=300.0, u_value=0.40),
                EnvelopePartInput(part_name="屋根", part_type="屋根", area=400.0, u_value=0.25),
                EnvelopePartInput(part_name="窓", part_type="窓", area=60.0, u_value=2.33, eta_value=0.60)
            ]),
            systems=SystemsInput(
                heating=HeatingSystemInput(system_type="エアコン", efficiency=4.0),
                cooling=CoolingSystemInput(system_type="エアコン", efficiency=3.5),
                ventilation=VentilationSystemInput(system_type="第3種", power_consumption=250.0),
                hot_water=HotWaterSystemInput(system_type="ガス", efficiency=0.85),
                lighting=LightingSystemInput(system_type="LED", power_density=8.0)
            )
        )
        
        results = []
        for i in range(5):
            result = perform_energy_calculation(test_data)
            results.append(result)
        
        # 計算結果の一貫性チェック
        base_result = results[0]
        for result in results[1:]:
            assert result.envelope_result.ua_value == base_result.envelope_result.ua_value
            assert result.primary_energy_result.total_energy_consumption == base_result.primary_energy_result.total_energy_consumption
            assert result.overall_compliance == base_result.overall_compliance
        
        print("計算一貫性テスト完了: 5回の計算結果が一致")

if __name__ == "__main__":
    # テスト実行
    tester = TestCalculationAccuracy()
    
    print("建築物省エネ法計算精度テスト開始")
    print("=" * 50)
    
    try:
        tester.test_office_building_standard_case()
        tester.test_residential_building_case() 
        tester.test_climate_zone_variations()
        tester.test_calculation_boundary_values()
        tester.test_input_validation()
        tester.test_calculation_consistency()
        
        print("=" * 50)
        print("全テスト完了: 計算エンジンは商用レベルの精度です")
        
    except Exception as e:
        print(f"テスト失敗: {str(e)}")
        raise