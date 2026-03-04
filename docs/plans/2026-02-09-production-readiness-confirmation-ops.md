# Confirmation-Grade Production Readiness Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 楽々省エネ計算を「確認申請で使える運用状態か」をコードで自動判定できるようにし、未達なら本番起動をブロックする。

**Architecture:** FastAPIアプリに readiness 判定サービスを追加し、公式API連携・テンプレート・秘密情報・DB設定の必須条件を一元チェックする。APIエンドポイント、CLI監査、CIワークフローを同じ判定ロジックに接続し、運用時に同一基準を強制する。

**Tech Stack:** FastAPI / Pydantic Settings / Pytest / GitHub Actions

### Task 1: readiness 判定ロジックの追加

**Files:**
- Create: `app/services/readiness.py`
- Test: `tests/test_readiness.py`

**Step 1: Write the failing test**
`tests/test_readiness.py` に、開発設定では未達・本番設定では達成を判定するテストを追加する。

**Step 2: Run test to verify it fails**
Run: `PYTHONPATH=. pytest tests/test_readiness.py -q`
Expected: `ModuleNotFoundError` または未実装アサート失敗。

**Step 3: Write minimal implementation**
`app/services/readiness.py` に `evaluate_production_readiness(...)` を実装し、以下を判定する:
- `SECRET_KEY` が既定値ではない
- `DATABASE_URL` が sqlite ではない
- 公式API URL が https
- 公式Excelテンプレートが存在

**Step 4: Run test to verify it passes**
Run: `PYTHONPATH=. pytest tests/test_readiness.py -q`
Expected: PASS

### Task 2: API公開と本番fail-fast

**Files:**
- Modify: `app/api/v1/routes.py`
- Modify: `app/main.py`
- Modify: `app/core/config.py`
- Test: `tests/test_readiness.py`

**Step 1: Write the failing test**
`/api/v1/official/readiness` のレスポンス構造を検証するテストを追加する。

**Step 2: Run test to verify it fails**
Run: `PYTHONPATH=. pytest tests/test_readiness.py::test_readiness_endpoint_shape -q`
Expected: 404 またはレスポンス不一致。

**Step 3: Write minimal implementation**
- `app/core/config.py` に `PRODUCTION_ENFORCE_READINESS` などの設定を追加
- `app/api/v1/routes.py` に `GET /official/readiness` を追加
- `app/main.py` で `ENV=production` かつ enforce=true の場合に未達なら `RuntimeError` を投げる

**Step 4: Run test to verify it passes**
Run: `PYTHONPATH=. pytest tests/test_readiness.py::test_readiness_endpoint_shape -q`
Expected: PASS

### Task 3: CLI監査スクリプトとCI

**Files:**
- Create: `scripts/check_production_readiness.py`
- Create: `.github/workflows/production-readiness.yml`
- Create: `docs/operations/production-readiness.md`
- Test: `tests/test_readiness.py`

**Step 1: Write the failing test**
CLI監査が未達時に exit code 1、達成時に exit code 0 を返すテストを追加。

**Step 2: Run test to verify it fails**
Run: `PYTHONPATH=. pytest tests/test_readiness.py::test_cli_exit_code -q`
Expected: ImportError またはスクリプト未実装失敗。

**Step 3: Write minimal implementation**
- `scripts/check_production_readiness.py` で readiness 結果を JSON 出力し、未達時は `sys.exit(1)`
- `.github/workflows/production-readiness.yml` で pytest と CLI監査を実行
- `docs/operations/production-readiness.md` に運用手順を記載

**Step 4: Run test to verify it passes**
Run: `PYTHONPATH=. pytest tests/test_readiness.py -q`
Expected: PASS

### Task 4: 総合検証

**Files:**
- Verify: `app/main.py`
- Verify: `app/api/v1/routes.py`
- Verify: `.github/workflows/production-readiness.yml`

**Step 1: Run backend unit tests**
Run: `PYTHONPATH=. pytest tests/test_readiness.py tests/test_report_upload.py -q`
Expected: PASS

**Step 2: Run full targeted suite**
Run: `PYTHONPATH=. pytest tests/test_bei.py tests/test_energy.py tests/test_tariff.py tests/test_compliance.py -q`
Expected: PASS

**Step 3: Run readiness CLI**
Run: `PYTHONPATH=. python scripts/check_production_readiness.py --format text`
Expected: 現在設定に応じた PASS/FAIL が明示される。
