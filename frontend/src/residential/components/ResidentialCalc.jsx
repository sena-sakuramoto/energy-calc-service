import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';

import { useAuth } from '../../contexts/FirebaseAuthContext';
import { billingAPI, residentialAPI } from '../../utils/api';
import { computeResidentialResult } from '../engine/buildEnvelope';
import AreaTable from './AreaTable.jsx';
import FloorInput from './FloorInput.jsx';
import InsulationSelector from './InsulationSelector.jsx';
import ResultPanel from './ResultPanel.jsx';
import RoofInput from './RoofInput.jsx';
import ShapeTemplate from './ShapeTemplate.jsx';
import WallSegmentInput from './WallSegmentInput.jsx';
import WindowSchedule from './WindowSchedule.jsx';
import { generateAreaTablePdf } from '../output/pdfAreaTable';
import { generateResidentialCalcReportPdf } from '../output/pdfCalcReport';

const STORAGE_KEY = 'raku_projects';
const BILLING_BYPASS =
  process.env.NEXT_PUBLIC_USE_MOCK === 'true'
  || process.env.NEXT_PUBLIC_E2E_AUTH === 'true'
  || process.env.NODE_ENV !== 'production';

const STRUCTURE_OPTIONS = [
  { value: 'wood_conventional', label: '木造(在来)' },
  { value: 'wood_2x4', label: '木造(2x4)' },
  { value: 'steel', label: '鉄骨造' },
  { value: 'rc', label: 'RC造' },
];

const TAB_ITEMS = [
  { key: 'template', label: '形状テンプレート' },
  { key: 'walls', label: '壁セグメント' },
  { key: 'windows', label: '建具表' },
  { key: 'insulation', label: '断熱' },
  { key: 'roof', label: '屋根' },
  { key: 'floor', label: '床/基礎' },
  { key: 'areas', label: '求積表' },
];

function createDefaultProject() {
  const timestamp = Date.now();
  return {
    id: `res_${timestamp}`,
    name: '新規住宅計算',
    region: 6,
    structure: 'wood_conventional',
    stories: 2,
    walls: [
      {
        id: `wall_n_${timestamp}`,
        orientation: 'N',
        input_method: 'dimensions',
        width: 9.0,
        height: 5.4,
        insulation_type: 'hgw16k',
        insulation_thickness: 105,
        adjacency: 'exterior',
      },
      {
        id: `wall_s_${timestamp}`,
        orientation: 'S',
        input_method: 'dimensions',
        width: 9.0,
        height: 5.4,
        insulation_type: 'hgw16k',
        insulation_thickness: 105,
        adjacency: 'exterior',
      },
      {
        id: `wall_e_${timestamp}`,
        orientation: 'E',
        input_method: 'dimensions',
        width: 6.0,
        height: 5.4,
        insulation_type: 'hgw16k',
        insulation_thickness: 105,
        adjacency: 'exterior',
      },
      {
        id: `wall_w_${timestamp}`,
        orientation: 'W',
        input_method: 'dimensions',
        width: 6.0,
        height: 5.4,
        insulation_type: 'hgw16k',
        insulation_thickness: 105,
        adjacency: 'exterior',
      },
    ],
    openings: [],
    roof: { area: 54, u_value: 0.24, adjacency: 'exterior' },
    ceiling: null,
    floor: { area: 54, u_value: 0.48, adjacency: 'underfloor' },
    foundation: { length: 30, psi_value: 0.6, h_value: 0.7 },
    a_a: 108,
  };
}

function loadStoredProject() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed[0];
    }
  } catch {
    return null;
  }
  return null;
}

function saveProject(project) {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const projects = raw ? JSON.parse(raw) : [];
    const index = projects.findIndex((item) => item.id === project.id);
    if (index >= 0) projects[index] = project;
    else projects.unshift(project);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects.slice(0, 20)));
  } catch {
    // noop
  }
}

function getProductNameById(openings, id) {
  return openings.find((row) => row.id === id)?.product_name || '組み合わせ表';
}

export default function ResidentialCalc() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [project, setProject] = useState(createDefaultProject());
  const [debouncedProject, setDebouncedProject] = useState(project);
  const [activeTab, setActiveTab] = useState('template');
  const [comparison, setComparison] = useState(null);
  const [verifyState, setVerifyState] = useState({ loading: false, message: '' });
  const [billingStatus, setBillingStatus] = useState(
    BILLING_BYPASS ? { active: true, type: 'development_bypass' } : null,
  );

  useEffect(() => {
    const stored = loadStoredProject();
    if (stored) {
      setProject(stored);
      setDebouncedProject(stored);
    }
  }, []);

  useEffect(() => {
    saveProject(project);
  }, [project]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedProject(project), 300);
    return () => clearTimeout(timer);
  }, [project]);

  useEffect(() => {
    let mounted = true;

    if (BILLING_BYPASS) {
      setBillingStatus({ active: true, type: 'development_bypass' });
      return () => {
        mounted = false;
      };
    }

    if (authLoading) {
      return () => {
        mounted = false;
      };
    }

    if (!isAuthenticated || !user?.email) {
      setBillingStatus(null);
      return () => {
        mounted = false;
      };
    }

    const fetchBillingStatus = async () => {
      try {
        const response = await billingAPI.getStatus(user.email);
        if (!mounted) return;
        setBillingStatus(response.data || null);
      } catch {
        if (!mounted) return;
        setBillingStatus({ active: false, reason: 'unavailable' });
      }
    };

    fetchBillingStatus();
    return () => {
      mounted = false;
    };
  }, [authLoading, isAuthenticated, user?.email]);

  const result = useMemo(() => computeResidentialResult(debouncedProject), [debouncedProject]);
  const premiumLocked = !BILLING_BYPASS && !billingStatus?.active;

  const openPremiumFlow = () => {
    const redirect = encodeURIComponent('/residential');
    if (!isAuthenticated) {
      router.push(`/login?redirect=${redirect}`);
      return;
    }
    router.push(`/pricing?redirect=${redirect}`);
  };

  const patchProject = (patch) => {
    setProject((prev) => ({ ...prev, ...patch }));
  };

  const handleOpeningsChange = (nextOpenings) => {
    const before = computeResidentialResult(project);
    const beforeOpenings = project.openings || [];

    setProject((prev) => ({ ...prev, openings: nextOpenings }));

    const afterProject = { ...project, openings: nextOpenings };
    const after = computeResidentialResult(afterProject);

    const changed = nextOpenings.find((opening) => {
      const beforeRow = beforeOpenings.find((item) => item.id === opening.id);
      return beforeRow && beforeRow.product_id !== opening.product_id;
    });

    if (changed) {
      setComparison({
        before_name: getProductNameById(beforeOpenings, changed.id),
        after_name: getProductNameById(nextOpenings, changed.id),
        ua_delta: Number((after.ua_value - before.ua_value).toFixed(2)),
        cost_delta: Math.round((after.window_cost_total || 0) - (before.window_cost_total || 0)),
      });
    }
  };

  const handleVerify = async () => {
    if (premiumLocked) {
      openPremiumFlow();
      return;
    }
    setVerifyState({ loading: true, message: '公式API検証を実行中です...' });

    try {
      const payload = {
        region: project.region,
        a_env: result.envelope_input.a_env,
        a_a: result.envelope_input.a_a,
        parts: result.envelope_input.parts,
        front_result: {
          ua_value: result.ua_value,
          eta_a_c: result.eta_a_c,
        },
      };

      const response = await residentialAPI.verify(payload);
      const data = response?.data || response;
      const comparisonResult = data?.comparison || {};
      const officialComparison = data?.official_comparison || null;
      const localOk = Boolean(comparisonResult.ua_match) && Boolean(comparisonResult.eta_a_c_match);
      const officialOk = officialComparison
        ? Boolean(officialComparison.ua_match) && Boolean(officialComparison.eta_a_c_match)
        : false;
      const ok = localOk && (officialComparison ? officialOk : true);

      const backendResult = data?.backend_result || {};
      const officialResult = data?.official_result || null;

      setVerifyState({
        loading: false,
        ok,
        local_ok: localOk,
        official_ok: officialComparison ? officialOk : null,
        details: {
          front: {
            ua: Number(result.ua_value || 0),
            eta_a_c: Number(result.eta_a_c || 0),
          },
          backend: {
            ua: Number(backendResult.ua_value || 0),
            eta_a_c: Number(backendResult.eta_a_c || 0),
          },
          official: officialResult
            ? {
              ua: Number(officialResult.ua || 0),
              eta_a_c: Number(officialResult.eta_a_c || 0),
              ua_standard: officialResult.ua_standard,
              eta_a_c_standard: officialResult.eta_a_c_standard,
            }
            : null,
          official_error: data?.official_error || null,
        },
        message: data?.message || (ok ? '検証結果は一致しています。' : '検証結果に差異があります。'),
      });
    } catch (error) {
      setVerifyState({
        loading: false,
        ok: false,
        message: `検証に失敗しました: ${error.message}`,
      });
    }
  };

  const handleAreaPdf = async () => {
    if (premiumLocked) {
      openPremiumFlow();
      return;
    }
    await generateAreaTablePdf(project, result);
  };

  const handleCalcPdf = async () => {
    if (premiumLocked) {
      openPremiumFlow();
      return;
    }
    await generateResidentialCalcReportPdf(project, result, verifyState);
  };

  return (
    <div className="space-y-5 pb-36">
      <div className="bg-white border border-warm-200 rounded-2xl p-4 md:p-6">
        <h1 className="text-xl md:text-2xl font-bold text-primary-800">楽々省エネ計算 — 住宅版</h1>
        <p className="text-sm text-primary-500 mt-1">UA値・ηAC値をリアルタイム計算し、審査提出用PDFを出力します。</p>

        <div className="grid md:grid-cols-4 gap-3 mt-4">
          <label className="text-xs md:text-sm">
            案件名
            <input className="input-field mt-1" value={project.name} onChange={(e) => patchProject({ name: e.target.value })} />
          </label>
          <label className="text-xs md:text-sm">
            地域区分
            <select className="input-field mt-1" value={project.region} onChange={(e) => patchProject({ region: Number(e.target.value) })}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((region) => <option key={region} value={region}>{region}地域</option>)}
            </select>
          </label>
          <label className="text-xs md:text-sm">
            構造
            <select className="input-field mt-1" value={project.structure} onChange={(e) => patchProject({ structure: e.target.value })}>
              {STRUCTURE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
          <label className="text-xs md:text-sm">
            階数
            <input type="number" className="input-field mt-1" value={project.stories} onChange={(e) => patchProject({ stories: Number(e.target.value || 1) })} />
          </label>
        </div>
      </div>

      <div className="bg-white border border-warm-200 rounded-2xl p-4 md:p-6 space-y-4">
        <div className="flex flex-wrap gap-2">
          {TAB_ITEMS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`px-3 py-2 rounded-lg text-sm border ${activeTab === tab.key ? 'bg-primary-700 text-white border-primary-700' : 'bg-white text-primary-700 border-warm-200 hover:border-primary-300'}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'template' && (
          <ShapeTemplate
            onApply={(payload) => {
              patchProject({
                walls: payload.walls,
                roof: payload.roof,
                floor: payload.floor,
                foundation: payload.foundation,
                stories: payload.stories,
                a_a: payload.a_a,
              });
            }}
          />
        )}

        {activeTab === 'walls' && (
          <WallSegmentInput
            walls={project.walls}
            openings={project.openings}
            onChange={(nextWalls) => patchProject({ walls: nextWalls })}
          />
        )}

        {activeTab === 'windows' && (
          <WindowSchedule
            openings={project.openings}
            onChange={handleOpeningsChange}
          />
        )}

        {activeTab === 'insulation' && (
          <InsulationSelector
            walls={project.walls}
            onChange={(nextWalls) => patchProject({ walls: nextWalls })}
          />
        )}

        {activeTab === 'roof' && (
          <RoofInput
            roof={project.roof}
            ceiling={project.ceiling}
            onChange={(patch) => patchProject(patch)}
          />
        )}

        {activeTab === 'floor' && (
          <FloorInput
            floor={project.floor}
            foundation={project.foundation}
            onChange={(patch) => patchProject(patch)}
          />
        )}

        {activeTab === 'areas' && <AreaTable result={result} />}
      </div>

      <ResultPanel
        result={result}
        comparison={comparison}
        premiumLocked={premiumLocked}
        verifyState={verifyState}
        onVerify={handleVerify}
        onExportAreaPdf={handleAreaPdf}
        onExportCalcPdf={handleCalcPdf}
        onUnlockPremium={openPremiumFlow}
      />
    </div>
  );
}
