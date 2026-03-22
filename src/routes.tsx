import React from 'react';
// Adicione o useNavigate na importação
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

// ... (seus imports de componentes continuam os mesmos) ...

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading, isAuthenticated } = useAuth();
  
  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
        {/* ... seu layout de loading ... */}
      </div>
    );
  }
  
  const localStorageUser = localStorage.getItem('tarefas_user');
  
  if (!user && !isAuthenticated && !localStorageUser) {
    return <Navigate to="/login" replace />;
  }
  
  // AVISO: O ideal é que o AuthContext faça a restauração do usuário baseado no localStorage.
  // Se você mantiver o window.location.reload() aqui, certifique-se de que o localStorage
  // seja limpo caso a tentativa de restaurar o usuário falhe, senão gerará um loop infinito.
  if (!user && localStorageUser) {
    setTimeout(() => window.location.reload(), 100);
    return <div>Sincronizando autenticação...</div>;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  // 1. Instancie o hook de navegação aqui
  const navigate = useNavigate();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/auth/callback" element={<div>Processando...</div>} />
      
      <Route path="/" element={
        <ProtectedRoute>
          <MainLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/projects" replace />} />
        
        <Route path="projects" element={<ProjectsDashboard />} />
        
        {/* 2. Use a função navigate que veio do hook */}
        <Route path="projects/:projectId/tasks" element={
          <TaskList 
            onBackToProjects={() => {
              console.log('\n🔙 [ROUTES] Navegando para /projects via useNavigate');
              navigate('/projects');
            }}
          />
        } />
        
        <Route path="agents" element={<AgentManager />} />
        <Route path="stages" element={<StageManager />} />
        {/* ... outras rotas ... */}
        
        <Route path="*" element={<div>Página não encontrada</div>} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;