// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { TaskHistory, User } from '../types';
import api from '../services/api';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  FaHistory, 
  FaUser, 
  FaExchangeAlt,
  FaInfoCircle
} from 'react-icons/fa';

interface TaskHistorySectionProps {
  taskId: string;
  currentUser: User | null;
}

const TaskHistorySection: React.FC<TaskHistorySectionProps> = ({ taskId, currentUser }) => {
  const [history, setHistory] = useState<TaskHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load history
  useEffect(() => {
    loadHistory();
  }, [taskId]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getTaskHistoryByTask(taskId);
      setHistory(response.history || []);
    } catch (error: any) {
      console.error('Failed to load task history:', error);
      setError('Erro ao carregar histórico da tarefa. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (statusId: string) => {
    // This would ideally come from the status data
    // For now, using a simple mapping
    const colors: Record<string, string> = {
      'todo': '#FF6B6B',
      'in-progress': '#FFD166',
      'review': '#4ECDC4',
      'done': '#06D6A0',
      'cancelled': '#666666'
    };
    return colors[statusId] || '#666666';
  };

  const renderHistoryItem = (item: TaskHistory) => {
    return (
      <div key={item.id} style={{
        marginBottom: '16px',
        padding: '16px',
        backgroundColor: '#fff',
        borderRadius: '8px',
        border: '1px solid #e9ecef',
        position: 'relative'
      }}>
        {/* History header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: '#f0f9f8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FaExchangeAlt size={18} color="#4ECDC4" />
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#333' }}>
                Status alterado
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                {formatDate(item.timestamp)}
              </div>
            </div>
          </div>

          {/* User info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {item.user?.avatarUrl ? (
              <img 
                src={item.user.avatarUrl} 
                alt={item.user.name}
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  objectFit: 'cover'
                }}
              />
            ) : (
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: '#e3f2fd',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <FaUser size={12} color="#1976d2" />
              </div>
            )}
            <div style={{ fontSize: '12px', color: '#666' }}>
              {item.user?.name || 'Usuário desconhecido'}
            </div>
          </div>
        </div>

        {/* Status change */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '16px',
          padding: '12px',
          backgroundColor: '#f8f9fa',
          borderRadius: '6px',
          marginBottom: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: getStatusColor(item.oldStatusId)
            }} />
            <div style={{ fontSize: '14px', color: '#666' }}>
              Status anterior: <span style={{ fontWeight: 500, color: '#333' }}>{item.oldStatusId}</span>
            </div>
          </div>
          
          <FaExchangeAlt size={14} color="#666" />
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: getStatusColor(item.newStatusId)
            }} />
            <div style={{ fontSize: '14px', color: '#666' }}>
              Novo status: <span style={{ fontWeight: 500, color: '#333' }}>{item.newStatusId}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {item.notes && (
          <div style={{
            padding: '12px',
            backgroundColor: '#f0f9f8',
            borderRadius: '6px',
            borderLeft: '4px solid #4ECDC4'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <FaInfoCircle size={14} color="#4ECDC4" />
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#333' }}>
                Observações
              </div>
            </div>
            <div style={{ fontSize: '14px', color: '#333', lineHeight: 1.4 }}>
              {item.notes}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
        Carregando histórico...
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#333', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <FaHistory size={18} />
        Histórico da Tarefa ({history.length})
      </h3>

      {/* Error message */}
      {error && (
        <div style={{
          backgroundColor: '#FFE5E5',
          border: '1px solid #FF6B6B',
          color: '#D32F2F',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          {error}
        </div>
      )}

      {/* History list */}
      {history.length === 0 ? (
        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '40px',
          borderRadius: '8px',
          textAlign: 'center',
          color: '#666'
        }}>
          <FaHistory size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
          <div style={{ fontSize: '16px', marginBottom: '8px' }}>Nenhum registro de histórico</div>
          <div style={{ fontSize: '14px' }}>O histórico será registrado quando o status da tarefa for alterado.</div>
        </div>
      ) : (
        <div>
          {history.map(item => renderHistoryItem(item))}
        </div>
      )}
    </div>
  );
};

export default TaskHistorySection;
