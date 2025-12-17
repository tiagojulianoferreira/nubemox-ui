import React from 'react';
import { ServiceItem, UserProfile } from '../types';
import { 
    Cpu, 
    HardDrive, 
    BookOpen, 
    ExternalLink, 
    Loader2, 
    CircuitBoard, 
    CheckCircle, 
    AlertTriangle, 
    Server,
    Activity,
    ShieldCheck
} from 'lucide-react';

interface SystemHealth {
    status: string;
    proxmox: string;
    database: string;
    details: {
        nodes_online?: number;
        pve_version?: string;
        proxmox_error?: string;
        db_error?: string;
    };
}

interface DashboardProps {
  resources: ServiceItem[];
  userProfile: UserProfile | null;
  systemHealth?: SystemHealth; 
  loading: boolean;
}

// Componente de Barra de Cota
const QuotaBar = ({ label, used, limit, icon: Icon, colorClass, unit }: any) => {
    const percentage = Math.min(100, Math.round((used / limit) * 100)) || 0;
    return (
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg ${colorClass} bg-opacity-10`}>
                        <Icon size={16} className={colorClass.replace('bg-', 'text-')} />
                    </div>
                    <span className="text-sm font-medium text-slate-600">{label}</span>
                </div>
                <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded">
                    {percentage}%
                </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 mb-2 overflow-hidden">
                <div 
                    className={`h-2.5 rounded-full transition-all duration-500 ${colorClass}`} 
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
            <div className="flex justify-between text-xs text-slate-500">
                <span>{used} {unit}</span>
                <span>Max: {limit} {unit}</span>
            </div>
        </div>
    );
};

const Dashboard: React.FC<DashboardProps> = ({ resources, userProfile, systemHealth, loading }) => {
  
  if (loading || !userProfile) {
    return (
        <div className="flex h-64 items-center justify-center">
            <Loader2 className="animate-spin text-indigo-600 w-8 h-8" />
        </div>
    );
  }

  // Lógica de Status (Simplificada para Segurança)
  const isProxmoxConnected = systemHealth?.proxmox === 'connected';
  const errorMsg = systemHealth?.details?.proxmox_error || 'Erro de comunicação com o Hypervisor';

  const quota = userProfile.quota || {
    used: { vms: 0, cpu: 0, memory: 0, storage: 0 },
    limit: { vms: 0, cpu: 0, memory: 0, storage: 0 }
  };

  const runningServices = resources.filter(r => r.status === 'running').length;

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            Olá, {userProfile.username || 'Utilizador'} 👋
          </h2>
          <p className="text-slate-500 mt-1">
            Painel de controle dos seus recursos na infraestrutura institucional.
          </p>
        </div>
        
        {/* Card Resumo Simples */}
        <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-full">
                <Activity size={18} className="text-green-600" />
            </div>
            <div>
                <p className="text-xs text-slate-500 uppercase font-bold">Serviços Ativos</p>
                <p className="text-lg font-bold text-slate-800">{runningServices} <span className="text-xs font-normal text-slate-400">/ {resources.length}</span></p>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ESQUERDA: Card de Status do Cluster (Versão Clean/Segura) */}
        <div className="lg:col-span-1">
            <div className={`h-full rounded-2xl p-6 border transition-all flex flex-col justify-between ${
                isProxmoxConnected 
                ? 'bg-gradient-to-br from-indigo-600 to-blue-600 border-indigo-500 text-white shadow-lg shadow-indigo-200' 
                : 'bg-white border-red-200 border-l-4 border-l-red-500'
            }`}>
                <div>
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className={`font-bold text-lg flex items-center gap-2 ${isProxmoxConnected ? 'text-white' : 'text-red-700'}`}>
                                <Server size={20} /> Infraestrutura
                            </h3>
                            <p className={`text-sm mt-1 opacity-90 ${isProxmoxConnected ? 'text-indigo-100' : 'text-red-500'}`}>
                                Estado do Cluster de Virtualização
                            </p>
                        </div>
                        {isProxmoxConnected ? (
                            <ShieldCheck className="text-green-300" size={32} />
                        ) : (
                            <AlertTriangle className="text-red-500" size={32} />
                        )}
                    </div>

                    <div className={`p-4 rounded-xl flex items-center gap-3 ${isProxmoxConnected ? 'bg-white/10 backdrop-blur-md' : 'bg-red-50'}`}>
                        <div className={`w-3 h-3 rounded-full ${isProxmoxConnected ? 'bg-green-400 animate-pulse' : 'bg-red-500'}`}></div>
                        <div>
                            <span className={`block text-xs uppercase font-bold tracking-wider ${isProxmoxConnected ? 'text-indigo-200' : 'text-red-400'}`}>
                                Conexão
                            </span>
                            <span className={`font-bold text-lg ${isProxmoxConnected ? 'text-white' : 'text-red-700'}`}>
                                {isProxmoxConnected ? 'Sistema Operacional' : 'Indisponível'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Exibe erro apenas se houver falha, senão fica limpo */}
                {!isProxmoxConnected && (
                    <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-100">
                        <span className="text-xs text-red-500 block mb-1 font-bold">Diagnóstico:</span>
                        <p className="text-xs text-red-700 font-mono break-all leading-tight">
                            {errorMsg}
                        </p>
                    </div>
                )}
                
                {isProxmoxConnected && (
                    <div className="mt-4 flex items-center gap-2 text-xs text-indigo-200 opacity-75">
                        <CheckCircle size={14} /> Operando normalmente
                    </div>
                )}
            </div>
        </div>

        {/* DIREITA: Cotas de Recursos */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
             <QuotaBar 
                label="Processamento" 
                used={quota.used.cpu} 
                limit={quota.limit.cpu} 
                icon={Cpu} 
                colorClass="bg-blue-500"
                unit="vCores"
            />
             <QuotaBar 
                label="Memória RAM" 
                used={quota.used.memory} 
                limit={quota.limit.memory} 
                icon={CircuitBoard} 
                colorClass="bg-emerald-500"
                unit="MB"
            />
             <QuotaBar 
                label="Armazenamento" 
                used={quota.used.storage} 
                limit={quota.limit.storage} 
                icon={HardDrive} 
                colorClass="bg-orange-500"
                unit="GB"
            />
             <QuotaBar 
                label="Máquinas Virtuais" 
                used={quota.used.vms} 
                limit={quota.limit.vms} 
                icon={Server} 
                colorClass="bg-violet-500"
                unit="VMs"
            />
        </div>
      </div>

      {/* Rodapé */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
            <h4 className="font-bold text-slate-800 flex items-center gap-2 mb-3">
                <BookOpen size={18} /> Compliance & Uso
            </h4>
            <div className="space-y-2 text-sm text-slate-600">
                <p>O ambiente monitorado garante a integridade dos seus dados e a disponibilidade dos serviços.</p>
                <div className="flex flex-col gap-2 mt-3">
                    <a href="#" className="flex items-center justify-between p-2 bg-white rounded border hover:bg-gray-50 transition-colors">
                        <span className="font-medium">Termos de Serviço</span>
                        <ExternalLink size={14} />
                    </a>
                </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Dashboard;