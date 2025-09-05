// frontend/src/pages/register.jsx
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import { FaGoogle, FaEnvelope, FaLock, FaUser, FaEye, FaEyeSlash } from 'react-icons/fa';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [registerType, setRegisterType] = useState('select'); // 'select', 'email'
  const [showPassword, setShowPassword] = useState(false);
  const { register, login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password.length < 8) { // 簡単なパスワード長のバリデーション
      setError('パスワードは8文字以上で入力してください。');
      setLoading(false);
      return;
    }

    const userDataToSubmit = {
      email: email,
      password: password,
      full_name: fullName || null, // fullNameが空の場合はnullを送信
    };

    console.log("Submitting from register.jsx with data:", JSON.stringify(userDataToSubmit));

    try {
      await register(userDataToSubmit); // AuthContextのregister関数に整形したデータを渡す
      // 登録成功時のリダイレクトはAuthContext内のregister関数で行う想定
      // 例: router.push('/login?registered=true');
    } catch (err) {
      // AuthContextからスローされたエラーメッセージ、またはAxiosのエラーをセット
      let errorMessage = '登録中に予期せぬエラーが発生しました。';
      if (err.response && err.response.data && err.response.data.detail) {
        if (Array.isArray(err.response.data.detail)) {
          errorMessage = err.response.data.detail.map(d => `${(d.loc && d.loc.length > 1 ? d.loc[1] : 'Error')}: ${d.msg}`).join('\n');
        } else if (typeof err.response.data.detail === 'string') {
          errorMessage = err.response.data.detail;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      console.error("Registration page caught error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    try {
      setLoading(true);
      setError('');
      await login(); // Googleログインと同じ処理
    } catch (error) {
      setError('Googleアカウント登録に失敗しました。');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 登録方法選択画面
  if (registerType === 'select') {
    return (
      <Layout>
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">新規登録</h1>
            <p className="text-gray-600">楽々省エネ計算のアカウントを作成</p>
            
            {/* 共同開発企画案内 */}
            <div className="mt-4 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded">
              <p className="text-sm">
                🤝 協力者様と一緒に作るサービス - 無料体験
              </p>
            </div>
          </div>
          
          {error && (
            <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-lg border border-red-200">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            {/* Google登録ボタン */}
            <button
              onClick={handleGoogleRegister}
              disabled={loading}
              className="w-full bg-white hover:bg-gray-50 border-2 border-gray-300 hover:border-blue-400 text-gray-700 font-medium py-4 px-4 rounded-lg flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <FaGoogle className="text-red-500 mr-3 text-xl" />
              {loading ? '登録中...' : 'Googleアカウントで登録'}
            </button>

            {/* メール登録ボタン */}
            <button
              onClick={() => setRegisterType('email')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-4 px-4 rounded-lg flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <FaEnvelope className="mr-3 text-lg" />
              メール・パスワードで登録
            </button>
          </div>

          {/* 説明テキスト */}
          <div className="mt-8 text-center text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
            <p className="mb-2 font-medium">
              <strong>省エネ計算を、もっとシンプルに。</strong>
            </p>
            <p>
              無料でお使いいただきながら、皆様のフィードバックでより良いサービスへ成長させていただいています。
            </p>
          </div>

          {/* ログインリンク */}
          <div className="mt-6 text-center text-sm">
            <p className="text-gray-600">
              既にアカウントをお持ちの方は{' '}
              <Link href="/login" className="text-blue-600 hover:text-blue-800 font-medium">
                ログイン
              </Link>
            </p>
          </div>

          {/* フッター */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
            <p>© 2025 Archi-Prisma Design works 株式会社</p>
          </div>
        </div>
      </Layout>
    );
  }

  // メール登録フォーム
  if (registerType === 'email') {
    return (
      <Layout>
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <button
              onClick={() => setRegisterType('select')}
              className="text-blue-600 hover:text-blue-800 mb-4 flex items-center mx-auto"
            >
              ← 登録方法選択に戻る
            </button>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">メールで登録</h1>
            <p className="text-gray-600">アカウント情報を入力してください</p>
          </div>
          
          {error && (
            <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-lg border border-red-200">
              {error.split('\n').map((line, i) => <div key={i}>{line}</div>)}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 氏名 */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                氏名 <span className="text-gray-500">(任意)</span>
              </label>
              <div className="relative">
                <FaUser className="absolute left-3 top-4 text-gray-400" />
                <input
                  type="text"
                  id="fullName"
                  value={fullName || ''}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="例: 山田 太郎"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* メールアドレス */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                メールアドレス <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-4 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  value={email || ''}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* パスワード */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                パスワード <span className="text-red-500">*</span> <span className="text-gray-500">(8文字以上)</span>
              </label>
              <div className="relative">
                <FaLock className="absolute left-3 top-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password || ''}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="パスワードを入力"
                  required
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-4 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* 登録ボタン */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:bg-gray-400"
            >
              {loading ? '登録中...' : 'アカウントを作成'}
            </button>
          </form>

          {/* 利用規約 */}
          <div className="mt-6 text-xs text-gray-500 text-center">
            アカウント作成により、
            <Link href="/terms" className="text-blue-600 hover:text-blue-800">利用規約</Link>
            および
            <Link href="/privacy" className="text-blue-600 hover:text-blue-800">プライバシーポリシー</Link>
            に同意したものとみなされます。
          </div>

          {/* フッター */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
            <p>© 2025 Archi-Prisma Design works 株式会社</p>
          </div>
        </div>
      </Layout>
    );
  }

  // デフォルト（到達しないはず）
  return <Layout><div>Loading...</div></Layout>;
}