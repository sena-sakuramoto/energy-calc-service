// frontend/src/pages/campaign.jsx
import Layout from '../components/Layout';
import Link from 'next/link';
import { FaGift, FaClock, FaCheckCircle, FaCalculator, FaFileDownload, FaStar, FaArrowRight } from 'react-icons/fa';

export default function Campaign() {
  return (
    <Layout title="期間限定無料キャンペーン - 楽々省エネ計算">
      <div className="max-w-5xl mx-auto">
        {/* ヘッダー */}
        <div className="text-center mb-16">
          <div className="mb-8">
            <span className="bg-slate-800 text-white px-8 py-3 text-sm font-medium tracking-wide">
              30日間無料トライアル
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-6 leading-tight">
            建築物省エネ性能計算を<br />
            もっと効率的に
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            設計実務に特化した省エネ計算システムで、<br />
            複雑な適合性判定業務を大幅に効率化できます。
          </p>
          <div className="bg-gray-50 border border-gray-200 rounded p-6 max-w-2xl mx-auto">
            <p className="text-gray-700 font-medium">
              初回登録から30日間、全機能を無料でご利用いただけます
            </p>
          </div>
        </div>

        {/* サービス概要 */}
        <div className="bg-white border border-gray-200 rounded-lg p-12 mb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-medium text-gray-900 mb-8 text-center">
              30日間無料トライアルの内容
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">利用期間</h3>
                <p className="text-gray-600 leading-relaxed">
                  アカウント登録日から30日間、すべての機能を制限なくご利用いただけます。期間終了前にメールでお知らせします。
                </p>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">提供機能</h3>
                <p className="text-gray-600 leading-relaxed">
                  モデル建物法による省エネ性能計算、BEI値算出、適合性判定書類の自動作成まで、実務で必要な全機能が利用可能です。
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 料金プラン */}
        <div className="bg-gray-50 rounded-lg p-12 mb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-medium text-gray-900 mb-12 text-center">
              料金プラン
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
              <div className="bg-white rounded-lg border border-gray-200 p-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">無料トライアル</h3>
                <div className="text-3xl font-light text-gray-900 mb-6">
                  ¥0 <span className="text-base text-gray-500">30日間</span>
                </div>
                <ul className="space-y-3 text-gray-600">
                  <li>• モデル建物法計算</li>
                  <li>• BEI値自動算出</li>
                  <li>• 適合性判定書類作成</li>
                  <li>• PDF・Excel出力</li>
                </ul>
              </div>

              <div className="bg-slate-800 text-white rounded-lg p-8">
                <h3 className="text-lg font-medium mb-4">正式版</h3>
                <div className="text-3xl font-light mb-6">
                  ¥19,800 <span className="text-base text-gray-300">月額</span>
                </div>
                <ul className="space-y-3 text-gray-300">
                  <li>• 全トライアル機能</li>
                  <li>• 継続利用・サポート</li>
                  <li>• 定期アップデート</li>
                  <li>• プロジェクト無制限</li>
                </ul>
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

        {/* 申し込み */}
        <div className="bg-slate-800 text-white rounded-lg p-12 text-center">
          <h2 className="text-2xl font-medium mb-6">30日間無料トライアルを始める</h2>
          <p className="text-gray-300 mb-8">
            アカウント作成後すぐにご利用いただけます
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="bg-white text-slate-800 hover:bg-gray-100 font-medium py-3 px-8 rounded transition-colors duration-200"
            >
              新規アカウント作成
            </Link>
            <Link
              href="/login"
              className="border border-white text-white hover:bg-white hover:text-slate-800 font-medium py-3 px-8 rounded transition-colors duration-200"
            >
              ログイン
            </Link>
          </div>
          
          <div className="mt-8 text-sm text-gray-400">
            <p>トライアル期間終了前にメールでお知らせします</p>
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