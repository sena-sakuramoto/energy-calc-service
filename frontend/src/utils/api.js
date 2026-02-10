// frontend/src/utils/api.js
// -*- coding: utf-8 -*-
import axios from 'axios';
import { mockBEICalculation, mockPowerCalculation, mockTariffCalculation } from './mockCalculations';

// Mock mode: explicitly controlled by NEXT_PUBLIC_USE_MOCK env var (inlined at build time).
// When NEXT_PUBLIC_USE_MOCK is "true" → mock, "false" → real API.
// If the env var is not set at all, fall back to GitHub Pages hostname detection.
const _envMock = process.env.NEXT_PUBLIC_USE_MOCK;
const _mockExplicit = typeof _envMock === 'string' ? _envMock.toLowerCase() === 'true' : undefined;
const _isGitHubPages = typeof window !== 'undefined' && window.location.hostname.includes('github.io');
const isMockMode = () => (_mockExplicit !== undefined ? _mockExplicit : _isGitHubPages);

// API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';
const EFFECTIVE_API_BASE_URL = isMockMode() ? 'https://mock-api.example.com/api/v1' : API_BASE_URL;

console.log('API Config:', { API_BASE_URL: EFFECTIVE_API_BASE_URL, mock: isMockMode(), hostname: typeof window !== 'undefined' ? window.location.hostname : 'server' });

const apiClient = axios.create({
  baseURL: EFFECTIVE_API_BASE_URL,
  timeout: 60000, // 60s timeout (Render free tier cold start)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper to read the auth token from localStorage
const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken'); // トEクンのキー名を 'authToken' と仮宁E
  }
  return null;
};

// Attach auth token to outgoing requests
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

// レスポンスインターセプターEエラーハンドリング強化！E
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
      // 認証エラー時E処琁E
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

// エラーハンドリングヘルパE関数
export const handleApiError = (error) => {
  if (error.response) {
    // サーバEからのレスポンスがある場吁E
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
        return 'サーバーでエラーが発生しました。しばらく経ってから再度お試しください。';
      case 503:
        return 'サービスが一時的に利用できません。しばらく経ってから再度お試しください。';
      default:
        return `エラーが発生しました (${status}): ${detail}`;
    }
  } else if (error.request) {
    // ネットワークエラー
    return 'ネットワークエラーが発生しました。インターネット接続を確認してください。';
  } else {
    // そE他Eエラー
    return `予期しないエラーが発生しました: ${error.message}`;
  }
};

// APIリクエストEラチEー関数Eエラーハンドリング付きEE
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
    // GitHub Pages用のモチE機E
    if (isMockMode()) {
      console.log("GitHub Pages mode: Using mock login");
      await new Promise(resolve => setTimeout(resolve, 800)); // 征EE
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

    // FastAPIのOAuth2準拠のトEクンエンドEイントE通常 application/x-www-form-urlencoded を期征E
    const params = new URLSearchParams();
    params.append('username', credentials.email); // FastAPI側ぁEusername を期征Eる場吁E
    params.append('password', credentials.password);

    // バックエンドEトEクン取得パス (侁E /auth/token)
    const response = await apiClient.post('/auth/token', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response; // レスポンス全体を返す
  },
  register: async (userData) => { // userData は { email, password, full_name }
    console.log("Submitting to API /users/ with data (from api.js):", JSON.stringify(userData));
    
    // GitHub Pages用のモチE機E
    if (isMockMode()) {
      console.log("GitHub Pages mode: Using mock registration");
      // モチE成功レスポンス
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1秒Eフェイク征EE
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
    
    // 通常のAPIリクエスチE
    const response = await apiClient.post('/users/', userData);
    return response;
  },
  getCurrentUser: async () => {
    // GitHub Pages用のモチE機E
    if (isMockMode()) {
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
    
    // バックエンドE現在ユーザー惁E取得エンドEインチE(侁E /users/me)
    const response = await apiClient.get('/users/me');
    return response; // レスポンス全体を返す
  },
  setAuthToken: (token) => { // localStorageへのトEクン保孁E削除
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('authToken', token);
      } else {
        localStorage.removeItem('authToken');
      }
    }
  }
};

// プロジェクト関連API (以前EもEをEースに)
export const projectsAPI = {
  getAll: async () => {
    if (isMockMode()) {
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
    if (isMockMode()) {
      console.log("GitHub Pages mode: Using mock getById project");
      await new Promise(resolve => setTimeout(resolve, 400));
      // プロジェクチED=1の場合E計算結果を含む、それ以外E空
      const hasResults = parseInt(id) === 1;
      return {
        data: {
          id: parseInt(id),
          name: `プロジェクト ${id}`,
          description: "テスト用のプロジェクト説明",
          owner_id: 1,
          created_at: new Date().toISOString(),
          input_data: hasResults ? {
            building: {
              building_type: "住宅",
              total_floor_area: 100,
              climate_zone: 6,
              num_stories: 2,
              has_central_heat_source: false,
            },
            envelope: {
              parts: [
                {
                  part_name: "外壁北",
                  part_type: "壁",
                  area: 30,
                  u_value: 0.4,
                },
                {
                  part_name: "窓北",
                  part_type: "窓",
                  area: 5,
                  u_value: 2.33,
                  eta_value: 0.49,
                },
              ],
            },
            systems: {
              heating: {
                system_type: "ルームエアコン",
                rated_capacity: 5,
                efficiency: 4.2,
                control_method: "インバータ制御",
              },
              cooling: {
                system_type: "ルームエアコン",
                rated_capacity: 5,
                efficiency: 3.8,
                control_method: "インバータ制御",
              },
              ventilation: {
                system_type: "第3種換気",
                air_volume: 150,
                power_consumption: 15,
              },
              hot_water: {
                system_type: "エコキュート",
                efficiency: 3.5,
              },
              lighting: {
                system_type: "LED",
                power_density: 5,
              },
            },
          } : null,
          result_data: hasResults ? {
            envelope_result: {
              ua_value: 0.497,
              eta_a_value: 0.4,
              is_ua_compliant: true,
              is_eta_a_compliant: true
            },
            primary_energy_result: {
              total_energy_consumption: 447216,
              standard_energy_consumption: 368600,
              energy_saving_rate: -21.3,
              is_energy_compliant: false,
              energy_by_use: {
                heating: 4000,
                cooling: 4114,
                ventilation: 12457,
                hot_water: 339044,
                lighting: 57600
              }
            },
            overall_compliance: false,
            message: "省エネ基準不適合。一次エネルギー基準不適合(省エネ率: -21.3%)"
          } : null
        },
        status: 200
      };
    }
    return apiClient.get(`/projects/${id}/`);
  },
  create: async (data) => {
    if (isMockMode()) {
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
    if (isMockMode()) {
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
    if (isMockMode()) {
      console.log("GitHub Pages mode: Using mock delete project");
      await new Promise(resolve => setTimeout(resolve, 400));
      return { status: 204 };
    }
    return apiClient.delete(`/projects/${id}/`);
  },
  calculate: async (projectId, inputData) => {
    if (isMockMode()) {
      console.log("GitHub Pages mode: Using mock calculate");
      await new Promise(resolve => setTimeout(resolve, 2000)); // 計算時間をシミュレーチE
      return {
        data: {
          envelope_result: {
            ua_value: 0.497,
            eta_a_value: 0.4,
            is_ua_compliant: true,
            is_eta_a_compliant: true
          },
          primary_energy_result: {
            total_energy_consumption: 447216,
            standard_energy_consumption: 368600,
            energy_saving_rate: -21.3,
            is_energy_compliant: false,
            energy_by_use: {
              heating: 4000,
              cooling: 4114,
              ventilation: 12457,
              hot_water: 339044,
              lighting: 57600,
              elevator: 30000
            }
          },
          overall_compliance: false,
          message: "省エネ基準不適吁E 一次エネルギー基準不適吁E(省エネ率: -21.3%)"
        },
        status: 200
      };
    }
    return apiClient.post(`/projects/${projectId}/calculate/`, inputData);
  },
};

// レポEト関連API (以前EもEをEースに)
export const reportAPI = {
  getPDF: async (projectId) => {
    if (isMockMode()) {
      console.log("GitHub Pages mode: Mock PDF download");
      // モチEPDFチEEタE空のPDF風EE
      const mockPdfData = new Blob(['%PDF-1.4 Mock PDF Content'], { type: 'application/pdf' });
      return { data: mockPdfData, status: 200 };
    }
    return apiClient.get(`/projects/${projectId}/report/pdf/`, { responseType: 'blob' });
  },
  getExcel: async (projectId) => {
    if (isMockMode()) {
      console.log("GitHub Pages mode: Mock Excel download");
      // モチEExcelチEEタ
      const mockExcelData = new Blob(['Mock Excel Content'], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      return { data: mockExcelData, status: 200 };
    }
    return apiClient.get(`/projects/${projectId}/report/excel/`, { responseType: 'blob' });
  },
};

// 計算API
export const calcAPI = {
  calculateAndSave: (projectId, data) => projectsAPI.calculate(projectId, data),
};


// BEI応答エンリッチメント: バックエンドにないフロントエンド表示用フィールドを補完
function enrichBEIResponse(result) {
  if (!result || typeof result.bei !== 'number') return result;

  const bei = result.bei;
  const isCompliant = result.is_compliant;

  // performance_level
  if (!result.performance_level) {
    result.performance_level = isCompliant
      ? (bei <= 0.8 ? 'excellent' : bei <= 0.9 ? 'very_good' : 'good')
      : (bei <= 1.2 ? 'needs_improvement' : 'poor');
  }

  // suggestions
  if (!result.suggestions || result.suggestions.length === 0) {
    result.suggestions = [];
    if (!isCompliant) {
      if (bei > 1.2) {
        result.suggestions.push('設備効率の大幅な改善が必要です。');
        result.suggestions.push('高効率ヒートポンプやLED照明の導入を検討してください。');
      } else {
        result.suggestions.push('軽微な調整で基準適合できる可能性があります。');
        result.suggestions.push('断熱性能や設備効率の小幅改善を検討してください。');
      }
    } else {
      if (bei <= 0.8) {
        result.suggestions.push('非常に優秀な省エネ性能です。');
        result.suggestions.push('ZEB Ready相当の高性能建築物です。');
      } else {
        result.suggestions.push('省エネ基準に適合しています。');
        result.suggestions.push('現在の設計で法的要件を満たしています。');
      }
    }
  }

  // metadata
  if (!result.calculation_method) {
    result.calculation_method = 'モデル建物法';
  }
  if (!result.calculation_date) {
    result.calculation_date = new Date().toISOString().split('T')[0];
  }

  // notes にデータソースを追加
  if (!result.notes) result.notes = [];
  if (!result.notes.some(n => n.includes('正規API'))) {
    result.notes.push('正規APIによる計算（モデル建物法 v3.8 準拠）');
  }

  return result;
}

// 新しいBEI計算API
export const beiAPI = {
  // BEI評価（本番API + フォールバック）
  evaluate: async (data) => {
    if (isMockMode()) {
      console.log("Mock mode: Using mock BEI evaluate");
      await new Promise(resolve => setTimeout(resolve, 1500));
      try {
        const result = mockBEICalculation(data);
        return { data: result, status: 200 };
      } catch (error) {
        return { data: null, status: 400, error: error.message };
      }
    }

    // 本番API呼び出し（フォールバック付き）
    try {
      const response = await apiClient.post('/bei/evaluate', data);
      response.data = enrichBEIResponse(response.data);
      console.log('BEI計算: 正規API使用', response.data);
      return response;
    } catch (apiError) {
      console.warn('BEI API error, falling back to local calculation:', apiError.message);
      try {
        const result = mockBEICalculation(data);
        result.notes = result.notes || [];
        result.notes.unshift('サーバー接続エラーのため、ローカル計算を使用しました。正式な計算にはサーバー復旧後に再計算してください。');
        return { data: result, status: 200 };
      } catch (fallbackError) {
        return { data: null, status: 400, error: fallbackError.message };
      }
    }
  },

  // カタログ用途取得
  getUses: async () => {
    const mockUses = ["office", "hotel", "hospital", "shop_department", "shop_supermarket",
      "school_small", "school_high", "school_university", "restaurant",
      "assembly", "factory", "residential_collective"];

    if (isMockMode()) {
      return { data: { uses: mockUses }, status: 200 };
    }
    try {
      return await apiClient.get('/bei/catalog/uses');
    } catch {
      return { data: { uses: mockUses }, status: 200 };
    }
  },

  // カタログ地域取得
  getZones: async (use) => {
    if (isMockMode()) {
      return { data: { zones: ["1", "2", "3", "4", "5", "6", "7", "8"] }, status: 200 };
    }
    try {
      return await apiClient.get(`/bei/catalog/uses/${use}/zones`);
    } catch {
      return { data: { zones: ["1", "2", "3", "4", "5", "6", "7", "8"] }, status: 200 };
    }
  },

  // カタログ強度データ取得
  getIntensity: async (use, zone) => {
    if (isMockMode()) {
      const { STANDARD_INTENSITIES } = await import('./mockCalculations');
      const intensityData = STANDARD_INTENSITIES[use]?.[zone] ||
                           STANDARD_INTENSITIES[use]?.[4] ||
                           STANDARD_INTENSITIES.office[4];
      return { data: { use, zone, intensities: intensityData }, status: 200 };
    }
    try {
      return await apiClient.get(`/bei/catalog/uses/${use}/zones/${zone}`);
    } catch {
      const { STANDARD_INTENSITIES } = await import('./mockCalculations');
      const intensityData = STANDARD_INTENSITIES[use]?.[zone] ||
                           STANDARD_INTENSITIES[use]?.[4] ||
                           STANDARD_INTENSITIES.office[4];
      return { data: { use, zone, intensities: intensityData }, status: 200 };
    }
  }
};

// 公式入力シート API (様式A〜I → 国交省API経由で公式PDF/計算)
export const officialAPI = {
  // 公式PDF取得 (入力データから)
  getReport: async (officialInput) => {
    const response = await apiClient.post('/official/report', officialInput, {
      responseType: 'blob',
      timeout: 180000, // 3分（公式API処理に時間がかかる場合あり）
    });
    return response;
  },

  // 公式計算結果取得 (入力データから)
  getCompute: async (officialInput) => {
    const response = await apiClient.post('/official/compute', officialInput, {
      timeout: 180000,
    });
    return response;
  },

  // Excel直接アップロード → 公式PDF
  uploadExcelForReport: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post('/official/upload-report', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      responseType: 'blob',
      timeout: 180000,
    });
    return response;
  },

  // Excel直接アップロード → 公式計算結果
  uploadExcelForCompute: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post('/official/upload-compute', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 180000,
    });
    return response;
  },
};

// エネルギー計算API
export const energyAPI = {
  calculatePower: async (data) => {
    const mockFn = () => {
      const result = mockPowerCalculation(data);
      return { data: result, status: 200 };
    };
    if (isMockMode()) return mockFn();
    try { return await apiClient.post('/calc/power', data); }
    catch { return mockFn(); }
  },

  calculateEnergy: async (data) => {
    const mockFn = () => {
      const power_kw = data.power_kw || data.power_w / 1000;
      return { data: { energy_kwh: power_kw * data.duration_hours, power_kw, duration_hours: data.duration_hours }, status: 200 };
    };
    if (isMockMode()) return mockFn();
    try { return await apiClient.post('/calc/energy', data); }
    catch { return mockFn(); }
  },

  calculateCost: async (data) => {
    const mockFn = () => {
      const tariff = data.tariff_per_kwh || 25.0;
      const energy_cost = data.energy_kwh * tariff;
      const subtotal = energy_cost + (data.fixed_cost || 0);
      const tax_amount = subtotal * (data.tax_rate || 0.1);
      return { data: { total_cost: subtotal + tax_amount, energy_cost, fixed_cost: data.fixed_cost || 0, tax_amount, tariff_per_kwh: tariff }, status: 200 };
    };
    if (isMockMode()) return mockFn();
    try { return await apiClient.post('/calc/cost', data); }
    catch { return mockFn(); }
  },

  aggregateDevices: async (data) => {
    const mockFn = () => {
      let total_energy = 0, total_power = 0, device_count = 0;
      const devices = data.devices.map(device => {
        const device_energy = device.power_kw * device.usage_hours * device.quantity;
        const device_power = device.power_kw * device.quantity;
        total_energy += device_energy;
        total_power += device_power;
        device_count += device.quantity;
        return { ...device, total_power_kw: device_power, energy_kwh: device_energy };
      });
      return { data: { total_energy_kwh: total_energy, total_power_kw: total_power, device_count, devices }, status: 200 };
    };
    if (isMockMode()) return mockFn();
    try { return await apiClient.post('/calc/device-usage', data); }
    catch { return mockFn(); }
  }
};

// 料金API
export const tariffAPI = {
  quote: async (data) => {
    const mockFn = () => {
      const result = mockTariffCalculation(data);
      return { data: result, status: 200 };
    };
    if (isMockMode()) return mockFn();
    try { return await apiClient.post('/tariffs/quote', data); }
    catch { return mockFn(); }
  }
};

export default apiClient; // チEォルトでAxiosインスタンスをエクスポEチE
