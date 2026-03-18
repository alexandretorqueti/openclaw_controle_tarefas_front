// @ts-nocheck
import React, { useState, useEffect, Component, ErrorInfo } from 'react';
import TaskList from './components/TaskList';
import TaskDetail from './components/TaskDetail';
import ProjectsDashboard from './components/ProjectsDashboard';
import Login from './components/Login';
import StatusManager from './components/StatusManager';
import PriorityManager from './components/PriorityManager';
import UserManager from './components/UserManager';
import ProjectTypeManager from './components/ProjectTypeManager';
import NextTaskManager from './components/NextTaskManager';
import RecurrenceManager from './components/RecurrenceManager';
import LogJarbas from './components/LogJarbas';
import LogErros from './components/LogErros';
import AgentManager from './components/AgentManager';
import UserProfileEdit from './components/UserProfileEdit';
import StageManager from './components/StageManager';
import MainLayout from './components/layout/MainLayout';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import apiService from './services/api';
import { Task, Project, User, Status, Priority, Agent } from './types';
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

  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '40px',
          textAlign: 'center',
          fontFamily: 'Arial, sans-serif',
          color: 'var(--text-primary)'
        }}>
          <h1 style={{ color: 'var(--danger-color)' }}>⚠️ Erro no Componente</h1>
          <p>Ocorreu um erro ao renderizar este componente.</p>
          <p style={{
            backgroundColor: 'var(--bg-input)',
            padding: '15px',
            borderRadius: '8px',
            marginTop: '20px',
            fontFamily: 'monospace',
            fontSize: '12px',
            color: 'var(--text-primary)'
          }}>
            {this.state.error?.message || 'Erro desconhecido'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              backgroundColor: 'var(--accent-color)',
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

type ViewMode = 'tasks' | 'projects' | 'task-detail' | 'logs' | 'error-logs' | 'agents' | 'recurrence' | 'stages';

// Main app content that requires authentication
const AppContent: React.FC = () => {
  const { user, logout } = useAuth();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedParentTask, setSelectedParentTask] = useState<Task | null>(null);
  const [parentHierarchy, setParentHierarchy] = useState<Task[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('projects');

  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [priorities, setPriorities] = useState<Priority[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  
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

  // Server-Sent Events (SSE) for real-time updates
  useEffect(() => {
    if (!user) return; // Only connect if user is logged in
    
    console.log('🔌 Conectando ao SSE para atualizações em tempo real...');
    
    // Create EventSource connection
    const eventSource = new EventSource('http://localhost:4001/api/sse/events');
    
    // Handle task_updated events
    eventSource.addEventListener('task_updated', (event) => {
      try {
        const updatedTask = JSON.parse(event.data);
        console.log('🔄 Evento SSE: Tarefa atualizada:', updatedTask.id, updatedTask.title);
        
        // Update tasks state
        setTasks(prevTasks => 
          prevTasks.map(task => 
            task.id === updatedTask.id ? { ...task, ...updatedTask } : task
          )
        );
        
        // If we're viewing the updated task, update selectedTask
        if (selectedTask && selectedTask.id === updatedTask.id) {
          setSelectedTask(prev => ({ ...prev, ...updatedTask }));
        }
        
        // If we're viewing subtasks of the updated task
        if (selectedParentTask && selectedParentTask.id === updatedTask.id) {
          setSelectedParentTask(prev => ({ ...prev, ...updatedTask }));
        }
      } catch (error) {
        console.error('❌ Erro ao processar evento task_updated:', error);
      }
    });
    
    // Handle task_created events
    eventSource.addEventListener('task_created', (event) => {
      try {
        const newTask = JSON.parse(event.data);
        console.log('🆕 Evento SSE: Nova tarefa criada:', newTask.id, newTask.title);
        
        // Add new task to tasks state
        setTasks(prevTasks => {
          // Check if task already exists (avoid duplicates)
          if (prevTasks.some(task => task.id === newTask.id)) {
            return prevTasks;
          }
          return [...prevTasks, newTask];
        });
      } catch (error) {
        console.error('❌ Erro ao processar evento task_created:', error);
      }
    });
    
    // Handle task_deleted events
    eventSource.addEventListener('task_deleted', (event) => {
      try {
        const deletedTaskId = JSON.parse(event.data).id;
        console.log('🗑️ Evento SSE: Tarefa deletada:', deletedTaskId);
        
        // Remove task from tasks state
        setTasks(prevTasks => prevTasks.filter(task => task.id !== deletedTaskId));
        
        // If we're viewing the deleted task, go back
        if (selectedTask && selectedTask.id === deletedTaskId) {
          setSelectedTask(null);
        }
        
        // If we're viewing subtasks of the deleted task
        if (selectedParentTask && selectedParentTask.id === deletedTaskId) {
          setSelectedParentTask(null);
          setSelectedTask(null);
        }
      } catch (error) {
        console.error('❌ Erro ao processar evento task_deleted:', error);
      }
    });
    
    // Handle project_updated events
    eventSource.addEventListener('project_updated', (event) => {
      try {
        const updatedProject = JSON.parse(event.data);
        console.log('🏗️ Evento SSE: Projeto atualizado:', updatedProject.id, updatedProject.name);
        
        // Update projects state
        setProjects(prevProjects => 
          prevProjects.map(project => 
            project.id === updatedProject.id ? { ...project, ...updatedProject } : project
          )
        );
      } catch (error) {
        console.error('❌ Erro ao processar evento project_updated:', error);
      }
    });
    
    // Handle connection open
    eventSource.onopen = () => {
      console.log('✅ Conexão SSE estabelecida com sucesso');
    };
    
    // Handle errors
    eventSource.onerror = (error) => {
      console.error('❌ Erro na conexão SSE:', error);
      
      // Try to reconnect after 5 seconds
      setTimeout(() => {
        console.log('🔄 Tentando reconectar ao SSE...');
        // The connection will automatically try to reconnect
      }, 5000);
    };
    
    // Cleanup function
    return () => {
      console.log('🔌 Fechando conexão SSE...');
      eventSource.close();
    };
  }, [user, selectedTask, selectedParentTask]);

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
      // Armazenamos os objetos completos do agente para ter acesso ao modelo
      const agentsList = agentsData.data ? agentsData.data : [];

      setAgents(agentsList);
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
      
      // LOGICA DE CONTEXTO REFORÇADA:
      // Se estamos visualizando sub-tarefas (selectedParentTask existe), 
      // ignoramos o parentTaskId: null dos filtros e mantemos o foco na sub-tarefa.
      const currentParentId = selectedParentTask ? selectedParentTask.id : null;

      const finalFilters = { 
        ...filters,
        parentTaskId: currentParentId
      };

      if (projectId) {
        tasksData = await apiService.getTasksByProject(projectId, finalFilters);
      } else {
        tasksData = await apiService.getTasks(finalFilters);
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
    // Ao atualizar filtros, respeitar o selectedParentTask se ele existir
    await loadTasks(selectedProject?.id, updatedFilters);
  };

  const [previousViewMode, setPreviousViewMode] = useState<ViewMode | null>(null);

  const handleTaskSelect = (task: Task) => {
    setPreviousViewMode(viewMode);
    setSelectedTask(task);
    setViewMode('task-detail');
  };

  const handleViewSubtasks = async (task: Task) => {
    setPreviousViewMode(viewMode);
    setSelectedParentTask(task);
    
    // Build hierarchy
    const hierarchy: Task[] = [task];
    let parentId = task.parentTaskId;
    
    while (parentId) {
      try {
        const parentResponse = await apiService.getTask(parentId);
        const parentTask = parentResponse.task || parentResponse.data || parentResponse;
        hierarchy.unshift(parentTask);
        parentId = parentTask.parentTaskId;
      } catch (err) {
        console.error('Erro ao carregar tarefa pai:', err);
        break;
      }
    }
    setParentHierarchy(hierarchy);
    
    // Load subtasks
    try {
      const response = await apiService.getTasks({ parentTaskId: task.id });
      setTasks(response.tasks || response.data?.tasks || response.data || []);
    } catch (err) {
      console.error('Erro ao carregar subtarefas:', err);
      setTasks([]);
    }
    
    setViewMode('tasks');
  };

  const handleBackToParent = async () => {
    if (!selectedParentTask) {
      handleBackToProjects();
      return;
    }

    const parentId = selectedParentTask.parentTaskId;
    if (!parentId) {
      // Go back to project root
      setSelectedParentTask(null);
      setParentHierarchy([]);
      if (selectedProject) {
        loadTasks(selectedProject.id);
      } else {
        loadTasks();
      }
      return;
    }

    // Go back to grand-parent
    try {
      const parentResponse = await apiService.getTask(parentId);
      const parentTask = parentResponse.task || parentResponse.data || parentResponse;
      handleViewSubtasks(parentTask);
    } catch (err) {
      console.error('Erro ao carregar tarefa pai ao voltar:', err);
    }
  };

  const handleProjectSelect = (project: Project) => {
    setPreviousViewMode(viewMode);
    setSelectedProject(project);
    setSelectedParentTask(null);
    setParentHierarchy([]);
    setViewMode('tasks');
    loadTasks(project.id);
  };

  const handleBackToList = () => {
    if (previousViewMode === 'task-tree') {
      setViewMode('task-tree');
    } else {
      setSelectedTask(null);
      setViewMode('tasks');
    }
  };

  const handleBackToProjects = () => {
    setSelectedProject(null);
    setSelectedParentTask(null);
    setParentHierarchy([]);
    setSelectedTask(null);
    setViewMode('projects');
  };

  const handleBackFromErrorLogs = () => {
    setViewMode('logs');
  };

  const handleCreateProject = async (projectData: any) => {
    try {
      // Adicionar createdById se houver usuário logado
      const projectDataWithUser = { ...projectData };
      if (user && user.id) {
        projectDataWithUser.createdById = user.id;
      }
      
      const newProject = await apiService.createProject(projectDataWithUser);
      // @ts-expect-error newProject is unknown
      setProjects([...projects, newProject]);
      return newProject;
    } catch (err) {
      console.error('Failed to create project:', err);
      throw err;
    }
  };

  const handleUpdateProject = async (id: string, projectData: any) => {
    console.log('DEBUG: handleUpdateProject chamado', { id, projectData });
    try {
      const updatedProject = await apiService.updateProject(id, projectData);
      console.log('DEBUG: Resposta da API updateProject:', updatedProject);
      console.log('DEBUG: Tipo de updatedProject:', typeof updatedProject);
      console.log('DEBUG: updatedProject tem propriedade project?', 'project' in updatedProject);
      console.log('DEBUG: projects antes da atualização:', projects.length, projects);
      const newProjects = projects.map(p => p.id === id ? updatedProject : p);
      console.log('DEBUG: newProjects após atualização:', newProjects.length, newProjects);
      setProjects(newProjects);
      if (selectedProject?.id === id) {
        setSelectedProject(updatedProject);
      }
    } catch (err) {
      console.error('DEBUG: Failed to update project:', err);
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

  const handleUpdateTask = async (id: string, taskData: any): Promise<Task> => {
    try {
      const updatedTask = await apiService.updateTask(id, taskData);
      
      // Garante que a tarefa atualizada tenha os objetos relacionados completos
      const enhancedTask = {
        ...updatedTask,
        // Se a API retornar apenas IDs, adiciona os objetos completos das listas
        status: updatedTask.status || statuses.find(s => s.id === updatedTask.statusId),
        priority: updatedTask.priority || priorities.find(p => p.id === updatedTask.priorityId),
        project: updatedTask.project || projects.find(p => p.id === updatedTask.projectId),
        assignedTo: updatedTask.assignedTo || users.find(u => u.id === updatedTask.assignedToId),
        createdBy: updatedTask.createdBy || users.find(u => u.id === updatedTask.createdById)
      };
      
      setTasks(tasks.map(t => t.id === id ? enhancedTask : t));
      if (selectedTask?.id === id) {
        setSelectedTask(enhancedTask);
      }
      if (selectedProject) {
        // Agora loadTasks já cuida de verificar o selectedParentTask sozinho
        loadTasks(selectedProject.id);
      }
      return enhancedTask; // Retorna a tarefa atualizada com objetos relacionados
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
          <FaSpinner size={48} style={{ animation: 'spin 1s linear infinite', color: 'var(--accent-color)' }} />
        </div>
      );
    }

    if (error) {
      return (
        <div style={{
          padding: '40px',
          textAlign: 'center',
          color: 'var(--danger-color)'
        }}>
          <h3>Erro ao carregar dados</h3>
          <p>{error}</p>
          <button
            onClick={loadInitialData}
            style={{
              padding: '10px 20px',
              backgroundColor: 'var(--accent-color)',
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
            selectedParentTask={selectedParentTask}
            parentHierarchy={parentHierarchy}
            onTaskSelect={handleTaskSelect}
            onViewSubtasks={handleViewSubtasks}
            onBackToProjects={handleBackToProjects}
            onBackToParent={handleBackToParent}
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
          <LogJarbas />
        );

      case 'error-logs':
        return (
          <LogErros onBack={handleBackFromErrorLogs} />
        );

      case 'agents':
        return (
          <AgentManager />
        );

      case 'stages':
        return (
          <StageManager />
        );

      case 'projects':
      default:
        return <ProjectsDashboard onProjectSelect={handleProjectSelect} />;
    }
  };

  return (
    <ErrorBoundary>
      <MainLayout
        currentView={viewMode}
        onViewChange={(view) => {
          setViewMode(view as ViewMode);
        }}
        onOpenStatus={() => {
          setIsStatusModalOpen(true);
        }}
        onOpenPriority={() => {
          setIsPriorityModalOpen(true);
        }}
        onOpenUser={() => {
          setIsUserModalOpen(true);
        }}
        onOpenProjectType={() => {
          setIsProjectTypeModalOpen(true);
        }}
        onOpenNextTask={() => {
          setIsNextTaskModalOpen(true);
        }}
        onOpenAgents={() => {
          setViewMode('agents');
        }}
        onOpenErrorLogs={() => {
          setViewMode('error-logs');
        }}
        onLogout={() => {
          logout();
        }}
        user={user}
      >
        {renderContent()}
      </MainLayout>

      {/* Modals */}
      {isStatusModalOpen && (
        <StatusManager 
          isOpen={isStatusModalOpen} 
          onClose={() => setIsStatusModalOpen(false)} 
        />
      )}
      {isPriorityModalOpen && (
        <PriorityManager 
          isOpen={isPriorityModalOpen} 
          onClose={() => setIsPriorityModalOpen(false)} 
        />
      )}
      {isUserModalOpen && (
        <UserManager 
          isOpen={isUserModalOpen} 
          onClose={() => setIsUserModalOpen(false)} 
        />
      )}
      {isProjectTypeModalOpen && (
        <ProjectTypeManager 
          isOpen={isProjectTypeModalOpen} 
          onClose={() => setIsProjectTypeModalOpen(false)} 
        />
      )}
      {isNextTaskModalOpen && (
        <NextTaskManager 
          isOpen={isNextTaskModalOpen} 
          onClose={() => setIsNextTaskModalOpen(false)} 
        />
      )}
      {isProfileEditModalOpen && (
        <UserProfileEdit 
          isOpen={isProfileEditModalOpen} 
          onClose={() => setIsProfileEditModalOpen(false)} 
        />
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
        backgroundColor: 'var(--bg-primary)'
      }}>
        <FaSpinner size={48} style={{ animation: 'spin 1s linear infinite', color: 'var(--accent-color)' }} />
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