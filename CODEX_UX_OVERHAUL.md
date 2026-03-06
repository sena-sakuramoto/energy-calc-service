# CODEX指示書: 住宅版UX全面改修

## 目的

住宅版計算ツール (`/residential`) のUXを2点改善する:
1. **検証バッジ**: 絵文字 ✅⚠ → オリジナルSVGアイコン + 等級ゲージバー
2. **壁入力簡略化**: 7フィールド×8方位タブ → コンパクトカード + 展開式

## 完了条件

1. `cd frontend && npm run build` → 成功
2. ResultPanel に絵文字が一切ない（✅⚠をgrep → 0件）
3. 壁セグメント入力がコンパクトカード表示になっている
4. `npx playwright test e2e/smoke/residential-calc.spec.js --project=smoke` → 全PASS

---

## Task 1: SVGアイコンコンポーネント作成

**ファイル**: `frontend/src/residential/components/icons/StatusIcons.jsx`（新規）

3つのSVGアイコンをインラインSVGで作成する。**絵文字は絶対に使わない**。

### CheckIcon（合格）

```jsx
export function CheckIcon({ size = 18, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`inline-block ${className}`}>
      <circle cx="12" cy="12" r="11" stroke="#16a34a" strokeWidth="2" fill="#dcfce7" />
      <path d="M7 12.5l3.5 3.5L17 9" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}
```

### WarningIcon（注意）

```jsx
export function WarningIcon({ size = 18, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`inline-block ${className}`}>
      <path d="M12 2L1 21h22L12 2z" fill="#fef3c7" stroke="#d97706" strokeWidth="2" strokeLinejoin="round" />
      <line x1="12" y1="9" x2="12" y2="15" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="12" cy="18" r="1.2" fill="#d97706" />
    </svg>
  );
}
```

### ErrorIcon（不一致/エラー）

```jsx
export function ErrorIcon({ size = 18, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`inline-block ${className}`}>
      <circle cx="12" cy="12" r="11" stroke="#dc2626" strokeWidth="2" fill="#fee2e2" />
      <path d="M8 8l8 8M16 8l-8 8" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
```

---

## Task 2: 等級ゲージバーコンポーネント

**ファイル**: `frontend/src/residential/components/GradeGauge.jsx`（新規）

UA値を等級4〜7の基準値と比較するSVGゲージバー。

```jsx
export default function GradeGauge({ ua, thresholds }) {
  // thresholds = { 4: 0.87, 5: 0.60, 6: 0.46, 7: 0.26 }
  // ua = 現在のUA値

  // ゲージ幅300px、UA 0〜1.0 の範囲でマッピング
  // 各等級の基準値位置にラベルを配置
  // 現在値の位置にマーカー（三角形）を配置
  // 等級クリア範囲は緑、超過は赤

  const maxUA = 1.0;
  const barWidth = 300;
  const barHeight = 24;

  const toX = (value) => Math.min((value / maxUA) * barWidth, barWidth);
  const uaX = toX(ua);

  const grades = [
    { grade: 7, limit: thresholds[7] || 0.26, color: '#059669' },
    { grade: 6, limit: thresholds[6] || 0.46, color: '#16a34a' },
    { grade: 5, limit: thresholds[5] || 0.60, color: '#65a30d' },
    { grade: 4, limit: thresholds[4] || 0.87, color: '#ca8a04' },
  ];

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${barWidth} ${barHeight + 30}`} className="w-full max-w-sm">
        {/* 背景バー */}
        <rect x="0" y="10" width={barWidth} height={barHeight} rx="4" fill="#fee2e2" />

        {/* 等級ゾーン（右から左へ描画） */}
        {grades.map((g, i) => {
          const x = 0;
          const w = toX(g.limit);
          return (
            <rect key={g.grade} x={x} y="10" width={w} height={barHeight} rx={i === 0 ? 4 : 0} fill={g.color} opacity="0.2" />
          );
        })}

        {/* 等級ラベル */}
        {grades.map((g) => (
          <g key={`label-${g.grade}`}>
            <line x1={toX(g.limit)} y1="8" x2={toX(g.limit)} y2={10 + barHeight + 2} stroke={g.color} strokeWidth="1.5" />
            <text x={toX(g.limit)} y={barHeight + 22} textAnchor="middle" fontSize="9" fill={g.color} fontWeight="600">
              等級{g.grade}
            </text>
          </g>
        ))}

        {/* 現在値マーカー（逆三角形） */}
        <polygon
          points={`${uaX - 6},8 ${uaX + 6},8 ${uaX},16`}
          fill={ua <= (thresholds[4] || 0.87) ? '#16a34a' : '#dc2626'}
        />
        <text x={uaX} y="6" textAnchor="middle" fontSize="10" fontWeight="700"
          fill={ua <= (thresholds[4] || 0.87) ? '#16a34a' : '#dc2626'}>
          {ua.toFixed(2)}
        </text>
      </svg>
    </div>
  );
}
```

---

## Task 3: ResultPanel を全面改修

**ファイル**: `frontend/src/residential/components/ResultPanel.jsx`（既存を修正）

### 変更内容

1. `import { CheckIcon, WarningIcon, ErrorIcon } from './icons/StatusIcons.jsx';` を追加
2. `import GradeGauge from './GradeGauge.jsx';` を追加
3. 全ての `✅` を `<CheckIcon />` に置換
4. 全ての `⚠` を `<WarningIcon />` に置換
5. 等級ゲージバーを追加
6. 3者比較をカード型レイアウトに変更

### 修正後の ResultPanel 構造

```jsx
import { CheckIcon, WarningIcon, ErrorIcon } from './icons/StatusIcons.jsx';
import GradeGauge from './GradeGauge.jsx';
import CostComparison from './CostComparison.jsx';

function formatGrade(grade) {
  if (!grade) return '等級4未満';
  return `等級${grade}`;
}

function StatusBadge({ ok, label }) {
  return (
    <span className="inline-flex items-center gap-1">
      {ok ? <CheckIcon size={16} /> : <WarningIcon size={16} />}
      <span className={ok ? 'text-green-700' : 'text-amber-700'}>{label}</span>
    </span>
  );
}

export default function ResultPanel({
  result,
  comparison,
  verifyState,
  onVerify,
  onExportAreaPdf,
  onExportCalcPdf,
}) {
  const ua = Number(result?.ua_value || 0);
  const etaAC = Number(result?.eta_a_c || 0);
  const grade = result?.grade;
  const thresholds = result?.thresholds || {};

  return (
    <div className="sticky bottom-3 z-30">
      <div className="bg-white/95 backdrop-blur border border-warm-200 rounded-2xl shadow-lg p-4 md:p-5">
        {/* メイン結果 */}
        <div className="grid md:grid-cols-3 gap-4 items-start">
          <div>
            <div className="text-xs text-primary-500">UA値</div>
            <div className="text-2xl font-bold text-primary-800">{ua.toFixed(2)} W/m²K</div>
            <div className="text-sm">
              <StatusBadge ok={!!grade} label={formatGrade(grade)} />
            </div>
            <div className="text-xs mt-1">
              ZEH判定: <StatusBadge ok={!!result?.zeh_ok} label={result?.zeh_ok ? '適合' : '未達'} />
            </div>
          </div>

          <div>
            <div className="text-xs text-primary-500">ηAC値</div>
            <div className="text-2xl font-bold text-primary-800">{etaAC.toFixed(1)}</div>
            <div className="text-sm">
              <StatusBadge ok={etaAC <= 3.0} label={etaAC <= 3.0 ? '基準OK' : '基準超過'} />
            </div>
            <div className="text-xs text-primary-500 mt-1">
              窓コスト合計: ¥{Math.round(result?.window_cost_total || 0).toLocaleString('ja-JP')}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              <button type="button" className="btn-secondary text-xs md:text-sm py-2 px-3" onClick={onVerify}>
                公式APIで検証
              </button>
              <button type="button" className="btn-outline text-xs md:text-sm py-2 px-3" onClick={onExportAreaPdf}>
                求積表PDF
              </button>
              <button type="button" className="btn-outline text-xs md:text-sm py-2 px-3" onClick={onExportCalcPdf}>
                計算書PDF
              </button>
            </div>
            <CostComparison comparison={comparison} />
          </div>
        </div>

        {/* 等級ゲージバー */}
        <div className="mt-3">
          <GradeGauge ua={ua} thresholds={thresholds} />
        </div>

        {/* 3者比較カード（検証後のみ表示） */}
        {verifyState?.message && (
          <div className="mt-3">
            {/* 総合判定バー */}
            <div className={`flex items-center gap-2 rounded-t-lg px-3 py-2 text-sm font-medium ${
              verifyState.ok
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-amber-50 text-amber-800 border border-amber-200'
            }`}>
              {verifyState.ok ? <CheckIcon size={20} /> : <WarningIcon size={20} />}
              {verifyState.message}
            </div>

            {/* 3者比較カード */}
            {verifyState.details && (
              <div className="grid md:grid-cols-3 gap-0 border border-t-0 border-warm-200 rounded-b-lg overflow-hidden">
                {/* フロント */}
                <div className="p-3 border-r border-warm-200 bg-white">
                  <div className="text-xs text-primary-500 font-medium mb-1">フロント CalcEngine</div>
                  <div className="text-lg font-bold text-primary-800">
                    UA {Number(verifyState.details.front?.ua || 0).toFixed(2)}
                  </div>
                  <div className="text-sm text-primary-600">
                    ηAC {Number(verifyState.details.front?.eta_a_c || 0).toFixed(1)}
                  </div>
                </div>

                {/* バックエンド */}
                <div className="p-3 border-r border-warm-200 bg-white">
                  <div className="text-xs text-primary-500 font-medium mb-1 flex items-center gap-1">
                    バックエンド ミラー
                    {verifyState.local_ok != null && (
                      verifyState.local_ok ? <CheckIcon size={14} /> : <WarningIcon size={14} />
                    )}
                  </div>
                  <div className="text-lg font-bold text-primary-800">
                    UA {Number(verifyState.details.backend?.ua || 0).toFixed(2)}
                  </div>
                  <div className="text-sm text-primary-600">
                    ηAC {Number(verifyState.details.backend?.eta_a_c || 0).toFixed(1)}
                  </div>
                </div>

                {/* 公式API */}
                <div className="p-3 bg-white">
                  <div className="text-xs text-primary-500 font-medium mb-1 flex items-center gap-1">
                    公式API
                    {verifyState.details.official ? (
                      verifyState.official_ok ? <CheckIcon size={14} /> : <WarningIcon size={14} />
                    ) : (
                      <ErrorIcon size={14} />
                    )}
                  </div>
                  {verifyState.details.official ? (
                    <>
                      <div className="text-lg font-bold text-primary-800">
                        UA {Number(verifyState.details.official.ua || 0).toFixed(2)}
                      </div>
                      <div className="text-sm text-primary-600">
                        ηAC {Number(verifyState.details.official.eta_a_c || 0).toFixed(1)}
                      </div>
                      {verifyState.details.official.ua_standard != null && (
                        <div className="text-xs text-primary-400 mt-1">
                          基準: UA {Number(verifyState.details.official.ua_standard).toFixed(2)} / ηAC {Number(verifyState.details.official.eta_a_c_standard).toFixed(1)}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-sm text-amber-600">
                      接続エラー
                      <div className="text-xs text-amber-500">ローカル検証のみ</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
```

**重要**: 等級4〜7のテキスト一覧（`等級4: ≤0.87` ...）は削除。代わりにゲージバーが視覚的に同じ情報を表示する。

---

## Task 4: 壁セグメント入力をコンパクトカード化

**ファイル**: `frontend/src/residential/components/WallSegmentInput.jsx`（既存を全面修正）

### 設計方針

1. **8方位タブを廃止** → 全壁を1つのリストで表示（方位はバッジで表示）
2. **コンパクトカード** → 1壁 = 1行のサマリー表示（方位・面積・断熱材・U値）
3. **展開式編集** → カードクリックで詳細フィールドを展開
4. **不要フィールドを隠す** → 「入力方式」「隣接条件」「U値上書き」は展開時の詳細に
5. **テンプレート生成後はほぼ触らない** → コンパクト表示がデフォルト

### 修正後の WallSegmentInput 構造

```jsx
import { useMemo, useState } from 'react';

import { calcEnvelopeAreasFromSegments } from '../engine/calcAreas';
import { ORIENTATIONS } from '../engine/types';
import { MATERIAL_CONDUCTIVITY } from '../engine/tables/materialConductivity';

const ORIENTATION_LABELS = {
  N: '北', NE: '北東', E: '東', SE: '南東',
  S: '南', SW: '南西', W: '西', NW: '北西',
};

const ORIENTATION_COLORS = {
  N: 'bg-blue-100 text-blue-800',
  NE: 'bg-indigo-100 text-indigo-800',
  E: 'bg-emerald-100 text-emerald-800',
  SE: 'bg-teal-100 text-teal-800',
  S: 'bg-amber-100 text-amber-800',
  SW: 'bg-orange-100 text-orange-800',
  W: 'bg-rose-100 text-rose-800',
  NW: 'bg-purple-100 text-purple-800',
};

const ADJ_OPTIONS = [
  { value: 'exterior', label: '外気' },
  { value: 'ground', label: '地盤' },
  { value: 'unheated_space', label: '非空調' },
  { value: 'underfloor', label: '床下' },
];

const MATERIAL_OPTIONS = Object.keys(MATERIAL_CONDUCTIVITY).map((key) => ({ value: key, label: key }));

function createWall(orientation) {
  return {
    id: `wall_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    orientation,
    input_method: 'dimensions',
    width: 8.0,
    height: 2.7,
    area_gross: undefined,
    insulation_type: 'hgw16k',
    insulation_thickness: 105,
    u_value: undefined,
    adjacency: 'exterior',
  };
}

function calcGross(wall) {
  if (wall.input_method === 'direct_area') return Number(wall.area_gross || 0);
  return Number(wall.width || 0) * Number(wall.height || 0);
}

function WallCard({ wall, isExpanded, onToggle, onUpdate, onRemove }) {
  const area = calcGross(wall);
  const orientLabel = ORIENTATION_LABELS[wall.orientation] || wall.orientation;
  const orientColor = ORIENTATION_COLORS[wall.orientation] || 'bg-gray-100 text-gray-800';

  return (
    <div className="border border-warm-200 rounded-xl overflow-hidden">
      {/* コンパクトサマリー行 */}
      <button
        type="button"
        className="w-full flex items-center gap-3 px-4 py-3 bg-white hover:bg-warm-50 text-left"
        onClick={onToggle}
      >
        {/* 方位バッジ */}
        <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${orientColor}`}>
          {orientLabel}
        </span>

        {/* 面積 */}
        <span className="text-sm font-medium text-primary-800 min-w-[5rem]">
          {area.toFixed(1)} m²
        </span>

        {/* 断熱サマリー */}
        <span className="text-xs text-primary-500 flex-1">
          {wall.insulation_type} {wall.insulation_thickness}mm
          {wall.u_value != null ? ` (U=${wall.u_value})` : ''}
          {wall.adjacency !== 'exterior' ? ` [${ADJ_OPTIONS.find(o => o.value === wall.adjacency)?.label || wall.adjacency}]` : ''}
        </span>

        {/* 展開/折りたたみアイコン */}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className={`text-primary-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* 展開時の詳細編集 */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-2 border-t border-warm-100 bg-warm-50 space-y-3">
          {/* 基本フィールド: 幅 × 高さ = 面積 */}
          <div className="grid grid-cols-3 gap-3">
            <label className="text-xs">
              幅 (m)
              <input type="number" step="0.01" className="input-field mt-1"
                value={wall.width ?? ''}
                onChange={(e) => onUpdate({ width: Number(e.target.value || 0) })} />
            </label>
            <label className="text-xs">
              高さ (m)
              <input type="number" step="0.01" className="input-field mt-1"
                value={wall.height ?? ''}
                onChange={(e) => onUpdate({ height: Number(e.target.value || 0) })} />
            </label>
            <div className="text-xs flex items-end pb-2 text-primary-600">
              = {area.toFixed(2)} m²
            </div>
          </div>

          {/* 断熱フィールド */}
          <div className="grid grid-cols-2 gap-3">
            <label className="text-xs">
              断熱材
              <select className="input-field mt-1"
                value={wall.insulation_type || 'hgw16k'}
                onChange={(e) => onUpdate({ insulation_type: e.target.value })}>
                {MATERIAL_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </label>
            <label className="text-xs">
              厚み (mm)
              <input type="number" className="input-field mt-1"
                value={wall.insulation_thickness ?? 105}
                onChange={(e) => onUpdate({ insulation_thickness: Number(e.target.value || 0) })} />
            </label>
          </div>

          {/* 上級者向け（折りたたみ可） */}
          <details className="text-xs">
            <summary className="cursor-pointer text-primary-500 hover:text-primary-700">詳細設定</summary>
            <div className="grid grid-cols-3 gap-3 mt-2">
              <label>
                方位
                <select className="input-field mt-1"
                  value={wall.orientation}
                  onChange={(e) => onUpdate({ orientation: e.target.value })}>
                  {ORIENTATIONS.map((o) => <option key={o} value={o}>{ORIENTATION_LABELS[o] || o}</option>)}
                </select>
              </label>
              <label>
                隣接条件
                <select className="input-field mt-1"
                  value={wall.adjacency || 'exterior'}
                  onChange={(e) => onUpdate({ adjacency: e.target.value })}>
                  {ADJ_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </label>
              <label>
                U値 (上書き)
                <input type="number" step="0.01" className="input-field mt-1"
                  value={wall.u_value ?? ''}
                  onChange={(e) => onUpdate({ u_value: e.target.value === '' ? undefined : Number(e.target.value) })} />
              </label>
            </div>
          </details>

          {/* 削除ボタン */}
          <div className="flex justify-end">
            <button type="button" className="text-xs text-red-500 hover:text-red-700" onClick={onRemove}>
              この壁を削除
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function WallSegmentInput({ walls, openings, onChange }) {
  const [expandedId, setExpandedId] = useState(null);

  const safeWalls = Array.isArray(walls) ? walls : [];
  const safeOpenings = Array.isArray(openings) ? openings : [];

  const areaSummary = useMemo(
    () => calcEnvelopeAreasFromSegments({ walls: safeWalls, openings: safeOpenings }),
    [safeWalls, safeOpenings],
  );

  const updateWall = (id, patch) => {
    onChange(safeWalls.map((wall) => (wall.id === id ? { ...wall, ...patch } : wall)));
  };

  const removeWall = (id) => {
    onChange(safeWalls.filter((wall) => wall.id !== id));
    if (expandedId === id) setExpandedId(null);
  };

  const addWall = () => {
    const newWall = createWall('N');
    onChange([...safeWalls, newWall]);
    setExpandedId(newWall.id);
  };

  // 方位順にソート
  const sortedWalls = [...safeWalls].sort((a, b) => {
    const order = ORIENTATIONS;
    return order.indexOf(a.orientation) - order.indexOf(b.orientation);
  });

  const totalGross = areaSummary.total?.gross || 0;
  const totalOpenings = areaSummary.total?.openings || 0;
  const totalNet = areaSummary.total?.net || 0;

  return (
    <div className="space-y-3">
      {/* サマリーバー */}
      <div className="flex items-center justify-between bg-warm-50 border border-warm-200 rounded-xl px-4 py-2">
        <div className="text-sm text-primary-700">
          外壁 {totalGross.toFixed(1)}m² − 窓 {totalOpenings.toFixed(1)}m² = <span className="font-bold">NET {totalNet.toFixed(1)}m²</span>
        </div>
        <div className="text-xs text-primary-500">{safeWalls.length} セグメント</div>
      </div>

      {/* 壁カードリスト */}
      <div className="space-y-2">
        {sortedWalls.map((wall) => (
          <WallCard
            key={wall.id}
            wall={wall}
            isExpanded={expandedId === wall.id}
            onToggle={() => setExpandedId(expandedId === wall.id ? null : wall.id)}
            onUpdate={(patch) => updateWall(wall.id, patch)}
            onRemove={() => removeWall(wall.id)}
          />
        ))}
      </div>

      {/* 追加ボタン */}
      <button type="button" className="btn-outline text-sm py-2 px-4 w-full" onClick={addWall}>
        + 壁セグメントを追加
      </button>
    </div>
  );
}
```

### 壁入力の改善ポイント

| Before | After |
|--------|-------|
| 8方位タブで切り替え | 全壁を1リストで表示（方位バッジ色分け） |
| 全フィールド常時表示（7個） | コンパクト1行 → クリックで展開（3段階） |
| 「入力方式」ドロップダウン必須 | 非表示（寸法入力がデフォルト） |
| 「隣接条件」常時表示 | 詳細設定に隠す（ほぼ「外気」） |
| 「U値上書き」常時表示 | 詳細設定に隠す（ほぼ使わない） |
| 壁追加時に方位選択必要 | 追加後に展開で方位変更可 |

---

## Task 5: ShapeTemplate の「壁セグメントを自動生成」後にタブ移動しない

**ファイル**: `frontend/src/residential/components/ResidentialCalc.jsx`（既存を修正）

現在: テンプレート適用後に `setActiveTab('walls')` で壁タブに自動遷移
改善: テンプレートタブに留まる（壁は既に生成済み、ゲージバーで結果がすぐ見える）

```jsx
// Before:
onApply={(payload) => {
  patchProject({ ... });
  setActiveTab('walls');  // ← 削除
}}

// After:
onApply={(payload) => {
  patchProject({ ... });
  // タブ遷移しない。ゲージバーで結果確認→必要時のみ壁タブへ
}}
```

---

## 注意事項

- **絵文字を一切使わない**: ✅⚠❌ は全てSVGコンポーネントに置換
- **CLAUDE.mdのUI原則**: 原則1（選択肢 > 自由入力）、原則7（派手より楽）、原則10（デフォルト最適化）
- **デザイン禁止事項**: AIグラデーション禁止、shadcnデフォルトそのまま禁止
- 壁カードの方位バッジ色は Tailwind 標準色を使用（カスタムCSS不要）
- ゲージバーはSVG viewBox でレスポンシブ対応済み
- 既存テスト（Playwright 10件）が壊れないこと
- `npm run build` が成功すること

## 参考ファイル

- `frontend/src/residential/components/ResultPanel.jsx` — 検証結果表示（修正対象）
- `frontend/src/residential/components/WallSegmentInput.jsx` — 壁入力（修正対象）
- `frontend/src/residential/components/ResidentialCalc.jsx` — メインコンポーネント
- `frontend/src/residential/components/ShapeTemplate.jsx` — テンプレート生成
- `frontend/src/residential/components/InsulationSelector.jsx` — 断熱一括設定
- `frontend/e2e/smoke/residential-calc.spec.js` — E2Eテスト
