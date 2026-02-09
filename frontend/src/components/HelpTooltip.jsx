// frontend/src/components/HelpTooltip.jsx
import { useState } from 'react';
import { FaQuestionCircle } from 'react-icons/fa';

export default function HelpTooltip({ title, children, className = "" }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onClick={() => setIsOpen(!isOpen)}
        className="text-primary-500 hover:text-primary-700 transition-colors"
        type="button"
      >
        <FaQuestionCircle className="text-sm" />
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50">
          <div className="bg-primary-900 text-white text-sm rounded-lg p-3 shadow-lg max-w-xs">
            <div className="font-medium mb-1">{title}</div>
            <div className="text-primary-200">{children}</div>
            {/* 矢印 */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2">
              <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-primary-900"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
