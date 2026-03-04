"""Official residential envelope API client."""

from __future__ import annotations

import asyncio
import xml.etree.ElementTree as ET
from typing import Any

import httpx

ENVELOPE_API_URL = "https://api.lowenergy.jp/envelope/1/eval"
_OFFICIAL_API_LOCK = asyncio.Lock()


class OfficialAPIError(RuntimeError):
    """Raised when official envelope API call or parse fails."""


def _strip_ns(tag: str) -> str:
    return tag.split("}", 1)[-1] if "}" in tag else tag


def _get_float(attr_map: dict[str, str], key: str) -> float | None:
    raw = attr_map.get(key)
    if raw is None or raw == "":
        return None
    return float(raw)


def parse_calc_result_xml(raw_xml: str) -> dict[str, Any]:
    """Parse official CalcResult XML and return normalized payload."""
    try:
        root = ET.fromstring(raw_xml)
    except ET.ParseError as exc:
        raise OfficialAPIError(f"公式APIレスポンスXMLの解析に失敗しました: {exc}") from exc

    if _strip_ns(root.tag) != "CalcResult":
        raise OfficialAPIError("公式APIレスポンスがCalcResult形式ではありません。")

    components: list[dict[str, Any]] = []
    for node in root.iter():
        if _strip_ns(node.tag) != "ComponentResult":
            continue
        components.append(
            {
                "name": node.attrib.get("Name"),
                "component_type": node.attrib.get("ComponentType"),
                "area": _get_float(node.attrib, "Area"),
                "u_value": _get_float(node.attrib, "U"),
                "adjacent": node.attrib.get("Adjacent"),
            }
        )

    return {
        "ua": _get_float(root.attrib, "UA"),
        "ua_standard": _get_float(root.attrib, "UAStandard"),
        "eta_ac": _get_float(root.attrib, "EaterAC"),
        "eta_ac_standard": _get_float(root.attrib, "EaterACStandard"),
        "eta_ah": _get_float(root.attrib, "EaterAH"),
        "total_area": _get_float(root.attrib, "TotalArea"),
        "components": components,
        "raw_xml": raw_xml,
    }


async def call_official_envelope_api(xml_body: str, timeout: int = 30, retries: int = 3) -> dict[str, Any]:
    """Call official envelope API and parse CalcResult."""
    headers = {
        "Content-Type": "application/xml; charset=utf-8",
        "Accept": "*/*",
    }

    last_error: Exception | None = None
    for attempt in range(retries):
        try:
            async with _OFFICIAL_API_LOCK:
                async with httpx.AsyncClient(timeout=timeout) as client:
                    response = await client.post(
                        ENVELOPE_API_URL,
                        content=xml_body.encode("utf-8"),
                        headers=headers,
                    )

            response.raise_for_status()
            return parse_calc_result_xml(response.text)
        except (httpx.HTTPError, OfficialAPIError, ValueError) as exc:
            last_error = exc
            if attempt >= retries - 1:
                break
            await asyncio.sleep(0.5 * (2 ** attempt))

    assert last_error is not None
    raise OfficialAPIError(f"公式API呼び出しに失敗しました: {last_error}") from last_error
