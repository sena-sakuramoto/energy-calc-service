function toNumber(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

export default function GradeGauge({ ua, thresholds }) {
  const maxUA = 1.0;
  const barWidth = 340;
  const barHeight = 28;
  const topPad = 28;
  const bottomPad = 24;
  const svgHeight = topPad + barHeight + bottomPad;
  const safeThresholds = thresholds || {};
  const safeUA = Math.max(0, Math.min(toNumber(ua, 0), maxUA));

  const toX = (value) => {
    const safeValue = Math.max(0, Math.min(toNumber(value, maxUA), maxUA));
    return (safeValue / maxUA) * barWidth;
  };

  const uaX = toX(safeUA);
  const grade4Limit = toNumber(safeThresholds[4], 0.87);
  const isPass = safeUA <= grade4Limit;

  const grades = [
    { grade: 7, limit: toNumber(safeThresholds[7], 0.26), color: '#059669' },
    { grade: 6, limit: toNumber(safeThresholds[6], 0.46), color: '#16a34a' },
    { grade: 5, limit: toNumber(safeThresholds[5], 0.60), color: '#65a30d' },
    { grade: 4, limit: grade4Limit, color: '#ca8a04' },
  ];

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${barWidth} ${svgHeight}`} className="w-full max-w-md" aria-label={`UA値 ${safeUA.toFixed(2)} のグレードゲージ`}>
        {/* 背景バー（基準未達エリア） */}
        <rect x="0" y={topPad} width={barWidth} height={barHeight} rx="6" fill="#fecaca" />

        {/* 等級バー（左から順に重ねる） */}
        {grades.map((g, i) => {
          const w = toX(g.limit);
          return (
            <rect
              key={g.grade}
              x="0"
              y={topPad}
              width={w}
              height={barHeight}
              rx={i === 0 ? 6 : 0}
              fill={g.color}
              opacity="0.25"
            />
          );
        })}

        {/* 等級区切り線 & ラベル */}
        {grades.map((g) => {
          const x = toX(g.limit);
          return (
            <g key={`label-${g.grade}`}>
              <line
                x1={x} y1={topPad - 2}
                x2={x} y2={topPad + barHeight + 2}
                stroke={g.color} strokeWidth="2"
              />
              <text
                x={x}
                y={topPad + barHeight + 16}
                textAnchor="middle"
                fontSize="11"
                fill={g.color}
                fontWeight="700"
              >
                等級{g.grade}
              </text>
            </g>
          );
        })}

        {/* 基準未達ラベル（等級4の右側） */}
        {toX(grade4Limit) < barWidth - 20 && (
          <text
            x={(toX(grade4Limit) + barWidth) / 2}
            y={topPad + barHeight + 16}
            textAnchor="middle"
            fontSize="10"
            fill="#dc2626"
            fontWeight="600"
          >
            等級4未満
          </text>
        )}

        {/* UA値ラベル */}
        <text
          x={uaX}
          y={topPad - 14}
          textAnchor="middle"
          fontSize="13"
          fontWeight="800"
          fill={isPass ? '#16a34a' : '#dc2626'}
        >
          {safeUA.toFixed(2)}
        </text>

        {/* 矢印マーカー */}
        <polygon
          points={`${uaX - 7},${topPad - 2} ${uaX + 7},${topPad - 2} ${uaX},${topPad + 8}`}
          fill={isPass ? '#16a34a' : '#dc2626'}
        />

        {/* 現在位置の縦線 */}
        <line
          x1={uaX} y1={topPad + 8}
          x2={uaX} y2={topPad + barHeight}
          stroke={isPass ? '#16a34a' : '#dc2626'}
          strokeWidth="2"
          strokeDasharray="3,2"
        />
      </svg>
    </div>
  );
}
