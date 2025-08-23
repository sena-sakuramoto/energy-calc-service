// frontend/src/pages/index.jsx
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import Link from 'next/link';
import { FaCalculator, FaChartBar, FaFileDownload } from 'react-icons/fa';

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <Layout>
      <div className="text-center py-12">
        <h1 className="text-4xl font-bold mb-6">建築物省エネ法対応 計算サービス</h1>
        <p className="text-xl mb-8">
          建築設計者のための省エネ基準適合性判定計算を簡単に実行できます
        </p>
        
        {isAuthenticated ? (
          <div className="mt-8">
            <Link
              href="/projects/new"
              className="bg-primary hover:bg-primary-dark text-white font-bold py-3 px-6 rounded-lg shadow-lg"
            >
              新規計算を開始
            </Link>
          </div>
        ) : (
          <div className="mt-8">
            <Link
              href="/login"
              className="bg-primary hover:bg-primary-dark text-white font-bold py-3 px-6 rounded-lg shadow-lg"
            >
              ログインして開始
            </Link>
          </div>
        )}
        
        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-primary text-3xl mb-4">
              <FaCalculator className="mx-auto" />
            </div>
            <h3 className="text-xl font-semibold mb-2">省エネ計算</h3>
            <p className="text-gray-600">
              外皮性能（UA値・η値）と一次エネルギー消費量を正確に計算し、基準適合性を判定します。
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-primary text-3xl mb-4">
              <FaChartBar className="mx-auto" />
            </div>
            <h3 className="text-xl font-semibold mb-2">視覚的な結果</h3>
            <p className="text-gray-600">
              計算結果をグラフィカルに表示。エネルギー消費内訳や基準との比較を視覚的に確認できます。
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-primary text-3xl mb-4">
              <FaFileDownload className="mx-auto" />
            </div>
            <h3 className="text-xl font-semibold mb-2">レポート出力</h3>
            <p className="text-gray-600">
              計算結果をPDFまたはExcel形式でダウンロード。申請書類としてそのまま利用可能です。
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}