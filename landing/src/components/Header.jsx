import { useState } from 'react';
import Link from 'next/link';
import { FaBars, FaTimes } from 'react-icons/fa';

const APP_URL = 'https://app.rakuraku-energy.archi-prisma.co.jp';

const NAV_LINKS = [
  { href: '/pricing', label: '料金プラン' },
  { href: '/about', label: 'サービス紹介' },
  { href: '/campaign', label: '導入案内' },
  { href: '/contact', label: 'お問い合わせ' },
];

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="bg-primary-800 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="text-xl font-bold hover:text-warm-300 transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            楽々省エネ計算
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="hover:text-warm-300 transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <a
              href={`${APP_URL}/login`}
              className="hover:text-warm-300 transition-colors"
            >
              ログイン
            </a>
            <a
              href={`${APP_URL}/register`}
              className="bg-accent-500 text-white px-4 py-2 rounded-lg hover:bg-accent-600 transition-colors font-medium"
            >
              無料で始める
            </a>
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
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="hover:text-warm-300 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <a
                href={`${APP_URL}/login`}
                className="hover:text-warm-300 transition-colors"
              >
                ログイン
              </a>
              <a
                href={`${APP_URL}/register`}
                className="bg-accent-500 text-white px-4 py-2 rounded-lg hover:bg-accent-600 transition-colors font-medium inline-block text-center"
              >
                無料で始める
              </a>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
