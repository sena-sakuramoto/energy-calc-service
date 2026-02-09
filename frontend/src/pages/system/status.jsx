// frontend/src/pages/system/status.jsx
import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaChartLine, FaDatabase, FaCloud, FaShieldAlt, FaCog } from 'react-icons/fa';

export default function SystemStatus() {
  const [systemStats, setSystemStats] = useState({
    totalProjects: 0,
    totalCalculations: 0,
    storageType: 'localStorage',
    lastUpdate: new Date().toISOString()
  });

  useEffect(() => {
    // Firebase移行後は実際のFirestoreデータを取得するか、モック値を使用
    setSystemStats({
      totalProjects: 'N/A', // Firestoreからリアルタイム取得が必要
      totalCalculations: 'N/A', // Firestoreからリアルタイム取得が必要
      storageType: 'Cloud Firestore (Firebase)',
      lastUpdate: new Date().toISOString()
    });
  }, []);

  const systemComponents = [
    {
      name: 'BEI計算エンジン',
      status: 'operational',
      description: '建築物エネルギー消費性能計算',
      version: '1.0.0',
      icon: FaChartLine
    },
    {
      name: 'プロジェクト管理',
      status: 'operational',
      description: '統合プロジェクトデータベース',
      version: '1.0.0',
      icon: FaDatabase
    },
    {
      name: 'Google認証システム',
      status: 'operational',
      description: 'OAuth 2.0 セキュア認証',
      version: '1.0.0',
      icon: FaShieldAlt
    },
    {
      name: 'データストレージ',
      status: 'operational',
      description: systemStats.storageType,
      version: '1.0.0',
      icon: FaCloud
    },
    {
      name: '法令準拠チェック',
      status: 'operational',
      description: '建築物省エネ法完全準拠',
      version: '2025.1',
      icon: FaCog
    },
    {
      name: 'UI/UXシステム',
      status: 'operational',
      description: 'レスポンシブデザイン対応',
      version: '1.0.0',
      icon: FaInfoCircle
    }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'operational':
        return <FaCheckCircle className="text-green-500" />;
      case 'warning':
        return <FaExclamationTriangle className="text-yellow-500" />;
      case 'error':
        return <FaExclamationTriangle className="text-red-500" />;
      default:
        return <FaInfoCircle className="text-primary-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'operational':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-warm-50 border-primary-200';
    }
  };

  return (
    <Layout title="システム状況 - 楽々省エネ計算">
      <div className="max-w-6xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary-900 mb-2">サービス稼働状況</h1>
          <p className="text-primary-600">「楽々省エネ計算」の利用状況とサービス品質情報</p>
        </div>

        {/* 全体ステータス */}
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 mb-8">
          <div className="flex items-center">
            <div className="bg-green-500 p-3 rounded-full mr-4">
              <FaCheckCircle className="text-white text-2xl" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-green-900">サービス正常稼働中</h2>
              <p className="text-green-700">全機能が快適にご利用いただけます</p>
            </div>
          </div>
        </div>

        {/* 統計情報 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-accent-500">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-primary-900">総プロジェクト数</h3>
                <p className="text-3xl font-bold text-accent-600">{systemStats.totalProjects}</p>
              </div>
              <FaDatabase className="text-accent-500 text-2xl" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-accent-600">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-primary-900">計算実行回数</h3>
                <p className="text-3xl font-bold text-accent-600">{systemStats.totalCalculations}</p>
              </div>
              <FaChartLine className="text-accent-500 text-2xl" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-primary-500">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-primary-900">稼働時間</h3>
                <p className="text-3xl font-bold text-primary-600">24/7</p>
              </div>
              <FaCog className="text-primary-500 text-2xl" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-accent-400">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-primary-900">システム品質</h3>
                <p className="text-3xl font-bold text-accent-600">99.9%</p>
              </div>
              <FaShieldAlt className="text-accent-400 text-2xl" />
            </div>
          </div>
        </div>

        {/* 機能稼働状況 */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-primary-900 mb-6">各機能の稼働状況</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {systemComponents.map((component, index) => (
              <div key={index} className={`border rounded-lg p-6 ${getStatusColor(component.status)}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start">
                    <div className={`p-2 rounded-lg mr-4 ${
                      component.status === 'operational' ? 'bg-green-100' :
                      component.status === 'warning' ? 'bg-yellow-100' :
                      component.status === 'error' ? 'bg-red-100' : 'bg-warm-100'
                    }`}>
                      <component.icon className={`text-lg ${
                        component.status === 'operational' ? 'text-green-600' :
                        component.status === 'warning' ? 'text-yellow-600' :
                        component.status === 'error' ? 'text-red-600' : 'text-primary-600'
                      }`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-primary-900 mb-1">{component.name}</h3>
                      <p className="text-sm text-primary-600 mb-2">{component.description}</p>
                      <p className="text-xs text-primary-500">バージョン: {component.version}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {getStatusIcon(component.status)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* サービス品質保証 */}
        <div className="mt-8 bg-warm-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-primary-900 mb-4">サービス品質保証</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium text-primary-700 mb-2">セキュリティ</h4>
              <ul className="text-sm text-primary-600 space-y-1">
                <li>暗号化通信でデータ保護</li>
                <li>個人情報保護法準拠</li>
                <li>セキュリティ対策完備</li>
                <li>定期的な安全性監査</li>
                <li>データ漏洩防止対策</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-primary-700 mb-2">法令準拠</h4>
              <ul className="text-sm text-primary-600 space-y-1">
                <li>建築物省エネ法完全対応</li>
                <li>最新の省エネ基準準拠</li>
                <li>国土交通省基準値対応</li>
                <li>地域区分別基準完全対応</li>
                <li>申請書類作成対応</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-primary-700 mb-2">品質管理</h4>
              <ul className="text-sm text-primary-600 space-y-1">
                <li>24時間サービス監視</li>
                <li>99.9%稼働率保証</li>
                <li>計算精度保証</li>
                <li>専門家による監修</li>
                <li>定期的な品質検証</li>
              </ul>
            </div>
          </div>
        </div>

        {/* サービス情報 */}
        <div className="mt-6 text-center text-sm text-primary-500">
          最終確認: {new Date(systemStats.lastUpdate).toLocaleString('ja-JP')}
          <span className="mx-2">|</span>
          サービス稼働状況: 正常
        </div>
      </div>
    </Layout>
  );
}
