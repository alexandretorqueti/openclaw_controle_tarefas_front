// @ts-nocheck
import React, { useState } from 'react';
import { Task, User, Status, Priority, Project, Agent } from '../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FaUser, FaCalendarAlt, FaFlag, FaListAlt, FaEdit, FaTrash, FaCheck, FaTimes, FaProjectDiagram, FaExclamationTriangle, FaTasks, FaAtom } from 'react-icons/fa';
import { safeParseDate, safeFormatDate } from '../utils/dateUtils';

interface TaskCardProps {
  task: Task;
  users: User[];
  statuses: Status[];
  priorities: Priority[];
  agents?: Agent[];
  projects: Project[];
  onTaskClick: (task: Task) => void;
  onViewSubtasks?: (task: Task) => void;
  onUpdateTask?: (id: string, taskData: Partial<Task>) => Promise<Task>;
  onDeleteTask?: (id: string) => Promise<void>;
  onToggleCompletion?: (id: string) => Promise<void>;
  compact?: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({ 
  task, 
  users, 
  statuses, 
  priorities,
  agents = [] as Agent[], 
  projects,
  onTaskClick,
  onViewSubtasks,
  onUpdateTask,
  onDeleteTask,
  onToggleCompletion,
  compact = false 
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAssignedUser = () => task.assignedTo || users.find(user => user.id === task.assignedToId);
  const getStatus = () => task.status || statuses.find(status => status.id === task.statusId);
  const getPriority = () => task.priority || priorities.find(priority => priority.id === task.priorityId);
  const getCreator = () => task.createdBy || users.find(user => user.id === task.createdById);
  const getProject = () => task.project || projects.find(project => project.id === task.projectId);

  const assignedUser = getAssignedUser();
  const status = getStatus();
  const priority = getPriority();
  const creator = getCreator();
  const project = getProject();

  const deadlineDate = safeParseDate(task.deadline);
  const isOverdue = !task.isCompleted && deadlineDate && deadlineDate < new Date();
  const formattedDeadline = safeFormatDate(task.deadline, "dd 'de' MMMM 'de' yyyy") || 'Sem prazo definido';
  
  const hasSubtasks = (task as any).subtasks?.length > 0 || (task as any)._count?.subtasks > 0;

  const handleToggleCompletion = async (e: React.MouseEvent) => {
    e.stopPropagation();
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

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onDeleteTask) return;
    
    if (window.confirm('Tem certeza que deseja excluir esta tarefa?')) {
      setIsDeleting(true);
      setError(null); // Limpa erros anteriores
      
      try {
        await onDeleteTask(task.id);
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

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.stopPropagation();
    if (!onUpdateTask) return;
    
    setIsUpdating(true);
    setError(null); // Limpa erros anteriores
    
    try {
      await onUpdateTask(task.id, { statusId: e.target.value });
    } catch (error: any) {
      console.error('Failed to update task status:', error);
      
      // Extrai mensagem de erro amigável
      let errorMessage = 'Erro ao atualizar status da tarefa.';
      
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
      setIsUpdating(false);
    }
  };


  const handleAssignedToChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.stopPropagation();
    if (!onUpdateTask) return;
    
    setIsUpdating(true);
    setError(null); // Limpa erros anteriores
    
    try {
      const newValue = e.target.value === '' ? null : e.target.value;
      await onUpdateTask(task.id, { assignedToId: newValue });
    } catch (error: any) {
      console.error('Failed to update task assigned user:', error);
      
      // Extrai mensagem de erro amigável
      let errorMessage = 'Erro ao atualizar usuário atribuído da tarefa.';
      
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
      setIsUpdating(false);
    }
  };

  const handlePriorityChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.stopPropagation();
    if (!onUpdateTask) return;
    
    setIsUpdating(true);
    setError(null); // Limpa erros anteriores
    
    try {
      await onUpdateTask(task.id, { priorityId: e.target.value });
    } catch (error: any) {
      console.error('Failed to update task priority:', error);
      
      // Extrai mensagem de erro amigável
      let errorMessage = 'Erro ao atualizar prioridade da tarefa.';
      
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
      setIsUpdating(false);
    }
  };

    const handleAgentChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.stopPropagation();
    if (!onUpdateTask) return;
    
    setIsUpdating(true);
    setError(null); // Limpa erros anteriores
    
    try {
      const newValue = e.target.value === '' ? null : e.target.value;
      await onUpdateTask(task.id, { agent: newValue });
    } catch (error: any) {
      console.error('Failed to update task agent:', error);
      
      // Extrai mensagem de erro amigável
      let errorMessage = 'Erro ao atualizar agente da tarefa.';
      
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
      setIsUpdating(false);
    }
  };

if (compact) {
    return (
      <div 
        className="task-card-compact"
        onClick={() => onTaskClick(task)}
        style={{
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          padding: '12px',
          backgroundColor: 'var(--bg-card)',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          position: 'relative'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = '0 3px 6px rgba(0,0,0,0.15)';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        {/* Exibição de erro */}
        {error && (
          <div style={{
            backgroundColor: 'rgba(231, 76, 60, 0.1)',
            border: '1px solid var(--danger-color)',
            color: 'var(--danger-color)',
            padding: '8px',
            borderRadius: '4px',
            marginBottom: '8px',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <FaExclamationTriangle size={12} />
            <span>{error}</span>
          </div>
        )}

        {/* Status indicator */}
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          backgroundColor: status?.colorCode || 'var(--text-secondary)'
        }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <button
                onClick={handleToggleCompletion}
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '4px',
                  border: `2px solid ${task.isCompleted ? 'var(--success-color)' : 'var(--border-color)'}`,
                  backgroundColor: task.isCompleted ? 'var(--success-color)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  flexShrink: 0
                }}
              >
                {task.isCompleted && <FaCheck size={10} color="white" />}
              </button>
              <h3 style={{
                fontSize: '14px',
                fontWeight: 600,
                color: 'var(--text-primary)',
                margin: 0,
                textDecoration: task.isCompleted ? 'line-through' : 'none',
                opacity: task.isCompleted ? 0.7 : 1
              }}>
                {task.title || 'Sem título'}
              </h3>
              
              {task.isAtomic && (
                <div 
                  title="Tarefa Atômica"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    color: '#10b981',
                    borderRadius: '50%',
                    width: '16px',
                    height: '16px',
                    cursor: 'help',
                    flexShrink: 0
                  }}
                >
                  <FaAtom size={10} />
                </div>
              )}
            </div>

            <p style={{
              fontSize: '12px',
              color: 'var(--text-secondary)',
              marginBottom: '8px',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}>
              {task.description || 'Sem descrição'}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              {project && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <FaProjectDiagram size={10} color="var(--text-secondary)" />
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                    {project.name}
                  </span>
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <FaCalendarAlt size={10} color={isOverdue ? 'var(--danger-color)' : 'var(--text-secondary)'} />
                <span style={{
                  fontSize: '11px',
                  color: isOverdue ? 'var(--danger-color)' : 'var(--text-secondary)',
                  fontWeight: isOverdue ? 600 : 400
                }}>
                  {formattedDeadline}
                </span>
              </div>

              {assignedUser && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <FaUser size={10} color="var(--text-secondary)" />
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                    {assignedUser.name.split(' ')[0]}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Priority badge */}
        {priority && (
          <div style={{
            position: 'absolute',
            bottom: '8px',
            right: '8px',
            padding: '2px 8px',
            backgroundColor: priority.weight >= 3 ? 'var(--danger-color)' : priority.weight === 2 ? 'var(--accent-color)' : 'var(--accent-color)',
            color: 'white',
            borderRadius: '12px',
            fontSize: '10px',
            fontWeight: 500
          }}>
            {priority.name}
          </div>
        )}
      </div>
    );
  }

  // Full version
  return (
    <div 
      className="task-card"
      onClick={(e) => {
        // Only navigate to task details if we didn't click on an interactive element
        const target = e.target as HTMLElement;
        const isInteractive = target.tagName === 'SELECT' || target.tagName === 'BUTTON' || target.closest('select, button');
        if (!isInteractive) {
          onTaskClick(task);
        }
      }}
      style={{
        border: `1px solid ${isOverdue ? 'var(--danger-color)' : 'var(--border-color)'}`,
        borderRadius: '12px',
        padding: '20px',
        backgroundColor: 'var(--bg-card)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        position: 'relative',
        borderLeft: `4px solid ${status?.colorCode || 'var(--text-secondary)'}`
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Exibição de erro */}
      {error && (
        <div style={{
          backgroundColor: 'rgba(231, 76, 60, 0.1)',
          border: '1px solid var(--danger-color)',
          color: 'var(--danger-color)',
          padding: '10px',
          borderRadius: '6px',
          marginBottom: '12px',
          fontSize: '13px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <FaExclamationTriangle size={14} />
          <span>{error}</span>
        </div>
      )}

      {/* Completion toggle */}
      <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
        <button
          onClick={handleToggleCompletion}
          style={{
            width: '24px',
            height: '24px',
            borderRadius: '6px',
            border: `2px solid ${task.isCompleted ? 'var(--success-color)' : 'var(--border-color)'}`,
            backgroundColor: task.isCompleted ? 'var(--success-color)' : 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            if (!task.isCompleted) {
              e.currentTarget.style.borderColor = 'var(--accent-color)';
              e.currentTarget.style.backgroundColor = 'var(--bg-card)';
            }
          }}
          onMouseLeave={(e) => {
            if (!task.isCompleted) {
              e.currentTarget.style.borderColor = 'var(--border-color)';
              e.currentTarget.style.backgroundColor = 'transparent';
            }
          }}
        >
          {task.isCompleted && <FaCheck size={14} color="white" />}
        </button>
      </div>

      {/* Task header */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: 700,
            color: 'var(--text-primary)',
            margin: 0,
            textDecoration: task.isCompleted ? 'line-through' : 'none',
            opacity: task.isCompleted ? 0.7 : 1,
            flex: 1
          }}>
            {task.title || 'Sem título'}
          </h3>
          
          {task.isAtomic && (
            <div 
              title="Tarefa Atômica: Uma tarefa indivisível, de escopo fechado, com objetivo e passos claros, pronta para execução."
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 10px',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                color: '#10b981',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '16px',
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                cursor: 'help'
              }}
            >
              <FaAtom size={12} />
              Atômica
            </div>
          )}
          
          {priority && (
            <div style={{
              padding: '4px 12px',
              backgroundColor: priority.weight >= 3 ? 'var(--danger-color)' : priority.weight === 2 ? 'var(--accent-color)' : 'var(--accent-color)',
              color: 'white',
              borderRadius: '16px',
              fontSize: '12px',
              fontWeight: 600
            }}>
              {priority.name}
            </div>
          )}
        </div>

        {project && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <FaProjectDiagram size={14} color="var(--text-secondary)" />
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 500 }}>
              {project.name}
            </span>
          </div>
        )}

        <p style={{
          fontSize: '14px',
          color: 'var(--text-secondary)',
          lineHeight: 1.6,
          marginBottom: '16px'
        }}>
          {task.description || 'Esta tarefa não possui descrição.'}
        </p>
      </div>

      {/* Task metadata */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '20px',
        padding: '16px',
        backgroundColor: 'var(--bg-input)',
        borderRadius: '8px'
      }}>
        {/* Status */}
        <div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Status</div>
          {onUpdateTask ? (
            <select
              value={task.statusId}
              onChange={handleStatusChange}
              disabled={isUpdating}
              style={{
                padding: '8px 12px',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                fontSize: '14px',
                backgroundColor: 'var(--bg-input)',
                color: 'var(--text-primary)',
                width: '100%',
                cursor: 'pointer'
              }}
            >
              {statuses.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: status?.colorCode || 'var(--text-secondary)'
              }} />
              <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>
                {status?.name || 'Desconhecido'}
              </span>
            </div>
          )}
        </div>

        {/* Priority */}
        <div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Prioridade</div>
          {onUpdateTask ? (
            <select
              value={task.priorityId}
              onChange={handlePriorityChange}
              disabled={isUpdating}
              style={{
                padding: '8px 12px',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                fontSize: '14px',
                backgroundColor: 'var(--bg-input)',
                color: 'var(--text-primary)',
                width: '100%',
                cursor: 'pointer'
              }}
            >
              {priorities.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          ) : (
            <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>
              {priority?.name || 'Desconhecida'}
            </span>
          )}
        </div>

        {/* Deadline */}
        <div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Prazo</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaCalendarAlt size={14} color={isOverdue ? 'var(--danger-color)' : 'var(--text-secondary)'} />
            <span style={{
              fontSize: '14px',
              fontWeight: 500,
              color: isOverdue ? 'var(--danger-color)' : 'var(--text-primary)'
            }}>
              {formattedDeadline}
              {isOverdue && ' (Atrasado)'}
            </span>
          </div>
        </div>

        {/* Assigned to */}
        <div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Atribuído a</div>
          {onUpdateTask ? (
            <select
              value={task.assignedToId || ''}
              onChange={handleAssignedToChange}
              disabled={isUpdating}
              style={{
                padding: '8px 12px',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                fontSize: '14px',
                backgroundColor: 'var(--bg-input)',
                color: 'var(--text-primary)',
                width: '100%',
                cursor: 'pointer'
              }}
            >
              <option value="">Não atribuído</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {assignedUser?.avatarUrl ? (
                <img 
                  src={assignedUser.avatarUrl} 
                  alt={assignedUser.name}
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    objectFit: 'cover'
                  }}
                />
              ) : (
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--bg-card)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <FaUser size={12} color="var(--accent-color)" />
                </div>
              )}
              <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>
                {assignedUser?.name || 'Não atribuído'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Task footer */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: '16px',
        borderTop: '1px solid var(--border-color)'
      }}>
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
          Criado por: {creator?.name || 'Desconhecido'} • 
          {safeFormatDate(task.createdAt, " dd/MM/yyyy") || 'Data inválida'}
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {onDeleteTask && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              style={{
                padding: '8px 12px',
                backgroundColor: isDeleting ? 'var(--text-secondary)' : 'var(--danger-color)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                cursor: isDeleting ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => {
                if (!isDeleting) e.currentTarget.style.backgroundColor = 'var(--danger-color)';
              }}
              onMouseLeave={(e) => {
                if (!isDeleting) e.currentTarget.style.backgroundColor = 'var(--danger-color)';
              }}
            >
              <FaTrash size={12} />
              {isDeleting ? 'Excluindo...' : 'Excluir'}
            </button>
          )}
          
          {onToggleCompletion && (
            <button
              onClick={handleToggleCompletion}
              style={{
                padding: '8px 12px',
                backgroundColor: task.isCompleted ? 'var(--accent-color)' : 'var(--success-color)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = task.isCompleted ? 'var(--accent-color)' : 'var(--success-color)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = task.isCompleted ? 'var(--accent-color)' : 'var(--success-color)'}
            >
              <FaCheck size={12} />
              {task.isCompleted ? 'Reabrir' : 'Concluir'}
            </button>
          )}
          
          {/* Botões de Subtarefas (condicionais ao status de hasSubtasks) */}
          {onViewSubtasks && (
            hasSubtasks ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onViewSubtasks(task);
                }}
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#8b5cf6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#7c3aed'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#8b5cf6'}
                title="Ver subtarefas desta tarefa"
              >
                <FaTasks size={12} />
                Subtarefas ({(task as any).subtasks?.length || (task as any)._count?.subtasks || ''})
              </button>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onViewSubtasks(task);
                }}
                style={{
                  padding: '8px 12px',
                  backgroundColor: 'transparent',
                  color: 'var(--text-secondary)',
                  border: '1px dashed var(--border-color)',
                  borderRadius: '6px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#8b5cf6';
                  e.currentTarget.style.color = '#8b5cf6';
                  e.currentTarget.style.backgroundColor = 'rgba(139, 92, 246, 0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
                title="Criar subtarefas para esta tarefa"
              >
                <FaTasks size={12} />
                Criar subtarefas
              </button>
            )
          )}
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onTaskClick(task);
            }}
            style={{
              padding: '8px 12px',
              backgroundColor: 'var(--accent-color)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-color)'}
          >
            <FaEdit size={12} />
            Detalhes
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;