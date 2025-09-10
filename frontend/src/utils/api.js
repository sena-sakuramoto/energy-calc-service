// frontend/src/utils/api.js
// -*- coding: utf-8 -*-
import axios from 'axios';
import { mockBEICalculation, mockPowerCalculation, mockTariffCalculation } from './mockCalculations';

// GitHub Pages/髱咏噪繝・・繝ｭ繧､逕ｨ縺ｮ繝｢繝・け繝｢繝ｼ繝画､懷・
const isGitHubPages = typeof window !== 'undefined' && 
  (window.location.hostname.includes('github.io') || 
   window.location.hostname.includes('archi-prisma.co.jp'));
// 迺ｰ蠅・､画焚縺ｧ繝｢繝・け蛻ｩ逕ｨ蜿ｯ蜷ｦ繧剃ｸ頑嶌縺阪〒縺阪ｋ繧医≧縺ｫ縺吶ｋ
const __shouldMock = (typeof process !== 'undefined' && process.env && typeof process.env.NEXT_PUBLIC_USE_MOCK !== 'undefined')
  ? String(process.env.NEXT_PUBLIC_USE_MOCK).toLowerCase() === 'true'
  : undefined;
const isMockMode = () => (typeof __shouldMock !== 'undefined' ? __shouldMock : isGitHubPages);

// 迺ｰ蠅・､画焚縺九ｉAPI縺ｮ繝吶・繧ｹURL繧貞叙蠕励・EXT_PUBLIC_ 繧呈磁鬆ｭ霎槭↓縺吶ｋ縺薙→縲・
const EFFECTIVE_API_BASE_URL = isMockMode() ? 'https://mock-api.example.com/api/v1' : 
  (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1');

console.log('API Config:', { API_BASE_URL: EFFECTIVE_API_BASE_URL, mock: isMockMode(), hostname: typeof window !== 'undefined' ? window.location.hostname : 'server' });

const apiClient = axios.create({
  baseURL: EFFECTIVE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 繝ｭ繝ｼ繧ｫ繝ｫ繧ｹ繝医Ξ繝ｼ繧ｸ縺九ｉ繝医・繧ｯ繝ｳ繧貞叙蠕励☆繧九・繝ｫ繝代・髢｢謨ｰ
const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken'); // 繝医・繧ｯ繝ｳ縺ｮ繧ｭ繝ｼ蜷阪ｒ 'authToken' 縺ｨ莉ｮ螳・
  }
  return null;
};

// API繧ｯ繝ｩ繧､繧｢繝ｳ繝医↓隱崎ｨｼ繝医・繧ｯ繝ｳ繧偵そ繝・ヨ縺吶ｋ繧､繝ｳ繧ｿ繝ｼ繧ｻ繝励ち
apiClient.interceptors.request.use(
  (config) => {
    // GitHub Pages縺ｮ蝣ｴ蜷医・螳滄圀縺ｮAPI繝ｪ繧ｯ繧ｨ繧ｹ繝医ｒ繝悶Ο繝・け
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

// 繝ｬ繧ｹ繝昴Φ繧ｹ繧､繝ｳ繧ｿ繝ｼ繧ｻ繝励ち繝ｼ・医お繝ｩ繝ｼ繝上Φ繝峨Μ繝ｳ繧ｰ蠑ｷ蛹厄ｼ・
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // 繧ｨ繝ｩ繝ｼ繝ｭ繧ｮ繝ｳ繧ｰ
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.response?.data?.detail || error.message,
    });

    if (error.response?.status === 401) {
      // 隱崎ｨｼ繧ｨ繝ｩ繝ｼ譎ゅ・蜃ｦ逅・
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

// 繧ｨ繝ｩ繝ｼ繝上Φ繝峨Μ繝ｳ繧ｰ繝倥Ν繝代・髢｢謨ｰ
export const handleApiError = (error) => {
  if (error.response) {
    // 繧ｵ繝ｼ繝舌・縺九ｉ縺ｮ繝ｬ繧ｹ繝昴Φ繧ｹ縺後≠繧句ｴ蜷・
    const status = error.response.status;
    const detail = error.response.data?.detail || error.response.data?.message || 'Unknown error';
    
    switch (status) {
      case 400:
        return `蜈･蜉帙ョ繝ｼ繧ｿ縺ｫ蝠城｡後′縺ゅｊ縺ｾ縺・ ${detail}`;
      case 401:
        return '隱崎ｨｼ縺悟ｿ・ｦ√〒縺吶ょ・蠎ｦ繝ｭ繧ｰ繧､繝ｳ縺励※縺上□縺輔＞縲・;
      case 403:
        return '縺薙・繝ｪ繧ｽ繝ｼ繧ｹ縺ｫ繧｢繧ｯ繧ｻ繧ｹ縺吶ｋ讓ｩ髯舌′縺ゅｊ縺ｾ縺帙ｓ縲・;
      case 404:
        return '隕∵ｱゅ＆繧後◆繝ｪ繧ｽ繝ｼ繧ｹ縺瑚ｦ九▽縺九ｊ縺ｾ縺帙ｓ縲・;
      case 422:
        return `繝・・繧ｿ縺ｮ蠖｢蠑上′豁｣縺励￥縺ゅｊ縺ｾ縺帙ｓ: ${detail}`;
      case 500:
        return '繧ｵ繝ｼ繝舌・縺ｧ繧ｨ繝ｩ繝ｼ縺檎匱逕溘＠縺ｾ縺励◆縲ゅ＠縺ｰ繧峨￥蠕・▲縺ｦ縺九ｉ蜀榊ｺｦ縺願ｩｦ縺励￥縺縺輔＞縲・;
      case 503:
        return '繧ｵ繝ｼ繝薙せ縺御ｸ譎ら噪縺ｫ蛻ｩ逕ｨ縺ｧ縺阪∪縺帙ｓ縲ゅ＠縺ｰ繧峨￥蠕・▲縺ｦ縺九ｉ蜀榊ｺｦ縺願ｩｦ縺励￥縺縺輔＞縲・;
      default:
        return `繧ｨ繝ｩ繝ｼ縺檎匱逕溘＠縺ｾ縺励◆ (${status}): ${detail}`;
    }
  } else if (error.request) {
    // 繝阪ャ繝医Ρ繝ｼ繧ｯ繧ｨ繝ｩ繝ｼ
    return '繝阪ャ繝医Ρ繝ｼ繧ｯ繧ｨ繝ｩ繝ｼ縺檎匱逕溘＠縺ｾ縺励◆縲ゅう繝ｳ繧ｿ繝ｼ繝阪ャ繝域磁邯壹ｒ遒ｺ隱阪＠縺ｦ縺上□縺輔＞縲・;
  } else {
    // 縺昴・莉悶・繧ｨ繝ｩ繝ｼ
    return `莠域悄縺励↑縺・お繝ｩ繝ｼ縺檎匱逕溘＠縺ｾ縺励◆: ${error.message}`;
  }
};

// API繝ｪ繧ｯ繧ｨ繧ｹ繝医・繝ｩ繝・ヱ繝ｼ髢｢謨ｰ・医お繝ｩ繝ｼ繝上Φ繝峨Μ繝ｳ繧ｰ莉倥″・・
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


// 隱崎ｨｼ髢｢騾｣API
export const authAPI = {
  login: async (credentials) => { // credentials 縺ｯ { email, password }
    // GitHub Pages逕ｨ縺ｮ繝｢繝・け讖溯・
    if (isMockMode()) {
      console.log("GitHub Pages mode: Using mock login");
      await new Promise(resolve => setTimeout(resolve, 800)); // 蠕・ｩ・
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

    // FastAPI縺ｮOAuth2貅匁侠縺ｮ繝医・繧ｯ繝ｳ繧ｨ繝ｳ繝峨・繧､繝ｳ繝医・騾壼ｸｸ application/x-www-form-urlencoded 繧呈悄蠕・
    const params = new URLSearchParams();
    params.append('username', credentials.email); // FastAPI蛛ｴ縺・username 繧呈悄蠕・☆繧句ｴ蜷・
    params.append('password', credentials.password);

    // 繝舌ャ繧ｯ繧ｨ繝ｳ繝峨・繝医・繧ｯ繝ｳ蜿門ｾ励ヱ繧ｹ (萓・ /auth/token)
    const response = await apiClient.post('/auth/token', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response; // 繝ｬ繧ｹ繝昴Φ繧ｹ蜈ｨ菴薙ｒ霑斐☆
  },
  register: async (userData) => { // userData 縺ｯ { email, password, full_name }
    console.log("Submitting to API /users/ with data (from api.js):", JSON.stringify(userData));
    
    // GitHub Pages逕ｨ縺ｮ繝｢繝・け讖溯・
    if (isMockMode()) {
      console.log("GitHub Pages mode: Using mock registration");
      // 繝｢繝・け謌仙粥繝ｬ繧ｹ繝昴Φ繧ｹ
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1遘偵・繝輔ぉ繧､繧ｯ蠕・ｩ・
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
    
    // 騾壼ｸｸ縺ｮAPI繝ｪ繧ｯ繧ｨ繧ｹ繝・
    const response = await apiClient.post('/users/', userData);
    return response;
  },
  getCurrentUser: async () => {
    // GitHub Pages逕ｨ縺ｮ繝｢繝・け讖溯・
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
    
    // 繝舌ャ繧ｯ繧ｨ繝ｳ繝峨・迴ｾ蝨ｨ繝ｦ繝ｼ繧ｶ繝ｼ諠・ｱ蜿門ｾ励お繝ｳ繝峨・繧､繝ｳ繝・(萓・ /users/me)
    const response = await apiClient.get('/users/me');
    return response; // 繝ｬ繧ｹ繝昴Φ繧ｹ蜈ｨ菴薙ｒ霑斐☆
  },
  setAuthToken: (token) => { // localStorage縺ｸ縺ｮ繝医・繧ｯ繝ｳ菫晏ｭ・蜑企勁
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('authToken', token);
      } else {
        localStorage.removeItem('authToken');
      }
    }
  }
};

// 繝励Ο繧ｸ繧ｧ繧ｯ繝磯未騾｣API (莉･蜑阪・繧ゅ・繧偵・繝ｼ繧ｹ縺ｫ)
export const projectsAPI = {
  getAll: async () => {
    if (isMockMode()) {
      console.log("GitHub Pages mode: Using mock getAll projects");
      await new Promise(resolve => setTimeout(resolve, 600));
      return {
        data: [
          {
            id: 1,
            name: "繧ｵ繝ｳ繝励Ν蟒ｺ迚ｩ險育ｮ・,
            description: "逵√お繝肴ｳ輔↓蝓ｺ縺･縺剰ｨ育ｮ励・繧ｵ繝ｳ繝励Ν繝励Ο繧ｸ繧ｧ繧ｯ繝・,
            owner_id: 1,
            created_at: new Date().toISOString()
          },
          {
            id: 2,
            name: "繧ｪ繝輔ぅ繧ｹ繝薙Ν逵√お繝崎ｨ育ｮ・,
            description: "螟ｧ隕乗ｨ｡繧ｪ繝輔ぅ繧ｹ繝薙Ν縺ｮ逵√お繝肴ｳ戊ｨ育ｮ・,
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
      // 繝励Ο繧ｸ繧ｧ繧ｯ繝・D=1縺ｮ蝣ｴ蜷医・險育ｮ礼ｵ先棡繧貞性繧縲√◎繧御ｻ･螟悶・遨ｺ
      const hasResults = parseInt(id) === 1;
      return {
        data: {
          id: parseInt(id),
          name: `繝励Ο繧ｸ繧ｧ繧ｯ繝・${id}`,
          description: "繝・Δ逕ｨ縺ｮ繝励Ο繧ｸ繧ｧ繧ｯ繝郁ｪｬ譏・,
          owner_id: 1,
          created_at: new Date().toISOString(),
          input_data: hasResults ? {
            building: {
              building_type: "菴丞ｮ・,
              total_floor_area: 100,
              climate_zone: 6,
              num_stories: 2,
              has_central_heat_source: false,
            },
            envelope: {
              parts: [
                {
                  part_name: "螟門｣∝圏",
                  part_type: "螢・,
                  area: 30,
                  u_value: 0.4,
                },
                {
                  part_name: "遯灘圏",
                  part_type: "遯・,
                  area: 5,
                  u_value: 2.33,
                  eta_value: 0.49,
                },
              ],
            },
            systems: {
              heating: {
                system_type: "繝ｫ繝ｼ繝繧ｨ繧｢繧ｳ繝ｳ",
                rated_capacity: 5,
                efficiency: 4.2,
                control_method: "繧､繝ｳ繝舌・繧ｿ蛻ｶ蠕｡",
              },
              cooling: {
                system_type: "繝ｫ繝ｼ繝繧ｨ繧｢繧ｳ繝ｳ",
                rated_capacity: 5,
                efficiency: 3.8,
                control_method: "繧､繝ｳ繝舌・繧ｿ蛻ｶ蠕｡",
              },
              ventilation: {
                system_type: "隨ｬ3遞ｮ謠帶ｰ・,
                air_volume: 150,
                power_consumption: 15,
              },
              hot_water: {
                system_type: "繧ｨ繧ｳ繧ｭ繝･繝ｼ繝・,
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
            message: "逵√お繝榊渕貅紋ｸ埼←蜷・ 荳谺｡繧ｨ繝阪Ν繧ｮ繝ｼ蝓ｺ貅紋ｸ埼←蜷・(逵√お繝咲紫: -21.3%)"
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
      await new Promise(resolve => setTimeout(resolve, 2000)); // 險育ｮ玲凾髢薙ｒ繧ｷ繝溘Η繝ｬ繝ｼ繝・
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
          message: "逵√お繝榊渕貅紋ｸ埼←蜷・ 荳谺｡繧ｨ繝阪Ν繧ｮ繝ｼ蝓ｺ貅紋ｸ埼←蜷・(逵√お繝咲紫: -21.3%)"
        },
        status: 200
      };
    }
    return apiClient.post(`/projects/${projectId}/calculate/`, inputData);
  },
};

// 繝ｬ繝昴・繝磯未騾｣API (莉･蜑阪・繧ゅ・繧偵・繝ｼ繧ｹ縺ｫ)
export const reportAPI = {
  getPDF: async (projectId) => {
    if (isMockMode()) {
      console.log("GitHub Pages mode: Mock PDF download");
      // 繝｢繝・けPDF繝・・繧ｿ・育ｩｺ縺ｮPDF鬚ｨ・・
      const mockPdfData = new Blob(['%PDF-1.4 Mock PDF Content'], { type: 'application/pdf' });
      return { data: mockPdfData, status: 200 };
    }
    return apiClient.get(`/projects/${projectId}/report/pdf/`, { responseType: 'blob' });
  },
  getExcel: async (projectId) => {
    if (isMockMode()) {
      console.log("GitHub Pages mode: Mock Excel download");
      // 繝｢繝・けExcel繝・・繧ｿ
      const mockExcelData = new Blob(['Mock Excel Content'], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      return { data: mockExcelData, status: 200 };
    }
    return apiClient.get(`/projects/${projectId}/report/excel/`, { responseType: 'blob' });
  },
};

// 險育ｮ輸PI
export const calcAPI = {
  calculateAndSave: (projectId, data) => projectsAPI.calculate(projectId, data),
};


// 譁ｰ縺励＞BEI險育ｮ輸PI
export const beiAPI = {
  // BEI隧穂ｾ｡
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

  // 繧ｫ繧ｿ繝ｭ繧ｰ逕ｨ騾泌叙蠕・
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

  // 繧ｫ繧ｿ繝ｭ繧ｰ蝨ｰ蝓溷叙蠕・
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

  // 繧ｫ繧ｿ繝ｭ繧ｰ蠑ｷ蠎ｦ繝・・繧ｿ蜿門ｾ・
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

// 繧ｨ繝阪Ν繧ｮ繝ｼ險育ｮ輸PI
export const energyAPI = {
  // 髮ｻ蜉幄ｨ育ｮ・
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

  // 繧ｨ繝阪Ν繧ｮ繝ｼ險育ｮ・
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

  // 繧ｳ繧ｹ繝郁ｨ育ｮ・
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

  // 讖溷勣菴ｿ逕ｨ驥城寔險・
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

// 譁咎≡API
export const tariffAPI = {
  // 譁咎≡隕狗ｩ阪ｂ繧・
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

export default apiClient; // 繝・ヵ繧ｩ繝ｫ繝医〒Axios繧､繝ｳ繧ｹ繧ｿ繝ｳ繧ｹ繧偵お繧ｯ繧ｹ繝昴・繝・
