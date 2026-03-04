# CODEX指示書: Phase 1 MVP 残りタスク

## 目的

Phase 1 MVP の残りの微調整・統合作業を完了させる。調査の結果、6項目中ほぼ全てが実装済みだが、以下の統合確認・仕上げが必要。

## 完了条件

1. `PYTHONPATH=. pytest -q` → 全PASS
2. `cd frontend && npm run build` → 成功
3. ProductSelector が official-bei.jsx のステップ2-7で実際に使われている
4. `/residential` ページが `PUBLIC_PAGES` テストデータに追加されている
5. `api_envelope_spec.pdf` が `.gitignore` に追加されている

---

## Task 1: ProductSelector統合確認・修正

**状態**: `ProductSelector.jsx` コンポーネントは存在するが、`official-bei.jsx` のステップ2-7での実際の配線を確認する必要がある。

**ファイル**: `frontend/src/pages/tools/official-bei.jsx`

確認事項:
1. ステップ2（窓選択）で `ProductSelector` が `category="windows"` で呼ばれているか
2. ステップ3（断熱選択）で `category="insulation"` で呼ばれているか
3. ステップ5（空調選択）で `category="hvac"` で呼ばれているか
4. ステップ7（照明選択）で `category="lighting"` で呼ばれているか

もし配線されていない場合:
```jsx
// ステップ2の窓選択部分に追加
<ProductSelector
  category="windows"
  zone={formData.region}
  use={formData.building_type}
  onSelect={(product) => handleProductSelect('windows', product)}
  selected={selectedProducts.windows}
/>
```

## Task 2: `/residential` を公開ページリストに追加

**ファイル**: `frontend/e2e/helpers/test-data.js`

```javascript
const PUBLIC_PAGES = [
  '/', '/login', '/register', '/about', '/contact',
  '/campaign', '/demo-guide', '/legal', '/privacy',
  '/setup-guide', '/system/status',
  '/guide/model-building-method',
  '/residential',  // ← 追加
];
```

**ファイル**: `frontend/e2e/smoke/public-pages.spec.js`

`/residential` が公開ページテストに含まれることを確認。

## Task 3: .gitignore にPDF追加

**ファイル**: `.gitignore`

```
# API仕様書PDF（バイナリ、リポジトリに含めない）
api_envelope_spec.pdf
```

## Task 4: 住宅版の対応建物用途をフロントに反映

**背景**: モデル建物法は26種類の建物用途に対応。住宅版は「住宅」のみ。これをサイトに明示する。

**ファイル**: `frontend/src/pages/residential.jsx`（または `.tsx`）

ページ上部に対応範囲を明示:

```jsx
<div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
  <p className="font-semibold">対応範囲</p>
  <p className="mt-1">
    戸建住宅（木造在来・2×4・鉄骨造・RC造）の外皮性能計算（UA値・ηAC値）に対応。
    共同住宅は今後対応予定。
  </p>
</div>
```

## Task 5: 非住宅版（モデル建物法）の対応建物リストをガイドページに反映

**ファイル**: `frontend/src/pages/guide/model-building-method.jsx`（既存 or 新規）

26種類の対応建物用途を一覧表示:

```jsx
const BUILDING_TYPES = [
  { code: '01', name: '事務所等' },
  { code: '02', name: '大規模事務所（2,000m²以上）' },
  { code: '03', name: 'ホテル等' },
  { code: '04', name: '大規模ホテル（2,000m²以上）' },
  { code: '05', name: '病院等' },
  { code: '06', name: '大規模病院（2,000m²以上）' },
  { code: '07', name: '物品販売業を営む店舗等' },
  { code: '08', name: '大規模物品販売業（2,000m²以上）' },
  { code: '09', name: '学校等' },
  { code: '10', name: '大規模学校（2,000m²以上）' },
  { code: '11', name: '飲食店等' },
  { code: '12', name: '集会所等' },
  { code: '13', name: '大規模集会所（2,000m²以上）' },
  { code: '14', name: '工場等' },
  { code: '15', name: '大規模工場（2,000m²以上）' },
  { code: '16', name: '倉庫等（室内温度管理あり）' },
  { code: '17', name: '住宅以外の複合建築物' },
  { code: '18', name: '大規模複合（2,000m²以上）' },
  { code: '19', name: '体育館等' },
  { code: '20', name: '劇場等' },
  { code: '21', name: '公衆浴場施設等' },
  { code: '22', name: '老人ホーム等' },
  { code: '23', name: '小規模事務所等（300m²未満）' },
  { code: '24', name: '小規模ホテル等（300m²未満）' },
  { code: '25', name: '小規模病院等（300m²未満）' },
  { code: '26', name: '小規模その他（300m²未満）' },
];
```

---

## 注意事項

- Phase 1 MVP の6大タスクは既にほぼ完了。ここでの作業は統合・仕上げのみ
- 新しい機能を追加しない。既存コードの配線確認と小さな修正のみ
- テストが壊れないことを常に確認
