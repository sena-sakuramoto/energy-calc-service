"""Tests for official route registration and metadata."""

import asyncio
import inspect

import pytest
from fastapi import HTTPException

from app.api.v1 import routes as routes_module
from app.api.v1.routes import router as v1_router
from app.schemas.bei import BEIRequest


def test_official_version_route_exists_and_returns_metadata() -> None:
    route = next(
        (item for item in v1_router.routes if getattr(item, "path", "") == "/official/version"),
        None,
    )
    assert route is not None
    assert "GET" in route.methods

    endpoint = route.endpoint
    result = endpoint()
    payload = asyncio.run(result) if inspect.iscoroutine(result) else result

    assert payload["official_routes_enabled"] is True
    assert payload["official_api_base"].startswith("https://api.lowenergy.jp/")
    assert payload["api_prefix"] == "/api/v1"


def test_run_official_with_timeout_returns_504_on_deadline(monkeypatch) -> None:
    monkeypatch.setattr(routes_module, "OFFICIAL_ROUTE_TIMEOUT_SECONDS", 0.01)

    def blocking_call():
        import time

        time.sleep(0.05)
        return {"Status": "OK"}

    with pytest.raises(HTTPException) as exc:
        asyncio.run(routes_module._run_official_with_timeout(blocking_call))

    assert exc.value.status_code == 504
    assert "中断しました" in str(exc.value.detail)


def test_official_compute_maps_timeout_error_to_504(monkeypatch) -> None:
    async def fake_run_with_timeout(*_args, **_kwargs):
        raise routes_module.OfficialAPITimeoutError("upstream timeout")

    monkeypatch.setattr(routes_module, "_run_official_with_timeout", fake_run_with_timeout)

    request = BEIRequest(
        building_area_m2=100.0,
        use="office",
        zone="6",
        design_energy=[],
    )

    with pytest.raises(HTTPException) as exc:
        asyncio.run(routes_module.get_official_compute(request))

    assert exc.value.status_code == 504
    assert "タイムアウトしました" in str(exc.value.detail)
