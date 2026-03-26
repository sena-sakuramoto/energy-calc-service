import Link from 'next/link';
import { FaBuilding, FaHeart, FaShieldAlt } from 'react-icons/fa';

import { useAuth } from '../contexts/FirebaseAuthContext';

export default function Footer() {
  const { isAuthenticated } = useAuth();

  return (
    <footer className="bg-primary-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <h3 className="text-2xl font-bold mb-4 text-accent-400">
              楽々省エネ計算
            </h3>
            <p className="text-warm-300 mb-4 leading-relaxed">
              省エネ計算の実務を、社内で回せる形へ寄せるためのツールです。
              公式ワークフロー、住宅の検証、PDF出力、提案前の見直しまでを
              同じ画面で進められるように整えています。
            </p>
            <div className="space-y-2">
              <div className="flex items-center text-warm-300">
                <FaBuilding className="mr-2" />
                <span className="text-sm">
                  運営: Archi-Prisma Design works 株式会社
                </span>
              </div>
              <div className="flex items-center text-warm-300">
                <FaShieldAlt className="mr-2" />
                <span className="text-sm">通信は暗号化して保護しています</span>
              </div>
              <div className="flex items-center text-warm-300">
                <FaHeart className="mr-2 text-accent-400" />
                <span className="text-sm">
                  設計実務での使い勝手を優先して改善を続けています
                </span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4 text-accent-400">主要リンク</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://rakuraku-energy.archi-prisma.co.jp/pricing"
                  className="text-warm-300 hover:text-accent-400 transition-colors text-sm"
                >
                  料金プラン
                </a>
              </li>
              <li>
                <Link
                  href={isAuthenticated ? '/tools/official-bei' : '/register'}
                  className="text-warm-300 hover:text-accent-400 transition-colors text-sm"
                >
                  公式BEI計算
                </Link>
              </li>
              <li>
                <a
                  href="https://rakuraku-energy.archi-prisma.co.jp"
                  className="text-warm-300 hover:text-accent-400 transition-colors text-sm"
                >
                  サービスサイト
                </a>
              </li>
              <li>
                <a
                  href="https://rakuraku-energy.archi-prisma.co.jp/contact"
                  className="text-warm-300 hover:text-accent-400 transition-colors text-sm"
                >
                  お問い合わせ
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4 text-accent-400">できること</h4>
            <ul className="space-y-2 text-sm text-warm-300 list-disc list-inside">
              <li>公式BEI計算</li>
              <li>住宅省エネ計算の事前確認</li>
              <li>公式提出用PDFの出力</li>
              <li>電気料金の比較</li>
              <li>設備や外皮の見直し</li>
              <li>提案前の改善ポイント整理</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-700 my-8"></div>

        <div className="bg-primary-800 rounded-lg p-6 mb-8">
          <h4 className="text-lg font-semibold mb-3 text-accent-300 flex items-center">
            <FaShieldAlt className="mr-2" />
            ご利用にあたって
          </h4>
          <div className="text-xs text-warm-300 space-y-2 leading-relaxed">
            <p>
              ・本ツールの計算結果は実務補助を目的としたものであり、最終的な申請判断や提出判断は
              ご自身で確認してください。
            </p>
            <p>
              ・入力値の精度に応じて結果は変わります。案件ごとの条件を確認したうえでご利用ください。
            </p>
            <p>
              ・制度改正やAPI仕様変更がある場合は、必要に応じて画面や出力内容を更新します。
            </p>
          </div>
        </div>

        <div className="text-center pt-4 border-t border-primary-700">
          <p className="text-sm text-warm-400">
            &copy; {new Date().getFullYear()}{' '}
            <span className="font-semibold">Archi-Prisma Design works 株式会社</span>
            <span className="mx-2">|</span>
            <span className="text-accent-400 font-bold">楽々省エネ計算</span>
          </p>
          <p className="text-xs text-warm-500 mt-2">
            Next.jsで構築 | 省エネ計算の実務で使いやすい形へ改善を続けています
          </p>
          <div className="text-xs text-warm-400 mt-3 space-x-4">
            <a href="https://rakuraku-energy.archi-prisma.co.jp/privacy" className="hover:text-warm-200 underline">
              プライバシーポリシー
            </a>
            <a href="https://rakuraku-energy.archi-prisma.co.jp/legal" className="hover:text-warm-200 underline">
              特定商取引法に基づく表記
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
