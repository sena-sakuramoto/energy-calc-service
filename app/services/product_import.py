"""Import product data from YAML files into PostgreSQL."""

from __future__ import annotations

import logging
from pathlib import Path

import yaml
from sqlalchemy.orm import Session

from app.models.product import Product

logger = logging.getLogger(__name__)
PRODUCTS_DIR = Path(__file__).resolve().parents[2] / "data" / "products"

SPEC_FIELDS = {
    "windows": ["window_type", "frame_type", "glass_type", "u_value", "eta_c", "eta_h", "source"],
    "insulation": ["category", "material_type", "lambda_value", "typical_thickness_mm", "source"],
    "hvac": ["equipment_type", "capacity_kw", "apf", "cop_cooling", "cop_heating", "source"],
    "lighting": ["fixture_type", "lm_per_w", "wattage", "dimming", "source"],
    "solar": ["cell_type", "capacity_kw", "efficiency_percent", "panel_area_m2", "source"],
}


def import_category(db: Session, category: str) -> int:
    """Import all products from a YAML category file. Returns count imported."""
    path = PRODUCTS_DIR / f"{category}.yaml"
    if not path.exists():
        logger.warning("Product file not found: %s", path)
        return 0

    with open(path, "r", encoding="utf-8") as f:
        items = yaml.safe_load(f) or []

    count = 0
    spec_keys = SPEC_FIELDS.get(category, [])

    for item in items:
        product_id = item.get("id")
        if not product_id:
            continue

        existing = db.query(Product).filter(Product.product_id == product_id).first()
        specs = {k: item[k] for k in spec_keys if k in item}

        if existing:
            existing.category = category
            existing.manufacturer = item.get("manufacturer", existing.manufacturer)
            existing.series = item.get("series", existing.series)
            existing.name = item.get("name", existing.name)
            existing.specs = specs
            existing.partner = item.get("partner", False)
            existing.catalog_url = item.get("catalog_url")
            existing.recommended_zones = item.get("recommended_zones")
            existing.recommended_uses = item.get("recommended_uses")
            existing.source = f"data/products/{category}.yaml"
        else:
            product = Product(
                product_id=product_id,
                category=category,
                manufacturer=item.get("manufacturer", ""),
                series=item.get("series", ""),
                name=item.get("name", ""),
                partner=item.get("partner", False),
                catalog_url=item.get("catalog_url"),
                specs=specs,
                recommended_zones=item.get("recommended_zones"),
                recommended_uses=item.get("recommended_uses"),
                source=f"data/products/{category}.yaml",
            )
            db.add(product)

        count += 1

    db.commit()
    logger.info("Imported %d products for category '%s'", count, category)
    return count


def import_all(db: Session) -> dict:
    """Import all product categories."""
    results = {}
    for category in ["windows", "insulation", "hvac", "lighting", "solar"]:
        results[category] = import_category(db, category)
    return results
