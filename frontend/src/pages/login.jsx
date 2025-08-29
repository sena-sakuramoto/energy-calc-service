// frontend/src/pages/login.jsx
import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import Link from 'next/link';
import { FaGoogle } from 'react-icons/fa';

export default function Login() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError('');
      await login();
    } catch (error) {
      setError('Googleログインに失敗しました。');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">ログイン</h1>
          <p className="text-gray-600">楽々省エネ計算にサインインして始めましょう</p>
        </div>
        
        {error && (
          <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-lg border border-red-200">
            {error}
          </div>
        )}
        
        {/* Google OAuth ログインボタン */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full mb-6 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-medium py-3 px-4 rounded-lg flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <FaGoogle className="text-red-500 mr-3 text-lg" />
          {loading ? 'ログイン中...' : 'Googleアカウントでログイン'}
        </button>

        {/* 区切り線 */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">または</span>
          </div>
        </div>

        {/* 説明テキスト */}
        <div className="text-center text-sm text-gray-600">
          <p className="mb-2">
            <strong>省エネ計算を、もっとシンプルに。</strong>
          </p>
          <p>
            建築設計者の負担を軽減し、本来の創造的な設計業務に集中できる環境を提供します。
          </p>
        </div>

        {/* フッター */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
          <p>© 2024 Archi-Prisma Design works 株式会社</p>
        </div>
      </div>
    </Layout>
  );
}