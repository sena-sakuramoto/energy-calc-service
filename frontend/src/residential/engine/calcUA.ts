import type { EnvelopeInput } from './types';

const GRADE_THRESHOLDS: Record<number, Record<4 | 5 | 6 | 7, number>> = {
  1: { 4: 0.46, 5: 0.4, 6: 0.28, 7: 0.2 },
  2: { 4: 0.46, 5: 0.4, 6: 0.28, 7: 0.2 },
  3: { 4: 0.56, 5: 0.5, 6: 0.28, 7: 0.2 },
  4: { 4: 0.75, 5: 0.6, 6: 0.34, 7: 0.23 },
  5: { 4: 0.87, 5: 0.6, 6: 0.46, 7: 0.26 },
  6: { 4: 0.87, 5: 0.6, 6: 0.46, 7: 0.26 },
  7: { 4: 0.87, 5: 0.6, 6: 0.46, 7: 0.26 },
  8: { 4: 0.87, 5: 0.6, 6: 0.46, 7: 0.26 },
};

export function roundHalfUp(value: number, digits = 2): number {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0;

  // Decimal shift via exponential notation to reduce binary floating-point drift.
  const shifted = Number(`${numeric}e${digits}`);
  if (!Number.isFinite(shifted)) return 0;

  const rounded = shifted >= 0
    ? Math.floor(shifted + 0.5)
    : Math.ceil(shifted - 0.5);

  return Number(`${rounded}e-${digits}`);
}

export function calcUA(input: EnvelopeInput): number {
  if (!input || !Array.isArray(input.parts) || !Number(input.a_env)) {
    return 0;
  }

  let sum_q = 0;
  input.parts.forEach((part) => {
    if (part.type === 'foundation' && part.psi_value != null && part.length != null) {
      sum_q += Number(part.psi_value) * Number(part.length) * Number(part.h_value ?? 1);
      return;
    }

    sum_q += Number(part.area || 0) * Number(part.u_value || 0) * Number(part.h_value ?? 1);
  });

  return roundHalfUp(sum_q / Number(input.a_env), 2);
}

export function evaluateGradeByRegion(
  uaValue: number,
  region: number,
): { grade: 4 | 5 | 6 | 7 | null; zeh_ok: boolean; thresholds: Record<4 | 5 | 6 | 7, number> } {
  const safeRegion = Number(region) >= 1 && Number(region) <= 8 ? Number(region) : 6;
  const threshold = GRADE_THRESHOLDS[safeRegion] || GRADE_THRESHOLDS[6];
  const ua = Number(uaValue || 0);

  let grade: 4 | 5 | 6 | 7 | null = null;
  if (ua <= threshold[7]) grade = 7;
  else if (ua <= threshold[6]) grade = 6;
  else if (ua <= threshold[5]) grade = 5;
  else if (ua <= threshold[4]) grade = 4;

  return {
    grade,
    zeh_ok: ua <= threshold[5],
    thresholds: threshold,
  };
}
