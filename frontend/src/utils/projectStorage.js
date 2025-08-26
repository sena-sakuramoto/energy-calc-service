// frontend/src/utils/projectStorage.js
// プロジェクト管理・保存機能

// プロジェクトデータの構造
export const createProjectData = (projectInfo, formData, result = null) => ({
  id: Date.now().toString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  
  // プロジェクト情報
  projectInfo: {
    name: projectInfo.name || '',
    buildingOwner: projectInfo.buildingOwner || '',
    designer: projectInfo.designer || '',
    designFirm: projectInfo.designFirm || '',
    location: projectInfo.location || '',
    description: projectInfo.description || ''
  },
  
  // 計算データ
  formData: formData,
  
  // 計算結果
  result: result,
  
  // メタデータ
  version: '1.0',
  status: result ? 'calculated' : 'draft'
});

// ローカルストレージキー
const STORAGE_KEY = 'bei_calculator_projects';

// プロジェクト一覧取得
export const getProjects = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('プロジェクト取得エラー:', error);
    return [];
  }
};

// プロジェクト保存
export const saveProject = (projectData) => {
  try {
    const projects = getProjects();
    const existingIndex = projects.findIndex(p => p.id === projectData.id);
    
    if (existingIndex >= 0) {
      // 既存プロジェクトの更新
      projects[existingIndex] = {
        ...projectData,
        updatedAt: new Date().toISOString()
      };
    } else {
      // 新規プロジェクトの追加
      projects.unshift(projectData);
    }
    
    // 最大50件まで保持
    const limitedProjects = projects.slice(0, 50);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(limitedProjects));
    
    return projectData;
  } catch (error) {
    console.error('プロジェクト保存エラー:', error);
    throw error;
  }
};

// プロジェクト取得（ID指定）
export const getProject = (id) => {
  const projects = getProjects();
  return projects.find(p => p.id === id);
};

// プロジェクト削除
export const deleteProject = (id) => {
  try {
    const projects = getProjects();
    const filteredProjects = projects.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredProjects));
    return true;
  } catch (error) {
    console.error('プロジェクト削除エラー:', error);
    return false;
  }
};

// プロジェクト複製
export const duplicateProject = (id) => {
  const original = getProject(id);
  if (!original) return null;
  
  const duplicated = {
    ...original,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    projectInfo: {
      ...original.projectInfo,
      name: `${original.projectInfo.name} - コピー`
    },
    result: null, // 結果はクリア
    status: 'draft'
  };
  
  return saveProject(duplicated);
};

// プロジェクト検索
export const searchProjects = (query) => {
  const projects = getProjects();
  if (!query.trim()) return projects;
  
  const lowercaseQuery = query.toLowerCase();
  return projects.filter(project => 
    project.projectInfo.name.toLowerCase().includes(lowercaseQuery) ||
    project.projectInfo.buildingOwner.toLowerCase().includes(lowercaseQuery) ||
    project.projectInfo.designer.toLowerCase().includes(lowercaseQuery) ||
    project.projectInfo.location.toLowerCase().includes(lowercaseQuery)
  );
};

// エクスポート（JSON）
export const exportProject = (id) => {
  const project = getProject(id);
  if (!project) return null;
  
  const dataStr = JSON.stringify(project, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `${project.projectInfo.name || 'BEI計算'}_${project.id}.json`;
  a.click();
  
  URL.revokeObjectURL(url);
  return project;
};

// インポート（JSON）
export const importProject = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const projectData = JSON.parse(e.target.result);
        
        // 基本的な構造検証
        if (!projectData.projectInfo || !projectData.formData) {
          throw new Error('無効なプロジェクトファイルです');
        }
        
        // 新しいIDを付与
        const importedProject = {
          ...projectData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          projectInfo: {
            ...projectData.projectInfo,
            name: `${projectData.projectInfo.name} - インポート`
          }
        };
        
        const saved = saveProject(importedProject);
        resolve(saved);
      } catch (error) {
        reject(new Error(`インポートエラー: ${error.message}`));
      }
    };
    reader.onerror = () => reject(new Error('ファイル読み込みエラー'));
    reader.readAsText(file);
  });
};

// ストレージ使用量取得
export const getStorageUsage = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    const sizeInBytes = new Blob([data || '']).size;
    return {
      sizeInBytes,
      sizeInKB: Math.round(sizeInBytes / 1024),
      projectCount: getProjects().length
    };
  } catch (error) {
    return { sizeInBytes: 0, sizeInKB: 0, projectCount: 0 };
  }
};