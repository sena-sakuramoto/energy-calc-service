// frontend/src/pages/dashboard.jsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/FirebaseAuthContext';
import {
  FaBuilding,
  FaCheckCircle,
  FaCalendarAlt,
  FaPlus,
  FaCalculator,
  FaBolt,
  FaYenSign,
  FaArrowRight,
  FaFolder,
  FaInfoCircle,
  FaHeadset,
  FaClock,
} from 'react-icons/fa';

export default function Dashboard() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState([]);
  const [currentDate, setCurrentDate] = useState('');

  // Redirect non-authenticated users
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login?redirect=/dashboard');
    }
  }, [loading, isAuthenticated, router]);

  // Load projects from localStorage and set current date
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Format current date in Japanese
      const now = new Date();
      const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
      };
      setCurrentDate(now.toLocaleDateString('ja-JP', options));

      // Try loading projects from localStorage
      try {
        const stored = localStorage.getItem('projects');
        if (stored) {
          const parsed = JSON.parse(stored);
          setProjects(Array.isArray(parsed) ? parsed : []);
        }
      } catch (e) {
        console.warn('Failed to load projects from localStorage:', e);
      }
    }
  }, []);

  // Don't render while loading or if not authenticated
  if (loading || !isAuthenticated) {
    return (
      <Layout title="Dashboard - 楽々省エネ計算">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-primary-400 text-lg">読み込み中...</div>
        </div>
      </Layout>
    );
  }

  const displayName = user?.displayName || user?.full_name || 'ユーザー';
  const completedCount = projects.filter(
    (p) => p.status === 'completed' || p.status === '完了'
  ).length;

  // Format last activity date
  const getLastActivity = () => {
    if (!user?.lastLoginAt && !user?.loginTime) return '--';
    const dateStr = user.lastLoginAt || user.loginTime;
    try {
      const d = new Date(
        typeof dateStr === 'object' && dateStr.seconds
          ? dateStr.seconds * 1000
          : dateStr
      );
      return d.toLocaleDateString('ja-JP', {
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return '--';
    }
  };

  const recentProjects = projects.slice(0, 5);

  const calculationTools = [
    {
      name: 'BEI計算',
      description: '建築物エネルギー消費性能指標を算出',
      href: '/tools/bei-calculator',
      icon: FaBuilding,
      color: 'bg-primary-700',
    },
    {
      name: 'エネルギー計算',
      description: '電力・エネルギー消費量を計算',
      href: '/tools/energy-calculator',
      icon: FaBolt,
      color: 'bg-accent-500',
    },
    {
      name: '電力料金見積もり',
      description: '電力料金体系に基づく料金試算',
      href: '/tools/tariff-calculator',
      icon: FaYenSign,
      color: 'bg-primary-600',
    },
  ];

  const announcements = [
    {
      id: 1,
      date: '2026-02',
      text: '新デザインにリニューアルしました',
      type: 'update',
    },
    {
      id: 2,
      date: '2026-01',
      text: 'BEI計算ツールに複合用途対応を追加しました',
      type: 'feature',
    },
    {
      id: 3,
      date: '2025-12',
      text: '電力料金見積もりツールを公開しました',
      type: 'feature',
    },
  ];

  return (
    <Layout title="Dashboard - 楽々省エネ計算">
      <div className="max-w-6xl mx-auto">
        {/* ── Welcome Header ── */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-primary-800">
            おかえりなさい、{displayName}さん
          </h1>
          <p className="text-primary-400 mt-1 text-sm">{currentDate}</p>
        </div>

        {/* ── Quick Stats Row ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {/* Total Projects */}
          <div className="bg-white border border-warm-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-primary-100 p-2.5 rounded-lg">
                <FaBuilding className="text-primary-700 text-lg" />
              </div>
            </div>
            <div className="text-2xl font-bold text-primary-800">
              {projects.length}
            </div>
            <div className="text-xs text-primary-400 mt-1">プロジェクト数</div>
          </div>

          {/* Completed Calculations */}
          <div className="bg-white border border-warm-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-green-50 p-2.5 rounded-lg">
                <FaCheckCircle className="text-green-600 text-lg" />
              </div>
            </div>
            <div className="text-2xl font-bold text-primary-800">
              {completedCount}
            </div>
            <div className="text-xs text-primary-400 mt-1">計算完了数</div>
          </div>

          {/* Last Activity */}
          <div className="bg-white border border-warm-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-accent-50 p-2.5 rounded-lg">
                <FaCalendarAlt className="text-accent-500 text-lg" />
              </div>
            </div>
            <div className="text-2xl font-bold text-primary-800">
              {getLastActivity()}
            </div>
            <div className="text-xs text-primary-400 mt-1">最終利用日</div>
          </div>

          {/* Quick Action: New Project */}
          <Link
            href="/projects/new"
            className="bg-primary-800 hover:bg-primary-900 border border-primary-700 rounded-xl p-5 shadow-sm transition-colors duration-200 group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="bg-primary-700 p-2.5 rounded-lg">
                <FaPlus className="text-white text-lg" />
              </div>
            </div>
            <div>
              <div className="text-sm font-bold text-white">新規プロジェクト</div>
              <div className="text-xs text-primary-400 mt-1 group-hover:text-primary-300 transition-colors">
                プロジェクトを作成
              </div>
            </div>
          </Link>
        </div>

        {/* ── Quick Actions Section (2 columns) ── */}
        <div className="grid lg:grid-cols-2 gap-6 mb-10">
          {/* Left: Recent Projects */}
          <div className="bg-white border border-warm-200 rounded-xl shadow-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-warm-100">
              <h2 className="text-lg font-bold text-primary-800 flex items-center gap-2">
                <FaFolder className="text-primary-500" />
                最近のプロジェクト
              </h2>
              <Link
                href="/projects"
                className="text-sm text-accent-500 hover:text-accent-600 font-medium flex items-center gap-1"
              >
                すべて表示 <FaArrowRight className="text-xs" />
              </Link>
            </div>
            <div className="p-4">
              {recentProjects.length > 0 ? (
                <ul className="divide-y divide-warm-100">
                  {recentProjects.map((project, index) => (
                    <li key={project.id || index}>
                      <Link
                        href={`/projects/${project.id || index}`}
                        className="flex items-center justify-between py-3 px-2 rounded-lg hover:bg-warm-50 transition-colors duration-150"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium text-primary-800 truncate">
                            {project.name || project.title || `プロジェクト ${index + 1}`}
                          </div>
                          <div className="text-xs text-primary-400 mt-0.5 flex items-center gap-2">
                            {project.buildingType && (
                              <span>{project.buildingType}</span>
                            )}
                            {project.date && <span>{project.date}</span>}
                          </div>
                        </div>
                        <span
                          className={`text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 ml-3 ${
                            project.status === 'completed' || project.status === '完了'
                              ? 'bg-green-50 text-green-700'
                              : project.status === 'in_progress' || project.status === '進行中'
                              ? 'bg-accent-50 text-accent-600'
                              : 'bg-warm-100 text-primary-500'
                          }`}
                        >
                          {project.status === 'completed'
                            ? '完了'
                            : project.status === 'in_progress'
                            ? '進行中'
                            : project.status || '下書き'}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="py-12 text-center">
                  <div className="bg-warm-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaFolder className="text-primary-300 text-2xl" />
                  </div>
                  <p className="text-primary-500 font-medium mb-1">
                    プロジェクトを作成しましょう
                  </p>
                  <p className="text-primary-400 text-sm mb-4">
                    省エネ計算を始めるには、まずプロジェクトを作成してください
                  </p>
                  <Link
                    href="/projects/new"
                    className="inline-flex items-center gap-2 bg-primary-700 hover:bg-primary-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors duration-200"
                  >
                    <FaPlus className="text-xs" />
                    新規プロジェクト作成
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Right: Calculation Tools */}
          <div className="bg-white border border-warm-200 rounded-xl shadow-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-warm-100">
              <h2 className="text-lg font-bold text-primary-800 flex items-center gap-2">
                <FaCalculator className="text-primary-500" />
                計算ツール
              </h2>
            </div>
            <div className="p-4 space-y-2">
              {calculationTools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <Link
                    key={tool.href}
                    href={tool.href}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-warm-50 transition-colors duration-150 group"
                  >
                    <div
                      className={`${tool.color} w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0`}
                    >
                      <Icon className="text-white text-lg" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-primary-800 group-hover:text-accent-500 transition-colors">
                        {tool.name}
                      </div>
                      <div className="text-xs text-primary-400">
                        {tool.description}
                      </div>
                    </div>
                    <FaArrowRight className="text-primary-300 text-xs group-hover:text-accent-400 transition-colors flex-shrink-0" />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Bottom Section ── */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Announcements */}
          <div className="lg:col-span-2 bg-white border border-warm-200 rounded-xl shadow-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-warm-100">
              <h2 className="text-lg font-bold text-primary-800 flex items-center gap-2">
                <FaInfoCircle className="text-primary-500" />
                お知らせ
              </h2>
            </div>
            <div className="p-4">
              <ul className="divide-y divide-warm-100">
                {announcements.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-start gap-3 py-3 px-2"
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      <span
                        className={`inline-block w-2 h-2 rounded-full ${
                          item.type === 'update'
                            ? 'bg-accent-500'
                            : 'bg-primary-400'
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-primary-700">
                        {item.text}
                      </div>
                      <div className="text-xs text-primary-400 mt-0.5 flex items-center gap-1">
                        <FaClock className="text-[10px]" />
                        {item.date}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Support */}
          <div className="bg-warm-50 border border-warm-200 rounded-xl shadow-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-warm-100">
              <h2 className="text-lg font-bold text-primary-800 flex items-center gap-2">
                <FaHeadset className="text-primary-500" />
                サポート
              </h2>
            </div>
            <div className="p-6 text-center">
              <div className="bg-white w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-warm-200">
                <FaHeadset className="text-primary-500 text-xl" />
              </div>
              <p className="text-sm text-primary-600 mb-1 font-medium">
                お困りのことはありませんか?
              </p>
              <p className="text-xs text-primary-400 mb-4">
                使い方やご質問など、お気軽にどうぞ
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 bg-primary-700 hover:bg-primary-800 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors duration-200"
              >
                お問い合わせ
                <FaArrowRight className="text-xs" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
