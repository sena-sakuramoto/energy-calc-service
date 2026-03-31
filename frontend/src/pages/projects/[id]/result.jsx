// frontend/src/pages/projects/[id]/result.jsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import CalculatorLayout from '../../../components/CalculatorLayout';
import { projectsAPI, reportAPI } from '../../../utils/api';
import { getProject } from '../../../utils/projectStorage';
import { useNotification } from '../../../components/ErrorAlert';
import Link from 'next/link';
import { FaHome, FaFileDownload, FaFileExcel, FaCheckCircle, FaExclamationTriangle, FaChartPie } from 'react-icons/fa';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

// Chart.jsを初期化
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const normalizeResult = (rawResult) => {
  if (!rawResult) return null;

  if (rawResult.primary_energy_result && rawResult.envelope_result) {
    return rawResult;
  }

  if (rawResult.energy) {
    const totalEnergy = Number(rawResult.energy.total || 0);
    return {
      envelope_result: {
        ua_value: Number(rawResult.envelope?.ua_value || rawResult.ua_value || 0),
        eta_a_value: Number(rawResult.envelope?.eta_a_value || rawResult.eta_a_value || 0),
        is_ua_compliant: Boolean(rawResult.envelope?.is_ua_compliant ?? true),
        is_eta_a_compliant: Boolean(rawResult.envelope?.is_eta_a_compliant ?? true),
      },
      primary_energy_result: {
        total_energy_consumption: totalEnergy,
        standard_energy_consumption: Number(rawResult.energy.standard || totalEnergy),
        energy_saving_rate: Number(rawResult.energy.energy_saving_rate || 0),
        is_energy_compliant: Boolean(rawResult.energy.is_energy_compliant ?? rawResult.overall_compliance),
        energy_by_use: {
          heating: Number(rawResult.energy.heating || 0),
          cooling: Number(rawResult.energy.cooling || 0),
          ventilation: Number(rawResult.energy.ventilation || 0),
          hot_water: Number(rawResult.energy.hot_water || 0),
          lighting: Number(rawResult.energy.lighting || 0),
        },
      },
      overall_compliance: Boolean(rawResult.overall_compliance),
      message: rawResult.message || '計算が完了しました。',
    };
  }

  return null;
};

const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};

const safePercentage = (value, total) => {
  if (!total) return '0.0';
  return ((value / total) * 100).toFixed(1);
};

export default function Result() {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const [downloadingExcel, setDownloadingExcel] = useState(false);
  const router = useRouter();
  const { id } = router.query;
  const { showError, showSuccess } = useNotification();

  useEffect(() => {
    if (id) {
      fetchProject(id);
    }
  }, [id]);

  const fetchProject = async (projectId) => {
    try {
      // LocalStorage環境での取得
      if (typeof window !== 'undefined' && (window.location.hostname.includes('github.io') || window.location.hostname === 'localhost')) {
        const localProject = getProject(projectId);
        if (localProject) {
          setProject(localProject);
        } else {
          setError('プロジェクトが見つかりません。');
        }
        return;
      }

      // API環境での取得
      const response = await projectsAPI.getById(projectId);
      setProject(response.data);

      // 計算結果がない場合は計算ページにリダイレクト
      if (!response.data.result_data && !response.data.result) {
        router.push(`/projects/${projectId}/calculate`);
      }
    } catch (error) {
      console.error('プロジェクト取得エラー:', error);
      // フォールバック
      const localProject = getProject(projectId);
      if (localProject) {
        setProject(localProject);
        // 計算結果がない場合は計算ページにリダイレクト
        if (!localProject.result) {
          router.push(`/projects/${projectId}/calculate`);
        }
      } else {
        setError('プロジェクトの取得中にエラーが発生しました。');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      setDownloadingPDF(true);
      const response = await reportAPI.getPDF(id);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      downloadBlob(blob, `${project.projectInfo?.name || project.name}_report.pdf`);
      showSuccess('PDFをダウンロードしました');
    } catch (error) {
      console.error('PDFダウンロードエラー:', error);
      showError('PDFのダウンロード中にエラーが発生しました。');
    } finally {
      setDownloadingPDF(false);
    }
  };

  const handleDownloadExcel = async () => {
    try {
      setDownloadingExcel(true);
      const response = await reportAPI.getExcel(id);
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      downloadBlob(blob, `${project.projectInfo?.name || project.name}_report.xlsx`);
      showSuccess('Excelをダウンロードしました');
    } catch (error) {
      console.error('Excelダウンロードエラー:', error);
      showError('Excelのダウンロード中にエラーが発生しました。');
    } finally {
      setDownloadingExcel(false);
    }
  };

  if (loading) {
    return (
      <CalculatorLayout>
        <div className="text-center py-8">
          <div className="animate-spin w-8 h-8 border-4 border-accent-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-primary-500">結果を読み込み中...</p>
        </div>
      </CalculatorLayout>
    );
  }

  if (!project || (!project.result_data && !project.result)) {
    return (
      <CalculatorLayout>
        <div className="text-center py-8">
          <p>計算データがありません。計算を実行してください。</p>
          <div className="mt-4">
            <Link
              href={`/projects/${id}/calculate`}
              className="bg-accent-500 hover:bg-accent-600 text-white py-2.5 px-5 rounded-lg font-medium transition-colors duration-200"
            >
              計算ページへ
            </Link>
          </div>
        </div>
      </CalculatorLayout>
    );
  }

  const result = normalizeResult(project.result_data || project.result);
  if (!result) {
    return (
      <CalculatorLayout>
        <div className="text-center py-8">
          <p>計算結果の形式を読み取れませんでした。再計算をお試しください。</p>
          <div className="mt-4">
            <Link
              href={`/projects/${id}/calculate`}
              className="bg-accent-500 hover:bg-accent-600 text-white py-2.5 px-5 rounded-lg font-medium transition-colors duration-200"
            >
              再計算する
            </Link>
          </div>
        </div>
      </CalculatorLayout>
    );
  }

  const totalEnergy = Number(result.primary_energy_result.total_energy_consumption || 0);
  const standardEnergy = Number(result.primary_energy_result.standard_energy_consumption || 0);
  const savingRate = Number(result.primary_energy_result.energy_saving_rate || 0);
  const calculationMethod = result.calculation_method || 'モデル建物法';

  // エネルギー消費量のデータを作成（円グラフ用）
  const energyByUseData = {
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const useTypeMap = {
    heating: '暖房',
    cooling: '冷房',
    ventilation: '換気',
    hot_water: '給湯',
    lighting: '照明',
  };

  for (const [key, value] of Object.entries(result.primary_energy_result.energy_by_use)) {
    energyByUseData.labels.push(useTypeMap[key] || key);
    energyByUseData.datasets[0].data.push(value);
  }

  // 設計値と基準値の比較データ（棒グラフ用）
  const comparisonData = {
    labels: ['設計値', '基準値'],
    datasets: [
      {
        label: '一次エネルギー消費量 (GJ/年)',
        data: [result.primary_energy_result.total_energy_consumption, result.primary_energy_result.standard_energy_consumption],
        backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(255, 99, 132, 0.6)'],
        borderColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)'],
        borderWidth: 1,
      },
    ],
  };

  return (
    <CalculatorLayout>
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-primary-800">計算結果</h1>
          <p className="text-primary-400 text-sm mt-1">{project.projectInfo?.name || project.name}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/projects"
            className="bg-white border border-warm-200 hover:border-primary-300 text-primary-700 py-2 px-4 rounded-lg flex items-center gap-1.5 text-sm font-medium transition-colors duration-200"
          >
            <FaHome className="text-xs" /> 一覧へ
          </Link>
          <button
            onClick={handleDownloadPDF}
            disabled={downloadingPDF}
            className="bg-accent-500 hover:bg-accent-600 disabled:bg-primary-300 text-white py-2 px-4 rounded-lg flex items-center gap-1.5 text-sm font-medium transition-colors duration-200 shadow-sm"
          >
            <FaFileDownload className="text-xs" /> {downloadingPDF ? 'ダウンロード中...' : 'PDF出力'}
          </button>
          <button
            onClick={handleDownloadExcel}
            disabled={downloadingExcel}
            className="bg-primary-700 hover:bg-primary-800 disabled:bg-primary-300 text-white py-2 px-4 rounded-lg flex items-center gap-1.5 text-sm font-medium transition-colors duration-200 shadow-sm"
          >
            <FaFileExcel className="text-xs" /> {downloadingExcel ? 'ダウンロード中...' : 'Excel出力'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-md">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 総合判定 */}
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-accent-500">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <div className="bg-accent-50 p-2 rounded-full mr-3">
              <FaCheckCircle className="text-accent-500" />
            </div>
            総合判定結果
          </h2>
          <div className={`text-center p-6 rounded-lg shadow-inner ${
            result.overall_compliance ? 'bg-green-50 text-green-800 border-2 border-green-200' : 'bg-red-50 text-red-800 border-2 border-red-200'
          }`}>
            <div className="text-4xl font-bold mb-3">
              {result.overall_compliance ? (
                <div className="flex items-center justify-center">
                  <FaCheckCircle className="mr-2 text-green-600" />
                  適合
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <FaExclamationTriangle className="mr-2 text-red-600" />
                  不適合
                </div>
              )}
            </div>
            <div className="text-lg">
              {result.message}
            </div>
            {result.overall_compliance && (
              <div className="mt-4 text-sm text-green-600 bg-green-50 p-3 rounded-md">
                <FaCheckCircle className="inline mr-1" />
                建築物省エネ法の基準に適合しています
              </div>
            )}
          </div>
        </div>

        {/* エネルギー消費内訳 */}
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-primary-500">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <div className="bg-primary-100 p-2 rounded-full mr-3">
              <FaChartPie className="text-primary-600" />
            </div>
            エネルギー消費内訳
          </h2>
          <div className="h-64 mb-4">
            <Pie data={energyByUseData} options={{
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'bottom',
                  labels: {
                    padding: 20,
                    usePointStyle: true,
                  }
                },
                tooltip: {
                  callbacks: {
                    label: function(context) {
                      const total = context.dataset.data.reduce((a, b) => a + b, 0);
                      const percentage = safePercentage(context.raw, total);
                      return `${context.label}: ${context.raw.toFixed(1)} GJ/年 (${percentage}%)`;
                    }
                  }
                }
              }
            }} />
          </div>
          <div className="text-center">
            <p className="text-sm text-primary-600">
              総エネルギー消費量: {totalEnergy.toFixed(1)} GJ/年
            </p>
          </div>
        </div>

        {/* 詳細データテーブル */}
        <div className="bg-white p-6 rounded-lg shadow-md lg:col-span-2">
          <h2 className="text-xl font-bold mb-4">詳細データ</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="rounded-lg border border-warm-200 bg-warm-50 p-4">
              <p className="text-xs text-primary-500 mb-1">設計一次エネルギー</p>
              <p className="text-2xl font-bold text-primary-900">{totalEnergy.toFixed(1)}</p>
              <p className="text-xs text-primary-500 mt-1">GJ/年</p>
            </div>
            <div className="rounded-lg border border-warm-200 bg-warm-50 p-4">
              <p className="text-xs text-primary-500 mb-1">基準一次エネルギー</p>
              <p className="text-2xl font-bold text-primary-900">{standardEnergy.toFixed(1)}</p>
              <p className="text-xs text-primary-500 mt-1">GJ/年</p>
            </div>
            <div className="rounded-lg border border-warm-200 bg-warm-50 p-4">
              <p className="text-xs text-primary-500 mb-1">省エネ率</p>
              <p className={`text-2xl font-bold ${savingRate >= 0 ? 'text-green-700' : 'text-red-700'}`}>{savingRate.toFixed(1)}%</p>
              <p className="text-xs text-primary-500 mt-1">{result.primary_energy_result.is_energy_compliant ? '基準内' : '要見直し'}</p>
            </div>
            <div className="rounded-lg border border-warm-200 bg-warm-50 p-4">
              <p className="text-xs text-primary-500 mb-1">計算方式</p>
              <p className="text-lg font-bold text-primary-900">{calculationMethod}</p>
              <p className="text-xs text-primary-500 mt-1">更新: {new Date(project.updatedAt || project.updated_at || project.createdAt || project.created_at).toLocaleDateString('ja-JP')}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 外皮性能 */}
            <div>
              <h3 className="text-lg font-semibold mb-2">外皮性能</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full border">
                  <thead className="bg-warm-100">
                    <tr>
                      <th className="py-2 px-3 border text-left">項目</th>
                      <th className="py-2 px-3 border text-left">設計値</th>
                      <th className="py-2 px-3 border text-left">基準値</th>
                      <th className="py-2 px-3 border text-left">判定</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="py-2 px-3 border">UA値 (W/m2K)</td>
                      <td className="py-2 px-3 border">{result.envelope_result.ua_value.toFixed(2)}</td>
                      <td className="py-2 px-3 border">0.87</td>
                      <td className={`py-2 px-3 border ${
                        result.envelope_result.is_ua_compliant
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}>
                        {result.envelope_result.is_ua_compliant ? '適合' : '不適合'}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 border">ηA値</td>
                      <td className="py-2 px-3 border">{result.envelope_result.eta_a_value.toFixed(2)}</td>
                      <td className="py-2 px-3 border">2.80</td>
                      <td className={`py-2 px-3 border ${
                        result.envelope_result.is_eta_a_compliant
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}>
                        {result.envelope_result.is_eta_a_compliant ? '適合' : '不適合'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* エネルギー性能 */}
            <div>
              <h3 className="text-lg font-semibold mb-2">一次エネルギー性能</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full border">
                  <thead className="bg-warm-100">
                    <tr>
                      <th className="py-2 px-3 border text-left">項目</th>
                      <th className="py-2 px-3 border text-left">設計値</th>
                      <th className="py-2 px-3 border text-left">基準値</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="py-2 px-3 border">一次エネルギー消費量 (GJ/年)</td>
                      <td className="py-2 px-3 border">{totalEnergy.toFixed(1)}</td>
                      <td className="py-2 px-3 border">{standardEnergy.toFixed(1)}</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 border">省エネ率 (%)</td>
                      <td className="py-2 px-3 border" colSpan="2">
                        {savingRate.toFixed(1)}
                        <span className="ml-2 text-sm">
                          ({result.primary_energy_result.is_energy_compliant ? '適合' : '不適合'})
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* 設計値と基準値の比較（棒グラフ） */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-2">エネルギー消費量比較</h3>
            <div className="h-64">
              <Bar
                data={comparisonData}
                options={{
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                    },
                  },
                }}
              />
            </div>
          </div>

          {/* 用途別消費量 */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-2">用途別消費量詳細</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full border">
                <thead className="bg-warm-100">
                  <tr>
                    <th className="py-2 px-3 border text-left">用途</th>
                    <th className="py-2 px-3 border text-left">設計値 (GJ/年)</th>
                    <th className="py-2 px-3 border text-left">割合 (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(result.primary_energy_result.energy_by_use).map(([key, value]) => {
                    const percentage = safePercentage(value, totalEnergy);
                    return (
                      <tr key={key}>
                        <td className="py-2 px-3 border">{useTypeMap[key] || key}</td>
                        <td className="py-2 px-3 border">{value.toFixed(1)}</td>
                        <td className="py-2 px-3 border">{percentage}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </CalculatorLayout>
  );
}
