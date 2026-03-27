import React from 'react';
import { FaLink, FaUnlink, FaExclamationTriangle, FaArrowRight, FaSyncAlt } from 'react-icons/fa';
import { TaskDependency } from '../../../types/tasks';

interface TaskDependenciesProps {
  dependencies: TaskDependency[];
  isFetching: boolean;
  onRemoveDependency: (dependencyId: string) => void;
}

const TaskDependencies: React.FC<TaskDependenciesProps> = ({
  dependencies,
  isFetching,
  onRemoveDependency
}) => {
  const getPrefix = (prefix: string) => {
    switch (prefix) {
      case 'PRE': return 'Pré-condição';
      case 'POST': return 'Pós-condição';
      default: return prefix;
    }
  };

  const getPrefixColor = (prefix: string) => {
    switch (prefix) {
      case 'PRE': return '#ff9800';
      case 'POST': return '#2196f3';
      default: return '#a0a0a0';
    }
  };

  if (isFetching) {
    return (
      <div className="loading-dependencies">
        <div className="loading-spinner" />
        <span>Carregando dependências...</span>
      </div>
    );
  }

  return (
    <div className="task-dependencies">
      <div className="dependencies-header">
        <h3 className="section-title">
          <FaLink /> Dependências da Tarefa
        </h3>
        <div className="dependencies-count">
          {dependencies.length} dependência(ões)
        </div>
      </div>

      {dependencies.length === 0 ? (
        <div className="no-dependencies">
          <FaLink className="empty-icon" />
          <p>Sem dependências configuradas.</p>
          <small>
            Esta tarefa não é dependente de outras tarefas e nenhuma outra tarefa depende dela.
          </small>
        </div>
      ) : (
        <div className="dependencies-list">
          {dependencies.map(dependency => (
            <div key={dependency.id} className="dependency-item">
              <div className="dependency-main">
                <div className="dependency-prefix">
                  <span 
                    className="prefix-badge"
                    style={{
                      backgroundColor: 'rgba(255, 152, 0, 0.2)',
                      color: getPrefixColor(dependency.taskConditionType || '')
                    }}
                  >
                    {dependency.taskConditionType || 'PRE'}
                  </span>
                </div>

                <div className="dependency-content">
                  <div className="linked-task-info">
                    <FaArrowRight className="link-icon" />
                    <span className="task-title">
                      {dependency.relatedTask?.name || 'N/A'}
                    </span>
                    {dependency.relatedTask?.id && (
                      <code className="task-id">
                        ID: {dependency.relatedTask.id}
                      </code>
                    )}
                  </div>

                  {dependency.taskConditionType === 'PRE' && dependency.relatedTask?.status && (
                    <div className="status-required">
                      <span className="label">Status necessário:</span>
                      <span className="status-badge success">
                        {dependency.relatedTask.status}
                      </span>
                    </div>
                  )}

                  {dependency.taskConditionType === 'POST' && dependency.relatedTask?.status && (
                    <div className="status-required">
                      <span className="label">Status necessário:</span>
                      <span className="status-badge warning">
                        {dependency.relatedTask.status}
                      </span>
                    </div>
                  )}

                  <div className="metadata">
                    {dependency.dependencyType && (
                      <span className="meta-tag">
                        <FaSyncAlt /> {dependency.dependencyType}
                      </span>
                    )}
                    {dependency.taskConditionType === 'POST' && (
                      <span className="meta-tag warning">
                        Executa após conclusão da tarefa
                      </span>
                    )}
                  </div>
                </div>

                <div className="dependency-actions">
                  {dependency.taskConditionType === 'PRE' ? (
                    <span className="action-tip">
                      Remover vínculo para permitir execução desta tarefa
                    </span>
                  ) : (
                    <span className="action-tip">
                      Remover vínculo para liberar esta tarefa
                    </span>
                  )}
                  <button
                    className="remove-button"
                    onClick={() => onRemoveDependency(dependency.id)}
                    title="Remover dependência"
                  >
                    <FaUnlink />
                  </button>
                </div>
              </div>

              {dependency.relatedTask?.name && (
                <div className="dependency-secondary">
                  <div className="task-badge">
                    <span className="badge-label">Tarefa relacionada:</span>
                    <span className="badge-value">
                      {dependency.relatedTask.name}
                    </span>
                  </div>
              </div>
              )}
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .task-dependencies {
          background: linear-gradient(135deg, #2d2d2d 0%, #3d3d3d 100%);
          border-radius: 12px;
          padding: 24px;
        }

        .loading-dependencies {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
          color: #a0a0a0;
          gap: 16px;
        }

        .loading-dependencies .loading-spinner {
          width: 24px;
          height: 24px;
          border: 3px solid #3d3d3d;
          border-top-color: #29b6f6;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .dependencies-header {
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

        .dependencies-count {
          background: #404040;
          padding: 4px 12px;
          border-radius: 12px;
          color: #a0a0a0;
          font-size: 12px;
          font-weight: 500;
        }

        .no-dependencies {
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

        .no-dependencies p {
          font-size: 16px;
          margin: 0 0 8px 0;
          color: #ffffff;
        }

        .no-dependencies small {
          font-size: 13px;
          color: #a0a0a0;
        }

        .dependencies-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .dependency-item {
          display: flex;
          flex-direction: column;
          gap: 12px;
          background: #3d3d3d;
          border-radius: 12px;
          border: 1px solid #404040;
          padding: 20px;
          transition: all 0.3s ease;
        }

        .dependency-item:hover {
          background: #424242;
          border-color: #29b6f6;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(41, 182, 246, 0.1);
        }

        .dependency-item::before {
          content: '';
          position: absolute;
          left: 0;
          top: 20px;
          bottom: 20px;
          width: 4px;
          background: var(--link-color, #29b6f6);
          border-radius: 0 4px 4px 0;
        }

        .dependency-main {
          display: flex;
          align-items: flex-start;
          gap: 16px;
        }

        .dependency-prefix {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 60px;
          padding-left: 12px;
          border-left: 2px solid #404040;
          text-align: center;
        }

        .prefix-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 6px;
          font-weight: 600;
          font-size: 12px;
          background: rgba(255, 152, 0, 0.1);
          color: #ff9800;
        }

        .prefix-badge.warning {
          background: rgba(33, 150, 243, 0.1);
          color: #2196f3;
        }

        .dependency-content {
          flex: 1;
          min-width: 0;
        }

        .linked-task-info {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }

        .link-icon {
          color: #29b6f6;
          font-size: 14px;
        }

        .task-title {
          color: #ffffff;
          font-weight: 600;
          font-size: 16px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .task-id {
          background: #404040;
          padding: 2px 8px;
          border-radius: 4px;
          color: #a0a0a0;
          font-size: 12px;
          font-family: 'Monaco', 'Menlo', monospace;
          font-weight: 500;
          margin-left: 8px;
        }

        .status-required {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: rgba(41, 182, 246, 0.08);
          border-radius: 6px;
          margin-top: 8px;
        }

        .status-required .label {
          color: #a0a0a0;
          font-size: 12px;
          font-weight: 500;
        }

        .status-badge {
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .status-badge.success {
          background: rgba(102, 187, 106, 0.2);
          color: #66bb6a;
        }

        .status-badge.warning {
          background: rgba(255, 152, 0, 0.2);
          color: #ff9800;
        }

        .metadata {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 8px;
        }

        .meta-tag {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          background: #404040;
          border-radius: 8px;
          color: #a0a0a0;
          font-size: 12px;
        }

        .meta-tag svg {
          font-size: 10px;
        }

        .meta-tag.warning {
          background: rgba(255, 152, 0, 0.15);
          color: #ff9800;
        }

        .dependency-actions {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 12px;
        }

        .action-tip {
          color: #f44336;
          font-size: 12px;
          font-style: italic;
        }

        .remove-button {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 6px 12px;
          background: rgba(244, 67, 54, 0.1);
          border: 1px solid rgba(244, 67, 54, 0.3);
          border-radius: 6px;
          color: #f44336;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .remove-button:hover {
          background: rgba(244, 67, 54, 0.2);
          border-color: #f44336;
          color: #ff5252;
        }

        .remove-button svg {
          font-size: 12px;
        }

        .dependency-secondary {
          display: flex;
          justify-content: flex-end;
          border-top: 1px solid #404040;
          padding-top: 12px;
        }

        .task-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 4px 12px;
          background: #404040;
          border-radius: 6px;
          color: #a0a0a0;
          font-size: 12px;
        }

        .badge-value {
          background: #3d3d3d;
          padding: 2px 8px;
          border-radius: 4px;
          color: #ffffff;
          font-size: 11px;
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .dependency-main {
            flex-direction: column;
          }

          .dependency-prefix {
            width: auto;
            padding-left: 0;
            border-left: none;
            padding-top: 12px;
            border-top: 2px solid #404040;
          }
        }

        @media (max-width: 480px) {
          .task-dependencies {
            padding: 16px;
          }

          .dependency-item {
            padding: 16px;
          }

          .task-id {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default TaskDependencies;