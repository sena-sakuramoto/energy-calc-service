// frontend/src/components/CalculatorLayout.jsx
import { FaArrowLeft } from 'react-icons/fa';
import Link from 'next/link';
import Layout from './Layout';

export default function CalculatorLayout({ 
  children, 
  title, 
  subtitle, 
  icon: Icon,
  backUrl = '/',
  backText = 'ホームに戻る'
}) {
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