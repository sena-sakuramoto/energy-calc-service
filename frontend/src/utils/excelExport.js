// frontend/src/utils/excelExport.js
// Excel形式でのBEI計算書出力機能

// 簡易的なExcel形式（CSV）での出力
export const exportToExcel = (result, formData, projectInfo) => {
  if (!result || !formData) {
    throw new Error('計算結果またはフォームデータがありません');
  }

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

  // CSV形式での出力データ作成
  const csvRows = [];
  
  // ヘッダー情報
  csvRows.push(['建築物省エネルギー法　適合性判定申請書']);
  csvRows.push(['モデル建物法による一次エネルギー消費量計算書']);
  csvRows.push(['']);
  csvRows.push(['作成日', new Date().toLocaleDateString('ja-JP')]);
  csvRows.push(['']);

  // プロジェクト情報
  if (projectInfo) {
    csvRows.push(['■ プロジェクト情報']);
    csvRows.push(['プロジェクト名', projectInfo.name || '']);
    csvRows.push(['建築主', projectInfo.buildingOwner || '']);
    csvRows.push(['設計者', projectInfo.designer || '']);
    csvRows.push(['設計事務所', projectInfo.designFirm || '']);
    csvRows.push(['所在地', projectInfo.location || '']);
    if (projectInfo.description) {
      csvRows.push(['概要', projectInfo.description]);
    }
    csvRows.push(['']);
  }

  // 建物概要
  csvRows.push(['■ 1. 建物概要']);
  csvRows.push(['項目', '値']);
  csvRows.push(['建物用途', getBuildingTypeName(formData.building_type)]);
  csvRows.push(['地域区分', `${formData.climate_zone}地域`]);
  csvRows.push(['延床面積', `${Number(formData.floor_area || result.building_area_m2).toLocaleString()} m²`]);
  csvRows.push(['再エネ控除', `${Number(formData.renewable_energy || result.renewable_deduction_mj || 0).toLocaleString()} MJ/年`]);
  csvRows.push(['']);

  // BEI計算結果
  csvRows.push(['■ 2. BEI計算結果']);
  csvRows.push(['項目', '値']);
  csvRows.push(['設計一次エネルギー消費量', `${result.design_primary_energy_mj?.toLocaleString()} MJ/年`]);
  csvRows.push(['基準一次エネルギー消費量', `${result.standard_primary_energy_mj?.toLocaleString()} MJ/年`]);
  try {
    const { formatBEI } = require('./number');
    csvRows.push(['BEI値', formatBEI(result.bei, true)]);
  } catch {
    csvRows.push(['BEI値', result.bei]);
  }
  csvRows.push(['適合判定', result.is_compliant ? '適合' : '不適合']);
  csvRows.push(['']);

  // 計算式
  csvRows.push(['■ 計算式']);
  csvRows.push(['BEI = 設計一次エネルギー消費量 ÷ 基準一次エネルギー消費量']);
  csvRows.push([`= ${result.design_primary_energy_mj?.toLocaleString()} ÷ ${result.standard_primary_energy_mj?.toLocaleString()}`]);
  try {
    const { formatBEI } = require('./number');
    csvRows.push([`= ${formatBEI(result.bei)}`]);
  } catch {
    csvRows.push([`= ${result.bei}`]);
  }
  csvRows.push(['※ BEI ≤ 1.0 で省エネ基準適合']);
  csvRows.push(['']);

  // 設計一次エネルギー消費量内訳
  csvRows.push(['■ 3. 設計一次エネルギー消費量内訳']);
  csvRows.push(['用途', '消費量 (MJ/年)', '単位面積あたり (MJ/m²年)']);
  
  if (result.design_energy_breakdown) {
    result.design_energy_breakdown.forEach(item => {
      const perM2 = item.primary_energy_mj / (formData.floor_area || result.building_area_m2);
      csvRows.push([
        getCategoryName(item.category),
        item.primary_energy_mj?.toLocaleString(),
        perM2?.toFixed(1)
      ]);
    });
  }
  
  csvRows.push([
    '合計',
    result.design_primary_energy_mj?.toLocaleString(),
    result.design_energy_per_m2?.toFixed(1)
  ]);
  csvRows.push(['']);

  // 基準一次エネルギー消費量算定
  csvRows.push(['■ 4. 基準一次エネルギー消費量算定']);
  csvRows.push(['基準エネルギー消費量原単位合計', `${result.standard_energy_per_m2?.toFixed(2)} MJ/m²年`]);
  csvRows.push(['延床面積', `${Number(formData.floor_area || result.building_area_m2).toLocaleString()} m²`]);
  csvRows.push(['基準一次エネルギー消費量', `${result.standard_primary_energy_mj?.toLocaleString()} MJ/年`]);
  csvRows.push(['']);

  // 法的根拠
  csvRows.push(['■ 5. 法的根拠']);
  csvRows.push(['建築物のエネルギー消費性能の向上に関する法律（建築物省エネ法）']);
  csvRows.push(['国土交通省告示第1396号（平成28年1月29日）']);
  csvRows.push(['モデル建物法による標準入力法（平成28年国土交通省告示第265号）']);
  csvRows.push(['']);

  // 注記
  csvRows.push(['■ 6. 注記']);
  csvRows.push(['本計算書は建築物省エネ法に基づくモデル建物法により算定']);
  csvRows.push([`地域区分: ${formData.climate_zone}地域の補正係数を適用`]);
  csvRows.push(['規模補正係数: 0.95（簡易計算）']);
  
  if (result.notes) {
    result.notes.forEach(note => {
      csvRows.push([note]);
    });
  }

  // CSV文字列の作成
  const csvContent = csvRows.map(row => 
    row.map(cell => `"${String(cell || '').replace(/"/g, '""')}"`).join(',')
  ).join('\n');

  // BOMを追加してUTF-8で正しく表示されるようにする
  const bom = '\uFEFF';
  const csvWithBom = bom + csvContent;

  // ファイルのダウンロード
  const blob = new Blob([csvWithBom], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const filename = projectInfo?.name 
    ? `${projectInfo.name}_BEI計算書_${new Date().toLocaleDateString('ja-JP', {year: 'numeric', month: '2-digit', day: '2-digit'}).replace(/\//g, '')}.csv`
    : `BEI計算書_${new Date().toLocaleDateString('ja-JP', {year: 'numeric', month: '2-digit', day: '2-digit'}).replace(/\//g, '')}.csv`;
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  
  URL.revokeObjectURL(url);
  
  return filename;
};

// Excel互換のXML形式での出力（より高機能）
export const exportToExcelXML = (result, formData, projectInfo) => {
  if (!result || !formData) {
    throw new Error('計算結果またはフォームデータがありません');
  }

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

  // Excel XML形式のテンプレート
  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
<DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">
<Title>BEI計算書</Title>
<Author>建築物省エネ計算システム</Author>
<Created>${new Date().toISOString()}</Created>
</DocumentProperties>
<Styles>
<Style ss:ID="Header">
<Font ss:Bold="1" ss:Size="14"/>
<Alignment ss:Horizontal="Center"/>
<Interior ss:Color="#E6E6FA" ss:Pattern="Solid"/>
</Style>
<Style ss:ID="SubHeader">
<Font ss:Bold="1" ss:Size="12"/>
<Interior ss:Color="#F0F8FF" ss:Pattern="Solid"/>
</Style>
<Style ss:ID="Data">
<Font ss:Size="10"/>
</Style>
<Style ss:ID="Result">
<Font ss:Bold="1" ss:Size="12"/>
<Interior ss:Color="#F0FFF0" ss:Pattern="Solid"/>
</Style>
</Styles>
<Worksheet ss:Name="BEI計算書">
<Table>
<Row>
<Cell ss:StyleID="Header" ss:MergeAcross="3">
<Data ss:Type="String">建築物省エネルギー法　適合性判定申請書</Data>
</Cell>
</Row>
<Row>
<Cell ss:StyleID="Header" ss:MergeAcross="3">
<Data ss:Type="String">モデル建物法による一次エネルギー消費量計算書</Data>
</Cell>
</Row>
<Row></Row>
<Row>
<Cell ss:StyleID="Data">
<Data ss:Type="String">作成日</Data>
</Cell>
<Cell ss:StyleID="Data">
<Data ss:Type="String">${new Date().toLocaleDateString('ja-JP')}</Data>
</Cell>
</Row>
<Row></Row>
${projectInfo ? `
<Row>
<Cell ss:StyleID="SubHeader" ss:MergeAcross="3">
<Data ss:Type="String">プロジェクト情報</Data>
</Cell>
</Row>
<Row>
<Cell ss:StyleID="Data"><Data ss:Type="String">プロジェクト名</Data></Cell>
<Cell ss:StyleID="Data"><Data ss:Type="String">${projectInfo.name || ''}</Data></Cell>
</Row>
<Row>
<Cell ss:StyleID="Data"><Data ss:Type="String">建築主</Data></Cell>
<Cell ss:StyleID="Data"><Data ss:Type="String">${projectInfo.buildingOwner || ''}</Data></Cell>
</Row>
<Row>
<Cell ss:StyleID="Data"><Data ss:Type="String">設計者</Data></Cell>
<Cell ss:StyleID="Data"><Data ss:Type="String">${projectInfo.designer || ''}</Data></Cell>
</Row>
<Row>
<Cell ss:StyleID="Data"><Data ss:Type="String">所在地</Data></Cell>
<Cell ss:StyleID="Data"><Data ss:Type="String">${projectInfo.location || ''}</Data></Cell>
</Row>
<Row></Row>
` : ''}
<Row>
<Cell ss:StyleID="SubHeader" ss:MergeAcross="3">
<Data ss:Type="String">1. 建物概要</Data>
</Cell>
</Row>
<Row>
<Cell ss:StyleID="Data"><Data ss:Type="String">建物用途</Data></Cell>
<Cell ss:StyleID="Data"><Data ss:Type="String">${getBuildingTypeName(formData.building_type)}</Data></Cell>
</Row>
<Row>
<Cell ss:StyleID="Data"><Data ss:Type="String">地域区分</Data></Cell>
<Cell ss:StyleID="Data"><Data ss:Type="String">${formData.climate_zone}地域</Data></Cell>
</Row>
<Row>
<Cell ss:StyleID="Data"><Data ss:Type="String">延床面積</Data></Cell>
<Cell ss:StyleID="Data"><Data ss:Type="String">${Number(formData.floor_area || result.building_area_m2).toLocaleString()} m²</Data></Cell>
</Row>
<Row></Row>
<Row>
<Cell ss:StyleID="SubHeader" ss:MergeAcross="3">
<Data ss:Type="String">2. BEI計算結果</Data>
</Cell>
</Row>
<Row>
<Cell ss:StyleID="Data"><Data ss:Type="String">設計一次エネルギー消費量</Data></Cell>
<Cell ss:StyleID="Data"><Data ss:Type="String">${result.design_primary_energy_mj?.toLocaleString()} MJ/年</Data></Cell>
</Row>
<Row>
<Cell ss:StyleID="Data"><Data ss:Type="String">基準一次エネルギー消費量</Data></Cell>
<Cell ss:StyleID="Data"><Data ss:Type="String">${result.standard_primary_energy_mj?.toLocaleString()} MJ/年</Data></Cell>
</Row>
<Row>
<Cell ss:StyleID="Result"><Data ss:Type="String">BEI値</Data></Cell>
<Cell ss:StyleID="Result"><Data ss:Type="Number">${result.bei}</Data></Cell>
</Row>
<Row>
<Cell ss:StyleID="Result"><Data ss:Type="String">適合判定</Data></Cell>
<Cell ss:StyleID="Result"><Data ss:Type="String">${result.is_compliant ? '適合' : '不適合'}</Data></Cell>
</Row>
</Table>
</Worksheet>
</Workbook>`;

  // ファイルのダウンロード
  const blob = new Blob([xmlContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const filename = projectInfo?.name 
    ? `${projectInfo.name}_BEI計算書_${new Date().toLocaleDateString('ja-JP', {year: 'numeric', month: '2-digit', day: '2-digit'}).replace(/\//g, '')}.xls`
    : `BEI計算書_${new Date().toLocaleDateString('ja-JP', {year: 'numeric', month: '2-digit', day: '2-digit'}).replace(/\//g, '')}.xls`;
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  
  URL.revokeObjectURL(url);
  
  return filename;
};
