// --- ENUMS & UI STATE ---

// ALTERADO: De 'enum' para Objeto Constante para evitar erros de 'undefined' no build
export const ViewState = {
  DASHBOARD: 'DASHBOARD',
  SERVICES: 'SERVICES',
  CATALOG: 'CATALOG',
  ADMIN_USERS: 'ADMIN_USERS',
  ADMIN_TEMPLATES: 'ADMIN_TEMPLATES',
} as const;

// Cria um tipo TypeScript a partir dos valores do objeto acima
export type ViewState = typeof ViewState[keyof typeof ViewState];

// --- AUTH & USER ---

export interface UserQuotaDetails {
  vms: number;
  cpu: number;
  memory: number;   // MB
  storage: number;  // GB
}

export interface UserQuota {
  used: UserQuotaDetails;
  limit: UserQuotaDetails;
}

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  is_admin: boolean;
  quota: UserQuota;
}

export interface LoginResponse {
  access_token: string;
  user: {
    id: number;
    username: string;
    is_admin: boolean;
  };
}

// --- CATALOG ---

export interface CatalogSpecs {
  cpu: number;     // vCores
  memory: number;  // MB
  storage: number; // GB
}

export interface CatalogItem {
  id: number;      
  name: string;
  description: string;
  type: 'lxc' | 'qemu'; 
  category: 'os' | 'app' | 'database'; 
  logo_url?: string;
  mode: 'clone' | 'file';
  specs: CatalogSpecs; 
}

// --- RESOURCES ---

export interface ServiceItem {
  id: number;        
  vmid: number;      
  name: string;
  type: 'lxc' | 'qemu';
  status: 'running' | 'stopped' | 'paused' | 'provisioning';
  cpu: number;       
  ram: number;       
  storage: number;   
  created_at?: string;
}

export interface DeployPayload {
  template_id: number;
  name: string;
}