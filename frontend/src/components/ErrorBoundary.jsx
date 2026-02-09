// frontend/src/components/ErrorBoundary.jsx
import React from 'react';
import { FaExclamationTriangle, FaRefresh } from 'react-icons/fa';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // エラーログを送信（本番環境では）
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-warm-50">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-red-500 text-6xl mb-6">
              <FaExclamationTriangle className="mx-auto" />
            </div>
            <h1 className="text-2xl font-bold text-primary-800 mb-4">
              予期しないエラーが発生しました
            </h1>
            <p className="text-primary-600 mb-6">
              申し訳ございません。アプリケーションでエラーが発生しました。
              ページを再読み込みして再度お試しください。
            </p>
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-accent-600 text-white px-4 py-2 rounded-lg hover:bg-accent-700 transition-colors flex items-center justify-center"
              >
                <FaRefresh className="mr-2" />
                ページを再読み込み
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="w-full bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors"
              >
                ホームに戻る
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-primary-500 hover:text-primary-700">
                  詳細なエラー情報（開発用）
                </summary>
                <pre className="mt-2 text-xs bg-warm-100 p-3 rounded overflow-auto max-h-40">
                  {this.state.error.toString()}
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
