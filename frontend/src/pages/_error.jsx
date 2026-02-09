// frontend/src/pages/_error.jsx
import React from 'react';
import Link from 'next/link';
import { useAuth } from '../contexts/FirebaseAuthContext';

function Error({ statusCode, hasGetInitialPropsRun, err }) {
  const { isAuthenticated } = useAuth();
  // GitHub Pages環境での特別な処理
  const isGitHubPages = typeof window !== 'undefined' &&
    window.location.hostname.includes('github.io');

  if (isGitHubPages) {
    return (
      <div className="min-h-screen bg-warm-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-primary-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-primary-900 mb-2">
              建築物省エネ計算システム
            </h1>
            <p className="text-primary-600">
              GitHub Pages デモ版
            </p>
          </div>

          <div className="mb-6">
            <p className="text-sm text-primary-500 mb-4">
              このシステムは完全にフロントエンドで動作します。
              バックエンドAPIは使用せず、モック計算エンジンを使用しています。
            </p>
          </div>

          <div className="space-y-3">
            {isAuthenticated ? (
              <>
                <Link
                  href="/tools/bei-calculator"
                  className="block w-full bg-accent-600 text-white py-3 px-4 rounded-lg hover:bg-accent-700 transition-colors font-medium"
                >
                  BEI計算ツール
                </Link>
                <Link
                  href="/projects"
                  className="block w-full bg-primary-600 text-white py-3 px-4 rounded-lg hover:bg-primary-700 transition-colors font-medium"
                >
                  プロジェクト管理
                </Link>
              </>
            ) : (
              <Link
                href="/register"
                className="block w-full bg-accent-600 text-white py-3 px-4 rounded-lg hover:bg-accent-700 transition-colors font-medium"
              >
                無料アカウント作成
              </Link>
            )}
            <Link
              href="/campaign"
              className="block w-full bg-primary-600 text-white py-3 px-4 rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              共同開発企画
            </Link>
            <Link
              href="/system/status"
              className="block w-full bg-primary-700 text-white py-3 px-4 rounded-lg hover:bg-primary-800 transition-colors font-medium"
            >
              サービス状況
            </Link>
          </div>

          <div className="mt-6 pt-6 border-t border-primary-200">
            <p className="text-xs text-primary-500">
              モデル建物法による省エネ法計算システム（デモ版）
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-50 flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-primary-300 mb-4">
          {statusCode || 'Client'}
        </h1>
        <h2 className="text-2xl font-semibold text-primary-900 mb-6">
          {statusCode
            ? `サーバーエラーが発生しました (${statusCode})`
            : 'クライアントエラーが発生しました'}
        </h2>
        <p className="text-primary-600 mb-8">
          {statusCode === 404
            ? 'お探しのページが見つかりません。'
            : '申し訳ありませんが、エラーが発生しました。'}
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
