// frontend/src/components/ClimateZoneSelector.jsx
import { useState } from 'react';
import HelpTooltip from './HelpTooltip';
import { FaMapMarkerAlt } from 'react-icons/fa';

const CLIMATE_ZONES = [
  {
    zone: 1,
    name: "1地域（寒冷地）",
    description: "北海道（旭川、帯広、釧路等）",
    characteristics: "厳寒地域。暖房負荷が非常に大きく、断熱性能が最重要。",
    cities: ["旭川市", "帯広市", "釧路市", "北見市", "稚内市", "根室市"]
  },
  {
    zone: 2,
    name: "2地域（寒冷地）",
    description: "北海道（札幌、函館等）、青森、岩手等",
    characteristics: "寒冷地域。暖房負荷が大きく、高い断熱性能が必要。",
    cities: ["札幌市", "函館市", "青森市", "盛岡市", "秋田市", "山形市"]
  },
  {
    zone: 3,
    name: "3地域（やや寒冷地）",
    description: "宮城、山形、福島、栃木、新潟等",
    characteristics: "やや寒冷地域。暖房・冷房の両方を考慮した設計が必要。",
    cities: ["仙台市", "郡山市", "宇都宮市", "新潟市", "長野市", "前橋市"]
  },
  {
    zone: 4,
    name: "4地域（温暖地）",
    description: "茨城、群馬、埼玉、千葉、東京、神奈川等",
    characteristics: "温暖地域。暖房・冷房負荷がバランスよく分散。",
    cities: ["東京23区", "横浜市", "さいたま市", "千葉市", "水戸市", "川越市"]
  },
  {
    zone: 5,
    name: "5地域（やや温暖地）",
    description: "新潟、富山、石川、長野、岐阜等",
    characteristics: "やや温暖地域。冷房負荷がやや増加。湿度対策も重要。",
    cities: ["金沢市", "富山市", "岐阜市", "甲府市", "福井市", "松本市"]
  },
  {
    zone: 6,
    name: "6地域（温暖地）",
    description: "愛知、三重、滋賀、京都、大阪、兵庫等",
    characteristics: "温暖地域。冷房負荷が暖房負荷より大きくなる傾向。",
    cities: ["名古屋市", "大阪市", "京都市", "神戸市", "奈良市", "津市"]
  },
  {
    zone: 7,
    name: "7地域（暖地）",
    description: "和歌山、鳥取、島根、岡山、広島等",
    characteristics: "暖地。冷房負荷が支配的。遮熱・日射制御が重要。",
    cities: ["広島市", "岡山市", "松江市", "鳥取市", "和歌山市", "徳島市"]
  },
  {
    zone: 8,
    name: "8地域（暖地）",
    description: "沖縄県",
    characteristics: "亜熱帯地域。冷房負荷が極めて大きく、暖房はほぼ不要。",
    cities: ["那覇市", "沖縄市", "宜野湾市", "浦添市", "名護市", "糸満市"]
  }
];

export default function ClimateZoneSelector({ value, onChange, className = "" }) {
  const [showMap, setShowMap] = useState(false);

  const selectedZone = CLIMATE_ZONES.find(zone => zone.zone === value);

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center space-x-2">
        <label className="block text-sm font-medium text-primary-700">
          地域区分
        </label>
        <HelpTooltip title="地域区分とは？">
          建築物省エネ法で定められた8つの地域区分です。
          気候特性に応じて暖房・冷房の基準値が設定されています。
          お住まいの都道府県・市町村から該当する地域を選択してください。
        </HelpTooltip>
      </div>

      <div className="relative">
        <select
          value={value || ""}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="w-full p-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 appearance-none bg-white"
          required
        >
          <option value="">地域区分を選択してください</option>
          {CLIMATE_ZONES.map(zone => (
            <option key={zone.zone} value={zone.zone}>
              {zone.name} - {zone.description}
            </option>
          ))}
        </select>
      </div>

      {selectedZone && (
        <div className="bg-warm-50 border border-primary-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <FaMapMarkerAlt className="text-accent-600 mt-1 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-primary-800 mb-2">{selectedZone.name}</h4>
              <p className="text-sm text-primary-700 mb-2">{selectedZone.characteristics}</p>
              <div className="text-xs text-primary-600">
                <strong>主要都市例:</strong> {selectedZone.cities.join(', ')}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => setShowMap(!showMap)}
          className="text-sm text-accent-600 hover:text-accent-800 underline flex items-center space-x-1"
        >
          <FaMapMarkerAlt />
          <span>{showMap ? '地域マップを閉じる' : '地域マップで確認'}</span>
        </button>
      </div>

      {showMap && (
        <div className="bg-warm-50 border rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {CLIMATE_ZONES.map(zone => (
              <div
                key={zone.zone}
                className={`p-3 rounded border cursor-pointer transition-colors ${
                  selectedZone?.zone === zone.zone
                    ? 'bg-accent-50 border-accent-300'
                    : 'bg-white border-primary-200 hover:bg-warm-50'
                }`}
                onClick={() => onChange(zone.zone)}
              >
                <div className="font-medium text-primary-800">{zone.name}</div>
                <div className="text-primary-600 text-xs mt-1">{zone.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
