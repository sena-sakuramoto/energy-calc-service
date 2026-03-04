import { calcEnvelopeAreasFromSegments } from './calcAreas';
import { calcEtaAC, calcEtaAH } from './calcEtaAC';
import { calcUA, evaluateGradeByRegion, roundHalfUp } from './calcUA';
import { getMaterialConductivity } from './tables/materialConductivity';
import { getOrientationCoefficients, normalizeOrientation } from './tables/orientationCoeff';
import { getTempDiffCoeff } from './tables/tempDiffCoeff';
import { resolveOpeningThermalSpec } from './tables/windowCombination';

import type {
  EnvelopeInput,
  EnvelopePart,
  Opening,
  OpeningThermalSpec,
  PartDetail,
  ProductSpec,
  ResidentialProject,
  ResidentialResult,
  WallSegment,
} from './types';

function calcWallGrossArea(wall: Partial<WallSegment>): number {
  if (wall.input_method === 'direct_area') {
    return Number(wall.area_gross || 0);
  }
  return Number(wall.width || 0) * Number(wall.height || 0);
}

function calcOpeningArea(opening: Partial<Opening>): number {
  return Number(opening.width || 0) * Number(opening.height || 0) * Number(opening.quantity || 1);
}

function calcWallUValue(wall: Partial<WallSegment>): number {
  if (Number(wall.u_value) > 0) {
    return Number(wall.u_value);
  }

  const lambda = Number(getMaterialConductivity(wall.insulation_type));
  const thicknessM = Math.max(Number(wall.insulation_thickness || 105) / 1000, 0.001);
  if (!Number.isFinite(lambda) || lambda <= 0) {
    return 0.6;
  }

  // Simplified U estimate: U = 1 / (surface resistance + insulation resistance).
  const rIns = thicknessM / lambda;
  const rSurface = 0.15;
  const u = 1 / (rIns + rSurface);
  return roundHalfUp(Math.max(u, 0.1), 2);
}

function pickNearestSizeCost(product: ProductSpec | undefined, opening: Partial<Opening>): number | null {
  if (!product || !Array.isArray(product.sizes) || product.sizes.length === 0) {
    return null;
  }

  const targetW = Number(opening.width || 0) * 1000;
  const targetH = Number(opening.height || 0) * 1000;

  let best: ProductSpec['sizes'][number] | null = null;
  let minDistance = Number.POSITIVE_INFINITY;

  product.sizes.forEach((size) => {
    const dw = targetW - Number(size.w || 0);
    const dh = targetH - Number(size.h || 0);
    const dist = Math.sqrt(dw * dw + dh * dh);
    if (dist < minDistance) {
      minDistance = dist;
      best = size;
    }
  });

  return best?.cost ?? null;
}

function calcOpeningTotalCost(opening: Partial<Opening>, thermalSpec: OpeningThermalSpec): number {
  const quantity = Number(opening.quantity || 1);
  const openingAreaSingle = Number(opening.width || 0) * Number(opening.height || 0);

  if (Number(opening.cost_per_unit) > 0) {
    return Number(opening.cost_per_unit) * quantity;
  }

  if (thermalSpec?.product) {
    const matchedSizeCost = pickNearestSizeCost(thermalSpec.product, opening);
    if (Number(matchedSizeCost) > 0) {
      return Number(matchedSizeCost) * quantity;
    }
  }

  const areaTotal = openingAreaSingle * quantity;
  const costPerM2 = Number(thermalSpec?.cost_per_m2 || 0);
  if (costPerM2 > 0) {
    return areaTotal * costPerM2;
  }

  return 0;
}

export function buildEnvelopeInputFromProject(project: Partial<ResidentialProject>) {
  const region = Number(project?.region || 6);
  const walls = Array.isArray(project?.walls) ? project.walls : [];
  const openings = Array.isArray(project?.openings) ? project.openings : [];
  const areaSummary = calcEnvelopeAreasFromSegments({ walls, openings });

  const parts: EnvelopePart[] = [];
  const byOrientationSegments: Record<string, Partial<WallSegment>[]> = {};

  walls.forEach((wall) => {
    const key = wall.orientation || 'N';
    if (!byOrientationSegments[key]) byOrientationSegments[key] = [];
    byOrientationSegments[key].push(wall);
  });

  Object.entries(areaSummary.by_orientation || {}).forEach(([orientation, areaRow]) => {
    const segments = byOrientationSegments[orientation] || [];
    if (segments.length === 0) return;

    const grossArea = segments.reduce((acc, seg) => acc + calcWallGrossArea(seg), 0);
    if (grossArea <= 0 || areaRow.net <= 0) return;

    let weightedU = 0;
    let weightedH = 0;
    segments.forEach((segment) => {
      const segmentArea = calcWallGrossArea(segment);
      const ratio = segmentArea / grossArea;
      weightedU += calcWallUValue(segment) * ratio;
      weightedH += getTempDiffCoeff(segment.adjacency || 'exterior', region) * ratio;
    });

    parts.push({
      type: 'wall',
      orientation,
      area: roundHalfUp(areaRow.net, 2),
      u_value: roundHalfUp(weightedU, 2),
      h_value: roundHalfUp(weightedH || 1.0, 3),
      adjacency: segments[0]?.adjacency || 'exterior',
    });
  });

  let windowCostTotal = 0;
  openings.forEach((opening) => {
    const thermalSpec = resolveOpeningThermalSpec(opening);
    const area = calcOpeningArea(opening);
    if (area <= 0) return;

    const openingType = opening.type === 'door' ? 'door' : 'window';
    parts.push({
      type: openingType,
      orientation: opening.orientation || 'S',
      area: roundHalfUp(area, 2),
      u_value: Number(thermalSpec.u_value || opening.u_value || 3.49),
      h_value: getTempDiffCoeff('exterior', region),
      adjacency: opening.adjacency || 'exterior',
      sash_type: opening.sash_type,
      glass_type: opening.glass_type,
      eta_d_H: Number(thermalSpec.eta_d_H ?? opening.eta_d_H ?? 0),
      eta_d_C: Number(thermalSpec.eta_d_C ?? opening.eta_d_C ?? 0),
    });

    windowCostTotal += calcOpeningTotalCost(opening, thermalSpec);
  });

  if (project?.roof && Number(project.roof.area) > 0) {
    parts.push({
      type: 'roof',
      orientation: 'TOP',
      area: Number(project.roof.area),
      u_value: Number(project.roof.u_value || 0.24),
      h_value: getTempDiffCoeff(project.roof.adjacency || 'exterior', region),
      adjacency: project.roof.adjacency || 'exterior',
    });
  }

  if (project?.ceiling && Number(project.ceiling.area) > 0) {
    parts.push({
      type: 'ceiling',
      orientation: 'TOP',
      area: Number(project.ceiling.area),
      u_value: Number(project.ceiling.u_value || 0.24),
      h_value: getTempDiffCoeff(project.ceiling.adjacency || 'unheated_space', region),
      adjacency: project.ceiling.adjacency || 'unheated_space',
    });
  }

  if (project?.floor && Number(project.floor.area) > 0) {
    parts.push({
      type: 'floor',
      orientation: 'BOTTOM',
      area: Number(project.floor.area),
      u_value: Number(project.floor.u_value || 0.48),
      h_value: getTempDiffCoeff(project.floor.adjacency || 'underfloor', region),
      adjacency: project.floor.adjacency || 'underfloor',
    });
  }

  if (project?.foundation && Number(project.foundation.length) > 0) {
    parts.push({
      type: 'foundation',
      orientation: 'BOTTOM',
      area: 0,
      u_value: 0,
      h_value: Number(project.foundation.h_value || getTempDiffCoeff('ground', region)),
      psi_value: Number(project.foundation.psi_value || 0.6),
      length: Number(project.foundation.length),
      adjacency: 'ground',
    });
  }

  const aEnv = parts
    .filter((part) => part.type !== 'foundation')
    .reduce((acc, part) => acc + Number(part.area || 0), 0);

  const envelopeInput: EnvelopeInput = {
    region,
    a_env: roundHalfUp(Math.max(aEnv, 0.01), 2),
    a_a: Number(project?.floor?.area || project?.a_a || 1),
    parts,
  };

  return {
    envelopeInput,
    areaSummary,
    windowCostTotal: roundHalfUp(windowCostTotal, 0),
  };
}

export function computeResidentialResult(project: Partial<ResidentialProject>): ResidentialResult {
  const { envelopeInput, areaSummary, windowCostTotal } = buildEnvelopeInputFromProject(project);

  const uaValue = calcUA(envelopeInput);
  const etaAC = calcEtaAC(envelopeInput);
  const etaAH = calcEtaAH(envelopeInput);
  const gradeInfo = evaluateGradeByRegion(uaValue, envelopeInput.region);
  const nuTable = getOrientationCoefficients(envelopeInput.region, 'cooling');

  const partsDetail: PartDetail[] = envelopeInput.parts.map((part) => {
    const heatLoss = part.type === 'foundation'
      ? Number(part.psi_value || 0) * Number(part.length || 0) * Number(part.h_value || 1)
      : Number(part.area || 0) * Number(part.u_value || 0) * Number(part.h_value || 1);

    const orientationCoeff = nuTable[normalizeOrientation(part.orientation)];
    const nuC = Number.isFinite(orientationCoeff) ? Number(orientationCoeff) : 0;
    const solarGainCooling = part.eta_d_C != null
      ? Number(part.area || 0) * Number(part.eta_d_C || 0) * 0.93 * nuC
      : 0;

    return {
      ...part,
      heat_loss: roundHalfUp(heatLoss, 3),
      solar_gain_cooling: roundHalfUp(solarGainCooling, 3),
    };
  });

  return {
    envelope_input: envelopeInput,
    ua_value: uaValue,
    eta_a_c: etaAC,
    eta_a_h: etaAH,
    grade: gradeInfo.grade,
    zeh_ok: gradeInfo.zeh_ok,
    thresholds: gradeInfo.thresholds,
    parts_detail: partsDetail,
    area_summary: areaSummary,
    window_cost_total: windowCostTotal,
  };
}
