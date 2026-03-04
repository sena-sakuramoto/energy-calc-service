"""Tests for residential front-end calc engine modules."""

from pathlib import Path
import subprocess

REPO_ROOT = Path(__file__).resolve().parents[1]


def run_node(script: str) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        ["./frontend/node_modules/.bin/tsx", "--eval", script],
        text=True,
        capture_output=True,
        cwd=REPO_ROOT,
        check=False,
    )


def test_calc_ua_and_eta_ac_match_expected_values() -> None:
    script = r"""
import { calcUA, evaluateGradeByRegion } from './frontend/src/residential/engine/calcUA';
import { calcEtaAC } from './frontend/src/residential/engine/calcEtaAC';

const envelope = {
  region: 6,
  a_env: 145,
  a_a: 54,
  parts: [
    { type: 'wall', orientation: 'N', area: 60, u_value: 1.0, h_value: 1.0 },
    { type: 'roof', orientation: 'TOP', area: 20, u_value: 0.5, h_value: 1.0 },
    { type: 'floor', orientation: 'BOTTOM', area: 20, u_value: 0.65, h_value: 1.0 },
    { type: 'foundation', orientation: 'BOTTOM', area: 0, u_value: 0, h_value: 1.0, psi_value: 0.4, length: 10 },
    { type: 'window', orientation: 'S', area: 20, u_value: 1.31, h_value: 1.0, eta_d_C: 0.4 },
    { type: 'window', orientation: 'E', area: 10, u_value: 1.31, h_value: 1.0, eta_d_C: 0.4 },
  ],
};

const ua = calcUA(envelope);
if (ua !== 0.87) {
  throw new Error(`UA mismatch: ${ua}`);
}

const grade = evaluateGradeByRegion(ua, 6);
if (grade.grade !== 4 || grade.zeh_ok !== false) {
  throw new Error(`Grade mismatch: ${JSON.stringify(grade)}`);
}

const etaAC = calcEtaAC(envelope);
if (etaAC !== 3.5) {
  throw new Error(`etaAC mismatch: ${etaAC}`);
}
console.log('ok');
"""
    result = run_node(script)
    assert result.returncode == 0, result.stderr or result.stdout


def test_calc_areas_and_opening_lookup() -> None:
    script = r"""
import { calcEnvelopeAreasFromSegments } from './frontend/src/residential/engine/calcAreas';
import { resolveOpeningThermalSpec } from './frontend/src/residential/engine/tables/windowCombination';

const walls = [
  { id: 'w1', orientation: 'N', input_method: 'dimensions', width: 8.0, height: 5.4, insulation_type: 'hgw16k', insulation_thickness: 105, adjacency: 'exterior' },
  { id: 'w2', orientation: 'S', input_method: 'dimensions', width: 8.0, height: 5.4, insulation_type: 'hgw16k', insulation_thickness: 105, adjacency: 'exterior' },
];
const openings = [
  { id: 'o1', symbol: 'W-1', type: 'window', orientation: 'N', width: 1.6, height: 1.2, quantity: 2, sash_type: 'resin', glass_type: 'double_lowe_a12', u_value: 2.33, eta_d_H: 0.52, eta_d_C: 0.37 },
];

const area = calcEnvelopeAreasFromSegments({ walls, openings });
if (area.by_orientation.N.gross !== 43.2 || area.by_orientation.N.openings !== 3.84 || area.by_orientation.N.net !== 39.36) {
  throw new Error(`Area mismatch: ${JSON.stringify(area.by_orientation.N)}`);
}

const specFromCombo = resolveOpeningThermalSpec({ sash_type: 'resin', glass_type: 'double_lowe_a12' });
if (specFromCombo.u_value !== 2.33) {
  throw new Error(`Window combo mismatch: ${JSON.stringify(specFromCombo)}`);
}

const specFromProduct = resolveOpeningThermalSpec({ product_id: 'apw430_std', sash_type: 'resin', glass_type: 'double_lowe_a12' });
if (specFromProduct.u_value !== 0.9) {
  throw new Error(`Product lookup mismatch: ${JSON.stringify(specFromProduct)}`);
}

console.log('ok');
"""
    result = run_node(script)
    assert result.returncode == 0, result.stderr or result.stdout


def test_compute_residential_result_builds_envelope_input() -> None:
    script = r"""
import { computeResidentialResult } from './frontend/src/residential/engine/buildEnvelope';

const project = {
  id: 'p1',
  name: 'test',
  region: 6,
  structure: 'wood_conventional',
  stories: 2,
  walls: [
    { id: 'w1', orientation: 'N', input_method: 'dimensions', width: 8.0, height: 5.4, insulation_type: 'hgw16k', insulation_thickness: 105, adjacency: 'exterior' },
    { id: 'w2', orientation: 'S', input_method: 'dimensions', width: 8.0, height: 5.4, insulation_type: 'hgw16k', insulation_thickness: 105, adjacency: 'exterior' },
  ],
  openings: [
    { id: 'o1', symbol: 'W-1', type: 'window', orientation: 'S', width: 1.6, height: 1.2, quantity: 2, sash_type: 'resin', glass_type: 'double_lowe_a12', product_id: 'apw330_std' },
  ],
  roof: { area: 54.0, u_value: 0.24, adjacency: 'exterior' },
  ceiling: null,
  floor: { area: 54.0, u_value: 0.48, adjacency: 'underfloor' },
  foundation: { length: 30.0, psi_value: 0.6, h_value: 0.7 },
};

const result = computeResidentialResult(project);
if (!result || typeof result.ua_value !== 'number' || typeof result.eta_a_c !== 'number') {
  throw new Error(`Invalid result: ${JSON.stringify(result)}`);
}
if (result.window_cost_total <= 0) {
  throw new Error(`Invalid window cost total: ${result.window_cost_total}`);
}
if (!result.envelope_input || result.envelope_input.parts.length === 0) {
  throw new Error(`Envelope input missing: ${JSON.stringify(result)}`);
}
console.log('ok');
"""
    result = run_node(script)
    assert result.returncode == 0, result.stderr or result.stdout


def test_round_half_up_matches_python_round_half_up_behavior() -> None:
    script = r"""
import { roundHalfUp } from './frontend/src/residential/engine/calcUA';

const cases = [
  [1.005, 2, 1.01],
  [2.675, 2, 2.68],
  [-1.005, 2, -1.01],
  [-2.675, 2, -2.68],
  [0.045, 2, 0.05],
];

for (const [value, digits, expected] of cases) {
  const actual = roundHalfUp(value, digits);
  if (actual !== expected) {
    throw new Error(`roundHalfUp mismatch value=${value} digits=${digits}: actual=${actual} expected=${expected}`);
  }
}
console.log('ok');
"""
    result = run_node(script)
    assert result.returncode == 0, result.stderr or result.stdout


def test_orientation_and_temp_diff_coeff_match_pyhees_table_values() -> None:
    script = r"""
import { getOrientationCoefficients } from './frontend/src/residential/engine/tables/orientationCoeff';
import { getTempDiffCoeff } from './frontend/src/residential/engine/tables/tempDiffCoeff';

const cool6 = getOrientationCoefficients(6, 'cooling');
if (cool6.S !== 0.434 || cool6.E !== 0.512 || cool6.N !== 0.341 || cool6.TOP !== 1.0 || cool6.BOTTOM !== 0.0) {
  throw new Error(`Cooling coeff mismatch region6: ${JSON.stringify(cool6)}`);
}

const heat6 = getOrientationCoefficients(6, 'heating');
if (heat6.S !== 0.936 || heat6.N !== 0.261 || heat6.TOP !== 1.0 || heat6.BOTTOM !== 0.0) {
  throw new Error(`Heating coeff mismatch region6: ${JSON.stringify(heat6)}`);
}

const cool8 = getOrientationCoefficients(8, 'cooling');
if (cool8.S !== 0.48 || cool8.NW !== 0.411) {
  throw new Error(`Cooling coeff mismatch region8: ${JSON.stringify(cool8)}`);
}

if (getTempDiffCoeff('exterior', 6) !== 1.0) throw new Error('H exterior mismatch');
if (getTempDiffCoeff('unheated_space', 6) !== 0.7) throw new Error('H unheated_space mismatch');
if (getTempDiffCoeff('separator_zero', 6) !== 0.0) throw new Error('H separator_zero mismatch');
if (getTempDiffCoeff('separator', 2) !== 0.05) throw new Error('H separator (region2) mismatch');
if (getTempDiffCoeff('separator', 6) !== 0.15) throw new Error('H separator (region6) mismatch');
console.log('ok');
"""
    result = run_node(script)
    assert result.returncode == 0, result.stderr or result.stdout


def test_calc_eta_ac_uses_pyhees_orientation_coefficients() -> None:
    script = r"""
import { calcEtaAC } from './frontend/src/residential/engine/calcEtaAC';

const envelope = {
  region: 6,
  a_env: 145,
  a_a: 54,
  parts: [
    { type: 'window', orientation: 'S', area: 20, u_value: 1.31, h_value: 1.0, eta_d_C: 0.4 },
    { type: 'window', orientation: 'E', area: 10, u_value: 1.31, h_value: 1.0, eta_d_C: 0.4 },
  ],
};

const etaAC = calcEtaAC(envelope);
if (etaAC !== 3.5) {
  throw new Error(`etaAC mismatch with pyhees coeff: ${etaAC}`);
}
console.log('ok');
"""
    result = run_node(script)
    assert result.returncode == 0, result.stderr or result.stdout
