"""Very small default efficiency database used by compliance calc."""

from typing import Dict

DEFAULT_EFFICIENCIES: Dict[str, Dict[str, float]] = {
    "heating": {
        "ルームエアコン": 3.8,
        "エアコン": 3.6,
        "ボイラー": 0.85,
    },
    "cooling": {
        "ルームエアコン": 3.5,
        "エアコン": 3.2,
        "チラー": 4.5,
    },
}


def get_default_efficiency(kind: str, system_type: str) -> float:
    kind_map = DEFAULT_EFFICIENCIES.get(kind, {})
    return kind_map.get(system_type, 3.5 if kind == "cooling" else 3.8)

