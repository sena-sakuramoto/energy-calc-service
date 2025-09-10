// frontend/src/utils/number.js
// Shared numeric formatting helpers

/**
 * Format BEI value per spec:
 * - Ceil at 3rd decimal place
 * - Display with 2 decimals
 * @param {number} value
 * @param {boolean} asNumber If true, return Number instead of string
 * @returns {string|number|null}
 */
export function formatBEI(value, asNumber = false) {
  const v = Number(value);
  if (!Number.isFinite(v)) return null;
  const up3 = Math.ceil(v * 1000) / 1000; // ceil at 3rd decimal
  const s = up3.toFixed(2); // 2 decimals
  return asNumber ? Number(s) : s;
}

