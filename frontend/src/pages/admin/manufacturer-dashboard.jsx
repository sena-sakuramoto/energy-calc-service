import { useEffect, useMemo, useState } from 'react';
import {
  Bar,
  Line,
  Pie,
} from 'react-chartjs-2';
import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
} from 'chart.js';

import apiClient from '../../utils/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

const MANUFACTURERS = ['YKK AP', 'パナソニック', 'LIXIL', '三協アルミ', 'ダイキン'];

export default function ManufacturerDashboard() {
  const [manufacturer, setManufacturer] = useState(MANUFACTURERS[0]);
  const [report, setReport] = useState(null);
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const [reportRes, referralRes] = await Promise.all([
          apiClient.get(`/analytics/manufacturer/${encodeURIComponent(manufacturer)}`),
          apiClient.get('/referral/list'),
        ]);
        if (!mounted) return;

        setReport(reportRes.data || null);
        setReferrals(referralRes.data?.referrals || []);
      } catch (err) {
        if (!mounted) return;
        setError('ダッシュボードデータの取得に失敗しました。');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();
    return () => {
      mounted = false;
    };
  }, [manufacturer]);

  const filteredLeads = useMemo(
    () => referrals.filter((item) => item.manufacturer === manufacturer),
    [manufacturer, referrals],
  );

  const categoryChartData = useMemo(() => {
    const entries = Object.entries(report?.by_category || {});
    return {
      labels: entries.map(([k]) => k),
      datasets: [
        {
          label: '製品選択回数',
          data: entries.map(([, v]) => v),
          backgroundColor: ['#2563eb', '#059669', '#f59e0b', '#ef4444'],
        },
      ],
    };
  }, [report]);

  const monthlyChartData = useMemo(() => {
    const rows = report?.by_month || [];
    return {
      labels: rows.map((r) => `${r.year}-${String(r.month).padStart(2, '0')}`),
      datasets: [
        {
          label: '月次選択回数',
          data: rows.map((r) => r.count),
          borderColor: '#2563eb',
          backgroundColor: 'rgba(37,99,235,0.15)',
          tension: 0.25,
        },
      ],
    };
  }, [report]);

  const competitorCategory = useMemo(() => {
    const keys = Object.keys(report?.competitor_comparison || {});
    return keys[0] || '';
  }, [report]);

  const competitorPieData = useMemo(() => {
    const rows = report?.competitor_comparison?.[competitorCategory] || [];
    return {
      labels: rows.map((r) => r.manufacturer),
      datasets: [
        {
          data: rows.map((r) => r.count),
          backgroundColor: ['#0ea5e9', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6'],
        },
      ],
    };
  }, [competitorCategory, report]);

  const estimatedFee = (report?.total_leads || 0) * 15000;

  return (
    <main className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">メーカー向けダッシュボード</h1>
              <p className="text-sm text-slate-500 mt-1">スポンサー契約向けの選択・リード分析</p>
            </div>
            <select
              value={manufacturer}
              onChange={(e) => setManufacturer(e.target.value)}
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
            >
              {MANUFACTURERS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </section>

        {error && (
          <section className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
            {error}
          </section>
        )}

        <section className="grid md:grid-cols-4 gap-4">
          <article className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-xs text-slate-500">総選択回数</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{report?.total_selections || 0}</p>
          </article>
          <article className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-xs text-slate-500">総リード件数</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{report?.total_leads || 0}</p>
          </article>
          <article className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-xs text-slate-500">地域数</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{Object.keys(report?.by_zone || {}).length}</p>
          </article>
          <article className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-xs text-slate-500">想定手数料</p>
            <p className="text-2xl font-bold text-emerald-700 mt-1">¥{estimatedFee.toLocaleString()}</p>
          </article>
        </section>

        <section className="grid lg:grid-cols-2 gap-6">
          <article className="bg-white border border-slate-200 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-slate-700 mb-3">カテゴリ別選択数</h2>
            {!loading && <Bar data={categoryChartData} />}
          </article>
          <article className="bg-white border border-slate-200 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-slate-700 mb-3">月次推移</h2>
            {!loading && <Line data={monthlyChartData} />}
          </article>
        </section>

        <section className="grid lg:grid-cols-2 gap-6">
          <article className="bg-white border border-slate-200 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-slate-700 mb-3">競合比較 ({competitorCategory || 'N/A'})</h2>
            {!loading && competitorCategory && <Pie data={competitorPieData} />}
            {!loading && !competitorCategory && (
              <p className="text-sm text-slate-500">比較データがありません。</p>
            )}
          </article>

          <article className="bg-white border border-slate-200 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-slate-700 mb-3">リード一覧</h2>
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500 border-b border-slate-200">
                    <th className="py-2">建築士</th>
                    <th className="py-2">製品</th>
                    <th className="py-2">状態</th>
                    <th className="py-2">作成日</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.map((lead) => (
                    <tr key={lead.id} className="border-b border-slate-100">
                      <td className="py-2">{lead.architect_name}</td>
                      <td className="py-2">{lead.product_name}</td>
                      <td className="py-2">
                        <span className="px-2 py-1 rounded-full text-xs bg-slate-100 text-slate-700">
                          {lead.status}
                        </span>
                      </td>
                      <td className="py-2">{String(lead.created_at || '').slice(0, 10)}</td>
                    </tr>
                  ))}
                  {filteredLeads.length === 0 && (
                    <tr>
                      <td className="py-4 text-slate-500" colSpan={4}>対象リードはありません。</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}
