// --- ENUMS & UI STATE ---

export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  SERVICES = 'SERVICES',
  CATALOG = 'CATALOG',
}

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
  quota: UserQuota; // Agora reflete a estrutura aninhada { used, limit } do backend
}

export interface LoginResponse {
  access_token: string;
  user: {
    id: number;
    username: string;
    is_admin: boolean;
  };
}

// --- CATALOG (Nova Abordagem) ---

export interface CatalogSpecs {
  cpu: number;     // vCores
  memory: number;  // MB
  storage: number; // GB
}

export interface CatalogItem {
  id: number;      // ID do banco de dados (usado no deploy)
  name: string;
  description: string;
  type: 'lxc' | 'qemu'; 
  category: 'os' | 'app' | 'database'; 
  logo_url?: string;
  mode: 'clone' | 'file';
  specs: CatalogSpecs; // Hardware fixo definido pelo Admin/PVE
}

// --- RESOURCES (Serviços do Usuário) ---

// Unificamos VM e CT numa interface comum, pois o backend trata tudo como VirtualResource
export interface ServiceItem {
  id: number;        // ID do banco local (Nubemox)
  vmid: number;      // ID do Proxmox (100, 101...)
  name: string;
  type: 'lxc' | 'qemu';
  status: 'running' | 'stopped' | 'paused' | 'provisioning';
  
  // Specs atuais (podem ser diferentes do catálogo se houve Scale)
  cpu: number;       
  ram: number;       // O Backend envia como 'ram' na lista de recursos
  storage: number;   // GB
  
  created_at?: string;
}

// --- PAYLOADS (Para envios à API) ---

// Deploy agora é simples: só precisamos saber O QUÊ (Template) e QUEM (Nome)
export interface DeployPayload {
  template_id: number;
  name: string;
}

// Scale: Envio parcial (posso mandar só RAM ou só CPU)
export interface ScalePayload {
  cores?: number;
  memory?: number; // MB
}

// --- PROXMOX CLUSTER DATA (Opcional, para dashboard de admin) ---

export interface Node {
  node: string;
  status: 'online' | 'offline';
  cpu?: number;
  maxcpu?: number;
  mem?: number;
  maxmem?: number;
  uptime?: number;
}