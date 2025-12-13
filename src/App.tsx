import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import Login from './components/Login';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ResourceList from './components/ResourceList';
import ServiceCatalog from './components/ServiceCatalog';
import DeployModal from './components/DeployModal';
import ScaleModal from './components/ScaleModal';
import SnapshotModal from './components/SnapshotModal';

// IMPORTANTE: Usamos os novos serviços aqui
import { authService, resourceService } from './services/api';
import { UserProfile, ViewState, ServiceItem, CatalogItem } from './types';

function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
  const [loading, setLoading] = useState(true);

  // Estados de Dados
  const [resources, setResources] = useState<ServiceItem[]>([]);
  const [loadingResources, setLoadingResources] = useState(false);

  // Estados de Modais
  const [selectedCatalogItem, setSelectedCatalogItem] = useState<CatalogItem | null>(null);
  const [scaleItem, setScaleItem] = useState<ServiceItem | null>(null);
  const [snapshotItem, setSnapshotItem] = useState<ServiceItem | null>(null);

  // 1. Verificar Sessão ao Carregar
  useEffect(() => {
    checkSession();
  }, []);

  // 2. Carregar Recursos quando mudar para telas que precisam deles
  useEffect(() => {
    if (user && (currentView === ViewState.DASHBOARD || currentView === ViewState.SERVICES)) {
      fetchResources();
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
      // CORREÇÃO: Usar resourceService.list() em vez de proxmoxApi.getResources()
      const data = await resourceService.list();
      setResources(data);
    } catch (error) {
      console.error("Erro ao listar recursos", error);
    } finally {
      setLoadingResources(false);
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
      
      <Layout currentView={currentView} setView={setCurrentView} username={user.username}>
        
        {currentView === ViewState.DASHBOARD && (
          <Dashboard 
            resources={resources} 
            userProfile={user} 
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

      </Layout>

      {/* --- MODAIS GLOBAIS --- */}
      
      {selectedCatalogItem && (
        <DeployModal 
          item={selectedCatalogItem}
          user={user}
          onClose={() => setSelectedCatalogItem(null)}
          onConfirm={async () => {
            // O modal já faz o POST para a API internamente.
            // Aqui só precisamos atualizar a interface.
            await fetchResources();
            await checkSession(); // Atualiza a barra de cota
            setSelectedCatalogItem(null);
            setCurrentView(ViewState.SERVICES); // Leva o usuário para ver a criação
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

export default App;