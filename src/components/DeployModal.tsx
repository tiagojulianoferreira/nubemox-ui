import React, { useState } from 'react';
import { CatalogItem, UserProfile } from '../types';
import { X, Server, Check } from 'lucide-react';

interface DeployModalProps {
  item: CatalogItem;
  user: UserProfile;
  // pools removido pois o backend gerencia isso
  onClose: () => void;
  onConfirm: (payload: { template_id: number; name: string }, type: 'lxc' | 'qemu') => void;
}

const DeployModal: React.FC<DeployModalProps> = ({ item, user, onClose, onConfirm }) => {
  const [hostname, setHostname] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = () => {
    if (!hostname) return;
    setIsSubmitting(true);
    
    // Payload alinhado com o Backend Python (routes.py)
    const payload = {
        template_id: item.id, // ID real do banco (PK)
        name: hostname,
    };
    
    // O tipo vem do item (lxc ou qemu) para ajudar o frontend a categorizar depois se quiser
    onConfirm(payload, item.type);
  };

  return (
    <div className="fixed inset-0 bg-slate-900 bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 p-6 text-white flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Server className="w-5 h-5 text-blue-400" />
              Novo Recurso
            </h2>
            <p className="text-slate-400 text-sm mt-1">Configurar nova instância</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
            {/* Resumo do Template Selecionado */}
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Template Base</span>
                    <span className="bg-white text-blue-800 text-xs px-2 py-0.5 rounded border border-blue-200 font-mono">
                        {item.type.toUpperCase()}
                    </span>
                </div>
                <h3 className="text-lg font-bold text-blue-900">{item.name}</h3>
                
                <div className="flex gap-4 mt-3 text-sm text-blue-800">
                    <span title="Processador">🧠 <b>{item.specs.cpu}</b> vCore</span>
                    <span title="Memória RAM">💾 <b>{item.specs.memory}</b> MB</span>
                    <span title="Armazenamento">💿 <b>{item.specs.storage}</b> GB</span>
                </div>
            </div>

            {/* Input de Nome */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome do Host (Hostname)
                </label>
                <div className="relative">
                    <input 
                        type="text" 
                        value={hostname}
                        onChange={(e) => {
                            // Sanitização simples no frontend: lowercase e sem espaços
                            const clean = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                            setHostname(clean);
                        }}
                        placeholder="ex: meu-servidor-web"
                        className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        autoFocus
                    />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                    Apenas letras minúsculas (a-z), números (0-9) e hífens (-).
                </p>
            </div>

            <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-lg text-xs text-yellow-800">
                <p>
                    <strong>Nota:</strong> A máquina será criada no seu pool pessoal. 
                    Se você exceder a cota de <strong>{user.quota.limit.cpu} vCores</strong> ou <strong>{user.quota.limit.memory} MB</strong>, a criação será bloqueada.
                </p>
            </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end space-x-3 shrink-0">
            <button 
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
            >
                Cancelar
            </button>
            <button 
                onClick={handleSubmit}
                disabled={!hostname || isSubmitting}
                className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
                {isSubmitting ? (
                    <>Processando...</>
                ) : (
                    <>
                        <Check size={16} /> Confirmar
                    </>
                )}
            </button>
        </div>
      </div>
    </div>
  );
};

export default DeployModal;