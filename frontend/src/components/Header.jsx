// frontend/src/components/Header.jsx
import { useAuth } from '../contexts/AuthContext';
import Link from 'next/link';
import { FaUser, FaSignOutAlt } from 'react-icons/fa';

export default function Header() {
  const { isAuthenticated, logout } = useAuth();

  return (
    <header className="bg-primary text-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          省エネ計算サービス
        </Link>
        
        <nav>
          <ul className="flex items-center space-x-6">
            {isAuthenticated ? (
              <>
                <li>
                  <Link href="/projects" className="hover:text-primary-light">
                    プロジェクト一覧
                  </Link>
                </li>
                <li>
                  <button
                    onClick={logout}
                    className="flex items-center hover:text-primary-light"
                  >
                    <FaSignOutAlt className="mr-1" /> ログアウト
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link href="/login" className="hover:text-primary-light">
                    ログイン
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="hover:text-primary-light">
                    新規登録
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}