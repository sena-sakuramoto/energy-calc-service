import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaBars, FaTimes } from 'react-icons/fa';

const APP = 'https://app.rakuraku-energy.archi-prisma.co.jp';

const NAV = [
  { href: '/#features', label: '機能' },
  { href: '/pricing', label: '料金' },
  { href: '/#faq', label: 'FAQ' },
  { href: '/contact', label: 'お問い合わせ' },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-200 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-[0_1px_0_rgba(0,0,0,.04)]' : 'bg-transparent'}`}>
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="text-[15px] font-bold text-slate-900 tracking-tight" onClick={() => setOpen(false)}>
          楽々省エネ計算
        </Link>

        <nav className="hidden md:flex items-center gap-7">
          {NAV.map((l) => (
            <Link key={l.href} href={l.href} className="text-[13px] text-slate-400 hover:text-slate-800 transition-colors">
              {l.label}
            </Link>
          ))}
          <a href={`${APP}/login`} className="text-[13px] text-slate-400 hover:text-slate-800 transition-colors">
            ログイン
          </a>
          <a href={`${APP}/register`} className="text-[13px] font-semibold text-white bg-slate-900 hover:bg-slate-800 px-4 py-2 rounded-lg transition-colors">
            無料で始める
          </a>
        </nav>

        <button type="button" onClick={() => setOpen((v) => !v)} className="md:hidden text-slate-600" aria-label="Menu">
          {open ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {open && (
        <nav className="md:hidden bg-white border-t border-slate-100 px-6 pb-5 pt-3 space-y-1">
          {NAV.map((l) => (
            <Link key={l.href} href={l.href} className="block text-sm text-slate-500 py-2.5" onClick={() => setOpen(false)}>{l.label}</Link>
          ))}
          <a href={`${APP}/login`} className="block text-sm text-slate-500 py-2.5">ログイン</a>
          <a href={`${APP}/register`} className="block text-sm font-semibold text-white bg-slate-900 rounded-lg px-4 py-2.5 text-center mt-2">無料で始める</a>
        </nav>
      )}
    </header>
  );
}
