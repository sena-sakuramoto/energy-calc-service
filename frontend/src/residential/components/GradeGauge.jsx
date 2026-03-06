function toNumber(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

export default function GradeGauge({ ua, thresholds }) {
  const maxUA = 1.0;
  const barWidth = 300;
  const barHeight = 24;
  const safeThresholds = thresholds || {};
  const safeUA = Math.max(0, Math.min(toNumber(ua, 0), maxUA));

  const toX = (value) => {
    const safeValue = Math.max(0, Math.min(toNumber(value, maxUA), maxUA));
    return (safeValue / maxUA) * barWidth;
  };

  const uaX = toX(safeUA);
  const grade4Limit = toNumber(safeThresholds[4], 0.87);

  const grades = [
    { grade: 7, limit: toNumber(safeThresholds[7], 0.26), color: '#059669' },
    { grade: 6, limit: toNumber(safeThresholds[6], 0.46), color: '#16a34a' },
    { grade: 5, limit: toNumber(safeThresholds[5], 0.60), color: '#65a30d' },
    { grade: 4, limit: grade4Limit, color: '#ca8a04' },
  ];

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${barWidth} ${barHeight + 30}`} className="w-full max-w-sm">
        <rect x="0" y="10" width={barWidth} height={barHeight} rx="4" fill="#fee2e2" />

        {grades.map((g, i) => (
          <rect
            key={g.grade}
            x="0"
            y="10"
            width={toX(g.limit)}
            height={barHeight}
            rx={i === 0 ? 4 : 0}
            fill={g.color}
            opacity="0.2"
          />
        ))}

        {grades.map((g) => (
          <g key={`label-${g.grade}`}>
            <line x1={toX(g.limit)} y1="8" x2={toX(g.limit)} y2={10 + barHeight + 2} stroke={g.color} strokeWidth="1.5" />
            <text x={toX(g.limit)} y={barHeight + 22} textAnchor="middle" fontSize="9" fill={g.color} fontWeight="600">
              等級{g.grade}
            </text>
          </g>
        ))}

        <polygon
          points={`${uaX - 6},8 ${uaX + 6},8 ${uaX},16`}
          fill={safeUA <= grade4Limit ? '#16a34a' : '#dc2626'}
        />
        <text
          x={uaX}
          y="6"
          textAnchor="middle"
          fontSize="10"
          fontWeight="700"
          fill={safeUA <= grade4Limit ? '#16a34a' : '#dc2626'}
        >
          {safeUA.toFixed(2)}
        </text>
      </svg>
    </div>
  );
}
