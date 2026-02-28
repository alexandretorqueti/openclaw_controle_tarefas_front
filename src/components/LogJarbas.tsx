import React, { useState, useEffect, useRef } from 'react';
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
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        backgroundColor: '#000',
        color: '#0f0',
        fontFamily: 'monospace',
        padding: '20px'
      }}>
        <FaTerminal size={48} style={{ marginBottom: '20px', opacity: 0.7 }} />
        <div style={{ fontSize: '16px', marginBottom: '10px' }}>Carregando logs do sistema...</div>
        <div style={{ fontSize: '12px', color: '#888' }}>Conectando ao servidor de logs...</div>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: '#000',
      color: '#0f0',
      fontFamily: 'monospace',
      borderRadius: '8px',
      overflow: 'hidden',
      border: '1px solid #333',
      minHeight: '500px',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#111',
        padding: '16px 20px',
        borderBottom: '1px solid #333',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <FaTerminal size={20} color="#0f0" />
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#0f0' }}>
            Logs do Sistema - Monitor Jarbas
          </h2>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ff6b6b' }}>
              <FaExclamationTriangle size={14} />
              <span style={{ fontSize: '12px' }}>{error}</span>
            </div>
          )}
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#888' }}>
            <FaClock size={12} />
            <span>Última atualização: {formatDate(lastUpdated)}</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div style={{
        backgroundColor: '#111',
        padding: '12px 20px',
        borderBottom: '1px solid #333',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={fetchLogs}
            disabled={isRefreshing}
            style={{
              padding: '8px 16px',
              backgroundColor: '#0f0',
              color: '#000',
              border: 'none',
              borderRadius: '4px',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontFamily: 'monospace',
              fontWeight: 'bold',
              opacity: isRefreshing ? 0.7 : 1
            }}
          >
            <FaSync size={14} className={isRefreshing ? 'spin' : ''} />
            {isRefreshing ? 'Atualizando...' : 'Atualizar Agora'}
          </button>
          
          <button
            onClick={downloadLogs}
            style={{
              padding: '8px 16px',
              backgroundColor: 'transparent',
              color: '#0f0',
              border: '1px solid #0f0',
              borderRadius: '4px',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontFamily: 'monospace'
            }}
          >
            <FaDownload size={14} />
            Download Logs
          </button>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px' }}>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              style={{ cursor: 'pointer' }}
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
        style={{
          flex: 1,
          padding: '20px',
          overflowY: 'auto',
          backgroundColor: '#000',
          fontSize: '13px',
          lineHeight: '1.5',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word'
        }}
      >
        {logs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
            <FaTerminal size={48} style={{ marginBottom: '20px', opacity: 0.5 }} />
            <div style={{ fontSize: '16px', marginBottom: '10px' }}>Nenhum log disponível</div>
            <div style={{ fontSize: '12px' }}>
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
                style={{
                  marginBottom: '4px',
                  padding: '4px 0',
                  borderBottom: '1px solid #222',
                  color: color
                }}
              >
                <span style={{ color: '#666', marginRight: '8px' }}>
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
      <div style={{
        backgroundColor: '#111',
        padding: '8px 20px',
        borderTop: '1px solid #333',
        fontSize: '11px',
        color: '#666',
        display: 'flex',
        justifyContent: 'space-between'
      }}>
        <div>
          Sistema de Monitoramento Jarbas • Arquivo: /home/alexandrebragatorqueti/projetos/jarbas-monitor.log
        </div>
        <div>
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