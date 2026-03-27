import { useState, useEffect } from 'react';
import axios from 'axios';
import { Project, TaskStatus, TaskPriority, User } from '../../../types/tasks';

interface TaskRelations {
  projects: Project[];
  statusList: TaskStatus[];
  priorityList: TaskPriority[];
  userList: User[];
}

export const useTaskData = () => {
  const [relations, setRelations] = useState<TaskRelations>({
    projects: [],
    statusList: [],
    priorityList: [],
    userList: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTaskRelations = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await axios.get('/api/task-data/relations');
      
      if (response.data?.success && response.data.data) {
        setRelations(response.data.data as TaskRelations);
      }
    } catch (err) {
      console.error('Erro ao buscar dados relacionados da tarefa:', err);
      setError('Não foi possível carregar os dados de relacionamento da tarefa');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchTaskRelations();
  }, []);

  const getStatusByName = (name: string): TaskStatus | undefined => {
    return relations.statusList?.find(s => s.name === name);
  };

  const getPriorityByName = (name: string): TaskPriority | undefined => {
    return relations.priorityList?.find(p => p.name === name);
  };

  const getProjectByName = (name: string): Project | undefined => {
    return relations.projects?.find(p => p.name === name);
  };

  const getUserById = (id: string): User | undefined => {
    return relations.userList?.find(u => u.id === id || u.nickname === id);
  };

  return {
    relations,
    isLoading,
    error,
    getStatusByName,
    getPriorityByName,
    getProjectByName,
    getUserById
  };
};