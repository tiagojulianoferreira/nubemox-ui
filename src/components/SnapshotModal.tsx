import React, { useState, useEffect } from 'react';
import { ServiceItem } from '../types';
import { X, Camera, RotateCcw, Trash2, Plus, Loader2 } from 'lucide-react';
import { snapshotService } from '../services/api';
import toast from 'react-hot-toast';

interface SnapshotModalProps {
  service: ServiceItem; // Recebe o recurso selecionado
  onClose: () => void;
}

const SnapshotModal: React.FC<SnapshotModalProps> = ({ service, onClose }) => {
  const [snapshots, setSnapshots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  
  const [newSnapName, setNewSnapName] = useState('');
  const [newSnapDesc, setNewSnapDesc] = useState('');

  // 1. Carregar
  useEffect(() => {
    fetchData();
  }, [service]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await snapshotService.list(service.vmid);
      // O Proxmox retorna árvore, aqui assumimos lista plana ou filtramos
      setSnapshots(data.filter((s:any) => s.name !== 'current'));
    } catch (err) {
      toast.error("Erro ao carregar snapshots");
    } finally {
      setLoading(false);
    }
  };

  // 2. Criar
  const handleCreate = async () => {
    if(!newSnapName) return;
    setCreating(true);
    try {
      await snapshotService.create(service.vmid, newSnapName, newSnapDesc);
      toast.success("Snapshot criado!");
      setNewSnapName('');
      setNewSnapDesc('');
      fetchData(); // Reload
    } catch (err: any) {
      toast.error("Erro ao criar: " + err.response?.data?.error);
    } finally {
      setCreating(false);
    }
  };

  // 3. Rollback
  const handleRollback = async (name: string) => {
    if(!confirm(`Restaurar para ${name}? Dados atuais serão perdidos.`)) return;
    try {
      await snapshotService.rollback(service.vmid, name);
      toast.success("Sistema restaurado!");
      onClose(); // Fecha pois a VM vai reiniciar
    } catch (err) {
      toast.error("Falha no rollback.");
    }
  };

  // 4. Delete
  const handleDelete = async (name: string) => {
    if(!confirm(`Apagar snapshot ${name}?`)) return;
    try {
      await snapshotService.delete(service.vmid, name);
      toast.success("Snapshot removido.");
      fetchData();
    } catch (err) {
      toast.error("Falha ao deletar.");
    }
  };

  const formatDate = (ts: number) => new Date(ts * 1000).toLocaleString();

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-slate-900 p-5 text-white flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
                <Camera className="w-5 h-5 text-purple-400" /> Snapshots
            </h2>
            <p className="text-xs text-slate-400">Gerenciar backups de estado para {service.name}</p>
          </div>
          <button onClick={onClose}><X size={24} /></button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto grow">
          {/* Form */}
          <div className="bg-purple-50 p-4 rounded-lg mb-6 border border-purple-100">
            <h3 className="text-sm font-bold text-purple-900 mb-3 flex gap-2"><Plus size={16}/> Novo Snapshot</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <input value={newSnapName} onChange={e=>setNewSnapName(e.target.value)} placeholder="Nome (ex: pre-deploy)" className="px-3 py-2 border rounded text-sm"/>
                <input value={newSnapDesc} onChange={e=>setNewSnapDesc(e.target.value)} placeholder="Descrição" className="px-3 py-2 border rounded text-sm"/>
            </div>
            <button onClick={handleCreate} disabled={creating || !newSnapName} className="w-full bg-purple-600 text-white py-2 rounded text-sm hover:bg-purple-700 disabled:opacity-50">
                {creating ? "Criando..." : "Criar Ponto de Restauração"}
            </button>
          </div>

          {/* List */}
          {loading ? <div className="text-center py-8"><Loader2 className="animate-spin mx-auto"/></div> : (
            <div className="space-y-3">
                {snapshots.length === 0 && <p className="text-center text-gray-400">Nenhum snapshot.</p>}
                {snapshots.map(snap => (
                    <div key={snap.name} className="border p-4 rounded-lg flex justify-between items-center hover:shadow-sm">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-bold">{snap.name}</span>
                                <span className="text-xs bg-gray-100 px-2 rounded">{formatDate(snap.snaptime)}</span>
                            </div>
                            <p className="text-sm text-gray-500">{snap.description}</p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={()=>handleRollback(snap.name)} className="p-2 text-yellow-600 hover:bg-yellow-50 rounded" title="Restaurar"><RotateCcw size={18}/></button>
                            <button onClick={()=>handleDelete(snap.name)} className="p-2 text-red-600 hover:bg-red-50 rounded" title="Apagar"><Trash2 size={18}/></button>
                        </div>
                    </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SnapshotModal;