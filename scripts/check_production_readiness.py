#!/usr/bin/env python3
"""Check confirmation-grade production readiness and exit non-zero on failure."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from app.core.config import Settings
from app.services.readiness import evaluate_production_readiness


def _parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Check production readiness status.")
    parser.add_argument(
        "--format",
        choices=("text", "json"),
        default="text",
        help="Output format.",
    )
    parser.add_argument(
        "--template-path",
        type=Path,
        default=None,
        help="Override template path for readiness checks.",
    )
    parser.add_argument(
        "--official-api-base-url",
        default=None,
        help="Override official API base URL for readiness checks.",
    )
    return parser.parse_args()


def _render_text(result: dict) -> str:
    lines = [
        f"Production readiness: {'PASS' if result['ready'] else 'FAIL'}",
        f"Environment: {result['environment']}",
        f"Template: {result['official_template_path']}",
        f"Official API: {result['official_api_base_url']}",
        "Checks:",
    ]
    for name, ok in result["checks"].items():
        lines.append(f"  - {name}: {'ok' if ok else 'ng'}")
    if result["failed_checks"]:
        lines.append(f"Failed checks: {', '.join(result['failed_checks'])}")
    else:
        lines.append("Failed checks: none")
    return "\n".join(lines)


def main() -> int:
    args = _parse_args()
    config = Settings()
    result = evaluate_production_readiness(
        config,
        template_path=args.template_path,
        official_api_base_url=args.official_api_base_url,
    )

    if args.format == "json":
        print(json.dumps(result, ensure_ascii=False))
    else:
        print(_render_text(result))

    return 0 if result["ready"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
