import { useState } from 'react';

interface TaskDetailActionParams {
  action?: string;
  task?: any;
  userId?: string;
  [key: string]: any;
}

export const useTaskDetailActions = () => {
  const [isExecuting, setIsExecuting] = useState(false);
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [actionTimestamp, setActionTimestamp] = useState<Date | null>(null);

  const executeAction = async (
    taskData: TaskDetailActionParams,
    callback: (data: TaskDetailActionParams) => Promise<void>
  ): Promise<boolean> => {
    try {
      setIsExecuting(true);
      setLastAction(taskData.action || 'unknown');
      setActionTimestamp(new Date());

      await callback(taskData);

      return true;
    } catch (error) {
      console.error(`Erro na execução de ação: ${taskData.action}`, error);
      throw error;
    } finally {
      setIsExecuting(false);
    }
  };

  const resetActions = () => {
    setIsExecuting(false);
    setLastAction(null);
    setActionTimestamp(null);
  };

  return {
    isExecuting,
    lastAction,
    actionTimestamp,
    executeAction,
    resetActions
  };
};