// @ts-nocheck
import React, { useState } from 'react';
import api from '../services/api';
import { Task, User, Status, Priority, Project, Agent } from '../types';
import TaskCard from './TaskCard';
import Card from './shared/Card';
import Button from './shared/Button';
import { FaFilter, FaSearch, FaSortAmountDown, FaFlag, FaPlus, FaProjectDiagram, FaArrowLeft, FaExclamationTriangle , FaArrowUp} from 'react-icons/fa';
import { safeParseDate } from '../utils/dateUtils';

interface TaskListProps {
  tasks: Task[];
  users: User[];
  statuses: Status[];
  priorities: Priority[];
  projects: Project[];
  agents?: Agent[];
  selectedProject: Project | null;
  onTaskSelect: (task: Task) => void;
  onBackToProjects?: () => void;
  onCreateTask?: (taskData: Partial<Task>) => Promise<Task>;
  onUpdateTask?: (id: string, taskData: Partial<Task>) => Promise<Task>;
  onDeleteTask?: (id: string) => Promise<void>;
  onToggleCompletion?: (id: string) => Promise<void>;
  showCompleted?: boolean;
  onToggleShowCompleted?: (show: boolean) => void;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks, 
  users, 
  statuses, 
  priorities, 
  projects,
  agents = [] as Agent[],
  selectedProject,
  onTaskSelect,
  onBackToProjects,
  onCreateTask,
  onUpdateTask,
  onDeleteTask,
  onToggleCompletion,
  showCompleted: propShowCompleted = false,
  onToggleShowCompleted
}) => {
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

  // Handle scroll to show/hide back to top button
  React.useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  const [newTaskData, setNewTaskData] = useState<Partial<Task>>({
    title: '',
    description: '',
    projectId: selectedProject?.id || '',
    statusId: statuses.find(s => s.name === 'Pendente')?.id || statuses[0]?.id || '',
    priorityId: priorities.find(p => p.name === 'Média')?.id || priorities[1]?.id || '',
    assignedToId: users.length > 0 ? users[0]?.id || '' : '',
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 dias a partir de agora
    agent: typeof window !== 'undefined' ? localStorage.getItem('lastUsedAgent') || '' : '',
    parentTaskId: null
  });

  // Update defaults when data loads
  React.useEffect(() => {
    const defaultStatus = statuses.find(s => s.name === 'Pendente')?.id || statuses[0]?.id;
    const defaultPriority = priorities.find(p => p.name === 'Média')?.id || priorities[1]?.id;
    const defaultUser = users[0]?.id;
    
    setNewTaskData(prev => ({
      ...prev,
      statusId: defaultStatus || prev.statusId || '',
      priorityId: defaultPriority || prev.priorityId || '',
      assignedToId: defaultUser || prev.assignedToId || ''
    }));
  }, [statuses, priorities, users]);

  // Update projectId when selectedProject changes
  React.useEffect(() => {
    if (selectedProject) {
      setNewTaskData(prev => ({
        ...prev,
        projectId: selectedProject.id
      }));
    }
  }, [selectedProject]);

  // Load last used agent from localStorage
  React.useEffect(() => {
    const lastModel = localStorage.getItem('lastUsedAgent');
    if (lastModel) {
      setNewTaskData(prev => ({
        ...prev,
        agent: lastModel
      }));
    }
  }, []);

  const shouldFilterByCompletion = !onToggleShowCompleted;
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = (task.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (task.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !selectedStatus || task.statusId === selectedStatus;
    const matchesPriority = !selectedPriority || task.priorityId === selectedPriority;
    const matchesCompletion = shouldFilterByCompletion ? (showCompleted ? true : !task.isCompleted) : true;

    return matchesSearch && matchesStatus && matchesPriority && matchesCompletion;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    switch (sortBy) {
      case 'deadline':
        const dateA = a.deadline ? safeParseDate(a.deadline)?.getTime() : Infinity;
        const dateB = b.deadline ? safeParseDate(b.deadline)?.getTime() : Infinity;
        return (dateA || Infinity) - (dateB || Infinity);
      case 'priority':
        const priorityA = priorities.find(p => p.id === a.priorityId)?.weight || 0;
        const priorityB = priorities.find(p => p.id === b.priorityId)?.weight || 0;
        return priorityB - priorityA;
      case 'title':
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project ? project.name : 'Projeto não encontrado';
  };

  const getTaskCountByStatus = (statusId: string) => {
    return tasks.filter(task => task.statusId === statusId).length;
  };

  const handleCreateTask = async () => {

    
    if (!onCreateTask || !newTaskData.title || !newTaskData.projectId || !newTaskData.deadline) {
      console.error('❌ Missing required data for task creation');
      setError('Preencha o título da tarefa e o prazo.');
      return;
    }

    setError(null); // Limpa erros anteriores
    
    try {
      // Debug: log what we're sending

      
      const taskData = {
        ...newTaskData,
        // createdById will be set by the parent component (App.tsx)
        position: tasks.length,
        // Ensure agent is null if empty string
        agent: newTaskData.agent || null
      };


      
      await onCreateTask(taskData);
      
      // Save the selected agent to localStorage
      if (newTaskData.agent) {
        localStorage.setItem('lastUsedAgent', newTaskData.agent);
      }
      
      // Reset form with current values (not empty strings)
      const defaultStatus = statuses.find(s => s.name === 'Pendente')?.id || statuses[0]?.id || '';
      const defaultPriority = priorities.find(p => p.name === 'Média')?.id || priorities[1]?.id || '';
      const defaultUser = users[0]?.id || '';
      
      setNewTaskData({
        title: '',
        description: '',
        projectId: selectedProject?.id || '',
        statusId: defaultStatus,
        priorityId: defaultPriority,
        assignedToId: defaultUser,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 dias a partir de agora
        agent: newTaskData.agent || '' // Keep the same model for next task
      });
      setIsCreatingTask(false);
    } catch (error: any) {
      console.error('❌ Failed to create task:', error);
      
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

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
              {selectedProject ? `Tarefas do Projeto: ${selectedProject.name}` : 'Todas as Tarefas'}
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '8px 0 0' }}>
              {selectedProject 
                ? selectedProject.description
                : 'Gerencie todas as tarefas de todos os projetos em um único lugar'}
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            {selectedProject && onBackToProjects && (
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
              <FaSortAmountDown size={16} color="#666" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px',
                  backgroundColor: '#fff',
                  outline: 'none'
                }}
              >
                <option value="deadline">Ordenar por Prazo</option>
                <option value="priority">Ordenar por Prioridade</option>
                <option value="title">Ordenar por Título</option>
              </select>
            </div>

            {/* Contadores */}
            <div style={{ display: 'flex', gap: '24px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {tasks.length}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Total de Tarefas</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--success-color)' }}>
                  {tasks.filter(t => t.isCompleted).length}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Concluídas</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--danger-color)' }}>
                  {tasks.filter(t => {
                    if (t.isCompleted) return false;
                    const deadlineDate = safeParseDate(t.deadline || '');
                    return deadlineDate && deadlineDate < new Date();
                  }).length}
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
          border: '2px solid #4ECDC4',
          boxShadow: '0 4px 12px rgba(78, 205, 196, 0.15)'
        }}>
          <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '24px', color: '#4ECDC4', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
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
                backgroundColor: '#FFE5E5',
                border: '1px solid #FF6B6B',
                color: '#D32F2F',
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
                    border: '2px solid #4ECDC4',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    backgroundColor: '#f0f9f8',
                    color: '#2a7c74'
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
                    border: '1px solid #4ECDC4',
                    borderRadius: '6px',
                    fontSize: '14px',
                    backgroundColor: '#f0f9f8',
                    color: '#2a7c74',
                    fontWeight: 500
                  }}>
                    {selectedProject.name}
                    <input type="hidden" value={selectedProject.id} />
                  </div>
                  <p style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
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
                      border: '1px solid #ddd',
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
                    border: '1px solid #ddd',
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
                    border: '1px solid #ddd',
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
                    border: '1px solid #ddd',
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
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px',
                    backgroundColor: '#fff'
                  }}
                >
                  {agents.length > 0 ? (
                    agents.map((agent) => (
                      <option key={agent.id} value={agent.id}>
                        {agent.id} {agent.identity?.model ? `(${agent.identity.model})` : ''}
                      </option>
                    ))
                  ) : (
                    <option value="">Carregando agentes...</option>
                  )}
                </select>
                <p style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
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
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
                <p style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                  Data e hora limite para conclusão
                </p>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#333', marginBottom: '8px' }}>
                  Depende de (opcional)
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
                    border: '1px solid #ddd',
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
                <p style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
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
                    border: '1px solid #ddd',
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
                  backgroundColor: '#fff',
                  color: '#666',
                  border: '2px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#999';
                  e.currentTarget.style.color = '#333';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#ddd';
                  e.currentTarget.style.color = '#666';
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateTask}
                disabled={!newTaskData.title || !newTaskData.projectId || !newTaskData.statusId || !newTaskData.priorityId || !newTaskData.assignedToId || !newTaskData.deadline || !newTaskData.agent}
                style={{
                  padding: '12px 24px',
                  backgroundColor: (newTaskData.title && newTaskData.projectId && newTaskData.statusId && newTaskData.priorityId && newTaskData.assignedToId && newTaskData.deadline && newTaskData.agent) ? '#4ECDC4' : '#ccc',
                  color: '#fff',
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
                    e.currentTarget.style.backgroundColor = '#3db8af';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(78, 205, 196, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (newTaskData.title && newTaskData.projectId && newTaskData.statusId && newTaskData.priorityId && newTaskData.assignedToId && newTaskData.deadline && newTaskData.agent) {
                    e.currentTarget.style.backgroundColor = '#4ECDC4';
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

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Ordenação */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <FaSortAmountDown size={16} color="#666" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              style={{
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
                backgroundColor: '#fff',
                outline: 'none'
              }}
            >
              <option value="deadline">Ordenar por Prazo</option>
              <option value="priority">Ordenar por Prioridade</option>
              <option value="title">Ordenar por Título</option>
            </select>
          </div>

          {/* Contadores */}
          <div style={{ display: 'flex', gap: '24px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#333' }}>
                {tasks.length}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>Total de Tarefas</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#06D6A0' }}>
                {tasks.filter(t => t.isCompleted).length}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>Concluídas</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#FF6B6B' }}>
                {tasks.filter(t => {
                  if (t.isCompleted) return false;
                  const deadlineDate = safeParseDate(t.deadline || '');
                  return deadlineDate && deadlineDate < new Date();
                }).length}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>Atrasadas</div>
            </div>
          </div>
        </div>
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
              <FaProjectDiagram size={16} color="#666" />
              <span style={{ fontSize: '14px', color: '#666' }}>
                Mostrando tarefas de {projects.length} projetos
              </span>
            </div>
          )}
        </div>

        {sortedTasks.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '48px',
            backgroundColor: '#f8f9fa',
            borderRadius: '12px',
            color: '#666'
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
                onTaskClick={onTaskSelect}
                onUpdateTask={onUpdateTask}
                onDeleteTask={onDeleteTask}
                onToggleCompletion={onToggleCompletion}
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
              backgroundColor: '#4ECDC4',
              color: '#fff',
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
              e.currentTarget.style.backgroundColor = '#3db8af';
              e.currentTarget.style.transform = 'scale(1.1)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#4ECDC4';
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
