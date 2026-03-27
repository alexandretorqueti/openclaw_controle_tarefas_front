import React from 'react';
import { FaPlay, FaCheck, FaTimes, FaClock, FaRobot, FaSpinner } from 'react-icons/fa';
import { TaskExecutionLog } from '../../../types/tasks';

interface TaskExecutionLogsProps {
  logs: TaskExecutionLog[];
}

const TaskExecutionLogs: React.FC<TaskExecutionLogsProps> = ({ logs }) => {
  // Formatar data
  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Formatar duração
  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}min`;
  };

  return (
    <div className="task-execution-logs">
      <div className="logs-header">
        <h3 className="section-title">
          <FaPlay /> Logs de Execução ({logs.length})
        </h3>
        <div className="logs-stats">
          <span className="stat-item">
            <FaCheck /> {logs.filter(l => l.success).length} sucessos
          </span>
          <span className="stat-item">
            <FaTimes /> {logs.filter(l => !l.success).length} falhas
          </span>
        </div>
      </div>

      {logs.length === 0 ? (
        <div className="no-logs">
          <FaPlay className="empty-icon" />
          <p>Nenhum log de execução encontrado.</p>
        </div>
      ) : (
        <div className="logs-list">
          {logs.map((log, index) => (
            <div key={log.id} className={`log-item ${log.success ? 'success' : 'failure'}`}>
              <div className="log-header">
                <div className="log-status">
                  {log.success ? (
                    <FaCheck className="status-icon success" />
                  ) : (
                    <FaTimes className="status-icon failure" />
                  )}
                  <span className="log-index">Execução #{logs.length - index}</span>
                </div>
                <div className="log-meta">
                  <span className="log-date">
                    <FaClock /> {formatDate(log.createdAt)}
                  </span>
                  <span className="log-duration">
                    {formatDuration(log.duration || 0)}
                  </span>
                </div>
              </div>

              <div className="log-content">
                <div className="log-details">
                  <div className="detail-item">
                    <span className="detail-label"><FaRobot /> Modelo:</span>
                    <span className="detail-value">{log.model || 'Não especificado'}</span>
                  </div>
                  
                  {log.agent && (
                    <div className="detail-item">
                      <span className="detail-label">Agente:</span>
                      <span className="detail-value">{log.agent}</span>
                    </div>
                  )}

                  {log.tokensUsed && (
                    <div className="detail-item">
                      <span className="detail-label">Tokens:</span>
                      <span className="detail-value">{log.tokensUsed.toLocaleString()}</span>
                    </div>
                  )}

                  {log.cost && (
                    <div className="detail-item">
                      <span className="detail-label">Custo:</span>
                      <span className="detail-value">${log.cost.toFixed(4)}</span>
                    </div>
                  )}
                </div>

                {log.output && (
                  <div className="log-output">
                    <div className="output-label">Saída:</div>
                    <pre className="output-content">{log.output}</pre>
                  </div>
                )}

                {log.error && (
                  <div className="log-error">
                    <div className="error-label">Erro:</div>
                    <pre className="error-content">{log.error}</pre>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .task-execution-logs {
          background: linear-gradient(135deg, #2d2d2d 0%, #3d3d3d 100%);
          border-radius: 12px;
          padding: 24px;
        }

        .logs-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid #404040;
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 20px;
          font-weight: 600;
          color: #ffffff;
          margin: 0;
        }

        .section-title svg {
          color: #29b6f6;
        }

        .logs-stats {
          display: flex;
          gap: 16px;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #a0a0a0;
          font-size: 14px;
        }

        .stat-item svg {
          font-size: 12px;
        }

        .stat-item:first-child svg {
          color: #66bb6a;
        }

        .stat-item:last-child svg {
          color: #f44336;
        }

        .no-logs {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          text-align: center;
          color: #a0a0a0;
        }

        .empty-icon {
          font-size: 48px;
          color: #404040;
          margin-bottom: 16px;
        }

        .no-logs p {
          font-size: 16px;
          margin: 0;
        }

        .logs-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .log-item {
          background: #3d3d3d;
          border-radius: 8px;
          padding: 20px;
          border: 1px solid #404040;
          transition: all 0.3s ease;
        }

        .log-item.success {
          border-left: 4px solid #66bb6a;
        }

        .log-item.failure {
          border-left: 4px solid #f44336;
        }

        .log-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 1px solid #404040;
        }

        .log-status {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .status-icon {
          font-size: 16px;
        }

        .status-icon.success {
          color: #66bb6a;
        }

        .status-icon.failure {
          color: #f44336;
        }

        .log-index {
          color: #ffffff;
          font-weight: 600;
          font-size: 14px;
        }

        .log-meta {
          display: flex;
          gap: 16px;
          color: #a0a0a0;
          font-size: 12px;
        }

        .log-date,
        .log-duration {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .log-content {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .log-details {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 12px;
        }

        .detail-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .detail-label {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #a0a0a0;
          font-size: 12px;
        }

        .detail-label svg {
          font-size: 12px;
          color: #29b6f6;
        }

        .detail-value {
          color: #ffffff;
          font-size: 14px;
          font-weight: 500;
        }

        .log-output,
        .log-error {
          background: #2d2d2d;
          border-radius: 6px;
          padding: 12px;
          border: 1px solid #404040;
        }

        .output-label,
        .error-label {
          color: #a0a0a0;
          font-size: 12px;
          font-weight: 600;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .error-label {
          color: #f44336;
        }

        .output-content,
        .error-content {
          color: #e0e0e0;
          font-size: 13px;
          line-height: 1.5;
          white-space: pre-wrap;
          word-break: break-word;
          margin: 0;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        }

        .error-content {
          color: #ff8a80;
        }

        @media (max-width: 768px) {
          .logs-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }
          
          .logs-stats {
            width: 100%;
            justify-content: space-between;
          }
          
          .log-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }
          
          .log-meta {
            width: 100%;
            justify-content: space-between;
          }
        }

        @media (max-width: 480px) {
          .task-execution-logs {
            padding: 16px;
          }
          
          .log-item {
            padding: 16px;
          }
          
          .log-details {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default TaskExecutionLogs;