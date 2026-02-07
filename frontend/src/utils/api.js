// frontend/src/utils/api.js
// -*- coding: utf-8 -*-
import axios from 'axios';
import { mockBEICalculation, mockPowerCalculation, mockTariffCalculation } from './mockCalculations';

// GitHub Pages static-mode detection
const isGitHubPages = typeof window !== 'undefined' && 
  window.location.hostname.includes('github.io');
// Allow overriding the mock mode via environment variables
const __shouldMock = (typeof process !== 'undefined' && process.env && typeof process.env.NEXT_PUBLIC_USE_MOCK !== 'undefined')
  ? String(process.env.NEXT_PUBLIC_USE_MOCK).toLowerCase() === 'true'
  : undefined;
const isMockMode = () => (typeof __shouldMock !== 'undefined' ? __shouldMock : isGitHubPages);

// Resolve API base URL (NEXT_PUBLIC_API_BASE_URL overrides default)
const EFFECTIVE_API_BASE_URL = isMockMode() ? 'https://mock-api.example.com/api/v1' : 
  (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1');

console.log('API Config:', { API_BASE_URL: EFFECTIVE_API_BASE_URL, mock: isMockMode(), hostname: typeof window !== 'undefined' ? window.location.hostname : 'server' });

const apiClient = axios.create({
  baseURL: EFFECTIVE_API_BASE_URL,
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
    // GitHub Pagesの場合E実際のAPIリクエストをブロチE
    if (isMockMode()) {
      return Promise.reject(new Error('GitHub Pages mode: API requests are mocked'));
    }
    
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


// 新しいBEI計算API
export const beiAPI = {
  // BEI評価
  evaluate: async (data) => {
    if (isMockMode()) {
      console.log("GitHub Pages mode: Using mock BEI evaluate");
      await new Promise(resolve => setTimeout(resolve, 1500));
      try {
        const result = mockBEICalculation(data);
        return { data: result, status: 200 };
      } catch (error) {
        return { 
          data: null, 
          status: 400, 
          error: error.message 
        };
      }
    }
    return apiClient.post('/bei/evaluate', data);
  },

  // カタログ用途取征E
  getUses: async () => {
    if (isMockMode()) {
      console.log("GitHub Pages mode: Using mock BEI uses");
      await new Promise(resolve => setTimeout(resolve, 300));
      return {
        data: { uses: [
          "office", "hotel", "hospital", "shop_department", "shop_supermarket", 
          "school_small", "school_high", "school_university", "restaurant", 
          "assembly", "factory", "residential_collective"
        ]},
        status: 200
      };
    }
    return apiClient.get('/bei/catalog/uses');
  },

  // カタログ地域取征E
  getZones: async (use) => {
    if (isMockMode()) {
      console.log("GitHub Pages mode: Using mock BEI zones");
      await new Promise(resolve => setTimeout(resolve, 300));
      return {
        data: { zones: ["1", "2", "3", "4", "5", "6", "7", "8"] },
        status: 200
      };
    }
    return apiClient.get(`/bei/catalog/uses/${use}/zones`);
  },

  // カタログ強度チEEタ取征E
  getIntensity: async (use, zone) => {
    if (isMockMode()) {
      console.log("GitHub Pages mode: Using mock BEI intensity");
      await new Promise(resolve => setTimeout(resolve, 400));
      
      // Import standard intensities from mock
      const { STANDARD_INTENSITIES } = await import('./mockCalculations');
      
      const intensityData = STANDARD_INTENSITIES[use]?.[zone] || 
                           STANDARD_INTENSITIES[use]?.[4] ||
                           STANDARD_INTENSITIES.office[4];
      
      return {
        data: {
          use,
          zone,
          intensities: intensityData
        },
        status: 200
      };
    }
    return apiClient.get(`/bei/catalog/uses/${use}/zones/${zone}`);
  }
};

// エネルギー計算API
export const energyAPI = {
  // 電力計箁E
  calculatePower: async (data) => {
    if (isMockMode()) {
      console.log("GitHub Pages mode: Using mock power calculation");
      await new Promise(resolve => setTimeout(resolve, 500));
      try {
        const result = mockPowerCalculation(data);
        return { data: result, status: 200 };
      } catch (error) {
        return { 
          data: null, 
          status: 400, 
          error: error.message 
        };
      }
    }
    return apiClient.post('/calc/power', data);
  },

  // エネルギー計箁E
  calculateEnergy: async (data) => {
    if (isMockMode()) {
      console.log("GitHub Pages mode: Using mock energy calculation");
      await new Promise(resolve => setTimeout(resolve, 500));
      const power_kw = data.power_kw || data.power_w / 1000;
      return {
        data: {
          energy_kwh: power_kw * data.duration_hours,
          power_kw,
          duration_hours: data.duration_hours
        },
        status: 200
      };
    }
    return apiClient.post('/calc/energy', data);
  },

  // コスト計箁E
  calculateCost: async (data) => {
    if (isMockMode()) {
      console.log("GitHub Pages mode: Using mock cost calculation");
      await new Promise(resolve => setTimeout(resolve, 500));
      const tariff = data.tariff_per_kwh || 25.0;
      const energy_cost = data.energy_kwh * tariff;
      const subtotal = energy_cost + (data.fixed_cost || 0);
      const tax_amount = subtotal * (data.tax_rate || 0.1);
      return {
        data: {
          total_cost: subtotal + tax_amount,
          energy_cost,
          fixed_cost: data.fixed_cost || 0,
          tax_amount,
          tariff_per_kwh: tariff
        },
        status: 200
      };
    }
    return apiClient.post('/calc/cost', data);
  },

  // 機器使用量集訁E
  aggregateDevices: async (data) => {
    if (isMockMode()) {
      console.log("GitHub Pages mode: Using mock device aggregation");
      await new Promise(resolve => setTimeout(resolve, 600));
      let total_energy = 0;
      let total_power = 0;
      let device_count = 0;
      const devices = data.devices.map(device => {
        const device_energy = device.power_kw * device.usage_hours * device.quantity;
        const device_power = device.power_kw * device.quantity;
        total_energy += device_energy;
        total_power += device_power;
        device_count += device.quantity;
        return {
          ...device,
          total_power_kw: device_power,
          energy_kwh: device_energy
        };
      });
      return {
        data: {
          total_energy_kwh: total_energy,
          total_power_kw: total_power,
          device_count,
          devices
        },
        status: 200
      };
    }
    return apiClient.post('/calc/device-usage', data);
  }
};

// 料API
export const tariffAPI = {
  // 料見積もめE
  quote: async (data) => {
    if (isMockMode()) {
      console.log("GitHub Pages mode: Using mock tariff quote");
      await new Promise(resolve => setTimeout(resolve, 1000));
      try {
        const result = mockTariffCalculation(data);
        return { data: result, status: 200 };
      } catch (error) {
        return { 
          data: null, 
          status: 400, 
          error: error.message 
        };
      }
    }
    return apiClient.post('/tariffs/quote', data);
  }
};

export default apiClient; // チEォルトでAxiosインスタンスをエクスポEチE
