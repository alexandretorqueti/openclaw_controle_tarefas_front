import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

// Importar componentes de layout
import MainLayout from './components/layout/MainLayout';
import Login from './components/Login';

// Importar componentes de página
import ProjectsDashboard from './components/ProjectsDashboard';
import AgentManager from './components/AgentManager';
import StageManager from './components/StageManager';
import StatusManager from './components/StatusManager';
import PriorityManager from './components/PriorityManager';
import UserManager from './components/UserManager';
import ProjectTypeManager from './components/ProjectTypeManager';
import TaskList from './components/TaskList';
import LogErros from './components/LogErros';
import LogJarbas from './components/LogJarbas';
import RecurrenceManager from './components/RecurrenceManager';
import NextTaskManager from './components/NextTaskManager';
import UserProfileEdit from './components/UserProfileEdit';

// Componente de rota protegida
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading, isAuthenticated } = useAuth();
  
  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '40px',
          borderRadius: '12px',
          backgroundColor: 'var(--bg-card)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid var(--border-color)',
            borderTopColor: 'var(--accent-color)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }} />
          <p style={{ margin: 0, fontSize: '16px', fontWeight: 500 }}>
            Verificando autenticação...
          </p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }
  
  console.log('🔐 ProtectedRoute - user:', user ? 'Authenticated' : 'Not authenticated');
  console.log('🔐 ProtectedRoute - isAuthenticated:', isAuthenticated);
  console.log('🔐 ProtectedRoute - isLoading:', isLoading);
  
  // Verificar se há usuário no localStorage como fallback
  const localStorageUser = localStorage.getItem('tarefas_user');
  console.log('🔐 ProtectedRoute - localStorage user:', localStorageUser ? 'Found' : 'Not found');
  
  if (!user && !isAuthenticated && !localStorageUser) {
    console.log('🔐 Redirecting to /login - nenhuma autenticação encontrada');
    return <Navigate to="/login" replace />;
  }
  
  // Se não há user no estado mas há no localStorage, tentar recarregar
  if (!user && localStorageUser) {
    console.log('🔐 User no localStorage mas não no estado - recarregando...');
    setTimeout(() => {
      window.location.reload();
    }, 100);
    
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '40px',
          borderRadius: '12px',
          backgroundColor: 'var(--bg-card)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid var(--border-color)',
            borderTopColor: 'var(--accent-color)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }} />
          <p style={{ margin: 0, fontSize: '16px', fontWeight: 500 }}>
            Sincronizando autenticação...
          </p>
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
};

// Componente de rotas principais
const AppRoutes = () => {
  return (
    <Routes>
      {/* Rota pública de login */}
      <Route path="/login" element={<Login />} />
      
      {/* Rota de callback para OAuth */}
      <Route path="/auth/callback" element={
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          backgroundColor: 'var(--bg-primary)',
          color: 'var(--text-primary)'
        }}>
          <div style={{
            textAlign: 'center',
            padding: '40px',
            borderRadius: '12px',
            backgroundColor: 'var(--bg-card)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }}>
            <div style={{
              width: '50px',
              height: '50px',
              border: '4px solid var(--border-color)',
              borderTopColor: 'var(--accent-color)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 20px'
            }} />
            <p style={{ margin: 0, fontSize: '16px', fontWeight: 500 }}>
              Processando autenticação...
            </p>
          </div>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      } />
      
      {/* Rotas protegidas com MainLayout como wrapper */}
      <Route path="/" element={
        <ProtectedRoute>
          <MainLayout />
        </ProtectedRoute>
      }>
        {/* Rota padrão (dashboard) - Redireciona para Projetos */}
        <Route index element={<Navigate to="/projects" replace />} />
        
        {/* Rotas de gerenciamento */}
        <Route path="projects" element={<ProjectsDashboard />} />
        <Route path="projects/:projectId/tasks" element={<TaskList />} />
        <Route path="agents" element={<AgentManager />} />
        <Route path="stages" element={<StageManager />} />
        <Route path="status" element={<StatusManager />} />
        <Route path="priorities" element={<PriorityManager />} />
        <Route path="users" element={<UserManager />} />
        <Route path="project-types" element={<ProjectTypeManager />} />
        <Route path="logs" element={<LogJarbas />} />
        <Route path="error-logs" element={<LogErros />} />
        <Route path="recurrence" element={<RecurrenceManager />} />
        <Route path="next-task" element={<NextTaskManager />} />
        <Route path="profile" element={<UserProfileEdit />} />
        
        {/* Rota de fallback para página não encontrada */}
        <Route path="*" element={<div>Página não encontrada</div>} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;