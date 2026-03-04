import type { Orientation } from '../types';

/**
 * Orientation coefficients (pyhees section3_2_c, Appendix C).
 */

const ORIENTATION_ALIASES: Record<string, Orientation> = {
  TOP: 'TOP',
  Top: 'TOP',
  top: 'TOP',
  '上面': 'TOP',
  N: 'N',
  n: 'N',
  '北': 'N',
  NE: 'NE',
  ne: 'NE',
  '北東': 'NE',
  E: 'E',
  e: 'E',
  '東': 'E',
  SE: 'SE',
  se: 'SE',
  '南東': 'SE',
  S: 'S',
  s: 'S',
  '南': 'S',
  SW: 'SW',
  sw: 'SW',
  '南西': 'SW',
  W: 'W',
  w: 'W',
  '西': 'W',
  NW: 'NW',
  nw: 'NW',
  '北西': 'NW',
  BOTTOM: 'BOTTOM',
  Bottom: 'BOTTOM',
  bottom: 'BOTTOM',
  '下面': 'BOTTOM',
};

export function normalizeOrientation(orientation?: string): Orientation {
  if (!orientation) return 'N';
  return ORIENTATION_ALIASES[orientation] || 'N';
}

export type OrientationCoeffRow = Record<Orientation, number | null>;

// pyhees section3_2_c table_1 (heating season coefficients)
const HEATING_TABLE: Record<number, OrientationCoeffRow> = {
  1: { TOP: 1.0, N: 0.260, NE: 0.333, E: 0.564, SE: 0.823, S: 0.935, SW: 0.790, W: 0.535, NW: 0.325, BOTTOM: 0.0 },
  2: { TOP: 1.0, N: 0.263, NE: 0.341, E: 0.554, SE: 0.766, S: 0.856, SW: 0.753, W: 0.544, NW: 0.341, BOTTOM: 0.0 },
  3: { TOP: 1.0, N: 0.284, NE: 0.348, E: 0.540, SE: 0.751, S: 0.851, SW: 0.750, W: 0.542, NW: 0.351, BOTTOM: 0.0 },
  4: { TOP: 1.0, N: 0.256, NE: 0.330, E: 0.531, SE: 0.724, S: 0.815, SW: 0.723, W: 0.527, NW: 0.326, BOTTOM: 0.0 },
  5: { TOP: 1.0, N: 0.238, NE: 0.310, E: 0.568, SE: 0.846, S: 0.983, SW: 0.815, W: 0.538, NW: 0.297, BOTTOM: 0.0 },
  6: { TOP: 1.0, N: 0.261, NE: 0.325, E: 0.579, SE: 0.833, S: 0.936, SW: 0.763, W: 0.523, NW: 0.317, BOTTOM: 0.0 },
  7: { TOP: 1.0, N: 0.227, NE: 0.281, E: 0.543, SE: 0.843, S: 1.023, SW: 0.848, W: 0.548, NW: 0.284, BOTTOM: 0.0 },
  8: { TOP: null, N: null, NE: null, E: null, SE: null, S: null, SW: null, W: null, NW: null, BOTTOM: null },
};

// pyhees section3_2_c table_2 (cooling season coefficients)
const COOLING_TABLE: Record<number, OrientationCoeffRow> = {
  1: { TOP: 1.0, N: 0.329, NE: 0.430, E: 0.545, SE: 0.560, S: 0.502, SW: 0.526, W: 0.508, NW: 0.411, BOTTOM: 0.0 },
  2: { TOP: 1.0, N: 0.341, NE: 0.412, E: 0.503, SE: 0.527, S: 0.507, SW: 0.548, W: 0.529, NW: 0.428, BOTTOM: 0.0 },
  3: { TOP: 1.0, N: 0.335, NE: 0.390, E: 0.468, SE: 0.487, S: 0.476, SW: 0.550, W: 0.553, NW: 0.447, BOTTOM: 0.0 },
  4: { TOP: 1.0, N: 0.322, NE: 0.426, E: 0.518, SE: 0.508, S: 0.437, SW: 0.481, W: 0.481, NW: 0.401, BOTTOM: 0.0 },
  5: { TOP: 1.0, N: 0.373, NE: 0.437, E: 0.500, SE: 0.500, S: 0.472, SW: 0.520, W: 0.518, NW: 0.442, BOTTOM: 0.0 },
  6: { TOP: 1.0, N: 0.341, NE: 0.431, E: 0.512, SE: 0.498, S: 0.434, SW: 0.491, W: 0.504, NW: 0.427, BOTTOM: 0.0 },
  7: { TOP: 1.0, N: 0.307, NE: 0.415, E: 0.509, SE: 0.490, S: 0.412, SW: 0.479, W: 0.495, NW: 0.406, BOTTOM: 0.0 },
  8: { TOP: 1.0, N: 0.325, NE: 0.414, E: 0.515, SE: 0.528, S: 0.480, SW: 0.517, W: 0.505, NW: 0.411, BOTTOM: 0.0 },
};

function getRegion(region?: number): number {
  const num = Number(region);
  return num >= 1 && num <= 8 ? num : 6;
}

export function getOrientationCoefficients(region?: number, season: 'cooling' | 'heating' = 'cooling'): OrientationCoeffRow {
  const safeRegion = getRegion(region);
  const table = season === 'heating' ? HEATING_TABLE : COOLING_TABLE;
  return { ...table[safeRegion] };
}

export function getOrientationCoefficient(
  region: number | undefined,
  season: 'cooling' | 'heating',
  orientation?: string,
): number | null {
  return getOrientationCoefficients(region, season)[normalizeOrientation(orientation)];
}

export const ORIENTATION_COEFF_TABLE = {
  cooling: COOLING_TABLE,
  heating: HEATING_TABLE,
};
