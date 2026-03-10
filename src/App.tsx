// @ts-nocheck
import React, { useState, useEffect, Component, ErrorInfo } from 'react';
import TaskList from './components/TaskList';
import TaskDetail from './components/TaskDetail';
import ProjectView from './components/ProjectView';
import Login from './components/Login';
import StatusManager from './components/StatusManager';
import PriorityManager from './components/PriorityManager';
import UserManager from './components/UserManager';
import ProjectTypeManager from './components/ProjectTypeManager';
import NextTaskManager from './components/NextTaskManager';
import RecurrenceManager from './components/RecurrenceManager';
import LogsViewer from './components/LogsViewer';
import LogErros from './components/LogErros';
import AgentManager from './components/AgentManager';
import UserProfileEdit from './components/UserProfileEdit';
import MainLayout from './components/layout/MainLayout';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import apiService from './services/api';
import { Task, Project, User, Status, Priority } from './types';
import { FaSpinner } from 'react-icons/fa';

// Error Boundary
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

type ViewMode = 'tasks' | 'projects' | 'task-detail' | 'logs' | 'error-logs' | 'agents' | 'recurrence';

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
  const [agents, setAgents] = useState<string[]>([]);
  
  const [taskFilters, setTaskFilters] = useState<{ isCompleted?: boolean }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isPriorityModalOpen, setIsPriorityModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isProjectTypeModalOpen, setIsProjectTypeModalOpen] = useState(false);
  const [isNextTaskModalOpen, setIsNextTaskModalOpen] = useState(false);
  const [isProfileEditModalOpen, setIsProfileEditModalOpen] = useState(false);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [projectsData, tasksData, usersData, statusesData, prioritiesData, agentsData] = await Promise.all([
        apiService.getProjects(),
        apiService.getTasks(),
        apiService.getUsers(),
        apiService.getStatuses(),
        apiService.getPriorities(),
        apiService.getAgents()
      ]);
      // @ts-expect-error data is unknown
      setProjects(projectsData.projects || []);
      // @ts-expect-error data is unknown
      setTasks(tasksData.tasks || []);
      // @ts-expect-error data is unknown
      setUsers(usersData.users || []);
      // @ts-expect-error data is unknown
      setStatuses(statusesData.statuses || []);
      // @ts-expect-error data is unknown
      setPriorities(prioritiesData.priorities || []);
      // @ts-expect-error data is unknown
      // A API retorna { success: true, data: [...], count: 5 }
      // Precisamos extrair os IDs do array data
      const agentIds = agentsData.data ? agentsData.data.map((agent: any) => agent.id) : [];
      console.log('📋 Agentes carregados:', agentIds);
      setAgents(agentIds);
    } catch (err) {
      console.error('Failed to load initial data:', err);
      setError('Falha ao carregar dados. Verifique a conexão com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  const loadTasks = async (projectId?: string | null, filters = taskFilters) => {
    try {
      let tasksData;
      if (projectId) {
        tasksData = await apiService.getTasksByProject(projectId, filters);
      } else {
        tasksData = await apiService.getTasks(filters);
      }
      // @ts-expect-error tasksData é unknown
      setTasks(tasksData.tasks || []);
    } catch (err) {
      console.error('Failed to load tasks:', err);
      setTasks([]);
    }
  };

  const updateTaskFilters = async (newFilters: { isCompleted?: boolean }) => {
    const updatedFilters = { ...taskFilters, ...newFilters };
    setTaskFilters(updatedFilters);
    await loadTasks(selectedProject?.id, updatedFilters);
  };

  const handleTaskSelect = (task: Task) => {
    setSelectedTask(task);
    setViewMode('task-detail');
  };

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
    setViewMode('tasks');
    loadTasks(project.id);
  };

  const handleBackToList = () => {
    setSelectedTask(null);
    setViewMode('tasks');
  };

  const handleBackToProjects = () => {
    setSelectedProject(null);
    setSelectedTask(null);
    setViewMode('projects');
  };

  const handleBackFromErrorLogs = () => {
    setViewMode('logs');
  };

  const handleCreateProject = async (projectData: any) => {
    try {
      const newProject = await apiService.createProject(projectData);
      // @ts-expect-error newProject is unknown
      setProjects([...projects, newProject]);
      return newProject;
    } catch (err) {
      console.error('Failed to create project:', err);
      throw err;
    }
  };

  const handleUpdateProject = async (id: string, projectData: any) => {
    try {
      const updatedProject = await apiService.updateProject(id, projectData);
      setProjects(projects.map(p => p.id === id ? updatedProject : p));
      if (selectedProject?.id === id) {
        setSelectedProject(updatedProject);
      }
    } catch (err) {
      console.error('Failed to update project:', err);
      throw err;
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      await apiService.deleteProject(id);
      setProjects(projects.filter(p => p.id !== id));
      if (selectedProject?.id === id) {
        setSelectedProject(null);
        setViewMode('projects');
      }
    } catch (err) {
      console.error('Failed to delete project:', err);
      throw err;
    }
  };

  const handleCreateTask = async (taskData: any) => {
    try {
      const nickName = localStorage.getItem('saved_nickname') || '';
      const user = {
        nickname: nickName,
      }
      taskData.createdBy = user;
      const newTask = await apiService.createTask(taskData);
      // @ts-expect-error newTask is unknown
      setTasks([...tasks, newTask]);
      if (selectedProject) {
        loadTasks(selectedProject.id);
      }
      return newTask;
    } catch (err) {
      console.error('Failed to create task:', err);
      throw err;
    }
  };

  const handleUpdateTask = async (id: string, taskData: any) => {
    try {
      const updatedTask = await apiService.updateTask(id, taskData);
      setTasks(tasks.map(t => t.id === id ? updatedTask : t));
      if (selectedTask?.id === id) {
        setSelectedTask(updatedTask);
      }
      if (selectedProject) {
        loadTasks(selectedProject.id);
      }
    } catch (err) {
      console.error('Failed to update task:', err);
      throw err;
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await apiService.deleteTask(id);
      setTasks(tasks.filter(t => t.id !== id));
      if (selectedTask?.id === id) {
        setSelectedTask(null);
        setViewMode('tasks');
      }
      if (selectedProject) {
        loadTasks(selectedProject.id);
      }
    } catch (err) {
      console.error('Failed to delete task:', err);
      throw err;
    }
  };

  const handleToggleTaskCompletion = async (id: string) => {
    try {
      // Encontra a tarefa atual para obter o estado atual
      const task = tasks.find(t => t.id === id);
      if (!task) return;

      // Alterna o estado de conclusão
      const newIsCompleted = !task.isCompleted;

      // Atualiza no backend
      await apiService.updateTask(id, { isCompleted: newIsCompleted });

      // Atualiza no estado local
      setTasks(tasks.map(t => t.id === id ? { ...t, isCompleted: newIsCompleted } : t));
      if (selectedTask?.id === id) {
        setSelectedTask({ ...selectedTask, isCompleted: newIsCompleted });
      }
    } catch (err) {
      console.error('Failed to toggle task completion:', err);
      throw err; // Propaga o erro para o TaskCard exibir
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '300px'
        }}>
          <FaSpinner size={48} style={{ animation: 'spin 1s linear infinite', color: '#4ECDC4' }} />
        </div>
      );
    }

    if (error) {
      return (
        <div style={{
          padding: '40px',
          textAlign: 'center',
          color: '#FF6B6B'
        }}>
          <h3>Erro ao carregar dados</h3>
          <p>{error}</p>
          <button
            onClick={loadInitialData}
            style={{
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

    switch (viewMode) {
      case 'task-detail':
        return (
          <TaskDetail
            task={selectedTask!}
            tasks={tasks}
            users={users}
            statuses={statuses}
            priorities={priorities}
            projects={projects}
            currentUser={user}
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
            agents={agents}
            selectedProject={selectedProject}
            onTaskSelect={handleTaskSelect}
            onBackToProjects={handleBackToProjects}
            onCreateTask={handleCreateTask}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
            onToggleCompletion={handleToggleTaskCompletion}
            showCompleted={taskFilters.isCompleted === true}
            onToggleShowCompleted={(show) => updateTaskFilters({ isCompleted: show })}
          />
        );

      case 'recurrence':
        return (
          <RecurrenceManager
            onTaskSelect={handleTaskSelect}
          />
        );

      case 'logs':
        return (
          <LogsViewer />
        );

      case 'error-logs':
        return (
          <LogErros onBack={handleBackFromErrorLogs} />
        );

      case 'agents':
        return (
          <AgentManager />
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
      <MainLayout
        currentView={viewMode}
        onViewChange={(view) => {
          console.log('Changing view to:', view);
          setViewMode(view as ViewMode);
        }}
        onOpenStatus={() => {
          console.log('Opening status modal');
          setIsStatusModalOpen(true);
        }}
        onOpenPriority={() => {
          console.log('Opening priority modal');
          setIsPriorityModalOpen(true);
        }}
        onOpenUser={() => {
          console.log('Opening user modal');
          setIsUserModalOpen(true);
        }}
        onOpenProjectType={() => {
          console.log('Opening project type modal');
          setIsProjectTypeModalOpen(true);
        }}
        onOpenNextTask={() => {
          console.log('Opening next task modal');
          setIsNextTaskModalOpen(true);
        }}
        onOpenAgents={() => {
          console.log('Opening agents view');
          setViewMode('agents');
        }}
        onOpenErrorLogs={() => {
          console.log('Opening error logs view');
          setViewMode('error-logs');
        }}
        onLogout={() => {
          console.log('Logging out');
          logout();
        }}
        user={user}
      >
        {renderContent()}
      </MainLayout>

      {/* Modals */}
      {isStatusModalOpen && (
        <StatusManager isOpen={true} onClose={() => setIsStatusModalOpen(false)} />
      )}
      {isPriorityModalOpen && (
        <PriorityManager isOpen={true} onClose={() => setIsPriorityModalOpen(false)} />
      )}
      {isUserModalOpen && (
        <UserManager isOpen={true} onClose={() => setIsUserModalOpen(false)} />
      )}
      {isProjectTypeModalOpen && (
        <ProjectTypeManager isOpen={true} onClose={() => setIsProjectTypeModalOpen(false)} />
      )}
      {isNextTaskModalOpen && (
        <NextTaskManager isOpen={true} onClose={() => setIsNextTaskModalOpen(false)} />
      )}
      {isProfileEditModalOpen && (
        <UserProfileEdit isOpen={true} onClose={() => setIsProfileEditModalOpen(false)} />
      )}
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
        <FaSpinner size={48} style={{ animation: 'spin 1s linear infinite', color: '#4ECDC4' }} />
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