"""Build XML payloads for the official residential envelope API."""

from __future__ import annotations

import xml.etree.ElementTree as ET

from app.schemas.residential import ResidentialEnvelopePart, ResidentialVerifyRequest

_DIRECTION_MAP = {
    "TOP": "Top",
    "BOTTOM": "Bottom",
    "N": "N",
    "NE": "NE",
    "E": "E",
    "SE": "SE",
    "S": "S",
    "SW": "SW",
    "W": "W",
    "NW": "NW",
}

_ADJACENT_MAP = {
    "exterior": "Outside",
    "outside": "Outside",
    "ground": "Ground",
    "unheated_space": "NotHeated",
    "underfloor": "NotHeated",
    "separator_zero": "SeparatorZero",
    "separator": "NotHeated",
}

_WALL_TYPE_MAP = {
    "wall": "ExternalWall",
    "roof": "Roof",
    "ceiling": "Ceiling",
    "floor": "Floor",
}

_SASH_MAP = {
    "metal": "Aluminum",
    "metal_resin": "AluminumResin",
    "resin": "Resin",
    "wood": "Wood",
}

_GLASS_MAP = {
    "triple_low_e_double_gas": "TriplePairDoubleLowEG",
    "triple_low_e_double_air": "TriplePairDoubleLowES",
    "triple_low_e_gas": "TriplePairLowEG",
    "triple_low_e_air": "TriplePairLowES",
    "triple_clear": "TriplePairClear",
    "double_low_e_gas": "DoublePairLowEG",
    "double_low_e_air": "DoublePairLowES",
    "double_clear": "DoublePair",
    "single": "SinglePair",
    # App-side aliases
    "double": "DoublePair",
    "double_lowe_a12": "DoublePairLowEG",
    "double_lowe_a16": "DoublePairLowEG",
    "triple_lowe_a9x2": "TriplePairLowEG",
    "triple_lowe_kr_a11x2": "TriplePairDoubleLowEG",
}


def _fmt(value: float, digits: int = 3) -> str:
    text = f"{float(value):.{digits}f}".rstrip("0").rstrip(".")
    return text or "0"


def _direction(value: str) -> str:
    return _DIRECTION_MAP.get(str(value or "N").upper(), "N")


def _adjacent(value: str | None) -> str:
    if not value:
        return "Outside"
    return _ADJACENT_MAP.get(str(value).lower(), "Outside")


def _append_wall(root: ET.Element, index: int, part: ResidentialEnvelopePart) -> None:
    wall_type = _WALL_TYPE_MAP.get(part.type, "ExternalWall")
    ET.SubElement(
        root,
        "Wall",
        {
            "Name": f"{wall_type}-{index}",
            "Direction": _direction(part.orientation),
            "Type": wall_type,
            "Adjacent": _adjacent(part.adjacency),
            "Area": _fmt(part.area, 2),
            "GammaH": "1",
            "GammaC": "1",
            "Method": "Direct",
            "UValue": _fmt(part.u_value, 3),
            "SolarAbsorptance": "0.65",
        },
    )


def _append_window(root: ET.Element, index: int, part: ResidentialEnvelopePart) -> None:
    sash = _SASH_MAP.get((part.sash_type or "resin").lower(), "Resin")
    glass = _GLASS_MAP.get((part.glass_type or "double_low_e_gas").lower(), "DoublePairLowEG")
    ET.SubElement(
        root,
        "Window",
        {
            "Name": f"Window-{index}",
            "Direction": _direction(part.orientation),
            "Adjacent": _adjacent(part.adjacency),
            "Area": _fmt(part.area, 2),
            "GammaH": "1",
            "GammaC": "1",
            "SashSpec": sash,
            "GlassType": glass,
            "UvalueInfo": "Specification",
        },
    )


def _append_door(root: ET.Element, index: int, part: ResidentialEnvelopePart) -> None:
    ET.SubElement(
        root,
        "Door",
        {
            "Name": f"Door-{index}",
            "Direction": _direction(part.orientation),
            "Adjacent": _adjacent(part.adjacency),
            "Area": _fmt(part.area, 2),
            "GammaH": "1",
            "GammaC": "1",
            "UvalueInfo": "Specification",
            "UwithoutAttachment": _fmt(part.u_value, 3),
        },
    )


def _append_foundation(root: ET.Element, part: ResidentialEnvelopePart, floor_area: float) -> None:
    ET.SubElement(
        root,
        "Foundation",
        {
            "Name": "Foundation",
            "Adjacent": _adjacent(part.adjacency),
            "FloorArea": _fmt(floor_area, 2),
            "OuterLength": _fmt(part.length or 0, 2),
            "CalcMethod": "SimplifiedWithFloorInsulation",
        },
    )


def build_envelope_xml(request: ResidentialVerifyRequest) -> str:
    """Generate official envelope API XML from ResidentialVerifyRequest."""
    root = ET.Element(
        "Envelope",
        {
            "Version": "3",
            "Name": request.project_name or "住宅外皮計算",
            "Region": str(request.region),
            "Description": request.description or "住宅版検証",
        },
    )

    for idx, part in enumerate(request.parts, start=1):
        if part.type in {"wall", "roof", "ceiling", "floor"}:
            _append_wall(root, idx, part)
            continue
        if part.type == "window":
            _append_window(root, idx, part)
            continue
        if part.type == "door":
            _append_door(root, idx, part)
            continue
        if part.type == "foundation":
            _append_foundation(root, part, request.a_a)

    return ET.tostring(root, encoding="unicode")
