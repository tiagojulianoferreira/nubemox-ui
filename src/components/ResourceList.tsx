import React from 'react';
import { ServiceItem } from '../types';
import { Play, Square, RefreshCw, Terminal, Trash2, Box, Monitor, Share2, Camera, Sliders } from 'lucide-react';
import { resourceService } from '../services/api';
import toast from 'react-hot-toast';

interface ResourceListProps {
  data: ServiceItem[];
  onRefresh: () => void;
  onScale: (item: ServiceItem) => void;
  onSnapshot: (item: ServiceItem) => void;
}

const ResourceList: React.FC<ResourceListProps> = ({ data, onRefresh, onScale, onSnapshot }) => {
  
  // Ações chamam a API e disparam Refresh
  const handleAction = async (action: 'start' | 'stop' | 'reboot', id: number) => {
    try {
        if (action === 'start') await resourceService.start(id);
        if (action === 'stop') await resourceService.stop(id);
        if (action === 'reboot') await resourceService.reboot(id);
        toast.success(`Comando ${action} enviado.`);
        setTimeout(onRefresh, 2000); // Aguarda um pouco antes de atualizar
    } catch (error) {
        toast.error("Erro ao executar ação.");
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`ATENÇÃO: Deseja destruir permanentemente ${name}?`)) return;
    try {
        await resourceService.delete(id);
        toast.success("Recurso destruído.");
        onRefresh();
    } catch (error) {
        toast.error("Erro ao deletar.");
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      running: 'bg-green-100 text-green-700 border-green-200',
      stopped: 'bg-gray-100 text-gray-600 border-gray-200',
      provisioning: 'bg-yellow-100 text-yellow-700 border-yellow-200 animate-pulse',
    };
    // @ts-ignore
    const css = styles[status] || 'bg-gray-100 text-gray-600';
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${css} capitalize`}>
        {status}
      </span>
    );
  };

  if (data.length === 0) {
      return (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
              <p className="text-gray-500">Você ainda não tem recursos criados.</p>
              <p className="text-sm text-gray-400">Vá ao Catálogo para fazer seu primeiro deploy.</p>
          </div>
      );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-500 font-semibold tracking-wider">
              <th className="px-6 py-4">Nome / ID</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Recursos (CPU / RAM)</th>
              <th className="px-6 py-4">IP / Acesso</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {data.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${item.type === 'lxc' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                                {item.type === 'lxc' ? <Box size={18} /> : <Monitor size={18} />}
                            </div>
                            <div>
                                <p className="font-bold text-gray-900">{item.name}</p>
                                <p className="text-xs text-gray-400 font-mono">ID: {item.vmid}</p>
                            </div>
                        </div>
                    </td>
                    <td className="px-6 py-4">
                        {getStatusBadge(item.status)}
                    </td>
                    <td className="px-6 py-4">
                        <div className="text-sm text-gray-600 space-y-1">
                            <div className="flex items-center gap-2">
                                <span className="font-mono text-xs bg-gray-100 px-1 rounded">{item.cpu} vCpu</span>
                                <span className="font-mono text-xs bg-gray-100 px-1 rounded">{item.ram} MB</span>
                            </div>
                            <div className="text-xs text-gray-400">{item.storage} GB Disco</div>
                        </div>
                    </td>
                    <td className="px-6 py-4">
                        <span className="text-sm text-gray-500 italic">DHCP (Auto)</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <div className="flex items-center justify-end gap-1 opacity-100 sm:opacity-60 sm:group-hover:opacity-100 transition-opacity">
                            
                            {/* Power Controls */}
                            {item.status === 'running' ? (
                                <>
                                    <button onClick={() => handleAction('reboot', item.vmid)} className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg" title="Reiniciar">
                                        <RefreshCw size={16} />
                                    </button>
                                    <button onClick={() => handleAction('stop', item.vmid)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Desligar">
                                        <Square size={16} fill="currentColor" />
                                    </button>
                                </>
                            ) : (
                                <button onClick={() => handleAction('start', item.vmid)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg" title="Ligar">
                                    <Play size={16} fill="currentColor" />
                                </button>
                            )}

                            <div className="w-px h-4 bg-gray-300 mx-2"></div>

                            {/* Management */}
                            <button onClick={() => window.open(`http://meu-proxmox:8006/?console=...`, '_blank')} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg" title="Console VNC">
                                <Terminal size={16} />
                            </button>
                            
                            <button onClick={() => onSnapshot(item)} className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg" title="Snapshots">
                                <Camera size={16} />
                            </button>

                            <button onClick={() => onScale(item)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg" title="Escalar Recursos">
                                <Sliders size={16} />
                            </button>

                            <button onClick={() => handleDelete(item.vmid, item.name)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg ml-2" title="Destruir">
                                <Trash2 size={16} />
                            </button>
                       </div>
                    </td>
                </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResourceList;