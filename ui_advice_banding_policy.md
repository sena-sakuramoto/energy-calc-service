
# UIアドバイス帯域ポリシー（low / typical / high / high‑major）
最終更新: 2025-09-07 16:35 JST

本ドキュメントは **model_api_v3.8_guide.md** の補遺です。公式の算定式（総合BEI・部分BEI）
を前提に、UIで表示する「低い／標準／高い」の**帯域（バンディング）と判定ロジック**を定義します。

> **重要な前提**
> - **BEI・一次エネルギーの計算結果は、公式提供API（Ver.3.8 / /v380）をそのまま使用**しています。
>   数値・様式PDFは公式と同一です。
> - 本ドキュメントの「アドバイス（帯域ラベル・優先度）」は**当社による独自の解釈**です。
>   省エネ適合の**公式判定**は、総合BEI（BEIm）と制度の基準値によります（＝本ポリシーは補助指標）。

---

## 1. 基本の考え方
- 部分BEI = 設計一次エネ / 標準一次エネ（= 1.0 が中立）
- **1.0 を中心**に、実務で扱いやすいバンドを定義します。
- 超過が大きく、かつ総消費への寄与も大きい設備は**優先的に改善**すべきとして強調します。

---

## 2. 既定の帯域（v1）
全用途共通の初期値（必要に応じて用途別に上書き）。

- **low（良好）**　　　: 部分BEI ≤ **0.90**
- **typical（標準）**　: 0.90 < 部分BEI ≤ **1.05**
- **high（高い）**　　 : 部分BEI > 1.05
- **high‑major（要改善・優先）** : **部分BEI ≥ 1.15** かつ **超過寄与シェア ≥ 0.35**

**超過寄与シェア**  
\[
\text{excessShare}_i = \frac{\max(0, E_i - E_{Si})}{\sum_j \max(0, E_j - E_{Sj})}
\]
（分子・分母はいずれも PV/CGS の削減分を除く。0除算は0扱い）

> 根拠：1.0は“標準建物”比。±5〜10%は設計のバラつきとして許容し、**15%超**かつ
> **超過寄与が支配的（≥35%）**な設備を「優先改善」と位置づけます。

---

## 3. コード実装例（frontend/src/utils/energyComparison.js）
```ts
// partBEI: 設備別BEI（E_i / E_Si）
// contrib: 設備 i の設計一次エネ比率 (E_i / ΣE_design) 0..1（任意だが表示の並びに利用可）
// excessShare: 超過寄与シェア ((E_i - E_Si)+ / Σ(E_j - E_Sj)+) 0..1
// useType: "office" | "hospital" | ... 用途別に上書きしたい場合

const DEFAULT_THRESHOLDS = {
  lowMax: 0.90,
  typicalMax: 1.05,
  highMajorMin: 1.15,
  excessShareMajorMin: 0.35,
};

const PER_USE_TYPE = {
  office: { /* 用途別で上書き可 */ },
  school: {}, hospital: {}, hotel: {}, retail: {}, factory: {}, other:  {}
};

export function classifyEnergyItem(partBEI, contrib = 0, excessShare = 0, useType = "other") {
  const base = { ...DEFAULT_THRESHOLDS, ...(PER_USE_TYPE[useType] || {}) };
  if (!Number.isFinite(partBEI)) return { band: "unknown", severity: 0, reason: "no-data" };

  if (partBEI <= base.lowMax)     return { band: "low",        severity: 0, reason: `BEI≤${base.lowMax}` };
  if (partBEI <= base.typicalMax) return { band: "typical",    severity: 1, reason: `BEI≤${base.typicalMax}` };

  const isMajor = (partBEI >= base.highMajorMin) && (excessShare >= base.excessShareMajorMin);
  return {
    band: isMajor ? "high-major" : "high",
    severity: isMajor ? 3 : 2,
    reason: isMajor
      ? `BEI≥${base.highMajorMin} & 超過寄与≥${Math.round(base.excessShareMajorMin * 100)}%`
      : `BEI>${base.typicalMax}`,
  };
}
```

---

## 4. 設定ファイル（用途別チューニング）
レポジトリに `config/banding_policy.yaml`（または `.json`）を置いてCIで読み込み。
初期ファイルは同梱のサンプルを使用できます。

- サンプル: **banding_policy.yaml** / **banding_policy.json**  
  - YAML:  `/mnt/data/banding_policy.yaml`  
  - JSON:  `/mnt/data/banding_policy.json`

```yaml
version: 1
policy_name: BEI-relative banding (v1)
defaults:
  low_max: 0.90
  typical_max: 1.05
  high_major_min: 1.15
  excess_share_major_min: 0.35
per_use_type:
  office: {}
  hospital: {}
  other: {}
```

> チューニング手順：案件実績から用途別に四分位（Q1/Q3）を算出 → `low_max` と `typical_max` を調整。

---

## 5. 表示・文言の指針
- **low**：バッジ「良好」／緑系。提案は任意。
- **typical**：バッジ「標準」／灰系。
- **high**：バッジ「高い」／黄系。改善提案を1–2件表示。
- **high‑major**：バッジ「要改善（優先）」／赤系。上部固定で表示し、該当入力セルへジャンプ。

---

## 6. 免責・説明文（そのまま使える）
> **注意**：この「アドバイス」および「帯域（low/typical/high）」の判断は**当社独自のポリシー**に基づく参考情報です。
> 省エネ適合の**正式な判定**は、**公式提供プログラム（Ver.3.8）**によるBEI計算と基準値との比較に依拠します。
> 本サービスのBEIや一次エネルギー計算値・様式PDFは**公式APIをそのまま使用**しており、
> 数値・様式は公式出力と同一です。

---

## 7. よくある質問
- **Q. この帯域は公式ですか？**  
  A. いいえ、公式は総合BEI/部分BEIの定義と判定基準を示すのみで、帯域は示していません。本ポリシーはUIの補助指標です。

- **Q. 合否はどこで決まる？**  
  A. 用途・規模に対応した**基準値**と総合BEI（BEIm）の比較で決まります（制度告示）。

- **Q. いつ更新する？**  
  A. 公式の版上げ（v38x→v39x）や社内実績の分布が変わった際に、`banding_policy.*` を更新してください。

---

## 付録：優先度の算出（UI並び替え）
```ts
// BEI_m_i: 部分BEI、E_i: 設計一次エネ、sumE: ΣE_design（PV/CGS除く）
const excess = Math.max(0, BEI_m_i - 1.0);
const contrib = sumE > 0 ? (E_i / sumE) : 0;
const priority = 0.7 * excess + 0.3 * contrib; // 大→優先
```

---

以上。実装に合わせて wording 調整や用途別パラメータの初期値もすぐ出せます。
