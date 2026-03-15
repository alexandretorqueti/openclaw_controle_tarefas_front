// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import './LogJarbas.css';
import { FaSync, FaDownload, FaClock, FaTerminal, FaExclamationTriangle } from 'react-icons/fa';
import apiService from '../services/api';

interface LogJarbasProps {
  onBack?: () => void;
}

const LogJarbas: React.FC<LogJarbasProps> = ({ onBack }) => {
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const logsContainerRef = useRef<HTMLDivElement>(null);

  // Polling interval in milliseconds (3 minutes = 180000ms)
  const POLLING_INTERVAL = 180000;

  // Fetch logs from API
  const fetchLogs = async () => {
    try {
      setIsRefreshing(true);
      setError(null);
      
      const response = await apiService.getMonitorLogs();
      
      if (response && response.logs) {
        setLogs(response.logs);
        setLastUpdated(response.lastUpdated || new Date().toISOString());
      } else {
        setLogs([]);
        setLastUpdated(new Date().toISOString());
      }
    } catch (err) {
      console.error('Error fetching logs:', err);
      setError('Falha ao carregar logs. Verifique se o servidor está rodando.');
      setLogs([]);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchLogs();
  }, []);

  // Setup polling interval
  useEffect(() => {
    if (!autoRefresh) return;

    const intervalId = setInterval(() => {
      fetchLogs();
    }, POLLING_INTERVAL);

    return () => clearInterval(intervalId);
  }, [autoRefresh]);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (logsContainerRef.current) {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
    }
  }, [logs]);

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Nunca';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (err) {
      return dateString;
    }
  };

  // Download logs as text file
  const downloadLogs = () => {
    const logText = logs.join('\n');
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jarbas-monitor-${new Date().toISOString().split('T')[0]}.log`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Parse log line for styling
  const parseLogLine = (line: string) => {
    const lowerLine = line.toLowerCase();
    
    // Determine color based on log content
    if (lowerLine.includes('error') || lowerLine.includes('❌') || lowerLine.includes('🚫')) {
      return { color: '#ff6b6b', icon: '❌' };
    } else if (lowerLine.includes('warning') || lowerLine.includes('⚠️')) {
      return { color: '#ffa94d', icon: '⚠️' };
    } else if (lowerLine.includes('success') || lowerLine.includes('✅') || lowerLine.includes('🎯')) {
      return { color: '#51cf66', icon: '✅' };
    } else if (lowerLine.includes('info') || lowerLine.includes('ℹ️') || lowerLine.includes('🔎')) {
      return { color: '#339af0', icon: 'ℹ️' };
    } else if (lowerLine.includes('debug') || lowerLine.includes('🐛')) {
      return { color: '#868e96', icon: '🐛' };
    } else {
      return { color: '#e9ecef', icon: '📝' };
    }
  };

  if (loading) {
    return (
      <div className="log-jarbas-loading">
        <FaTerminal size={48} className="log-jarbas-empty-icon" />
        <div className="log-jarbas-empty-title">Carregando logs do sistema...</div>
        <div>Conectando ao servidor de logs...</div>
      </div>
    );
  }

  return (
    <div className="log-jarbas-container">
      {/* Header */}
      <div className="log-jarbas-header">
        <div className="log-jarbas-title-group">
          <FaTerminal size={20} color="#0f0" />
          <h2 className="log-jarbas-title">
            Logs do Sistema - Monitor Jarbas
          </h2>
        </div>
        
        <div className="log-jarbas-status-group">
          {error && (
            <div className="log-jarbas-error">
              <FaExclamationTriangle size={14} />
              <span>{error}</span>
            </div>
          )}
          
          <div className="log-jarbas-timestamp">
            <FaClock size={12} />
            <span>Última atualização: {formatDate(lastUpdated)}</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="log-jarbas-controls">
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={fetchLogs}
            disabled={isRefreshing}
            className="log-jarbas-btn log-jarbas-btn-refresh"
          >
            <FaSync size={14} className={isRefreshing ? 'spin' : ''} />
            {isRefreshing ? 'Atualizando...' : 'Atualizar Agora'}
          </button>
          
          <button
            onClick={downloadLogs}
            className="log-jarbas-btn log-jarbas-btn-download"
          >
            <FaDownload size={14} />
            Download Logs
          </button>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <label className="log-jarbas-auto-refresh">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            <span>Atualização automática (3 min)</span>
          </label>
          
          <div style={{ fontSize: '12px', color: '#888' }}>
            {logs.length} linhas de log
          </div>
        </div>
      </div>

      {/* Logs Container */}
      <div
        ref={logsContainerRef}
        className="log-jarbas-logs-container"
      >
        {logs.length === 0 ? (
          <div className="log-jarbas-empty">
            <FaTerminal size={48} className="log-jarbas-empty-icon" />
            <div className="log-jarbas-empty-title">Nenhum log disponível</div>
            <div>
              {error 
                ? 'Erro ao conectar ao servidor de logs'
                : 'O arquivo de logs está vazio ou não existe'}
            </div>
          </div>
        ) : (
          logs.map((line, index) => {
            const { color, icon } = parseLogLine(line);
            return (
              <div
                key={index}
                className="log-jarbas-log-line"
                style={{ color: color }}
              >
                <span style={{ color: 'var(--text-secondary)', marginRight: '8px' }}>
                  [{String(index + 1).padStart(4, '0')}]
                </span>
                <span style={{ marginRight: '8px' }}>{icon}</span>
                {line}
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="log-jarbas-footer">
        <div className="log-jarbas-footer-left">
          Sistema de Monitoramento Jarbas • Arquivo: /home/alexandrebragatorqueti/projetos/jarbas-monitor.log
        </div>
        <div className="log-jarbas-footer-right">
          {autoRefresh ? '🔄 Atualização automática ativa' : '⏸️ Atualização manual'}
        </div>
      </div>

      {/* CSS for spinner animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default LogJarbas;