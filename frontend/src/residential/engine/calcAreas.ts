import { ORIENTATIONS } from './types';

import type { AreaRow, AreaSummary, Opening, WallSegment, WallOrientation } from './types';

function round(value: number, digits = 2): number {
  const p = 10 ** digits;
  return Math.round((Number(value) + Number.EPSILON) * p) / p;
}

function calcWallGrossArea(wall: Partial<WallSegment>): number {
  if (wall.input_method === 'direct_area') {
    return Number(wall.area_gross || 0);
  }
  return Number(wall.width || 0) * Number(wall.height || 0);
}

function calcOpeningArea(opening: Partial<Opening>): number {
  return Number(opening.width || 0) * Number(opening.height || 0) * Number(opening.quantity || 1);
}

export function calcEnvelopeAreasFromSegments(
  { walls = [], openings = [] }: { walls?: Partial<WallSegment>[]; openings?: Partial<Opening>[] },
): AreaSummary {
  const by_orientation = Object.fromEntries(
    ORIENTATIONS.map((orientation) => [orientation, { gross: 0, openings: 0, net: 0 }]),
  ) as Record<WallOrientation, AreaRow>;

  walls.forEach((wall) => {
    const key = wall.orientation as WallOrientation;
    if (!key || !by_orientation[key]) return;
    by_orientation[key].gross += calcWallGrossArea(wall);
  });

  openings.forEach((opening) => {
    const key = opening.orientation as WallOrientation;
    if (!key || !by_orientation[key]) return;
    by_orientation[key].openings += calcOpeningArea(opening);
  });

  let gross_total = 0;
  let opening_total = 0;
  let net_total = 0;

  ORIENTATIONS.forEach((orientation) => {
    const row = by_orientation[orientation];
    row.gross = round(row.gross, 2);
    row.openings = round(row.openings, 2);
    row.net = round(Math.max(row.gross - row.openings, 0), 2);

    gross_total += row.gross;
    opening_total += row.openings;
    net_total += row.net;
  });

  return {
    by_orientation,
    gross_total: round(gross_total, 2),
    opening_total: round(opening_total, 2),
    net_total: round(net_total, 2),
  };
}
