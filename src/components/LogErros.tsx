import React, { useState, useEffect, useRef } from 'react';
import { FaSync, FaDownload, FaClock, FaTerminal, FaExclamationTriangle, FaFilter, FaCalendarAlt } from 'react-icons/fa';
import apiService from '../services/api';

interface LogErrosProps {
  onBack?: () => void;
}

interface ErrorLog {
  id: string;
  timestamp: string;
  level: string;
  endpoint: string;
  method: string;
  statusCode: number;
  message: string;
  errorType: string;
  stackTrace: string;
  requestBody: string;
  requestQuery: string;
  requestParams: string;
  headers: string;
  clientIp: string;
  userId: string | null;
  correlationId: string;
  parentLogId: string | null;
  responseTime: number;
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
}

const LogErros: React.FC<LogErrosProps> = ({ onBack }) => {
  const [logs, setLogs] = useState<ErrorLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const logsContainerRef = useRef<HTMLDivElement>(null);

  // Polling interval in milliseconds (5 minutes = 300000ms)
  const POLLING_INTERVAL = 300000;

  // Fetch error logs from API
  const fetchErrorLogs = async () => {
    try {
      setIsRefreshing(true);
      setError(null);
      
      const filters: Record<string, any> = {};
      if (dateRange.startDate) filters.startDate = dateRange.startDate;
      if (dateRange.endDate) filters.endDate = dateRange.endDate;
      
      const response = await apiService.getErrorLogs(filters);
      
      if (response && response.logs) {
        setLogs(response.logs);
        setLastUpdated(response.timestamp || new Date().toISOString());
      } else {
        setLogs([]);
        setLastUpdated(new Date().toISOString());
      }
    } catch (err) {
      console.error('Error fetching error logs:', err);
      setError('Falha ao carregar logs de erro. Verifique se o servidor está rodando.');
      setLogs([]);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchErrorLogs();
  }, []);

  // Setup polling interval
  useEffect(() => {
    if (!autoRefresh) return;

    const intervalId = setInterval(() => {
      fetchErrorLogs();
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

  // Format date for input fields (YYYY-MM-DD)
  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  // Apply date filters
  const applyFilters = () => {
    fetchErrorLogs();
    setShowFilters(false);
  };

  // Clear date filters
  const clearFilters = () => {
    setDateRange({ startDate: '', endDate: '' });
    fetchErrorLogs();
    setShowFilters(false);
  };

  // Set date range to today
  const setToday = () => {
    const today = formatDateForInput(new Date());
    setDateRange({ startDate: today, endDate: today });
  };

  // Set date range to last 7 days
  const setLast7Days = () => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 7);
    setDateRange({
      startDate: formatDateForInput(start),
      endDate: formatDateForInput(end)
    });
  };

  // Set date range to last 30 days
  const setLast30Days = () => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    setDateRange({
      startDate: formatDateForInput(start),
      endDate: formatDateForInput(end)
    });
  };

  // Download logs as JSON file
  const downloadLogs = () => {
    const logData = {
      exportedAt: new Date().toISOString(),
      filters: dateRange,
      logs: logs
    };
    
    const blob = new Blob([JSON.stringify(logData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `error-logs-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Parse log line for styling
  const getLogStyle = (log: ErrorLog) => {
    // Determine color based on error type
    switch (log.errorType) {
      case 'ValidationError':
        return { color: '#ffa94d', icon: '⚠️', bgColor: '#1a0d00' };
      case 'DatabaseError':
        return { color: '#ff6b6b', icon: '💾', bgColor: '#1a0000' };
      case 'BusinessError':
        return { color: '#ff6b6b', icon: '💼', bgColor: '#1a0000' };
      case 'AuthenticationError':
        return { color: '#ff6b6b', icon: '🔐', bgColor: '#1a0000' };
      case 'NotFoundError':
        return { color: '#339af0', icon: '🔍', bgColor: '#001a33' };
      case 'ForbiddenError':
        return { color: '#ff6b6b', icon: '🚫', bgColor: '#1a0000' };
      default:
        return { color: '#ff6b6b', icon: '❌', bgColor: '#1a0000' };
    }
  };

  // Format HTTP method with color
  const formatMethod = (method: string) => {
    const colors: Record<string, string> = {
      GET: '#51cf66',
      POST: '#339af0',
      PUT: '#ffa94d',
      DELETE: '#ff6b6b',
      PATCH: '#9775fa',
      OPTIONS: '#868e96',
      HEAD: '#868e96'
    };
    
    return (
      <span style={{
        backgroundColor: colors[method] || '#868e96',
        color: '#000',
        padding: '2px 6px',
        borderRadius: '3px',
        fontSize: '11px',
        fontWeight: 'bold',
        marginRight: '6px'
      }}>
        {method}
      </span>
    );
  };

  // Format status code with color
  const formatStatusCode = (statusCode: number) => {
    let color = '#868e96';
    if (statusCode >= 200 && statusCode < 300) color = '#51cf66';
    else if (statusCode >= 300 && statusCode < 400) color = '#339af0';
    else if (statusCode >= 400 && statusCode < 500) color = '#ffa94d';
    else if (statusCode >= 500) color = '#ff6b6b';
    
    return (
      <span style={{
        color,
        fontWeight: 'bold',
        marginRight: '6px'
      }}>
        {statusCode}
      </span>
    );
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
        <div style={{ fontSize: '16px', marginBottom: '10px' }}>Carregando logs de erro...</div>
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
            Logs de Erro do Sistema
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

      {/* Filters Panel */}
      {showFilters && (
        <div style={{
          backgroundColor: '#0a0a0a',
          padding: '16px 20px',
          borderBottom: '1px solid #333',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <FaFilter size={14} color="#0f0" />
            <h3 style={{ margin: 0, fontSize: '14px', color: '#0f0' }}>Filtros de Data</h3>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '12px', color: '#888' }}>Data Inicial</label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                style={{
                  backgroundColor: '#000',
                  color: '#0f0',
                  border: '1px solid #333',
                  borderRadius: '4px',
                  padding: '6px 8px',
                  fontFamily: 'monospace',
                  fontSize: '12px'
                }}
              />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '12px', color: '#888' }}>Data Final</label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                style={{
                  backgroundColor: '#000',
                  color: '#0f0',
                  border: '1px solid #333',
                  borderRadius: '4px',
                  padding: '6px 8px',
                  fontFamily: 'monospace',
                  fontSize: '12px'
                }}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '8px', marginLeft: '12px' }}>
              <button
                onClick={setToday}
                style={{
                  padding: '6px 12px',
                  backgroundColor: 'transparent',
                  color: '#0f0',
                  border: '1px solid #0f0',
                  borderRadius: '4px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  fontFamily: 'monospace'
                }}
              >
                Hoje
              </button>
              
              <button
                onClick={setLast7Days}
                style={{
                  padding: '6px 12px',
                  backgroundColor: 'transparent',
                  color: '#0f0',
                  border: '1px solid #0f0',
                  borderRadius: '4px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  fontFamily: 'monospace'
                }}
              >
                7 Dias
              </button>
              
              <button
                onClick={setLast30Days}
                style={{
                  padding: '6px 12px',
                  backgroundColor: 'transparent',
                  color: '#0f0',
                  border: '1px solid #0f0',
                  borderRadius: '4px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  fontFamily: 'monospace'
                }}
              >
                30 Dias
              </button>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button
              onClick={clearFilters}
              style={{
                padding: '6px 12px',
                backgroundColor: 'transparent',
                color: '#888',
                border: '1px solid #888',
                borderRadius: '4px',
                fontSize: '12px',
                cursor: 'pointer',
                fontFamily: 'monospace'
              }}
            >
              Limpar Filtros
            </button>
            
            <button
              onClick={applyFilters}
              style={{
                padding: '6px 12px',
                backgroundColor: '#0f0',
                color: '#000',
                border: 'none',
                borderRadius: '4px',
                fontSize: '12px',
                cursor: 'pointer',
                fontFamily: 'monospace',
                fontWeight: 'bold'
              }}
            >
              Aplicar Filtros
            </button>
          </div>
        </div>
      )}

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
            onClick={fetchErrorLogs}
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
            Exportar JSON
          </button>
          
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: showFilters ? '#0f0' : 'transparent',
                        color: showFilters ? '#000' : '#0f0',
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
                      <FaFilter size={14} />
                      Filtros
                    </button>
                  </div>
          
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="checkbox"
                      checked={autoRefresh}
                      onChange={(e) => setAutoRefresh(e.target.checked)}
                      style={{ cursor: 'pointer' }}
                    />
                    <label style={{ fontSize: '12px', color: '#888', cursor: 'pointer' }}>
                      Atualização automática (5 min)
                    </label>
                  </div>
                </div>
          
                {/* Logs Container */}
                <div
                  ref={logsContainerRef}
                  style={{
                    flex: 1,
                    overflowY: 'auto',
                    backgroundColor: '#000',
                    padding: '12px 0'
                  }}
                >
                  {logs.length === 0 ? (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minHeight: '300px',
                      color: '#888',
                      fontSize: '14px'
                    }}>
                      Nenhum log de erro encontrado
                    </div>
                  ) : (
                    logs.map((log) => {
                      const style = getLogStyle(log);
                      return (
                        <div
                          key={log.id}
                          style={{
                            borderLeft: `4px solid ${style.color}`,
                            backgroundColor: style.bgColor,
                            padding: '12px 20px',
                            borderBottom: '1px solid #222',
                            fontSize: '13px',
                            lineHeight: '1.5'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                            <span style={{ fontSize: '16px' }}>{style.icon}</span>
                            <span style={{ color: style.color, fontWeight: 'bold' }}>
                              {log.errorType}
                            </span>
                            <span style={{ color: '#888' }}>•</span>
                            <span style={{ color: '#888' }}>
                              {formatDate(log.timestamp)}
                            </span>
                          </div>
          
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                            {formatMethod(log.method)}
                            <span style={{ color: '#0f0' }}>{log.endpoint}</span>
                            {formatStatusCode(log.statusCode)}
                            <span style={{ color: '#888' }}>({log.responseTime}ms)</span>
                          </div>
          
                          <div style={{ color: '#ccc', marginBottom: '8px' }}>
                            {log.message}
                          </div>
          
                          {log.stackTrace && (
                            <div style={{
                              backgroundColor: '#0a0a0a',
                              padding: '8px 12px',
                              borderRadius: '4px',
                              marginTop: '8px',
                              fontSize: '11px',
                              color: '#888',
                              maxHeight: '120px',
                              overflowY: 'auto',
                              whiteSpace: 'pre-wrap',
                              wordBreak: 'break-word',
                              fontFamily: 'monospace'
                            }}>
                              {log.stackTrace}
                            </div>
                          )}
          
                          {log.user && (
                            <div style={{ marginTop: '8px', fontSize: '11px', color: '#888' }}>
                              Usuário: {log.user.name} ({log.user.email})
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
          
                {/* Footer */}
                <div style={{
                  backgroundColor: '#111',
                  padding: '12px 20px',
                  borderTop: '1px solid #333',
                  fontSize: '12px',
                  color: '#888',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span>Total de logs: {logs.length}</span>
                  {onBack && (
                    <button
                      onClick={onBack}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: 'transparent',
                        color: '#0f0',
                        border: '1px solid #0f0',
                        borderRadius: '4px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        fontFamily: 'monospace'
                      }}
                    >
                      Voltar
                    </button>
                  )}
                </div>
              </div>
            );
          };
          
          export default LogErros;