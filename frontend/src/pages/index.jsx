// frontend/src/pages/index.jsx
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import Link from 'next/link';
import { FaCalculator, FaChartBar, FaFileDownload, FaCheckCircle, FaBuilding, FaLeaf } from 'react-icons/fa';

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <Layout>
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-50 via-white to-green-50 py-20">
        <div className="container mx-auto text-center px-4">
          <div className="flex justify-center mb-6">
            <div className="bg-green-100 p-4 rounded-full">
              <FaLeaf className="text-4xl text-green-600" />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            建築物省エネ法対応<br />計算サービス
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-3xl mx-auto leading-relaxed">
            建築設計者のための省エネ基準適合性判定計算を<br />
            <span className="font-semibold text-green-600">簡単・正確・迅速</span>に実行
          </p>
          
          {isAuthenticated ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/projects"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                プロジェクト一覧
              </Link>
              <Link
                href="/projects/1/calculate"
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-lg shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                新規計算を開始
              </Link>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-lg shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                無料で始める
              </Link>
              <Link
                href="/login"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                ログイン
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-800">
            主な機能
          </h2>
        
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-lg border-l-4 border-blue-600 hover:shadow-2xl transition-all duration-300">
              <div className="text-blue-600 text-4xl mb-6 flex justify-center">
                <FaCalculator />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800">省エネ計算</h3>
              <p className="text-gray-600 mb-4">
                建築物省エネ法に完全準拠した外皮性能（UA値・ηA値）と一次エネルギー消費量の正確な計算を実行。
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-center"><FaCheckCircle className="text-green-500 mr-2" />地域区分別基準値対応</li>
                <li className="flex items-center"><FaCheckCircle className="text-green-500 mr-2" />建物用途別計算</li>
                <li className="flex items-center"><FaCheckCircle className="text-green-500 mr-2" />省エネ適合性自動判定</li>
              </ul>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-lg border-l-4 border-green-600 hover:shadow-2xl transition-all duration-300">
              <div className="text-green-600 text-4xl mb-6 flex justify-center">
                <FaChartBar />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800">視覚的な結果</h3>
              <p className="text-gray-600 mb-4">
                計算結果をわかりやすいグラフと表で表示。エネルギー消費内訳や基準との比較を直感的に理解。
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-center"><FaCheckCircle className="text-green-500 mr-2" />用途別エネルギー消費量</li>
                <li className="flex items-center"><FaCheckCircle className="text-green-500 mr-2" />基準値との比較チャート</li>
                <li className="flex items-center"><FaCheckCircle className="text-green-500 mr-2" />適合・不適合判定表示</li>
              </ul>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-lg border-l-4 border-purple-600 hover:shadow-2xl transition-all duration-300">
              <div className="text-purple-600 text-4xl mb-6 flex justify-center">
                <FaFileDownload />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800">レポート出力</h3>
              <p className="text-gray-600 mb-4">
                計算結果を詳細なレポートとして出力。行政機関への申請書類として直接利用可能。
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-center"><FaCheckCircle className="text-green-500 mr-2" />PDF形式レポート</li>
                <li className="flex items-center"><FaCheckCircle className="text-green-500 mr-2" />Excel形式データシート</li>
                <li className="flex items-center"><FaCheckCircle className="text-green-500 mr-2" />申請書類フォーマット対応</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-800">
            導入メリット
          </h2>
          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <div className="flex items-start space-x-4">
              <div className="bg-blue-100 p-3 rounded-full flex-shrink-0">
                <FaBuilding className="text-2xl text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-gray-800">設計業務の効率化</h3>
                <p className="text-gray-600">
                  従来の手計算や複雑な計算ソフトから解放。直感的な操作で省エネ計算を短時間で完了し、設計検討時間を大幅に短縮できます。
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="bg-green-100 p-3 rounded-full flex-shrink-0">
                <FaCheckCircle className="text-2xl text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-gray-800">計算精度の向上</h3>
                <p className="text-gray-600">
                  建築物省エネ法の最新基準に完全準拠。計算ミスのリスクを排除し、申請時のやり直しを防止。確実な省エネ適合性判定が可能です。
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="bg-purple-100 p-3 rounded-full flex-shrink-0">
                <FaFileDownload className="text-2xl text-purple-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-gray-800">申請書類の自動生成</h3>
                <p className="text-gray-600">
                  計算結果から行政機関への申請に必要な書類を自動生成。フォーマットに悩むことなく、すぐに申請手続きを進められます。
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="bg-yellow-100 p-3 rounded-full flex-shrink-0">
                <FaLeaf className="text-2xl text-yellow-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-gray-800">持続可能な設計支援</h3>
                <p className="text-gray-600">
                  様々な設計パラメータでの比較検討が簡単。最適な省エネ設計を見つけ出し、環境負荷の少ない建築物の実現を支援します。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-blue-600 to-green-600">
        <div className="container mx-auto text-center px-4">
          <h2 className="text-4xl font-bold text-white mb-6">
            今すぐ始めて、設計業務を変革しませんか？
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            省エネ法対応計算の新しいスタンダード。無料でお試しいただけます。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="bg-white text-blue-600 hover:bg-gray-100 font-bold py-4 px-8 rounded-lg shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              無料アカウント作成
            </Link>
            <Link
              href="/projects/1/calculate"
              className="border-2 border-white text-white hover:bg-white hover:text-blue-600 font-bold py-4 px-8 rounded-lg transition-all duration-300"
            >
              デモを体験
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}