// frontend/src/pages/index.jsx
import Layout from '../components/Layout';
import { useAuth } from '../contexts/FirebaseAuthContext';
import Link from 'next/link';
import Image from 'next/image';
import {
  FaBuilding,
  FaCloudDownloadAlt,
  FaMousePointer,
  FaFolderOpen,
  FaShieldAlt,
  FaCheckCircle,
  FaArrowRight,
  FaFileAlt,
  FaClock,
  FaYenSign,
} from 'react-icons/fa';

export default function Home() {
  const { isAuthenticated } = useAuth();

  // GitHub Pages environment detection
  const isGitHubPages =
    typeof window !== 'undefined' &&
    window.location.hostname.includes('github.io');
  const assetBase = isGitHubPages ? '/energy-calc-service' : '';
  const logoSrc = `${assetBase}/logo.png`;

  // Full-bleed wrapper style to break out of Layout container
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
      title="楽々省エネ計算 | 無料BEI計算ツール"
      description="省エネ法適合判定を5分で完了。国交省公式API準拠のBEI計算ツール。モデル建物法v3.8対応、公式PDF出力、完全無料。"
      keywords="省エネ計算,BEI,省エネ法,モデル建物法,適合判定,建築,無料"
    >
      {/* ===== Hero Section ===== */}
      <section style={fullBleed} className="bg-gradient-to-b from-warm-50 to-white">
        <div className="max-w-5xl mx-auto px-4 pt-16 pb-20 text-center">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="bg-white/70 backdrop-blur-sm p-3 rounded-2xl shadow-md border border-warm-200">
              <Image
                src={logoSrc}
                alt="楽々省エネ計算 ロゴ"
                width={96}
                height={96}
                className="w-20 h-20 md:w-24 md:h-24 object-contain"
                priority
              />
            </div>
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-primary-800 tracking-tight mb-4">
            楽々省エネ計算
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-primary-600 font-medium mb-3 max-w-2xl mx-auto">
            省エネ法適合判定を、<span className="text-accent-500">5分</span>で。<span className="text-accent-500">無料</span>で。
          </p>

          {/* Sub-subtitle */}
          <p className="text-sm md:text-base text-primary-400 mb-10">
            国交省公式API準拠&ensp;/&ensp;モデル建物法 v3.8対応
          </p>

          {/* CTA Buttons -- Auth-aware */}
          {isAuthenticated ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 bg-primary-700 hover:bg-primary-800 text-white font-bold py-4 px-8 rounded-xl shadow-lg transition-colors duration-200 text-lg"
              >
                ダッシュボード
              </Link>
              <Link
                href="/tools/official-bei"
                className="inline-flex items-center justify-center gap-2 bg-accent-500 hover:bg-accent-600 text-white font-bold py-4 px-8 rounded-xl shadow-lg transition-colors duration-200 text-lg"
              >
                BEI計算を開始
                <FaArrowRight className="text-sm" />
              </Link>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 bg-accent-500 hover:bg-accent-600 text-white font-bold py-4 px-10 rounded-xl shadow-lg transition-colors duration-200 text-lg"
              >
                無料で計算を始める
                <FaArrowRight className="text-sm" />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 border-2 border-primary-300 text-primary-600 hover:border-primary-500 hover:text-primary-800 font-semibold py-4 px-8 rounded-xl transition-colors duration-200 text-lg"
              >
                詳しく見る
              </a>
            </div>
          )}

          {/* Login hint for unauthenticated */}
          {!isAuthenticated && (
            <p className="mt-5 text-sm text-primary-400">
              既にアカウントをお持ちの方は
              <Link href="/login" className="text-accent-500 hover:text-accent-600 font-semibold ml-1 underline underline-offset-2">
                ログイン
              </Link>
            </p>
          )}
        </div>
      </section>

      {/* ===== Trust Bar ===== */}
      <section style={fullBleed} className="bg-white border-y border-warm-200">
        <div className="max-w-4xl mx-auto px-4 py-5">
          <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-3 text-sm text-primary-500">
            <span className="flex items-center gap-2">
              <FaShieldAlt className="text-primary-400" />
              国交省API準拠
            </span>
            <span className="hidden sm:block text-primary-300">|</span>
            <span className="flex items-center gap-2">
              <FaFileAlt className="text-primary-400" />
              モデル建物法 v3.8
            </span>
            <span className="hidden sm:block text-primary-300">|</span>
            <span className="flex items-center gap-2">
              <FaShieldAlt className="text-primary-400" />
              SSL暗号化
            </span>
            <span className="hidden sm:block text-primary-300">|</span>
            <span className="flex items-center gap-2 font-semibold text-accent-500">
              <FaCheckCircle />
              完全無料
            </span>
          </div>
        </div>
      </section>

      {/* ===== How It Works ===== */}
      <section id="how-it-works" style={fullBleed} className="bg-warm-50">
        <div className="max-w-5xl mx-auto px-4 py-20">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-primary-800 mb-4">
            3ステップで完了
          </h2>
          <p className="text-center text-primary-500 mb-14 max-w-xl mx-auto">
            複雑な省エネ計算を、直感的な操作で。
          </p>

          <div className="grid md:grid-cols-3 gap-8 md:gap-6">
            {/* Step 1 */}
            <div className="relative text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-700 text-white text-2xl mb-5 shadow-md">
                <FaMousePointer />
              </div>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-3 bg-accent-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow">
                1
              </div>
              <h3 className="text-lg font-bold text-primary-800 mb-2">
                建物情報を入力
              </h3>
              <p className="text-sm text-primary-500 leading-relaxed">
                建物用途・地域・面積を<br className="hidden md:block" />
                ドロップダウンから選択
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-700 text-white text-2xl mb-5 shadow-md">
                <FaBuilding />
              </div>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-3 bg-accent-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow">
                2
              </div>
              <h3 className="text-lg font-bold text-primary-800 mb-2">
                自動でBEI計算
              </h3>
              <p className="text-sm text-primary-500 leading-relaxed">
                国交省APIで<br className="hidden md:block" />
                公式の適合判定を実行
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-700 text-white text-2xl mb-5 shadow-md">
                <FaCloudDownloadAlt />
              </div>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-3 bg-accent-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow">
                3
              </div>
              <h3 className="text-lg font-bold text-primary-800 mb-2">
                公式PDFを出力
              </h3>
              <p className="text-sm text-primary-500 leading-relaxed">
                そのまま申請に使える<br className="hidden md:block" />
                公式フォーマットのPDF
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Features Grid ===== */}
      <section style={fullBleed} className="bg-white">
        <div className="max-w-5xl mx-auto px-4 py-20">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-primary-800 mb-4">
            主な機能
          </h2>
          <p className="text-center text-primary-500 mb-14 max-w-xl mx-auto">
            省エネ適合判定に必要な全てを、ひとつのツールで。
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Card 1: 公式BEI計算 */}
            <Link
              href={isAuthenticated ? '/tools/official-bei' : '/register'}
              className="group block"
            >
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-warm-200 hover:shadow-lg hover:border-accent-200 transition-all duration-300 h-full flex flex-col">
                <div className="w-14 h-14 bg-primary-700 rounded-xl flex items-center justify-center mb-5">
                  <FaBuilding className="text-white text-xl" />
                </div>
                <h3 className="text-xl font-bold text-primary-800 mb-3 group-hover:text-accent-500 transition-colors">
                  公式BEI計算
                </h3>
                <p className="text-sm text-primary-500 mb-5 leading-relaxed">
                  国交省API連携で、省エネ適合判定をそのまま公式計算として実行。
                </p>
                <ul className="space-y-2.5 mb-6 text-sm text-primary-500">
                  <li className="flex items-center gap-2.5">
                    <span className="w-1.5 h-1.5 bg-accent-400 rounded-full flex-shrink-0" />
                    様式A〜I対応
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="w-1.5 h-1.5 bg-accent-400 rounded-full flex-shrink-0" />
                    国交省公式API連携
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="w-1.5 h-1.5 bg-accent-400 rounded-full flex-shrink-0" />
                    公式PDF出力
                  </li>
                </ul>
                <div className="mt-auto inline-flex items-center text-accent-500 font-medium text-sm group-hover:translate-x-1 transition-transform duration-200">
                  計算を開始
                  <FaArrowRight className="ml-2 text-xs" />
                </div>
              </div>
            </Link>

            {/* Card 2: 選択式の簡単入力 */}
            <Link
              href={isAuthenticated ? '/tools/official-bei' : '/register'}
              className="group block"
            >
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-warm-200 hover:shadow-lg hover:border-accent-200 transition-all duration-300 h-full flex flex-col">
                <div className="w-14 h-14 bg-primary-700 rounded-xl flex items-center justify-center mb-5">
                  <FaMousePointer className="text-white text-xl" />
                </div>
                <h3 className="text-xl font-bold text-primary-800 mb-3 group-hover:text-accent-500 transition-colors">
                  選択式の簡単入力
                </h3>
                <p className="text-sm text-primary-500 mb-5 leading-relaxed">
                  専門知識がなくても迷わない。ドロップダウンとガイドで直感的に入力。
                </p>
                <ul className="space-y-2.5 mb-6 text-sm text-primary-500">
                  <li className="flex items-center gap-2.5">
                    <span className="w-1.5 h-1.5 bg-accent-400 rounded-full flex-shrink-0" />
                    ドロップダウンで入力
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="w-1.5 h-1.5 bg-accent-400 rounded-full flex-shrink-0" />
                    サンプルデータ付き
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="w-1.5 h-1.5 bg-accent-400 rounded-full flex-shrink-0" />
                    入力ガイド付き
                  </li>
                </ul>
                <div className="mt-auto inline-flex items-center text-accent-500 font-medium text-sm group-hover:translate-x-1 transition-transform duration-200">
                  試してみる
                  <FaArrowRight className="ml-2 text-xs" />
                </div>
              </div>
            </Link>

            {/* Card 3: プロジェクト管理 */}
            <Link
              href={isAuthenticated ? '/dashboard' : '/register'}
              className="group block"
            >
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-warm-200 hover:shadow-lg hover:border-accent-200 transition-all duration-300 h-full flex flex-col">
                <div className="w-14 h-14 bg-primary-700 rounded-xl flex items-center justify-center mb-5">
                  <FaFolderOpen className="text-white text-xl" />
                </div>
                <h3 className="text-xl font-bold text-primary-800 mb-3 group-hover:text-accent-500 transition-colors">
                  プロジェクト管理
                </h3>
                <p className="text-sm text-primary-500 mb-5 leading-relaxed">
                  複数案件をまとめて管理。計算履歴の保存と各種出力に対応。
                </p>
                <ul className="space-y-2.5 mb-6 text-sm text-primary-500">
                  <li className="flex items-center gap-2.5">
                    <span className="w-1.5 h-1.5 bg-accent-400 rounded-full flex-shrink-0" />
                    複数案件管理
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="w-1.5 h-1.5 bg-accent-400 rounded-full flex-shrink-0" />
                    計算履歴保存
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="w-1.5 h-1.5 bg-accent-400 rounded-full flex-shrink-0" />
                    Excel / PDF出力
                  </li>
                </ul>
                <div className="mt-auto inline-flex items-center text-accent-500 font-medium text-sm group-hover:translate-x-1 transition-transform duration-200">
                  管理画面へ
                  <FaArrowRight className="ml-2 text-xs" />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== Value Proposition ===== */}
      <section style={fullBleed} className="bg-warm-50 border-y border-warm-200">
        <div className="max-w-4xl mx-auto px-4 py-20">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-primary-800 mb-4">
            省エネ計算の負担を、ゼロに近づける
          </h2>
          <p className="text-center text-primary-500 mb-14 max-w-xl mx-auto">
            外注や手計算にかかっていた時間とコストを大幅に削減。
          </p>

          <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Before */}
            <div className="bg-white rounded-2xl p-8 border border-warm-300">
              <p className="text-xs font-bold text-primary-400 uppercase tracking-wider mb-5">
                従来の方法
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <FaYenSign className="text-primary-300 mt-1 flex-shrink-0" />
                  <div>
                    <span className="block font-semibold text-primary-700">外注費 約5万円〜 / 件</span>
                    <span className="text-sm text-primary-400">案件ごとに費用が発生</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <FaClock className="text-primary-300 mt-1 flex-shrink-0" />
                  <div>
                    <span className="block font-semibold text-primary-700">3〜5営業日</span>
                    <span className="text-sm text-primary-400">外注先の対応待ち</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <FaFileAlt className="text-primary-300 mt-1 flex-shrink-0" />
                  <div>
                    <span className="block font-semibold text-primary-700">修正のたびにやり直し</span>
                    <span className="text-sm text-primary-400">設計変更への柔軟性が低い</span>
                  </div>
                </li>
              </ul>
            </div>

            {/* After */}
            <div className="bg-primary-800 rounded-2xl p-8 text-white shadow-lg">
              <p className="text-xs font-bold text-accent-300 uppercase tracking-wider mb-5">
                楽々省エネ計算
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <FaYenSign className="text-accent-400 mt-1 flex-shrink-0" />
                  <div>
                    <span className="block font-semibold">完全無料</span>
                    <span className="text-sm text-primary-300">何件でも追加費用なし</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <FaClock className="text-accent-400 mt-1 flex-shrink-0" />
                  <div>
                    <span className="block font-semibold">最短5分</span>
                    <span className="text-sm text-primary-300">入力から結果出力まで</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <FaFileAlt className="text-accent-400 mt-1 flex-shrink-0" />
                  <div>
                    <span className="block font-semibold">何度でも再計算</span>
                    <span className="text-sm text-primary-300">設計変更に即座に対応</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <p className="text-center text-sm text-primary-400 mt-8">
            大幅な工数削減で、設計業務に集中できる時間を取り戻す。
          </p>
        </div>
      </section>

      {/* ===== Bottom CTA ===== */}
      <section style={fullBleed} className="bg-primary-800">
        <div className="max-w-3xl mx-auto px-4 py-20 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            もう省エネ計算で悩まない。
          </h2>
          <p className="text-lg text-primary-300 mb-10 max-w-xl mx-auto leading-relaxed">
            {isAuthenticated
              ? '計算ツールはいつでもご利用いただけます。'
              : '無料アカウントを作成して、今すぐ省エネ計算を始めましょう。'}
          </p>

          {isAuthenticated ? (
            <Link
              href="/tools/official-bei"
              className="inline-flex items-center justify-center gap-2 bg-accent-500 hover:bg-accent-600 text-white font-bold py-4 px-10 rounded-xl shadow-lg transition-colors duration-200 text-lg"
            >
              BEI計算を開始
              <FaArrowRight className="text-sm" />
            </Link>
          ) : (
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 bg-accent-500 hover:bg-accent-600 text-white font-bold py-4 px-10 rounded-xl shadow-lg transition-colors duration-200 text-lg"
            >
              無料で計算を始める
              <FaArrowRight className="text-sm" />
            </Link>
          )}
        </div>
      </section>
    </Layout>
  );
}
