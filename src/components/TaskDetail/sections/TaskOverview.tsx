import React from 'react';
import { 
  FaUser, FaCalendar, FaClock, FaProjectDiagram, 
  FaCodeBranch, FaRobot, FaCube, FaCubes,
  FaExclamationCircle, FaCheckCircle, FaPlayCircle,
  FaUserCircle, FaTag, FaInfoCircle
} from 'react-icons/fa';
import { Task } from '../../../types/tasks';

interface TaskOverviewProps {
  task: Task;
}

const TaskOverview: React.FC<TaskOverviewProps> = ({ task }) => {
  // Formatar data
  const formatDate = (dateString: string | Date | undefined) => {
    if (!dateString) return 'Não definida';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calcular dias restantes para o prazo
  const getDaysRemaining = () => {
    if (!task.deadline) return null;
    const deadline = new Date(task.deadline);
    const today = new Date();
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysRemaining = getDaysRemaining();

  return (
    <div className="task-overview">
      <div className="overview-grid">
        {/* Coluna 1: Informações básicas */}
        <div className="overview-section">
          <h3 className="section-title">
            <FaInfoCircle /> Informações Básicas
          </h3>
          
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label"><FaProjectDiagram /> Projeto:</span>
              <span className="info-value">{task.project?.name || 'Sem projeto'}</span>
            </div>
            
            <div className="info-item">
              <span className="info-label"><FaUser /> Criador:</span>
              <span className="info-value">{task.createdBy?.name || 'Desconhecido'}</span>
            </div>
            
            <div className="info-item">
              <span className="info-label"><FaUserCircle /> Responsável:</span>
              <span className="info-value">{task.assignedTo?.name || 'Não atribuído'}</span>
            </div>
            
            <div className="info-item">
              <span className="info-label"><FaCalendar /> Criada em:</span>
              <span className="info-value">{formatDate(task.createdAt)}</span>
            </div>
            
            <div className="info-item">
              <span className="info-label"><FaCalendar /> Atualizada em:</span>
              <span className="info-value">{formatDate(task.updatedAt)}</span>
            </div>
          </div>
        </div>

        {/* Coluna 2: Datas e prazos */}
        <div className="overview-section">
          <h3 className="section-title">
            <FaClock /> Prazos
          </h3>
          
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label"><FaCalendar /> Prazo:</span>
              <span className="info-value">{formatDate(task.deadline)}</span>
            </div>
            
            {daysRemaining !== null && (
              <div className="info-item">
                <span className="info-label">Dias restantes:</span>
                <span className={`info-value ${daysRemaining < 0 ? 'overdue' : daysRemaining <= 3 ? 'urgent' : 'normal'}`}>
                  {daysRemaining < 0 ? `Atrasado (${Math.abs(daysRemaining)} dias)` : `${daysRemaining} dias`}
                </span>
              </div>
            )}
            
            {task.lastExecutedAt && (
              <div className="info-item">
                <span className="info-label">Última execução:</span>
                <span className="info-value">{formatDate(task.lastExecutedAt)}</span>
              </div>
            )}
            
            {task.nextExecutionAt && (
              <div className="info-item">
                <span className="info-label">Próxima execução:</span>
                <span className="info-value">{formatDate(task.nextExecutionAt)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Coluna 3: Propriedades técnicas */}
        <div className="overview-section">
          <h3 className="section-title">
            <FaTag /> Propriedades
          </h3>
          
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label"><FaRobot /> Agente:</span>
              <span className="info-value">{task.agent || 'Não definido'}</span>
            </div>
            
            <div className="info-item">
              <span className="info-label">Domínio:</span>
              <span className="info-value">{task.domain || 'Não definido'}</span>
            </div>
            
            <div className="info-item">
              <span className="info-label"><FaCube /> Decomposta:</span>
              <span className="info-value">
                {task.isDecomposed ? <FaCheckCircle className="success" /> : <FaTimes className="error" />}
                {task.isDecomposed ? 'Sim' : 'Não'}
              </span>
            </div>
            
            <div className="info-item">
              <span className="info-label"><FaCubes /> Atômica:</span>
              <span className="info-value">
                {task.isAtomic ? <FaCheckCircle className="success" /> : <FaTimes className="error" />}
                {task.isAtomic ? 'Sim' : 'Não'}
              </span>
            </div>
            
            <div className="info-item">
              <span className="info-label"><FaPlayCircle /> Executando:</span>
              <span className="info-value">
                {task.isExecuting ? <FaCheckCircle className="success" /> : <FaTimes className="error" />}
                {task.isExecuting ? 'Sim' : 'Não'}
              </span>
            </div>
            
            <div className="info-item">
              <span className="info-label"><FaCodeBranch /> Filho executando:</span>
              <span className="info-value">
                {task.hasChildExecuting ? <FaCheckCircle className="success" /> : <FaTimes className="error" />}
                {task.hasChildExecuting ? 'Sim' : 'Não'}
              </span>
            </div>
          </div>
        </div>

        {/* Coluna 4: Recorrência */}
        {task.isRecurring && (
          <div className="overview-section">
            <h3 className="section-title">
              <FaClock /> Recorrência
            </h3>
            
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Tipo:</span>
                <span className="info-value">{task.recurrenceType || 'Não definido'}</span>
              </div>
              
              {task.recurrenceTimes && (
                <div className="info-item">
                  <span className="info-label">Horários:</span>
                  <span className="info-value">{task.recurrenceTimes}</span>
                </div>
              )}
              
              {task.recurrenceDays && (
                <div className="info-item">
                  <span className="info-label">Dias:</span>
                  <span className="info-value">{task.recurrenceDays}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Descrição */}
      {task.description && (
        <div className="description-section">
          <h3 className="section-title">Descrição</h3>
          <div className="description-content">
            {task.description}
          </div>
        </div>
      )}

      <style jsx>{`
        .task-overview {
          background: linear-gradient(135deg, #2d2d2d 0%, #3d3d3d 100%);
          border-radius: 12px;
          padding: 24px;
        }

        .overview-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 24px;
          margin-bottom: 32px;
        }

        .overview-section {
          background: #3d3d3d;
          border-radius: 8px;
          padding: 20px;
          border: 1px solid #404040;
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 18px;
          font-weight: 600;
          color: #ffffff;
          margin: 0 0 20px 0;
          padding-bottom: 12px;
          border-bottom: 1px solid #404040;
        }

        .section-title svg {
          color: #29b6f6;
        }

        .info-grid {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .info-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid #404040;
        }

        .info-item:last-child {
          border-bottom: none;
        }

        .info-label {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #a0a0a0;
          font-size: 14px;
          min-width: 140px;
        }

        .info-label svg {
          color: #29b6f6;
          font-size: 14px;
        }

        .info-value {
          color: #ffffff;
          font-size: 14px;
          font-weight: 500;
          text-align: right;
          max-width: 200px;
          word-break: break-word;
        }

        .info-value.overdue {
          color: #f44336;
          font-weight: 600;
        }

        .info-value.urgent {
          color: #ffa726;
          font-weight: 600;
        }

        .info-value.normal {
          color: #66bb6a;
        }

        .info-value .success {
          color: #66bb6a;
          margin-right: 6px;
        }

        .info-value .error {
          color: #f44336;
          margin-right: 6px;
        }

        .description-section {
          background: #3d3d3d;
          border-radius: 8px;
          padding: 20px;
          border: 1px solid #404040;
        }

        .description-content {
          color: #e0e0e0;
          font-size: 15px;
          line-height: 1.6;
          white-space: pre-wrap;
          padding: 16px;
          background: #2d2d2d;
          border-radius: 6px;
          border: 1px solid #404040;
        }

        @media (max-width: 768px) {
          .overview-grid {
            grid-template-columns: 1fr;
          }
          
          .info-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 4px;
          }
          
          .info-value {
            text-align: left;
            max-width: 100%;
          }
        }

        @media (max-width: 480px) {
          .task-overview {
            padding: 16px;
          }
          
          .overview-section {
            padding: 16px;
          }
          
          .section-title {
            font-size: 16px;
          }
        }
      `}</style>
    </div>
  );
};

export default TaskOverview;