// @ts-nocheck
import React, { useState } from 'react';
import './TaskDetail.css';
import api from '../services/api';
import { Task, User, Status, Priority, Project, Agent } from '../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { safeParseDate, safeFormatDate } from '../utils/dateUtils';
import { 
  FaUser, 
  FaCalendarAlt, 
  FaFlag, 
  FaListAlt, 
  FaProjectDiagram, 
  FaComment, 
  FaPaperclip,
  FaArrowLeft,
  FaCheckCircle,
  FaExclamationTriangle,
  FaEdit,
  FaTrash,
  FaSave,
  FaTimes,
  FaSync,
  FaHistory,
  FaClock,
  FaArrowUp,
  FaFileAlt} from 'react-icons/fa';
import RecurrenceConfig from './RecurrenceConfig';
import CommentsSection from './CommentsSection';
import TaskHistorySection from './TaskHistorySection';
import TaskExecutionLog from './TaskExecutionLog';

interface TaskDetailProps {
  task: Task;
  tasks: Task[];
  users: User[];
  statuses: Status[];
  priorities: Priority[];
  projects: Project[];
  currentUser: User | null;
  onBack: () => void;
  onUpdateTask?: (id: string, taskData: Partial<Task>) => Promise<Task>;
  onDeleteTask?: (id: string) => Promise<void>;
  onToggleCompletion?: (id: string) => Promise<void>;
}

const TaskDetail: React.FC<TaskDetailProps> = ({
  task,
  tasks,
  users,
  statuses,
  priorities,
  projects,
  currentUser,
  onBack,
  onUpdateTask,
  onDeleteTask,
  onToggleCompletion
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("comments");
  const [editedTask, setEditedTask] = useState<Partial<Task>>({ ...task });
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);

  const getAssignedUser = () => users.find(user => user.id === task.assignedToId);
  const getStatus = () => statuses.find(status => status.id === task.statusId);
  const getPriority = () => priorities.find(priority => priority.id === task.priorityId);
  const getCreator = () => users.find(user => user.id === task.createdById);
  const getProject = () => projects.find(project => project.id === task.projectId);

  const assignedUser = getAssignedUser();
  const status = getStatus();
  const priority = getPriority();
  const creator = getCreator();
  const project = getProject();

  const deadlineDate = safeParseDate(task.deadline);
  const isOverdue = !task.isCompleted && deadlineDate && deadlineDate < new Date();
  const formattedDeadline = safeFormatDate(task.deadline, "dd 'de' MMMM 'de' yyyy 'às' HH:mm") || 'Não definido';
  const formattedCreatedAt = safeFormatDate(task.createdAt, "dd 'de' MMMM 'de' yyyy 'às' HH:mm") || 'Data inválida';
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

  // Load agents from API
  React.useEffect(() => {
    const loadAgents = async () => {
      try {
        const data = await api.request('/agents');
        // Store full agent objects to access model information
        const agentsList = data.data ? data.data : [];
        setAgents(agentsList);
      } catch (error) {
        console.error('Error loading agents:', error);
      }
    };
    loadAgents();
  }, []);

  // Set default agent based on project's programadorContratado when project changes
  React.useEffect(() => {
    if (project && project.programadorContratado && !task.agent) {
      // If project has a programadorContratado and task doesn't have an agent yet
      // Set it as the default agent
      setEditedTask(prev => ({
        ...prev,
        agent: project.programadorContratado
      }));
    } else if (!task.agent && typeof window !== 'undefined') {
      // Fallback to last used agent from localStorage if no programadorContratado
      const lastUsedAgent = localStorage.getItem('lastUsedAgent');
      if (lastUsedAgent) {
        setEditedTask(prev => ({
          ...prev,
          agent: lastUsedAgent
        }));
      }
    }
  }, [project, task.agent]);

  const handleSave = async () => {
    if (!onUpdateTask) return;
    
    setIsSaving(true);
    setError(null); // Limpa erros anteriores
    
    try {
      // Cria um objeto apenas com os campos que foram alterados
      const updateData: Partial<Task> = {};
      
      // Compara cada campo com o valor original
      if (editedTask.title !== undefined && editedTask.title !== task.title) {
        updateData.title = editedTask.title;
      }
      if (editedTask.description !== undefined && editedTask.description !== task.description) {
        updateData.description = editedTask.description;
      }
      if (editedTask.deadline !== undefined && editedTask.deadline !== task.deadline) {
        updateData.deadline = editedTask.deadline;
      }
      if (editedTask.statusId !== undefined && editedTask.statusId !== task.statusId) {
        updateData.statusId = editedTask.statusId;
      }
      if (editedTask.priorityId !== undefined && editedTask.priorityId !== task.priorityId) {
        updateData.priorityId = editedTask.priorityId;
      }
      // SEMPRE envia assignedToId se estiver definido e não for undefined, mesmo que seja o mesmo valor
      // Isso corrige o problema onde o usuário seleciona a mesma pessoa mas o frontend não envia
      if (editedTask.assignedToId !== undefined && editedTask.assignedToId !== '') {
        updateData.assignedToId = editedTask.assignedToId;
      }
      if (editedTask.projectId !== undefined && editedTask.projectId !== task.projectId) {
        updateData.projectId = editedTask.projectId;
      }
      if (editedTask.agent !== undefined && editedTask.agent !== task.agent) {
        updateData.agent = editedTask.agent;
      }
      
      // Campo parentTaskId - precisa ser sempre enviado quando está definido
      // porque o usuário pode estar alterando a dependência
      if (editedTask.parentTaskId !== undefined) {
        updateData.parentTaskId = editedTask.parentTaskId;
      }
      
      // Campos de recorrência - precisam ser sempre enviados quando estão definidos
      // porque o usuário pode estar ativando ou desativando a recorrência
      if (editedTask.isRecurring !== undefined) {
        updateData.isRecurring = editedTask.isRecurring;
      }
      if (editedTask.recurrenceType !== undefined) {
        updateData.recurrenceType = editedTask.recurrenceType;
      }
      if (editedTask.recurrenceTimes !== undefined) {
        updateData.recurrenceTimes = editedTask.recurrenceTimes;
      }
      if (editedTask.recurrenceDays !== undefined) {
        updateData.recurrenceDays = editedTask.recurrenceDays;
      }
      
      // Só envia se houver algo para atualizar
      if (Object.keys(updateData).length > 0) {
        await onUpdateTask(task.id, updateData);
        
        // Save the agent to localStorage if it was changed
        if (updateData.agent !== undefined && updateData.agent !== null) {
          localStorage.setItem('lastUsedAgent', updateData.agent);
        }
        
        setIsEditing(false);
      } else {
        setIsEditing(false);
      }
    } catch (error: any) {
      console.error('Failed to update task:', error);
      
      // Extrai mensagem de erro amigável
      let errorMessage = 'Erro ao salvar tarefa.';
      
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
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!onDeleteTask) return;
    
    if (window.confirm('Tem certeza que deseja excluir esta tarefa? Esta ação não pode ser desfeita.')) {
      setIsDeleting(true);
      setError(null); // Limpa erros anteriores
      
      try {
        await onDeleteTask(task.id);
        onBack();
      } catch (error: any) {
        console.error('Failed to delete task:', error);
        
        // Extrai mensagem de erro amigável
        let errorMessage = 'Erro ao excluir tarefa.';
        
        if (error.message) {
          errorMessage = error.message;
        }
        
        setError(errorMessage);
        setIsDeleting(false);
      }
    }
  };

  const handleToggleCompletion = async () => {
    if (onToggleCompletion) {
      setError(null); // Limpa erros anteriores
      
      try {
        await onToggleCompletion(task.id);
      } catch (error: any) {
        console.error('Failed to toggle task completion:', error);
        
        // Extrai mensagem de erro amigável
        let errorMessage = 'Erro ao alterar status da tarefa.';
        
        if (error.message) {
          errorMessage = error.message;
        }
        
        setError(errorMessage);
      }
    }
  };

  const handleCancelEdit = () => {
    setEditedTask({ ...task });
    setIsEditing(false);
    setError(null); // Limpa erros ao cancelar
  };

  // Log quando entra no modo de edição
  React.useEffect(() => {
    if (isEditing) {
      console.log('✏️ Entrou no modo de edição');
      console.log('✏️ editedTask no início da edição:', editedTask);
      console.log('✏️ assignedToId no início da edição:', editedTask.assignedToId);
    }
  }, [isEditing]);

  return (
    <div className="task-detail-container">
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <button
          onClick={onBack}
          className="back-button margin-bottom-20"
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3f6183'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-card)'}
        >
          <FaArrowLeft size={14} />
          Voltar para lista
        </button>

        {/* Exibição de erro */}
        {error && (
          <div style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--danger-color)',
            color: 'var(--danger-color)',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px'
          }}>
            <FaExclamationTriangle size={20} />
            <div>
              <strong style={{ display: 'block', marginBottom: '4px' }}>Erro</strong>
              <span>{error}</span>
            </div>
          </div>
        )}

        <div className="card-white">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              {isEditing ? (
                <input
                  type="text"
                  value={editedTask.title || ''}
                  onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                  style={{
                    fontSize: '24px',
                    fontWeight: 700,
                    color: '#333',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    width: '100%',
                    marginBottom: '12px'
                  }}
                />
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <h1 style={{ 
                    fontSize: '24px', 
                    fontWeight: 700, 
                    color: '#333',
                    textDecoration: task.isCompleted ? 'line-through' : 'none',
                    opacity: task.isCompleted ? 0.7 : 1
                  }}>
                    {task.title || 'Sem título'}
                  </h1>
                  <button
                    onClick={handleToggleCompletion}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: 'var(--bg-input)',
                      color: task.isCompleted ? 'white' : '#333',
                      border: `1px solid ${task.isCompleted ? 'var(--success-color)' : 'var(--border-color)'}`,
                      borderRadius: '6px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <FaCheckCircle size={12} />
                    {task.isCompleted ? 'Concluída' : 'Marcar como Concluída'}
                  </button>
                </div>
              )}

              {project && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <FaProjectDiagram size={16} color="var(--text-secondary)" />
                  <span style={{ fontSize: '16px', color: 'var(--text-secondary)', fontWeight: 500 }}>
                    Projeto: {project.name}
                  </span>
                </div>
              )}

              {isEditing ? (
                <textarea
                  value={editedTask.description || ''}
                  onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    fontSize: '14px',
                    resize: 'vertical',
                    marginBottom: '16px'
                  }}
                  placeholder="Descreva a tarefa..."
                />
              ) : (
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#333', marginBottom: '8px' }}>
                    Descrição
                  </h3>
                  <p style={{ 
                    fontSize: '14px', 
                    color: 'var(--text-secondary)', 
                    lineHeight: 1.6,
                    backgroundColor: 'var(--bg-input)',
                    padding: '16px',
                    borderRadius: '8px'
                  }}>
                    {task.description || 'Esta tarefa não possui descrição.'}
                  </p>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              {!isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    style={{
                      padding: '10px 16px',
                      backgroundColor: 'var(--accent-color)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <FaEdit size={14} />
                    Editar
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    style={{
                      padding: '10px 16px',
                      backgroundColor: isDeleting ? 'var(--text-secondary)' : 'var(--danger-color)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      cursor: isDeleting ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <FaTrash size={14} />
                    {isDeleting ? 'Excluindo...' : 'Excluir'}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleCancelEdit}
                    style={{
                      padding: '10px 16px',
                      backgroundColor: 'var(--bg-input)',
                      color: '#333',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      fontSize: '14px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <FaTimes size={14} />
                    Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    style={{
                      padding: '10px 16px',
                      backgroundColor: isSaving ? 'var(--text-secondary)' : 'var(--success-color)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      cursor: isSaving ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <FaSave size={14} />
                    {isSaving ? 'Salvando...' : 'Salvar'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Task Details Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '24px',
        marginBottom: '32px'
      }}>
        {/* Status Card */}
        <div className="card-section">
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#333', marginBottom: '16px' }}>
            Status
          </h3>
          {isEditing ? (
            <select
              value={editedTask.statusId || ''}
              onChange={(e) => setEditedTask({ ...editedTask, statusId: e.target.value })}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            >
              {statuses.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                backgroundColor: status?.colorCode || 'var(--text-secondary)'
              }} />
              <span style={{ fontSize: '16px', fontWeight: 500, color: '#333' }}>
                {status?.name || 'Desconhecido'}
              </span>
            </div>
          )}
        </div>

        {/* Priority Card */}
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#333', marginBottom: '16px' }}>
            Prioridade
          </h3>
          {isEditing ? (
            <select
              value={editedTask.priorityId || ''}
              onChange={(e) => setEditedTask({ ...editedTask, priorityId: e.target.value })}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            >
              {priorities.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <FaFlag size={16} color={
                (priority?.weight || 0) >= 3 ? 'var(--danger-color)' : 
                (priority?.weight || 0) === 2 ? 'var(--accent-color)' : 'var(--accent-color)'
              } />
              <span style={{ fontSize: '16px', fontWeight: 500, color: '#333' }}>
                {priority?.name || 'Desconhecida'}
              </span>
            </div>
          )}
        </div>

        {/* Deadline Card */}
        <div className="card-section-overdue">
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#333', marginBottom: '16px' }}>
            Prazo
            {isOverdue && (
              <span style={{ color: 'var(--danger-color)', marginLeft: '8px', fontSize: '14px' }}>
                (Atrasado)
              </span>
            )}
          </h3>
          {isEditing ? (
            <input
              type="datetime-local"
              value={editedTask.deadline ? safeParseDate(editedTask.deadline)?.toISOString().slice(0, 16) || '' : ''}
              onChange={(e) => {
                // Quando o usuário seleciona uma data/hora, precisamos garantir o formato correto
                const dateValue = e.target.value;
                if (dateValue) {
                  // Adiciona segundos e timezone para formato ISO 8601 completo
                  const date = safeParseDate(dateValue + ':00.000Z');
                  if (date) {
                    setEditedTask({ ...editedTask, deadline: date.toISOString() });
                  } else {
                    setEditedTask({ ...editedTask, deadline: '' });
                  }
                } else {
                  setEditedTask({ ...editedTask, deadline: '' });
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
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <FaCalendarAlt size={16} color={isOverdue ? 'var(--danger-color)' : 'var(--text-secondary)'} />
              <div>
                <div style={{ fontSize: '16px', fontWeight: 500, color: isOverdue ? 'var(--danger-color)' : '#333' }}>
                  {formattedDeadline}
                </div>
                {isOverdue && (
                  <div style={{ fontSize: '12px', color: 'var(--danger-color)', marginTop: '4px' }}>
                    <FaExclamationTriangle size={12} /> Esta tarefa está atrasada
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Recurrence Card */}
        <div className="card-section-recurring">
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#333', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaSync size={14} />
            Recorrência
            {task.isRecurring && (
              <span style={{ fontSize: '12px', backgroundColor: 'var(--accent-color)', color: 'white', padding: '2px 8px', borderRadius: '12px', marginLeft: '8px' }}>
                Ativa
              </span>
            )}
          </h3>
          
          {isEditing ? (
            <RecurrenceConfig
              recurrenceType={editedTask.recurrenceType}
              recurrenceTimes={editedTask.recurrenceTimes}
              recurrenceDays={editedTask.recurrenceDays}
              onChange={(config) => {
                setEditedTask({
                  ...editedTask,
                  isRecurring: config.isRecurring,
                  recurrenceType: config.recurrenceType,
                  recurrenceTimes: config.recurrenceTimes,
                  recurrenceDays: config.recurrenceDays
                });
              }}
            />
          ) : task.isRecurring ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaSync size={14} color="var(--accent-color)" />
                <span style={{ fontWeight: 500 }}>
                  {task.recurrenceType === 'daily' && 'Diária'}
                  {task.recurrenceType === 'weekly' && 'Semanal'}
                  {task.recurrenceType === 'monthly' && 'Mensal'}
                </span>
              </div>
              
              {task.recurrenceTimes && Array.isArray(task.recurrenceTimes) && task.recurrenceTimes.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FaClock size={14} color="var(--text-secondary)" />
                  <span>Horários: {task.recurrenceTimes.join(', ')}</span>
                </div>
              )}
              
              {task.recurrenceType === 'weekly' && task.recurrenceDays && task.recurrenceDays.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FaCalendarAlt size={14} color="var(--text-secondary)" />
                  <span>
                    Dias: {task.recurrenceDays.map(d => {
                      const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
                      return days[d];
                    }).join(', ')}
                  </span>
                </div>
              )}
              
              {task.lastExecutedAt && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FaHistory size={14} color="var(--text-secondary)" />
                  <span>
                    Última execução: {safeFormatDate(task.lastExecutedAt, 'dd/MM/yyyy HH:mm')}
                  </span>
                </div>
              )}
              
              {task.nextExecutionAt && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FaCalendarAlt size={14} color="var(--accent-color)" />
                  <span style={{ fontWeight: 500 }}>
                    Próxima execução: {safeFormatDate(task.nextExecutionAt, 'dd/MM/yyyy HH:mm')}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>
              Esta tarefa não é recorrente
            </div>
          )}
        </div>

        {/* Assigned To Card */}
        <div className="card-section">
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#333', marginBottom: '16px' }}>
            Atribuído a
          </h3>
          {isEditing ? (
            <select
              value={editedTask.assignedToId || ''}
              onChange={(e) => {
                const newValue = e.target.value;
                // Se for string vazia, define como undefined
                const assignedToId = newValue === '' ? undefined : newValue;
                setEditedTask({ ...editedTask, assignedToId });
              }}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            >
              <option value="">Selecione um usuário</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {assignedUser?.avatarUrl ? (
                <img 
                  src={assignedUser.avatarUrl} 
                  alt={assignedUser.name}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    objectFit: 'cover'
                  }}
                />
              ) : (
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--bg-card)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <FaUser size={20} color="var(--accent-color)" />
                </div>
              )}
              <div>
                <div style={{ fontSize: '16px', fontWeight: 500, color: '#333' }}>
                  {assignedUser?.name || 'Não atribuído'}
                </div>
                {assignedUser && (
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    {assignedUser.email}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Model Card */}
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#333', marginBottom: '16px' }}>
            Agente
          </h3>
          {isEditing ? (
            <select
              value={editedTask.agent || ''}
              onChange={(e) => {
                const newValue = e.target.value;
                // Se for string vazia, define como undefined
                const agent = newValue === '' ? undefined : newValue;
                setEditedTask({ ...editedTask, agent });
              }}
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
              {agents.length > 0 ? (
                agents.map((agent, index) => (
                  <option key={index} value={agent.id}>
                    {agent.identity?.name || agent.id} {agent.identity?.model ? `(${agent.identity.model})` : ''}
                  </option>
                ))
              ) : (
                <option value="">Carregando agentes...</option>
              )}
            </select>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: 'var(--bg-card)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--accent-color)' }}>AI</div>
              </div>
              <div>
                <div style={{ fontSize: '16px', fontWeight: 500, color: '#333' }}>
                  {(() => {
                    const agentObj = agents.find(a => a.id === task.agent);
                    return agentObj 
                      ? `${agentObj.identity?.name || agentObj.id}${agentObj.identity?.model ? ` (${agentObj.identity.model})` : ''}`
                      : task.agent || 'Não definido';
                  })()}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Agente para processamento
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Parent Task Card */}
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#333', marginBottom: '16px' }}>
            Depende de
          </h3>
          {isEditing ? (
            <select
              value={editedTask.parentTaskId || ''}
              onChange={(e) => {
                const newValue = e.target.value;
                // Se for string vazia, define como null
                const parentTaskId = newValue === '' ? null : newValue;
                setEditedTask({ ...editedTask, parentTaskId });
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
                .filter(t => !t.isCompleted && t.projectId === task.projectId && t.id !== task.id)
                .map(t => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))
              }
            </select>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: 'var(--bg-card)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--accent-color)' }}>↗</div>
              </div>
              <div>
                <div style={{ fontSize: '16px', fontWeight: 500, color: '#333' }}>
                  {task.parentTask?.title || 'Nenhuma'}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  {task.parentTaskId ? `ID: ${task.parentTaskId}` : 'Tarefa independente'}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Created By Card */}
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#333', marginBottom: '16px' }}>
            Criado por
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {creator?.avatarUrl ? (
              <img 
                src={creator.avatarUrl} 
                alt={creator.name}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  objectFit: 'cover'
                }}
              />
            ) : (
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: 'var(--bg-card)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <FaUser size={20} color="var(--accent-color)" />
              </div>
            )}
            <div>
              <div style={{ fontSize: '16px', fontWeight: 500, color: '#333' }}>
                {creator?.name || 'Desconhecido'}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                {formattedCreatedAt}
              </div>
            </div>
          </div>
        </div>

        {/* Project Card */}
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#333', marginBottom: '16px' }}>
            Projeto
          </h3>
          {isEditing ? (
            <select
              value={editedTask.projectId || ''}
              onChange={(e) => setEditedTask({ ...editedTask, projectId: e.target.value })}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            >
              {projects.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <FaProjectDiagram size={20} color="var(--accent-color)" />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '16px', fontWeight: 500, color: '#333' }}>
                  {project?.name || 'Projeto não encontrado'}
                </div>
                {project && (
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    {project.description}
                  </div>
                )}
                {project?.regras && (
                  <div style={{ 
                    backgroundColor: 'var(--bg-input)', 
                    padding: '12px', 
                    borderRadius: '8px',
                    marginTop: '12px',
                    borderLeft: '4px solid var(--accent-color)'
                  }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#333', marginBottom: '6px' }}>
                      📋 Regras do Projeto
                    </h4>
                    <pre style={{ 
                      fontSize: '12px', 
                      color: 'var(--text-secondary)', 
                      lineHeight: 1.4, 
                      whiteSpace: 'pre-wrap',
                      fontFamily: 'inherit',
                      margin: 0
                    }}>
                      {project.regras}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Metadata */}
      <div style={{
        backgroundColor: 'var(--bg-input)',
        padding: '20px',
        borderRadius: '12px',
        marginBottom: '32px'
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#333', marginBottom: '16px' }}>
          Informações Técnicas
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>ID da Tarefa</div>
            <div style={{ fontSize: '14px', fontWeight: 500, color: '#333', fontFamily: 'monospace' }}>
              {task.id}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Criado em</div>
            <div style={{ fontSize: '14px', fontWeight: 500, color: '#333' }}>
              {safeFormatDate(task.createdAt, "dd/MM/yyyy HH:mm") || 'Data inválida'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Atualizado em</div>
            <div style={{ fontSize: '14px', fontWeight: 500, color: '#333' }}>
              {safeFormatDate(task.updatedAt, "dd/MM/yyyy HH:mm") || 'Data inválida'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Data da última execução</div>
            <div style={{ fontSize: '14px', fontWeight: 500, color: '#333' }}>
              {safeFormatDate(task.lastExecutedAt, "dd/MM/yyyy HH:mm") || 'Nunca executada'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Data da próxima execução</div>
            <div style={{ fontSize: '14px', fontWeight: 500, color: '#333' }}>
              {safeFormatDate(task.nextExecutionAt, "dd/MM/yyyy HH:mm") || 'Não agendada'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Posição</div>
            <div style={{ fontSize: '14px', fontWeight: 500, color: '#333' }}>
              {task.position}
            </div>
          </div>
        </div>
      </div>

      
      {/* Tabs for Comments, History, and Execution Logs */}
      <div className="card-table">
        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #e9ecef',
          backgroundColor: 'var(--bg-input)'
        }}>
          <button
            onClick={() => setActiveTab('comments')}
            style={{
              flex: 1,
              padding: '16px 24px',
              backgroundColor: activeTab === 'comments' ? 'white' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'comments' ? '3px solid var(--accent-color)' : '3px solid transparent',
              color: activeTab === 'comments' ? '#333' : 'var(--text-secondary)',
              fontWeight: activeTab === 'comments' ? 600 : 500,
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
          >
            <FaComment size={14} />
            Comentários
          </button>
          <button
            onClick={() => setActiveTab('history')}
            style={{
              flex: 1,
              padding: '16px 24px',
              backgroundColor: activeTab === 'history' ? 'white' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'history' ? '3px solid var(--accent-color)' : '3px solid transparent',
              color: activeTab === 'history' ? '#333' : 'var(--text-secondary)',
              fontWeight: activeTab === 'history' ? 600 : 500,
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
          >
            <FaHistory size={14} />
            Histórico
          </button>
          <button
            onClick={() => setActiveTab('execution')}
            style={{
              flex: 1,
              padding: '16px 24px',
              backgroundColor: activeTab === 'execution' ? 'white' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'execution' ? '3px solid var(--accent-color)' : '3px solid transparent',
              color: activeTab === 'execution' ? '#333' : 'var(--text-secondary)',
              fontWeight: activeTab === 'execution' ? 600 : 500,
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
          >
            <FaClock size={14} />
            Log de Execução
          </button>
          <button
            onClick={() => setActiveTab('generatedFiles')}
            style={{
              flex: 1,
              padding: '16px 24px',
              backgroundColor: activeTab === 'generatedFiles' ? 'white' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'generatedFiles' ? '3px solid var(--accent-color)' : '3px solid transparent',
              color: activeTab === 'generatedFiles' ? '#333' : 'var(--text-secondary)',
              fontWeight: activeTab === 'generatedFiles' ? 600 : 500,
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
          >
            <FaFileAlt size={14} />
            Arquivos Gerados
          </button>
        </div>

        {/* Tab Content */}
        <div style={{ padding: '0' }}>
          {activeTab === 'comments' && (
            <CommentsSection 
              taskId={task.id} 
              currentUser={currentUser}
            />
          )}
          {activeTab === 'history' && (
            <TaskHistorySection 
              taskId={task.id} 
              currentUser={currentUser}
            />
          )}
          {activeTab === 'execution' && (
            <TaskExecutionLog 
              taskId={task.id} 
              currentUser={currentUser}
            />
          )}
          {activeTab === 'generatedFiles' && (
            <div style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#333', marginBottom: '24px' }}>
                Conteúdo dos Arquivos Gerados
              </h3>
              
              {/* Prompt do Arquiteto */}
              {task.arquitetosPromptContent && (
                <div style={{ marginBottom: '32px' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FaFileAlt size={14} />
                    Prompt do Arquiteto
                  </h4>
                  <pre style={{
                    backgroundColor: 'var(--bg-card)',
                    padding: '16px',
                    borderRadius: '8px',
                    border: '1px solid #e9ecef',
                    fontSize: '13px',
                    lineHeight: '1.5',
                    whiteSpace: 'pre-wrap',
                    wordWrap: 'break-word',
                    maxHeight: '300px',
                    overflowY: 'auto',
                    fontFamily: 'monospace'
                  }}>
                    {task.arquitetosPromptContent}
                  </pre>
                </div>
              )}
              
              {/* Análise do Arquiteto */}
              {task.arquitetosAnalysisContent && (
                <div style={{ marginBottom: '32px' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FaFileAlt size={14} />
                    Análise do Arquiteto
                  </h4>
                  <pre style={{
                    backgroundColor: 'var(--bg-card)',
                    padding: '16px',
                    borderRadius: '8px',
                    border: '1px solid #e9ecef',
                    fontSize: '13px',
                    lineHeight: '1.5',
                    whiteSpace: 'pre-wrap',
                    wordWrap: 'break-word',
                    maxHeight: '300px',
                    overflowY: 'auto',
                    fontFamily: 'monospace'
                  }}>
                    {task.arquitetosAnalysisContent}
                  </pre>
                </div>
              )}
              
              {/* Terminal do Arquiteto */}
              {task.arquitetosTerminalContent && (
                <div style={{ marginBottom: '32px' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FaFileAlt size={14} />
                    Terminal do Arquiteto
                  </h4>
                  <pre style={{
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    padding: '16px',
                    borderRadius: '8px',
                    border: '1px solid #333',
                    fontSize: '12px',
                    lineHeight: '1.5',
                    whiteSpace: 'pre-wrap',
                    wordWrap: 'break-word',
                    maxHeight: '300px',
                    overflowY: 'auto',
                    fontFamily: 'monospace'
                  }}>
                    {task.arquitetosTerminalContent}
                  </pre>
                </div>
              )}
              
              {/* Terminal do Programador */}
              {task.programadorTerminalContent && (
                <div style={{ marginBottom: '32px' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FaFileAlt size={14} />
                    Terminal do Programador
                  </h4>
                  <pre style={{
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    padding: '16px',
                    borderRadius: '8px',
                    border: '1px solid #333',
                    fontSize: '12px',
                    lineHeight: '1.5',
                    whiteSpace: 'pre-wrap',
                    wordWrap: 'break-word',
                    maxHeight: '300px',
                    overflowY: 'auto',
                    fontFamily: 'monospace'
                  }}>
                    {task.programadorTerminalContent}
                  </pre>
                </div>
              )}
              
              {/* Relatório do Programador */}
              {task.programadorReportContent && (
                <div style={{ marginBottom: '32px' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FaFileAlt size={14} />
                    Relatório do Programador
                  </h4>
                  <pre style={{
                    backgroundColor: 'var(--bg-card)',
                    padding: '16px',
                    borderRadius: '8px',
                    border: '1px solid #e9ecef',
                    fontSize: '13px',
                    lineHeight: '1.5',
                    whiteSpace: 'pre-wrap',
                    wordWrap: 'break-word',
                    maxHeight: '300px',
                    overflowY: 'auto',
                    fontFamily: 'monospace'
                  }}>
                    {task.programadorReportContent}
                  </pre>
                </div>
              )}
              
              {!task.arquitetosPromptContent && !task.arquitetosAnalysisContent && !task.arquitetosTerminalContent && !task.programadorTerminalContent && !task.programadorReportContent && (
                <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-secondary)' }}>
                  <FaFileAlt size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
                  <p style={{ fontSize: '16px', marginBottom: '8px' }}>Nenhum arquivo gerado disponível</p>
                  <p style={{ fontSize: '14px', opacity: 0.7 }}>Os arquivos serão exibidos aqui após a execução da tarefa pelo monitor</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    

      <div className="card-dashed">
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
          <FaPaperclip size={24} style={{ marginBottom: '12px' }} />
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>
            Anexos
          </h3>
          <p style={{ fontSize: '14px' }}>
            O sistema de anexos será implementado na próxima versão.
          </p>
        </div>
      </div>

    
    
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
  );
};


export default TaskDetail;
