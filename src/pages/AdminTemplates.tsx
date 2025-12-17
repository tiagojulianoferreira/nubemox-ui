import React, { useState, useEffect } from 'react';
import { 
    Edit2, 
    Server, 
    Loader2, 
    Save, 
    RefreshCw, 
    HardDrive, 
    Cpu, 
    Box, 
    FileCode, 
    Eye, 
    EyeOff, 
    DownloadCloud,
    CheckSquare,
    Square,
    AlertTriangle,
    Trash2
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

// Interface do Template já salvo no Banco
interface Template {
    id: number;
    name: string;
    type: 'lxc' | 'qemu';
    deploy_mode: 'clone' | 'file' | 'create';
    proxmox_template_volid: string;
    category: string;
    is_active: boolean;
    default_cpu: number;
    default_memory: number;
    default_storage: number;
}

// Interface do Template detectado no Proxmox (Candidato)
interface CandidateTemplate {
    volid: string;
    name: string;
    type: 'lxc' | 'qemu';
    detected_size_gb: number;
}

const AdminTemplates: React.FC = () => {
    // --- ESTADOS PRINCIPAIS ---
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);
    
    // --- ESTADOS DO FLUXO DE IMPORTAÇÃO (SCAN) ---
    const [isScanModalOpen, setIsScanModalOpen] = useState(false);
    const [scanning, setScanning] = useState(false);
    const [importing, setImporting] = useState(false);
    const [scannedCandidates, setScannedCandidates] = useState<CandidateTemplate[]>([]);
    const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]); 

    // --- ESTADOS DE EDIÇÃO ---
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);

    // 1. Carregar Templates do Banco
    const fetchTemplates = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/templates');
            const sorted = res.data.sort((a: Template, b: Template) => Number(b.is_active) - Number(a.is_active));
            setTemplates(sorted);
        } catch (error) {
            toast.error("Erro ao carregar templates.");
        } finally {
            setLoading(false);
        }
    };

    // 2. Scan: Apenas lê o Proxmox
    const handleScan = async () => {
        setScanning(true);
        setIsScanModalOpen(true);
        setScannedCandidates([]);
        setSelectedCandidates([]);
        try {
            const res = await api.get('/admin/templates/scan');
            setScannedCandidates(res.data);
        } catch (error) {
            toast.error("Erro ao conectar com Proxmox.");
            setIsScanModalOpen(false);
        } finally {
            setScanning(false);
        }
    };

    // 3. Import: Grava os selecionados
    const handleImport = async () => {
        if (selectedCandidates.length === 0) return;
        setImporting(true);
        try {
            const itemsToImport = scannedCandidates.filter(c => selectedCandidates.includes(c.volid));
            await api.post('/admin/templates/import', { templates: itemsToImport });
            toast.success(`${itemsToImport.length} templates importados!`);
            setIsScanModalOpen(false);
            fetchTemplates();
        } catch (error) {
            toast.error("Erro na importação.");
        } finally {
            setImporting(false);
        }
    };

    // 4. Toggle Ativo/Inativo
    const handleToggleActive = async (id: number) => {
        try {
            const res = await api.put(`/admin/templates/${id}/toggle`);
            toast.success(res.data.message);
            setTemplates(prev => prev.map(t => t.id === id ? { ...t, is_active: res.data.is_active } : t));
        } catch (error) {
            toast.error("Erro ao alterar status.");
        }
    };

    // 5. Salvar Edição
    const handleSaveEdit = async () => {
        if (!editingTemplate) return;
        try {
            await api.put(`/admin/templates/${editingTemplate.id}`, editingTemplate);
            toast.success("Configurações atualizadas!");
            setIsEditModalOpen(false);
            fetchTemplates();
        } catch (error) {
            toast.error("Falha ao salvar.");
        }
    };

    // 6. Deletar Template (CORRIGIDO PARA USAR /admin)
    const handleDelete = async (id: number) => {
        const confirmMsg = "Deseja remover este template do catálogo?\n\nO recurso original no Proxmox NÃO será apagado, permitindo que você o escaneie e importe novamente no futuro.";
        
        if (!window.confirm(confirmMsg)) return;

        try {
            // [FIX] Rota ajustada para /admin/templates
            await api.delete(`/admin/templates/${id}`); 
            
            setTemplates(prev => prev.filter(t => t.id !== id));
            toast.success("Template removido do catálogo.");
        } catch (error: any) {
            const msg = error.response?.data?.error || "Erro ao remover template.";
            toast.error(msg);
        }
    };

    const toggleCandidateSelection = (volid: string) => {
        if (selectedCandidates.includes(volid)) {
            setSelectedCandidates(prev => prev.filter(id => id !== volid));
        } else {
            setSelectedCandidates(prev => [...prev, volid]);
        }
    };

    useEffect(() => {
        fetchTemplates();
    }, []);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* --- CABEÇALHO --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <FileCode className="text-indigo-600" /> Curadoria de Templates
                    </h1>
                    <p className="text-slate-500">Gerencie quais imagens do Proxmox viram produtos no Nubemox.</p>
                </div>
                
                <button 
                    onClick={handleScan}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all shadow-md hover:shadow-lg"
                >
                    <RefreshCw size={18} /> Verificar Proxmox
                </button>
            </div>

            {/* --- LISTAGEM PRINCIPAL --- */}
            {loading ? (
                <div className="flex justify-center p-12"><Loader2 className="animate-spin text-indigo-600" size={32} /></div>
            ) : templates.length === 0 ? (
                <div className="text-center p-12 bg-white rounded-xl border border-dashed border-slate-300">
                    <div className="flex justify-center mb-4 text-slate-300"><DownloadCloud size={48} /></div>
                    <p className="text-slate-500 mb-2">Nenhum template cadastrado.</p>
                    <p className="text-sm text-slate-400">Clique em "Verificar Proxmox" para buscar ISOs e Containers.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {templates.map((tmpl) => (
                        <div 
                            key={tmpl.id} 
                            className={`p-5 rounded-xl border transition-all relative group ${
                                tmpl.is_active 
                                ? 'bg-white border-slate-200 shadow-sm hover:shadow-md' 
                                : 'bg-slate-50 border-slate-200 opacity-75 grayscale-[0.5] hover:opacity-100 hover:grayscale-0'
                            }`}
                        >
                            {/* AÇÕES NO CARD */}
                            <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleToggleActive(tmpl.id); }}
                                    className={`p-1.5 rounded-full transition-colors ${
                                        tmpl.is_active 
                                        ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                                        : 'bg-slate-200 text-slate-500 hover:bg-slate-300'
                                    }`}
                                    title={tmpl.is_active ? "Ativo" : "Inativo"}
                                >
                                    {tmpl.is_active ? <Eye size={18} /> : <EyeOff size={18} />}
                                </button>
                                
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleDelete(tmpl.id); }}
                                    className="p-1.5 rounded-full bg-white text-slate-400 hover:text-red-500 hover:bg-red-50 border border-slate-200 transition-colors shadow-sm"
                                    title="Remover"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>

                            <div className="flex justify-between items-start mb-4 pr-20">
                                <div className={`p-3 rounded-lg ${tmpl.type === 'lxc' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                                    {tmpl.type === 'lxc' ? <Box size={24} /> : <Server size={24} />}
                                </div>
                            </div>
                            
                            <h3 className="font-bold text-lg text-slate-800 truncate mb-1" title={tmpl.name}>
                                {tmpl.name}
                            </h3>
                            
                            <div className="flex items-center gap-2 mb-4">
                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                                    tmpl.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-500'
                                }`}>
                                    {tmpl.is_active ? 'Disponível' : 'Oculto'}
                                </span>
                                <span className="text-xs text-slate-400 truncate font-mono max-w-[150px]">
                                    {tmpl.proxmox_template_volid}
                                </span>
                            </div>

                            <div className="grid grid-cols-3 gap-2 mb-4 text-xs font-medium text-slate-600">
                                <div className="flex flex-col items-center bg-slate-50 p-2 rounded border border-slate-100">
                                    <Cpu size={14} className="mb-1 text-indigo-500"/>
                                    <span>{tmpl.default_cpu} vCore</span>
                                </div>
                                <div className="flex flex-col items-center bg-slate-50 p-2 rounded border border-slate-100">
                                    <Server size={14} className="mb-1 text-indigo-500"/>
                                    <span>{tmpl.default_memory} MB</span>
                                </div>
                                <div className="flex flex-col items-center bg-slate-50 p-2 rounded border border-slate-100">
                                    <HardDrive size={14} className="mb-1 text-indigo-500"/>
                                    <span>{tmpl.default_storage} GB</span>
                                </div>
                            </div>

                            <button 
                                onClick={() => { setEditingTemplate(tmpl); setIsEditModalOpen(true); }}
                                className="w-full py-2 flex items-center justify-center gap-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-sm font-medium transition-colors text-slate-600 group-hover:border-indigo-200 group-hover:text-indigo-600"
                            >
                                <Edit2 size={16} /> Configurar Padrões
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* --- MODAL 1: SCAN & IMPORT --- */}
            {isScanModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95">
                        <div className="p-6 border-b border-slate-100">
                            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                <DownloadCloud className="text-indigo-600"/> Importar do Proxmox
                            </h2>
                            <p className="text-sm text-slate-500 mt-1">
                                Selecione os templates que deseja adicionar ao banco de dados do Nubemox.
                            </p>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                            {scanning ? (
                                <div className="flex flex-col items-center justify-center py-12 text-slate-500 gap-3">
                                    <Loader2 className="animate-spin text-indigo-600" size={32} />
                                    <p>Lendo storage 'local'...</p>
                                </div>
                            ) : scannedCandidates.length === 0 ? (
                                <div className="text-center py-12 text-slate-500">
                                    <div className="flex justify-center mb-2"><CheckSquare size={40} className="text-slate-300"/></div>
                                    <p className="font-medium">Tudo sincronizado!</p>
                                    <p className="text-sm mt-1">Não encontramos novos templates no Proxmox.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between px-2 pb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                        <span>Template Encontrado</span>
                                        <span>Tamanho Real</span>
                                    </div>
                                    {scannedCandidates.map((cand) => (
                                        <div 
                                            key={cand.volid}
                                            onClick={() => toggleCandidateSelection(cand.volid)}
                                            className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all bg-white ${
                                                selectedCandidates.includes(cand.volid) 
                                                ? 'border-indigo-500 ring-1 ring-indigo-500 shadow-md' 
                                                : 'border-slate-200 hover:border-indigo-300 hover:shadow-sm'
                                            }`}
                                        >
                                            <div className={selectedCandidates.includes(cand.volid) ? "text-indigo-600" : "text-slate-300"}>
                                                {selectedCandidates.includes(cand.volid) ? <CheckSquare size={24}/> : <Square size={24}/>}
                                            </div>
                                            
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-slate-800 text-sm truncate">{cand.name}</h4>
                                                <p className="text-xs text-slate-500 font-mono truncate">{cand.volid}</p>
                                            </div>
                                            
                                            <div className="text-right">
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-bold border border-slate-200">
                                                    <HardDrive size={12}/> {cand.detected_size_gb} GB
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-white rounded-b-2xl">
                            <button 
                                onClick={() => setIsScanModalOpen(false)}
                                className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
                            >
                                Cancelar
                            </button>
                            {scannedCandidates.length > 0 && (
                                <button 
                                    onClick={handleImport}
                                    disabled={importing || selectedCandidates.length === 0}
                                    className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all"
                                >
                                    {importing ? <Loader2 className="animate-spin" size={18}/> : <Save size={18} />}
                                    Importar Selecionados ({selectedCandidates.length})
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* --- MODAL 2: EDIÇÃO --- */}
            {isEditModalOpen && editingTemplate && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 animate-in zoom-in-95">
                        <h2 className="text-xl font-bold mb-1 text-slate-800">Editar Template</h2>
                        <p className="text-sm text-slate-500 mb-6">Defina os recursos padrão para novos deploys.</p>
                        
                        <div className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome de Exibição (Apelido)</label>
                                <input 
                                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={editingTemplate.name}
                                    onChange={e => setEditingTemplate({...editingTemplate, name: e.target.value})}
                                />
                            </div>

                            {/* Detecção de Clone para Bloqueio de Inputs */}
                            {(() => {
                                const isClone = 
                                    editingTemplate.deploy_mode === 'clone' || 
                                    /^\d+$/.test(String(editingTemplate.proxmox_template_volid));
                                
                                const inputClass = isClone 
                                    ? "w-full p-2 border border-slate-200 rounded-lg text-center font-mono bg-slate-100 text-slate-400 cursor-not-allowed"
                                    : "w-full p-2 border border-slate-300 rounded-lg text-center font-mono focus:ring-2 focus:ring-indigo-500 outline-none";

                                return (
                                    <>
                                        <div className="grid grid-cols-3 gap-3">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">CPU</label>
                                                <input type="number" min="1" disabled={isClone} className={inputClass}
                                                    value={editingTemplate.default_cpu}
                                                    onChange={e => setEditingTemplate({...editingTemplate, default_cpu: Number(e.target.value)})}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">RAM</label>
                                                <input type="number" step="128" min="128" disabled={isClone} className={inputClass}
                                                    value={editingTemplate.default_memory}
                                                    onChange={e => setEditingTemplate({...editingTemplate, default_memory: Number(e.target.value)})}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">HD</label>
                                                <input type="number" disabled={isClone} className={inputClass}
                                                    value={editingTemplate.default_storage}
                                                    onChange={e => setEditingTemplate({...editingTemplate, default_storage: Number(e.target.value)})}
                                                />
                                            </div>
                                        </div>
                                        {isClone && (
                                            <p className="text-[10px] text-amber-600 bg-amber-50 p-2 rounded border border-amber-100 flex items-center gap-1">
                                                <AlertTriangle size={12}/>
                                                Hardware gerido pelo Proxmox (Modo Clone).
                                            </p>
                                        )}
                                    </>
                                );
                            })()}
                            
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Categoria</label>
                                <select 
                                    className="w-full p-2.5 border border-slate-300 rounded-lg bg-white"
                                    value={editingTemplate.category}
                                    onChange={e => setEditingTemplate({...editingTemplate, category: e.target.value})}
                                >
                                    <option value="os">Sistema Operacional</option>
                                    <option value="app">Aplicação Pronta</option>
                                    <option value="database">Banco de Dados</option>
                                </select>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-slate-100">
                            <button 
                                onClick={() => setIsEditModalOpen(false)}
                                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={handleSaveEdit}
                                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 font-medium shadow-md"
                            >
                                <Save size={18} /> Salvar Alterações
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminTemplates;