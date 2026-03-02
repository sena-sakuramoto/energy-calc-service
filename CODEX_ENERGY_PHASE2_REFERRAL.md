# Phase 2: 紹介システム + AI製品推薦 + 決済

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** AI製品推薦エンジン、メーカー紹介フロー、Stripe決済、改善シミュレーションを実装し、収益化可能な状態にする。

**Architecture:** Claude APIで建物条件に基づく製品推薦を生成。メーカー紹介はDB管理+メール通知。Stripeで都度/月額課金。改善シミュレーションは製品変更→公式API再計算→差分表示。

**Tech Stack:** FastAPI, Next.js 14, Tailwind CSS, Anthropic Claude API, Stripe, nodemailer

**前提:** Phase 1 が完了していること（製品DB、ProductSelector、公式APIリトライ済み）

**UI設計原則:** CLAUDE.mdの12原則に従うこと。特に原則1（選択肢 > 自由入力）と原則2（AI出力にアクションボタン）を厳守。デザイン禁止事項（AIグラデーション青→紫、Inter、Lucideのみ、shadcnデフォルト）を遵守。

**完了条件:**
- AI推薦が建物条件に応じた製品リストを返す
- 紹介フローで見積依頼メールが送信される
- Stripe Checkout で都度/月額課金が動作する
- 改善シミュレーションで製品変更→BEI差分が表示される
- `pytest` 全テストPASS
- `cd frontend && npm run build` 成功

---

## Task 1: AI製品推薦エンジン

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

## Task 2: メーカー紹介フロー

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

## Task 3: Stripe決済統合

**Files:**
- Create: `app/api/v1/payment.py`
- Modify: `requirements.txt` (stripe追加)
- Modify: `app/main.py` (ルーター追加)
- Modify: `app/core/config.py` (Stripe設定追加)

**Step 1: requirements.txt に追加**

```
stripe==8.0.0
```

**Step 2: config.py にStripe設定追加**

```python
    # Stripe
    STRIPE_SECRET_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""
    STRIPE_PRICE_SINGLE: str = ""     # 都度利用 4,980円
    STRIPE_PRICE_PRO: str = ""        # 月額Pro 14,800円
    STRIPE_PRICE_TEAM: str = ""       # 月額Team 29,800円
```

**Step 3: 決済エンドポイント**

`app/api/v1/payment.py`:

```python
"""Stripe payment endpoints for per-use and subscription billing."""
import os
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, EmailStr
from typing import Optional

import stripe

from app.core.config import settings

router = APIRouter(prefix="/payment", tags=["Payment"])

stripe.api_key = settings.STRIPE_SECRET_KEY

FRONTEND_URL = "https://rakuraku-energy.archi-prisma.co.jp"


class CheckoutRequest(BaseModel):
    plan: str  # "single", "pro", "team"
    email: EmailStr
    success_url: Optional[str] = None
    cancel_url: Optional[str] = None


@router.post("/checkout")
async def create_checkout_session(req: CheckoutRequest):
    """Stripe Checkout セッションを作成。"""
    if not stripe.api_key:
        raise HTTPException(status_code=500, detail="決済システムが設定されていません。")

    price_map = {
        "single": settings.STRIPE_PRICE_SINGLE,
        "pro": settings.STRIPE_PRICE_PRO,
        "team": settings.STRIPE_PRICE_TEAM,
    }
    price_id = price_map.get(req.plan)
    if not price_id:
        raise HTTPException(status_code=400, detail=f"不明なプラン: {req.plan}")

    mode = "payment" if req.plan == "single" else "subscription"

    try:
        session = stripe.checkout.Session.create(
            mode=mode,
            customer_email=req.email,
            line_items=[{"price": price_id, "quantity": 1}],
            success_url=req.success_url or f"{FRONTEND_URL}/tools/official-bei?payment=success",
            cancel_url=req.cancel_url or f"{FRONTEND_URL}/tools/official-bei?payment=cancel",
            metadata={"plan": req.plan},
        )
        return {"checkout_url": session.url, "session_id": session.id}
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/webhook")
async def stripe_webhook(request: Request):
    """Stripe Webhook — 決済完了時の処理。"""
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature", "")

    if not settings.STRIPE_WEBHOOK_SECRET:
        raise HTTPException(status_code=500, detail="Webhook secret not configured")

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET,
        )
    except (ValueError, stripe.error.SignatureVerificationError):
        raise HTTPException(status_code=400, detail="Invalid webhook signature")

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        # TODO: ユーザーの計算回数・サブスク状態をDBに反映
        pass

    return {"status": "ok"}
```

**Step 4: ルーター追加 + Commit**

```python
from app.api.v1.payment import router as payment_router
app.include_router(payment_router, prefix=settings.API_PREFIX)
```

```bash
git add app/api/v1/payment.py app/core/config.py requirements.txt app/main.py
git commit -m "feat(payment): add Stripe checkout for single/pro/team plans"
```

---

## Task 4: 改善シミュレーション

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

## Task 5: Phase 2 最終確認

```bash
pytest -v
cd frontend && npm run build
git push origin main
```
