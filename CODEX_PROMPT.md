# Codex CLI プロンプト

以下をそのままコピーして `codex` に貼り付け:

---

```
CODEX_HANDOFF.md を読んで、そこに書かれた「未完了 (Step 3)」の修正を実装してください。

具体的には:

1. app/services/report.py の _post_to_api() を修正。現在 multipart/form-data で送信しているが、model_api_v3.8_guide.md セクション6.1の通り raw binary body + Content-Type ヘッダーで送信する方式に変更。get_official_report_from_excel / get_official_compute_from_excel も同様に修正。

2. 修正後、Pythonで国交省API (https://api.lowenergy.jp/model/1/v380/computeFromInputSheets) にテスト送信して BasicInformationValidationResult.IsValid が true になることを確認。

3. バリデーションエラーが残る場合、様式Aの必須セル (building_name, region, building_type, calc_floor_area 等) の値が正しく書き込まれているかExcelバッファを検証し、不足フィールドを補完。

4. 最終的に npm run build が通ることも確認。
```
