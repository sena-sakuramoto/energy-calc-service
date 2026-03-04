"""Residential envelope verification endpoints."""

from decimal import Decimal, ROUND_HALF_UP

from fastapi import APIRouter

from app.schemas.residential import (
    ResidentialBackendResult,
    ResidentialComparison,
    ResidentialOfficialComparison,
    ResidentialOfficialResult,
    ResidentialVerifyRequest,
    ResidentialVerifyResponse,
)
from app.services.residential_official_api import OfficialAPIError, call_official_envelope_api
from app.services.residential_xml_builder import build_envelope_xml

router = APIRouter(prefix="/residential", tags=["Residential"])


# pyhees section3_2_c table_2 (cooling season coefficients)
_COOLING_TABLE = {
    1: {"TOP": 1.0, "N": 0.329, "NE": 0.430, "E": 0.545, "SE": 0.560, "S": 0.502, "SW": 0.526, "W": 0.508, "NW": 0.411, "BOTTOM": 0.0},
    2: {"TOP": 1.0, "N": 0.341, "NE": 0.412, "E": 0.503, "SE": 0.527, "S": 0.507, "SW": 0.548, "W": 0.529, "NW": 0.428, "BOTTOM": 0.0},
    3: {"TOP": 1.0, "N": 0.335, "NE": 0.390, "E": 0.468, "SE": 0.487, "S": 0.476, "SW": 0.550, "W": 0.553, "NW": 0.447, "BOTTOM": 0.0},
    4: {"TOP": 1.0, "N": 0.322, "NE": 0.426, "E": 0.518, "SE": 0.508, "S": 0.437, "SW": 0.481, "W": 0.481, "NW": 0.401, "BOTTOM": 0.0},
    5: {"TOP": 1.0, "N": 0.373, "NE": 0.437, "E": 0.500, "SE": 0.500, "S": 0.472, "SW": 0.520, "W": 0.518, "NW": 0.442, "BOTTOM": 0.0},
    6: {"TOP": 1.0, "N": 0.341, "NE": 0.431, "E": 0.512, "SE": 0.498, "S": 0.434, "SW": 0.491, "W": 0.504, "NW": 0.427, "BOTTOM": 0.0},
    7: {"TOP": 1.0, "N": 0.307, "NE": 0.415, "E": 0.509, "SE": 0.490, "S": 0.412, "SW": 0.479, "W": 0.495, "NW": 0.406, "BOTTOM": 0.0},
    8: {"TOP": 1.0, "N": 0.325, "NE": 0.414, "E": 0.515, "SE": 0.528, "S": 0.480, "SW": 0.517, "W": 0.505, "NW": 0.411, "BOTTOM": 0.0},
}

_ORIENTATION_ALIASES = {
    "TOP": "TOP",
    "Top": "TOP",
    "top": "TOP",
    "上面": "TOP",
    "BOTTOM": "BOTTOM",
    "Bottom": "BOTTOM",
    "bottom": "BOTTOM",
    "下面": "BOTTOM",
    "N": "N",
    "NE": "NE",
    "E": "E",
    "SE": "SE",
    "S": "S",
    "SW": "SW",
    "W": "W",
    "NW": "NW",
}


def _round_half_up(value: float, digits: int) -> float:
    quant = Decimal("1").scaleb(-digits)
    return float(Decimal(str(value)).quantize(quant, rounding=ROUND_HALF_UP))


def _calc_ua(payload: ResidentialVerifyRequest) -> float:
    sum_q = 0.0
    for part in payload.parts:
        if part.type == "foundation" and part.psi_value is not None and part.length is not None:
            sum_q += part.psi_value * part.length * part.h_value
        else:
            sum_q += part.area * part.u_value * part.h_value
    return _round_half_up(sum_q / payload.a_env, 2)


def _normalize_orientation(orientation: str) -> str:
    return _ORIENTATION_ALIASES.get(orientation, "N")


def _cooling_orientation_coeff(region: int) -> dict[str, float]:
    return _COOLING_TABLE.get(region, _COOLING_TABLE[6])


def _calc_eta_a_c(payload: ResidentialVerifyRequest) -> float:
    nu_table = _cooling_orientation_coeff(payload.region)
    f_c = 0.93
    sum_mc = 0.0
    for part in payload.parts:
        if part.eta_d_C is None:
            continue
        nu = nu_table.get(_normalize_orientation(part.orientation), 0.0)
        sum_mc += part.area * part.eta_d_C * f_c * nu
    return _round_half_up((sum_mc / payload.a_env) * 100, 1)


@router.post("/verify", response_model=ResidentialVerifyResponse, summary="Verify residential UA/etaAC")
async def verify_with_official_api(project: ResidentialVerifyRequest) -> ResidentialVerifyResponse:
    """Mirror-calculate residential UA/etaAC and compare with official API result."""

    backend_result = ResidentialBackendResult(
        ua_value=_calc_ua(project),
        eta_a_c=_calc_eta_a_c(project),
    )

    front_ua = project.front_result.ua_value if project.front_result else backend_result.ua_value
    front_eta = project.front_result.eta_a_c if project.front_result else backend_result.eta_a_c

    ua_diff = _round_half_up(abs(front_ua - backend_result.ua_value), 3)
    eta_diff = _round_half_up(abs(front_eta - backend_result.eta_a_c), 3)
    front_tolerance = 0.01

    comparison = ResidentialComparison(
        ua_match=ua_diff <= front_tolerance,
        eta_a_c_match=eta_diff <= front_tolerance,
        ua_diff=ua_diff,
        eta_a_c_diff=eta_diff,
    )

    official_result: ResidentialOfficialResult | None = None
    official_comparison: ResidentialOfficialComparison | None = None
    official_error: str | None = None

    try:
        xml_body = build_envelope_xml(project)
        official_raw = await call_official_envelope_api(xml_body)

        official_ua = float(official_raw.get("ua") or 0)
        official_eta_ac = float(official_raw.get("eta_ac") or 0)

        official_result = ResidentialOfficialResult(
            ua=_round_half_up(official_ua, 2),
            ua_standard=(
                _round_half_up(float(official_raw["ua_standard"]), 2)
                if official_raw.get("ua_standard") is not None
                else None
            ),
            eta_a_c=_round_half_up(official_eta_ac, 1),
            eta_a_c_standard=(
                _round_half_up(float(official_raw["eta_ac_standard"]), 1)
                if official_raw.get("eta_ac_standard") is not None
                else None
            ),
            eta_a_h=(
                _round_half_up(float(official_raw["eta_ah"]), 1)
                if official_raw.get("eta_ah") is not None
                else None
            ),
            total_area=(
                _round_half_up(float(official_raw["total_area"]), 2)
                if official_raw.get("total_area") is not None
                else None
            ),
        )

        official_ua_diff = _round_half_up(abs(backend_result.ua_value - official_result.ua), 3)
        official_eta_diff = _round_half_up(abs(backend_result.eta_a_c - official_result.eta_a_c), 3)
        official_comparison = ResidentialOfficialComparison(
            ua_match=official_ua_diff <= 0.01,
            eta_a_c_match=official_eta_diff <= 0.1,
            ua_diff=official_ua_diff,
            eta_a_c_diff=official_eta_diff,
        )
    except OfficialAPIError as exc:
        official_error = str(exc)

    if comparison.ua_match and comparison.eta_a_c_match:
        message = "フロント計算とバックエンド検証結果は一致しています。"
    else:
        message = "フロント計算とバックエンド検証結果に差異があります。入力値を確認してください。"

    if official_result and official_comparison:
        if official_comparison.ua_match and official_comparison.eta_a_c_match:
            message += " 公式API結果とも一致しています。"
        else:
            message += " 公式API結果とは差異があります。"
    elif official_error:
        message += " 公式API接続エラーのためローカル検証のみ実行しました。"

    return ResidentialVerifyResponse(
        backend_result=backend_result,
        comparison=comparison,
        official_result=official_result,
        official_comparison=official_comparison,
        official_error=official_error,
        message=message,
    )
