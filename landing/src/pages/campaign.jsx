import Link from 'next/link';
import {
  FaArrowRight,
  FaCalculator,
  FaCheckCircle,
  FaClock,
  FaFileDownload,
  FaRocket,
  FaShieldAlt,
  FaUpload,
  FaFileAlt,
} from 'react-icons/fa';

import Layout from '../components/Layout';

const APP_URL = 'https://app.rakuraku-energy.archi-prisma.co.jp';

const painPoints = [
  {
    icon: FaClock,
    title: '手計算や外注に時間がかかる',
    body: '省エネ計算は1件5万円〜の外注が相場。やり取りだけで数日失われ、軽微な修正も頼みにくい。',
  },
  {
    icon: FaFileAlt,
    title: 'WEBPROの操作が複雑',
    body: '国交省の公式ツール WEBPROは網羅的ですが、操作が複雑で学習コストが高い。',
  },
  {
    icon: FaCalculator,
    title: '2025年4月から全建物が対象に',
    body: '4号特例が縮小され、ほぼすべての建物に省エネ計算が必須に。今後、案件数が大幅に増える。',
  },
];

const features = [
  {
    icon: FaCalculator,
    title: 'BEI自動計算',
    body: 'モデル建物法に基づくBEI値を選択入力だけで算出。難しい計算ロジックは隠して、必要な情報だけを聞きます。',
    highlights: ['選択式で直感的', '国交省v3.8準拠', '計算結果はすぐに反映'],
  },
  {
    icon: FaFileDownload,
    title: '公式PDF出力',
    body: '国交省v3.8 APIに直接連携。計算結果から確認申請に使える公式様式PDFを自動生成します。',
    highlights: ['確認申請に直結', '手作業の書類作成が不要', '出力フォーマットは検証済み'],
  },
  {
    icon: FaUpload,
    title: 'Excelアップロード',
    body: '手持ちの公式入力シートをアップロードして、公式PDFに変換。既存の入力データを流用できます。',
    highlights: ['既存データの再利用', '検証も同時実行', 'PDF化は数秒'],
  },
];

const workflowSteps = [
  { number: '1', title: '建物情報を入力', description: '用途・地域・面積を選択。複雑な計算知識は不要です。' },
  { number: '2', title: '設備情報を選択', description: '空調・照明・給湯のタイプを選ぶだけ。表形式で迷いなく進みます。' },
  { number: '3', title: 'PDF出力 → 申請', description: '計算実行 → 公式PDFダウンロード → 確認申請へ。5-10分で完了。' },
];

const faqs = [
  { q: '本当に無料ですか？', a: 'はい、すべての機能を無料でお使いいただけます。クレジットカード登録も不要です。' },
  { q: '計算結果は確認申請に使えますか？', a: '公式PDF出力機能で国交省v3.8 APIから生成された様式は確認申請に使用可能です。ただし画面上の参考計算は社内検討用です。' },
  { q: 'WEBPROとの違いは何ですか？', a: 'WEBPROは国交省の公式ツールで網羅的ですが操作が複雑です。楽々省エネ計算はモデル建物法に特化し、選択式の簡単入力で同等の計算結果が得られます。' },
  { q: '計算精度は信頼できますか？', a: '国交省モデル建物法の計算ロジックに基づいて実装しています。計算結果は参考値として、最終確認は専門家の判断をお願いします。' },
  { q: 'データは安全ですか？', a: 'SSL暗号化通信を使用し、Firebase認証で安全に管理しています。通信内容は第三者に見られません。' },
  { q: '商用利用できますか？', a: 'はい、設計業務でご自由にお使いください。事務所のツールとして導入いただけます。' },
];

const comparisonData = [
  { category: '時間', traditional: '1-3日', solution: '5-10分' },
  { category: '費用', traditional: '5万円〜/件', solution: '無料' },
  { category: '出力', traditional: '手作業で書類作成', solution: '公式PDF自動出力' },
  { category: '学習', traditional: 'マニュアル読み込み必要', solution: '選択式で直感的' },
];

export default function Campaign() {
  return (
    <Layout
      title="楽々省エネ計算 | 無料のBEI計算ツール"
      description="2025年法改正で省エネ計算が必須化。選択式で5-10分、確認申請用の公式PDFも自動出力。無料で今すぐ始められます。"
      keywords="省エネ計算, BEI計算, 公式BEI, 建築物省エネ法, モデル建物法"
      path="/campaign"
    >
      <div className="max-w-6xl mx-auto">
        {/* ヒーロー */}
        <section className="py-16 md:py-24 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-accent-100 text-accent-700 text-xs font-semibold px-4 py-2 rounded-full mb-6">
              <FaRocket className="text-sm" />
              2025年4月法改正対応
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-900 leading-tight mb-6">
              省エネ計算を
              <br className="hidden sm:block" />
              5分で終わらせる
            </h1>
            <p className="text-lg md:text-xl text-primary-700 mb-4 max-w-2xl mx-auto leading-relaxed">
              確認申請に使える公式PDF、最短5-10分で自動出力。選択式の簡単入力で、難しい計算知識は不要です。
            </p>
            <p className="text-primary-600 text-sm md:text-base mb-8 max-w-2xl mx-auto">
              国交省モデル建物法 v3.8 対応 ・ SSL暗号化 ・ クレジットカード登録不要
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <a
                href={`${APP_URL}/register`}
                className="inline-flex items-center justify-center gap-2 bg-accent-500 hover:bg-accent-600 text-white font-bold py-4 px-10 rounded-lg shadow-lg transition-all duration-300 text-lg"
              >
                無料で始める
                <FaArrowRight className="text-sm" />
              </a>
              <a
                href={`${APP_URL}/login`}
                className="inline-flex items-center justify-center gap-2 border-2 border-primary-300 text-primary-700 hover:bg-primary-50 font-semibold py-4 px-8 rounded-lg transition-all duration-300"
              >
                ログイン
              </a>
            </div>
            <div className="flex flex-wrap justify-center gap-4 md:gap-6 text-primary-600 text-xs md:text-sm">
              <div className="flex items-center gap-1.5">
                <FaShieldAlt className="text-primary-400" />
                <span>通信は暗号化</span>
              </div>
              <div className="hidden sm:block text-primary-300">|</div>
              <div className="flex items-center gap-1.5">
                <FaCheckCircle className="text-accent-500" />
                <span>完全無料</span>
              </div>
              <div className="hidden sm:block text-primary-300">|</div>
              <div className="flex items-center gap-1.5">
                <FaCheckCircle className="text-accent-500" />
                <span>カード登録不要</span>
              </div>
            </div>
          </div>
        </section>

        {/* 課題提起 */}
        <section className="py-16 md:py-20 px-4 border-y border-warm-200">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-900 text-center mb-4">こんな悩みはありませんか？</h2>
            <p className="text-primary-600 text-center mb-12 max-w-2xl mx-auto">2025年4月から4号特例が縮小され、ほぼすべての建物に省エネ計算が必須化します。</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {painPoints.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="bg-white rounded-xl p-8 border border-warm-200 hover:border-accent-300 hover:shadow-lg transition-all duration-300">
                    <div className="text-accent-500 text-3xl mb-4"><Icon /></div>
                    <h3 className="text-lg font-bold text-primary-900 mb-3">{item.title}</h3>
                    <p className="text-primary-600 text-sm leading-relaxed">{item.body}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 機能紹介 */}
        <section className="py-16 md:py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-900 text-center mb-4">楽々省エネ計算でできること</h2>
            <p className="text-primary-600 text-center mb-12 max-w-2xl mx-auto">難しい計算知識を隠して、必要な情報だけを聞くシンプル設計。</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div key={feature.title} className="bg-gradient-to-br from-white to-warm-50 rounded-xl p-8 border border-warm-200 shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="text-accent-500 text-4xl mb-6"><Icon /></div>
                    <h3 className="text-xl font-bold text-primary-900 mb-3">{feature.title}</h3>
                    <p className="text-primary-600 text-sm mb-5 leading-relaxed">{feature.body}</p>
                    <ul className="text-xs text-primary-700 space-y-2">
                      {feature.highlights.map((h) => (
                        <li key={h} className="flex items-start gap-2">
                          <span className="text-accent-500 mt-0.5">✓</span>
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 使い方 */}
        <section className="py-16 md:py-20 px-4 bg-warm-50 rounded-2xl">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-900 text-center mb-4">3ステップで申請書類まで完成</h2>
            <p className="text-primary-600 text-center mb-12">誰でも迷わず進められる導線に設計。</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              {workflowSteps.map((step, index) => (
                <div key={step.number} className="relative">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-accent-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4 shadow-md">{step.number}</div>
                    <h3 className="text-lg font-bold text-primary-900 mb-2">{step.title}</h3>
                    <p className="text-primary-600 text-sm leading-relaxed">{step.description}</p>
                  </div>
                  {index < workflowSteps.length - 1 && (
                    <div className="hidden md:block absolute top-8 right-0 translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-accent-500 to-transparent" />
                  )}
                </div>
              ))}
            </div>
            <div className="mt-12 text-center">
              <p className="text-primary-700 font-semibold mb-4">
                <FaClock className="inline-block mr-2 text-accent-500" />
                5-10分で完了 ・ 確認申請への直結
              </p>
            </div>
          </div>
        </section>

        {/* Before/After比較 */}
        <section className="py-16 md:py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-900 text-center mb-12">従来との比較</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="bg-white rounded-xl border-2 border-primary-200 p-8">
                <p className="text-xs font-bold text-primary-500 uppercase tracking-wider mb-6">従来の方法</p>
                <div className="space-y-6">
                  {comparisonData.map((item) => (
                    <div key={item.category}>
                      <p className="text-xs font-semibold text-primary-500 uppercase mb-1">{item.category}</p>
                      <p className="text-lg font-semibold text-primary-700">{item.traditional}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-gradient-to-br from-accent-50 to-white rounded-xl border-2 border-accent-300 p-8 shadow-md">
                <p className="text-xs font-bold text-accent-600 uppercase tracking-wider mb-6">楽々省エネ計算</p>
                <div className="space-y-6">
                  {comparisonData.map((item) => (
                    <div key={item.category}>
                      <p className="text-xs font-semibold text-primary-500 uppercase mb-1">{item.category}</p>
                      <p className="text-lg font-bold text-accent-600 flex items-center gap-2">
                        <FaCheckCircle className="text-green-500 flex-shrink-0" />
                        {item.solution}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 md:py-20 px-4 border-y border-warm-200">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-900 text-center mb-12">よくある質問</h2>
            <div className="space-y-4">
              {faqs.map((item) => (
                <details key={item.q} className="bg-white rounded-lg border border-warm-200 hover:border-accent-300 hover:shadow-sm transition-all duration-300 group">
                  <summary className="cursor-pointer p-6 font-semibold text-primary-900 flex items-center justify-between">
                    <span className="text-left">{item.q}</span>
                    <span className="text-accent-500 group-open:rotate-180 transition-transform duration-300">▼</span>
                  </summary>
                  <div className="px-6 pb-6 border-t border-warm-100 text-primary-700 text-sm leading-relaxed">{item.a}</div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* 最終CTA */}
        <section className="py-16 md:py-20 px-4">
          <div className="max-w-3xl mx-auto text-center bg-primary-900 rounded-2xl p-8 md:p-12 text-white shadow-lg">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">今すぐ無料で始めましょう</h2>
            <p className="text-lg text-primary-300 mb-8 leading-relaxed">
              難しい知識は不要。選択式で5-10分、完成します。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={`${APP_URL}/register`}
                className="inline-flex items-center justify-center gap-2 bg-accent-500 hover:bg-accent-600 text-white font-bold py-4 px-12 rounded-lg shadow-xl transition-all duration-300 text-lg"
              >
                無料で始める
                <FaArrowRight className="text-sm" />
              </a>
              <a
                href={`${APP_URL}/login`}
                className="inline-flex items-center justify-center gap-2 border-2 border-white text-white hover:bg-white hover:text-primary-900 font-bold py-4 px-8 rounded-lg transition-all duration-300"
              >
                ログイン
              </a>
            </div>
            <p className="text-primary-400 text-xs mt-8">
              クレジットカード登録は不要です。アカウントは1分で作成できます。
            </p>
          </div>
        </section>

        {/* サークル導線 */}
        <section className="py-16 md:py-20 px-4 text-center">
          <div className="max-w-3xl mx-auto bg-warm-100 rounded-xl p-8 border border-warm-200">
            <p className="text-primary-600 text-sm mb-2">さらに詳しく学びたい方へ</p>
            <h3 className="text-lg md:text-xl font-bold text-primary-900 mb-4">AI建築サークル</h3>
            <p className="text-primary-700 text-sm mb-6 leading-relaxed">
              省エネ計算だけでなく、構造計算・確認申請・AI活用など、建築テックの最新情報を月額5,000円で学べるコミュニティ。楽々省エネ計算を含む複数のツール開発も進行中です。
            </p>
            <a
              href="https://ai-architecture-circle.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-accent-600 hover:text-accent-700 font-semibold text-sm transition-colors duration-300"
            >
              AI建築サークルの詳細を見る
              <FaArrowRight className="text-xs" />
            </a>
          </div>
        </section>
      </div>
    </Layout>
  );
}
