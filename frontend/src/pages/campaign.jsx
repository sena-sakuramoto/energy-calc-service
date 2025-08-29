// frontend/src/pages/campaign.jsx
import Layout from '../components/Layout';
import Link from 'next/link';
import { FaGift, FaClock, FaCheckCircle, FaCalculator, FaFileDownload, FaStar, FaArrowRight } from 'react-icons/fa';

export default function Campaign() {
  return (
    <Layout title="期間限定無料キャンペーン - 楽々省エネ計算">
      <div className="max-w-5xl mx-auto">
        {/* ヘッダー */}
        <div className="text-center mb-12">
          <div className="mb-6">
            <span className="bg-red-600 text-white px-6 py-2 rounded-full text-lg font-bold animate-pulse">
              🔥 期間限定キャンペーン実施中
            </span>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            <span className="text-red-600">完全無料</span>で使えるチャンス！
          </h1>
          <p className="text-2xl text-gray-700 mb-6">
            通常月額19,800円の省エネ計算サービスが<br />
            <strong className="text-red-600 text-3xl">2024年12月末まで完全無料</strong>
          </p>
          <div className="bg-yellow-100 border-2 border-yellow-400 rounded-lg p-4 max-w-2xl mx-auto">
            <FaClock className="inline mr-2 text-yellow-600" />
            <span className="font-bold text-yellow-800">
              キャンペーン終了まで残りわずか！今すぐご利用ください
            </span>
          </div>
        </div>

        {/* 無料で使える期間と内容 */}
        <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-2xl p-8 mb-12 shadow-2xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">🎁 無料期間と内容</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white bg-opacity-20 rounded-lg p-6">
                <FaClock className="text-4xl mb-4 mx-auto" />
                <h3 className="text-xl font-bold mb-2">無料期間</h3>
                <div className="text-2xl font-bold mb-2">2024年12月31日まで</div>
                <p className="text-sm opacity-90">
                  期間中は全機能が完全無料でご利用いただけます
                </p>
              </div>
              
              <div className="bg-white bg-opacity-20 rounded-lg p-6">
                <FaGift className="text-4xl mb-4 mx-auto" />
                <h3 className="text-xl font-bold mb-2">無料内容</h3>
                <div className="text-2xl font-bold mb-2">全機能制限なし</div>
                <p className="text-sm opacity-90">
                  有料版と全く同じ機能をすべて無料でご提供
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 通常料金と無料期間の比較 */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">💰 どれだけお得？</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* 通常料金 */}
            <div className="text-center border-2 border-gray-300 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-700 mb-4">通常料金</h3>
              <div className="text-4xl font-bold text-gray-900 mb-2">
                ¥19,800
                <span className="text-lg text-gray-600">/月</span>
              </div>
              <p className="text-gray-600 mb-4">2025年1月から適用予定</p>
              <div className="space-y-2 text-sm text-gray-600">
                <div>✓ BEI計算機能</div>
                <div>✓ PDF・Excel出力</div>
                <div>✓ プロジェクト管理</div>
                <div>✓ サポート対応</div>
              </div>
            </div>

            {/* キャンペーン価格 */}
            <div className="text-center border-4 border-red-500 rounded-lg p-6 bg-red-50 relative">
              <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                今だけ！
              </span>
              <h3 className="text-xl font-semibold text-red-700 mb-4">キャンペーン価格</h3>
              <div className="text-5xl font-bold text-red-600 mb-2">
                ¥0
                <span className="text-lg text-red-400">/月</span>
              </div>
              <p className="text-red-600 font-bold mb-4">2024年12月末まで</p>
              <div className="space-y-2 text-sm text-red-700">
                <div>✓ BEI計算機能（同じ機能）</div>
                <div>✓ PDF・Excel出力（同じ機能）</div>
                <div>✓ プロジェクト管理（同じ機能）</div>
                <div>✓ サポート対応（同じ対応）</div>
              </div>
            </div>
          </div>

          <div className="text-center mt-8 p-6 bg-yellow-50 rounded-lg">
            <h3 className="text-2xl font-bold text-yellow-800 mb-2">
              🎯 キャンペーン期間中に使い始めると...
            </h3>
            <p className="text-xl text-yellow-700 font-semibold">
              最大 <span className="text-3xl text-red-600 font-bold">39,600円</span> もお得！
              <span className="block text-sm text-yellow-600 mt-1">（2ヶ月分の利用料金が無料）</span>
            </p>
          </div>
        </div>

        {/* 無料で使える全機能 */}
        <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl p-8 mb-12">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">🚀 無料で使える全機能</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <FaCalculator className="text-4xl text-blue-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">省エネ計算エンジン</h3>
              <ul className="text-gray-700 space-y-2 text-sm">
                <li>✓ BEI計算（建築物省エネ法準拠）</li>
                <li>✓ 外皮性能計算（UA値・ηA値）</li>
                <li>✓ 一次エネルギー消費量計算</li>
                <li>✓ 地域区分別基準値対応</li>
                <li>✓ 適合・不適合判定</li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <FaFileDownload className="text-4xl text-green-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">申請書類作成</h3>
              <ul className="text-gray-700 space-y-2 text-sm">
                <li>✓ PDF詳細レポート出力</li>
                <li>✓ Excel計算書ダウンロード</li>
                <li>✓ 行政申請用書類対応</li>
                <li>✓ グラフ・図表付きレポート</li>
                <li>✓ 計算根拠明記</li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <FaStar className="text-4xl text-purple-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">プロ仕様機能</h3>
              <ul className="text-gray-700 space-y-2 text-sm">
                <li>✓ プロジェクト管理機能</li>
                <li>✓ 計算履歴保存</li>
                <li>✓ 複数建物対応</li>
                <li>✓ 設計条件比較</li>
                <li>✓ 専門サポート</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 今すぐ始めるCTA */}
        <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-2xl p-8 text-center shadow-2xl">
          <h2 className="text-3xl font-bold mb-4">⏰ 今すぐ始めないと損します！</h2>
          <p className="text-xl mb-6">
            月額19,800円のサービスを完全無料で使えるのは<br />
            <strong className="text-yellow-300 text-2xl">2024年12月31日まで</strong>
          </p>
          
          <div className="mb-6">
            <p className="text-lg mb-2">🎯 アカウント登録は不要</p>
            <p className="text-lg mb-2">🎯 今すぐ5分で計算完了</p>
            <p className="text-lg">🎯 申請書類も即座にダウンロード</p>
          </div>

          <Link
            href="/tools/bei-calculator"
            className="inline-block bg-yellow-400 hover:bg-yellow-300 text-red-900 font-bold py-6 px-12 rounded-2xl shadow-2xl transition-all duration-300 transform hover:scale-105 text-2xl mr-4"
          >
            🔥 今すぐ無料で始める
          </Link>
          
          <div className="mt-6 text-sm opacity-90">
            <p>※ キャンペーン期間終了後は通常料金となります</p>
            <p>※ 期間中に始めた計算は無料で完了できます</p>
          </div>
        </div>

        {/* よくある質問 */}
        <div className="mt-12 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">❓ キャンペーンについて よくある質問</h2>
          
          <div className="space-y-6">
            <div className="border-b border-gray-200 pb-4">
              <h3 className="font-bold text-gray-900 mb-2">Q. 本当に無料ですか？隠れた料金はありませんか？</h3>
              <p className="text-gray-700">A. はい、2024年12月31日まで完全無料です。隠れた料金は一切ありません。</p>
            </div>
            
            <div className="border-b border-gray-200 pb-4">
              <h3 className="font-bold text-gray-900 mb-2">Q. アカウント登録は必要ですか？</h3>
              <p className="text-gray-700">A. いいえ、アカウント登録不要です。ウェブサイトにアクセスするだけで即座に利用開始できます。</p>
            </div>
            
            <div className="border-b border-gray-200 pb-4">
              <h3 className="font-bold text-gray-900 mb-2">Q. 計算精度は有料版と同じですか？</h3>
              <p className="text-gray-700">A. はい、建築物省エネ法に完全準拠した正確な計算を行います。有料版と全く同じエンジンです。</p>
            </div>
            
            <div className="border-b border-gray-200 pb-4">
              <h3 className="font-bold text-gray-900 mb-2">Q. 2025年1月以降はどうなりますか？</h3>
              <p className="text-gray-700">A. 2025年1月以降は月額19,800円となりますが、引き続き同じ高品質なサービスをご利用いただけます。</p>
            </div>
            
            <div className="border-b border-gray-200 pb-4">
              <h3 className="font-bold text-gray-900 mb-2">Q. 商用利用はできますか？</h3>
              <p className="text-gray-700">A. はい、設計業務での商用利用も可能です。ただし計算結果は参考値として専門家による確認をお願いします。</p>
            </div>
            
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Q. サービスは安定していますか？</h3>
              <p className="text-gray-700">A. はい、24時間監視体制で99.9%の稼働率を保っています。
                <Link href="/system/status" className="text-blue-600 hover:text-blue-800 font-medium ml-2">
                  📊 リアルタイムの稼働状況はこちら
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* 安心してご利用いただくために */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <div className="text-center">
            <h3 className="text-xl font-bold text-blue-900 mb-4">🛡️ 安心してご利用いただくために</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link
                href="/system/status"
                className="bg-white hover:bg-gray-50 text-blue-900 font-medium py-3 px-4 rounded-lg shadow transition-all duration-300 transform hover:scale-105"
              >
                📊 サービス稼働状況
              </Link>
              <Link
                href="/about"
                className="bg-white hover:bg-gray-50 text-blue-900 font-medium py-3 px-4 rounded-lg shadow transition-all duration-300 transform hover:scale-105"
              >
                🏢 会社・サービス情報
              </Link>
              <Link
                href="/contact"
                className="bg-white hover:bg-gray-50 text-blue-900 font-medium py-3 px-4 rounded-lg shadow transition-all duration-300 transform hover:scale-105"
              >
                💬 お問い合わせ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}