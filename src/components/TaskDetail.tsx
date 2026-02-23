import React, { useState } from 'react';
import { Task, User, Status, Priority, Project } from '../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  FaUser, 
  FaCalendarAlt, 
  FaFlag, 
  FaListAlt, 
  FaProjectDiagram, 
  FaComment, 
  FaPaperclip,
  FaArrowLeft,
  FaCheckCircle,
  FaExclamationTriangle,
  FaEdit,
  FaTrash,
  FaSave,
  FaTimes,
  FaSync,
  FaHistory,
  FaClock
} from 'react-icons/fa';
import RecurrenceConfig from './RecurrenceConfig';

interface TaskDetailProps {
  task: Task;
  users: User[];
  statuses: Status[];
  priorities: Priority[];
  projects: Project[];
  onBack: () => void;
  onUpdateTask?: (id: string, taskData: Partial<Task>) => Promise<Task>;
  onDeleteTask?: (id: string) => Promise<void>;
  onToggleCompletion?: (id: string) => Promise<void>;
}

const TaskDetail: React.FC<TaskDetailProps> = ({
  task,
  users,
  statuses,
  priorities,
  projects,
  onBack,
  onUpdateTask,
  onDeleteTask,
  onToggleCompletion
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState<Partial<Task>>({ ...task });
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAssignedUser = () => users.find(user => user.id === task.assignedToId);
  const getStatus = () => statuses.find(status => status.id === task.statusId);
  const getPriority = () => priorities.find(priority => priority.id === task.priorityId);
  const getCreator = () => users.find(user => user.id === task.createdById);
  const getProject = () => projects.find(project => project.id === task.projectId);

  const assignedUser = getAssignedUser();
  const status = getStatus();
  const priority = getPriority();
  const creator = getCreator();
  const project = getProject();

  const deadlineDate = new Date(task.deadline);
  const isOverdue = !task.isCompleted && deadlineDate < new Date();
  const formattedDeadline = format(deadlineDate, "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR });
  const formattedCreatedAt = format(new Date(task.createdAt), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR });

  const handleSave = async () => {
    if (!onUpdateTask) return;
    
    setIsSaving(true);
    setError(null); // Limpa erros anteriores
    
    try {
      // Cria um objeto apenas com os campos que foram alterados
      const updateData: Partial<Task> = {};
      
      // Compara cada campo com o valor original
      if (editedTask.title !== undefined && editedTask.title !== task.title) {
        updateData.title = editedTask.title;
      }
      if (editedTask.description !== undefined && editedTask.description !== task.description) {
        updateData.description = editedTask.description;
      }
      if (editedTask.deadline !== undefined && editedTask.deadline !== task.deadline) {
        updateData.deadline = editedTask.deadline;
      }
      if (editedTask.statusId !== undefined && editedTask.statusId !== task.statusId) {
        updateData.statusId = editedTask.statusId;
      }
      if (editedTask.priorityId !== undefined && editedTask.priorityId !== task.priorityId) {
        updateData.priorityId = editedTask.priorityId;
      }
      // SEMPRE envia assignedToId se estiver definido e não for undefined, mesmo que seja o mesmo valor
      // Isso corrige o problema onde o usuário seleciona a mesma pessoa mas o frontend não envia
      if (editedTask.assignedToId !== undefined && editedTask.assignedToId !== '') {
        updateData.assignedToId = editedTask.assignedToId;
      }
      if (editedTask.projectId !== undefined && editedTask.projectId !== task.projectId) {
        updateData.projectId = editedTask.projectId;
      }
      
      // Só envia se houver algo para atualizar
      if (Object.keys(updateData).length > 0) {
        await onUpdateTask(task.id, updateData);
        setIsEditing(false);
      } else {
        setIsEditing(false);
      }
    } catch (error: any) {
      console.error('Failed to update task:', error);
      
      // Extrai mensagem de erro amigável
      let errorMessage = 'Erro ao salvar tarefa.';
      
      if (error.message) {
        errorMessage = error.message;
      }
      
      // Tenta extrair detalhes da resposta da API
      if (error.details && Array.isArray(error.details)) {
        const validationErrors = error.details.map((detail: any) => 
          detail.message || `${detail.path?.join('.')}: ${detail.code}`
        ).join(', ');
        
        if (validationErrors) {
          errorMessage = `Erros de validação: ${validationErrors}`;
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!onDeleteTask) return;
    
    if (window.confirm('Tem certeza que deseja excluir esta tarefa? Esta ação não pode ser desfeita.')) {
      setIsDeleting(true);
      setError(null); // Limpa erros anteriores
      
      try {
        await onDeleteTask(task.id);
        onBack();
      } catch (error: any) {
        console.error('Failed to delete task:', error);
        
        // Extrai mensagem de erro amigável
        let errorMessage = 'Erro ao excluir tarefa.';
        
        if (error.message) {
          errorMessage = error.message;
        }
        
        setError(errorMessage);
        setIsDeleting(false);
      }
    }
  };

  const handleToggleCompletion = async () => {
    if (onToggleCompletion) {
      setError(null); // Limpa erros anteriores
      
      try {
        await onToggleCompletion(task.id);
      } catch (error: any) {
        console.error('Failed to toggle task completion:', error);
        
        // Extrai mensagem de erro amigável
        let errorMessage = 'Erro ao alterar status da tarefa.';
        
        if (error.message) {
          errorMessage = error.message;
        }
        
        setError(errorMessage);
      }
    }
  };

  const handleCancelEdit = () => {
    setEditedTask({ ...task });
    setIsEditing(false);
    setError(null); // Limpa erros ao cancelar
  };

  // Log quando entra no modo de edição
  React.useEffect(() => {
    if (isEditing) {
      console.log('✏️ Entrou no modo de edição');
      console.log('✏️ editedTask no início da edição:', editedTask);
      console.log('✏️ assignedToId no início da edição:', editedTask.assignedToId);
    }
  }, [isEditing]);

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <button
          onClick={onBack}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            backgroundColor: '#f8f9fa',
            border: '1px solid #ddd',
            borderRadius: '8px',
            fontSize: '14px',
            cursor: 'pointer',
            marginBottom: '20px',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e9ecef'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
        >
          <FaArrowLeft size={14} />
          Voltar para lista
        </button>

        {/* Exibição de erro */}
        {error && (
          <div style={{
            backgroundColor: '#FFE5E5',
            border: '1px solid #FF6B6B',
            color: '#D32F2F',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px'
          }}>
            <FaExclamationTriangle size={20} />
            <div>
              <strong style={{ display: 'block', marginBottom: '4px' }}>Erro</strong>
              <span>{error}</span>
            </div>
          </div>
        )}

        <div style={{
          backgroundColor: '#fff',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              {isEditing ? (
                <input
                  type="text"
                  value={editedTask.title || ''}
                  onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                  style={{
                    fontSize: '24px',
                    fontWeight: 700,
                    color: '#333',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    width: '100%',
                    marginBottom: '12px'
                  }}
                />
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <h1 style={{ 
                    fontSize: '24px', 
                    fontWeight: 700, 
                    color: '#333',
                    textDecoration: task.isCompleted ? 'line-through' : 'none',
                    opacity: task.isCompleted ? 0.7 : 1
                  }}>
                    {task.title}
                  </h1>
                  <button
                    onClick={handleToggleCompletion}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: task.isCompleted ? '#06D6A0' : '#f8f9fa',
                      color: task.isCompleted ? '#fff' : '#333',
                      border: `1px solid ${task.isCompleted ? '#06D6A0' : '#ddd'}`,
                      borderRadius: '6px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <FaCheckCircle size={12} />
                    {task.isCompleted ? 'Concluída' : 'Marcar como Concluída'}
                  </button>
                </div>
              )}

              {project && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <FaProjectDiagram size={16} color="#666" />
                  <span style={{ fontSize: '16px', color: '#666', fontWeight: 500 }}>
                    Projeto: {project.name}
                  </span>
                </div>
              )}

              {isEditing ? (
                <textarea
                  value={editedTask.description || ''}
                  onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '14px',
                    resize: 'vertical',
                    marginBottom: '16px'
                  }}
                  placeholder="Descreva a tarefa..."
                />
              ) : (
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#333', marginBottom: '8px' }}>
                    Descrição
                  </h3>
                  <p style={{ 
                    fontSize: '14px', 
                    color: '#666', 
                    lineHeight: 1.6,
                    backgroundColor: '#f8f9fa',
                    padding: '16px',
                    borderRadius: '8px'
                  }}>
                    {task.description || 'Esta tarefa não possui descrição.'}
                  </p>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              {!isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    style={{
                      padding: '10px 16px',
                      backgroundColor: '#4ECDC4',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <FaEdit size={14} />
                    Editar
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    style={{
                      padding: '10px 16px',
                      backgroundColor: isDeleting ? '#ccc' : '#FF6B6B',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      cursor: isDeleting ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <FaTrash size={14} />
                    {isDeleting ? 'Excluindo...' : 'Excluir'}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleCancelEdit}
                    style={{
                      padding: '10px 16px',
                      backgroundColor: '#f8f9fa',
                      color: '#333',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '14px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <FaTimes size={14} />
                    Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    style={{
                      padding: '10px 16px',
                      backgroundColor: isSaving ? '#ccc' : '#06D6A0',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      cursor: isSaving ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <FaSave size={14} />
                    {isSaving ? 'Salvando...' : 'Salvar'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Task Details Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '24px',
        marginBottom: '32px'
      }}>
        {/* Status Card */}
        <div style={{
          backgroundColor: '#fff',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#333', marginBottom: '16px' }}>
            Status
          </h3>
          {isEditing ? (
            <select
              value={editedTask.statusId || ''}
              onChange={(e) => setEditedTask({ ...editedTask, statusId: e.target.value })}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            >
              {statuses.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                backgroundColor: status?.colorCode || '#666'
              }} />
              <span style={{ fontSize: '16px', fontWeight: 500, color: '#333' }}>
                {status?.name || 'Desconhecido'}
              </span>
            </div>
          )}
        </div>

        {/* Priority Card */}
        <div style={{
          backgroundColor: '#fff',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#333', marginBottom: '16px' }}>
            Prioridade
          </h3>
          {isEditing ? (
            <select
              value={editedTask.priorityId || ''}
              onChange={(e) => setEditedTask({ ...editedTask, priorityId: e.target.value })}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            >
              {priorities.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <FaFlag size={16} color={
                (priority?.weight || 0) >= 3 ? '#FF6B6B' : 
                (priority?.weight || 0) === 2 ? '#FFD166' : '#4ECDC4'
              } />
              <span style={{ fontSize: '16px', fontWeight: 500, color: '#333' }}>
                {priority?.name || 'Desconhecida'}
              </span>
            </div>
          )}
        </div>

        {/* Deadline Card */}
        <div style={{
          backgroundColor: '#fff',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          border: isOverdue ? '1px solid #FF6B6B' : 'none'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#333', marginBottom: '16px' }}>
            Prazo
            {isOverdue && (
              <span style={{ color: '#FF6B6B', marginLeft: '8px', fontSize: '14px' }}>
                (Atrasado)
              </span>
            )}
          </h3>
          {isEditing ? (
            <input
              type="datetime-local"
              value={editedTask.deadline ? new Date(editedTask.deadline).toISOString().slice(0, 16) : ''}
              onChange={(e) => setEditedTask({ ...editedTask, deadline: e.target.value })}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <FaCalendarAlt size={16} color={isOverdue ? '#FF6B6B' : '#666'} />
              <div>
                <div style={{ fontSize: '16px', fontWeight: 500, color: isOverdue ? '#FF6B6B' : '#333' }}>
                  {formattedDeadline}
                </div>
                {isOverdue && (
                  <div style={{ fontSize: '12px', color: '#FF6B6B', marginTop: '4px' }}>
                    <FaExclamationTriangle size={12} /> Esta tarefa está atrasada
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Recurrence Card */}
        <div style={{
          backgroundColor: '#fff',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          border: task.isRecurring ? '1px solid #4ECDC4' : 'none'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#333', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaSync size={14} />
            Recorrência
            {task.isRecurring && (
              <span style={{ fontSize: '12px', backgroundColor: '#4ECDC4', color: 'white', padding: '2px 8px', borderRadius: '12px', marginLeft: '8px' }}>
                Ativa
              </span>
            )}
          </h3>
          
          {isEditing ? (
            <RecurrenceConfig
              recurrenceType={editedTask.recurrenceType}
              recurrenceTimes={editedTask.recurrenceTimes}
              recurrenceDays={editedTask.recurrenceDays}
              onChange={(config) => {
                setEditedTask({
                  ...editedTask,
                  isRecurring: config.isRecurring,
                  recurrenceType: config.recurrenceType,
                  recurrenceTimes: config.recurrenceTimes,
                  recurrenceDays: config.recurrenceDays
                });
              }}
            />
          ) : task.isRecurring ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaSync size={14} color="#4ECDC4" />
                <span style={{ fontWeight: 500 }}>
                  {task.recurrenceType === 'daily' && 'Diária'}
                  {task.recurrenceType === 'weekly' && 'Semanal'}
                  {task.recurrenceType === 'monthly' && 'Mensal'}
                </span>
              </div>
              
              {task.recurrenceTimes && Array.isArray(task.recurrenceTimes) && task.recurrenceTimes.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FaClock size={14} color="#666" />
                  <span>Horários: {task.recurrenceTimes.join(', ')}</span>
                </div>
              )}
              
              {task.recurrenceType === 'weekly' && task.recurrenceDays && task.recurrenceDays.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FaCalendarAlt size={14} color="#666" />
                  <span>
                    Dias: {task.recurrenceDays.map(d => {
                      const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
                      return days[d];
                    }).join(', ')}
                  </span>
                </div>
              )}
              
              {task.lastExecutedAt && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FaHistory size={14} color="#666" />
                  <span>
                    Última execução: {format(new Date(task.lastExecutedAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                  </span>
                </div>
              )}
              
              {task.nextExecutionAt && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FaCalendarAlt size={14} color="#4ECDC4" />
                  <span style={{ fontWeight: 500 }}>
                    Próxima execução: {format(new Date(task.nextExecutionAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div style={{ color: '#666', fontStyle: 'italic' }}>
              Esta tarefa não é recorrente
            </div>
          )}
        </div>

        {/* Assigned To Card */}
        <div style={{
          backgroundColor: '#fff',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#333', marginBottom: '16px' }}>
            Atribuído a
          </h3>
          {isEditing ? (
            <select
              value={editedTask.assignedToId || ''}
              onChange={(e) => {
                const newValue = e.target.value;
                // Se for string vazia, define como undefined
                const assignedToId = newValue === '' ? undefined : newValue;
                setEditedTask({ ...editedTask, assignedToId });
              }}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            >
              <option value="">Selecione um usuário</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {assignedUser?.avatarUrl ? (
                <img 
                  src={assignedUser.avatarUrl} 
                  alt={assignedUser.name}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    objectFit: 'cover'
                  }}
                />
              ) : (
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: '#e3f2fd',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <FaUser size={20} color="#1976d2" />
                </div>
              )}
              <div>
                <div style={{ fontSize: '16px', fontWeight: 500, color: '#333' }}>
                  {assignedUser?.name || 'Não atribuído'}
                </div>
                {assignedUser && (
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                    {assignedUser.email}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Created By Card */}
        <div style={{
          backgroundColor: '#fff',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#333', marginBottom: '16px' }}>
            Criado por
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {creator?.avatarUrl ? (
              <img 
                src={creator.avatarUrl} 
                alt={creator.name}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  objectFit: 'cover'
                }}
              />
            ) : (
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: '#e3f2fd',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <FaUser size={20} color="#1976d2" />
              </div>
            )}
            <div>
              <div style={{ fontSize: '16px', fontWeight: 500, color: '#333' }}>
                {creator?.name || 'Desconhecido'}
              </div>
              <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                {formattedCreatedAt}
              </div>
            </div>
          </div>
        </div>

        {/* Project Card */}
        <div style={{
          backgroundColor: '#fff',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#333', marginBottom: '16px' }}>
            Projeto
          </h3>
          {isEditing ? (
            <select
              value={editedTask.projectId || ''}
              onChange={(e) => setEditedTask({ ...editedTask, projectId: e.target.value })}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            >
              {projects.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <FaProjectDiagram size={20} color="#4ECDC4" />
              <div>
                <div style={{ fontSize: '16px', fontWeight: 500, color: '#333' }}>
                  {project?.name || 'Projeto não encontrado'}
                </div>
                {project && (
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                    {project.description}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Metadata */}
      <div style={{
        backgroundColor: '#f8f9fa',
        padding: '20px',
        borderRadius: '12px',
        marginBottom: '32px'
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#333', marginBottom: '16px' }}>
          Informações Técnicas
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>ID da Tarefa</div>
            <div style={{ fontSize: '14px', fontWeight: 500, color: '#333', fontFamily: 'monospace' }}>
              {task.id}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Criado em</div>
            <div style={{ fontSize: '14px', fontWeight: 500, color: '#333' }}>
              {format(new Date(task.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Atualizado em</div>
            <div style={{ fontSize: '14px', fontWeight: 500, color: '#333' }}>
              {format(new Date(task.updatedAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Posição</div>
            <div style={{ fontSize: '14px', fontWeight: 500, color: '#333' }}>
              {task.position}
            </div>
          </div>
        </div>
      </div>

      {/* Placeholder for future features */}
      <div style={{
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        marginBottom: '32px',
        border: '2px dashed #ddd'
      }}>
        <div style={{ textAlign: 'center', color: '#666' }}>
          <FaComment size={24} style={{ marginBottom: '12px' }} />
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>
            Comentários
          </h3>
          <p style={{ fontSize: '14px' }}>
            Os comentários serão implementados na próxima versão.
          </p>
        </div>
      </div>

      <div style={{
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        border: '2px dashed #ddd'
      }}>
        <div style={{ textAlign: 'center', color: '#666' }}>
          <FaPaperclip size={24} style={{ marginBottom: '12px' }} />
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>
            Anexos
          </h3>
          <p style={{ fontSize: '14px' }}>
            O sistema de anexos será implementado na próxima versão.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;