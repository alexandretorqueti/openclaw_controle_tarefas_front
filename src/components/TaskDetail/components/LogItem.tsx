/**
 * @AGENT-NOTE: Componente para item individual de log de execução.
 * Mostra timestamp, model, success/failure badge, duration, errorMessage se falha.
 * Cores dinâmicas: verde sucesso, vermelho falha.
 * Expansível para detalhes completos.
 * Hover effects, copy to clipboard para error.
 * Tema escuro.
 */
import React, { useState } from 'react';
import type { TaskExecutionLog } from '../../../../types/tasks';

interface LogItemProps {
  log: TaskExecutionLog;
}

const LogItem: React.FC<LogItemProps> = ({ log }) => {
  const [expanded, setExpanded] = useState(false);
  const formatDuration = (ms: number) => `${(ms / 1000).toFixed(2)}s`;
  const formatDate = (date: Date | string) => new Date(date).toLocaleString('pt-BR');

  const isSuccess = log.success;
  const hasError = !log.success && log.errorMessage;

  return (
    <div className={`log-item ${isSuccess ? 'success' : 'failure'}`}>
      <div className="log-header" onClick={() => setExpanded(!expanded)}>
        <div className="log-badge">
          {isSuccess ? '✅' : '❌'}
        </div>
        <div className="log-timestamp">{formatDate(log.startedAt)}</div>
        <div className="log-model">{log.model}</div>
        <div className="log-duration">{log.durationMs ? formatDuration(log.durationMs) : '-'}</div>
        <div className="log-expand-icon">{expanded ? '▲' : '▼'}</div>
      </div>
      
      {expanded && (
        <div className="log-details">
          {log.finishedAt && <div>Finalizado: {formatDate(log.finishedAt)}</div>}
          {log.executionNotes && <div>Notas: {log.executionNotes}</div>}
          {hasError && (
            <div className="log-error">
              <strong>Erro:</strong> {log.errorMessage}
              <button className="copy-btn" onClick={() => navigator.clipboard.writeText(log.errorMessage || '')}>
                📋
              </button>
            </div>
          )}
          {log.exitCode && <div>Código de saída: {log.exitCode}</div>}
        </div>
      )}
    </div>
  );
};

export default LogItem;
