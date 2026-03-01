import React from 'react';
import { FaSearch } from 'react-icons/fa';
import { LogItem } from './LogItem';
import { LogListProps } from './types';
import './styles.css';

export const LogList: React.FC<LogListProps> = ({ 
  logs, 
  loading, 
  onLogClick,
  emptyMessage = "Nenhum log encontrado"
}) => {
  if (loading) {
    return (
      <div className="log-list-loading">
        <div className="loading-spinner"></div>
        <div>Carregando logs...</div>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="log-list-empty">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="log-list">
      {logs.map((log) => (
        <LogItem
          key={log.id}
          log={log}
          onClick={() => onLogClick(log)}
        />
      ))}
    </div>
  );
};