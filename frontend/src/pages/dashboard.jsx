// frontend/src/pages/dashboard.jsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/FirebaseAuthContext';
import {
  FaBuilding, FaCheckCircle, FaCalendarAlt, FaPlus, FaCalculator,
  FaBolt, FaYenSign, FaArrowRight, FaFolder, FaInfoCircle,
  FaHeadset, FaClock, FaFileExcel, FaChartBar, FaRocket,
  FaClipboardList, FaFilePdf, FaChevronDown, FaChevronUp, FaStar,
} from 'react-icons/fa';

export default function Dashboard() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState([]);
  const [currentDate, setCurrentDate] = useState('');
  const [announcementsOpen, setAnnouncementsOpen] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login?redirect=/dashboard');
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const now = new Date();
      const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
      setCurrentDate(now.toLocaleDateString('ja-JP', options));
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
  const completedProjects = projects.filter(
    (p) => p.status === 'completed' || p.status === '完了'
  );
  const completedCount = completedProjects.length;
  const isFirstTime = projects.length === 0;

  const getBestBei = () => {
    let best = null;
    for (const p of completedProjects) {
      const bei = p.bei ?? p.beiResult ?? p.result?.bei ?? null;
      if (bei !== null && bei !== undefined) {
        const val = typeof bei === 'number' ? bei : parseFloat(bei);
        if (!isNaN(val) && (best === null || val < best)) best = val;
      }
    }
    return best;
  };
  const bestBei = getBestBei();

  const getLastActivity = () => {
    if (!user?.lastLoginAt && !user?.loginTime) return '--';
    const dateStr = user.lastLoginAt || user.loginTime;
    try {
      const d = new Date(typeof dateStr === 'object' && dateStr.seconds ? dateStr.seconds * 1000 : dateStr);
      return d.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' });
    } catch { return '--'; }
  };
  const recentProjects = projects.slice(0, 5);

  const getBeiStatus = (project) => {
    const bei = project.bei ?? project.beiResult ?? project.result?.bei ?? null;
    if (bei === null || bei === undefined) return null;
    const val = typeof bei === 'number' ? bei : parseFloat(bei);
    if (isNaN(val)) return null;
    return { value: val, compliant: val <= 1.0 };
  };

  const getBeiColor = (val) => { if (val <= 0.8) return 'text-green-600'; if (val <= 1.0) return 'text-accent-500'; return 'text-red-500'; };
  const getBeiBarColor = (val) => { if (val <= 0.8) return 'bg-green-500'; if (val <= 1.0) return 'bg-accent-500'; return 'bg-red-500'; };

  const announcements = [
    { id: 1, date: '2026-02', text: '新デザインにリニューアルしました', type: 'update' },
    { id: 2, date: '2026-01', text: '公式BEI計算フロー（様式入力）を公開しました', type: 'feature' },
    { id: 3, date: '2025-12', text: '電力料金見積もりツールを公開しました', type: 'feature' },
  ];

  return (
    <Layout title="Dashboard - 楽々省エネ計算">
      <div className="max-w-6xl mx-auto">
        {/* Welcome Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-primary-800">
            {isFirstTime
              ? `ようこそ、${displayName}さん`
              : `おかえりなさい、${displayName}さん`}
          </h1>
          <p className="text-primary-400 mt-1 text-sm">{currentDate}</p>
        </div>

        {/* Quick Action Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link href="/tools/official-bei" className="md:col-span-1 relative overflow-hidden bg-accent-500 hover:bg-accent-600 rounded-xl p-6 shadow-md transition-all duration-200 group">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-white/20 p-2.5 rounded-lg"><FaCalculator className="text-white text-xl" /></div>
                <span className="text-white/80 text-xs font-medium uppercase tracking-wider">メインツール</span>
              </div>
              <div className="text-white text-lg md:text-xl font-bold mb-1">BEI計算を始める</div>
              <div className="text-white/70 text-sm">国交省公式APIで即座にBEI算出</div>
              <div className="mt-3 inline-flex items-center gap-2 text-white text-sm font-medium">計算画面へ <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform duration-200" /></div>
            </div>
            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full" />
            <div className="absolute -right-2 -bottom-2 w-20 h-20 bg-white/5 rounded-full" />
          </Link>

          <Link href="/projects/new" className="bg-primary-800 hover:bg-primary-900 rounded-xl p-6 shadow-sm transition-colors duration-200 group flex flex-col justify-between">
            <div className="flex items-center gap-3 mb-2"><div className="bg-primary-700 p-2.5 rounded-lg"><FaPlus className="text-white text-lg" /></div></div>
            <div>
              <div className="text-white font-bold mb-0.5">プロジェクト作成</div>
              <div className="text-primary-400 text-sm group-hover:text-primary-300 transition-colors">新しい建物の省エネ計算を開始</div>
            </div>
          </Link>

          <Link href="/tools/official-bei" className="bg-white border border-warm-200 hover:border-accent-300 rounded-xl p-6 shadow-sm transition-colors duration-200 group flex flex-col justify-between">
            <div className="flex items-center gap-3 mb-2"><div className="bg-green-50 p-2.5 rounded-lg"><FaFileExcel className="text-green-600 text-lg" /></div></div>
            <div>
              <div className="text-primary-800 font-bold mb-0.5 group-hover:text-accent-500 transition-colors">Excelアップロード</div>
              <div className="text-primary-400 text-sm">既存の様式データから計算</div>
            </div>
          </Link>
        </div>

        {/* First-Time User Onboarding */}
        {isFirstTime && (
          <div className="mb-8 bg-gradient-to-br from-accent-50 via-white to-warm-50 border border-accent-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 md:p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-accent-100 p-2.5 rounded-lg"><FaRocket className="text-accent-500 text-xl" /></div>
                <div>
                  <h2 className="text-lg font-bold text-primary-800">はじめてのBEI計算</h2>
                  <p className="text-primary-500 text-sm">3ステップで省エネ基準への適合を確認できます</p>
                </div>
              </div>
              <div className="bg-white/70 rounded-lg p-4 mb-6 border border-warm-100">
                <p className="text-sm text-primary-600 leading-relaxed">
                  <span className="font-bold text-primary-800">BEI（Building Energy Index）</span>とは、建築物の省エネルギー性能を示す指標です。
                  2025年4月からすべての新築建築物に省エネ基準適合が義務化されました。
                  BEI値が<span className="font-bold text-green-600"> 1.0以下</span>であれば基準適合となります。
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-lg p-4 border border-warm-100 text-center">
                  <div className="bg-accent-50 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3"><span className="text-accent-500 font-bold text-sm">1</span></div>
                  <div className="flex justify-center mb-2"><FaClipboardList className="text-accent-400 text-xl" /></div>
                  <div className="text-sm font-bold text-primary-800 mb-1">建物情報を入力</div>
                  <div className="text-xs text-primary-400">様式A～Iに沿って建物の仕様を入力</div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-warm-100 text-center">
                  <div className="bg-accent-50 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3"><span className="text-accent-500 font-bold text-sm">2</span></div>
                  <div className="flex justify-center mb-2"><FaChartBar className="text-accent-400 text-xl" /></div>
                  <div className="text-sm font-bold text-primary-800 mb-1">BEI自動計算</div>
                  <div className="text-xs text-primary-400">国交省公式APIで正確なBEI値を算出</div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-warm-100 text-center">
                  <div className="bg-accent-50 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3"><span className="text-accent-500 font-bold text-sm">3</span></div>
                  <div className="flex justify-center mb-2"><FaFilePdf className="text-accent-400 text-xl" /></div>
                  <div className="text-sm font-bold text-primary-800 mb-1">公式PDF出力</div>
                  <div className="text-xs text-primary-400">申請に使える公式フォーマットで出力</div>
                </div>
              </div>
              <div className="text-center">
                <Link href="/tools/official-bei" className="inline-flex items-center gap-2 bg-accent-500 hover:bg-accent-600 text-white font-bold px-8 py-3 rounded-lg shadow-sm transition-colors duration-200 text-base">
                  <FaCalculator /> 最初のBEI計算を始める <FaArrowRight className="text-sm" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border border-warm-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3"><div className="bg-primary-100 p-2.5 rounded-lg"><FaBuilding className="text-primary-700 text-lg" /></div></div>
            {isFirstTime ? (<><div className="text-2xl font-bold text-primary-300">--</div><div className="text-xs text-primary-400 mt-1">最初のプロジェクトを作成しましょう</div></>) : (<><div className="text-2xl font-bold text-primary-800">{projects.length}</div><div className="text-xs text-primary-400 mt-1">プロジェクト数</div></>)}
          </div>
          <div className="bg-white border border-warm-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3"><div className="bg-green-50 p-2.5 rounded-lg"><FaCheckCircle className="text-green-600 text-lg" /></div></div>
            {isFirstTime ? (<><div className="text-2xl font-bold text-primary-300">--</div><div className="text-xs text-primary-400 mt-1">計算完了でカウントされます</div></>) : (<><div className="text-2xl font-bold text-primary-800">{completedCount}</div><div className="text-xs text-primary-400 mt-1">計算完了数</div></>)}
          </div>
          {bestBei !== null ? (
            <div className="bg-white border border-warm-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3"><div className="bg-accent-50 p-2.5 rounded-lg"><FaStar className="text-accent-500 text-lg" /></div></div>
              <div className={`text-2xl font-bold ${getBeiColor(bestBei)}`}>{bestBei.toFixed(2)}</div>
              <div className="text-xs text-primary-400 mt-1">ベストBEI値</div>
              <div className="mt-2">
                <div className="w-full bg-warm-100 rounded-full h-1.5">
                  <div className={`h-1.5 rounded-full transition-all duration-500 ${getBeiBarColor(bestBei)}`} style={{ width: `${Math.min(bestBei * 100, 100)}%` }} />
                </div>
                <div className="flex justify-between mt-0.5">
                  <span className="text-[10px] text-primary-300">0</span>
                  <span className="text-[10px] text-primary-400 font-medium">基準: 1.0</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-warm-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3"><div className="bg-accent-50 p-2.5 rounded-lg"><FaCalendarAlt className="text-accent-500 text-lg" /></div></div>
              {isFirstTime ? (<><div className="text-2xl font-bold text-primary-300">--</div><div className="text-xs text-primary-400 mt-1">BEI計算後に表示されます</div></>) : (<><div className="text-2xl font-bold text-primary-800">{getLastActivity()}</div><div className="text-xs text-primary-400 mt-1">最終利用日</div></>)}
            </div>
          )}
          <Link href="/projects/new" className="bg-primary-800 hover:bg-primary-900 border border-primary-700 rounded-xl p-5 shadow-sm transition-colors duration-200 group flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3"><div className="bg-primary-700 p-2.5 rounded-lg"><FaPlus className="text-white text-lg" /></div></div>
            <div><div className="text-sm font-bold text-white">新規プロジェクト</div><div className="text-xs text-primary-400 mt-1 group-hover:text-primary-300 transition-colors">プロジェクトを作成</div></div>
          </Link>
        </div>

        {/* Calculation Tools Section */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-primary-800 flex items-center gap-2 mb-4"><FaCalculator className="text-primary-500" /> 計算ツール</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/tools/official-bei" className="md:row-span-1 relative bg-white border-2 border-accent-200 hover:border-accent-400 rounded-xl p-6 shadow-sm transition-all duration-200 group overflow-hidden">
              <div className="absolute top-0 right-0 bg-accent-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg">おすすめ</div>
              <div className="flex items-start gap-4">
                <div className="bg-accent-500 w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm"><FaCalculator className="text-white text-2xl" /></div>
                <div className="flex-1 min-w-0">
                  <div className="text-base font-bold text-primary-800 group-hover:text-accent-500 transition-colors mb-1">公式BEI計算（申請対応）</div>
                  <div className="text-sm text-primary-500 leading-relaxed">様式A～I入力で国交省公式APIによる計算。申請に使える公式PDFを出力可能。</div>
                  <div className="mt-3 inline-flex items-center gap-2 text-accent-500 text-sm font-medium">計算を開始 <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform duration-200" /></div>
                </div>
              </div>
            </Link>
            <Link href="/tools/energy-calculator" className="bg-white border border-warm-200 hover:border-primary-300 rounded-xl p-5 shadow-sm transition-all duration-200 group">
              <div className="flex items-start gap-4">
                <div className="bg-primary-600 w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0"><FaBolt className="text-white text-lg" /></div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-primary-800 group-hover:text-accent-500 transition-colors mb-1">エネルギー計算</div>
                  <div className="text-xs text-primary-400">電力・エネルギー消費量を計算</div>
                  <div className="mt-2 flex items-center gap-1 text-primary-400 text-xs font-medium">開く <FaArrowRight className="text-[10px] group-hover:translate-x-0.5 transition-transform duration-200" /></div>
                </div>
              </div>
            </Link>
            <Link href="/tools/tariff-calculator" className="bg-white border border-warm-200 hover:border-primary-300 rounded-xl p-5 shadow-sm transition-all duration-200 group">
              <div className="flex items-start gap-4">
                <div className="bg-primary-700 w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0"><FaYenSign className="text-white text-lg" /></div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-primary-800 group-hover:text-accent-500 transition-colors mb-1">電力料金見積もり</div>
                  <div className="text-xs text-primary-400">電力料金体系に基づく料金試算</div>
                  <div className="mt-2 flex items-center gap-1 text-primary-400 text-xs font-medium">開く <FaArrowRight className="text-[10px] group-hover:translate-x-0.5 transition-transform duration-200" /></div>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Projects */}
        <div className="mb-8">
          <div className="bg-white border border-warm-200 rounded-xl shadow-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-warm-100">
              <h2 className="text-lg font-bold text-primary-800 flex items-center gap-2"><FaFolder className="text-primary-500" /> 最近のプロジェクト</h2>
              {projects.length > 0 && (<Link href="/projects" className="text-sm text-accent-500 hover:text-accent-600 font-medium flex items-center gap-1">すべて表示 <FaArrowRight className="text-xs" /></Link>)}
            </div>
            <div className="p-4">
              {recentProjects.length > 0 ? (
                <ul className="divide-y divide-warm-100">
                  {recentProjects.map((project, index) => {
                    const beiStatus = getBeiStatus(project);
                    return (
                      <li key={project.id || index}>
                        <Link href={`/projects/${project.id || index}`} className="flex items-center justify-between py-3 px-2 rounded-lg hover:bg-warm-50 transition-colors duration-150">
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium text-primary-800 truncate">
                              {project.name || project.title || `プロジェクト ${index + 1}`}
                            </div>
                            <div className="text-xs text-primary-400 mt-0.5 flex items-center gap-2">
                              {project.buildingType && (<span>{project.buildingType}</span>)}
                              {project.date && <span>{project.date}</span>}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                            {beiStatus && (
                              <span className={`text-xs font-bold px-2 py-0.5 rounded ${beiStatus.compliant ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                                BEI {beiStatus.value.toFixed(2)}{' '}
                                {beiStatus.compliant ? '適合' : '不適合'}
                              </span>
                            )}
                            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                              project.status === 'completed' || project.status === '完了'
                                ? 'bg-green-50 text-green-700'
                                : project.status === 'in_progress' || project.status === '進行中'
                                ? 'bg-accent-50 text-accent-600'
                                : 'bg-warm-100 text-primary-500'
                            }`}>
                              {project.status === 'completed' ? '完了' : project.status === 'in_progress' ? '進行中' : project.status || '下書き'}
                            </span>
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="py-10 text-center">
                  <div className="bg-warm-50 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3"><FaFolder className="text-primary-300 text-xl" /></div>
                  <p className="text-primary-500 font-medium mb-1 text-sm">まだプロジェクトがありません</p>
                  <p className="text-primary-400 text-xs mb-4">BEI計算ツールを直接使うか、プロジェクトを作成して管理できます</p>
                  <div className="flex items-center justify-center gap-3">
                    <Link href="/tools/official-bei" className="inline-flex items-center gap-2 bg-accent-500 hover:bg-accent-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors duration-200"><FaCalculator className="text-xs" /> BEI計算を始める</Link>
                    <Link href="/projects/new" className="inline-flex items-center gap-2 bg-white border border-warm-200 hover:border-primary-300 text-primary-700 text-sm font-medium px-4 py-2 rounded-lg transition-colors duration-200"><FaPlus className="text-xs" /> プロジェクト作成</Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* サークル紹介バナー */}
        <div className="mb-8 bg-gradient-to-r from-primary-800 to-primary-900 rounded-xl overflow-hidden shadow-sm">
          <div className="flex flex-col md:flex-row items-center justify-between p-6 gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-primary-400 text-xs font-medium uppercase tracking-wider mb-1">AI建築サークル</p>
              <h3 className="text-white font-bold text-base md:text-lg mb-1">省エネ計算の先へ。全ツール使い放題。</h3>
              <p className="text-primary-400 text-sm">Compass・KOZO・KAKOME・AICommander、月額¥5,000ですべて利用可能</p>
            </div>
            <a href="https://ai-architecture-circle.com" target="_blank" rel="noopener noreferrer"
              className="flex-shrink-0 inline-flex items-center gap-2 bg-accent-500 hover:bg-accent-600 text-white font-bold px-6 py-3 rounded-lg transition-colors duration-200 text-sm whitespace-nowrap">
              サークルを見る <FaArrowRight className="text-xs" />
            </a>
          </div>
        </div>

        {/* Bottom: Announcements (collapsible) + Support (compact) */}
        <div className="flex flex-col md:flex-row items-start gap-4 mb-8">
          <div className="flex-1 w-full bg-white border border-warm-200 rounded-xl shadow-sm overflow-hidden">
            <button onClick={() => setAnnouncementsOpen(!announcementsOpen)} className="w-full flex items-center justify-between px-5 py-3 hover:bg-warm-50 transition-colors duration-150">
              <h3 className="text-sm font-bold text-primary-700 flex items-center gap-2">
                <FaInfoCircle className="text-primary-400 text-xs" /> お知らせ
                <span className="text-xs font-normal text-primary-400">({announcements.length})</span>
              </h3>
              {announcementsOpen ? (<FaChevronUp className="text-primary-400 text-xs" />) : (<FaChevronDown className="text-primary-400 text-xs" />)}
            </button>
            {announcementsOpen && (
              <div className="px-5 pb-4 border-t border-warm-100">
                <ul className="divide-y divide-warm-50">
                  {announcements.map((item) => (
                    <li key={item.id} className="flex items-start gap-2 py-2.5">
                      <span className={`inline-block w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${item.type === 'update' ? 'bg-accent-500' : 'bg-primary-400'}`} />
                      <div className="flex-1 min-w-0">
                        <span className="text-sm text-primary-600">{item.text}</span>
                        <span className="text-xs text-primary-400 ml-2">{item.date}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <Link href="/contact" className="flex items-center gap-3 bg-warm-50 border border-warm-200 rounded-xl px-5 py-3 hover:bg-warm-100 transition-colors duration-150 flex-shrink-0 w-full md:w-auto">
            <FaHeadset className="text-primary-400" />
            <span className="text-sm text-primary-600 font-medium">お困りですか？</span>
            <span className="text-xs text-accent-500 font-medium flex items-center gap-1">お問い合わせ <FaArrowRight className="text-[10px]" /></span>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
