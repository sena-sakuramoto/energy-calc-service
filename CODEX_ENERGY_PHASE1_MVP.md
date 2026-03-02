# Phase 1: MVP — 公式API安定化 + 製品DB + 選択式UI

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 楽々省エネ計算を「製品を選ぶだけでBEI適合を確認できるツール」に変える。公式API経由の計算結果で審査提出可能にする。

**Architecture:** フロントエンドは製品カード選択UI。バックエンドに製品DB(YAML) + 製品APIエンドポイントを追加。公式API呼び出しにリトライ・タイムアウトを追加。インフラを本番レベルに強化。

**Tech Stack:** FastAPI, Next.js 14, Tailwind CSS, openpyxl, PyYAML, requests

**UI設計原則:** CLAUDE.mdの12原則に従うこと。特に原則1（選択肢 > 自由入力）と原則2（AI出力にアクションボタン）を厳守。デザイン禁止事項（AIグラデーション青→紫、Inter、Lucideのみ、shadcnデフォルト）を遵守。

**完了条件:**
- `pytest` 全テストPASS（既存58件 + 新規テスト）
- `cd frontend && npm run build` 成功
- `uvicorn app.main:app` が起動し `/healthz` が200を返す
- 製品API `/api/v1/products/windows` がJSON返却
- SMALLMODEL UIが実態に合った表示をする

---

## Task 1: インフラ強化 — render.yaml + uvicorn workers

**Files:**
- Modify: `render.yaml`
- Modify: `app/core/config.py`

**Step 1: render.yaml にworkers追加 + 本番ゲート有効化**

```yaml
databases:
  - name: energy-calc-db
    plan: free
    databaseName: energy_calc
    user: energy_calc_user

services:
  - type: web
    name: energy-calc-service
    runtime: python
    plan: free
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn app.main:app --host 0.0.0.0 --port $PORT --workers 4
    healthCheckPath: /healthz
    envVars:
      - key: ENV
        value: production
      - key: SECRET_KEY
        generateValue: true
      - key: DATABASE_URL
        fromDatabase:
          name: energy-calc-db
          property: connectionURI
      - key: PYTHON_VERSION
        value: "3.11.9"
      - key: PRODUCTION_ENFORCE_READINESS
        value: "true"
```

変更点:
- `--workers 4` を startCommand に追加
- `PRODUCTION_ENFORCE_READINESS: "true"` を envVars に追加

**Step 2: Commit**

```bash
git add render.yaml
git commit -m "infra: add uvicorn workers and enable production readiness gate"
```

---

## Task 2: 公式APIリトライ + タイムアウト短縮

**Files:**
- Modify: `app/services/report.py` (`_post_to_api` 関数)
- Create: `tests/test_api_retry.py`

**Step 1: テストを書く**

`tests/test_api_retry.py`:

```python
"""Tests for official API retry logic."""
import io
from unittest.mock import patch, MagicMock

import pytest
import requests

from app.services.report import _post_to_api


class TestApiRetry:
    """Verify _post_to_api retries on transient failures."""

    def _make_buffer(self) -> io.BytesIO:
        buf = io.BytesIO(b"fake-excel-content")
        buf.seek(0)
        return buf

    def test_success_on_first_try(self):
        fake_resp = MagicMock()
        fake_resp.status_code = 200
        fake_resp.raise_for_status = MagicMock()
        with patch("app.services.report.requests.post", return_value=fake_resp):
            resp = _post_to_api("https://example.com/api", self._make_buffer())
            assert resp.status_code == 200

    def test_retry_on_500_then_succeed(self):
        fail_resp = MagicMock()
        fail_resp.status_code = 500
        fail_resp.text = "Internal Server Error"
        fail_resp.raise_for_status.side_effect = requests.exceptions.HTTPError(response=fail_resp)

        ok_resp = MagicMock()
        ok_resp.status_code = 200
        ok_resp.raise_for_status = MagicMock()

        with patch("app.services.report.requests.post", side_effect=[
            requests.exceptions.HTTPError(response=fail_resp),
            ok_resp,
        ]):
            resp = _post_to_api("https://example.com/api", self._make_buffer())
            assert resp.status_code == 200

    def test_fail_after_max_retries(self):
        fail_resp = MagicMock()
        fail_resp.status_code = 500
        fail_resp.text = "Internal Server Error"

        with patch("app.services.report.requests.post",
                   side_effect=requests.exceptions.ConnectionError("refused")):
            with pytest.raises(Exception, match="API request failed"):
                _post_to_api("https://example.com/api", self._make_buffer())

    def test_timeout_is_30_seconds(self):
        """Verify default timeout is 30s, not 120s."""
        ok_resp = MagicMock()
        ok_resp.status_code = 200
        ok_resp.raise_for_status = MagicMock()

        with patch("app.services.report.requests.post", return_value=ok_resp) as mock_post:
            _post_to_api("https://example.com/api", self._make_buffer())
            _, kwargs = mock_post.call_args
            assert kwargs["timeout"] == 30
```

**Step 2: テスト実行 → FAIL確認**

```bash
pytest tests/test_api_retry.py -v
```

Expected: FAIL（リトライ未実装、タイムアウトが120s）

**Step 3: `_post_to_api` にリトライ + タイムアウト30s実装**

`app/services/report.py` の `_post_to_api` を以下に置換:

```python
def _post_to_api(
    url: str,
    excel_buffer: io.BytesIO,
    timeout: int = 30,
    max_retries: int = 3,
) -> requests.Response:
    """POST an Excel buffer to a lowenergy.jp endpoint with retry."""
    headers = {"Content-Type": EXCEL_CONTENT_TYPE}
    excel_buffer.seek(0)
    payload = excel_buffer.read()

    last_exc: Optional[Exception] = None
    for attempt in range(1, max_retries + 1):
        try:
            response = requests.post(url, data=payload, headers=headers, timeout=timeout)
            response.raise_for_status()
            return response
        except requests.exceptions.RequestException as exc:
            last_exc = exc
            detail = exc.response.text if getattr(exc, "response", None) is not None else ""
            logger.warning(
                "API call attempt %d/%d failed (%s): %s",
                attempt, max_retries, url, detail,
            )
            if attempt < max_retries:
                import time
                time.sleep(min(2 ** attempt, 10))

    detail = last_exc.response.text if getattr(last_exc, "response", None) is not None else ""
    logger.exception("API call failed after %d retries (%s): %s", max_retries, url, detail)
    raise Exception(f"API request failed: {last_exc} {detail}") from last_exc
```

**Step 4: テスト実行 → PASS確認**

```bash
pytest tests/test_api_retry.py -v
```

Expected: ALL PASS

**Step 5: 既存テストも壊れていないか確認**

```bash
pytest -v
```

Expected: ALL PASS

**Step 6: Commit**

```bash
git add app/services/report.py tests/test_api_retry.py
git commit -m "fix(api): add retry with backoff and reduce timeout to 30s"
```

---

## Task 3: ファイルアップロードサイズ制限

**Files:**
- Modify: `app/api/v1/routes.py`

**Step 1: Excelアップロードエンドポイントにサイズチェック追加**

`app/api/v1/routes.py` のExcelアップロード関数（`upload_excel_get_report` と `upload_excel_get_compute`）の先頭に追加:

```python
MAX_UPLOAD_SIZE = 10 * 1024 * 1024  # 10MB
```

各upload関数の冒頭にサイズチェックを追加:

```python
    contents = await file.read()
    if len(contents) > MAX_UPLOAD_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"ファイルサイズが上限（10MB）を超えています。({len(contents) // 1024 // 1024}MB)",
        )
```

**Step 2: Commit**

```bash
git add app/api/v1/routes.py
git commit -m "fix(api): add 10MB upload size limit for Excel files"
```

---

## Task 4: SMALLMODEL UIの嘘を修正

**Files:**
- Modify: `frontend/src/pages/tools/official-bei.jsx`

**Step 1: SMALLMODEL表示を実態に合わせる**

現在のコードで「小規模版テンプレート(SMALLMODEL)が使用されます」と表示している箇所を検索し、以下に変更:

```jsx
{isSmall && (
  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
    <p className="font-semibold">300m\u00B2未満の建物について</p>
    <p className="mt-1">
      現在、公式APIの制限により小規模版テンプレート(SMALLMODEL)は使用できません。
      通常テンプレート(MODEL)で計算を行います。計算精度に影響はありませんが、
      一部の入力項目が小規模建物には不要な場合があります。
    </p>
  </div>
)}
```

**Step 2: ビルド確認**

```bash
cd frontend && npm run build
```

Expected: ビルド成功

**Step 3: Commit**

```bash
git add frontend/src/pages/tools/official-bei.jsx
git commit -m "fix(ui): honest SMALLMODEL display - explain MODEL template fallback"
```

---

## Task 5: 製品データベース — YAMLスキーマ + 初期データ

**Files:**
- Create: `data/products/windows.yaml`
- Create: `data/products/insulation.yaml`
- Create: `data/products/hvac.yaml`
- Create: `data/products/lighting.yaml`
- Create: `data/products/schema.md`

**Step 1: スキーマ定義**

`data/products/schema.md`:

```markdown
# 製品データベース スキーマ

## 共通フィールド

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| id | string | Y | 一意の製品ID（例: "ykk-apw430-fix-16513"） |
| manufacturer | string | Y | メーカー名 |
| series | string | Y | シリーズ名 |
| name | string | Y | 表示名 |
| partner | boolean | N | パートナー製品（優先表示）。デフォルト false |
| catalog_url | string | N | カタログURL |
| recommended_zones | int[] | N | 推奨地域区分（1-8） |
| recommended_uses | string[] | N | 推奨用途 |

## windows.yaml 追加フィールド

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| window_type | string | Y | "樹脂", "アルミ樹脂複合", "アルミ" |
| frame_type | string | Y | "FIX", "引違い", "縦すべり出し", "横すべり出し" |
| glass_type | string | Y | "Low-E複層", "複層", "トリプル" |
| u_value | float | Y | 熱貫流率 [W/(m2・K)] |
| eta_c | float | Y | 冷房期日射熱取得率 |
| eta_h | float | Y | 暖房期日射熱取得率 |

## insulation.yaml 追加フィールド

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| category | string | Y | 断熱材区分 "A-1","A-2","B","C","D","E","F" |
| material_type | string | Y | 材料種別 |
| lambda_value | float | Y | 熱伝導率 [W/(m・K)] |
| typical_thickness_mm | int[] | N | 一般的な厚さ [mm] |

## hvac.yaml 追加フィールド

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| equipment_type | string | Y | "パッケージエアコン","マルチエアコン","チラー" |
| capacity_kw | float | Y | 定格能力 [kW] |
| apf | float | N | 通年エネルギー消費効率 |
| cop_cooling | float | N | 冷房COP |
| cop_heating | float | N | 暖房COP |

## lighting.yaml 追加フィールド

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| fixture_type | string | Y | "ベースライト","ダウンライト","シーリング" |
| lm_per_w | float | Y | 固有エネルギー消費効率 [lm/W] |
| wattage | float | Y | 消費電力 [W] |
| dimming | boolean | N | 調光対応 |
```

**Step 2: windows.yaml 初期データ（YKK AP + LIXIL + 三協アルミ）**

`data/products/windows.yaml`:

```yaml
# 窓サッシ製品データベース
# 出典: 各メーカー公式技術資料（2025-2026年版）
# partner: true はパートナー企業の製品（優先表示）

- id: ykk-apw430-fix
  manufacturer: "YKK AP"
  series: "APW 430"
  name: "APW 430 FIX窓"
  window_type: "樹脂"
  frame_type: "FIX"
  glass_type: "トリプル"
  u_value: 0.90
  eta_c: 0.33
  eta_h: 0.45
  partner: true
  recommended_zones: [1, 2, 3, 4, 5]
  recommended_uses: ["office", "hotel", "hospital"]
  catalog_url: "https://www.ykkap.co.jp/apw/"

- id: ykk-apw430-sliding
  manufacturer: "YKK AP"
  series: "APW 430"
  name: "APW 430 引違い窓"
  window_type: "樹脂"
  frame_type: "引違い"
  glass_type: "トリプル"
  u_value: 1.31
  eta_c: 0.39
  eta_h: 0.51
  partner: true
  recommended_zones: [1, 2, 3, 4, 5, 6]
  recommended_uses: ["office", "hotel", "school"]
  catalog_url: "https://www.ykkap.co.jp/apw/"

- id: ykk-apw330-fix
  manufacturer: "YKK AP"
  series: "APW 330"
  name: "APW 330 FIX窓"
  window_type: "樹脂"
  frame_type: "FIX"
  glass_type: "Low-E複層"
  u_value: 1.31
  eta_c: 0.40
  eta_h: 0.52
  partner: true
  recommended_zones: [3, 4, 5, 6, 7]
  recommended_uses: ["office", "school", "restaurant"]
  catalog_url: "https://www.ykkap.co.jp/apw/"

- id: ykk-apw330-sliding
  manufacturer: "YKK AP"
  series: "APW 330"
  name: "APW 330 引違い窓"
  window_type: "樹脂"
  frame_type: "引違い"
  glass_type: "Low-E複層"
  u_value: 1.67
  eta_c: 0.48
  eta_h: 0.59
  partner: true
  recommended_zones: [4, 5, 6, 7, 8]
  recommended_uses: ["office", "school", "assembly"]
  catalog_url: "https://www.ykkap.co.jp/apw/"

- id: ykk-apw230-sliding
  manufacturer: "YKK AP"
  series: "APW 230"
  name: "APW 230 引違い窓"
  window_type: "アルミ樹脂複合"
  frame_type: "引違い"
  glass_type: "Low-E複層"
  u_value: 2.33
  eta_c: 0.52
  eta_h: 0.63
  partner: true
  recommended_zones: [5, 6, 7, 8]
  recommended_uses: ["factory", "assembly"]
  catalog_url: "https://www.ykkap.co.jp/apw/"

- id: lixil-tw-fix
  manufacturer: "LIXIL"
  series: "TW"
  name: "TW FIX窓"
  window_type: "樹脂"
  frame_type: "FIX"
  glass_type: "Low-E複層"
  u_value: 1.28
  eta_c: 0.38
  eta_h: 0.50
  partner: false
  recommended_zones: [3, 4, 5, 6, 7]
  recommended_uses: ["office", "hotel"]
  catalog_url: "https://www.lixil.co.jp/lineup/window/"

- id: lixil-tw-sliding
  manufacturer: "LIXIL"
  series: "TW"
  name: "TW 引違い窓"
  window_type: "樹脂"
  frame_type: "引違い"
  glass_type: "Low-E複層"
  u_value: 1.53
  eta_c: 0.45
  eta_h: 0.57
  partner: false
  recommended_zones: [4, 5, 6, 7, 8]
  recommended_uses: ["office", "school"]
  catalog_url: "https://www.lixil.co.jp/lineup/window/"

- id: lixil-ew-fix
  manufacturer: "LIXIL"
  series: "EW"
  name: "EW FIX窓"
  window_type: "樹脂"
  frame_type: "FIX"
  glass_type: "トリプル"
  u_value: 0.79
  eta_c: 0.28
  eta_h: 0.37
  partner: false
  recommended_zones: [1, 2, 3, 4]
  recommended_uses: ["office", "hotel", "hospital"]
  catalog_url: "https://www.lixil.co.jp/lineup/window/"

- id: sankyo-algeo-sliding
  manufacturer: "三協アルミ"
  series: "アルジオ"
  name: "アルジオ 引違い窓"
  window_type: "樹脂"
  frame_type: "引違い"
  glass_type: "Low-E複層"
  u_value: 1.49
  eta_c: 0.44
  eta_h: 0.55
  partner: false
  recommended_zones: [4, 5, 6, 7]
  recommended_uses: ["office", "school"]
  catalog_url: "https://alumi.st-grp.co.jp/"

- id: sankyo-madimo-sliding
  manufacturer: "三協アルミ"
  series: "マディオ"
  name: "マディオ 引違い窓"
  window_type: "アルミ樹脂複合"
  frame_type: "引違い"
  glass_type: "Low-E複層"
  u_value: 2.15
  eta_c: 0.50
  eta_h: 0.61
  partner: false
  recommended_zones: [5, 6, 7, 8]
  recommended_uses: ["factory", "assembly"]
  catalog_url: "https://alumi.st-grp.co.jp/"
```

**Step 3: insulation.yaml**

`data/products/insulation.yaml`:

```yaml
# 断熱材カテゴリデータベース
# 出典: 国土交通省 省エネルギー基準 断熱材の熱伝導率表
# 個別製品ではなくカテゴリ（A-1〜F）で分類（公式計算の入力方式に準拠）

- id: insul-a1-gw10k
  manufacturer: "一般"
  series: "グラスウール"
  name: "グラスウール 10K"
  category: "A-1"
  material_type: "グラスウール（10K相当）"
  lambda_value: 0.050
  typical_thickness_mm: [50, 75, 100]
  recommended_zones: [6, 7, 8]

- id: insul-a2-gw16k
  manufacturer: "一般"
  series: "グラスウール"
  name: "グラスウール 16K"
  category: "A-2"
  material_type: "グラスウール（16K相当）"
  lambda_value: 0.045
  typical_thickness_mm: [50, 75, 100, 105]
  recommended_zones: [5, 6, 7, 8]

- id: insul-b-gw24k
  manufacturer: "一般"
  series: "グラスウール"
  name: "高性能グラスウール 24K"
  category: "B"
  material_type: "高性能グラスウール（24K相当）"
  lambda_value: 0.038
  typical_thickness_mm: [75, 100, 105, 120]
  recommended_zones: [4, 5, 6, 7]

- id: insul-c-gw32k
  manufacturer: "一般"
  series: "グラスウール"
  name: "高性能グラスウール 32K"
  category: "C"
  material_type: "高性能グラスウール（32K相当）"
  lambda_value: 0.035
  typical_thickness_mm: [75, 100, 105, 120]
  recommended_zones: [3, 4, 5, 6]

- id: insul-d-xps3
  manufacturer: "一般"
  series: "押出法ポリスチレンフォーム"
  name: "XPS 3種"
  category: "D"
  material_type: "押出法ポリスチレンフォーム3種"
  lambda_value: 0.028
  typical_thickness_mm: [25, 30, 40, 50, 60]
  recommended_zones: [2, 3, 4, 5, 6]

- id: insul-e-upf1
  manufacturer: "一般"
  series: "硬質ウレタンフォーム"
  name: "硬質ウレタンフォーム1種"
  category: "E"
  material_type: "硬質ウレタンフォーム1種"
  lambda_value: 0.024
  typical_thickness_mm: [25, 30, 40, 50]
  recommended_zones: [1, 2, 3, 4, 5]

- id: insul-f-phenol
  manufacturer: "一般"
  series: "フェノールフォーム"
  name: "フェノールフォーム"
  category: "F"
  material_type: "フェノールフォーム"
  lambda_value: 0.020
  typical_thickness_mm: [25, 30, 40, 50, 60]
  recommended_zones: [1, 2, 3, 4]
```

**Step 4: hvac.yaml**

`data/products/hvac.yaml`:

```yaml
# 空調設備製品データベース
# 出典: 各メーカー技術資料（2025-2026年版）
# partner: true はパートナー企業の製品

- id: panasonic-pac-mid
  manufacturer: "パナソニック"
  series: "Xシリーズ"
  name: "パッケージエアコン 中規模"
  equipment_type: "パッケージエアコン"
  capacity_kw: 14.0
  cop_cooling: 3.5
  cop_heating: 4.0
  apf: 6.2
  partner: true
  recommended_zones: [4, 5, 6, 7, 8]
  recommended_uses: ["office", "shop_department", "restaurant"]
  catalog_url: "https://www2.panasonic.biz/jp/air/"

- id: panasonic-pac-large
  manufacturer: "パナソニック"
  series: "Gシリーズ"
  name: "パッケージエアコン 大規模"
  equipment_type: "パッケージエアコン"
  capacity_kw: 28.0
  cop_cooling: 3.2
  cop_heating: 3.8
  apf: 5.8
  partner: true
  recommended_zones: [4, 5, 6, 7, 8]
  recommended_uses: ["office", "hotel", "hospital"]
  catalog_url: "https://www2.panasonic.biz/jp/air/"

- id: panasonic-multi-office
  manufacturer: "パナソニック"
  series: "マルチエアコン"
  name: "ビル用マルチ 事務所向け"
  equipment_type: "マルチエアコン"
  capacity_kw: 22.4
  cop_cooling: 3.8
  cop_heating: 4.2
  apf: 6.5
  partner: true
  recommended_zones: [3, 4, 5, 6, 7]
  recommended_uses: ["office", "hotel"]
  catalog_url: "https://www2.panasonic.biz/jp/air/"

- id: daikin-vrv-standard
  manufacturer: "ダイキン"
  series: "VRV"
  name: "VRV 標準タイプ"
  equipment_type: "マルチエアコン"
  capacity_kw: 22.4
  cop_cooling: 4.0
  cop_heating: 4.5
  apf: 7.1
  partner: false
  recommended_zones: [1, 2, 3, 4, 5, 6, 7, 8]
  recommended_uses: ["office", "hotel", "hospital"]
  catalog_url: "https://www.daikin.co.jp/products/ac/"

- id: mitsubishi-citymulti
  manufacturer: "三菱電機"
  series: "シティマルチ"
  name: "シティマルチ Y シリーズ"
  equipment_type: "マルチエアコン"
  capacity_kw: 22.4
  cop_cooling: 3.9
  cop_heating: 4.3
  apf: 6.8
  partner: false
  recommended_zones: [1, 2, 3, 4, 5, 6, 7, 8]
  recommended_uses: ["office", "hotel", "hospital", "shop_department"]
  catalog_url: "https://www.mitsubishielectric.co.jp/air/"
```

**Step 5: lighting.yaml**

`data/products/lighting.yaml`:

```yaml
# 照明設備製品データベース
# 出典: 各メーカー技術資料（2025-2026年版）
# partner: true はパートナー企業の製品

- id: panasonic-id-higheff
  manufacturer: "パナソニック"
  series: "iDシリーズ"
  name: "iDシリーズ 省エネタイプ"
  fixture_type: "ベースライト"
  lm_per_w: 193.9
  wattage: 26.3
  dimming: true
  partner: true
  recommended_uses: ["office", "school", "hospital"]
  catalog_url: "https://www2.panasonic.biz/jp/lighting/"

- id: panasonic-id-standard
  manufacturer: "パナソニック"
  series: "iDシリーズ"
  name: "iDシリーズ 一般タイプ"
  fixture_type: "ベースライト"
  lm_per_w: 163.0
  wattage: 31.9
  dimming: true
  partner: true
  recommended_uses: ["office", "school", "factory"]
  catalog_url: "https://www2.panasonic.biz/jp/lighting/"

- id: panasonic-downlight-led
  manufacturer: "パナソニック"
  series: "LEDダウンライト"
  name: "LEDダウンライト 高効率"
  fixture_type: "ダウンライト"
  lm_per_w: 150.0
  wattage: 10.5
  dimming: true
  partner: true
  recommended_uses: ["hotel", "restaurant", "assembly"]
  catalog_url: "https://www2.panasonic.biz/jp/lighting/"

- id: koizumi-baselight
  manufacturer: "コイズミ照明"
  series: "LEDベースライト"
  name: "LEDベースライト 直管形"
  fixture_type: "ベースライト"
  lm_per_w: 170.0
  wattage: 28.0
  dimming: false
  partner: false
  recommended_uses: ["office", "school", "factory"]

- id: odelic-led-highbay
  manufacturer: "オーデリック"
  series: "LED高天井用"
  name: "LED高天井照明"
  fixture_type: "シーリング"
  lm_per_w: 140.0
  wattage: 120.0
  dimming: false
  partner: false
  recommended_uses: ["factory", "assembly"]

- id: generic-led-standard
  manufacturer: "一般"
  series: "LED"
  name: "一般LED照明 標準"
  fixture_type: "ベースライト"
  lm_per_w: 120.0
  wattage: 40.0
  dimming: false
  partner: false
  recommended_uses: ["office", "school", "factory", "restaurant", "assembly"]

- id: generic-led-higheff
  manufacturer: "一般"
  series: "LED"
  name: "一般LED照明 高効率"
  fixture_type: "ベースライト"
  lm_per_w: 150.0
  wattage: 32.0
  dimming: false
  partner: false
  recommended_uses: ["office", "school", "hospital"]
```

**Step 6: Commit**

```bash
git add data/products/
git commit -m "feat(data): add product database - windows, insulation, HVAC, lighting"
```

---

## Task 6: 製品APIエンドポイント

**Files:**
- Create: `app/services/products.py`
- Create: `app/api/v1/products.py`
- Modify: `app/main.py` (ルーター追加)
- Create: `tests/test_products.py`

**Step 1: テストを書く**

`tests/test_products.py`:

```python
"""Tests for product database API."""
import pytest
from app.services.products import load_products, get_recommended_products


class TestProductLoad:
    def test_load_windows(self):
        products = load_products("windows")
        assert len(products) > 0
        for p in products:
            assert "id" in p
            assert "manufacturer" in p
            assert "u_value" in p

    def test_load_insulation(self):
        products = load_products("insulation")
        assert len(products) > 0
        for p in products:
            assert "lambda_value" in p

    def test_load_hvac(self):
        products = load_products("hvac")
        assert len(products) > 0

    def test_load_lighting(self):
        products = load_products("lighting")
        assert len(products) > 0

    def test_invalid_category(self):
        with pytest.raises(FileNotFoundError):
            load_products("nonexistent")


class TestProductRecommendation:
    def test_recommend_windows_by_zone(self):
        results = get_recommended_products("windows", zone=6)
        assert len(results) > 0
        for p in results:
            assert 6 in p.get("recommended_zones", [])

    def test_recommend_windows_by_use(self):
        results = get_recommended_products("windows", use="office")
        assert len(results) > 0

    def test_partner_products_first(self):
        results = get_recommended_products("windows", zone=6)
        partner_seen = False
        non_partner_seen = False
        for p in results:
            if p.get("partner"):
                assert not non_partner_seen, "Partner products must come before non-partner"
                partner_seen = True
            else:
                non_partner_seen = True
```

**Step 2: テスト実行 → FAIL確認**

```bash
pytest tests/test_products.py -v
```

**Step 3: 実装**

`app/services/products.py`:

```python
"""Product database service — loads YAML product catalogs."""
from __future__ import annotations

from pathlib import Path
from typing import Any, Dict, List, Optional

import yaml

PRODUCTS_DIR = Path(__file__).resolve().parents[2] / "data" / "products"


def load_products(category: str) -> List[Dict[str, Any]]:
    """Load all products for a given category (windows, insulation, hvac, lighting)."""
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
) -> List[Dict[str, Any]]:
    """Return products filtered by zone/use, partner products first."""
    products = load_products(category)

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

    # Partner products first, then by name
    filtered.sort(key=lambda p: (not p.get("partner", False), p.get("name", "")))
    return filtered
```

`app/api/v1/products.py`:

```python
"""Product catalog API endpoints."""
from typing import Optional

from fastapi import APIRouter, HTTPException, Query

from app.services.products import load_products, get_recommended_products

router = APIRouter(prefix="/products", tags=["Products"])


@router.get("/{category}")
async def list_products(
    category: str,
    zone: Optional[int] = Query(None, ge=1, le=8, description="地域区分 1-8"),
    use: Optional[str] = Query(None, description="建物用途 (例: office, hotel)"),
):
    """製品一覧を返す。zone/useでフィルタ可能。パートナー製品が優先表示。"""
    try:
        if zone is not None or use is not None:
            products = get_recommended_products(category, zone=zone, use=use)
        else:
            products = load_products(category)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"カテゴリ '{category}' は存在しません。")
    return {"category": category, "count": len(products), "products": products}
```

**Step 4: app/main.py にルーター追加**

`app/main.py` の import セクションに追加:

```python
from app.api.v1.products import router as products_router
```

`app.include_router(public_router, ...)` の後に追加:

```python
app.include_router(products_router, prefix=settings.API_PREFIX)
```

**Step 5: テスト実行 → PASS確認**

```bash
pytest tests/test_products.py -v
pytest -v  # 全テスト
```

**Step 6: Commit**

```bash
git add app/services/products.py app/api/v1/products.py app/main.py tests/test_products.py
git commit -m "feat(api): add product catalog endpoint with zone/use filtering"
```

---

## Task 7: 選択式UI — 製品カード選択コンポーネント

**Files:**
- Create: `frontend/src/components/ProductSelector.jsx`
- Modify: `frontend/src/utils/api.js` (productsAPI追加)
- Modify: `frontend/src/pages/tools/official-bei.jsx` (製品選択ステップ統合)

**Step 1: API クライアント追加**

`frontend/src/utils/api.js` に追加:

```javascript
// ── Product Catalog API ─────────────────────────────────────────
export const productsAPI = {
  listWindows: (zone, use) =>
    api.get('/products/windows', { params: { zone, use } }).then(r => r.data),
  listInsulation: (zone) =>
    api.get('/products/insulation', { params: { zone } }).then(r => r.data),
  listHvac: (zone, use) =>
    api.get('/products/hvac', { params: { zone, use } }).then(r => r.data),
  listLighting: (use) =>
    api.get('/products/lighting', { params: { use } }).then(r => r.data),
};
```

**Step 2: ProductSelector コンポーネント**

`frontend/src/components/ProductSelector.jsx`:

```jsx
import { useState, useEffect } from 'react';
import { productsAPI } from '../utils/api';

/**
 * 製品選択カードUI
 *
 * UI原則 #1: 選択肢 > 自由入力
 * UI原則 #10: デフォルト最適化（推奨製品がデフォルト選択済み）
 *
 * Props:
 *   category: "windows" | "insulation" | "hvac" | "lighting"
 *   zone: number (1-8) — フィルタ用
 *   use: string — 建物用途フィルタ
 *   onSelect: (product) => void
 *   selected: product | null
 *   allowManualInput: boolean — 手動入力フォールバック表示
 */
export default function ProductSelector({
  category,
  zone,
  use,
  onSelect,
  selected,
  allowManualInput = true,
}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showManual, setShowManual] = useState(false);
  const [error, setError] = useState(null);

  const categoryLabels = {
    windows: '窓サッシ',
    insulation: '断熱材',
    hvac: '空調設備',
    lighting: '照明設備',
  };

  useEffect(() => {
    setLoading(true);
    setError(null);
    const fetchers = {
      windows: () => productsAPI.listWindows(zone, use),
      insulation: () => productsAPI.listInsulation(zone),
      hvac: () => productsAPI.listHvac(zone, use),
      lighting: () => productsAPI.listLighting(use),
    };
    const fetcher = fetchers[category];
    if (!fetcher) {
      setError(`不明なカテゴリ: ${category}`);
      setLoading(false);
      return;
    }
    fetcher()
      .then((data) => {
        setProducts(data.products || []);
        // UI原則 #10: パートナー推奨品をデフォルト選択
        if (!selected && data.products?.length > 0) {
          const partner = data.products.find((p) => p.partner);
          if (partner) onSelect(partner);
        }
      })
      .catch((err) => setError('製品データの読み込みに失敗しました'))
      .finally(() => setLoading(false));
  }, [category, zone, use]);

  const renderSpec = (product) => {
    switch (category) {
      case 'windows':
        return `U=${product.u_value} | ${product.window_type} | ${product.glass_type}`;
      case 'insulation':
        return `λ=${product.lambda_value} | ${product.category} | ${product.material_type}`;
      case 'hvac':
        return `APF=${product.apf || '-'} | ${product.capacity_kw}kW | ${product.equipment_type}`;
      case 'lighting':
        return `${product.lm_per_w}lm/W | ${product.wattage}W | ${product.fixture_type}`;
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8 text-slate-500">
        {categoryLabels[category]}を読み込み中...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div>
      <div className="grid gap-3">
        {products.map((product) => {
          const isSelected = selected?.id === product.id;
          return (
            <button
              key={product.id}
              type="button"
              onClick={() => { setShowManual(false); onSelect(product); }}
              className={`
                w-full text-left p-4 rounded-lg border-2 transition-all
                ${isSelected
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-slate-200 bg-white hover:border-slate-300'
                }
              `}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">{product.name}</span>
                    {product.partner && (
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                        おすすめ
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 mt-1">{product.manufacturer} {product.series}</p>
                  <p className="text-sm text-slate-600 mt-1 font-mono">{renderSpec(product)}</p>
                </div>
                {isSelected && (
                  <span className="text-emerald-500 text-xl">&#10003;</span>
                )}
              </div>
            </button>
          );
        })}

        {allowManualInput && (
          <button
            type="button"
            onClick={() => { setShowManual(true); onSelect(null); }}
            className={`
              w-full text-left p-4 rounded-lg border-2 transition-all
              ${showManual
                ? 'border-slate-500 bg-slate-50'
                : 'border-dashed border-slate-300 bg-white hover:border-slate-400'
              }
            `}
          >
            <span className="text-slate-600">スペックを直接入力</span>
          </button>
        )}
      </div>
    </div>
  );
}
```

**Step 3: official-bei.jsx に製品選択ステップを統合**

official-bei.jsx のステップ2（窓）、ステップ3（断熱）、ステップ5（空調）、ステップ7（照明）のそれぞれの入力フォームの上部に `ProductSelector` を追加する。

各ステップの既存テーブル入力の前に以下パターンを挿入:

```jsx
import ProductSelector from '../../components/ProductSelector';

// ステップ2（窓）の例:
<ProductSelector
  category="windows"
  zone={parseInt(formData.building?.region?.replace('地域', ''), 10) || 6}
  use={/* building_type から use キーに変換 */}
  selected={selectedProducts.windows}
  onSelect={(product) => {
    setSelectedProducts(prev => ({ ...prev, windows: product }));
    if (product) {
      // 製品のスペックでフォームの1行目を自動入力
      const newWindows = [...formData.windows];
      if (newWindows.length === 0) newWindows.push({});
      newWindows[0] = {
        ...newWindows[0],
        window_type: product.window_type || '',
        glass_type: product.glass_type || '',
        window_u_value: product.u_value || '',
        window_shgc: product.eta_c || '',
      };
      setFormData(prev => ({ ...prev, windows: newWindows }));
    }
  }}
/>
```

同様のパターンを insulation, hvac, lighting にも適用。

**注意:** `selectedProducts` はコンポーネントトップレベルの state として追加:

```jsx
const [selectedProducts, setSelectedProducts] = useState({
  windows: null,
  insulation: null,
  hvac: null,
  lighting: null,
});
```

**Step 4: ビルド確認**

```bash
cd frontend && npm run build
```

**Step 5: Commit**

```bash
git add frontend/src/components/ProductSelector.jsx frontend/src/utils/api.js frontend/src/pages/tools/official-bei.jsx
git commit -m "feat(ui): add product card selector with partner priority and auto-fill"
```

---

## Task 8: 全体動作確認 + 最終コミット

**Step 1: バックエンド全テスト**

```bash
pytest -v
```

Expected: ALL PASS

**Step 2: フロントエンドビルド**

```bash
cd frontend && npm run build
```

Expected: ビルド成功

**Step 3: 手動動作確認**

```bash
uvicorn app.main:app --reload
```

- `http://localhost:8000/api/v1/products/windows?zone=6&use=office` → JSON返却
- `http://localhost:8000/healthz` → `{"status": "ok"}`

**Step 4: Phase 1 完了コミット**

```bash
git add -A
git commit -m "feat: Phase 1 MVP complete - product DB, selection UI, API hardening"
git push origin main
```
