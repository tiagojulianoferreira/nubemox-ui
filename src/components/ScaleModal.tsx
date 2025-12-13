import React, { useState } from 'react';
import { ServiceItem } from '../types';
import { X, Cpu, HardDrive, AlertTriangle, Save } from 'lucide-react';
import { resourceService } from '../services/api';
import toast from 'react-hot-toast';

interface ScaleModalProps {
  service: ServiceItem;
  onClose: () => void;
  onSuccess: () => void;
}

const ScaleModal: React.FC<ScaleModalProps> = ({ service, onClose, onSuccess }) => {
  const [cores, setCores] = useState(service.cpu);
  const [memory, setMemory] = useState(service.ram);
  const [loading, setLoading] = useState(false);

  // NOTA: O backend não suporta scale de disco nesta rota ainda (apenas resize no catálogo). 
  // Focamos em CPU e RAM aqui.

  const handleConfirm = async () => {
    setLoading(true);
    try {
        await resourceService.scale(service.vmid, {
            cores: cores,
            memory: memory
        });
        toast.success("Recursos atualizados com sucesso!");
        onSuccess(); // Recarrega a lista
        onClose();
    } catch (err: any) {
        toast.error(err.response?.data?.description || "Erro ao escalar."); // backend retorna 403 com msg de cota
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        
        <div className="bg-slate-900 p-5 text-white flex justify-between items-center">
            <h2 className="text-lg font-bold flex items-center gap-2">
                <Cpu className="text-indigo-400"/> Escalar Recursos
            </h2>
            <button onClick={onClose}><X/></button>
        </div>

        <div className="p-6 space-y-6">
            <div className="bg-yellow-50 p-3 rounded border border-yellow-200 text-xs text-yellow-800 flex gap-2">
                <AlertTriangle size={16} className="shrink-0"/>
                <p>Alterações de hardware podem exigir reinicialização. Verifique sua cota antes de aumentar.</p>
            </div>

            {/* CPU Slider */}
            <div>
                <div className="flex justify-between mb-2">
                    <label className="font-bold text-gray-700">CPU Cores</label>
                    <span className="bg-indigo-100 text-indigo-700 px-2 rounded font-mono">{cores} vCore</span>
                </div>
                <input 
                    type="range" min="1" max="8" step="1" 
                    value={cores} onChange={e => setCores(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>1 Core</span>
                    <span>8 Cores</span>
                </div>
            </div>

            {/* RAM Slider */}
            <div>
                <div className="flex justify-between mb-2">
                    <label className="font-bold text-gray-700">Memória RAM</label>
                    <span className="bg-emerald-100 text-emerald-700 px-2 rounded font-mono">{memory} MB</span>
                </div>
                <input 
                    type="range" min="512" max="8192" step="512" 
                    value={memory} onChange={e => setMemory(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>512 MB</span>
                    <span>8 GB</span>
                </div>
            </div>
        </div>

        <div className="p-6 bg-gray-50 border-t flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg">Cancelar</button>
            <button 
                onClick={handleConfirm} 
                disabled={loading}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
            >
                {loading ? "Aplicando..." : <><Save size={18}/> Salvar</>}
            </button>
        </div>
      </div>
    </div>
  );
};

export default ScaleModal;