import React, { useState, useEffect } from 'react';
import { User } from '../types';
import api from '../services/api';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  FaPlay, 
  FaHistory, 
  FaUser, 
  FaExclamationTriangle,
  FaInfoCircle,
  FaBug,
  FaSync,
  FaCalendarAlt,
  FaClock,
  FaFilter,
  FaSearch,
  FaRedo
} from 'react-icons/fa';

interface TaskExecutionLogProps {
  taskId: string;
  currentUser: User | null;
}

interface ExecutionLog {
  id: string;
  timestamp: string;
  level: string;
  endpoint: string;
  method: string;
  statusCode: number;
  message: string;
  errorType: string;
  stackTrace: string;
  requestBody: any;
  requestQuery: any;
  requestParams: any;
  headers: any;
  clientIp: string;
  userId: string;
  correlationId: string;
  responseTime: number;
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string;
  } | null;
}

const TaskExecutionLog: React.FC<TaskExecutionLogProps> = ({ taskId, currentUser }) => {
  const [logs, setLogs] = useState<ExecutionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    level: 'all',
    startDate: '',
    endDate: '',
    search: ''
  });
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  // Load execution logs
  useEffect(() => {
    loadExecutionLogs();
  }, [taskId]);

  const loadExecutionLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get all logs and filter by task ID
      const response = await api.getAllLogs({
        endpoint: `/api/tasks/${taskId}`,
        limit: 100
      });
      
      setLogs(response.logs || []);
    } catch (error: any) {
      console.error('Failed to load execution logs:', error);
      setError('Erro ao carregar logs de execução. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm:ss", { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'ERROR': return '#FF6B6B';
      case 'WARN': return '#FFD166';
      case 'INFO': return '#4ECDC4';
      case 'DEBUG': return '#666666';
      default: return '#666666';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'ERROR': return <FaExclamationTriangle />;
      case 'WARN': return <FaExclamationTriangle />;
      case 'INFO': return <FaInfoCircle />;
      case 'DEBUG': return <FaBug />;
      default: return <FaInfoCircle />;
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return '#06D6A0';
      case 'POST': return '#4ECDC4';
      case 'PUT': return '#FFD166';
      case 'DELETE': return '#FF6B6B';
      case 'PATCH': return '#FF9A76';
      default: return '#666666';
    }
  };

  const filteredLogs = logs.filter(log => {
    // Filter by level
    if (filters.level !== 'all' && log.level !== filters.level) {
      return false;
    }
    
    // Filter by date range
    if (filters.startDate) {
      const logDate = new Date(log.timestamp);
      const startDate = new Date(filters.startDate);
      if (logDate < startDate) return false;
    }
    
    if (filters.endDate) {
      const logDate = new Date(log.timestamp);
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999);
      if (logDate > endDate) return false;
    }
    
    // Filter by search text
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        log.message?.toLowerCase().includes(searchLower) ||
        log.errorType?.toLowerCase().includes(searchLower) ||
        log.correlationId?.toLowerCase().includes(searchLower) ||
        log.user?.name?.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  const renderLogDetails = (log: ExecutionLog) => {
    return (
      <div style={{
        marginTop: '16px',
        padding: '16px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #e9ecef'
      }}>
        {/* Request Details */}
        <div style={{ marginBottom: '16px' }}>
          <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#333', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaPlay size={12} />
            Detalhes da Requisição
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Endpoint</div>
              <div style={{ fontSize: '13px', fontWeight: 500, color: '#333', fontFamily: 'monospace' }}>
                {log.endpoint}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Método</div>
              <div style={{
                fontSize: '12px',
                fontWeight: 600,
                color: '#fff',
                backgroundColor: getMethodColor(log.method),
                padding: '4px 8px',
                borderRadius: '4px',
                display: 'inline-block'
              }}>
                {log.method}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Status Code</div>
              <div style={{
                fontSize: '13px',
                fontWeight: 600,
                color: log.statusCode >= 400 ? '#FF6B6B' : log.statusCode >= 300 ? '#FFD166' : '#06D6A0'
              }}>
                {log.statusCode}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Tempo de Resposta</div>
              <div style={{ fontSize: '13px', fontWeight: 500, color: '#333' }}>
                {log.responseTime}ms
              </div>
            </div>
          </div>
        </div>

        {/* Request Data */}
        {(log.requestBody || log.requestQuery || log.requestParams) && (
          <div style={{ marginBottom: '16px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#333', marginBottom: '8px' }}>
              Dados da Requisição
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              {log.requestBody && (
                <div>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Body</div>
                  <pre style={{
                    fontSize: '11px',
                    color: '#333',
                    backgroundColor: '#fff',
                    padding: '8px',
                    borderRadius: '6px',
                    border: '1px solid #e9ecef',
                    overflow: 'auto',
                    maxHeight: '200px',
                    margin: 0,
                    fontFamily: 'monospace'
                  }}>
                    {JSON.stringify(log.requestBody, null, 2)}
                  </pre>
                </div>
              )}
              {log.requestQuery && Object.keys(log.requestQuery).length > 0 && (
                <div>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Query Params</div>
                  <pre style={{
                    fontSize: '11px',
                    color: '#333',
                    backgroundColor: '#fff',
                    padding: '8px',
                    borderRadius: '6px',
                    border: '1px solid #e9ecef',
                    overflow: 'auto',
                    maxHeight: '200px',
                    margin: 0,
                    fontFamily: 'monospace'
                  }}>
                    {JSON.stringify(log.requestQuery, null, 2)}
                  </pre>
                </div>
              )}
              {log.requestParams && Object.keys(log.requestParams).length > 0 && (
                <div>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Route Params</div>
                  <pre style={{
                    fontSize: '11px',
                    color: '#333',
                    backgroundColor: '#fff',
                    padding: '8px',
                    borderRadius: '6px',
                    border: '1px solid #e9ecef',
                    overflow: 'auto',
                    maxHeight: '200px',
                    margin: 0,
                    fontFamily: 'monospace'
                  }}>
                    {JSON.stringify(log.requestParams, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Stack Trace for Errors */}
        {log.stackTrace && (
          <div style={{ marginBottom: '16px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#333', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaBug size={12} />
              Stack Trace
            </h4>
            <pre style={{
              fontSize: '11px',
              color: '#D32F2F',
              backgroundColor: '#FFE5E5',
              padding: '12px',
              borderRadius: '6px',
              border: '1px solid #FFCDD2',
              overflow: 'auto',
              maxHeight: '300px',
              margin: 0,
              fontFamily: 'monospace',
              whiteSpace: 'pre-wrap'
            }}>
              {log.stackTrace}
            </pre>
          </div>
        )}

        {/* Technical Details */}
        <div>
          <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#333', marginBottom: '8px' }}>
            Detalhes Técnicos
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Correlation ID</div>
              <div style={{ fontSize: '11px', color: '#333', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                {log.correlationId}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Client IP</div>
              <div style={{ fontSize: '13px', fontWeight: 500, color: '#333', fontFamily: 'monospace' }}>
                {log.clientIp}
              </div>
            </div>
            {log.userId && (
              <div>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>User ID</div>
                <div style={{ fontSize: '11px', color: '#333', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                  {log.userId}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderLogItem = (log: ExecutionLog) => {
    const isExpanded = expandedLogId === log.id;
    
    return (
      <div key={log.id} style={{
        marginBottom: '12px',
        padding: '16px',
        backgroundColor: '#fff',
        borderRadius: '8px',
        border: '1px solid #e9ecef',
        cursor: 'pointer',
        transition: 'all 0.2s'
      }}
      onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
      >
        {/* Log header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: getLevelColor(log.level) + '20',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: getLevelColor(log.level)
            }}>
              {getLevelIcon(log.level)}
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#333' }}>
                {log.message || 'Log de execução'}
              </div>
              <div style={{ fontSize: '12px', color: '#666', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <FaClock size={10} />
                {formatDate(log.timestamp)}
                {log.errorType && (
                  <>
                    <span style={{ color: '#999' }}>•</span>
                    <span style={{ color: getLevelColor(log.level), fontWeight: 500 }}>
                      {log.errorType}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Status badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              fontSize: '11px',
              fontWeight: 600,
              color: '#fff',
              backgroundColor: getLevelColor(log.level),
              padding: '4px 8px',
              borderRadius: '12px'
            }}>
              {log.level}
            </div>
            <div style={{
              fontSize: '11px',
              fontWeight: 600,
              color: '#fff',
              backgroundColor: getMethodColor(log.method),
              padding: '4px 8px',
              borderRadius: '12px'
            }}>
              {log.method}
            </div>
            <div style={{
              fontSize: '11px',
              fontWeight: 600,
              color: log.statusCode >= 400 ? '#FF6B6B' : log.statusCode >= 300 ? '#FFD166' : '#06D6A0',
              backgroundColor: log.statusCode >= 400 ? '#FFE5E5' : log.statusCode >= 300 ? '#FFF9E6' : '#E6F7F5',
              padding: '4px 8px',
              borderRadius: '12px'
            }}>
              {log.statusCode}
            </div>
          </div>
        </div>

        {/* User info */}
        {log.user && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            marginBottom: '12px',
            padding: '8px',
            backgroundColor: '#f0f9f8',
            borderRadius: '6px'
          }}>
            {log.user.avatarUrl ? (
              <img 
                src={log.user.avatarUrl} 
                alt={log.user.name}
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  objectFit: 'cover'
                }}
              />
            ) : (
              <div style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: '#e3f2fd',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <FaUser size={10} color="#1976d2" />
              </div>
            )}
            <div style={{ fontSize: '12px', color: '#333' }}>
              {log.user.name}
              {log.user.email && (
                <span style={{ color: '#666', marginLeft: '8px' }}>
                  ({log.user.email})
                </span>
              )}
            </div>
          </div>
        )}

        {/* Expand/collapse indicator */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          color: '#666',
          fontSize: '12px',
          marginTop: '8px'
        }}>
          {isExpanded ? 'Clique para recolher detalhes' : 'Clique para expandir detalhes'}
        </div>

        {/* Expanded details */}
        {isExpanded && renderLogDetails(log)}
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
        <FaSync size={24} style={{ marginBottom: '12px', animation: 'spin 1s linear infinite' }} />
        <div>Carregando logs de execução...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px