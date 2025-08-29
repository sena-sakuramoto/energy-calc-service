// utils/firestore.js
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../../lib/firebase';

// プロジェクト管理クラス
export class FirestoreProjectManager {
  constructor(userId) {
    this.userId = userId;
    this.projectsRef = collection(db, 'users', userId, 'projects');
  }

  // プロジェクト一覧取得
  async getProjects() {
    try {
      const q = query(this.projectsRef, orderBy('updatedAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      }));
    } catch (error) {
      console.error('プロジェクト取得エラー:', error);
      throw error;
    }
  }

  // プロジェクト取得（ID指定）
  async getProject(projectId) {
    try {
      const docRef = doc(this.projectsRef, projectId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
        };
      } else {
        throw new Error('プロジェクトが見つかりません');
      }
    } catch (error) {
      console.error('プロジェクト取得エラー:', error);
      throw error;
    }
  }

  // プロジェクト保存
  async saveProject(projectData) {
    try {
      const dataToSave = {
        ...projectData,
        updatedAt: serverTimestamp(),
        userId: this.userId,
      };

      if (projectData.id) {
        // 既存プロジェクトの更新
        const docRef = doc(this.projectsRef, projectData.id);
        await updateDoc(docRef, dataToSave);
        return { id: projectData.id, ...dataToSave };
      } else {
        // 新規プロジェクトの作成
        dataToSave.createdAt = serverTimestamp();
        const docRef = await addDoc(this.projectsRef, dataToSave);
        return { id: docRef.id, ...dataToSave };
      }
    } catch (error) {
      console.error('プロジェクト保存エラー:', error);
      throw error;
    }
  }

  // プロジェクト削除
  async deleteProject(projectId) {
    try {
      const docRef = doc(this.projectsRef, projectId);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error('プロジェクト削除エラー:', error);
      throw error;
    }
  }

  // プロジェクト検索
  async searchProjects(searchQuery) {
    try {
      const q = query(this.projectsRef, orderBy('updatedAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const projects = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      }));

      // クライアントサイドでの検索フィルタリング
      if (!searchQuery.trim()) return projects;
      
      const lowercaseQuery = searchQuery.toLowerCase();
      return projects.filter(project => 
        project.projectInfo?.name?.toLowerCase().includes(lowercaseQuery) ||
        project.projectInfo?.buildingOwner?.toLowerCase().includes(lowercaseQuery) ||
        project.projectInfo?.designer?.toLowerCase().includes(lowercaseQuery) ||
        project.projectInfo?.location?.toLowerCase().includes(lowercaseQuery)
      );
    } catch (error) {
      console.error('プロジェクト検索エラー:', error);
      throw error;
    }
  }

  // プロジェクト複製
  async duplicateProject(projectId) {
    try {
      const originalProject = await this.getProject(projectId);
      const duplicatedProject = {
        ...originalProject,
        projectInfo: {
          ...originalProject.projectInfo,
          name: `${originalProject.projectInfo?.name || 'プロジェクト'} - コピー`
        },
        result: null, // 結果はクリア
        status: 'draft'
      };
      
      delete duplicatedProject.id; // IDを削除して新規作成
      return await this.saveProject(duplicatedProject);
    } catch (error) {
      console.error('プロジェクト複製エラー:', error);
      throw error;
    }
  }
}

// プロジェクト管理のヘルパー関数
export const createProjectData = (projectInfo, formData, result = null) => ({
  projectInfo: {
    name: projectInfo.name || '',
    buildingOwner: projectInfo.buildingOwner || '',
    designer: projectInfo.designer || '',
    designFirm: projectInfo.designFirm || '',
    location: projectInfo.location || '',
    description: projectInfo.description || ''
  },
  formData: formData,
  result: result,
  version: '1.0',
  status: result ? 'calculated' : 'draft'
});