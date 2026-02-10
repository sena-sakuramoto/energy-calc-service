"""Tests for official route registration and metadata."""

import asyncio
import inspect

from app.api.v1.routes import router as v1_router


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
