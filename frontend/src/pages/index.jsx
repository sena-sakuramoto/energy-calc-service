import Link from 'next/link';
import Image from 'next/image';
import {
  FaArrowRight,
  FaBuilding,
  FaCheckCircle,
  FaClock,
  FaCloudDownloadAlt,
  FaFileAlt,
  FaFolderOpen,
  FaMousePointer,
  FaShieldAlt,
  FaYenSign,
} from 'react-icons/fa';

import Layout from '../components/Layout';
import { useAuth } from '../contexts/FirebaseAuthContext';

const toolCards = [
  {
    href: '/tools/official-bei',
    title: '公式BEI計算',
    description: '提出前提の公式ワークフローとPDF出力に対応します。',
    points: ['公式ルート', 'PDF出力', '有料機能'],
    icon: FaBuilding,
    requiresAuth: true,
  },
  {
    href: '/residential',
    title: '住宅省エネ計算',
    description: 'ライブプレビューは無料、公式検証とPDF出力だけ有料です。',
    points: ['住宅プレビュー', 'UA/ηAC確認', '一部無料'],
    icon: FaMousePointer,
    requiresAuth: false,
  },
  {
    href: '/tools/energy-calculator',
    title: 'エネルギー計算と料金比較',
    description: '設備比較や料金の見直しを軽く回すための無料ツールです。',
    points: ['料金比較', '概算検討', '無料'],
    icon: FaFolderOpen,
    requiresAuth: false,
  },
];

export default function Home() {
  const { isAuthenticated } = useAuth();

  const isGitHubPages =
    typeof window !== 'undefined' &&
    window.location.hostname.includes('github.io');
  const assetBase = isGitHubPages ? '/energy-calc-service' : '';
  const logoSrc = `${assetBase}/logo.png`;

  const fullBleed = {
    width: '100vw',
    position: 'relative',
    left: '50%',
    right: '50%',
    marginLeft: '-50vw',
    marginRight: '-50vw',
  };

  return (
    <Layout
      title="楽々省エネ計算 | 公式BEIと住宅省エネ計算"
      description="公式BEIワークフロー、住宅の省エネ確認、PDF出力までを前に進めやすい形へまとめたツールです。"
      keywords="省エネ計算, 公式BEI, 住宅省エネ, PDF出力"
      url="/"
    >
      <section style={fullBleed} className="bg-gradient-to-b from-warm-50 to-white">
        <div className="max-w-5xl mx-auto px-4 pt-16 pb-20 text-center">
          <div className="flex justify-center mb-8">
            <div className="bg-white/70 backdrop-blur-sm p-3 rounded-2xl shadow-md border border-warm-200">
              <Image
                src={logoSrc}
                alt="楽々省エネ計算ロゴ"
                width={96}
                height={96}
                className="w-20 h-20 md:w-24 md:h-24 object-contain"
                priority
              />
            </div>
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-primary-800 tracking-tight mb-4">
            楽々省エネ計算
          </h1>

          <p className="text-xl md:text-2xl text-primary-600 font-medium mb-3 max-w-3xl mx-auto">
            公式BEIと住宅省エネ計算を、
            <span className="text-accent-500">雑に触っても前へ進める</span>
            形へ。
          </p>

          <p className="text-sm md:text-base text-primary-400 mb-10">
            無料のプレビューと、有料の公式出力をきれいに分けています。
          </p>

          {isAuthenticated ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/projects"
                className="inline-flex items-center justify-center gap-2 bg-primary-700 hover:bg-primary-800 text-white font-bold py-4 px-8 rounded-xl shadow-lg transition-colors duration-200 text-lg"
              >
                プロジェクトを見る
              </Link>
              <Link
                href="/tools/official-bei"
                className="inline-flex items-center justify-center gap-2 bg-accent-500 hover:bg-accent-600 text-white font-bold py-4 px-8 rounded-xl shadow-lg transition-colors duration-200 text-lg"
              >
                公式BEI計算を開く
                <FaArrowRight className="text-sm" />
              </Link>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/residential"
                className="inline-flex items-center justify-center gap-2 bg-accent-500 hover:bg-accent-600 text-white font-bold py-4 px-10 rounded-xl shadow-lg transition-colors duration-200 text-lg"
              >
                住宅プレビューを試す
                <FaArrowRight className="text-sm" />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center gap-2 border-2 border-primary-300 text-primary-600 hover:border-primary-500 hover:text-primary-800 font-semibold py-4 px-8 rounded-xl transition-colors duration-200 text-lg"
              >
                料金を見る
              </Link>
            </div>
          )}

          {!isAuthenticated && (
            <p className="mt-5 text-sm text-primary-400">
              すでにアカウントをお持ちなら
              <Link
                href="/login"
                className="text-accent-500 hover:text-accent-600 font-semibold ml-1 underline underline-offset-2"
              >
                ログイン
              </Link>
            </p>
          )}
        </div>
      </section>

      <section style={fullBleed} className="bg-white border-y border-warm-200">
        <div className="max-w-4xl mx-auto px-4 py-5">
          <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-3 text-sm text-primary-500">
            <span className="flex items-center gap-2">
              <FaShieldAlt className="text-primary-400" />
              公式ワークフロー対応
            </span>
            <span className="hidden sm:block text-primary-300">|</span>
            <span className="flex items-center gap-2">
              <FaFileAlt className="text-primary-400" />
              PDF出力対応
            </span>
            <span className="hidden sm:block text-primary-300">|</span>
            <span className="flex items-center gap-2">
              <FaShieldAlt className="text-primary-400" />
              通信は暗号化
            </span>
            <span className="hidden sm:block text-primary-300">|</span>
            <span className="flex items-center gap-2 font-semibold text-accent-500">
              <FaCheckCircle />
              無料範囲あり
            </span>
          </div>
        </div>
      </section>

      <section style={fullBleed} className="bg-white">
        <div className="max-w-5xl mx-auto px-4 py-10">
          <h2 className="text-2xl md:text-3xl font-bold text-primary-800 text-center mb-6">
            目的に応じて使い分ける
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {toolCards.map((card) => {
              const Icon = card.icon;
              const href = card.requiresAuth && !isAuthenticated ? '/register' : card.href;

              return (
                <Link
                  key={card.title}
                  href={href}
                  className="bg-white border border-warm-200 hover:border-accent-300 rounded-xl p-6 shadow-sm transition-colors"
                >
                  <div className="w-12 h-12 bg-primary-700 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="text-white text-lg" />
                  </div>
                  <div className="text-lg font-bold text-primary-800 mb-1">{card.title}</div>
                  <div className="text-sm text-primary-500 mb-4">{card.description}</div>
                  <ul className="space-y-2 text-sm text-primary-500">
                    {card.points.map((point) => (
                      <li key={point} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-accent-400 rounded-full flex-shrink-0" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section id="how-it-works" style={fullBleed} className="bg-warm-50">
        <div className="max-w-5xl mx-auto px-4 py-20">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-primary-800 mb-4">
            3ステップで進める
          </h2>
          <p className="text-center text-primary-500 mb-14 max-w-xl mx-auto">
            入力、確認、出力を順に進めれば、途中で迷いにくい構成です。
          </p>

          <div className="grid md:grid-cols-3 gap-8 md:gap-6">
            <div className="relative text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-700 text-white text-2xl mb-5 shadow-md">
                <FaMousePointer />
              </div>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-3 bg-accent-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow">
                1
              </div>
              <h3 className="text-lg font-bold text-primary-800 mb-2">条件を入力する</h3>
              <p className="text-sm text-primary-500 leading-relaxed">
                用途や設備条件を順番に入力します。
              </p>
            </div>

            <div className="relative text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-700 text-white text-2xl mb-5 shadow-md">
                <FaBuilding />
              </div>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-3 bg-accent-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow">
                2
              </div>
              <h3 className="text-lg font-bold text-primary-800 mb-2">
                不足を埋めながら確認する
              </h3>
              <p className="text-sm text-primary-500 leading-relaxed">
                途中で不足が見つかっても、該当画面へ戻って埋められます。
              </p>
            </div>

            <div className="relative text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-700 text-white text-2xl mb-5 shadow-md">
                <FaCloudDownloadAlt />
              </div>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-3 bg-accent-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow">
                3
              </div>
              <h3 className="text-lg font-bold text-primary-800 mb-2">結果とPDFを出力する</h3>
              <p className="text-sm text-primary-500 leading-relaxed">
                そのまま確認用の出力まで進められます。
              </p>
            </div>
          </div>
        </div>
      </section>

      <section style={fullBleed} className="bg-warm-50 border-y border-warm-200">
        <div className="max-w-4xl mx-auto px-4 py-20">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-primary-800 mb-4">
            外注前提の詰まりを減らす
          </h2>
          <p className="text-center text-primary-500 mb-14 max-w-xl mx-auto">
            まずは社内で触って前へ進める形に寄せるための構成です。
          </p>

          <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl p-8 border border-warm-300">
              <p className="text-xs font-bold text-primary-400 uppercase tracking-wider mb-5">
                従来の流れ
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <FaYenSign className="text-primary-300 mt-1 flex-shrink-0" />
                  <div>
                    <span className="block font-semibold text-primary-700">案件ごとに費用が出る</span>
                    <span className="text-sm text-primary-400">軽微な修正も頼みにくい</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <FaClock className="text-primary-300 mt-1 flex-shrink-0" />
                  <div>
                    <span className="block font-semibold text-primary-700">やり取りに時間がかかる</span>
                    <span className="text-sm text-primary-400">確認の往復で止まりやすい</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <FaFileAlt className="text-primary-300 mt-1 flex-shrink-0" />
                  <div>
                    <span className="block font-semibold text-primary-700">検討の回数を増やしにくい</span>
                    <span className="text-sm text-primary-400">社内比較の試行回数が落ちやすい</span>
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-primary-800 rounded-2xl p-8 text-white shadow-lg">
              <p className="text-xs font-bold text-accent-300 uppercase tracking-wider mb-5">
                楽々省エネ計算
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <FaYenSign className="text-accent-400 mt-1 flex-shrink-0" />
                  <div>
                    <span className="block font-semibold">月額または1案件パス</span>
                    <span className="text-sm text-primary-300">月額か、1案件だけの単発売り</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <FaClock className="text-accent-400 mt-1 flex-shrink-0" />
                  <div>
                    <span className="block font-semibold">最短でその場確認</span>
                    <span className="text-sm text-primary-300">入力から出力まで同じ画面で進める</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <FaFileAlt className="text-accent-400 mt-1 flex-shrink-0" />
                  <div>
                    <span className="block font-semibold">無料範囲を残す</span>
                    <span className="text-sm text-primary-300">軽い比較や下見は無料で回せる</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section style={fullBleed} className="bg-primary-800">
        <div className="max-w-3xl mx-auto px-4 py-20 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            まずは迷わず触れる入口から
          </h2>
          <p className="text-lg text-primary-300 mb-10 max-w-xl mx-auto leading-relaxed">
            {isAuthenticated
              ? 'そのまま公式BEI計算へ進めます。'
              : '住宅プレビューは無料で試せます。必要になったら料金ページから有料機能を開けます。'}
          </p>

          {isAuthenticated ? (
            <Link
              href="/tools/official-bei"
              className="inline-flex items-center justify-center gap-2 bg-accent-500 hover:bg-accent-600 text-white font-bold py-4 px-10 rounded-xl shadow-lg transition-colors duration-200 text-lg"
            >
              公式BEI計算を開く
              <FaArrowRight className="text-sm" />
            </Link>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/residential"
                className="inline-flex items-center justify-center gap-2 bg-accent-500 hover:bg-accent-600 text-white font-bold py-4 px-10 rounded-xl shadow-lg transition-colors duration-200 text-lg"
              >
                住宅プレビューを試す
                <FaArrowRight className="text-sm" />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center gap-2 border-2 border-white text-white hover:bg-white hover:text-primary-800 font-bold py-4 px-8 rounded-xl transition-all duration-200 text-lg"
              >
                料金を見る
              </Link>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
