// frontend/src/pages/campaign.jsx
import Layout from '../components/Layout';
import Link from 'next/link';
import { useAuth } from '../contexts/FirebaseAuthContext';
import {
  FaCalculator,
  FaFileDownload,
  FaCheckCircle,
  FaArrowRight,
  FaClock,
  FaShieldAlt,
  FaUpload,
  FaFileAlt,
} from 'react-icons/fa';

export default function Campaign() {
  const { isAuthenticated } = useAuth();

  return (
    <Layout title="楽々省エネ計算 - 無料で使えるBEI計算ツール">
      <div className="max-w-5xl mx-auto">

        {/* ===== 1. Hero Section ===== */}
        <section className="bg-warm-50 py-20 rounded-lg mb-20">
          <div className="max-w-3xl mx-auto text-center px-6">
            <p className="text-accent-500 font-semibold text-sm tracking-wide mb-4">
              無料で使えるBEI計算ツール
            </p>

            <h1 className="text-4xl md:text-5xl font-bold text-primary-900 leading-tight mb-6">
              省エネ計算を、楽々に。
            </h1>

            <p className="text-lg md:text-xl text-primary-700 leading-relaxed mb-4">
              2025年4月の法改正で、すべての建築物に省エネ基準への適合が求められる時代。
              <br className="hidden md:block" />
              モデル建物法によるBEI計算を、選択入力だけで完了できます。
            </p>

            <p className="text-primary-500 text-sm mb-10">
              国交省モデル建物法 v3.8 準拠 / 公式API連携で公式様式PDF出力
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              {isAuthenticated ? (
                <>
                  <Link
                    href="/tools/bei-calculator"
                    className="bg-accent-500 hover:bg-accent-600 text-white font-bold py-4 px-10 rounded-lg shadow-lg transition-all duration-300 text-lg"
                  >
                    計算ツールを使う
                  </Link>
                  <Link
                    href="/projects"
                    className="border-2 border-primary-700 text-primary-700 hover:bg-primary-700 hover:text-white font-bold py-4 px-8 rounded-lg transition-all duration-300"
                  >
                    プロジェクト一覧
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/register"
                    className="bg-accent-500 hover:bg-accent-600 text-white font-bold py-4 px-10 rounded-lg shadow-lg transition-all duration-300 text-lg"
                  >
                    無料で始める
                  </Link>
                  <Link
                    href="/tools/bei-calculator"
                    className="border-2 border-primary-700 text-primary-700 hover:bg-primary-700 hover:text-white font-bold py-4 px-8 rounded-lg transition-all duration-300"
                  >
                    計算画面を見る
                  </Link>
                </>
              )}
            </div>

            <p className="text-primary-400 text-xs">
              クレジットカード登録不要 / アカウント作成30秒
            </p>
          </div>
        </section>

        {/* ===== 2. Pain Points ===== */}
        <section className="mb-20 px-4">
          <h2 className="text-3xl font-bold text-primary-800 text-center mb-4">
            省エネ計算、こんな悩みはありませんか？
          </h2>
          <p className="text-primary-600 text-center mb-12 max-w-2xl mx-auto">
            2025年の法改正で対象が拡大し、多くの設計事務所が対応に追われています。
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-8 shadow-sm border border-primary-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div className="text-primary-300 text-3xl mb-4">
                <FaFileAlt />
              </div>
              <h3 className="text-lg font-bold text-primary-900 mb-3">
                法改正で対象が拡大
              </h3>
              <p className="text-primary-600 text-sm leading-relaxed">
                4号特例の縮小により、これまで省エネ計算が不要だった小規模建築物にも適合義務が拡大。対応案件が急増しています。
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-sm border border-primary-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div className="text-primary-300 text-3xl mb-4">
                <FaClock />
              </div>
              <h3 className="text-lg font-bold text-primary-900 mb-3">
                WEBPROは複雑すぎる
              </h3>
              <p className="text-primary-600 text-sm leading-relaxed">
                国交省の公式ツールは網羅的ですが、操作画面が複雑で学習コストが高い。慣れるまでに何日もかかることも。
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-sm border border-primary-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div className="text-primary-300 text-3xl mb-4">
                <FaCalculator />
              </div>
              <h3 className="text-lg font-bold text-primary-900 mb-3">
                外注は1件5万円～
              </h3>
              <p className="text-primary-600 text-sm leading-relaxed">
                省エネ計算を外注すると1件あたり5万円以上。案件が増えればコストも膨らみ、小規模事務所には大きな負担です。
              </p>
            </div>
          </div>
        </section>

        {/* ===== 3. Solution Cards ===== */}
        <section className="mb-20 px-4">
          <h2 className="text-3xl font-bold text-primary-800 text-center mb-4">
            楽々省エネ計算でできること
          </h2>
          <p className="text-primary-600 text-center mb-12 max-w-2xl mx-auto">
            モデル建物法に特化し、必要な機能だけをシンプルにまとめました。
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-sm border-l-4 border-accent-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div className="text-accent-500 text-4xl mb-6">
                <FaCalculator />
              </div>
              <h3 className="text-xl font-bold text-primary-800 mb-3">BEI自動計算</h3>
              <p className="text-primary-600 text-sm mb-4">
                モデル建物法に基づくBEI値を、選択式の入力だけで算出。地域区分・用途別の基準値も自動参照します。
              </p>
              <ul className="text-sm text-primary-600 space-y-2">
                <li className="flex items-start">
                  <FaCheckCircle className="text-accent-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span>BEI値の自動算出</span>
                </li>
                <li className="flex items-start">
                  <FaCheckCircle className="text-accent-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span>地域区分・用途別基準値の自動参照</span>
                </li>
                <li className="flex items-start">
                  <FaCheckCircle className="text-accent-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span>適合判定の即時表示</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-sm border-l-4 border-accent-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div className="text-accent-500 text-4xl mb-6">
                <FaFileDownload />
              </div>
              <h3 className="text-xl font-bold text-primary-800 mb-3">公式PDF出力</h3>
              <p className="text-primary-600 text-sm mb-4">
                国交省 v3.8 公式APIに直接連携。確認申請に使用できる公式様式のPDFを出力できます。
              </p>
              <ul className="text-sm text-primary-600 space-y-2">
                <li className="flex items-start">
                  <FaCheckCircle className="text-accent-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span>国交省API v3.8 準拠の公式様式</span>
                </li>
                <li className="flex items-start">
                  <FaCheckCircle className="text-accent-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span>確認申請に使用可能</span>
                </li>
                <li className="flex items-start">
                  <FaCheckCircle className="text-accent-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span>計算根拠を明記</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-sm border-l-4 border-accent-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div className="text-accent-500 text-4xl mb-6">
                <FaUpload />
              </div>
              <h3 className="text-xl font-bold text-primary-800 mb-3">選択式入力</h3>
              <p className="text-primary-600 text-sm mb-4">
                複雑な数値入力は不要。空調・照明・給湯などの設備タイプを選択するだけで計算に必要な情報が揃います。
              </p>
              <ul className="text-sm text-primary-600 space-y-2">
                <li className="flex items-start">
                  <FaCheckCircle className="text-accent-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span>選択式で直感的な操作</span>
                </li>
                <li className="flex items-start">
                  <FaCheckCircle className="text-accent-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Excelシートのアップロードにも対応</span>
                </li>
                <li className="flex items-start">
                  <FaCheckCircle className="text-accent-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span>複数案件を保存・管理</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* ===== 4. How It Works (3 Steps) ===== */}
        <section className="bg-warm-50 rounded-lg py-16 px-6 mb-20">
          <h2 className="text-3xl font-bold text-primary-800 text-center mb-4">
            使い方はかんたん3ステップ
          </h2>
          <p className="text-primary-600 text-center mb-12">
            アカウント登録から計算完了まで、数分で終わります。
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="bg-accent-500 text-white w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-lg font-bold text-primary-800 mb-2">建物情報を入力</h3>
              <p className="text-primary-600 text-sm">
                用途・地域区分・延べ面積など、基本的な建物情報を選択・入力します。
              </p>
            </div>

            <div className="text-center">
              <div className="bg-accent-500 text-white w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-lg font-bold text-primary-800 mb-2">設備情報を選択</h3>
              <p className="text-primary-600 text-sm">
                空調・照明・給湯・昇降機のタイプをプルダウンから選ぶだけ。複雑な数値入力は不要です。
              </p>
            </div>

            <div className="text-center">
              <div className="bg-accent-500 text-white w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-lg font-bold text-primary-800 mb-2">計算実行・PDF出力</h3>
              <p className="text-primary-600 text-sm">
                ボタンひとつでBEI値を算出。公式API連携で公式様式PDFをダウンロードできます。
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link
              href={isAuthenticated ? '/tools/bei-calculator' : '/register'}
              className="bg-accent-500 hover:bg-accent-600 text-white font-bold py-4 px-10 rounded-lg shadow-lg transition-all duration-300 text-lg inline-block"
            >
              {isAuthenticated ? '計算ツールを使う' : '無料で始める'}
            </Link>
          </div>
        </section>

        {/* ===== 5. Before/After ===== */}
        <section className="mb-20 px-4">
          <h2 className="text-3xl font-bold text-primary-800 text-center mb-12">
            従来の方法との比較
          </h2>

          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white border-2 border-primary-200 rounded-xl p-8">
                <div className="text-center mb-6">
                  <span className="bg-primary-100 text-primary-600 text-sm font-semibold px-4 py-1 rounded-full">
                    従来の方法
                  </span>
                </div>
                <div className="flex items-center justify-center mb-6">
                  <FaClock className="text-primary-400 text-2xl mr-3" />
                  <span className="text-3xl font-bold text-primary-800">3～5日</span>
                </div>
                <div className="space-y-3 text-primary-600 text-sm">
                  <div className="flex items-start">
                    <span className="text-primary-300 mr-2">—</span>
                    <span>手計算 or WEBPROで丸1日以上</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-primary-300 mr-2">—</span>
                    <span>外注なら1件あたり5万円～</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-primary-300 mr-2">—</span>
                    <span>申請書類を手作業で作成</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-primary-300 mr-2">—</span>
                    <span>マニュアルの読み込みが必要</span>
                  </div>
                </div>
              </div>

              <div className="bg-warm-50 border-2 border-accent-300 rounded-xl p-8">
                <div className="text-center mb-6">
                  <span className="bg-accent-100 text-accent-600 text-sm font-semibold px-4 py-1 rounded-full">
                    楽々省エネ計算
                  </span>
                </div>
                <div className="flex items-center justify-center mb-6">
                  <FaCheckCircle className="text-accent-500 text-2xl mr-3" />
                  <span className="text-3xl font-bold text-accent-600">5～10分</span>
                </div>
                <div className="space-y-3 text-primary-700 text-sm">
                  <div className="flex items-start">
                    <FaCheckCircle className="text-accent-400 mr-2 mt-0.5 flex-shrink-0" />
                    <span>選択入力だけで計算完了</span>
                  </div>
                  <div className="flex items-start">
                    <FaCheckCircle className="text-accent-400 mr-2 mt-0.5 flex-shrink-0" />
                    <span>完全無料で利用可能</span>
                  </div>
                  <div className="flex items-start">
                    <FaCheckCircle className="text-accent-400 mr-2 mt-0.5 flex-shrink-0" />
                    <span>公式様式PDFを自動出力</span>
                  </div>
                  <div className="flex items-start">
                    <FaCheckCircle className="text-accent-400 mr-2 mt-0.5 flex-shrink-0" />
                    <span>直感的な操作で学習コスト最小</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 bg-white rounded-xl border border-primary-100 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-primary-50">
                    <th className="text-left py-3 px-4 text-primary-600 font-semibold"></th>
                    <th className="text-center py-3 px-4 text-primary-600 font-semibold">従来</th>
                    <th className="text-center py-3 px-4 text-accent-600 font-semibold">楽々省エネ計算</th>
                  </tr>
                </thead>
                <tbody className="text-primary-700">
                  <tr className="border-t border-primary-100">
                    <td className="py-3 px-4 font-medium">所要時間</td>
                    <td className="text-center py-3 px-4">1～3日</td>
                    <td className="text-center py-3 px-4 font-semibold text-accent-600">5～10分</td>
                  </tr>
                  <tr className="border-t border-primary-100">
                    <td className="py-3 px-4 font-medium">費用</td>
                    <td className="text-center py-3 px-4">5万円～/件</td>
                    <td className="text-center py-3 px-4 font-semibold text-accent-600">無料</td>
                  </tr>
                  <tr className="border-t border-primary-100">
                    <td className="py-3 px-4 font-medium">書類出力</td>
                    <td className="text-center py-3 px-4">手作業で作成</td>
                    <td className="text-center py-3 px-4 font-semibold text-accent-600">公式PDF自動出力</td>
                  </tr>
                  <tr className="border-t border-primary-100">
                    <td className="py-3 px-4 font-medium">学習コスト</td>
                    <td className="text-center py-3 px-4">マニュアル必要</td>
                    <td className="text-center py-3 px-4 font-semibold text-accent-600">選択式で直感的</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ===== 6. FAQ ===== */}
        <section className="mb-20 px-4">
          <h2 className="text-3xl font-bold text-primary-800 text-center mb-12">
            よくある質問
          </h2>

          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-primary-100">
              <h3 className="font-bold text-primary-900 mb-2">
                Q. 本当に無料ですか？
              </h3>
              <p className="text-primary-700 text-sm leading-relaxed">
                A. はい、すべての機能を無料でお使いいただけます。クレジットカードの登録も不要です。将来的にも基本機能は無料で提供を続ける方針です。
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-primary-100">
              <h3 className="font-bold text-primary-900 mb-2">
                Q. 計算精度は信頼できますか？
              </h3>
              <p className="text-primary-700 text-sm leading-relaxed">
                A. 国交省モデル建物法の計算ロジックに基づいて実装しています。公式PDF出力は国交省 v3.8 公式API連携で生成されるため、確認申請にも使用可能です。ただし画面上の参考計算は社内検討用としてご利用ください。
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-primary-100">
              <h3 className="font-bold text-primary-900 mb-2">
                Q. WEBPROとの違いは？
              </h3>
              <p className="text-primary-700 text-sm leading-relaxed">
                A. WEBPROは国交省の公式ツールで網羅的ですが、操作画面が複雑で学習コストが高いのが課題です。楽々省エネ計算はモデル建物法に特化し、選択式の簡単入力で同等の計算結果を得られるよう設計しています。
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-primary-100">
              <h3 className="font-bold text-primary-900 mb-2">
                Q. データは安全ですか？
              </h3>
              <p className="text-primary-700 text-sm leading-relaxed">
                A. SSL暗号化通信を使用し、認証にはFirebase Authenticationを採用しています。入力されたデータは安全に管理されています。
              </p>
            </div>

            {!isAuthenticated && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-primary-100">
                <h3 className="font-bold text-primary-900 mb-2">
                  Q. アカウント登録は必要ですか？
                </h3>
                <p className="text-primary-700 text-sm leading-relaxed">
                  A. はい、プロジェクト管理とPDF出力のためにアカウント登録が必要です。Googleアカウントまたはメールアドレスで30秒ほどで作成できます。
                </p>
              </div>
            )}

            <div className="bg-white rounded-xl p-6 shadow-sm border border-primary-100">
              <h3 className="font-bold text-primary-900 mb-2">
                Q. 商用利用できますか？
              </h3>
              <p className="text-primary-700 text-sm leading-relaxed">
                A. はい、設計業務でご自由にお使いください。ツールは開発中で継続的に改善を行っています。ご意見・ご要望もお待ちしています。
              </p>
            </div>
          </div>
        </section>

        {/* ===== 7. Final CTA ===== */}
        <section className="bg-primary-800 rounded-lg py-16 px-6 mb-12">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              省エネ計算を、もっと手軽に。
            </h2>
            <p className="text-lg text-primary-300 mb-10">
              面倒な計算はツールに任せて、設計に集中しませんか。
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              {isAuthenticated ? (
                <>
                  <Link
                    href="/tools/bei-calculator"
                    className="bg-accent-500 hover:bg-accent-600 text-white font-bold py-4 px-12 rounded-lg shadow-xl transition-all duration-300 text-lg"
                  >
                    計算ツールを使う
                  </Link>
                  <Link
                    href="/projects"
                    className="border-2 border-white text-white hover:bg-white hover:text-primary-800 font-bold py-4 px-8 rounded-lg transition-all duration-300"
                  >
                    プロジェクト一覧
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/register"
                    className="bg-accent-500 hover:bg-accent-600 text-white font-bold py-4 px-12 rounded-lg shadow-xl transition-all duration-300 text-lg"
                  >
                    無料で計算を始める
                  </Link>
                  <Link
                    href="/tools/bei-calculator"
                    className="border-2 border-white text-white hover:bg-white hover:text-primary-800 font-bold py-4 px-8 rounded-lg transition-all duration-300"
                  >
                    計算画面を見る
                  </Link>
                </>
              )}
            </div>

            <div className="flex flex-wrap justify-center gap-6 text-primary-300 text-sm mb-6">
              <div className="flex items-center">
                <FaShieldAlt className="mr-1.5" />
                <span>SSL暗号化</span>
              </div>
              <div className="flex items-center">
                <FaCheckCircle className="mr-1.5" />
                <span>無料</span>
              </div>
              <div className="flex items-center">
                <FaCheckCircle className="mr-1.5" />
                <span>クレジットカード登録不要</span>
              </div>
            </div>

            <p className="text-primary-400 text-xs">
              登録も利用もすべて無料です / 退会はいつでも可能
            </p>
          </div>
        </section>

        {/* ===== 8. Circle Teaser ===== */}
        <section className="mb-12 px-4">
          <div className="bg-warm-100 rounded-xl p-8 max-w-3xl mx-auto text-center">
            <p className="text-primary-500 text-sm mb-2">
              省エネ計算だけじゃない
            </p>
            <p className="text-primary-800 font-semibold mb-3">
              構造計算、工程管理、AI活用 ── 他のAI×建築ツールも
            </p>
            <p className="text-primary-600 text-sm mb-5">
              AI建築サークルでは、省エネ計算を含む複数のAIツールと建築テック情報をまとめて提供しています。
            </p>
            <a
              href="https://ai-architecture-circle.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-accent-500 hover:text-accent-600 font-semibold text-sm transition-colors duration-300"
            >
              AI建築サークルについて詳しく見る
              <FaArrowRight className="ml-2 text-xs" />
            </a>
          </div>
        </section>

      </div>
    </Layout>
  );
}
