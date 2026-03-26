import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  FaArrowLeft,
  FaEnvelope,
  FaEye,
  FaEyeSlash,
  FaGoogle,
  FaLock,
} from 'react-icons/fa';

import Layout from '../components/Layout';
import { useAuth } from '../contexts/FirebaseAuthContext';

const LP_URL = 'https://rakuraku-energy.archi-prisma.co.jp';

export default function Login() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginType, setLoginType] = useState('select');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const { login } = useAuth();
  const router = useRouter();

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError('');
      await login();
    } catch (err) {
      setError(err.message || 'Googleログインに失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (event) => {
    event.preventDefault();
    try {
      setLoading(true);
      setError('');
      await login({ email: formData.email, password: formData.password });
    } catch (err) {
      setError(err.message || 'ログインに失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /* ── 共通パーツ ── */
  const backToSite = (
    <a href={LP_URL} className="inline-flex items-center gap-1.5 text-xs text-primary-400 hover:text-accent-500 transition-colors mb-8">
      <FaArrowLeft className="text-[10px]" /> サイトに戻る
    </a>
  );

  const footer = (
    <div className="mt-8 text-center space-y-3">
      <p className="text-sm text-primary-500">
        アカウントをお持ちでない方は{' '}
        <Link href="/register" className="text-accent-500 hover:text-accent-600 font-medium">新規登録</Link>
      </p>
      <p className="text-xs text-primary-300">&copy; {new Date().getFullYear()} Archi-Prisma Design works 株式会社</p>
    </div>
  );

  /* ── 選択画面 ── */
  if (loginType === 'select') {
    return (
      <Layout title="ログイン | 楽々省エネ計算">
        <div className="max-w-sm mx-auto pt-4">
          {backToSite}

          <div className="bg-white rounded-2xl border border-primary-100 shadow-sm p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-primary-900 mb-1">ログイン</h1>
              <p className="text-sm text-primary-400">アカウントにサインイン</p>
            </div>

            {error && (
              <div className="mb-5 bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100">{error}</div>
            )}

            {router.query.registered === 'true' && (
              <div className="mb-5 bg-accent-50 text-accent-700 text-sm p-3 rounded-lg border border-accent-100">
                アカウントを作成しました。ログインして利用を開始してください。
              </div>
            )}

            <div className="space-y-3">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full bg-white hover:bg-warm-50 border border-primary-200 hover:border-primary-300 text-primary-700 font-medium py-3 px-4 rounded-xl flex items-center justify-center transition-all text-sm"
              >
                <FaGoogle className="text-red-500 mr-2.5" />
                {loading ? 'ログイン中...' : 'Googleでログイン'}
              </button>

              <div className="flex items-center gap-3 text-primary-200 text-xs">
                <div className="flex-1 h-px bg-primary-100" />
                <span>or</span>
                <div className="flex-1 h-px bg-primary-100" />
              </div>

              <button
                type="button"
                onClick={() => setLoginType('email')}
                className="w-full bg-primary-800 hover:bg-primary-900 text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center transition-colors text-sm"
              >
                <FaEnvelope className="mr-2.5 text-xs" />
                メールでログイン
              </button>
            </div>
          </div>

          {footer}
        </div>
      </Layout>
    );
  }

  /* ── メールログイン ── */
  return (
    <Layout title="メールログイン | 楽々省エネ計算">
      <div className="max-w-sm mx-auto pt-4">
        {backToSite}

        <div className="bg-white rounded-2xl border border-primary-100 shadow-sm p-8">
          <button
            type="button"
            onClick={() => setLoginType('select')}
            className="text-accent-500 hover:text-accent-600 text-sm mb-6 flex items-center gap-1"
          >
            <FaArrowLeft className="text-[10px]" /> 戻る
          </button>

          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-primary-900 mb-1">メールでログイン</h1>
            <p className="text-sm text-primary-400">登録済みのメールアドレスとパスワードを入力</p>
          </div>

          {error && (
            <div className="mb-5 bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100">{error}</div>
          )}

          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-primary-600 mb-1.5">メールアドレス</label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-3.5 text-primary-300 text-xs" />
                <input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="example@company.co.jp" required
                  className="w-full pl-9 pr-4 py-3 text-sm border border-primary-200 rounded-xl focus:ring-2 focus:ring-accent-500/20 focus:border-accent-400 transition-colors" />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-medium text-primary-600 mb-1.5">パスワード</label>
              <div className="relative">
                <FaLock className="absolute left-3 top-3.5 text-primary-300 text-xs" />
                <input type={showPassword ? 'text' : 'password'} id="password" name="password" value={formData.password} onChange={handleInputChange} placeholder="パスワードを入力" required
                  className="w-full pl-9 pr-10 py-3 text-sm border border-primary-200 rounded-xl focus:ring-2 focus:ring-accent-500/20 focus:border-accent-400 transition-colors" />
                <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-3.5 text-primary-300 hover:text-primary-500 text-xs">
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-primary-800 hover:bg-primary-900 text-white font-medium py-3 rounded-xl transition-colors text-sm disabled:bg-primary-400">
              {loading ? 'ログイン中...' : 'ログイン'}
            </button>
          </form>
        </div>

        {footer}
      </div>
    </Layout>
  );
}
