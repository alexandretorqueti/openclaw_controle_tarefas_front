import React from 'react';
import { FaClock, FaUser, FaEdit, FaArrowRight } from 'react-icons/fa';
import { TaskHistory as TaskHistoryType } from '../../../types/tasks';

interface TaskHistoryProps {
  history: TaskHistoryType[];
  isLoading: boolean;
}

const TaskHistory: React.FC<TaskHistoryProps> = ({ history, isLoading }) => {
  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return { time: 'Agora mesmo', type: 'just-now' };
    if (diffMins < 60) return { time: `${diffMins} min`, type: 'minutes' };
    if (diffHours < 24) return { time: `${diffHours} h`, type: 'hours' };
    if (diffDays < 7) return { time: `${diffDays} dias`, type: 'days' };
    
    return { 
      time: date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      type: 'date' as const
    };
  };

  if (isLoading) {
    return (
      <div className="loading-history">
        <FaClock className="loading-spinner" />
        <span>Carregando histórico...</span>
      </div>
    );
  }

  return (
    <div className="task-history">
      <div className="history-header">
        <h3 className="section-title">
          <FaEdit /> Histórico de Alterações
        </h3>
        <div className="history-count">
          {history.length} registro(s)
        </div>
      </div>

      {history.length === 0 ? (
        <div className="no-history">
          <FaClock className="empty-icon" />
          <p>Nenhuma alteração registrada.</p>
          <small>A primeira alteração aparecerá aqui quando você modificar a tarefa.</small>
        </div>
      ) : (
        <div className="history-list">
          {history.map((item, index) => {
            const timeInfo = formatDate(item.changedAt);
            const isRecent = ['just-now', 'minutes', 'hours'].includes(timeInfo.type);
            const isToday = history[index - 1] && 
              history[index - 1].changedAt.split('T')[0] === item.changedAt.split('T')[0];

            return (
              <div key={item.id} className={`history-item ${isRecent ? 'recent' : ''} ${isToday ? 'same-day' : ''}`}>
                <div className="item-left">
                  <div className="timestamp">
                    {timeInfo.time}
                    {!isToday && (
                      <span className="date-extra">
                        {new Date(item.changedAt).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })}
                      </span>
                    )}
                  </div>
                </div>

                <div className="item-content">
                  <div className="user-info">
                    <FaUser className="user-avatar" />
                    <span className="user-name">
                      {item.changedByEmail || item.changedByUserName || 'Usuário'}
                    </span>
                  </div>
                  
                  <div className="change-details">
                    {item.changeDetails && Object.keys(item.changeDetails).map(key => {
                      const change = item.changeDetails![key];
                      const fieldName = key.charAt(0).toUpperCase() + key.slice(1);
                      const oldValue = change.old
                        ? `[${Array.isArray(change.old) ? change.old.join(', ') : change.old}]`
                        : 'vazio';
                      const newValue = change.new
                        ? `[${Array.isArray(change.new) ? change.new.join(', ') : change.new}]`
                        : 'vazio';
                      
                      return (
                        <div key={key} className="change-detail">
                          <FaArrowRight className="arrow-icon" />
                          <span className="field-name">{fieldName}:</span>
                          <span className="value-change">
                            <del className="old-value">{oldValue}</del>
                            <ins className="new-value">{newValue}</ins>
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style jsx>{`
        .task-history {
          background: linear-gradient(135deg, #2d2d2d 0%, #3d3d3d 100%);
          border-radius: 12px;
          padding: 24px;
        }

        .loading-history {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
          color: #a0a0a0;
        }

        .loading-spinner {
          animation: spin 1s linear infinite;
          font-size: 24px;
          margin-right: 12px;
          color: #29b6f6;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .history-header {
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

        .history-count {
          background: #404040;
          padding: 4px 12px;
          border-radius: 12px;
          color: #a0a0a0;
          font-size: 12px;
          font-weight: 500;
        }

        .no-history {
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

        .no-history p {
          font-size: 16px;
          margin: 0 0 8px 0;
          color: #ffffff;
        }

        .no-history small {
          font-size: 13px;
          color: #a0a0a0;
        }

        .history-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .history-item {
          display: flex;
          gap: 20px;
          padding: 16px;
          background: #3d3d3d;
          border-radius: 8px;
          border: 1px solid #404040;
          transition: all 0.3s ease;
        }

        .history-item.recent {
          border-left: 4px solid #29b6f6;
        }

        .history-item.same-day {
          border-top: 1px solid #404040;
        }

        .history-item:hover {
          background: #424242;
          transform: translateX(4px);
        }

        .item-left {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100px;
        }

        .timestamp {
          position: relative;
          padding-right: 12px;
          color: #29b6f6;
          font-weight: 600;
          padding-bottom: 8px;
        }

        .timestamp::after {
          content: '';
          position: absolute;
          left: 0;
          top: 16px;
          bottom: 0;
          width: 2px;
          background: #404040;
          margin-left: 4px;
        }

        .date-extra {
          display: block;
          font-size: 11px;
          color: #a0a0a0;
          font-weight: normal;
          margin-top: 2px;
        }

        .item-content {
          flex: 1;
          padding-top: 8px;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }

        .user-avatar {
          color: #29b6f6;
          font-size: 16px;
        }

        .user-name {
          color: #ffffff;
          font-weight: 600;
          font-size: 14px;
        }

        .change-details {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 8px;
        }

        .change-detail {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
        }

        .arrow-icon {
          color: #a0a0a0;
          font-size: 12px;
        }

        .field-name {
          color: #a0a0a0;
          font-weight: 500;
        }

        .value-change {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .old-value,
        .new-value {
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 12px;
        }

        .old-value {
          background: rgba(244, 67, 54, 0.15);
          color: #f44336;
          font-size: 11px;
        }

        .new-value {
          background: rgba(102, 187, 106, 0.15);
          color: #66bb6a;
          font-size: 11px;
        }

        @media (max-width: 768px) {
          .history-item {
            flex-direction: column;
            gap: 12px;
          }

          .item-left {
            width: auto;
            flex-direction: row;
            gap: 12px;
            padding: 0;
          }

          .timestamp::after {
            display: none;
          }

          .item-content {
            padding: 0;
          }
        }

        @media (max-width: 480px) {
          .task-history {
            padding: 16px;
          }

          .history-list {
            gap: 12px;
          }

          .history-item {
            padding: 12px;
          }
        }
      `}</style>
    </div>
  );
};

export default TaskHistory;