// frontend/src/pages/guide/model-building-method.jsx
// SEO最強・モデル建物法完全ガイドページ
import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../../components/Layout';
import { 
  FaCheckCircle, 
  FaTimesCircle, 
  FaCalculator, 
  FaBuilding, 
  FaChartLine,
  FaLightbulb,
  FaArrowRight,
  FaClock,
  FaMoneyBillWave,
  FaFileDownload,
  FaSearch,
  FaGavel,
  FaHome,
  FaIndustry,
  FaHospitalAlt,
  FaStore
} from 'react-icons/fa';

export default function ModelBuildingMethodGuide() {
  // 構造化データ（JSON-LD）
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "モデル建物法とは？適用条件から計算方法まで完全解説【2025年最新版】",
    "description": "建築物省エネ法のモデル建物法について、適用条件・計算方法・標準入力法との違いを建築士向けに詳しく解説。BEI計算が5分で完了する理由とは？",
    "author": {
      "@type": "Organization",
      "name": "建築物省エネ計算システム"
    },
    "publisher": {
      "@type": "Organization", 
      "name": "建築物省エネ計算システム",
      "logo": {
        "@type": "ImageObject",
        "url": "https://sena-sakuramoto.github.io/energy-calc-service/logo.png"
      }
    },
    "datePublished": "2025-08-30",
    "dateModified": "2025-08-30",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": "https://sena-sakuramoto.github.io/energy-calc-service/guide/model-building-method"
    },
    "articleSection": "建築物省エネ法",
    "keywords": "モデル建物法,BEI計算,建築物省エネ法,適合性判定,標準入力法,省エネ基準"
  };

  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "モデル建物法はどんな場合に使えますか？",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "延床面積300m²以上の非住宅建築物で、省エネ基準適合性判定を受ける場合に使用できます。標準入力法よりも簡単で、エネルギー消費量の実測値または設計値があれば5分程度で計算完了します。"
        }
      },
      {
        "@type": "Question", 
        "name": "モデル建物法と標準入力法の違いは？",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "モデル建物法は建物用途と延床面積から標準的な基準値を使用するため入力が簡単（5分程度）ですが、標準入力法は全ての設備・外皮仕様を詳細入力するため時間がかかります（数時間〜数日）。ただし、精度は両方とも審査機関で認められています。"
        }
      }
    ]
  };

  return (
    <>
      <Head>
        {/* SEO最適化タイトル・メタタグ */}
        <title>モデル建物法とは？適用条件から計算方法まで完全解説【2025年最新版】| BEI計算ツール</title>
        <meta name="description" content="建築物省エネ法のモデル建物法について、適用条件・計算方法・標準入力法との違いを建築士向けに詳しく解説。BEI計算が5分で完了する理由とは？無料計算ツールも提供。" />
        <meta name="keywords" content="モデル建物法,BEI計算,建築物省エネ法,適合性判定,標準入力法,省エネ基準,建築士,設計事務所,審査機関,国土交通省" />
        
        {/* OGP設定 */}
        <meta property="og:title" content="モデル建物法とは？適用条件から計算方法まで完全解説【2025年最新版】" />
        <meta property="og:description" content="建築物省エネ法のモデル建物法について建築士向けに詳しく解説。BEI計算が5分で完了する理由とは？" />
        <meta property="og:type" content="article" />
        <meta property="og:url" content="https://sena-sakuramoto.github.io/energy-calc-service/guide/model-building-method" />
        <meta property="og:image" content="https://sena-sakuramoto.github.io/energy-calc-service/og-model-building.png" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="モデル建物法とは？適用条件から計算方法まで完全解説" />
        <meta name="twitter:description" content="建築士必見！BEI計算が5分で完了するモデル建物法を徹底解説" />
        
        {/* 構造化データ */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <script
          type="application/ld+json" 
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
        />
        
        {/* 正規URL */}
        <link rel="canonical" href="https://sena-sakuramoto.github.io/energy-calc-service/guide/model-building-method" />
      </Head>

      <Layout>
        <article className="max-w-4xl mx-auto px-4 py-8">
          {/* パンくずリスト */}
          <nav className="text-sm text-gray-600 mb-6">
            <Link href="/" className="hover:text-blue-600">ホーム</Link>
            <span className="mx-2">›</span>
            <Link href="/guide" className="hover:text-blue-600">ガイド</Link>
            <span className="mx-2">›</span>
            <span className="text-gray-900">モデル建物法完全ガイド</span>
          </nav>

          {/* メインタイトル */}
          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              モデル建物法とは？適用条件から計算方法まで完全解説【2025年最新版】
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
              <time dateTime="2025-08-30">更新日：2025年8月30日</time>
              <span>•</span>
              <span>建築士向け</span>
              <span>•</span>
              <span>読了時間：約10分</span>
            </div>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
              <p className="text-blue-800">
                <strong>建築士・設計事務所の方へ：</strong>
                この記事では、建築物省エネ法の「モデル建物法」について、実務に必要な情報を網羅的に解説します。
                BEI計算を5分で完了させる方法も紹介します。
              </p>
            </div>
          </header>

          {/* 目次 */}
          <nav className="bg-gray-50 p-6 rounded-lg mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <FaSearch className="mr-2" />
              目次
            </h2>
            <ol className="space-y-2 text-sm">
              <li><a href="#what-is-model-building" className="text-blue-600 hover:underline">1. モデル建物法とは？</a></li>
              <li><a href="#application-conditions" className="text-blue-600 hover:underline">2. 適用条件・適用可能な建物</a></li>
              <li><a href="#vs-standard-input" className="text-blue-600 hover:underline">3. 標準入力法との違い</a></li>
              <li><a href="#calculation-flow" className="text-blue-600 hover:underline">4. 計算の流れ・必要な情報</a></li>
              <li><a href="#advantages-disadvantages" className="text-blue-600 hover:underline">5. メリット・デメリット</a></li>
              <li><a href="#submission-requirements" className="text-blue-600 hover:underline">6. 審査機関への提出要件</a></li>
              <li><a href="#free-calculator" className="text-blue-600 hover:underline">7. 無料BEI計算ツール</a></li>
              <li><a href="#faq" className="text-blue-600 hover:underline">8. よくある質問</a></li>
            </ol>
          </nav>

          {/* 1. モデル建物法とは？ */}
          <section id="what-is-model-building" className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <FaBuilding className="mr-3 text-blue-600" />
              1. モデル建物法とは？
            </h2>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-green-800 mb-3">モデル建物法の定義</h3>
              <p className="text-green-700 leading-relaxed">
                モデル建物法とは、建築物省エネ法における<strong>BEI（Building Energy Index）計算方法の一つ</strong>です。
                建物用途と延床面積から、国土交通省が定める<strong>標準的なエネルギー消費量原単位</strong>を基準として
                省エネ基準の適合性を判定します。
              </p>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-4">国土交通省告示による位置づけ</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <FaGavel className="mr-2 mt-1 text-blue-600 flex-shrink-0" />
                <span><strong>根拠法令：</strong>建築物のエネルギー消費性能の向上に関する法律（建築物省エネ法）</span>
              </li>
              <li className="flex items-start">
                <FaGavel className="mr-2 mt-1 text-blue-600 flex-shrink-0" />
                <span><strong>告示：</strong>国土交通省告示第1396号（平成28年1月29日）</span>
              </li>
              <li className="flex items-start">
                <FaGavel className="mr-2 mt-1 text-blue-600 flex-shrink-0" />
                <span><strong>計算方法：</strong>平成28年国土交通省告示第265号「モデル建物法による標準入力法」</span>
              </li>
            </ul>

            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800">
                <strong>⚠️ 重要：</strong>モデル建物法は<strong>標準入力法の一種</strong>です。
                「モデル建物法」と「標準入力法」を対立する概念として捉えるのは誤解です。
                正確には「標準入力法（モデル建物法）」vs「標準入力法（詳細計算）」という区分になります。
              </p>
            </div>
          </section>

          {/* 2. 適用条件 */}
          <section id="application-conditions" className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <FaCheckCircle className="mr-3 text-green-600" />
              2. 適用条件・適用可能な建物
            </h2>

            {/* 適用可能な建物 */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
                  <FaCheckCircle className="mr-2" />
                  適用できる建物
                </h3>
                <ul className="space-y-2 text-green-700">
                  <li className="flex items-center">
                    <FaBuilding className="mr-2 text-green-600" />
                    延床面積300m²以上の非住宅建築物
                  </li>
                  <li className="flex items-center">
                    <FaHome className="mr-2 text-green-600" />
                    共同住宅（住宅部分も含む）
                  </li>
                  <li className="flex items-center">
                    <FaIndustry className="mr-2 text-green-600" />
                    工場・倉庫（空調がある場合）
                  </li>
                  <li className="flex items-center">
                    <FaHospitalAlt className="mr-2 text-green-600" />
                    病院・福祉施設
                  </li>
                  <li className="flex items-center">
                    <FaStore className="mr-2 text-green-600" />
                    店舗・商業施設
                  </li>
                </ul>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-red-800 mb-4 flex items-center">
                  <FaTimesCircle className="mr-2" />
                  適用できない建物
                </h3>
                <ul className="space-y-2 text-red-700">
                  <li className="flex items-center">
                    <FaTimesCircle className="mr-2 text-red-600" />
                    延床面積300m²未満の建築物
                  </li>
                  <li className="flex items-center">
                    <FaTimesCircle className="mr-2 text-red-600" />
                    戸建住宅
                  </li>
                  <li className="flex items-center">
                    <FaTimesCircle className="mr-2 text-red-600" />
                    特殊用途（データセンター等）
                  </li>
                  <li className="flex items-center">
                    <FaTimesCircle className="mr-2 text-red-600" />
                    標準原単位が未定義の用途
                  </li>
                </ul>
              </div>
            </div>

            {/* 対応建物用途 */}
            <h3 className="text-xl font-semibold text-gray-900 mb-4">対応している建物用途（12用途）</h3>
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              {[
                { name: '事務所等', desc: 'オフィスビル・庁舎' },
                { name: 'ホテル等', desc: 'ホテル・旅館・民宿' },
                { name: '病院等', desc: '病院・診療所・福祉施設' },
                { name: '百貨店等', desc: '百貨店・大型商業施設' },
                { name: 'スーパーマーケット', desc: '食品スーパー・量販店' },
                { name: '学校等（小中学校）', desc: '小学校・中学校' },
                { name: '学校等（高等学校）', desc: '高等学校・高専' },
                { name: '学校等（大学）', desc: '大学・専門学校' },
                { name: '飲食店等', desc: 'レストラン・居酒屋' },
                { name: '集会所等', desc: '公民館・会議室' },
                { name: '工場等', desc: '製造業・倉庫' },
                { name: '共同住宅', desc: 'マンション・アパート' }
              ].map((item, index) => (
                <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800">{item.name}</h4>
                  <p className="text-sm text-blue-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 3. 標準入力法との違い */}
          <section id="vs-standard-input" className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <FaChartLine className="mr-3 text-purple-600" />
              3. 標準入力法（詳細計算）との違い
            </h2>

            <div className="overflow-x-auto mb-6">
              <table className="w-full border-collapse bg-white shadow-lg rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 p-4 text-left">比較項目</th>
                    <th className="border border-gray-300 p-4 text-center bg-green-50">モデル建物法</th>
                    <th className="border border-gray-300 p-4 text-center bg-blue-50">標準入力法（詳細計算）</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 p-4 font-semibold">計算時間</td>
                    <td className="border border-gray-300 p-4 text-center text-green-600">
                      <FaClock className="inline mr-1" />
                      <strong>5分程度</strong>
                    </td>
                    <td className="border border-gray-300 p-4 text-center text-blue-600">数時間〜数日</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 p-4 font-semibold">必要な入力情報</td>
                    <td className="border border-gray-300 p-4 text-green-600">
                      • 建物用途<br/>
                      • 延床面積<br/>
                      • エネルギー消費量（6項目）
                    </td>
                    <td className="border border-gray-300 p-4 text-blue-600">
                      • 全設備の詳細仕様<br/>
                      • 外皮性能詳細<br/>
                      • 運転スケジュール<br/>
                      • 制御システム詳細
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-4 font-semibold">精度</td>
                    <td className="border border-gray-300 p-4 text-center text-green-600">
                      <strong>十分</strong><br/>
                      <small>（国交省認定）</small>
                    </td>
                    <td className="border border-gray-300 p-4 text-center text-blue-600">
                      <strong>高精度</strong><br/>
                      <small>（実測値に近い）</small>
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 p-4 font-semibold">審査対応</td>
                    <td className="border border-gray-300 p-4 text-center text-green-600">
                      <FaCheckCircle className="inline text-green-500" />
                      <strong>完全対応</strong>
                    </td>
                    <td className="border border-gray-300 p-4 text-center text-blue-600">
                      <FaCheckCircle className="inline text-green-500" />
                      <strong>完全対応</strong>
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-4 font-semibold">コスト</td>
                    <td className="border border-gray-300 p-4 text-center text-green-600">
                      <FaMoneyBillWave className="inline mr-1" />
                      <strong>安価</strong>
                    </td>
                    <td className="border border-gray-300 p-4 text-center text-blue-600">高コスト</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-yellow-800 mb-3">
                <FaLightbulb className="inline mr-2" />
                どちらを選ぶべき？
              </h3>
              <div className="grid md:grid-cols-2 gap-4 text-yellow-700">
                <div>
                  <h4 className="font-semibold text-green-700 mb-2">モデル建物法がおすすめ</h4>
                  <ul className="text-sm space-y-1">
                    <li>• 基本設計段階での検討</li>
                    <li>• コストを抑えたい場合</li>
                    <li>• 標準的な設備を使用</li>
                    <li>• 迅速な判定が必要</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-blue-700 mb-2">詳細計算がおすすめ</h4>
                  <ul className="text-sm space-y-1">
                    <li>• 高効率設備を多用</li>
                    <li>• 特殊な制御システム</li>
                    <li>• より高い省エネ性能をアピール</li>
                    <li>• 補助金申請等で高精度が必要</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* 4. 計算の流れ */}
          <section id="calculation-flow" className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <FaCalculator className="mr-3 text-blue-600" />
              4. 計算の流れ・必要な情報
            </h2>

            <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* ステップ1 */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3">1</div>
                  <h3 className="text-lg font-semibold text-blue-800">基本情報入力</h3>
                </div>
                <ul className="space-y-2 text-blue-700 text-sm">
                  <li>• 建物用途の選択</li>
                  <li>• 地域区分（1〜8地域）</li>
                  <li>• 延床面積</li>
                </ul>
                <div className="mt-4 text-xs text-blue-600">
                  <FaClock className="inline mr-1" />
                  所要時間：約1分
                </div>
              </div>

              {/* ステップ2 */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <div className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3">2</div>
                  <h3 className="text-lg font-semibold text-green-800">エネルギー消費量入力</h3>
                </div>
                <ul className="space-y-2 text-green-700 text-sm">
                  <li>• 暖房エネルギー消費量</li>
                  <li>• 冷房エネルギー消費量</li>
                  <li>• 照明エネルギー消費量</li>
                  <li>• 換気エネルギー消費量</li>
                  <li>• 給湯エネルギー消費量</li>
                  <li>• その他エネルギー消費量</li>
                </ul>
                <div className="mt-4 text-xs text-green-600">
                  <FaClock className="inline mr-1" />
                  所要時間：約3分
                </div>
              </div>

              {/* ステップ3 */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <div className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3">3</div>
                  <h3 className="text-lg font-semibold text-purple-800">自動計算・結果出力</h3>
                </div>
                <ul className="space-y-2 text-purple-700 text-sm">
                  <li>• BEI値の自動算出</li>
                  <li>• 適合性判定</li>
                  <li>• 計算書PDF生成</li>
                  <li>• Excel形式出力</li>
                </ul>
                <div className="mt-4 text-xs text-purple-600">
                  <FaClock className="inline mr-1" />
                  所要時間：約1分
                </div>
              </div>
            </div>

            {/* BEI計算式 */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">BEI計算式</h3>
              <div className="bg-white p-4 rounded border text-center">
                <div className="text-2xl font-bold text-blue-600 mb-2">
                  BEI = 設計一次エネルギー消費量 ÷ 基準一次エネルギー消費量
                </div>
                <div className="text-sm text-gray-600">
                  BEI ≤ 1.0 で省エネ基準適合
                </div>
              </div>
              <div className="mt-4 grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-semibold text-gray-800">設計一次エネルギー消費量</h4>
                  <p className="text-gray-600">実際の建物で消費する年間エネルギー量（入力値）</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">基準一次エネルギー消費量</h4>
                  <p className="text-gray-600">標準原単位 × 延床面積で算出される基準値</p>
                </div>
              </div>
            </div>
          </section>

          {/* 5. メリット・デメリット */}
          <section id="advantages-disadvantages" className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <FaChartLine className="mr-3 text-orange-600" />
              5. メリット・デメリット
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {/* メリット */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
                  <FaCheckCircle className="mr-2" />
                  メリット
                </h3>
                <ul className="space-y-3 text-green-700">
                  <li className="flex items-start">
                    <FaClock className="mr-2 mt-0.5 flex-shrink-0" />
                    <span><strong>圧倒的な時短：</strong>5分程度で計算完了</span>
                  </li>
                  <li className="flex items-start">
                    <FaMoneyBillWave className="mr-2 mt-0.5 flex-shrink-0" />
                    <span><strong>コスト削減：</strong>詳細計算の1/10以下の費用</span>
                  </li>
                  <li className="flex items-start">
                    <FaLightbulb className="mr-2 mt-0.5 flex-shrink-0" />
                    <span><strong>簡単操作：</strong>専門知識なしでも使用可能</span>
                  </li>
                  <li className="flex items-start">
                    <FaGavel className="mr-2 mt-0.5 flex-shrink-0" />
                    <span><strong>公的認証：</strong>審査機関で完全に認められている</span>
                  </li>
                  <li className="flex items-start">
                    <FaFileDownload className="mr-2 mt-0.5 flex-shrink-0" />
                    <span><strong>即座に出力：</strong>PDF・Excel形式で即時ダウンロード</span>
                  </li>
                </ul>
              </div>

              {/* デメリット */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-red-800 mb-4 flex items-center">
                  <FaTimesCircle className="mr-2" />
                  デメリット・注意点
                </h3>
                <ul className="space-y-3 text-red-700">
                  <li className="flex items-start">
                    <FaTimesCircle className="mr-2 mt-0.5 flex-shrink-0" />
                    <span><strong>用途限定：</strong>標準的な12用途のみ対応</span>
                  </li>
                  <li className="flex items-start">
                    <FaTimesCircle className="mr-2 mt-0.5 flex-shrink-0" />
                    <span><strong>精度限界：</strong>特殊設備の省エネ効果を正確に反映しにくい</span>
                  </li>
                  <li className="flex items-start">
                    <FaTimesCircle className="mr-2 mt-0.5 flex-shrink-0" />
                    <span><strong>実測値必要：</strong>エネルギー消費量の実測値または精密な予測値が必要</span>
                  </li>
                  <li className="flex items-start">
                    <FaTimesCircle className="mr-2 mt-0.5 flex-shrink-0" />
                    <span><strong>改善提案限界：</strong>具体的な省エネ改善案の提示が困難</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* 6. 審査機関提出要件 */}
          <section id="submission-requirements" className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <FaGavel className="mr-3 text-red-600" />
              6. 審査機関への提出要件
            </h2>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-3">基本的な提出書類</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-blue-700 mb-2">✅ 必須書類</h4>
                  <ul className="space-y-1 text-sm text-blue-600">
                    <li>• BEI計算書</li>
                    <li>• 計算根拠資料</li>
                    <li>• 建物概要書</li>
                    <li>• 設計図面（平面図等）</li>
                    <li>• 申請者署名・印鑑</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-blue-700 mb-2">📋 補足資料</h4>
                  <ul className="space-y-1 text-sm text-blue-600">
                    <li>• 使用機器リスト</li>
                    <li>• エネルギー消費量根拠資料</li>
                    <li>• 運転条件設定書</li>
                    <li>• その他特記事項</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-yellow-800 mb-3">
                <FaLightbulb className="inline mr-2" />
                審査でよく指摘される点
              </h3>
              <ul className="space-y-2 text-yellow-700">
                <li className="flex items-start">
                  <span className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded text-xs font-semibold mr-3 mt-0.5">注意</span>
                  <span>エネルギー消費量の設定根拠が不明確</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded text-xs font-semibold mr-3 mt-0.5">注意</span>
                  <span>建物用途の分類が曖昧（複合用途等）</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded text-xs font-semibold mr-3 mt-0.5">注意</span>
                  <span>地域区分の確認不足</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded text-xs font-semibold mr-3 mt-0.5">注意</span>
                  <span>申請者情報・署名の不備</span>
                </li>
              </ul>
            </div>
          </section>

          {/* 7. 無料計算ツール */}
          <section id="free-calculator" className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <FaCalculator className="mr-3 text-green-600" />
              7. 無料BEI計算ツール
            </h2>

            <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-8 text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                🚀 無料BEI計算
              </h3>
              <p className="text-gray-700 mb-6">
                モデル建物法による正確なBEI計算が5分で完了。PDF・Excel出力も可能！
              </p>
              
              <div className="grid md:grid-cols-3 gap-4 mb-8">
                <div className="bg-white p-4 rounded-lg shadow">
                  <FaClock className="text-green-600 text-2xl mb-2 mx-auto" />
                  <h4 className="font-semibold">5分で完了</h4>
                  <p className="text-sm text-gray-600">簡単入力でBEI計算</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                  <FaFileDownload className="text-blue-600 text-2xl mb-2 mx-auto" />
                  <h4 className="font-semibold">PDF・Excel出力</h4>
                  <p className="text-sm text-gray-600">審査対応の計算書生成</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                  <FaGavel className="text-purple-600 text-2xl mb-2 mx-auto" />
                  <h4 className="font-semibold">国交省準拠</h4>
                  <p className="text-sm text-gray-600">正式な法令に完全対応</p>
                </div>
              </div>

              <Link 
                href="/register"
                className="inline-flex items-center bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-lg shadow-xl transition-all duration-300 transform hover:scale-105 text-lg"
              >
                <FaArrowRight className="mr-3" />
                無料アカウント作成して開始
              </Link>
            </div>
          </section>

          {/* 8. FAQ */}
          <section id="faq" className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <FaSearch className="mr-3 text-blue-600" />
              8. よくある質問（FAQ）
            </h2>

            <div className="space-y-6">
              {[
                {
                  q: "モデル建物法はどんな場合に使えますか？",
                  a: "延床面積300m²以上の非住宅建築物で、省エネ基準適合性判定を受ける場合に使用できます。標準入力法よりも簡単で、エネルギー消費量の実測値または設計値があれば5分程度で計算完了します。"
                },
                {
                  q: "モデル建物法と標準入力法、どちらが審査で有利ですか？",
                  a: "どちらも審査機関で同等に扱われ、有利不利はありません。モデル建物法は時間とコストの削減が、標準入力法は高精度な計算がメリットです。建物の特性と要求精度に応じて選択してください。"
                },
                {
                  q: "エネルギー消費量の数値はどこで入手できますか？",
                  a: "設備設計図書の年間消費量計算、エネルギーシミュレーションソフトの結果、既存建物の場合は過去の実績値から入手できます。概算の場合は、用途別原単位×延床面積で推定することも可能です。"
                },
                {
                  q: "複合用途の建物はどう計算しますか？",
                  a: "主たる用途で計算するか、用途別に面積按分して計算します。面積按分の場合は、各用途の標準原単位を面積比で重み付け平均して基準値を算出します。"
                },
                {
                  q: "計算結果の精度はどの程度ですか？",
                  a: "国土交通省が定める公式な計算方法のため、審査機関で認められる十分な精度があります。ただし、特殊な高効率設備の効果は標準入力法（詳細計算）の方がより正確に反映できます。"
                }
              ].map((faq, index) => (
                <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-start">
                    <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5 flex-shrink-0">Q</span>
                    {faq.q}
                  </h3>
                  <div className="pl-9">
                    <div className="flex items-start">
                      <span className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5 flex-shrink-0">A</span>
                      <p className="text-gray-700 leading-relaxed">{faq.a}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">モデル建物法でBEI計算を始めましょう！</h2>
            <p className="mb-6">
              国土交通省準拠の正確なBEI計算が、たった5分で完了。
              PDF・Excel出力で審査機関への提出にも対応。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/register"
                className="bg-white text-blue-600 hover:bg-gray-100 font-bold py-3 px-6 rounded-lg transition-colors"
              >
                無料アカウント作成
              </Link>
              <Link 
                href="/login"
                className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-600 font-bold py-3 px-6 rounded-lg transition-colors"
              >
                ログインして開始
              </Link>
            </div>
          </div>
        </article>
      </Layout>
    </>
  );
}