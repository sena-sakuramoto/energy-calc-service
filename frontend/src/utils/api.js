// frontend/src/utils/api.js
// -*- coding: utf-8 -*-
import axios from 'axios';

// 環境変数からAPIのベースURLを取得。NEXT_PUBLIC_ を接頭辞にすること。
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';

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
    // FastAPIのOAuth2準拠のトークンエンドポイントは通常 application/x-www-form-urlencoded を期待
    const params = new URLSearchParams();
    params.append('username', credentials.email); // FastAPI側が username を期待する場合
    params.append('password', credentials.password);

    // バックエンドのトークン取得パス (例: /auth/token)
    // このパスはバックエンドの実際のルーター設定に合わせてください。
    // senaaさんの元のコードでは /auth/login が多かったので、そちらを使う場合は
    // headers の 'Content-Type' も 'application/json' に戻し、paramsではなく credentials を直接渡します。
    // ここではFastAPIの標準的な /token エンドポイントを想定します。
    const response = await apiClient.post('/auth/token', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response; // レスポンス全体を返す
  },
  register: async (userData) => { // userData は { email, password, full_name }
    console.log("Submitting to API /users/ with data (from api.js):", JSON.stringify(userData));
    // バックエンドのユーザー作成エンドポイントが /users/ の場合
    const response = await apiClient.post('/users/', userData); // userDataを直接リクエストボディとして送信
    return response;
  },
  getCurrentUser: async () => {
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
  getAll: () => apiClient.get('/projects/'),
  getById: (id) => apiClient.get(`/projects/${id}/`), // 末尾スラッシュはFastAPIの慣習
  create: (data) => apiClient.post('/projects/', data),
  update: (id, data) => apiClient.put(`/projects/${id}/`, data),
  delete: (id) => apiClient.delete(`/projects/${id}/`),
  calculate: (projectId, inputData) => apiClient.post(`/projects/${projectId}/calculate/`, inputData),
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