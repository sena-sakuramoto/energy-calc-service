# Phase 3: パートナー展開 — YKK AP・パナソニック製品DB完全版 + パートナー管理

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** YKK AP・パナソニックの製品DBを完全版にし、パートナー管理ダッシュボード（紹介実績・リードデータ・スポンサーレポート）を構築。テクノストラクチャー加盟店向けオンボーディングフローを実装。

**ビジネスモデル:** 建築士は完全無料。メーカースポンサー収益（優先表示・データ提供・リード課金）。2026年4月にYKK APとパナソニック住宅事業が同一グループ化（YKKグループ統合提案として展開）。

**Architecture:** 製品DBをYAMLからPostgreSQLに移行（製品数増加対応）。パートナー管理は管理者専用ページ。テクノストラクチャー向けは専用ランディングページ + 一括登録API。

**Tech Stack:** FastAPI, Next.js 14, Tailwind CSS, PostgreSQL, Chart.js

**前提:** Phase 1 + Phase 2 が完了していること

**UI設計原則:** CLAUDE.mdの12原則に従うこと。特に原則1（選択肢 > 自由入力）と原則2（AI出力にアクションボタン）を厳守。デザイン禁止事項（AIグラデーション青→紫、Inter、Lucideのみ、shadcnデフォルト）を遵守。

**完了条件:**
- YKK AP全APWシリーズ（430/330/230 + 全窓種別）のデータが製品DBに存在
- パナソニック空調・照明・太陽光の主要製品ラインがDBに存在
- パートナー管理ダッシュボード（/admin/partners）で紹介実績・月次レポートが表示される
- テクノストラクチャー向けLP（/techno）からの一括登録が動作する
- `pytest` 全テストPASS
- `cd frontend && npm run build` 成功

---

## Task 1: 製品DBをPostgreSQLに移行

**Files:**
- Create: `app/models/product.py`
- Create: `app/services/product_import.py`
- Modify: `app/services/products.py` (DB読み込みに変更)
- Modify: `app/db/base.py` (モデル import)
- Create: `tests/test_product_db.py`

**Step 1: Productモデル**

`app/models/product.py`:

```python
"""Product catalog model for PostgreSQL storage."""
from sqlalchemy import Column, Integer, String, Float, Boolean, Text, JSON
from sqlalchemy.sql import func
from sqlalchemy import DateTime

from app.db.base import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(String(100), unique=True, nullable=False, index=True)
    category = Column(String(50), nullable=False, index=True)  # windows, insulation, hvac, lighting
    manufacturer = Column(String(100), nullable=False, index=True)
    series = Column(String(100), nullable=True)
    name = Column(String(200), nullable=False)
    partner = Column(Boolean, default=False, index=True)
    catalog_url = Column(String(500), nullable=True)
    # 全カテゴリ共通のスペックをJSONで保持
    specs = Column(JSON, nullable=False, default=dict)
    # フィルタ用
    recommended_zones = Column(JSON, nullable=True)  # [1,2,3,...]
    recommended_uses = Column(JSON, nullable=True)  # ["office","hotel",...]
    # メタデータ
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    source = Column(String(200), nullable=True)  # データ出典
```

**Step 2: YAMLからDBへのインポートスクリプト**

`app/services/product_import.py`:

```python
"""Import product data from YAML files into PostgreSQL."""
from __future__ import annotations

import logging
from pathlib import Path
from typing import List

import yaml
from sqlalchemy.orm import Session

from app.models.product import Product

logger = logging.getLogger(__name__)
PRODUCTS_DIR = Path(__file__).resolve().parents[2] / "data" / "products"

SPEC_FIELDS = {
    "windows": ["window_type", "frame_type", "glass_type", "u_value", "eta_c", "eta_h"],
    "insulation": ["category", "material_type", "lambda_value", "typical_thickness_mm"],
    "hvac": ["equipment_type", "capacity_kw", "apf", "cop_cooling", "cop_heating"],
    "lighting": ["fixture_type", "lm_per_w", "wattage", "dimming"],
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
        pid = item.get("id")
        if not pid:
            continue

        existing = db.query(Product).filter(Product.product_id == pid).first()
        specs = {k: item[k] for k in spec_keys if k in item}

        if existing:
            existing.name = item.get("name", existing.name)
            existing.specs = specs
            existing.partner = item.get("partner", False)
            existing.recommended_zones = item.get("recommended_zones")
            existing.recommended_uses = item.get("recommended_uses")
        else:
            product = Product(
                product_id=pid,
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
    for category in ["windows", "insulation", "hvac", "lighting"]:
        results[category] = import_category(db, category)
    return results
```

**Step 3: products.py をDB読み込みに変更**

`app/services/products.py` を更新:

```python
"""Product database service — reads from PostgreSQL with YAML fallback."""
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
            return [_row_to_dict(r) for r in rows]

    # YAML fallback
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
    for p in products:
        if zone is not None:
            zones = p.get("recommended_zones", [])
            if zones and zone not in zones:
                continue
        if use is not None:
            uses = p.get("recommended_uses", [])
            if uses and use not in uses:
                continue
        filtered.append(p)

    filtered.sort(key=lambda p: (not p.get("partner", False), p.get("name", "")))
    return filtered


def _row_to_dict(row: Product) -> Dict[str, Any]:
    """Convert a Product ORM row to a flat dict matching YAML format."""
    d = {
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
        d.update(row.specs)
    return d
```

**Step 4: テスト → Commit**

```bash
pytest -v
git add app/models/product.py app/services/product_import.py app/services/products.py app/db/base.py tests/test_product_db.py
git commit -m "feat(data): migrate product catalog to PostgreSQL with YAML fallback"
```

---

## Task 2: YKK AP 製品DB完全版

**Files:**
- Modify: `data/products/windows.yaml` (APWシリーズ全窓種別追加)

**Step 1: YKK AP全APWシリーズを追加**

既存の windows.yaml に以下を追加（Phase 1の5製品に加えて）:
- APW 430: FIX, 引違い, 縦すべり出し, 横すべり出し, 上げ下げ
- APW 330: FIX, 引違い, 縦すべり出し, 横すべり出し
- APW 230: 引違い, FIX
- エピソードNEO: 引違い, FIX

各製品の U値・eta_c・eta_h は YKK AP公式技術資料（対象製品性能一覧表）から取得すること。
URL: https://www.ykkap.co.jp/business/law/supportguide/products_28/index3.php

**注意:** U値は代表的なガラス構成（Low-Eアルゴン複層/トリプル）での標準値を使用。
実際のU値はガラス仕様・サイズにより変動するため、「参考値」と明記する `source` フィールドを追加。

全製品に `partner: true` を設定（YKK APはパートナー）。

**Step 2: Commit**

```bash
git add data/products/windows.yaml
git commit -m "feat(data): expand YKK AP window DB - all APW series and frame types"
```

---

## Task 3: パナソニック製品DB完全版

**Files:**
- Modify: `data/products/hvac.yaml` (パナソニック製品ライン拡充)
- Modify: `data/products/lighting.yaml` (パナソニック照明ライン拡充)
- Create: `data/products/solar.yaml` (太陽光発電)

**Step 1: パナソニック空調を拡充**

hvac.yaml に以下シリーズを追加:
- Xシリーズ（天井カセット形、壁掛形、床置形）
- Gシリーズ（天井吊形、床置形）
- ビル用マルチ（XLPV, XLHV）
- 各シリーズの主要容量帯（5.6kW, 11.2kW, 14.0kW, 22.4kW, 28.0kW）

全製品に `partner: true` を設定。

**Step 2: パナソニック照明を拡充**

lighting.yaml に以下を追加:
- iDシリーズ（省エネタイプ、一般タイプ、スリムタイプ）
- 一体型LEDベースライト
- ダウンライト（高効率、一般）
- 高天井用LED照明

**Step 3: 太陽光発電DB新規作成**

`data/products/solar.yaml`:

```yaml
# 太陽光発電製品データベース

- id: panasonic-hit-250
  manufacturer: "パナソニック"
  series: "HIT"
  name: "HIT P250 アルファ"
  cell_type: "HIT"
  capacity_kw: 0.250
  efficiency_percent: 19.9
  panel_area_m2: 1.26
  partner: true
  catalog_url: "https://sumai.panasonic.jp/solar/"

# ... 他のパナソニック太陽光製品を追加
```

**Step 4: Commit**

```bash
git add data/products/
git commit -m "feat(data): expand Panasonic product DB - HVAC, lighting, solar PV"
```

---

## Task 4: パートナー管理ダッシュボード

**Files:**
- Create: `frontend/src/pages/admin/partners.jsx`
- Modify: `app/api/v1/referral.py` (集計エンドポイント追加)

**Step 1: 集計APIエンドポイント**

`app/api/v1/referral.py` に追加:

```python
from sqlalchemy import func as sql_func, extract


@router.get("/stats")
async def referral_stats(db: Session = Depends(get_db)):
    """紹介実績の集計（パートナー管理用）。"""
    total = db.query(sql_func.count(Referral.id)).scalar()
    by_status = dict(
        db.query(Referral.status, sql_func.count(Referral.id))
        .group_by(Referral.status).all()
    )
    by_manufacturer = dict(
        db.query(Referral.manufacturer, sql_func.count(Referral.id))
        .group_by(Referral.manufacturer).all()
    )
    by_month = (
        db.query(
            extract("year", Referral.created_at).label("year"),
            extract("month", Referral.created_at).label("month"),
            sql_func.count(Referral.id).label("count"),
        )
        .group_by("year", "month")
        .order_by("year", "month")
        .all()
    )
    return {
        "total": total,
        "by_status": by_status,
        "by_manufacturer": by_manufacturer,
        "by_month": [{"year": int(r.year), "month": int(r.month), "count": r.count} for r in by_month],
    }
```

**Step 2: パートナー管理画面**

`frontend/src/pages/admin/partners.jsx`:

建築士向けUIとは異なり、管理者向け画面:
- 紹介総数、ステータス別件数
- メーカー別紹介件数（棒グラフ: Chart.js）
- 月次推移グラフ
- 紹介一覧テーブル（ステータス変更可能）
- 手数料試算（紹介件数 × 想定単価）

**注意:** Chart.js は既に frontend/package.json に含まれている（chart.js + react-chartjs-2）

**Step 3: ビルド → Commit**

```bash
cd frontend && npm run build
git add frontend/src/pages/admin/partners.jsx app/api/v1/referral.py
git commit -m "feat(admin): add partner management dashboard with referral stats"
```

---

## Task 5: テクノストラクチャー向けオンボーディング

**Files:**
- Create: `frontend/src/pages/techno.jsx` (専用LP)
- Create: `app/api/v1/onboarding.py` (一括登録API)

**Step 1: テクノストラクチャー専用LP**

`frontend/src/pages/techno.jsx`:

パナソニック テクノストラクチャー加盟工務店向けの専用ランディングページ:
- テクノストラクチャー × 楽々省エネ計算 の連携説明
- 「テクノストラクチャー加盟店は完全無料で使えます」のCTA
- 一括登録フォーム（会社名、メール、加盟店番号）
- パナソニック製品が優先表示される旨の説明
- 構造計算（テクノストラクチャー）+ 省エネ計算（楽々）= ワンストップの訴求
- 外注費削減シミュレーション（年間5棟 × 6万円 = 30万円削減）

**Step 2: 一括登録API**

`app/api/v1/onboarding.py`:

```python
"""Bulk onboarding for partner distributor networks (e.g., Technostructure)."""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from typing import List, Optional

router = APIRouter(prefix="/onboarding", tags=["Onboarding"])


class OnboardingRequest(BaseModel):
    company_name: str
    email: EmailStr
    phone: Optional[str] = None
    partner_code: Optional[str] = None  # テクノストラクチャー加盟店番号
    source: str = "technostructure"


@router.post("/register")
async def register_partner_user(req: OnboardingRequest):
    """パートナーネットワーク経由のユーザー登録。"""
    # TODO: DBに保存 + ウェルカムメール送信 + Stripe顧客作成
    return {
        "status": "registered",
        "message": f"{req.company_name}様の登録を受け付けました。ご案内メールをお送りします。",
        "source": req.source,
    }
```

**Step 3: ルーター追加 + ビルド → Commit**

```bash
git add frontend/src/pages/techno.jsx app/api/v1/onboarding.py app/main.py
git commit -m "feat(partner): add Technostructure onboarding LP and bulk registration API"
```

---

## Task 6: Phase 3 最終確認

```bash
pytest -v
cd frontend && npm run build
git push origin main
```

---

## 完了後のチェックリスト

- [ ] YKK AP製品DB: APW 430/330/230 + エピソードNEO の全窓種別が登録済み
- [ ] パナソニック製品DB: 空調(X/Gシリーズ+マルチ)、照明(iDシリーズ+DL)、太陽光(HIT)
- [ ] /admin/partners で紹介実績・月次グラフが表示される
- [ ] /techno からテクノストラクチャー加盟店が登録できる
- [ ] 全テストPASS
- [ ] フロントエンドビルド成功
