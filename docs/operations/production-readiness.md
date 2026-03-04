# Production Readiness Operations

## Purpose
確認申請運用に必要な最低条件を、同じロジックで API / CLI / 起動時に判定する。

## Readiness Criteria
- `SECRET_KEY` がデフォルト値ではなく、十分な長さであること
- `DATABASE_URL` が `sqlite` ではないこと
- 公式 API URL が `https` であること
- 公式 Excel テンプレートが存在すること

## Runtime Behavior
- `ENV=production` かつ `PRODUCTION_ENFORCE_READINESS=true` の場合:
  - 起動時に readiness 判定を実施
  - 未達なら `RuntimeError` で起動を停止 (fail-fast)
- `PRODUCTION_ENFORCE_READINESS=false` の場合:
  - API と CLI では readiness を参照可能
  - 起動自体は継続

## API Check
`GET /api/v1/official/readiness`

レスポンス例:
- `ready`: 全判定の合否
- `checks`: 各判定項目の真偽
- `failed_checks`: 未達項目一覧

## CLI Check
```bash
PYTHONPATH=. python scripts/check_production_readiness.py --format text
```

JSON で取得する場合:
```bash
PYTHONPATH=. python scripts/check_production_readiness.py --format json
```

終了コード:
- `0`: readiness 達成
- `1`: readiness 未達

## CI Gate
`.github/workflows/production-readiness.yml` で以下を実行:
1. `tests/test_readiness.py`
2. `tests/test_report_upload.py`
3. `scripts/check_production_readiness.py`

## Emergency Bypass Policy
緊急時のみ `PRODUCTION_ENFORCE_READINESS=false` を一時使用可能。
復旧後に必ず readiness 未達項目を解消し、`true` に戻すこと。
