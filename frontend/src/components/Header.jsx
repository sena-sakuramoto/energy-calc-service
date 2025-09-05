// frontend/src/components/Header.jsx
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Link from 'next/link';
import { FaUser, FaSignOutAlt, FaCalculator, FaChevronDown, FaBars, FaTimes, FaBook, FaChartLine, FaGift } from 'react-icons/fa';

export default function Header() {
  const { isAuthenticated, logout } = useAuth();
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleTools = () => {
    setIsToolsOpen(!isToolsOpen);
  };

  const closeMenus = () => {
    setIsToolsOpen(false);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-xl font-bold hover:text-blue-200 transition-colors">
            楽々省エネ計算
          </Link>
          
          {/* デスクトップナビゲーション */}
          <nav className="hidden md:flex items-center space-x-6">
            {isAuthenticated && (
              <li className="list-none">
                <Link href="/projects" className="hover:text-blue-200 transition-colors">
                  プロジェクト
                </Link>
              </li>
            )}
            
            {/* 共同開発 */}
            <li className="list-none">
              <Link href="/campaign" className="flex items-center hover:text-blue-200 transition-colors">
                <FaGift className="mr-2 text-yellow-300" />
                <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-bold mr-2">企画</span>
                共同開発
              </Link>
            </li>
            
            {/* サービス状況 */}
            <li className="list-none">
              <Link href="/system/status" className="flex items-center hover:text-blue-200 transition-colors">
                <FaChartLine className="mr-2" />
                サービス状況
              </Link>
            </li>
            
            {/* 計算ツールドロップダウン - 認証時のみ表示 */}
            {isAuthenticated && (
              <li className="relative list-none">
                <button
                  onClick={toggleTools}
                  className="flex items-center hover:text-blue-200 transition-colors"
                >
                  <FaCalculator className="mr-2" />
                  計算ツール
                  <FaChevronDown className="ml-1 text-sm" />
                </button>
                
                {isToolsOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-2 z-50">
                    <Link
                      href="/tools/bei-calculator"
                      className="block px-4 py-2 text-gray-800 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      onClick={closeMenus}
                    >
                      BEI計算
                    </Link>
                    <Link
                      href="/tools/energy-calculator"
                      className="block px-4 py-2 text-gray-800 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      onClick={closeMenus}
                    >
                      エネルギー計算
                    </Link>
                    <Link
                      href="/tools/tariff-calculator"
                      className="block px-4 py-2 text-gray-800 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      onClick={closeMenus}
                    >
                      電力料金見積もり
                    </Link>
                  </div>
                )}
              </li>
            )}

            {isAuthenticated ? (
              <li className="list-none">
                <button
                  onClick={logout}
                  className="flex items-center hover:text-blue-200 transition-colors"
                >
                  <FaSignOutAlt className="mr-2" />
                  ログアウト
                </button>
              </li>
            ) : (
              <>
                <li className="list-none">
                  <Link href="/login" className="hover:text-blue-200 transition-colors">
                    ログイン
                  </Link>
                </li>
                <li className="list-none">
                  <Link
                    href="/register"
                    className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors font-medium"
                  >
                    新規登録
                  </Link>
                </li>
              </>
            )}
          </nav>

          {/* モバイルメニューボタン */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-2xl"
          >
            {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {/* モバイルナビゲーション */}
        {isMobileMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 border-t border-blue-500 pt-4">
            <div className="flex flex-col space-y-3">
              {isAuthenticated && (
                <Link
                  href="/projects"
                  className="hover:text-blue-200 transition-colors"
                  onClick={closeMenus}
                >
                  プロジェクト
                </Link>
              )}
              
              {/* 共同開発 (モバイル) */}
              <Link
                href="/campaign"
                className="flex items-center hover:text-blue-200 transition-colors"
                onClick={closeMenus}
              >
                <FaGift className="mr-2 text-yellow-300" />
                <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-bold mr-2">企画</span>
                共同開発
              </Link>
              
              {/* サービス状況 (モバイル) */}
              <Link
                href="/system/status"
                className="flex items-center hover:text-blue-200 transition-colors"
                onClick={closeMenus}
              >
                <FaChartLine className="mr-2" />
                サービス状況
              </Link>
              
              {/* 計算ツール - 認証時のみ表示 */}
              {isAuthenticated && (
                <div className="border-l-4 border-blue-400 pl-4">
                  <div className="text-blue-200 font-medium mb-2">計算ツール</div>
                  <div className="flex flex-col space-y-2 ml-2">
                    <Link
                      href="/tools/bei-calculator"
                      className="text-sm hover:text-blue-200 transition-colors"
                      onClick={closeMenus}
                    >
                      BEI計算
                    </Link>
                    <Link
                      href="/tools/energy-calculator"
                      className="text-sm hover:text-blue-200 transition-colors"
                      onClick={closeMenus}
                    >
                      エネルギー計算
                    </Link>
                    <Link
                      href="/tools/tariff-calculator"
                      className="text-sm hover:text-blue-200 transition-colors"
                      onClick={closeMenus}
                    >
                      電力料金見積もり
                    </Link>
                  </div>
                </div>
              )}

              {isAuthenticated ? (
                <button
                  onClick={() => { logout(); closeMenus(); }}
                  className="flex items-center hover:text-blue-200 transition-colors text-left"
                >
                  <FaSignOutAlt className="mr-2" />
                  ログアウト
                </button>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="hover:text-blue-200 transition-colors"
                    onClick={closeMenus}
                  >
                    ログイン
                  </Link>
                  <Link
                    href="/register"
                    className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors font-medium inline-block text-center"
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
      
      {/* クリックアウェイでメニューを閉じる */}
      {(isToolsOpen || isMobileMenuOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={closeMenus}
        ></div>
      )}
    </header>
  );
}