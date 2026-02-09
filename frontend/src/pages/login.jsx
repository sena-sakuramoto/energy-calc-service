// frontend/src/pages/login.jsx
import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/FirebaseAuthContext';
import Layout from '../components/Layout';
import Link from 'next/link';
import { FaGoogle, FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';

export default function Login() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginType, setLoginType] = useState('select'); // 'select', 'google', 'email'
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const { login } = useAuth();
  const router = useRouter();
  
  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError('');
      await login(); // credentials無しでGoogle認証
    } catch (error) {
      setError(error.message || 'Googleログインに失敗しました');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };


  const handleEmailLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      await login({
        email: formData.email,
        password: formData.password
      });
    } catch (error) {
      setError(error.message || 'ログインに失敗しました。');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // ログイン方法選択画面の表示
  if (loginType === 'select') {
    return (
      <Layout>
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary-900 mb-2">ログイン</h1>
            <p className="text-primary-600">楽々省エネ計算にサインインして始めましょう</p>

            {/* 共同開発企画案内 */}
            <div className="mt-4 bg-warm-100 border border-primary-200 text-primary-700 px-4 py-3 rounded">
              <p className="text-sm">
                協力者様と一緒に成長するサービス
              </p>
            </div>
          </div>
          
          {error && (
            <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-lg border border-red-200">
              {error}
            </div>
          )}
          
          {/* 登録成功メッセージ */}
          {router.query.registered === 'true' && (
            <div className="mb-6 bg-warm-50 text-accent-500 p-4 rounded-lg border border-accent-200">
              アカウントの登録が完了しました！ログインしてご利用ください。
            </div>
          )}
          
          <div className="space-y-4">
            {/* Google認証ボタン */}
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full bg-white hover:bg-warm-50 border-2 border-primary-300 hover:border-primary-400 text-primary-700 font-medium py-4 px-4 rounded-lg flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <FaGoogle className="text-red-500 mr-3 text-xl" />
              {loading ? 'ログイン中...' : 'Googleアカウントでログイン'}
            </button>
            
            {/* メール認証ボタン */}
            <button
              onClick={() => setLoginType('email')}
              className="w-full bg-primary-700 hover:bg-primary-800 text-white font-medium py-4 px-4 rounded-lg flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <FaEnvelope className="mr-3 text-lg" />
              メール・パスワードでログイン
            </button>
          </div>

          {/* 説明テキスト */}
          <div className="mt-8 text-center text-sm text-primary-600 bg-warm-50 p-4 rounded-lg">
            <p className="mb-2 font-medium">
              <strong>省エネ計算を、もっとシンプルに。</strong>
            </p>
            <p>
              建築設計者の負担を軽減し、本来の創造的な設計業務に集中できる環境を提供します。
            </p>
          </div>

          {/* 新規登録リンク */}
          <div className="mt-6 text-center text-sm">
            <p className="text-primary-600">
              アカウントをお持ちでない方は{' '}
              <Link href="/register" className="text-accent-500 hover:text-accent-600 font-medium">
                新規登録
              </Link>
            </p>
          </div>

          {/* フッター */}
          <div className="mt-8 pt-6 border-t border-primary-200 text-center text-sm text-primary-500">
            <p>© 2025 Archi-Prisma Design works 株式会社</p>
          </div>
        </div>
      </Layout>
    );
  }

  // メール認証フォーム
  if (loginType === 'email') {
    return (
      <Layout>
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <button
              onClick={() => setLoginType('select')}
              className="text-accent-500 hover:text-accent-600 mb-4 flex items-center mx-auto"
            >
              ← ログイン方法選択に戻る
            </button>
            <h1 className="text-3xl font-bold text-primary-900 mb-2">メールでログイン</h1>
            <p className="text-primary-600">アカウント情報を入力してください</p>
          </div>
          
          {error && (
            <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-lg border border-red-200">
              {error}
            </div>
          )}
          
          <form onSubmit={handleEmailLogin} className="space-y-6">
            {/* メールアドレス */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-primary-700 mb-2">
                メールアドレス
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-4 text-primary-400" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email || ''}
                  onChange={handleInputChange}
                  placeholder="example@company.co.jp"
                  required
                  className="w-full pl-10 pr-4 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                />
              </div>
            </div>

            {/* パスワード */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-primary-700 mb-2">
                パスワード
              </label>
              <div className="relative">
                <FaLock className="absolute left-3 top-4 text-primary-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password || ''}
                  onChange={handleInputChange}
                  placeholder="パスワードを入力"
                  required
                  className="w-full pl-10 pr-12 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-4 text-primary-400 hover:text-primary-600"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* ログインボタン */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-700 hover:bg-primary-800 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:bg-primary-400"
            >
              {loading ? 'ログイン中...' : 'ログイン'}
            </button>
          </form>


          {/* フッター */}
          <div className="mt-8 pt-6 border-t border-primary-200 text-center text-sm text-primary-500">
            <p>© 2025 Archi-Prisma Design works 株式会社</p>
          </div>
        </div>
      </Layout>
    );
  }

  // デフォルト（この場合は到達しないはず）
  return <Layout><div>Loading...</div></Layout>;
}