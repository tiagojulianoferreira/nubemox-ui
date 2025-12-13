import axios from 'axios';
import { 
  LoginResponse, 
  UserProfile, 
  CatalogItem, 
  ServiceItem, 
  DeployPayload, 
  ScalePayload 
} from '../types';

// 1. Configuração Base do Axios
const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Endereço do seu Backend Flask
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. Interceptor de Requisição (Segurança)
// Injeta o Token JWT em toda chamada para o backend saber quem é o usuário
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 3. Interceptor de Resposta (Sessão)
// Se o token expirar (401), desloga o usuário automaticamente para evitar erros em cascata
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Ignora erro na tela de login para permitir que o usuário tente novamente
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// --- SERVIÇOS MODULARES ---

// Autenticação e Perfil
export const authService = {
  login: async (username: string, password: string) => {
    const { data } = await api.post<LoginResponse>('/auth/login', { username, password });
    if (data.access_token) {
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  },

  // Busca dados do usuário + Cota atualizada (Usado no Dashboard)
  getProfile: async () => {
    const { data } = await api.get<UserProfile>('/auth/me');
    return data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }
};

// Catálogo de Templates (Specs fixas vindas do PVE)
export const catalogService = {
  listTemplates: async () => {
    const { data } = await api.get<CatalogItem[]>('/catalog/templates');
    return data;
  }
};

// Gestão de Recursos (VMs e Containers)
export const resourceService = {
  // Lista tudo que o usuário tem
  list: async () => {
    const { data } = await api.get<ServiceItem[]>('/provisioning/resources');
    return data;
  },

  // Deploy simplificado (apenas ID e Nome)
  deploy: async (payload: DeployPayload) => {
    const { data } = await api.post('/provisioning/deploy', payload);
    return data;
  },

  // Escalonamento Vertical (ScaleModal)
  scale: async (vmid: number, payload: ScalePayload) => {
    const { data } = await api.put(`/provisioning/resources/${vmid}/scale`, payload);
    return data;
  },

  // Ações de Ciclo de Vida
  delete: async (vmid: number) => {
    await api.delete(`/provisioning/resources/${vmid}`);
  },
  
  start: (vmid: number) => api.post(`/provisioning/resources/${vmid}/start`),
  stop: (vmid: number) => api.post(`/provisioning/resources/${vmid}/stop`),
  reboot: (vmid: number) => api.post(`/provisioning/resources/${vmid}/reboot`),
};

// Gestão de Snapshots (SnapshotModal)
export const snapshotService = {
  list: async (vmid: number) => {
    const { data } = await api.get(`/provisioning/resources/${vmid}/snapshots`);
    return data;
  },

  create: async (vmid: number, name: string, description?: string) => {
    const { data } = await api.post(`/provisioning/resources/${vmid}/snapshots`, {
      name,
      description
    });
    return data;
  },

  rollback: async (vmid: number, snapname: string) => {
    const { data } = await api.post(`/provisioning/resources/${vmid}/snapshots/${snapname}/rollback`);
    return data;
  },

  delete: async (vmid: number, snapname: string) => {
    const { data } = await api.delete(`/provisioning/resources/${vmid}/snapshots/${snapname}`);
    return data;
  }
};

// Stubs para evitar quebras em componentes legados (opcional)
export const clusterService = {
  getNodes: async () => Promise.resolve([]),
  getPools: async () => Promise.resolve([]),
};

// EXPORTAÇÃO PADRÃO (Essencial para imports como "import api from ...")
export default api;