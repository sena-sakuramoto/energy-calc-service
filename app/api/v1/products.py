"""Product catalog API endpoints."""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.product_event import ProductEvent
from app.services.ai_recommend import get_ai_recommendations
from app.services.products import get_recommended_products, load_products

router = APIRouter(prefix="/products", tags=["Products"])


@router.get("/{category}")
async def list_products(
    category: str,
    zone: Optional[int] = Query(None, ge=1, le=8, description="地域区分 1-8"),
    use: Optional[str] = Query(None, description="建物用途 (例: office, hotel)"),
    db: Session = Depends(get_db),
) -> dict:
    """製品一覧を返す。zone/useでフィルタ可能。パートナー製品が優先表示。"""
    try:
        if zone is not None or use is not None:
            products = get_recommended_products(category, zone=zone, use=use, db=db)
        else:
            products = load_products(category, db=db)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"カテゴリ '{category}' は存在しません。")

    return {"category": category, "count": len(products), "products": products}


@router.post("/recommend")
async def recommend_products(
    zone: int = Query(..., ge=1, le=8),
    use: str = Query(...),
    floor_area: float = Query(..., gt=0),
    current_bei: Optional[float] = Query(None),
) -> dict:
    """AI が建物条件に基づいて最適な製品を推薦。パートナー製品優先。"""
    recommendations = await get_ai_recommendations(
        zone=zone,
        use=use,
        floor_area=floor_area,
        current_bei=current_bei,
    )
    return {"recommendations": recommendations, "count": len(recommendations)}


@router.post("/track-selection")
async def track_product_selection(
    product_id: str,
    product_name: str,
    manufacturer: str,
    category: str,
    building_zone: Optional[int] = None,
    building_use: Optional[str] = None,
    floor_area: Optional[float] = None,
    session_id: Optional[str] = None,
    db: Session = Depends(get_db),
) -> dict:
    """製品選択イベントを記録（メーカーデータレポート用）。"""
    event = ProductEvent(
        event_type="selected",
        product_id=product_id,
        product_name=product_name,
        manufacturer=manufacturer,
        category=category,
        building_zone=building_zone,
        building_use=building_use,
        floor_area=floor_area,
        session_id=session_id,
    )
    db.add(event)
    db.commit()
    return {"status": "tracked"}
