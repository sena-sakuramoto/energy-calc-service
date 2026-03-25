# CELL_MAPPING Implementation Status

## Overview

This document provides the complete status of Excel cell mappings for the official BEI input forms (様式A〜I). The mappings enable programmatic population of Excel templates with building energy data.

**Status**: ✅ **COMPLETE** - All forms B3, C1-C4, H, and I are fully implemented and tested.

## Architecture

### Two-Tier Mapping System

1. **FORM_A_MAPPING** - Fixed cell coordinates for 様式A (Basic Building Info)
   - Type: `Dict[str, Tuple[str, str]]` mapping field name → (sheet_name, cell_coordinate)
   - Location: `app/services/report.py` lines 202-223

2. **TABLE_COLUMNS** - Table form definitions for 様式B1-I (multi-row forms)
   - Type: `Dict[str, Dict]` with sheet name and column definitions
   - Location: `app/services/report.py` lines 245-354

### SMALLMODEL Support

The `SMALL_SHEET_MAP` (lines 226-241) handles template variations:
- MODEL (300m² and above): Full feature set
- SMALLMODEL (below 300m²): Simplified variant with some forms omitted

## Implementation Details

### 様式A: Basic Building Information

**Location**: `app/services/report.py` lines 202-223

**Implementation**: Fixed cell mapping
```python
FORM_A_MAPPING = {
    "sheet_date":            ("様式A_基本情報", "C3"),
    "author":                ("様式A_基本情報", "C4"),
    "building_name":         ("様式A_基本情報", "C6"),
    "prefecture":            ("様式A_基本情報", "D7"),
    "city":                  ("様式A_基本情報", "G7"),
    "region":                ("様式A_基本情報", "C9"),
    "solar_region":          ("様式A_基本情報", "C10"),
    "total_area":            ("様式A_基本情報", "C11"),
    "code_symbol":           ("様式A_基本情報", "E13"),
    "code_use":              ("様式A_基本情報", "E14"),
    "building_type":         ("様式A_基本情報", "E15"),
    "room_type":             ("様式A_基本情報", "E16"),
    "calc_floor_area":       ("様式A_基本情報", "C17"),
    "ac_floor_area":         ("様式A_基本情報", "C18"),
    "floors_above":          ("様式A_基本情報", "D19"),
    "floors_below":          ("様式A_基本情報", "G19"),
    "total_height":          ("様式A_基本情報", "C20"),
    "perimeter":             ("様式A_基本情報", "C21"),
    "non_ac_core_direction": ("様式A_基本情報", "D22"),
    "non_ac_core_length":    ("様式A_基本情報", "G22"),
}
```

**Schema**: `OfficialBuildingInfo` in `app/schemas/bei.py` (lines 26-46)

**Supported SMALLMODEL**: Yes (様式SA_基本情報)

---

### 様式B1: Window Specifications (開口部仕様)

**Table Range**: Rows 11-1010

**Columns**: A-K

**Schema**: `WindowSpec` in `app/schemas/bei.py` (lines 48-60)

**Mapping**:
| Schema Field | Column | Excel Cell Example |
|---|---|---|
| name | A | A11, A12, ... |
| width | B | B11, B12, ... |
| height | C | C11, C12, ... |
| area | D | D11, D12, ... |
| window_type | E | E11, E12, ... |
| glass_type | F | F11, F12, ... |
| glass_u_value | G | G11, G12, ... |
| glass_shgc | H | H11, H12, ... |
| window_u_value | I | I11, I12, ... |
| window_shgc | J | J11, J12, ... |

**Supported SMALLMODEL**: Yes (様式SB1_開口部仕様)

---

### 様式B2: Insulation Specifications (断熱仕様)

**Table Range**: Rows 11-1010

**Columns**: A-I

**Schema**: `InsulationSpec` in `app/schemas/bei.py` (lines 62-72)

**Mapping**:
| Schema Field | Column | Excel Cell Example |
|---|---|---|
| name | A | A11, A12, ... |
| part_class | B | B11, B12, ... |
| input_method | C | C11, C12, ... |
| material_category | D | D11, D12, ... |
| material_detail | E | E11, E12, ... |
| conductivity | F | F11, F12, ... |
| thickness | G | G11, G12, ... |
| u_value | H | H11, H12, ... |

**Supported SMALLMODEL**: Yes (様式SB2_断熱仕様)

---

### **様式B3: Envelope Specifications (外皮仕様)** ✅

**Table Range**: Rows 11-1010

**Columns**: A-L

**Schema**: `EnvelopeSpec` in `app/schemas/bei.py` (lines 74-87)

**Status**: ✅ **FULLY IMPLEMENTED**

**Mapping**:
| Schema Field | Column | Excel Cell Example | Notes |
|---|---|---|---|
| name | A | A11, A12, ... | Envelope name |
| direction | B | B11, B12, ... | Direction (南/北/東/西/なし) |
| width | C | C11, C12, ... | Width in meters |
| height | D | D11, D12, ... | Height in meters |
| area | E | E11, E12, ... | Envelope area (m²) |
| insulation_name | F | F11, F12, ... | Reference to 様式B2 |
| window_name | G | G11, G12, ... | Reference to 様式B1 |
| window_count | H | H11, H12, ... | Number of windows |
| has_blind | I | I11, I12, ... | Has blind (有/無) |
| shade_coeff_cooling | J | J11, J12, ... | Shade coefficient for cooling |
| shade_coeff_heating | K | K11, K12, ... | Shade coefficient for heating |

**Supported SMALLMODEL**: ❌ No (MODEL固有)

**Tests**: `test_cell_mapping_extended.py::TestB3EnvelopeMapping` (4 tests)

---

### **様式C1: AC Heat Source (空調熱源)** ✅

**Table Range**: Rows 11-1010

**Columns**: A-I

**Schema**: `HeatSourceSpec` in `app/schemas/bei.py` (lines 89-100)

**Status**: ✅ **FULLY IMPLEMENTED**

**Mapping**:
| Schema Field | Column | Excel Cell Example | Notes |
|---|---|---|---|
| name | A | A11, A12, ... | Equipment name |
| type | B | B11, B12, ... | Heat source type (30 options) |
| count | C | C11, C12, ... | Quantity (台) |
| capacity_cooling | D | D11, D12, ... | Cooling capacity (kW/unit) |
| capacity_heating | E | E11, E12, ... | Heating capacity (kW/unit) |
| power_cooling | F | F11, F12, ... | Cooling power consumption (kW/unit) |
| power_heating | G | G11, G12, ... | Heating power consumption (kW/unit) |
| fuel_cooling | H | H11, H12, ... | Cooling fuel consumption (kW/unit) |
| fuel_heating | I | I11, I12, ... | Heating fuel consumption (kW/unit) |

**Supported SMALLMODEL**: Yes (様式SC1_空調熱源) with simplified heat source list

**Tests**: `test_cell_mapping_extended.py::TestC1HeatSourceMapping` (3 tests)

---

### **様式C2: AC Outdoor Air (空調外気処理)** ✅

**Table Range**: Rows 11-1010

**Columns**: A-I

**Schema**: `OutdoorAirSpec` in `app/schemas/bei.py` (lines 102-112)

**Status**: ✅ **FULLY IMPLEMENTED**

**Mapping**:
| Schema Field | Column | Excel Cell Example | Notes |
|---|---|---|---|
| name | A | A11, A12, ... | Fan name |
| count | B | B11, B12, ... | Quantity (台) |
| supply_airflow | C | C11, C12, ... | Supply air volume (m³/h/unit) |
| exhaust_airflow | D | D11, D12, ... | Exhaust air volume (m³/h/unit) |
| heat_exchange_eff_cooling | E | E11, E12, ... | Heat exchange efficiency cooling (%) |
| heat_exchange_eff_heating | F | F11, F12, ... | Heat exchange efficiency heating (%) |
| auto_bypass | G | G11, G12, ... | Auto bypass (有/無) |
| preheat_stop | H | H11, H12, ... | Preheat stop function (有/無) |

**Supported SMALLMODEL**: Yes (様式SC2_空調外気処理)

**Tests**: `test_cell_mapping_extended.py::TestC2OutdoorAirMapping` (3 tests)

---

### **様式C3: AC Secondary Pump (空調二次ポンプ)** ✅

**Table Range**: Rows 11-1010

**Columns**: A-G

**Schema**: `PumpSpec` in `app/schemas/bei.py` (lines 114-122)

**Status**: ✅ **FULLY IMPLEMENTED**

**Mapping**:
| Schema Field | Column | Excel Cell Example | Notes |
|---|---|---|---|
| name | A | A11, A12, ... | Pump name |
| count | B | B11, B12, ... | Quantity (台) |
| flow_rate | C | C11, C12, ... | Design flow rate (m³/h/unit) |
| variable_flow | D | D11, D12, ... | Variable flow control (有/無) |
| min_flow_input | E | E11, E12, ... | Minimum flow input method |
| min_flow_ratio | F | F11, F12, ... | Minimum flow ratio (%) |

**Supported SMALLMODEL**: ❌ No (MODEL固有)

**Tests**: `test_cell_mapping_extended.py::TestC3PumpMapping` (3 tests)

---

### **様式C4: AC Supply Fan (空調送風機)** ✅

**Table Range**: Rows 11-1010

**Columns**: A-G

**Schema**: `FanSpec` in `app/schemas/bei.py` (lines 124-132)

**Status**: ✅ **FULLY IMPLEMENTED**

**Mapping**:
| Schema Field | Column | Excel Cell Example | Notes |
|---|---|---|---|
| name | A | A11, A12, ... | Fan name |
| count | B | B11, B12, ... | Quantity (台) |
| airflow | C | C11, C12, ... | Design air volume (m³/h/unit) |
| variable_airflow | D | D11, D12, ... | Variable airflow control (有/無) |
| min_airflow_input | E | E11, E12, ... | Minimum airflow input method |
| min_airflow_ratio | F | F11, F12, ... | Minimum airflow ratio (%) |

**Supported SMALLMODEL**: ❌ No (MODEL固有)

**Tests**: `test_cell_mapping_extended.py::TestC4FanMapping` (3 tests)

---

### 様式D: Ventilation (換気)

**Table Range**: Rows 11-1010

**Columns**: A-L

**Schema**: `VentilationSpec` in `app/schemas/bei.py` (lines 134-147)

**Mapping**: Fully implemented in TABLE_COLUMNS["D"]

**Supported SMALLMODEL**: Yes (様式SD_換気)

---

### 様式E: Lighting (照明)

**Table Range**: Rows 11-1010

**Columns**: A-L

**Schema**: `LightingSpec` in `app/schemas/bei.py` (lines 149-162)

**Mapping**: Fully implemented in TABLE_COLUMNS["E"]

**Supported SMALLMODEL**: Yes (様式SE_照明)

---

### 様式F: Hot Water (給湯)

**Table Range**: Rows 11-1010

**Columns**: A-J

**Schema**: `HotWaterSpec` in `app/schemas/bei.py` (lines 164-175)

**Mapping**: Fully implemented in TABLE_COLUMNS["F"]

**Supported SMALLMODEL**: Yes (様式SF_給湯)

---

### 様式G: Elevators (昇降機)

**Table Range**: Rows 11-1010

**Columns**: A-C

**Schema**: `ElevatorSpec` in `app/schemas/bei.py` (lines 177-181)

**Mapping**: Fully implemented in TABLE_COLUMNS["G"]

**Supported SMALLMODEL**: ❌ No (MODEL固有)

---

### **様式H: Solar PV (太陽光発電)** ✅

**Table Range**: Rows 11-1010

**Columns**: A-G

**Schema**: `SolarPVSpec` in `app/schemas/bei.py` (lines 183-191)

**Status**: ✅ **FULLY IMPLEMENTED**

**Mapping**:
| Schema Field | Column | Excel Cell Example | Notes |
|---|---|---|---|
| system_name | A | A11, A12, ... | System name |
| cell_type | B | B11, B12, ... | Solar cell type (2 options) |
| installation_mode | C | C11, C12, ... | Array installation mode (3 options) |
| capacity_kw | D | D11, D12, ... | System capacity (kW) |
| panel_direction | E | E11, E12, ... | Panel azimuth angle (12 options) |
| panel_angle | F | F11, F12, ... | Panel inclination angle (10 options) |

**Supported SMALLMODEL**: Yes (様式SH_太陽光発電)

**Tests**: `test_cell_mapping_extended.py::TestHSolarPVMapping` (3 tests)

---

### **様式I: Cogeneration (コージェネレーション)** ✅

**Table Range**: Rows 11-1010

**Columns**: A-K

**Schema**: `CogenerationSpec` in `app/schemas/bei.py` (lines 193-205)

**Status**: ✅ **FULLY IMPLEMENTED**

**Mapping**:
| Schema Field | Column | Excel Cell Example | Notes |
|---|---|---|---|
| name | A | A11, A12, ... | Equipment name |
| rated_output | B | B11, B12, ... | Rated power output (kW/unit) |
| count | C | C11, C12, ... | Quantity (台) |
| gen_eff_100 | D | D11, D12, ... | Generation efficiency at 100% load (%) |
| gen_eff_75 | E | E11, E12, ... | Generation efficiency at 75% load (%) |
| gen_eff_50 | F | F11, F12, ... | Generation efficiency at 50% load (%) |
| heat_eff_100 | G | G11, G12, ... | Heat recovery efficiency at 100% load (%) |
| heat_eff_75 | H | H11, H12, ... | Heat recovery efficiency at 75% load (%) |
| heat_eff_50 | I | I11, I12, ... | Heat recovery efficiency at 50% load (%) |
| heat_recovery_for | J | J11, J12, ... | Heat recovery destination (7 options) |

**Supported SMALLMODEL**: ❌ No (MODEL固有)

**Tests**: `test_cell_mapping_extended.py::TestICogenerationMapping` (3 tests)

---

## Test Coverage

### Test File Location
`tests/test_cell_mapping_extended.py` (30 tests)

### Test Classes

1. **TestB3EnvelopeMapping** (4 tests)
   - Column definition verification
   - Field mapping completeness
   - Excel column validity
   - Workbook write-through test

2. **TestC1HeatSourceMapping** (3 tests)
   - Column definition verification
   - Field mapping completeness
   - Workbook write-through test

3. **TestC2OutdoorAirMapping** (3 tests)
   - Column definition verification
   - Field mapping completeness
   - Workbook write-through test

4. **TestC3PumpMapping** (3 tests)
   - Column definition verification
   - Field mapping completeness
   - SMALLMODEL skip test

5. **TestC4FanMapping** (3 tests)
   - Column definition verification
   - Field mapping completeness
   - Workbook write-through test

6. **TestHSolarPVMapping** (3 tests)
   - Column definition verification
   - Field mapping completeness
   - Workbook write-through test

7. **TestICogenerationMapping** (3 tests)
   - Column definition verification
   - Field mapping completeness
   - Workbook write-through test

8. **TestMultipleTableRows** (2 tests)
   - Multiple heat source rows
   - Multiple solar PV system rows

9. **TestSmallModelSheetMapping** (6 tests)
   - B3 skipped for SMALLMODEL
   - C3 skipped for SMALLMODEL
   - C4 skipped for SMALLMODEL
   - G skipped for SMALLMODEL
   - I skipped for SMALLMODEL
   - H available for SMALLMODEL

### Running Tests

```bash
# Run extended mapping tests only
PYTHONPATH=. python -m pytest tests/test_cell_mapping_extended.py -v

# Run all tests
PYTHONPATH=. python -m pytest -q
```

---

## Implementation Functions

### Core Function: `_write_data_to_workbook()`

**Location**: `app/services/report.py` lines 421-469

**Purpose**: Populates Excel workbook with official input data

**Process**:
1. Determine template type (MODEL vs SMALLMODEL)
2. Write 様式A data via `_write_form_a()`
3. Write table forms via `_write_table_rows()` for each form key

**Call Flow**:
```
_write_data_to_workbook(workbook, input_data)
├── _write_form_a(workbook, building, is_small)
│   └── Uses FORM_A_MAPPING
└── For each table form (B1-I):
    └── _write_table_rows(workbook, form_key, rows, is_small)
        ├── Looks up TABLE_COLUMNS[form_key]
        ├── Resolves sheet name via _resolve_sheet_name()
        └── Writes rows starting at TABLE_START_ROW (11)
```

### Helper Functions

- `_resolve_sheet_name(model_sheet, is_small)` - Convert MODEL sheet names to SMALLMODEL
- `_write_form_a(wb, building, is_small)` - Write fixed cells from FORM_A_MAPPING
- `_write_table_rows(wb, form_key, rows, is_small)` - Write table rows from TABLE_COLUMNS

---

## Usage Example

```python
from app.schemas.bei import OfficialInput, OfficialBuildingInfo, EnvelopeSpec, HeatSourceSpec, SolarPVSpec
from app.services import report
import openpyxl

# Build input data
input_data = {
    "building": {
        "building_name": "Test Office",
        "region": "6地域",
        "building_type": "事務所モデル",
        "calc_floor_area": 500,
        "ac_floor_area": 450,
    },
    "envelopes": [
        {
            "name": "South Wall",
            "direction": "南",
            "width": 10.0,
            "height": 5.0,
            "area": 50.0,
            "insulation_name": "断熱-A",
            "window_name": "窓-1",
            "window_count": 5,
            "has_blind": "有",
            "shade_coeff_cooling": 0.6,
            "shade_coeff_heating": 0.3,
        }
    ],
    "heat_sources": [
        {
            "name": "Chiller-1",
            "type": "ウォータチリングユニット(空冷式)",
            "count": 1,
            "capacity_cooling": 100.0,
            "capacity_heating": 80.0,
            "power_cooling": 30.0,
            "power_heating": 25.0,
            "fuel_cooling": 0.0,
            "fuel_heating": 0.0,
        }
    ],
    "solar_pvs": [
        {
            "system_name": "Solar-1",
            "cell_type": "結晶系太陽電池",
            "installation_mode": "屋根置き形",
            "capacity_kw": 10.0,
            "panel_direction": "0度(南)",
            "panel_angle": "30度",
        }
    ],
}

# Load template and populate
workbook = openpyxl.load_workbook("MODEL_inputSheet.xlsx")
report._write_data_to_workbook(workbook, input_data)
workbook.save("output.xlsx")
```

---

## Related Files

- **Schema Definitions**: `app/schemas/bei.py`
- **Implementation**: `app/services/report.py`
- **Tests**: `tests/test_cell_mapping_extended.py`
- **Template Analysis**: `docs/excel-template-analysis.md`

---

## Summary Table

| Form | Columns | Rows | Schema | Model | Small | Status |
|------|---------|------|--------|-------|-------|--------|
| A | Fixed cells | - | OfficialBuildingInfo | ✅ | ✅ | ✅ |
| B1 | A-K | 11-1010 | WindowSpec | ✅ | ✅ | ✅ |
| B2 | A-I | 11-1010 | InsulationSpec | ✅ | ✅ | ✅ |
| **B3** | **A-L** | **11-1010** | **EnvelopeSpec** | **✅** | **❌** | **✅** |
| **C1** | **A-I** | **11-1010** | **HeatSourceSpec** | **✅** | **✅** | **✅** |
| **C2** | **A-H** | **11-1010** | **OutdoorAirSpec** | **✅** | **✅** | **✅** |
| **C3** | **A-F** | **11-1010** | **PumpSpec** | **✅** | **❌** | **✅** |
| **C4** | **A-F** | **11-1010** | **FanSpec** | **✅** | **❌** | **✅** |
| D | A-L | 11-1010 | VentilationSpec | ✅ | ✅ | ✅ |
| E | A-L | 11-1010 | LightingSpec | ✅ | ✅ | ✅ |
| F | A-J | 11-1010 | HotWaterSpec | ✅ | ✅ | ✅ |
| G | A-C | 11-1010 | ElevatorSpec | ✅ | ❌ | ✅ |
| **H** | **A-G** | **11-1010** | **SolarPVSpec** | **✅** | **✅** | **✅** |
| **I** | **A-K** | **11-1010** | **CogenerationSpec** | **✅** | **❌** | **✅** |

**Legend**: ✅ = Implemented, ❌ = Not supported in that template variant

---

## Related TODO Items

- [x] CELL_MAPPING拡張（B3/C/H/I） - **COMPLETED**
  - [x] B3 (Envelope) mapping
  - [x] C1 (Heat Source) mapping
  - [x] C2 (Outdoor Air) mapping
  - [x] C3 (Pump) mapping
  - [x] C4 (Fan) mapping
  - [x] H (Solar PV) mapping
  - [x] I (Cogeneration) mapping
  - [x] Comprehensive test coverage (30 tests)

---

**Last Updated**: 2026-03-25
**Test Status**: ✅ All 158 tests passing (30 extended + 128 existing)
