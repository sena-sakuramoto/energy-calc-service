// frontend/src/pages/campaign.jsx
import Layout from '../components/Layout';
import Link from 'next/link';
import { FaGift, FaClock, FaCheckCircle, FaCalculator, FaFileDownload, FaStar, FaArrowRight } from 'react-icons/fa';

export default function Campaign() {
  return (
    <Layout title="期間限定無料キャンペーン - 楽々省エネ計算">
      <div className="max-w-5xl mx-auto">
        {/* ヒーローセクション */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white rounded-2xl mb-16">
          {/* 背景パターン */}
          <div className="absolute inset-0 bg-black opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}></div>
          </div>
          
          <div className="relative px-8 py-16 text-center">
            <div className="mb-8">
              <span className="bg-gradient-to-r from-green-400 to-blue-400 text-blue-900 px-8 py-3 rounded-full text-sm font-bold shadow-lg">
                ⚡ 30日間完全無料トライアル実施中
              </span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-8 leading-tight">
              省エネ計算を<br />
              <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                革命的に効率化
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-4xl mx-auto leading-relaxed">
              手作業なら<strong className="text-yellow-300">数日かかる</strong>BEI計算が、<br />
              わずか<strong className="text-green-300">5分で完了</strong>する次世代システム
            </p>
            
            {/* 特徴アイコン */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8">
              <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6">
                <div className="text-3xl mb-3">⚡</div>
                <div className="font-bold mb-2">超高速計算</div>
                <div className="text-blue-200 text-sm">複雑な計算も瞬時に完了</div>
              </div>
              <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6">
                <div className="text-3xl mb-3">🎯</div>
                <div className="font-bold mb-2">100% 正確</div>
                <div className="text-blue-200 text-sm">建築物省エネ法完全準拠</div>
              </div>
              <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6">
                <div className="text-3xl mb-3">📊</div>
                <div className="font-bold mb-2">プロ仕様</div>
                <div className="text-blue-200 text-sm">申請書類も自動生成</div>
              </div>
            </div>
          </div>
        </div>

        {/* 時間節約効果 */}
        <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-2xl p-12 mb-16">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-12">
              もう残業で計算に追われる必要はありません
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
              {/* Before */}
              <div className="relative">
                <div className="bg-red-100 border-2 border-red-200 rounded-xl p-8">
                  <div className="text-red-600 text-4xl mb-4">😵‍💫</div>
                  <h3 className="text-xl font-bold text-red-800 mb-4">従来の手作業</h3>
                  <div className="space-y-3 text-red-700">
                    <div className="flex items-center justify-center space-x-2">
                      <FaClock className="text-red-500" />
                      <span className="font-bold text-2xl">3-5日間</span>
                    </div>
                    <div className="text-sm space-y-1">
                      <div>• 複雑な計算式との格闘</div>
                      <div>• 計算ミスのチェック作業</div>
                      <div>• 申請書類の手作業作成</div>
                      <div>• 深夜残業の連続...</div>
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                  <div className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                    ストレス MAX
                  </div>
                </div>
              </div>
              
              {/* After */}
              <div className="relative">
                <div className="bg-green-100 border-2 border-green-200 rounded-xl p-8">
                  <div className="text-green-600 text-4xl mb-4">😊</div>
                  <h3 className="text-xl font-bold text-green-800 mb-4">楽々省エネ計算</h3>
                  <div className="space-y-3 text-green-700">
                    <div className="flex items-center justify-center space-x-2">
                      <FaCheckCircle className="text-green-500" />
                      <span className="font-bold text-2xl">5分</span>
                    </div>
                    <div className="text-sm space-y-1">
                      <div>• 数値入力だけでOK</div>
                      <div>• 計算は全自動で完璧</div>
                      <div>• PDF書類も瞬時に生成</div>
                      <div>• 定時で帰宅できます！</div>
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                  <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                    超効率化
                  </div>
                </div>
              </div>
            </div>
            
            {/* 中央の矢印 */}
            <div className="flex justify-center mb-8">
              <div className="bg-blue-500 text-white rounded-full p-4">
                <FaArrowRight className="text-2xl" />
              </div>
            </div>
            
            <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-6 max-w-2xl mx-auto">
              <div className="text-yellow-800 font-bold text-lg mb-2">
                💰 時間コスト換算すると...
              </div>
              <div className="text-yellow-700">
                設計者の時給3000円として、<strong className="text-yellow-900">4日分 × 8時間 = 96,000円</strong>の工数削減！
              </div>
            </div>
          </div>
        </div>

        {/* 料金プラン */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-12 mb-16 relative overflow-hidden">
          {/* 背景装飾 */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full opacity-20 -translate-y-32 translate-x-32"></div>
          
          <div className="max-w-4xl mx-auto relative">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                🎁 今なら30日間、完全無料で体験！
              </h2>
              <p className="text-lg text-gray-600">
                月額19,800円のプロ仕様システムを1ヶ月間お試しいただけます
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* 無料トライアル */}
              <div className="relative">
                <div className="bg-gradient-to-br from-green-400 to-blue-500 text-white rounded-2xl p-8 transform hover:scale-105 transition-transform duration-200 shadow-xl">
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-yellow-400 text-yellow-900 px-4 py-1 rounded-full text-sm font-bold">
                      👑 今だけ無料
                    </span>
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-4 mt-4">無料トライアル</h3>
                  <div className="mb-6">
                    <div className="text-5xl font-bold mb-2">¥0</div>
                    <div className="text-blue-100">30日間すべて無料</div>
                  </div>
                  
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-center space-x-2">
                      <FaCheckCircle className="text-green-200 flex-shrink-0" />
                      <span>BEI計算（無制限）</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <FaCheckCircle className="text-green-200 flex-shrink-0" />
                      <span>PDF・Excel出力</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <FaCheckCircle className="text-green-200 flex-shrink-0" />
                      <span>申請書類自動作成</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <FaCheckCircle className="text-green-200 flex-shrink-0" />
                      <span>メールサポート</span>
                    </li>
                  </ul>
                  
                  <div className="text-center">
                    <div className="text-sm text-blue-100 mb-3">
                      期間終了前にメール通知
                    </div>
                  </div>
                </div>
              </div>

              {/* 正式版 */}
              <div className="bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-purple-300 transition-colors duration-200 shadow-lg">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">正式版</h3>
                <div className="mb-6">
                  <div className="text-5xl font-bold text-gray-900 mb-2">
                    ¥19,800
                  </div>
                  <div className="text-gray-500">月額（税込）</div>
                  <div className="text-sm text-purple-600 font-medium mt-1">
                    1日あたり約660円 ☕
                  </div>
                </div>
                
                <ul className="space-y-3 mb-8 text-gray-700">
                  <li className="flex items-center space-x-2">
                    <FaCheckCircle className="text-purple-500 flex-shrink-0" />
                    <span>全機能無制限利用</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <FaCheckCircle className="text-purple-500 flex-shrink-0" />
                    <span>優先サポート</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <FaCheckCircle className="text-purple-500 flex-shrink-0" />
                    <span>定期アップデート</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <FaCheckCircle className="text-purple-500 flex-shrink-0" />
                    <span>プロジェクト無制限</span>
                  </li>
                </ul>
                
                <div className="text-center">
                  <div className="text-sm text-gray-500">
                    いつでもキャンセル可能
                  </div>
                </div>
              </div>
            </div>
            
            {/* 価値提案 */}
            <div className="mt-12 text-center">
              <div className="bg-white rounded-xl p-6 max-w-2xl mx-auto shadow-md">
                <div className="text-purple-600 font-bold text-lg mb-2">
                  💡 考えてみてください
                </div>
                <p className="text-gray-700">
                  外注なら<strong className="text-red-600">1件5万円～</strong>の計算作業が<br />
                  月19,800円で<strong className="text-green-600">何件でも</strong>計算し放題！
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 主要機能 */}
        <div className="mb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-medium text-gray-900 mb-12 text-center">
              主要機能
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">省エネ性能計算</h3>
                <ul className="space-y-2 text-gray-600 text-sm">
                  <li>• BEI値自動算出</li>
                  <li>• モデル建物法対応</li>
                  <li>• 地域区分別基準値</li>
                  <li>• 適合性判定</li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">書類作成・出力</h3>
                <ul className="space-y-2 text-gray-600 text-sm">
                  <li>• 計算書PDF出力</li>
                  <li>• Excel形式ダウンロード</li>
                  <li>• 申請用書類対応</li>
                  <li>• 計算根拠明記</li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">プロジェクト管理</h3>
                <ul className="space-y-2 text-gray-600 text-sm">
                  <li>• 複数案件対応</li>
                  <li>• 計算履歴保存</li>
                  <li>• 設計条件比較</li>
                  <li>• データバックアップ</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* 最終CTA */}
        <div className="relative bg-gradient-to-r from-blue-900 to-purple-900 text-white rounded-2xl p-12 text-center overflow-hidden">
          {/* 背景アニメーション効果 */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-600 to-purple-600 opacity-30"></div>
            <div className="absolute top-0 left-0 w-96 h-96 bg-yellow-400 opacity-10 rounded-full -translate-x-48 -translate-y-48 animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-green-400 opacity-10 rounded-full translate-x-48 translate-y-48 animate-pulse" style={{animationDelay: '1s'}}></div>
          </div>
          
          <div className="relative z-10">
            <div className="mb-8">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                🚀 今すぐ始めませんか？
              </h2>
              <p className="text-xl text-blue-100 mb-6 max-w-3xl mx-auto">
                もう計算作業で深夜残業する必要はありません。<br />
                <strong className="text-yellow-300">30日間完全無料</strong>で効率化を実感してください。
              </p>
              
              {/* 特別感の演出 */}
              <div className="bg-yellow-400 text-yellow-900 inline-block px-6 py-2 rounded-full font-bold text-lg mb-6 shadow-lg">
                ⏰ 今だけ！登録者限定特典
              </div>
            </div>
            
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/register"
                  className="bg-gradient-to-r from-green-400 to-blue-400 hover:from-green-500 hover:to-blue-500 text-blue-900 font-bold py-4 px-12 rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-200 text-lg"
                >
                  ✨ 無料で今すぐ開始
                </Link>
                <Link
                  href="/tools/bei-calculator"
                  className="border-2 border-white text-white hover:bg-white hover:text-blue-900 font-bold py-4 px-8 rounded-xl transition-all duration-200"
                >
                  まずはデモを試す
                </Link>
              </div>
            </div>
            
            {/* 安心要素 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto mb-8">
              <div className="text-center">
                <div className="text-2xl mb-2">🔒</div>
                <div className="text-sm text-blue-200">安全なSSL暗号化</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">💳</div>
                <div className="text-sm text-blue-200">30日間課金なし</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">📞</div>
                <div className="text-sm text-blue-200">メールサポート</div>
              </div>
            </div>
            
            <div className="text-blue-200 text-sm">
              <p className="mb-1">✓ 面倒な契約手続きなし　✓ いつでもキャンセル可能</p>
              <p>✓ 期間終了前にメール通知　✓ クレジットカード情報は不要</p>
            </div>
          </div>
        </div>

        {/* よくある質問 */}
        <div className="mt-12 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">❓ キャンペーンについて よくある質問</h2>
          
          <div className="space-y-6">
            <div className="border-b border-gray-200 pb-4">
              <h3 className="font-bold text-gray-900 mb-2">Q. 本当に無料ですか？隠れた料金はありませんか？</h3>
              <p className="text-gray-700">A. はい、2025年12月31日まで完全無料です。隠れた料金は一切ありません。</p>
            </div>
            
            <div className="border-b border-gray-200 pb-4">
              <h3 className="font-bold text-gray-900 mb-2">Q. アカウント登録は必要ですか？</h3>
              <p className="text-gray-700">A. はい、簡単30秒でアカウント作成が必要です。Googleアカウントまたはメールアドレスでご登録いただけます。</p>
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