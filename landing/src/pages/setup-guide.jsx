import Layout from '../components/Layout';
import Link from 'next/link';
import { FaGoogle, FaCloud, FaShieldAlt, FaCog, FaExclamationTriangle } from 'react-icons/fa';

export default function SetupGuide() {
  return (
    <Layout title="本格運用ガイド - 楽々省エネ計算" path="/setup-guide">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary-900 mb-4">本格運用セットアップガイド</h1>
          <p className="text-xl text-primary-600">
            現在は体験版として動作中です。本格運用には以下の設定が必要です。
          </p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
          <div className="flex items-center mb-4">
            <FaExclamationTriangle className="text-yellow-600 text-xl mr-3" />
            <h2 className="text-xl font-bold text-yellow-800">現在の動作状況</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-yellow-800">体験版として完璧に動作</h3>
              <ul className="text-sm text-yellow-700 space-y-1 ml-4">
                <li>・ BEI計算エンジン：完全動作</li>
                <li>・ UI/UX：プロ品質</li>
                <li>・ PDF/Excel出力：対応済み</li>
                <li>・ LocalStorage：データ保存対応</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-yellow-800">本格運用には設定必要</h3>
              <ul className="text-sm text-yellow-700 space-y-1 ml-4">
                <li>・ Google OAuth：設定未完了</li>
                <li>・ メール認証：バックエンド未構築</li>
                <li>・ Cloud Database：未設定</li>
                <li>・ 商用SSL証明書：未設定</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center mb-6">
              <div className="bg-warm-100 p-3 rounded-full mr-4">
                <FaGoogle className="text-accent-500 text-xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-primary-900">Google OAuth 設定</h2>
                <p className="text-primary-600">Googleアカウントでのログイン機能</p>
              </div>
            </div>
            <div className="bg-warm-50 p-4 rounded-lg">
              <h3 className="font-semibold text-primary-900 mb-2">手順</h3>
              <ol className="text-sm text-primary-700 space-y-2 ml-4">
                <li>1. Google Cloud Console でプロジェクト作成</li>
                <li>2. OAuth consent screen設定</li>
                <li>3. OAuth 2.0 Client ID作成</li>
                <li>4. 環境変数に設定</li>
              </ol>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center mb-6">
              <div className="bg-accent-50 p-3 rounded-full mr-4">
                <FaShieldAlt className="text-accent-500 text-xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-primary-900">メール認証システム</h2>
                <p className="text-primary-600">独自メール/パスワード認証機能</p>
              </div>
            </div>
            <div className="bg-warm-50 p-4 rounded-lg">
              <p className="text-sm text-primary-700"><strong>推奨:</strong> FastAPI + PostgreSQL + JWT認証 + bcrypt暗号化</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center mb-6">
              <div className="bg-accent-50 p-3 rounded-full mr-4">
                <FaCloud className="text-accent-500 text-xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-primary-900">Cloud Database設定</h2>
                <p className="text-primary-600">Firebase Firestore設定</p>
              </div>
            </div>
            <div className="bg-warm-50 p-4 rounded-lg">
              <ol className="text-sm text-primary-700 space-y-2 ml-4">
                <li>1. Firebase Console でプロジェクト作成</li>
                <li>2. Firestore Database初期化</li>
                <li>3. Authentication設定</li>
                <li>4. Security Rules設定</li>
              </ol>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center mb-6">
              <div className="bg-warm-100 p-3 rounded-full mr-4">
                <FaCog className="text-primary-600 text-xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-primary-900">本格デプロイメント</h2>
                <p className="text-primary-600">商用レベルのホスティング設定</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="font-semibold text-primary-900">推奨ホスティング</h3>
                <div className="bg-warm-50 p-3 rounded"><strong>Frontend:</strong> Vercel / Netlify</div>
                <div className="bg-warm-50 p-3 rounded"><strong>Backend:</strong> Railway / Render</div>
                <div className="bg-warm-50 p-3 rounded"><strong>Database:</strong> Firebase / Supabase</div>
              </div>
              <div className="space-y-3">
                <h3 className="font-semibold text-primary-900">セキュリティ</h3>
                <div className="bg-warm-50 p-3 rounded"><strong>SSL:</strong> Let&apos;s Encrypt</div>
                <div className="bg-warm-50 p-3 rounded"><strong>環境変数:</strong> プラットフォーム設定</div>
                <div className="bg-warm-50 p-3 rounded"><strong>CORS:</strong> 本番ドメイン限定</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-primary-800 text-white rounded-lg p-8 text-center mt-12">
          <h2 className="text-2xl font-bold mb-4">セットアップサポート</h2>
          <p className="mb-6">
            本格運用のための設定でご不明な点がございましたら、お気軽にお問い合わせください。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="bg-accent-500 hover:bg-accent-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 inline-block">
              セットアップ相談
            </Link>
            <Link href="/demo-guide" className="border-2 border-white text-white hover:bg-white hover:text-primary-800 font-bold py-3 px-6 rounded-lg transition-all duration-300 inline-block">
              まずは体験版を試す
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
