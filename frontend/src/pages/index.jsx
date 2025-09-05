// frontend/src/pages/index.jsx
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import Link from 'next/link';
import { FaCalculator, FaChartBar, FaFileDownload, FaCheckCircle, FaBuilding, FaLeaf } from 'react-icons/fa';

export default function Home() {
  const { isAuthenticated } = useAuth();
  
  // GitHub Pages環境の検出
  const isGitHubPages = typeof window !== 'undefined' && 
    window.location.hostname.includes('github.io');

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
          <h1 className="text-6xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            楽々省エネ計算
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-2 max-w-2xl mx-auto">
            複雑化する省エネ法を、シンプルに。
          </p>
          <p className="text-sm text-gray-500 mb-6">
            by Archi-Prisma Design works 株式会社
          </p>
          <p className="text-xl md:text-2xl text-gray-700 mb-6 max-w-3xl mx-auto leading-relaxed">
            建築設計者の負担を軽減し、本来の創造的な設計業務に集中できる<br />
            <span className="font-semibold text-green-600">簡単・正確・安心</span>な省エネ計算ツール
          </p>
          
          {/* 期間限定無料キャンペーン */}
          <div className="mb-8 max-w-3xl mx-auto">
            <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 text-red-900 px-8 py-6 rounded-xl shadow-lg">
              <div className="flex items-center justify-center mb-3">
                <span className="bg-red-600 text-white px-4 py-1 rounded-full text-sm font-bold mr-3">期間限定</span>
                <span className="font-bold text-xl">🎉 完全無料キャンペーン実施中！</span>
              </div>
              <p className="text-center text-lg font-medium mb-3">
                <span className="text-xl font-bold text-red-600">協力者様と一緒に完成を目指します！</span>
                <span className="block text-sm text-red-700 mt-1">
                  デモ版で皆様のご意見をお聞かせいただきながら、協力者様と共に奔闘中です
                </span>
              </p>
              <div className="text-center">
                <p className="text-sm text-red-800 mb-3">
                  ✓ 簡単30秒でアカウント作成　✓ 登録後すぐ使える　✓ 全機能利用可能<br />
                  ✓ 省エネ計算が5分で完了　✓ 申請書類自動作成
                </p>
                <Link 
                  href="/campaign" 
                  className="text-sm text-red-800 hover:text-red-900 font-bold underline"
                >
                  🔥 キャンペーン詳細を見る
                </Link>
              </div>
            </div>
          </div>
          
          {isGitHubPages || !isAuthenticated ? (
            <div className="space-y-4">
              {/* メインCTAボタン */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
                <Link
                  href="/register"
                  className="relative bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold py-5 px-10 rounded-xl shadow-2xl transition-all duration-300 transform hover:scale-105 text-xl"
                >
                  <span className="absolute -top-2 -right-2 bg-yellow-400 text-red-900 text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                    無料
                  </span>
                  🔥 無料アカウント作成して開始
                </Link>
                <Link
                  href="/campaign"
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-5 px-8 rounded-xl shadow-xl transition-all duration-300 transform hover:scale-105 text-lg"
                >
                  🎉 キャンペーン詳細
                </Link>
              </div>
              
              {/* ログイン案内 */}
              <div className="text-center mb-6">
                <p className="text-gray-600">
                  既にアカウントをお持ちの方は
                  <Link href="/login" className="text-blue-600 hover:text-blue-800 font-bold ml-2">
                    こちらからログイン
                  </Link>
                </p>
              </div>
              
              {/* 公開情報 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
                <Link
                  href="/campaign"
                  className="bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-4 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 text-center"
                >
                  🎁 無料キャンペーン詳細
                </Link>
                <Link
                  href="/system/status"
                  className="bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 text-center"
                >
                  📊 サービス状況
                </Link>
              </div>
            </div>
          ) : isAuthenticated ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/projects"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                プロジェクト一覧
              </Link>
              <Link
                href="/tools/bei-calculator"
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-lg shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                計算ツールを使用
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
        
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* BEI計算カード - Apple風デザイン */}
            <Link href="/register" className="group">
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 ease-out cursor-pointer">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6">
                  <FaBuilding className="text-white text-2xl" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900 group-hover:text-blue-600 transition-colors">
                  BEI計算
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  建築物エネルギー消費性能を正確に計算。省エネ基準適合性を瞬時に判定します。
                </p>
                <div className="space-y-2 mb-6">
                  <div className="flex items-center text-sm text-gray-600">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                    地域区分別基準値対応
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                    複合用途建物対応
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                    再エネ控除計算
                  </div>
                </div>
                <div className="inline-flex items-center text-blue-600 font-medium group-hover:translate-x-1 transition-transform duration-200">
                  今すぐ計算 
                  <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
            
            <div className="bg-white p-8 rounded-xl shadow-lg border-l-4 border-green-600 hover:shadow-2xl transition-all duration-300">
              <div className="text-green-600 text-4xl mb-6 flex justify-center">
                <FaCalculator />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800">エネルギー計算</h3>
              <p className="text-gray-600 mb-4">
                電力・エネルギー消費量・コスト計算と機器使用量の集計。電気設備設計に必要な基本計算をサポート。
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-center"><FaCheckCircle className="text-green-500 mr-2" />単相・三相電力計算</li>
                <li className="flex items-center"><FaCheckCircle className="text-green-500 mr-2" />機器別エネルギー集計</li>
                <li className="flex items-center"><FaCheckCircle className="text-green-500 mr-2" />電力コスト試算</li>
              </ul>
              <div className="mt-6">
                <Link
                  href="/register"
                  className="inline-flex items-center text-green-600 hover:text-green-800 font-medium"
                >
                  アカウント作成して開始 →
                </Link>
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-lg border-l-4 border-purple-600 hover:shadow-2xl transition-all duration-300">
              <div className="text-purple-600 text-4xl mb-6 flex justify-center">
                <FaFileDownload />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800">電力料金見積もり</h3>
              <p className="text-gray-600 mb-4">
                フラット・段階制・時間帯別料金に対応した詳細な電力料金計算。基本料金や各種調整費も含めた正確な見積もり。
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-center"><FaCheckCircle className="text-green-500 mr-2" />多様な料金体系対応</li>
                <li className="flex items-center"><FaCheckCircle className="text-green-500 mr-2" />時間別使用量プロファイル</li>
                <li className="flex items-center"><FaCheckCircle className="text-green-500 mr-2" />詳細な料金内訳表示</li>
              </ul>
              <div className="mt-6">
                <Link
                  href="/register"
                  className="inline-flex items-center text-purple-600 hover:text-purple-800 font-medium"
                >
                  アカウント作成して開始 →
                </Link>
              </div>
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
            もう省エネ計算で悩まない。
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            「楽々省エネ計算」で、設計業務をもっとクリエイティブに。<br />
            今すぐ無料でお試しください。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="bg-white text-blue-600 hover:bg-gray-100 font-bold py-4 px-8 rounded-lg shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              楽々始める
            </Link>
            <Link
              href="/login"
              className="border-2 border-white text-white hover:bg-white hover:text-blue-600 font-bold py-4 px-8 rounded-lg transition-all duration-300"
            >
              ログインして開始
            </Link>
          </div>
        </div>
      </div>

      {/* 協力者様への感謝セクション */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            🙏 協力者様への感謝
          </h2>
          <div className="max-w-4xl mx-auto">
            <p className="text-lg text-gray-700 mb-4 leading-relaxed">
              このサービスは、<span className="font-semibold text-purple-600">多くの協力者様の貴重なサポート</span>のおかげで
              ここまで開発を進めることができました。
            </p>
            <p className="text-gray-600 mb-6">
              現在はデモ版として皆様にお使いいただきながら、
              <strong className="text-blue-600">皆様のご意見やフィードバックを元に</strong>、
              協力者様と一緒にさらに良いサービスへと成長させていただいています。
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-2xl mb-2">💬</div>
                <div className="font-semibold text-gray-800 mb-1">フィードバック</div>
                <div className="text-sm text-gray-600">皆様の声が開発の原動力</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-2xl mb-2">🤝</div>
                <div className="font-semibold text-gray-800 mb-1">協同開発</div>
                <div className="text-sm text-gray-600">協力者様と一緒に成長</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-2xl mb-2">🎆</div>
                <div className="font-semibold text-gray-800 mb-1">継続改善</div>
                <div className="text-sm text-gray-600">日々より良いサービスへ</div>
              </div>
            </div>
            <div className="text-center">
              <p className="text-purple-600 font-medium">
                🙏 皆様の温かいサポートに心から感謝いたします 🙏
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}