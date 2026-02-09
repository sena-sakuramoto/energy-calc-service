// frontend/src/components/Footer.jsx
import { FaBuilding, FaShieldAlt, FaHeart } from 'react-icons/fa';
import Link from 'next/link';
import { useAuth } from '../contexts/FirebaseAuthContext';

export default function Footer() {
  const { isAuthenticated, user } = useAuth();
  return (
    <footer className="bg-primary-900 text-white">
      <div className="container mx-auto px-4 py-12">
        {/* メインフッターコンテンツ */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* 会社・サービス紹介 */}
          <div className="md:col-span-2">
            <h3 className="text-2xl font-bold mb-4 text-accent-400">
              楽々省エネ計算
            </h3>
            <p className="text-warm-300 mb-4 leading-relaxed">
              複雑化する省エネ法を、シンプルに。建築設計者の負担を軽減し、
              本来の創造的な設計業務に集中できる省エネ計算ツールです。
            </p>
            <div className="space-y-2">
              <div className="flex items-center text-warm-300">
                <FaBuilding className="mr-2" />
                <span className="text-sm">開発・運営: Archi-Prisma Design works 株式会社</span>
              </div>
              <div className="flex items-center text-warm-300">
                <FaShieldAlt className="mr-2" />
                <span className="text-sm">建築物省エネ法に準拠</span>
              </div>
              <div className="flex items-center text-warm-300">
                <FaHeart className="mr-2 text-accent-400" />
                <span className="text-sm">設計者の声から生まれた、設計者のためのツール</span>
              </div>
            </div>
          </div>

          {/* 主要サービス */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-accent-400">主要サービス</h4>
            <ul className="space-y-2">
              {isAuthenticated && (
                <li>
                  <Link href="/tools/bei-calculator" className="text-warm-300 hover:text-accent-400 transition-colors text-sm">
                    BEI計算（無料）
                  </Link>
                </li>
              )}
              <li>
                <Link href="/campaign" className="text-warm-300 hover:text-accent-400 transition-colors text-sm">
                  共同開発企画
                </Link>
              </li>
              <li>
                <Link href="/system/status" className="text-warm-300 hover:text-accent-400 transition-colors text-sm">
                  サービス稼働状況
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-warm-300 hover:text-accent-400 transition-colors text-sm">
                  お問い合わせ
                </Link>
              </li>
              {/* 管理者専用リンク */}
              {isAuthenticated && user?.isAdmin && (
                <li>
                  <Link href="/admin/firebase-users" className="text-accent-300 hover:text-accent-200 transition-colors text-sm">
                    Firebase ユーザー管理
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* 法令・規格への準拠 */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-accent-400">準拠法令・規格</h4>
            <ul className="space-y-2 text-sm text-warm-300 list-disc list-inside">
              <li>建築物省エネ法</li>
              <li>エネルギー消費性能基準</li>
              <li>外皮性能基準</li>
              <li>一次エネルギー消費量基準</li>
              <li>地域区分の基準値</li>
              <li>再生可能エネルギー控除</li>
            </ul>
          </div>
        </div>

        {/* セパレーター */}
        <div className="border-t border-primary-700 my-8"></div>

        {/* 重要事項・免責事項 */}
        <div className="bg-primary-800 rounded-lg p-6 mb-8">
          <h4 className="text-lg font-semibold mb-3 text-accent-300 flex items-center">
            <FaShieldAlt className="mr-2" />
            重要事項・免責事項
          </h4>
          <div className="text-xs text-warm-300 space-y-2 leading-relaxed">
            <p>• 本ツールの計算結果は参考であり、実際の申請や法的判断においては、必ず専門家による確認・検証を行ってください。</p>
            <p>• 計算結果の精度および適合性について、当社は一切の責任を負いません。</p>
            <p>• 法令改正に伴い基準値・算出方法が変更される場合があります。最新の法令をご確認ください。</p>
            <p>• システムの使用により生じた損失・損害について、当社は責任を負いません。</p>
          </div>
        </div>

        {/* 著作権・フッターボトム */}
        <div className="text-center pt-4 border-t border-primary-700">
          <p className="text-sm text-warm-400">
            &copy; {new Date().getFullYear()} <span className="font-semibold">Archi-Prisma Design works 株式会社</span>
            <span className="mx-2">|</span>
            <span className="text-accent-400 font-bold">楽々省エネ計算</span>
            <span className="mx-2">|</span>
            All Rights Reserved.
          </p>
          <p className="text-xs text-warm-500 mt-2">Powered by Next.js · Made for Architects · v1.0.0</p>
          <div className="text-xs text-warm-400 mt-3 space-x-4">
            <Link href="/privacy" className="hover:text-warm-200 underline">プライバシーポリシー</Link>
            <Link href="/legal" className="hover:text-warm-200 underline">特定商取引法に基づく表記</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
