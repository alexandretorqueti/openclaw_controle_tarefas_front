import React, { useState, useEffect } from 'react';
import { 
  FaFolder, FaFolderOpen, FaChevronRight, FaChevronDown, 
  FaEye, FaEdit, FaTrash, FaPlus, FaTasks, FaArrowLeft,
  FaCode, FaDatabase, FaServer, FaGlobe, FaCheckCircle,
  FaClock, FaUser, FaTag, FaLink
} from 'react-icons/fa';
import api from '../services/api';
import TaskCard from './TaskCard';

interface Task {
  id: string;
  title: string;
  description: string;
  status: {
    id: string;
    name: string;
    color: string;
  };
  priority: {
    id: string;
    name: string;
    color: string;
  };
  assignedTo?: {
    id: string;
    name: string;
    avatarUrl: string;
  };
  createdBy?: {
    id: string;
    name: string;
  };
  project: {
    id: string;
    name: string;
  };
  parentTask?: {
    id: string;
    title: string;
  };
  parentTaskId?: string;
  domain?: 'BACKEND' | 'FRONTEND';
  isAtomic?: boolean;
  isCompleted: boolean;
  deadline: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    subtasks: number;
  };
}

interface TaskTreeViewProps {
  taskId: string;
  onBack?: () => void;
  onTaskSelect?: (task: Task) => void;
  onDeleteTask?: (id: string) => Promise<void>;
  // Props for TaskCard functionality
  users?: any[];
  statuses?: any[];
  priorities?: any[];
  projects?: any[];
  agents?: any[];
  onUpdateTask?: (id: string, taskData: Partial<Task>) => Promise<any>;
  onToggleCompletion?: (id: string) => Promise<void>;
}

const TaskTreeView: React.FC<TaskTreeViewProps> = ({ 
  taskId, 
  onBack, 
  onTaskSelect, 
  onDeleteTask,
  // TaskCard props
  users = [],
  statuses = [],
  priorities = [],
  projects = [],
  agents = [],
  onUpdateTask,
  onToggleCompletion
}) => {
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [subtasks, setSubtasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [taskHierarchy, setTaskHierarchy] = useState<Task[]>([]);

  // Carregar tarefa atual e sua hierarquia
  const loadTaskAndHierarchy = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Carregando tarefa:', taskId);
      // Carregar tarefa atual
      const taskResponse = await api.getTask(taskId);
      console.log('📦 Resposta completa da API:', taskResponse);
      
      // A API pode retornar { task: {...} } ou { data: {...} }
      const task = taskResponse.task || taskResponse.data || taskResponse;
      console.log('✅ Tarefa extraída:', task);
      console.log('📊 parentTask:', task.parentTask);
      console.log('📊 parentTaskId:', task.parentTaskId);
      setCurrentTask(task);
      
      // Carregar hierarquia (tarefas pai recursivamente)
      const hierarchy: Task[] = [task];
      let parentId = task.parentTask?.id || task.parentTaskId;
      
      while (parentId) {
        try {
          const parentResponse = await api.getTask(parentId);
          const parentTask = parentResponse.data;
          hierarchy.unshift(parentTask);
          parentId = parentTask.parentTask?.id || parentTask.parentTaskId;
        } catch (err) {
          console.error('Erro ao carregar tarefa pai:', err);
          break;
        }
      }
      
      setTaskHierarchy(hierarchy);
      
      // Carregar subtarefas diretas
      await loadSubtasks(taskId);
      
    } catch (err: any) {
      console.error('❌ Erro detalhado:', err);
      console.error('❌ Stack:', err.stack);
      console.error('❌ Response:', err.response);
      setError(`Erro ao carregar tarefa: ${err.message || 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };

  // Carregar subtarefas de uma tarefa
  const loadSubtasks = async (parentTaskId: string) => {
    try {
      const response = await api.getTasks({ parentTaskId });
      console.log('📦 Resposta de subtarefas:', response);
      
      // A API pode retornar { tasks: [...] } ou { data: { tasks: [...] } }
      const allTasks = response.tasks || response.data?.tasks || response.data || [];
      
      // Filtrar apenas as tarefas que realmente têm este parentTaskId
      const subtasks = allTasks.filter(task => 
        task.parentTask?.id === parentTaskId || 
        task.parentTaskId === parentTaskId
      );
      
      console.log(`📊 Total de tarefas retornadas: ${allTasks.length}`);
      console.log(`✅ ${subtasks.length} subtarefas filtradas para parentTaskId: ${parentTaskId}`);
      console.log('🔍 Subtarefas:', subtasks.map(t => ({ id: t.id, title: t.title, parentTaskId: t.parentTaskId })));
      
      setSubtasks(subtasks);
    } catch (err) {
      console.error('Erro ao carregar subtarefas:', err);
      setSubtasks([]);
    }
  };

  // Carregar subtarefas recursivamente
  const loadSubtasksRecursive = async (parentTaskId: string) => {
    try {
      const response = await api.getTasks({ parentTaskId });
      return response.data.tasks || [];
    } catch (err) {
      console.error('Erro ao carregar subtarefas recursivas:', err);
      return [];
    }
  };

  // Alternar expansão de uma tarefa
  const toggleExpand = async (taskId: string) => {
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedTasks(newExpanded);
  };

  // Navegar para uma subtarefa
  const navigateToTask = (task: Task) => {
    if (onTaskSelect) {
      onTaskSelect(task);
    }
  };

  // Excluir uma tarefa
  const handleDeleteTask = async (taskId: string, taskTitle: string) => {
    if (!onDeleteTask) return;
    
    if (confirm(`Tem certeza que deseja excluir a tarefa "${taskTitle}"?`)) {
      try {
        await onDeleteTask(taskId);
        // Recarregar subtarefas após exclusão
        if (currentTask) {
          await loadSubtasks(currentTask.id);
        }
      } catch (err) {
        console.error('Erro ao excluir tarefa:', err);
        alert('Erro ao excluir tarefa. Verifique o console para detalhes.');
      }
    }
  };

  // Wrapper function for TaskCard (expects only id)
  const handleDeleteTaskForCard = async (taskId: string) => {
    const taskToDelete = subtasks.find(t => t.id === taskId) || currentTask;
    if (taskToDelete) {
      await handleDeleteTask(taskId, taskToDelete.title);
    }
  };

  // Renderizar breadcrumb de navegação
  const renderBreadcrumb = () => {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '20px',
        padding: '12px 16px',
        backgroundColor: 'var(--bg-card)',
        borderRadius: '8px',
        border: '1px solid var(--border-color)',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={onBack}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            backgroundColor: 'transparent',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            cursor: 'pointer',
            color: 'var(--text-secondary)',
            fontSize: '14px'
          }}
        >
          <FaArrowLeft size={12} />
          Voltar
        </button>
        
        <span style={{ color: 'var(--text-tertiary)' }}>|</span>
        
        {/* Projeto */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <FaFolder size={14} color="#4f46e5" />
          <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
            {currentTask?.project.name}
          </span>
        </div>
        
        {/* Hierarquia de tarefas */}
        {taskHierarchy.map((task, index) => (
          <React.Fragment key={task.id}>
            <span style={{ color: 'var(--text-tertiary)' }}>›</span>
            <div 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px',
                cursor: index < taskHierarchy.length - 1 ? 'pointer' : 'default'
              }}
              onClick={index < taskHierarchy.length - 1 ? () => navigateToTask(task) : undefined}
            >
              <FaTasks size={14} color={index === taskHierarchy.length - 1 ? '#10b981' : '#6b7280'} />
              <span style={{ 
                fontWeight: index === taskHierarchy.length - 1 ? '700' : '500',
                color: index === taskHierarchy.length - 1 ? 'var(--text-primary)' : 'var(--text-secondary)'
              }}>
                {task.title.length > 30 ? task.title.substring(0, 30) + '...' : task.title}
              </span>
            </div>
          </React.Fragment>
        ))}
      </div>
    );
  };

  // Renderizar uma tarefa na árvore
    const renderTaskNode = (task: Task, level: number = 0) => {
    const hasSubtasks = task._count?.subtasks > 0;
    const isExpanded = expandedTasks.has(task.id);
    
    // Prepare task data for TaskCard
    const taskForCard = {
      ...task,
      // Ensure all required fields for TaskCard
      statusId: task.status?.id || '',
      priorityId: task.priority?.id || '',
      assignedToId: task.assignedTo?.id || '',
      createdById: task.createdBy?.id || '',
      projectId: task.project?.id || ''
    };
    
    return (
      <div key={task.id} style={{ marginBottom: '12px' }}>
        {/* Container principal com TaskCard */}
        <div style={{ 
          marginLeft: `${level * 32}px`,
          position: 'relative'
        }}>
          {/* Linha de conexão (opcional) */}
          {level > 0 && (
            <div style={{
              position: 'absolute',
              left: '-16px',
              top: '0',
              bottom: '0',
              width: '2px',
              backgroundColor: 'var(--border-color)'
            }} />
          )}
          
          {/* Ícone de expansão para tarefas com subtarefas */}
          {hasSubtasks && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(task.id);
              }}
              style={{
                position: 'absolute',
                left: '-28px',
                top: '24px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                color: 'var(--text-secondary)',
                zIndex: 1
              }}
              title={isExpanded ? "Recolher subtarefas" : "Expandir subtarefas"}
            >
              {isExpanded ? <FaChevronDown size={14} /> : <FaChevronRight size={14} />}
            </button>
          )}
          
          {/* TaskCard com todas as informações e funcionalidades */}
          <div 
            onClick={() => onTaskSelect && onTaskSelect(task)}
            style={{ cursor: 'pointer' }}
          >
            <TaskCard
              task={taskForCard}
              users={users}
              statuses={statuses}
              priorities={priorities}
              projects={projects}
              agents={agents}
              onTaskClick={onTaskSelect}
              onViewSubtasks={hasSubtasks ? () => toggleExpand(task.id) : undefined}
              onUpdateTask={onUpdateTask}
              onDeleteTask={handleDeleteTaskForCard}
              onToggleCompletion={onToggleCompletion}
              compact={false}
            />
          </div>
          
          {/* Badges adicionais específicos para hierarquia */}
          <div style={{ 
            display: 'flex', 
            gap: '8px', 
            marginTop: '8px',
            marginLeft: '16px'
          }}>
            {/* Domínio */}
            {task.domain && (
              <span style={{
                padding: '4px 10px',
                backgroundColor: task.domain === 'BACKEND' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(236, 72, 153, 0.1)',
                color: task.domain === 'BACKEND' ? '#3b82f6' : '#ec4899',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                {task.domain === 'BACKEND' ? <FaDatabase size={12} /> : <FaGlobe size={12} />}
                {task.domain}
              </span>
            )}
            
            {/* Atômica */}
            {task.isAtomic && (
              <span style={{
                padding: '4px 10px',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                color: '#10b981',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <FaCheckCircle size={12} />
                Validada
              </span>
            )}
            
            {/* Contador de subtarefas */}
            {hasSubtasks && (
              <span style={{
                padding: '4px 10px',
                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                color: '#8b5cf6',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <FaTasks size={12} />
                {task._count?.subtasks} subtarefa(s)
              </span>
            )}
          </div>
        </div>
        
        {/* Subtarefas (renderizadas recursivamente) */}
        {isExpanded && hasSubtasks && (
          <div style={{ marginTop: '16px' }}>
            {subtasks
              .filter(subtask => {
                const matches = subtask.parentTask?.id === task.id || subtask.parentTaskId === task.id;
                if (!matches) {
                  console.log(`❌ Subtarefa não pertence: ${subtask.id} (parent: ${subtask.parentTaskId}) não é filha de ${task.id}`);
                }
                return matches;
              })
              .map(subtask => renderTaskNode(subtask, level + 1))}
          </div>
        )}
      </div>
    );
  };

  useEffect(() => {
    loadTaskAndHierarchy();
  }, [taskId]);

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '24px', color: 'var(--text-secondary)' }}>
          <FaTasks />
        </div>
        <p>Carregando hierarquia de tarefas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', color: 'var(--danger-color)' }}>
        <h3>Erro ao carregar tarefa</h3>
        <p>{error}</p>
        <button
          onClick={loadTaskAndHierarchy}
          style={{
            padding: '10px 20px',
            backgroundColor: 'var(--primary-color)',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (!currentTask) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h3>Tarefa não encontrada</h3>
        <button
          onClick={onBack}
          style={{
            padding: '10px 20px',
            backgroundColor: 'var(--primary-color)',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Voltar
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      {/* Breadcrumb de navegação */}
      {renderBreadcrumb()}
      
      {/* Cabeçalho da tarefa atual */}
      <div style={{
        backgroundColor: 'var(--bg-card)',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
        border: '2px solid var(--primary-color)',
        boxShadow: '0 4px 12px rgba(79, 70, 229, 0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ 
              margin: '0 0 12px 0', 
              fontSize: '24px',
              color: 'var(--text-primary)'
            }}>
              {currentTask.title}
            </h1>
            
            <p style={{ 
              margin: '0 0 20px 0',
              color: 'var(--text-secondary)',
              lineHeight: '1.6'
            }}>
              {currentTask.description}
            </p>
            
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <div>
                <strong style={{ color: 'var(--text-tertiary)', fontSize: '12px' }}>Status</strong>
                <div style={{
                  padding: '4px 12px',
                  backgroundColor: currentTask.status.color + '20',
                  color: currentTask.status.color,
                  borderRadius: '6px',
                  fontWeight: '600',
                  marginTop: '4px'
                }}>
                  {currentTask.status.name}
                </div>
              </div>
              
              <div>
                <strong style={{ color: 'var(--text-tertiary)', fontSize: '12px' }}>Prioridade</strong>
                <div style={{
                  padding: '4px 12px',
                  backgroundColor: currentTask.priority.color + '20',
                  color: currentTask.priority.color,
                  borderRadius: '6px',
                  fontWeight: '600',
                  marginTop: '4px'
                }}>
                  {currentTask.priority.name}
                </div>
              </div>
              
              {currentTask.domain && (
                <div>
                  <strong style={{ color: 'var(--text-tertiary)', fontSize: '12px' }}>Domínio</strong>
                  <div style={{
                    padding: '4px 12px',
                    backgroundColor: currentTask.domain === 'BACKEND' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(236, 72, 153, 0.1)',
                    color: currentTask.domain === 'BACKEND' ? '#3b82f6' : '#ec4899',
                    borderRadius: '6px',
                    fontWeight: '600',
                    marginTop: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    {currentTask.domain === 'BACKEND' ? <FaDatabase size={12} /> : <FaGlobe size={12} />}
                    {currentTask.domain}
                  </div>
                </div>
              )}
              
              {currentTask.isAtomic && (
                <div>
                  <strong style={{ color: 'var(--text-tertiary)', fontSize: '12px' }}>Validação</strong>
                  <div style={{
                    padding: '4px 12px',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    color: '#10b981',
                    borderRadius: '6px',
                    fontWeight: '600',
                    marginTop: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <FaCheckCircle size={12} />
                    Atômica (Validada)
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '8px' }}>
              Criado em: {new Date(currentTask.createdAt).toLocaleDateString('pt-BR')}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
              Atualizado em: {new Date(currentTask.updatedAt).toLocaleDateString('pt-BR')}
            </div>
          </div>
        </div>
      </div>
      
      {/* Lista de subtarefas */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <h2 style={{ margin: 0, fontSize: '20px', color: 'var(--text-primary)' }}>
            <FaTasks style={{ marginRight: '10px' }} />
            Subtarefas ({subtasks.length})
          </h2>
          
          <button
            style={{
              padding: '10px 20px',
              backgroundColor: 'var(--primary-color)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: '600'
            }}
            onClick={() => alert('Funcionalidade de adicionar subtarefa em desenvolvimento')}
          >
            <FaPlus size={14} />
            Nova Subtarefa
          </button>
        </div>
        
        {subtasks.length === 0 ? (
          <div style={{
            padding: '40px',
            textAlign: 'center',
            backgroundColor: 'var(--bg-card)',
            borderRadius: '12px',
            border: '2px dashed var(--border-color)'
          }}>
            <FaTasks size={48} color="var(--text-tertiary)" style={{ marginBottom: '16px' }} />
            <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-secondary)' }}>
              Nenhuma subtarefa encontrada
            </h3>
            <p style={{ color: 'var(--text-tertiary)', marginBottom: '20px' }}>
              Esta tarefa não possui subtarefas. Clique em "Nova Subtarefa" para adicionar.
            </p>
          </div>
        ) : (
          <div>
            {subtasks.map(task => renderTaskNode(task, 0))}
          </div>
        )}
      </div>
      
      {/* Informações da hierarquia */}
      {taskHierarchy.length > 1 && (
        <div style={{
          backgroundColor: 'var(--bg-card)',
          borderRadius: '12px',
          padding: '20px',
          marginTop: '24px',
          border: '1px solid var(--border-color)'
        }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: 'var(--text-primary)' }}>
            <FaLink style={{ marginRight: '8px' }} />
            Hierarquia Completa
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {taskHierarchy.map((task, index) => (
              <div 
                key={task.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 16px',
                  backgroundColor: index === taskHierarchy.length - 1 ? 'rgba(79, 70, 229, 0.1)' : 'transparent',
                  border: index === taskHierarchy.length - 1 ? '1px solid var(--primary-color)' : '1px solid var(--border-color)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onClick={() => navigateToTask(task)}
              >
                <div style={{ 
                  width: '24px', 
                  height: '24px', 
                  borderRadius: '50%',
                  backgroundColor: index === taskHierarchy.length - 1 ? 'var(--primary-color)' : 'var(--text-tertiary)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '12px',
                  fontWeight: '600',
                  fontSize: '12px'
                }}>
                  {index + 1}
                </div>
                
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    fontWeight: index === taskHierarchy.length - 1 ? '700' : '500',
                    color: index === taskHierarchy.length - 1 ? 'var(--primary-color)' : 'var(--text-primary)',
                    marginBottom: '4px'
                  }}>
                    {task.title}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    Nível {index + 1} • {task.status.name}
                  </div>
                </div>
                
                <FaChevronRight size={14} color="var(--text-tertiary)" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskTreeView;