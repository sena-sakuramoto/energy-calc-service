import { FaCheckCircle, FaArrowRight, FaCalculator, FaHome, FaFileDownload, FaBolt, FaYenSign } from 'react-icons/fa';

import Layout from '../components/Layout';
import useReveal from '../components/useReveal';

const APP = 'https://app.rakuraku-energy.archi-prisma.co.jp';

const freeFeatures = [
  '住宅省エネ計算（UA値・ηAC値）のライブプレビュー',
  'エネルギー計算',
  '電力料金の比較・見積もり',
  'プロジェクト管理',
];

const paidFeatures = [
  '国交省公式API連携によるBEI計算',
  '確認申請用 公式PDF出力',
  '住宅の公式検証とPDF出力',
  'Excelアップロード → PDF変換',
  '提出前の改善提案',
];

export default function PricingPage() {
  const w = useReveal();

  return (
    <Layout title="料金 | 楽々省エネ計算" description="公式BEIワークフローと住宅の公式検証に対する料金ページです。" path="/pricing">
      <div ref={w} className="pt-24 pb-20">

        {/* ── ヘッダー ── */}
        <div className="max-w-3xl mx-auto px-6 text-center mb-16">
          <p className="reveal text-[10px] font-semibold text-orange-600 uppercase tracking-[.2em] mb-3">Pricing</p>
          <h1 className="reveal reveal-d1 text-3xl md:text-[2.8rem] font-extrabold text-slate-900 tracking-tight mb-4 leading-tight">
            公式出力が必要なときだけ。
          </h1>
          <p className="reveal reveal-d2 text-[15px] text-slate-400 max-w-lg mx-auto leading-relaxed">
            基本機能は無料。公式PDF出力と住宅の公式検証だけが有料です。
          </p>
        </div>

        {/* ── プランカード ── */}
        <div className="max-w-4xl mx-auto px-6 mb-16">
          <div className="reveal grid grid-cols-1 md:grid-cols-3 gap-5">

            {/* 無料 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-7 flex flex-col">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[.15em] mb-5">Free</p>

              <div className="mb-2">
                <span className="text-5xl font-extrabold text-slate-900">¥0</span>
              </div>
              <p className="text-lg font-bold text-slate-700 mb-1">ずっと無料</p>
              <p className="text-[12px] text-slate-400 mb-6">カード登録不要・期限なし</p>

              <a href={`${APP}/register`} className="block w-full text-center text-[13px] font-semibold border border-slate-200 hover:border-slate-300 text-slate-700 py-3 rounded-xl transition-colors mb-6">
                無料で始める
              </a>

              <ul className="space-y-3 flex-1">
                {freeFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-[13px] text-slate-500">
                    <FaCheckCircle className="text-slate-300 text-[10px] mt-1 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* 月額 — 推奨 */}
            <div className="rounded-2xl border-2 border-orange-300 bg-white p-7 relative shadow-[0_8px_30px_rgba(234,88,12,.08)] flex flex-col">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-[10px] font-bold px-4 py-1.5 rounded-full tracking-wider">
                おすすめ
              </div>
              <p className="text-[10px] font-bold text-orange-600 uppercase tracking-[.15em] mb-5">Monthly</p>

              <div className="mb-2">
                <span className="text-5xl font-extrabold text-slate-900">¥9,800</span>
                <span className="text-base text-slate-400 ml-1">/月</span>
              </div>
              <p className="text-lg font-bold text-slate-700 mb-1">案件数 無制限</p>
              <p className="text-[12px] text-slate-400 mb-6">いつでも解約OK・自動更新</p>

              <a href={`${APP}/register`} className="block w-full text-center text-[13px] font-semibold bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl transition-colors mb-6">
                月額プランを開始 →
              </a>

              <div className="bg-orange-50 border border-orange-100 rounded-xl px-4 py-3 mb-5">
                <p className="text-[13px] font-bold text-orange-800 mb-1">全案件で使い放題</p>
                <p className="text-[11px] text-orange-600">何案件やっても月額固定。2案件以上なら確実にお得。</p>
              </div>

              <ul className="space-y-3 flex-1">
                {paidFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-[13px] text-slate-600">
                    <FaCheckCircle className="text-orange-500 text-[10px] mt-1 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* 1案件パス */}
            <div className="rounded-2xl border border-slate-200 bg-white p-7 flex flex-col">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[.15em] mb-5">Per project</p>

              <div className="mb-2">
                <span className="text-5xl font-extrabold text-slate-900">¥4,980</span>
                <span className="text-base text-slate-400 ml-1">/回</span>
              </div>
              <p className="text-lg font-bold text-slate-700 mb-1">1回きり・自動更新なし</p>
              <p className="text-[12px] text-slate-400 mb-6">1案件だけ使いたいとき</p>

              <a href={`${APP}/register`} className="block w-full text-center text-[13px] font-semibold border border-slate-200 hover:border-slate-300 text-slate-700 py-3 rounded-xl transition-colors mb-6">
                1案件パスを購入
              </a>

              <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 mb-5">
                <p className="text-[13px] font-bold text-slate-700 mb-1">買い切り・30日間有効</p>
                <p className="text-[11px] text-slate-400">選んだ1プロジェクト専用。終わったらそのまま終了。</p>
              </div>

              <ul className="space-y-3 flex-1">
                <li className="flex items-start gap-2.5 text-[13px] text-slate-500">
                  <FaCheckCircle className="text-emerald-500 text-[10px] mt-1 flex-shrink-0" />
                  <span><span className="font-semibold text-slate-700">自動更新なし</span> — 勝手に課金されない</span>
                </li>
                <li className="flex items-start gap-2.5 text-[13px] text-slate-500">
                  <FaCheckCircle className="text-emerald-500 text-[10px] mt-1 flex-shrink-0" />
                  <span><span className="font-semibold text-slate-700">30日間</span> — 購入日から起算</span>
                </li>
                <li className="flex items-start gap-2.5 text-[13px] text-slate-500">
                  <FaCheckCircle className="text-emerald-500 text-[10px] mt-1 flex-shrink-0" />
                  月額と同じ有料機能がすべて利用可
                </li>
              </ul>

              <p className="mt-auto pt-4 text-[11px] text-slate-400 text-center">
                2案件以上なら → <span className="text-orange-600 font-medium">月額プランが割安</span>
              </p>
            </div>
          </div>
        </div>

        {/* ── 機能比較テーブル ── */}
        <div className="max-w-3xl mx-auto px-6 mb-16">
          <h2 className="reveal text-xl font-bold text-slate-900 mb-6">機能比較</h2>
          <div className="reveal rounded-2xl border border-slate-200 overflow-hidden bg-white">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-400">
                  <th className="px-5 py-3 font-semibold">機能</th>
                  <th className="px-5 py-3 font-semibold text-center">無料</th>
                  <th className="px-5 py-3 font-semibold text-center text-orange-600">月額 / 案件パス</th>
                </tr>
              </thead>
              <tbody className="text-[13px]">
                {[
                  { f: '住宅省エネ計算（プレビュー）', free: true, paid: true },
                  { f: 'エネルギー計算', free: true, paid: true },
                  { f: '電力料金比較', free: true, paid: true },
                  { f: 'プロジェクト管理', free: true, paid: true },
                  { f: '公式BEI計算（国交省API）', free: false, paid: true },
                  { f: '確認申請用 公式PDF出力', free: false, paid: true },
                  { f: '住宅の公式検証 + PDF', free: false, paid: true },
                  { f: 'Excelアップロード → PDF', free: false, paid: true },
                  { f: '提出前の改善提案', free: false, paid: true },
                ].map((row, i) => (
                  <tr key={row.f} className={i < 8 ? 'border-b border-slate-50' : ''}>
                    <td className="px-5 py-3.5 text-slate-600">{row.f}</td>
                    <td className="px-5 py-3.5 text-center">
                      {row.free
                        ? <FaCheckCircle className="text-emerald-500 text-xs mx-auto" />
                        : <span className="text-slate-200">—</span>
                      }
                    </td>
                    <td className="px-5 py-3.5 text-center bg-orange-50/30">
                      <FaCheckCircle className="text-orange-500 text-xs mx-auto" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── AI建築サークル ── */}
        <div className="max-w-3xl mx-auto px-6 mb-16">
          <div className="reveal rounded-2xl border border-slate-200 bg-slate-50 p-6 flex flex-col md:flex-row items-start gap-5">
            <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center flex-shrink-0">
              <span className="text-slate-500 text-sm font-bold">AI</span>
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-slate-900 mb-1">AI建築サークル会員はそのまま利用可能</h3>
              <p className="text-[13px] text-slate-400 leading-relaxed">
                既存のAI建築サークル会員は有料機能を追加費用なしで利用できます。月額¥5,000で省エネ計算を含む全ツールが使い放題です。
              </p>
            </div>
          </div>
        </div>

        {/* ── FAQ ── */}
        <div className="max-w-2xl mx-auto px-6 mb-16">
          <h2 className="reveal text-xl font-bold text-slate-900 mb-6">料金に関するよくある質問</h2>
          <div className="space-y-2">
            {[
              { q: '無料のまま使い続けられますか？', a: '住宅のライブ計算、エネルギー計算、料金比較は無期限で無料です。公式PDF出力が必要なときだけ有料プランを選べます。' },
              { q: '月額プランはいつでも解約できますか？', a: 'はい、いつでも解約可能です。解約後も月末まで利用できます。自動更新を停止するだけで完了します。' },
              { q: '1案件パスと月額、どちらがいい？', a: '月に1案件なら案件パス（¥4,980）、2案件以上なら月額プラン（¥9,800）が割安です。' },
              { q: '支払い方法は？', a: 'クレジットカード（Stripe経由）に対応しています。領収書は自動でメール送信されます。' },
            ].map((f) => (
              <details key={f.q} className="reveal group bg-white rounded-xl border border-slate-100 overflow-hidden hover:border-slate-200 transition-colors">
                <summary className="cursor-pointer px-5 py-4 text-[14px] font-semibold text-slate-800 flex items-center justify-between select-none">
                  {f.q}
                  <span className="w-5 h-5 rounded-full bg-slate-50 group-hover:bg-orange-50 flex items-center justify-center flex-shrink-0 ml-3 transition-colors">
                    <svg className="w-3 h-3 text-slate-300 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </span>
                </summary>
                <div className="px-5 pb-4 text-[13px] text-slate-400 leading-relaxed">{f.a}</div>
              </details>
            ))}
          </div>
        </div>

        {/* ── CTA ── */}
        <div className="max-w-2xl mx-auto px-6">
          <div className="reveal text-center bg-slate-900 rounded-3xl p-10 md:p-14">
            <h2 className="text-2xl font-extrabold text-white tracking-tight mb-3">まずは無料で試しましょう</h2>
            <p className="text-sm text-slate-400 mb-8">アカウント作成は1分。カード登録不要。</p>
            <a href={`${APP}/register`} className="inline-flex items-center justify-center text-[13px] font-semibold text-slate-900 bg-white hover:bg-slate-100 px-8 py-3.5 rounded-xl transition-colors">
              無料で始める →
            </a>
          </div>
        </div>

      </div>
    </Layout>
  );
}
