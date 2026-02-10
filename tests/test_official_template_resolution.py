"""Tests for official template path selection."""

from pathlib import Path

from app.services import report


def test_standard_template_prefers_tracked_frontend_path() -> None:
    expected = Path("frontend/public/templates/MODEL_inputSheet_for_Ver3.8_beta.xlsx").as_posix()
    assert report.STANDARD_TEMPLATE.as_posix().endswith(expected)


def test_small_template_prefers_tracked_frontend_path() -> None:
    expected = Path("frontend/public/templates/SMALLMODEL_inputSheet_for_Ver3.8_beta.xlsx").as_posix()
    assert report.SMALL_TEMPLATE.as_posix().endswith(expected)
