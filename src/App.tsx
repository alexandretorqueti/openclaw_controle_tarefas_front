import React, { useState, useEffect, Component, ErrorInfo } from 'react';
import TaskList from './components/TaskList';
import TaskDetail from './components/TaskDetail';
import ProjectView from './components/ProjectView';
import apiService from './services/api';
import { Task, Project, User, Status, Priority } from './types';
import { FaTasks, FaFolder, FaBars, FaHome, FaSpinner } from 'react-icons/fa';

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

function App() {
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

  // Mock data for development (fallback) - Usar UUIDs reais do banco
  const mockUsers: User[] = [
    {
      id: 'f23d0cc1-8908-47a9-b615-0393fb77ae92',
      name: 'Alexandre Bragato',
      email: 'alexandre@example.com',
      avatarUrl: 'https://i.pravatar.cc/150?img=1',
      role: 'Admin'
    },
    {
      id: 'd4f168ae-18a8-40f1-bc52-8f7e4c90bccf',
      name: 'Maria Silva',
      email: 'maria@example.com',
      avatarUrl: 'https://i.pravatar.cc/150?img=2',
      role: 'Editor'
    },
    {
      id: 'dcfd8a39-ccff-4715-9472-2882d365b85a',
      name: 'João Santos',
      email: 'joao@example.com',
      avatarUrl: 'https://i.pravatar.cc/150?img=3',
      role: 'Viewer'
    }
  ];

  // Usar UUIDs reais do banco de dados (obtidos do seed)
  const mockStatuses: Status[] = [
    { id: '0df1e0ec-81d4-4579-846f-a7f5eff6fe9c', name: 'Pendente', colorCode: '#FF6B6B', isFinalState: false },
    { id: '467c1869-3183-46cd-a728-83260efe3c78', name: 'Em Andamento', colorCode: '#4ECDC4', isFinalState: false },
    { id: 'dafbdd51-259a-4983-8dd8-09f53674108a', name: 'Em Revisão', colorCode: '#FFD166', isFinalState: false },
    { id: '0a7bcff9-7faa-4e88-be5b-195d7f4b2a49', name: 'Concluído', colorCode: '#06D6A0', isFinalState: true },
    { id: '6d321ee5-3e70-4538-b9bb-e840adf30b83', name: 'Bloqueado', colorCode: '#118AB2', isFinalState: false }
  ];

  const mockPriorities: Priority[] = [
    { id: 'e9f574bb-c40f-49e5-9028-c3e8a60673ec', name: 'Baixa', weight: 1 },
    { id: '3f15e98b-490c-42f1-97db-479ccb3a6404', name: 'Média', weight: 2 },
    { id: 'f3a32119-31dd-4b72-ae74-784d8f2b706b', name: 'Alta', weight: 3 },
    { id: 'dce48482-9215-4dff-8c5b-e66bf7ab12a3', name: 'Crítica', weight: 4 }
  ];

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to load from API
      const [projectsData, tasksData] = await Promise.all([
        apiService.getProjects().catch(() => ({ projects: [] })),
        apiService.getTasks().catch(() => ({ tasks: [] }))
      ]);

      setProjects(projectsData.projects || []);
      setTasks(tasksData.tasks || []);
      
      // For now, use mock data for users, statuses, priorities
      // In a real app, these would come from the API too
      setUsers(mockUsers);
      setStatuses(mockStatuses);
      setPriorities(mockPriorities);

    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Falha ao carregar dados. Usando dados de exemplo.');
      
      // Fallback to mock data
      setProjects([]);
      setTasks([]);
      setUsers(mockUsers);
      setStatuses(mockStatuses);
      setPriorities(mockPriorities);
    } finally {
      setLoading(false);
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
      // O ProjectView já adiciona o createdById correto
      // Não precisamos sobrescrevê-lo aqui
      const data = {
        ...projectData,
        status: true
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
      const response = await apiService.createTask(taskData);
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
              <div style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#4ECDC4',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <FaBars size={20} color="#fff" />
              </div>
              <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#333' }}>
                Sistema de Gestão
              </h1>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
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
                  src={users[0]?.avatarUrl || 'https://i.pravatar.cc/150?img=1'} 
                  alt={users[0]?.name || 'Usuário'}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <span style={{ fontSize: '14px', fontWeight: 500, color: '#333' }}>
                {users[0]?.name || 'Usuário'}
              </span>
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
            Backend: http://localhost:3001 • Frontend: http://localhost:3000
          </p>
        </div>

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
}

export default App;