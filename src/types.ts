// API Response Types

// --- AUTHENTICATION ---
export interface LoginResponse {
  access_token: string;
  user: UserProfile;
}

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  is_admin: boolean;
  poolId?: string; // Mantido para compatibilidade visual, backend deve enviar ou calculamos
  quota: UserQuota;
}

// --- RESOURCES (Backend Contract) ---
export interface ApiResource {
  id: number; // ID do banco local
  vmid: number; // ID do Proxmox
  name: string;
  type: 'qemu' | 'lxc' | 'vm' | 'ct'; // Adaptar conforme o backend retornar
  status: 'running' | 'stopped' | 'paused';
  cpu: number;
  ram: number; // MB ou Bytes? Assumindo MB baseado no contrato comum
  storage: number; // GB
  created_at: string;
}

// --- UI INTERFACES (Mantidas para os componentes funcionarem) ---
export interface Node {
  node: string;
  status: 'online' | 'offline';
  cpu?: number;
  maxcpu?: number;
  mem?: number;
  maxmem?: number;
  uptime?: number;
}

export interface ClusterSummary {
  nodes: Node[];
  name: string;
}

export interface ResourcePool {
  poolid: string;
  comment?: string;
}

export interface VirtualMachine {
  vmid: number;
  name: string;
  status: 'running' | 'stopped' | 'paused';
  cpus: number;
  maxmem: number; // in bytes
  maxdisk?: number; // in bytes
  uptime: number;
  // UI extended properties
  type?: 'qemu'; 
  sharedWith?: string[];
}

export interface Container {
  vmid: number; 
  name: string;
  status: 'running' | 'stopped' | 'paused';
  cpus: number;
  maxmem: number; // in bytes
  maxdisk?: number; // in bytes
  uptime: number;
  // UI extended properties
  type?: 'lxc';
  sharedWith?: string[];
}

export type ServiceItem = (VirtualMachine | Container) & { resourceType: 'vm' | 'ct' };

export interface Snapshot {
  name: string;
  description: string;
  snaptime: number;
  vmstate?: boolean;
}

// UI State Types
export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  SERVICES = 'SERVICES',
  CATALOG = 'CATALOG',
}

export interface UserQuota {
  cpuUsed: number;
  cpuLimit: number;
  memUsed: number; // bytes
  memLimit: number; // bytes
  storageUsed: number; // bytes
  storageLimit: number; // bytes
}

// Service Catalog Types
export interface CatalogItem {
  id: string;
  backendId: number; // ID numérico para a API de deploy
  name: string;
  description: string;
  type: 'vm' | 'ct';
  category: 'general' | 'compute' | 'memory' | 'minimal';
  specs: {
    cores: number;
    memory: number; // MB
    storage: number; // GB
  };
  template: string;
}

export interface FirewallRule {
  port: number;
  protocol: 'tcp' | 'udp';
  comment?: string;
}

export interface CreateVmPayload {
  vmid: number;
  name: string;
  memory: number; // MB
  cores: number;
  storage: string;
  poolid: string;
  firewallRules?: FirewallRule[];
}

export interface CreateCtPayload {
  vmid: number;
  name: string;
  template: string;
  storage: string;
  poolid: string;
  firewallRules?: FirewallRule[];
}

export interface UpdateServicePayload {
  cores?: number;
  memory?: number; // MB
  disk_increment_gb?: number;
}

export interface CreatePoolPayload {
  poolid: string;
  comment: string;
}