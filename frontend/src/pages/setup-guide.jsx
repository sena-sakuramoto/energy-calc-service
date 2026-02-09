// frontend/src/pages/setup-guide.jsx
import Layout from '../components/Layout';
import Link from 'next/link';
import { FaGoogle, FaCloud, FaDatabase, FaShieldAlt, FaCog, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

export default function SetupGuide() {
  return (
    <Layout title="本格運用ガイド - 楽々省エネ計算">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary-900 mb-4">本格運用セットアップガイド</h1>
          <p className="text-xl text-primary-600">
            現在は体験版として動作中です。本格運用には以下の設定が必要です。
          </p>
        </div>

        {/* 現在のステータス */}
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

        {/* 設定手順 */}
        <div className="space-y-8">
          {/* Google OAuth設定 */}
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

            <div className="space-y-4">
              <div className="bg-warm-50 p-4 rounded-lg">
                <h3 className="font-semibold text-primary-900 mb-2">1. Google Cloud Console設定</h3>
                <ol className="text-sm text-primary-700 space-y-2 ml-4">
                  <li>1. <a href="https://console.cloud.google.com/" target="_blank" rel="noopener" className="text-accent-500 hover:underline">Google Cloud Console</a> にアクセス</li>
                  <li>2. 新プロジェクト作成: &ldquo;楽々省エネ計算&rdquo;</li>
                  <li>3. APIs & Services → OAuth consent screen設定</li>
                  <li>4. Credentials → OAuth 2.0 Client ID作成</li>
                  <li>5. Authorized redirect URIs追加:<br />
                    <code className="bg-primary-200 px-2 py-1 rounded text-xs">
                      https://sena-sakuramoto.github.io/energy-calc-service/api/auth/callback/google
                    </code>
                  </li>
                </ol>
              </div>

              <div className="bg-warm-50 p-4 rounded-lg">
                <h3 className="font-semibold text-primary-900 mb-2">2. 環境変数設定</h3>
                <pre className="bg-primary-900 text-white p-3 rounded text-xs overflow-x-auto">
{`# .env.local に追加
GOOGLE_CLIENT_ID=あなたのクライアントID
GOOGLE_CLIENT_SECRET=あなたのクライアントシークレット
NEXTAUTH_SECRET=ランダムな32文字以上の文字列
NEXTAUTH_URL=https://sena-sakuramoto.github.io/energy-calc-service`}
                </pre>
              </div>
            </div>
          </div>

          {/* メール認証システム */}
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

            <div className="space-y-4">
              <div className="bg-warm-50 p-4 rounded-lg">
                <h3 className="font-semibold text-primary-900 mb-2">バックエンドAPI構築が必要</h3>
                <div className="text-sm text-primary-700 space-y-2">
                  <p><strong>推奨技術スタック:</strong></p>
                  <ul className="ml-4 space-y-1">
                    <li>・ Node.js + Express.js + TypeScript</li>
                    <li>・ PostgreSQL または MongoDB</li>
                    <li>・ JWT認証 + bcrypt暗号化</li>
                    <li>・ SendGrid/SES メール送信</li>
                  </ul>
                </div>
              </div>

              <div className="bg-warm-50 p-4 rounded-lg">
                <h3 className="font-semibold text-primary-900 mb-2">必要なAPI endpoints</h3>
                <pre className="bg-primary-900 text-white p-3 rounded text-xs overflow-x-auto">
{`POST /api/auth/register  # ユーザー登録
POST /api/auth/login     # ログイン
POST /api/auth/refresh   # トークン更新
GET  /api/user/profile   # ユーザー情報取得
POST /api/projects       # プロジェクト作成
GET  /api/projects       # プロジェクト一覧
PUT  /api/projects/:id   # プロジェクト更新`}
                </pre>
              </div>
            </div>
          </div>

          {/* Cloud Database設定 */}
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

            <div className="space-y-4">
              <div className="bg-warm-50 p-4 rounded-lg">
                <h3 className="font-semibold text-primary-900 mb-2">Firebase プロジェクト設定</h3>
                <ol className="text-sm text-primary-700 space-y-2 ml-4">
                  <li>1. <a href="https://console.firebase.google.com/" target="_blank" rel="noopener" className="text-accent-500 hover:underline">Firebase Console</a> でプロジェクト作成</li>
                  <li>2. Firestore Database初期化</li>
                  <li>3. Authentication設定 (Google OAuth連携)</li>
                  <li>4. Security Rules設定</li>
                  <li>5. Web app設定からconfig取得</li>
                </ol>
              </div>

              <div className="bg-warm-50 p-4 rounded-lg">
                <h3 className="font-semibold text-primary-900 mb-2">Firestore設定ファイル</h3>
                <pre className="bg-primary-900 text-white p-3 rounded text-xs overflow-x-auto">
{`# .env.local に追加
NEXT_PUBLIC_FIREBASE_API_KEY=あなたのAPIキー
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=あなたのドメイン
NEXT_PUBLIC_FIREBASE_PROJECT_ID=あなたのプロジェクトID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=あなたのストレージバケット`}
                </pre>
              </div>
            </div>
          </div>

          {/* デプロイメント */}
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
              <div className="space-y-4">
                <h3 className="font-semibold text-primary-900">推奨ホスティング</h3>
                <div className="space-y-3">
                  <div className="bg-warm-50 p-3 rounded">
                    <h4 className="font-medium">Frontend</h4>
                    <p className="text-sm text-primary-600">Vercel / Netlify</p>
                  </div>
                  <div className="bg-warm-50 p-3 rounded">
                    <h4 className="font-medium">Backend API</h4>
                    <p className="text-sm text-primary-600">Railway / Render / Heroku</p>
                  </div>
                  <div className="bg-warm-50 p-3 rounded">
                    <h4 className="font-medium">Database</h4>
                    <p className="text-sm text-primary-600">Firebase / PlanetScale / Supabase</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-primary-900">セキュリティ設定</h3>
                <div className="space-y-3">
                  <div className="bg-warm-50 p-3 rounded">
                    <h4 className="font-medium">SSL証明書</h4>
                    <p className="text-sm text-primary-600">Let&apos;s Encrypt (自動)</p>
                  </div>
                  <div className="bg-warm-50 p-3 rounded">
                    <h4 className="font-medium">環境変数</h4>
                    <p className="text-sm text-primary-600">プラットフォーム設定画面</p>
                  </div>
                  <div className="bg-warm-50 p-3 rounded">
                    <h4 className="font-medium">CORS設定</h4>
                    <p className="text-sm text-primary-600">本番ドメイン限定</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* サポート案内 */}
        <div className="bg-primary-800 text-white rounded-lg p-8 text-center mt-12">
          <h2 className="text-2xl font-bold mb-4">セットアップサポート</h2>
          <p className="mb-6">
            本格運用のための設定でご不明な点がございましたら、<br />
            お気軽にお問い合わせください。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="bg-accent-500 hover:bg-accent-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 inline-block"
            >
              セットアップ相談
            </Link>
            <Link
              href="/demo-guide"
              className="border-2 border-white text-white hover:bg-white hover:text-primary-800 font-bold py-3 px-6 rounded-lg transition-all duration-300 inline-block"
            >
              まずは体験版を試す
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
