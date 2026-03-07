import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  FaEnvelope,
  FaEye,
  FaEyeSlash,
  FaGoogle,
  FaLock,
} from 'react-icons/fa';

import Layout from '../components/Layout';
import { useAuth } from '../contexts/FirebaseAuthContext';

export default function Login() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginType, setLoginType] = useState('select');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const { login } = useAuth();
  const router = useRouter();

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError('');
      await login();
    } catch (err) {
      setError(err.message || 'Googleログインに失敗しました。');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (event) => {
    event.preventDefault();
    try {
      setLoading(true);
      setError('');
      await login({
        email: formData.email,
        password: formData.password,
      });
    } catch (err) {
      setError(err.message || 'ログインに失敗しました。');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (loginType === 'select') {
    return (
      <Layout title="ログイン | 楽々省エネ計算">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary-900 mb-2">ログイン</h1>
            <p className="text-primary-600">
              楽々省エネ計算にサインインして続けます。
            </p>

            <div className="mt-4 bg-warm-100 border border-primary-200 text-primary-700 px-4 py-3 rounded">
              <p className="text-sm">
                すでに購入済みの方は、同じアカウントでログインしてください。
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          {router.query.registered === 'true' && (
            <div className="mb-6 bg-warm-50 text-accent-600 p-4 rounded-lg border border-accent-200">
              アカウントを作成しました。ログインして利用を開始してください。
            </div>
          )}

          <div className="space-y-4">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full bg-white hover:bg-warm-50 border-2 border-primary-300 hover:border-primary-400 text-primary-700 font-medium py-4 px-4 rounded-lg flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <FaGoogle className="text-red-500 mr-3 text-xl" />
              {loading ? 'ログイン中...' : 'Googleアカウントでログイン'}
            </button>

            <button
              type="button"
              onClick={() => setLoginType('email')}
              className="w-full bg-primary-700 hover:bg-primary-800 text-white font-medium py-4 px-4 rounded-lg flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <FaEnvelope className="mr-3 text-lg" />
              メールアドレスでログイン
            </button>
          </div>

          <div className="mt-8 text-center text-sm text-primary-600 bg-warm-50 p-4 rounded-lg">
            <p className="mb-2 font-medium">
              <strong>このサービスについて</strong>
            </p>
            <p>
              省エネ計算の実務を、社内で回せる形に寄せるためのツールです。
              無料プレビューと有料の公式出力を分けて提供しています。
            </p>
          </div>

          <div className="mt-6 text-center text-sm">
            <p className="text-primary-600">
              アカウントをお持ちでない方は{' '}
              <Link href="/register" className="text-accent-500 hover:text-accent-600 font-medium">
                新規登録
              </Link>
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-primary-200 text-center text-sm text-primary-500">
            <p>&copy; 2025 Archi-Prisma Design works 株式会社</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (loginType === 'email') {
    return (
      <Layout title="メールログイン | 楽々省エネ計算">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <button
              type="button"
              onClick={() => setLoginType('select')}
              className="text-accent-500 hover:text-accent-600 mb-4 flex items-center mx-auto"
            >
              ← ログイン方法を選び直す
            </button>
            <h1 className="text-3xl font-bold text-primary-900 mb-2">メールでログイン</h1>
            <p className="text-primary-600">
              登録済みのメールアドレスとパスワードを入力してください。
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleEmailLogin} className="space-y-6">
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
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="example@company.co.jp"
                  required
                  className="w-full pl-10 pr-4 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-primary-700 mb-2"
              >
                パスワード
              </label>
              <div className="relative">
                <FaLock className="absolute left-3 top-4 text-primary-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="パスワードを入力"
                  required
                  className="w-full pl-10 pr-12 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-3 top-4 text-primary-400 hover:text-primary-600"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-700 hover:bg-primary-800 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:bg-primary-400"
            >
              {loading ? 'ログイン中...' : 'ログイン'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-primary-200 text-center text-sm text-primary-500">
            <p>&copy; 2025 Archi-Prisma Design works 株式会社</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="ログイン | 楽々省エネ計算">
      <div className="text-center">Loading...</div>
    </Layout>
  );
}
