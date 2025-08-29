// frontend/src/pages/demo-guide.jsx
import Layout from '../components/Layout';
import Link from 'next/link';
import { FaPlay, FaCalculator, FaChartBar, FaDownload, FaCheckCircle, FaClock, FaLightbulb } from 'react-icons/fa';

export default function DemoGuide() {
  return (
    <Layout title="体験ガイド - 楽々省エネ計算">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            <FaPlay className="inline mr-3 text-green-600" />
            5分で体験！省エネ計算
          </h1>
          <p className="text-xl text-gray-600">
            登録不要で、今すぐ本格的なBEI計算を体験していただけます
          </p>
        </div>

        {/* クイックスタートボタン */}
        <div className="text-center mb-12">
          <Link
            href="/tools/bei-calculator"
            className="inline-block bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-4 px-8 rounded-lg shadow-xl transition-all duration-300 transform hover:scale-105 text-lg mr-4"
          >
            ⚡ 今すぐ始める
          </Link>
          <Link
            href="/about"
            className="inline-block bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-4 px-6 rounded-lg transition-colors"
          >
            詳しく知る
          </Link>
        </div>

        {/* 体験の流れ */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">体験の流れ（約5分）</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="text-center">
              <div className="bg-blue-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">建物情報入力</h3>
              <p className="text-sm text-gray-600">
                用途・延床面積・地域など基本情報を選択
              </p>
              <div className="text-xs text-gray-500 mt-2 flex items-center justify-center">
                <FaClock className="mr-1" />
                約2分
              </div>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">仕様選択</h3>
              <p className="text-sm text-gray-600">
                断熱・窓・設備仕様をプルダウンから選択
              </p>
              <div className="text-xs text-gray-500 mt-2 flex items-center justify-center">
                <FaClock className="mr-1" />
                約2分
              </div>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="bg-purple-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <FaCalculator className="text-purple-600 text-xl" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">自動計算</h3>
              <p className="text-sm text-gray-600">
                システムが複雑なBEI計算を瞬時に実行
              </p>
              <div className="text-xs text-gray-500 mt-2 flex items-center justify-center">
                <FaClock className="mr-1" />
                約10秒
              </div>
            </div>

            {/* Step 4 */}
            <div className="text-center">
              <div className="bg-yellow-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <FaChartBar className="text-yellow-600 text-xl" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">結果確認</h3>
              <p className="text-sm text-gray-600">
                グラフィカルな結果とPDF出力
              </p>
              <div className="text-xs text-gray-500 mt-2 flex items-center justify-center">
                <FaClock className="mr-1" />
                約1分
              </div>
            </div>
          </div>
        </div>

        {/* 体験できる機能 */}
        <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">体験できる全機能</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <FaCalculator className="text-3xl text-blue-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">BEI計算</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 建築物省エネ法準拠</li>
                <li>• 地域区分別基準対応</li>
                <li>• 外皮性能・エネルギー計算</li>
                <li>• 適合/不適合判定</li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <FaChartBar className="text-3xl text-green-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">詳細分析</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 用途別エネルギー内訳</li>
                <li>• グラフィカル表示</li>
                <li>• 設計値vs基準値比較</li>
                <li>• 省エネ率算出</li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <FaDownload className="text-3xl text-purple-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">レポート出力</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• PDF詳細レポート</li>
                <li>• Excel計算書</li>
                <li>• 申請書類対応</li>
                <li>• 図表・グラフ付き</li>
              </ul>
            </div>
          </div>
        </div>

        {/* よくある質問 */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">体験版について</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                <FaLightbulb className="mr-2 text-yellow-500" />
                登録は必要ですか？
              </h3>
              <p className="text-gray-600 pl-6">
                いいえ、登録不要です。すぐに全機能をお試しいただけます。
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                <FaLightbulb className="mr-2 text-yellow-500" />
                計算結果は保存されますか？
              </h3>
              <p className="text-gray-600 pl-6">
                ブラウザ内に一時保存されます。ダウンロードしてご保存ください。
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                <FaLightbulb className="mr-2 text-yellow-500" />
                計算精度は本格版と同じですか？
              </h3>
              <p className="text-gray-600 pl-6">
                はい、建築物省エネ法に完全準拠した正確な計算を行います。
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                <FaLightbulb className="mr-2 text-yellow-500" />
                商用利用はできますか？
              </h3>
              <p className="text-gray-600 pl-6">
                体験版の結果は参考用です。商用利用にはアカウント登録をお願いします。
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">今すぐ体験してみましょう！</h2>
          <p className="mb-6">
            5分で本格的な省エネ計算を体験できます。<br />
            設計業務の効率化を実感してください。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/tools/bei-calculator"
              className="bg-white text-green-600 hover:bg-gray-100 font-bold py-3 px-6 rounded-lg transition-all duration-300 inline-block"
            >
              ⚡ BEI計算を開始
            </Link>
            <Link
              href="/contact"
              className="border-2 border-white text-white hover:bg-white hover:text-green-600 font-bold py-3 px-6 rounded-lg transition-all duration-300 inline-block"
            >
              質問・相談する
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}