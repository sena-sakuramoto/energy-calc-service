"""Production readiness checks for confirmation-grade operation."""

from __future__ import annotations

from pathlib import Path
from urllib.parse import urlparse

from app.core.config import Settings, settings
from app.services import report


DEV_SECRET_VALUE = "dev-only-change-in-production"
MIN_SECRET_LENGTH = 24


def _is_https_url(url: str) -> bool:
    parsed = urlparse(url)
    return parsed.scheme.lower() == "https" and bool(parsed.netloc)


def evaluate_production_readiness(
    config: Settings = settings,
    *,
    template_path: Path | None = None,
    official_api_base_url: str | None = None,
) -> dict:
    """Evaluate whether runtime configuration is ready for production operation."""
    target_template = Path(template_path) if template_path else report.STANDARD_TEMPLATE
    api_base_url = official_api_base_url or report.API_BASE
    database_url = config.DATABASE_URL.strip()

    checks = {
        "secret_key": config.SECRET_KEY != DEV_SECRET_VALUE and len(config.SECRET_KEY) >= MIN_SECRET_LENGTH,
        "database_url": not database_url.lower().startswith("sqlite"),
        "official_api_https": _is_https_url(api_base_url),
        "official_template_exists": target_template.exists(),
    }
    failed_checks = [name for name, ok in checks.items() if not ok]

    return {
        "ready": len(failed_checks) == 0,
        "environment": config.env,
        "checks": checks,
        "failed_checks": failed_checks,
        "official_api_base_url": api_base_url,
        "official_template_path": str(target_template),
    }
