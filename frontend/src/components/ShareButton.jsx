// frontend/src/components/ShareButton.jsx
import { useState } from 'react';
import { FaCopy, FaEnvelope, FaTwitter } from 'react-icons/fa';
import { SiLine } from 'react-icons/si';

export default function ShareButton({ url = '', title = '', description = '' }) {
  const [copied, setCopied] = useState(false);

  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = shareUrl;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent(title || '楽々省エネ計算 - 省エネ計算ツールのご紹介');
    const body = encodeURIComponent(
      `${description || '省エネ計算が簡単にできるツールをご紹介します。'}\n\n${shareUrl}`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`, '_self');
  };

  const handleLineShare = () => {
    const encodedUrl = encodeURIComponent(shareUrl);
    window.open(
      `https://social-plugins.line.me/lineit/share?url=${encodedUrl}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  const handleTwitterShare = () => {
    const text = encodeURIComponent(title || '楽々省エネ計算');
    const encodedUrl = encodeURIComponent(shareUrl);
    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${encodedUrl}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  return (
    <div className="flex items-center gap-1">
      {/* クリップボードにコピー */}
      <div className="relative">
        <button
          onClick={handleCopy}
          className="p-2 text-primary-400 hover:text-accent-500 hover:bg-warm-100 rounded-lg transition-colors duration-200"
          title="リンクをコピー"
          aria-label="リンクをコピー"
        >
          <FaCopy className="text-sm" />
        </button>
        {copied && (
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-primary-800 text-white text-xs px-2 py-1 rounded shadow-lg">
            コピーしました
          </span>
        )}
      </div>

      {/* メール共有 */}
      <button
        onClick={handleEmailShare}
        className="p-2 text-primary-400 hover:text-accent-500 hover:bg-warm-100 rounded-lg transition-colors duration-200"
        title="メールで共有"
        aria-label="メールで共有"
      >
        <FaEnvelope className="text-sm" />
      </button>

      {/* LINE共有 */}
      <button
        onClick={handleLineShare}
        className="p-2 text-primary-400 hover:text-accent-500 hover:bg-warm-100 rounded-lg transition-colors duration-200"
        title="LINEで共有"
        aria-label="LINEで共有"
      >
        <SiLine className="text-sm" />
      </button>

      {/* X/Twitter共有 */}
      <button
        onClick={handleTwitterShare}
        className="p-2 text-primary-400 hover:text-accent-500 hover:bg-warm-100 rounded-lg transition-colors duration-200"
        title="Xで共有"
        aria-label="Xで共有"
      >
        <FaTwitter className="text-sm" />
      </button>
    </div>
  );
}
