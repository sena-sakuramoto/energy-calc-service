// frontend/src/pages/campaign.jsx
import Layout from '../components/Layout';
import Link from 'next/link';
import { FaGift, FaClock, FaCheckCircle, FaCalculator, FaFileDownload, FaStar, FaArrowRight, FaChartBar } from 'react-icons/fa';

export default function Campaign() {
  return (
    <Layout title="共同開発企画 - 楽々省エネ計算">
      <div className="max-w-5xl mx-auto">
        {/* ヒーローセクション */}
        <div className="bg-gradient-to-br from-blue-50 via-white to-green-50 py-16 rounded-lg mb-16">
          <div className="container mx-auto text-center px-8">
            <div className="mb-8">
              <span className="bg-blue-600 text-white px-6 py-2 rounded-md text-sm font-medium shadow-sm">
                共同開発プロジェクト進行中
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-8 leading-tight text-gray-900">
              省エネ計算ツール<br />
              <span className="text-blue-600">共同開発企画</span>
            </h1>
            
            <div className="mb-6">
              <span className="bg-blue-100 text-blue-800 px-6 py-3 rounded-lg text-lg font-medium">
                🎆 協力者様と一緒に作るサービス
              </span>
            </div>
            
            <div className="max-w-3xl mx-auto mb-8">
              <p className="text-xl text-gray-700 mb-6 leading-relaxed">
                建築業界の皆様と一緒に、<strong className="text-blue-600">本当に使える省エネ計算ツール</strong>を
                作り上げていく共同開発プロジェクトです。
              </p>
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">🎯 この企画の目的</h3>
                <ul className="text-gray-700 space-y-2">
                  <li>• 実務で必要な機能を理解し、使いやすいツールを作る</li>
                  <li>• 業界のリアルな声を反映したサービスを提供</li>
                  <li>• 継続的な改善で皆様の業務効率化に貢献</li>
                </ul>
              </div>
            </div>
            
            {/* 企画の特徴 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8">
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="text-2xl mb-3">💬</div>
                <div className="font-semibold mb-2 text-gray-800">ユーザーフィードバック</div>
                <div className="text-gray-600 text-sm">実際に使っていただき、改善点を教えてください</div>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="text-2xl mb-3">🤝</div>
                <div className="font-semibold mb-2 text-gray-800">共同開発</div>
                <div className="text-gray-600 text-sm">業界の皆様と一緒に作り上げていくスタイル</div>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="text-2xl mb-3">🎆</div>
                <div className="font-semibold mb-2 text-gray-800">継続改善</div>
                <div className="text-gray-600 text-sm">定期的なアップデートでより使いやすく</div>
              </div>
            </div>
          </div>
        </div>

        {/* 時間節約効果 */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 mb-16">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-12">
              作業時間を大幅に短縮
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
              {/* Before */}
              <div className="relative">
                <div className="bg-white border-2 border-gray-300 rounded-lg p-8">
                  <div className="text-gray-600 text-3xl mb-4">📝</div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">従来の手作業</h3>
                  <div className="space-y-3 text-gray-700">
                    <div className="flex items-center justify-center space-x-2">
                      <FaClock className="text-gray-500" />
                      <span className="font-bold text-2xl">3-5日間</span>
                    </div>
                    <div className="text-sm space-y-1">
                      <div>• 複雑な計算式の処理</div>
                      <div>• 計算結果のチェック作業</div>
                      <div>• 申請書類の手作業作成</div>
                      <div>• 長時間の作業が必要</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* After */}
              <div className="relative">
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-8">
                  <div className="text-blue-600 text-3xl mb-4">⚡</div>
                  <h3 className="text-xl font-semibold text-blue-800 mb-4">楽々省エネ計算</h3>
                  <div className="space-y-3 text-blue-700">
                    <div className="flex items-center justify-center space-x-2">
                      <FaCheckCircle className="text-blue-500" />
                      <span className="font-bold text-2xl">5分</span>
                    </div>
                    <div className="text-sm space-y-1">
                      <div>• 数値入力のみで完了</div>
                      <div>• 自動計算で高精度</div>
                      <div>• PDF書類も自動生成</div>
                      <div>• 効率的な業務を実現</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* 中央の矢印 */}
            <div className="flex justify-center mb-8">
              <div className="bg-blue-600 text-white rounded-full p-3">
                <FaArrowRight className="text-xl" />
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-2xl mx-auto">
              <div className="text-blue-800 font-semibold text-lg mb-2">
                工数削減効果
              </div>
              <div className="text-blue-700">
                設計者の時給3,000円として、<strong className="text-blue-800">4日分 × 8時間 = 96,000円</strong>相当の工数削減
              </div>
            </div>
          </div>
        </div>

        {/* 参加方法 */}
        <div className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-800 mb-4">
                企画参加方法
              </h2>
              <p className="text-lg text-gray-600">
                現在デモ版を無料でお試しいただき、フィードバックをお寄せください
              </p>
            </div>
            
            <div className="max-w-6xl mx-auto">
              {/* Step 1: デモ版体験 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-blue-200">
                  <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-blue-600 font-bold text-xl">1</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">デモ版を体験</h3>
                  <p className="text-gray-600 mb-4">
                    まずは無料でデモ版をお試しください。実際の業務で使えるかどうかを確かめてください。
                  </p>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>• BEI計算機能</li>
                    <li>• PDF出力</li>
                    <li>• 計算書作成</li>
                    <li>• プロジェクト管理</li>
                  </ul>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-green-200">
                  <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-green-600 font-bold text-xl">2</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">フィードバック</h3>
                  <p className="text-gray-600 mb-4">
                    使ってみた感想や改善点を教えてください。皆様の声がサービスをより使いやすくします。
                  </p>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>• 操作性の感想</li>
                    <li>• 欠けている機能</li>
                    <li>• 使いにくい点</li>
                    <li>• 業界のニーズ</li>
                  </ul>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-purple-200">
                  <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-purple-600 font-bold text-xl">3</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">共同改善</h3>
                  <p className="text-gray-600 mb-4">
                    いただいたフィードバックを元に、協力者様と一緒に改善を進めていきます。
                  </p>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>• 機能改善</li>
                    <li>• UI/UX向上</li>
                    <li>• 新機能追加</li>
                    <li>• バグ修正</li>
                  </ul>
                </div>
              </div>

              {/* 参加特典 */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8 text-center">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">🎁 参加特典</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="text-3xl mb-2">🔥</div>
                    <div className="font-semibold text-gray-800">無料で体験</div>
                    <div className="text-gray-600 text-sm">デモ版をいつまでも無料で利用可能</div>
                  </div>
                  <div>
                    <div className="text-3xl mb-2">💬</div>
                    <div className="font-semibold text-gray-800">直接サポート</div>
                    <div className="text-gray-600 text-sm">開発チームと直接やり取り</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* 価値提案 */}
            <div className="mt-12 text-center">
              <div className="bg-white rounded-xl p-6 max-w-2xl mx-auto shadow-sm border border-gray-100">
                <div className="text-gray-800 font-semibold text-lg mb-2">
                  コスト比較
                </div>
                <p className="text-gray-700">
                  外注費用：<strong className="text-gray-900">1件あたり5万円～</strong><br />
                  月額利用：<strong className="text-blue-600">料金調整中（お得な価格設定を検討中）</strong>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 主要機能 */}
        <div className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center mb-16 text-gray-800">
              主要機能
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              <div className="bg-white p-8 rounded-xl shadow-lg border-l-4 border-blue-600 hover:shadow-2xl transition-all duration-300">
                <div className="text-blue-600 text-4xl mb-6 flex justify-center">
                  <FaCalculator />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-800">省エネ性能計算</h3>
                <p className="text-gray-600 mb-4">
                  BEI値の自動算出とモデル建物法による省エネ基準適合性を瞬時に判定します。
                </p>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li className="flex items-center"><FaCheckCircle className="text-green-500 mr-2" />BEI値自動算出</li>
                  <li className="flex items-center"><FaCheckCircle className="text-green-500 mr-2" />モデル建物法対応</li>
                  <li className="flex items-center"><FaCheckCircle className="text-green-500 mr-2" />地域区分別基準値</li>
                  <li className="flex items-center"><FaCheckCircle className="text-green-500 mr-2" />適合性判定</li>
                </ul>
              </div>

              <div className="bg-white p-8 rounded-xl shadow-lg border-l-4 border-green-600 hover:shadow-2xl transition-all duration-300">
                <div className="text-green-600 text-4xl mb-6 flex justify-center">
                  <FaFileDownload />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-800">書類作成・出力</h3>
                <p className="text-gray-600 mb-4">
                  計算結果をPDF・Excelで出力。申請書類も自動生成で手間を削減。
                </p>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li className="flex items-center"><FaCheckCircle className="text-green-500 mr-2" />計算書PDF出力</li>
                  <li className="flex items-center"><FaCheckCircle className="text-green-500 mr-2" />Excel形式ダウンロード</li>
                  <li className="flex items-center"><FaCheckCircle className="text-green-500 mr-2" />申請用書類対応</li>
                  <li className="flex items-center"><FaCheckCircle className="text-green-500 mr-2" />計算根拠明記</li>
                </ul>
              </div>

              <div className="bg-white p-8 rounded-xl shadow-lg border-l-4 border-purple-600 hover:shadow-2xl transition-all duration-300">
                <div className="text-purple-600 text-4xl mb-6 flex justify-center">
                  <FaChartBar />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-800">プロジェクト管理</h3>
                <p className="text-gray-600 mb-4">
                  複数案件の管理と計算履歴保存で効率的なプロジェクト運営を支援。
                </p>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li className="flex items-center"><FaCheckCircle className="text-green-500 mr-2" />複数案件対応</li>
                  <li className="flex items-center"><FaCheckCircle className="text-green-500 mr-2" />計算履歴保存</li>
                  <li className="flex items-center"><FaCheckCircle className="text-green-500 mr-2" />設計条件比較</li>
                  <li className="flex items-center"><FaCheckCircle className="text-green-500 mr-2" />データバックアップ</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* 最終CTA */}
        <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-lg p-12 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="mb-8">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
                共同開発企画に参加しませんか
              </h2>
              <p className="text-xl text-blue-100 mb-6">
                皆様の声でより良いサービスへ成長させてください
              </p>
            </div>
            
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/register"
                  className="bg-white text-blue-600 hover:bg-gray-100 font-bold py-4 px-12 rounded-lg shadow-xl transition-all duration-300 transform hover:scale-105 text-lg"
                >
                  無料で始める
                </Link>
                <Link
                  href="/tools/bei-calculator"
                  className="border-2 border-white text-white hover:bg-white hover:text-blue-600 font-bold py-4 px-8 rounded-lg transition-all duration-300"
                >
                  まずは機能を確認
                </Link>
              </div>
            </div>
            
            {/* 安心要素 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto mb-8">
              <div className="text-center">
                <div className="text-2xl mb-2">🔒</div>
                <div className="text-sm text-blue-100">SSL暗号化通信</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">💳</div>
                <div className="text-sm text-blue-100">30日間無料</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">📞</div>
                <div className="text-sm text-blue-100">メールサポート</div>
              </div>
            </div>
            
            <div className="text-blue-100 text-sm">
              <p className="mb-1">✓ 契約期間の縛りなし　✓ いつでもキャンセル可能</p>
              <p>✓ 期間終了前にメール通知　✓ クレジットカード登録不要</p>
            </div>
          </div>
        </div>

        {/* よくある質問 */}
        <div className="mt-12 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">❓ 共同開発企画について よくある質問</h2>
          
          <div className="space-y-6">
            <div className="border-b border-gray-200 pb-4">
              <h3 className="font-bold text-gray-900 mb-2">Q. 本当に無料ですか？隠れた料金はありませんか？</h3>
              <p className="text-gray-700">A. はい、現在デモ版を完全無料でお使いいただけます。協力者様と一緒により良いサービスを作り上げるためのフィードバック期間です。隠れた料金は一切ありません。</p>
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
              <h3 className="font-bold text-gray-900 mb-2">Q. 正式版のリリースはいつ頃ですか？</h3>
              <p className="text-gray-700">A. デモ版で皆様からいただく貴重なフィードバックやご意見を元に、協力者様と一緒に改善を重ねながら正式版の完成を目指しています。皆様の声が私たちの原動力です！</p>
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