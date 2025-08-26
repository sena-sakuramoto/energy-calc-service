// frontend/src/components/BuildingTypeSelector.jsx
import { useState } from 'react';
import HelpTooltip from './HelpTooltip';
import { FaBuilding, FaHotel, FaHospitalAlt, FaStore, FaSchool, FaUtensils, FaUsers, FaIndustry, FaHome } from 'react-icons/fa';

const BUILDING_TYPES = [
  {
    id: "office",
    name: "事務所等",
    icon: FaBuilding,
    description: "オフィスビル、官公庁舎、銀行等",
    examples: ["オフィスビル", "官公庁舎", "銀行", "郵便局", "事務所"],
    energyProfile: {
      heating: 38.0,
      cooling: 38.0,
      lighting: 70.0,
      total: 191.0
    },
    characteristics: "照明・OA機器の使用が多く、平日昼間の使用が中心。"
  },
  {
    id: "hotel",
    name: "ホテル等",
    icon: FaHotel,
    description: "宿泊施設、旅館、民宿等",
    examples: ["ホテル", "旅館", "民宿", "ペンション", "ゲストハウス"],
    energyProfile: {
      heating: 54.0,
      cooling: 54.0,
      hot_water: 176.0,
      total: 396.0
    },
    characteristics: "24時間稼働で給湯負荷が非常に大きい。客室・共用部の空調が必要。"
  },
  {
    id: "hospital",
    name: "病院等",
    icon: FaHospitalAlt,
    description: "病院、診療所、老人ホーム等",
    examples: ["総合病院", "診療所", "老人ホーム", "介護施設", "リハビリ施設"],
    energyProfile: {
      heating: 72.0,
      cooling: 72.0,
      ventilation: 89.0,
      total: 521.0
    },
    characteristics: "24時間稼働、高い換気量要求。医療機器による電力消費も大きい。"
  },
  {
    id: "shop_department",
    name: "百貨店等",
    icon: FaStore,
    description: "百貨店、大型商業施設等",
    examples: ["百貨店", "デパート", "大型商業施設", "ショッピングモール"],
    energyProfile: {
      heating: 20.0,
      cooling: 20.0,
      lighting: 126.0,
      total: 211.0
    },
    characteristics: "高い照明レベルが必要。営業時間中の空調・照明が中心。"
  },
  {
    id: "shop_supermarket",
    name: "スーパーマーケット",
    icon: FaStore,
    description: "スーパー、コンビニ、小売店等",
    examples: ["スーパーマーケット", "コンビニエンスストア", "小売店", "ドラッグストア"],
    energyProfile: {
      heating: 20.0,
      cooling: 20.0,
      lighting: 140.0,
      total: 225.0
    },
    characteristics: "冷蔵・冷凍設備と高照度照明が特徴。長時間営業。"
  },
  {
    id: "school_small",
    name: "学校等（小中学校）",
    icon: FaSchool,
    description: "小学校、中学校等",
    examples: ["小学校", "中学校", "特別支援学校"],
    energyProfile: {
      heating: 58.0,
      cooling: 23.0,
      lighting: 49.0,
      total: 163.0
    },
    characteristics: "昼間のみ使用。暖房負荷が大きく、夏季休暇中は使用量減少。"
  },
  {
    id: "school_high",
    name: "学校等（高等学校）",
    icon: FaSchool,
    description: "高等学校、高専等",
    examples: ["高等学校", "高等専門学校", "専門学校"],
    energyProfile: {
      heating: 58.0,
      cooling: 30.0,
      lighting: 49.0,
      total: 170.0
    },
    characteristics: "小中学校より冷房使用が増加。実験・実習設備も含む。"
  },
  {
    id: "school_university",
    name: "学校等（大学）",
    icon: FaSchool,
    description: "大学、研究所等",
    examples: ["大学", "短期大学", "研究所", "図書館"],
    energyProfile: {
      heating: 43.0,
      cooling: 30.0,
      lighting: 49.0,
      total: 167.0
    },
    characteristics: "研究設備・図書館等の特殊用途を含む。使用時間が多様。"
  },
  {
    id: "restaurant",
    name: "飲食店等",
    icon: FaUtensils,
    description: "レストラン、食堂、カフェ等",
    examples: ["レストラン", "食堂", "カフェ", "ファミレス", "居酒屋"],
    energyProfile: {
      heating: 54.0,
      cooling: 54.0,
      ventilation: 117.0,
      total: 449.0
    },
    characteristics: "厨房からの高い排熱と換気負荷。給湯・調理機器の使用大。"
  },
  {
    id: "assembly",
    name: "集会所等",
    icon: FaUsers,
    description: "集会所、体育館、劇場等",
    examples: ["集会所", "体育館", "劇場", "ホール", "公民館"],
    energyProfile: {
      heating: 38.0,
      cooling: 38.0,
      lighting: 70.0,
      total: 205.0
    },
    characteristics: "間欠使用が多い。大空間の空調に特徴がある。"
  },
  {
    id: "factory",
    name: "工場等",
    icon: FaIndustry,
    description: "工場、作業場等",
    examples: ["製造工場", "作業場", "倉庫", "配送センター"],
    energyProfile: {
      heating: 72.0,
      cooling: 20.0,
      lighting: 70.0,
      total: 221.0
    },
    characteristics: "生産設備からの発熱で暖房負荷が大きい。作業環境維持が重要。"
  },
  {
    id: "residential_collective",
    name: "共同住宅",
    icon: FaHome,
    description: "マンション、アパート等",
    examples: ["分譲マンション", "賃貸マンション", "アパート", "団地"],
    energyProfile: {
      heating: 38.0,
      cooling: 38.0,
      hot_water: 105.0,
      total: 251.0
    },
    characteristics: "住宅用途。給湯負荷が大きく、個別空調が基本。"
  }
];

export default function BuildingTypeSelector({ value, onChange, className = "", compact = false }) {
  const [showDetails, setShowDetails] = useState(false);
  
  const selectedType = BUILDING_TYPES.find(type => type.id === value);

  // コンパクトモードの場合は簡易表示
  if (compact) {
    return (
      <div className={className}>
        <select
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white text-sm"
        >
          <option value="">選択してください</option>
          {BUILDING_TYPES.map((type) => (
            <option key={type.id} value={type.id}>
              {type.name}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center space-x-2">
        <label className="block text-sm font-medium text-gray-700">
          建物用途
        </label>
        <HelpTooltip title="モデル建物法とは？">
          国土交通省告示で定められた標準的な建物用途です。
          各用途ごとに標準的なエネルギー消費量原単位が設定されており、
          これを基準として省エネ性能を評価します。
        </HelpTooltip>
      </div>

      <div className="relative">
        <select
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
          required
        >
          <option value="">建物用途を選択してください</option>
          {BUILDING_TYPES.map(type => (
            <option key={type.id} value={type.id}>
              {type.name} - {type.description}
            </option>
          ))}
        </select>
      </div>

      {selectedType && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <selectedType.icon className="text-green-600 text-xl mt-1 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-medium text-green-800 mb-2">{selectedType.name}</h4>
              <p className="text-sm text-green-700 mb-2">{selectedType.characteristics}</p>
              <div className="text-xs text-green-600 mb-3">
                <strong>該当例:</strong> {selectedType.examples.join(', ')}
              </div>
              
              {/* エネルギー消費量プロファイル */}
              <div className="bg-white rounded p-3 border border-green-100">
                <div className="text-xs font-medium text-green-800 mb-2">
                  基準エネルギー消費量原単位 (MJ/m²年)
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  {Object.entries(selectedType.energyProfile).map(([key, value]) => (
                    <div key={key} className="text-center">
                      <div className="text-gray-600">
                        {key === 'heating' && '暖房'}
                        {key === 'cooling' && '冷房'}
                        {key === 'lighting' && '照明'}
                        {key === 'hot_water' && '給湯'}
                        {key === 'ventilation' && '換気'}
                        {key === 'total' && '合計'}
                      </div>
                      <div className="font-medium text-green-700">{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => setShowDetails(!showDetails)}
          className="text-sm text-blue-600 hover:text-blue-800 underline"
        >
          {showDetails ? '用途一覧を閉じる' : '全用途を比較表示'}
        </button>
      </div>

      {showDetails && (
        <div className="bg-gray-50 border rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
            {BUILDING_TYPES.map(type => (
              <div 
                key={type.id}
                className={`p-3 rounded border cursor-pointer transition-colors ${
                  selectedType?.id === type.id 
                    ? 'bg-green-100 border-green-300' 
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
                onClick={() => onChange(type.id)}
              >
                <div className="flex items-center space-x-2 mb-1">
                  <type.icon className="text-blue-600 flex-shrink-0" />
                  <div className="font-medium text-gray-800">{type.name}</div>
                </div>
                <div className="text-gray-600 text-xs">{type.description}</div>
                <div className="text-gray-500 text-xs mt-1">
                  合計: {type.energyProfile.total} MJ/m²年
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}