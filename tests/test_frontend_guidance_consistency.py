import json
import subprocess
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]

NODE_SCRIPT = r"""
import { typicalEnergyByBuildingType } from './frontend/src/utils/equipmentReference.js';
import { TYPICAL_ENERGY_VALUES, resolveTypeName } from './frontend/src/utils/energyReferences.js';

const categories = ['heating', 'cooling', 'ventilation', 'hot_water', 'lighting', 'elevator'];
const mismatches = [];

for (const [buildingType, guidanceData] of Object.entries(typicalEnergyByBuildingType)) {
  const normalizedType = resolveTypeName(buildingType);
  const evaluationData = TYPICAL_ENERGY_VALUES[normalizedType];
  if (!evaluationData) continue;

  for (const category of categories) {
    const guidanceTypical = guidanceData?.[category]?.typical;
    const evaluationTypical = evaluationData?.[category]?.typical;

    if (!Number.isFinite(guidanceTypical) || !Number.isFinite(evaluationTypical)) continue;

    if (guidanceTypical !== evaluationTypical) {
      mismatches.push({
        buildingType,
        category,
        guidanceTypical,
        evaluationTypical,
      });
    }
  }
}

console.log(JSON.stringify({ mismatchCount: mismatches.length, mismatches: mismatches.slice(0, 20) }));
"""


def test_input_guidance_and_post_calc_evaluation_use_same_typical_values():
    result = subprocess.run(
        ['node', '--input-type=module', '-'],
        input=NODE_SCRIPT,
        text=True,
        capture_output=True,
        cwd=REPO_ROOT,
        check=False,
    )

    assert result.returncode == 0, f"Node script failed:\nstdout={result.stdout}\nstderr={result.stderr}"

    output = result.stdout.strip().splitlines()
    assert output, f"Node script produced no stdout. stderr={result.stderr}"

    payload = json.loads(output[-1])
    assert payload['mismatchCount'] == 0, (
        "入力ガイダンスと計算後評価の目安値が不一致です。"
        f" mismatchCount={payload['mismatchCount']} sample={payload['mismatches']}"
    )
