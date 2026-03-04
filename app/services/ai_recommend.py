"""AI product recommendation engine using Claude API."""

from __future__ import annotations

import logging
import os
import re
from typing import Any, Dict, List, Optional

from app.services.products import get_recommended_products

logger = logging.getLogger(__name__)

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
ANTHROPIC_MODEL = os.getenv("ANTHROPIC_MODEL", "claude-3-5-haiku-latest")

USE_LABELS = {
    "office": "事務所",
    "hotel": "ホテル",
    "hospital": "病院",
    "shop_department": "百貨店",
    "shop_supermarket": "スーパー",
    "school_small": "小学校",
    "school_high": "高校",
    "school_university": "大学",
    "restaurant": "飲食店",
    "assembly": "集会所",
    "factory": "工場",
}


def build_recommendation_prompt(
    *,
    zone: int,
    use: str,
    floor_area: float,
    current_bei: Optional[float] = None,
    categories: Optional[List[str]] = None,
) -> str:
    """Build a structured prompt for Claude to recommend products."""
    if categories is None:
        categories = ["windows", "insulation", "hvac", "lighting"]

    use_label = USE_LABELS.get(use, use)
    bei_info = f"現在のBEI: {current_bei}" if current_bei is not None else "BEI: 未計算"

    product_sections: List[str] = []
    for category in categories:
        products = get_recommended_products(category, zone=zone, use=use)
        if not products:
            continue

        lines = []
        for product in products[:8]:
            spec = _format_spec(category, product)
            partner_tag = " [パートナー推奨]" if product.get("partner") else ""
            lines.append(
                f"  - {product['id']}: {product['name']} ({product['manufacturer']}) {spec}{partner_tag}"
            )
        product_sections.append(f"■ {category}:\n" + "\n".join(lines))

    products_text = "\n\n".join(product_sections)

    return f"""あなたは省エネ建築の専門家です。以下の建物条件に最適な製品を推薦してください。

## 建物条件
- 地域区分: {zone}地域
- 用途: {use_label}
- 延床面積: {floor_area}m2
- {bei_info}

## 利用可能な製品
{products_text}

## 回答形式
各カテゴリから1つずつ、以下の形式で推薦してください。パートナー推奨製品を優先してください。

[RECOMMEND]
category: (カテゴリ名)
product_id: (製品ID)
reason: (2文以内で推薦理由。建物条件との適合性、性能値、コスト効率に言及)
estimated_bei_impact: (BEIへの推定影響。例: -0.05)
[/RECOMMEND]
"""


def _format_spec(category: str, product: Dict[str, Any]) -> str:
    if category == "windows":
        return f"U={product.get('u_value', '?')}, eta_c={product.get('eta_c', '?')}"
    if category == "insulation":
        return f"lambda={product.get('lambda_value', '?')}, {product.get('category', '?')}"
    if category == "hvac":
        return f"APF={product.get('apf', '?')}, {product.get('capacity_kw', '?')}kW"
    if category == "lighting":
        return f"{product.get('lm_per_w', '?')}lm/W, {product.get('wattage', '?')}W"
    return ""


def parse_recommendation(raw_text: str) -> List[Dict[str, Any]]:
    """Parse structured [RECOMMEND] blocks from Claude response."""
    results: List[Dict[str, Any]] = []
    blocks = re.findall(r"\[RECOMMEND\](.*?)\[/RECOMMEND\]", raw_text, re.DOTALL)

    for block in blocks:
        recommendation: Dict[str, Any] = {}
        for line in block.strip().split("\n"):
            line = line.strip()
            if ":" not in line:
                continue
            key, _, value = line.partition(":")
            key = key.strip()
            value = value.strip()
            if key in ("category", "product_id", "reason", "estimated_bei_impact"):
                recommendation[key] = value

        if recommendation.get("product_id"):
            results.append(recommendation)

    return results


async def get_ai_recommendations(
    *,
    zone: int,
    use: str,
    floor_area: float,
    current_bei: Optional[float] = None,
    categories: Optional[List[str]] = None,
) -> List[Dict[str, Any]]:
    """Call Claude API for product recommendations."""
    if not ANTHROPIC_API_KEY:
        logger.warning("ANTHROPIC_API_KEY not set; returning empty recommendations")
        return []

    import anthropic

    prompt = build_recommendation_prompt(
        zone=zone,
        use=use,
        floor_area=floor_area,
        current_bei=current_bei,
        categories=categories,
    )

    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
    message = client.messages.create(
        model=ANTHROPIC_MODEL,
        max_tokens=1500,
        messages=[{"role": "user", "content": prompt}],
    )

    if not message.content:
        return []

    raw = message.content[0].text
    recommendations = parse_recommendation(raw)

    for rec in recommendations:
        category = rec.get("category", "")
        product_id = rec.get("product_id", "")
        try:
            products = get_recommended_products(category, zone=zone, use=use)
            match = next((p for p in products if p["id"] == product_id), None)
            if match:
                rec["product"] = match
        except Exception:
            logger.exception("Failed to enrich recommendation for %s/%s", category, product_id)

    return recommendations
