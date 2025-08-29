// frontend/src/pages/about.jsx
import Layout from '../components/Layout';
import Link from 'next/link';
import { FaBuilding, FaUsers, FaLightbulb, FaHeart, FaShieldAlt, FaLeaf, FaChartLine, FaCheckCircle } from 'react-icons/fa';

export default function About() {
  return (
    <Layout title="私たちについて - 楽々省エネ計算">
      <div className="max-w-4xl mx-auto">
        {/* ヒーローセクション */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            設計者の声から生まれた、<br />設計者のためのツール
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            複雑化する省エネ法を、シンプルに。建築設計者の負担を軽減し、<br />
            本来の創造的な設計業務に集中できる環境を提供します。
          </p>
        </div>

        {/* 会社情報 */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="flex items-center mb-6">
            <div className="bg-blue-100 p-3 rounded-full mr-4">
              <FaBuilding className="text-blue-600 text-2xl" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Archi-Prisma Design works 株式会社</h2>
              <p className="text-gray-600">建築設計業務の効率化とデジタル化を推進</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FaLightbulb className="mr-2 text-yellow-500" />
                私たちのミッション
              </h3>
              <p className="text-gray-600 leading-relaxed">
                建築設計者が本来の創造的な業務に集中できるよう、複雑で時間のかかる計算作業を簡単・迅速・正確に処理できるツールを提供します。
                省エネ法の複雑化により増大する設計者の負担を軽減し、より良い建築設計の実現を支援します。
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FaHeart className="mr-2 text-red-500" />
                私たちの想い
              </h3>
              <p className="text-gray-600 leading-relaxed">
                建築設計の現場で働く設計者の声を直接聞き、本当に必要な機能だけを厳選して開発しています。
                使いやすさと計算精度を両立し、設計者の皆様に信頼される製品づくりを心がけています。
              </p>
            </div>
          </div>
        </div>

        {/* 特徴・強み */}
        <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">楽々省エネ計算の特徴</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <FaCheckCircle className="text-blue-600 text-2xl" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">簡単操作</h3>
              <p className="text-gray-600 text-sm">
                直感的なUI/UXで、複雑な省エネ計算を誰でも簡単に実行できます
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <FaShieldAlt className="text-green-600 text-2xl" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">正確性</h3>
              <p className="text-gray-600 text-sm">
                建築物省エネ法に完全準拠。最新の基準値と計算式で正確な結果を提供
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <FaLeaf className="text-purple-600 text-2xl" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">信頼性</h3>
              <p className="text-gray-600 text-sm">
                設計実務経験豊富な建築士が監修。現場で本当に使える機能を厳選
              </p>
            </div>
          </div>
        </div>

        {/* 技術情報 */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">技術仕様・対応範囲</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FaChartLine className="mr-2 text-blue-500" />
                対応計算項目
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  BEI（Building Energy Index）計算
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  外皮性能計算（UA値・ηA値）
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  一次エネルギー消費量計算
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  用途別エネルギー消費量分析
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  再生可能エネルギー控除計算
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  地域区分別基準値対応
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FaBuilding className="mr-2 text-green-500" />
                対応建物用途
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  事務所建築物
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  学校建築物
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  病院建築物
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  ホテル・旅館
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  共同住宅
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  複合用途建築物
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* セキュリティ・品質保証 */}
        <div className="bg-gray-50 rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">セキュリティ・品質への取り組み</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FaShieldAlt className="mr-2 text-blue-500" />
                データセキュリティ
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Google OAuth 2.0による安全な認証</li>
                <li>• HTTPS暗号化通信</li>
                <li>• Cloud Firestore暗号化保存</li>
                <li>• 個人情報保護法完全準拠</li>
                <li>• 定期的なセキュリティ監査</li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FaCheckCircle className="mr-2 text-green-500" />
                品質保証
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• 建築士による計算ロジック監修</li>
                <li>• 継続的な精度検証</li>
                <li>• ユーザーフィードバック反映</li>
                <li>• 24時間システム監視</li>
                <li>• 定期的なバックアップ実施</li>
              </ul>
            </div>
          </div>
        </div>

        {/* お問い合わせ・サポート */}
        <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">お問い合わせ・サポート</h2>
          <p className="mb-6">
            ご質問・ご要望・不具合報告など、お気軽にお問い合わせください。<br />
            設計業務でお困りの際は、いつでもサポートいたします。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="bg-white text-blue-600 hover:bg-gray-100 font-bold py-3 px-6 rounded-lg transition-all duration-300 inline-block"
            >
              お問い合わせフォーム
            </Link>
            <Link
              href="/system/status"
              className="border-2 border-white text-white hover:bg-white hover:text-blue-600 font-bold py-3 px-6 rounded-lg transition-all duration-300 inline-block"
            >
              システム状況を確認
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}