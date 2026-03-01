import React from 'react';
import { FaSearch } from 'react-icons/fa';
import { LogItemProps } from './types';
import { getLogStyle, formatMethod, formatStatusCode, formatDate } from './utils.tsx';
import './styles.css';

export const LogItem: React.FC<LogItemProps> = ({ log, onClick }) => {
  const style = getLogStyle(log);

  return (
    <div className="log-item" style={{ borderLeftColor: style.color, backgroundColor: style.bgColor }}>
      <div className="log-item-header">
        <span className="log-icon">{style.icon}</span>
        <span className="log-error-type" style={{ color: style.color }}>
          {log.errorType}
        </span>
        <span className="log-separator">•</span>
        <span className="log-timestamp">
          {formatDate(log.timestamp)}
        </span>
      </div>

      <div className="log-item-details">
        {formatMethod(log.method)}
        <span className="log-endpoint">{log.endpoint}</span>
        {formatStatusCode(log.statusCode)}
        <span className="log-response-time">({log.responseTime}ms)</span>
      </div>

      <div className="log-message">
        {log.message}
      </div>

      <div className="log-item-actions">
        <button
          className="details-button"
          onClick={onClick}
        >
          <FaSearch size={10} />
          Detalhes
        </button>
      </div>

      {log.stackTrace && (
        <div className="log-stack-trace">
          {log.stackTrace}
        </div>
      )}

      {log.user && (
        <div className="log-user-info">
          Usuário: {log.user.name} ({log.user.email})
        </div>
      )}
    </div>
  );
};