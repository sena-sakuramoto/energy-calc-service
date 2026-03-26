import { useState } from 'react';
import Link from 'next/link';
import {
  FaArrowLeft,
  FaEnvelope,
  FaEye,
  FaEyeSlash,
  FaGoogle,
  FaLock,
  FaUser,
} from 'react-icons/fa';

import Layout from '../components/Layout';
import { useAuth } from '../contexts/FirebaseAuthContext';

const LP_URL = 'https://rakuraku-energy.archi-prisma.co.jp';

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
      await register({ email, password, full_name: fullName || null });
    } catch (err) {
      let errorMessage = '登録中にエラーが発生しました。';
      if (err.response?.data?.detail) {
        if (Array.isArray(err.response.data.detail)) {
          errorMessage = err.response.data.detail.map((d) => `${d.loc?.[1] || 'Error'}: ${d.msg}`).join('\n');
        } else if (typeof err.response.data.detail === 'string') {
          errorMessage = err.response.data.detail;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
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
    } finally {
      setLoading(false);
    }
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
        すでにアカウントをお持ちの方は{' '}
        <Link href="/login" className="text-accent-500 hover:text-accent-600 font-medium">ログイン</Link>
      </p>
      <p className="text-xs text-primary-300">&copy; {new Date().getFullYear()} Archi-Prisma Design works 株式会社</p>
    </div>
  );

  /* ── 選択画面 ── */
  if (registerType === 'select') {
    return (
      <Layout title="新規登録 | 楽々省エネ計算">
        <div className="max-w-sm mx-auto pt-4">
          {backToSite}

          <div className="bg-white rounded-2xl border border-primary-100 shadow-sm p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-primary-900 mb-1">アカウント作成</h1>
              <p className="text-sm text-primary-400">無料で始められます</p>
            </div>

            {error && (
              <div className="mb-5 bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100">{error}</div>
            )}

            <div className="space-y-3">
              <button
                type="button"
                onClick={handleGoogleRegister}
                disabled={loading}
                className="w-full bg-white hover:bg-warm-50 border border-primary-200 hover:border-primary-300 text-primary-700 font-medium py-3 px-4 rounded-xl flex items-center justify-center transition-all text-sm"
              >
                <FaGoogle className="text-red-500 mr-2.5" />
                {loading ? '登録中...' : 'Googleで始める'}
              </button>

              <div className="flex items-center gap-3 text-primary-200 text-xs">
                <div className="flex-1 h-px bg-primary-100" />
                <span>or</span>
                <div className="flex-1 h-px bg-primary-100" />
              </div>

              <button
                type="button"
                onClick={() => setRegisterType('email')}
                className="w-full bg-primary-800 hover:bg-primary-900 text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center transition-colors text-sm"
              >
                <FaEnvelope className="mr-2.5 text-xs" />
                メールで登録
              </button>
            </div>

            <p className="mt-5 text-[11px] text-primary-300 text-center leading-relaxed">
              登録は無料。公式PDF出力が必要になった時点で
              <a href={`${LP_URL}/pricing`} className="text-accent-500 hover:text-accent-600">料金プラン</a>
              を選べます。
            </p>
          </div>

          {footer}
        </div>
      </Layout>
    );
  }

  /* ── メール登録 ── */
  return (
    <Layout title="メール登録 | 楽々省エネ計算">
      <div className="max-w-sm mx-auto pt-4">
        {backToSite}

        <div className="bg-white rounded-2xl border border-primary-100 shadow-sm p-8">
          <button
            type="button"
            onClick={() => setRegisterType('select')}
            className="text-accent-500 hover:text-accent-600 text-sm mb-6 flex items-center gap-1"
          >
            <FaArrowLeft className="text-[10px]" /> 戻る
          </button>

          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-primary-900 mb-1">メールで登録</h1>
            <p className="text-sm text-primary-400">情報を入力してアカウントを作成</p>
          </div>

          {error && (
            <div className="mb-5 bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100">
              {error.split('\n').map((line, i) => <div key={i}>{line}</div>)}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-xs font-medium text-primary-600 mb-1.5">
                お名前 <span className="text-primary-300">(任意)</span>
              </label>
              <div className="relative">
                <FaUser className="absolute left-3 top-3.5 text-primary-300 text-xs" />
                <input type="text" id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="省エネ 太郎"
                  className="w-full pl-9 pr-4 py-3 text-sm border border-primary-200 rounded-xl focus:ring-2 focus:ring-accent-500/20 focus:border-accent-400 transition-colors" />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-medium text-primary-600 mb-1.5">
                メールアドレス <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-3.5 text-primary-300 text-xs" />
                <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@email.com" required
                  className="w-full pl-9 pr-4 py-3 text-sm border border-primary-200 rounded-xl focus:ring-2 focus:ring-accent-500/20 focus:border-accent-400 transition-colors" />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-medium text-primary-600 mb-1.5">
                パスワード <span className="text-red-400">*</span> <span className="text-primary-300">(8文字以上)</span>
              </label>
              <div className="relative">
                <FaLock className="absolute left-3 top-3.5 text-primary-300 text-xs" />
                <input type={showPassword ? 'text' : 'password'} id="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="パスワードを入力" required
                  className="w-full pl-9 pr-10 py-3 text-sm border border-primary-200 rounded-xl focus:ring-2 focus:ring-accent-500/20 focus:border-accent-400 transition-colors" />
                <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-3.5 text-primary-300 hover:text-primary-500 text-xs">
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-primary-800 hover:bg-primary-900 text-white font-medium py-3 rounded-xl transition-colors text-sm disabled:bg-primary-400">
              {loading ? '登録中...' : 'アカウントを作成'}
            </button>
          </form>

          <p className="mt-4 text-[10px] text-primary-300 text-center">
            登録すると、<a href={`${LP_URL}/privacy`} className="text-accent-400 hover:text-accent-500">プライバシーポリシー</a>に同意したものとみなします。
          </p>
        </div>

        {footer}
      </div>
    </Layout>
  );
}
