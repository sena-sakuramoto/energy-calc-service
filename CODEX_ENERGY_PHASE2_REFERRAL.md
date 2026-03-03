# Phase 2: Stripe決済 + 紹介システム + AI製品推薦 + メーカーダッシュボード

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Stripe月額課金（¥9,800/月）、AI製品推薦エンジン、メーカー紹介フロー、メーカー向けダッシュボード、改善シミュレーションを実装する。

**ビジネスモデル:** 有料→無料スイッチ戦略。ローンチ時は月額¥9,800で建築士に売る。100社到達後にメーカースポンサーを獲得し、建築士側を無料化。サークル会員（¥5,000/月）は追加料金なしで利用可能。

**Architecture:** Stripe Checkoutで月額課金。Claude APIで製品推薦。メーカー紹介はDB管理+メール通知。メーカー向けダッシュボードで製品選択データ・リード情報をレポート表示。改善シミュレーションは製品変更→公式API再計算→差分表示。

**Tech Stack:** FastAPI, Next.js 14, Tailwind CSS, Stripe, Anthropic Claude API, Chart.js, nodemailer

**前提:** Phase 1 が完了していること（製品DB、ProductSelector、公式APIリトライ済み）

**UI設計原則:** CLAUDE.mdの12原則に従うこと。特に原則1（選択肢 > 自由入力）と原則2（AI出力にアクションボタン）を厳守。デザイン禁止事項（AIグラデーション青→紫、Inter、Lucideのみ、shadcnデフォルト）を遵守。

**完了条件:**
- Stripe Checkoutで月額¥9,800の課金が動作する
- サークル会員判定が正しく動作する（追加料金なし）
- AI推薦が建物条件に応じた製品リストを返す
- 紹介フローで見積依頼メールが送信される
- メーカーダッシュボードで製品選択回数・リード件数・地域分布が表示される
- 改善シミュレーションで製品変更→BEI差分が表示される
- `pytest` 全テストPASS
- `cd frontend && npm run build` 成功

---

## Task 1: Stripe月額課金（¥9,800/月）

**ビジネスモデル背景:** 有料→無料スイッチ戦略。ローンチ時は月額¥9,800で収益を確保。サークル会員（¥5,000/月）は楽々省エネ計算を追加料金なしで利用可能。100社到達→スポンサー獲得後に無料化する。

**Files:**
- Create: `app/services/stripe_billing.py` (Stripe課金サービス)
- Create: `app/api/v1/billing.py` (課金APIエンドポイント)
- Create: `app/middleware/subscription.py` (課金チェックミドルウェア)
- Create: `frontend/src/pages/pricing.jsx` (料金ページ)
- Create: `frontend/src/components/SubscriptionGate.jsx` (課金ゲートコンポーネント)
- Modify: `requirements.txt` (stripe追加)
- Create: `tests/test_billing.py`

**Step 1: requirements.txt に追加**

```
stripe==9.12.0
```

**Step 2: Stripe課金サービス**

`app/services/stripe_billing.py`:

```python
"""Stripe billing service for monthly subscription."""
from __future__ import annotations

import logging
import os
from typing import Optional

import stripe

logger = logging.getLogger(__name__)

STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY", "")
STRIPE_PRICE_ID = os.getenv("STRIPE_PRICE_ID_ENERGY", "")  # ¥9,800/月のPrice ID
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET_ENERGY", "")

stripe.api_key = STRIPE_SECRET_KEY


def create_checkout_session(
    *,
    customer_email: str,
    success_url: str,
    cancel_url: str,
) -> dict:
    """Create Stripe Checkout session for ¥9,800/month subscription."""
    session = stripe.checkout.Session.create(
        mode="subscription",
        payment_method_types=["card"],
        customer_email=customer_email,
        line_items=[{"price": STRIPE_PRICE_ID, "quantity": 1}],
        success_url=success_url,
        cancel_url=cancel_url,
        allow_promotion_codes=True,
    )
    return {"checkout_url": session.url, "session_id": session.id}


def check_subscription(customer_email: str) -> dict:
    """Check if user has active subscription or is a circle member."""
    # サークル会員チェック: Stripeの既存サブスクからサークル商品を検索
    customers = stripe.Customer.list(email=customer_email, limit=1)
    if not customers.data:
        return {"active": False, "reason": "no_customer"}

    customer = customers.data[0]
    subscriptions = stripe.Subscription.list(customer=customer.id, status="active")

    for sub in subscriptions.data:
        for item in sub["items"]["data"]:
            product = stripe.Product.retrieve(item["price"]["product"])
            product_name = product.get("name", "")
            # サークル会員判定 (CLAUDE.md準拠)
            if any(kw in product_name for kw in ["サークル", "circle", "Circle", "AI×建築"]):
                return {"active": True, "type": "circle_member", "subscription_id": sub.id}
            # 楽々省エネ月額判定
            if "省エネ" in product_name or "energy" in product_name.lower():
                return {"active": True, "type": "energy_subscriber", "subscription_id": sub.id}

    return {"active": False, "reason": "no_active_subscription"}
```

**Step 3: 課金APIエンドポイント**

`app/api/v1/billing.py`:

```python
"""Billing API endpoints for Stripe subscription."""
from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel, EmailStr

from app.services.stripe_billing import (
    create_checkout_session,
    check_subscription,
)

router = APIRouter(prefix="/billing", tags=["Billing"])


class CheckoutRequest(BaseModel):
    email: EmailStr
    success_url: str = "https://energy.rakusho-ene.com/dashboard?checkout=success"
    cancel_url: str = "https://energy.rakusho-ene.com/pricing"


@router.post("/checkout")
async def create_checkout(req: CheckoutRequest):
    """Stripe Checkout セッション作成。"""
    result = create_checkout_session(
        customer_email=req.email,
        success_url=req.success_url,
        cancel_url=req.cancel_url,
    )
    return result


@router.get("/status")
async def subscription_status(email: str):
    """サブスクリプション状態確認。サークル会員は追加料金なし。"""
    return check_subscription(email)
```

**Step 4: 課金チェックミドルウェア**

`app/middleware/subscription.py`:

計算エンドポイント（/api/v1/calculate等）へのリクエスト時に課金状態をチェック。
未課金ユーザーにはHTTP 402 Payment Requiredを返す。
フリートライアル（初回3回まで無料）も実装。

**Step 5: 料金ページ + SubscriptionGateコンポーネント**

`frontend/src/pages/pricing.jsx`: 料金ページ（¥9,800/月 + サークル会員特典表示）
`frontend/src/components/SubscriptionGate.jsx`: 未課金時に料金ページへ誘導するラッパー

**Step 6: テスト → Commit**

```bash
pytest tests/test_billing.py -v
cd frontend && npm run build
git add app/services/stripe_billing.py app/api/v1/billing.py app/middleware/subscription.py frontend/src/pages/pricing.jsx frontend/src/components/SubscriptionGate.jsx tests/test_billing.py requirements.txt
git commit -m "feat(billing): add Stripe monthly subscription ¥9,800 with circle member detection"
```

---

## Task 2: AI製品推薦エンジン

**Files:**
- Create: `app/services/ai_recommend.py`
- Create: `tests/test_ai_recommend.py`
- Modify: `app/api/v1/products.py` (推薦エンドポイント追加)
- Modify: `requirements.txt` (anthropic追加)

**Step 1: requirements.txt に追加**

```
anthropic==0.49.0
```

**Step 2: テストを書く**

`tests/test_ai_recommend.py`:

```python
"""Tests for AI product recommendation engine."""
from unittest.mock import patch, MagicMock
import pytest
from app.services.ai_recommend import build_recommendation_prompt, parse_recommendation


class TestRecommendationPrompt:
    def test_prompt_includes_building_info(self):
        prompt = build_recommendation_prompt(
            zone=6,
            use="office",
            floor_area=500,
            current_bei=1.05,
            categories=["windows", "hvac"],
        )
        assert "6地域" in prompt
        assert "事務所" in prompt or "office" in prompt
        assert "500" in prompt
        assert "1.05" in prompt

    def test_prompt_includes_product_data(self):
        prompt = build_recommendation_prompt(
            zone=6, use="office", floor_area=500, current_bei=1.05,
            categories=["windows"],
        )
        # Must include actual product names from DB
        assert "YKK" in prompt or "LIXIL" in prompt


class TestParseRecommendation:
    def test_parse_valid_response(self):
        raw = """
        [RECOMMEND]
        category: windows
        product_id: ykk-apw430-sliding
        reason: 6地域の事務所にはAPW430の断熱性能が最適です。U値1.31で適合基準をクリアできます。
        estimated_bei_impact: -0.08
        [/RECOMMEND]
        [RECOMMEND]
        category: hvac
        product_id: panasonic-multi-office
        reason: パナソニック ビル用マルチはAPF6.5で高効率。事務所の空調負荷に適しています。
        estimated_bei_impact: -0.05
        [/RECOMMEND]
        """
        results = parse_recommendation(raw)
        assert len(results) == 2
        assert results[0]["product_id"] == "ykk-apw430-sliding"
        assert results[0]["category"] == "windows"
        assert "APW430" in results[0]["reason"]
```

**Step 3: 実装**

`app/services/ai_recommend.py`:

```python
"""AI product recommendation engine using Claude API."""
from __future__ import annotations

import logging
import os
import re
from typing import Any, Dict, List, Optional

from app.services.products import get_recommended_products

logger = logging.getLogger(__name__)

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")

# Building use label mapping
USE_LABELS = {
    "office": "事務所", "hotel": "ホテル", "hospital": "病院",
    "shop_department": "百貨店", "shop_supermarket": "スーパー",
    "school_small": "小学校", "school_high": "高校", "school_university": "大学",
    "restaurant": "飲食店", "assembly": "集会所", "factory": "工場",
}


def build_recommendation_prompt(
    *,
    zone: int,
    use: str,
    floor_area: float,
    current_bei: Optional[float] = None,
    categories: List[str] = None,
) -> str:
    """Build a structured prompt for Claude to recommend products."""
    if categories is None:
        categories = ["windows", "insulation", "hvac", "lighting"]

    use_label = USE_LABELS.get(use, use)
    bei_info = f"現在のBEI: {current_bei}" if current_bei else "BEI: 未計算"

    product_sections = []
    for cat in categories:
        products = get_recommended_products(cat, zone=zone, use=use)
        if not products:
            continue
        lines = []
        for p in products[:8]:  # Limit to top 8 per category
            spec = _format_spec(cat, p)
            partner_tag = " [パートナー推奨]" if p.get("partner") else ""
            lines.append(f"  - {p['id']}: {p['name']} ({p['manufacturer']}) {spec}{partner_tag}")
        product_sections.append(f"■ {cat}:\n" + "\n".join(lines))

    products_text = "\n\n".join(product_sections)

    return f"""あなたは省エネ建築の専門家です。以下の建物条件に最適な製品を推薦してください。

## 建物条件
- 地域区分: {zone}地域
- 用途: {use_label}
- 延床面積: {floor_area}m2
- {bei_info}

## 利用可能な製品
{products_text}

## 回答形式
各カテゴリから1つずつ、以下の形式で推薦してください。パートナー推奨製品を優先してください。

[RECOMMEND]
category: (カテゴリ名)
product_id: (製品ID)
reason: (2文以内で推薦理由。建物条件との適合性、性能値、コスト効率に言及)
estimated_bei_impact: (BEIへの推定影響。例: -0.05)
[/RECOMMEND]
"""


def _format_spec(category: str, product: Dict[str, Any]) -> str:
    if category == "windows":
        return f"U={product.get('u_value', '?')}, eta_c={product.get('eta_c', '?')}"
    elif category == "insulation":
        return f"lambda={product.get('lambda_value', '?')}, {product.get('category', '?')}"
    elif category == "hvac":
        return f"APF={product.get('apf', '?')}, {product.get('capacity_kw', '?')}kW"
    elif category == "lighting":
        return f"{product.get('lm_per_w', '?')}lm/W, {product.get('wattage', '?')}W"
    return ""


def parse_recommendation(raw_text: str) -> List[Dict[str, Any]]:
    """Parse structured [RECOMMEND] blocks from Claude response."""
    results = []
    blocks = re.findall(
        r"\[RECOMMEND\](.*?)\[/RECOMMEND\]",
        raw_text,
        re.DOTALL,
    )
    for block in blocks:
        rec = {}
        for line in block.strip().split("\n"):
            line = line.strip()
            if ":" in line:
                key, _, value = line.partition(":")
                key = key.strip()
                value = value.strip()
                if key in ("category", "product_id", "reason", "estimated_bei_impact"):
                    rec[key] = value
        if rec.get("product_id"):
            results.append(rec)
    return results


async def get_ai_recommendations(
    *,
    zone: int,
    use: str,
    floor_area: float,
    current_bei: Optional[float] = None,
    categories: List[str] = None,
) -> List[Dict[str, Any]]:
    """Call Claude API for product recommendations."""
    if not ANTHROPIC_API_KEY:
        logger.warning("ANTHROPIC_API_KEY not set; returning empty recommendations")
        return []

    import anthropic
    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

    prompt = build_recommendation_prompt(
        zone=zone, use=use, floor_area=floor_area,
        current_bei=current_bei, categories=categories,
    )

    message = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=1500,
        messages=[{"role": "user", "content": prompt}],
    )

    raw = message.content[0].text
    recommendations = parse_recommendation(raw)

    # Enrich with full product data
    for rec in recommendations:
        cat = rec.get("category", "")
        pid = rec.get("product_id", "")
        try:
            products = get_recommended_products(cat, zone=zone, use=use)
            match = next((p for p in products if p["id"] == pid), None)
            if match:
                rec["product"] = match
        except Exception:
            pass

    return recommendations
```

**Step 4: エンドポイント追加**

`app/api/v1/products.py` に追加:

```python
from app.services.ai_recommend import get_ai_recommendations


@router.post("/recommend")
async def recommend_products(
    zone: int = Query(..., ge=1, le=8),
    use: str = Query(...),
    floor_area: float = Query(..., gt=0),
    current_bei: Optional[float] = Query(None),
):
    """AI が建物条件に基づいて最適な製品を推薦。パートナー製品優先。"""
    recommendations = await get_ai_recommendations(
        zone=zone, use=use, floor_area=floor_area, current_bei=current_bei,
    )
    return {"recommendations": recommendations, "count": len(recommendations)}
```

**Step 5: テスト → PASS**

```bash
pytest tests/test_ai_recommend.py -v
```

**Step 6: Commit**

```bash
git add app/services/ai_recommend.py app/api/v1/products.py tests/test_ai_recommend.py requirements.txt
git commit -m "feat(ai): add product recommendation engine with Claude API"
```

---

## Task 3: メーカー紹介フロー

**Files:**
- Create: `app/models/referral.py`
- Create: `app/api/v1/referral.py`
- Create: `app/services/referral.py`
- Modify: `app/db/base.py` (モデル import)
- Modify: `app/main.py` (ルーター追加)
- Create: `tests/test_referral.py`

**Step 1: Referralモデル**

`app/models/referral.py`:

```python
"""Referral tracking model."""
from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text
from sqlalchemy.sql import func

from app.db.base import Base


class Referral(Base):
    __tablename__ = "referrals"

    id = Column(Integer, primary_key=True, index=True)
    # 建築士情報
    architect_name = Column(String(200), nullable=False)
    architect_email = Column(String(200), nullable=False)
    architect_company = Column(String(200), nullable=True)
    architect_phone = Column(String(50), nullable=True)
    # 案件情報
    project_name = Column(String(200), nullable=True)
    building_use = Column(String(100), nullable=True)
    building_zone = Column(Integer, nullable=True)
    floor_area = Column(Float, nullable=True)
    # 製品情報
    product_category = Column(String(50), nullable=False)
    product_id = Column(String(100), nullable=False)
    product_name = Column(String(200), nullable=False)
    manufacturer = Column(String(100), nullable=False)
    # 紹介状況
    status = Column(String(50), default="pending")  # pending, contacted, quoted, closed
    notes = Column(Text, nullable=True)
    # メタデータ
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
```

**Step 2: `app/db/base.py` に import 追加**

```python
from app.models.referral import Referral  # noqa: F401
```

**Step 3: 紹介サービス**

`app/services/referral.py`:

```python
"""Referral notification service."""
from __future__ import annotations

import logging
import os
from typing import Any, Dict

logger = logging.getLogger(__name__)

NOTIFY_EMAIL = os.getenv("REFERRAL_NOTIFY_EMAIL", "compass@archi-prisma.co.jp")


def send_referral_notification(referral_data: Dict[str, Any]) -> bool:
    """Send email notification for new referral. Returns True on success."""
    # Phase 2 MVP: ログ出力 + 管理者メール
    # 本番ではnodemailer/Gmail SMTPを使用（CLAUDE.md準拠）
    logger.info(
        "New referral: %s → %s (%s) for %s",
        referral_data.get("architect_email"),
        referral_data.get("manufacturer"),
        referral_data.get("product_name"),
        referral_data.get("project_name", "unnamed"),
    )

    try:
        import smtplib
        from email.mime.text import MIMEText

        smtp_user = os.getenv("GMAIL_USER")
        smtp_pass = os.getenv("GMAIL_APP_PASSWORD")
        if not smtp_user or not smtp_pass:
            logger.warning("Gmail credentials not set; skipping email notification")
            return False

        body = f"""新規見積依頼が届きました。

■ 建築士情報
  名前: {referral_data.get('architect_name')}
  メール: {referral_data.get('architect_email')}
  会社: {referral_data.get('architect_company', '未入力')}
  電話: {referral_data.get('architect_phone', '未入力')}

■ 案件情報
  案件名: {referral_data.get('project_name', '未入力')}
  用途: {referral_data.get('building_use', '未入力')}
  地域: {referral_data.get('building_zone', '未入力')}地域
  面積: {referral_data.get('floor_area', '未入力')}m2

■ 製品
  カテゴリ: {referral_data.get('product_category')}
  製品名: {referral_data.get('product_name')}
  メーカー: {referral_data.get('manufacturer')}

---
楽々省エネ計算 紹介システム
"""
        msg = MIMEText(body, "plain", "utf-8")
        msg["Subject"] = f"[楽々省エネ] 見積依頼: {referral_data.get('product_name')} - {referral_data.get('architect_company', '個人')}"
        msg["From"] = smtp_user
        msg["To"] = NOTIFY_EMAIL

        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(smtp_user, smtp_pass)
            server.send_message(msg)

        logger.info("Referral notification sent to %s", NOTIFY_EMAIL)
        return True
    except Exception as exc:
        logger.exception("Failed to send referral notification: %s", exc)
        return False
```

**Step 4: 紹介APIエンドポイント**

`app/api/v1/referral.py`:

```python
"""Referral (manufacturer introduction) API endpoints."""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from typing import Optional
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.referral import Referral
from app.services.referral import send_referral_notification

router = APIRouter(prefix="/referral", tags=["Referral"])


class ReferralRequest(BaseModel):
    architect_name: str
    architect_email: EmailStr
    architect_company: Optional[str] = None
    architect_phone: Optional[str] = None
    project_name: Optional[str] = None
    building_use: Optional[str] = None
    building_zone: Optional[int] = None
    floor_area: Optional[float] = None
    product_category: str
    product_id: str
    product_name: str
    manufacturer: str


@router.post("/request")
async def create_referral(req: ReferralRequest, db: Session = Depends(get_db)):
    """メーカーへの見積依頼を送信。"""
    referral = Referral(
        architect_name=req.architect_name,
        architect_email=req.architect_email,
        architect_company=req.architect_company,
        architect_phone=req.architect_phone,
        project_name=req.project_name,
        building_use=req.building_use,
        building_zone=req.building_zone,
        floor_area=req.floor_area,
        product_category=req.product_category,
        product_id=req.product_id,
        product_name=req.product_name,
        manufacturer=req.manufacturer,
        status="pending",
    )
    db.add(referral)
    db.commit()
    db.refresh(referral)

    send_referral_notification(req.model_dump())

    return {
        "referral_id": referral.id,
        "status": "pending",
        "message": f"{req.manufacturer}への見積依頼を受け付けました。担当者から連絡いたします。",
    }


@router.get("/list")
async def list_referrals(db: Session = Depends(get_db)):
    """紹介一覧（管理用）。"""
    referrals = db.query(Referral).order_by(Referral.created_at.desc()).limit(100).all()
    return {"referrals": [{"id": r.id, "architect_name": r.architect_name,
                           "product_name": r.product_name, "manufacturer": r.manufacturer,
                           "status": r.status, "created_at": str(r.created_at)} for r in referrals]}
```

**Step 5: app/main.py にルーター追加**

```python
from app.api.v1.referral import router as referral_router
# ...
app.include_router(referral_router, prefix=settings.API_PREFIX)
```

**Step 6: テスト → Commit**

```bash
pytest -v
git add app/models/referral.py app/services/referral.py app/api/v1/referral.py app/db/base.py app/main.py
git commit -m "feat(referral): add manufacturer referral system with email notification"
```

---

## Task 4: メーカーダッシュボード + データレポート

**ビジネスモデル背景:** 建築士は無料。メーカーがスポンサー契約で収益を得る「価格.com型」モデル。
メーカーに提供する価値: (1) 製品選択回数データ (2) 見積依頼リード (3) 地域・用途別トレンド (4) 競合比較データ。

**Files:**
- Create: `app/models/product_event.py` (製品選択イベントログ)
- Create: `app/api/v1/analytics.py` (メーカー向けデータAPI)
- Create: `frontend/src/pages/admin/manufacturer-dashboard.jsx`
- Modify: `app/api/v1/products.py` (選択イベント記録追加)
- Modify: `app/db/base.py` (モデル import)
- Modify: `app/main.py` (ルーター追加)
- Create: `tests/test_analytics.py`

**Step 1: 製品選択イベントモデル**

`app/models/product_event.py`:

```python
"""Product selection event tracking for manufacturer analytics."""
from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from sqlalchemy.sql import func

from app.db.base import Base


class ProductEvent(Base):
    __tablename__ = "product_events"

    id = Column(Integer, primary_key=True, index=True)
    event_type = Column(String(50), nullable=False, index=True)  # "selected", "recommended", "referral_requested"
    product_id = Column(String(100), nullable=False, index=True)
    product_name = Column(String(200), nullable=False)
    manufacturer = Column(String(100), nullable=False, index=True)
    category = Column(String(50), nullable=False, index=True)
    # コンテキスト
    building_zone = Column(Integer, nullable=True)
    building_use = Column(String(100), nullable=True)
    floor_area = Column(Float, nullable=True)
    # メタデータ
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    session_id = Column(String(100), nullable=True)
```

**Step 2: `app/db/base.py` に import 追加**

```python
from app.models.product_event import ProductEvent  # noqa: F401
```

**Step 3: メーカー向けデータAPI**

`app/api/v1/analytics.py`:

```python
"""Manufacturer analytics and data reporting API."""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func as sql_func, extract
from typing import Optional

from app.db.session import get_db
from app.models.product_event import ProductEvent
from app.models.referral import Referral

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/manufacturer/{manufacturer}")
async def manufacturer_report(
    manufacturer: str,
    months: int = Query(3, ge=1, le=12),
    db: Session = Depends(get_db),
):
    """メーカー別のデータレポート。スポンサー契約先に提供。"""

    # 製品選択回数
    selection_count = (
        db.query(sql_func.count(ProductEvent.id))
        .filter(ProductEvent.manufacturer == manufacturer)
        .filter(ProductEvent.event_type == "selected")
        .scalar() or 0
    )

    # カテゴリ別内訳
    by_category = dict(
        db.query(ProductEvent.category, sql_func.count(ProductEvent.id))
        .filter(ProductEvent.manufacturer == manufacturer)
        .group_by(ProductEvent.category).all()
    )

    # 地域別分布
    by_zone = dict(
        db.query(ProductEvent.building_zone, sql_func.count(ProductEvent.id))
        .filter(ProductEvent.manufacturer == manufacturer)
        .filter(ProductEvent.building_zone.isnot(None))
        .group_by(ProductEvent.building_zone).all()
    )

    # 用途別分布
    by_use = dict(
        db.query(ProductEvent.building_use, sql_func.count(ProductEvent.id))
        .filter(ProductEvent.manufacturer == manufacturer)
        .filter(ProductEvent.building_use.isnot(None))
        .group_by(ProductEvent.building_use).all()
    )

    # 月次推移
    by_month = (
        db.query(
            extract("year", ProductEvent.created_at).label("year"),
            extract("month", ProductEvent.created_at).label("month"),
            sql_func.count(ProductEvent.id).label("count"),
        )
        .filter(ProductEvent.manufacturer == manufacturer)
        .group_by("year", "month")
        .order_by("year", "month")
        .all()
    )

    # リード数（見積依頼）
    lead_count = (
        db.query(sql_func.count(Referral.id))
        .filter(Referral.manufacturer == manufacturer)
        .scalar() or 0
    )

    # 競合比較（同カテゴリの他社選択数）
    categories = list(by_category.keys())
    competitors = {}
    for cat in categories:
        top_manufacturers = (
            db.query(ProductEvent.manufacturer, sql_func.count(ProductEvent.id).label("cnt"))
            .filter(ProductEvent.category == cat)
            .filter(ProductEvent.event_type == "selected")
            .group_by(ProductEvent.manufacturer)
            .order_by(sql_func.count(ProductEvent.id).desc())
            .limit(5)
            .all()
        )
        competitors[cat] = [{"manufacturer": m, "count": c} for m, c in top_manufacturers]

    return {
        "manufacturer": manufacturer,
        "total_selections": selection_count,
        "total_leads": lead_count,
        "by_category": by_category,
        "by_zone": by_zone,
        "by_use": by_use,
        "by_month": [{"year": int(r.year), "month": int(r.month), "count": r.count} for r in by_month],
        "competitor_comparison": competitors,
    }


@router.get("/overview")
async def analytics_overview(db: Session = Depends(get_db)):
    """全体概要（管理者用）。"""
    total_calculations = (
        db.query(sql_func.count(ProductEvent.id))
        .filter(ProductEvent.event_type == "selected")
        .scalar() or 0
    )
    total_leads = db.query(sql_func.count(Referral.id)).scalar() or 0
    by_manufacturer = dict(
        db.query(ProductEvent.manufacturer, sql_func.count(ProductEvent.id))
        .filter(ProductEvent.event_type == "selected")
        .group_by(ProductEvent.manufacturer)
        .order_by(sql_func.count(ProductEvent.id).desc())
        .all()
    )
    return {
        "total_calculations": total_calculations,
        "total_leads": total_leads,
        "by_manufacturer": by_manufacturer,
    }
```

**Step 4: 製品選択時にイベント記録を追加**

`app/api/v1/products.py` の既存エンドポイントに製品選択イベントの記録機能を追加:

```python
from app.models.product_event import ProductEvent

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
):
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
```

**Step 5: メーカーダッシュボード画面**

`frontend/src/pages/admin/manufacturer-dashboard.jsx`:

メーカー向けダッシュボード（スポンサー契約先に提供）:
- 製品選択回数サマリー（総数 + 前月比）
- 製品別選択ランキング（棒グラフ: Chart.js）
- 地域別・用途別ヒートマップ
- 見積依頼（リード）一覧
- 競合比較チャート（円グラフ: 同カテゴリ内シェア）
- 月次推移グラフ（折れ線: Chart.js）
- CSV/PDFエクスポート機能

**Step 6: ルーター追加 + テスト → Commit**

```python
from app.api.v1.analytics import router as analytics_router
app.include_router(analytics_router, prefix=settings.API_PREFIX)
```

```bash
pytest -v
cd frontend && npm run build
git add app/models/product_event.py app/api/v1/analytics.py app/api/v1/products.py app/db/base.py app/main.py frontend/src/pages/admin/manufacturer-dashboard.jsx tests/test_analytics.py
git commit -m "feat(analytics): add manufacturer dashboard with product selection tracking and lead reporting"
```

---

## Task 5: 改善シミュレーション

**Files:**
- Create: `frontend/src/components/ImprovementSimulator.jsx`
- Modify: `frontend/src/pages/tools/official-bei.jsx` (結果画面に統合)

**Step 1: ImprovementSimulator コンポーネント**

`frontend/src/components/ImprovementSimulator.jsx`:

```jsx
import { useState } from 'react';
import ProductSelector from './ProductSelector';

/**
 * 改善シミュレーター
 *
 * UI原則 #2: AI出力にアクションボタン
 * 「この製品に変更」→ [適用して再計算] [他の選択肢] [現状維持]
 */
export default function ImprovementSimulator({
  currentBei,
  zone,
  use,
  onApplyChange,
  recommendations,
  isRecalculating,
}) {
  const [expandedCategory, setExpandedCategory] = useState(null);

  if (!recommendations || recommendations.length === 0) return null;

  const categoryLabels = {
    windows: '窓サッシ', insulation: '断熱材',
    hvac: '空調設備', lighting: '照明設備',
  };

  return (
    <div className="mt-8">
      <h3 className="text-lg font-bold text-slate-800 mb-4">
        BEI改善提案
      </h3>
      {currentBei > 1.0 && (
        <p className="text-red-600 text-sm mb-4">
          現在のBEI ({currentBei.toFixed(2)}) は基準値1.0を超えています。以下の変更で適合可能です。
        </p>
      )}
      <div className="space-y-3">
        {recommendations.map((rec, idx) => {
          const product = rec.product;
          if (!product) return null;
          const impact = parseFloat(rec.estimated_bei_impact) || 0;
          const newBei = Math.max(0, currentBei + impact);

          return (
            <div
              key={idx}
              className="border border-slate-200 rounded-lg p-4 bg-white"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <span className="text-xs text-slate-500 uppercase tracking-wide">
                    {categoryLabels[rec.category] || rec.category}
                  </span>
                  <p className="font-semibold text-slate-900 mt-1">
                    {product.name}
                    {product.partner && (
                      <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                        おすすめ
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-slate-600 mt-1">{rec.reason}</p>
                </div>
                <div className="text-right ml-4">
                  <p className="text-sm text-slate-500">BEI変化</p>
                  <p className={`text-lg font-bold ${impact < 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {impact < 0 ? '' : '+'}{impact.toFixed(2)}
                  </p>
                  <p className="text-xs text-slate-400">
                    → {newBei.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* UI原則 #2: アクションボタン */}
              <div className="flex gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => onApplyChange(rec)}
                  disabled={isRecalculating}
                  className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                >
                  {isRecalculating ? '再計算中...' : '適用して再計算'}
                </button>
                <button
                  type="button"
                  onClick={() => setExpandedCategory(
                    expandedCategory === rec.category ? null : rec.category
                  )}
                  className="px-4 py-2 border border-slate-300 text-slate-600 text-sm rounded-lg hover:bg-slate-50"
                >
                  他の選択肢を見る
                </button>
                <button
                  type="button"
                  className="px-4 py-2 text-slate-400 text-sm hover:text-slate-600"
                >
                  スキップ
                </button>
              </div>

              {expandedCategory === rec.category && (
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <ProductSelector
                    category={rec.category}
                    zone={zone}
                    use={use}
                    selected={product}
                    onSelect={(p) => {
                      if (p) onApplyChange({ ...rec, product: p, product_id: p.id });
                      setExpandedCategory(null);
                    }}
                    allowManualInput={false}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

**Step 2: official-bei.jsx の結果画面に統合**

結果表示セクション（BEI値表示の後）に追加:

```jsx
import ImprovementSimulator from '../../components/ImprovementSimulator';

// 結果画面のBEI表示の後に:
{result && (
  <ImprovementSimulator
    currentBei={result.bei || result.BEI_m}
    zone={parseInt(formData.building?.region?.replace('地域', ''), 10) || 6}
    use={formData.building?.building_type}
    recommendations={aiRecommendations}
    isRecalculating={isRecalculating}
    onApplyChange={async (rec) => {
      setIsRecalculating(true);
      // 製品変更を formData に反映 → 公式API再計算
      // (具体的な反映ロジックは製品カテゴリごとに異なる)
      // 再計算後に result を更新
      setIsRecalculating(false);
    }}
  />
)}
```

**Step 3: ビルド → Commit**

```bash
cd frontend && npm run build
git add frontend/src/components/ImprovementSimulator.jsx frontend/src/pages/tools/official-bei.jsx
git commit -m "feat(ui): add BEI improvement simulator with one-click recalculation"
```

---

## Task 6: Phase 2 最終確認

```bash
pytest -v
cd frontend && npm run build
git push origin main
```
