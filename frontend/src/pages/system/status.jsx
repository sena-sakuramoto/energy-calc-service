// frontend/src/pages/system/status.jsx
import { useState, useEffect, useCallback } from 'react';
import Layout from '../../components/Layout';
import { FaCheckCircle, FaExclamationTriangle, FaTimesCircle, FaSync, FaChartLine, FaDatabase, FaCloud, FaShieldAlt, FaCog, FaInfoCircle } from 'react-icons/fa';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://energy-calc-service.onrender.com/api/v1';

export default function SystemStatus() {
  const [checks, setChecks] = useState([]);
  const [overallStatus, setOverallStatus] = useState('checking');
  const [lastChecked, setLastChecked] = useState(null);
  const [isChecking, setIsChecking] = useState(false);

  const runHealthChecks = useCallback(async () => {
    setIsChecking(true);
    const results = [];

    // 1. Backend API health
    try {
      const start = Date.now();
      const res = await fetch(`${API_BASE}/healthz`, { signal: AbortSignal.timeout(15000) });
      const ms = Date.now() - start;
      const data = await res.json();
      results.push({
        name: 'バックエンドAPI',
        description: 'BEI計算・料金計算エンジン',
        icon: FaCog,
        status: res.ok ? 'operational' : 'error',
        detail: res.ok ? `応答時間: ${ms}ms` : `HTTP ${res.status}`,
      });
    } catch (e) {
      results.push({
        name: 'バックエンドAPI',
        description: 'BEI計算・料金計算エンジン',
        icon: FaCog,
        status: 'error',
        detail: e.name === 'TimeoutError' ? 'タイムアウト（コールドスタート中の可能性）' : '接続エラー',
      });
    }

    // 2. BEI Catalog endpoint
    try {
      const start = Date.now();
      const res = await fetch(`${API_BASE}/bei/catalog/uses`, { signal: AbortSignal.timeout(10000) });
      const ms = Date.now() - start;
      if (res.ok) {
        const data = await res.json();
        const count = data.uses?.length || 0;
        results.push({
          name: 'BEI基準値データベース',
          description: `${count}建物用途 × 8地域区分の基準値`,
          icon: FaDatabase,
          status: 'operational',
          detail: `${count}用途ロード済み (${ms}ms)`,
        });
      } else {
        results.push({
          name: 'BEI基準値データベース',
          description: 'モデル建物法 v3.8 基準データ',
          icon: FaDatabase,
          status: 'warning',
          detail: `HTTP ${res.status}`,
        });
      }
    } catch {
      results.push({
        name: 'BEI基準値データベース',
        description: 'モデル建物法 v3.8 基準データ',
        icon: FaDatabase,
        status: 'error',
        detail: '接続エラー',
      });
    }

    // 3. Frontend (always operational if this page loads)
    results.push({
      name: 'フロントエンド',
      description: 'Next.js静的サイト (GitHub Pages)',
      icon: FaCloud,
      status: 'operational',
      detail: 'このページが表示されています',
    });

    // 4. Firebase Auth
    try {
      const { getAuth } = await import('firebase/auth');
      const auth = getAuth();
      results.push({
        name: 'Firebase認証',
        description: 'Google OAuth / メール認証',
        icon: FaShieldAlt,
        status: auth ? 'operational' : 'warning',
        detail: auth ? '初期化済み' : '初期化未完了',
      });
    } catch {
      results.push({
        name: 'Firebase認証',
        description: 'Google OAuth / メール認証',
        icon: FaShieldAlt,
        status: 'warning',
        detail: '確認不可',
      });
    }

    // 5. BEI evaluate test
    try {
      const start = Date.now();
      const res = await fetch(`${API_BASE}/bei/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          use: 'office', zone: '6', building_area_m2: 1000,
          design_energy: [{ category: 'lighting', value: 70000, unit: 'MJ' }]
        }),
        signal: AbortSignal.timeout(15000),
      });
      const ms = Date.now() - start;
      results.push({
        name: 'BEI計算エンジン',
        description: '建築物エネルギー消費性能計算',
        icon: FaChartLine,
        status: res.ok ? 'operational' : 'warning',
        detail: res.ok ? `計算テスト成功 (${ms}ms)` : `HTTP ${res.status}`,
      });
    } catch {
      results.push({
        name: 'BEI計算エンジン',
        description: '建築物エネルギー消費性能計算',
        icon: FaChartLine,
        status: 'error',
        detail: '計算テスト失敗',
      });
    }

    setChecks(results);
    setLastChecked(new Date());
    setIsChecking(false);

    const hasError = results.some(r => r.status === 'error');
    const hasWarning = results.some(r => r.status === 'warning');
    setOverallStatus(hasError ? 'error' : hasWarning ? 'warning' : 'operational');
  }, []);

  useEffect(() => {
    runHealthChecks();
  }, [runHealthChecks]);

  const statusConfig = {
    operational: { bg: 'bg-green-50 border-green-200', iconBg: 'bg-green-500', text: 'text-green-900', sub: 'text-green-700', label: '全サービス正常稼働中', icon: FaCheckCircle },
    warning: { bg: 'bg-yellow-50 border-yellow-200', iconBg: 'bg-yellow-500', text: 'text-yellow-900', sub: 'text-yellow-700', label: '一部サービスに注意あり', icon: FaExclamationTriangle },
    error: { bg: 'bg-red-50 border-red-200', iconBg: 'bg-red-500', text: 'text-red-900', sub: 'text-red-700', label: 'サービス障害が発生しています', icon: FaTimesCircle },
    checking: { bg: 'bg-warm-50 border-primary-200', iconBg: 'bg-primary-500', text: 'text-primary-900', sub: 'text-primary-700', label: 'ヘルスチェック中...', icon: FaSync },
  };

  const cfg = statusConfig[overallStatus];

  const getItemStyle = (status) => ({
    operational: { border: 'bg-green-50 border-green-200', iconBg: 'bg-green-100', iconColor: 'text-green-600' },
    warning: { border: 'bg-yellow-50 border-yellow-200', iconBg: 'bg-yellow-100', iconColor: 'text-yellow-600' },
    error: { border: 'bg-red-50 border-red-200', iconBg: 'bg-red-100', iconColor: 'text-red-600' },
  }[status] || { border: 'bg-warm-50 border-primary-200', iconBg: 'bg-warm-100', iconColor: 'text-primary-600' });

  const getStatusIcon = (status) => {
    if (status === 'operational') return <FaCheckCircle className="text-green-500" />;
    if (status === 'warning') return <FaExclamationTriangle className="text-yellow-500" />;
    return <FaTimesCircle className="text-red-500" />;
  };

  return (
    <Layout title="システム状況 - 楽々省エネ計算">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary-900 mb-1">サービス稼働状況</h1>
            <p className="text-primary-600 text-sm">リアルタイムヘルスチェック</p>
          </div>
          <button
            onClick={runHealthChecks}
            disabled={isChecking}
            className="flex items-center gap-2 bg-primary-700 hover:bg-primary-800 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm transition-colors"
          >
            <FaSync className={isChecking ? 'animate-spin' : ''} />
            再チェック
          </button>
        </div>

        {/* 全体ステータス */}
        <div className={`${cfg.bg} border-2 rounded-lg p-6 mb-8`}>
          <div className="flex items-center">
            <div className={`${cfg.iconBg} p-3 rounded-full mr-4`}>
              <cfg.icon className="text-white text-2xl" />
            </div>
            <div>
              <h2 className={`text-2xl font-bold ${cfg.text}`}>{cfg.label}</h2>
              <p className={cfg.sub}>
                {overallStatus === 'checking' ? 'バックエンドとの接続を確認しています...' :
                 `${checks.filter(c => c.status === 'operational').length}/${checks.length} サービス正常`}
              </p>
            </div>
          </div>
        </div>

        {/* 各サービスの状態 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-primary-900 mb-4">各サービスの稼働状況</h2>
          <div className="space-y-4">
            {checks.map((check, i) => {
              const style = getItemStyle(check.status);
              return (
                <div key={i} className={`border rounded-lg p-4 ${style.border}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-lg mr-3 ${style.iconBg}`}>
                        <check.icon className={`text-lg ${style.iconColor}`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-primary-900">{check.name}</h3>
                        <p className="text-sm text-primary-600">{check.description}</p>
                        <p className="text-xs text-primary-500 mt-1">{check.detail}</p>
                      </div>
                    </div>
                    {getStatusIcon(check.status)}
                  </div>
                </div>
              );
            })}
            {checks.length === 0 && (
              <div className="text-center py-8 text-primary-500">
                <FaSync className="animate-spin text-2xl mx-auto mb-2" />
                チェック中...
              </div>
            )}
          </div>
        </div>

        {/* 注意事項 */}
        <div className="bg-warm-50 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-primary-900 mb-3">サービスについて</h3>
          <ul className="text-sm text-primary-600 space-y-2">
            <li>バックエンドはRender無料枠で稼働しています。初回アクセス時にコールドスタート（30-60秒）が発生する場合があります。</li>
            <li>コールドスタート中でもフロントエンドのローカル計算にフォールバックするため、計算自体は利用可能です。</li>
            <li>計算精度はバックエンド（正規API）利用時が最も高くなります。</li>
          </ul>
        </div>

        {lastChecked && (
          <div className="text-center text-sm text-primary-500">
            最終チェック: {lastChecked.toLocaleString('ja-JP')}
          </div>
        )}
      </div>
    </Layout>
  );
}
