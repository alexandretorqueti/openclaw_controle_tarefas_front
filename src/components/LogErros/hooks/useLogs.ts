import { useState, useCallback } from 'react';
import apiService from '../../../services/api';
import { ErrorLog, LogFilters } from '../types';

export const useLogs = () => {
  const [logs, setLogs] = useState<ErrorLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchErrorLogs = useCallback(async (filters?: LogFilters) => {
    try {
      setIsRefreshing(true);
      setError(null);
      
      const apiFilters: Record<string, any> = {};
      if (filters?.dateRange.startDate) apiFilters.startDate = filters.dateRange.startDate;
      if (filters?.dateRange.endDate) apiFilters.endDate = filters.dateRange.endDate;
      if (filters?.level) apiFilters.level = filters.level;
      if (filters?.statusCode) apiFilters.statusCode = filters.statusCode;
      if (filters?.searchTerm) apiFilters.search = filters.searchTerm;
      
      const response = await apiService.getErrorLogs(apiFilters);
      
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
  }, []);

  return {
    logs,
    loading,
    error,
    lastUpdated,
    isRefreshing,
    fetchErrorLogs,
    setLogs,
    setError
  };
};