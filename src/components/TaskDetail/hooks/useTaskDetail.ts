/**
 * @AGENT-NOTE: Hook principal para buscar dados completos da tarefa.
 * Faz chamadas paralelas para task, executionLogs, taskHistory e comments.
 * Gerencia loading, error states e cache simples.
 * Usa React Query ou SWR-like pattern com useEffect para simplicidade.
 */
import { useState, useEffect } from 'react';
import api from '../../../services/api';
import type { Task, TaskExecutionLog, TaskHistory, Comment } from '../../../types/tasks';

interface TaskDetailData {
  task: Task | null;
  executionLogs: TaskExecutionLog[];
  taskHistory: TaskHistory[];
  comments: Comment[];
  loading: boolean;
  error: string | null;
}

export const useTaskDetail = (taskId: string): TaskDetailData => {
  const [data, setData] = useState<TaskDetailData>({
    task: null,
    executionLogs: [],
    taskHistory: [],
    comments: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchTaskDetail = async () => {
      try {
        setData(prev => ({ ...prev, loading: true, error: null }));

        // Fetch task básica com relações usando métodos específicos da API
        const [taskRes, logsRes, historyRes, commentsRes] = await Promise.all([
          api.getTask(taskId),
          api.getTaskExecutions(taskId),
          api.getTaskHistoryByTask(taskId),
          api.getCommentsByTask(taskId),
        ]);

        setData({
          task: taskRes.task,
          executionLogs: logsRes.data || [],
          taskHistory: historyRes.data || [],
          comments: commentsRes.data || [],
          loading: false,
          error: null,
        });
      } catch (error: any) {
        console.error('Erro ao buscar detalhes da tarefa:', error);
        setData(prev => ({
          ...prev,
          loading: false,
          error: error.message || 'Falha ao carregar detalhes da tarefa',
        }));
      }
    };

    if (taskId) {
      fetchTaskDetail();
    }
  }, [taskId]);

  return data;
};
