# Codex ハンドオフ: TASK_B 残作業

## 完了済み (Step 1 + Step 2)

### Step 1: Excel テンプレート構造解析 — DONE
- `docs/excel-template-analysis.md` に全分析結果を記録済み
- Named Ranges はドロップダウンリスト参照のみ（入力セル識別には使えない）
- 様式A: 固定セル (C3-G22), 様式B1-I: テーブル形式 (行11-1010)

### Step 2: CELL_MAPPING + スキーマ + フロントエンド — DONE
変更ファイル一覧:

| ファイル | 変更内容 |
|---------|---------|
| `app/schemas/bei.py` | OfficialBuildingInfo 他14モデル追加、BEIRequest に `official_input` フィールド追加 |
| `app/services/report.py` | FORM_A_MAPPING (20項目), TABLE_COLUMNS (13テーブル), SMALL_SHEET_MAP 実装 |
| `app/api/v1/routes.py` | `_bei_request_to_report_input()` を official_input 対応に書き換え |
| `frontend/src/utils/api.js` | `officialAPI` エクスポート追加 (4関数) |
| `frontend/src/pages/tools/official-bei.jsx` | 10ステップウィザード新規作成 (~600行) |
| `frontend/src/components/Header.jsx` | ナビに「公式BEI計算」リンク追加 |
| `frontend/src/pages/dashboard.jsx` | ツール一覧に「公式BEI計算」追加 |
| `frontend/src/components/ComplianceReport.jsx` | useState の条件付き呼び出しバグ修正 |

- `npm run build` 成功確認済み
- バックエンドのインポート・Excelバッファ生成テスト通過済み

---

## 未完了 (Step 3): 公式API結合修正 + テスト

### 最重要バグ: API送信方式が間違っている

**現状** (`app/services/report.py` の `_post_to_api`):
```python
files = {"file": ("input.xlsx", excel_buffer, "application/...")}
response = requests.post(url, files=files, timeout=timeout)
```
→ multipart/form-data で送信している

**正しい方式** (`model_api_v3.8_guide.md` セクション6.1参照):
```bash
curl -X POST "https://api.lowenergy.jp/model/1/v380/computeFromInputSheets" \
  -H "Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" \
  --data-binary @input_sheets.xlsx
```
→ **raw binary body** + Content-Type ヘッダーで送信すべき

**修正方法**:
```python
def _post_to_api(url: str, excel_buffer: io.BytesIO, timeout: int = 120) -> requests.Response:
    headers = {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    }
    excel_buffer.seek(0)
    response = requests.post(url, data=excel_buffer.read(), headers=headers, timeout=timeout)
    response.raise_for_status()
    return response
```

同様に `get_official_report_from_excel` / `get_official_compute_from_excel` (ユーザーアップロード版) も同じ修正が必要。

### 修正後のテスト手順

1. **compute テスト**: 最低限の様式Aデータでステータスを確認
```python
from app.services.report import _build_excel_buffer, get_official_compute_from_api
input_data = {
    "building": {
        "building_name": "テストビル",
        "region": "6地域",
        "building_type": "事務所モデル",
        "calc_floor_area": 500.0,
    }
}
result = get_official_compute_from_api(input_data)
print(result["Status"])  # "Error" → バリデーション詳細確認, "OK" → 成功
print(result["BasicInformationValidationResult"])
```

2. **report テスト**: PDF バイト列が返るか確認
```python
from app.services.report import get_official_report_from_api
pdf_bytes = get_official_report_from_api(input_data)
assert pdf_bytes[:4] == b'%PDF'
```

3. **フロントエンド E2E**: `npm run dev` → `/tools/official-bei` → 10ステップ入力 → 計算実行 → PDF ダウンロード

### 追加で確認すべきこと

- 様式Aの**必須セル**が足りているか（APIバリデーション結果の Errors を確認）
- `code_symbol` (E13) と `code_use` (E14) にExcelテンプレートのドロップダウン値を入れる必要があるかもしれない
- SMALLMODEL版の動作確認 (calc_floor_area < 300)
- `official-bei.jsx` フロントエンドの実際の使用感（入力→送信→結果表示の一連の流れ）

---

## ファイル構成参照

```
app/
  schemas/bei.py          ← 14モデル + OfficialInput + BEIRequest
  services/report.py      ← FORM_A_MAPPING, TABLE_COLUMNS, _post_to_api (★修正対象)
  api/v1/routes.py        ← 4 official endpoints + _bei_request_to_report_input
frontend/src/
  pages/tools/official-bei.jsx  ← 10ステップウィザード
  utils/api.js                  ← officialAPI export
  components/Header.jsx         ← ナビリンク追加済み
docs/
  excel-template-analysis.md    ← テンプレート解析結果
model_api_v3.8_guide.md         ← API仕様ガイド (セクション6が重要)
TASK_B_INSTRUCTIONS.md          ← 元タスク仕様
```
