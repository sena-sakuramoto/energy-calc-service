# 料金設定状況について

## 現在の状態（2025年1月時点）

### 料金表示の統一状況
全ページで料金情報を「調整中」に変更済み：

#### 変更済み箇所
1. **キャンペーンページ (`/campaign`)**
   - 正式版料金：「¥19,800」→「調整中」
   - 説明文：「30日間無料トライアル後、月額19,800円で～」→「30日間無料トライアル後の料金は現在調整中です」
   - コスト比較：「19,800円で計算し放題」→「料金調整中（お得な価格設定を検討中）」
   - FAQ：「2025年1月以降は月額19,800円」→「2025年1月以降の料金は現在調整中」

2. **トップページ (`/`)**
   - キャンペーン告知：「通常月額19,800円のサービス」→「料金調整中のサービス」

### 維持されている要素
- **30日間無料トライアル**はそのまま継続
- **協力者様と一緒に完成を目指し**ているデモ版を皆様にお試しいただきながら開発中
- 無料期間中の全機能利用可能

## デプロイ先URL
- **カスタムドメイン（メイン）**: https://rakuraku-energy.archi-prisma.co.jp/
- **GitHub Pages**: https://sena-sakuramoto.github.io/energy-calc-service/

## 開発進捗状況

協力者様からの貴重なサポートをいただきながら、当初12月末予定でしたが前倒しでデモ版をリリースできました。現在は皆様にデモ版を無料でお使いいただき、いただいたフィードバックやご意見を元に、協力者様と一緒にさらなる改善と完成を目指して奔闘しています。

## 次の作業者への引き継ぎ事項

### 料金設定を決定する場合
1. `frontend/src/pages/campaign.jsx` の料金プランセクション
2. `frontend/src/pages/index.jsx` のキャンペーン告知部分
3. 全体検索で「調整中」「料金調整中」を置換

### 関連ファイル
- `/campaign` - キャンペーンページ（主要な料金表示）
- `/` - トップページ（キャンペーン告知）
- 他のページには具体的な料金表示なし

### 技術情報
- Next.js 14.0.4 静的サイト
- GitHub Actions自動デプロイ
- カスタムドメイン設定済み

## 変更履歴
- 2025年1月: 全料金表示を「調整中」に統一
- トーンマナーを全ページで統一（清潔で見やすいデザイン）
- 30日間無料トライアルは継続
## Update: 2026-03-06

- Stripe billing is now implemented in code on both backend and frontend.
- Non-production environments keep the billing bypass so local development and Playwright smoke tests can run without Stripe.
- Market positioning update: free calculators are necessary because official free tools and large incumbent packages already exist; the paid value must center on official workflow output, faster delivery, and submission-ready documents.
- Launch recommendation: do not sell generic energy/tariff calculators. Sell official BEI workflow, residential verification/PDF export, and support for small design offices.
- Billing model update on 2026-03-06: added `project_pass` as a one-off purchase alongside the monthly subscription. The pass is implemented as a 30-day entitlement stored in the application database after checkout confirmation.
- Billing reliability update on 2026-03-06: Stripe webhook handling now activates or refunds `project_pass` entitlements on the backend, reducing dependence on the pricing return page.
- Current code-level pricing structure: `energy_monthly` = 9,800 JPY/month, `project_pass` = 4,980 JPY/30 days. The monthly plan is for repeat users; the pass is for one-off projects and should upsell to monthly when two or more passes would be needed.

## Stripe Test Mode Products (2026-06-04)

Test mode products and prices have been created in Stripe.

### Products / Prices

| Plan | Product ID | Price ID | Amount | Type |
|------|-----------|----------|--------|------|
| Monthly Plan | `prod_U68s4cdWky0OTg` | `price_1T7wb5RpUEcUjSDNuXkUSLE2` | JPY 9,800/month | recurring |
| 30-Day Pass | `prod_U68sdoQ4lOsarB` | `price_1T7wbCRpUEcUjSDNAJtDcdAD` | JPY 4,980 | one_time |
| Circle (existing) | `prod_T9yRUdbsb2e6Zo` | `price_1SDeWLRpUEcUjSDNv5UQJn86` | JPY 5,000/month | recurring |

### Required Environment Variables

```bash
# Billing / Stripe (TEST MODE)
APP_PUBLIC_URL=https://rakuraku-energy.archi-prisma.co.jp
STRIPE_SECRET_KEY=sk_test_...              # from `stripe config --list` or Dashboard
STRIPE_WEBHOOK_SECRET=whsec_...            # from `stripe listen` or Dashboard webhook endpoint
STRIPE_PRICE_ID_ENERGY=price_1T7wb5RpUEcUjSDNuXkUSLE2
STRIPE_PRICE_ID_PROJECT_PASS=price_1T7wbCRpUEcUjSDNAJtDcdAD
STRIPE_PRICE_ID_CIRCLE=price_1SDeWLRpUEcUjSDNv5UQJn86
STRIPE_PROJECT_PASS_DAYS=30
BILLING_BYPASS=false
```

### Webhook Setup

- **Endpoint path**: `/api/v1/billing/webhook`
- **Full URL (production)**: `https://rakuraku-energy.archi-prisma.co.jp/api/v1/billing/webhook`
- **Subscribed events**:
  - `checkout.session.completed`
  - `checkout.session.async_payment_succeeded`
  - `charge.refunded`

### Local Testing with Stripe CLI

```bash
stripe listen --forward-to localhost:8000/api/v1/billing/webhook \
  --events checkout.session.completed,checkout.session.async_payment_succeeded,charge.refunded
```
Copy the `whsec_...` secret printed by `stripe listen` into `STRIPE_WEBHOOK_SECRET`.

### Production Deployment Checklist

1. Create live-mode Products/Prices in Stripe Dashboard (same structure as test)
2. Create webhook endpoint in Stripe Dashboard pointing to production URL
3. Set all env vars with live-mode values in Cloud Run / Render secrets
4. Set `BILLING_BYPASS=false`
5. Verify checkout flow end-to-end
