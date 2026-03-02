# 楽々省エネ計算 — 課題・タスク管理

## 最終更新: 2026-03-02

## 戦略ドキュメント

→ **[プロダクト・プラットフォーム戦略](docs/plans/2026-03-02-product-platform-strategy.md)**

楽々省エネ計算 = 「建材選定 × 公式計算 × メーカー紹介」プラットフォーム。
計算単独ではなく、製品推薦 + 紹介システムが収益の核。

## Phase 1: MVP（Codex CLI 実装対象）

- [ ] 公式API統合の安定化（リトライ、タイムアウト30s、エラーハンドリング）
- [ ] 製品DB構築（窓: YKK AP + LIXIL、断熱: カテゴリ、空調: パナソニック基本）
- [ ] 選択式UI刷新（製品カード選択 → 公式API計算 → 結果 → PDF出力）
- [ ] SMALLMODEL 表示修正（UIの嘘を修正）
- [ ] インフラ強化（uvicorn --workers 4、ファイルサイズ制限10MB、PRODUCTION_ENFORCE_READINESS=true）
- [ ] CELL_MAPPING拡張（B3/C/H/I）

## Phase 2: 紹介システム + AI推薦

- [ ] AI製品推薦エンジン（Claude API、建物条件→最適製品）
- [ ] メーカー紹介フロー（見積依頼→通知→トラッキング）
- [ ] 決済統合（Stripe: 都度4,980円/回、月額Pro 14,800円/月、Team 29,800円/月）
- [ ] 改善シミュレーション（製品変更→再計算→差分表示）

## Phase 3: パートナー展開

- [ ] YKK AP製品DB完全版（全APWシリーズ）
- [ ] パナソニック製品DB（空調・照明・太陽光）
- [ ] パートナー管理画面（紹介実績・手数料レポート）
- [ ] テクノストラクチャー加盟店向けオンボーディング

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
- [x] Named Ranges はドロップダウンリスト参照のみ（入力セル識別には使えない）
- [x] 様式A: 固定セル (C3-G22), 様式B1-I: テーブル形式 (行11-1010)

### Step 2: CELL_MAPPING + スキーマ + フロントエンド
- [x] OfficialBuildingInfo 他14モデル追加（`app/schemas/bei.py`）
- [x] FORM_A_MAPPING (20項目), TABLE_COLUMNS (13テーブル), SMALL_SHEET_MAP 実装（`app/services/report.py`）
- [x] `_bei_request_to_report_input()` を official_input 対応に書き換え
- [x] `officialAPI` エクスポート追加（4関数）
- [x] 10ステップウィザード新規作成 (~600行)（`frontend/src/pages/tools/official-bei.jsx`）
- [x] ナビに「公式BEI計算」リンク追加
- [x] ツール一覧に「公式BEI計算」追加
- [x] ComplianceReport.jsx の useState 条件付き呼び出しバグ修正
- [x] `npm run build` 成功確認済み

## 既知バグ・技術債

- [x] `_post_to_api()` raw binary送信に修正済み（commit c009a20）
- [ ] campaign.jsx の完全書き直し予定（`CODEX_CAMPAIGN_REBUILD.md`参照）

## ブラウザローカルLLM検討メモ

### 省エネ計算の入力支援・結果解説にブラウザローカルLLM活用

**ユースケース**:
1. 入力支援: 10ステップウィザードの各ステップで「この項目は何を入力すべきか」をAIが解説
2. 結果解説: BEI計算結果に対して「この建物の省エネ性能は○○レベルです。改善するには...」と解説
3. エラー支援: APIバリデーションエラー時に「この入力値を見直してください」と具体的アドバイス

**検討ポイント**:
- 入力支援は定型的な説明が多いため、FAQ的な事前データ + 小型LLMで対応可能
- 結果解説は数値の解釈が必要だが、BEI値の範囲は限定的（0.5〜1.5程度）
- 省エネ法の法規知識が必要 → RAGでガイドライン文書を参照させる方式が有効
- Transformers.js + 日本語対応モデル（2-3GB）で実現可能

**メリット**: サーバーコストゼロ（無料ツールなのでAPI費用を抑えたい）、オフライン動作、即座の応答
**課題**: 省エネ法の正確な法規知識の担保、モデルサイズとブラウザメモリ
**結論**: 無料ツールという位置づけ上、サーバーコストゼロのローカルLLMは特に魅力的。まずは入力支援（FAQ的な固定回答 + LLMによる自然な言い回し）から始め、段階的に結果解説にも拡張。
