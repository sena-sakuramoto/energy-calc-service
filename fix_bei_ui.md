# fix-bei-ui.md

## Context
本リポジトリは **モデル建物法 Ver.3.8** の公式API（`/v380`）を利用し、建築物の省エネ適合判定を行う。  
現在のUIには以下の問題がある：

1. **BEI値の丸め処理**が公式仕様と一致していない（四捨五入 vs 小数第3位切り上げ）。
2. **部分BEIの算出と判定**が「典型値比較」に基づいており、公式APIに準拠していない。
3. **改善アドバイスの表示条件・順序**が超過寄与度や基準比と整合していない。

これにより、公式PDFの出力とUI上の表示に差異が生じ、ユーザーに誤解を与えている。

---

## 修正指示

### 1. BEI 値の丸め処理
- 総合BEI (BEI_m) および部分BEI (BEI_m_i) は、**小数第3位を切り上げて小数第2位まで表示**する。  
- 実装例:
  ```js
  function formatBEI(value) {
    if (!Number.isFinite(value)) return null;
    const rounded = Math.ceil(value * 1000) / 1000; // 第3位切上げ
    return rounded.toFixed(2); // 2桁表示
  }
  ```
- 既存の `toFixed(3)` や四捨五入処理を廃止する。

---

### 2. 部分BEIの算出と帯域判定
- **重要: 空調、冷房、照明、換気、給湯、昇降機など全カテゴリのチェックは必ず公式APIが返す標準一次エネルギー値 (E_Si) を用い、部分BEI = E_i / E_Si に基づいて行うこと。**
- 判定基準:
  - low（良好）: BEI ≤ 0.90  
  - typical（標準）: 0.90 < BEI ≤ 1.05  
  - high（高い）: BEI > 1.05  
  - high-major（要改善・優先）: BEI ≥ 1.15 かつ超過寄与シェア ≥ 0.35
- 超過寄与シェア:
  ```js
  const excess = Math.max(0, E_i - E_Si);
  const totalExcess = sum_j(Math.max(0, E_j - E_Sj));
  const excessShare = totalExcess > 0 ? excess / totalExcess : 0;
  ```

---

### 3. UI 表示ラベル・色
- bandに応じて次を表示：
  - low → 「良好」緑
  - typical → 「標準」灰
  - high → 「高い」黄
  - high-major → 「要改善（優先）」赤
- 「やや高め」「非常に高い」など従来の曖昧な表現は廃止する。

---

### 4. 改善アドバイス表示
- **high および high-major に分類されたすべての設備**に改善提案を表示する。
- 提案はカテゴリ別の既存リストを利用。
- high-major はリスト先頭に固定表示し、強調枠で表示する。

---

### 5. 優先度スコアと並び順
- 各設備の優先度:
  ```js
  const excess_i = Math.max(0, BEI_m_i - 1.0);
  const contrib_i = E_i / ΣE_design;
  const priority = 0.7 * excess_i + 0.3 * contrib_i;
  ```
- 提案リストは priority の降順で並べ替える。
- high-major 判定の設備は常に最優先で表示。

---

### 6. コメント内容
- コメント文には「基準比」と「寄与度」を明記する。
  - 例: 「基準比 +37%」「超過一次エネの44%を占めています」  
- 既存の「典型値比較コメント」は削除。

---

### 7. テストケース
修正後、以下のケースで公式PDFとUI表示が一致することを確認する：
1. BEI ≈ 1.00 のギリギリ適合ケース  
2. 複数設備が high-major となるケース  
3. PV/CGS が大きく寄与するケース

---

## 優先度
- ★★★★ BEI丸め処理、部分BEI判定、UIラベル修正  
- ★★★☆ 改善アドバイス表示条件、high-major強調  
- ★★☆☆ 優先度スコア導入、コメント文調整、テスト強化  

---

以上を `codex cli` に適用し、全面修正を行うこと。
```

