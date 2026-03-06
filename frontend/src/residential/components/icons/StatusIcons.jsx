export function CheckIcon({ size = 18, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`inline-block ${className}`}>
      <circle cx="12" cy="12" r="11" stroke="#16a34a" strokeWidth="2" fill="#dcfce7" />
      <path
        d="M7 12.5l3.5 3.5L17 9"
        stroke="#16a34a"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

export function WarningIcon({ size = 18, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`inline-block ${className}`}>
      <path d="M12 2L1 21h22L12 2z" fill="#fef3c7" stroke="#d97706" strokeWidth="2" strokeLinejoin="round" />
      <line x1="12" y1="9" x2="12" y2="15" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="12" cy="18" r="1.2" fill="#d97706" />
    </svg>
  );
}

export function ErrorIcon({ size = 18, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`inline-block ${className}`}>
      <circle cx="12" cy="12" r="11" stroke="#dc2626" strokeWidth="2" fill="#fee2e2" />
      <path d="M8 8l8 8M16 8l-8 8" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
