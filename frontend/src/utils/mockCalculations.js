// frontend/src/utils/mockCalculations.js
// GitHub Pages用モック計算エンジン

const BUILDING_TYPES = {
  office: "事務所等",
  hotel: "ホテル等", 
  hospital: "病院等",
  shop_department: "百貨店等",
  shop_supermarket: "スーパーマーケット",
  school_small: "学校等（小中学校）",
  school_high: "学校等（高等学校）",
  school_university: "学校等（大学）",
  restaurant: "飲食店等",
  assembly: "集会所等",
  factory: "工場等",
  residential_collective: "共同住宅"
};

// 標準エネルギー消費量原単位データ（モデル建物法）
export const STANDARD_INTENSITIES = {
  office: {
    1: { lighting: 70, cooling: 25, heating: 90, ventilation: 28, hot_water: 3, outlet_and_others: 105, elevator: 14, total: 335 },
    2: { lighting: 70, cooling: 26, heating: 76, ventilation: 28, hot_water: 3, outlet_and_others: 105, elevator: 14, total: 322 },
    3: { lighting: 70, cooling: 33, heating: 58, ventilation: 28, hot_water: 3, outlet_and_others: 105, elevator: 14, total: 311 },
    4: { lighting: 70, cooling: 38, heating: 44, ventilation: 28, hot_water: 3, outlet_and_others: 105, elevator: 14, total: 302 },
    5: { lighting: 70, cooling: 41, heating: 41, ventilation: 28, hot_water: 3, outlet_and_others: 105, elevator: 14, total: 302 },
    6: { lighting: 70, cooling: 44, heating: 32, ventilation: 28, hot_water: 3, outlet_and_others: 105, elevator: 14, total: 296 },
    7: { lighting: 70, cooling: 48, heating: 27, ventilation: 28, hot_water: 3, outlet_and_others: 105, elevator: 14, total: 295 },
    8: { lighting: 70, cooling: 51, heating: 14, ventilation: 28, hot_water: 3, outlet_and_others: 105, elevator: 14, total: 285 }
  },
  hotel: {
    1: { lighting: 70, cooling: 36, heating: 129, ventilation: 28, hot_water: 176, outlet_and_others: 105, elevator: 14, total: 558 },
    2: { lighting: 70, cooling: 37, heating: 109, ventilation: 28, hot_water: 176, outlet_and_others: 105, elevator: 14, total: 539 },
    3: { lighting: 70, cooling: 46, heating: 83, ventilation: 28, hot_water: 176, outlet_and_others: 105, elevator: 14, total: 522 },
    4: { lighting: 70, cooling: 54, heating: 63, ventilation: 28, hot_water: 176, outlet_and_others: 105, elevator: 14, total: 510 },
    5: { lighting: 70, cooling: 58, heating: 58, ventilation: 28, hot_water: 176, outlet_and_others: 105, elevator: 14, total: 509 },
    6: { lighting: 70, cooling: 62, heating: 45, ventilation: 28, hot_water: 176, outlet_and_others: 105, elevator: 14, total: 500 },
    7: { lighting: 70, cooling: 68, heating: 38, ventilation: 28, hot_water: 176, outlet_and_others: 105, elevator: 14, total: 499 },
    8: { lighting: 70, cooling: 73, heating: 20, ventilation: 28, hot_water: 176, outlet_and_others: 105, elevator: 14, total: 486 }
  },
  hospital: {
    1: { lighting: 98, cooling: 48, heating: 172, ventilation: 89, hot_water: 176, outlet_and_others: 105, elevator: 14, total: 702 },
    2: { lighting: 98, cooling: 50, heating: 145, ventilation: 89, hot_water: 176, outlet_and_others: 105, elevator: 14, total: 677 },
    3: { lighting: 98, cooling: 62, heating: 111, ventilation: 89, hot_water: 176, outlet_and_others: 105, elevator: 14, total: 655 },
    4: { lighting: 98, cooling: 72, heating: 84, ventilation: 89, hot_water: 176, outlet_and_others: 105, elevator: 14, total: 638 },
    5: { lighting: 98, cooling: 77, heating: 77, ventilation: 89, hot_water: 176, outlet_and_others: 105, elevator: 14, total: 636 },
    6: { lighting: 98, cooling: 83, heating: 60, ventilation: 89, hot_water: 176, outlet_and_others: 105, elevator: 14, total: 625 },
    7: { lighting: 98, cooling: 91, heating: 50, ventilation: 89, hot_water: 176, outlet_and_others: 105, elevator: 14, total: 623 },
    8: { lighting: 98, cooling: 97, heating: 26, ventilation: 89, hot_water: 176, outlet_and_others: 105, elevator: 14, total: 605 }
  },
  shop_department: {
    4: { lighting: 126, cooling: 20, heating: 23, ventilation: 28, hot_water: 3, outlet_and_others: 105, elevator: 14, total: 319 }
  },
  shop_supermarket: {
    4: { lighting: 140, cooling: 20, heating: 23, ventilation: 28, hot_water: 3, outlet_and_others: 105, elevator: 14, total: 333 }
  },
  school_small: {
    4: { lighting: 49, cooling: 23, heating: 67, ventilation: 14, hot_water: 17, outlet_and_others: 105, elevator: 2, total: 277 }
  },
  school_high: {
    4: { lighting: 49, cooling: 30, heating: 67, ventilation: 14, hot_water: 17, outlet_and_others: 105, elevator: 2, total: 284 }
  },
  school_university: {
    4: { lighting: 49, cooling: 30, heating: 50, ventilation: 14, hot_water: 17, outlet_and_others: 105, elevator: 14, total: 279 }
  },
  restaurant: {
    4: { lighting: 105, cooling: 54, heating: 63, ventilation: 117, hot_water: 105, outlet_and_others: 105, elevator: 14, total: 563 }
  },
  assembly: {
    4: { lighting: 70, cooling: 38, heating: 44, ventilation: 28, hot_water: 17, outlet_and_others: 105, elevator: 14, total: 316 }
  },
  factory: {
    4: { lighting: 70, cooling: 20, heating: 84, ventilation: 28, hot_water: 17, outlet_and_others: 105, elevator: 14, total: 338 }
  },
  residential_collective: {
    4: { lighting: 42, cooling: 38, heating: 44, ventilation: 14, hot_water: 105, outlet_and_others: 105, elevator: 14, total: 362 }
  }
};

// 地域別補正係数
const REGIONAL_FACTORS = {
  1: { heating: 2.38, cooling: 0.66 },
  2: { heating: 2.01, cooling: 0.69 },
  3: { heating: 1.54, cooling: 0.86 },
  4: { heating: 1.16, cooling: 0.99 },
  5: { heating: 1.07, cooling: 1.07 },
  6: { heating: 0.84, cooling: 1.15 },
  7: { heating: 0.70, cooling: 1.27 },
  8: { heading: 0.36, cooling: 1.35 }
};

// 規模係数（簡易版）
function getScaleFactor(floorArea) {
  if (floorArea < 300) return 1.00;
  if (floorArea < 1000) return 0.95;
  if (floorArea < 5000) return 0.90;
  if (floorArea < 10000) return 0.85;
  return 0.80;
}

// モックBEI計算
export function mockBEICalculation(requestData) {
  try {
    const {
      building_area_m2,
      use,
      zone,
      usage_mix,
      renewable_energy_deduction_mj = 0,
      design_energy
    } = requestData;

    // 設計一次エネルギー消費量計算
    let designPrimaryEnergy = 0;
    const designEnergyBreakdown = [];
    
    for (const category of design_energy) {
      const primaryEnergy = category.value * 1.0; // MJはそのまま
      designPrimaryEnergy += primaryEnergy;
      
      designEnergyBreakdown.push({
        category: category.category,
        value: category.value,
        unit: 'MJ',
        primary_factor: 1.0,
        primary_energy_mj: primaryEnergy
      });
    }

    // 再エネ控除適用
    designPrimaryEnergy -= renewable_energy_deduction_mj;

    // 基準一次エネルギー消費量計算
    let standardPrimaryEnergy = 0;
    let useInfo = '';
    let standardIntensity = null;
    
    if (usage_mix) {
      // 複合用途の場合
      let totalWeightedIntensity = 0;
      let useDetails = [];
      
      for (const mix of usage_mix) {
        const intensity = STANDARD_INTENSITIES[mix.use]?.[mix.zone] || 
                         STANDARD_INTENSITIES[mix.use]?.[4] ||
                         STANDARD_INTENSITIES.office[4];
        
        const weightedIntensity = intensity.total * mix.area_m2;
        totalWeightedIntensity += weightedIntensity;
        
        useDetails.push({
          use: mix.use,
          zone: mix.zone,
          area_m2: mix.area_m2,
          intensity: intensity.total
        });
      }
      
      standardPrimaryEnergy = totalWeightedIntensity;
      useInfo = `複合用途建物 (${usage_mix.length}用途)`;
    } else {
      // 単一用途の場合
      standardIntensity = STANDARD_INTENSITIES[use]?.[zone] || 
                         STANDARD_INTENSITIES[use]?.[4] ||
                         STANDARD_INTENSITIES.office[4];
      
      standardPrimaryEnergy = standardIntensity.total * building_area_m2;
      useInfo = `${BUILDING_TYPES[use] || use} (${zone}地域)`;
    }

    // BEI計算
    const bei = (designPrimaryEnergy / standardPrimaryEnergy);
    const isCompliant = bei <= 1.0;

    return {
      bei: parseFloat(bei.toFixed(3)),
      is_compliant: isCompliant,
      design_primary_energy_mj: designPrimaryEnergy,
      standard_primary_energy_mj: standardPrimaryEnergy,
      renewable_deduction_mj: renewable_energy_deduction_mj,
      design_energy_per_m2: designPrimaryEnergy / building_area_m2,
      standard_energy_per_m2: standardPrimaryEnergy / building_area_m2,
      building_area_m2: building_area_m2,
      use_info: useInfo,
      design_energy_breakdown: designEnergyBreakdown,
      standard_intensity_source: usage_mix ? `複合用途モックデータ` : `モックデータ ${use}, ${zone}地域`,
      compliance_threshold: 1.0,
      bei_round_digits: 3,
      notes: [
        "GitHub Pages モック計算による概算値です",
        `基準エネルギー消費量: ${standardPrimaryEnergy / building_area_m2} MJ/m²年`,
        "実際の計算はローカルサーバーでより詳細に行われます"
      ]
    };

  } catch (error) {
    throw new Error(`モック計算エラー: ${error.message}`);
  }
}

// モック電力計算
export function mockPowerCalculation(requestData) {
  const { voltage, current, power_factor = 1.0, phases = 1 } = requestData;
  
  const power_w = voltage * current * power_factor * (phases === 3 ? Math.sqrt(3) : 1);
  
  return {
    power_w: Math.round(power_w * 100) / 100,
    power_kw: Math.round(power_w / 10) / 100,
    voltage,
    current,
    power_factor,
    is_three_phase: phases === 3
  };
}

// モック電力料金計算
export function mockTariffCalculation(requestData) {
  const { 
    monthly_kwh = 1000, 
    tariff_structure = { type: 'flat', rate_per_kwh: 25 },
    basic_charge = 1500
  } = requestData;

  let energyCharge = 0;
  
  if (tariff_structure.type === 'flat') {
    energyCharge = monthly_kwh * tariff_structure.rate_per_kwh;
  } else if (tariff_structure.type === 'tiered') {
    // 段階制料金（簡易）
    const tiers = tariff_structure.tiers || [
      { limit: 120, rate: 20 },
      { limit: 300, rate: 25 },
      { limit: Infinity, rate: 30 }
    ];
    
    let remainingKwh = monthly_kwh;
    let cumulativeLimit = 0;
    
    for (const tier of tiers) {
      const tierLimit = tier.limit - cumulativeLimit;
      const tierUsage = Math.min(remainingKwh, tierLimit);
      energyCharge += tierUsage * tier.rate;
      remainingKwh -= tierUsage;
      cumulativeLimit += tierLimit;
      
      if (remainingKwh <= 0) break;
    }
  }

  const totalAmount = basic_charge + energyCharge;
  const tax = Math.round(totalAmount * 0.1);
  const totalWithTax = totalAmount + tax;

  return {
    monthly_usage_kwh: monthly_kwh,
    basic_charge: basic_charge,
    energy_charge: Math.round(energyCharge),
    subtotal: totalAmount,
    tax: tax,
    total_amount: totalWithTax,
    tariff_structure: tariff_structure,
    unit_cost_per_kwh: Math.round((energyCharge / monthly_kwh) * 100) / 100,
    notes: [
      "GitHub Pages モック計算による概算値です",
      "実際の電力料金は電力会社の詳細な料金表をご確認ください"
    ]
  };
}