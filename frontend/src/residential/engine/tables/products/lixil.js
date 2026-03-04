export const LIXIL_PRODUCTS = [
  {
    id: 'lixil_ew_std',
    name: 'LIXIL EW',
    series: 'EW',
    sash_type: 'resin',
    glass_type: 'double_lowe_a12',
    u_value: 1.31,
    eta_d_h: 0.47,
    eta_d_c: 0.34,
    cost_per_m2: 43000,
    sizes: [
      { code: '16520', w: 1650, h: 2000, cost: 82000 },
      { code: '11913', w: 1190, h: 1370, cost: 59000 },
    ],
  },
  {
    id: 'lixil_tw_hi',
    name: 'LIXIL TW',
    series: 'TW',
    sash_type: 'resin',
    glass_type: 'triple_lowe_a9x2',
    u_value: 0.79,
    eta_d_h: 0.35,
    eta_d_c: 0.25,
    cost_per_m2: 76000,
    sizes: [
      { code: '16520', w: 1650, h: 2000, cost: 105000 },
      { code: '11913', w: 1190, h: 1370, cost: 78000 },
    ],
  },
];
