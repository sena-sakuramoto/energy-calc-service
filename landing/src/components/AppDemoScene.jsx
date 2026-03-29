import { useState, useEffect } from 'react';
import { FaCheckCircle, FaFileDownload } from 'react-icons/fa';

const PHASES = [
  { label: 'STEP 1 — 建物情報', duration: 3000 },
  { label: 'STEP 2 — 設備仕様', duration: 2500 },
  { label: '計算中...', duration: 1800 },
  { label: '計算完了', duration: 3500 },
];

const EQUIPMENT = [
  { label: '空調', value: 'パッケージ型エアコン', textCls: 'text-blue-700', dotCls: 'text-blue-400' },
  { label: '照明', value: 'LED照明（センサー付）', textCls: 'text-emerald-700', dotCls: 'text-emerald-400' },
  { label: '給湯', value: 'ガスヒートポンプ', textCls: 'text-amber-700', dotCls: 'text-amber-400' },
  { label: '換気', value: '全熱交換型換気扇', textCls: 'text-violet-700', dotCls: 'text-violet-400' },
];

export default function AppDemoScene() {
  const [phase, setPhase] = useState(0);
  const [areaText, setAreaText] = useState('');

  /* フェーズ自動進行 */
  useEffect(() => {
    const t = setTimeout(() => {
      setPhase((p) => (p + 1) % PHASES.length);
    }, PHASES[phase].duration);
    return () => clearTimeout(t);
  }, [phase]);

  /* 延床面積タイピングアニメーション */
  useEffect(() => {
    if (phase === 0) {
      const target = '2,450';
      let i = 0;
      setAreaText('');
      const interval = setInterval(() => {
        i++;
        setAreaText(target.slice(0, i));
        if (i >= target.length) clearInterval(interval);
      }, 220);
      return () => clearInterval(interval);
    }
  }, [phase]);

  return (
    <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-[0_24px_60px_rgba(0,0,0,.09)]">

      {/* ブラウザバー */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-slate-100 bg-slate-50/80">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
        </div>
        <div className="flex-1 mx-4">
          <div className="flex items-center justify-center gap-1.5 bg-slate-100 rounded-md py-1 px-3 max-w-xs mx-auto">
            <svg className="w-2.5 h-2.5 text-slate-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span className="text-[10px] text-slate-400">app.rakuraku-energy.archi-prisma.co.jp</span>
          </div>
        </div>
      </div>

      {/* アプリヘッダー */}
      <div className="bg-slate-800 px-5 py-3 flex items-center justify-between">
        <span className="text-[13px] font-bold text-white">楽々省エネ計算</span>
        <div className="flex items-center gap-1.5">
          {PHASES.map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all duration-400 ${
                phase === i ? 'w-4 h-1.5 bg-orange-400' : 'w-1.5 h-1.5 bg-slate-600'
              }`}
            />
          ))}
        </div>
      </div>

      {/* コンテンツエリア */}
      <div className="relative overflow-hidden" style={{ minHeight: '280px' }}>

        {/* フェーズ0: 建物情報入力 */}
        <div className={`p-5 transition-all duration-500 ${
          phase === 0 ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3 absolute inset-0 pointer-events-none'
        }`}>
          <p className="text-[10px] font-semibold text-orange-500 uppercase tracking-[.15em] mb-3">
            {PHASES[0].label}
          </p>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[9px] text-slate-400 mb-1.5">建物用途</p>
                <div className="bg-orange-50 border border-orange-200 rounded-lg px-3 py-2 text-[11px] font-medium text-orange-700 flex items-center justify-between">
                  事務所等
                  <FaCheckCircle className="text-orange-400 text-[9px]" />
                </div>
              </div>
              <div>
                <p className="text-[9px] text-slate-400 mb-1.5">地域区分</p>
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 text-[11px] font-medium text-emerald-700 flex items-center justify-between">
                  6地域
                  <FaCheckCircle className="text-emerald-400 text-[9px]" />
                </div>
              </div>
            </div>
            <div>
              <p className="text-[9px] text-slate-400 mb-1.5">延床面積（㎡）</p>
              <div className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-[11px] text-slate-800 flex items-center gap-0.5">
                <span>{areaText}</span>
                <span className="inline-block w-px h-3 bg-orange-500 animate-pulse" />
              </div>
            </div>
            <div className="bg-slate-50 rounded-lg px-3 py-2 flex items-center justify-between">
              <span className="text-[9px] text-slate-400">階数</span>
              <span className="text-[10px] text-slate-600 font-medium">5階建て</span>
            </div>
          </div>
        </div>

        {/* フェーズ1: 設備選択 */}
        <div className={`p-5 transition-all duration-500 ${
          phase === 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 absolute inset-0 pointer-events-none'
        }`}>
          <p className="text-[10px] font-semibold text-orange-500 uppercase tracking-[.15em] mb-3">
            {PHASES[1].label}
          </p>
          <div className="space-y-2">
            {EQUIPMENT.map((item) => (
              <div key={item.label} className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2.5">
                <span className="text-[9px] text-slate-400 w-7 flex-shrink-0">{item.label}</span>
                <span className={`text-[10px] font-medium flex-1 ${item.textCls}`}>{item.value}</span>
                <FaCheckCircle className={`${item.dotCls} text-[9px] flex-shrink-0`} />
              </div>
            ))}
          </div>
        </div>

        {/* フェーズ2: 計算中 */}
        <div className={`p-5 absolute inset-0 flex flex-col items-center justify-center transition-all duration-500 ${
          phase === 2 ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}>
          <div className="w-10 h-10 border-2 border-slate-200 border-t-orange-500 rounded-full animate-spin mb-4" />
          <p className="text-[12px] font-bold text-slate-700 mb-1">国交省APIで計算中</p>
          <p className="text-[10px] text-slate-400">v3.8準拠の正式計算を実行しています...</p>
        </div>

        {/* フェーズ3: 結果 */}
        <div className={`p-5 absolute inset-0 transition-all duration-500 ${
          phase === 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <FaCheckCircle className="text-emerald-500 text-[10px]" />
            </div>
            <p className="text-[12px] font-bold text-slate-800">計算完了 — 省エネ基準に適合</p>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <p className="text-[9px] text-slate-400 mb-1">BEI値</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-bold text-slate-900 tracking-tight">0.85</span>
                <span className="text-[9px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">適合</span>
              </div>
              <div className="mt-2 w-full bg-slate-200 rounded-full h-1">
                <div className="bg-emerald-500 h-1 rounded-full" style={{ width: '85%' }} />
              </div>
              <div className="flex justify-between mt-0.5">
                <span className="text-[8px] text-slate-300">0</span>
                <span className="text-[8px] text-slate-400">基準: 1.0</span>
              </div>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <p className="text-[9px] text-slate-400 mb-1">省エネ率</p>
              <span className="text-3xl font-bold text-orange-600 tracking-tight">
                15<span className="text-base">%</span>
              </span>
              <p className="text-[9px] text-slate-400 mt-2">基準値からの削減率</p>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="flex items-center gap-1.5 bg-orange-500 text-white text-[10px] font-bold px-4 py-2 rounded-lg shadow-sm shadow-orange-200/60 animate-pulse">
              <FaFileDownload className="text-[9px]" /> 公式PDF出力
            </div>
            <div className="flex items-center gap-1.5 bg-slate-100 text-slate-500 text-[10px] font-medium px-4 py-2 rounded-lg">
              Excel出力
            </div>
          </div>
        </div>

      </div>

      {/* 下部プログレスバー */}
      <div className="h-0.5 bg-slate-100">
        <div
          className="h-full bg-orange-400 transition-all duration-700"
          style={{ width: `${((phase + 1) / PHASES.length) * 100}%` }}
        />
      </div>
    </div>
  );
}
