// frontend/src/components/ReferralPrompt.jsx
import { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import ShareButton from './ShareButton';

const DISMISSED_KEY = 'referralPromptDismissed';

export default function ReferralPrompt({ show = false, url = '', title = '', description = '' }) {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    // Check localStorage for dismissed state on mount
    if (typeof window !== 'undefined') {
      const wasDismissed = localStorage.getItem(DISMISSED_KEY);
      setDismissed(!!wasDismissed);
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem(DISMISSED_KEY, 'true');
    }
  };

  if (!show || dismissed) {
    return null;
  }

  return (
    <div className="bg-warm-50 border border-warm-200 rounded-xl p-6 mt-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-primary-700 font-medium mb-1">
            この結果を同僚にシェアしませんか？
          </p>
          <p className="text-sm text-primary-400 mb-4">
            省エネ計算の手間を減らす仲間を増やしましょう
          </p>
          <ShareButton
            url={url}
            title={title || '楽々省エネ計算 - BEI計算結果'}
            description={description || '省エネ計算が簡単にできるツールで計算しました。ぜひお試しください。'}
          />
        </div>
        <button
          onClick={handleDismiss}
          className="p-1.5 text-primary-300 hover:text-primary-500 hover:bg-warm-100 rounded-lg transition-colors duration-200 ml-4 flex-shrink-0"
          title="閉じる"
          aria-label="閉じる"
        >
          <FaTimes className="text-sm" />
        </button>
      </div>
    </div>
  );
}
