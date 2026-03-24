import React, { useState, useEffect } from 'react';
import {
  FaArrowLeft,
  FaEdit,
  FaTrash,
  FaTimes,
  FaSave,
  FaCheckCircle,
  FaExclamationTriangle,
  FaCalendarAlt,
  FaFlag,
  FaUser,
  FaProjectDiagram,
  FaHistory,
  FaClock,
  FaSync,
  FaLink,
  FaPlusCircle,
  FaMinusCircle,
  FaFileAlt,
  FaPaperclip,
  FaArrowUp,
  FaComment
} from 'react-icons/fa';

// Importação dos componentes children (verifique os caminhos em seu projeto)
import RecurrenceConfig from './RecurrenceConfig';
import CommentsSection from './comments/CommentsSection';
import TaskHistorySection from './history/TaskHistorySection';
import TaskExecutionLog from './logs/TaskExecutionLog';

// Imports de API e Utilitários (assumidos globais ou em utils/)
import api from '../services/api';
import { safeParseDate, safeFormatDate } from '../utils/dateUtils';

// Tipos (ajuste conforme seu arquivo de types global)
import type { Task, User, Status, Priority, Project } from '../types';

export interface Agent {
  id: string;
  identity?: {
    name: string;
    model: string;
  };
}

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================

const TaskDetail: React.FC<{
  task: Task;
  tasks: Task[];
  users: User[];
  statuses: Status[];
  priorities: Priority[];
  projects: Project[];
  currentUser: User;
  onBack: () => void;
  onUpdateTask: (id: string, data: Partial<Task>) => Promise<void>;
  onDeleteTask: (id: string) => Promise<void>;
  onToggleCompletion: (id: string) => Promise<void>;
}> = ({
  task,
  tasks,
  users,
  statuses,
  priorities,
  projects,
  currentUser,
  onBack,
  onUpdateTask,
  onDeleteTask,
  onToggleCompletion
}) => {
  // ==========================================
  // ESTADOS
  // ==========================================
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("comments");
  const [editedTask, setEditedTask] = useState<Partial<Task>>({ ...task });
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);

  // Helpers para buscar dados relacionados
  const getAssignedUser = () => users?.find(user => user.id === task.assignedToId);
  const getStatus = () => statuses?.find(status => status.id === task.statusId);
  const getPriority = () => priorities?.find(priority => priority.id === task.priorityId);
  const getCreator = () => users?.find(user => user.id === task.createdById);
  const getProject = () => projects?.find(project => project.id === task.projectId);

  const assignedUser = getAssignedUser();
  const status = getStatus();
  const priority = getPriority();
  const creator = getCreator();
  const project = getProject();

  // Data e Formatação
  const deadlineDate = safeParseDate(task.deadline);
  const isOverdue = !task.isCompleted && deadlineDate && deadlineDate < new Date();
  const formattedDeadline = safeFormatDate(task.deadline, "dd 'de' MMMM 'de' yyyy 'às' HH:mm") || 'Não definido';
  const formattedCreatedAt = safeFormatDate(task.createdAt, "dd 'de' MMMM 'de' yyyy 'às' HH:mm") || 'Data inválida';

  // Scroll to Top
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Dependências
  const [dependencies, setDependencies] = useState<Task[]>([]);
  const [selectedDependencyId, setSelectedDependencyId] = useState<string>('');
  const [isLoadingDependencies, setIsLoadingDependencies] = useState(false);

  // ==========================================
  // EFFECTS (Ciclo de Vida)
  // ==========================================

  // Scroll Event
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Carregar Dependências
  useEffect(() => {
    const loadDependencies = async () => {
      if (!task.id) return;
      
      setIsLoadingDependencies(true);
      try {
        const response = await api.getTask(task.id);
        const taskData = response.task || response.data || response;
        
        if (taskData.dependencies && Array.isArray(taskData.dependencies)) {
          const dependentTasks = taskData.dependencies
            .map((dep: any) => dep.dependentTask || tasks?.find(t => t.id === dep.dependentTaskId))
            .filter(Boolean);
          setDependencies(dependentTasks as Task[]);
        } else if (taskData.dependents && Array.isArray(taskData.dependents)) {
          const dependentTasks = taskData.dependents
             .map((dep: any) => dep.task || tasks?.find(t => t.id === dep.task?.id))
             .filter(Boolean);
          setDependencies(dependentTasks as Task[]);
        }
      } catch (error) {
        console.error('❌ [TaskDetail] Error loading dependencies:', error);
      } finally {
        setIsLoadingDependencies(false);
      }
    };

    loadDependencies();
  }, [task.id, tasks]);

  // Carregar Agentes (API)
  useEffect(() => {
    const loadAgents = async () => {
      try {
        const response = await api.getAgents();
        setAgents(response.data || []);
      } catch (error) {
        console.error('❌ TaskDetail: Erro ao carregar agentes:', error);
      }
    };
    loadAgents();
  }, []);

  // Default Agent Logic
  useEffect(() => {
    if (project && project.programadorContratado && !task.agent) {
      setEditedTask(prev => ({ ...prev, agent: project.programadorContratado }));
    } else if (!task.agent && typeof window !== 'undefined') {
      const lastUsedAgent = localStorage.getItem('lastUsedAgent');
      if (lastUsedAgent) {
        setEditedTask(prev => ({ ...prev, agent: lastUsedAgent }));
      }
    }
  }, [project, task.agent]);

  // ==========================================
  // HANDLERS
  // ==========================================

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const addDependency = async () => {
    if (!selectedDependencyId || !onUpdateTask) return;
    
    try {
      const dependencyData = {
        taskId: task.id,
        dependentTaskId: selectedDependencyId,
        type: 'BLOCKING'
      };
      
      await api.createDependency(dependencyData);
      const addedTask = tasks?.find(t => t.id === selectedDependencyId);
      if (addedTask) {
        setDependencies(prev => [...prev, addedTask]);
        setSelectedDependencyId('');
      }
    } catch (error) {
      console.error('Error adding dependency:', error);
      setError('Erro ao adicionar dependência. Verifique se a dependência já existe.');
    }
  };

  const removeDependency = async (dependencyId: string) => {
    if (!onUpdateTask) return;
    
    try {
      const dependencyToRemove = dependencies?.find(d => d.id === dependencyId);
      if (!dependencyToRemove) return;
      
      await api.deleteDependency(task.id, dependencyId);
      setDependencies(prev => prev.filter(d => d.id !== dependencyId));
    } catch (error) {
      console.error('Error removing dependency:', error);
      setError('Erro ao remover dependência.');
    }
  };

  const getAvailableTasksForDependencies = () => {
    const currentDependencyIds = new Set(dependencies.map(d => d.id));
    return tasks.filter(t => 
      t.id !== task.id && 
      !currentDependencyIds.has(t.id) && 
      t.projectId === task.projectId
    );
  };

  // Lógica de Save
  const handleSave = async () => {
    if (!onUpdateTask) return;
    
    setIsSaving(true);
    setError(null);
    
    try {
      const updateData: Partial<Task> = {};
      
      if (editedTask.title !== undefined && editedTask.title !== task.title) updateData.title = editedTask.title;
      if (editedTask.description !== undefined && editedTask.description !== task.description) updateData.description = editedTask.description;
      if (editedTask.deadline !== undefined && editedTask.deadline !== task.deadline) updateData.deadline = editedTask.deadline;
      if (editedTask.statusId !== undefined && editedTask.statusId !== task.statusId) updateData.statusId = editedTask.statusId;
      if (editedTask.priorityId !== undefined && editedTask.priorityId !== task.priorityId) updateData.priorityId = editedTask.priorityId;
      
      if (editedTask.assignedToId !== undefined && editedTask.assignedToId !== '') {
        if (editedTask.assignedToId !== task.assignedToId) {
          updateData.assignedToId = editedTask.assignedToId;
        }
      } else if (task.assignedToId) {
        updateData.assignedToId = '';
      }

      if (editedTask.projectId !== undefined && editedTask.projectId !== task.projectId) updateData.projectId = editedTask.projectId;
      if (editedTask.agent !== undefined && editedTask.agent !== task.agent) updateData.agent = editedTask.agent;
      
      if (editedTask.isRecurring !== undefined) updateData.isRecurring = editedTask.isRecurring;
      if (editedTask.recurrenceType !== undefined) updateData.recurrenceType = editedTask.recurrenceType;
      if (editedTask.recurrenceTimes !== undefined) updateData.recurrenceTimes = editedTask.recurrenceTimes;
      if (editedTask.recurrenceDays !== undefined) updateData.recurrenceDays = editedTask.recurrenceDays;
      
      if (Object.keys(updateData).length > 0) {
        await onUpdateTask(task.id, updateData);
        if (updateData.agent) localStorage.setItem('lastUsedAgent', updateData.agent);
        setIsEditing(false);
      } else {
        setIsEditing(false);
      }
    } catch (error: any) {
      console.error('Failed to update task:', error);
      setError(error.message || 'Erro ao salvar tarefa.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!onDeleteTask) return;
    
    if (window.confirm('Tem certeza que deseja excluir esta tarefa?')) {
      setIsDeleting(true);
      setError(null);
      
      try {
        await onDeleteTask(task.id);
        onBack();
      } catch (error: any) {
        console.error('Failed to delete task:', error);
        setError(error.message || 'Erro ao excluir tarefa.');
        setIsDeleting(false);
      }
    }
  };

  const handleToggleCompletion = async () => {
    if (onToggleCompletion) {
      setError(null);
      try {
        await onToggleCompletion(task.id);
      } catch (error: any) {
        console.error('Failed to toggle:', error);
        setError(error.message || 'Erro ao alterar status.');
      }
    }
  };

  const handleCancelEdit = () => {
    setEditedTask({ ...task });
    setIsEditing(false);
    setError(null);
  };

  // Componente auxiliar FileViewer
  const FileViewer = ({ title, content }: { title: string; content: string }) => {
    return (
      <div style={{ marginBottom: '16px', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
        <div style={{ background: '#f3f4f6', padding: '8px 12px', fontWeight: 600, fontSize: '14px', borderBottom: '1px solid #e5e7eb' }}>
          {title}
        </div>
        <pre style={{ padding: '12px', background: 'white', fontSize: '12px', color: '#4b5563', overflow: 'auto', maxHeight: '200px' }}>
          {content}
        </pre>
      </div>
    );
  };

  return (
    <div className="task-detail-container">
      {/* Header Section */}
      <div style={{ marginBottom: '32px' }}>
        <button
          onClick={onBack}
          className="back-button margin-bottom-20"
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3f6183'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-card)'}
          style={{
            padding: '8px 16px',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            backgroundColor: 'var(--bg-card)',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          <FaArrowLeft size={14} /> Voltar para lista
        </button>

        {error && (
          <div style={{
            backgroundColor: '#fff',
            border: '1px solid var(--danger-color)',
            color: 'var(--danger-color)',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px'
          }}>
            <FaExclamationTriangle size={20} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <strong>Erro</strong>
              <span>{error}</span>
            </div>
          </div>
        )}

        <div className="card-white" style={{ padding: '24px', borderRadius: '12px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              {isEditing ? (
                <input
                  type="text"
                  value={editedTask.title || ''}
                  onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                  style={{ fontSize: '24px', fontWeight: 700, color: '#333', border: '1px solid #ddd', borderRadius: '6px', padding: '8px 12px', width: '100%', marginBottom: '12px' }}
                />
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#333', textDecoration: task.isCompleted ? 'line-through' : 'none', opacity: task.isCompleted ? 0.7 : 1 }}>
                    {task.title || 'Sem título'}
                  </h1>
                  <button
                    onClick={handleToggleCompletion}
                    style={{ padding: '6px 12px', backgroundColor: 'var(--bg-input)', color: task.isCompleted ? 'white' : '#333', border: `1px solid ${task.isCompleted ? 'var(--success-color)' : 'var(--border-color)'}`, borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}
                  >
                    <FaCheckCircle size={12} style={{ marginRight: '6px' }} />
                    {task.isCompleted ? 'Concluída' : 'Marcar como Concluída'}
                  </button>
                </div>
              )}

              {project && !isEditing && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <FaProjectDiagram size={16} color="var(--text-secondary)" />
                  <span style={{ fontSize: '16px', color: 'var(--text-secondary)', fontWeight: 500 }}>
                    Projeto: {project.name}
                  </span>
                </div>
              )}

              {isEditing ? (
                <textarea
                  value={editedTask.description || ''}
                  onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                  rows={4}
                  style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', resize: 'vertical', marginBottom: '16px' }}
                  placeholder="Descreva a tarefa..."
                />
              ) : (
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#333', marginBottom: '8px' }}>Descrição</h3>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, backgroundColor: 'var(--bg-input)', padding: '16px', borderRadius: '8px' }}>
                    {task.description || 'Esta tarefa não possui descrição.'}
                  </p>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              {!isEditing ? (
                <>
                  <button onClick={() => setIsEditing(true)} style={{ padding: '10px 16px', backgroundColor: 'var(--accent-color)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                    <FaEdit size={14} /> Editar
                  </button>
                  <button onClick={handleDelete} disabled={isDeleting} style={{ padding: '10px 16px', backgroundColor: isDeleting ? '#ccc' : '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: isDeleting ? 'not-allowed' : 'pointer' }}>
                    <FaTrash size={14} /> {isDeleting ? 'Excluindo...' : 'Excluir'}
                  </button>
                </>
              ) : (
                <>
                  <button onClick={handleCancelEdit} style={{ padding: '10px 16px', backgroundColor: '#f3f4f6', color: '#333', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer' }}>
                    <FaTimes size={14} /> Cancelar
                  </button>
                  <button onClick={handleSave} disabled={isSaving} style={{ padding: '10px 16px', backgroundColor: isSaving ? '#ccc' : '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: isSaving ? 'not-allowed' : 'pointer' }}>
                    <FaSave size={14} /> {isSaving ? 'Salvando...' : 'Salvar'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        
        {/* Status Card */}
        <div className="card-section" style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#333', marginBottom: '16px' }}>Status</h3>
          {isEditing ? (
            <div style={{ padding: '12px', backgroundColor: '#f3f4f6', borderRadius: '6px', fontSize: '14px' }}>
              <strong>Campo não editável nesta versão</strong>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: status?.colorCode || '#ccc' }} />
              <span style={{ fontSize: '16px', fontWeight: 500 }}>{status?.name || 'Desconhecido'}</span>
            </div>
          )}
        </div>

        {/* Priority Card */}
        <div className="card-section" style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#333', marginBottom: '16px' }}>Prioridade</h3>
          {isEditing ? (
            <select value={editedTask.priorityId || ''} onChange={(e) => setEditedTask({ ...editedTask, priorityId: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}>
              {priorities.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <FaFlag size={16} color={(priority?.weight || 0) >= 3 ? '#ef4444' : '#f59e0b'} />
              <span style={{ fontSize: '16px', fontWeight: 500 }}>{priority?.name || 'Desconhecida'}</span>
            </div>
          )}
        </div>

        {/* Deadline Card */}
        <div className="card-section-overdue" style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#333', marginBottom: '16px' }}>Prazo {isOverdue && '(Atrasado)'}</h3>
          {isEditing ? (
             <input
              type="datetime-local"
              value={editedTask.deadline ? safeParseDate(editedTask.deadline)?.toISOString().slice(0, 16) || '' : ''}
              onChange={(e) => {
                if (e.target.value) {
                  const date = safeParseDate(e.target.value + ':00.000Z');
                  if (date) setEditedTask({ ...editedTask, deadline: date.toISOString() });
                } else {
                  setEditedTask({ ...editedTask, deadline: '' });
                }
              }}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
            />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <FaCalendarAlt size={16} color={isOverdue ? '#ef4444' : '#6b7280'} />
              <div>
                <div style={{ fontSize: '16px', fontWeight: 500, color: isOverdue ? '#ef4444' : '#333' }}>{formattedDeadline}</div>
                {isOverdue && <small style={{ color: '#ef4444' }}>Esta tarefa está atrasada</small>}
              </div>
            </div>
          )}
        </div>

        {/* Recurrence Card */}
        <div className="card-section-recurring" style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#333', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaSync size={14} /> Recorrência {task.isRecurring && <span style={{ fontSize: '12px', backgroundColor: '#6366f1', color: 'white', padding: '2px 8px', borderRadius: '12px', marginLeft: '8px' }}>Ativa</span>}
          </h3>
          {isEditing ? (
            <RecurrenceConfig
              recurrenceType={editedTask.recurrenceType}
              recurrenceTimes={editedTask.recurrenceTimes}
              recurrenceDays={editedTask.recurrenceDays}
              onChange={(config) => setEditedTask({ ...editedTask, ...config, isRecurring: config.isRecurring })}
            />
          ) : task.isRecurring ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
               <p><strong>Periodicidade:</strong> {task.recurrenceType === 'daily' ? 'Diária' : task.recurrenceType === 'weekly' ? 'Semanal' : 'Mensal'}</p>
               {task.lastExecutedAt && <p><strong>Última Execução:</strong> {safeFormatDate(task.lastExecutedAt, 'dd/MM/yyyy HH:mm')}</p>}
               {task.nextExecutionAt && <p style={{ color: '#6366f1', fontWeight: 600 }}><strong>Próxima:</strong> {safeFormatDate(task.nextExecutionAt, 'dd/MM/yyyy HH:mm')}</p>}
            </div>
          ) : (
            <p style={{ color: '#9ca3af', fontStyle: 'italic' }}>Esta tarefa não é recorrente</p>
          )}
        </div>

        {/* Assigned To */}
        <div className="card-section" style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#333', marginBottom: '16px' }}>Atribuído a</h3>
          {isEditing ? (
            <select value={editedTask.assignedToId || ''} onChange={(e) => setEditedTask({ ...editedTask, assignedToId: e.target.value === '' ? undefined : e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}>
              <option value="">Selecione um usuário</option>
              {users.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
            </select>
          ) : assignedUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img src={assignedUser.avatarUrl || 'https://via.placeholder.com/40'} alt="" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
              <div>
                <div style={{ fontWeight: 500 }}>{assignedUser.name}</div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>{assignedUser.email}</div>
              </div>
            </div>
          ) : (
             <div style={{ color: '#9ca3af', fontStyle: 'italic' }}>Não atribuído</div>
          )}
        </div>

         {/* Agent Card */}
         <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#333', marginBottom: '16px' }}>Agente IA</h3>
            {isEditing ? (
              <select
                value={editedTask.agent || ''}
                onChange={(e) => setEditedTask({ ...editedTask, agent: e.target.value === '' ? undefined : e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
              >
                <option value="">Selecione um agente</option>
                {agents.map(agent => (
                  <option key={agent.id} value={agent.id}>
                    {agent.identity?.name || agent.id}
                  </option>
                ))}
              </select>
            ) : (
              <div>
                <div style={{ fontWeight: 500, fontSize: '16px' }}>
                  {(() => {
                     const agentObj = agents?.find(a => a.id === task.agent);
                     return agentObj ? (agentObj.identity?.name || agentObj.id) + (agentObj?.identity?.model ? ` [${agentObj.identity.model}]` : '') : 'Não definido';
                  })()}
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>Modelo de IA configurado para esta tarefa</div>
              </div>
            )}
        </div>

        {/* Parent Task (Hierarchy) */}
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
           <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#333', marginBottom: '16px' }}>Tarefa Pai</h3>
           {isEditing ? (
              <select value={editedTask.parentTaskId || ''} onChange={(e) => setEditedTask({ ...editedTask, parentTaskId: e.target.value === '' ? null : e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}>
                <option value="">Tarefa independente</option>
                {tasks.filter(t => t.projectId === task.projectId && t.id !== task.id).map(t => (
                  <option key={t.id} value={t.id}>{t.title}</option>
                ))}
              </select>
           ) : (
             <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
               <FaUser size={20} color="#6366f1" />
               <div>
                  <div style={{ fontSize: '16px', fontWeight: 500 }}>{task.parentTask?.title || 'Nenhuma'}</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>{task.parentTaskId ? `ID: ${task.parentTaskId}` : 'Independente'}</div>
               </div>
             </div>
           )}
        </div>

        {/* Dependencies (Blocking) */}
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#333', marginBottom: '16px' }}>Dependências</h3>
          
          {isEditing ? (
            <div>
               <div style={{ marginBottom: '16px' }}>
                  {isLoadingDependencies ? <p>Carregando...</p> : dependencies.length === 0 ? (
                    <div style={{ padding: '10px', background: '#f3f4f6', borderRadius: '6px', textAlign: 'center', fontSize: '13px', color: '#6b7280' }}>Nenhuma dependência</div>
                  ) : (
                    <ul style={{ padding: 0, listStyle: 'none' }}>
                      {dependencies.map(dep => (
                        <li key={dep.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', padding: '8px', background: '#f9fafb', borderRadius: '4px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                             <FaLink size={12} color="#6366f1" />
                             <span>{dep.title} {dep.isCompleted ? '[Concluída]' : '[Pendente]'}</span>
                          </div>
                          <button onClick={() => removeDependency(dep.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><FaTimes size={12} /></button>
                        </li>
                      ))}
                    </ul>
                  )}
               </div>
               
               <div style={{ display: 'flex', gap: '8px' }}>
                 <select value={selectedDependencyId} onChange={(e) => setSelectedDependencyId(e.target.value)} style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }}>
                    <option value="">Adicionar nova...</option>
                    {getAvailableTasksForDependencies().map(t => (
                      <option key={t.id} value={t.id}>{t.title}</option>
                    ))}
                 </select>
                 <button onClick={addDependency} disabled={!selectedDependencyId} style={{ padding: '8px', background: selectedDependencyId ? '#6366f1' : '#ccc', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                   <FaPlusCircle size={14} />
                 </button>
               </div>
            </div>
          ) : (
            <div>
              {isLoadingDependencies ? <p>Carregando...</p> : dependencies.length === 0 ? (
                 <p style={{ color: '#9ca3af' }}>Esta tarefa não depende de outras.</p>
              ) : (
                 <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {dependencies.map(dep => (
                      <span key={dep.id} style={{ padding: '4px 8px', background: dep.isCompleted ? '#d1fae5' : '#fee2e2', color: dep.isCompleted ? '#065f46' : '#991b1b', borderRadius: '12px', fontSize: '12px' }}>
                        {dep.title}
                      </span>
                    ))}
                 </div>
              )}
            </div>
          )}
        </div>

        {/* Project Card */}
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
           <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#333', marginBottom: '16px' }}>Projeto</h3>
           {isEditing ? (
              <select value={editedTask.projectId || ''} onChange={(e) => setEditedTask({ ...editedTask, projectId: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
           ) : project ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                 <FaProjectDiagram size={20} color="#6366f1" />
                 <div>
                   <div style={{ fontWeight: 500, fontSize: '16px' }}>{project.name}</div>
                   {project.regras && (
                     <div style={{ marginTop: '8px', padding: '8px', background: '#f3f4f6', borderRadius: '4px', borderLeft: '3px solid #6366f1' }}>
                       <small style={{ display: 'block', fontWeight: 600, marginBottom: '4px' }}>Regras:</small>
                       <pre style={{ margin: 0, fontSize: '11px', whiteSpace: 'pre-wrap' }}>{project.regras}</pre>
                     </div>
                   )}
                 </div>
              </div>
           ) : <p>Não encontrado</p>}
        </div>

      </div>

      {/* Metadata (Technical Info) */}
      <div style={{ backgroundColor: '#f9fafb', padding: '20px', borderRadius: '12px', marginBottom: '32px' }}>
         <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#4b5563', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Metadados</h3>
         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div><small style={{ display: 'block', color: '#9ca3af' }}>Created At</small><span style={{ fontWeight: 500, fontSize: '13px' }}>{safeFormatDate(task.createdAt)}</span></div>
            <div><small style={{ display: 'block', color: '#9ca3af' }}>Updated At</small><span style={{ fontWeight: 500, fontSize: '13px' }}>{safeFormatDate(task.updatedAt)}</span></div>
            <div><small style={{ display: 'block', color: '#9ca3af' }}>Last Executed</small><span style={{ fontWeight: 500, fontSize: '13px' }}>{task.lastExecutedAt ? safeFormatDate(task.lastExecutedAt, "dd/MM/yyyy HH:mm") : 'Nunca'}</span></div>
            <div><small style={{ display: 'block', color: '#9ca3af' }}>Next Execution</small><span style={{ fontWeight: 500, fontSize: '13px' }}>{task.nextExecutionAt ? safeFormatDate(task.nextExecutionAt, "dd/MM/yyyy HH:mm") : 'N/A'}</span></div>
         </div>
      </div>

      {/* Tabs */}
      <div className="card-table" style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
         <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb' }}>
            {['comments', 'history', 'execution', 'generatedFiles'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                   flex: 1,
                   padding: '16px',
                   background: activeTab === tab ? 'white' : 'transparent',
                   border: 'none',
                   borderBottom: activeTab === tab ? '3px solid #6366f1' : '3px solid transparent',
                   color: activeTab === tab ? '#333' : '#6b7280',
                   fontWeight: activeTab === tab ? 600 : 500,
                   cursor: 'pointer',
                   display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px'
                }}
              >
                 {tab === 'comments' && <FaComment size={12} />}
                 {tab === 'history' && <FaHistory size={12} />}
                 {tab === 'execution' && <FaClock size={12} />}
                 {tab === 'generatedFiles' && <FaFileAlt size={12} />}
                 {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
         </div>

         <div style={{ padding: '24px', minHeight: '300px' }}>
            {activeTab === 'comments' && <CommentsSection taskId={task.id} currentUser={currentUser} />}
            {activeTab === 'history' && <TaskHistorySection taskId={task.id} currentUser={currentUser} />}
            {activeTab === 'execution' && <TaskExecutionLog taskId={task.id} currentUser={currentUser} />}
            
            {activeTab === 'generatedFiles' && (
               <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px' }}>Arquivos Gerados / Logs</h3>
                  {!task.arquitetosPromptContent && !task.programadorReportContent && <p style={{ color: '#9ca3af' }}>Nenhum arquivo disponível.</p>}
                  
                  {task.arquitetosPromptContent && <FileViewer title="Prompt do Arquiteto" content={task.arquitetosPromptContent} />}
                  {task.arquitetosAnalysisContent && <FileViewer title="Análise do Arquiteto" content={task.arquitetosAnalysisContent} />}
                  {task.programadorReportContent && <FileViewer title="Relatório do Programador" content={task.programadorReportContent} />}
               </div>
            )}
         </div>
      </div>

       {/* Back To Top Button */}
       {showBackToTop && (
         <button
            onClick={scrollToTop}
            style={{
               position: 'fixed', bottom: '30px', right: '30px', width: '50px', height: '50px', borderRadius: '50%',
               backgroundColor: '#6366f1', color: 'white', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
               cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', zIndex: 1000
            }}
         >
            <FaArrowUp />
         </button>
       )}
    </div>
  );
};

export default TaskDetail;