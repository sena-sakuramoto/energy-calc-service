"""Tests for production readiness checks."""

import asyncio
import json
import inspect
import os
from pathlib import Path
import subprocess
import sys

from app.core.config import Settings
from app.api.v1.routes import router as v1_router
from app.services.readiness import evaluate_production_readiness


def _prod_settings(**overrides) -> Settings:
    base = {
        "ENV": "production",
        "SECRET_KEY": "dev-only-change-in-production",
        "DATABASE_URL": "sqlite:///./energy_calc.db",
        "STRIPE_SECRET_KEY": "",
        "STRIPE_WEBHOOK_SECRET": "",
        "STRIPE_PRICE_ID_ENERGY": "",
        "STRIPE_PRICE_ID_PROJECT_PASS": "",
    }
    base.update(overrides)
    return Settings(**base)


def test_evaluate_production_readiness_fails_with_dev_defaults(tmp_path: Path) -> None:
    template = tmp_path / "official-template.xlsx"
    template.write_bytes(b"template")

    result = evaluate_production_readiness(
        _prod_settings(),
        template_path=template,
        official_api_base_url="https://api.lowenergy.jp/model/1/v380",
    )

    assert result["ready"] is False
    assert "secret_key" in result["failed_checks"]
    assert "database_url" in result["failed_checks"]


def test_evaluate_production_readiness_passes_with_production_inputs(tmp_path: Path) -> None:
    template = tmp_path / "official-template.xlsx"
    template.write_bytes(b"template")

    result = evaluate_production_readiness(
        _prod_settings(
            SECRET_KEY="this-is-a-strong-production-secret-key-2026",
            DATABASE_URL="postgresql://user:pass@db.example.com:5432/energy",
            STRIPE_SECRET_KEY="sk_test_abcdefgh1234567890",
            STRIPE_WEBHOOK_SECRET="whsec_abcdefgh1234567890",
            STRIPE_PRICE_ID_ENERGY="price_1T7wb5RpUEcUjSDNuXkUSLE2",
            STRIPE_PRICE_ID_PROJECT_PASS="price_1T7wbCRpUEcUjSDNAJtDcdAD",
        ),
        template_path=template,
        official_api_base_url="https://api.lowenergy.jp/model/1/v380",
    )

    assert result["ready"] is True
    assert result["failed_checks"] == []


def test_readiness_endpoint_shape() -> None:
    route = next(
        (item for item in v1_router.routes if getattr(item, "path", "") == "/official/readiness"),
        None,
    )
    assert route is not None
    assert "GET" in route.methods

    endpoint = route.endpoint
    result = endpoint()
    payload = asyncio.run(result) if inspect.iscoroutine(result) else result

    assert {"ready", "environment", "checks", "failed_checks"} <= set(payload.keys())
    assert isinstance(payload["checks"], dict)
    assert isinstance(payload["failed_checks"], list)


def test_cli_exit_code(tmp_path: Path) -> None:
    root = Path(__file__).resolve().parents[1]
    script = root / "scripts" / "check_production_readiness.py"
    assert script.exists()

    template = tmp_path / "official-template.xlsx"
    template.write_bytes(b"template")
    base_env = os.environ.copy()
    base_env["PYTHONPATH"] = "."
    base_env["ENV"] = "production"

    failed = subprocess.run(
        [sys.executable, str(script), "--format", "json", "--template-path", str(template)],
        cwd=root,
        env={
            **base_env,
            "SECRET_KEY": "dev-only-change-in-production",
            "DATABASE_URL": "sqlite:///./energy_calc.db",
        },
        check=False,
        capture_output=True,
        text=True,
    )
    assert failed.returncode == 1
    failed_payload = json.loads(failed.stdout)
    assert failed_payload["ready"] is False

    passed = subprocess.run(
        [sys.executable, str(script), "--format", "json", "--template-path", str(template)],
        cwd=root,
        env={
            **base_env,
            "SECRET_KEY": "this-is-a-strong-production-secret-key-2026",
            "DATABASE_URL": "postgresql://user:pass@db.example.com:5432/energy",
            "STRIPE_SECRET_KEY": "sk_test_abcdefgh1234567890",
            "STRIPE_WEBHOOK_SECRET": "whsec_abcdefgh1234567890",
            "STRIPE_PRICE_ID_ENERGY": "price_1T7wb5RpUEcUjSDNuXkUSLE2",
            "STRIPE_PRICE_ID_PROJECT_PASS": "price_1T7wbCRpUEcUjSDNAJtDcdAD",
        },
        check=False,
        capture_output=True,
        text=True,
    )
    assert passed.returncode == 0
    passed_payload = json.loads(passed.stdout)
    assert passed_payload["ready"] is True
