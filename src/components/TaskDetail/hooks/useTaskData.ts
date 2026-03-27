import { useState, useEffect, useCallback } from 'react';
import api from '../../../services/api';
import { Task, Project, Status, Priority } from '../../../types/tasks';

interface TaskData {
  projects: Project[];
  statuses: Status[];
  priorities: Priority[];
  users: any[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook para buscar dados relacionados a tarefas
 * (projetos, status, prioridades, usuários)
 * Útil para formulários e seleções
 */
const useTaskData = (): TaskData => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [priorities, setPriorities] = useState<Priority[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTaskData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Buscar todos os dados em paralelo
      const [projectsResponse, statusesResponse, prioritiesResponse, usersResponse] = await Promise.allSettled([
        api.getProjects(),
        api.getStatuses(),
        api.getPriorities(),
        api.getUsers()
      ]);

      // Processar projetos
      if (projectsResponse.status === 'fulfilled') {
        setProjects(projectsResponse.value || []);
      } else {
        console.error('Erro ao buscar projetos:', projectsResponse.reason);
      }

      // Processar status
      if (statusesResponse.status === 'fulfilled') {
        setStatuses(statusesResponse.value || []);
      } else {
        console.error('Erro ao buscar status:', statusesResponse.reason);
      }

      // Processar prioridades
      if (prioritiesResponse.status === 'fulfilled') {
        setPriorities(prioritiesResponse.value || []);
      } else {
        console.error('Erro ao buscar prioridades:', prioritiesResponse.reason);
      }

      // Processar usuários
      if (usersResponse.status === 'fulfilled') {
        setUsers(usersResponse.value || []);
      } else {
        console.error('Erro ao buscar usuários:', usersResponse.reason);
      }

    } catch (err) {
      console.error('Erro geral ao buscar dados relacionados:', err);
      setError('Erro ao carregar dados relacionados');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTaskData();
  }, [fetchTaskData]);

  return {
    projects,
    statuses,
    priorities,
    users,
    loading,
    error,
    refetch: fetchTaskData
  };
};

export default useTaskData;