import React from 'react';
import { ViewState } from '../types';
import { LayoutDashboard, Grid, ShoppingBag, LogOut, Menu, X, User } from 'lucide-react';
import { authService } from '../services/api';

interface LayoutProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  children: React.ReactNode;
  username: string;
}

const Layout: React.FC<LayoutProps> = ({ currentView, setView, children, username }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const navItems = [
    { id: ViewState.DASHBOARD, label: 'Painel de Controle', icon: LayoutDashboard },
    { id: ViewState.SERVICES, label: 'Meus Serviços', icon: Grid },
    { id: ViewState.CATALOG, label: 'Catálogo de Serviços', icon: ShoppingBag },
  ];

  const handleLogout = () => {
    if(confirm("Deseja sair do sistema?")) {
        authService.logout();
    }
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
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center font-bold">N</div>
          <span className="text-xl font-bold tracking-tight">Nubemox</span>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setView(item.id); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                currentView === item.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
            <button onClick={handleLogout} className="w-full flex items-center space-x-3 px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-xl transition-colors">
                <LogOut className="w-5 h-5" />
                <span>Sair</span>
            </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 flex flex-col h-screen overflow-hidden relative">
        {/* Topbar */}
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-10 px-8 py-4 flex justify-end items-center border-b border-gray-100">
           <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-bold text-gray-800">{username}</p>
                <p className="text-xs text-gray-500">Usuário Nubemox</p>
              </div>
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600">
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