import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  FaBars,
  FaCalculator,
  FaChevronDown,
  FaShieldAlt,
  FaSignOutAlt,
  FaTimes,
} from 'react-icons/fa';

import { useAuth } from '../contexts/FirebaseAuthContext';

const LP_URL = 'https://rakuraku-energy.archi-prisma.co.jp';

const TOOL_LINKS = [
  { href: '/tools/official-bei', label: '公式BEI計算' },
  { href: '/residential', label: '住宅省エネ計算' },
  { href: '/tools/energy-calculator', label: 'エネルギー計算' },
  { href: '/tools/tariff-calculator', label: '料金比較' },
];

export default function Header() {
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isGitHubPages =
    typeof window !== 'undefined' &&
    window.location.hostname.includes('github.io');
  const assetBase = isGitHubPages ? '/energy-calc-service' : '';
  const logoSrc = `${assetBase}/logo.png`;

  const closeMenus = () => {
    setIsToolsOpen(false);
    setIsMobileMenuOpen(false);
  };

  const renderToolLinks = (className) =>
    TOOL_LINKS.map((tool) => (
      <Link
        key={tool.href}
        href={tool.href}
        className={className}
        onClick={closeMenus}
      >
        {tool.label}
      </Link>
    ));

  return (
    <header className="bg-primary-800 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-3 text-xl font-bold hover:text-warm-300 transition-colors"
            onClick={closeMenus}
          >
            <Image
              src={logoSrc}
              alt="楽々省エネ計算ロゴ"
              width={36}
              height={36}
              className="w-9 h-9 object-contain"
              priority
            />
            <span>楽々省エネ計算</span>
          </Link>

          {isAuthenticated && isAdmin && (
            <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-accent-500 text-white tracking-wide">
              <FaShieldAlt className="mr-1 text-[10px]" />
              管理者
            </span>
          )}

          <nav className="hidden md:flex items-center space-x-6">
            {isAuthenticated && (
              <li className="list-none">
                <Link
                  href="/projects"
                  className="hover:text-warm-300 transition-colors"
                >
                  プロジェクト
                </Link>
              </li>
            )}

            {isAuthenticated && isAdmin && (
              <li className="list-none">
                <Link
                  href="/admin"
                  className="flex items-center hover:text-warm-300 transition-colors"
                >
                  <FaShieldAlt className="mr-2" />
                  管理
                </Link>
              </li>
            )}

            {isAuthenticated && (
              <li className="relative list-none">
                <button
                  type="button"
                  onClick={() => setIsToolsOpen((open) => !open)}
                  className="flex items-center hover:text-warm-300 transition-colors"
                >
                  <FaCalculator className="mr-2" />
                  計算ツール
                  <FaChevronDown className="ml-1 text-sm" />
                </button>

                {isToolsOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-2 z-50">
                    {renderToolLinks(
                      'block px-4 py-2 text-primary-700 hover:bg-warm-100 hover:text-accent-500 transition-colors',
                    )}
                  </div>
                )}
              </li>
            )}

            {isAuthenticated ? (
              <li className="list-none">
                <button
                  type="button"
                  onClick={logout}
                  className="flex items-center hover:text-warm-300 transition-colors"
                >
                  <FaSignOutAlt className="mr-2" />
                  ログアウト
                </button>
              </li>
            ) : (
              <>
                <li className="list-none">
                  <Link href="/pricing" className="hover:text-warm-300 transition-colors text-sm">
                    料金
                  </Link>
                </li>
                <li className="list-none">
                  <Link href="/login" className="hover:text-warm-300 transition-colors">
                    ログイン
                  </Link>
                </li>
                <li className="list-none">
                  <Link
                    href="/register"
                    className="bg-accent-500 text-white px-4 py-2 rounded-lg hover:bg-accent-600 transition-colors font-medium"
                  >
                    新規登録
                  </Link>
                </li>
              </>
            )}
          </nav>

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            className="md:hidden text-2xl"
            aria-label="メニューを開く"
          >
            {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {isMobileMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 border-t border-primary-600 pt-4">
            <div className="flex flex-col space-y-3">
              {isAuthenticated && (
                <Link
                  href="/projects"
                  className="hover:text-warm-300 transition-colors"
                  onClick={closeMenus}
                >
                  プロジェクト
                </Link>
              )}

              {isAuthenticated && isAdmin && (
                <Link
                  href="/admin"
                  className="flex items-center hover:text-warm-300 transition-colors"
                  onClick={closeMenus}
                >
                  <FaShieldAlt className="mr-2" />
                  管理
                </Link>
              )}

              {isAuthenticated && (
                <div className="border-l-4 border-accent-400 pl-4">
                  <div className="text-warm-300 font-medium mb-2">計算ツール</div>
                  <div className="flex flex-col space-y-2 ml-2">
                    {renderToolLinks('text-sm hover:text-warm-300 transition-colors')}
                  </div>
                </div>
              )}

              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    closeMenus();
                  }}
                  className="flex items-center hover:text-warm-300 transition-colors text-left"
                >
                  <FaSignOutAlt className="mr-2" />
                  ログアウト
                </button>
              ) : (
                <>
                  <Link
                    href="/pricing"
                    className="hover:text-warm-300 transition-colors text-sm"
                  >
                    料金を見る
                  </Link>
                  <Link
                    href="/login"
                    className="hover:text-warm-300 transition-colors"
                    onClick={closeMenus}
                  >
                    ログイン
                  </Link>
                  <Link
                    href="/register"
                    className="bg-accent-500 text-white px-4 py-2 rounded-lg hover:bg-accent-600 transition-colors font-medium inline-block text-center"
                    onClick={closeMenus}
                  >
                    新規登録
                  </Link>
                </>
              )}
            </div>
          </nav>
        )}
      </div>

      {(isToolsOpen || isMobileMenuOpen) && (
        <div className="fixed inset-0 z-40" onClick={closeMenus}></div>
      )}
    </header>
  );
}
