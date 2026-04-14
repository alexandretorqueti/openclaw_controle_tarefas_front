import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import { Task, Status, Priority } from '../types/tasks';
import { User } from '../types/user';
import { Agent } from '../types/agent';
import { getBackendBaseUrl } from '../config/api';
import TaskCard from './TaskCard';

import Card from './shared/Card';
import Button from './shared/Button';
import { FaFilter, FaSearch, FaSortAmountDown, FaFlag, FaPlus, FaProjectDiagram, FaArrowLeft, FaExclamationTriangle, FaArrowUp } from 'react-icons/fa';
import { safeParseDate } from '../utils/dateUtils';
import { useSSE } from '../contexts/SSEContext';
import { Project } from '../types/project';

// Funções vazias padrão para comparação
const NOOP_FN = () => {};
const NOOP_ASYNC_FN = async () => {};
const NOOP_ASYNC_TASK_FN = async () => ({ id: '', title: '', description: '', projectId: '', statusId: '', priorityId: '', assignedToId: '', deadline: '', createdAt: '', updatedAt: '', isCompleted: false });

interface TaskListProps {
  tasks: Task[];
  users: User[];
  statuses: Status[];
  priorities: Priority[];
  projects: Project[];
  selectedProject: Project | null;
  selectedParentTask?: Task | null;
  parentHierarchy?: Task[];
  onTaskSelect: (task: Task) => void;
  onViewSubtasks?: (task: Task) => void;
  onBackToProjects?: () => void;
  onBackToParent?: () => void;
  onCreateTask?: (taskData: Partial<Task>) => Promise<Task>;
  onUpdateTask?: (id: string, taskData: Partial<Task>) => Promise<Task>;
  onDeleteTask?: (id: string) => Promise<void>;
  onToggleCompletion?: (id: string) => Promise<void>;
  showCompleted?: boolean;
  onToggleShowCompleted?: (show: boolean) => void;
  executeurFn?: (taskData: any) => void; // Nova prop para receber dados do backend
}

const TaskList: React.FC<TaskListProps> = ({
  tasks: propTasks = [],
  users: propUsers = [],
  statuses: propStatuses = [],
  priorities: propPriorities = [],
  projects: propProjects = [],
  selectedProject: propSelectedProject = null,
  selectedParentTask = null,
  parentHierarchy = [],
  onTaskSelect = NOOP_FN,
  onViewSubtasks = NOOP_FN,
  onBackToProjects = NOOP_FN,
  onBackToParent = NOOP_FN,
  onCreateTask = NOOP_ASYNC_TASK_FN,
  onUpdateTask = NOOP_ASYNC_TASK_FN,
  onDeleteTask = NOOP_ASYNC_FN,
  onToggleCompletion = NOOP_ASYNC_FN,
  showCompleted: propShowCompleted = false,
  onToggleShowCompleted = () => {},
  executeurFn = NOOP_FN
}) => {
  const { projectId } = useParams<{ projectId?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  console.log('🚀 TaskList: Componente montado');
  console.log('🚀 Props recebidas:', {
    propTasksLength: propTasks.length,
    propUsersLength: propUsers.length,
    propStatusesLength: propStatuses.length,
    propPrioritiesLength: propPriorities.length,
    propProjectsLength: propProjects.length,
    propSelectedProject: !!propSelectedProject,
    propSelectedParentTask: !!selectedParentTask,
    parentHierarchyLength: parentHierarchy.length
  });
  console.log('🚀 Parâmetros da URL:', { projectId });
  console.log('🚀 Estado de navegação:', location.state);

  // Extrair estado de navegação para hierarquia de tarefas
  const navigationState = location.state as { selectedParentTask?: Task; parentHierarchy?: Task[] } || {};

  // Usar estado de navegação se disponível, caso contrário usar props
  const finalSelectedParentTask = navigationState.selectedParentTask || selectedParentTask;
  const finalParentHierarchy = navigationState.parentHierarchy || parentHierarchy;

  // Obter o contexto SSE para atualização em tempo real
  const { addEventListener, removeEventListener } = useSSE();

  // Estados para dados quando não são fornecidos via props
  const [tasks, setTasks] = useState<Task[]>(propTasks);
  const [taskInclusionSemaphore, setTaskInclusionSemaphore] = useState(false);
  const [taskInInclusion, setTaskInInclusion] = useState<Task>();
  const [users, setUsers] = useState<User[]>(propUsers);
  const [statuses, setStatuses] = useState<Status[]>(propStatuses);
  const [priorities, setPriorities] = useState<Priority[]>(propPriorities);
  const [projects, setProjects] = useState<Project[]>(propProjects);
  const [selectedProject, setSelectedProject] = useState<Project | null>(propSelectedProject);
  const [isLoading, setIsLoading] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);

  // Estado para forçar re-render quando taskInExecução mudar
  const [forceRender, setForceRender] = useState(false);
  
  // Estado para controlar animação de saída
  const [isExiting, setIsExiting] = useState(false);

  // Refs para controlar loops
  const isFetchingRef = useRef(false);
  const hasFetchedRef = useRef(false);
  
  // Ref para armazenar tarefa em execução
  const taskInExecução = useRef<Task | null>(null);

  // Função para voltar aos projetos
  const handleBackToProjects = () => {
    if (onBackToProjects && typeof onBackToProjects === 'function') {
      onBackToProjects();
    } else {
      navigate('/projects');
    }
  };

  // Função segura para stringify que evita erros de referência circular
  const safeStringify = (obj: any): string => {
    try {
      return JSON.stringify(obj);
    } catch (error) {
      console.error('Erro ao serializar objeto:', error);
      return '{}';
    }
  };

  // Criar versões em string das props para comparação estável
  const propTasksString = safeStringify(propTasks);
  const propUsersString = safeStringify(propUsers);
  const propStatusesString = safeStringify(propStatuses);
  const propPrioritiesString = safeStringify(propPriorities);
  const propProjectsString = safeStringify(propProjects);
  const propSelectedProjectString = safeStringify(propSelectedProject);

  // Sincronizar estados locais com props quando elas mudarem
  useEffect(() => {
    if (propTasksString !== safeStringify(tasks)) {
      setTasks(propTasks);
    }
  }, [propTasksString]);

  useEffect(() => {
    if (propUsersString !== safeStringify(users)) {
      setUsers(propUsers);
    }
  }, [propUsersString]);

  useEffect(() => {
    if (propStatusesString !== safeStringify(statuses)) {
      setStatuses(propStatuses);
    }
  }, [propStatusesString]);

  useEffect(() => {
    if (propPrioritiesString !== safeStringify(priorities)) {
      setPriorities(propPriorities);
    }
  }, [propPrioritiesString]);

  useEffect(() => {
    if (propProjectsString !== safeStringify(projects)) {
      setProjects(propProjects);
    }
  }, [propProjectsString]);

  useEffect(() => {
    if (propSelectedProjectString !== safeStringify(selectedProject)) {
      setSelectedProject(propSelectedProject);
    }
  }, [propSelectedProjectString]);

  // Monitorar prop executeurFn para detectar quando tarefa começa/termina
  useEffect(() => {
    console.log('🎯 TaskList: Monitorando executeurFn');
    
    // Se executeurFn for uma função válida, configurar listener
    if (executeurFn && typeof executeurFn === 'function' && executeurFn !== NOOP_FN) {
      console.log('🎯 executeurFn disponível, configurando listener');
      
      // Função para processar dados do backend
      const processExecuteurData = (data: any) => {
        console.log('🎯 Dados recebidos do backend:', data);
        
        if (data && data.task) {
          // Tarefa começou execução - resetar estado de saída
          setIsExiting(false);
          taskInExecução.current = data.task;
          console.log('🎯 Tarefa em execução:', taskInExecução.current?.title);
        } else if (data === null || data === undefined) {
          // Tarefa terminou execução - iniciar animação de saída
          if (taskInExecução.current) {
            console.log('🎯 Iniciando animação de saída para tarefa:', taskInExecução.current.title);
            setIsExiting(true);
            
            // Aguardar animação de saída terminar antes de limpar
            setTimeout(() => {
              taskInExecução.current = null;
              setIsExiting(false);
              console.log('🎯 Tarefa finalizada, limpando estado');
              setForceRender(prev => !prev);
            }, 300); // Tempo da animação fadeOut
          }
        }
        
        // Forçar re-render para atualizar UI
        // Como estamos usando useRef, precisamos de um estado para forçar re-render
        setForceRender(prev => !prev);
      };
      
      // Chamar executeurFn com nossa função de callback
      executeurFn(processExecuteurData);
      
      return () => {
        console.log('🎯 Cleanup executeurFn listener');
      };
    } else {
      console.log('🎯 executeurFn não disponível ou é NOOP_FN');
    }
  }, [executeurFn]);

  // Criar versões em string dos estados locais para comparação estável
  const tasksString = safeStringify(tasks);
  const usersString = safeStringify(users);
  const statusesString = safeStringify(statuses);
  const prioritiesString = safeStringify(priorities);
  const projectsString = safeStringify(projects);
  const selectedProjectString = safeStringify(selectedProject);
  const selectedParentTaskString = safeStringify(finalSelectedParentTask);
  const [sortByCreatedAt, setSortByCreatedAt] = useState<'newest' | 'oldest'>('newest');
  // Buscar dados se não forem fornecidos via props - EVITAR LOOPS
  useEffect(() => {
    console.log('🔄 TaskList: useEffect executando');
    console.log('🔄 Dependências (strings):', { 
      propTasksStringLength: propTasksString.length,
      propUsersStringLength: propUsersString.length, 
      propStatusesStringLength: propStatusesString.length,
      propPrioritiesStringLength: propPrioritiesString.length,
      propProjectsStringLength: propProjectsString.length,
      propSelectedProjectStringLength: propSelectedProjectString.length,
      projectId
    });
    console.log('🔄 propStatuses vazio?', propStatuses.length === 0);
    console.log('🔄 propPriorities vazio?', propPriorities.length === 0);
    console.log('🔄 propUsers vazio?', propUsers.length === 0);
    console.log('🔄 propProjects vazio?', propProjects.length === 0);

    // Evitar loops: não executar se já está buscando ou já buscou
    if (isFetchingRef.current) {
      console.log('🔄 TaskList: Já está buscando, ignorando...');
      return;
    }

    // Se já buscou os dados básicos e não temos projectId novo, não buscar novamente
    if (hasFetchedRef.current && !projectId) {
      console.log('🔄 TaskList: Já buscou dados básicos, ignorando...');
      return;
    }

    const fetchData = async () => {
      console.log('🔄 TaskList: fetchData iniciando');
      isFetchingRef.current = true;
      setIsLoading(true);
      setDataError(null);

      try {
        console.log('📊 TaskList: Buscando dados da API...');
        console.log('📊 TaskList: projectId da URL:', projectId);

        // Buscar projeto específico se tivermos projectId na URL
        if (projectId && !propSelectedProject) {
          try {
            console.log('📊 TaskList: Buscando projeto específico:', projectId);
            // projectData é um array de projetos
            const { project } : { project : Project } = await api.getProject(projectId);
            console.log('📊 TaskList: Projeto carregado:', project?.name);
            setSelectedProject(project);
          } catch (projectError) {
            console.error('📊 TaskList: Erro ao buscar projeto:', projectError);
          }
        }

        // Se já temos dados via props, não precisamos buscar os básicos
        const shouldFetchBasicData = !(propTasks.length > 0 && propUsers.length > 0 && propStatuses.length > 0 &&
          propPriorities.length > 0 && propProjects.length > 0);

        console.log('📊 TaskList: shouldFetchBasicData:', shouldFetchBasicData);
        console.log('📊 TaskList: Condição para não buscar:', {
          propTasks: propTasks.length > 0,
          propUsers: propUsers.length > 0,
          propStatuses: propStatuses.length > 0,
          propPriorities: propPriorities.length > 0,
          propProjects: propProjects.length > 0
        });

        if (shouldFetchBasicData) {
          // Buscar dados básicos em paralelo
          // Construir filtros para tarefas
          const filters: any = {};
          if (projectId) {
            filters.projectId = projectId;
          }
          if (finalSelectedParentTask?.id) {
            // Se há uma tarefa pai selecionada, mostrar apenas suas subtarefas
            filters.parentTaskId = finalSelectedParentTask.id;
          } else {
            // Se não há tarefa pai selecionada (estamos na raiz), mostrar apenas tarefas sem pai
            filters.parentTaskId = null;
          }
          console.log('🔍 Buscando tarefas com os filtros:', filters);

          const tasksPromise = propTasks.length === 0
            ? api.getTasks(filters, 'createdAt', sortByCreatedAt === 'newest' ? 'desc' : 'asc')
            : Promise.resolve({ tasks: propTasks });

          const [tasksRes, usersRes, statusesRes, prioritiesRes, projectsRes] = await Promise.allSettled([
            tasksPromise,
            propUsers.length === 0 ? api.getUsers() : Promise.resolve({ users: propUsers }),
            propStatuses.length === 0 ? api.getStatuses() : Promise.resolve({ statuses: propStatuses }),
            propPriorities.length === 0 ? api.getPriorities() : Promise.resolve({ priorities: propPriorities }),
            propProjects.length === 0 ? api.getProjects() : Promise.resolve({ projects: propProjects })
          ]);

          // Processar resultados
          if (tasksRes.status === 'fulfilled' && tasksRes.value.tasks) {
            console.log('📊 TaskList: Tasks carregadas:', tasksRes.value.tasks.length);
            setTasks(tasksRes.value.tasks);
          }

          if (usersRes.status === 'fulfilled' && usersRes.value.users) {
            console.log('📊 TaskList: Users carregados:', usersRes.value.users.length);
            setUsers(usersRes.value.users);
          }

          if (statusesRes.status === 'fulfilled' && statusesRes.value.statuses) {
            console.log('📊 TaskList: Statuses carregados:', statusesRes.value.statuses.length);
            setStatuses(statusesRes.value.statuses);
          }

          if (prioritiesRes.status === 'fulfilled' && prioritiesRes.value.priorities) {
            console.log('📊 TaskList: Priorities carregados:', prioritiesRes.value.priorities.length);
            setPriorities(prioritiesRes.value.priorities);
          }

          if (projectsRes.status === 'fulfilled' && projectsRes.value.projects) {
            console.log('📊 TaskList: Projects carregados:', projectsRes.value.projects.length);
            setProjects(projectsRes.value.projects);
          }

          // Marcar que já buscou dados básicos
          hasFetchedRef.current = true;
        }

        console.log('📊 TaskList: Dados carregados com sucesso');

      } catch (error) {
        console.error('📊 TaskList: Erro ao buscar dados:', error);
        setDataError('Não foi possível carregar os dados. Tente novamente mais tarde.');
      } finally {
        console.log('🔄 TaskList: fetchData finalizado, isLoading = false');
        setIsLoading(false);
        isFetchingRef.current = false;
      }
    };

    fetchData();
  

    // Cleanup function
    return () => {
      console.log('🔄 TaskList: useEffect cleanup');
    };
  }, [
    propTasksString,
    propUsersString, 
    propStatusesString, 
    propPrioritiesString, 
    propProjectsString, 
    propSelectedProjectString, 
    projectId, 
    selectedParentTaskString,
    sortByCreatedAt
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedPriority, setSelectedPriority] = useState<string>('');
  const [sortBy, setSortBy] = useState<'deadline' | 'priority' | 'title'>('deadline');

  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Estado local para compatibilidade, caso a prop não seja fornecida
  const [localShowCompleted, setLocalShowCompleted] = useState(false);
  const showCompleted = onToggleShowCompleted ? propShowCompleted : localShowCompleted;
  // Back to top functionality
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Estados para terminais em tempo real
  const [analistaTerminal, setAnalistaTerminal] = useState<string>('');
  const [programadorTerminal, setProgramadorTerminal] = useState<string>('');
  const [isTypingAnalista, setIsTypingAnalista] = useState(false);
  const [isTypingProgramador, setIsTypingProgramador] = useState(false);
  const analistaRef = useRef<HTMLDivElement>(null);
  const programadorRef = useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };
    const carregarAgentes = async () => {
      try {
        const response: AgentsResponse = await api.getAgents();
        let agentsList: Agent[] = [];
        if (response && Array.isArray(response.data)) {
          setAgents(response.data);
        }
      } catch (error) {
        console.error("Erro ao carregar agentes:", error);
      }
    };
    carregarAgentes();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Inicializar terminais com conteúdo da primeira tarefa
  useEffect(() => {
    if (tasks?.length > 0) {
      const firstTask = tasks[0];
      if (firstTask.arquitetosTerminalContent) {
        setAnalistaTerminal(firstTask.arquitetosTerminalContent);
      }
      if (firstTask.programadorTerminalContent) {
        setProgramadorTerminal(firstTask.programadorTerminalContent);
      }
    }
  }, [tasksString]);



  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleShowCompleted = (checked: boolean) => {
    if (onToggleShowCompleted) {
      onToggleShowCompleted(checked);
    } else {
      setLocalShowCompleted(checked);
    }
  };

  // Handler para mudança de ordenação por data de criação
  const handleSortByCreatedAtChange = (value: 'newest' | 'oldest') => {
    setSortByCreatedAt(value);
    // Se estiver usando ordenação por createdAt, desativar outras ordenações
    setSortBy('deadline'); // ou manter como está
  };

  const [newTaskData, setNewTaskData] = useState<Partial<Task>>({
    title: '',
    description: '',
    projectId: selectedProject?.id || '',
    statusId: statuses?.find(s => s.name === 'Pendente')?.id || statuses?.[0]?.id || '',
    priorityId: priorities?.find(p => p.name === 'Média')?.id || priorities?.[1]?.id || '',
    assignedToId: users?.length > 0 ? users[0]?.id || '' : '',
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 dias a partir de agora
    agent: typeof window !== 'undefined' ? localStorage.getItem('lastUsedAgent') || '' : '',
    parentTaskId: finalSelectedParentTask?.id || null
  });

  // Update parentTaskId when selectedParentTask changes
  React.useEffect(() => {
    setNewTaskData(prev => ({
      ...prev,
      parentTaskId: finalSelectedParentTask?.id || null
    }));
  }, [selectedParentTaskString]);

  // Update defaults when data loads
  React.useEffect(() => {
    const defaultStatus = statuses?.find(s => s.name === 'Pendente')?.id || statuses?.[0]?.id || '';
    const defaultPriority = priorities?.find(p => p.name === 'Média')?.id || priorities?.[1]?.id || '';
    const defaultUser = users?.[0]?.id || '';

    setNewTaskData(prev => ({
      ...prev,
      statusId: defaultStatus || prev.statusId || '',
      priorityId: defaultPriority || prev.priorityId || '',
      assignedToId: defaultUser || prev.assignedToId || ''
    }));
  }, [statusesString, prioritiesString, usersString]);

  // Update projectId when selectedProject changes
  React.useEffect(() => {
    if (selectedProject) {
      setNewTaskData(prev => ({
        ...prev,
        projectId: selectedProject.id
      }));

      // Set agent to project's programadorContratado if it exists
      if (selectedProject.programadorContratado) {
        setNewTaskData(prev => ({
          ...prev,
          agent: selectedProject.programadorContratado
        }));
      }
    }
  }, [selectedProjectString]);

  // Load last used agent from localStorage (fallback if no programadorContratado)
  // SSE para atualização em tempo real das tarefas
  React.useEffect(() => {
    console.log('🔌 TaskList: Configurando listeners SSE para atualização em tempo real');

    const handleTaskUpdated = (updatedTask: Task) => {
      console.log('📡 TaskList: Evento task_updated recebido via SSE:', updatedTask.id, updatedTask.title);
      
      // Atualizar terminais se a tarefa atualizada for a primeira da lista
      if (tasks?.length > 0 && updatedTask.id === tasks[0]?.id) {
        if (updatedTask.arquitetosTerminalContent !== undefined) {
          setAnalistaTerminal(updatedTask.arquitetosTerminalContent || '');
        }
        if (updatedTask.programadorTerminalContent !== undefined) {
          setProgramadorTerminal(updatedTask.programadorTerminalContent || '');
        }
      }
      
      // ATUALIZAR LISTA DE TAREFAS
      // Verificar se a tarefa atualizada pertence ao contexto atual
      const shouldUpdateTask = 
        (!projectId || updatedTask.projectId === projectId) &&
        (
          // Se estamos na raiz (sem tarefa pai selecionada), só aceitar tarefas sem pai
          (!finalSelectedParentTask && updatedTask.parentTaskId === null) ||
          // Se estamos visualizando subtarefas de uma tarefa pai, só aceitar suas subtarefas
          (finalSelectedParentTask && updatedTask.parentTaskId === finalSelectedParentTask.id)
        );
      
      if (shouldUpdateTask) {
        console.log('🔄 TaskList: Atualizando tarefa na lista via SSE:', updatedTask.id);
        setTasks(prev => prev.map(task => 
          task.id === updatedTask.id ? { ...task, ...updatedTask } : task
        ));
      } else {
        console.log('ℹ️ TaskList: Tarefa atualizada não pertence ao contexto atual, ignorando:', updatedTask.id);
      }
    };

    const handleTaskCreated = async (newTask: Task) => {
      console.log('📡 TaskList: Evento task_created recebido via SSE:', newTask.id, newTask.title);
      
      // Verificar se a nova tarefa pertence ao contexto atual
      const shouldAddTask = 
        (!projectId || newTask.projectId === projectId) &&
        (
          // Se estamos na raiz (sem tarefa pai selecionada), só aceitar tarefas sem pai
          (!finalSelectedParentTask && newTask.parentTaskId === null) ||
          // Se estamos visualizando subtarefas de uma tarefa pai, só aceitar suas subtarefas
          (finalSelectedParentTask && newTask.parentTaskId === finalSelectedParentTask.id)
        );
      
      if (shouldAddTask) {
        console.log('🆕 TaskList: Adicionando nova tarefa à lista via SSE:', newTask.id);
        // Primeiro vamos verificar se a tarefa já não está na lista.
        if (tasks.some(task => task.id === newTask.id)) {
          console.log('ℹ️ TaskList: Nova tarefa ja estava na lista, ignorando:', newTask.id);
          return;
        }
        // Se a tarefa ainda não estava na lista, adicione-a
        setTaskInInclusion(newTask);
      } else {
        console.log('ℹ️ TaskList: Nova tarefa não pertence ao contexto atual, ignorando:', newTask.id);
      }

      // Se a nova tarefa é uma subtarefa (tem parentTaskId), buscar e atualizar a tarefa pai
      if (newTask.parentTaskId) {
        try {
          console.log('🔄 TaskList: Buscando tarefa pai para atualizar subtarefas:', newTask.parentTaskId);
          const parentTaskResponse = await api.getTask(newTask.parentTaskId);
          if (parentTaskResponse.task) {
            console.log('🔄 TaskList: Atualizando tarefa pai com novas subtarefas:', parentTaskResponse.task.id);
            // Atualizar a tarefa pai na lista com subtasks e totalSubtasks
            setTasks(prev => prev.map(task => 
              task.id === parentTaskResponse.task.id ? { 
                ...task, 
                subtasks: parentTaskResponse.task.subtasks,
                totalSubtasks: parentTaskResponse.task.totalSubtasks || parentTaskResponse.task.subtasks?.length || 0
              } : task
            ));
          }
        } catch (error) {
          console.error('❌ TaskList: Erro ao buscar tarefa pai:', error);
        }
      }
    };

    const handleTaskDeleted = (deletedTask: { id: string }) => {
      console.log('📡 TaskList: Evento task_deleted recebido via SSE:', deletedTask.id);
      
      // Remover tarefa da lista
      console.log('🗑️ TaskList: Removendo tarefa da lista via SSE:', deletedTask.id);
      setTasks(prev => prev.filter(task => task.id !== deletedTask.id));
    };

    const handleTerminalUpdate = (data: any) => {
      console.log('📡 TaskList: Evento terminal_update recebido via SSE:', data);

      if (data.type === 'analista' && data.content) {
        setIsTypingAnalista(true);
        setAnalistaTerminal(prev => prev + data.content);

        setTimeout(() => {
          setIsTypingAnalista(false);
          if (analistaRef.current) {
            analistaRef.current.scrollTop = analistaRef.current.scrollHeight;
          }
        }, data.content.length * 30);
      }

      if (data.type === 'programador' && data.content) {
        setIsTypingProgramador(true);
        setProgramadorTerminal(prev => prev + data.content);

        setTimeout(() => {
          setIsTypingProgramador(false);
          if (programadorRef.current) {
            programadorRef.current.scrollTop = programadorRef.current.scrollHeight;
          }
        }, data.content.length * 30);
      }

      if (data.type === 'terminal_clear') {
        if (data.target === 'analista' || data.target === 'both') {
          setAnalistaTerminal('');
        }
        if (data.target === 'programador' || data.target === 'both') {
          setProgramadorTerminal('');
        }
      }
    };

    // Registrar listeners
    addEventListener('task_updated', handleTaskUpdated);
    addEventListener('task_created', handleTaskCreated);
    addEventListener('task_deleted', handleTaskDeleted);
    addEventListener('terminal_update', handleTerminalUpdate);

    console.log('✅ TaskList: Listeners SSE configurados com sucesso');

    return () => {
      console.log('🔌 TaskList: Removendo listeners SSE');
      removeEventListener('task_updated', handleTaskUpdated);
      removeEventListener('task_created', handleTaskCreated);
      removeEventListener('task_deleted', handleTaskDeleted);
      removeEventListener('terminal_update', handleTerminalUpdate);
    };
  }, [projectId, finalSelectedParentTask, addEventListener, removeEventListener]); // REMOVI 'tasks' daqui!

  React.useEffect(() => {
    const lastModel = localStorage.getItem('lastUsedAgent');
    if (lastModel && (!selectedProject || !selectedProject.programadorContratado)) {
      setNewTaskData(prev => ({
        ...prev,
        agent: lastModel
      }));
    }
  }, [selectedProjectString]);

  const shouldFilterByCompletion = !onToggleShowCompleted;
  const filteredTasks = tasks?.filter(task => {
    const matchesSearch = (task.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (task.description || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = !selectedStatus || task.statusId === selectedStatus;
    const matchesPriority = !selectedPriority || task.priorityId === selectedPriority;
    const matchesCompletion = shouldFilterByCompletion ? (showCompleted ? true : !task.isCompleted) : true;

    return matchesSearch && matchesStatus && matchesPriority && matchesCompletion;
  }) || [];

  const sortedTasks = filteredTasks.sort((a, b) => {
    // Se estiver usando ordenação por createdAt
    if (sortByCreatedAt === 'newest') {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA; // Mais novas primeiro
    } else if (sortByCreatedAt === 'oldest') {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateA - dateB; // Mais antigas primeiro
    }
    
    // Ordenação original por deadline, priority, title
    switch (sortBy) {
      case 'deadline':
        const dateA = a.deadline ? safeParseDate(a.deadline)?.getTime() : Infinity;
        const dateB = b.deadline ? safeParseDate(b.deadline)?.getTime() : Infinity;
        return (dateA || Infinity) - (dateB || Infinity);
      case 'priority':
        const priorityA = priorities?.find(p => p.id === a.priorityId)?.weight || 0;
        const priorityB = priorities?.find(p => p.id === b.priorityId)?.weight || 0;
        return priorityB - priorityA;
      case 'title':
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  const getProjectName = (projectId: string) => {
    const project = projects?.find(p => p.id === projectId);
    return project ? project.name : 'Projeto não encontrado';
  };

  const getTaskCountByStatus = (statusId: string) => {
    return tasks?.filter(task => task.statusId === statusId).length || 0;
  };

  useEffect(() => {
    if (!taskInclusionSemaphore && taskInInclusion) {
      setTaskInclusionSemaphore(true);
      
      setTimeout(() => {
        if (taskInInclusion) {
          const jaTemaTarefaNaLista : boolean = tasks?.some(task => task.id === taskInInclusion.id);
          if (!jaTemaTarefaNaLista) {
            setTasks(prev => [...prev, taskInInclusion]);  
          }
          setTaskInInclusion(null);
        }
        setTimeout(() => {
          setTaskInclusionSemaphore(false);
        }, 100);
      }, 100);
    }
  }, [taskInclusionSemaphore, taskInInclusion]);
  const handleCreateTask = async () => {
    console.log('🆕 TaskList: handleCreateTask chamado', { newTaskData });

    if (!newTaskData.title || !newTaskData.projectId || !newTaskData.deadline) {
      console.error('❌ Missing required data for task creation');
      setError('Preencha o título da tarefa e o prazo.');
      return;
    }

    setError(null); // Limpa erros anteriores

    try {
      // Debug: log what we're sending
      console.log('📤 TaskList: Enviando dados da tarefa:', newTaskData);

      const taskData  = {
        ...newTaskData,
        // createdById will be set by the parent component (App.tsx) or backend
        position: tasks?.length || 0,
        // Ensure agent is null if empty string
        agent: newTaskData.agent || null
      };

      console.log('📤 TaskList: Dados finais para criação:', taskData);

      let createdTask: Task | null = null;

      // Se a prop onCreateTask foi fornecida e não é a função padrão, use-a
      if (onCreateTask && onCreateTask !== NOOP_ASYNC_TASK_FN) {
        console.log('🔧 TaskList: Usando onCreateTask prop');
        createdTask = await onCreateTask(taskData);
      } else {
        // Caso contrário, chame a API diretamente
        console.log('🔧 TaskList: Chamando API diretamente (fallback)');
        const response = await api.createTask(taskData) as { task: Task };
        createdTask = response.task;
        console.log('✅ TaskList: Tarefa criada via API:', createdTask);

        // Atualizar lista local de tarefas
        if (createdTask) {
          setTaskInInclusion(createdTask);
        }
      }

      // Save the selected agent to localStorage
      if (newTaskData.agent) {
        localStorage.setItem('lastUsedAgent', newTaskData.agent);
      }

      // Reset form with current values (not empty strings)
      const defaultStatus = statuses?.find(s => s.name === 'Pendente')?.id || statuses?.[0]?.id || '';
      const defaultPriority = priorities?.find(p => p.name === 'Média')?.id || priorities?.[1]?.id || '';
      const defaultUser = users?.[0]?.id || '';

      setNewTaskData({
        title: '',
        description: '',
        projectId: selectedProject?.id || '',
        statusId: defaultStatus,
        priorityId: defaultPriority,
        assignedToId: defaultUser,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 dias a partir de agora
        agent: newTaskData.agent || '', // Keep the same model for next task
        parentTaskId: finalSelectedParentTask?.id || null
      });
      setIsCreatingTask(false);

      console.log('✅ TaskList: Tarefa criada com sucesso!');
    } catch (error: any) {
      console.error('❌ TaskList: Failed to create task:', error);

      // Extrai mensagem de erro amigável
      let errorMessage = 'Erro ao criar tarefa.';

      if (error.message) {
        errorMessage = error.message;
      }

      // Tenta extrair detalhes da resposta da API
      if (error.details && Array.isArray(error.details)) {
        const validationErrors = error.details.map((detail: any) =>
          detail.message || `${detail.path?.join('.')}: ${detail.code}`
        ).join(', ');

        if (validationErrors) {
          errorMessage = `Erros de validação: ${validationErrors}`;
        }
      }

      setError(errorMessage);
    }
  };

  // Handlers para atualização de tarefas
  const handleUpdateTask = async (id: string, taskData: Partial<Task>) => {
    console.log('🔄 TaskList: handleUpdateTask chamado', { id, taskData });
    try {
      // Se a prop onUpdateTask foi fornecida e não é a função padrão, use-a
      if (onUpdateTask && onUpdateTask !== NOOP_ASYNC_TASK_FN) {
        return await onUpdateTask(id, taskData);
      }

      // Caso contrário, chame a API diretamente
      const request = await api.updateTask(id, taskData);
      const updatedTask = request.task;
      console.log('✅ Task atualizada via API:', updatedTask);

      // Atualizar estado local
      setTasks(prev => prev.map(task => task.id === id ? { ...task, ...updatedTask } : task));
      return updatedTask;
    } catch (error) {
      console.error('❌ Erro ao atualizar tarefa:', error);
      throw error;
    }
  };

  const handleDeleteTask = async (id: string) => {
    console.log('🗑️ TaskList: handleDeleteTask chamado', { id });
    try {
      // Se a prop onDeleteTask foi fornecida e não é a função padrão, use-a
      if (onDeleteTask && onDeleteTask !== NOOP_ASYNC_FN) {
        await onDeleteTask(id);
        return;
      }

      // Caso contrário, chame a API diretamente
      await api.deleteTask(id);
      console.log('✅ Task deletada via API');

      // Atualizar estado local
      setTasks(prev => prev.filter(task => task.id !== id));
    } catch (error) {
      console.error('❌ Erro ao deletar tarefa:', error);
      throw error;
    }
  };

  const handleToggleCompletion = async (id: string) => {
    console.log('✅ TaskList: handleToggleCompletion chamado', { id });
    try {
      // Se a prop onToggleCompletion foi fornecida e não é a função padrão, use-a
      if (onToggleCompletion && onToggleCompletion !== NOOP_ASYNC_FN) {
        await onToggleCompletion(id);
        return;
      }

      // Caso contrário, chame a API diretamente
      const task = tasks.find(t => t.id === id);
      if (!task) {
        throw new Error('Tarefa não encontrada');
      }

      const updatedTask = await api.updateTask(id, { isCompleted: !task.isCompleted });
      console.log('✅ Status de conclusão alterado via API:', updatedTask);

      // Atualizar estado local
      setTasks(prev => prev.map(task => task.id === id ? { ...task, ...updatedTask } : task));
    } catch (error) {
      console.error('❌ Erro ao alternar conclusão da tarefa:', error);
      throw error;
    }
  };

  const handleTaskSelect = (task: Task) => {
    console.log('🔍 TaskList: handleTaskSelect (fallback) chamado', { task });
    // Navegar para a página de detalhes da tarefa
    navigate(`/tasks/${task.id}`);
  };

  const handleViewSubtasks = (task: Task) => {
    console.log('📋 TaskList: Navegando para subtarefas de', task.title);

    // Construir nova hierarquia
    const newHierarchy = [...finalParentHierarchy];
    if (finalSelectedParentTask) {
      // Se já estamos em um nível de subtarefa, adicionar o pai atual à hierarquia
      newHierarchy.push(finalSelectedParentTask);
    }

    // Navegar para a mesma rota com estado
    navigate(`/projects/${projectId}/tasks`, {
      state: {
        selectedParentTask: task,
        parentHierarchy: newHierarchy
      }
    });
  };

  const handleBackToParent = () => {
    console.log('🔙 TaskList: Voltando para nível anterior');

    // Se a prop onBackToParent foi fornecida e não é a função padrão, use-a
    if (onBackToParent && onBackToParent !== NOOP_FN) {
      onBackToParent();
      return;
    }

    // Caso contrário, implementar navegação de volta
    if (finalParentHierarchy.length > 0) {
      // Há ancestrais: voltar para o último ancestral (pai direto)
      const parentTask = finalParentHierarchy[finalParentHierarchy.length - 1];
      const grandparentHierarchy = finalParentHierarchy.slice(0, -1);

      navigate(`/projects/${projectId}/tasks`, {
        state: {
          selectedParentTask: parentTask,
          parentHierarchy: grandparentHierarchy
        }
      });
    } else {
      // Sem ancestrais: voltar para a raiz (sem pai)
      navigate(`/projects/${projectId}/tasks`, {
        state: {
          selectedParentTask: null,
          parentHierarchy: []
        }
      });
    }
  };

  // Decidir qual handler usar para voltar ao pai
  const backToParentHandler = onBackToParent !== NOOP_FN ? onBackToParent : handleBackToParent;

  // Mostrar loading enquanto busca dados
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '50vh',
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid var(--border-color)',
            borderTopColor: 'var(--accent-color)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }} />
          <p style={{ fontSize: '16px', fontWeight: 500 }}>
            Carregando tarefas...
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

  // Mostrar erro se houver
  if (dataError) {
    return (
      <div style={{
        padding: '40px',
        textAlign: 'center',
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)'
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          backgroundColor: 'var(--danger-color)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px'
        }}>
          <FaExclamationTriangle size={24} color="white" />
        </div>
        <h2 style={{ marginBottom: '16px' }}>Erro ao carregar dados</h2>
        <p style={{ marginBottom: '24px', color: 'var(--text-secondary)' }}>{dataError}</p>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '10px 20px',
            backgroundColor: 'var(--accent-color)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <style>
        {`
          @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.7; transform: scale(1.1); }
          }
          @keyframes typewriter {
            from { width: 0; }
            to { width: 100%; }
          }
        `}
      </style>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* Breadcrumb / Navigation */}
        {(selectedProject || finalSelectedParentTask) && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 16px',
            backgroundColor: 'var(--bg-card)',
            borderRadius: '8px',
            border: '1px solid var(--border-color)',
            flexWrap: 'wrap',
            fontSize: '14px'
          }}>
            <span
              onClick={onBackToProjects}
              style={{ cursor: 'pointer', color: 'var(--accent-color)', fontWeight: 500 }}
            >
              Projetos
            </span>

            {selectedProject && (
              <>
                <span style={{ color: 'var(--text-tertiary)' }}>›</span>
                <span
                  onClick={finalSelectedParentTask ? backToParentHandler : undefined}
                  style={{
                    cursor: finalSelectedParentTask ? 'pointer' : 'default',
                    color: finalSelectedParentTask ? 'var(--accent-color)' : 'var(--text-primary)',
                    fontWeight: finalSelectedParentTask ? 500 : 600
                  }}
                >
                  {selectedProject.name}
                </span>
              </>
            )}

            {finalParentHierarchy.map((task, index) => (
              <React.Fragment key={task.id}>
                <span style={{ color: 'var(--text-tertiary)' }}>›</span>
                <span
                  onClick={() => index < parentHierarchy.length - 1 && onTaskSelect(task)}
                  style={{
                    cursor: index < parentHierarchy.length - 1 ? 'pointer' : 'default',
                    color: index < parentHierarchy.length - 1 ? 'var(--accent-color)' : 'var(--text-primary)',
                    fontWeight: index < parentHierarchy.length - 1 ? 500 : 600
                  }}
                >
                  {task.title}
                </span>
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Container condicional para tarefa em execução */}
        {(taskInExecução.current || isExiting) && (
          <div
            style={{
              border: '2px solid var(--accent-color)',
              backgroundColor: 'rgba(var(--accent-rgb), 0.05)',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '24px',
              transition: 'all 0.3s ease',
              opacity: isExiting ? 0 : 1,
              transform: isExiting ? 'translateY(-10px)' : 'translateY(0)',
              animation: isExiting ? 'fadeOut 0.3s ease' : 'fadeIn 0.5s ease'
            }}
          >
            <style>
              {`
                @keyframes fadeIn {
                  from { opacity: 0; transform: translateY(-10px); }
                  to { opacity: 1; transform: translateY(0); }
                }
                @keyframes fadeOut {
                  from { opacity: 1; transform: translateY(0); }
                  to { opacity: 0; transform: translateY(-10px); }
                }
                @keyframes pulse {
                  0% { opacity: 1; }
                  50% { opacity: 0.5; }
                  100% { opacity: 1; }
                }
              `}
            </style>
            
            {/* Título da tarefa em execução */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '16px',
              paddingBottom: '12px',
              borderBottom: '1px solid var(--border-color)'
            }}>
              <div style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: 'var(--accent-color)',
                marginRight: '12px',
                animation: 'pulse 1.5s infinite'
              }} />
              <h3 style={{
                fontSize: '16px',
                fontWeight: 600,
                color: 'var(--text-primary)',
                margin: 0
              }}>
                {isExiting ? 'Finalizando tarefa: ' : 'Tarefa em execução: '}
                <span style={{ color: 'var(--accent-color)' }}>
                  {taskInExecução.current?.title || 'Tarefa finalizada'}
                </span>
              </h3>
            </div>

            {/* Quadros analista e programador - Responsivo */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '20px',
              marginTop: '16px'
            }}>
              {/* Quadro do Analista */}
              <div style={{
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '16px',
                backgroundColor: 'var(--bg-card)'
              }}>
                <h4 style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  margin: '0 0 12px 0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#4CAF50'
                  }} />
                  Analista
                </h4>
                <div style={{
                  fontSize: '13px',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.5
                }}>
                  Analisando requisitos e criando especificações para a tarefa...
                </div>
                <div style={{
                  marginTop: '12px',
                  fontSize: '12px',
                  color: 'var(--text-tertiary)',
                  fontStyle: 'italic'
                }}>
                  Status: Em análise
                </div>
              </div>

              {/* Quadro do Programador */}
              <div style={{
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '16px',
                backgroundColor: 'var(--bg-card)'
              }}>
                <h4 style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  margin: '0 0 12px 0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#2196F3'
                  }} />
                  Programador
                </h4>
                <div style={{
                  fontSize: '13px',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.5
                }}>
                  Aguardando especificações do analista para iniciar implementação...
                </div>
                <div style={{
                  marginTop: '12px',
                  fontSize: '12px',
                  color: 'var(--text-tertiary)',
                  fontStyle: 'italic'
                }}>
                  Status: Aguardando
                </div>
              </div>
            </div>

            {/* Progresso da execução */}
            <div style={{
              marginTop: '20px',
              paddingTop: '16px',
              borderTop: '1px solid var(--border-color)'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px'
              }}>
                <span style={{
                  fontSize: '13px',
                  color: 'var(--text-secondary)'
                }}>
                  Progresso da execução
                </span>
                <span style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--accent-color)'
                }}>
                  25%
                </span>
              </div>
              <div style={{
                height: '6px',
                backgroundColor: 'var(--border-color)',
                borderRadius: '3px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: '25%',
                  height: '100%',
                  backgroundColor: 'var(--accent-color)',
                  borderRadius: '3px',
                  transition: 'width 0.3s ease'
                }} />
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '8px',
                fontSize: '11px',
                color: 'var(--text-tertiary)'
              }}>
                <span>Análise</span>
                <span>Implementação</span>
                <span>Testes</span>
                <span>Finalização</span>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
              {finalSelectedParentTask
                ? `Subtarefas de: ${finalSelectedParentTask.title}`
                : selectedProject
                  ? `Tarefas do Projeto: ${selectedProject.name}`
                  : 'Todas as Tarefas'}
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '8px 0 0' }}>
              {finalSelectedParentTask
                ? finalSelectedParentTask.description
                : selectedProject
                  ? selectedProject.description
                  : 'Gerencie todas as tarefas de todos os projetos em um único lugar'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            {finalSelectedParentTask && (
              <Button
                variant="secondary"
                icon={<FaArrowLeft size={14} />}
                onClick={backToParentHandler}
              >
                Voltar
              </Button>
            )}
            {!finalSelectedParentTask && selectedProject && onBackToProjects && (
              <Button
                variant="secondary"
                icon={<FaArrowLeft size={14} />}
                onClick={onBackToProjects}
              >
                Voltar para Projetos
              </Button>
            )}
            <Button
              variant="primary"
              icon={<FaPlus size={16} />}
              onClick={() => setIsCreatingTask(!isCreatingTask)}
            >
              Nova Tarefa
            </Button>
          </div>
        </div>

        {/* Quadros de Terminal - Analista e Programador */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px',
          marginBottom: '24px'
        }}>
          {/* Quadro do Analista */}
          <div style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            display: 'flex',
            flexDirection: 'column',
            height: '300px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
              paddingBottom: '12px',
              borderBottom: '2px solid #8b5cf6'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: 600,
                color: '#8b5cf6',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span>🧠</span> Analista (Terminal)
              </h3>
              <div style={{
                fontSize: '12px',
                color: 'var(--text-secondary)',
                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                padding: '4px 8px',
                borderRadius: '4px'
              }}>
                Arquitetos AI
              </div>
            </div>

            <div
              ref={analistaRef}
              style={{
                flex: 1,
                overflowY: 'auto',
                backgroundColor: '#1a1a1a',
                borderRadius: '8px',
                padding: '16px',
                fontFamily: 'monospace',
                fontSize: '13px',
                lineHeight: '1.5',
                color: '#e0e0e0',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                position: 'relative'
              }}
            >
              {analistaTerminal ? (
                <>
                  <div style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '10px',
                    color: isTypingAnalista ? '#8b5cf6' : '#666',
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    zIndex: 10
                  }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: isTypingAnalista ? '#8b5cf6' : '#666',
                      animation: isTypingAnalista ? 'pulse 1s infinite' : 'none'
                    }} />
                    {isTypingAnalista ? 'Digitando...' : 'Online'}
                  </div>
                  <div style={{
                    opacity: isTypingAnalista ? 0.9 : 1,
                    transition: 'opacity 0.3s'
                  }}>
                    {analistaTerminal}
                    {isTypingAnalista && (
                      <span style={{
                        display: 'inline-block',
                        width: '8px',
                        height: '16px',
                        backgroundColor: '#8b5cf6',
                        marginLeft: '2px',
                        verticalAlign: 'middle',
                        animation: 'blink 1s infinite'
                      }} />
                    )}
                  </div>
                </>
              ) : (
                <div style={{ color: '#888', fontStyle: 'italic', textAlign: 'center', padding: '40px 0' }}>
                  Nenhum conteúdo do terminal do analista disponível
                </div>
              )}
            </div>

            <div style={{
              fontSize: '11px',
              color: 'var(--text-tertiary)',
              marginTop: '12px',
              textAlign: 'right',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <button
                onClick={() => setAnalistaTerminal('')}
                style={{
                  background: 'none',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-secondary)',
                  fontSize: '10px',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#8b5cf6';
                  e.currentTarget.style.color = '#8b5cf6';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }}
              >
                Limpar terminal
              </button>
              <span>
                {analistaTerminal ? 'Atualizando em tempo real' : 'Aguardando dados'}
              </span>
            </div>
          </div>

          {/* Quadro do Programador */}
          <div style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            display: 'flex',
            flexDirection: 'column',
            height: '300px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
              paddingBottom: '12px',
              borderBottom: '2px solid #10b981'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: 600,
                color: '#10b981',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span>💻</span> Programador (Terminal)
              </h3>
              <div style={{
                fontSize: '12px',
                color: 'var(--text-secondary)',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                padding: '4px 8px',
                borderRadius: '4px'
              }}>
                Programador AI
              </div>
            </div>

            <div
              ref={programadorRef}
              style={{
                flex: 1,
                overflowY: 'auto',
                backgroundColor: '#1a1a1a',
                borderRadius: '8px',
                padding: '16px',
                fontFamily: 'monospace',
                fontSize: '13px',
                lineHeight: '1.5',
                color: '#e0e0e0',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                position: 'relative'
              }}
            >
              {programadorTerminal ? (
                <>
                  <div style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '10px',
                    color: isTypingProgramador ? '#10b981' : '#666',
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    zIndex: 10
                  }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: isTypingProgramador ? '#10b981' : '#666',
                      animation: isTypingProgramador ? 'pulse 1s infinite' : 'none'
                    }} />
                    {isTypingProgramador ? 'Digitando...' : 'Online'}
                  </div>
                  <div style={{
                    opacity: isTypingProgramador ? 0.9 : 1,
                    transition: 'opacity 0.3s'
                  }}>
                    {programadorTerminal}
                    {isTypingProgramador && (
                      <span style={{
                        display: 'inline-block',
                        width: '8px',
                        height: '16px',
                        backgroundColor: '#10b981',
                        marginLeft: '2px',
                        verticalAlign: 'middle',
                        animation: 'blink 1s infinite'
                      }} />
                    )}
                  </div>
                </>
              ) : (
                <div style={{ color: '#888', fontStyle: 'italic', textAlign: 'center', padding: '40px 0' }}>
                  Nenhum conteúdo do terminal do programador disponível
                </div>
              )}
            </div>

            <div style={{
              fontSize: '11px',
              color: 'var(--text-tertiary)',
              marginTop: '12px',
              textAlign: 'right',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <button
                onClick={() => setProgramadorTerminal('')}
                style={{
                  background: 'none',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-secondary)',
                  fontSize: '10px',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#10b981';
                  e.currentTarget.style.color = '#10b981';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }}
              >
                Limpar terminal
              </button>
              <span>
                {programadorTerminal ? 'Atualizando em tempo real' : 'Aguardando dados'}
              </span>
            </div>
          </div>
        </div>

      {/* Filtros e Controles - Apenas quando não está criando tarefa */}
      {!isCreatingTask && (
        <div style={{
          backgroundColor: 'var(--bg-input)',
          padding: '20px',
          borderRadius: '12px',
          marginBottom: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
        }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '20px', alignItems: 'flex-start' }}>
            {/* Barra de Pesquisa */}
            <div style={{ flex: '1', minWidth: '300px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', height: '20px' }}>
                <FaSearch size={14} color="var(--text-secondary)" />
                <label style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>
                  Pesquisar
                </label>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Digite para pesquisar tarefas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 12px 12px 40px',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    height: '44px',
                    boxSizing: 'border-box',
                    backgroundColor: 'var(--bg-input)',
                    color: 'var(--text-primary)'
                  }}
                />
                <FaSearch style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-secondary)',
                  pointerEvents: 'none'
                }} />
              </div>
            </div>

            {/* Filtro de Status */}
            <div style={{ minWidth: '200px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', height: '20px' }}>
                <FaFilter size={14} color="var(--text-secondary)" />
                <label style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>
                  Status
                </label>
              </div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  backgroundColor: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  height: '44px',
                  boxSizing: 'border-box'
                }}
              >
                <option value="">Todos os status</option>
                {statuses.map(status => (
                  <option key={status.id} value={status.id}>
                    {status.name} ({getTaskCountByStatus(status.id)})
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro de Prioridade */}
            <div style={{ minWidth: '200px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', height: '20px' }}>
                <FaFlag size={14} color="var(--text-secondary)" />
                <label style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>
                  Prioridade
                </label>
              </div>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  backgroundColor: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  height: '44px',
                  boxSizing: 'border-box'
                }}
              >
                <option value="">Todas as prioridades</option>
                {priorities.map(priority => (
                  <option key={priority.id} value={priority.id}>
                    {priority.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Mostrar Tarefas Completas */}
            <div style={{ minWidth: '200px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', height: '20px' }}>
                <div style={{ width: '14px', height: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {/* Espaço reservado para ícone alinhado */}
                </div>
                <label style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>
                  Filtro
                </label>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                height: '44px',
                padding: '0 12px',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-input)',
                boxSizing: 'border-box'
              }}>
                <input
                  type="checkbox"
                  id="showCompleted"
                  checked={showCompleted}
                  onChange={(e) => handleToggleShowCompleted(e.target.checked)}
                  style={{
                    transform: 'scale(1.2)',
                    cursor: 'pointer',
                    margin: 0
                  }}
                />
                <label htmlFor="showCompleted" style={{
                  fontSize: '14px',
                  color: '#333',
                  cursor: 'pointer',
                  flex: 1,
                  margin: 0
                }}>
                  Mostrar completas
                </label>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {/* Ordenação */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <FaSortAmountDown size={16} color="var(--text-secondary)" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                style={{
                  padding: '8px 12px',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  fontSize: '14px',
                  backgroundColor: 'white',
                  outline: 'none'
                }}
              >
                <option value="deadline">Ordenar por Prazo</option>
                <option value="priority">Ordenar por Prioridade</option>
                <option value="title">Ordenar por Título</option>
              </select>
              
              {/* Seletor de ordenação por data de criação */}
              <select
                value={sortByCreatedAt}
                onChange={(e) => handleSortByCreatedAtChange(e.target.value as 'newest' | 'oldest')}
                style={{
                  padding: '8px 12px',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  fontSize: '14px',
                  backgroundColor: 'white',
                  outline: 'none'
                }}
              >
                <option value="newest">Primeiro as mais novas</option>
                <option value="oldest">Primeiro as mais antigas</option>
              </select>
            </div>

            {/* Contadores */}
            <div style={{ display: 'flex', gap: '24px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {tasks?.length || 0}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Total de Tarefas</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--success-color)' }}>
                  {tasks?.filter(t => t.isCompleted).length || 0}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Concluídas</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--danger-color)' }}>
                  {tasks?.filter(t => {
                    if (t.isCompleted) return false;
                    const deadlineDate = safeParseDate(t.deadline || '');
                    return deadlineDate && deadlineDate < new Date();
                  }).length || 0}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Atrasadas</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Formulário de Nova Tarefa */}
      {isCreatingTask && (
        <div style={{
          backgroundColor: 'var(--bg-card)',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '24px',
          border: '2px solid var(--accent-color)',
          boxShadow: '0 4px 12px rgba(78, 205, 196, 0.15)'
        }}>
          <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '24px', color: 'var(--accent-color)', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
              <FaPlus size={24} />
              Criar Nova Tarefa
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '8px 0 0 36px' }}>
              Preencha os campos abaixo para adicionar uma nova tarefa ao projeto
            </p>
          </div>

            {/* Exibição de erro */}
            {error && (
              <div style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--danger-color)',
                color: 'var(--danger-color)',
                padding: '12px',
                borderRadius: '6px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px'
              }}>
                <FaExclamationTriangle size={16} />
                <div>
                  <strong style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Erro</strong>
                  <span style={{ fontSize: '13px' }}>{error}</span>
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#333', marginBottom: '8px' }}>
                  Título *
                </label>
                <input
                  type="text"
                  value={newTaskData.title}
                  onChange={(e) => setNewTaskData({ ...newTaskData, title: e.target.value })}
                  placeholder="Digite o título da tarefa"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid var(--accent-color)',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    backgroundColor: 'var(--bg-card)',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>

              {selectedProject ? (
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#333', marginBottom: '8px' }}>
                    Projeto
                  </label>
                  <div style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid var(--accent-color)',
                    borderRadius: '6px',
                    fontSize: '14px',
                    backgroundColor: 'var(--bg-card)',
                    color: 'var(--text-primary)',
                    fontWeight: 500
                  }}>
                    {selectedProject.name}
                    <input type="hidden" value={selectedProject.id} />
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Tarefa será criada neste projeto
                  </p>
                </div>
              ) : (
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#333', marginBottom: '8px' }}>
                    Projeto *
                  </label>
                  <select
                    value={newTaskData.projectId}
                    onChange={(e) => setNewTaskData({ ...newTaskData, projectId: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="">Selecione um projeto</option>
                    {projects.map(project => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#333', marginBottom: '8px' }}>
                  Status
                </label>
                <select
                  value={newTaskData.statusId}
                  onChange={(e) => setNewTaskData({ ...newTaskData, statusId: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                >
                  {statuses.map(status => (
                    <option key={status.id} value={status.id}>
                      {status.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#333', marginBottom: '8px' }}>
                  Prioridade
                </label>
                <select
                  value={newTaskData.priorityId}
                  onChange={(e) => setNewTaskData({ ...newTaskData, priorityId: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                >
                  {priorities.map(priority => (
                    <option key={priority.id} value={priority.id}>
                      {priority.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#333', marginBottom: '8px' }}>
                  Atribuído a
                </label>
                <select
                  value={newTaskData.assignedToId}
                  onChange={(e) => setNewTaskData({ ...newTaskData, assignedToId: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                >
                  {users.length > 0 ? (
                    users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.name}
                      </option>
                    ))
                  ) : (
                    <option value="">Carregando usuários...</option>
                  )}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#333', marginBottom: '8px' }}>
                  Agente *
                </label>
                <select
                  value={newTaskData.agent || ''}
                  onChange={(e) => setNewTaskData({ ...newTaskData, agent: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    fontSize: '14px',
                    backgroundColor: 'white'
                  }}
                >
                  <option value="">Selecione um agente...</option>
                  {agents.length > 0 ? (
                    agents.map((agent: Agent) => (
                      <option key={agent.id} value={agent.id}>
                        {agent.id} {agent.identity?.model ? `(${agent.identity.model})` : ''}
                      </option>
                    ))
                  ) : (
                    <option value="">Carregando agentes...</option>
                  )}
                </select>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Agente responsável pelo processamento da tarefa
                </p>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#333', marginBottom: '8px' }}>
                  Prazo
                </label>
                <input
                  type="datetime-local"
                  value={newTaskData.deadline ? safeParseDate(newTaskData.deadline)?.toISOString().slice(0, 16) || '' : ''}
                  onChange={(e) => {
                    const dateValue = e.target.value;
                    if (dateValue) {
                      const date = safeParseDate(dateValue + ':00.000Z'); // Adiciona segundos para formato ISO
                      if (date) {
                        setNewTaskData({ ...newTaskData, deadline: date.toISOString() });
                      } else {
                        setNewTaskData({ ...newTaskData, deadline: '' });
                      }
                    } else {
                      setNewTaskData({ ...newTaskData, deadline: '' });
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Data e hora limite para conclusão
                </p>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#333', marginBottom: '8px' }}>
                  Tarefa Pai (opcional - define hierarquia)
                </label>
                <select
                  value={newTaskData.parentTaskId || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    setNewTaskData({
                      ...newTaskData,
                      parentTaskId: value === '' ? null : value
                    });
                  }}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                >
                  <option value="">Nenhuma (tarefa independente)</option>
                  {tasks
                    .filter(task => !task.isCompleted && task.projectId === newTaskData.projectId)
                    .map(task => (
                      <option key={task.id} value={task.id}>
                        {task.title || 'Sem título'} {task.isCompleted ? '(Concluída)' : ''}
                      </option>
                    ))
                  }
                </select>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Selecione uma tarefa da qual esta tarefa depende
                </p>
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#333', marginBottom: '8px' }}>
                  Descrição
                </label>
                <textarea
                  value={newTaskData.description}
                  onChange={(e) => setNewTaskData({ ...newTaskData, description: e.target.value })}
                  placeholder="Descreva a tarefa..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
              <button
                onClick={() => setIsCreatingTask(false)}
                style={{
                  padding: '12px 24px',
                  backgroundColor: 'white',
                  color: 'var(--text-secondary)',
                  border: '2px solid var(--border-color)',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--text-secondary)';
                  e.currentTarget.style.color = '#333';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateTask}
                disabled={!newTaskData.title || !newTaskData.projectId || !newTaskData.statusId || !newTaskData.priorityId || !newTaskData.assignedToId || !newTaskData.deadline || !newTaskData.agent}
                style={{
                  padding: '12px 24px',
                  backgroundColor: (newTaskData.title && newTaskData.projectId && newTaskData.statusId && newTaskData.priorityId && newTaskData.assignedToId && newTaskData.deadline && newTaskData.agent) ? 'var(--accent-color)' : 'var(--text-secondary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: (newTaskData.title && newTaskData.projectId && newTaskData.statusId && newTaskData.priorityId && newTaskData.assignedToId && newTaskData.deadline && newTaskData.agent) ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s',
                  boxShadow: (newTaskData.title && newTaskData.projectId && newTaskData.statusId && newTaskData.priorityId && newTaskData.assignedToId && newTaskData.deadline && newTaskData.agent) ? '0 4px 12px rgba(78, 205, 196, 0.3)' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (newTaskData.title && newTaskData.projectId && newTaskData.statusId && newTaskData.priorityId && newTaskData.assignedToId && newTaskData.deadline && newTaskData.agent) {
                    e.currentTarget.style.backgroundColor = 'var(--accent-hover)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(78, 205, 196, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (newTaskData.title && newTaskData.projectId && newTaskData.statusId && newTaskData.priorityId && newTaskData.assignedToId && newTaskData.deadline && newTaskData.agent) {
                    e.currentTarget.style.backgroundColor = 'var(--accent-color)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(78, 205, 196, 0.3)';
                  }
                }}
              >
                <FaPlus style={{ marginRight: '8px' }} />
                Criar Tarefa
                {(!newTaskData.statusId || !newTaskData.priorityId || !newTaskData.assignedToId || !newTaskData.agent) && ' (carregando...)'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Lista de Tarefas */}
      <div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#333' }}>
            Tarefas ({filteredTasks.length})
          </h2>
          {!selectedProject && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <FaProjectDiagram size={16} color="var(--text-secondary)" />
              <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                Mostrando tarefas de {projects.length} projetos
              </span>
            </div>
          )}
        </div>

        {sortedTasks.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '48px',
            backgroundColor: 'var(--bg-input)',
            borderRadius: '12px',
            color: 'var(--text-secondary)'
          }}>
            <p style={{ fontSize: '16px', marginBottom: '8px' }}>
              {searchTerm || selectedStatus || selectedPriority
                ? 'Nenhuma tarefa encontrada com os filtros atuais.'
                : selectedProject
                ? 'Nenhuma tarefa encontrada neste projeto.'
                : 'Nenhuma tarefa encontrada.'}
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedStatus('');
                setSelectedPriority('');
              }}
              style={{
                padding: '10px 20px',
                backgroundColor: 'var(--accent-color)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-color)'}
            >
              Limpar Filtros
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            {sortedTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                users={users}
                statuses={statuses}
                priorities={priorities}
                projects={projects}
                onTaskClick={(t) => onTaskSelect(t)}
                onViewSubtasks={onViewSubtasks !== NOOP_FN ? onViewSubtasks : handleViewSubtasks}
                onUpdateTask={handleUpdateTask}
                onDeleteTask={handleDeleteTask}
                onToggleCompletion={handleToggleCompletion}
                agents={agents}
              />
            ))}
          </div>
        )}
        {/* Back to Top Button */}
        {showBackToTop && (
          <button
            onClick={scrollToTop}
            style={{
              position: 'fixed',
              bottom: '30px',
              right: '30px',
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              backgroundColor: 'var(--accent-color)',
              color: 'white',
              border: 'none',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              zIndex: 1000,
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--accent-hover)';
              e.currentTarget.style.transform = 'scale(1.1)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--accent-color)';
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            }}
          >
            <FaArrowUp />
          </button>
        )}
      </div>


    </div>
  );
};


export default TaskList;
