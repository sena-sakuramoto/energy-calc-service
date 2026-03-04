import { roundHalfUp } from './calcUA';
import { getOrientationCoefficients, normalizeOrientation } from './tables/orientationCoeff';

import type { EnvelopeInput } from './types';

export function calcEtaAC(input: EnvelopeInput): number {
  if (!input || !Array.isArray(input.parts) || !Number(input.a_env)) {
    return 0;
  }

  const nuTable = getOrientationCoefficients(input.region, 'cooling');
  let sumMc = 0;

  input.parts.forEach((part) => {
    if (part.eta_d_C === undefined || part.eta_d_C === null) return;

    const coeff = nuTable[normalizeOrientation(part.orientation)];
    const nu = Number.isFinite(coeff) ? Number(coeff) : 0;
    if (nu <= 0) return;
    const fC = 0.93;
    sumMc += Number(part.area || 0) * Number(part.eta_d_C) * fC * nu;
  });

  return roundHalfUp((sumMc / Number(input.a_env)) * 100, 1);
}

export function calcEtaAH(input: EnvelopeInput): number {
  if (!input || !Array.isArray(input.parts) || !Number(input.a_env)) {
    return 0;
  }

  const nuTable = getOrientationCoefficients(input.region, 'heating');
  let sumMh = 0;

  input.parts.forEach((part) => {
    if (part.eta_d_H === undefined || part.eta_d_H === null) return;

    const coeff = nuTable[normalizeOrientation(part.orientation)];
    const nu = Number.isFinite(coeff) ? Number(coeff) : 0;
    if (nu <= 0) return;
    const fH = 0.96;
    sumMh += Number(part.area || 0) * Number(part.eta_d_H) * fH * nu;
  });

  return roundHalfUp((sumMh / Number(input.a_env)) * 100, 1);
}
