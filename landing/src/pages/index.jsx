import Link from 'next/link';
import { FaCalculator, FaCheckCircle, FaFileDownload, FaHome, FaUpload } from 'react-icons/fa';

import Layout from '../components/Layout';
import useReveal from '../components/useReveal';
import CountUp from '../components/CountUp';
import HeroBg from '../components/HeroBg';
import AppDemoScene from '../components/AppDemoScene';

const APP = 'https://app.rakuraku-energy.archi-prisma.co.jp';

const features = [
  { icon: FaCalculator, title: 'BEI自動計算', desc: 'モデル建物法に基づくBEI値を選択入力だけで算出。国交省v3.8準拠。' },
  { icon: FaFileDownload, title: '公式PDF出力', desc: '国交省APIと直接連携。確認申請に使える公式様式PDFを自動生成。' },
  { icon: FaUpload, title: 'Excel取込', desc: '既存の公式入力シートをアップロードしてそのままPDF化。' },
  { icon: FaHome, title: '住宅省エネ計算', desc: 'UA値・ηAC値をリアルタイム算定。求積表・計算書PDFも出力。' },
];

const faqs = [
  { q: '無料で使えますか？', a: '基本機能は無料です。公式PDF出力は月額9,800円または1案件4,980円で利用可能。' },
  { q: '確認申請に使える？', a: '国交省v3.8 APIから生成した公式様式PDFは確認申請に使用可能です。' },
  { q: 'WEBPROとの違いは？', a: 'モデル建物法に特化した選択式入力で、同等の結果がはるかに短時間で得られます。' },
  { q: 'データは安全？', a: 'SSL暗号化通信とFirebase認証で安全に管理。第三者にデータは見られません。' },
];

/* ── Dashboard Mockup — 実際のアプリUIを再現 ── */
function Dashboard() {
  const steps = [
    { id: 'A', label: '基本情報', done: true },
    { id: 'B', label: '外皮', done: true },
    { id: 'C', label: '空調', done: true },
    { id: 'D', label: '換気', done: true },
    { id: 'E', label: '照明', done: true },
    { id: 'F', label: '給湯', done: true },
    { id: 'G', label: 'EV他', done: true },
  ];

  return (
    <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-[0_20px_50px_rgba(0,0,0,.08)]">
      {/* ブラウザバー */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-slate-100 bg-slate-50/80">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
        </div>
        <div className="flex-1 mx-6">
          <div className="flex items-center justify-center gap-1.5 bg-slate-100 rounded-md py-1 px-3 max-w-xs mx-auto">
            <svg className="w-2.5 h-2.5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            <span className="text-[10px] text-slate-400">app.rakuraku-energy.archi-prisma.co.jp</span>
          </div>
        </div>
      </div>

      {/* アプリヘッダー */}
      <div className="bg-slate-800 px-5 py-3 flex items-center justify-between">
        <span className="text-[13px] font-bold text-white">楽々省エネ計算</span>
        <div className="flex items-center gap-4 text-[11px] text-slate-400">
          <span>プロジェクト</span>
          <span className="text-white">公式BEI計算</span>
        </div>
      </div>

      {/* ステップバー */}
      <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-1 overflow-x-auto">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center">
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-medium whitespace-nowrap ${
                s.id === 'G' ? 'bg-orange-50 text-orange-600 border border-orange-200' : 'bg-emerald-50 text-emerald-600'
              }`}>
                {s.done && s.id !== 'G' && <FaCheckCircle className="text-[8px]" />}
                <span>様式{s.id}</span>
                <span className="text-slate-400">{s.label}</span>
              </div>
              {i < steps.length - 1 && <div className="w-3 h-px bg-slate-200 mx-0.5" />}
            </div>
          ))}
        </div>
      </div>

      {/* メインコンテンツ — 計算結果画面 */}
      <div className="p-6">
        {/* 結果ヘッダー */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
            <FaCheckCircle className="text-emerald-500 text-sm" />
          </div>
          <div>
            <p className="text-[13px] font-bold text-slate-800">計算完了 — 省エネ基準適合</p>
            <p className="text-[10px] text-slate-400">事務所モデル ｜ 6地域 ｜ 延床面積 2,450㎡</p>
          </div>
        </div>

        {/* BEI値 + 省エネ率 */}
        <div className="grid grid-cols-2 gap-4 mb-5">
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
            <p className="text-[10px] text-slate-400 mb-1">BEI値</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-slate-900 tracking-tight">0.85</span>
              <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">適合</span>
            </div>
            <div className="mt-3 w-full bg-slate-200 rounded-full h-1.5">
              <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '85%' }} />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[9px] text-slate-300">0</span>
              <span className="text-[9px] text-slate-400 font-medium">基準: 1.0</span>
            </div>
          </div>
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
            <p className="text-[10px] text-slate-400 mb-1">省エネ率</p>
            <span className="text-4xl font-bold text-orange-600 tracking-tight">15<span className="text-lg">%</span></span>
            <p className="text-[10px] text-slate-400 mt-3">基準値からの削減率</p>
          </div>
        </div>

        {/* 用途別BEI */}
        <div className="grid grid-cols-4 gap-2 mb-5">
          {[
            { l: '空調', v: '0.82', color: 'border-blue-200 bg-blue-50', tc: 'text-blue-700' },
            { l: '照明', v: '0.91', color: 'border-emerald-200 bg-emerald-50', tc: 'text-emerald-700' },
            { l: '給湯', v: '0.78', color: 'border-amber-200 bg-amber-50', tc: 'text-amber-700' },
            { l: '換気', v: '0.88', color: 'border-violet-200 bg-violet-50', tc: 'text-violet-700' },
          ].map((s) => (
            <div key={s.l} className={`rounded-xl p-3 border ${s.color}`}>
              <p className="text-[9px] text-slate-400 mb-1">{s.l}</p>
              <p className={`text-lg font-bold ${s.tc}`}>{s.v}</p>
            </div>
          ))}
        </div>

        {/* アクションボタン */}
        <div className="flex gap-2">
          <div className="flex items-center gap-1.5 bg-orange-500 text-white text-[11px] font-medium px-4 py-2 rounded-lg">
            <FaFileDownload className="text-[10px]" /> 公式PDF出力
          </div>
          <div className="flex items-center gap-1.5 bg-slate-100 text-slate-600 text-[11px] font-medium px-4 py-2 rounded-lg">
            <FaUpload className="text-[10px]" /> Excelダウンロード
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const w = useReveal();

  return (
    <Layout title="楽々省エネ計算 — 省エネ計算を5分で" description="BEI計算、公式PDF自動出力。建築設計者向け省エネ計算サービス。" path="/">
      <div ref={w}>

        {/* ═══ HERO ═══ */}
        <section className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center">
          <HeroBg />

          <div className="relative z-10 max-w-5xl mx-auto px-6 pt-28 text-center">
            <div className="reveal inline-flex items-center gap-2 bg-orange-50 text-orange-600 text-[11px] font-medium px-4 py-1.5 rounded-full mb-8 border border-orange-100">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
              2025年4月施行の省エネ基準適合義務に対応
            </div>

            <h1 className="reveal reveal-d1 text-4xl sm:text-5xl md:text-[3.5rem] font-extrabold text-slate-900 leading-[1.1] tracking-tight mb-6">
              省エネ計算を<br />
              <span className="text-gradient">5分</span>で終わらせる。
            </h1>

            <p className="reveal reveal-d2 text-[15px] text-slate-400 mb-10 max-w-xl mx-auto leading-relaxed">
              選択式の入力で公式PDFまで一直線。<br className="hidden sm:block" />基本機能は無料、申請用の公式出力だけ必要な分だけ課金。
            </p>

            <div className="reveal reveal-d3 flex gap-3 justify-center mb-16">
              <a href={`${APP}/register`} className="inline-flex items-center gap-2 text-[13px] font-semibold text-white bg-slate-900 hover:bg-slate-800 px-7 py-3 rounded-xl transition-colors shadow-sm">
                無料で始める →
              </a>
              <a href="#features" className="inline-flex items-center text-[13px] text-slate-500 hover:text-slate-700 border border-slate-200 hover:border-slate-300 px-6 py-3 rounded-xl transition-all">
                機能を見る
              </a>
            </div>

            {/* Dashboard */}
            <div className="reveal reveal-d4 mx-auto max-w-2xl">
              <Dashboard />
            </div>
          </div>
        </section>

        {/* ═══ STATS ═══ */}
        <section className="py-16 px-6 border-y border-slate-100">
          <div className="max-w-3xl mx-auto">
            <div className="reveal grid grid-cols-3">
              {[
                { end: 5, suffix: '分', label: '計算完了' },
                { end: 38, prefix: 'v', label: '国交省API' },
                { end: 0, display: '0円〜', label: '基本機能' },
              ].map((s, i) => (
                <div key={s.label} className={`text-center py-6 reveal-d${i + 1} ${i < 2 ? 'border-r border-slate-100' : ''}`}>
                  <p className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
                    {s.display || <CountUp end={s.end} prefix={s.prefix || ''} suffix={s.suffix || ''} />}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-2 uppercase tracking-[.15em]">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ FEATURES ═══ */}
        <section id="features" className="py-24 px-6 bg-slate-50/50 bg-grid">
          <div className="max-w-4xl mx-auto">
            <p className="reveal text-[10px] font-semibold text-orange-600 uppercase tracking-[.2em] mb-3">Features</p>
            <h2 className="reveal reveal-d1 text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-16">できること</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {features.map((f, i) => {
                const Icon = f.icon;
                return (
                  <div key={f.title} className={`reveal reveal-d${i + 1} group glass rounded-2xl p-7 transition-all duration-300`}>
                    <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center mb-5 group-hover:bg-orange-100 transition-colors">
                      <Icon className="text-orange-600 text-sm" />
                    </div>
                    <h3 className="text-[15px] font-bold text-slate-900 mb-2">{f.title}</h3>
                    <p className="text-[13px] text-slate-400 leading-relaxed">{f.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ═══ STEPS ═══ */}
        <section className="py-24 px-6">
          <div className="max-w-4xl mx-auto">
            <p className="reveal text-[10px] font-semibold text-orange-600 uppercase tracking-[.2em] mb-3">Process</p>
            <h2 className="reveal reveal-d1 text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-20">3ステップで完了</h2>

            {[
              { n: '01', title: '建物情報を入力', desc: '用途・地域・面積を選択するだけ。' },
              { n: '02', title: '設備を選択', desc: '空調・照明・給湯をプルダウンから。' },
              { n: '03', title: 'PDF出力', desc: '公式PDFをダウンロード → 確認申請へ。' },
            ].map((s, i) => (
              <div key={s.n} className={`reveal reveal-d${i + 1} group flex items-start gap-8 py-8 ${i < 2 ? 'border-b border-slate-100' : ''}`}>
                <span className="text-5xl font-bold text-slate-100 group-hover:text-orange-100 transition-colors duration-500 leading-none w-24 flex-shrink-0 select-none font-mono">
                  {s.n}
                </span>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1.5">{s.title}</h3>
                  <p className="text-sm text-slate-400">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══ DEMO ═══ */}
        <section className="py-24 px-6 bg-slate-50/50">
          <div className="max-w-4xl mx-auto">
            <p className="reveal text-[10px] font-semibold text-orange-600 uppercase tracking-[.2em] mb-3">Live Demo</p>
            <h2 className="reveal reveal-d1 text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">実際の操作画面</h2>
            <p className="reveal reveal-d2 text-[14px] text-slate-400 mb-12">建物情報を選んで設備を選択するだけ。5分でBEI計算が完了します。</p>

            <div className="reveal reveal-d3 grid md:grid-cols-2 gap-10 items-center">
              <div className="space-y-6">
                {[
                  { n: '01', title: '建物情報を入力', desc: '用途・地域・延床面積を選択。プルダウン式で迷わない。' },
                  { n: '02', title: '設備を選択', desc: '空調・照明・給湯・換気を一覧から選ぶだけ。' },
                  { n: '03', title: 'BEI値と省エネ率が即表示', desc: '国交省v3.8 APIで正確に計算。公式PDFを即出力。' },
                ].map((s) => (
                  <div key={s.n} className="flex items-start gap-4">
                    <span className="text-2xl font-bold text-slate-100 font-mono leading-none w-10 flex-shrink-0">{s.n}</span>
                    <div>
                      <p className="text-[14px] font-bold text-slate-800 mb-1">{s.title}</p>
                      <p className="text-[12px] text-slate-400">{s.desc}</p>
                    </div>
                  </div>
                ))}
                <a href={`${APP}/register`} className="inline-flex items-center gap-2 text-[13px] font-semibold text-white bg-slate-900 hover:bg-slate-800 px-6 py-3 rounded-xl transition-colors shadow-sm">
                  無料で試してみる →
                </a>
              </div>

              <AppDemoScene />
            </div>
          </div>
        </section>

        {/* ═══ COMPARISON ═══ */}
        <section className="py-24 px-6 bg-slate-50/50">
          <div className="max-w-3xl mx-auto">
            <p className="reveal text-[10px] font-semibold text-orange-600 uppercase tracking-[.2em] mb-3">Comparison</p>
            <h2 className="reveal reveal-d1 text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-16">従来との比較</h2>

            <div className="reveal rounded-2xl overflow-hidden border border-slate-200 bg-white">
              <div className="grid grid-cols-[1fr_1fr] text-[10px] font-semibold uppercase tracking-[.12em]">
                <div className="px-6 py-4 text-slate-400 border-b border-slate-100">従来</div>
                <div className="px-6 py-4 text-orange-600 border-b border-slate-100 border-l border-slate-100 bg-orange-50/30">楽々省エネ計算</div>
              </div>
              {[
                { l: '所要時間', b: '1〜3日', a: '5〜10分' },
                { l: '費用', b: '5万円〜/件', a: '0円〜 必要時のみ課金' },
                { l: '出力', b: '手作業で作成', a: '自動PDF出力' },
                { l: '学習コスト', b: 'マニュアル必須', a: '選択式で直感的' },
              ].map((r, i) => (
                <div key={r.l} className={`grid grid-cols-[1fr_1fr] ${i < 3 ? 'border-b border-slate-50' : ''}`}>
                  <div className="px-6 py-5">
                    <p className="text-[9px] text-slate-300 uppercase tracking-wider mb-1">{r.l}</p>
                    <p className="text-sm text-slate-400">{r.b}</p>
                  </div>
                  <div className="px-6 py-5 border-l border-slate-100 bg-orange-50/20">
                    <p className="text-[9px] text-orange-400 uppercase tracking-wider mb-1">{r.l}</p>
                    <p className="text-sm font-semibold text-orange-700 flex items-center gap-1.5">
                      <FaCheckCircle className="text-emerald-500 text-[10px]" /> {r.a}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ FAQ ═══ */}
        <section id="faq" className="py-24 px-6">
          <div className="max-w-2xl mx-auto">
            <p className="reveal text-[10px] font-semibold text-orange-600 uppercase tracking-[.2em] mb-3">FAQ</p>
            <h2 className="reveal reveal-d1 text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-14">よくある質問</h2>

            <div className="space-y-2">
              {faqs.map((f, i) => (
                <details key={f.q} className={`reveal reveal-d${(i % 4) + 1} group bg-white rounded-xl border border-slate-100 overflow-hidden hover:border-slate-200 transition-colors`}>
                  <summary className="cursor-pointer px-6 py-5 text-[14px] font-semibold text-slate-800 flex items-center justify-between select-none">
                    {f.q}
                    <span className="w-5 h-5 rounded-full bg-slate-50 group-hover:bg-orange-50 flex items-center justify-center flex-shrink-0 ml-3 transition-colors">
                      <svg className="w-3 h-3 text-slate-300 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </span>
                  </summary>
                  <div className="px-6 pb-5 text-[13px] text-slate-400 leading-relaxed">{f.a}</div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ CTA ═══ */}
        <section className="py-24 px-6">
          <div className="reveal max-w-2xl mx-auto text-center bg-slate-900 rounded-3xl p-12 md:p-16">
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight mb-3">今すぐ始めましょう</h2>
            <p className="text-sm text-slate-400 mb-10">アカウント作成は1分。カード登録不要。</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href={`${APP}/register`} className="inline-flex items-center justify-center text-[13px] font-semibold text-slate-900 bg-white hover:bg-slate-100 px-8 py-3.5 rounded-xl transition-colors">
                無料で始める →
              </a>
              <Link href="/pricing" className="inline-flex items-center justify-center text-[13px] text-white/50 hover:text-white/80 px-6 py-3.5 transition-colors">
                料金を見る
              </Link>
            </div>
          </div>
        </section>

      </div>
    </Layout>
  );
}
