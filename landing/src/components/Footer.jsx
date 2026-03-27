import Link from 'next/link';

const APP = 'https://app.rakuraku-energy.archi-prisma.co.jp';

export default function Footer() {
  return (
    <footer className="border-t border-slate-100">
      <div className="max-w-5xl mx-auto px-6 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          <div className="col-span-2">
            <p className="text-sm font-bold text-slate-900 mb-3">楽々省エネ計算</p>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
              省エネ計算の実務を社内で回せる形へ。公式BEI計算・住宅省エネ計算・PDF出力を1つの画面で。
            </p>
            <p className="text-[10px] text-slate-300 mt-4">Archi-Prisma Design works 株式会社</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-4">プロダクト</p>
            <ul className="space-y-2.5 text-xs">
              <li><a href={`${APP}/tools/official-bei`} className="text-slate-400 hover:text-slate-700 transition-colors">公式BEI計算</a></li>
              <li><a href={`${APP}/residential`} className="text-slate-400 hover:text-slate-700 transition-colors">住宅省エネ計算</a></li>
              <li><Link href="/pricing" className="text-slate-400 hover:text-slate-700 transition-colors">料金</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-4">会社</p>
            <ul className="space-y-2.5 text-xs">
              <li><Link href="/contact" className="text-slate-400 hover:text-slate-700 transition-colors">お問い合わせ</Link></li>
              <li><Link href="/privacy" className="text-slate-400 hover:text-slate-700 transition-colors">プライバシー</Link></li>
              <li><Link href="/legal" className="text-slate-400 hover:text-slate-700 transition-colors">特定商取引法</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-100 pt-6 text-[10px] text-slate-300">
          &copy; {new Date().getFullYear()} Archi-Prisma Design works 株式会社
        </div>
      </div>
    </footer>
  );
}
