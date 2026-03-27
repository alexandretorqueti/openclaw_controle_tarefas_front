import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FaArrowLeft, FaEdit, FaTrash, FaComment, FaHistory, 
  FaLink, FaPaperclip, FaCog, FaPlay, FaSpinner,
  FaExclamationTriangle, FaCheck, FaTimes, FaCopy
} from 'react-icons/fa';
import './TaskDetailPage.css';
import { useTaskDetail } from './hooks/useTaskDetail';
import useComments from './hooks/useComments';
import TaskHeader from './sections/TaskHeader';
import TaskOverview from './sections/TaskOverview';
import TaskComments from './sections/TaskComments';
import TaskExecutionLogs from './sections/TaskExecutionLogs';
import TaskHistory from './sections/TaskHistory';
import TaskDependencies from './sections/TaskDependencies';
import TaskAttachments from './sections/TaskAttachments';
import TaskProperties from './sections/TaskProperties';

// Tipos para as tabs
type TabType = 'overview' | 'comments' | 'logs' | 'history' | 'dependencies' | 'attachments' | 'properties';

const TaskDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Estado para a tab ativa
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  
  // Hooks para dados
  const { 
    task, 
    executionLogs, 
    taskHistory, 
    comments: taskComments,
    loading, 
    error, 
    refetch 
  } = useTaskDetail(id);

  const commentsHook = useComments(id);

  // Tabs disponíveis
  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Visão Geral', icon: <FaCopy /> },
    { id: 'comments', label: 'Comentários', icon: <FaComment /> },
    { id: 'logs', label: 'Logs de Execução', icon: <FaPlay /> },
    { id: 'history', label: 'Histórico', icon: <FaHistory /> },
    { id: 'dependencies', label: 'Dependências', icon: <FaLink /> },
    { id: 'attachments', label: 'Anexos', icon: <FaPaperclip /> },
    { id: 'properties', label: 'Propriedades', icon: <FaCog /> },
  ];

  // Função para renderizar o conteúdo da tab ativa
  const renderTabContent = () => {
    if (!task) return null;

    switch (activeTab) {
      case 'overview':
        return <TaskOverview task={task} />;
      
      case 'comments':
        return (
          <TaskComments 
            taskId={task.id}
            comments={taskComments}
            onCommentAdded={() => refetch()}
            onCommentDeleted={() => refetch()}
          />
        );
      
      case 'logs':
        return <TaskExecutionLogs logs={executionLogs} />;
      
      case 'history':
        return <TaskHistory history={taskHistory} />;
      
      case 'dependencies':
        return <TaskDependencies task={task} />;
      
      case 'attachments':
        return <TaskAttachments attachments={task.attachments || []} />;
      
      case 'properties':
        return <TaskProperties task={task} />;
      
      default:
        return null;
    }
  };

  // Função para voltar à lista de tarefas
  const handleBack = () => {
    // Tentar voltar para a página anterior
    if (window.history.length > 1) {
      navigate(-1); // Volta para a página anterior
    } else {
      // Fallback: vai para a lista geral de tarefas
      navigate('/tasks');
    }
  };

  // Função para editar tarefa
  const handleEdit = () => {
    if (task) {
      navigate(`/tasks/edit/${task.id}`);
    }
  };

  // Função para excluir tarefa
  const handleDelete = async () => {
    if (!task || !window.confirm('Tem certeza que deseja excluir esta tarefa?')) {
      return;
    }

    try {
      // TODO: Implementar exclusão de tarefa
      console.log('Excluindo tarefa:', task.id);
      // await api.deleteTask(task.id);
      // navigate('/tasks');
    } catch (err) {
      console.error('Erro ao excluir tarefa:', err);
      alert('Erro ao excluir tarefa');
    }
  };

  // Estados de loading e error
  if (loading) {
    return (
      <div className="task-detail-loading">
        <FaSpinner className="spinner" />
        <p>Carregando detalhes da tarefa...</p>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="task-detail-error">
        <FaExclamationTriangle />
        <h3>Erro ao carregar tarefa</h3>
        <p>{error || 'Tarefa não encontrada'}</p>
        <button onClick={handleBack} className="back-button">
          <FaArrowLeft /> Voltar para lista
        </button>
      </div>
    );
  }

  return (
    <div className="task-detail-container">
      {/* Cabeçalho */}
      <TaskHeader 
        task={task}
        onBack={handleBack}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Navegação por tabs */}
      <div className="task-detail-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Conteúdo da tab */}
      <div className="task-detail-content">
        {renderTabContent()}
      </div>

      {/* Status da tarefa */}
      <div className="task-status-bar">
        <div className="status-indicator">
          <span className="status-label">Status:</span>
          <span className={`status-value status-${task.status?.name?.toLowerCase() || 'unknown'}`}>
            {task.status?.name || 'Desconhecido'}
          </span>
        </div>
        
        <div className="priority-indicator">
          <span className="priority-label">Prioridade:</span>
          <span className={`priority-value priority-${task.priority?.name?.toLowerCase() || 'medium'}`}>
            {task.priority?.name || 'Média'}
          </span>
        </div>

        <div className="task-actions">
          <button onClick={() => setActiveTab('comments')} className="action-button">
            <FaComment /> Comentar
          </button>
          <button onClick={handleEdit} className="action-button edit">
            <FaEdit /> Editar
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailPage;