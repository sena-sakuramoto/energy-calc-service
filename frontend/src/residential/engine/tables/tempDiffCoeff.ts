/**
 * Temperature difference coefficients (pyhees section3_2_b, table_1).
 */

export const TEMP_DIFF_COEFF_TABLE = {
  outside: 1.0,
  close: 0.7,
  separator_zero: 0.0,
  separator_region_1_3: 0.05,
  separator_region_4_8: 0.15,
} as const;

const ADJACENCY_ALIASES: Record<string, 'outside' | 'close' | 'separator_zero' | 'separator'> = {
  // pyhees labels
  '外気': 'outside',
  '外気に通じる空間': 'outside',
  '外気・外気に通じる空間': 'outside',
  '外気に通じていない空間・外気に通じる床裏': 'close',
  '住戸（温度差係数を0とする要件を満たす場合）': 'separator_zero',
  '住戸及び住戸と同様の熱的環境の空間・外気に通じていない床裏': 'separator',

  // app aliases
  exterior: 'outside',
  outside: 'outside',
  open: 'outside',
  connected: 'outside',
  unheated_space: 'close',
  underfloor: 'close',
  ground: 'close',
  separator_zero: 'separator_zero',
  separator: 'separator',
};

function normalizeAdjacency(adjacency?: string): 'outside' | 'close' | 'separator_zero' | 'separator' {
  if (!adjacency) return 'outside';
  return ADJACENCY_ALIASES[adjacency] || 'outside';
}

function normalizeRegion(region?: number): number {
  const num = Number(region);
  if (num >= 1 && num <= 8) return num;
  return 6;
}

export function getTempDiffCoeff(adjacency?: string, region = 6): number {
  const kind = normalizeAdjacency(adjacency);

  if (kind === 'outside') return TEMP_DIFF_COEFF_TABLE.outside;
  if (kind === 'close') return TEMP_DIFF_COEFF_TABLE.close;
  if (kind === 'separator_zero') return TEMP_DIFF_COEFF_TABLE.separator_zero;

  const safeRegion = normalizeRegion(region);
  if (kind === 'separator') {
    return safeRegion <= 3
      ? TEMP_DIFF_COEFF_TABLE.separator_region_1_3
      : TEMP_DIFF_COEFF_TABLE.separator_region_4_8;
  }

  return TEMP_DIFF_COEFF_TABLE.outside;
}
