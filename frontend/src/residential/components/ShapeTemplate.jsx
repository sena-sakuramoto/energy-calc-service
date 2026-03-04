import { useState } from 'react';

function wall(id, orientation, width, height) {
  return {
    id,
    orientation,
    input_method: 'dimensions',
    width,
    height,
    insulation_type: 'hgw16k',
    insulation_thickness: 105,
    adjacency: 'exterior',
  };
}

function createRectangular({ width, depth, totalHeight }) {
  return [
    wall(`wall_n_${Date.now()}`, 'N', width, totalHeight),
    wall(`wall_e_${Date.now()}`, 'E', depth, totalHeight),
    wall(`wall_s_${Date.now()}`, 'S', width, totalHeight),
    wall(`wall_w_${Date.now()}`, 'W', depth, totalHeight),
  ];
}

function createLShape({ width, depth, totalHeight }) {
  const wingW = width / 2;
  const wingD = depth / 2;
  return [
    wall(`l_n1_${Date.now()}`, 'N', width, totalHeight),
    wall(`l_e1_${Date.now()}`, 'E', depth, totalHeight),
    wall(`l_s1_${Date.now()}`, 'S', wingW, totalHeight),
    wall(`l_w1_${Date.now()}`, 'W', wingD, totalHeight),
    wall(`l_s2_${Date.now()}`, 'S', wingW, totalHeight),
    wall(`l_w2_${Date.now()}`, 'W', wingD, totalHeight),
  ];
}

function createShedShape({ width, depth, totalHeight }) {
  return [
    wall(`shed_n_${Date.now()}`, 'N', width, totalHeight),
    wall(`shed_e_${Date.now()}`, 'E', depth, totalHeight),
    wall(`shed_s1_${Date.now()}`, 'S', width * 0.7, totalHeight),
    wall(`shed_s2_${Date.now()}`, 'S', width * 0.3, totalHeight * 0.7),
    wall(`shed_w_${Date.now()}`, 'W', depth, totalHeight),
  ];
}

function createUShape({ width, depth, totalHeight }) {
  const wing = width / 3;
  const notch = depth / 2;
  return [
    wall(`u_n1_${Date.now()}`, 'N', wing, totalHeight),
    wall(`u_n2_${Date.now()}`, 'N', wing, totalHeight),
    wall(`u_e_${Date.now()}`, 'E', depth, totalHeight),
    wall(`u_w_${Date.now()}`, 'W', depth, totalHeight),
    wall(`u_s1_${Date.now()}`, 'S', wing, totalHeight),
    wall(`u_s2_${Date.now()}`, 'S', wing, totalHeight),
    wall(`u_inner_e_${Date.now()}`, 'E', notch, totalHeight),
    wall(`u_inner_w_${Date.now()}`, 'W', notch, totalHeight),
  ];
}

export default function ShapeTemplate({ onApply }) {
  const [template, setTemplate] = useState('rect');
  const [width, setWidth] = useState(9.0);
  const [depth, setDepth] = useState(6.0);
  const [height1, setHeight1] = useState(2.7);
  const [height2, setHeight2] = useState(2.7);

  const applyTemplate = () => {
    const totalHeight = Number(height1 || 0) + Number(height2 || 0);
    const safeWidth = Number(width || 0);
    const safeDepth = Number(depth || 0);

    let walls = [];
    let roofAreaFactor = 1.0;

    if (template === 'rect') {
      walls = createRectangular({ width: safeWidth, depth: safeDepth, totalHeight });
    } else if (template === 'l_shape') {
      walls = createLShape({ width: safeWidth, depth: safeDepth, totalHeight });
      roofAreaFactor = 1.05;
    } else if (template === 'shed') {
      walls = createShedShape({ width: safeWidth, depth: safeDepth, totalHeight });
      roofAreaFactor = 1.15;
    } else if (template === 'u_shape') {
      walls = createUShape({ width: safeWidth, depth: safeDepth, totalHeight });
      roofAreaFactor = 1.1;
    } else {
      return;
    }

    const floorArea = safeWidth * safeDepth;
    const roofArea = floorArea * roofAreaFactor;
    const foundationLength = (safeWidth + safeDepth) * 2;

    onApply({
      walls,
      roof: { area: Number(roofArea.toFixed(2)), u_value: 0.24, adjacency: 'exterior' },
      floor: { area: Number(floorArea.toFixed(2)), u_value: 0.48, adjacency: 'underfloor' },
      foundation: { length: Number(foundationLength.toFixed(2)), psi_value: 0.6, h_value: 0.7 },
      stories: 2,
      a_a: Number((floorArea * 2).toFixed(2)),
    });
  };

  return (
    <div className="bg-white border border-warm-200 rounded-xl p-4 space-y-4">
      <h3 className="text-sm md:text-base font-semibold text-primary-700">形状テンプレート</h3>

      <div className="grid md:grid-cols-5 gap-2">
        <button type="button" className={`px-3 py-2 rounded-lg border text-sm ${template === 'rect' ? 'bg-primary-700 text-white border-primary-700' : 'bg-white border-warm-200 text-primary-700'}`} onClick={() => setTemplate('rect')}>整形（総2階）</button>
        <button type="button" className={`px-3 py-2 rounded-lg border text-sm ${template === 'l_shape' ? 'bg-primary-700 text-white border-primary-700' : 'bg-white border-warm-200 text-primary-700'}`} onClick={() => setTemplate('l_shape')}>L型</button>
        <button type="button" className={`px-3 py-2 rounded-lg border text-sm ${template === 'shed' ? 'bg-primary-700 text-white border-primary-700' : 'bg-white border-warm-200 text-primary-700'}`} onClick={() => setTemplate('shed')}>下屋付き</button>
        <button type="button" className={`px-3 py-2 rounded-lg border text-sm ${template === 'u_shape' ? 'bg-primary-700 text-white border-primary-700' : 'bg-white border-warm-200 text-primary-700'}`} onClick={() => setTemplate('u_shape')}>コの字型</button>
        <button type="button" className={`px-3 py-2 rounded-lg border text-sm ${template === 'manual' ? 'bg-primary-700 text-white border-primary-700' : 'bg-white border-warm-200 text-primary-700'}`} onClick={() => setTemplate('manual')}>手動入力</button>
      </div>

      {template !== 'manual' && (
        <>
          <div className="grid md:grid-cols-4 gap-3">
            <label className="text-xs md:text-sm">
              間口 (m)
              <input type="number" step="0.1" className="input-field mt-1" value={width} onChange={(e) => setWidth(Number(e.target.value || 0))} />
            </label>
            <label className="text-xs md:text-sm">
              奥行 (m)
              <input type="number" step="0.1" className="input-field mt-1" value={depth} onChange={(e) => setDepth(Number(e.target.value || 0))} />
            </label>
            <label className="text-xs md:text-sm">
              1F階高 (m)
              <input type="number" step="0.1" className="input-field mt-1" value={height1} onChange={(e) => setHeight1(Number(e.target.value || 0))} />
            </label>
            <label className="text-xs md:text-sm">
              2F階高 (m)
              <input type="number" step="0.1" className="input-field mt-1" value={height2} onChange={(e) => setHeight2(Number(e.target.value || 0))} />
            </label>
          </div>
          <button type="button" className="btn-secondary" onClick={applyTemplate}>壁セグメントを自動生成</button>
        </>
      )}
    </div>
  );
}
