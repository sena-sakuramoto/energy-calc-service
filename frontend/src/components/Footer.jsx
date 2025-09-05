// frontend/src/components/Footer.jsx
import { FaBuilding, FaEnvelope, FaPhone, FaGlobe, FaShieldAlt, FaHeart } from 'react-icons/fa';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';

export default function Footer() {
  const { isAuthenticated } = useAuth();
  return (
    <footer className="bg-gradient-to-r from-gray-800 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        {/* メインフッターコンテンツ */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* 会社情報 */}
          <div className="md:col-span-2">
            <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
              楽々省エネ計算
            </h3>
            <p className="text-gray-300 mb-4 leading-relaxed">
              複雑化する省エネ法を、シンプルに。建築設計者の負担を軽減し、<br />
              本来の創造的な設計業務に集中できる省エネ計算ツール
            </p>
            <div className="space-y-2">
              <div className="flex items-center text-gray-300">
                <FaBuilding className="mr-2" />
                <span className="text-sm">開発・運営: Archi-Prisma Design works 株式会社</span>
              </div>
              <div className="flex items-center text-gray-300">
                <FaShieldAlt className="mr-2" />
                <span className="text-sm">建築物省エネ法 完全準拠</span>
              </div>
              <div className="flex items-center text-gray-300">
                <FaHeart className="mr-2 text-red-400" />
                <span className="text-sm">設計者の声から生まれた、設計者のためのツール</span>
              </div>
            </div>
          </div>

          {/* 主要サービス */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-blue-300">主要サービス</h4>
            <ul className="space-y-2">
              {isAuthenticated && (
                <li>
                  <Link href="/tools/bei-calculator" className="text-gray-300 hover:text-blue-300 transition-colors text-sm">
                    🔥 BEI計算（無料）
                  </Link>
                </li>
              )}
              <li>
                <Link href="/campaign" className="text-gray-300 hover:text-blue-300 transition-colors text-sm">
                  🤝 共同開発企画
                </Link>
              </li>
              <li>
                <Link href="/system/status" className="text-gray-300 hover:text-blue-300 transition-colors text-sm">
                  📊 サービス稼働状況
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-blue-300 transition-colors text-sm">
                  💬 お問い合わせ
                </Link>
              </li>
            </ul>
          </div>

          {/* 法令・規格への準拠 */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-green-300">準拠法令・規格</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>• 建築物省エネ法</li>
              <li>• エネルギー消費性能基準</li>
              <li>• 外皮性能基準</li>
              <li>• 一次エネルギー消費量基準</li>
              <li>• 地域区分別基準値</li>
              <li>• 再生可能エネルギー控除</li>
            </ul>
          </div>
        </div>

        {/* セパレーター */}
        <div className="border-t border-gray-700 my-8"></div>

        {/* 重要事項・免責事項 */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h4 className="text-lg font-semibold mb-3 text-yellow-300 flex items-center">
            <FaShieldAlt className="mr-2" />
            重要事項・免責事項
          </h4>
          <div className="text-xs text-gray-300 space-y-2 leading-relaxed">
            <p>
              • 本ツールの計算結果は参考値であり、実際の申請や法的判断においては、必ず専門家による確認・検証を行ってください。
            </p>
            <p>
              • 計算結果の精度や法的適合性について、当社は一切の責任を負いかねます。
            </p>
            <p>
              • 建築物省エネ法の改正により基準値や計算方法が変更される場合があります。最新の法令をご確認ください。
            </p>
            <p>
              • システムの使用により生じた損失・損害について、当社は責任を負いません。
            </p>
          </div>
        </div>

        {/* 著作権・最終行 */}
        <div className="text-center pt-4 border-t border-gray-700">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} <span className="font-semibold">Archi-Prisma Design works 株式会社</span>
            <span className="mx-2">|</span>
            <span className="bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent font-bold">楽々省エネ計算</span>
            <span className="mx-2">|</span>
            All Rights Reserved.
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Powered by Next.js · Made with ❤️ for Architects · v1.0.0
          </p>
        </div>
      </div>
    </footer>
  );
}