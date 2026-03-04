"""Tests for AI product recommendation engine."""

from app.services.ai_recommend import build_recommendation_prompt, parse_recommendation


class TestRecommendationPrompt:
    def test_prompt_includes_building_info(self) -> None:
        prompt = build_recommendation_prompt(
            zone=6,
            use="office",
            floor_area=500,
            current_bei=1.05,
            categories=["windows", "hvac"],
        )
        assert "6地域" in prompt
        assert "事務所" in prompt or "office" in prompt
        assert "500" in prompt
        assert "1.05" in prompt

    def test_prompt_includes_product_data(self) -> None:
        prompt = build_recommendation_prompt(
            zone=6,
            use="office",
            floor_area=500,
            current_bei=1.05,
            categories=["windows"],
        )
        assert "YKK" in prompt or "LIXIL" in prompt


class TestParseRecommendation:
    def test_parse_valid_response(self) -> None:
        raw = """
        [RECOMMEND]
        category: windows
        product_id: ykk-apw430-sliding
        reason: 6地域の事務所にはAPW430の断熱性能が最適です。U値1.31で適合基準をクリアできます。
        estimated_bei_impact: -0.08
        [/RECOMMEND]
        [RECOMMEND]
        category: hvac
        product_id: panasonic-multi-office
        reason: パナソニック ビル用マルチはAPF6.5で高効率。事務所の空調負荷に適しています。
        estimated_bei_impact: -0.05
        [/RECOMMEND]
        """
        results = parse_recommendation(raw)
        assert len(results) == 2
        assert results[0]["product_id"] == "ykk-apw430-sliding"
        assert results[0]["category"] == "windows"
        assert "APW430" in results[0]["reason"]
