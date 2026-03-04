"""Regression checks for residential PDF font handling and TS migration."""

from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]

PDF_FONT_HELPER = REPO_ROOT / "frontend/src/residential/output/pdfFont.ts"
PDF_CALC_REPORT = REPO_ROOT / "frontend/src/residential/output/pdfCalcReport.ts"
PDF_AREA_TABLE = REPO_ROOT / "frontend/src/residential/output/pdfAreaTable.ts"

ENGINE_TS_FILES = [
    "frontend/src/residential/engine/calcUA.ts",
    "frontend/src/residential/engine/calcEtaAC.ts",
    "frontend/src/residential/engine/calcAreas.ts",
    "frontend/src/residential/engine/buildEnvelope.ts",
    "frontend/src/residential/engine/types.ts",
    "frontend/src/residential/engine/tables/orientationCoeff.ts",
    "frontend/src/residential/engine/tables/tempDiffCoeff.ts",
    "frontend/src/residential/engine/tables/materialConductivity.ts",
    "frontend/src/residential/engine/tables/windowCombination.ts",
]


def test_residential_pdf_generators_embed_japanese_font() -> None:
    helper_source = PDF_FONT_HELPER.read_text(encoding="utf-8")
    assert "NotoSansJPN-Regular.ttf" in helper_source
    assert "addFileToVFS" in helper_source
    assert "addFont" in helper_source

    calc_source = PDF_CALC_REPORT.read_text(encoding="utf-8")
    area_source = PDF_AREA_TABLE.read_text(encoding="utf-8")

    assert "export async function generateResidentialCalcReportPdf" in calc_source
    assert "export async function generateAreaTablePdf" in area_source
    assert "await applyJapanesePdfFont(doc)" in calc_source
    assert "await applyJapanesePdfFont(doc)" in area_source


def test_residential_calc_engine_is_migrated_to_typescript() -> None:
    for rel in ENGINE_TS_FILES:
        assert (REPO_ROOT / rel).exists(), f"TypeScript source missing: {rel}"
