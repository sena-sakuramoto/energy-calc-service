import Link from 'next/link';

const APP = 'https://app.rakuraku-energy.archi-prisma.co.jp';

export default function Footer() {
  return (
    <footer className="bg-[#030810] border-t border-white/[.04]">
      <div className="max-w-5xl mx-auto px-6 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          <div className="col-span-2">
            <p className="text-sm font-bold text-white mb-3">楽々省エネ計算</p>
            <p className="text-xs text-white/25 leading-relaxed max-w-xs">
              省エネ計算の実務を社内で回せる形へ。公式BEI計算・住宅省エネ計算・PDF出力を1つの画面で。
            </p>
            <p className="text-[10px] text-white/15 mt-4">Archi-Prisma Design works 株式会社</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-white/30 uppercase tracking-[.15em] mb-4">Product</p>
            <ul className="space-y-2.5 text-xs">
              <li><a href={`${APP}/tools/official-bei`} className="text-white/25 hover:text-white/60 transition-colors">公式BEI計算</a></li>
              <li><a href={`${APP}/residential`} className="text-white/25 hover:text-white/60 transition-colors">住宅省エネ計算</a></li>
              <li><Link href="/pricing" className="text-white/25 hover:text-white/60 transition-colors">料金</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-white/30 uppercase tracking-[.15em] mb-4">Company</p>
            <ul className="space-y-2.5 text-xs">
              <li><Link href="/contact" className="text-white/25 hover:text-white/60 transition-colors">お問い合わせ</Link></li>
              <li><Link href="/privacy" className="text-white/25 hover:text-white/60 transition-colors">プライバシー</Link></li>
              <li><Link href="/legal" className="text-white/25 hover:text-white/60 transition-colors">特定商取引法</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/[.04] pt-6 text-[10px] text-white/15">
          &copy; {new Date().getFullYear()} Archi-Prisma Design works
        </div>
      </div>
    </footer>
  );
}
