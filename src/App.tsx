import React, { useState, useEffect, Component, ErrorInfo } from 'react';
import TaskList from './components/TaskList';
import TaskDetail from './components/TaskDetail';
import ProjectView from './components/ProjectView';
import Login from './components/Login';
import FloatingMenu from './components/FloatingMenu';
import StatusManager from './components/StatusManager';
import PriorityManager from './components/PriorityManager';
import RecurrenceManager from './components/RecurrenceManager';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import apiService from './services/api';
import { Task, Project, User, Status, Priority } from './types';
import { FaTasks, FaFolder, FaBars, FaHome, FaSpinner, FaUser, FaSignOutAlt, FaSync } from 'react-icons/fa';

// Helper function to get backend URL based on current frontend URL
const getBackendUrl = (): string => {
  const hostname = window.location.hostname;
  const port = window.location.port;
  
  // Determine backend port based on frontend port
  let backendPort = 3001; // Default to development
  
  if (port === '8090' || port === '8091') {
    // Production environment
    backendPort = 8091;
  } else if (port === '3000' || port === '3001') {
    // Development environment
    backendPort = 3001;
  } else if (!port) {
    // No port specified (default ports)
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      // Default to development for localhost without port
      backendPort = 3001;
    } else {
      // For other hosts without port, assume production
      backendPort = 8091;
    }
  }
  
  console.log(`🌐 App Component: Frontend ${hostname}:${port} → Backend port ${backendPort}`);
  
  // Build backend URL
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `http://localhost:${backendPort}`;
  } else if (hostname === '192.168.1.70') {
    return `http://192.168.1.70:${backendPort}`;
  } else if (hostname === 'tarefas.local' || hostname === 'web.tarefas.local') {
    return `http://api.tarefas.local:${backendPort}`;
  } else {
    // For any other hostname
    return `http://${hostname}:${backendPort}`;
  }
};

// Error Boundary para capturar erros no React
class ErrorBoundary extends Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '40px',
          textAlign: 'center',
          fontFamily: 'Arial, sans-serif',
          color: '#333'
        }}>
          <h1 style={{ color: '#FF6B6B' }}>⚠️ Erro no Componente</h1>
          <p>Ocorreu um erro ao renderizar este componente.</p>
          <p style={{ 
            backgroundColor: '#f8f9fa', 
            padding: '15px',
            borderRadius: '8px',
            marginTop: '20px',
            fontFamily: 'monospace',
            fontSize: '12px'
          }}>
            {this.state.error?.message || 'Erro desconhecido'}
          </p>
          <button 
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              backgroundColor: '#4ECDC4',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Tentar Novamente
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

type ViewMode = 'tasks' | 'projects' | 'task-detail';

// Main app content that requires authentication
const AppContent: React.FC = () => {
  const { user, logout } = useAuth();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('projects');
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [priorities, setPriorities] = useState<Priority[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para os modais
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isPriorityModalOpen, setIsPriorityModalOpen] = useState(false);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load all data from API
      const [projectsData, tasksData, usersData, statusesData, prioritiesData] = await Promise.all([
        apiService.getProjects().catch(() => ({ projects: [] })),
        apiService.getTasks().catch(() => ({ tasks: [] })),
        apiService.getUsers().catch(() => ({ users: [] })),
        apiService.getStatuses().catch(() => ({ statuses: [] })),
        apiService.getPriorities().catch(() => ({ priorities: [] }))
      ]);

      console.log('🚀 Loaded users data:', usersData);
      console.log('🚀 Users array:', usersData.users);
      console.log('🚀 Users count:', usersData.users?.length || 0);
      
      setProjects(projectsData.projects || []);
      setTasks(tasksData.tasks || []);
      setUsers(usersData.users || []);
      setStatuses(statusesData.statuses || []);
      setPriorities(prioritiesData.priorities || []);

    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Falha ao carregar dados. Tente novamente.');
      
      // Clear all data on error
      setProjects([]);
      setTasks([]);
      setUsers([]);
      setStatuses([]);
      setPriorities([]);
    } finally {
      setLoading(false);
    }
  };

  // Função para recarregar apenas status e prioridades
  const reloadStatusesAndPriorities = async () => {
    try {
      const [statusesData, prioritiesData] = await Promise.all([
        apiService.getStatuses().catch(() => ({ statuses: [] })),
        apiService.getPriorities().catch(() => ({ priorities: [] }))
      ]);
      
      setStatuses(statusesData.statuses || []);
      setPriorities(prioritiesData.priorities || []);
    } catch (err) {
      console.error('Failed to reload statuses/priorities:', err);
    }
  };

  const handleTaskSelect = (task: Task) => {
    setSelectedTask(task);
    setViewMode('task-detail');
  };

  const handleBackToList = () => {
    setSelectedTask(null);
    setViewMode(selectedProject ? 'tasks' : 'projects');
  };

  const handleProjectSelect = async (project: Project) => {
    setSelectedProject(project);
    setViewMode('tasks');
    
    try {
      // Load tasks for this project
      const response = await apiService.getTasksByProject(project.id);
      setTasks(response.tasks || []);
    } catch (err) {
      console.error('Failed to load project tasks:', err);
    }
  };

  const handleBackToProjects = async () => {
    setSelectedProject(null);
    setViewMode('projects');
    
    try {
      // Load all tasks
      const response = await apiService.getTasks();
      setTasks(response.tasks || []);
    } catch (err) {
      console.error('Failed to load all tasks:', err);
    }
  };

  const handleCreateProject = async (projectData: Partial<Project>) => {
    try {
      // Use logged in user's ID
      const data = {
        ...projectData,
        status: true,
        createdById: user?.id || ''
      };

      const response = await apiService.createProject(data);
      setProjects(prev => [response.project, ...prev]);
      return response.project;
    } catch (err) {
      console.error('Failed to create project:', err);
      throw err;
    }
  };

  const handleUpdateProject = async (id: string, projectData: Partial<Project>) => {
    try {
      const response = await apiService.updateProject(id, projectData);
      setProjects(prev => prev.map(p => p.id === id ? response.project : p));
      return response.project;
    } catch (err) {
      console.error('Failed to update project:', err);
      throw err;
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      await apiService.deleteProject(id);
      setProjects(prev => prev.filter(p => p.id !== id));
      
      // If we're viewing this project, go back to projects list
      if (selectedProject?.id === id) {
        handleBackToProjects();
      }
    } catch (err) {
      console.error('Failed to delete project:', err);
      throw err;
    }
  };

  const handleCreateTask = async (taskData: Partial<Task>) => {
    try {
      // Use logged in user's ID for createdById
      const data = {
        ...taskData,
        createdById: user?.id || ''
      };

      const response = await apiService.createTask(data);
      setTasks(prev => [response.task, ...prev]);
      return response.task;
    } catch (err) {
      console.error('Failed to create task:', err);
      throw err;
    }
  };

  const handleUpdateTask = async (id: string, taskData: Partial<Task>) => {
    try {
      const response = await apiService.updateTask(id, taskData);
      setTasks(prev => prev.map(t => t.id === id ? response.task : t));
      
      // Update selected task if it's the one being edited
      if (selectedTask?.id === id) {
        setSelectedTask(response.task);
      }
      
      return response.task;
    } catch (err) {
      console.error('Failed to update task:', err);
      throw err;
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await apiService.deleteTask(id);
      setTasks(prev => prev.filter(t => t.id !== id));
      
      // If we're viewing this task, go back to list
      if (selectedTask?.id === id) {
        handleBackToList();
      }
    } catch (err) {
      console.error('Failed to delete task:', err);
      throw err;
    }
  };

  const handleToggleTaskCompletion = async (id: string) => {
    try {
      const response = await apiService.toggleTaskCompletion(id);
      setTasks(prev => prev.map(t => t.id === id ? response.task : t));
      
      if (selectedTask?.id === id) {
        setSelectedTask(response.task);
      }
    } catch (err) {
      console.error('Failed to toggle task completion:', err);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
          flexDirection: 'column',
          gap: '20px'
        }}>
          <FaSpinner size={48} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
          <p style={{ color: '#666', fontSize: '16px' }}>Carregando dados...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div style={{
          padding: '40px',
          textAlign: 'center',
          backgroundColor: '#fff',
          borderRadius: '12px',
          margin: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}>
          <h2 style={{ color: '#FF6B6B', marginBottom: '16px' }}>⚠️ {error}</h2>
          <p style={{ color: '#666', marginBottom: '24px' }}>
            O servidor pode não estar disponível. Verifique se o backend está rodando.
          </p>
          <button
            onClick={loadInitialData}
            style={{
              padding: '10px 20px',
              backgroundColor: '#4ECDC4',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3db8af'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4ECDC4'}
          >
            Tentar Novamente
          </button>
        </div>
      );
    }

    switch (viewMode) {
      case 'task-detail':
        return (
          <TaskDetail
            task={selectedTask!}
            users={users}
            statuses={statuses}
            priorities={priorities}
            projects={projects}
            onBack={handleBackToList}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
            onToggleCompletion={handleToggleTaskCompletion}
          />
        );
      
      case 'tasks':
        return (
          <TaskList
            tasks={tasks}
            users={users}
            statuses={statuses}
            priorities={priorities}
            projects={projects}
            selectedProject={selectedProject}
            onTaskSelect={handleTaskSelect}
            onBackToProjects={handleBackToProjects}
            onCreateTask={handleCreateTask}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
            onToggleCompletion={handleToggleTaskCompletion}
          />
        );
      
      case 'recurrence':
        return (
          <RecurrenceManager
            onTaskSelect={handleTaskSelect}
          />
        );
      
      case 'projects':
      default:
        return (
          <ProjectView
            projects={projects}
            tasks={tasks}
            users={users}
            statuses={statuses}
            priorities={priorities}
            onTaskSelect={handleTaskSelect}
            onProjectSelect={handleProjectSelect}
            onCreateProject={handleCreateProject}
            onUpdateProject={handleUpdateProject}
            onDeleteProject={handleDeleteProject}
          />
        );
    }
  };

  return (
    <ErrorBoundary>
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#f5f5f5',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
      }}>
        {/* Navigation Bar */}
        <div style={{
          backgroundColor: '#fff',
          padding: '0 24px',
          borderBottom: '1px solid #e0e0e0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            height: '64px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <FloatingMenu
                onOpenStatus={() => setIsStatusModalOpen(true)}
                onOpenPriority={() => setIsPriorityModalOpen(true)}
              />
              <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#333' }}>
                Sistema de Gestão
              </h1>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => {
                  setSelectedProject(null);
                  setSelectedTask(null);
                  setViewMode('recurrence');
                }}
                style={{
                  padding: '10px 16px',
                  backgroundColor: viewMode === 'recurrence' ? '#4ECDC4' : '#f8f9fa',
                  color: viewMode === 'recurrence' ? '#fff' : '#333',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s'
                }}
              >
                <FaSync size={14} />
                Recorrência
              </button>
              
              <button
                onClick={() => {
                  setSelectedProject(null);
                  setSelectedTask(null);
                  setViewMode('projects');
                }}
                style={{
                  padding: '10px 16px',
                  backgroundColor: viewMode === 'projects' ? '#4ECDC4' : '#f8f9fa',
                  color: viewMode === 'projects' ? '#fff' : '#333',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s'
                }}
              >
                <FaFolder size={14} />
                Projetos
              </button>
              
              <button
                onClick={() => {
                  setSelectedProject(null);
                  setSelectedTask(null);
                  setViewMode('tasks');
                }}
                style={{
                  padding: '10px 16px',
                  backgroundColor: viewMode === 'tasks' ? '#4ECDC4' : '#f8f9fa',
                  color: viewMode === 'tasks' ? '#fff' : '#333',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s'
                }}
              >
                <FaTasks size={14} />
                Todas as Tarefas
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                overflow: 'hidden',
                backgroundColor: '#e3f2fd'
              }}>
                <img 
                  src={user?.avatarUrl || 'https://i.pravatar.cc/150?img=1'} 
                  alt={user?.name || 'Usuário'}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '14px', fontWeight: 500, color: '#333' }}>
                  {user?.name || 'Usuário'}
                </span>
                <span style={{ fontSize: '12px', color: '#666' }}>
                  {user?.role || 'Usuário'}
                </span>
              </div>
              <button
                onClick={logout}
                style={{
                  padding: '8px 12px',
                  backgroundColor: 'transparent',
                  color: '#666',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f8f9fa';
                  e.currentTarget.style.color = '#FF6B6B';
                  e.currentTarget.style.borderColor = '#FF6B6B';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#666';
                  e.currentTarget.style.borderColor = '#ddd';
                }}
              >
                <FaSignOutAlt size={12} />
                Sair
              </button>
            </div>
          </div>
        </div>

        {/* Breadcrumb */}
        {(selectedProject || viewMode !== 'projects') && (
          <div style={{
            backgroundColor: '#f8f9fa',
            padding: '12px 24px',
            borderBottom: '1px solid #e0e0e0'
          }}>
            <div style={{
              maxWidth: '1200px',
              margin: '0 auto',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              color: '#666'
            }}>
              <button
                onClick={() => {
                  setSelectedProject(null);
                  setSelectedTask(null);
                  setViewMode('projects');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#4ECDC4',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e9ecef'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <FaHome size={12} />
                Projetos
              </button>
              
              {selectedProject && (
                <>
                  <span style={{ color: '#999' }}>/</span>
                  <button
                    onClick={handleBackToProjects}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#4ECDC4',
                      cursor: 'pointer',
                      padding: '4px 8px',
                      borderRadius: '4px'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e9ecef'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    {selectedProject.name}
                  </button>
                </>
              )}
              
              {selectedTask && (
                <>
                  <span style={{ color: '#999' }}>/</span>
                  <span style={{ color: '#333', fontWeight: 500 }}>
                    {selectedTask.title}
                  </span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Main Content */}
        {renderContent()}
        
        {/* Footer */}
        <div style={{
          padding: '20px',
          textAlign: 'center',
          color: '#666',
          fontSize: '14px',
          borderTop: '1px solid #e0e0e0',
          marginTop: '40px',
          backgroundColor: '#fff'
        }}>
          <p>
            Sistema de Gestão de Tarefas • API REST com Node.js e PostgreSQL • 
            Frontend com React e TypeScript
          </p>
          <p style={{ fontSize: '12px', marginTop: '8px' }}>
            {tasks.length} tarefas • {users.length} usuários • {projects.length} projetos
          </p>
          <p style={{ fontSize: '11px', marginTop: '4px', color: '#999' }}>
            Backend: {getBackendUrl()} • Frontend: http://{window.location.hostname}:{window.location.port || (window.location.protocol === 'https:' ? '443' : '80')}
          </p>
        </div>

        {/* Modais de Configuração */}
        <StatusManager
          isOpen={isStatusModalOpen}
          onClose={() => setIsStatusModalOpen(false)}
          onStatusUpdate={reloadStatusesAndPriorities}
        />
        
        <PriorityManager
          isOpen={isPriorityModalOpen}
          onClose={() => setIsPriorityModalOpen(false)}
          onPriorityUpdate={reloadStatusesAndPriorities}
        />

        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          .spin {
            animation: spin 1s linear infinite;
          }
        `}</style>
      </div>
    </ErrorBoundary>
  );
};

// Main App component with AuthProvider
const App: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5'
      }}>
        <FaSpinner size={48} className="spin" style={{ animation: 'spin 1s linear infinite', color: '#4ECDC4' }} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return <AppContent />;
};

// Wrap the main App with AuthProvider
const AppWithAuth: React.FC = () => {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
};

export default AppWithAuth;