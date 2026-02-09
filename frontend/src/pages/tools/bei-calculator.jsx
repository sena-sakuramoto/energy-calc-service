// frontend/src/pages/tools/bei-calculator.jsx
import { useState, useEffect } from 'react';
import { FaCalculator, FaBuilding, FaChartLine, FaCopy, FaDownload, FaLightbulb, FaExclamationTriangle, FaCheckCircle, FaArrowRight, FaFileAlt, FaPrint } from 'react-icons/fa';
import CalculatorLayout from '../../components/CalculatorLayout';
import FormSection from '../../components/FormSection';
import ResultCard from '../../components/ResultCard';
import ClimateZoneSelector from '../../components/ClimateZoneSelector';
import BuildingTypeSelector from '../../components/BuildingTypeSelector';
import HelpTooltip from '../../components/HelpTooltip';
import ComplianceReport from '../../components/ComplianceReport';
import ProjectManager from '../../components/ProjectManager';
import ProjectInfoForm from '../../components/ProjectInfoForm';
import { beiAPI } from '../../utils/api';
import { createProjectData, saveProject } from '../../utils/projectStorage';
import { validateEnergyInput, validateFloorArea, validateAllInputs, WARNING_LEVELS } from '../../utils/inputValidation';
import ValidationAlert, { ValidationSummary } from '../../components/ValidationAlert';
import { analyzeEnergyConsumption, analyzeBEI, getEnergyTypeName, getImprovementSuggestions } from '../../utils/energyComparison';
import { formatBEI } from '../../utils/number';

export default function BEICalculator() {
  const [currentProject, setCurrentProject] = useState(null);
  const [projectInfo, setProjectInfo] = useState({
    name: '',
    buildingOwner: '',
    designer: '',
    designFirm: '',
    location: '',
    description: ''
  });
  const [formData, setFormData] = useState({
    calculation_method: 'model_building', // 'model_building' or 'standard_input'
    building_type: '',
    climate_zone: '',
    floor_area: '',
    is_mixed_use: false,
    mixed_uses: [{
      use_type: '',
      area_m2: '',
      area_share: ''
    }],
    design_energy: {
      heating: '',
      cooling: '',
      ventilation: '',
      hot_water: '',
      lighting: '',
      elevator: ''
    },
    envelope_performance: {
      ua_value: '',
      eta_ac_value: '',
      perimeter_annual_load: ''
    },
    renewable_energy: ''
  });
  const [currentStep, setCurrentStep] = useState(1);
  const [validationErrors, setValidationErrors] = useState({});
  const [validationWarnings, setValidationWarnings] = useState({});
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showReport, setShowReport] = useState(false);

  // サンプルデータ
  const sampleData = {
    office_small: {
      name: "小規模事務所ビル",
      description: "地上3階建ての一般的な事務所ビル（ZEB Ready仕様）",
      formData: {
        calculation_method: 'model_building',
        building_type: 'office',
        climate_zone: '6',
        floor_area: '1200',
        is_mixed_use: false,
        design_energy: {
          heating: '180000',
          cooling: '220000',
          ventilation: '95000',
          hot_water: '15000',
          lighting: '85000',
          elevator: '12000'
        },
        envelope_performance: {
          ua_value: '0.87',
          eta_ac_value: '2.8',
          perimeter_annual_load: '300'
        },
        renewable_energy: '50000'
      }
    },
    hotel_medium: {
      name: "中規模ホテル",
      description: "地上8階建てのビジネスホテル（高効率設備導入）",
      formData: {
        calculation_method: 'model_building',
        building_type: 'hotel',
        climate_zone: '5',
        floor_area: '3500',
        is_mixed_use: false,
        design_energy: {
          heating: '850000',
          cooling: '720000',
          ventilation: '280000',
          hot_water: '450000',
          lighting: '180000',
          elevator: '45000'
        },
        envelope_performance: {
          ua_value: '0.75',
          eta_ac_value: '2.2',
          perimeter_annual_load: '420'
        },
        renewable_energy: '120000'
      }
    },
    mixed_complex: {
      name: "複合用途ビル",
      description: "商業施設+事務所の複合ビル（省エネ基準適合）",
      formData: {
        calculation_method: 'model_building',
        building_type: '',
        climate_zone: '4',
        floor_area: '2800',
        is_mixed_use: true,
        mixed_uses: [
          {
            use_type: 'retail',
            area_m2: '1200',
            area_share: '42.9'
          },
          {
            use_type: 'office',
            area_m2: '1600',
            area_share: '57.1'
          }
        ],
        design_energy: {
          heating: '420000',
          cooling: '580000',
          ventilation: '195000',
          hot_water: '85000',
          lighting: '240000',
          elevator: '28000'
        },
        envelope_performance: {
          ua_value: '0.85',
          eta_ac_value: '2.7',
          perimeter_annual_load: '350'
        },
        renewable_energy: '80000'
      }
    }
  };

  // サンプルデータ適用関数
  const applySampleData = (sampleKey) => {
    const sample = sampleData[sampleKey];
    if (!sample) return;

    setProjectInfo({
      name: sample.name,
      buildingOwner: '（サンプル）株式会社○○',
      designer: '（サンプル）建築設計事務所',
      designFirm: '（サンプル）○○設計',
      location: '（サンプル）東京都内',
      description: sample.description
    });

    setFormData(sample.formData);
    setCurrentStep(1);
    setResult(null);
    setValidationErrors({});
    setValidationWarnings({});
  };

  // 入力検証の実行
  const runInputValidation = (updatedFormData = formData) => {
    const warnings = validateAllInputs(updatedFormData);
    setValidationWarnings(warnings);
    return warnings;
  };

  // formData変更時に自動検証
  useEffect(() => {
    if (formData.building_type && formData.floor_area) {
      runInputValidation();
    }
  }, [formData.building_type, formData.floor_area, formData.design_energy, formData.renewable_energy]);

  // バリデーション関数
  const validateStep1 = () => {
    const errors = {};

    if (formData.is_mixed_use) {
      // 複合用途の場合
      if (!formData.climate_zone) {
        errors.climate_zone = '地域区分を選択してください';
      }
      if (!formData.floor_area || parseFloat(formData.floor_area) <= 0) {
        errors.floor_area = '延床面積を正しく入力してください（正の数値）';
      }

      // 複合用途の検証
      formData.mixed_uses.forEach((use, index) => {
        if (!use.use_type) {
          errors[`mixed_use_${index}_type`] = `用途${index + 1}を選択してください`;
        }
        if (!use.area_m2 || parseFloat(use.area_m2) <= 0) {
          errors[`mixed_use_${index}_area`] = `面積${index + 1}を正しく入力してください`;
        }
      });

      // 面積の合計チェック
      const totalArea = formData.mixed_uses.reduce((sum, use) => sum + (parseFloat(use.area_m2) || 0), 0);
      const buildingArea = parseFloat(formData.floor_area) || 0;
      if (Math.abs(totalArea - buildingArea) > 1) {
        errors.mixed_use_total = `用途別面積の合計(${totalArea}m²)が延床面積(${buildingArea}m²)と一致しません`;
      }
    } else {
      // 単一用途の場合
      if (!formData.building_type) {
        errors.building_type = '建物用途を選択してください';
      }
      if (!formData.climate_zone) {
        errors.climate_zone = '地域区分を選択してください';
      }
      if (!formData.floor_area || parseFloat(formData.floor_area) <= 0) {
        errors.floor_area = '延床面積を正しく入力してください（正の数値）';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep2 = () => {
    const errors = {};

    // UA値の検証（住宅・非住宅共通）
    if (formData.envelope_performance.ua_value && parseFloat(formData.envelope_performance.ua_value) <= 0) {
      errors.ua_value = 'UA値は正の数値を入力してください';
    }

    // ηAC値の検証（住宅のみ）
    if (formData.building_type === 'residential_collective' && formData.envelope_performance.eta_ac_value && parseFloat(formData.envelope_performance.eta_ac_value) <= 0) {
      errors.eta_ac_value = 'ηAC値は正の数値を入力してください';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep3 = () => {
    const errors = {};
    const requiredFields = ['heating', 'cooling', 'ventilation', 'hot_water', 'lighting', 'elevator'];

    requiredFields.forEach(field => {
      if (!formData.design_energy[field] || parseFloat(formData.design_energy[field]) < 0) {
        errors[field] = `${getEnergyFieldLabel(field)}の値を正しく入力してください`;
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const getEnergyFieldLabel = (field) => {
    const labels = {
      heating: '暖房',
      cooling: '冷房',
      ventilation: '機械換気',
      hot_water: '給湯',
      lighting: '照明',
      elevator: '昇降機'
    };
    return labels[field] || field;
  };

  const handleCalculate = async () => {
    // 厳格チェック: ステップ検証 + 全体警告のERRORレベルがある場合は中断
    const okStep1 = validateStep1();
    const okStep3 = validateStep3();
    const warnings = runInputValidation();
    const hasErrorWarnings = Object.values(warnings).some(list => Array.isArray(list) && list.some(w => (w.level || w?.level) === WARNING_LEVELS.ERROR));
    if (!okStep1 || !okStep3 || hasErrorWarnings) {
      setValidationErrors(prev => ({
        ...prev,
        blocking: hasErrorWarnings ? '入力に重大な問題があります（単位・桁数・負値など）。修正してください。' : (prev.blocking || '')
      }));
      return;
    }

    setIsLoading(true);
    try {
      // APIに送信するデータを準備
      const apiData = {
        building_area_m2: parseFloat(formData.floor_area),
        renewable_energy_deduction_mj: parseFloat(formData.renewable_energy) || 0,
        design_energy: Object.entries(formData.design_energy).map(([category, value]) => ({
          category,
          value: parseFloat(value),
          unit: 'MJ'
        }))
      };

      if (formData.is_mixed_use) {
        // 複合用途の場合
        apiData.usage_mix = formData.mixed_uses.map(use => ({
          use: use.use_type,
          zone: formData.climate_zone.toString(),
          area_m2: parseFloat(use.area_m2)
        }));
      } else {
        // 単一用途の場合
        apiData.use = formData.building_type;
        apiData.zone = formData.climate_zone.toString();
      }

      const response = await beiAPI.evaluate(apiData);

      // APIレスポンスをそのまま使用（data フィールドから取得）
      const calculationResult = response.data || response;
      setResult(calculationResult);
      setCurrentStep(formData.calculation_method === 'model_building' ? 4 : 5);

      // 自動保存（プロジェクト名がある場合）
      if (projectInfo.name) {
        try {
          const projectData = createProjectData(projectInfo, formData, calculationResult);
          if (currentProject) {
            projectData.id = currentProject.id;
          }
          const saved = saveProject(projectData);
          setCurrentProject(saved);
        } catch (saveError) {
          console.error('プロジェクト保存エラー:', saveError);
        }
      }
    } catch (error) {
      console.error('BEI計算エラー:', error);
      setValidationErrors({ api: `BEI計算中にエラーが発生しました: ${error.message || '入力内容を確認してください'}` });
    } finally {
      setIsLoading(false);
    }
  };

  // プロジェクト管理のイベントハンドラ
  const handleNewProject = () => {
    setCurrentProject(null);
    setProjectInfo({
      name: '',
      buildingOwner: '',
      designer: '',
      designFirm: '',
      location: '',
      description: ''
    });
    setFormData({
      calculation_method: 'model_building',
      building_type: '',
      climate_zone: '',
      floor_area: '',
      is_mixed_use: false,
      mixed_uses: [{
        use_type: '',
        area_m2: '',
        area_share: ''
      }],
      design_energy: {
        heating: '',
        cooling: '',
        ventilation: '',
        hot_water: '',
        lighting: '',
        elevator: ''
      },
      envelope_performance: {
        ua_value: '',
        eta_ac_value: '',
        perimeter_annual_load: ''
      },
      renewable_energy: '0'
    });
    setResult(null);
    setCurrentStep(1);
    setValidationErrors({});
  };

  const handleProjectLoad = (project) => {
    setCurrentProject(project);
    setProjectInfo(project.projectInfo);
    setFormData(project.formData);
    setResult(project.result);
    setCurrentStep(project.result ? (project.formData.calculation_method === 'model_building' ? 4 : 5) : 1);
    setValidationErrors({});
  };

  const handleSaveProject = () => {
    if (!projectInfo.name) {
      alert('プロジェクト名を入力してください');
      return;
    }

    try {
      const projectData = createProjectData(projectInfo, formData, result);
      if (currentProject) {
        projectData.id = currentProject.id;
      }
      const saved = saveProject(projectData);
      setCurrentProject(saved);
      alert('プロジェクトを保存しました');
    } catch (error) {
      console.error('保存エラー:', error);
      alert('保存中にエラーが発生しました');
    }
  };

  const copyResults = () => {
    if (!result) return;

    const text = `BEI計算結果\n\n` +
          `BEI値: ${formatBEI(result.bei)}\n` +
      `適合判定: ${result.is_compliant ? '適合' : '不適合'}\n` +
      `設計一次エネルギー: ${result.design_primary_energy_mj?.toLocaleString()} MJ/年\n` +
      `基準一次エネルギー: ${result.standard_primary_energy_mj?.toLocaleString()} MJ/年`;

    navigator.clipboard.writeText(text);
  };

  // 建物用途別基準エネルギー消費量を取得
  const getStandardEnergyByType = (buildingType) => {
    const standards = {
      office: { heating: 38.0, cooling: 38.0, ventilation: 28.0, hot_water: 3.0, lighting: 70.0, elevator: 14.0 },
      hotel: { heating: 54.0, cooling: 54.0, ventilation: 28.0, hot_water: 176.0, lighting: 70.0, elevator: 14.0 },
      hospital: { heating: 72.0, cooling: 72.0, ventilation: 89.0, hot_water: 176.0, lighting: 98.0, elevator: 14.0 },
      shop_department: { heating: 20.0, cooling: 20.0, ventilation: 28.0, hot_water: 3.0, lighting: 126.0, elevator: 14.0 },
      shop_supermarket: { heating: 20.0, cooling: 20.0, ventilation: 28.0, hot_water: 3.0, lighting: 140.0, elevator: 14.0 },
      school_small: { heating: 58.0, cooling: 23.0, ventilation: 14.0, hot_water: 17.0, lighting: 49.0, elevator: 2.0 },
      school_high: { heating: 58.0, cooling: 30.0, ventilation: 14.0, hot_water: 17.0, lighting: 49.0, elevator: 2.0 },
      school_university: { heating: 43.0, cooling: 30.0, ventilation: 14.0, hot_water: 17.0, lighting: 49.0, elevator: 14.0 },
      restaurant: { heating: 54.0, cooling: 54.0, ventilation: 117.0, hot_water: 105.0, lighting: 105.0, elevator: 14.0 },
      assembly: { heating: 38.0, cooling: 38.0, ventilation: 28.0, hot_water: 17.0, lighting: 70.0, elevator: 14.0 },
      factory: { heating: 72.0, cooling: 20.0, ventilation: 28.0, hot_water: 17.0, lighting: 70.0, elevator: 14.0 },
      residential_collective: { heating: 38.0, cooling: 38.0, ventilation: 14.0, hot_water: 105.0, lighting: 42.0, elevator: 14.0 }
    };
    return standards[buildingType] || standards.office;
  };

  // 地域別補正係数を取得
  const getRegionalFactors = (climateZone) => {
    const factors = {
      1: { heating: 2.38, cooling: 0.66 },
      2: { heating: 2.01, cooling: 0.69 },
      3: { heating: 1.54, cooling: 0.86 },
      4: { heating: 1.16, cooling: 0.99 },
      5: { heating: 1.07, cooling: 1.07 },
      6: { heating: 0.84, cooling: 1.15 },
      7: { heating: 0.70, cooling: 1.27 },
      8: { heating: 0.36, cooling: 1.35 }
    };
    return factors[parseInt(climateZone)] || factors[6];
  };

  // 規模補正係数を取得（簡易版）
  const getScaleFactor = (buildingType, floorArea) => {
    const area = parseFloat(floorArea) || 0;
    // 簡易的な規模補正（実際はより複雑）
    if (area < 300) return '1.00';
    if (area < 1000) return '0.95';
    if (area < 5000) return '0.90';
    if (area < 10000) return '0.85';
    return '0.80';
  };

  // UA値基準値を取得
  const getUAValueStandard = (climateZone) => {
    const standards = {
      1: '0.46',
      2: '0.46',
      3: '0.56',
      4: '0.75',
      5: '0.87',
      6: '0.87',
      7: '0.87',
      8: '0.87'
    };
    return standards[parseInt(climateZone)] || '0.87';
  };

  // ηAC値基準値を取得
  const getEtaACValueStandard = (climateZone) => {
    const standards = {
      1: '4.6',
      2: '4.6',
      3: '3.5',
      4: '3.2',
      5: '3.2',
      6: '2.8',
      7: '2.7',
      8: '6.7'
    };
    return standards[parseInt(climateZone)] || '2.8';
  };

  const downloadResults = () => {
    if (!result) return;

    const data = {
      calculation_date: new Date().toISOString(),
      building_info: {
        type: formData.building_type,
        climate_zone: formData.climate_zone,
        floor_area: formData.floor_area,
        renewable_energy: formData.renewable_energy
      },
      design_energy: formData.design_energy,
      calculation_basis: {
        standard_energy_consumption: getStandardEnergyByType(formData.building_type),
        regional_factors: getRegionalFactors(formData.climate_zone),
        scale_factor: getScaleFactor(formData.building_type, formData.floor_area)
      },
      result: result,
      legal_basis: [
        '建築物のエネルギー消費性能の向上に関する法律（建築物省エネ法）',
        '国土交通省告示第1396号（平成28年1月29日）',
        'モデル建物法による標準入力法（平成28年国土交通省告示第265号）'
      ]
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bei-calculation-detailed-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <CalculatorLayout
      title="BEI計算"
      subtitle="建築物省エネ法の省エネ基準適合性判定 - 初心者でも簡単に計算できます"
      icon={FaCalculator}
      backUrl="/tools"
      backText="計算ツール一覧に戻る"
    >
      <div className="max-w-6xl mx-auto">
        {/* プロジェクト管理 */}
        <ProjectManager
          currentProject={currentProject}
          onProjectSelect={setCurrentProject}
          onNewProject={handleNewProject}
          onProjectLoad={handleProjectLoad}
        />

        {/* プロジェクト情報フォーム */}
        <ProjectInfoForm
          projectInfo={projectInfo}
          onProjectInfoChange={setProjectInfo}
        />

        {/* 初心者向けガイダンス */}
        <div className="bg-warm-50 border border-primary-200 rounded-xl p-6 mb-8">
          <div className="flex items-start space-x-3">
            <div className="bg-primary-100 rounded-full p-2">
              <FaLightbulb className="text-primary-700 text-lg" />
            </div>
            <div>
              <h3 className="font-semibold text-primary-800 mb-2">初めての方へ - BEI計算とは？</h3>
              <div className="text-sm text-primary-700 space-y-2">
                <p>
                  <strong>BEI（Building Energy Index）</strong>は、建築物省エネ法で定められた「建物の省エネ性能を表す指標」です。
                </p>
                <div className="bg-white bg-opacity-50 rounded-lg p-3 space-y-1">
                  <p><strong>BEI &le; 1.0</strong> → 省エネ基準適合（OK）</p>
                  <p><strong>BEI &gt; 1.0</strong> → 省エネ基準不適合（要改善）</p>
                </div>
                <p>
                  <strong>こんな工事で必要：</strong>エレベーター設置・更新、照明更新、空調更新、給湯設備更新など
                </p>
                <p>
                  <strong>必要な情報：</strong>建物用途、地域、面積、年間エネルギー消費量（設計値）
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* サンプルデータ選択 */}
        <div className="mb-8">
          <div className="bg-warm-50 border border-primary-200 rounded-lg p-6">
            <div className="flex items-center space-x-2 mb-4">
              <FaLightbulb className="text-accent-500 text-lg" />
              <h3 className="font-semibold text-primary-800">サンプルデータで試してみる</h3>
            </div>
            <p className="text-sm text-primary-600 mb-4">
              実際の建築事例を参考にしたサンプルデータを使って、すぐに計算結果を確認できます。
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                onClick={() => applySampleData('office_small')}
                className="text-left p-4 bg-white border border-primary-200 rounded-lg hover:border-accent-300 hover:shadow-md transition-all duration-200"
              >
                <div className="font-medium text-primary-900 mb-1">小規模事務所ビル</div>
                <div className="text-xs text-primary-500 mb-2">延床面積: 1,200m² / 地域区分: 6</div>
                <div className="text-xs text-accent-500">ZEB Ready仕様</div>
              </button>
              <button
                onClick={() => applySampleData('hotel_medium')}
                className="text-left p-4 bg-white border border-primary-200 rounded-lg hover:border-accent-300 hover:shadow-md transition-all duration-200"
              >
                <div className="font-medium text-primary-900 mb-1">中規模ホテル</div>
                <div className="text-xs text-primary-500 mb-2">延床面積: 3,500m² / 地域区分: 5</div>
                <div className="text-xs text-accent-500">高効率設備導入</div>
              </button>
              <button
                onClick={() => applySampleData('mixed_complex')}
                className="text-left p-4 bg-white border border-primary-200 rounded-lg hover:border-accent-300 hover:shadow-md transition-all duration-200"
              >
                <div className="font-medium text-primary-900 mb-1">複合用途ビル</div>
                <div className="text-xs text-primary-500 mb-2">延床面積: 2,800m² / 地域区分: 4</div>
                <div className="text-xs text-accent-500">商業+事務所</div>
              </button>
            </div>
          </div>
        </div>

        {/* ステップインジケーター */}
        <div className="mb-8">
          {formData.calculation_method === 'model_building' ? (
            // モデル建物法（4ステップ）
            <>
              <div className="flex items-center justify-between max-w-lg mx-auto">
                {[1, 2, 3, 4].map((step) => (
                  <div key={step} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      currentStep >= step
                        ? 'bg-primary-700 text-white'
                        : 'bg-primary-200 text-primary-500'
                    }`}>
                      {currentStep > step ? <FaCheckCircle /> : step}
                    </div>
                    {step < 4 && (
                      <div className={`w-16 h-0.5 ${
                        currentStep > step ? 'bg-primary-700' : 'bg-primary-200'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-between max-w-lg mx-auto mt-2 text-xs text-primary-500">
                <span>基本情報</span>
                <span>設計値</span>
                <span>再エネ</span>
                <span>結果</span>
              </div>
            </>
          ) : (
            // 標準入力法（5ステップ）
            <>
              <div className="flex items-center justify-between max-w-md mx-auto">
                {[1, 2, 3, 4, 5].map((step) => (
                  <div key={step} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      currentStep >= step
                        ? 'bg-primary-700 text-white'
                        : 'bg-primary-200 text-primary-500'
                    }`}>
                      {currentStep > step ? <FaCheckCircle /> : step}
                    </div>
                    {step < 5 && (
                      <div className={`w-12 h-0.5 ${
                        currentStep > step ? 'bg-primary-700' : 'bg-primary-200'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-between max-w-md mx-auto mt-2 text-xs text-primary-500">
                <span>基本情報</span>
                <span>外皮性能</span>
                <span>設計値</span>
                <span>再エネ</span>
                <span>結果</span>
              </div>
            </>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            {/* ステップ1: 基本情報 */}
            {currentStep >= 1 && (
              <FormSection
                title="ステップ1: 建物基本情報"
                icon={FaBuilding}
              >
                {/* 計算方法選択 */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-primary-700 mb-3">
                    どちらの計算方法を使いますか？
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-start space-x-3 p-4 border-2 border-accent-200 bg-accent-50 rounded-lg cursor-pointer hover:bg-accent-100">
                      <input
                        type="radio"
                        name="calculation_method"
                        value="model_building"
                        checked={formData.calculation_method === 'model_building'}
                        onChange={(e) => {
                          setFormData({...formData, calculation_method: e.target.value});
                          setValidationErrors({});
                        }}
                        className="mt-0.5"
                      />
                      <div>
                        <div className="font-semibold text-primary-800 flex items-center space-x-2">
                          <span>モデル建物法</span>
                          <span className="bg-accent-500 text-white text-xs px-2 py-1 rounded-full">推奨・簡単</span>
                        </div>
                        <div className="text-sm text-primary-700 mt-1">
                          <strong>初心者にオススメ！</strong> 建物用途を選ぶだけの簡単計算
                        </div>
                        <div className="text-xs text-primary-600 mt-2 space-y-1">
                          <p>・<strong>入力簡単：</strong>建物用途、地域、面積、エネルギー消費量のみ</p>
                          <p>・<strong>外皮不要：</strong>UA値・ηAC値などの複雑な外皮性能計算は不要</p>
                          <p>・<strong>工事対応：</strong>エレベーター、照明、空調更新など幅広く対応</p>
                        </div>
                      </div>
                    </label>
                    <label className="flex items-start space-x-3 p-4 border border-primary-200 rounded-lg cursor-not-allowed opacity-50">
                      <input
                        type="radio"
                        name="calculation_method"
                        value="standard_input"
                        checked={formData.calculation_method === 'standard_input'}
                        onChange={(e) => {
                          setFormData({...formData, calculation_method: e.target.value});
                          setValidationErrors({});
                        }}
                        className="mt-0.5"
                        disabled
                      />
                      <div>
                        <div className="font-medium text-primary-900 flex items-center space-x-2">
                          <span>標準入力法</span>
                          <span className="bg-primary-400 text-white text-xs px-2 py-1 rounded-full">未実装</span>
                        </div>
                        <div className="text-sm text-primary-500 mt-1">
                          外皮性能の詳細計算が必要な上級者向け計算（将来実装予定）
                        </div>
                        <div className="text-xs text-primary-400 mt-2">
                          ・UA値・ηAC値・壁や窓の詳細仕様が必要
                        </div>
                      </div>
                    </label>
                  </div>

                  <div className="mt-4 p-3 bg-warm-50 border border-primary-200 rounded-lg">
                    <div className="text-sm text-primary-700">
                      <strong>迷ったら「モデル建物法」を選択！</strong>
                      ほとんどの工事でこちらで十分です。
                    </div>
                  </div>
                </div>

                {/* ガイダンス */}
                <div className="bg-warm-50 border border-primary-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start space-x-2">
                    <FaLightbulb className="text-accent-500 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-primary-700">
                      <strong>モデル建物法について：</strong>
                      建物用途と地域区分、設計一次エネルギー消費量のみで計算します。
                      外皮性能（UA値・ηAC値）の入力は不要です。
                      EVのみの工事など、外皮に関わらない工事でも対応できます。
                    </div>
                  </div>
                </div>

                {/* 建物用途タイプ選択 */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-primary-700 mb-3">
                    建物の用途構成
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="use_type"
                        checked={!formData.is_mixed_use}
                        onChange={() => {
                          setFormData({...formData, is_mixed_use: false, building_type: '', mixed_uses: [{use_type: '', area_m2: '', area_share: ''}]});
                          setValidationErrors({});
                        }}
                        className="mr-2"
                      />
                      <span>単一用途</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="use_type"
                        checked={formData.is_mixed_use}
                        onChange={() => {
                          setFormData({...formData, is_mixed_use: true, building_type: '', mixed_uses: [{use_type: '', area_m2: '', area_share: ''}]});
                          setValidationErrors({});
                        }}
                        className="mr-2"
                      />
                      <span>複合用途</span>
                    </label>
                  </div>
                </div>

                {/* 単一用途の場合 */}
                {!formData.is_mixed_use && (
                  <>
                    <BuildingTypeSelector
                      value={formData?.building_type || ''}
                      onChange={(value) => {
                        setFormData({...formData, building_type: value});
                        setValidationErrors({...validationErrors, building_type: ''});
                      }}
                      className={validationErrors.building_type ? 'border-red-500' : ''}
                    />
                    {validationErrors.building_type && (
                      <p className="text-red-600 text-sm mt-1">{validationErrors.building_type}</p>
                    )}
                  </>
                )}

                {/* 複合用途の場合 */}
                {formData.is_mixed_use && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-medium text-primary-700">
                        用途別構成
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            mixed_uses: [...formData.mixed_uses, {use_type: '', area_m2: '', area_share: ''}]
                          });
                        }}
                        className="text-accent-500 hover:text-accent-600 text-sm font-medium"
                      >
                        + 用途を追加
                      </button>
                    </div>

                    {formData.mixed_uses.map((use, index) => (
                      <div key={index} className="border border-primary-200 rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-primary-900">用途 {index + 1}</h4>
                          {formData.mixed_uses.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const newUses = formData.mixed_uses.filter((_, i) => i !== index);
                                setFormData({...formData, mixed_uses: newUses});
                              }}
                              className="text-red-600 hover:text-red-700 text-sm"
                            >
                              削除
                            </button>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-primary-700 mb-1">
                            建物用途
                          </label>
                          <BuildingTypeSelector
                            value={use?.use_type || ''}
                            onChange={(value) => {
                              const newUses = [...formData.mixed_uses];
                              newUses[index].use_type = value;
                              setFormData({...formData, mixed_uses: newUses});
                              setValidationErrors({...validationErrors, [`mixed_use_${index}_type`]: ''});
                            }}
                            className={validationErrors[`mixed_use_${index}_type`] ? 'border-red-500' : ''}
                            compact={true}
                          />
                          {validationErrors[`mixed_use_${index}_type`] && (
                            <p className="text-red-600 text-sm mt-1">{validationErrors[`mixed_use_${index}_type`]}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-primary-700 mb-1">
                            面積 (m²)
                          </label>
                          <input
                            type="number"
                            value={use?.area_m2 || ''}
                            onChange={(e) => {
                              const newUses = [...formData.mixed_uses];
                              newUses[index].area_m2 = e.target.value;
                              // 面積割合も自動計算
                              if (formData.floor_area) {
                                newUses[index].area_share = (parseFloat(e.target.value) / parseFloat(formData.floor_area) * 100).toFixed(1);
                              }
                              setFormData({...formData, mixed_uses: newUses});
                              setValidationErrors({...validationErrors, [`mixed_use_${index}_area`]: ''});
                            }}
                            className={`w-full p-2 border rounded focus:ring-2 focus:ring-accent-400 focus:border-accent-400 ${
                              validationErrors[`mixed_use_${index}_area`] ? 'border-red-500' : 'border-primary-300'
                            }`}
                            placeholder="例: 500"
                            min="0"
                            step="0.1"
                          />
                          {validationErrors[`mixed_use_${index}_area`] && (
                            <p className="text-red-600 text-sm mt-1">{validationErrors[`mixed_use_${index}_area`]}</p>
                          )}
                          {use.area_share && (
                            <p className="text-primary-500 text-xs mt-1">
                              全体に占める割合: {use.area_share}%
                            </p>
                          )}
                        </div>
                      </div>
                    ))}

                    {validationErrors.mixed_use_total && (
                      <p className="text-red-600 text-sm">{validationErrors.mixed_use_total}</p>
                    )}

                    {/* 合計面積表示 */}
                    {formData.mixed_uses.some(use => use.area_m2) && (
                      <div className="bg-warm-50 border border-primary-200 rounded-lg p-3">
                        <div className="text-sm text-primary-700">
                          <strong>用途別面積の合計:</strong> {formData.mixed_uses.reduce((sum, use) => sum + (parseFloat(use.area_m2) || 0), 0).toLocaleString()} m²
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 地域区分選択 */}
                <ClimateZoneSelector
                  value={formData?.climate_zone || ''}
                  onChange={(value) => {
                    setFormData({...formData, climate_zone: value});
                    setValidationErrors({...validationErrors, climate_zone: ''});
                  }}
                  className={validationErrors.climate_zone ? 'border-red-500' : ''}
                />
                {validationErrors.climate_zone && (
                  <p className="text-red-600 text-sm mt-1">{validationErrors.climate_zone}</p>
                )}

                {/* 延床面積 */}
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <label className="block text-sm font-medium text-primary-700">
                      延床面積 (m²)
                    </label>
                    <HelpTooltip title="延床面積とは？">
                      建物の各階の床面積の合計です。
                      建築確認申請書や設計図書に記載されている数値を入力してください。
                    </HelpTooltip>
                  </div>
                  <input
                    type="number"
                    value={formData?.floor_area || ''}
                    onChange={(e) => {
                      setFormData({...formData, floor_area: e.target.value});
                      setValidationErrors({...validationErrors, floor_area: ''});
                    }}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-accent-400 focus:border-accent-400 ${
                      validationErrors.floor_area ? 'border-red-500' : 'border-primary-300'
                    }`}
                    placeholder="例: 1000"
                    min="1"
                    required
                  />
                  {validationErrors.floor_area && (
                    <p className="text-red-600 text-sm mt-1">{validationErrors.floor_area}</p>
                  )}
                  {formData.floor_area && (
                    <p className="text-primary-500 text-sm mt-1">
                      入力された延床面積: {Number(formData.floor_area).toLocaleString()} m²
                    </p>
                  )}
                </div>

                {/* 次へボタン */}
                {currentStep === 1 && (
                  <div className="flex justify-end pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        if (validateStep1()) {
                          setCurrentStep(2);
                        }
                      }}
                      className="bg-accent-500 hover:bg-accent-600 text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center space-x-2"
                    >
                      <span>次へ：{formData.calculation_method === 'model_building' ? '設計エネルギー値入力' : '外皮性能入力'}</span>
                      <FaArrowRight />
                    </button>
                  </div>
                )}
              </FormSection>
            )}

            {/* ステップ2: 外皮性能（標準入力法のみ） */}
            {currentStep >= 2 && formData.calculation_method === 'standard_input' && (
              <FormSection
                title="ステップ2: 外皮性能"
                icon={FaBuilding}
              >
                {/* ガイダンス */}
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start space-x-2">
                    <FaLightbulb className="text-orange-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-orange-800">
                      <strong>外皮性能について：</strong>
                      建物の断熱・遮熱性能を表す指標です。建物の用途に応じて必要な項目を入力してください。
                      これらの値は外皮計算書または設計図書から確認できます。
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* UA値 */}
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <label className="block text-sm font-medium text-primary-700">
                        UA値（外皮平均熱貫流率） [W/(m²·K)]
                      </label>
                      <HelpTooltip title="UA値とは？">
                        建物の外皮（屋根、外壁、窓等）の熱の通しやすさの平均値です。
                        値が小さいほど断熱性能が良好です。省エネ基準では地域ごとに基準値が設定されています。
                      </HelpTooltip>
                    </div>
                    <input
                      type="number"
                      value={formData?.envelope_performance?.ua_value || ''}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          envelope_performance: {
                            ...formData.envelope_performance,
                            ua_value: e.target.value
                          }
                        });
                        setValidationErrors({...validationErrors, ua_value: ''});
                        // リアルタイム検証を実行
                        const updatedFormData = {
                          ...formData,
                          envelope_performance: {
                            ...formData.envelope_performance,
                            ua_value: e.target.value
                          }
                        };
                        runInputValidation(updatedFormData);
                      }}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-accent-400 focus:border-accent-400 ${
                        validationErrors.ua_value ? 'border-red-500' : 'border-primary-300'
                      }`}
                      placeholder="例: 0.60"
                      min="0"
                      step="0.01"
                    />
                    {validationErrors.ua_value && (
                      <p className="text-red-600 text-sm mt-1">{validationErrors.ua_value}</p>
                    )}
                    {formData.climate_zone && (
                      <p className="text-primary-500 text-sm mt-1">
                        {formData.climate_zone}地域の基準値: {getUAValueStandard(formData.climate_zone)} W/(m²·K)以下
                      </p>
                    )}
                    {validationWarnings.ua_value && (
                      <ValidationAlert warnings={validationWarnings.ua_value} />
                    )}
                  </div>

                  {/* ηAC値（住宅のみ） */}
                  {formData.building_type === 'residential_collective' && (
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <label className="block text-sm font-medium text-primary-700">
                          ηAC値（平均日射熱取得率） [-]
                        </label>
                        <HelpTooltip title="ηAC値とは？">
                          冷房期において、建物の外皮が日射をどの程度室内に取得するかを表す指標です。
                          値が小さいほど遮熱性能が良好です。主に窓の性能に大きく依存します。
                        </HelpTooltip>
                      </div>
                      <input
                        type="number"
                        value={formData?.envelope_performance?.eta_ac_value || ''}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            envelope_performance: {
                              ...formData.envelope_performance,
                              eta_ac_value: e.target.value
                            }
                          });
                          setValidationErrors({...validationErrors, eta_ac_value: ''});
                          // リアルタイム検証を実行
                          const updatedFormData = {
                            ...formData,
                            envelope_performance: {
                              ...formData.envelope_performance,
                              eta_ac_value: e.target.value
                            }
                          };
                          runInputValidation(updatedFormData);
                        }}
                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-accent-400 focus:border-accent-400 ${
                          validationErrors.eta_ac_value ? 'border-red-500' : 'border-primary-300'
                        }`}
                        placeholder="例: 2.8"
                        min="0"
                        step="0.1"
                      />
                      {validationErrors.eta_ac_value && (
                        <p className="text-red-600 text-sm mt-1">{validationErrors.eta_ac_value}</p>
                      )}
                      {formData.climate_zone && (
                        <p className="text-primary-500 text-sm mt-1">
                          {formData.climate_zone}地域の基準値: {getEtaACValueStandard(formData.climate_zone)}以下
                        </p>
                      )}
                      {validationWarnings.eta_ac_value && (
                        <ValidationAlert warnings={validationWarnings.eta_ac_value} />
                      )}
                    </div>
                  )}
                </div>

                {/* ナビゲーションボタン */}
                {currentStep === 2 && (
                  <div className="flex justify-between pt-4">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                    >
                      戻る
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (validateStep2()) {
                          setCurrentStep(3);
                        }
                      }}
                      className="bg-accent-500 hover:bg-accent-600 text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center space-x-2"
                    >
                      <span>次へ：設計エネルギー値入力</span>
                      <FaArrowRight />
                    </button>
                  </div>
                )}
              </FormSection>
            )}

            {/* ステップ3: 設計エネルギー値 */}
            {currentStep >= (formData.calculation_method === 'model_building' ? 2 : 3) && (
              <FormSection
                title={formData.calculation_method === 'model_building' ? "ステップ2: 設計一次エネルギー消費量" : "ステップ3: 設計一次エネルギー消費量"}
                icon={FaChartLine}
              >
                {/* ガイダンス */}
                <div className="bg-warm-50 border border-primary-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start space-x-2">
                    <FaLightbulb className="text-accent-500 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-primary-700 space-y-2">
                      <p>
                        <strong>設計エネルギー消費量の入力</strong>
                      </p>
                      <p>
                        設計・計画している建物の<strong>年間エネルギー消費量</strong>を用途別に入力してください。
                      </p>
                      <div className="bg-white bg-opacity-60 rounded p-3 text-xs space-y-1">
                        <p><strong>数値の探し方：</strong></p>
                        <p>・<strong>省エネ計算書</strong>の「設計一次エネルギー消費量」欄</p>
                        <p>・<strong>エネルギーシミュレーション</strong>の結果</p>
                        <p>・<strong>設備設計図書</strong>の年間消費量計算</p>
                        <p>・<strong>既存建物</strong>の場合：過去の実績値 + 改修効果</p>
                      </div>
                      <p className="text-primary-600">
                        <strong>単位注意：</strong>すべて <strong>MJ/年</strong> で入力してください
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {Object.entries(formData.design_energy).map(([key, value]) => (
                    <div key={key}>
                      <div className="flex items-center space-x-2 mb-2">
                        <label className="block text-sm font-medium text-primary-700">
                          {getEnergyFieldLabel(key)} (MJ/年)
                        </label>
                        <HelpTooltip title={`${getEnergyFieldLabel(key)}について`}>
                          {key === 'heating' && '暖房設備による年間一次エネルギー消費量'}
                          {key === 'cooling' && '冷房設備による年間一次エネルギー消費量'}
                          {key === 'ventilation' && '機械換気設備による年間一次エネルギー消費量'}
                          {key === 'hot_water' && '給湯設備による年間一次エネルギー消費量'}
                          {key === 'lighting' && '照明設備による年間一次エネルギー消費量'}
                          {key === 'elevator' && '昇降機による年間一次エネルギー消費量'}
                        </HelpTooltip>
                      </div>
                      <input
                        type="number"
                        value={value}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            design_energy: {
                              ...formData.design_energy,
                              [key]: e.target.value
                            }
                          });
                          setValidationErrors({...validationErrors, [key]: ''});
                        }}
                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-accent-400 focus:border-accent-400 ${
                          validationErrors[key] ? 'border-red-500' : 'border-primary-300'
                        }`}
                        placeholder="0"
                        min="0"
                        step="0.1"
                        required
                      />
                      {validationErrors[key] && (
                        <p className="text-red-600 text-sm mt-1">{validationErrors[key]}</p>
                      )}
                      {validationWarnings[`design_energy_${key}`] && (
                        <ValidationAlert warnings={validationWarnings[`design_energy_${key}`]} />
                      )}
                    </div>
                  ))}
                </div>

                {/* ナビゲーションボタン */}
                {currentStep === (formData.calculation_method === 'model_building' ? 2 : 3) && (
                  <div className="flex justify-between pt-4">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                    >
                      戻る
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (validateStep3()) {
                          setCurrentStep(formData.calculation_method === 'model_building' ? 3 : 4);
                        }
                      }}
                      className="bg-accent-500 hover:bg-accent-600 text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center space-x-2"
                    >
                      <span>次へ：再エネ控除</span>
                      <FaArrowRight />
                    </button>
                  </div>
                )}
              </FormSection>
            )}

            {/* ステップ3/4: 再エネ控除 */}
            {currentStep >= (formData.calculation_method === 'model_building' ? 3 : 4) && (
              <FormSection
                title={formData.calculation_method === 'model_building' ? "ステップ3: 再生可能エネルギー控除" : "ステップ4: 再生可能エネルギー控除"}
                icon={FaLightbulb}
              >
                {/* ガイダンス */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start space-x-2">
                    <FaLightbulb className="text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-yellow-800">
                      <strong>再エネ控除について：</strong>
                      建物に設置された再生可能エネルギー設備（太陽光発電等）による
                      年間発電量を一次エネルギー消費量から控除できます。控除量がない場合は0を入力してください。
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <label className="block text-sm font-medium text-primary-700">
                      再エネ控除量 (MJ/年)
                    </label>
                    <HelpTooltip title="再エネ控除の計算方法">
                      太陽光発電等の年間発電量(kWh) × 9.76(一次エネルギー換算係数) ÷ 1000 × 3.6
                      で算出できます。設備がない場合は0を入力してください。
                    </HelpTooltip>
                  </div>
                  <input
                    type="number"
                    value={formData?.renewable_energy || ''}
                    onChange={(e) => setFormData({...formData, renewable_energy: e.target.value})}
                    className="w-full p-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-accent-400 focus:border-accent-400"
                    placeholder="0"
                    min="0"
                    step="0.1"
                  />
                  <p className="text-primary-500 text-sm mt-1">
                    設備がない場合は0のままでも計算できます
                  </p>
                  {validationWarnings.renewable_energy && (
                    <ValidationAlert warnings={validationWarnings.renewable_energy} />
                  )}
                </div>

                {/* 検証結果サマリー */}
                {Object.keys(validationWarnings).length > 0 && (
                  <ValidationSummary validationResults={validationWarnings} />
                )}

                {/* ナビゲーションボタン */}
                {currentStep === (formData.calculation_method === 'model_building' ? 3 : 4) && (
                  <div className="flex flex-wrap justify-between items-center pt-4 gap-4">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(formData.calculation_method === 'model_building' ? 2 : 3)}
                      className="bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                    >
                      戻る
                    </button>

                    <div className="flex space-x-4">
                      <button
                        type="button"
                        onClick={handleSaveProject}
                        className="bg-primary-700 hover:bg-primary-800 text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center space-x-2"
                      >
                        <FaDownload />
                        <span>保存</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleCalculate}
                        disabled={isLoading}
                        className="bg-accent-500 hover:bg-accent-600 disabled:bg-primary-400 text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center space-x-2"
                      >
                        {isLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>計算中...</span>
                          </>
                        ) : (
                          <>
                            <FaCalculator />
                            <span>BEI計算実行</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </FormSection>
            )}

            {/* エラー表示 */}
            {validationErrors.api && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <FaExclamationTriangle className="text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-red-800">
                    {validationErrors.api}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 結果表示 */}
          <div className="space-y-6">
            {result && (
              <ResultCard
                title="BEI計算結果"
                icon={FaChartLine}
                onCopy={copyResults}
                onDownload={downloadResults}
              >
                {/* BEI値と適合判定 - SEMANTIC green/red kept */}
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold mb-2">
                    <span className={result.is_compliant ? 'text-green-600' : 'text-red-600'}>
                      {typeof result.bei === 'number' ? formatBEI(result.bei) : result.bei}
                    </span>
                  </div>
                  <div className="text-sm text-primary-500 mb-4">BEI値 (Building Energy Index)</div>

                  <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                    result.is_compliant
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {result.is_compliant ? (
                      <>
                        <FaCheckCircle className="mr-2" />
                        省エネ基準適合
                      </>
                    ) : (
                      <>
                        <FaExclamationTriangle className="mr-2" />
                        省エネ基準不適合
                      </>
                    )}
                  </div>
                </div>

                {/* 詳細結果 */}
                <div className="space-y-6">
                  {/* エネルギー消費量比較 */}
                  <div className="grid grid-cols-1 gap-4">
                    <div className="bg-accent-50 p-4 rounded-lg">
                      <div className="text-sm font-medium text-accent-700 mb-1">設計一次エネルギー消費量</div>
                      <div className="text-2xl font-bold text-primary-800 mb-2">
                        {result.design_primary_energy_mj?.toLocaleString()} MJ/年
                      </div>
                      {formData.renewable_energy && parseFloat(formData.renewable_energy) > 0 && (
                        <div className="text-xs text-accent-600">
                          再エネ控除: -{parseFloat(formData.renewable_energy).toLocaleString()} MJ/年
                        </div>
                      )}
                    </div>

                    <div className="bg-warm-50 p-4 rounded-lg">
                      <div className="text-sm font-medium text-primary-700 mb-1">基準一次エネルギー消費量</div>
                      <div className="text-2xl font-bold text-primary-900">
                        {result.standard_primary_energy_mj?.toLocaleString()} MJ/年
                      </div>
                      <div className="text-xs text-primary-600 mt-1">
                        モデル建物法による算定値
                      </div>
                    </div>
                  </div>

                  {/* 総合評価と改善提案 - SEMANTIC colors kept for performance levels */}
                  {result.suggestions && result.suggestions.length > 0 && (
                    <div className={`border rounded-lg p-4 ${
                      result.performance_level === 'excellent' ? 'bg-green-50 border-green-200' :
                      result.performance_level === 'very_good' ? 'bg-accent-50 border-accent-200' :
                      result.performance_level === 'good' ? 'bg-accent-50 border-accent-200' :
                      result.performance_level === 'needs_improvement' ? 'bg-yellow-50 border-yellow-200' :
                      'bg-red-50 border-red-200'
                    }`}>
                      <h4 className={`font-medium mb-3 flex items-center ${
                        result.performance_level === 'excellent' ? 'text-green-700' :
                        result.performance_level === 'very_good' ? 'text-accent-600' :
                        result.performance_level === 'good' ? 'text-accent-600' :
                        result.performance_level === 'needs_improvement' ? 'text-yellow-700' :
                        'text-red-700'
                      }`}>
                        <FaLightbulb className="mr-2" />
                        総合評価・改善提案
                      </h4>
                      <div className="space-y-2">
                        {result.suggestions.map((suggestion, index) => (
                          <div key={index} className={`text-sm p-2 rounded ${
                            result.performance_level === 'excellent' ? 'bg-green-100 text-green-800' :
                            result.performance_level === 'very_good' ? 'bg-accent-100 text-accent-800' :
                            result.performance_level === 'good' ? 'bg-accent-100 text-accent-800' :
                            result.performance_level === 'needs_improvement' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {suggestion}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 計算根拠詳細 */}
                  <div className="bg-white border border-primary-200 rounded-lg p-4">
                    <h4 className="font-medium text-primary-800 mb-3 flex items-center">
                      <FaCalculator className="mr-2 text-primary-700" />
                      計算根拠詳細
                    </h4>

                    {/* 基準エネルギー消費量内訳 */}
                    <div className="mb-4">
                      <div className="text-sm font-medium text-primary-700 mb-2">基準エネルギー消費量内訳 (MJ/m²年)</div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                        <div className="bg-orange-50 p-2 rounded">
                          <div className="text-orange-800 font-medium">暖房</div>
                          <div className="text-orange-900">{getStandardEnergyByType(formData.building_type)?.heating || '-'}</div>
                        </div>
                        <div className="bg-primary-50 p-2 rounded">
                          <div className="text-primary-700 font-medium">冷房</div>
                          <div className="text-primary-800">{getStandardEnergyByType(formData.building_type)?.cooling || '-'}</div>
                        </div>
                        <div className="bg-warm-100 p-2 rounded">
                          <div className="text-primary-700 font-medium">換気</div>
                          <div className="text-primary-800">{getStandardEnergyByType(formData.building_type)?.ventilation || '-'}</div>
                        </div>
                        <div className="bg-accent-50 p-2 rounded">
                          <div className="text-accent-700 font-medium">給湯</div>
                          <div className="text-accent-800">{getStandardEnergyByType(formData.building_type)?.hot_water || '-'}</div>
                        </div>
                        <div className="bg-yellow-50 p-2 rounded">
                          <div className="text-yellow-800 font-medium">照明</div>
                          <div className="text-yellow-900">{getStandardEnergyByType(formData.building_type)?.lighting || '-'}</div>
                        </div>
                        <div className="bg-warm-50 p-2 rounded">
                          <div className="text-primary-700 font-medium">昇降機</div>
                          <div className="text-primary-800">{getStandardEnergyByType(formData.building_type)?.elevator || '-'}</div>
                        </div>
                      </div>
                    </div>

                    {/* 設計値と基準値の比較分析 */}
                    <div className="mb-4">
                      <div className="text-sm font-medium text-primary-700 mb-3">設計値分析・参考コメント</div>
                      <div className="space-y-2 text-xs">
                        {Object.entries(formData.design_energy).map(([key, value]) => {
                          if (!value || value === '') return null;

                          const designValuePerM2 = parseFloat(value) / parseFloat(formData.floor_area || 1000);
                          const analysis = analyzeEnergyConsumption(designValuePerM2, formData.building_type, key);

                          return (
                            <div key={key} className={`${analysis.bgColor} border-l-4 border-current p-3 rounded-r`}>
                              <div className={`flex items-center ${analysis.color} mb-1`}>
                                <span className="mr-2">{analysis.icon}</span>
                                <span className="font-medium">{getEnergyTypeName(key)}</span>
                                <span className="ml-auto">
                                  {designValuePerM2.toFixed(1)} MJ/m²年
                                </span>
                              </div>
                              <div className={`${analysis.color.replace('600', '700')} text-xs`}>
                                {analysis.comment}
                              </div>
                              {analysis.detail && (
                                <div className={`${analysis.color.replace('600', '600')} text-xs mt-1 opacity-80`}>
                                  {analysis.detail}
                                </div>
                              )}
                              {/* 改善提案 */}
                              {analysis.level === 'high' || analysis.level === 'very_high' ? (
                                <div className="mt-2 pt-2 border-t border-current opacity-20">
                                  <div className="text-xs font-medium mb-1">改善案:</div>
                                  <ul className="text-xs space-y-1">
                                    {getImprovementSuggestions(key, analysis.level).slice(0, 2).map((suggestion, idx) => (
                                      <li key={idx}>・{suggestion}</li>
                                    ))}
                                  </ul>
                                </div>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* 補正係数情報 */}
                    <div className="mb-4">
                      <div className="text-sm font-medium text-primary-700 mb-2">適用された補正係数</div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div className="bg-primary-50 p-3 rounded">
                          <div className="font-medium text-primary-700 mb-1">地域補正係数 ({formData.climate_zone}地域)</div>
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span>暖房:</span>
                              <span className="font-medium">{getRegionalFactors(formData.climate_zone)?.heating || '-'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>冷房:</span>
                              <span className="font-medium">{getRegionalFactors(formData.climate_zone)?.cooling || '-'}</span>
                            </div>
                          </div>
                        </div>
                        <div className="bg-warm-50 p-3 rounded">
                          <div className="font-medium text-primary-700 mb-1">規模補正係数</div>
                          <div className="text-primary-800">
                            延床面積 {Number(formData.floor_area).toLocaleString()}m²<br />
                            係数: {getScaleFactor(formData.building_type, formData.floor_area)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 計算式 */}
                    <div className="bg-yellow-50 p-3 rounded">
                      <div className="text-sm font-medium text-yellow-800 mb-2">BEI計算式</div>
                      <div className="text-xs text-yellow-900 space-y-1">
                        <div><strong>BEI = 設計一次エネルギー消費量 ÷ 基準一次エネルギー消費量</strong></div>
                        <div>= {result.design_primary_energy_mj?.toLocaleString()} ÷ {result.standard_primary_energy_mj?.toLocaleString()}</div>
                        <div>= <strong>{formatBEI(result.bei)}</strong></div>
                        <div className="mt-2 pt-2 border-t border-yellow-200">
                          判定基準: BEI ≤ 1.0 で省エネ基準適合
                        </div>
                      </div>
                    </div>

                    {/* 法的根拠 */}
                    <div className="mt-4 pt-4 border-t border-primary-200">
                      <div className="text-xs text-primary-500">
                        <strong>法的根拠:</strong><br />
                        ・建築物のエネルギー消費性能の向上に関する法律（建築物省エネ法）<br />
                        ・国土交通省告示第1396号（平成28年1月29日）<br />
                        ・モデル建物法による標準入力法（平成28年国土交通省告示第265号）
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="text-sm text-yellow-800">
                      <strong>※ ご注意</strong><br />
                      この計算結果は目安です。実際の省エネ法適合性判定には、所管行政庁が認める評価方法による詳細計算が必要な場合があります。
                    </div>
                  </div>
                </div>

                {/* 行動ボタン群 */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowReport(true)}
                    className="flex-1 bg-accent-500 hover:bg-accent-600 text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    <FaFileAlt />
                    <span>審査機関向け計算書</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentStep(1);
                      setResult(null);
                      setValidationErrors({});
                      setShowReport(false);
                    }}
                    className="flex-1 bg-primary-700 hover:bg-primary-800 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                  >
                    新しい計算を開始
                  </button>
                </div>
              </ResultCard>
            )}

            {/* 入力内容サマリー */}
            {(formData.building_type || formData.climate_zone || formData.floor_area) && !result && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <FaBuilding className="mr-3 text-primary-700" />
                  入力内容
                </h3>
                <div className="space-y-2 text-sm">
                  {formData.building_type && (
                    <div><span className="font-medium">建物用途:</span> {formData.building_type}</div>
                  )}
                  {formData.climate_zone && (
                    <div><span className="font-medium">地域区分:</span> {formData.climate_zone}地域</div>
                  )}
                  {formData.floor_area && (
                    <div><span className="font-medium">延床面積:</span> {Number(formData.floor_area).toLocaleString()} m²</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 審査機関向け計算書モーダル */}
        {showReport && result && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-6xl max-h-[90vh] overflow-auto">
              <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
                <h2 className="text-xl font-bold">建築物省エネ法 適合性判定申請書</h2>
                <div className="flex space-x-2">
                  <button
                    onClick={() => window.print()}
                    className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded flex items-center space-x-2"
                  >
                    <FaPrint />
                    <span>印刷</span>
                  </button>
                  <button
                    onClick={() => setShowReport(false)}
                    className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded"
                  >
                    閉じる
                  </button>
                </div>
              </div>
              <ComplianceReport
                result={result}
                formData={formData}
                projectInfo={projectInfo}
                onDownload={downloadResults}
              />
            </div>
          </div>
        )}
      </div>
    </CalculatorLayout>
  );
}
