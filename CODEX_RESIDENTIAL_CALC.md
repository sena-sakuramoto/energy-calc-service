# 楽々省エネ計算 — 住宅版 実装指示書

> **設計思想の原典:** `docs/楽々省エネ計算_製品戦略書_設計思想書.docx`
> **判断に迷ったら:** (1)設計者の入力負荷を下げる → (2)計算の即時性 → (3)審査に通る正確さ。衝突したら(1)優先。

---

## ゴール

住宅の省エネ計算（UA値・ηAC値）を、設計しながらリアルタイムで確認でき、
審査提出用の公式計算書PDFまで出力できるWebツールを作る。

**楽々 = 「ホームズ君のリアルタイム版」×「one buildingの住宅版」×「メーカーDB付き」**

---

## アーキテクチャ

```
┌─ フロントエンド（ブラウザ内完結） ─────────────────┐
│                                                    │
│  入力UI（3方式）                                    │
│  ├─ (A) 壁セグメント方式（メイン）                  │
│  ├─ (B) 形状テンプレート（ショートカット）          │
│  └─ (C) 面積直接入力（逃げ道）                     │
│           +                                        │
│  建具表入力/CSVインポート                           │
│  メーカー商品選択（YKK AP / LIXIL）                 │
│           ↓                                        │
│  CalcEngine（pyhees TS移植、純粋関数）              │
│  ├─ UA値   → リアルタイム表示（100ms以内）         │
│  ├─ ηAC値  → リアルタイム表示（100ms以内）         │
│  └─ 求積表自動生成                                 │
│           ↓                                        │
│  出力                                              │
│  ├─ 求積表PDF                                      │
│  └─ UA値/ηAC値 計算書PDF                          │
│                                                    │
└───────────────┬────────────────────────────────────┘
                │ 提出時のみ
                ▼
┌─ バックエンド ─────────────────────────────────────┐
│  公式API (house.lowenergy.jp)                      │
│  → BEI計算（一次エネルギー消費量）                  │
│  → 公式計算書PDF                                   │
└────────────────────────────────────────────────────┘
```

### 絶対ルール
- **CalcEngineはフロントエンド完結。サーバーAPIは呼ばない。**
- 入力値が変わった瞬間にTS計算関数を呼び、React stateを更新する。
- Debounceは数値入力フィールドのみ（300ms）。セレクトボックスは即時計算。
- UA値・ηAC値の表示は画面に常時固定（sticky）。スクロールしても見える。

---

## モジュール構成

```
frontend/src/
  residential/
    engine/                    # CalcEngine（pyhees移植）
      calcUA.ts                # UA値計算の純粋関数
      calcEtaAC.ts             # ηAC値計算の純粋関数
      calcAreas.ts             # 面積計算（壁セグメント→方位別面積）
      tables/
        orientationCoeff.ts    # 方位係数テーブル（8地域×10方位）
        tempDiffCoeff.ts       # 温度差係数テーブル
        materialConductivity.ts # 材料熱伝導率テーブル（60種）
        windowCombination.ts   # 窓組み合わせ表（サッシ×ガラス→U値,η値）
        products/
          ykkap.ts             # YKK AP商品テーブル（APWシリーズ）
          lixil.ts             # LIXIL商品テーブル
      types.ts                 # 型定義（Project, Wall, Opening等）
      __tests__/
        calcUA.test.ts         # pyheesテストケースで検証
        calcEtaAC.test.ts

    components/
      ResidentialCalc.tsx       # メインページ
      WallSegmentInput.tsx      # 壁セグメント入力
      WindowSchedule.tsx        # 建具表入力/CSVインポート
      InsulationSelector.tsx    # 断熱仕様選択
      RoofInput.tsx             # 屋根/天井入力
      FloorInput.tsx            # 床/基礎入力
      ShapeTemplate.tsx         # 形状テンプレート（整形/L型/下屋）
      ProductSelector.tsx       # メーカー商品選択
      ResultPanel.tsx           # UA値/ηAC値/コスト表示（sticky）
      CostComparison.tsx        # 製品変更時のコスト比較
      AreaTable.tsx             # 求積表プレビュー

    output/
      pdfAreaTable.ts           # 求積表PDF生成
      pdfCalcReport.ts          # 計算書PDF生成
```

---

## Task 1: CalcEngine（pyhees TypeScript移植）

### 1-1. 型定義 `types.ts`

```typescript
// プロジェクト
interface ResidentialProject {
  id: string;
  name: string;
  region: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;  // 地域区分
  structure: 'wood_conventional' | 'wood_2x4' | 'steel' | 'rc';
  stories: number;
  walls: WallSegment[];
  openings: Opening[];
  roof: RoofPart;
  ceiling: CeilingPart | null;
  floor: FloorPart;
  foundation: FoundationPart;
}

// 壁セグメント
interface WallSegment {
  id: string;
  orientation: 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW';
  input_method: 'dimensions' | 'direct_area';
  width?: number;       // m（dimensions時）
  height?: number;      // m（dimensions時）
  area_gross?: number;  // m²（direct_area時、またはwidth×heightから自動計算）
  insulation_type: string;   // 材料名
  insulation_thickness: number; // mm
  u_value?: number;     // 直接入力 or 自動計算
  adjacency: 'exterior' | 'ground' | 'unheated_space' | 'underfloor';
}

// 開口部（建具表ベース）
interface Opening {
  id: string;
  symbol: string;       // W-1, D-1 等
  type: 'window' | 'door';
  orientation: 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW';
  width: number;        // m
  height: number;       // m
  quantity: number;
  // Phase 1: 組み合わせ表方式
  sash_type: 'metal' | 'metal_resin' | 'resin' | 'wood';
  glass_type: string;   // 'single' | 'double' | 'double_lowe' | 'triple_lowe' 等
  // Phase 2: メーカー商品指定
  product_id?: string;  // "ykkap_apw330_16520" 等
  product_name?: string;
  // 自動取得値
  u_value: number;      // 組み合わせ表 or 商品DBから
  eta_d_H: number;      // 暖房期日射熱取得率
  eta_d_C: number;      // 冷房期日射熱取得率
  // Phase 3用予約
  height_from_fl?: number;
  overhang_depth?: number;
  overhang_y1?: number;
  // コスト（メーカーDB）
  cost_per_unit?: number;
}

// CalcEngine入出力
interface EnvelopeInput {
  region: number;
  a_env: number;        // 外皮総面積
  a_a: number;          // 床面積合計
  parts: EnvelopePart[];
}

interface EnvelopePart {
  type: 'wall' | 'window' | 'door' | 'roof' | 'ceiling' | 'floor' | 'foundation';
  orientation: string;
  area: number;         // m²
  u_value: number;      // W/(m²·K)
  h_value: number;      // 温度差係数
  eta_d_H?: number;     // 暖房期日射熱取得率（窓のみ）
  eta_d_C?: number;     // 冷房期日射熱取得率（窓のみ）
  psi_value?: number;   // 線熱貫流率（基礎のみ、W/(m·K)）
  length?: number;      // 長さ（基礎のみ、m）
}

interface CalcResult {
  ua_value: number;     // 外皮平均熱貫流率
  eta_a_h: number;      // 暖房期平均日射熱取得率
  eta_a_c: number;      // 冷房期平均日射熱取得率
  grade: 4 | 5 | 6 | 7 | null;  // 断熱等級
  zeh_ok: boolean;
  parts_detail: PartDetail[];  // 部位別内訳（求積表用）
}
```

### 1-2. UA値計算 `calcUA.ts`

pyhees `section3_2_8.py` の移植。

```typescript
export function calcUA(input: EnvelopeInput): number {
  // UA = Σ(Ai × Ui × Hi) / A_env
  let sum_q = 0;
  for (const part of input.parts) {
    if (part.type === 'foundation' && part.psi_value && part.length) {
      // 基礎: 線熱貫流率 × 長さ × 温度差係数
      sum_q += part.psi_value * part.length * part.h_value;
    } else {
      // 壁・窓・屋根・床: 面積 × 熱貫流率 × 温度差係数
      sum_q += part.area * part.u_value * part.h_value;
    }
  }
  return roundHalfUp(sum_q / input.a_env, 2);
}
```

### 1-3. ηAC値計算 `calcEtaAC.ts`

pyhees `section3_2_8.py` の `calc_eta_A_C` 移植。

```typescript
export function calcEtaAC(input: EnvelopeInput): number {
  // ηAC = Σ(Ai × ηi × νi) / A_env × 100
  const nu_table = getOrientationCoefficients(input.region, 'cooling');
  let sum_mc = 0;
  for (const part of input.parts) {
    if (part.eta_d_C !== undefined) {
      const nu = nu_table[part.orientation] ?? 1.0;
      const f_C = 0.93;  // Phase 1: 固定法
      sum_mc += part.area * part.eta_d_C * f_C * nu;
    }
  }
  return roundHalfUp(sum_mc / input.a_env * 100, 1);
}
```

### 1-4. テスト

pyhees_example の `s03_02_envelope_performance.ipynb` から3-5パターンのテストケースを作成。
期待値と完全一致すること。

```typescript
test('Region 6, standard house', () => {
  const result = calcUA(testCase_region6);
  expect(result).toBe(0.87);  // pyheesと完全一致
});
```

---

## Task 2: ルックアップテーブル（JSONデータ）

### 2-1. 窓組み合わせ表 `windowCombination.ts`

建築研究所の公開データ。サッシ種別×ガラス種別→U値, η値。

```typescript
export const WINDOW_TABLE: Record<string, Record<string, WindowSpec>> = {
  metal: {
    single: { u: 6.51, eta_d_h: 0.79, eta_d_c: 0.79 },
    double: { u: 4.65, eta_d_h: 0.73, eta_d_c: 0.73 },
    double_lowe_a12: { u: 3.49, eta_d_h: 0.59, eta_d_c: 0.41 },
    // ...
  },
  resin: {
    double_lowe_a12: { u: 2.33, eta_d_h: 0.52, eta_d_c: 0.37 },
    triple_lowe_a9x2: { u: 1.60, eta_d_h: 0.36, eta_d_c: 0.26 },
    // ...
  },
  // ...
};
```

### 2-2. メーカー商品テーブル `products/ykkap.ts`

公開カタログ情報ベース。

```typescript
export const YKKAP_PRODUCTS: Product[] = [
  {
    id: 'apw330_std',
    name: 'APW 330',
    series: 'APW',
    sash_type: 'resin',
    glass_type: 'double_lowe_a16',
    u_value: 1.31,    // カタログ値（組み合わせ表より有利）
    eta_d_h: 0.47,
    eta_d_c: 0.34,
    cost_per_m2: 45000,  // 概算単価
    sizes: [
      { code: '16520', w: 1650, h: 2000, cost: 85000 },
      { code: '11913', w: 1190, h: 1370, cost: 62000 },
      // ...
    ],
  },
  {
    id: 'apw430_std',
    name: 'APW 430',
    series: 'APW',
    sash_type: 'resin',
    glass_type: 'triple_lowe_kr_a11x2',
    u_value: 0.90,
    eta_d_h: 0.38,
    eta_d_c: 0.27,
    cost_per_m2: 72000,
    sizes: [/* ... */],
  },
  // ...
];
```

### 2-3. 方位係数・温度差係数・材料熱伝導率

pyhees `section3_2_c.py`, `section3_2_b.py`, `section3_3_a.py` から移植。
約50-100KBのJSON。

---

## Task 3: 入力UI

### 3-1. メインページ `ResidentialCalc.tsx`

```
┌────────────────────────────────────────────────┐
│ 楽々省エネ計算 — 住宅版                         │
├────────────────────────────────────────────────┤
│                                                │
│  基本情報                                      │
│  地域区分: [6 ▼]  構造: [木造(在来) ▼]  階数: [2] │
│                                                │
│  [壁セグメント] [建具表] [断熱] [屋根] [床/基礎] │
│  ─────────────────────────────────             │
│                                                │
│  《タブの中身: 壁セグメント入力等》              │
│                                                │
│                                                │
│                                                │
├────────────────────────────────────────────────┤
│  UA: 0.56 W/m²K ✅等級5  │  ηAC: 1.8 ✅基準OK  │ ← sticky
│  [公式APIで検証]  [PDF出力]                     │
└────────────────────────────────────────────────┘
```

### 3-2. 壁セグメント入力 `WallSegmentInput.tsx`

方位別タブ（北/東/南/西）。各方位で壁セグメントを追加。

```
北面:
  ┌─────────────────────────────────────────┐
  │ 壁1  幅: [8.0]m  高さ: [5.4]m          │
  │      面積: 43.20 m²（自動計算）         │
  │      断熱: [HGW16K-105mm ▼]            │
  │                             [× 削除]   │
  ├─────────────────────────────────────────┤
  │ 壁2  幅: [4.0]m  高さ: [2.7]m          │
  │      面積: 10.80 m²（自動計算）         │
  │      断熱: [HGW16K-105mm ▼]            │
  │                             [× 削除]   │
  └─────────────────────────────────────────┘
  [+ 壁を追加]

  北面合計: 外壁(GROSS) 54.00m² − 窓 3.84m² = NET 50.16m²
```

### 3-3. 建具表入力 `WindowSchedule.tsx`

テーブル形式。CSVインポート対応。

```
記号 | W×H(mm)    | サッシ     | ガラス        | 方位 | 数量 | 商品      | U値  | コスト
W-1  | 1600×1200 | [樹脂 ▼]  | [Low-E複層▼] | [南▼]| [3]  | [APW330▼] | 1.31 | ¥186,000
W-2  | 700×1000  | [樹脂 ▼]  | [Low-E複層▼] | [北▼]| [2]  | [APW330▼] | 1.31 | ¥98,000
D-1  | 800×2000  | [金属樹脂▼]| [Low-E複層▼] | [東▼]| [1]  | [—    ▼] | 2.33 | —
                                                                    合計: ¥284,000

[CSVインポート]  [+ 建具追加]
```

商品を選ぶとU値が自動更新 → UA値がリアルタイム変化。
商品を変えると「APW330→APW430: UA 0.05改善、コスト+¥126,000」が表示される。

### 3-4. 形状テンプレート `ShapeTemplate.tsx`

よくある建物形状から壁セグメントを自動生成。

```
形状を選択:
  [整形（総2階）]  [L型]  [下屋付き]  [コの字型]  [手動入力]

整形を選んだ場合:
  間口: [9.0]m  奥行: [6.0]m
  1F階高: [2.7]m  2F階高: [2.7]m

  → 壁セグメント自動生成:
    北面: 9.0m × 5.4m = 48.60m²
    東面: 6.0m × 5.4m = 32.40m²
    南面: 9.0m × 5.4m = 48.60m²
    西面: 6.0m × 5.4m = 32.40m²

  → 屋根面積: 9.0m × 6.0m = 54.00m²（勾配補正前）
  → 基礎外周: (9.0 + 6.0) × 2 = 30.0m
  → 1F床面積: 54.00m²  延床: 108.00m²
```

### 3-5. メーカー商品選択 `ProductSelector.tsx`

建具表のインライン選択 + 専用比較画面。

```
窓W-1の商品を選択:

  現在: APW 330（U=1.31, ¥62,000/窓）

  [APW 330]  U:1.31  ¥62,000  ← 現在
  [APW 430]  U:0.90  ¥98,000  UA -0.05  +¥108,000(3窓分)
  [APW 330+] U:1.10  ¥75,000  UA -0.02  +¥39,000(3窓分)

  [LIXIL EW]      U:1.31  ¥58,000
  [LIXIL TW]      U:0.79  ¥105,000  UA -0.06  +¥129,000(3窓分)
```

### 3-6. ResultPanel（sticky表示）

```
┌───────────────────────────────────────────────────┐
│  UA値: 0.56 W/m²K    │  ηAC値: 1.8              │
│  ✅ 等級5 (≤0.60)     │  ✅ 基準OK (≤3.0)         │
│  ✅ ZEH基準 (≤0.60)   │                          │
│  △ 等級6 (≤0.46)      │  窓コスト合計: ¥892,000   │
│                       │                          │
│  [公式APIで検証]  [求積表PDF]  [計算書PDF]        │
└───────────────────────────────────────────────────┘
```

等級の基準値（地域別）:

| 等級 | 1地域 | 2地域 | 3地域 | 4地域 | 5地域 | 6地域 | 7地域 |
|------|-------|-------|-------|-------|-------|-------|-------|
| 4    | 0.46  | 0.46  | 0.56  | 0.75  | 0.87  | 0.87  | 0.87  |
| 5    | 0.40  | 0.40  | 0.50  | 0.60  | 0.60  | 0.60  | 0.60  |
| 6    | 0.28  | 0.28  | 0.28  | 0.34  | 0.46  | 0.46  | 0.46  |
| 7    | 0.20  | 0.20  | 0.20  | 0.23  | 0.26  | 0.26  | 0.26  |

---

## Task 4: PDF出力

### 4-1. 求積表PDF

```
外皮面積求積表
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
部位名      | 算式              | 面積(m²)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[北面]
  外壁1     | 9.0 × 5.4         | 48.60
  窓W-2 ×2  | 0.7 × 1.0 × 2     | -1.40
  北面 NET  |                    | 47.20
[東面]
  外壁1     | 6.0 × 5.4         | 32.40
  ドアD-1   | 0.8 × 2.0         | -1.60
  東面 NET  |                    | 30.80
  ...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
外皮総面積  |                    | 312.40
```

### 4-2. 計算書PDF

UA値・ηAC値の算定根拠。部位別の面積・U値・熱損失量の一覧。
審査機関提出可能なフォーマット。

---

## Task 5: 公式API連携（BEI計算）

### エンドポイント

外皮計算: `https://envelope.app.lowenergy.jp/` のAPI
エネルギー計算: `https://house.app.lowenergy.jp/` のAPI

### フロー

```
1. ユーザーが [公式APIで検証] をクリック
2. フロントのCalcEngineが持つデータを公式API入力形式に変換
3. バックエンド経由で公式APIに送信（CORS対策）
4. 結果を受信
5. フロントのUA値と公式UA値を比較表示
   "フロント: 0.56 / 公式: 0.56 ✅ 一致"
6. 公式計算書PDFをダウンロード可能に
```

### バックエンドエンドポイント

```python
# app/api/v1/residential.py
@router.post("/residential/verify")
async def verify_with_official_api(project: ResidentialProject):
    """フロント計算結果を公式APIで検証"""
    # 1. project → pyhees形式のspec dictに変換
    # 2. house.lowenergy.jp APIに送信
    # 3. 結果を返す
    pass
```

---

## Task 6: プロジェクト保存

### データ保存

Phase 1: localStorage（ブラウザ内、オフライン対応）
Phase 2: バックエンドDB（チーム共有）

```typescript
// localStorage保存
function saveProject(project: ResidentialProject) {
  const projects = JSON.parse(localStorage.getItem('raku_projects') || '[]');
  const idx = projects.findIndex(p => p.id === project.id);
  if (idx >= 0) projects[idx] = project;
  else projects.push(project);
  localStorage.setItem('raku_projects', JSON.stringify(projects));
}
```

---

## 開発順序

```
Week 1:
  ├─ Task 1: CalcEngine（UA値/ηAC値のTS実装 + テスト）
  ├─ Task 2: ルックアップテーブル（窓組み合わせ表 + メーカーDB）
  └─ 型定義・データモデル確定

Week 2:
  ├─ Task 3-1: 基本情報入力UI
  ├─ Task 3-2: 壁セグメント入力UI
  ├─ Task 3-3: 建具表入力UI（CSVインポート含む）
  └─ Task 3-6: ResultPanel（sticky UA値表示）

Week 3:
  ├─ Task 3-4: 形状テンプレート
  ├─ Task 3-5: メーカー商品選択 + コスト比較
  ├─ Task 4: PDF出力（求積表 + 計算書）
  └─ Task 6: localStorage保存

Week 4:
  ├─ Task 5: 公式API連携（BEI検証）
  ├─ 結合テスト（pyhees結果との照合）
  ├─ UI磨き込み
  └─ デプロイ
```

---

## 完了条件

- [ ] CalcEngine: pyheesの3-5テストケースと完全一致
- [ ] 壁セグメント入力 → UA値がリアルタイム更新（100ms以内）
- [ ] 建具表の窓を変更 → UA値即時更新
- [ ] メーカー商品変更 → UA値 + コスト差分表示
- [ ] 形状テンプレート（整形/L型/下屋）→ 壁セグメント自動生成
- [ ] 求積表PDF出力
- [ ] 計算書PDF出力
- [ ] 公式APIで検証 → フロント結果と一致確認
- [ ] `npm run build` 成功
- [ ] 等級4/5/6/7/ZEH基準の判定が正しい

---

## UI設計原則（CLAUDE.md準拠）

- 原則1: 選択肢 > 自由入力（サッシ・ガラス・断熱材は全てドロップダウン）
- 原則2: AI出力にアクションボタン（商品推薦に [採用] ボタン）
- 原則7: 派手より「楽」（認知負荷を下げる）
- 原則10: デフォルト最適化（地域6・木造在来・等級5をデフォルト）
- 原則12: 10msの削減にこだわる

デザイン禁止: AIグラデーション禁止、Inter禁止、Lucideのみ禁止、shadcnデフォルト禁止。

---

## 非住宅との関係

既存の非住宅モデル建物法（official-bei.jsx）はそのまま維持。
住宅版は別ページ `/residential` として新規作成。

トップページで選択:
```
[非住宅（モデル建物法）]  [住宅（外皮計算）]
```

将来的に住宅のBEI計算（一次エネルギー）も統合するが、Phase 1ではUA値/ηAC値のみ。
