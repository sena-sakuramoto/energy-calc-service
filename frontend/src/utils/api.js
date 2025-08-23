// frontend/src/utils/api.js
// -*- coding: utf-8 -*-
import axios from 'axios';

// 環境変数からAPIのベースURLを取得。NEXT_PUBLIC_ を接頭辞にすること。
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';

// GitHub Pages用のモックモード検出
const isGitHubPages = typeof window !== 'undefined' && 
  window.location.hostname.includes('github.io');

console.log('API Config:', { API_BASE_URL, isGitHubPages, hostname: typeof window !== 'undefined' ? window.location.hostname : 'server' });

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ローカルストレージからトークンを取得するヘルパー関数
const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken'); // トークンのキー名を 'authToken' と仮定
  }
  return null;
};

// APIクライアントに認証トークンをセットするインターセプタ
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// レスポンスインターセプター（エラーハンドリング強化）
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // エラーロギング
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.response?.data?.detail || error.message,
    });

    if (error.response?.status === 401) {
      // 認証エラー時の処理
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
        console.error("API request 401 Unauthorized. Token might be invalid or expired.");
      }
    } else if (error.response?.status === 403) {
      console.error("API request 403 Forbidden. Access denied.");
    } else if (error.response?.status >= 500) {
      console.error("Server error occurred. Please try again later.");
    }
    
    return Promise.reject(error);
  }
);

// エラーハンドリングヘルパー関数
export const handleApiError = (error) => {
  if (error.response) {
    // サーバーからのレスポンスがある場合
    const status = error.response.status;
    const detail = error.response.data?.detail || error.response.data?.message || 'Unknown error';
    
    switch (status) {
      case 400:
        return `入力データに問題があります: ${detail}`;
      case 401:
        return '認証が必要です。再度ログインしてください。';
      case 403:
        return 'このリソースにアクセスする権限がありません。';
      case 404:
        return '要求されたリソースが見つかりません。';
      case 422:
        return `データの形式が正しくありません: ${detail}`;
      case 500:
        return 'サーバーでエラーが発生しました。しばらく待ってから再度お試しください。';
      case 503:
        return 'サービスが一時的に利用できません。しばらく待ってから再度お試しください。';
      default:
        return `エラーが発生しました (${status}): ${detail}`;
    }
  } else if (error.request) {
    // ネットワークエラー
    return 'ネットワークエラーが発生しました。インターネット接続を確認してください。';
  } else {
    // その他のエラー
    return `予期しないエラーが発生しました: ${error.message}`;
  }
};

// APIリクエストのラッパー関数（エラーハンドリング付き）
export const apiRequest = async (requestFn, errorContext = '') => {
  try {
    const response = await requestFn();
    return { success: true, data: response.data, response };
  } catch (error) {
    const errorMessage = handleApiError(error);
    console.error(`${errorContext} Error:`, errorMessage);
    return { 
      success: false, 
      error: errorMessage, 
      originalError: error,
      status: error.response?.status 
    };
  }
};


// 認証関連API
export const authAPI = {
  login: async (credentials) => { // credentials は { email, password }
    // GitHub Pages用のモック機能
    if (isGitHubPages) {
      console.log("GitHub Pages mode: Using mock login");
      await new Promise(resolve => setTimeout(resolve, 800)); // 待機
      return {
        data: {
          access_token: "mock_token_" + Date.now(),
          token_type: "bearer",
          user: {
            id: 1,
            email: credentials.email,
            full_name: "Demo User",
            is_active: true
          }
        },
        status: 200
      };
    }

    // FastAPIのOAuth2準拠のトークンエンドポイントは通常 application/x-www-form-urlencoded を期待
    const params = new URLSearchParams();
    params.append('username', credentials.email); // FastAPI側が username を期待する場合
    params.append('password', credentials.password);

    // バックエンドのトークン取得パス (例: /auth/token)
    const response = await apiClient.post('/auth/token', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response; // レスポンス全体を返す
  },
  register: async (userData) => { // userData は { email, password, full_name }
    console.log("Submitting to API /users/ with data (from api.js):", JSON.stringify(userData));
    
    // GitHub Pages用のモック機能
    if (isGitHubPages) {
      console.log("GitHub Pages mode: Using mock registration");
      // モック成功レスポンス
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1秒のフェイク待機
      return {
        data: {
          id: Math.floor(Math.random() * 1000),
          email: userData.email,
          full_name: userData.full_name,
          is_active: true,
          created_at: new Date().toISOString()
        },
        status: 201
      };
    }
    
    // 通常のAPIリクエスト
    const response = await apiClient.post('/users/', userData);
    return response;
  },
  getCurrentUser: async () => {
    // GitHub Pages用のモック機能
    if (isGitHubPages) {
      console.log("GitHub Pages mode: Using mock getCurrentUser");
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        data: {
          id: 1,
          email: "demo@example.com",
          full_name: "Demo User",
          is_active: true,
          created_at: new Date().toISOString()
        },
        status: 200
      };
    }
    
    // バックエンドの現在ユーザー情報取得エンドポイント (例: /users/me)
    const response = await apiClient.get('/users/me');
    return response; // レスポンス全体を返す
  },
  setAuthToken: (token) => { // localStorageへのトークン保存/削除
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('authToken', token);
      } else {
        localStorage.removeItem('authToken');
      }
    }
  }
};

// プロジェクト関連API (以前のものをベースに)
export const projectsAPI = {
  getAll: async () => {
    if (isGitHubPages) {
      console.log("GitHub Pages mode: Using mock getAll projects");
      await new Promise(resolve => setTimeout(resolve, 600));
      return {
        data: [
          {
            id: 1,
            name: "サンプル建物計算",
            description: "省エネ法に基づく計算のサンプルプロジェクト",
            owner_id: 1,
            created_at: new Date().toISOString()
          },
          {
            id: 2,
            name: "オフィスビル省エネ計算",
            description: "大規模オフィスビルの省エネ法計算",
            owner_id: 1,
            created_at: new Date().toISOString()
          }
        ],
        status: 200
      };
    }
    return apiClient.get('/projects/');
  },
  getById: async (id) => {
    if (isGitHubPages) {
      console.log("GitHub Pages mode: Using mock getById project");
      await new Promise(resolve => setTimeout(resolve, 400));
      return {
        data: {
          id: parseInt(id),
          name: `プロジェクト ${id}`,
          description: "デモ用のプロジェクト説明",
          owner_id: 1,
          created_at: new Date().toISOString()
        },
        status: 200
      };
    }
    return apiClient.get(`/projects/${id}/`);
  },
  create: async (data) => {
    if (isGitHubPages) {
      console.log("GitHub Pages mode: Using mock create project");
      await new Promise(resolve => setTimeout(resolve, 800));
      return {
        data: {
          id: Math.floor(Math.random() * 1000),
          ...data,
          owner_id: 1,
          created_at: new Date().toISOString()
        },
        status: 201
      };
    }
    return apiClient.post('/projects/', data);
  },
  update: async (id, data) => {
    if (isGitHubPages) {
      console.log("GitHub Pages mode: Using mock update project");
      await new Promise(resolve => setTimeout(resolve, 600));
      return {
        data: { id: parseInt(id), ...data, updated_at: new Date().toISOString() },
        status: 200
      };
    }
    return apiClient.put(`/projects/${id}/`, data);
  },
  delete: async (id) => {
    if (isGitHubPages) {
      console.log("GitHub Pages mode: Using mock delete project");
      await new Promise(resolve => setTimeout(resolve, 400));
      return { status: 204 };
    }
    return apiClient.delete(`/projects/${id}/`);
  },
  calculate: async (projectId, inputData) => {
    if (isGitHubPages) {
      console.log("GitHub Pages mode: Using mock calculate");
      await new Promise(resolve => setTimeout(resolve, 2000)); // 計算時間をシミュレート
      return {
        data: {
          project_id: parseInt(projectId),
          results: {
            primary_energy_consumption: 1250.5,
            energy_efficiency_ratio: 0.78,
            co2_emissions: 245.3,
            compliance_status: "適合",
            detailed_results: {
              heating_energy: 450.2,
              cooling_energy: 380.1,
              lighting_energy: 220.8,
              ventilation_energy: 199.4
            }
          },
          calculation_date: new Date().toISOString()
        },
        status: 200
      };
    }
    return apiClient.post(`/projects/${projectId}/calculate/`, inputData);
  },
};

// レポート関連API (以前のものをベースに)
export const reportAPI = {
  getPDF: (projectId) => apiClient.get(`/projects/${projectId}/report/pdf/`, { responseType: 'blob' }),
  getExcel: (projectId) => apiClient.get(`/projects/${projectId}/report/excel/`, { responseType: 'blob' }),
};

// 計算API
export const calcAPI = {
  calculateAndSave: (projectId, data) => projectsAPI.calculate(projectId, data),
};


export default apiClient; // デフォルトでAxiosインスタンスをエクスポート