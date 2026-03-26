import Link from 'next/link';
import {
  FaArrowRight,
  FaCalculator,
  FaCheckCircle,
  FaFileDownload,
  FaHome,
  FaRocket,
  FaShieldAlt,
} from 'react-icons/fa';

import Layout from '../components/Layout';

const APP_URL = 'https://app.rakuraku-energy.archi-prisma.co.jp';

const features = [
  {
    icon: FaCalculator,
    title: '公式BEI計算',
    body: 'モデル建物法に基づくBEI値を選択式で算出。国交省v3.8 API連携で公式PDFを自動生成。',
  },
  {
    icon: FaHome,
    title: '住宅省エネ計算',
    body: 'UA値・ηAC値をリアルタイムで算定。求積表PDF・計算書PDFも出力可能。',
  },
  {
    icon: FaFileDownload,
    title: '公式PDF出力',
    body: '確認申請に使える公式様式PDFを自動生成。手作業の書類作成が不要。',
  },
];

export default function Home() {
  return (
    <Layout
      title="楽々省エネ計算 - 建築物エネルギー消費性能計算サービス"
      description="建築設計者向けの省エネ法計算サービス。BEI計算、モデル建物法対応で設計業務を効率化。"
      path="/"
    >
      <div className="max-w-6xl mx-auto">
        {/* ヒーロー */}
        <section className="py-16 md:py-24 px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-accent-100 text-accent-700 text-xs font-semibold px-4 py-2 rounded-full mb-6">
            <FaRocket className="text-sm" />
            2025年4月法改正対応
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-900 leading-tight mb-6">
            省エネ計算を
            <br className="hidden sm:block" />
            社内で回せる形に
          </h1>

          <p className="text-lg md:text-xl text-primary-700 mb-8 max-w-2xl mx-auto leading-relaxed">
            公式BEI計算、住宅省エネ計算、PDF出力まで。
            選択式の簡単入力で、5-10分で完了します。
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <a
              href={`${APP_URL}/register`}
              className="inline-flex items-center justify-center gap-2 bg-accent-500 hover:bg-accent-600 text-white font-bold py-4 px-10 rounded-lg shadow-lg transition-all duration-300 text-lg"
            >
              無料で始める
              <FaArrowRight className="text-sm" />
            </a>
            <Link
              href="/campaign"
              className="inline-flex items-center justify-center gap-2 border-2 border-primary-300 text-primary-700 hover:bg-primary-50 font-semibold py-4 px-8 rounded-lg transition-all duration-300"
            >
              詳しく見る
            </Link>
          </div>

          <div className="flex flex-wrap justify-center gap-4 md:gap-6 text-primary-600 text-xs md:text-sm">
            <div className="flex items-center gap-1.5">
              <FaShieldAlt className="text-primary-400" />
              <span>SSL暗号化通信</span>
            </div>
            <div className="hidden sm:block text-primary-300">|</div>
            <div className="flex items-center gap-1.5">
              <FaCheckCircle className="text-accent-500" />
              <span>国交省v3.8準拠</span>
            </div>
            <div className="hidden sm:block text-primary-300">|</div>
            <div className="flex items-center gap-1.5">
              <FaCheckCircle className="text-accent-500" />
              <span>カード登録不要</span>
            </div>
          </div>
        </section>

        {/* 機能紹介 */}
        <section className="py-16 px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-900 text-center mb-12">
            できること
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="bg-white rounded-xl p-8 border border-warm-200 shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <div className="text-accent-500 text-4xl mb-6">
                    <Icon />
                  </div>
                  <h3 className="text-xl font-bold text-primary-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-primary-600 text-sm leading-relaxed">
                    {feature.body}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-4">
          <div className="max-w-3xl mx-auto text-center bg-primary-900 rounded-2xl p-8 md:p-12 text-white shadow-lg">
            <h2 className="text-3xl font-bold mb-4">まずは無料で試してみませんか？</h2>
            <p className="text-primary-300 mb-8">
              アカウント作成は1分。すぐに計算を始められます。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={`${APP_URL}/register`}
                className="inline-flex items-center justify-center gap-2 bg-accent-500 hover:bg-accent-600 text-white font-bold py-4 px-10 rounded-lg shadow-xl transition-all duration-300 text-lg"
              >
                無料で始める
                <FaArrowRight className="text-sm" />
              </a>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center gap-2 border-2 border-white text-white hover:bg-white hover:text-primary-900 font-bold py-4 px-8 rounded-lg transition-all duration-300"
              >
                料金を見る
              </Link>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
