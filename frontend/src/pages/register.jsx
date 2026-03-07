import { useState } from 'react';
import Link from 'next/link';
import {
  FaEnvelope,
  FaEye,
  FaEyeSlash,
  FaGoogle,
  FaLock,
  FaUser,
} from 'react-icons/fa';

import Layout from '../components/Layout';
import { useAuth } from '../contexts/FirebaseAuthContext';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [registerType, setRegisterType] = useState('select');
  const [showPassword, setShowPassword] = useState(false);
  const { register, login } = useAuth();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    if (password.length < 8) {
      setError('パスワードは8文字以上で入力してください。');
      setLoading(false);
      return;
    }

    try {
      await register({
        email,
        password,
        full_name: fullName || null,
      });
    } catch (err) {
      let errorMessage = '登録中にエラーが発生しました。';
      if (err.response && err.response.data && err.response.data.detail) {
        if (Array.isArray(err.response.data.detail)) {
          errorMessage = err.response.data.detail
            .map((detail) => `${detail.loc?.[1] || 'Error'}: ${detail.msg}`)
            .join('\n');
        } else if (typeof err.response.data.detail === 'string') {
          errorMessage = err.response.data.detail;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      console.error('Registration page caught error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    try {
      setLoading(true);
      setError('');
      await login();
    } catch (err) {
      setError(err.message || 'Googleアカウント登録に失敗しました。');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (registerType === 'select') {
    return (
      <Layout title="新規登録 | 楽々省エネ計算">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary-900 mb-2">新規登録</h1>
            <p className="text-primary-600">
              楽々省エネ計算のアカウントを作成します。
            </p>

            <div className="mt-4 bg-warm-100 border border-primary-200 text-primary-700 px-4 py-3 rounded">
              <p className="text-sm">
                登録は無料です。必要になった時点で月額または1案件パスを選べます。
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <button
              type="button"
              onClick={handleGoogleRegister}
              disabled={loading}
              className="w-full bg-white hover:bg-warm-50 border-2 border-primary-300 hover:border-primary-400 text-primary-700 font-medium py-4 px-4 rounded-lg flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <FaGoogle className="text-red-500 mr-3 text-xl" />
              {loading ? '登録中...' : 'Googleアカウントで開始'}
            </button>

            <button
              type="button"
              onClick={() => setRegisterType('email')}
              className="w-full bg-primary-700 hover:bg-primary-800 text-white font-medium py-4 px-4 rounded-lg flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <FaEnvelope className="mr-3 text-lg" />
              メールアドレスで登録
            </button>
          </div>

          <div className="mt-8 text-center text-sm text-primary-600 bg-warm-50 p-4 rounded-lg">
            <p className="mb-2 font-medium">
              <strong>登録後の流れ</strong>
            </p>
            <p>
              住宅プレビューや料金比較は無料のまま使えます。公式出力が必要になったタイミングで、
              料金ページから有料機能を開けます。
            </p>
          </div>

          <div className="mt-6 text-center text-sm">
            <p className="text-primary-600">
              すでにアカウントをお持ちの方は{' '}
              <Link href="/login" className="text-accent-500 hover:text-accent-600 font-medium">
                ログイン
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

  if (registerType === 'email') {
    return (
      <Layout title="メール登録 | 楽々省エネ計算">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <button
              type="button"
              onClick={() => setRegisterType('select')}
              className="text-accent-500 hover:text-accent-600 mb-4 flex items-center mx-auto"
            >
              ← 登録方法を選び直す
            </button>
            <h1 className="text-3xl font-bold text-primary-900 mb-2">メールで登録</h1>
            <p className="text-primary-600">
              名前、メールアドレス、パスワードを入力してください。
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-lg border border-red-200">
              {error.split('\n').map((line, index) => (
                <div key={index}>{line}</div>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-primary-700 mb-2">
                お名前 <span className="text-primary-500">(任意)</span>
              </label>
              <div className="relative">
                <FaUser className="absolute left-3 top-4 text-primary-400" />
                <input
                  type="text"
                  id="fullName"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  placeholder="例: 省エネ 太郎"
                  className="w-full pl-10 pr-4 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-primary-700 mb-2">
                メールアドレス <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-4 text-primary-400" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="example@email.com"
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
                パスワード <span className="text-red-500">*</span>{' '}
                <span className="text-primary-500">(8文字以上)</span>
              </label>
              <div className="relative">
                <FaLock className="absolute left-3 top-4 text-primary-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
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
              {loading ? '登録中...' : 'アカウントを作成'}
            </button>
          </form>

          <div className="mt-6 text-xs text-primary-500 text-center">
            登録すると、
            <Link href="/privacy" className="text-accent-500 hover:text-accent-600">
              プライバシーポリシー
            </Link>
            に同意したものとみなします。
          </div>

          <div className="mt-8 pt-6 border-t border-primary-200 text-center text-sm text-primary-500">
            <p>&copy; 2025 Archi-Prisma Design works 株式会社</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="新規登録 | 楽々省エネ計算">
      <div className="text-center">Loading...</div>
    </Layout>
  );
}
