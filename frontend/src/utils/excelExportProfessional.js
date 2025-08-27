// frontend/src/utils/excelExportProfessional.js
// 実用的なExcel出力機能（SheetJS使用）
import * as XLSX from 'xlsx';

// 建物用途名の変換
const getBuildingTypeName = (type) => {
  const names = {
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
  return names[type] || type;
};

// カテゴリ名の変換
const getCategoryName = (category) => {
  const names = {
    heating: "暖房",
    cooling: "冷房", 
    ventilation: "機械換気",
    hot_water: "給湯",
    lighting: "照明",
    elevator: "昇降機"
  };
  return names[category] || category;
};

// プロフェッショナル品質のExcel出力
export const exportToProfessionalExcel = (result, formData, projectInfo) => {
  if (!result || !formData) {
    throw new Error('計算結果またはフォームデータがありません');
  }

  try {
    // 新しいワークブックを作成
    const workbook = XLSX.utils.book_new();

    // ===== 計算書シート =====
    const reportData = [];

    // ヘッダー
    reportData.push(['建築物省エネルギー法　適合性判定申請書']);
    reportData.push(['モデル建物法による一次エネルギー消費量計算書']);
    reportData.push(['']);
    reportData.push(['作成日', new Date().toLocaleDateString('ja-JP')]);
    reportData.push(['']);

    // プロジェクト情報
    if (projectInfo) {
      reportData.push(['■ プロジェクト情報']);
      reportData.push(['プロジェクト名', projectInfo.name || '']);
      reportData.push(['建築主', projectInfo.buildingOwner || '']);
      reportData.push(['設計者', projectInfo.designer || '']);
      reportData.push(['設計事務所', projectInfo.designFirm || '']);
      reportData.push(['所在地', projectInfo.location || '']);
      if (projectInfo.description) {
        reportData.push(['概要', projectInfo.description]);
      }
      reportData.push(['']);
    }

    // 建物概要
    reportData.push(['■ 1. 建物概要']);
    reportData.push(['項目', '値']);
    reportData.push(['建物用途', getBuildingTypeName(formData.building_type)]);
    reportData.push(['地域区分', `${formData.climate_zone}地域`]);
    reportData.push(['延床面積', `${Number(formData.floor_area || result.building_area_m2).toLocaleString()} m²`]);
    reportData.push(['再エネ控除', `${Number(formData.renewable_energy || result.renewable_deduction_mj || 0).toLocaleString()} MJ/年`]);
    reportData.push(['']);

    // BEI計算結果
    reportData.push(['■ 2. BEI計算結果']);
    reportData.push(['項目', '値', '単位']);
    reportData.push(['設計一次エネルギー消費量', result.design_primary_energy_mj, 'MJ/年']);
    reportData.push(['基準一次エネルギー消費量', result.standard_primary_energy_mj, 'MJ/年']);
    reportData.push(['BEI値', result.bei, '']);
    reportData.push(['適合判定', result.is_compliant ? '適合' : '不適合', '']);
    reportData.push(['']);

    // 計算式
    reportData.push(['■ 計算式']);
    reportData.push(['BEI = 設計一次エネルギー消費量 ÷ 基準一次エネルギー消費量']);
    reportData.push([`= ${result.design_primary_energy_mj?.toLocaleString()} ÷ ${result.standard_primary_energy_mj?.toLocaleString()}`]);
    reportData.push([`= ${result.bei}`]);
    reportData.push(['※ BEI ≤ 1.0 で省エネ基準適合']);
    reportData.push(['']);

    // 設計一次エネルギー消費量内訳
    reportData.push(['■ 3. 設計一次エネルギー消費量内訳']);
    reportData.push(['用途', '消費量 (MJ/年)', '単位面積あたり (MJ/m²年)', '割合 (%)']);
    
    if (result.design_energy_breakdown) {
      result.design_energy_breakdown.forEach(item => {
        const perM2 = item.primary_energy_mj / (formData.floor_area || result.building_area_m2);
        const percentage = (item.primary_energy_mj / result.design_primary_energy_mj * 100);
        reportData.push([
          getCategoryName(item.category),
          item.primary_energy_mj,
          Math.round(perM2 * 10) / 10,
          Math.round(percentage * 10) / 10
        ]);
      });
    }
    
    reportData.push([
      '合計',
      result.design_primary_energy_mj,
      Math.round(result.design_energy_per_m2 * 10) / 10,
      100
    ]);
    reportData.push(['']);

    // 基準一次エネルギー消費量算定
    reportData.push(['■ 4. 基準一次エネルギー消費量算定']);
    reportData.push(['基準エネルギー消費量原単位合計', Math.round(result.standard_energy_per_m2 * 100) / 100, 'MJ/m²年']);
    reportData.push(['延床面積', Number(formData.floor_area || result.building_area_m2), 'm²']);
    reportData.push(['基準一次エネルギー消費量', result.standard_primary_energy_mj, 'MJ/年']);
    reportData.push(['']);

    // 法的根拠
    reportData.push(['■ 5. 法的根拠']);
    reportData.push(['建築物のエネルギー消費性能の向上に関する法律（建築物省エネ法）']);
    reportData.push(['国土交通省告示第1396号（平成28年1月29日）']);
    reportData.push(['モデル建物法による標準入力法（平成28年国土交通省告示第265号）']);
    reportData.push(['']);

    // 注記
    reportData.push(['■ 6. 注記']);
    reportData.push(['本計算書は建築物省エネ法に基づくモデル建物法により算定']);
    reportData.push([`地域区分: ${formData.climate_zone}地域の補正係数を適用`]);
    reportData.push(['規模補正係数: 0.95（簡易計算）']);

    // 計算書シートを作成
    const reportSheet = XLSX.utils.aoa_to_sheet(reportData);
    
    // セル幅の調整
    reportSheet['!cols'] = [
      { width: 25 }, // 項目名
      { width: 20 }, // 値
      { width: 15 }, // 単位等
      { width: 10 }  // その他
    ];

    // ===== データシート（詳細な数値データ）=====
    const dataRows = [];
    dataRows.push(['項目', '値', '単位', '備考']);
    dataRows.push(['建物用途', getBuildingTypeName(formData.building_type), '', '']);
    dataRows.push(['地域区分', formData.climate_zone, '地域', '']);
    dataRows.push(['延床面積', Number(formData.floor_area || result.building_area_m2), 'm²', '']);
    dataRows.push(['再エネ控除', Number(formData.renewable_energy || result.renewable_deduction_mj || 0), 'MJ/年', '']);
    dataRows.push(['設計一次エネルギー消費量', result.design_primary_energy_mj, 'MJ/年', '']);
    dataRows.push(['基準一次エネルギー消費量', result.standard_primary_energy_mj, 'MJ/年', '']);
    dataRows.push(['BEI値', result.bei, '', '']);
    dataRows.push(['適合判定', result.is_compliant ? 1 : 0, '', '1=適合, 0=不適合']);

    // エネルギー内訳
    if (result.design_energy_breakdown) {
      dataRows.push(['', '', '', '--- エネルギー内訳 ---']);
      result.design_energy_breakdown.forEach(item => {
        dataRows.push([
          `${getCategoryName(item.category)}_消費量`,
          item.primary_energy_mj,
          'MJ/年',
          ''
        ]);
        const perM2 = item.primary_energy_mj / (formData.floor_area || result.building_area_m2);
        dataRows.push([
          `${getCategoryName(item.category)}_原単位`,
          Math.round(perM2 * 100) / 100,
          'MJ/m²年',
          ''
        ]);
      });
    }

    const dataSheet = XLSX.utils.aoa_to_sheet(dataRows);
    dataSheet['!cols'] = [
      { width: 30 }, // 項目名
      { width: 15 }, // 値
      { width: 10 }, // 単位
      { width: 20 }  // 備考
    ];

    // ===== 計算式シート =====
    const formulaRows = [];
    formulaRows.push(['計算ステップ', '式', '値', '単位']);
    formulaRows.push(['1. 延床面積', '', Number(formData.floor_area || result.building_area_m2), 'm²']);
    formulaRows.push(['2. 基準エネルギー消費量原単位', '', Math.round(result.standard_energy_per_m2 * 100) / 100, 'MJ/m²年']);
    formulaRows.push(['3. 基準一次エネルギー消費量', '延床面積 × 基準原単位', result.standard_primary_energy_mj, 'MJ/年']);
    formulaRows.push(['4. 設計一次エネルギー消費量', '各用途の合計', result.design_primary_energy_mj, 'MJ/年']);
    formulaRows.push(['5. BEI値', '設計 ÷ 基準', result.bei, '']);
    formulaRows.push(['6. 適合判定', 'BEI ≤ 1.0', result.is_compliant ? '適合' : '不適合', '']);

    const formulaSheet = XLSX.utils.aoa_to_sheet(formulaRows);
    formulaSheet['!cols'] = [
      { width: 25 }, // ステップ
      { width: 30 }, // 式
      { width: 15 }, // 値
      { width: 10 }  // 単位
    ];

    // ワークブックにシートを追加
    XLSX.utils.book_append_sheet(workbook, reportSheet, "計算書");
    XLSX.utils.book_append_sheet(workbook, dataSheet, "データ");
    XLSX.utils.book_append_sheet(workbook, formulaSheet, "計算式");

    // ファイル名を生成
    const filename = projectInfo?.name 
      ? `${projectInfo.name}_BEI計算書_${new Date().toLocaleDateString('ja-JP', {year: 'numeric', month: '2-digit', day: '2-digit'}).replace(/\//g, '')}.xlsx`
      : `BEI計算書_${new Date().toLocaleDateString('ja-JP', {year: 'numeric', month: '2-digit', day: '2-digit'}).replace(/\//g, '')}.xlsx`;

    // ファイルをダウンロード
    XLSX.writeFile(workbook, filename);

    return filename;

  } catch (error) {
    console.error('Excel出力エラー:', error);
    throw new Error(`Excel出力に失敗しました: ${error.message}`);
  }
};

// 簡易版Excel出力（軽量）
export const exportToSimpleExcel = (result, formData, projectInfo) => {
  const workbook = XLSX.utils.book_new();
  
  const data = [
    ['BEI計算結果'],
    ['項目', '値'],
    ['建物用途', getBuildingTypeName(formData.building_type)],
    ['地域区分', `${formData.climate_zone}地域`],
    ['延床面積', `${Number(formData.floor_area || result.building_area_m2).toLocaleString()} m²`],
    ['設計一次エネルギー消費量', `${result.design_primary_energy_mj?.toLocaleString()} MJ/年`],
    ['基準一次エネルギー消費量', `${result.standard_primary_energy_mj?.toLocaleString()} MJ/年`],
    ['BEI値', result.bei],
    ['適合判定', result.is_compliant ? '適合' : '不適合']
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(data);
  worksheet['!cols'] = [{ width: 25 }, { width: 20 }];
  
  XLSX.utils.book_append_sheet(workbook, worksheet, "BEI計算結果");
  
  const filename = `BEI計算結果_簡易版_${new Date().toISOString().slice(0,10).replace(/-/g,'')}.xlsx`;
  XLSX.writeFile(workbook, filename);
  
  return filename;
};