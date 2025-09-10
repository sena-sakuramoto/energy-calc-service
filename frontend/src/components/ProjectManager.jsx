// frontend/src/components/ProjectManager.jsx
import React, { useState, useEffect } from 'react';
import { formatBEI } from '../utils/number';
import { 
  FaPlus, FaSearch, FaTrash, FaCopy, FaDownload, FaUpload, 
  FaEdit, FaSave, FaFolder, FaCalendar, FaUser, FaBuilding
} from 'react-icons/fa';
import { 
  getProjects, saveProject, deleteProject, duplicateProject, 
  exportProject, importProject, searchProjects, getStorageUsage 
} from '../utils/projectStorage';

export default function ProjectManager({ 
  currentProject, 
  onProjectSelect, 
  onNewProject,
  onProjectLoad
}) {
  const [projects, setProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [storageInfo, setStorageInfo] = useState({ projectCount: 0, sizeInKB: 0 });

  // プロジェクト一覧の更新
  const refreshProjects = () => {
    const allProjects = searchQuery ? searchProjects(searchQuery) : getProjects();
    setProjects(allProjects);
    setStorageInfo(getStorageUsage());
  };

  useEffect(() => {
    refreshProjects();
  }, [searchQuery]);

  // 新規プロジェクト作成
  const handleNewProject = () => {
    onNewProject();
    setIsModalOpen(false);
  };

  // プロジェクト読み込み
  const handleLoadProject = (project) => {
    onProjectLoad(project);
    setIsModalOpen(false);
  };

  // プロジェクト削除
  const handleDeleteProject = (id, e) => {
    e.stopPropagation();
    if (window.confirm('このプロジェクトを削除しますか？')) {
      deleteProject(id);
      refreshProjects();
    }
  };

  // プロジェクト複製
  const handleDuplicateProject = (id, e) => {
    e.stopPropagation();
    duplicateProject(id);
    refreshProjects();
  };

  // プロジェクトエクスポート
  const handleExportProject = (id, e) => {
    e.stopPropagation();
    exportProject(id);
  };

  // プロジェクトインポート
  const handleImportProject = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    importProject(file)
      .then(() => {
        refreshProjects();
        alert('プロジェクトをインポートしました');
      })
      .catch((error) => {
        alert(error.message);
      });
    
    // ファイル入力をクリア
    e.target.value = '';
  };

  // 日付フォーマット
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // BEI値の表示（第3位切上→第2位表示）
  const renderBEI = (res) => {
    if (!res || typeof res.bei !== 'number') return '未計算';
    const status = res.is_compliant ? '適合' : '不適合';
    const color = res.is_compliant ? 'text-green-600' : 'text-red-600';
    return (
      <span className={color}>
        {formatBEI(res.bei)} ({status})
      </span>
    );
  };

  return (
    <>
      {/* プロジェクト管理ボタン */}
      <div className="flex items-center space-x-2 mb-4">
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <FaFolder />
          <span>プロジェクト管理</span>
        </button>
        
        {currentProject && (
          <div className="text-sm text-gray-600">
            現在: <strong>{currentProject.projectInfo.name}</strong>
          </div>
        )}
      </div>

      {/* プロジェクト管理モーダル */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-6xl max-h-[80vh] w-full overflow-hidden">
            {/* ヘッダー */}
            <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">プロジェクト管理</h2>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-600">
                  {storageInfo.projectCount}件 ({storageInfo.sizeInKB}KB)
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* ツールバー */}
            <div className="px-6 py-4 border-b bg-gray-50">
              <div className="flex flex-wrap gap-4 items-center">
                <button
                  onClick={handleNewProject}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center space-x-2"
                >
                  <FaPlus />
                  <span>新規作成</span>
                </button>

                <label className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center space-x-2 cursor-pointer">
                  <FaUpload />
                  <span>インポート</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportProject}
                    className="hidden"
                  />
                </label>

                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="プロジェクト検索..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* プロジェクト一覧 */}
            <div className="overflow-auto max-h-96">
              {projects.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <FaFolder className="mx-auto text-4xl mb-4" />
                  <p>プロジェクトがありません</p>
                  <p className="text-sm">「新規作成」でプロジェクトを作成してください</p>
                </div>
              ) : (
                <div className="divide-y">
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      className="px-6 py-4 hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleLoadProject(project)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-medium text-lg">
                              {project.projectInfo.name || '無題のプロジェクト'}
                            </h3>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              project.status === 'calculated' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {project.status === 'calculated' ? '計算済み' : '下書き'}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-2">
                              <FaUser className="text-gray-400" />
                              <span>{project.projectInfo.buildingOwner || '建築主未入力'}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <FaBuilding className="text-gray-400" />
                              <span>{project.projectInfo.location || '所在地未入力'}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <FaCalendar className="text-gray-400" />
                              <span>{formatDate(project.updatedAt)}</span>
                            </div>
                            <div>
                              <span className="font-medium">BEI: </span>
                              {renderBEI(project.result)}
                            </div>
                          </div>

                          {project.projectInfo.description && (
                            <div className="mt-2 text-sm text-gray-600">
                              {project.projectInfo.description}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={(e) => handleDuplicateProject(project.id, e)}
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                            title="複製"
                          >
                            <FaCopy />
                          </button>
                          <button
                            onClick={(e) => handleExportProject(project.id, e)}
                            className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded"
                            title="エクスポート"
                          >
                            <FaDownload />
                          </button>
                          <button
                            onClick={(e) => handleDeleteProject(project.id, e)}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                            title="削除"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
