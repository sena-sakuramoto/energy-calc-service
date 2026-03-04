# CODEX指示書: 住宅版公式API接続

## 目的

`/api/v1/residential/verify` エンドポイントを、公式外皮計算API (`api.lowenergy.jp/envelope/1/eval`) に接続し、フロントエンド CalcEngine の計算結果を公式APIの計算結果と照合できるようにする。

## 完了条件

1. `pytest tests/test_residential_official_api.py -v` → 全PASS
2. `POST /api/v1/residential/verify` がフロントの計算結果と公式APIの結果を両方返す
3. 公式API呼び出し失敗時はローカルミラー計算にフォールバック（既存動作維持）
4. `npm run build` → 成功

---

## 公式API仕様（Ver.3.8.0）

### エンドポイント

```
POST https://api.lowenergy.jp/envelope/1/eval
Content-Type: application/xml; charset=utf-8
Accept: */*
```

**認証**: なし（無料・無認証）
**レート制限**: 連続実行禁止（前の計算完了前に次のリクエストを送らない）
**レスポンス**: `Content-Type: application/xml`

### リクエストXML構造

```xml
<Envelope Version="3" Name="建物名" Region="6" Description="所在地">
  <!-- 壁（Simple法の例） -->
  <Wall Name="外壁北" Direction="N" Type="ExternalWall" Adjacent="Outside"
    Area="48.05" GammaH="1" GammaC="1" Method="Simple" Outside="No"
    ConstructionMethod="FrameWall" InsulationPlace="PillarInterval"
    SolarAbsorptance="0.65">
    <GeneralPart>
      <SolidLayer Thickness="0.0125" ExternalReduction="No" Material="StainlessSteel"/>
      <SolidLayer Thickness="0.1" ExternalReduction="Yes" Material="GW16K"/>
      <SolidLayer Thickness="0.009" ExternalReduction="Yes" Material="PlywoodBoard"/>
      <AirLayer Type="AirTight"/>
    </GeneralPart>
    <HeatBridge>
      <SolidLayer Thickness="0.0125" ExternalReduction="No" Material="Aluminum"/>
      <SolidLayer Thickness="0.1" ExternalReduction="Yes" Material="Wood"/>
      <SolidLayer Thickness="0.009" ExternalReduction="No" Material="PlywoodBoard"/>
    </HeatBridge>
  </Wall>

  <!-- 壁（Direct法：U値直接指定） -->
  <Wall Name="外壁南" Direction="S" Type="ExternalWall" Adjacent="Outside"
    Area="35.0" GammaH="1" GammaC="1" Method="Direct" UValue="0.45"
    SolarAbsorptance="0.65" />

  <!-- 窓 -->
  <Window Name="窓-1" Direction="S" Adjacent="Outside"
    Area="3.0" GammaH="1" GammaC="1"
    SashSpec="Resin" GlassType="DoublePairLowEG"
    UvalueInfo="Specification" />

  <!-- ドア -->
  <Door Name="玄関ドア" Direction="N" Adjacent="Outside"
    Area="1.89" GammaH="1" GammaC="1"
    UvalueInfo="Specification" UwithoutAttachment="4.65" />

  <!-- 基礎 -->
  <Foundation Name="基礎" Adjacent="Outside"
    FloorArea="50.0" OuterLength="28.0"
    CalcMethod="SimplifiedWithFloorInsulation" />

  <!-- 天井/屋根も Wall Type="Ceiling" / "Roof" で表現 -->
  <Wall Name="天井" Direction="Top" Type="Ceiling" Adjacent="Outside"
    Area="50.0" GammaH="1" GammaC="1" Method="Direct" UValue="0.24"
    SolarAbsorptance="0.65" />

  <!-- 床（外気に接する場合） -->
  <Wall Name="床" Direction="Bottom" Type="Floor" Adjacent="Outside"
    Area="50.0" GammaH="1" GammaC="1" Method="Direct" UValue="0.34" />
</Envelope>
```

### Direction値

| 値 | 意味 |
|----|------|
| N, NE, E, SE, S, SW, W, NW | 方位 |
| Top | 上面（屋根・天井） |
| Bottom | 下面（床） |

### Adjacent値

| 値 | 意味 |
|----|------|
| Outside | 外気 |
| Ground | 地面 |
| NotHeated | 非暖房空間 |
| SeparatorZero | 温度差0の間仕切り |

### Wall Type値

| 値 | 意味 |
|----|------|
| ExternalWall | 外壁 |
| Ceiling | 天井 |
| Roof | 屋根 |
| Floor | 床 |

### Wall Method値

| 値 | 使い分け |
|----|---------|
| Simple | 簡略計算法（構造・断熱材レイヤーから自動計算） |
| Accurate | 詳細計算法 |
| Direct | U値を直接指定（我々の主な使い方） |

### SashSpec値（窓枠材質）

| 値 | 意味 |
|----|------|
| Aluminum | アルミ |
| AluminumResin | アルミ樹脂複合 |
| Resin | 樹脂 |
| Wood | 木 |

### GlassType値（主要なもの）

| 値 | 意味 |
|----|------|
| TriplePairDoubleLowEG | 三層(Low-E2枚)_ガス |
| TriplePairDoubleLowES | 三層(Low-E2枚)_空気 |
| TriplePairLowEG | 三層(Low-E1枚)_ガス |
| DoublePairLowEG | 複層(Low-E)_ガス |
| DoublePairLowES | 複層(Low-E)_空気 |
| DoublePair | 複層_空気 |
| SinglePair | 単板 |

### レスポンスXML（CalcResult）

```xml
<CalcResult BuildingName="サンプル" Region="R6" Description="東京都○○区"
  UA="0.52" UAStandard="0.87"
  EaterAC="0.5" EaterACStandard="2.8"
  EaterAH="0.3"
  q="24.847" mC="0.234" mH="0.179"
  TotalArea="48.05" TotalArea_Ai="48.05" TotalArea_AEF="0"
  TotalOuterLength="0">
  <Components>
    <ComponentResult xsi:type="WallSimple1Result" Name="外壁北"
      Area="48.05" U="0.517" H_UA="1" HeatTransLoss_UA="24.847"
      Adjacent="Outside" ComponentType="ExternalWall" ...>
      <SummerSolarHeating Direction="N" DirectionCoeff="0.341" EAN="0.234" />
      <WinterSolarHeating Direction="N" DirectionCoeff="0.261" EAN="0.179" />
      <Parts>
        <PartResult Type="General" AreaRate="0.83" ... />
        <PartResult Type="HeatBridge" AreaRate="0.17" ... />
      </Parts>
    </ComponentResult>
  </Components>
</CalcResult>
```

---

## 実装タスク

### Task 1: XMLビルダー作成

**ファイル**: `app/services/residential_xml_builder.py`（新規）

ResidentialVerifyRequest → 公式API用XML文字列に変換する関数を作成。

```python
def build_envelope_xml(request: ResidentialVerifyRequest) -> str:
    """ResidentialVerifyRequestから公式API用XMLを生成"""
```

**マッピングルール**:

| 我々のデータ | 公式XML |
|------------|---------|
| `region: 6` | `Region="6"` |
| wall with `adjacency="exterior"` | `Adjacent="Outside"` |
| wall with `adjacency="ground"` | `Adjacent="Ground"` |
| wall with `adjacency="unheated_space"` | `Adjacent="NotHeated"` |
| wall type `"wall"` + orientation N/S/E/W | `Type="ExternalWall"` Direction="N/S/E/W" |
| part type `"roof"` or `"ceiling"` | `Type="Ceiling"` or `Type="Roof"`, Direction="Top" |
| part type `"floor"` | `Type="Floor"`, Direction="Bottom" |
| window `sash_type="resin"` | `SashSpec="Resin"` |
| window `glass_type="double_low_e_gas"` | `GlassType="DoublePairLowEG"` |

**壁の入力方式**: 我々のCalcEngineはU値を既に計算済みなので、`Method="Direct"` を使い `UValue` を直接指定する。これが最もシンプルで正確。

```python
# 壁セグメント → Direct法XML
f'<Wall Name="{name}" Direction="{direction}" Type="{wall_type}" '
f'Adjacent="{adjacent}" Area="{area}" GammaH="1" GammaC="1" '
f'Method="Direct" UValue="{u_value}" SolarAbsorptance="0.65" />'
```

**窓の入力方式**: SashSpec + GlassType を指定（組み合わせ表法）。

```python
# 窓 → Specification法XML
f'<Window Name="{name}" Direction="{direction}" Adjacent="{adjacent}" '
f'Area="{area}" GammaH="1" GammaC="1" '
f'SashSpec="{sash_spec}" GlassType="{glass_type}" '
f'UvalueInfo="Specification" />'
```

### Task 2: API呼び出しサービス

**ファイル**: `app/services/residential_official_api.py`（新規）

```python
import httpx

ENVELOPE_API_URL = "https://api.lowenergy.jp/envelope/1/eval"

async def call_official_envelope_api(xml_body: str, timeout: int = 30) -> dict:
    """
    公式外皮計算APIを呼び出し、結果をdictで返す。

    Returns:
        {
            "ua": float,
            "ua_standard": float,
            "eta_ac": float,
            "eta_ac_standard": float,
            "eta_ah": float,
            "total_area": float,
            "components": [...],  # 各部位の詳細
            "raw_xml": str,       # 生XML（デバッグ用）
        }

    Raises:
        OfficialAPIError: API呼び出し失敗時
    """
```

**重要**:
- `httpx.AsyncClient` を使う（既存の `requests.post` はブロッキング）
- リトライ: 最大3回、exponential backoff（既存パターンに合わせる）
- XML パース: `xml.etree.ElementTree` で CalcResult の属性を抽出
- タイムアウト: 30秒

### Task 3: verifyエンドポイント更新

**ファイル**: `app/api/v1/residential.py`（既存を修正）

```python
@router.post("/residential/verify")
async def verify_residential(request: ResidentialVerifyRequest):
    # 1. ローカルミラー計算（既存）
    local_result = compute_local(request)

    # 2. 公式API呼び出し（新規）
    try:
        xml_body = build_envelope_xml(request)
        official_result = await call_official_envelope_api(xml_body)
    except OfficialAPIError as e:
        official_result = None
        official_error = str(e)

    # 3. 三者比較を返す
    return {
        "backend_result": local_result,
        "official_result": official_result,  # None if API failed
        "official_error": official_error if official_result is None else None,
        "comparison": {
            "ua_match": abs(local_result.ua - official_result["ua"]) < 0.01 if official_result else None,
            "eta_ac_match": abs(local_result.eta_ac - official_result["eta_ac"]) < 0.1 if official_result else None,
        },
        "front_comparison": { ... }  # 既存のフロント比較
    }
```

### Task 4: フロントエンド更新

**ファイル**: `frontend/src/residential/components/ResidentialCalc.tsx`（既存を修正）

検証ボタン押下時の表示を三者比較に拡張:

```
┌──────────────────────────────────────┐
│ 検証結果                              │
│                                      │
│ フロント CalcEngine:  UA = 0.56      │
│ バックエンド ミラー:   UA = 0.56  ✅  │
│ 公式API:              UA = 0.56  ✅  │
│                                      │
│ ηAC:                                 │
│ フロント: 1.2 / バックエンド: 1.2 / 公式: 1.2 │
│                                      │
│ 基準値: UA ≤ 0.87 ✅  ηAC ≤ 2.8 ✅  │
└──────────────────────────────────────┘
```

公式APIがエラーの場合:
```
│ 公式API:  ⚠ 接続エラー（ローカル検証のみ）│
```

### Task 5: テスト

**ファイル**: `tests/test_residential_official_api.py`（新規）

```python
def test_build_envelope_xml_wall_direct():
    """壁セグメントがDirect法XMLに正しく変換される"""

def test_build_envelope_xml_window_specification():
    """窓がSpecification法XMLに正しく変換される"""

def test_build_envelope_xml_foundation():
    """基礎がFoundation要素に正しく変換される"""

def test_parse_calc_result_xml():
    """CalcResult XMLからUA/ηAC/ηAHが正しく抽出される"""

def test_verify_endpoint_returns_official_result(mock_httpx):
    """公式API成功時、official_resultが返る"""

def test_verify_endpoint_fallback_on_api_error(mock_httpx):
    """公式APIエラー時、official_result=Noneでフォールバック"""
```

---

## ガラスタイプ マッピング表

フロントの `glass_type` → 公式API `GlassType` の変換:

| フロント値 | 公式API値 |
|-----------|----------|
| `triple_low_e_double_gas` | `TriplePairDoubleLowEG` |
| `triple_low_e_double_air` | `TriplePairDoubleLowES` |
| `triple_low_e_gas` | `TriplePairLowEG` |
| `triple_low_e_air` | `TriplePairLowES` |
| `triple_clear` | `TriplePairClear` |
| `double_low_e_gas` | `DoublePairLowEG` |
| `double_low_e_air` | `DoublePairLowES` |
| `double_clear` | `DoublePair` |
| `single` | `SinglePair` |

## サッシタイプ マッピング表

| フロント値 | 公式API値 |
|-----------|----------|
| `metal` | `Aluminum` |
| `metal_resin` | `AluminumResin` |
| `resin` | `Resin` |
| `wood` | `Wood` |

---

## 注意事項

- 公式APIは連続実行禁止。asyncio.Lock でリクエストを直列化すること
- XML宣言は不要（UTF-8のみ）
- Version属性は `"3"` を指定
- 壁の `SolarAbsorptance` はデフォルト `0.65`（中間色）
- `GammaH` / `GammaC` は日除けがない場合 `1`
- レスポンスのUA値は小数点以下2桁（0.52等）、ηACは1桁（0.5等）

## 参考

- API仕様書PDF: `api_envelope_spec.pdf`（プロジェクトルート）
- 仕様書URL: https://house.lowenergy.jp/static/file/API_envelope_Ver.3.8.0_20250401.pdf
- 非住宅版パターン: `app/services/report.py`
