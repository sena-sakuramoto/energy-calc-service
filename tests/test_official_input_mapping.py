"""Regression tests for legacy BEI -> official input mapping."""

import unittest

from app.api.v1.routes import _bei_request_to_report_input
from app.schemas.bei import BEIRequest, OfficialBuildingInfo, OfficialInput
from app.services import report


class TestOfficialInputMapping(unittest.TestCase):
    def test_build_minimal_official_building_maps_legacy_use_and_zone(self):
        building = report.build_minimal_official_building(
            building_area_m2=1200,
            use="office",
            zone="6",
        )
        self.assertEqual(building["building_name"], "BEI計算案件")
        self.assertEqual(building["region"], "6地域")
        self.assertEqual(building["building_type"], "事務所モデル")
        self.assertEqual(building["calc_floor_area"], 1200.0)
        self.assertEqual(building["ac_floor_area"], 1200.0)

    def test_build_minimal_official_building_rejects_residential_collective(self):
        with self.assertRaises(ValueError) as ctx:
            report.build_minimal_official_building(
                building_area_m2=300,
                use="residential_collective",
                zone="6",
            )
        self.assertIn("未対応", str(ctx.exception))

    def test_bei_request_to_report_input_maps_legacy_payload(self):
        request = BEIRequest(
            building_area_m2=500,
            use="shop_supermarket",
            zone="5",
        )
        mapped = _bei_request_to_report_input(request)
        building = mapped["building"]
        self.assertEqual(building["building_name"], "BEI計算案件")
        self.assertEqual(building["region"], "5地域")
        self.assertEqual(building["building_type"], "小規模物販モデル")
        self.assertEqual(building["calc_floor_area"], 500.0)

    def test_bei_request_to_report_input_preserves_official_input(self):
        request = BEIRequest(
            building_area_m2=400,
            official_input=OfficialInput(
                building=OfficialBuildingInfo(
                    building_name="案件A",
                    region="6地域",
                    building_type="事務所モデル",
                    calc_floor_area=400,
                )
            ),
        )
        mapped = _bei_request_to_report_input(request)
        self.assertEqual(mapped["building"]["building_name"], "案件A")
        self.assertEqual(mapped["building"]["region"], "6地域")
        self.assertEqual(mapped["building"]["building_type"], "事務所モデル")
        self.assertEqual(mapped["building"]["calc_floor_area"], 400.0)


if __name__ == "__main__":
    unittest.main()

