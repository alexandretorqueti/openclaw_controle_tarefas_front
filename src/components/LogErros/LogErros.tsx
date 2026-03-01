import React, { useState, useEffect } from 'react';
import { FaSync, FaDownload, FaClock, FaFilter, FaTerminal } from 'react-icons/fa';
import apiService from '../../services/api';
import { LogList } from './LogList';
import { LogDetailsModal } from './LogDetailsModal';
import { LogFilters } from './LogFilters';
import { useLogs } from './hooks/useLogs';
import { useAutoRefresh } from './hooks/useAutoRefresh';
import { ErrorLog, LogErrosProps, LogFilters as LogFiltersType } from './types';
import './styles.css';

const LogErros: React.FC<LogErrosProps> = ({ onBack }) => {
  const [showFilters, setShowFilters] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState<ErrorLog | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [filters, setFilters] = useState<LogFiltersType>({
    dateRange: { startDate: '', endDate: '' },
    level: '',
    statusCode: undefined,
    searchTerm: ''
  });

  const {
    logs,
    loading,
    error,
    lastUpdated,
    isRefreshing,
    fetchErrorLogs,
    setLogs,
    setError
  } = useLogs();

  const { autoRefresh, setAutoRefresh } = useAutoRefresh(fetchErrorLogs);

  // Initial fetch
  useEffect(() => {
    fetchErrorLogs();
  }, []);

  // Fetch error details
  const fetchErrorDetails = async (logId: string) => {
    try {
      setDetailsLoading(true);
      const response = await apiService.getErrorDetails(logId);
      if (response && response.error) {
        setSelectedLog(response.error);
        setShowDetailsModal(true);
      }
    } catch (err) {
      console.error("Error fetching error details:", err);
      setError("Falha ao carregar detalhes do erro.");
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleLogClick = (log: ErrorLog) => {
    fetchErrorDetails(log.id);
  };

  const handleFiltersChange = (newFilters: LogFiltersType) => {
    setFilters(newFilters);
  };

  const handleApplyFilters = () => {
    fetchErrorLogs();
  };

  const handleResetFilters = () => {
    setFilters({
      dateRange: { startDate: '', endDate: '' },
      level: '',
      statusCode: undefined,
      searchTerm: ''
    });
    fetchErrorLogs();
  };

  const handleExportLogs = () => {
    const dataStr = JSON.stringify(logs, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `error-logs-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const formatLastUpdated = () => {
    if (!lastUpdated) return 'Nunca';
    const date = new Date(lastUpdated);
    return date.toLocaleTimeString('pt-BR');
  };

  return (
    <div className="log-erros-container">
      {/* Header */}
      <div className="log-erros-header">
        <div className="header-left">
          <h1 className="header-title">
            <FaTerminal className="header-icon" />
            Logs de Erro
          </h1>
          <div className="header-subtitle">
            Monitoramento de erros do sistema
          </div>
        </div>
        
        <div className="header-controls">
          <button
            className="control-button"
            onClick={fetchErrorLogs}
            disabled={isRefreshing}
            title="Atualizar logs"
          >
            <FaSync className={isRefreshing ? 'spinning' : ''} />
            {isRefreshing ? 'Atualizando...' : 'Atualizar'}
          </button>
          
          <button
            className="control-button"
            onClick={handleExportLogs}
            title="Exportar logs"
          >
            <FaDownload />
            Exportar
          </button>
          
          <button
            className="control-button"
            onClick={() => setShowFilters(!showFilters)}
            title="Mostrar/ocultar filtros"
          >
            <FaFilter />
            Filtros
          </button>
          
          <div className="auto-refresh-toggle">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
              />
              <FaClock />
              Auto-refresh
            </label>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="status-bar">
        <div className="status-item">
          <span className="status-label">Última atualização:</span>
          <span className="status-value">{formatLastUpdated()}</span>
        </div>
        <div className="status-item">
          <span className="status-label">Total de logs:</span>
          <span className="status-value">{logs.length}</span>
        </div>
        {error && (
          <div className="status-error">
            {error}
          </div>
        )}
      </div>

      {/* Filters */}
      {showFilters && (
        <LogFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onApplyFilters={handleApplyFilters}
          onResetFilters={handleResetFilters}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters(!showFilters)}
        />
      )}

      {/* Main Content */}
      <div className="log-erros-content">
        <LogList
          logs={logs}
          loading={loading}
          onLogClick={handleLogClick}
          emptyMessage="Nenhum log de erro encontrado"
        />
      </div>

      {/* Footer */}
      <div className="log-erros-footer">
        <span>Total de logs: {logs.length}</span>
        {onBack && (
          <button
            className="back-button"
            onClick={onBack}
          >
            Voltar
          </button>
        )}
      </div>

      {/* Details Modal */}
      <LogDetailsModal
        log={selectedLog}
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        isLoading={detailsLoading}
      />
    </div>
  );
};

export default LogErros;