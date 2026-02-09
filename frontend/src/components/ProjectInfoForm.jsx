// frontend/src/components/ProjectInfoForm.jsx
import React from 'react';
import { FaBuilding, FaUser, FaMapMarkerAlt, FaEdit } from 'react-icons/fa';

export default function ProjectInfoForm({
  projectInfo,
  onProjectInfoChange,
  className = ""
}) {
  const handleInputChange = (field, value) => {
    onProjectInfoChange({
      ...projectInfo,
      [field]: value
    });
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* プロジェクト基本情報 */}
      <div className="bg-warm-50 border border-primary-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-primary-800 mb-4 flex items-center">
          <FaBuilding className="mr-2" />
          プロジェクト情報
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-primary-700 mb-2">
              プロジェクト名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={projectInfo.name || ''}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="例: ○○ビル新築工事"
              className="w-full p-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-700 mb-2">
              所在地
            </label>
            <div className="relative">
              <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-400" />
              <input
                type="text"
                value={projectInfo.location || ''}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="例: 東京都港区○○1-2-3"
                className="w-full pl-10 pr-3 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-700 mb-2">
              建築主
            </label>
            <div className="relative">
              <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-400" />
              <input
                type="text"
                value={projectInfo.buildingOwner || ''}
                onChange={(e) => handleInputChange('buildingOwner', e.target.value)}
                placeholder="例: 株式会社○○"
                className="w-full pl-10 pr-3 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-700 mb-2">
              設計者
            </label>
            <div className="relative">
              <FaEdit className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-400" />
              <input
                type="text"
                value={projectInfo.designer || ''}
                onChange={(e) => handleInputChange('designer', e.target.value)}
                placeholder="例: 田中太郎"
                className="w-full pl-10 pr-3 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-primary-700 mb-2">
              設計事務所
            </label>
            <input
              type="text"
              value={projectInfo.designFirm || ''}
              onChange={(e) => handleInputChange('designFirm', e.target.value)}
              placeholder="例: ○○設計事務所"
              className="w-full p-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-primary-700 mb-2">
              プロジェクト概要・備考
            </label>
            <textarea
              value={projectInfo.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="プロジェクトの概要や特記事項があれば記入してください"
              rows={3}
              className="w-full p-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 resize-vertical"
            />
          </div>
        </div>
      </div>

      {/* 必須項目の注意書き */}
      <div className="text-sm text-primary-600 bg-warm-50 p-3 rounded">
        <p>
          <span className="text-red-500">*</span> プロジェクト名は保存時に必須です。
          その他の項目は任意ですが、申請書作成時に必要になります。
        </p>
      </div>
    </div>
  );
}
