"""Product database service - reads from PostgreSQL with YAML fallback."""

from __future__ import annotations

from pathlib import Path
from typing import Any, Dict, List, Optional

import yaml
from sqlalchemy.orm import Session

from app.models.product import Product

PRODUCTS_DIR = Path(__file__).resolve().parents[2] / "data" / "products"


def load_products(category: str, db: Optional[Session] = None) -> List[Dict[str, Any]]:
    """Load products. Try DB first, fallback to YAML."""
    if db is not None:
        rows = db.query(Product).filter(Product.category == category).all()
        if rows:
            return [_row_to_dict(row) for row in rows]

    path = PRODUCTS_DIR / f"{category}.yaml"
    if not path.exists():
        raise FileNotFoundError(f"Product category not found: {category}")

    with open(path, "r", encoding="utf-8") as f:
        return yaml.safe_load(f) or []


def get_recommended_products(
    category: str,
    *,
    zone: Optional[int] = None,
    use: Optional[str] = None,
    db: Optional[Session] = None,
) -> List[Dict[str, Any]]:
    """Return products filtered by zone/use, partner products first."""
    products = load_products(category, db=db)

    filtered = []
    for product in products:
        if zone is not None:
            zones = product.get("recommended_zones", [])
            if zones and zone not in zones:
                continue
        if use is not None:
            uses = product.get("recommended_uses", [])
            if uses and use not in uses:
                continue
        filtered.append(product)

    filtered.sort(key=lambda p: (not p.get("partner", False), p.get("name", "")))
    return filtered


def _row_to_dict(row: Product) -> Dict[str, Any]:
    """Convert a Product ORM row to a flat dict matching YAML format."""
    data = {
        "id": row.product_id,
        "manufacturer": row.manufacturer,
        "series": row.series,
        "name": row.name,
        "partner": row.partner,
        "catalog_url": row.catalog_url,
        "recommended_zones": row.recommended_zones or [],
        "recommended_uses": row.recommended_uses or [],
    }
    if row.specs:
        data.update(row.specs)
    return data
