import Link from 'next/link';
import { FaCalculator, FaCheckCircle, FaFileDownload, FaHome, FaUpload } from 'react-icons/fa';

import Layout from '../components/Layout';
import useReveal from '../components/useReveal';
import CountUp from '../components/CountUp';
import HeroBg from '../components/HeroBg';

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

/* ═══ Dashboard Mockup ═══ */
function Dashboard() {
  return (
    <div className="rounded-2xl overflow-hidden border border-white/[.06] bg-gradient-to-b from-[#0c1c33] to-[#091628] shadow-[0_0_80px_rgba(56,189,248,.06),0_30px_60px_rgba(0,0,0,.5)]">
      {/* Title bar */}
      <div className="flex items-center gap-3 px-5 py-3 border-b border-white/[.04] bg-white/[.01]">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
          <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
          <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
        </div>
        <div className="flex-1 mx-8">
          <div className="w-48 h-5 bg-white/[.03] rounded-full mx-auto" />
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-40 border-r border-white/[.04] py-4 px-3 space-y-0.5 hidden sm:block">
          {[
            { label: '概要', active: false },
            { label: '外皮性能', active: false },
            { label: '空調', active: false },
            { label: '照明', active: false },
            { label: '計算結果', active: true },
          ].map((item) => (
            <div key={item.label} className={`text-[11px] px-3 py-2.5 rounded-lg transition-colors ${item.active ? 'bg-sky-500/10 text-sky-400 font-medium' : 'text-white/20'}`}>
              {item.label}
            </div>
          ))}
        </div>

        {/* Main */}
        <div className="flex-1 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-[10px] text-white/25 uppercase tracking-wider mb-1">BEI値</p>
              <div className="flex items-baseline gap-3">
                <span className="text-5xl font-bold text-white tracking-tighter">0.85</span>
                <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-full">✓ 適合</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-white/25 uppercase tracking-wider mb-1">省エネ率</p>
              <span className="text-2xl font-bold text-sky-400">15<span className="text-base">%</span></span>
            </div>
          </div>

          {/* Chart */}
          <div className="h-36 relative mb-5 bg-white/[.01] rounded-xl p-3">
            <svg viewBox="0 0 420 130" className="w-full h-full" preserveAspectRatio="none">
              <defs>
                <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
                </linearGradient>
              </defs>
              {[25, 50, 75, 100].map((y) => (
                <line key={y} x1="0" y1={y} x2="420" y2={y} stroke="rgba(255,255,255,.02)" />
              ))}
              {/* Reference line BEI=1.0 */}
              <line x1="0" y1="35" x2="420" y2="35" stroke="#f59e0b" strokeWidth="1" strokeDasharray="4,4" opacity="0.2" />
              <text x="425" y="38" fill="#f59e0b" opacity="0.3" fontSize="8" fontFamily="sans-serif">1.0</text>

              <path d="M0,95 C40,90 70,65 110,58 C150,52 175,68 215,42 C255,18 295,32 335,22 C365,16 395,20 420,17 L420,130 L0,130Z" fill="url(#cg)" />
              <path d="M0,95 C40,90 70,65 110,58 C150,52 175,68 215,42 C255,18 295,32 335,22 C365,16 395,20 420,17" fill="none" stroke="#38bdf8" strokeWidth="2" />

              {[[110, 58], [215, 42], [335, 22]].map(([x, y], i) => (
                <g key={i}>
                  <circle cx={x} cy={y} r="6" fill="#38bdf8" opacity="0.12" />
                  <circle cx={x} cy={y} r="3" fill="#38bdf8" />
                </g>
              ))}
            </svg>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { l: '空調', v: '0.82', c: 'text-sky-400', bg: 'bg-sky-400/[.04]' },
              { l: '照明', v: '0.91', c: 'text-emerald-400', bg: 'bg-emerald-400/[.04]' },
              { l: '給湯', v: '0.78', c: 'text-amber-400', bg: 'bg-amber-400/[.04]' },
              { l: '換気', v: '0.88', c: 'text-violet-400', bg: 'bg-violet-400/[.04]' },
            ].map((s) => (
              <div key={s.l} className={`${s.bg} rounded-xl p-3 border border-white/[.03]`}>
                <p className="text-[9px] text-white/20 mb-1.5">{s.l}</p>
                <p className={`text-lg font-bold ${s.c}`}>{s.v}</p>
              </div>
            ))}
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
        <section className="relative min-h-screen overflow-hidden">
          <HeroBg />

          <div className="relative z-10 max-w-5xl mx-auto px-6 pt-36 text-center">
            <h1 className="reveal text-[2.5rem] sm:text-5xl md:text-[3.8rem] font-bold text-white leading-[1.12] tracking-tight mb-6">
              省エネ計算を
              <br />
              <span className="font-mono tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-sky-300 to-cyan-400" style={{ textShadow: '0 0 60px rgba(56,189,248,.25)' }}>
                5分
              </span>
              で終わらせる。
            </h1>

            <p className="reveal reveal-d1 text-[15px] text-white/35 mb-10 max-w-lg mx-auto leading-relaxed">
              選択式の入力で公式PDFを自動出力。外注不要。専門知識不要。
            </p>

            <div className="reveal reveal-d2 mb-16">
              <a href={`${APP}/register`} className="inline-flex items-center gap-2 text-[12px] font-semibold tracking-[.1em] text-white border border-white/15 hover:border-white/30 hover:bg-white/[.05] px-8 py-3.5 rounded-full transition-all duration-300">
                無料で始める
              </a>
            </div>

            {/* Floating Dashboard */}
            <div className="reveal reveal-d3 mx-auto max-w-2xl relative">
              <Dashboard />
              <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-[80%] h-24 bg-sky-500/[.05] blur-[50px] rounded-full" />
            </div>
          </div>
        </section>

        {/* ═══ STATS ═══ */}
        <section className="py-16 px-6 bg-[#050b18] border-y border-white/[.04]">
          <div className="max-w-3xl mx-auto">
            <div className="reveal grid grid-cols-3">
              {[
                { end: 5, suffix: '分', label: '計算完了' },
                { end: 38, prefix: 'v', label: '国交省API' },
                { end: 0, display: '0円〜', label: '基本機能' },
              ].map((s, i) => (
                <div key={s.label} className={`text-center py-6 reveal-d${i + 1} ${i < 2 ? 'border-r border-white/[.04]' : ''}`}>
                  <p className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                    {s.display || <CountUp end={s.end} prefix={s.prefix || ''} suffix={s.suffix || ''} />}
                  </p>
                  <p className="text-[10px] text-white/15 mt-2 uppercase tracking-[.15em]">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ FEATURES ═══ */}
        <section id="features" className="py-24 px-6 bg-[#050b18] bg-grid">
          <div className="max-w-4xl mx-auto">
            <p className="reveal text-[10px] font-semibold text-sky-400/50 uppercase tracking-[.2em] mb-3">Features</p>
            <h2 className="reveal reveal-d1 text-3xl md:text-4xl font-bold text-white tracking-tight mb-16">できること</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {features.map((f, i) => {
                const Icon = f.icon;
                return (
                  <div key={f.title} className={`reveal reveal-d${i + 1} group glass rounded-2xl p-7 hover:border-sky-400/15 transition-all duration-500`}>
                    <div className="w-10 h-10 rounded-xl bg-sky-400/[.06] flex items-center justify-center mb-5 group-hover:bg-sky-400/10 transition-colors">
                      <Icon className="text-sky-400 text-sm" />
                    </div>
                    <h3 className="text-[15px] font-bold text-white mb-2">{f.title}</h3>
                    <p className="text-[13px] text-white/25 leading-relaxed">{f.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ═══ STEPS ═══ */}
        <section className="py-24 px-6 bg-[#050b18]">
          <div className="max-w-4xl mx-auto">
            <p className="reveal text-[10px] font-semibold text-sky-400/50 uppercase tracking-[.2em] mb-3">Process</p>
            <h2 className="reveal reveal-d1 text-3xl md:text-4xl font-bold text-white tracking-tight mb-20">3ステップで完了</h2>

            {[
              { n: '01', title: '建物情報を入力', desc: '用途・地域・面積を選択するだけ。' },
              { n: '02', title: '設備を選択', desc: '空調・照明・給湯をプルダウンから。' },
              { n: '03', title: 'PDF出力', desc: '公式PDFをダウンロード → 確認申請へ。' },
            ].map((s, i) => (
              <div key={s.n} className={`reveal reveal-d${i + 1} group flex items-start gap-8 py-8 ${i < 2 ? 'border-b border-white/[.04]' : ''}`}>
                <span className="text-5xl font-bold text-white/[.04] group-hover:text-sky-400/20 transition-colors duration-500 leading-none w-24 flex-shrink-0 select-none font-mono">
                  {s.n}
                </span>
                <div>
                  <h3 className="text-lg font-bold text-white mb-1.5">{s.title}</h3>
                  <p className="text-sm text-white/25">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══ COMPARISON ═══ */}
        <section className="py-24 px-6 bg-[#050b18] bg-grid">
          <div className="max-w-3xl mx-auto">
            <p className="reveal text-[10px] font-semibold text-sky-400/50 uppercase tracking-[.2em] mb-3">Comparison</p>
            <h2 className="reveal reveal-d1 text-3xl md:text-4xl font-bold text-white tracking-tight mb-16">従来との比較</h2>

            <div className="reveal glass rounded-2xl overflow-hidden">
              <div className="grid grid-cols-[1fr_1fr] text-[10px] font-semibold uppercase tracking-[.12em]">
                <div className="px-6 py-4 text-white/15 border-b border-white/[.04]">従来</div>
                <div className="px-6 py-4 text-sky-400/50 border-b border-white/[.04] border-l border-white/[.04]">楽々省エネ計算</div>
              </div>
              {[
                { l: '所要時間', b: '1〜3日', a: '5〜10分' },
                { l: '費用', b: '5万円〜/件', a: '無料〜' },
                { l: '出力', b: '手作業で作成', a: '自動PDF出力' },
                { l: '学習コスト', b: 'マニュアル必須', a: '選択式で直感的' },
              ].map((r, i) => (
                <div key={r.l} className={`grid grid-cols-[1fr_1fr] ${i < 3 ? 'border-b border-white/[.04]' : ''}`}>
                  <div className="px-6 py-5">
                    <p className="text-[9px] text-white/10 uppercase tracking-wider mb-1">{r.l}</p>
                    <p className="text-sm text-white/20">{r.b}</p>
                  </div>
                  <div className="px-6 py-5 border-l border-white/[.04]">
                    <p className="text-[9px] text-sky-400/25 uppercase tracking-wider mb-1">{r.l}</p>
                    <p className="text-sm font-semibold text-sky-400 flex items-center gap-1.5">
                      <FaCheckCircle className="text-emerald-400 text-[10px]" /> {r.a}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ FAQ ═══ */}
        <section id="faq" className="py-24 px-6 bg-[#050b18]">
          <div className="max-w-2xl mx-auto">
            <p className="reveal text-[10px] font-semibold text-sky-400/50 uppercase tracking-[.2em] mb-3">FAQ</p>
            <h2 className="reveal reveal-d1 text-3xl md:text-4xl font-bold text-white tracking-tight mb-14">よくある質問</h2>

            <div className="space-y-2">
              {faqs.map((f, i) => (
                <details key={f.q} className={`reveal reveal-d${(i % 4) + 1} group glass rounded-xl overflow-hidden`}>
                  <summary className="cursor-pointer px-6 py-5 text-[14px] font-semibold text-white/70 flex items-center justify-between select-none">
                    {f.q}
                    <span className="w-5 h-5 rounded-full bg-white/[.03] flex items-center justify-center flex-shrink-0 ml-3">
                      <svg className="w-3 h-3 text-white/15 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </span>
                  </summary>
                  <div className="px-6 pb-5 text-[13px] text-white/25 leading-relaxed">{f.a}</div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ CTA ═══ */}
        <section className="py-24 px-6 bg-[#050b18] relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,.04)_0%,transparent_60%)]" />
          <div className="reveal max-w-2xl mx-auto text-center relative">
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">今すぐ始めましょう</h2>
            <p className="text-sm text-white/20 mb-10">アカウント作成は1分。カード登録不要。</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href={`${APP}/register`} className="inline-flex items-center justify-center text-[12px] font-semibold tracking-[.1em] text-white border border-white/15 hover:border-white/30 hover:bg-white/[.05] px-8 py-3.5 rounded-full transition-all">
                無料で始める
              </a>
              <Link href="/pricing" className="inline-flex items-center justify-center text-[12px] text-white/25 hover:text-white/50 tracking-[.1em] px-6 py-3.5 transition-colors">
                料金を見る →
              </Link>
            </div>
          </div>
        </section>

      </div>
    </Layout>
  );
}
