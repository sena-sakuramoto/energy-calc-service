# モデル建物法 API 連携ガイド（Ver.3.8 実装向け）
最終更新: 2025-09-07 12:15 JST

このドキュメントは、非住宅「モデル建物法」（Ver.3.8）をあなたのサイトから実務で扱うための**実装ガイド**です。公式仕様の算定式と入力ルール、APIの使い方、UIでのアドバイス生成ロジックを1ファイルに集約しました。

---

## 0. スコープと完成度
- 対象は **モデル建物法（非住宅）Ver.3.8 正式版**。小規模版も前提を共有。
- 公式が公表している**入力シート構造**と**API**、**算定式**に準拠。
- 「完璧？」への回答: **実務投入できるレベル**で網羅していますが、制度更新や仕様の軽微改訂により差異が生じる可能性があります。**バージョン固定 `/v380`** を基本として、将来の更新時に本ファイルも改訂してください。

---

## 1. 成果物の原則
1. **正式な提出物**は、国交省系ポータルの**公式Webプログラム**が出力した様式PDFです。
2. 自サイトで完結する場合は、**公式API**で計算・様式出力を行い、**同一の様式**を取得すること。
3. 前処理ツールとしては、**公式Excel入力シート**を自動生成して人手アップロードでも可。

---

## 2. 版管理とエンドポイント
1. 本番は **https://api.lowenergy.jp/model/1/v380/** を使用。
2. テストや先行検証に `…/beta/` を使い分け可能。ただし運用安定のため本番は **v380 固定**。
3. 代表エンドポイント
   - `computeFromInputSheets`（単一用途の計算）
   - `reportFromInputSheets`（単一用途の様式PDF）
   - `computeMultipleUsesFromInputSheets`（複数用途の計算）
   - `reportMultipleUsesFromInputSheets`（複数用途の様式PDF）
   - `convertToWebInput`（Excel/CSV → 内部入力値の抽出）

> 認証は不要（HTTPS必須）。SLAやレート制限は明示されていないため、**リトライとバックオフ**を各自で実装。

---

## 3. 入力ファイルのルール
1. 受付形式は **Excel（.xlsx もしくは .xlsm）** または **CSV**。
2. CSVは**様式ごと**にファイル分割し、**Shift_JIS** で送信すること（JSONはUTF-8）。
3. **シート名・パート名は固定**。独自列や改名は不可。
4. 単一用途のパート名
   - A, B1, B2, B3, C1, C2, C3, C4, D, E, F, G, H, I
5. 複数用途は `_1`〜`_30` を付与（例 `A_1`, `B1_1` … `A_2` …）。用途ごとに分ける。
6. Excelを用途単位で混在添付する場合、`XLSX_3` のように用途番号を付ける。
7. **改訂Rev判定**は様式Dの1行1列のヘッダー値で行われるため、空欄禁止。
8. 公式の**入力シート（最新版）**を雛形にするのが最も安全。

---

## 4. 算定式（公式）と丸め規則
### 4.1 総合BEIm
\[
\mathrm{BEI_m}=\frac{E_{ACm}+E_{Vm}+E_{Lm}+E_{HWm}+E_{EVm}-E_{Pm}-E_{Cm}}{E_{SACm}+E_{SVm}+E_{SLm}+E_{SHWm}+E_{SEVm}}
\]

### 4.2 部分BEI
\[
\mathrm{BEI_{m,AC}}=\frac{E_{ACm}}{E_{SACm}},\ 
\mathrm{BEI_{m,V}} =\frac{E_{Vm}}{E_{SVm}},\ 
\mathrm{BEI_{m,L}} =\frac{E_{Lm}}{E_{SLm}},\ 
\mathrm{BEI_{m,HW}}=\frac{E_{HWm}}{E_{SHWm}},\ 
\mathrm{BEI_{m,EV}}=\frac{E_{EVm}}{E_{SEVm}}
\]

> PV=H 太陽光の削減量 (E_{Pm})、CGS=I コージェネの削減量 (E_{Cm}) は**分子から控除**する点に注意。

### 4.3 丸め規則
- BEImおよび各部分BEIの**表示値**は「小数第3位を切り上げて小数第2位まで」。実装は `ceil(value*1000)/1000 → 表示は小数2桁`。

---

## 5. 合否判定
1. 原則は **BEIm ≤ 基準値** で適合。
2. 大規模非住宅（2,000㎡以上）は用途別に**強化基準**が設定。しきい値は制度告示に合わせてテーブル管理。
3. 小規模・その他は 1.0 をベースに、最新の公表値に追随。

---

## 6. APIリクエスト例
### 6.1 Excelを直接投げて計算（単一用途）
```bash
curl -X POST "https://api.lowenergy.jp/model/1/v380/computeFromInputSheets"   -H "Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"   --data-binary @input_sheets.xlsx
```

### 6.2 CSVを様式ごとに投げて計算（単一用途）
```bash
curl -X POST "https://api.lowenergy.jp/model/1/v380/computeFromInputSheets"   -F "A=@A_basic.csv;type=text/csv"   -F "B1=@B1_window.csv;type=text/csv"   -F "B2=@B2_insulation.csv;type=text/csv"
# …必要な様式を追加（CSVは Shift_JIS）
```

### 6.3 PDF（様式出力）を取得（単一用途）
```bash
curl -X POST "https://api.lowenergy.jp/model/1/v380/reportFromInputSheets"   -H "Content-Type: application/vnd.ms-excel.sheet.macroEnabled.12"   --data-binary @input_sheets.xlsm   -o report.pdf
```

### 6.4 複数用途の計算（CSV＋Excel混在）
```bash
curl -X POST "https://api.lowenergy.jp/model/1/v380/computeMultipleUsesFromInputSheets"   -F 'ER={"ExistingTotalArea":"3500.00","ExistingBEI":"1.5","ExtensionAndRenovationTotalArea":"800.00"};type=application/json'   -F "A_1=@A_office.csv;type=text/csv"   -F "B1_1=@B1_office.csv;type=text/csv"   -F "XLSX_3=@shop_use3.xlsx;type=application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
```

---

## 7. UIの“アドバイス”生成ロジック
### 7.1 重要指標
1. **部分BEIの超過量**  
   `excess_i = max(0, BEI_m_i - 1.0)`
2. **寄与度**  
   `contrib_i = E_i / (E_acm + E_vm + E_lm + E_hwm + E_evm)`
3. **優先度スコア**
   `priority_i = 0.7*excess_i + 0.3*contrib_i`

### 7.2 推奨施策の紐づけ例
- 空調 C系: 熱源効率、変流量制御（ポンプC3、送風C4）、外気処理（C2）、VAV 等
- 換気 D系: 比消費電力、送風量制御、全熱交換
- 照明 E系: 器具W/㎡低減、在室・明るさ・昼光制御
- 給湯 F系: 熱源効率、配管保温仕様、節湯器具
- 昇降機 G系: 制御方式（VVVF等）
- PV/CGS: 容量・効率見直し（分子側の削減量増大）

---

## 8. 疑似コード（そのまま実装可能）
```pseudo
# inputs: E_acm, E_vm, E_lm, E_hwm, E_evm, E_pm, E_cm,
#         E_sacm, E_svm, E_slm, E_shwm, E_sevm, threshold

BEI_m = (E_acm+E_vm+E_lm+E_hwm+E_evm - E_pm - E_cm) / (E_sacm+E_svm+E_slm+E_shwm+E_sevm)
BEI_m = ceil(BEI_m*1000)/1000   # 表示は小数2桁

BEI_m_ac = ceil((E_acm/E_sacm)*1000)/1000
BEI_m_v  = ceil((E_vm/E_svm )*1000)/1000
BEI_m_l  = ceil((E_lm/E_slm )*1000)/1000
BEI_m_hw = ceil((E_hwm/E_shwm)*1000)/1000
BEI_m_ev = ceil((E_evm/E_sevm)*1000)/1000

pass = (BEI_m <= threshold)

# 改善優先度
parts = ["ac","v","l","hw","ev"]
E_total_design = max(1e-9, E_acm+E_vm+E_lm+E_hwm+E_evm)
for i in parts:
    excess[i]  = max(0, BEI_m_i - 1.0)
    contrib[i] = E_i / E_total_design
    priority[i]= 0.7*excess[i] + 0.3*contrib[i]
```

---

## 9. 運用注意
- APIエラーは指数バックオフ＋ユーザー通知。入力検証は `*ValidationResult` をそのままUI表示。
- XML-ID / 再出力コード / 使用バージョン（v380）を案件台帳に記録。
- しきい値（用途別）テーブルは制度更新に同期して差し替え。
