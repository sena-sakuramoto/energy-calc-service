// frontend/src/pages/tools/official-bei.jsx
// 公式入力シート (様式A〜I) に基づくBEI計算 + 国交省公式PDF出力
import { useState, useCallback } from 'react';
import {
  FaCalculator, FaBuilding, FaThermometerHalf, FaFan,
  FaWind, FaLightbulb, FaShower, FaArrowsAltV, FaSolarPanel,
  FaCogs, FaCheckCircle, FaArrowRight, FaArrowLeft,
  FaFilePdf, FaFileExcel, FaUpload, FaExclamationTriangle,
} from 'react-icons/fa';
import CalculatorLayout from '../../components/CalculatorLayout';
import FormSection from '../../components/FormSection';
import HelpTooltip from '../../components/HelpTooltip';
import { officialAPI } from '../../utils/api';

// ── ドロップダウン選択肢 (Excelテンプレートのdataシートから抽出) ──────

const REGIONS = ['1地域','2地域','3地域','4地域','5地域','6地域','7地域','8地域'];
const SOLAR_REGIONS = ['A1区分','A2区分','A3区分','A4区分','A5区分'];
const BUILDING_TYPES = [
  '事務所モデル','ビジネスホテルモデル','シティホテルモデル','総合病院モデル',
  '福祉施設モデル','クリニックモデル','学校モデル','幼稚園モデル','大学モデル',
  '講堂モデル','大規模物販モデル','小規模物販モデル','飲食店モデル','集会所モデル','工場モデル',
];
const DIRECTIONS = ['北','東','南','西','なし'];
const ENVELOPE_DIRECTIONS = ['北','東','西','南','屋根','床'];
const WINDOW_TYPES = [
  '樹脂製(単板ガラス)','樹脂製(二層複層ガラス)','樹脂製(三層以上の複層ガラス)',
  '木製(単板ガラス)','木製(二層複層ガラス)','木製(三層以上の複層ガラス)',
  '金属樹脂複合製(単板ガラス)','金属樹脂複合製(二層複層ガラス)','金属樹脂複合製(三層以上の複層ガラス)',
  '金属木複合製(単板ガラス)','金属木複合製(二層複層ガラス)','金属木複合製(三層以上の複層ガラス)',
  '金属製(単板ガラス)','金属製(二層以上の複層ガラス)',
];
const PART_CLASSES = ['外壁','屋根','外気に接する床'];
const INSULATION_INPUT_METHODS = [
  '断熱材の種類(大分類のみ)と厚みを入力する','断熱材の種類と厚みを入力する',
  '熱伝導率と厚みを入力する','熱貫流率を入力する','入力しない',
];
const INSULATION_MATERIALS = [
  'グラスウール断熱材通常品','グラスウール断熱材高性能品','吹込み用グラスウール断熱材',
  'ロックウール断熱材','吹込み用ロックウール断熱材','吹付けロックウール',
  '吹込み用セルローズファイバー断熱材','押出法ポリスチレンフォーム断熱材',
  'ポリエチレンフォーム断熱材','ビーズ法ポリスチレンフォーム断熱材',
  '硬質ウレタンフォーム断熱材','吹付け硬質ウレタンフォーム',
  'フェノールフォーム断熱材','インシュレーションファイバー断熱材',
];
const HEAT_SOURCE_TYPES = [
  'ウォータチリングユニット(空冷式)','ウォータチリングユニット(水冷式)',
  'ターボ冷凍機','スクリュー冷凍機',
  '吸収式冷凍機','吸収式冷凍機(冷却水変流量)',
  '吸収式冷凍機(排熱利用形)','吸収式冷凍機(排熱利用形、冷却水変流量)',
  'ボイラ','温水発生機','地域熱供給',
  'パッケージエアコンディショナ(空冷式)','パッケージエアコンディショナ(水冷式)',
  'パッケージエアコンディショナ(水冷式熱回収形)',
  'ガスヒートポンプ冷暖房機','ルームエアコンディショナ',
  '電気式ヒーター等','FF式暖房機等',
];
const VENT_ROOM_TYPES = ['機械室','便所','駐車場','厨房'];
const VENT_METHODS = ['第一種換気','第二種換気','第三種換気'];
const BOOLEAN_LIST = ['無','有'];
const HW_USE_TYPES = ['洗面・手洗い','浴室','厨房'];
const INSULATION_LEVELS = ['裸管','保温仕様D','保温仕様C','保温仕様B','保温仕様A','保温仕様2または3','保温仕様1'];
const WATER_SAVING = ['無','自動給湯栓','節湯B1'];
const ELEVATOR_CONTROLS = ['交流帰還制御等','可変電圧可変周波数制御方式(回生なし)','可変電圧可変周波数制御方式(回生あり)'];
const SOLAR_CELL_TYPES = ['結晶系太陽電池','結晶系以外の太陽電池'];
const INSTALL_MODES = ['下記に掲げるもの以外','屋根置き形','架台設置形'];
const PANEL_DIRECTIONS = ['0度(南)','30度','60度','90度(西)','120度','150度','180度(北)','210度','240度','270度(東)','300度','330度'];
const PANEL_ANGLES = ['0度(水平)','10度','20度','30度','40度','50度','60度','70度','80度','90度(垂直)'];
const COGEN_HEAT_RECOVERY = ['冷房のみ','暖房のみ','給湯のみ','冷房と暖房','冷房と給湯','暖房と給湯','冷房と暖房と給湯'];
const SMALLMODEL_UPLOAD_MESSAGE = '小規模版（SMALLMODEL）原本Excelの直接アップロードは未対応です。公式BEI画面から入力して送信するか、MODEL形式の入力シートをご利用ください。';
const REQUIRED_INPUT_MESSAGE = '入力内容に不足があります。必須項目を確認してください。';

const FIELD_STEP_HINTS = [
  { prefix: 'building.', step: 1 },
  { prefix: 'windows.', step: 2 },
  { prefix: 'insulations.', step: 3 },
  { prefix: 'envelopes.', step: 4 },
  { prefix: 'heat_sources.', step: 5 },
  { prefix: 'outdoor_air.', step: 5 },
  { prefix: 'pumps.', step: 5 },
  { prefix: 'fans.', step: 5 },
  { prefix: 'ventilations.', step: 6 },
  { prefix: 'lightings.', step: 7 },
  { prefix: 'hot_waters.', step: 8 },
  { prefix: 'elevators.', step: 9 },
  { prefix: 'solar_pvs.', step: 9 },
  { prefix: 'cogenerations.', step: 9 },
];

const isBlank = (value) => value === undefined || value === null || String(value).trim() === '';
const hasAnyRowValue = (row) => Object.entries(row).some(([key, value]) => {
  if (isBlank(value)) return false;
  if (key === 'count' && (value === 1 || value === '1')) return false;
  return true;
});

const getStepFromFieldPath = (path) => {
  const hit = FIELD_STEP_HINTS.find(({ prefix }) => path.startsWith(prefix));
  return hit ? hit.step : 10;
};

// ── 初期データ ──────────────────────────────────────────────

const emptyBuilding = {
  building_name: '', region: '', solar_region: '', building_type: '',
  room_type: '', calc_floor_area: '', ac_floor_area: '',
  total_area: '', prefecture: '', city: '',
  floors_above: '', floors_below: '', total_height: '',
  perimeter: '', non_ac_core_direction: '', non_ac_core_length: '',
};
const emptyWindow = () => ({ name: '', width: '', height: '', area: '', window_type: '', glass_type: '', glass_u_value: '', glass_shgc: '', window_u_value: '', window_shgc: '' });
const emptyInsulation = () => ({ name: '', part_class: '', input_method: '', material_category: '', material_detail: '', conductivity: '', thickness: '', u_value: '' });
const emptyEnvelope = () => ({ name: '', direction: '', width: '', height: '', area: '', insulation_name: '', window_name: '', window_count: '', has_blind: '', shade_coeff_cooling: '', shade_coeff_heating: '' });
const emptyHeatSource = () => ({ name: '', type: '', count: 1, capacity_cooling: '', capacity_heating: '', power_cooling: '', power_heating: '', fuel_cooling: '', fuel_heating: '' });
const emptyOutdoorAir = () => ({ name: '', count: 1, supply_airflow: '', exhaust_airflow: '', heat_exchange_eff_cooling: '', heat_exchange_eff_heating: '', auto_bypass: '', preheat_stop: '' });
const emptyPump = () => ({ name: '', count: 1, flow_rate: '', variable_flow: '', min_flow_input: '', min_flow_ratio: '' });
const emptyFan = () => ({ name: '', count: 1, airflow: '', variable_airflow: '', min_airflow_input: '', min_airflow_ratio: '' });
const emptyVentilation = () => ({ room_name: '', room_type: '', floor_area: '', method: '', equipment_name: '', count: 1, airflow: '', motor_power: '', high_eff_motor: '', inverter: '', airflow_control: '' });
const emptyLighting = () => ({ room_name: '', room_type: '', floor_area: '', room_height: '', fixture_name: '', power_per_unit: '', count: 1, occupancy_sensor: '', daylight_control: '', schedule_control: '', initial_illuminance: '' });
const emptyHotWater = () => ({ system_name: '', use_type: '', source_name: '', count: 1, heating_capacity: '', power_consumption: '', fuel_consumption: '', insulation_level: '', water_saving: '' });
const emptyElevator = () => ({ name: '', control_type: '' });
const emptySolarPV = () => ({ system_name: '', cell_type: '', installation_mode: '', capacity_kw: '', panel_direction: '', panel_angle: '' });
const emptyCogen = () => ({ name: '', rated_output: '', count: 1, gen_eff_100: '', gen_eff_75: '', gen_eff_50: '', heat_eff_100: '', heat_eff_75: '', heat_eff_50: '', heat_recovery_for: '' });

// ── ヘルパーコンポーネント ──────────────────────────────────────────

function Select({ value, onChange, options, placeholder, className = '' }) {
  return (
    <select value={value || ''} onChange={e => onChange(e.target.value)} className={`w-full p-2 border border-primary-300 rounded-lg focus:ring-2 focus:ring-accent-400 focus:border-accent-400 ${className}`}>
      <option value="">{placeholder || '選択してください'}</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function NumInput({ value, onChange, placeholder, unit, step = 'any', min = '0', className = '' }) {
  return (
    <div className="flex items-center gap-2">
      <input type="number" value={value || ''} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} step={step} min={min}
        className={`flex-1 p-2 border border-primary-300 rounded-lg focus:ring-2 focus:ring-accent-400 focus:border-accent-400 ${className}`} />
      {unit && <span className="text-xs text-primary-500 whitespace-nowrap">{unit}</span>}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, className = '' }) {
  return (
    <input type="text" value={value || ''} onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full p-2 border border-primary-300 rounded-lg focus:ring-2 focus:ring-accent-400 focus:border-accent-400 ${className}`} />
  );
}

function FieldError({ message }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-600">{message}</p>;
}

function TableRowControls({ onAdd, onRemove, canRemove }) {
  return (
    <div className="flex gap-2 mt-2">
      <button type="button" onClick={onAdd} className="text-sm text-accent-600 hover:text-accent-700 font-medium">+ 行を追加</button>
      {canRemove && <button type="button" onClick={onRemove} className="text-sm text-red-500 hover:text-red-600 font-medium">- この行を削除</button>}
    </div>
  );
}

// ── ステップ定義 ──────────────────────────────────────────────

const STEPS = [
  { id: 1, label: '基本情報', shortLabel: 'A', icon: FaBuilding, form: 'A' },
  { id: 2, label: '開口部', shortLabel: 'B1', icon: FaThermometerHalf, form: 'B1' },
  { id: 3, label: '断熱', shortLabel: 'B2', icon: FaThermometerHalf, form: 'B2' },
  { id: 4, label: '外皮', shortLabel: 'B3', icon: FaBuilding, form: 'B3' },
  { id: 5, label: '空調', shortLabel: 'C', icon: FaFan, form: 'C' },
  { id: 6, label: '換気', shortLabel: 'D', icon: FaWind, form: 'D' },
  { id: 7, label: '照明', shortLabel: 'E', icon: FaLightbulb, form: 'E' },
  { id: 8, label: '給湯', shortLabel: 'F', icon: FaShower, form: 'F' },
  { id: 9, label: '昇降機・再エネ', shortLabel: 'G-I', icon: FaSolarPanel, form: 'GHI' },
  { id: 10, label: '確認・出力', shortLabel: '出力', icon: FaFilePdf, form: 'output' },
];

// ── メインコンポーネント ──────────────────────────────────────────

export default function OfficialBEI() {
  const [step, setStep] = useState(1);
  const [building, setBuilding] = useState({ ...emptyBuilding });
  const [windows, setWindows] = useState([emptyWindow()]);
  const [insulations, setInsulations] = useState([emptyInsulation()]);
  const [envelopes, setEnvelopes] = useState([emptyEnvelope()]);
  const [heatSources, setHeatSources] = useState([emptyHeatSource()]);
  const [outdoorAir, setOutdoorAir] = useState([emptyOutdoorAir()]);
  const [pumps, setPumps] = useState([emptyPump()]);
  const [fans, setFans] = useState([emptyFan()]);
  const [ventilations, setVentilations] = useState([emptyVentilation()]);
  const [lightings, setLightings] = useState([emptyLighting()]);
  const [hotWaters, setHotWaters] = useState([emptyHotWater()]);
  const [elevators, setElevators] = useState([emptyElevator()]);
  const [solarPVs, setSolarPVs] = useState([emptySolarPV()]);
  const [cogenerations, setCogenerations] = useState([emptyCogen()]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [computeResult, setComputeResult] = useState(null);

  const isSmall = parseFloat(building.calc_floor_area) > 0 && parseFloat(building.calc_floor_area) < 300;

  // 配列フィールドの汎用更新ヘルパー
  const updateRow = useCallback((setter, index, field, value) => {
    setter(prev => prev.map((row, i) => i === index ? { ...row, [field]: value } : row));
  }, []);
  const addRow = useCallback((setter, factory) => { setter(prev => [...prev, factory()]); }, []);
  const removeRow = useCallback((setter, index) => { setter(prev => prev.filter((_, i) => i !== index)); }, []);

  const getFieldError = useCallback((path) => fieldErrors[path], [fieldErrors]);

  const clearFieldError = useCallback((path) => {
    setFieldErrors((prev) => {
      if (!prev[path]) return prev;
      const next = { ...prev };
      delete next[path];
      return next;
    });
  }, []);

  const updateBuildingField = useCallback((field, value) => {
    setBuilding((prev) => ({ ...prev, [field]: value }));
    clearFieldError(`building.${field}`);
  }, [clearFieldError]);

  const updateTableField = useCallback((setter, errorPrefix, index, field, value) => {
    updateRow(setter, index, field, value);
    clearFieldError(`${errorPrefix}.${index}.${field}`);
  }, [updateRow, clearFieldError]);

  const inputClass = useCallback(
    (path) => getFieldError(path) ? 'border-red-400 focus:ring-red-200 focus:border-red-400' : '',
    [getFieldError]
  );

  const moveToStepFromPath = useCallback((path) => {
    const target = getStepFromFieldPath(path);
    if (target && target !== step) {
      setStep(target);
    }
  }, [step]);

  const appendError = useCallback((errors, path, message) => {
    if (!errors[path]) {
      errors[path] = message;
    }
  }, []);

  const validateBeforeSubmit = useCallback(() => {
    const errors = {};

    const requireBuilding = (key, label) => {
      if (isBlank(building[key])) {
        appendError(errors, `building.${key}`, `${label}は必須です。`);
      }
    };

    requireBuilding('building_name', '建物名称');
    requireBuilding('region', '省エネ基準地域区分');
    requireBuilding('building_type', '建物用途');
    requireBuilding('calc_floor_area', '計算対象床面積');

    const floorArea = parseFloat(building.calc_floor_area);
    if (!isBlank(building.calc_floor_area) && (Number.isNaN(floorArea) || floorArea <= 0)) {
      appendError(errors, 'building.calc_floor_area', '計算対象床面積は0より大きい数値を入力してください。');
    }

    const requireTableFields = (rows, prefix, required) => {
      rows.forEach((row, index) => {
        if (!hasAnyRowValue(row)) return;
        required.forEach(({ key, label }) => {
          if (isBlank(row[key])) {
            appendError(errors, `${prefix}.${index}.${key}`, `${label}は必須です。`);
          }
        });
      });
    };

    requireTableFields(windows, 'windows', [
      { key: 'name', label: '建具仕様名称' },
      { key: 'window_type', label: '建具の種類' },
    ]);
    windows.forEach((row, index) => {
      if (!hasAnyRowValue(row)) return;
      const area = parseFloat(row.area);
      const width = parseFloat(row.width);
      const height = parseFloat(row.height);
      const hasArea = !Number.isNaN(area) && area > 0;
      const hasWidthHeight = !Number.isNaN(width) && width > 0 && !Number.isNaN(height) && height > 0;
      if (!hasArea && !hasWidthHeight) {
        appendError(errors, `windows.${index}.area`, '窓面積、または幅・高さを入力してください。');
      }
    });

    requireTableFields(insulations, 'insulations', [
      { key: 'name', label: '断熱仕様名称' },
      { key: 'part_class', label: '部位種別' },
      { key: 'input_method', label: '入力方法' },
    ]);

    if (!isSmall) {
      requireTableFields(envelopes, 'envelopes', [
        { key: 'name', label: '外皮名称' },
        { key: 'direction', label: '方位' },
      ]);
      envelopes.forEach((row, index) => {
        if (!hasAnyRowValue(row)) return;
        const area = parseFloat(row.area);
        const width = parseFloat(row.width);
        const height = parseFloat(row.height);
        const hasArea = !Number.isNaN(area) && area > 0;
        const hasWidthHeight = !Number.isNaN(width) && width > 0 && !Number.isNaN(height) && height > 0;
        if (!hasArea && !hasWidthHeight) {
          appendError(errors, `envelopes.${index}.area`, '外皮面積、または幅・高さを入力してください。');
        }
      });
    }

    requireTableFields(heatSources, 'heat_sources', [{ key: 'type', label: '熱源機種' }]);
    requireTableFields(ventilations, 'ventilations', [
      { key: 'room_name', label: '室名称' },
      { key: 'room_type', label: '室用途' },
    ]);
    requireTableFields(lightings, 'lightings', [
      { key: 'room_name', label: '室名称' },
      { key: 'room_type', label: '室用途' },
    ]);
    requireTableFields(hotWaters, 'hot_waters', [
      { key: 'system_name', label: '給湯系統名称' },
      { key: 'use_type', label: '給湯用途' },
    ]);
    requireTableFields(solarPVs, 'solar_pvs', [
      { key: 'cell_type', label: '太陽電池の種類' },
      { key: 'capacity_kw', label: 'システム容量' },
    ]);
    if (!isSmall) {
      requireTableFields(elevators, 'elevators', [{ key: 'control_type', label: '速度制御方式' }]);
      requireTableFields(cogenerations, 'cogenerations', [{ key: 'rated_output', label: '定格発電出力' }]);
    }

    setFieldErrors(errors);
    const firstPath = Object.keys(errors)[0];
    if (firstPath) {
      moveToStepFromPath(firstPath);
      setError(REQUIRED_INPUT_MESSAGE);
      setComputeResult(null);
      return false;
    }

    return true;
  }, [
    building,
    windows,
    insulations,
    envelopes,
    heatSources,
    ventilations,
    lightings,
    hotWaters,
    solarPVs,
    elevators,
    cogenerations,
    isSmall,
    appendError,
    moveToStepFromPath,
  ]);

  // 数値変換ユーティリティ
  const num = (v) => { const n = parseFloat(v); return isNaN(n) ? undefined : n; };
  const int = (v) => { const n = parseInt(v, 10); return isNaN(n) ? undefined : n; };
  const str = (v) => v || undefined;

  // API送信用データ構築
  const buildPayload = () => {
    const official_input = {
      building: {
        building_name: str(building.building_name),
        region: building.region,
        solar_region: str(building.solar_region),
        building_type: building.building_type,
        room_type: str(building.room_type),
        calc_floor_area: num(building.calc_floor_area),
        ac_floor_area: num(building.ac_floor_area),
        total_area: num(building.total_area),
        prefecture: str(building.prefecture),
        city: str(building.city),
        floors_above: int(building.floors_above),
        floors_below: int(building.floors_below),
        total_height: num(building.total_height),
        perimeter: num(building.perimeter),
        non_ac_core_direction: str(building.non_ac_core_direction),
        non_ac_core_length: num(building.non_ac_core_length),
      },
      windows: windows.filter(w => w.name || w.window_type).map(w => ({
        name: str(w.name), width: num(w.width), height: num(w.height), area: num(w.area),
        window_type: str(w.window_type), glass_type: str(w.glass_type),
        glass_u_value: num(w.glass_u_value), glass_shgc: num(w.glass_shgc),
        window_u_value: num(w.window_u_value), window_shgc: num(w.window_shgc),
      })),
      insulations: insulations.filter(i => i.name || i.part_class).map(i => ({
        name: str(i.name), part_class: str(i.part_class), input_method: str(i.input_method),
        material_category: str(i.material_category), material_detail: str(i.material_detail),
        conductivity: num(i.conductivity), thickness: num(i.thickness), u_value: num(i.u_value),
      })),
      envelopes: isSmall ? [] : envelopes.filter(e => e.name || e.direction).map(e => ({
        name: str(e.name), direction: str(e.direction), width: num(e.width), height: num(e.height),
        area: num(e.area), insulation_name: str(e.insulation_name), window_name: str(e.window_name),
        window_count: int(e.window_count), has_blind: str(e.has_blind),
        shade_coeff_cooling: num(e.shade_coeff_cooling), shade_coeff_heating: num(e.shade_coeff_heating),
      })),
      heat_sources: heatSources.filter(h => h.type).map(h => ({
        name: str(h.name), type: h.type, count: int(h.count) || 1,
        capacity_cooling: num(h.capacity_cooling), capacity_heating: num(h.capacity_heating),
        power_cooling: num(h.power_cooling), power_heating: num(h.power_heating),
        fuel_cooling: num(h.fuel_cooling), fuel_heating: num(h.fuel_heating),
      })),
      outdoor_air: outdoorAir.filter(o => o.name || o.supply_airflow).map(o => ({
        name: str(o.name), count: int(o.count) || 1,
        supply_airflow: num(o.supply_airflow), exhaust_airflow: num(o.exhaust_airflow),
        heat_exchange_eff_cooling: num(o.heat_exchange_eff_cooling), heat_exchange_eff_heating: num(o.heat_exchange_eff_heating),
        auto_bypass: str(o.auto_bypass), preheat_stop: str(o.preheat_stop),
      })),
      pumps: isSmall ? [] : pumps.filter(p => p.name || p.flow_rate).map(p => ({
        name: str(p.name), count: int(p.count) || 1, flow_rate: num(p.flow_rate),
        variable_flow: str(p.variable_flow), min_flow_input: str(p.min_flow_input), min_flow_ratio: num(p.min_flow_ratio),
      })),
      fans: isSmall ? [] : fans.filter(f => f.name || f.airflow).map(f => ({
        name: str(f.name), count: int(f.count) || 1, airflow: num(f.airflow),
        variable_airflow: str(f.variable_airflow), min_airflow_input: str(f.min_airflow_input), min_airflow_ratio: num(f.min_airflow_ratio),
      })),
      ventilations: ventilations.filter(v => v.room_name || v.room_type).map(v => ({
        room_name: str(v.room_name), room_type: v.room_type, floor_area: num(v.floor_area),
        method: str(v.method), equipment_name: str(v.equipment_name), count: int(v.count) || 1,
        airflow: num(v.airflow), motor_power: num(v.motor_power),
        high_eff_motor: str(v.high_eff_motor), inverter: str(v.inverter), airflow_control: str(v.airflow_control),
      })),
      lightings: lightings.filter(l => l.room_name || l.room_type).map(l => ({
        room_name: str(l.room_name), room_type: str(l.room_type), floor_area: num(l.floor_area),
        room_height: num(l.room_height), fixture_name: str(l.fixture_name),
        power_per_unit: num(l.power_per_unit), count: int(l.count) || 1,
        occupancy_sensor: str(l.occupancy_sensor), daylight_control: str(l.daylight_control),
        schedule_control: str(l.schedule_control), initial_illuminance: str(l.initial_illuminance),
      })),
      hot_waters: hotWaters.filter(h => h.system_name || h.use_type).map(h => ({
        system_name: str(h.system_name), use_type: h.use_type, source_name: str(h.source_name),
        count: int(h.count) || 1, heating_capacity: num(h.heating_capacity),
        power_consumption: num(h.power_consumption), fuel_consumption: num(h.fuel_consumption),
        insulation_level: str(h.insulation_level), water_saving: str(h.water_saving),
      })),
      elevators: isSmall ? [] : elevators.filter(e => e.control_type).map(e => ({
        name: str(e.name), control_type: e.control_type,
      })),
      solar_pvs: solarPVs.filter(s => s.cell_type && s.capacity_kw).map(s => ({
        system_name: str(s.system_name), cell_type: s.cell_type, installation_mode: s.installation_mode,
        capacity_kw: num(s.capacity_kw), panel_direction: s.panel_direction, panel_angle: s.panel_angle,
      })),
      cogenerations: isSmall ? [] : cogenerations.filter(c => c.rated_output).map(c => ({
        name: str(c.name), rated_output: num(c.rated_output), count: int(c.count) || 1,
        gen_eff_100: num(c.gen_eff_100), gen_eff_75: num(c.gen_eff_75), gen_eff_50: num(c.gen_eff_50),
        heat_eff_100: num(c.heat_eff_100), heat_eff_75: num(c.heat_eff_75), heat_eff_50: num(c.heat_eff_50),
        heat_recovery_for: str(c.heat_recovery_for),
      })),
    };

    return {
      building_area_m2: num(building.calc_floor_area) || 1000,
      design_energy: [{ category: 'lighting', value: 1, unit: 'MJ' }], // ダミー（後方互換）
      official_input,
    };
  };

  const normalizeOfficialError = (detail) => {
    if (typeof detail !== 'string') return detail;
    if (
      detail.includes('小規模版（SMALLMODEL）原本Excelの直接アップロードは未対応です') ||
      detail.includes('様式A 基本情報 は必ずアップロードしてください。')
    ) {
      return SMALLMODEL_UPLOAD_MESSAGE;
    }
    return detail;
  };

  const moveToStepFromApiError = useCallback((detail) => {
    if (typeof detail !== 'string') return;
    const formStepMap = [
      ['様式A', 1],
      ['様式B1', 2],
      ['様式B2', 3],
      ['様式B3', 4],
      ['様式C', 5],
      ['様式D', 6],
      ['様式E', 7],
      ['様式F', 8],
      ['様式G', 9],
      ['様式H', 9],
      ['様式I', 9],
    ];
    const hit = formStepMap.find(([formKey]) => detail.includes(formKey));
    if (hit) {
      setStep(hit[1]);
    }
  }, []);

  const handleCompute = async () => {
    setError(null);
    if (!validateBeforeSubmit()) return;
    setIsLoading(true);
    try {
      const payload = buildPayload();
      const res = await officialAPI.getCompute(payload);
      setComputeResult(res.data);
      setFieldErrors({});
    } catch (e) {
      const detail = e.response?.data?.detail || e.message;
      moveToStepFromApiError(String(detail || ''));
      setError(`公式計算エラー: ${normalizeOfficialError(detail)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    setError(null);
    if (!validateBeforeSubmit()) return;
    setIsLoading(true);
    try {
      const payload = buildPayload();
      const res = await officialAPI.getReport(payload);
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `official_report_${building.building_name || 'output'}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      const detail = e.response?.data?.detail || e.message;
      moveToStepFromApiError(String(detail || ''));
      setError(`公式PDF生成エラー: ${normalizeOfficialError(detail)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadExcel = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await officialAPI.uploadExcelForReport(file);
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `${file.name.replace(/\.\w+$/, '')}_official_report.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e2) {
      const detail = e2.response?.data?.detail || e2.message;
      setError(`Excelアップロードエラー: ${normalizeOfficialError(detail)}`);
    } finally {
      setIsLoading(false);
      e.target.value = '';
    }
  };

  const next = () => setStep(s => Math.min(s + 1, STEPS.length));
  const prev = () => setStep(s => Math.max(s - 1, 1));

  // ── レンダリング: 各ステップ ──────────────────────────────────

  const renderFormA = () => (
    <FormSection title="様式A: 建物基本情報" icon={FaBuilding}>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-primary-700 mb-1">建物名称 *</label>
          <TextInput
            value={building.building_name}
            onChange={(v) => updateBuildingField('building_name', v)}
            placeholder="例: ○○ビル"
            className={inputClass('building.building_name')}
          />
          <FieldError message={getFieldError('building.building_name')} />
        </div>
        <div>
          <label className="block text-sm font-medium text-primary-700 mb-1">省エネ基準地域区分 *</label>
          <Select
            value={building.region}
            onChange={(v) => updateBuildingField('region', v)}
            options={REGIONS}
            className={inputClass('building.region')}
          />
          <FieldError message={getFieldError('building.region')} />
        </div>
        <div>
          <label className="block text-sm font-medium text-primary-700 mb-1">建物用途 *</label>
          <Select
            value={building.building_type}
            onChange={(v) => updateBuildingField('building_type', v)}
            options={BUILDING_TYPES}
            className={inputClass('building.building_type')}
          />
          <FieldError message={getFieldError('building.building_type')} />
        </div>
        <div>
          <label className="block text-sm font-medium text-primary-700 mb-1">計算対象床面積 [m2] *</label>
          <NumInput
            value={building.calc_floor_area}
            onChange={(v) => updateBuildingField('calc_floor_area', v)}
            placeholder="1000"
            unit="m2"
            className={inputClass('building.calc_floor_area')}
          />
          <FieldError message={getFieldError('building.calc_floor_area')} />
        </div>
        <div>
          <label className="block text-sm font-medium text-primary-700 mb-1">空調対象床面積 [m2]</label>
          <NumInput value={building.ac_floor_area} onChange={(v) => updateBuildingField('ac_floor_area', v)} placeholder="" unit="m2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-primary-700 mb-1">延べ面積 [m2]</label>
          <NumInput value={building.total_area} onChange={(v) => updateBuildingField('total_area', v)} placeholder="" unit="m2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-primary-700 mb-1">都道府県</label>
          <TextInput value={building.prefecture} onChange={(v) => updateBuildingField('prefecture', v)} placeholder="東京都" />
        </div>
        <div>
          <label className="block text-sm font-medium text-primary-700 mb-1">市区町村</label>
          <TextInput value={building.city} onChange={(v) => updateBuildingField('city', v)} placeholder="千代田区" />
        </div>
        <div>
          <label className="block text-sm font-medium text-primary-700 mb-1">階数（地上）</label>
          <NumInput value={building.floors_above} onChange={(v) => updateBuildingField('floors_above', v)} placeholder="3" step="1" />
        </div>
        <div>
          <label className="block text-sm font-medium text-primary-700 mb-1">階数（地下）</label>
          <NumInput value={building.floors_below} onChange={(v) => updateBuildingField('floors_below', v)} placeholder="0" step="1" />
        </div>
        <div>
          <label className="block text-sm font-medium text-primary-700 mb-1">階高の合計 [m]</label>
          <NumInput value={building.total_height} onChange={(v) => updateBuildingField('total_height', v)} placeholder="" unit="m" />
        </div>
        <div>
          <label className="block text-sm font-medium text-primary-700 mb-1">外周長さ [m]</label>
          <NumInput value={building.perimeter} onChange={(v) => updateBuildingField('perimeter', v)} placeholder="" unit="m" />
        </div>
        <div>
          <label className="block text-sm font-medium text-primary-700 mb-1">年間日射地域区分</label>
          <Select
            value={building.solar_region}
            onChange={(v) => updateBuildingField('solar_region', v)}
            options={SOLAR_REGIONS}
            placeholder="太陽光発電がある場合のみ"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-primary-700 mb-1">非空調コア部 方位</label>
          <Select
            value={building.non_ac_core_direction}
            onChange={(v) => updateBuildingField('non_ac_core_direction', v)}
            options={DIRECTIONS}
          />
        </div>
      </div>
      <div className="mt-4 bg-primary-50 border border-primary-200 rounded-lg p-3 text-xs text-primary-700">
        必須入力: 「建物名称」「省エネ基準地域区分」「建物用途」「計算対象床面積」。
      </div>
      {isSmall && (
        <div className="mt-4 bg-accent-50 border border-accent-200 rounded-lg p-3 text-sm text-accent-700">
          300m2未満のため、小規模版テンプレート(SMALLMODEL)が使用されます。
          様式B3(外皮)、C3(ポンプ)、C4(送風機)、G(昇降機)、I(コージェネ)は省略されます。
        </div>
      )}
    </FormSection>
  );

  const renderTableForm = (title, icon, items, setter, factory, fields, errorPrefix) => (
    <FormSection title={title} icon={icon}>
      {items.map((item, i) => (
        <div key={i} className="border border-primary-200 rounded-lg p-4 mb-3">
          <div className="text-sm font-medium text-primary-600 mb-3">#{i + 1}</div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {fields.map(({ key, label, type, options, unit, placeholder }) => (
              <div key={key}>
                <label className="block text-xs font-medium text-primary-600 mb-1">{label}</label>
                {(() => {
                  const path = `${errorPrefix}.${i}.${key}`;
                  const message = getFieldError(path);
                  if (type === 'select') {
                    return (
                      <>
                        <Select
                          value={item[key]}
                          onChange={(v) => updateTableField(setter, errorPrefix, i, key, v)}
                          options={options}
                          className={message ? 'border-red-400 focus:ring-red-200 focus:border-red-400' : ''}
                        />
                        <FieldError message={message} />
                      </>
                    );
                  }
                  if (type === 'number') {
                    return (
                      <>
                        <NumInput
                          value={item[key]}
                          onChange={(v) => updateTableField(setter, errorPrefix, i, key, v)}
                          unit={unit}
                          placeholder={placeholder}
                          className={message ? 'border-red-400 focus:ring-red-200 focus:border-red-400' : ''}
                        />
                        <FieldError message={message} />
                      </>
                    );
                  }
                  return (
                    <>
                      <TextInput
                        value={item[key]}
                        onChange={(v) => updateTableField(setter, errorPrefix, i, key, v)}
                        placeholder={placeholder}
                        className={message ? 'border-red-400 focus:ring-red-200 focus:border-red-400' : ''}
                      />
                      <FieldError message={message} />
                    </>
                  );
                })()}
              </div>
            ))}
          </div>
          <TableRowControls
            onAdd={() => addRow(setter, factory)}
            onRemove={() => removeRow(setter, i)}
            canRemove={items.length > 1}
          />
        </div>
      ))}
      {items.length === 0 && (
        <button type="button" onClick={() => addRow(setter, factory)} className="text-sm text-accent-600 hover:text-accent-700 font-medium">+ 行を追加</button>
      )}
    </FormSection>
  );

  const renderOutput = () => (
    <FormSection title="確認・公式PDF出力" icon={FaFilePdf}>
      <div className="space-y-4">
        {Object.keys(fieldErrors).length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-semibold text-red-800 mb-2">入力不足項目</h4>
            <ul className="text-sm text-red-700 space-y-1">
              {Object.entries(fieldErrors).slice(0, 8).map(([path, message]) => (
                <li key={path}>・{message}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="bg-warm-50 border border-primary-200 rounded-lg p-4">
          <h3 className="font-semibold text-primary-800 mb-2">入力内容サマリー</h3>
          <div className="grid md:grid-cols-2 gap-2 text-sm text-primary-700">
            <div>建物名称: <strong>{building.building_name || '-'}</strong></div>
            <div>地域区分: <strong>{building.region || '-'}</strong></div>
            <div>建物用途: <strong>{building.building_type || '-'}</strong></div>
            <div>計算対象床面積: <strong>{building.calc_floor_area || '-'} m2</strong></div>
            <div>テンプレート: <strong>{isSmall ? '小規模版 (SMALLMODEL)' : '通常版 (MODEL)'}</strong></div>
            <div>開口部: <strong>{windows.filter(w => w.name || w.window_type).length}件</strong></div>
            <div>断熱仕様: <strong>{insulations.filter(i => i.name || i.part_class).length}件</strong></div>
            <div>空調熱源: <strong>{heatSources.filter(h => h.type).length}件</strong></div>
            <div>換気設備: <strong>{ventilations.filter(v => v.room_name || v.room_type).length}件</strong></div>
            <div>照明設備: <strong>{lightings.filter(l => l.room_name || l.room_type).length}件</strong></div>
            <div>給湯設備: <strong>{hotWaters.filter(h => h.system_name || h.use_type).length}件</strong></div>
            <div>太陽光: <strong>{solarPVs.filter(s => s.cell_type && s.capacity_kw).length}件</strong></div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <button type="button" onClick={handleCompute} disabled={isLoading}
            className="bg-primary-700 hover:bg-primary-800 disabled:opacity-50 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2">
            <FaCalculator /> {isLoading ? '計算中...' : '公式計算実行'}
          </button>
          <button type="button" onClick={handleDownloadPDF} disabled={isLoading}
            className="bg-accent-500 hover:bg-accent-600 disabled:opacity-50 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2">
            <FaFilePdf /> {isLoading ? '生成中...' : '公式PDF出力'}
          </button>
        </div>

        <div className="border-t border-primary-200 pt-4">
          <h4 className="font-medium text-primary-700 mb-2">Excelファイルを直接アップロードして公式PDFを取得</h4>
          <label className="flex items-center gap-2 bg-warm-50 border border-primary-200 rounded-lg p-4 cursor-pointer hover:bg-warm-100 transition-colors">
            <FaUpload className="text-primary-500" />
            <span className="text-sm text-primary-700">記入済みExcelをアップロード (.xlsx / .xlsm)</span>
            <input type="file" accept=".xlsx,.xlsm" onChange={handleUploadExcel} className="hidden" />
          </label>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-2">
            <FaExclamationTriangle className="text-red-500 mt-0.5 flex-shrink-0" />
            <span className="text-sm text-red-800">{error}</span>
          </div>
        )}

        {computeResult && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
            <h4 className="font-semibold text-green-800 flex items-center gap-2">
              <FaCheckCircle /> 公式計算結果
            </h4>
            <div className="grid md:grid-cols-2 gap-2 text-sm text-green-900">
              <div>
                総合ステータス:
                <strong className="ml-1">{computeResult?.Status || 'N/A'}</strong>
              </div>
              <div>
                基本情報バリデーション:
                <strong className="ml-1">
                  {computeResult?.BasicInformationValidationResult?.IsValid ? 'OK' : '要修正'}
                </strong>
              </div>
            </div>
            {Array.isArray(computeResult?.BasicInformationValidationResult?.Errors) &&
              computeResult.BasicInformationValidationResult.Errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-red-800 mb-1">基本情報エラー</p>
                  <ul className="text-sm text-red-700 space-y-1">
                    {computeResult.BasicInformationValidationResult.Errors.slice(0, 5).map((item, index) => (
                      <li key={`${item?.Message || 'err'}-${index}`}>・{item?.Message || '入力内容を確認してください。'}</li>
                    ))}
                  </ul>
                </div>
              )}
            <pre className="text-xs text-green-900 overflow-auto max-h-64 bg-white rounded p-3">
              {JSON.stringify(computeResult, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </FormSection>
  );

  const renderCurrentStep = () => {
    switch (step) {
      case 1: return renderFormA();
      case 2: return renderTableForm('様式B1: 開口部仕様', FaThermometerHalf, windows, setWindows, emptyWindow, [
        { key: 'name', label: '建具仕様名称', type: 'text', placeholder: '窓-1' },
        { key: 'width', label: '幅 W', type: 'number', unit: 'm' },
        { key: 'height', label: '高さ H', type: 'number', unit: 'm' },
        { key: 'area', label: '窓面積', type: 'number', unit: 'm2' },
        { key: 'window_type', label: '建具の種類', type: 'select', options: WINDOW_TYPES },
        { key: 'window_u_value', label: '窓 熱貫流率', type: 'number', unit: 'W/(m2K)' },
        { key: 'window_shgc', label: '窓 日射熱取得率', type: 'number', unit: '-' },
      ], 'windows');
      case 3: return renderTableForm('様式B2: 断熱仕様', FaThermometerHalf, insulations, setInsulations, emptyInsulation, [
        { key: 'name', label: '断熱仕様名称', type: 'text', placeholder: '断熱-1' },
        { key: 'part_class', label: '部位種別', type: 'select', options: PART_CLASSES },
        { key: 'input_method', label: '入力方法', type: 'select', options: INSULATION_INPUT_METHODS },
        { key: 'material_category', label: '断熱材種類(大分類)', type: 'select', options: INSULATION_MATERIALS },
        { key: 'thickness', label: '厚み', type: 'number', unit: 'mm' },
        { key: 'u_value', label: '熱貫流率', type: 'number', unit: 'W/(m2K)' },
      ], 'insulations');
      case 4:
        if (isSmall) return (
          <FormSection title="様式B3: 外皮仕様" icon={FaBuilding}>
            <div className="bg-warm-50 border border-primary-200 rounded-lg p-4 text-sm text-primary-600">
              300m2未満の小規模建築物では、様式B3(外皮仕様)の入力は不要です。
            </div>
          </FormSection>
        );
        return renderTableForm('様式B3: 外皮仕様', FaBuilding, envelopes, setEnvelopes, emptyEnvelope, [
          { key: 'name', label: '外皮名称', type: 'text', placeholder: '北面壁-1' },
          { key: 'direction', label: '方位', type: 'select', options: ENVELOPE_DIRECTIONS },
          { key: 'width', label: '幅 W', type: 'number', unit: 'm' },
          { key: 'height', label: '高さ H', type: 'number', unit: 'm' },
          { key: 'area', label: '外皮面積', type: 'number', unit: 'm2' },
          { key: 'insulation_name', label: '断熱仕様名称', type: 'text', placeholder: 'B2から転記' },
          { key: 'window_name', label: '建具仕様名称', type: 'text', placeholder: 'B1から転記' },
          { key: 'window_count', label: '建具等個数', type: 'number' },
          { key: 'has_blind', label: 'ブラインド', type: 'select', options: BOOLEAN_LIST },
          { key: 'shade_coeff_cooling', label: '日除け係数(冷房)', type: 'number' },
          { key: 'shade_coeff_heating', label: '日除け係数(暖房)', type: 'number' },
        ], 'envelopes');
      case 5: return (
        <>
          {renderTableForm('様式C1: 空調熱源', FaFan, heatSources, setHeatSources, emptyHeatSource, [
            { key: 'name', label: '熱源機器名称', type: 'text', placeholder: 'PAC-1' },
            { key: 'type', label: '熱源機種', type: 'select', options: HEAT_SOURCE_TYPES },
            { key: 'count', label: '台数', type: 'number', placeholder: '1' },
            { key: 'capacity_cooling', label: '定格能力 冷房', type: 'number', unit: 'kW/台' },
            { key: 'capacity_heating', label: '定格能力 暖房', type: 'number', unit: 'kW/台' },
            { key: 'power_cooling', label: '消費電力 冷房', type: 'number', unit: 'kW/台' },
            { key: 'power_heating', label: '消費電力 暖房', type: 'number', unit: 'kW/台' },
          ], 'heat_sources')}
          {renderTableForm('様式C2: 空調外気処理', FaWind, outdoorAir, setOutdoorAir, emptyOutdoorAir, [
            { key: 'name', label: '送風機名称', type: 'text', placeholder: 'OA-1' },
            { key: 'count', label: '台数', type: 'number', placeholder: '1' },
            { key: 'supply_airflow', label: '給気風量', type: 'number', unit: 'm3/h/台' },
            { key: 'exhaust_airflow', label: '排気風量', type: 'number', unit: 'm3/h/台' },
            { key: 'heat_exchange_eff_cooling', label: '全熱交換効率 冷房', type: 'number', unit: '%' },
            { key: 'heat_exchange_eff_heating', label: '全熱交換効率 暖房', type: 'number', unit: '%' },
            { key: 'auto_bypass', label: '自動換気切替', type: 'select', options: BOOLEAN_LIST },
            { key: 'preheat_stop', label: '予熱時外気停止', type: 'select', options: BOOLEAN_LIST },
          ], 'outdoor_air')}
          {!isSmall && renderTableForm('様式C3: 空調二次ポンプ', FaCogs, pumps, setPumps, emptyPump, [
            { key: 'name', label: 'ポンプ名称', type: 'text' },
            { key: 'count', label: '台数', type: 'number', placeholder: '1' },
            { key: 'flow_rate', label: '設計流量', type: 'number', unit: 'm3/h台' },
            { key: 'variable_flow', label: '変流量制御', type: 'select', options: BOOLEAN_LIST },
          ], 'pumps')}
          {!isSmall && renderTableForm('様式C4: 空調送風機', FaFan, fans, setFans, emptyFan, [
            { key: 'name', label: '送風機名称', type: 'text' },
            { key: 'count', label: '台数', type: 'number', placeholder: '1' },
            { key: 'airflow', label: '設計風量', type: 'number', unit: 'm3/h台' },
            { key: 'variable_airflow', label: '変風量制御', type: 'select', options: BOOLEAN_LIST },
          ], 'fans')}
        </>
      );
      case 6: return renderTableForm('様式D: 換気', FaWind, ventilations, setVentilations, emptyVentilation, [
        { key: 'room_name', label: '室名称', type: 'text', placeholder: '機械室1' },
        { key: 'room_type', label: '室用途', type: 'select', options: VENT_ROOM_TYPES },
        { key: 'floor_area', label: '床面積', type: 'number', unit: 'm2' },
        { key: 'method', label: '換気方式', type: 'select', options: VENT_METHODS },
        { key: 'equipment_name', label: '機器名称', type: 'text' },
        { key: 'count', label: '台数', type: 'number', placeholder: '1' },
        { key: 'airflow', label: '送風量', type: 'number', unit: 'm3/h台' },
        { key: 'motor_power', label: '電動機出力', type: 'number', unit: 'W/台' },
        { key: 'high_eff_motor', label: '高効率電動機', type: 'select', options: BOOLEAN_LIST },
        { key: 'inverter', label: 'インバーター', type: 'select', options: BOOLEAN_LIST },
        { key: 'airflow_control', label: '送風量制御', type: 'select', options: BOOLEAN_LIST },
      ], 'ventilations');
      case 7: return renderTableForm('様式E: 照明', FaLightbulb, lightings, setLightings, emptyLighting, [
        { key: 'room_name', label: '室名称', type: 'text', placeholder: '事務室1' },
        { key: 'room_type', label: '室用途', type: 'text', placeholder: '事務室' },
        { key: 'floor_area', label: '床面積', type: 'number', unit: 'm2' },
        { key: 'room_height', label: '室の高さ', type: 'number', unit: 'm' },
        { key: 'fixture_name', label: '照明器具名称', type: 'text' },
        { key: 'power_per_unit', label: '消費電力', type: 'number', unit: 'W/台' },
        { key: 'count', label: '台数', type: 'number', placeholder: '1' },
        { key: 'occupancy_sensor', label: '在室検知制御', type: 'select', options: BOOLEAN_LIST },
        { key: 'daylight_control', label: '明るさ制御', type: 'select', options: BOOLEAN_LIST },
        { key: 'schedule_control', label: 'タイムスケジュール', type: 'select', options: BOOLEAN_LIST },
        { key: 'initial_illuminance', label: '初期照度補正', type: 'select', options: BOOLEAN_LIST },
      ], 'lightings');
      case 8: return renderTableForm('様式F: 給湯', FaShower, hotWaters, setHotWaters, emptyHotWater, [
        { key: 'system_name', label: '給湯系統名称', type: 'text', placeholder: '給湯-1' },
        { key: 'use_type', label: '給湯用途', type: 'select', options: HW_USE_TYPES },
        { key: 'source_name', label: '熱源名称', type: 'text' },
        { key: 'count', label: '台数', type: 'number', placeholder: '1' },
        { key: 'heating_capacity', label: '定格加熱能力', type: 'number', unit: 'kW/台' },
        { key: 'power_consumption', label: '定格消費電力', type: 'number', unit: 'kW/台' },
        { key: 'fuel_consumption', label: '定格燃料消費量', type: 'number', unit: 'kW/台' },
        { key: 'insulation_level', label: '配管保温仕様', type: 'select', options: INSULATION_LEVELS },
        { key: 'water_saving', label: '節湯器具', type: 'select', options: WATER_SAVING },
      ], 'hot_waters');
      case 9: return (
        <>
          {!isSmall && renderTableForm('様式G: 昇降機', FaArrowsAltV, elevators, setElevators, emptyElevator, [
            { key: 'name', label: '昇降機名称', type: 'text', placeholder: 'EV-1' },
            { key: 'control_type', label: '速度制御方式', type: 'select', options: ELEVATOR_CONTROLS },
          ], 'elevators')}
          {renderTableForm('様式H: 太陽光発電', FaSolarPanel, solarPVs, setSolarPVs, emptySolarPV, [
            { key: 'system_name', label: 'システム名称', type: 'text', placeholder: 'PV-1' },
            { key: 'cell_type', label: '太陽電池の種類', type: 'select', options: SOLAR_CELL_TYPES },
            { key: 'installation_mode', label: 'アレイ設置方式', type: 'select', options: INSTALL_MODES },
            { key: 'capacity_kw', label: 'システム容量', type: 'number', unit: 'kW' },
            { key: 'panel_direction', label: 'パネル方位角', type: 'select', options: PANEL_DIRECTIONS },
            { key: 'panel_angle', label: 'パネル傾斜角', type: 'select', options: PANEL_ANGLES },
          ], 'solar_pvs')}
          {!isSmall && renderTableForm('様式I: コージェネ', FaCogs, cogenerations, setCogenerations, emptyCogen, [
            { key: 'name', label: '設備名称', type: 'text' },
            { key: 'rated_output', label: '定格発電出力', type: 'number', unit: 'kW/台' },
            { key: 'count', label: '台数', type: 'number', placeholder: '1' },
            { key: 'gen_eff_100', label: '発電効率 100%', type: 'number', unit: '%' },
            { key: 'gen_eff_75', label: '発電効率 75%', type: 'number', unit: '%' },
            { key: 'gen_eff_50', label: '発電効率 50%', type: 'number', unit: '%' },
            { key: 'heat_recovery_for', label: '排熱利用先', type: 'select', options: COGEN_HEAT_RECOVERY },
          ], 'cogenerations')}
        </>
      );
      case 10: return renderOutput();
      default: return null;
    }
  };

  return (
    <CalculatorLayout
      title="公式BEI計算 (様式入力)"
      subtitle="公式入力シート(様式A〜I)に基づく計算 - 国交省公式API経由で公式様式PDFを出力"
      icon={FaCalculator}
      backUrl="/tools"
      backText="計算ツール一覧に戻る"
    >
      <div className="max-w-5xl mx-auto">
        {/* ステップインジケーター */}
        <div className="mb-8 overflow-x-auto">
          <div className="flex items-center min-w-max">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center">
                <button
                  onClick={() => setStep(s.id)}
                  className={`flex flex-col items-center min-w-[60px] ${step === s.id ? 'opacity-100' : 'opacity-60 hover:opacity-80'}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                    step > s.id ? 'bg-green-500 text-white' :
                    step === s.id ? 'bg-accent-500 text-white' :
                    'bg-primary-200 text-primary-600'
                  }`}>
                    {step > s.id ? <FaCheckCircle /> : s.shortLabel}
                  </div>
                  <span className="text-[10px] text-primary-500 mt-1">{s.label}</span>
                </button>
                {i < STEPS.length - 1 && (
                  <div className={`w-6 h-0.5 mx-1 ${step > s.id ? 'bg-green-400' : 'bg-primary-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-2">
            <FaExclamationTriangle className="text-red-500 mt-0.5 flex-shrink-0" />
            <span className="text-sm text-red-800">{error}</span>
          </div>
        )}

        {/* フォーム */}
        {renderCurrentStep()}

        {/* ナビゲーションボタン */}
        <div className="flex justify-between mt-6">
          <button type="button" onClick={prev} disabled={step === 1}
            className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 disabled:opacity-30 text-white font-medium py-2 px-6 rounded-lg transition-colors">
            <FaArrowLeft /> 前へ
          </button>
          {step < STEPS.length ? (
            <button type="button" onClick={next}
              className="flex items-center gap-2 bg-accent-500 hover:bg-accent-600 text-white font-medium py-2 px-6 rounded-lg transition-colors">
              次へ <FaArrowRight />
            </button>
          ) : null}
        </div>
      </div>
    </CalculatorLayout>
  );
}
