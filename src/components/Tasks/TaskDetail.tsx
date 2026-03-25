import React, { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import {
  Task,
  User,
  Project,
  Status,
  Priority,
  Nullable,
  TaskComment,
  TaskAttachment,
  TaskDependency,
  TaskHistory as TaskHistoryRecord,
} from '../../types';
import './TaskDetail.css';

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

const AgentSelect: React.FC<{
  selectedAgent: string;
  availableAgents: any[];
  onChange: (agent: string) => void;
  placeholder?: string;
}> = ({ selectedAgent, availableAgents, onChange, placeholder = 'Selecione um agente...' }) => {
  return (
    <select
      value={selectedAgent}
      onChange={(e) => onChange(e.target.value)}
      className="task-select-option"
      style={{ width: '120px' }}
    >
      <option value="">{placeholder}</option>
      {availableAgents.map(agent => (
        <option key={agent.id} value={agent.id}>{agent.name} ({agent.type.toUpperCase()})</option>
      ))}
    </select>
  );
};

const InfoCard: React.FC<{
  label: string;
  value: React.ReactNode;
  className?: string;
}> = ({ label, value, className = '' }) => {
  return (
    <div className={`task-info-card ${className}`}>
      <div className="task-info-header">
        <span className="task-info-label">{label}</span>
      </div>
      <div className="task-info-value">{value}</div>
    </div>
  );
};

const SectionHeader: React.FC<{
  title: string;
  action?: React.ReactNode;
}> = ({ title, action }) => {
  return (
    <div className="task-section-header">
      <h3 className="task-section-title">{title}</h3>
      {action && <div className="task-section-action">{action}</div>}
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

interface TaskDetailProps {
  task: Task;
  tasks: Task[];
  users: User[];
  statuses: Status[];
  priorities: Priority[];
  projects: Project[];
  agents: any[];
  currentUser: User | null;
  onBack: () => void;
  onUpdateTask: (id: string, taskData: Partial<Task>) => Promise<Task>;
  onDeleteTask: (id: string) => Promise<void>;
  onToggleCompletion: (id: string) => Promise<void>;
}

const TaskDetail: React.FC<TaskDetailProps> = ({
  task,
  tasks,
  users,
  statuses,
  priorities,
  projects,
  agents,
  currentUser,
  onBack,
  onUpdateTask,
  onDeleteTask,
  onToggleCompletion,
}) => {
  // ==================== STATE ====================
  const [activeTab, setActiveTab] = useState<'overview' | 'comments' | 'history' | 'logs' | 'dependencies'>('overview');
  
  // Estados para gerenciamento de comentários
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);
  
  // Estado para edição inline do campo 'agent'
  const [inlineEditAgent, setInlineEditAgent] = useState<{
    editing: boolean;
    value: string;
  }>({
    editing: false,
    value: '',
  });
  
  // Estados para gerenciamento de edição de status e assignedTo
  const [inlineEdit, setInlineEdit] = useState<{
    editingField: 'status' | 'assignedTo' | null;
  }>({ editingField: null });
  
  // Estado para formulário de edição manual
  const [editForm, setEditForm] = useState<{
    isEditing: boolean;
    editedTask: Partial<Task>;
    isLoading: boolean;
    error: Nullable<string>;
    agents: any[];
  }>({
    isEditing: false,
    editedTask: {},
    isLoading: false,
    error: null,
    agents: [],
  });
  
  // Computed values
  const subtasksCount = useMemo(() => {
    return task.subtasks?.length || 0;
  }, [task.subtasks]);

  const commentsCount = comments.length;
  const logsCount = (task.executionLogs as any[] | undefined)?.length || 0;
  const historyCount = (task.history as TaskHistoryRecord[] | undefined)?.length || 0;
  const dependenciesCount = (task.dependencies as TaskDependency[] | undefined)?.length || 0;
  const dependentsCount = (task.dependents as TaskDependency[] | undefined)?.length || 0;

  const isOverdue = useMemo(() => {
    const deadline = new Date(task.deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return !task.isCompleted && deadline < today;
  }, [task.deadline, task.isCompleted]);

  // Handlers de comentários
  const handleAddComment = async () => {
    if (!newCommentText.trim()) {
      setCommentError('O comentário não pode estar vazio');
      return;
    }

    if (!currentUser) {
      setCommentError('Você precisa estar logado para comentar');
      return;
    }

    setIsSubmittingComment(true);
    setCommentError(null);

    try {
      const commentData = {
        text: newCommentText.trim(),
      };

      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/tasks/${task.id}/comments`,
        commentData,
        { headers: { 'Content-Type': 'application/json' } }
      );
      
      const newComment = response.data;
      
      // Atualizar estado localmente
      setComments(prev => [...prev, newComment]);
      
      // Limpar campo e atualizar tab
      setNewCommentText('');
      setActiveTab('comments');
      
    } catch (error: any) {
      console.error('Erro ao adicionar comentário:', error);
      setCommentError('Erro ao adicionar comentário. Tente novamente.');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este comentário?')) {
      return;
    }

    setIsSubmittingComment(true);
    setCommentError(null);

    try {
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/tasks/${task.id}/comments/${commentId}`);
      
      // Atualizar estado localmente
      setComments(prev => prev.filter(c => c.id !== commentId));
      
    } catch (error) {
      console.error('Erro ao excluir comentário:', error);
      setCommentError('Erro ao excluir comentário. Tente novamente.');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleEditCommentStart = (commentId: string, commentText: string) => {
    setEditingCommentId(commentId);
    setEditingCommentText(commentText);
  };

  const handleSaveCommentEdit = async () => {
    if (!editingCommentText.trim()) {
      setCommentError('O comentário não pode estar vazio');
      return;
    }

    setIsSubmittingComment(true);
    setCommentError(null);

    try {
      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/api/tasks/${task.id}/comments/${editingCommentId}`,
        { text: editingCommentText.trim() },
        { headers: { 'Content-Type': 'application/json' } }
      );
      
      // Atualizar estado localmente
      setComments(prev => prev.map(c => 
        c.id === editingCommentId ? { ...c, text: editingCommentText.trim() } : c
      ));
      
      // Limpar estado de edição
      setEditingCommentId(null);
      setEditingCommentText('');
      
    } catch (error) {
      console.error('Erro ao editar comentário:', error);
      setCommentError('Erro ao editar comentário. Tente novamente.');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleCancelCommentEdit = () => {
    setEditingCommentId(null);
    setEditingCommentText('');
  };

  const handleDeleteCommentWithConfirm = async (commentId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este comentário?')) {
      return;
    }
    await handleDeleteComment(commentId);
  };
  
  // Handlers para edição inline do campo 'agent'
  const handleInlineAgentChange = async (newAgent: string) => {
    try {
      await onUpdateTask(task.id, { agent: newAgent || null });
      setInlineEditAgent({ editing: false, value: newAgent });
    } catch (error) {
      console.error('Falha ao atualizar o agente da tarefa:', error);
      alert('Falha ao atualizar o agente da tarefa.');
      setInlineEditAgent(prev => ({ ...prev, editing: false }));
    }
  };

  const formatDeadline = (date: Nullable<string>) => {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' }) +
      ' ' + d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0');
  };

  const formatDate = (date: Nullable<string>) => {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' });
  };
  
  // Handler para iniciar edição da tarefa
  const handleEditTask = () => {
    setEditForm({
      isEditing: true,
      editedTask: {
        title: task.title,
        description: task.description,
        deadline: task.deadline,
        statusId: task.statusId,
        assignedToId: task.assignedToId,
        priorityId: task.priorityId,
        projectId: task.projectId,
        agent: task.agent,
        isCompleted: task.isCompleted,
        subtasks: task.subtasks || [],
      },
      isLoading: false,
      error: null,
      agents: agents.map(a => ({ id: a.id, name: a.name, type: a.type })),
    });
  };
  
  const handleSaveEdit = async () => {
    try {
      await onUpdateTask(task.id, editForm.editedTask);
      setEditForm(prev => ({ ...prev, isEditing: false, error: null }));
    } catch (error: any) {
      setEditForm(prev => ({ ...prev, error: error.message }));
    }
  };
  
  const handleCancelEdit = () => {
    setEditForm(prev => ({
      ...prev,
      isEditing: false,
      editedTask: {},
      error: null,
    }));
  };

  // Renderization
  return (
    <div className="task-detail-container">
      <div className="task-detail-content">
        <button className="back-button" onClick={onBack}>
          ← Voltar
        </button>
        
        <h2 className="task-title">{task.title}</h2>
        
        <div className="task-detail-overview">
          <InfoCard label="Status" value={<StatusBadge status={statuses.find(s => s.id === task.statusId)} size="sm" />} />
          <InfoCard label="Prioridade" value={<span className="priority-{priorities.find(p => p.id === task.priorityId)?.name.toLowerCase()}">{priorities.find(p => p.id === task.priorityId)?.name}</span>} />
          <InfoCard label="Projeto" value={projects.find(p => p.id === task.projectId)?.name} />
          <InfoCard label="Responsável" value={<span className="user-link">{users.find(u => u.id === task.assignedToId)?.name}</span>} />
          
          {/* Campo Agent com edição inline */}
          <InfoCard label="Agente" className="agent-field" action={
            inlineEditAgent.editing ? (
              <AgentSelect
                selectedAgent={inlineEditAgent.value}
                availableAgents={agents}
                onChange={handleInlineAgentChange}
                placeholder="Selecionando..."
              />
            ) : (
              <span className="agent-value">{agents.find(a => a.id === task.agent)?.type}</span>
            )
          } />
          
          <InfoCard label="Deadline" value={formatDeadline(task.deadline)} />
          <InfoCard label="Início" value={formatDeadline(task.startDate)} />
          <InfoCard label="Subtarefas" value={subtasksCount} />
        </div>
        
        <div className="task-actions">
          <button 
            className={task.isCompleted ? 'completed-button' : 'primary-button'}
            onClick={() => onToggleCompletion(task.id)}
          >
            {task.isCompleted ? 'Marcar como Pendente' : 'Marcar como Concluída'}
          </button>
          <button className="edit-button" onClick={handleEditTask}>Editar</button>
          <button className="danger-button" onClick={() => onDeleteTask(task.id)}>Excluir</button>
        </div>
        
        {/* Tabs */}
        <div className="task-detail-tabs">
          <TabButton label="Visão Geral" isActive={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
          <TabButton label="Comentários" count={commentsCount} isActive={activeTab === 'comments'} onClick={() => setActiveTab('comments')} />
          <TabButton label="Histórico" count={historyCount} isActive={activeTab === 'history'} onClick={() => setActiveTab('history')} />
          <TabButton label="Logs" count={logsCount} isActive={activeTab === 'logs'} onClick={() => setActiveTab('logs')} />
          <TabButton label="Dependências" count={dependenciesCount + dependentsCount} isActive={activeTab === 'dependencies'} onClick={() => setActiveTab('dependencies')} />
        </div>
        
        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="task-detail-tab-content">
            <SectionHeader title="Visão Geral da Tarefa" />
            <p>ID: {task.id.substr(0, 8)}</p>
            <p>Descrição: {task.description || 'Nenhuma descrição.'}</p>
            
            {/* Agendas */}
            {task.agendas?.length > 0 && (
              <div className="task-detail-agendas">
                <h4 style={{ marginTop: '16px' }}>Agendas</h4>
                {task.agendas.map(agenda => (
                  <div key={agenda.id} className="agenda-item">
                    <span>{agenda.time}</span>
                    <span>{agenda.subject}</span>
                    <span style={{ color: 'var(--accent-color)' }}>{agenda.details}</span>
                  </div>
                ))}
              </div>
            )}
            
            {/* Checklists */}
            {task.checklists?.length > 0 && (
              <div className="task-detail-checklists">
                <h4 style={{ marginTop: '16px' }}>Checklists</h4>
                {task.checklists.map(checklist => (
                  <div key={checklist.id} className="checklist-item">
                    <input
                      type="checkbox"
                      id={`checklist-${checklist.id}`}
                      defaultChecked={checklist.completed}
                    />
                    <label htmlFor={`checklist-${checklist.id}`}>
                      {checklist.text}
                      {!checklist.completed && ' ●'}
                    </label>
                  </div>
                ))}
              </div>
            )}
            
            {/* Formulário de edição completo */}
            {editForm.isEditing && (
              <div className="task-edit-form">
                <h4>Editando Tarefa</h4>
                <textarea
                  value={editForm.editedTask.title}
                  onChange={(e) => setEditForm(prev => ({
                    ...prev,
                    editedTask: { ...prev.editedTask, title: e.target.value },
                  }))}
                  placeholder="Título"
                  rows={2}
                  className="edit-input"
                />
                
                <div className="edit-fields-row">
                  <div className="edit-field">
                    <label>Status:</label>
                    <select
                      value={editForm.editedTask.statusId || task.statusId}
                      onChange={(e) => setEditForm(prev => ({
                        ...prev,
                        editedTask: { ...prev.editedTask, statusId: e.target.value },
                      }))}
                      className="edit-select"
                    >
                      {statuses.map(status => (
                        <option key={status.id} value={status.id}>{status.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="edit-field">
                    <label>Atribuído a:</label>
                    <select
                      value={editForm.editedTask.assignedToId || task.assignedToId || ''}
                      onChange={(e) => setEditForm(prev => ({
                        ...prev,
                        editedTask: { ...prev.editedTask, assignedToId: e.target.value },
                      }))}
                      className="edit-select"
                    >
                      <option value="">{'-- Não atribuído --'}</option>
                      {users.map(user => (
                        <option key={user.id} value={user.id}>{user.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="edit-field">
                    <label>Agente:</label>
                    <select
                      value={editForm.editedTask.agent || ''}
                      onChange={(e) => setEditForm(prev => ({
                        ...prev,
                        editedTask: { ...prev.editedTask, agent: e.target.value },
                      }))}
                      className="edit-select"
                    >
                      <option value="">{'-- Sem agente --'}</option>
                      {agents.map(agent => (
                        <option key={agent.id} value={agent.id}>{agent.name} ({agent.type})</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <textarea
                  value={editForm.editedTask.description}
                  onChange={(e) => setEditForm(prev => ({
                    ...prev,
                    editedTask: { ...prev.editedTask, description: e.target.value },
                  }))}
                  placeholder="Descrição"
                  rows={3}
                  className="edit-input"
                />
                
                <div className="edit-actions">
                  <button
                    onClick={handleSaveEdit}
                    disabled={editForm.isLoading}
                    className="edit-save"
                  >
                    {editForm.isLoading ? 'Salvando...' : 'Salvar'}
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="edit-cancel"
                  >
                    Cancelar
                  </button>
                </div>
                
                {editForm.error && (
                  <div className="edit-error">
                    {editForm.error}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        
        {/* Tab: Comments */}
        {activeTab === 'comments' && (
          <div className="task-detail-comments">
            <SectionHeader title="Comentários da Tarefa" />
            
            {/* Formulário para adicionar comentário */}
            <div className="task-detail-comment-form">
              <textarea
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder="Digite seu comentário..."
                rows={3}
                className="task-detail-comment-input"
                disabled={isSubmittingComment}
              />
              <div className="task-detail-comment-actions">
                <button
                  onClick={handleAddComment}
                  disabled={isSubmittingComment || !newCommentText.trim()}
                  className="task-detail-comment-submit"
                >
                  {isSubmittingComment ? 'Enviando...' : 'Adicionar Comentário'}
                </button>
              </div>
              {commentError && (
                <div className="task-detail-comment-error">
                  {commentError}
                </div>
              )}
            </div>
        
            {/* Lista de comentários */}
            {comments.length === 0 ? (
              <div className="task-detail-empty-state">
                <p>Nenhum comentário encontrado para esta tarefa.</p>
              </div>
            ) : (
              <div className="task-detail-comments-list">
                {comments.map((comment) => (
                  <div key={comment.id} className="task-detail-comment-item">
                    <div className="task-detail-comment-header">
                      <div className="task-detail-comment-infos">
                        <span className="task-detail-comment-author">{comment.author}</span>
                        <span className="task-detail-comment-date">{formatDate(comment.createdAt)}</span>
                      </div>
                      
                      {/* Botões de ação (editar/excluir) */}
                      {currentUser?.id === comment.createdBy && (
                        <div className="task-detail-comment-actions">
                          <button
                            onClick={() => handleEditCommentStart(comment.id, comment.text)}
                            className="task-detail-comment-edit"
                            title="Editar comentário"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDeleteCommentWithConfirm(comment.id)}
                            className="task-detail-comment-delete"
                            title="Excluir comentário"
                          >
                            🗑️
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {/* Conteúdo do comentário ou formulário de edição */}
                    {editingCommentId === comment.id ? (
                      <div className="task-detail-comment-edit-form">
                        <textarea
                          value={editingCommentText}
                          onChange={(e) => setEditingCommentText(e.target.value)}
                          rows={3}
                          className="task-detail-comment-edit-input"
                          autoFocus
                        />
                        <div className="task-detail-comment-edit-actions">
                          <button
                            onClick={handleSaveCommentEdit}
                            disabled={isSubmittingComment}
                            className="task-detail-comment-edit-save"
                          >
                            Salvar
                          </button>
                          <button
                            onClick={handleCancelCommentEdit}
                            disabled={isSubmittingComment}
                            className="task-detail-comment-edit-cancel"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="task-detail-comment-text">
                        {comment.text}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Tab: History */}
        {activeTab === 'history' && (
          <div className="task-detail-history">
            <SectionHeader title="Histórico da Tarefa" />
            {historyCount === 0 ? (
              <p>Nenhum registro de histórico.</p>
            ) : (
              /* Renderização do histórico */
              <div className="history-list"></div>
            )}
          </div>
        )}
        
        {/* Tab: Logs */}
        {activeTab === 'logs' && (
          <div className="task-detail-logs">
            <SectionHeader title="Logs de Execução" />
            {logsCount === 0 ? (
              <p>Nenhum log registrado.</p>
            ) : (
              <div style={{ marginTop: '12px' }}>
                {/* Renderização dos logs */}
              </div>
            )}
          </div>
        )}
        
        {/* Tab: Dependencies */}
        {activeTab === 'dependencies' && (
          <div className="task-detail-dependencies">
            <SectionHeader title="Dependências da Tarefa" />
            {/* Renderização das dependências */}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskDetail;