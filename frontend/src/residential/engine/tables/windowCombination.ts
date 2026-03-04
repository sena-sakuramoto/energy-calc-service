import { LIXIL_PRODUCTS } from './products/lixil.js';
import { YKKAP_PRODUCTS } from './products/ykkap.js';

import type { Opening, OpeningThermalSpec, ProductSpec } from '../types';

interface WindowCombo {
  u: number;
  eta_d_h: number;
  eta_d_c: number;
}

export const WINDOW_TABLE: Record<string, Record<string, WindowCombo>> = {
  metal: {
    single: { u: 6.51, eta_d_h: 0.79, eta_d_c: 0.79 },
    double: { u: 4.65, eta_d_h: 0.73, eta_d_c: 0.73 },
    double_lowe_a12: { u: 3.49, eta_d_h: 0.59, eta_d_c: 0.41 },
  },
  metal_resin: {
    double: { u: 3.49, eta_d_h: 0.68, eta_d_c: 0.52 },
    double_lowe_a12: { u: 2.91, eta_d_h: 0.56, eta_d_c: 0.4 },
    triple_lowe_a9x2: { u: 1.9, eta_d_h: 0.4, eta_d_c: 0.29 },
  },
  resin: {
    double_lowe_a12: { u: 2.33, eta_d_h: 0.52, eta_d_c: 0.37 },
    double_lowe_a16: { u: 1.87, eta_d_h: 0.49, eta_d_c: 0.35 },
    triple_lowe_a9x2: { u: 1.6, eta_d_h: 0.36, eta_d_c: 0.26 },
    triple_lowe_kr_a11x2: { u: 1.31, eta_d_h: 0.34, eta_d_c: 0.24 },
  },
  wood: {
    double_lowe_a12: { u: 2.33, eta_d_h: 0.52, eta_d_c: 0.37 },
    triple_lowe_a9x2: { u: 1.6, eta_d_h: 0.36, eta_d_c: 0.26 },
  },
};

export const PRODUCT_TABLE: ProductSpec[] = [...(YKKAP_PRODUCTS as ProductSpec[]), ...(LIXIL_PRODUCTS as ProductSpec[])];

export function getProductById(productId?: string): ProductSpec | null {
  if (!productId) return null;
  return PRODUCT_TABLE.find((product) => product.id === productId) || null;
}

export function resolveOpeningThermalSpec(opening: Partial<Opening>): OpeningThermalSpec {
  const product = getProductById(opening.product_id);
  if (product) {
    return {
      source: 'product',
      product,
      u_value: product.u_value,
      eta_d_H: product.eta_d_h,
      eta_d_C: product.eta_d_c,
      cost_per_m2: product.cost_per_m2,
    };
  }

  const frameTable = WINDOW_TABLE[opening.sash_type || ''] || {};
  const combo = frameTable[opening.glass_type || ''];
  if (!combo) {
    return {
      source: 'fallback',
      u_value: 3.49,
      eta_d_H: 0.59,
      eta_d_C: 0.41,
      cost_per_m2: undefined,
    };
  }

  return {
    source: 'combination',
    u_value: combo.u,
    eta_d_H: combo.eta_d_h,
    eta_d_C: combo.eta_d_c,
    cost_per_m2: undefined,
  };
}
