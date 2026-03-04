import { useEffect, useMemo, useState } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
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
  BarElement,
  Title,
  Tooltip,
  Legend,
);

const STATUS_OPTIONS = ['pending', 'contacted', 'quoted', 'closed'];

export default function PartnerAdminPage() {
  const [stats, setStats] = useState(null);
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const [statsRes, listRes] = await Promise.all([
          apiClient.get('/referral/stats'),
          apiClient.get('/referral/list'),
        ]);
        if (!mounted) return;

        setStats(statsRes.data || null);
        setReferrals(listRes.data?.referrals || []);
      } catch {
        if (!mounted) return;
        setError('パートナーデータの取得に失敗しました。');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();
    return () => {
      mounted = false;
    };
  }, []);

  const feeEstimate = useMemo(() => {
    const total = stats?.total || 0;
    const unitPrice = 15000;
    return total * unitPrice;
  }, [stats]);

  const manufacturerBarData = useMemo(() => {
    const entries = Object.entries(stats?.by_manufacturer || {});
    return {
      labels: entries.map(([name]) => name),
      datasets: [
        {
          label: '紹介件数',
          data: entries.map(([, count]) => count),
          backgroundColor: '#0f766e',
        },
      ],
    };
  }, [stats]);

  const monthlyLineData = useMemo(() => {
    const rows = stats?.by_month || [];
    return {
      labels: rows.map((r) => `${r.year}-${String(r.month).padStart(2, '0')}`),
      datasets: [
        {
          label: '月次紹介件数',
          data: rows.map((r) => r.count),
          borderColor: '#1d4ed8',
          backgroundColor: 'rgba(29,78,216,0.15)',
          tension: 0.2,
        },
      ],
    };
  }, [stats]);

  const [localStatuses, setLocalStatuses] = useState({});
  const statusOf = (row) => localStatuses[row.id] || row.status;

  return (
    <main className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <section className="bg-white rounded-2xl border border-slate-200 p-6">
          <h1 className="text-2xl font-bold text-slate-900">パートナー管理ダッシュボード</h1>
          <p className="text-sm text-slate-500 mt-1">紹介実績・月次推移・手数料試算を確認できます。</p>
        </section>

        {error && (
          <section className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
            {error}
          </section>
        )}

        <section className="grid md:grid-cols-4 gap-4">
          <article className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-xs text-slate-500">紹介総数</p>
            <p className="text-2xl font-bold text-slate-900">{stats?.total || 0}</p>
          </article>
          <article className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-xs text-slate-500">pending</p>
            <p className="text-2xl font-bold text-amber-600">{stats?.by_status?.pending || 0}</p>
          </article>
          <article className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-xs text-slate-500">closed</p>
            <p className="text-2xl font-bold text-emerald-600">{stats?.by_status?.closed || 0}</p>
          </article>
          <article className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-xs text-slate-500">想定手数料</p>
            <p className="text-2xl font-bold text-slate-900">¥{feeEstimate.toLocaleString()}</p>
          </article>
        </section>

        <section className="grid lg:grid-cols-2 gap-6">
          <article className="bg-white border border-slate-200 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-slate-700 mb-3">メーカー別紹介件数</h2>
            {!loading && <Bar data={manufacturerBarData} />}
          </article>
          <article className="bg-white border border-slate-200 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-slate-700 mb-3">月次推移</h2>
            {!loading && <Line data={monthlyLineData} />}
          </article>
        </section>

        <section className="bg-white border border-slate-200 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-3">紹介一覧</h2>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-slate-200 text-slate-500">
                  <th className="py-2">ID</th>
                  <th className="py-2">建築士</th>
                  <th className="py-2">製品</th>
                  <th className="py-2">メーカー</th>
                  <th className="py-2">ステータス</th>
                  <th className="py-2">作成日</th>
                </tr>
              </thead>
              <tbody>
                {referrals.map((row) => (
                  <tr key={row.id} className="border-b border-slate-100">
                    <td className="py-2">#{row.id}</td>
                    <td className="py-2">{row.architect_name}</td>
                    <td className="py-2">{row.product_name}</td>
                    <td className="py-2">{row.manufacturer}</td>
                    <td className="py-2">
                      <select
                        value={statusOf(row)}
                        onChange={(e) => {
                          const value = e.target.value;
                          setLocalStatuses((prev) => ({ ...prev, [row.id]: value }));
                        }}
                        className="border border-slate-300 rounded px-2 py-1 text-xs"
                      >
                        {STATUS_OPTIONS.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2">{String(row.created_at || '').slice(0, 10)}</td>
                  </tr>
                ))}
                {referrals.length === 0 && (
                  <tr>
                    <td className="py-4 text-slate-500" colSpan={6}>紹介データはまだありません。</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
