import Link from 'next/link';
import {
  FaArrowRight,
  FaCalculator,
  FaCheckCircle,
  FaClock,
  FaFileAlt,
  FaFileDownload,
  FaShieldAlt,
  FaUpload,
} from 'react-icons/fa';

import Layout from '../components/Layout';
import { useAuth } from '../contexts/FirebaseAuthContext';

const painPoints = [
  {
    icon: FaFileAlt,
    title: '制度対応で急に案件化する',
    body:
      '省エネ適判や説明用の提出物が必要になると、普段の設計業務の流れだけでは回しにくくなります。',
  },
  {
    icon: FaClock,
    title: '外注は早いが、たびたび頼みにくい',
    body:
      '単発なら外注で回せても、軽微な修正や比較検討のたびに依頼するのはコストも時間もかかります。',
  },
  {
    icon: FaCalculator,
    title: '社内で触れる形にしたい',
    body:
      '詳細な制度知識がなくても、入力漏れに戻りやすく、公式出力まで前に進める導線が必要です。',
  },
];

const paidFeatures = [
  {
    icon: FaCalculator,
    title: '公式BEIワークフロー',
    body:
      '必要な入力を順番に整理しながら、提出前提のBEI計算へ進めます。',
    points: ['公式ルートの計算', '入力不足の差し戻し', '結果の見直し'],
  },
  {
    icon: FaFileDownload,
    title: 'PDF出力',
    body:
      '申請や説明に回しやすい形で、必要なPDFをまとめて出力できます。',
    points: ['提出用PDF', '説明用の出力', '案件ごとの保存'],
  },
  {
    icon: FaUpload,
    title: '住宅の公式検証',
    body:
      '住宅側はライブプレビューを無料に保ちつつ、公式検証とPDF出力だけを有料機能に絞っています。',
    points: ['UA値・ηAC値の確認', '公式検証の実行', '住宅PDFの出力'],
  },
];

const faqs = [
  {
    q: '無料で使える範囲はどこまでですか？',
    a:
      '住宅のライブプレビュー、エネルギー計算、料金比較は無料です。公式BEIワークフローとPDF出力、住宅の公式検証は有料です。',
  },
  {
    q: '月額と30日パスはどう使い分けますか？',
    a:
      '継続的に案件を回すなら月額、短期間だけ使うなら30日パスが向いています。30日パスは1案件分ではなく、購入日から30日間は案件数に関係なく使えます。迷ったら月額から始める方が運用しやすいです。',
  },
  {
    q: '決済後はどこに戻りますか？',
    a:
      '料金ページから決済した場合は、もともと開こうとしていたツール画面へ戻れるようにしています。',
  },
  {
    q: 'AI建築サークル会員は別途契約が必要ですか？',
    a:
      '既存のAI建築サークル会員は、そのまま有料ワークフロー機能を利用できます。',
  },
];

export default function Campaign() {
  const { isAuthenticated } = useAuth();
  const pricingHref = '/pricing?redirect=%2Ftools%2Fofficial-bei';

  return (
    <Layout
      title="導入案内 | 楽々省エネ計算"
      description="公式BEIワークフローと住宅の公式検証を、社内で扱いやすい形へ寄せる導入案内です。"
      keywords="省エネ計算 導入, BEI 計算, 住宅省エネ"
      url="/campaign"
    >
      <div className="max-w-5xl mx-auto">
        <section className="bg-warm-50 py-20 rounded-lg mb-20">
          <div className="max-w-3xl mx-auto text-center px-6">
            <p className="text-accent-500 font-semibold text-sm tracking-wide mb-4">
              導入案内
            </p>
            <h1 className="text-4xl md:text-5xl font-bold text-primary-900 leading-tight mb-6">
              公式BEIの提出作業を、
              <br className="hidden md:block" />
              社内で回せる形に寄せる
            </h1>
            <p className="text-lg md:text-xl text-primary-700 leading-relaxed mb-4">
              無料の住宅プレビューや料金比較はそのまま残しつつ、
              お金をいただく範囲は「公式出力が必要なところ」に限定しています。
            </p>
            <p className="text-primary-500 text-sm mb-10">
              公式BEIワークフロー、提出用PDF、住宅の公式検証だけを有料化しています。
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              {isAuthenticated ? (
                <>
                  <Link
                    href="/tools/official-bei"
                    className="bg-accent-500 hover:bg-accent-600 text-white font-bold py-4 px-10 rounded-lg shadow-lg transition-all duration-300 text-lg"
                  >
                    公式BEI計算を開く
                  </Link>
                  <Link
                    href={pricingHref}
                    className="border-2 border-primary-700 text-primary-700 hover:bg-primary-700 hover:text-white font-bold py-4 px-8 rounded-lg transition-all duration-300"
                  >
                    料金を見る
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href={pricingHref}
                    className="bg-accent-500 hover:bg-accent-600 text-white font-bold py-4 px-10 rounded-lg shadow-lg transition-all duration-300 text-lg"
                  >
                    料金を見る
                  </Link>
                  <Link
                    href="/register"
                    className="border-2 border-primary-700 text-primary-700 hover:bg-primary-700 hover:text-white font-bold py-4 px-8 rounded-lg transition-all duration-300"
                  >
                    アカウント作成
                  </Link>
                </>
              )}
            </div>

            <p className="text-primary-400 text-xs">
              アカウント登録は無料です。月額 9,800円、30日パス 4,980円で使えます。
            </p>
          </div>
        </section>

        <section className="mb-20 px-4">
          <h2 className="text-3xl font-bold text-primary-800 text-center mb-4">
            こんな詰まり方を減らすためのツールです
          </h2>
          <p className="text-primary-600 text-center mb-12 max-w-2xl mx-auto">
            申請や提出の手前で止まりやすい部分だけを切り出して、前に進めやすい形にしています。
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {painPoints.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="bg-white rounded-xl p-8 shadow-sm border border-primary-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="text-primary-300 text-3xl mb-4">
                    <Icon />
                  </div>
                  <h3 className="text-lg font-bold text-primary-900 mb-3">
                    {item.title}
                  </h3>
                  <p className="text-primary-600 text-sm leading-relaxed">
                    {item.body}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mb-20 px-4">
          <h2 className="text-3xl font-bold text-primary-800 text-center mb-4">
            有料範囲でできること
          </h2>
          <p className="text-primary-600 text-center mb-12 max-w-2xl mx-auto">
            汎用計算ではなく、提出や説明に直結する作業へ価値を寄せています。
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {paidFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="bg-white rounded-xl p-8 shadow-sm border-l-4 border-accent-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="text-accent-500 text-4xl mb-6">
                    <Icon />
                  </div>
                  <h3 className="text-xl font-bold text-primary-800 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-primary-600 text-sm mb-4">{feature.body}</p>
                  <ul className="text-sm text-primary-600 space-y-2">
                    {feature.points.map((point) => (
                      <li key={point} className="flex items-start">
                        <FaCheckCircle className="text-accent-400 mr-2 mt-0.5 flex-shrink-0" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        <section className="bg-warm-50 rounded-lg py-16 px-6 mb-20">
          <h2 className="text-3xl font-bold text-primary-800 text-center mb-4">
            使い方は3ステップ
          </h2>
          <p className="text-primary-600 text-center mb-12">
            アカウント作成から提出前の確認まで、順に進められる導線です。
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="bg-accent-500 text-white w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-lg font-bold text-primary-800 mb-2">
                条件を入力する
              </h3>
              <p className="text-primary-600 text-sm">
                用途、面積、設備条件などを画面に沿って入力します。
              </p>
            </div>

            <div className="text-center">
              <div className="bg-accent-500 text-white w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-lg font-bold text-primary-800 mb-2">
                不足を埋めながら確認する
              </h3>
              <p className="text-primary-600 text-sm">
                入力不足があれば該当ステップへ戻り、その場で補えます。
              </p>
            </div>

            <div className="text-center">
              <div className="bg-accent-500 text-white w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-lg font-bold text-primary-800 mb-2">
                結果とPDFを出力する
              </h3>
              <p className="text-primary-600 text-sm">
                計算結果を確認し、そのままPDF出力まで進められます。
              </p>
            </div>
          </div>
        </section>

        <section className="mb-20 px-4">
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white border-2 border-primary-200 rounded-xl p-8">
              <span className="bg-primary-100 text-primary-600 text-sm font-semibold px-4 py-1 rounded-full">
                月額プラン
              </span>
              <div className="mt-6 flex items-center gap-3">
                <FaClock className="text-primary-400 text-2xl" />
                <span className="text-3xl font-bold text-primary-800">9,800円 / 月</span>
              </div>
              <p className="text-primary-600 text-sm mt-4">
                月に複数案件を回す事務所向けです。提出前チェックや再計算を含めて使いやすい形です。
              </p>
            </div>

            <div className="bg-warm-50 border-2 border-accent-300 rounded-xl p-8">
              <span className="bg-accent-100 text-accent-600 text-sm font-semibold px-4 py-1 rounded-full">
                30日パス
              </span>
              <div className="mt-6 flex items-center gap-3">
                <FaCheckCircle className="text-accent-500 text-2xl" />
                <span className="text-3xl font-bold text-accent-600">4,980円 / 回</span>
              </div>
              <p className="text-primary-700 text-sm mt-4">
                単発案件だけ有料範囲を開きたいとき向けです。短い有料期間で運用できます。
              </p>
            </div>
          </div>
        </section>

        <section className="mb-20 px-4">
          <h2 className="text-3xl font-bold text-primary-800 text-center mb-12">
            よくある質問
          </h2>

          <div className="max-w-3xl mx-auto space-y-6">
            {faqs.map((item) => (
              <div
                key={item.q}
                className="bg-white rounded-xl p-6 shadow-sm border border-primary-100"
              >
                <h3 className="font-bold text-primary-900 mb-2">Q. {item.q}</h3>
                <p className="text-primary-700 text-sm leading-relaxed">A. {item.a}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-primary-800 rounded-lg py-16 px-6 mb-12">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              まずは料金と導線を確認してください
            </h2>
            <p className="text-lg text-primary-300 mb-10">
              無料範囲と有料範囲を分けたうえで、必要なところだけ導入できます。
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link
                href={pricingHref}
                className="bg-accent-500 hover:bg-accent-600 text-white font-bold py-4 px-12 rounded-lg shadow-xl transition-all duration-300 text-lg"
              >
                料金を見る
              </Link>
              <Link
                href={isAuthenticated ? '/tools/official-bei' : '/register'}
                className="border-2 border-white text-white hover:bg-white hover:text-primary-800 font-bold py-4 px-8 rounded-lg transition-all duration-300"
              >
                {isAuthenticated ? '公式BEI計算を開く' : 'アカウント作成'}
              </Link>
            </div>

            <div className="flex flex-wrap justify-center gap-6 text-primary-300 text-sm mb-6">
              <div className="flex items-center">
                <FaShieldAlt className="mr-1.5" />
                <span>通信は暗号化</span>
              </div>
              <div className="flex items-center">
                <FaCheckCircle className="mr-1.5" />
                <span>月額または30日パス</span>
              </div>
              <div className="flex items-center">
                <FaCheckCircle className="mr-1.5" />
                <span>住宅プレビューは無料</span>
              </div>
            </div>

            <p className="text-primary-400 text-xs">
              AI建築サークル会員は、既存プランのまま有料機能を継続利用できます。
            </p>
          </div>
        </section>

        <section className="mb-12 px-4">
          <div className="bg-warm-100 rounded-xl p-8 max-w-3xl mx-auto text-center">
            <p className="text-primary-500 text-sm mb-2">
              AI建築サークルの方へ
            </p>
            <p className="text-primary-800 font-semibold mb-3">
              サークル会員は、引き続き有料ワークフロー機能を利用できます。
            </p>
            <p className="text-primary-600 text-sm mb-5">
              会員向けの継続提供は維持したまま、非会員向けに単独の料金導線を追加しています。
            </p>
            <a
              href="https://ai-architecture-circle.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-accent-500 hover:text-accent-600 font-semibold text-sm transition-colors duration-300"
            >
              AI建築サークルの案内を見る
              <FaArrowRight className="ml-2 text-xs" />
            </a>
          </div>
        </section>
      </div>
    </Layout>
  );
}
