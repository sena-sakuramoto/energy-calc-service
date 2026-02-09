"""API v1 routes."""

import io
from fastapi import APIRouter, HTTPException, UploadFile, File
from fastapi.responses import StreamingResponse
from app.core.config import settings
from app.schemas.calc import (
    PowerRequest, PowerResponse,
    EnergyRequest, EnergyResponse,
    CostRequest, CostResponse,
    DeviceUsageRequest, DeviceUsageResponse
)
from app.schemas.tariff import QuoteRequest, QuoteResponse
from app.schemas.bei import BEIRequest, BEIResponse
from app.services.energy import (
    power_from_vi, energy_from_power, cost_from_energy, aggregate_device_usage
)
from app.services.tariff import quote_bill
from app.services.bei import evaluate_bei
from app.services.report import (
    get_official_report_from_api,
    get_official_compute_from_api,
    get_official_report_from_excel,
    get_official_compute_from_excel,
    SMALLMODEL_UPLOAD_UNSUPPORTED_MESSAGE,
)
from app.services.readiness import evaluate_production_readiness
from app.api.v1.bei_catalog import router as bei_catalog_router
from app.api.v1.compliance import router as compliance_router

router = APIRouter()

# Health endpoint under v1
@router.get("/healthz", summary="API v1 health")
async def v1_health():
    return {"status": "ok", "service": settings.app_name, "scope": "v1"}

# Calculation endpoints
@router.post("/calc/power", response_model=PowerResponse, summary="Calculate power from voltage and current")
async def calculate_power(request: PowerRequest) -> PowerResponse:
    """
    Calculate electrical power from voltage, current, and power factor.
    Supports both single-phase and three-phase calculations.
    """
    try:
        return power_from_vi(request)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Power calculation error: {str(e)}")


@router.post("/calc/energy", response_model=EnergyResponse, summary="Calculate energy from power and time")
async def calculate_energy(request: EnergyRequest) -> EnergyResponse:
    """
    Calculate energy consumption from power and duration.
    Accepts power in watts or kilowatts.
    """
    try:
        return energy_from_power(request)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Energy calculation error: {str(e)}")


@router.post("/calc/cost", response_model=CostResponse, summary="Calculate cost from energy consumption")
async def calculate_cost(request: CostRequest) -> CostResponse:
    """
    Calculate cost from energy consumption and tariff rate.
    Includes fixed costs and tax calculation.
    """
    try:
        return cost_from_energy(request)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Cost calculation error: {str(e)}")


@router.post("/calc/device-usage", response_model=DeviceUsageResponse, summary="Aggregate device energy usage")
async def calculate_device_usage(request: DeviceUsageRequest) -> DeviceUsageResponse:
    """
    Aggregate energy usage from multiple devices.
    Returns total consumption and individual device breakdowns.
    """
    try:
        return aggregate_device_usage(request)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Device usage calculation error: {str(e)}")


# Tariff endpoints
@router.post("/tariffs/quote", response_model=QuoteResponse, summary="Generate tariff quote")
async def generate_quote(request: QuoteRequest) -> QuoteResponse:
    """
    Generate a detailed bill quote based on tariff structure and usage.
    Supports flat, tiered, and time-of-use tariffs with various charges.
    """
    try:
        return quote_bill(request)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Quote generation error: {str(e)}")


# BEI endpoints
@router.post("/bei/evaluate", response_model=BEIResponse, summary="Evaluate Building Energy Index")
async def evaluate_building_bei(request: BEIRequest) -> BEIResponse:
    """
    Evaluate Building Energy Index (BEI) for single or mixed-use buildings.
    Calculates design vs. standard primary energy consumption.
    """
    try:
        return evaluate_bei(request)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"BEI計算エラー: {str(e)}")


# Include BEI catalog routes
router.include_router(bei_catalog_router, prefix="/bei/catalog", tags=["BEI Catalog"])

# Compliance (official calc) routes
router.include_router(compliance_router, prefix="/compliance", tags=["Compliance"])


# ── 公式API連携エンドポイント（lowenergy.jp v380） ────────────────────────

@router.get(
    "/official/readiness",
    summary="本番運用 readiness 判定",
    description="確認申請運用に必要な本番設定をサーバー側で判定します。",
    tags=["Official API"],
)
def get_official_readiness():
    """運用 readiness チェック結果を返す。"""
    return evaluate_production_readiness(settings)

@router.post(
    "/official/report",
    summary="公式様式PDF取得（入力データから）",
    description="入力データをExcelテンプレートに記入し、国交省公式API (v380) で公式様式PDFを生成します。",
    tags=["Official API"],
)
async def get_official_report(request: BEIRequest):
    """入力データ → 公式Excelテンプレート → lowenergy.jp v380 API → 公式PDF"""
    try:
        input_data = _bei_request_to_report_input(request)
        pdf_bytes = get_official_report_from_api(input_data)
        return StreamingResponse(
            io.BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=official_report.pdf"},
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"公式レポート生成に失敗しました: {str(e)}")


@router.post(
    "/official/compute",
    summary="公式計算実行（入力データから）",
    description="入力データをExcelテンプレートに記入し、国交省公式API (v380) で計算を実行します。",
    tags=["Official API"],
)
async def get_official_compute(request: BEIRequest):
    """入力データ → 公式Excelテンプレート → lowenergy.jp v380 API → 公式計算結果JSON"""
    try:
        input_data = _bei_request_to_report_input(request)
        result = get_official_compute_from_api(input_data)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"公式計算に失敗しました: {str(e)}")


@router.post(
    "/official/upload-report",
    summary="公式様式PDF取得（Excelアップロード）",
    description="ユーザーが記入済みの公式入力シート(xlsx/xlsm)をアップロードし、公式様式PDFを取得します。",
    tags=["Official API"],
)
async def upload_excel_get_report(file: UploadFile = File(..., description="公式入力シート (.xlsx/.xlsm)")):
    """ユーザーアップロードExcel → lowenergy.jp v380 API → 公式PDF"""
    if not file.filename.endswith((".xlsx", ".xlsm")):
        raise HTTPException(status_code=400, detail="Excelファイル (.xlsx または .xlsm) をアップロードしてください。")
    try:
        excel_bytes = await file.read()
        pdf_bytes = get_official_report_from_excel(excel_bytes)
        safe_name = file.filename.rsplit(".", 1)[0] + "_official_report.pdf"
        return StreamingResponse(
            io.BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={safe_name}"},
        )
    except ValueError as e:
        detail = str(e)
        if detail == SMALLMODEL_UPLOAD_UNSUPPORTED_MESSAGE:
            raise HTTPException(status_code=400, detail=detail)
        raise HTTPException(status_code=400, detail=f"Excel入力に問題があります: {detail}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"公式レポート生成に失敗しました: {str(e)}")


@router.post(
    "/official/upload-compute",
    summary="公式計算実行（Excelアップロード）",
    description="ユーザーが記入済みの公式入力シート(xlsx/xlsm)をアップロードし、公式計算結果を取得します。",
    tags=["Official API"],
)
async def upload_excel_get_compute(file: UploadFile = File(..., description="公式入力シート (.xlsx/.xlsm)")):
    """ユーザーアップロードExcel → lowenergy.jp v380 API → 公式計算結果JSON"""
    if not file.filename.endswith((".xlsx", ".xlsm")):
        raise HTTPException(status_code=400, detail="Excelファイル (.xlsx または .xlsm) をアップロードしてください。")
    try:
        excel_bytes = await file.read()
        result = get_official_compute_from_excel(excel_bytes)
        return result
    except ValueError as e:
        detail = str(e)
        if detail == SMALLMODEL_UPLOAD_UNSUPPORTED_MESSAGE:
            raise HTTPException(status_code=400, detail=detail)
        raise HTTPException(status_code=400, detail=f"Excel入力に問題があります: {detail}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"公式計算に失敗しました: {str(e)}")


def _bei_request_to_report_input(request: BEIRequest) -> dict:
    """BEIRequest → report.pyの_write_data_to_workbook()が期待するinput_data形式に変換。

    official_input フィールドがある場合はそれを使用。
    ない場合は旧形式(簡易BEI)からの最低限変換を行う。
    """
    oi = request.official_input
    if oi is not None:
        # 公式入力シート用の完全データが提供されている
        result: dict = {
            "building": oi.building.model_dump(exclude_none=True),
        }
        for key in [
            "windows", "insulations", "envelopes",
            "heat_sources", "outdoor_air", "pumps", "fans",
            "ventilations", "lightings", "hot_waters",
            "elevators", "solar_pvs", "cogenerations",
        ]:
            items = getattr(oi, key, None)
            if items:
                result[key] = [item.model_dump(exclude_none=True) for item in items]
        return result

    # 旧形式 (簡易BEI計算用) からの最低限変換
    return {
        "building": {
            "calc_floor_area": request.building_area_m2,
            "building_type": request.use,
            "region": request.zone,
        },
    }
