# 楽々省エネ計算 — 課題・タスク管理

## 最終更新: 2026-03-03

## 戦略ドキュメント

→ **[プロダクト・プラットフォーム戦略](docs/plans/2026-03-02-product-platform-strategy.md)**

楽々省エネ計算 = 「建材選定 × 公式計算 × メーカー紹介」プラットフォーム。
**ビジネスモデル: 有料→無料スイッチ。月額¥9,800で100社集め → スポンサー獲得後に無料化（価格.com型）。**
計算単独ではなく、製品推薦 + 紹介システム + メーカーデータがメイン収益。

→ **[無料 vs 有料 比較分析](docs/plans/2026-03-03-free-vs-paid-analysis.md)**

→ **[事業計画書](docs/plans/事業計画書_楽々省エネ計算.md)** | **[企画書作成指示書](docs/plans/企画書作成_Claude指示書.md)**

## Phase 1: MVP（Codex CLI 実装対象）

- [ ] 公式API統合の安定化（リトライ、タイムアウト30s、エラーハンドリング）
- [ ] 製品DB構築（窓: YKK AP + LIXIL、断熱: カテゴリ、空調: パナソニック基本）
- [ ] 選択式UI刷新（製品カード選択 → 公式API計算 → 結果 → PDF出力）
- [ ] SMALLMODEL 表示修正（UIの嘘を修正）
- [ ] インフラ強化（uvicorn --workers 4、ファイルサイズ制限10MB、PRODUCTION_ENFORCE_READINESS=true）
- [ ] CELL_MAPPING拡張（B3/C/H/I）

## Phase 2: Stripe決済 + 紹介システム + AI推薦 + メーカーダッシュボード

- [ ] **Stripe月額課金（¥9,800/月、サークル会員は無料）**
- [ ] AI製品推薦エンジン（Claude API、建物条件→最適製品）
- [ ] メーカー紹介フロー（見積依頼→通知→トラッキング）
- [ ] メーカーダッシュボード（製品選択データ・リード管理・競合比較レポート）
- [ ] 改善シミュレーション（製品変更→再計算→差分表示）

## Phase 3: パートナー展開

- [ ] YKK AP製品DB完全版（全APWシリーズ）
- [ ] パナソニック製品DB（空調・照明・太陽光）
- [ ] パートナー管理画面（スポンサーレポート・リードデータ）
- [ ] テクノストラクチャー加盟店向けオンボーディング（スポンサー獲得後に無料化）

## 既存タスク（Phase 1 に統合）

- [ ] official-bei.jsx E2Eテスト
- [ ] 様式Aの必須セル確認（code_symbol, code_use ドロップダウン値）
- [ ] campaign.jsx の完全書き直し（`CODEX_CAMPAIGN_REBUILD.md`参照）

## 完了済み

### _post_to_api() バグ修正
- [x] `requests.post(url, files=files)` → `requests.post(url, data=payload, headers=headers)` に修正済み
- [x] `get_official_report_from_excel` / `get_official_compute_from_excel` も `_post_to_api()` 経由で正しく動作

### Step 1: Excel テンプレート構造解析
- [x] `docs/excel-template-analysis.md` に全分析結果を記録済み

### Step 2: CELL_MAPPING + スキーマ + フロントエンド
- [x] OfficialBuildingInfo 他14モデル追加
- [x] FORM_A_MAPPING, TABLE_COLUMNS, SMALL_SHEET_MAP 実装
- [x] 10ステップウィザード新規作成
- [x] `npm run build` 成功確認済み

### 戦略・計画
- [x] プロダクト・プラットフォーム戦略ドキュメント作成
- [x] CODEX Phase 1〜3 実装指示書作成
- [x] 無料モデル（価格.com型）への戦略転換確定（2026-03-03）
- [x] 有料→無料スイッチ戦略に修正（¥9,800→100社→スポンサー→無料化）（2026-03-03）
- [x] YKKグループ統合情報の反映（パナソニック住宅事業買収）

## 既知バグ・技術債

- [x] `_post_to_api()` raw binary送信に修正済み（commit c009a20）
- [ ] campaign.jsx の完全書き直し予定（`CODEX_CAMPAIGN_REBUILD.md`参照）
## Status Update: 2026-03-06

- Completed in code: Windows-safe residential pytest harness, official/residential smoke stabilization, referral status update API, onboarding persistence, Stripe billing API, pricing page, and subscription gates on major tools.
- Verified on this date: `PYTHONPATH=. pytest -q` -> `113 passed`, `frontend/npm run build` -> success, `npx playwright test e2e/smoke --project=smoke` -> `32 passed`.
- Remaining release blockers: set production Stripe env vars and live prices, refresh pricing copy on public marketing pages, expand partner product catalog, and finish release/runbook docs.
- Pricing strategy revision: free preview for quick BEI, residential live calc, and utility calculators; paid plan for official workflow outputs, residential verification/PDF, and proposal support.
- Next billing implementation step: keep monthly subscription for repeat users, but add a one-off per-project purchase path before broad launch.
- Completed on 2026-03-06: added a one-off `project_pass` billing path, local billing entitlement persistence, and checkout confirmation flow so paid access can be granted without relying only on recurring subscriptions.
- Completed on 2026-03-06: added Stripe webhook handling for project pass activation/refund sync, so the local entitlement store can be updated even if the pricing return page is skipped.
- Current paid model in code: `energy_monthly` at 9,800 JPY/month for repeat users, plus `project_pass` at 4,980 JPY for 30 days aimed at one-off projects.
- Stripe test mode: Products and Prices created (see PRICING_STATUS.md for IDs).
- Remaining production billing work: create live-mode equivalents, wire webhook endpoint in Stripe Dashboard, and deploy with live env vars.
