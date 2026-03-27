import React from 'react';
import { FaArrowLeft, FaEdit, FaTrash, FaCopy, FaShareAlt, FaPrint } from 'react-icons/fa';
import { Task } from '../../../types/tasks';

interface TaskHeaderProps {
  task: Task;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const TaskHeader: React.FC<TaskHeaderProps> = ({ task, onBack, onEdit, onDelete }) => {
  // Formatar data
  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Copiar ID da tarefa para clipboard
  const handleCopyId = () => {
    navigator.clipboard.writeText(task.id);
    // TODO: Mostrar notificação de sucesso
    alert('ID copiado para a área de transferência!');
  };

  // Compartilhar tarefa
  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    // TODO: Mostrar notificação de sucesso
    alert('Link copiado para a área de transferência!');
  };

  // Imprimir detalhes da tarefa
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="task-header">
      {/* Botão voltar e título */}
      <div className="header-main">
        <button onClick={onBack} className="header-back-button">
          <FaArrowLeft /> Voltar
        </button>
        
        <div className="header-title-section">
          <h1 className="task-title">{task.title}</h1>
          <div className="task-meta">
            <span className="task-id" onClick={handleCopyId} title="Clique para copiar ID">
              ID: {task.id.substring(0, 8)}...
            </span>
            <span className="task-project">
              Projeto: {task.project?.name || 'Sem projeto'}
            </span>
            <span className="task-date">
              Criada em: {formatDate(task.createdAt)}
            </span>
          </div>
        </div>
      </div>

      {/* Ações principais */}
      <div className="header-actions">
        <button onClick={handleCopyId} className="action-icon" title="Copiar ID">
          <FaCopy />
        </button>
        
        <button onClick={handleShare} className="action-icon" title="Compartilhar">
          <FaShareAlt />
        </button>
        
        <button onClick={handlePrint} className="action-icon" title="Imprimir">
          <FaPrint />
        </button>
        
        <button onClick={onEdit} className="action-icon edit" title="Editar tarefa">
          <FaEdit />
        </button>
        
        <button onClick={onDelete} className="action-icon delete" title="Excluir tarefa">
          <FaTrash />
        </button>
      </div>

      {/* Status e prioridade em destaque */}
      <div className="header-status">
        <div className="status-badge">
          <span className="badge-label">Status:</span>
          <span className={`badge-value status-${task.status?.name?.toLowerCase() || 'unknown'}`}>
            {task.status?.name || 'Desconhecido'}
          </span>
        </div>
        
        <div className="priority-badge">
          <span className="badge-label">Prioridade:</span>
          <span className={`badge-value priority-${task.priority?.name?.toLowerCase() || 'medium'}`}>
            {task.priority?.name || 'Média'}
          </span>
        </div>
        
        {task.isCompleted && (
          <div className="completed-badge">
            <span className="badge-label">Concluída:</span>
            <span className="badge-value completed">
              <FaCheck /> Sim
            </span>
          </div>
        )}
      </div>

      <style jsx>{`
        .task-header {
          background: linear-gradient(135deg, #2d2d2d 0%, #3d3d3d 100%);
          border-radius: 12px;
          padding: 24px;
          border: 1px solid #404040;
          margin-bottom: 20px;
        }

        .header-main {
          display: flex;
          align-items: flex-start;
          gap: 20px;
          margin-bottom: 20px;
        }

        .header-back-button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: #3d3d3d;
          border: 1px solid #404040;
          color: #ffffff;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .header-back-button:hover {
          background: #4a4a4a;
          transform: translateY(-1px);
        }

        .header-title-section {
          flex: 1;
        }

        .task-title {
          font-size: 28px;
          font-weight: 700;
          color: #ffffff;
          margin: 0 0 12px 0;
          line-height: 1.2;
        }

        .task-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          color: #a0a0a0;
          font-size: 14px;
        }

        .task-id {
          cursor: pointer;
          padding: 4px 8px;
          background: #3d3d3d;
          border-radius: 4px;
          transition: background 0.3s ease;
        }

        .task-id:hover {
          background: #4a4a4a;
        }

        .header-actions {
          display: flex;
          gap: 12px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }

        .action-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background: #3d3d3d;
          border: 1px solid #404040;
          color: #ffffff;
          border-radius: 8px;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .action-icon:hover {
          background: #4a4a4a;
          transform: translateY(-2px);
        }

        .action-icon.edit {
          background: linear-gradient(135deg, #1976d2 0%, #2196f3 100%);
          border-color: #1976d2;
        }

        .action-icon.delete {
          background: linear-gradient(135deg, #d32f2f 0%, #f44336 100%);
          border-color: #d32f2f;
        }

        .header-status {
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
        }

        .status-badge,
        .priority-badge,
        .completed-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: #3d3d3d;
          border-radius: 20px;
          border: 1px solid #404040;
        }

        .badge-label {
          color: #a0a0a0;
          font-size: 14px;
        }

        .badge-value {
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        /* Cores de status */
        .status-pending { background-color: #ffa726; color: #000; }
        .status-in-progress { background-color: #29b6f6; color: #fff; }
        .status-completed { background-color: #66bb6a; color: #fff; }
        .status-failed { background-color: #f44336; color: #fff; }
        .status-blocked { background-color: #ab47bc; color: #fff; }
        .status-unknown { background-color: #3d3d3d; color: #a0a0a0; }

        /* Cores de prioridade */
        .priority-low { background-color: #4caf50; color: #fff; }
        .priority-medium { background-color: #ff9800; color: #000; }
        .priority-high { background-color: #f44336; color: #fff; }
        .priority-critical { background-color: #d32f2f; color: #fff; }

        .completed {
          background-color: #66bb6a;
          color: #fff;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        @media (max-width: 768px) {
          .header-main {
            flex-direction: column;
            gap: 16px;
          }
          
          .task-title {
            font-size: 24px;
          }
          
          .task-meta {
            flex-direction: column;
            gap: 8px;
          }
          
          .header-status {
            flex-direction: column;
            gap: 12px;
          }
        }
      `}</style>
    </div>
  );
};

export default TaskHeader;