import React, { useState, useEffect } from 'react';
import { CatalogItem } from '../types';
import api from '../services/api';
import { Search, Server, HardDrive, Cpu, Loader2, AlertCircle } from 'lucide-react';

interface ServiceCatalogProps {
  onSelect: (item: CatalogItem) => void;
}

export default function ServiceCatalog({ onSelect }: ServiceCatalogProps) {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Busca os templates reais do Backend (Postgres)
  useEffect(() => {
    fetchCatalog();
  }, []);

  const fetchCatalog = async () => {
    try {
      setLoading(true);
      const response = await api.get('/catalog/templates');
      setItems(response.data);
    } catch (err) {
      console.error(err);
      setError('Falha ao carregar o catálogo de serviços.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Filtro local por nome
  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <Loader2 className="w-8 h-8 animate-spin mb-2" />
        <p>Sincronizando com o Catálogo...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-red-500">
        <AlertCircle className="w-10 h-10 mb-2" />
        <p>{error}</p>
        <button onClick={fetchCatalog} className="mt-4 text-blue-600 underline">Tentar novamente</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Barra de Pesquisa */}
      <div className="relative max-w-md mx-auto md:mx-0">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input 
          type="text" 
          placeholder="Buscar templates..." 
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Grid de Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredItems.map((item) => (
          <div key={item.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow flex flex-col h-full">
            
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                 {/* Se tiver URL de logo usa, senão ícone genérico */}
                 {item.logo_url ? (
                   <img src={item.logo_url} alt={item.name} className="w-6 h-6 object-contain" />
                 ) : (
                   item.type === 'lxc' ? <Box size={24} /> : <Monitor size={24} />
                 )}
              </div>
              <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                item.type === 'lxc' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'
              }`}>
                {item.type === 'lxc' ? 'CT' : 'VM'}
              </span>
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-2">{item.name}</h3>
            <p className="text-sm text-gray-500 mb-6 line-clamp-2 flex-grow">
              {item.description || "Template pronto para produção."}
            </p>

            {/* Specs Fixas (Vindas do PVE via Banco) */}
            <div className="grid grid-cols-3 gap-2 mb-6">
              <div className="text-center p-2 bg-gray-50 rounded-lg border border-gray-100">
                <Cpu className="w-4 h-4 mx-auto text-gray-400 mb-1" />
                <span className="block text-sm font-bold text-gray-700">{item.specs.cpu}</span>
                <span className="text-[10px] text-gray-500 uppercase">vCore</span>
              </div>
              <div className="text-center p-2 bg-gray-50 rounded-lg border border-gray-100">
                <Server className="w-4 h-4 mx-auto text-gray-400 mb-1" />
                <span className="block text-sm font-bold text-gray-700">
                  {item.specs.memory >= 1024 ? `${item.specs.memory/1024}G` : `${item.specs.memory}M`}
                </span>
                <span className="text-[10px] text-gray-500 uppercase">RAM</span>
              </div>
              <div className="text-center p-2 bg-gray-50 rounded-lg border border-gray-100">
                <HardDrive className="w-4 h-4 mx-auto text-gray-400 mb-1" />
                <span className="block text-sm font-bold text-gray-700">{item.specs.storage}G</span>
                <span className="text-[10px] text-gray-500 uppercase">Disco</span>
              </div>
            </div>

            <button 
              onClick={() => onSelect(item)}
              className="w-full py-2.5 bg-white border-2 border-slate-900 text-slate-900 font-semibold rounded-lg hover:bg-slate-900 hover:text-white transition-all mt-auto"
            >
              Criar Recurso
            </button>
          </div>
        ))}
      </div>
      
      {filteredItems.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-400">
          <p>Nenhum template encontrado.</p>
        </div>
      )}
    </div>
  );
}

// Ícones auxiliares
const Box = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
);
const Monitor = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
);