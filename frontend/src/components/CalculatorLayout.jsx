// frontend/src/components/CalculatorLayout.jsx
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { FaArrowLeft, FaLock } from 'react-icons/fa';
import Link from 'next/link';
import Layout from './Layout';
import { useAuth } from '../contexts/FirebaseAuthContext';

export default function CalculatorLayout({ 
  children, 
  title, 
  subtitle, 
  icon: Icon,
  backUrl = '/',
  backText = 'ホームに戻る'
}) {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      // 認証されていない場合、ログインページにリダイレクト
      router.push('/login?redirect=' + encodeURIComponent(router.asPath));
    }
  }, [isAuthenticated, loading, router]);

  // ローディング中
  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-8 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">読み込み中...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // 認証されていない場合
  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-8 flex items-center justify-center">
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
            <FaLock className="mx-auto text-4xl text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">ログインが必要です</h2>
            <p className="text-gray-600 mb-6">
              計算機能を利用するにはログインしてください。
            </p>
            <Link 
              href={`/login?redirect=${encodeURIComponent(router.asPath)}`}
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              ログインする
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-8">
        <div className="container mx-auto px-4">
          {/* パンくずナビゲーション */}
          <div className="max-w-6xl mx-auto mb-4">
            <Link
              href={backUrl}
              className="inline-flex items-center text-gray-600 hover:text-blue-600 transition-colors"
            >
              <FaArrowLeft className="mr-2" />
              {backText}
            </Link>
          </div>

          <div className="max-w-6xl mx-auto">
            {/* ヘッダー */}
            <div className="text-center mb-8">
              {Icon && (
                <div className="flex justify-center mb-4">
                  <div className="bg-blue-100 p-4 rounded-full">
                    <Icon className="text-3xl text-blue-600" />
                  </div>
                </div>
              )}
              <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                {title}
              </h1>
              {subtitle && (
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  {subtitle}
                </p>
              )}
            </div>

            {children}
          </div>
        </div>
      </div>
    </Layout>
  );
}