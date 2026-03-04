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
