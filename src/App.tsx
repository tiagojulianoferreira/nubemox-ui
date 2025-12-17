import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast'; // [Alterado]: Importar 'toast' aqui

// --- IMPORTS DOS COMPONENTES VISUAIS ---
import Login from './components/Login';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ResourceList from './components/ResourceList';
import ServiceCatalog from './components/ServiceCatalog';

// --- IMPORTS DAS PÁGINAS ADMINISTRATIVAS (Padronizado em ./pages) ---
import AdminTemplates from './pages/AdminTemplates'; 
import AdminUsers from './pages/AdminUsers'; 

// --- MODAIS ---
import DeployModal from './components/DeployModal';
import ScaleModal from './components/ScaleModal';
import SnapshotModal from './components/SnapshotModal';

import api, { authService, resourceService } from './services/api';
import { UserProfile, ViewState, ServiceItem, CatalogItem } from './types';

export interface SystemHealth {
    status: 'healthy' | 'unhealthy';
    error?: string;
    details?: {
        version: string;
        release: string;
        repoid: string;
    };
}

function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  
  // Inicializa a view. Se for admin, pode começar em qualquer uma, mas DASHBOARD é o padrão seguro.
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
  const [loading, setLoading] = useState(true);

  // Estados de Dados
  const [resources, setResources] = useState<ServiceItem[]>([]);
  const [loadingResources, setLoadingResources] = useState(false);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | undefined>(undefined);

  // Estados de Modais
  const [selectedCatalogItem, setSelectedCatalogItem] = useState<CatalogItem | null>(null);
  const [scaleItem, setScaleItem] = useState<ServiceItem | null>(null);
  const [snapshotItem, setSnapshotItem] = useState<ServiceItem | null>(null);

  useEffect(() => {
    checkSession();
  }, []);

  useEffect(() => {
    // Só busca recursos se estiver nas telas de usuário comum
    if (user && (currentView === ViewState.DASHBOARD || currentView === ViewState.SERVICES)) {
      fetchResources();
      fetchSystemHealth();
    }
  }, [user, currentView]);

  const checkSession = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const profile = await authService.getProfile();
        setUser(profile);
      }
    } catch (error) {
      console.log("Sessão inválida");
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const fetchResources = async () => {
    setLoadingResources(true);
    try {
      const data = await resourceService.list();
      setResources(data);
    } catch (error) {
      console.error("Erro ao listar recursos", error);
    } finally {
      setLoadingResources(false);
    }
  };

  const fetchSystemHealth = async () => {
    try {
      const response = await api.get('/health');
      setSystemHealth(response.data);
    } catch (error) {
      console.error("Erro no Health Check", error);
      setSystemHealth({ status: 'unhealthy', error: 'Conexão Perdida' });
    }
  };

  const handleLoginSuccess = (userProfile: UserProfile) => {
    setUser(userProfile);
    setCurrentView(ViewState.DASHBOARD);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50">Carregando Nubemox...</div>;
  }

  if (!user) {
    return (
      <>
        <Toaster position="top-right" />
        <Login onLoginSuccess={handleLoginSuccess} />
      </>
    );
  }

  return (
    <>
      <Toaster position="top-right" />
      
      <Layout 
        currentView={currentView} 
        setView={setCurrentView} 
        username={user.username}
        isAdmin={user.is_admin}
      >
        
        {/* --- TELAS DE USUÁRIO --- */}
        {currentView === ViewState.DASHBOARD && (
          <Dashboard 
            resources={resources} 
            userProfile={user} 
            systemHealth={systemHealth} 
            loading={loadingResources} 
          />
        )}

        {currentView === ViewState.SERVICES && (
          <ResourceList 
            data={resources}
            onRefresh={fetchResources}
            onScale={setScaleItem}
            onSnapshot={setSnapshotItem}
          />
        )}

        {currentView === ViewState.CATALOG && (
          <ServiceCatalog onSelect={setSelectedCatalogItem} />
        )}

        {/* --- TELAS ADMINISTRATIVAS --- */}
        
        {currentView === ViewState.ADMIN_TEMPLATES && (
           <AdminTemplates />
        )}

        {currentView === ViewState.ADMIN_USERS && (
           <AdminUsers />
        )}

      </Layout>

      {/* --- MODAIS GLOBAIS --- */}
      
      {selectedCatalogItem && (
        <DeployModal 
          item={selectedCatalogItem}
          user={user}
          onClose={() => setSelectedCatalogItem(null)}
          onConfirm={async (payload) => {
            try {
                // Tenta realizar o deploy
                await api.post('/provisioning/deploy', payload);
                
                // Sucesso: Notifica e atualiza a lista
                toast.success("Deploy iniciado com sucesso!"); 
                await fetchResources();
                await checkSession(); 
                setSelectedCatalogItem(null);
                setCurrentView(ViewState.SERVICES);

            } catch (error: any) {
                console.error("Erro no Deploy:", error);
                
                // 1. Extrai a mensagem de erro do backend (ex: "Cota de CPU excedida")
                const errorMessage = error.response?.data?.error || "Falha ao processar solicitação.";
                
                // 2. Notifica o usuário
                toast.error(errorMessage);

                // 3. Relança o erro para que o DeployModal pare o loading
                throw error;
            }
          }}
        />
      )}

      {scaleItem && (
        <ScaleModal 
          service={scaleItem}
          onClose={() => setScaleItem(null)}
          onSuccess={() => {
            fetchResources();
            checkSession();
          }}
        />
      )}

      {snapshotItem && (
        <SnapshotModal 
          service={snapshotItem}
          onClose={() => setSnapshotItem(null)}
        />
      )}
    </>
  );
}

// No App.tsx, dentro do componente principal
console.log('App Debug - ViewState:', {
  DASHBOARD: ViewState.DASHBOARD,
  ADMIN_USERS: ViewState.ADMIN_USERS,
  ADMIN_TEMPLATES: ViewState.ADMIN_TEMPLATES,
});

export default App;