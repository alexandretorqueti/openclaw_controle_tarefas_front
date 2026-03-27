/**
 * @AGENT-NOTE: Item individual do histórico de alterações.
 * Mostra timestamp, user, mudança de status (old->new), notes.
 * Badge de status old/new com cores.
 * Expansível para detalhes completos.
 * Tema escuro, timeline visual com linha conectando itens.
 */
import React, { useState } from 'react';
import type { TaskHistory } from '../../../../types/tasks';

interface HistoryItemProps {
  history: TaskHistory;
}

const HistoryItem: React.FC<HistoryItemProps> = ({ history }) => {
  const [expanded, setExpanded] = useState(false);
  const formatDate = (date: Date | string) => new Date(date).toLocaleString('pt-BR');

  return (
    <div className="history-item">
      <div className="history-timeline">
        <div className="history-dot"></div>
        <div className="history-line"></div>
      </div>
      <div className="history-content" onClick={() => setExpanded(!expanded)}>
        <div className="history-header">
          <div className="history-badges">
            <span className="status-badge old-status" style={{ backgroundColor: '#f39c12' }}>
              {history.oldStatusId}
            </span>
            <span className="arrow">→</span>
            <span className="status-badge new-status" style={{ backgroundColor: '#27ae60' }}>
              {history.newStatusId}
            </span>
          </div>
          <div className="history-user">{history.user?.name || 'Sistema'}</div>
          <div className="history-date">{formatDate(history.timestamp)}</div>
        </div>
        {history.notes && (
          <div className="history-notes">{history.notes}</div>
        )}
      </div>
      {expanded && (
        <div className="history-details">
          {/* Detalhes adicionais se disponíveis */}
          <p>Alterações completas pendentes de implementação backend.</p>
        </div>
      )}
    </div>
  );
};

export default HistoryItem;
