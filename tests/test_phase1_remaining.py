"""Checks for CODEX_PHASE1_REMAINING integration tasks."""

from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]


def _read(relpath: str) -> str:
    return (REPO_ROOT / relpath).read_text(encoding="utf-8")


def test_public_pages_include_residential() -> None:
    source = _read("frontend/e2e/helpers/test-data.js")
    assert "/residential" in source


def test_gitignore_contains_api_envelope_spec_pdf() -> None:
    source = _read(".gitignore")
    assert "api_envelope_spec.pdf" in source


def test_residential_page_shows_scope_notice() -> None:
    source = _read("frontend/src/pages/residential.jsx")
    assert "対応範囲" in source
    assert "戸建住宅" in source
    assert "共同住宅は今後対応予定" in source


def test_model_building_guide_lists_26_building_types() -> None:
    source = _read("frontend/src/pages/guide/model-building-method.jsx")
    # Guide should present the full 26-type list for model building method support.
    for code in [f"{i:02d}" for i in range(1, 27)]:
        assert f"'{code}'" in source or f'"{code}"' in source


def test_official_bei_uses_product_selector_for_required_steps() -> None:
    source = _read("frontend/src/pages/tools/official-bei.jsx")
    for token in [
        'category="windows"',
        'category="insulation"',
        'category="hvac"',
        'category="lighting"',
    ]:
        assert token in source
