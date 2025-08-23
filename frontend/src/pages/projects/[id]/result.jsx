// frontend/src/pages/projects/[id]/result.jsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../../components/Layout';
import { projectsAPI, reportAPI } from '../../../utils/api';
import Link from 'next/link';
import { FaHome, FaFileDownload, FaFileExcel } from 'react-icons/fa';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

// Chart.jsを初期化
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function Result() {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const [downloadingExcel, setDownloadingExcel] = useState(false);
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (id) {
      fetchProject(id);
    }
  }, [id]);

  const fetchProject = async (projectId) => {
    try {
      const response = await projectsAPI.getById(projectId);
      setProject(response.data);
      
      // 計算結果がない場合は計算ページにリダイレクト
      if (!response.data.result_data) {
        router.push(`/projects/${projectId}/calculate`);
      }
    } catch (error) {
      console.error('プロジェクト取得エラー:', error);
      setError('プロジェクトの取得中にエラーが発生しました。');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      setDownloadingPDF(true);
      const response = await reportAPI.getPDF(id);
      
      // Blobとしてダウンロード
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project.name}_report.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('PDFダウンロードエラー:', error);
      alert('PDFのダウンロード中にエラーが発生しました。');
    } finally {
      setDownloadingPDF(false);
    }
  };

  const handleDownloadExcel = async () => {
    try {
      setDownloadingExcel(true);
      const response = await reportAPI.getExcel(id);
      
      // Blobとしてダウンロード
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project.name}_report.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Excelダウンロードエラー:', error);
      alert('Excelのダウンロード中にエラーが発生しました。');
    } finally {
      setDownloadingExcel(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-8">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>結果を読み込み中...</p>
        </div>
      </Layout>
    );
  }

  if (!project || !project.result_data) {
    return (
      <Layout>
        <div className="text-center py-8">
          <p>計算データがありません。計算を実行してください。</p>
          <div className="mt-4">
            <Link
              href={`/projects/${id}/calculate`}
              className="bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded-md"
            >
              計算ページへ
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const result = project.result_data;
  const inputData = project.input_data;

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
        label: '一次エネルギー消費量 (MJ/年)',
        data: [result.primary_energy_result.total_energy_consumption, result.primary_energy_result.standard_energy_consumption],
        backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(255, 99, 132, 0.6)'],
        borderColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)'],
        borderWidth: 1,
      },
    ],
  };

  return (
    <Layout>
      <div className="mb-6 flex flex-wrap justify-between items-center">
        <h1 className="text-2xl font-bold">計算結果 - {project.name}</h1>
        <div className="flex space-x-2 mt-2 sm:mt-0">
          <Link
            href="/projects"
            className="bg-gray-200 hover:bg-gray-300 py-2 px-3 rounded-md flex items-center"
          >
            <FaHome className="mr-1" /> 一覧へ
          </Link>
          <button
            onClick={handleDownloadPDF}
            disabled={downloadingPDF}
            className="bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-md flex items-center"
          >
            <FaFileDownload className="mr-1" /> {downloadingPDF ? 'ダウンロード中...' : 'PDF出力'}
          </button>
          <button
            onClick={handleDownloadExcel}
            disabled={downloadingExcel}
            className="bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-md flex items-center"
          >
            <FaFileExcel className="mr-1" /> {downloadingExcel ? 'ダウンロード中...' : 'Excel出力'}
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
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">総合判定結果</h2>
          <div className={`text-center p-4 rounded-md ${
            result.overall_compliance ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            <div className="text-3xl font-bold mb-2">
              {result.overall_compliance ? '適合' : '不適合'}
            </div>
            <div>
              {result.message}
            </div>
          </div>
        </div>

        {/* エネルギー消費内訳 */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">エネルギー消費内訳</h2>
          <div className="h-64">
            <Pie data={energyByUseData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>

        {/* 詳細データテーブル */}
        <div className="bg-white p-6 rounded-lg shadow-md lg:col-span-2">
          <h2 className="text-xl font-bold mb-4">詳細データ</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 外皮性能 */}
            <div>
              <h3 className="text-lg font-semibold mb-2">外皮性能</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full border">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="py-2 px-3 border text-left">項目</th>
                      <th className="py-2 px-3 border text-left">設計値</th>
                      <th className="py-2 px-3 border text-left">基準値</th>
                      <th className="py-2 px-3 border text-left">判定</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="py-2 px-3 border">UA値 (W/m²K)</td>
                      <td className="py-2 px-3 border">{result.envelope_result.ua_value.toFixed(2)}</td>
                      <td className="py-2 px-3 border">{result.envelope_result.ua_value < 0.6 ? '0.60' : '-'}</td> {/* 仮の基準値 */} 
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
                      <td className="py-2 px-3 border">{result.envelope_result.eta_a_value < 2.8 ? '2.80' : '-'}</td> {/* 仮の基準値 */} 
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
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="py-2 px-3 border text-left">項目</th>
                      <th className="py-2 px-3 border text-left">設計値</th>
                      <th className="py-2 px-3 border text-left">基準値</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="py-2 px-3 border">一次エネルギー消費量 (MJ/年)</td>
                      <td className="py-2 px-3 border">{result.primary_energy_result.total_energy_consumption.toFixed(1)}</td>
                      <td className="py-2 px-3 border">{result.primary_energy_result.standard_energy_consumption.toFixed(1)}</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 border">省エネ率 (%)</td>
                      <td className="py-2 px-3 border" colSpan="2">
                        {result.primary_energy_result.energy_saving_rate.toFixed(2)}
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
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-2 px-3 border text-left">用途</th>
                    <th className="py-2 px-3 border text-left">設計値 (GJ/年)</th>
                    <th className="py-2 px-3 border text-left">割合 (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(result.primary_energy_result.energy_by_use).map(([key, value]) => {
                    const percentage = (value / result.primary_energy_result.total_energy_consumption * 100).toFixed(1);
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
    </Layout>
  );
}