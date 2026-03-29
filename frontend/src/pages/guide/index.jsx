import Link from 'next/link';
import { FaBook, FaArrowRight, FaCalculator } from 'react-icons/fa';

import Layout from '../../components/Layout';

const GUIDES = [
  {
    href: '/guide/model-building-method',
    title: 'モデル建物法完全ガイド',
    desc: '適用条件から計算方法まで、建築士向けに詳しく解説。BEI計算が5分で完了する理由とは？',
    badge: '基礎知識',
  },
];

export default function GuidePage() {
  return (
    <Layout
      title="ガイド | 楽々省エネ計算"
      description="省エネ計算の実務に役立つガイド記事。モデル建物法・BEI計算の解説など。"
    >
      <div className="max-w-4xl mx-auto px-4 py-8">
        <nav className="text-sm text-primary-600 mb-6">
          <Link href="/" className="hover:text-accent-600">ホーム</Link>
          <span className="mx-2">›</span>
          <span className="text-primary-900">ガイド</span>
        </nav>

        <header className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-accent-50 p-2.5 rounded-lg">
              <FaBook className="text-accent-500 text-xl" />
            </div>
            <h1 className="text-3xl font-bold text-primary-900">ガイド</h1>
          </div>
          <p className="text-primary-500 text-sm">省エネ計算の実務に役立つ解説記事</p>
        </header>

        <div className="grid gap-4">
          {GUIDES.map((g) => (
            <Link
              key={g.href}
              href={g.href}
              className="group bg-white border border-warm-200 hover:border-accent-300 rounded-xl p-6 shadow-sm transition-all duration-200"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[11px] font-semibold bg-accent-50 text-accent-600 px-2.5 py-0.5 rounded-full">
                      {g.badge}
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-primary-900 group-hover:text-accent-500 transition-colors mb-1">
                    {g.title}
                  </h2>
                  <p className="text-sm text-primary-500 leading-relaxed">{g.desc}</p>
                </div>
                <FaArrowRight className="text-primary-300 group-hover:text-accent-400 transition-colors flex-shrink-0 mt-1" />
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-10 bg-primary-800 rounded-xl p-6 text-center">
          <p className="text-primary-300 text-sm mb-3">BEI計算を今すぐ試してみる</p>
          <Link
            href="/tools/official-bei"
            className="inline-flex items-center gap-2 bg-accent-500 hover:bg-accent-600 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors text-sm"
          >
            <FaCalculator className="text-xs" /> 公式BEI計算を開く <FaArrowRight className="text-xs" />
          </Link>
        </div>
      </div>
    </Layout>
  );
}
