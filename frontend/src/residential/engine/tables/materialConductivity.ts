/**
 * Material thermal conductivity [W/(m*K)] lookup.
 */

export const MATERIAL_CONDUCTIVITY: Record<string, number> = {
  hgw10k: 0.05,
  hgw16k: 0.045,
  hgw24k: 0.038,
  hgw32k: 0.035,
  rw: 0.038,
  cellulose: 0.04,
  xps1: 0.024,
  xps2: 0.028,
  xps3: 0.034,
  eps: 0.038,
  urethane_board: 0.024,
  urethane_spray: 0.028,
  phenol: 0.02,
  wood_fiber: 0.05,
  concrete: 1.6,
  mortar: 1.15,
  gypsum_board: 0.22,
  plywood: 0.16,
  osb: 0.13,
  steel: 55.0,
  aluminum: 210.0,
  glass: 1.0,
  air_layer: 0.024,
};

export function getMaterialConductivity(materialType?: string): number {
  if (!materialType) return MATERIAL_CONDUCTIVITY.hgw16k;
  return MATERIAL_CONDUCTIVITY[materialType] ?? MATERIAL_CONDUCTIVITY.hgw16k;
}
