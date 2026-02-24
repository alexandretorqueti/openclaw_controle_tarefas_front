import React, { useState, useEffect } from 'react';
import { Task } from '../types';
import api from '../services/api';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  FaSync, 
  FaClock, 
  FaCalendarAlt, 
  FaCheckCircle, 
  FaPlayCircle,
  FaExclamationTriangle,
  FaHistory,
  FaRedo,
  FaList
} from 'react-icons/fa';

interface RecurrenceManagerProps {
  onTaskSelect?: (task: Task) => void;
}

const RecurrenceManager: React.FC<RecurrenceManagerProps> = ({ onTaskSelect }) => {
  const [dueTasks, setDueTasks] = useState<Task[]>([]);
  const [allRecurringTasks, setAllRecurringTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState<string | null>(null);
  const [executingAll, setExecutingAll] = useState(false);
  const [activeTab, setActiveTab] = useState<'due' | 'all'>('due');

  const loadDueTasks = async () => {
    try {
      setLoading(true);
      const response = await api.getRecurringTasksDue();
      setDueTasks(response.tasks || []);
    } catch (error) {
      console.error('Error loading due tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAllRecurringTasks = async () => {
    try {
      // For now, we'll load all tasks and filter recurring ones
      // In a real implementation, we'd have a dedicated endpoint
      const tasks = await api.getTasks({ isCompleted: 'true' });
      const recurringTasks = tasks.filter((task: Task) => task.isRecurring);
      setAllRecurringTasks(recurringTasks);
    } catch (error) {
      console.error('Error loading recurring tasks:', error);
    }
  };

  useEffect(() => {
    if (activeTab === 'due') {
      loadDueTasks();
    } else {
      loadAllRecurringTasks();
    }
  }, [activeTab]);

  const handleExecuteTask = async (taskId: string) => {
    try {
      setExecuting(taskId);
      await api.markTaskAsExecuted(taskId);
      
      // Reload the list
      if (activeTab === 'due') {
        await loadDueTasks();
      }
    } catch (error) {
      console.error('Error executing task:', error);
      alert('Erro ao executar tarefa: ' + (error as Error).message);
    } finally {
      setExecuting(null);
    }
  };

  const handleExecuteAll = async () => {
    try {
      setExecutingAll(true);
      const response = await api.executeAllDueTasks();
      
      alert(`Executadas ${response.results.filter((r: any) => r.status === 'executed').length} tarefas com sucesso!`);
      
      // Reload the list
      await loadDueTasks();
    } catch (error) {
      console.error('Error executing all tasks:', error);
      alert('Erro ao executar tarefas: ' + (error as Error).message);
    } finally {
      setExecutingAll(false);
    }
  };

  const getRecurrenceDescription = (task: Task) => {
    if (!task.recurrenceType) return 'Tipo não definido';
    
    const daysMap = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    
    // Helper function to safely join recurrence times
    const getTimesString = () => {
      if (!task.recurrenceTimes) return 'horário não definido';
      if (Array.isArray(task.recurrenceTimes)) {
        return task.recurrenceTimes.join(', ') || 'horário não definido';
      }
      return 'horário não definido';
    };
    
    switch (task.recurrenceType) {
      case 'daily':
        return `Diária às ${getTimesString()}`;
      case 'weekly':
        const days = task.recurrenceDays?.map(d => daysMap[d]).join(', ') || 'dias não definidos';
        return `Semanal (${days}) às ${getTimesString()}`;
      case 'monthly':
        return `Mensal às ${getTimesString()}`;
      default:
        return task.recurrenceType;
    }
  };

  const getStatusColor = (task: Task) => {
    if (!task.nextExecutionAt) return 'gray';
    
    const nextExecution = new Date(task.nextExecutionAt);
    const now = new Date();
    const hoursUntil = (nextExecution.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (hoursUntil < 0) return 'red'; // Overdue
    if (hoursUntil < 24) return 'orange'; // Due within 24h
    return 'green'; // Not due soon
  };

  const renderTaskCard = (task: Task, isDue: boolean = true) => (
    <div
      key={task.id}
      className="task-card"
      style={{
        backgroundColor: '#fff',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        borderLeft: `4px solid ${
          isDue ? (getStatusColor(task) === 'red' ? '#FF6B6B' : '#FFD166') : '#4ECDC4'
        }`,
        cursor: onTaskSelect ? 'pointer' : 'default'
      }}
      onClick={() => onTaskSelect && onTaskSelect(task)}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <FaSync size={14} color="#4ECDC4" />
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#333', margin: 0 }}>
              {task.title}
            </h3>
            {task.project && (
              <span style={{
                fontSize: '12px',
                backgroundColor: '#f0f0f0',
                color: '#666',
                padding: '2px 8px',
                borderRadius: '12px'
              }}>
                {task.project.name}
              </span>
            )}
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaClock size={12} color="#666" />
              <span style={{ fontSize: '14px', color: '#666' }}>
                {getRecurrenceDescription(task)}
              </span>
            </div>
            
            {task.lastExecutedAt && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaHistory size={12} color="#666" />
                <span style={{ fontSize: '14px', color: '#666' }}>
                  Última execução: {format(new Date(task.lastExecutedAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                </span>
              </div>
            )}
            
            {task.nextExecutionAt && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaCalendarAlt size={12} color={
                  getStatusColor(task) === 'red' ? '#FF6B6B' : 
                  getStatusColor(task) === 'orange' ? '#FFD166' : '#4ECDC4'
                } />
                <span style={{ 
                  fontSize: '14px', 
                  fontWeight: 500,
                  color: getStatusColor(task) === 'red' ? '#FF6B6B' : 
                         getStatusColor(task) === 'orange' ? '#FFD166' : '#4ECDC4'
                }}>
                  Próxima: {format(new Date(task.nextExecutionAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                  {getStatusColor(task) === 'red' && ' (Atrasada!)'}
                  {getStatusColor(task) === 'orange' && ' (Em breve)'}
                </span>
              </div>
            )}
          </div>
        </div>
        
        {isDue && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleExecuteTask(task.id);
            }}
            disabled={executing === task.id}
            style={{
              padding: '8px 16px',
              backgroundColor: executing === task.id ? '#ccc' : '#4ECDC4',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: executing === task.id ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap'
            }}
          >
            {executing === task.id ? (
              <>
                <FaRedo className="animate-spin" />
                Executando...
              </>
            ) : (
              <>
                <FaCheckCircle />
                Marcar como Executada
              </>
            )}
          </button>
        )}
      </div>
      
      {task.description && (
        <p style={{ 
          fontSize: '14px', 
          color: '#666', 
          marginTop: '12px',
          lineHeight: 1.5
        }}>
          {task.description.length > 150 ? task.description.substring(0, 150) + '...' : task.description}
        </p>
      )}
    </div>
  );

  return (
    <div className="recurrence-manager">
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#333', marginBottom: '8px' }}>
            <FaSync style={{ marginRight: '12px', color: '#4ECDC4' }} />
            Tarefas Recorrentes
          </h2>
          <p style={{ fontSize: '14px', color: '#666' }}>
            Gerencie tarefas que se repetem automaticamente
          </p>
        </div>
        
        {activeTab === 'due' && dueTasks.length > 0 && (
          <button
            onClick={handleExecuteAll}
            disabled={executingAll}
            style={{
              padding: '10px 20px',
              backgroundColor: executingAll ? '#ccc' : '#FFD166',
              color: '#333',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: executingAll ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {executingAll ? (
              <>
                <FaRedo className="animate-spin" />
                Executando todas...
              </>
            ) : (
              <>
                <FaPlayCircle />
                Executar Todas ({dueTasks.length})
              </>
            )}
          </button>
        )}
      </div>
      
      {/* Tabs */}
      <div style={{ 
        display: 'flex', 
        borderBottom: '1px solid #e0e0e0',
        marginBottom: '24px'
      }}>
        <button
          onClick={() => setActiveTab('due')}
          style={{
            padding: '12px 24px',
            backgroundColor: activeTab === 'due' ? '#4ECDC4' : 'transparent',
            color: activeTab === 'due' ? 'white' : '#666',
            border: 'none',
            borderBottom: activeTab === 'due' ? '2px solid #4ECDC4' : 'none',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <FaExclamationTriangle />
          Pendentes
          {dueTasks.length > 0 && (
            <span style={{
              backgroundColor: activeTab === 'due' ? 'white' : '#FF6B6B',
              color: activeTab === 'due' ? '#4ECDC4' : 'white',
              fontSize: '12px',
              padding: '2px 8px',
              borderRadius: '12px',
              marginLeft: '8px'
            }}>
              {dueTasks.length}
            </span>
          )}
        </button>
        
        <button
          onClick={() => setActiveTab('all')}
          style={{
            padding: '12px 24px',
            backgroundColor: activeTab === 'all' ? '#4ECDC4' : 'transparent',
            color: activeTab === 'all' ? 'white' : '#666',
            border: 'none',
            borderBottom: activeTab === 'all' ? '2px solid #4ECDC4' : 'none',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <FaList />
          Todas Recorrentes
        </button>
      </div>
      
      {/* Content */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div className="animate-spin" style={{ 
            width: '40px', 
            height: '40px', 
            border: '4px solid #f0f0f0',
            borderTop: '4px solid #4ECDC4',
            borderRadius: '50%',
            margin: '0 auto 16px'
          }} />
          <p style={{ color: '#666' }}>Carregando tarefas...</p>
        </div>
      ) : activeTab === 'due' ? (
        <>
          {dueTasks.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px',
              backgroundColor: '#f8f9fa',
              borderRadius: '12px'
            }}>
              <FaCheckCircle size={48} color="#4ECDC4" style={{ marginBottom: '16px' }} />
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#333', marginBottom: '8px' }}>
                Nenhuma tarefa pendente!
              </h3>
              <p style={{ color: '#666' }}>
                Todas as tarefas recorrentes estão em dia.
              </p>
            </div>
          ) : (
            <div>
              <div style={{ 
                backgroundColor: '#FFF3CD', 
                border: '1px solid #FFEEBA',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '24px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <FaExclamationTriangle color="#856404" />
                  <div>
                    <strong style={{ color: '#856404' }}>
                      {dueTasks.length} tarefa(s) aguardando execução
                    </strong>
                    <p style={{ color: '#856404', marginTop: '4px', fontSize: '14px' }}>
                      Estas tarefas passaram do horário agendado e ainda não foram executadas.
                    </p>
                  </div>
                </div>
              </div>
              
              {dueTasks.map(task => renderTaskCard(task, true))}
            </div>
          )}
        </>
      ) : (
        <>
          {allRecurringTasks.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px',
              backgroundColor: '#f8f9fa',
              borderRadius: '12px'
            }}>
              <FaSync size={48} color="#666" style={{ marginBottom: '16px' }} />
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#333', marginBottom: '8px' }}>
                Nenhuma tarefa recorrente
              </h3>
              <p style={{ color: '#666' }}>
                Crie uma tarefa e marque-a como recorrente para vê-la aqui.
              </p>
            </div>
          ) : (
            <div>
              <p style={{ color: '#666', marginBottom: '16px' }}>
                Mostrando {allRecurringTasks.length} tarefa(s) recorrente(s)
              </p>
              {allRecurringTasks.map(task => renderTaskCard(task, false))}
            </div>
          )}
        </>
      )}
      
      {/* CSS for animations */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        .task-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          transition: all 0.2s ease;
        }
      `}</style>
    </div>
  );
};

export default RecurrenceManager;