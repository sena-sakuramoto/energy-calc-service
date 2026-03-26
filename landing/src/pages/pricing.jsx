import Link from 'next/link';
import { FaCheckCircle, FaCreditCard, FaUsers, FaArrowRight } from 'react-icons/fa';

import Layout from '../components/Layout';

const APP_URL = 'https://app.rakuraku-energy.archi-prisma.co.jp';

const PLAN_DEFS = {
  energy_monthly: {
    badge: '月額',
    title: '月額プラン',
    price: '9,800円 / 月',
    subtitle: '月に複数案件を回す事務所向けです。すべての案件で使えます。',
    cta: '月額プランを開始',
    points: [
      '公式BEIワークフローとPDF出力',
      '住宅の公式検証とPDF出力',
      '提案前の見直しや提出前チェック',
    ],
  },
  project_pass: {
    badge: '単発',
    title: '1案件パス',
    price: '4,980円 / 回',
    subtitle: '1つのプロジェクトだけ、購入日から30日間有料機能を使いたいとき向けです。',
    cta: '1案件パスを購入',
    points: [
      '選んだ1プロジェクトだけ30日間アンロック',
      '自動更新なし。単発案件が終わればそのまま終了',
      '2案件以上なら月額プランの方が割安',
    ],
  },
};

export default function PricingPage() {
  return (
    <Layout
      title="料金 | 楽々省エネ計算"
      description="公式BEIワークフローと住宅の公式検証に対する料金ページです。月額プランと1案件パスを選べます。"
      keywords="省エネ計算 料金, BEI 計算 サブスク, 1案件パス"
      path="/pricing"
    >
      <div className="max-w-6xl mx-auto">
        <section className="bg-white border border-warm-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="bg-primary-900 px-8 py-10 text-white">
            <p className="text-primary-300 text-xs font-semibold tracking-widest">料金</p>
            <h1 className="text-4xl font-bold mt-2">公式出力が必要なときだけ課金</h1>
            <p className="text-primary-300 mt-4 max-w-3xl">
              住宅のライブプレビューと料金比較は無料のままです。
              有料にしているのは、公式BEIワークフロー、PDF出力、住宅の公式検証、
              提出前の改善支援だけです。
            </p>
          </div>

          <div className="p-8">
            <div className="mb-6 grid lg:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-warm-200 bg-white p-5">
                <p className="text-xs font-semibold tracking-widest text-primary-500">無料</p>
                <h2 className="text-lg font-bold text-primary-900 mt-2">無料で使える範囲</h2>
                <ul className="mt-3 space-y-2 text-sm text-primary-600">
                  <li>住宅のライブ計算プレビュー</li>
                  <li>エネルギー計算と料金比較</li>
                </ul>
              </div>
              <div className="rounded-2xl border border-accent-200 bg-accent-50/50 p-5">
                <p className="text-xs font-semibold tracking-widest text-accent-700">有料</p>
                <h2 className="text-lg font-bold text-primary-900 mt-2">有料でできること</h2>
                <ul className="mt-3 space-y-2 text-sm text-primary-700">
                  <li>公式BEIワークフローとPDF出力</li>
                  <li>住宅の公式検証とPDF出力</li>
                  <li>提出前の改善提案と見直し</li>
                </ul>
              </div>
            </div>

            <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-8">
              <div className="space-y-6">
                <div className="grid xl:grid-cols-2 gap-4">
                  {Object.entries(PLAN_DEFS).map(([planCode, plan]) => (
                    <div
                      key={planCode}
                      className={`rounded-2xl border p-6 ${
                        planCode === 'energy_monthly'
                          ? 'border-accent-200 bg-accent-50/40'
                          : 'border-primary-200 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-accent-600">{plan.badge}</p>
                          <h2 className="text-2xl font-bold text-primary-900 mt-1">{plan.title}</h2>
                          <p className="text-sm text-primary-500 mt-2">{plan.subtitle}</p>
                        </div>
                        <div className="hidden sm:flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-900 text-white">
                          <FaCreditCard className="text-2xl" />
                        </div>
                      </div>

                      <div className="mt-4 text-3xl font-bold text-primary-900">{plan.price}</div>

                      <div className="mt-5 space-y-3">
                        {plan.points.map((point) => (
                          <div key={point} className="flex items-start gap-3">
                            <FaCheckCircle className="text-green-600 mt-1" />
                            <div className="text-sm text-primary-700">{point}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border border-warm-200 rounded-2xl p-6 bg-white">
                  <div className="flex items-start gap-3">
                    <div className="bg-primary-100 text-primary-700 rounded-xl p-3">
                      <FaUsers />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-primary-900">
                        AI建築サークル会員はそのまま利用可能
                      </h3>
                      <p className="text-sm text-primary-500 mt-2">
                        既存のAI建築サークル会員は有料ワークフロー機能を継続利用できます。
                        今回の料金設定は、非会員向けの単独導線を追加したものです。
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border border-warm-200 rounded-2xl p-6 bg-white">
                <p className="text-sm text-primary-500">はじめる</p>
                <div className="mt-3 text-2xl font-bold text-primary-900">
                  まずは無料で試す
                </div>
                <p className="text-sm text-primary-500 mt-2">
                  アカウントを作成して、無料機能を体験してください。有料プランは必要になったときに購入できます。
                </p>

                <div className="mt-6 flex flex-col gap-3">
                  <a
                    href={`${APP_URL}/register`}
                    className="inline-flex items-center justify-center gap-2 bg-accent-500 hover:bg-accent-600 text-white font-semibold px-5 py-3 rounded-lg transition-colors"
                  >
                    無料で始める <FaArrowRight className="text-xs" />
                  </a>
                  <a
                    href={`${APP_URL}/login`}
                    className="inline-flex items-center justify-center gap-2 border border-primary-300 text-primary-700 hover:bg-warm-50 font-semibold px-5 py-3 rounded-lg transition-colors"
                  >
                    ログイン
                  </a>
                  <Link
                    href="/campaign"
                    className="inline-flex items-center justify-center gap-2 border border-primary-300 text-primary-700 hover:bg-warm-50 font-semibold px-5 py-3 rounded-lg transition-colors"
                  >
                    導入案内を見る
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
