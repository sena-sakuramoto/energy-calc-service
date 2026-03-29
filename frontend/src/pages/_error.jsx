import React from 'react';
import Link from 'next/link';
import { useAuth } from '../contexts/FirebaseAuthContext';

function Error({ statusCode }) {
  const { isAuthenticated } = useAuth();
  const isGitHubPages =
    typeof window !== 'undefined' &&
    window.location.hostname.includes('github.io');

  if (isGitHubPages) {
    return (
      <div className="min-h-screen bg-warm-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-primary-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-primary-900 mb-2">
              省エネ計算システム
            </h1>
            <p className="text-primary-600">GitHub Pages のデモ表示です。</p>
          </div>

          <div className="mb-6">
            <p className="text-sm text-primary-500 mb-4">
              この表示は静的デモ用です。実際のバックエンドを使うには、本番環境またはローカル環境をご利用ください。
            </p>
          </div>

          <div className="space-y-3">
            {isAuthenticated ? (
              <>
                <Link
                  href="/tools/official-bei"
                  className="block w-full bg-accent-600 text-white py-3 px-4 rounded-lg hover:bg-accent-700 transition-colors font-medium"
                >
                  公式BEI計算
                </Link>
                <Link
                  href="/projects"
                  className="block w-full bg-primary-600 text-white py-3 px-4 rounded-lg hover:bg-primary-700 transition-colors font-medium"
                >
                  プロジェクト一覧
                </Link>
              </>
            ) : (
              <Link
                href="/register"
                className="block w-full bg-accent-600 text-white py-3 px-4 rounded-lg hover:bg-accent-700 transition-colors font-medium"
              >
                無料でアカウント作成
              </Link>
            )}
            <a
              href="https://rakuraku-energy.archi-prisma.co.jp/campaign"
              className="block w-full bg-primary-600 text-white py-3 px-4 rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              導入案内
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-50 flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-primary-300 mb-4">
          {statusCode || 'Error'}
        </h1>
        <h2 className="text-2xl font-semibold text-primary-900 mb-6">
          {statusCode
            ? `エラーが発生しました (${statusCode})`
            : 'クライアントエラーが発生しました'}
        </h2>
        <p className="text-primary-600 mb-8">
          {statusCode === 404
            ? 'お探しのページは見つかりませんでした。'
            : '時間をおいて再度お試しください。'}
        </p>
        <Link
          href="/"
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-accent-600 hover:bg-accent-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500"
        >
          ホームに戻る
        </Link>
      </div>
    </div>
  );
}

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
