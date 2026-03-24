import React from 'react';
import './TaskSummary.css';
import { Task } from '../../types/tasks';

interface TaskSummaryProps {
  task: Task;
  onNavigateToSubtask?: (subtaskId: string) => void;
  onNavigateToParent?: () => void;
}

const TaskSummary: React.FC<TaskSummaryProps> = ({ task, onNavigateToSubtask, onNavigateToParent }) => {
  // Função para formatar data no formato brasileiro
  const formatDate = (date: Date | string): string => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('pt-BR');
  };

  // Função para formatar hora no formato brasileiro
  const formatTime = (date: Date | string): string => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  // Função para obter cor de status com base no status da tarefa
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'completed':
        return '#32cd32';
      case 'in-progress':
        return '#4169e1';
      case 'pending':
        return '#ffd700';
      case 'cancelled':
        return '#ff4500';
      default:
        return '#999';
    }
  };

  // Função para determinar a cor do status para exibição
  const getDisplayStatus = (task: Task): string => {
    if (task.isCompleted) return 'Concluída';
    if (task.hasChildExecuting) return 'Filhos em Execução';
    if (task.isExecuting) return 'Em Execução';
    if (task.statusId === 'cancelled') return 'Cancelada';
    return 'Pendente';
  };

  // Função para obter a cor do badge de status
  const getStatusBadgeColor = (task: Task): string => {
    if (task.isCompleted) return 'completed';
    if (task.hasChildExecuting) return 'child-executing';
    if (task.isExecuting) return 'executing';
    if (task.statusId === 'cancelled') return 'cancelled';
    return 'pending';
  };

  return (
    <div className="task-summary">
      <div className="task-header">
        <div className="task-title-container">
          <h2 className="task-title">{task.title}</h2>
          <div className="task-actions">
            {onNavigateToParent && (
              <button className="btn-back" onClick={onNavigateToParent}>
                Voltar para tarefa principal
              </button>
            )}
          </div>
        </div>
        <div className="task-meta">
          <div className="task-status-badge {getStatusBadgeColor(task)}">
            {getDisplayStatus(task)}
          </div>
        </div>
      </div>

      <div className="task-description">
        <h3>Descrição</h3>
        <p>{task.description || 'Nenhuma descrição fornecida'}</p>
      </div>

      <div className="task-details-grid">
        <div className="task-detail-item">
          <h4>Status</h4>
          <div className="status-display">
            <span 
              className="status-indicator" 
              style={{ backgroundColor: getStatusColor(getDisplayStatus(task)) }}
            ></span>
            {getDisplayStatus(task)}
          </div>
        </div>

        <div className="task-detail-item">
          <h4>Prioridade</h4>
          <div className="priority-display">
            {task.priority?.name || 'Não definida'}
          </div>
        </div>

        <div className="task-detail-item">
          <h4>Prazo</h4>
          <div className="deadline-display">
            {task.deadline ? `${formatDate(task.deadline)} às ${formatTime(task.deadline)}` : 'Não definido'}
          </div>
        </div>

        <div className="task-detail-item">
          <h4>Criado em</h4>
          <div className="created-at-display">
            {task.createdAt ? `${formatDate(task.createdAt)} às ${formatTime(task.createdAt)}` : 'Não definido'}
          </div>
        </div>
      </div>

      {task.createdBy?.avatar && (
        <div className="task-creator">
          <h4>Criador</h4>
          <div className="creator-info">
            <img 
              src={task.createdBy?.avatar} 
              alt={task.createdBy?.name} 
              className="creator-avatar"
            />
            <span className="creator-name">{task.createdBy?.name || 'Desconhecido'}</span>
          </div>
        </div>
      )}

      {/* 
      // Tags não estão definidas na interface Task atualmente
      // Comentado temporariamente para evitar erros de compilação
      {task.tags && task.tags.length > 0 && (
        <div className="task-tags">
          <h4>Tags</h4>
          <div className="tags-list">
            {task.tags.map((tag, index) => (
              <span key={index} className="tag-badge">{tag}</span>
            ))}
          </div>
        </div>
      )}
      */}

      {task.subtasks && task.subtasks.length > 0 && (
        <div className="task-subtasks">
          <h4>Subtarefas</h4>
          <div className="subtasks-list">
            {task.subtasks.map(subtask => (
              <div 
                key={subtask.id} 
                className="subtask-item"
                onClick={() => onNavigateToSubtask && onNavigateToSubtask(subtask.id)}
              >
                <div className="subtask-info">
                  <h5 className="subtask-title">{subtask.title}</h5>
                  <div className="subtask-meta">
                    <span className={`subtask-status ${subtask.isCompleted ? 'completed' : 'pending'}`}>
                      {subtask.isCompleted ? 'Concluída' : 'Pendente'}
                    </span>
                    <span className="subtask-priority">
                      {subtask.priority?.name || 'Não definida'}
                    </span>
                  </div>
                </div>
                {subtask.deadline && (
                  <div className="subtask-deadline">
                    {formatDate(subtask.deadline)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="task-footer">
        {onNavigateToSubtask && (
          <button className="btn-view-subtasks" onClick={() => {
            // Ação para visualizar todas as subtarefas, pode ser implementada conforme necessário
          }}>
            Visualizar Todas as Subtarefas
          </button>
        )}
      </div>
    </div>
  );
};

export default TaskSummary;