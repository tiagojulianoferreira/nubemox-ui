import React, { useState } from 'react';
import { X, AlertCircle, HardDrive, Cpu, Server } from 'lucide-react';
import { CatalogItem, UserProfile } from '../types';

interface DeployModalProps {
  item: CatalogItem;
  user: UserProfile; // Usado para mostrar a cota na msg amarela se quiser
  onClose: () => void;
  onConfirm: (payload: any) => Promise<void>;
}

export default function DeployModal({ item, user, onClose, onConfirm }: DeployModalProps) {
  const [hostname, setHostname] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    // Validação simples do hostname
    if (!hostname || hostname.length < 3) {
      setError("O Hostname deve ter pelo menos 3 caracteres.");
      return;
    }
    
    // Regex simples para hostname (letras, numeros, hifens)
    const validHostname = /^[a-z0-9-]+$/.test(hostname);
    if (!validHostname) {
      setError("Use apenas letras minúsculas, números e hífens.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // O Payload envia as specs fixas do item, já que o usuário não pode editar
      const payload = {
        template_id: item.id,
        name: hostname,
        cpu: item.specs.cpu,       // Envia o valor fixo do template
        memory: item.specs.memory, // Envia o valor fixo do template
        // storage: item.specs.storage // O backend geralmente pega do template se não enviar
      };

      await onConfirm(payload);
      // Se sucesso, o pai (App.tsx) fecha o modal.

    } catch (err: any) {
      const msg = err.response?.data?.error || "Falha ao solicitar criação.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* CABEÇALHO */}
        <div className="bg-slate-900 px-6 py-4 flex justify-between items-center text-white">
          <div>
            <div className="flex items-center gap-2">
                <Server size={18} className="text-blue-400"/>
                <h2 className="text-lg font-bold">Novo Recurso</h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Configurar nova instância</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          
          {/* BANNER DE ERRO (Só aparece se o Backend rejeitar) */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 text-red-700 text-sm animate-in slide-in-from-top-2">
              <AlertCircle size={18} className="shrink-0 mt-0.5 text-red-600" />
              <div>
                <span className="font-bold block mb-0.5">Erro na Criação</span>
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* CARD DO TEMPLATE (VISUALIZAÇÃO APENAS) */}
          <div className="border border-blue-100 bg-blue-50/50 rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Template Base</span>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-white border border-blue-200 text-blue-600 rounded">
                    {item.type.toUpperCase()}
                </span>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">{item.name}</h3>
            
            <div className="flex gap-4 text-sm text-slate-600">
                <div className="flex items-center gap-1.5" title="CPU Cores">
                    <span className="text-red-400">🧠</span> 
                    <span className="font-medium text-slate-900">{item.specs.cpu}</span> vCore
                </div>
                <div className="flex items-center gap-1.5" title="Memória RAM">
                    <span className="text-blue-400">💾</span> 
                    <span className="font-medium text-slate-900">{item.specs.memory}</span> MB
                </div>
                <div className="flex items-center gap-1.5" title="Disco">
                    <span className="text-emerald-400">💿</span> 
                    <span className="font-medium text-slate-900">{item.specs.storage}</span> GB
                </div>
            </div>
          </div>

          {/* INPUT HOSTNAME */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Nome do Host (Hostname)
            </label>
            <input 
              autoFocus
              type="text" 
              className={`w-full p-3 border rounded-lg outline-none transition-all ${
                  error ? 'border-red-300 focus:ring-2 focus:ring-red-100' : 'border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
              }`}
              placeholder="ex: meu-servidor-web"
              value={hostname}
              onChange={(e) => setHostname(e.target.value.toLowerCase())}
            />
            <p className="text-xs text-slate-400 mt-1.5">
              Apenas letras minúsculas (a-z), números (0-9) e hífens (-).
            </p>
          </div>

          {/* NOTA AMARELA (INFORMATIVA) */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800 leading-relaxed">
            <strong>Nota:</strong> A máquina será criada no seu pool pessoal. 
            Se você exceder sua cota, a criação será bloqueada pelo sistema.
          </div>

        </div>

        {/* RODAPÉ */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <button 
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg font-medium transition-colors text-sm"
          >
            Cancelar
          </button>
          
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium shadow-sm transition-all flex items-center gap-2 text-sm disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                Processando...
              </>
            ) : (
              <>
               <span className="text-white">✓</span> Confirmar
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}