// utils/dataMigration.js
import { FirestoreProjectManager } from './firestore';
import { getProjects as getLocalProjects, STORAGE_KEY } from './projectStorage';

/**
 * LocalStorageからFirestoreにデータを移行
 */
export class DataMigration {
  constructor(userId) {
    this.userId = userId;
    this.firestoreManager = new FirestoreProjectManager(userId);
  }

  /**
   * LocalStorageのプロジェクトデータを取得
   */
  getLocalStorageData() {
    try {
      const projects = getLocalProjects();
      console.log(`LocalStorageから${projects.length}件のプロジェクトを発見`);
      return projects;
    } catch (error) {
      console.error('LocalStorageデータ取得エラー:', error);
      return [];
    }
  }

  /**
   * 単一プロジェクトをFirestoreに移行
   */
  async migrateProject(project) {
    try {
      // LocalStorageのIDを削除（Firestoreで新しいIDを生成）
      const { id, ...projectData } = project;
      
      // Firestoreに保存
      const savedProject = await this.firestoreManager.saveProject(projectData);
      
      console.log(`プロジェクト "${projectData.projectInfo?.name || 'Untitled'}" を移行完了`);
      return savedProject;
    } catch (error) {
      console.error('プロジェクト移行エラー:', error);
      throw error;
    }
  }

  /**
   * 全プロジェクトをFirestoreに移行
   */
  async migrateAllProjects() {
    const localProjects = this.getLocalStorageData();
    
    if (localProjects.length === 0) {
      console.log('移行対象のプロジェクトがありません');
      return [];
    }

    const migratedProjects = [];
    const errors = [];

    for (const project of localProjects) {
      try {
        const migratedProject = await this.migrateProject(project);
        migratedProjects.push(migratedProject);
      } catch (error) {
        console.error(`プロジェクト "${project.projectInfo?.name}" の移行に失敗:`, error);
        errors.push({ project: project.projectInfo?.name, error });
      }
    }

    console.log(`移行完了: ${migratedProjects.length}件成功, ${errors.length}件失敗`);
    
    return {
      migrated: migratedProjects,
      errors: errors
    };
  }

  /**
   * LocalStorageのデータをバックアップ
   */
  backupLocalStorage() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      const backupKey = `${STORAGE_KEY}_backup_${Date.now()}`;
      
      if (data) {
        localStorage.setItem(backupKey, data);
        console.log(`LocalStorageデータをバックアップ: ${backupKey}`);
        return backupKey;
      }
    } catch (error) {
      console.error('バックアップ作成エラー:', error);
    }
    return null;
  }

  /**
   * 移行完了後のLocalStorageクリーンアップ
   */
  clearLocalStorage() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      console.log('LocalStorageデータをクリーンアップ完了');
    } catch (error) {
      console.error('クリーンアップエラー:', error);
    }
  }

  /**
   * 移行状況の確認
   */
  async checkMigrationStatus() {
    const localCount = this.getLocalStorageData().length;
    
    try {
      const firestoreProjects = await this.firestoreManager.getProjects();
      const firestoreCount = firestoreProjects.length;
      
      return {
        localStorage: localCount,
        firestore: firestoreCount,
        needsMigration: localCount > 0
      };
    } catch (error) {
      console.error('移行状況確認エラー:', error);
      return {
        localStorage: localCount,
        firestore: 0,
        needsMigration: localCount > 0,
        error: error.message
      };
    }
  }
}

/**
 * 移行ヘルパー関数
 */
export const migrationHelper = {
  /**
   * ユーザーのデータ移行を実行
   */
  async migrateUserData(userId) {
    const migration = new DataMigration(userId);
    
    // 1. 現状確認
    const status = await migration.checkMigrationStatus();
    console.log('移行前状況:', status);
    
    if (!status.needsMigration) {
      console.log('移行の必要がありません');
      return { success: true, message: '移行の必要がありません' };
    }

    // 2. バックアップ作成
    const backupKey = migration.backupLocalStorage();
    
    // 3. データ移行実行
    try {
      const result = await migration.migrateAllProjects();
      
      // 4. 成功時のクリーンアップ（オプション）
      // migration.clearLocalStorage(); // 慎重に実行
      
      return {
        success: true,
        migrated: result.migrated.length,
        errors: result.errors.length,
        backupKey: backupKey
      };
    } catch (error) {
      console.error('移行プロセスエラー:', error);
      return {
        success: false,
        error: error.message,
        backupKey: backupKey
      };
    }
  }
};