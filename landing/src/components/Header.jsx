import { useState } from 'react';
import Link from 'next/link';
import { FaBars, FaTimes } from 'react-icons/fa';

const APP = 'https://app.rakuraku-energy.archi-prisma.co.jp';

const NAV = [
  { href: '/#features', label: 'FEATURES' },
  { href: '/pricing', label: 'PRICING' },
  { href: '/#faq', label: 'FAQ' },
  { href: '/contact', label: 'CONTACT' },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-[#050b18]/60 backdrop-blur-md border-b border-white/[.04]">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="text-[15px] font-bold text-white tracking-tight" onClick={() => setOpen(false)}>
          楽々省エネ計算
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {NAV.map((l) => (
            <Link key={l.href} href={l.href} className="text-[11px] font-medium text-white/40 hover:text-white/80 tracking-[.15em] transition-colors">
              {l.label}
            </Link>
          ))}
        </nav>

        <a href={`${APP}/register`} className="hidden md:inline-flex text-[11px] font-semibold text-white/90 tracking-[.12em] border border-white/15 hover:border-white/30 hover:bg-white/5 px-5 py-2 rounded-full transition-all">
          無料で始める
        </a>

        <button type="button" onClick={() => setOpen((v) => !v)} className="md:hidden text-white/60" aria-label="Menu">
          {open ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {open && (
        <nav className="md:hidden bg-[#0a1628] border-t border-white/[.04] px-6 pb-5 pt-3 space-y-1">
          {NAV.map((l) => (
            <Link key={l.href} href={l.href} className="block text-sm text-white/50 py-2.5 tracking-wider" onClick={() => setOpen(false)}>
              {l.label}
            </Link>
          ))}
          <a href={`${APP}/register`} className="block text-sm font-medium text-white border border-white/15 rounded-full px-4 py-2.5 text-center mt-3">
            無料で始める
          </a>
        </nav>
      )}
    </header>
  );
}
