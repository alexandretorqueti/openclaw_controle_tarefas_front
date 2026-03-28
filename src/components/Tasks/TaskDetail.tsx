import React, { useState, useEffect, useMemo } from 'react';
import {
  Task,
  User,
  Project,
  Status,
  Priority,
  TaskComment,
  TaskHistory,
  TaskAttachment,
  TaskDependency,
  Agent,
} from '../../types';
import api from '../../services/api';
import './TaskDetail.css';

// ==================== TYPES ====================

interface TaskDetailProps {
  task: Task;
  tasks: Task[];
  users: User[];
  statuses: Status[];
  priorities: Priority[];
  projects: Project[];
  currentUser: User | null;
  onBack: () => void;
  onUpdateTask: (id: string, taskData: Partial<Task>) => Promise<Task>;
  onDeleteTask: (id: string) => Promise<void>;
  onToggleCompletion: (id: string) => Promise<void>;
  comments?: Comment[];
  logs?: Log[];
  files?: File[];
}

interface TaskDetailInlineEditState {
  editingField: 'status' | 'assignedTo' | 'agent' | null;
}

interface TaskEditFormState {
  isEditing: boolean;
  editedTask: Partial<Task>;
  isLoading: boolean;
  error: Nullable<string>;
}

type TabType = 'overview' | 'comments' | 'history' | 'logs' | 'dependencies';

interface Comment {
  id: string;
  author: string;
  authorAvatar: string;
  text: string;
  createdAt: string;
}

interface Log {
  id: string;
  timestamp: string;
  level: 'INFO' | 'DEBUG' | 'WARN' | 'ERROR';
  message: string;
}

interface File {
  id: string;
  name: string;
  size: string;
  url?: string;
  mimeType?: string;
}

// ================== HELPER COMPONENTS ==================

interface TaskDetailInlineEditState {
  editingField: 'status' | 'assignedTo' | 'agent' | null;
}

interface TaskEditFormState {
  isEditing: boolean;
  editedTask: Partial<Task>;
  isLoading: boolean;
  error: Nullable<string>;
}

interface Comment {
  id: string;
  author: string;
  authorAvatar: string;
  text: string;
  createdAt: string;
}

interface Log {
  id: string;
  timestamp: string;
  level: 'INFO' | 'DEBUG' | 'WARN' | 'ERROR';
  message: string;
}

interface File {
  id: string;
  name: string;
  size: string;
  url?: string;
  mimeType?: string;
}

// ==================== HELPER COMPONENTS ====================

const StatusBadge: React.FC<{
  status: Status | undefined;
  size?: 'sm' | 'md' | 'lg';
}> = ({ status, size = 'md' }) => {
  if (!status) return null;
  
  const sizeClasses: Record<string, string> = {
    sm: 'status-badge-small',
    md: 'status-badge-medium',
    lg: 'status-badge-large',
  };
  
  return (
    <div
      className={`task-status-badge ${sizeClasses[size]}`}
      style={{ backgroundColor: status.colorCode }}
    >
      {status.name}
    </div>
  );
};

const InfoCard: React.FC<{
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}> = ({ label, value, icon, className = '' }) => {
  return (
    <div className={`task-info-card ${className}`}>
      <div className="task-info-header">
        {icon && <span className="task-info-icon">{icon}</span>}
        <span className="task-info-label">{label}</span>
      </div>
      <div className="task-info-value">{value}</div>
    </div>
  );
};

const SectionHeader: React.FC<{
  title: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}> = ({ title, icon, action }) => {
  return (
    <div className="task-section-header">
      <h3 className="task-section-title">
        {icon && <span className="task-section-icon">{icon}</span>}
        {title}
      </h3>
      {action && <div className="task-section-action">{action}</div>}
    </div>
  );
};

const InlineSelect: React.FC<{
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
  isLoading?: boolean;
}> = ({ value, options, onChange, isLoading = false }) => {
  return (
    <div className="inline-edit-select-wrapper">
      <select
        className="inline-edit-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={isLoading}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {isLoading && <span className="inline-edit-loading">Salvando...</span>}
    </div>
  );
};

const InlineInput: React.FC<{
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  placeholder?: string;
  isLoading?: boolean;
}> = ({ value, onChange, onBlur, placeholder, isLoading = false }) => {
  return (
    <div className="inline-edit-input-wrapper">
      <input
        className="inline-edit-input"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={isLoading}
        autoFocus
      />
      {isLoading && <span className="inline-edit-loading">Salvando...</span>}
    </div>
  );
};

const TabButton: React.FC<{
  label: string;
  count?: number;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, count, isActive, onClick }) => {
  return (
    <button
      className={`task-tab-button ${isActive ? 'active' : ''}`}
      onClick={onClick}
    >
      <span className="task-tab-label">{label}</span>
      {count !== undefined && count > 0 && (
        <span className="task-tab-badge">{count}</span>
      )}
    </button>
  );
};

// ==================== MAIN COMPONENT ====================

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
  onToggleCompletion,
  comments = [],
  logs = [],
  files = [],
}) => {
  // ==================== STATE ====================
  const [inlineEdit, setInlineEdit] = useState<TaskDetailInlineEditState>({
    editingField: null,
  });
  
  const [editForm, setEditForm] = useState<TaskEditFormState>({
    isEditing: false,
    editedTask: {},
    isLoading: false,
    error: null,
  });
  
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // ==================== STATE PARA RESUMO FLOTANTE ====================
  const [showResumoOverlay, setShowResumoOverlay] = useState(false);
  const [isResumoExpanded, setIsResumoExpanded] = useState(false);

  // ==================== STATES FOR COMMENTS ====================
  const [newCommentText, setNewCommentText] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);

  // ==================== STATE FOR AGENTS ====================
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(false);

  // ==================== COMPUTED VALUES ====================
  const subtasksCount = useMemo(() => {
    return task.totalSubtasks || 0;
  }, [task.totalSubtasks]);

  const commentsCount = comments.length;
  const logsCount = logs.length;
  
  const historyCount = (task.history as TaskHistory[] | undefined)?.length || 0;
  
  const dependenciesCount = (task.dependencies as TaskDependency[] | undefined)?.length || 0;
  const dependentsCount = (task.dependents as TaskDependency[] | undefined)?.length || 0;

  const isOverdue = useMemo(() => {
    const deadline = new Date(task.deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return !task.isCompleted && deadline < today;
  }, [task.deadline, task.isCompleted]);

  // ==================== LOAD AGENTS ====================
  useEffect(() => {
    const loadAgents = async () => {
      try {
        setLoadingAgents(true);
        const response = await api.getAgents();
        
        // Estrutura da resposta: { success: boolean, data: Agent[], count: number }
        console.log('[DEBUG TaskDetail] Response da API de agentes:', response);
        
        let agentsList: Agent[] = [];
        
        if (response && typeof response === 'object') {
          // Se for um objeto com propriedade 'data' ou 'agents'
          if (Array.isArray(response.data)) {
            agentsList = response.data;
          } else if (Array.isArray(response.agents)) {
            agentsList = response.agents;
          } else if ('data' in response && typeof response.data === 'object' && Array.isArray((response.data as any).agents)) {
            agentsList = (response.data as any).agents;
          }
        } else if (Array.isArray(response)) {
          // Se já for um array
          agentsList = response;
        }
        
        // Ordenar agentes por ID (alfabeticamente)
        const sortedAgents = agentsList.sort((a: any, b: any) => 
          String(a.id || '').localeCompare(String(b.id || ''))
        );
        
        console.log('[DEBUG TaskDetail] Agentes carregados:', sortedAgents);
        setAgents(sortedAgents);
      } catch (error) {
        console.error('Falha ao carregar agentes:', error);
      } finally {
        setLoadingAgents(false);
      }
    };

    loadAgents();
  }, []);

  // ==================== HANDLERS PARA RESUMO FLOTANTE ====================
  const handleResumoToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResumoExpanded(!isResumoExpanded);
  };

  const handleResumoClick = () => {
    setIsResumoExpanded(true);
    setShowResumoOverlay(true);
  };

  const handleResumoDismiss = () => {
    setShowResumoOverlay(false);
    setIsResumoExpanded(false);
  };

  // ==================== HANDLERS PARA COMENTÁRIOS ====================
  /**
   * Add a new comment to the task
   * @AGENT-NOTE: Função para adicionar comentários. Valida o texto, chama a API de comments,
   * atualiza o estado e limpa o campo de texto.
   */
  const handleAddComment = async () => {
    if (!newCommentText.trim()) {
      setCommentError('Por favor, digite um comentário.');
      return;
    }

    try {
      setIsSubmittingComment(true);
      setCommentError(null);
      setCommentSuccess(null);

      // Aqui você deve chamar a API real de criação de comentários
      // Exemplo: await api.createComment(task.id, newCommentText);
      console.log('[DEBUG] Adicionando comentário:', newCommentText);

      // Simular delay da API
      setTimeout(() => {
        setCommentSuccess('Comentário adicionado!');
        setTimeout(() => setCommentSuccess(null), 3000);
      }, 500);

      setNewCommentText('');
    } catch (error) {
      console.error('Falha ao adicionar comentário:', error);
      setCommentError('Falha ao adicionar comentário. Tente novamente.');
      setTimeout(() => setCommentError(null), 3000);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  /**
   * Start editing a comment
   * @AGENT-NOTE: Prepara o estado de edição para um comentário específico
   */
  const handleEditComment = (commentId: string, currentText: string) => {
    setEditingCommentId(commentId);
    setEditingCommentText(currentText);
  };

  /**
   * Cancel editing a comment
   * @AGENT-NOTE: Limpa o estado de edição sem salvar alterações
   */
  const handleCancelEditComment = () => {
    setEditingCommentId(null);
    setEditingCommentText('');
  };

  /**
   * Save edited comment
   * @AGENT-NOTE: Salva as alterações do comentário e limpa o estado de edição
   */
  const handleSaveEditComment = (commentId: string) => {
    if (!editingCommentText.trim()) {
      setCommentError('O comentário não pode ser vazio.');
      return;
    }

    try {
      // Aqui você deve chamar a API real de atualização de comentários
      console.log('[DEBUG] Editando comentário:', commentId, editingCommentText);

      setEditingCommentId(null);
      setEditingCommentText('');
      setCommentSuccess('Comentário atualizado!');
      setTimeout(() => setCommentSuccess(null), 3000);
    } catch (error) {
      console.error('Falha ao salvar comentário:', error);
      setCommentError('Falha ao salvar comentário.');
    }
  };

  /**
   * Delete a comment
   * @AGENT-NOTE: Remove um comentário após confirmação do usuário
   */
  const handleDeleteComment = async (commentId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este comentário?')) {
      try {
        // Aqui você deve chamar a API real de exclusão de comentários
        console.log('[DEBUG] Excluindo comentário:', commentId);
        setCommentSuccess('Comentário excluído!');
        setTimeout(() => setCommentSuccess(null), 3000);
      } catch (error) {
        console.error('Falha ao excluir comentário:', error);
        setCommentError('Falha ao excluir comentário.');
      }
    }
  };

  // ==================== HANDLERS PARA EDIÇÃO INLINE ====================
  const handleInlineEditStart = (field: 'status' | 'assignedTo' | 'agent') => {
    setInlineEdit({ editingField: field });
  };

  const handleInlineStatusChange = async (newStatusId: string) => {
    try {
      setInlineEdit({ editingField: 'status' });
      await onUpdateTask(task.id, { statusId: newStatusId });
      setInlineEdit({ editingField: null });
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Falha ao atualizar o status da tarefa.');
      setInlineEdit({ editingField: null });
    }
  };

  const handleInlineAssignedToChange = async (newUserId: string) => {
    try {
      setInlineEdit({ editingField: 'assignedTo' });
      await onUpdateTask(task.id, { assignedToId: newUserId });
      setInlineEdit({ editingField: null });
    } catch (error) {
      console.error('Failed to update assignedTo:', error);
      alert('Falha ao atualizar o responsável pela tarefa.');
      setInlineEdit({ editingField: null });
    }
  };

  const handleInlineAgentChange = async (newAgent: string) => {
    try {
      await onUpdateTask(task.id, { agent: newAgent ? newAgent : null });
      setInlineEdit({ editingField: null });
    } catch (error) {
      console.error('Falha ao atualizar agente:', error);
      alert('Falha ao atualizar o agente da tarefa.');
    }
  };

  const handleEditTask = () => {
    setEditForm({
      isEditing: true,
      editedTask: {},
      isLoading: false,
      error: null,
    });
  };

  const handleCancelEdit = () => {
    setEditForm({
      isEditing: false,
      editedTask: {},
      isLoading: false,
      error: null,
    });
  };

  const handleSaveEdit = async () => {
    try {
      setEditForm((prev) => ({ ...prev, isLoading: true }));
      await onUpdateTask(task.id, editForm.editedTask);
      setEditForm({
        isEditing: false,
        editedTask: {},
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('Failed to save task:', error);
      setEditForm((prev) => ({
        ...prev,
        isLoading: false,
        error: 'Falha ao salvar as alterações da tarefa.',
      }));
    }
  };

  const handleDeleteTask = async () => {
    if (window.confirm('Tem certeza que deseja excluir esta tarefa? Esta ação não pode ser desfeita.')) {
      try {
        await onDeleteTask(task.id);
        onBack();
      } catch (error) {
        console.error('Failed to delete task:', error);
        alert('Falha ao excluir a tarefa.');
      }
    }
  };

  const handleToggleCompletion = () => {
    onToggleCompletion(task.id);
  };

  const formatDeadline = (date: Nullable<string>) => {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Nullable<Nullable<string>>) => {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleDateString('pt-BR');
  };

  const getLogLevelColor = (level: Nullable<Log['level']>): string => {
    if (!level) return '#b0b0b0';
    switch (level) {
      case 'INFO': return '#3498db';
      case 'DEBUG': return '#9b59b6';
      case 'WARN': return '#f1c40f';
      case 'ERROR': return '#e74c3c';
      default: return '#b0b0b0';
    }
  };

  // ==================== RENDERERS ====================
  if (editForm.isEditing) {
    return (
      <div className="task-detail-container task-detail-editing">
        <div className="task-detail-modal-content">
          {/* Header */}
          <div className="task-detail-header task-detail-header-editing">
            <h2 className="task-detail-title">Editar Tarefa</h2>
            <div className="task-detail-actions">
              <button
                className="task-detail-btn task-detail-btn-secondary"
                onClick={handleCancelEdit}
                disabled={editForm.isLoading}
              >
                Cancelar
              </button>
              <button
                className="task-detail-btn task-detail-btn-primary"
                onClick={handleSaveEdit}
                disabled={editForm.isLoading}
              >
                {editForm.isLoading ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {editForm.error && (
            <div className="task-detail-error">
              {editForm.error}
            </div>
          )}

          {/* Edit Form */}
          <div className="task-detail-form">
            {/* Básico */}
            <SectionHeader title="Informações Básicas" icon={<span className="icon">📝</span>} />
            <div className="task-detail-form-grid">
              <div className="task-detail-form-group">
                <label htmlFor="edit-title">Título *</label>
                <input
                  id="edit-title"
                  type="text"
                  className="task-detail-form-input"
                  value={editForm.editedTask.title ?? task.title}
                  onChange={(e) => setEditForm(prev => ({ ...prev, editedTask: { ...prev.editedTask, title: e.target.value } }))}
                  required
                  autoFocus
                />
              </div>

              <div className="task-detail-form-group task-detail-form-group-full">
                <label htmlFor="edit-description">Descrição</label>
                <textarea
                  id="edit-description"
                  className="task-detail-form-textarea"
                  value={editForm.editedTask.description ?? task.description}
                  onChange={(e) => setEditForm(prev => ({ ...prev, editedTask: { ...prev.editedTask, description: e.target.value } }))}
                  rows={4}
                />
              </div>

              <div className="task-detail-form-group">
                <label htmlFor="edit-status">Status *</label>
                <select
                  id="edit-status"
                  className="task-detail-form-select"
                  value={editForm.editedTask.statusId ?? task.statusId}
                  onChange={(e) => setEditForm(prev => ({ ...prev, editedTask: { ...prev.editedTask, statusId: e.target.value } }))}
                  required
                >
                  {statuses.map((status) => (
                    <option key={status.id} value={status.id}>{status.name}</option>
                  ))}
                </select>
              </div>

              <div className="task-detail-form-group">
                <label htmlFor="edit-priority">Prioridade *</label>
                <select
                  id="edit-priority"
                  className="task-detail-form-select"
                  value={editForm.editedTask.priorityId ?? task.priorityId}
                  onChange={(e) => setEditForm(prev => ({ ...prev, editedTask: { ...prev.editedTask, priorityId: e.target.value } }))}
                  required
                >
                  {priorities.map((priority) => (
                    <option key={priority.id} value={priority.id}>{priority.name}</option>
                  ))}
                </select>
              </div>

              <div className="task-detail-form-group">
                <label htmlFor="edit-deadline">Prazo *</label>
                <input
                  id="edit-deadline"
                  type="datetime-local"
                  className="task-detail-form-input"
                  value={editForm.editedTask.deadline ? new Date(editForm.editedTask.deadline).toISOString().slice(0, 16) : task.deadline ? new Date(task.deadline).toISOString().slice(0, 16) : ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, editedTask: { ...prev.editedTask, deadline: e.target.value } }))}
                  required
                />
              </div>

              <div className="task-detail-form-group">
                <label htmlFor="edit-assignedTo">Responsável *</label>
                <select
                  id="edit-assignedTo"
                  className="task-detail-form-select"
                  value={editForm.editedTask.assignedToId ?? task.assignedToId}
                  onChange={(e) => setEditForm(prev => ({ ...prev, editedTask: { ...prev.editedTask, assignedToId: e.target.value } }))}
                  required
                >
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                  ))}
                </select>
              </div>

              <div className="task-detail-form-group">
                <label htmlFor="edit-agent">Agente</label>
                <select
                  id="edit-agent"
                  className="task-detail-form-input"
                  value={editForm.editedTask.agent ?? task.agent ?? ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, editedTask: { ...prev.editedTask, agent: e.target.value } }))}
                >
                  <option value="">Nenhum agente atribuído</option>
                  {agents.map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.identity?.emoji || '🤖'} {agent.identity?.name || agent.id}
                    </option>
                  ))}
                </select>
              </div>

              <div className="task-detail-form-group">
                <label htmlFor="edit-domain">Domínio</label>
                <input
                  id="edit-domain"
                  type="text"
                  className="task-detail-form-input"
                  value={editForm.editedTask.domain ?? task.domain ?? ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, editedTask: { ...prev.editedTask, domain: e.target.value } }))}
                  placeholder="Ex: backend, frontend, infraestrutura"
                />
              </div>
            </div>

            {/* Avançado */}
            <SectionHeader title="Opções Avançadas" icon={<span className="icon">⚙️</span>} />
            <div className="task-detail-form-grid">
              <div className="task-detail-form-group">
                <label htmlFor="edit-parentTask">Tarefa Pai</label>
                <select
                  id="edit-parentTask"
                  className="task-detail-form-select"
                  value={editForm.editedTask.parentTaskId ?? task.parentTaskId ?? ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, editedTask: { ...prev.editedTask, parentTaskId: e.target.value || null } }))}
                >
                  <option value="">Nenhuma</option>
                  {tasks
                    .filter((t) => t.id !== task.id)
                    .map((t) => (
                      <option key={t.id} value={t.id}>{t.title}</option>
                    ))}
                </select>
              </div>

              <div className="task-detail-form-group task-detail-form-group-checkbox">
                <label htmlFor="edit-isRecurring">Recorrente</label>
                <input
                  id="edit-isRecurring"
                  type="checkbox"
                  className="task-detail-form-checkbox"
                  checked={editForm.editedTask.isRecurring ?? task.isRecurring ?? false}
                  onChange={(e) => setEditForm(prev => ({ ...prev, editedTask: { ...prev.editedTask, isRecurring: e.target.checked } }))}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="task-detail-container">
      <div className="task-detail-modal-content">
        
        {/* ==================== RESUMO FLOTANTE (EXPANDÍVEL) ==================== */}
        {showResumoOverlay && (
          <div className={`task-resumo-overlay`}>
            <div 
              className={`task-resumo-card`}
              onClick={(e) => {
                e.stopPropagation();
                setIsResumoExpanded(true);
              }}
            >
              <div className="task-resumo-layout">
                <div className="task-resumo-left">
                  {task.createdBy?.avatarUrl && (
                    <img
                      src={task.createdBy.avatarUrl}
                      alt={task.createdBy.name}
                      className="task-resumo-avatar"
                    />
                  )}
                  <div className="task-resumo-info">
                    <h3 className="task-resumo-title">{task.title}</h3>
                    <div className="task-resumo-meta">
                      <div className="task-resumo-item">
                        <span className="task-resumo-icon">📋</span>
                        <span className="task-resumo-value">{task.status?.name || '−'}</span>
                      </div>
                      <div className="task-resumo-item">
                        <span className="task-resumo-icon">👤</span>
                        <span className="task-resumo-value">{task.assignedTo?.name || task.createdBy?.name || '-'}</span>
                      </div>
                      {task.deadline && (
                        <div className="task-resumo-item">
                          <span className="task-resumo-icon">⏰</span>
                          <span className="task-resumo-value">
                            {new Date(task.deadline).toLocaleDateString('pt-BR')}
                            {isOverdue && ' ⚠️'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  className="task-resumo-toggle"
                  onClick={handleResumoToggle}
                  title={isResumoExpanded ? 'Ocultar visão geral' : 'Expandir visão geral'}
                >
                  {isResumoExpanded ? (
                    <span className="task-resumo-toggle-icon">×</span>
                  ) : (
                    <span className="task-resumo-toggle-icon">⇲</span>
                  )}
                </button>
              </div>
            </div>

            {/* RESUMO EXPANDIDO */}
            {isResumoExpanded && (
              <div className="task-resumo-full-content" onClick={(e) => e.stopPropagation()}>
                <div className="task-resumo-full-header">
                  <div className="task-resumo-full-header-left">
                    {task.createdBy?.avatarUrl && (
                      <img src={task.createdBy.avatarUrl} alt={task.createdBy.name} className="task-resumo-full-avatar" />
                    )}
                    <div className="task-resumo-full-title">
                      <h3 className="task-resumo-full-title-text">{task.title}</h3>
                      <span className={`task-resumo-full-status ${task.status?.name === 'Concluída' ? 'status-concluida' : 'status-pendente'}`}>
                        {task.status?.name || '−'}
                      </span>
                    </div>
                  </div>
                  <button className="task-resumo-close-btn" onClick={handleResumoDismiss} title="Fechar resumo">
                    <span className="task-resumo-close-icon">×</span>
                  </button>
                </div>

                <div className="task-resumo-full-body">
                  <div className="task-resumo-full-grid">
                    <InfoCard label="Criador" value={<span className="task-detail-user-name">{task.createdBy?.name || '-'}</span>} />
                    <InfoCard label="Responsável" value={<span className="task-detail-user-name">{task.assignedTo?.name || '-'}</span>} />
                    {task.deadline && (
                      <InfoCard 
                        label="Prazo" 
                        value={<span className={`task-detail-deadline ${isOverdue ? 'task-detail-deadline-overdue' : ''}`}>{formatDeadline(task.deadline)}</span>} 
                      />
                    )}
                    <InfoCard 
                      label="Data de Criação" 
                      value={<span className="task-detail-property-value">{formatDate(task.createdAt)}</span>} 
                    />
                    <InfoCard 
                      label="Última Atualização" 
                      value={<span className="task-detail-property-value">{formatDate(task.updatedAt)}</span>} 
                    />
                    <InfoCard 
                      label="Projeto" 
                      value={<span className="task-detail-project-name">{task.project?.name || '-'}</span>} 
                    />
                    <InfoCard 
                      label="Domínio" 
                      value={<span className="task-detail-domain">{task.domain || '-'}</span>} 
                    />
                    {task.agent && (
                      <InfoCard 
                        label="Agente" 
                        value={<span className="task-detail-agent-text">{task.agent}</span>} 
                      />
                    )}
                    <InfoCard 
                      label="Tamanho" 
                      value={<span className="task-detail-property-value">{task.description?.split(/\s+/).filter(word => word.length > 0).length || 0} palavras</span>} 
                    />
                  </div>

                  <div className="task-resumo-full-description">
                    <span className="task-resumo-full-label">Descrição:</span>
                    <p className="task-detail-description">{task.description || 'Sem descrição'}</p>
                  </div>

                  <div className="task-resumo-full-stats">
                    <h4 className="task-resumo-full-stats-title">Estatísticas</h4>
                    <div className="task-resumo-full-stats-grid">
                      <div className="task-resumo-full-stat-item">
                        <span className="task-resumo-full-stat-icon">📄</span>
                        <span className="task-resumo-full-stat-value">{subtasksCount}</span>
                        <span className="task-resumo-full-stat-label">Sub-Tarefas</span>
                      </div>
                      <div className="task-resumo-full-stat-item">
                        <span className="task-resumo-full-stat-icon">💬</span>
                        <span className="task-resumo-full-stat-value">{commentsCount}</span>
                        <span className="task-resumo-full-stat-label">Comentários</span>
                      </div>
                      <div className="task-resumo-full-stat-item">
                        <span className="task-resumo-full-stat-icon">📜</span>
                        <span className="task-resumo-full-stat-value">{historyCount}</span>
                        <span className="task-resumo-full-stat-label">Histórico</span>
                      </div>
                      <div className="task-resumo-full-stat-item">
                        <span className="task-resumo-full-stat-icon">📊</span>
                        <span className="task-resumo-full-stat-value">{logsCount}</span>
                        <span className="task-resumo-full-stat-label">Logs</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Header */}
        <div className="task-detail-header">
          <div className="task-detail-header-left">
            <button
              className="task-detail-btn task-detail-btn-icon"
              onClick={onBack}
              aria-label="Voltar"
            >
              ←
            </button>
            <div className="task-detail-title-wrapper">
              <h2 className="task-detail-title">
                {task.title}
                {task.isCompleted && <span className="task-detail-completed-badge">✓ Concluída</span>}
                {task.isExecuting && <span className="task-detail-executing-badge">⏳ Executando</span>}
              </h2>
              {task.agent && (
                <span className="task-detail-agent-tag">{task.agent}</span>
              )}
            </div>
          </div>
          <div className="task-detail-actions">
    <button
              className="task-detail-btn task-detail-btn-icon"
              onClick={() => setShowResumoOverlay(prev => !prev)}
              title={showResumoOverlay ? 'Ocultar resumo' : 'Mostrar resumo'}
              style={{ backgroundColor: showResumoOverlay ? '#ff9800' : 'transparent' }}
            >
              📋
            </button>
            <button
              className="task-detail-btn task-detail-btn-icon task-detail-btn-secondary"
              onClick={handleEditTask}
              title="Editar tarefa"
            >
              ✏️ Editar
            </button>
            <button
              className="task-detail-btn task-detail-btn-danger"
              onClick={handleDeleteTask}
              title="Excluir tarefa"
            >
              🗑️ Excluir
            </button>
          </div>
        </div>

        {/* Status Bar */}
        <div className="task-detail-status-bar">
          <div className="task-detail-status-row">
            <div className="task-detail-status-item">
              <span className="task-detail-status-label">Status:</span>
              <div
                className={`inline-edit-field ${inlineEdit.editingField === 'status' ? 'editing' : ''}`}
                onClick={inlineEdit.editingField !== 'status' ? () => handleInlineEditStart('status') : undefined}
                style={{ cursor: inlineEdit.editingField === 'status' ? 'default' : 'pointer' }}
              >
                {inlineEdit.editingField !== 'status' ? (
                  <StatusBadge status={task.status} size="sm" />
                ) : (
                  <InlineSelect
                    value={task.statusId}
                    options={statuses.map(s => ({ value: s.id, label: s.name }))}
                    onChange={handleInlineStatusChange}
                    isLoading={inlineEdit.editingField === 'status'}
                  />
                )}
              </div>
            </div>

            <div className="task-detail-status-item">
              <span className="task-detail-status-label">Prioridade:</span>
              <StatusBadge status={task.priority as unknown as Status} size="sm" />
            </div>

            <div className="task-detail-status-item deadline-badge">
              <span className="task-detail-status-label">Prazo:</span>
              <span className={`task-detail-deadline ${isOverdue ? 'task-detail-deadline-overdue' : ''}`}>
                {formatDeadline(task.deadline)}
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="task-detail-tabs">
          <TabButton
            label="Visão Geral"
            isActive={activeTab === 'overview'}
            onClick={() => setActiveTab('overview')}
          />
          <TabButton
            label="Comentários"
            count={commentsCount}
            isActive={activeTab === 'comments'}
            onClick={() => setActiveTab('comments')}
          />
          <TabButton
            label="Histórico"
            count={historyCount}
            isActive={activeTab === 'history'}
            onClick={() => setActiveTab('history')}
          />
          <TabButton
            label="Logs"
            count={logsCount}
            isActive={activeTab === 'logs'}
            onClick={() => setActiveTab('logs')}
          />
          <TabButton
            label="Dependências"
            count={dependenciesCount + dependentsCount}
            isActive={activeTab === 'dependencies'}
            onClick={() => setActiveTab('dependencies')}
          />
        </div>

        {/* Tab Content */}
        <div className="task-detail-content">
          {activeTab === 'overview' && (
            <div className="task-detail-overview">
              {/* Quick Edit Section */}
              <SectionHeader title="Edição Rápida" icon={<span className="icon">⚡</span>} />
              <div className="task-detail-quick-edit">
                <div className="task-detail-quick-edit-item">
                  <span className="task-detail-quick-edit-label">Responsável:</span>
                  <div
                    className={`inline-edit-field ${inlineEdit.editingField === 'assignedTo' ? 'editing' : ''}`}
                    onClick={inlineEdit.editingField !== 'assignedTo' ? () => handleInlineEditStart('assignedTo') : undefined}
                    style={{ cursor: inlineEdit.editingField === 'assignedTo' ? 'default' : 'pointer' }}
                  >
                    {inlineEdit.editingField !== 'assignedTo' ? (
                      <span className="task-detail-user-select">
                        {task.assignedTo?.name || users.find(u => u.id === task.assignedToId)?.name || '-'}
                        {task.assignedTo?.avatarUrl && (
                          <img src={task.assignedTo.avatarUrl} alt={task.assignedTo.name} className="task-detail-user-avatar" />
                        )}
                      </span>
                    ) : (
                      <InlineSelect
                        value={task.assignedToId}
                        options={users.map(u => ({ value: u.id, label: u.name }))}
                        onChange={handleInlineAssignedToChange}
                        isLoading={inlineEdit.editingField === 'assignedTo'}
                      />
                    )}
                  </div>
                </div>

                <div className="task-detail-quick-edit-item">
                  <span className="task-detail-quick-edit-label">Agente:</span>
                  <div
                    className={`inline-edit-field ${inlineEdit.editingField === 'agent' ? 'editing' : ''}`}
                    onClick={inlineEdit.editingField !== 'agent' ? () => handleInlineEditStart('agent') : undefined}
                    style={{ cursor: inlineEdit.editingField === 'agent' ? 'default' : 'pointer' }}
                  >
                    {inlineEdit.editingField !== 'agent' ? (
                      <span className="task-detail-agent-text">{task.agent || '-'}</span>
                    ) : (
                      <InlineSelect
                        value={task.agent || ''}
                        options={[
                          { value: '', label: 'Nenhum (campo vazio)' },
                          ...agents.map((a) => ({ value: a.id, label: `${a.identity?.emoji || '🤖'} ${a.identity?.name || a.id}` }))
                        ]}
                        onChange={handleInlineAgentChange}
                        isLoading={inlineEdit.editingField === 'agent' || loadingAgents}
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Basic Info */}
              <SectionHeader title="Informações Principais" icon={<span className="icon">📋</span>} />
              <div className="task-detail-info-grid">
                <InfoCard
                  label="Descrição"
                  value={<p className="task-detail-description">{task.description || 'Sem descrição'}</p>}
                />
                <InfoCard
                  label="Projeto"
                  value={<span className="task-detail-project-name">{task.project?.name || '-'}</span>}
                />
                <InfoCard
                  label="Criado por"
                  value={
                    <span className="task-detail-user-name">
                      {task.createdBy?.name || '-'}
                      {task.createdBy?.avatarUrl && (
                        <img src={task.createdBy.avatarUrl} alt={task.createdBy.name} className="task-detail-user-avatar-small" />
                      )}
                    </span>
                  }
                />
                <InfoCard
                  label="Data de Criação"
                  value={formatDate(task.createdAt)}
                />
                <InfoCard
                  label="Última Atualização"
                  value={formatDate(task.updatedAt)}
                />
              </div>

              {/* Recurring Info (if applicable) */}
              {task.isRecurring && (
                <SectionHeader title="Informações de Recorrência" icon={<span className="icon">🔄</span>} />
              )}
              {task.isRecurring && (
                <div className="task-detail-info-grid">
                  <InfoCard
                    label="Tipo"
                    value={<span className="task-detail-recurrence-type">{task.recurrenceType || '-'}</span>}
                  />
                  <InfoCard
                    label="Última Execução"
                    value={formatDate(task.lastExecutedAt)}
                  />
                  <InfoCard
                    label="Próxima Execução"
                    value={formatDeadline(task.nextExecutionAt)}
                  />
                  {task.recurrenceTimes && (
                    <InfoCard
                      label="Horários"
                      value={<span className="task-detail-recurrence-times">{Array.isArray(task.recurrenceTimes) ? task.recurrenceTimes.join(', ') : task.recurrenceTimes}</span>}
                    />
                  )}
                </div>
              )}

              {/* Task Properties */}
              <SectionHeader title="Propriedades da Tarefa" icon={<span className="icon">🏷️</span>} />
              <div className="task-detail-properties-grid">
                <InfoCard
                  label="Tarefa Decomposta"
                  value={<span className={`task-detail-property-value ${task.isDecomposed ? 'task-detail-property-true' : 'task-detail-property-false'}`}>{task.isDecomposed ? 'Sim' : 'Não'}</span>}
                />
                <InfoCard
                  label="Tarefa Atômica"
                  value={<span className={`task-detail-property-value ${task.isAtomic ? 'task-detail-property-true' : 'task-detail-property-false'}`}>{task.isAtomic ? 'Sim' : 'Não'}</span>}
                />
                <InfoCard
                  label="Has Child Executing"
                  value={<span className={`task-detail-property-value ${task.hasChildExecuting ? 'task-detail-property-true' : 'task-detail-property-false'}`}>{task.hasChildExecuting ? 'Sim' : 'Não'}</span>}
                />
                <InfoCard
                  label="Domínio"
                  value={<span className="task-detail-domain">{task.domain || '-'}</span>}
                />
              </div>

              {/* Statistics */}
              <SectionHeader title="Estatísticas" icon={<span className="icon">📊</span>} />
              <div className="task-detail-statistics-grid">
                <InfoCard
                  label="Sub-Tarefas"
                  value={<span className="task-detail-stat-value">{subtasksCount}</span>}
                />
                <InfoCard
                  label="Comentários"
                  value={<span className="task-detail-stat-value">{commentsCount}</span>}
                />
                <InfoCard
                  label="Logs"
                  value={<span className="task-detail-stat-value">{logsCount}</span>}
                />
                <InfoCard
                  label="Registro de Histórico"
                  value={<span className="task-detail-stat-value">{historyCount}</span>}
                />
              </div>

              {/* Generated Content (if applicable) */}
              {(task.arquitetosPromptContent || task.arquitetosAnalysisContent || task.programadorReportContent) && (
                <SectionHeader title="Conteúdo Gerado" icon={<span className="icon">🤖</span>} />
              )}
              {(task.arquitetosPromptContent || task.arquitetosAnalysisContent || task.programadorReportContent) && (
                <div className="task-detail-generated-content">
                  {task.arquitetosPromptContent && (
                    <InfoCard
                      label="Prompt do Arquiteto"
                      value={<pre className="task-detail-generated-text">{task.arquitetosPromptContent}</pre>}
                    />
                  )}
                  {task.arquitetosAnalysisContent && (
                    <InfoCard
                      label="Análise do Arquiteto"
                      value={<pre className="task-detail-generated-text">{task.arquitetosAnalysisContent}</pre>}
                    />
                  )}
                  {task.programadorReportContent && (
                    <InfoCard
                      label="Relatório do Programador"
                      value={<pre className="task-detail-generated-text">{task.programadorReportContent}</pre>}
                    />
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'comments' && (
            <div className="task-detail-comments">
              <SectionHeader title="Comentários da Tarefa" icon={<span className="icon">💬</span>} />
              {comments.length === 0 ? (
                <div className="task-detail-empty-state">
                  <p>Nenhum comentário encontrado para esta tarefa.</p>
                </div>
              ) : (
                <div className="task-detail-comments-list">
                  {comments.map((comment) => {
                    const isEditing = editingCommentId === comment.id;
                    return (
                      <div key={comment.id} className="task-detail-comment-item">
                        <div className="task-detail-comment-header">
                          {comment.authorAvatar && (
                            <img
                              src={comment.authorAvatar}
                              alt={comment.author}
                              className="task-detail-comment-avatar"
                            />
                          )}
                          <div className="task-detail-comment-infos">
                            <span className="task-detail-comment-author">{comment.author}</span>
                            <span className="task-detail-comment-date">{formatDate(comment.createdAt)}</span>
                          </div>
                          {/* Botões de ação do comentário */}
                          <div className="task-detail-comment-actions">
                            {isEditing ? (
                              <button
                                className="task-detail-btn-small"
                                onClick={() => handleSaveEditComment(comment.id)}
                                disabled={isSubmittingComment}
                              >
                                ✓
                              </button>
                            ) : (
                              <>
                                <button
                                  className="task-detail-btn-small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditComment(comment.id, comment.text);
                                  }}
                                  title="Editar comentário"
                                >
                                  ✏️
                                </button>
                                <button
                                  className="task-detail-btn-small task-detail-btn-danger"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteComment(comment.id);
                                  }}
                                  title="Excluir comentário"
                                >
                                  🗑️
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="task-detail-comment-text">
                          {isEditing ? (
                            <div className="task-detail-comment-edit-form">
                              <textarea
                                value={editingCommentText}
                                onChange={(e) => setEditingCommentText(e.target.value)}
                                className="task-detail-comment-input"
                                autoFocus
                                rows={3}
                              />
                              <div className="task-detail-comment-actions-small">
                                <button
                                  className="task-detail-btn-small"
                                  onClick={() => handleSaveEditComment(comment.id)}
                                >
                                  Salvar
                                </button>
                                <button
                                  className="task-detail-btn-small task-detail-btn-secondary"
                                  onClick={handleCancelEditComment}
                                >
                                  Cancelar
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="task-detail-comment-text">{comment.text}</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Formulário de novo comentário */}
              <div className="task-detail-comment-form">
                <div className="task-detail-comment-form-top">
                  <div className="task-detail-comment-user-info">
                    <span className="task-detail-comment-user-avatar">👤</span>
                    <span className="task-detail-comment-user-name">Você</span>
                  </div>
                </div>
                <textarea
                  placeholder="Adicione um comentário..."
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  className="task-detail-comment-input"
                  rows={3}
                  disabled={isSubmittingComment}
                />
                <div className="task-detail-comment-form-actions">
                  {commentError && (
                    <span className="task-detail-comment-error">{commentError}</span>
                  )}
                  {commentSuccess && (
                    <span className="task-detail-comment-success">{commentSuccess}</span>
                  )}
                  <button
                    className="task-detail-btn"
                    onClick={handleAddComment}
                    disabled={!newCommentText.trim() || isSubmittingComment}
                  >
                    {isSubmittingComment ? 'Enviando...' : 'Adicionar Comentário'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="task-detail-history">
              <SectionHeader title="Histórico de Status" icon={<span className="icon">📜</span>} />
              {task.history && (task.history as TaskHistory[]).length === 0 ? (
                <div className="task-detail-empty-state">
                  <p>Nenhum registro de histórico encontrado para esta tarefa.</p>
                </div>
              ) : (
                <div className="task-detail-history-list">
                  {(task.history as TaskHistory[])?.map((history) => (
                    <div key={history.id} className="task-detail-history-item">
                      <div className="task-detail-history-content">
                        <span className="task-detail-history-date">{formatDate(history.timestamp)}</span>
                        <span className="task-detail-history-text">
                          {history.user?.name || 'Anônimo'} atualizou o status de <strong>{history.oldStatusId}</strong> para <strong>{history.newStatusId}</strong>
                          {history.notes && (
                            <>
                              <br />
                              <em>Nota: {history.notes}</em>
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="task-detail-logs">
              <SectionHeader title="Logs de Execução" icon={<span className="icon">📝</span>} />
              {logs.length === 0 ? (
                <div className="task-detail-empty-state">
                  <p>Nenhum log encontrado para esta tarefa.</p>
                </div>
              ) : (
                <div className="task-detail-logs-list">
                  {logs.map((log) => (
                    <div
                      key={log.id}
                      className="task-detail-log-item"
                      style={{ borderLeftColor: getLogLevelColor(log.level) }}
                    >
                      <div className="task-detail-log-header">
                        <span
                          className="task-detail-log-level"
                          style={{ backgroundColor: getLogLevelColor(log.level) }}
                        >
                          {log.level}
                        </span>
                        <span className="task-detail-log-timestamp">{formatDeadline(log.timestamp)}</span>
                      </div>
                      <div className="task-detail-log-message">{log.message}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'dependencies' && (
            <div className="task-detail-dependencies">
              <SectionHeader title="Dependências" icon={<span className="icon">🔗</span>} />
              {(task.dependencies as TaskDependency[] | undefined)?.length === 0 &&
               (task.dependents as TaskDependency[] | undefined)?.length === 0 ? (
                <div className="task-detail-empty-state">
                  <p>Nenhuma dependência encontrada para esta tarefa.</p>
                </div>
              ) : (
                <div className="task-detail-dependencies-content">
                  {(task.dependencies as TaskDependency[] | undefined)?.length > 0 && (
                    <div className="task-detail-dependencies-section">
                      <h4 className="task-detail-dependencies-title">Esta tarefa depende de:</h4>
                      <div className="task-detail-dependencies-list">
                        {(task.dependencies as TaskDependency[]).map((dep) => (
                          <div key={dep.id} className="task-detail-dependency-item">
                            <span className="task-detail-dependency-type">{dep.type}</span>
                            <span className="task-detail-dependency-task">
                              {(dep.task as Task)?.title || dep.taskId}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {(task.dependents as TaskDependency[] | undefined)?.length > 0 && (
                    <div className="task-detail-dependencies-section">
                      <h4 className="task-detail-dependencies-title">Tarefas que dependem desta:</h4>
                      <div className="task-detail-dependencies-list">
                        {(task.dependents as TaskDependency[]).map((dep) => (
                          <div key={dep.id} className="task-detail-dependency-item">
                            <span className="task-detail-dependency-type">{dep.type}</span>
                            <span className="task-detail-dependency-task">
                              {(dep.dependentTask as Task)?.title || dep.dependentTaskId}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;
