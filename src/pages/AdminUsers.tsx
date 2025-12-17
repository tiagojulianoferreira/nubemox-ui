import React, { useEffect, useState } from 'react';
import { Users, HardDrive, Cpu, Database, Edit2, Save, X } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

interface UserQuota {
  id: number;
  username: string;
  email: string;
  is_admin: boolean;
  usage: {
    cpu: number;
    memory: number;
    storage: number;
    count: number;
  };
  limits: {
    cpu: number;
    memory: number;
    storage: number;
  };
}

export default function AdminUsers() {
  const [users, setUsers] = useState<UserQuota[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estado para edição
  const [editingUser, setEditingUser] = useState<UserQuota | null>(null);
  const [editForm, setEditForm] = useState({ cpu: 0, memory: 0, storage: 0 });

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch (error) {
      toast.error('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEditClick = (user: UserQuota) => {
    setEditingUser(user);
    setEditForm({ ...user.limits });
  };

  const handleSaveQuota = async () => {
    if (!editingUser) return;
    try {
      await api.put(`/admin/users/${editingUser.id}/quota`, editForm);
      toast.success(`Cotas de ${editingUser.username} atualizadas!`);
      setEditingUser(null);
      fetchUsers(); // Recarrega dados
    } catch (error) {
      toast.error('Falha ao salvar cotas');
    }
  };

  // Componente auxiliar para barra de progresso
  const UsageBar = ({ current, max, unit, colorClass }: any) => {
    const percent = Math.min((current / max) * 100, 100);
    const isOver = current > max;
    
    return (
      <div className="w-full">
        <div className="flex justify-between text-xs mb-1 text-gray-500">
          <span>{current} {unit}</span>
          <span className="font-bold">{max} {unit}</span>
        </div>
        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full ${isOver ? 'bg-red-500' : colorClass}`} 
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    );
  };

  if (loading) return <div className="p-8 text-center">Carregando painel administrativo...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Users className="text-indigo-600" /> Gestão de Usuários
          </h1>
          <p className="text-gray-500">Controle de cotas e limites de recursos</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 font-semibold text-gray-600">Usuário</th>
              <th className="px-6 py-4 font-semibold text-gray-600">vCPUs (Uso/Limite)</th>
              <th className="px-6 py-4 font-semibold text-gray-600">RAM (MB)</th>
              <th className="px-6 py-4 font-semibold text-gray-600">Storage (GB)</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{user.username}</div>
                  <div className="text-xs text-gray-500">{user.email}</div>
                  {user.is_admin && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full mt-1 inline-block">Admin</span>}
                </td>
                
                <td className="px-6 py-4 w-48">
                  <UsageBar current={user.usage.cpu} max={user.limits.cpu} unit="" colorClass="bg-blue-500" />
                </td>
                
                <td className="px-6 py-4 w-48">
                  <UsageBar current={user.usage.memory} max={user.limits.memory} unit="MB" colorClass="bg-green-500" />
                </td>

                <td className="px-6 py-4 w-48">
                  <UsageBar current={user.usage.storage} max={user.limits.storage} unit="GB" colorClass="bg-orange-500" />
                </td>

                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => handleEditClick(user)}
                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                    title="Editar Cotas"
                  >
                    <Edit2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL DE EDIÇÃO */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg text-gray-800">Editar Limites: {editingUser.username}</h3>
              <button onClick={() => setEditingUser(null)} className="text-gray-400 hover:text-red-500">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {/* CPU Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <Cpu size={16} /> Limite de vCPUs
                </label>
                <input 
                  type="number" 
                  value={editForm.cpu}
                  onChange={(e) => setEditForm({...editForm, cpu: Number(e.target.value)})}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              {/* RAM Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <HardDrive size={16} /> Limite de RAM (MB)
                </label>
                <input 
                  type="number" 
                  value={editForm.memory}
                  onChange={(e) => setEditForm({...editForm, memory: Number(e.target.value)})}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              {/* Storage Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <Database size={16} /> Limite de Storage (GB)
                </label>
                <input 
                  type="number" 
                  value={editForm.storage}
                  onChange={(e) => setEditForm({...editForm, storage: Number(e.target.value)})}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
              <button 
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSaveQuota}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
              >
                <Save size={18} /> Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}