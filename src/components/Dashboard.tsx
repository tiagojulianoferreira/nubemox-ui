import React from 'react';
import { ServiceItem, UserProfile } from '../types';
// CORREÇÃO: Adicionado 'CircuitBoard' na lista de imports
import { Server, Cpu, Activity, HardDrive, ShieldCheck, Leaf, BookOpen, ExternalLink, Loader2, CircuitBoard } from 'lucide-react';

interface DashboardProps {
  resources: ServiceItem[];
  userProfile: UserProfile | null;
  loading: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ resources, userProfile, loading }) => {
  if (loading || !userProfile) {
    return (
        <div className="flex h-64 items-center justify-center">
            <Loader2 className="animate-spin text-indigo-600 w-8 h-8" />
        </div>
    );
  }

  const { quota } = userProfile;
  const runningServices = resources.filter(r => r.status === 'running').length;

  // Componente de Barra de Progresso Interno
  const QuotaBar = ({ label, used, limit, icon: Icon, colorClass, unit }: any) => {
    // Evita divisão por zero se limit for 0
    const percent = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
    
    return (
      <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${colorClass} bg-opacity-10`}>
              <Icon size={18} className={colorClass.replace('bg-', 'text-')} />
            </div>
            <span className="font-semibold text-gray-700 text-sm">{label}</span>
          </div>
          <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded">
             {unit ? `${used}/${limit} ${unit}` : `${used} / ${limit}`}
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2.5 mt-3 overflow-hidden">
          <div 
            className={`h-2.5 rounded-full transition-all duration-500 ${colorClass}`} 
            style={{ width: `${percent}%` }}
          ></div>
        </div>
        <p className="text-right text-xs text-gray-400 mt-1">{percent}% Utilizado</p>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* 1. Header Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-indigo-100 text-sm font-medium">Serviços Ativos</p>
                    <h3 className="text-3xl font-bold mt-1">{runningServices} <span className="text-lg font-normal opacity-70">/ {resources.length}</span></h3>
                </div>
                <div className="p-3 bg-white bg-opacity-20 rounded-xl">
                    <Activity className="w-8 h-8 text-white" />
                </div>
            </div>
            <div className="mt-4 flex items-center text-xs text-indigo-100 bg-black bg-opacity-20 w-fit px-3 py-1 rounded-full">
                <ShieldCheck className="w-3 h-3 mr-1" /> Ambiente Seguro
            </div>
         </div>

         <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
            <div className="flex items-center space-x-4">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                    <Leaf size={24} />
                </div>
                <div>
                    <p className="text-gray-500 text-sm">Eficiência de Cota</p>
                    <p className="text-lg font-bold text-gray-800">Regular</p>
                </div>
            </div>
            <p className="text-xs text-gray-400 mt-3 ml-1">Seu consumo está dentro dos limites aceitáveis.</p>
         </div>

         <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
            <div className="flex items-center space-x-4">
                <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                    <Server size={24} />
                </div>
                <div>
                    <p className="text-gray-500 text-sm">Pool de Recursos</p>
                    <p className="text-lg font-bold text-gray-800">vps-{userProfile.username}</p>
                </div>
            </div>
            <p className="text-xs text-gray-400 mt-3 ml-1">Gerenciado automaticamente pelo Nubemox.</p>
         </div>
      </div>

      {/* 2. Barra de Cotas (Dados Reais do Backend) */}
      <div>
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Activity className="text-indigo-600" size={20}/> Consumo de Recursos
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <QuotaBar 
                label="Máquinas Virtuais" 
                used={quota.used.vms} 
                limit={quota.limit.vms} 
                icon={Server} 
                colorClass="bg-blue-500" 
            />
            <QuotaBar 
                label="Processamento" 
                used={quota.used.cpu} 
                limit={quota.limit.cpu} 
                icon={Cpu} 
                colorClass="bg-purple-500"
                unit="Cores"
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
        </div>
      </div>

      {/* 3. Rodapé Informativo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
            <h4 className="font-bold text-slate-800 flex items-center gap-2 mb-3">
                <BookOpen size={18} /> Termos de Uso e Compliance
            </h4>
            <div className="space-y-2 text-sm text-slate-600">
                <p>O uso dos recursos computacionais deve estar em conformidade com as normas institucionais.</p>
                <div className="flex flex-col gap-2 mt-3">
                    <a href="#" className="flex items-center justify-between p-2 bg-white rounded border hover:bg-gray-50">
                        <span className="font-medium">Política de Segurança da Informação</span>
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