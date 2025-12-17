import React from 'react';
import { ViewState } from '../types';
import { 
  LayoutDashboard, 
  Grid, 
  ShoppingBag, 
  LogOut, 
  Menu, 
  X, 
  User, 
  Settings,
  Users 
} from 'lucide-react';
import { authService } from '../services/api';

interface LayoutProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  children: React.ReactNode;
  username: string;
  isAdmin?: boolean; 
}

// Definimos os arrays fora do componente para garantir estabilidade
// As strings DEVEM corresponder exatamente aos valores do enum ViewState
const NAV_ITEMS = [
  { id: ViewState.DASHBOARD, label: 'Painel de Controle', icon: LayoutDashboard },
  { id: ViewState.SERVICES, label: 'Meus Serviços', icon: Grid },
  { id: ViewState.CATALOG, label: 'Catálogo de Serviços', icon: ShoppingBag },
];

const ADMIN_ITEMS = [
  { id: ViewState.ADMIN_USERS, label: 'Gestão de Usuários', icon: Users },
  { id: ViewState.ADMIN_TEMPLATES, label: 'Gestão de Templates', icon: Settings },
];

const Layout: React.FC<LayoutProps> = ({ currentView, setView, children, username, isAdmin }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const handleLogout = () => {
    if(confirm("Deseja sair do sistema?")) {
        authService.logout();
    }
  };

  const handleNavigation = (id: ViewState) => {
    setView(id);
    setIsMobileMenuOpen(false);
  };

  // Função auxiliar para verificar se um item está ativo
  const isActive = (itemId: ViewState): boolean => {
    return currentView === itemId;
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 font-sans">
      {/* Mobile Trigger */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 bg-slate-900 text-white rounded shadow-lg">
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-white transform transition-transform duration-300 lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}>
        
        {/* Logo Area */}
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center font-bold">N</div>
          <span className="text-xl font-bold tracking-tight">Nubemox</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          
          {/* MENU DO USUÁRIO */}
          {NAV_ITEMS.map((item, index) => (
            <button
              key={`nav-${index}-${item.id}`} 
              onClick={() => handleNavigation(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                isActive(item.id)
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}

          {/* MENU DE ADMINISTRAÇÃO */}
          {isAdmin && (
            <div className="mt-6 pt-6 border-t border-slate-800">
              <p className="px-4 mb-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                Administração
              </p>
              
              {ADMIN_ITEMS.map((item, index) => (
                <button
                  key={`admin-${index}-${item.id}`}
                  onClick={() => handleNavigation(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                    isActive(item.id)
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' 
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </div>
          )}
        </nav>

        {/* Footer Sidebar (Logout) */}
        <div className="p-4 border-t border-slate-800">
            <button onClick={handleLogout} className="w-full flex items-center space-x-3 px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-xl transition-colors">
                <LogOut className="w-5 h-5" />
                <span>Sair</span>
            </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 flex flex-col h-screen overflow-hidden relative">
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-10 px-8 py-4 flex justify-end items-center border-b border-gray-100">
           <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-bold text-gray-800">{username}</p>
                <p className="text-xs text-gray-500">
                  {isAdmin ? 'Administrador' : 'Usuário Nubemox'}
                </p>
              </div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${isAdmin ? 'bg-indigo-600' : 'bg-gray-400'}`}>
                <User size={20} />
              </div>
           </div>
        </header>
        
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                {children}
            </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;