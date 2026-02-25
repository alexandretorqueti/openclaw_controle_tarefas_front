import React, { useState } from 'react';
import { Project, Task, User, Status, Priority } from '../types';
import TaskCard from './TaskCard';
import { FaFolder, FaTasks, FaUsers, FaCalendarAlt, FaPlus, FaEdit, FaTrash, FaArrowLeft } from 'react-icons/fa';

interface ProjectViewProps {
  projects: Project[];
  tasks: Task[];
  users: User[];
  statuses: Status[];
  priorities: Priority[];
  onTaskSelect: (task: Task) => void;
  onProjectSelect?: (project: Project) => void;
  onCreateProject?: (projectData: Partial<Project>) => Promise<Project>;
  onUpdateProject?: (id: string, projectData: Partial<Project>) => Promise<Project>;
  onDeleteProject?: (id: string) => Promise<void>;
}

const ProjectView: React.FC<ProjectViewProps> = ({
  projects,
  tasks,
  users,
  statuses,
  priorities,
  onTaskSelect,
  onProjectSelect,
  onCreateProject,
  onUpdateProject,
  onDeleteProject
}) => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newProjectData, setNewProjectData] = useState<Partial<Project>>({
    name: '',
    description: '',
    regras: '',
    status: true,
    ativo: true,
    frontendPath: '',
    frontendPort: null,
    backendPath: '',
    backendPort: null,
    repositoryUrl: ''
  });
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editProjectData, setEditProjectData] = useState<Partial<Project>>({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [showCompletedTasks, setShowCompletedTasks] = useState(false);

  const getProjectTasks = (projectId: string) => {
    return tasks.filter(task => task.projectId === projectId);
  };

  const getProjectActiveTasks = (projectId: string) => {
    if (showCompletedTasks) {
      return tasks.filter(task => task.projectId === projectId && task.isCompleted);
    } else {
      return tasks.filter(task => task.projectId === projectId && !task.isCompleted);
    }
  };

  const getProjectStats = (projectId: string) => {
    const projectTasks = getProjectTasks(projectId);
    const totalTasks = projectTasks.length;
    const completedTasks = projectTasks.filter(t => t.isCompleted).length;
    const overdueTasks = projectTasks.filter(t => 
      !t.isCompleted && new Date(t.deadline) < new Date()
    ).length;
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    return { totalTasks, completedTasks, overdueTasks, progress };
  };

  const getProjectOwner = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : 'Desconhecido';
  };

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    if (onProjectSelect) {
      onProjectSelect(project);
    }
  };

  const handleBackToProjects = () => {
    setSelectedProject(null);
  };

  const handleCreateProject = async () => {
    if (!onCreateProject || !newProjectData.name) {
      return;
    }

    // Validação no frontend
    if (newProjectData.description && newProjectData.description.length < 10) {
      setCreateError('A descrição deve ter pelo menos 10 caracteres');
      return;
    }

    setCreateError(null);

    try {
      // Always use a valid UUID for createdById
      // In production, this would come from authentication context
      const currentUserId = 'f23d0cc1-8908-47a9-b615-0393fb77ae92'; // Alexandre Bragato UUID
      
      const projectData = {
        ...newProjectData,
        createdById: currentUserId
      };

      await onCreateProject(projectData);
      
      // Reset form
      setNewProjectData({
        name: '',
        description: '',
        regras: '',
        status: true,
        frontendPath: '',
        frontendPort: null,
        backendPath: '',
        backendPort: null,
        repositoryUrl: ''
      });
      setIsCreatingProject(false);
      setCreateError(null);
    } catch (error: any) {
      console.error('Failed to create project:', error);
      
      // Extrair mensagem de erro da resposta da API
      let errorMessage = 'Falha ao criar projeto';
      if (error.message && error.message.includes('Validation error')) {
        errorMessage = 'Erro de validação: ';
        if (error.message.includes('Description must be at least 10 characters')) {
          errorMessage += 'A descrição deve ter pelo menos 10 caracteres';
        } else if (error.message.includes('Invalid user ID format')) {
          errorMessage += 'ID do usuário inválido';
        } else {
          errorMessage += error.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setCreateError(errorMessage);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!onDeleteProject) return;
    
    if (window.confirm('Tem certeza que deseja excluir este projeto? Todas as tarefas associadas também serão excluídas.')) {
      setIsDeleting(projectId);
      try {
        await onDeleteProject(projectId);
        
        // If we're viewing this project, go back to projects list
        if (selectedProject?.id === projectId) {
          handleBackToProjects();
        }
      } catch (error) {
        console.error('Failed to delete project:', error);
        setIsDeleting(null);
      }
    }
  };

  if (selectedProject) {
    const projectTasks = getProjectActiveTasks(selectedProject.id);
    const stats = getProjectStats(selectedProject.id);

    return (
      <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Cabeçalho do Projeto */}
        <div style={{ marginBottom: '32px' }}>
          <button
            onClick={handleBackToProjects}
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
            Voltar para Projetos
          </button>

          <div style={{
            backgroundColor: '#fff',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            marginBottom: '24px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <FaFolder size={24} color="#4ECDC4" />
                  <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#333' }}>
                    {selectedProject.name}
                  </h1>
                  <span style={{
                    backgroundColor: selectedProject.ativo ? '#06D6A0' : '#FF6B6B',
                    color: '#fff',
                    padding: '4px 12px',
                    borderRadius: '16px',
                    fontSize: '12px',
                    fontWeight: 500
                  }}>
                    {selectedProject.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
                
                <p style={{ fontSize: '16px', color: '#666', marginBottom: '20px', lineHeight: 1.6 }}>
                  {selectedProject.description}
                </p>
                
                {selectedProject.regras && (
                  <div style={{ 
                    backgroundColor: '#f8f9fa', 
                    padding: '16px', 
                    borderRadius: '8px',
                    marginTop: '16px',
                    borderLeft: '4px solid #4ECDC4'
                  }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#333', marginBottom: '8px' }}>
                      📋 Regras do Projeto
                    </h3>
                    <p style={{ fontSize: '14px', color: '#666', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                      {selectedProject.regras}
                    </p>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FaUsers size={16} color="#666" />
                    <span style={{ fontSize: '14px', color: '#333' }}>
                      Criado por: <strong>{getProjectOwner(selectedProject.createdById)}</strong>
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FaCalendarAlt size={16} color="#666" />
                    <span style={{ fontSize: '14px', color: '#333' }}>
                      Criado em: {new Date(selectedProject.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                {onUpdateProject && (
                  <button
                    onClick={() => {
                      setEditingProject(selectedProject);
                      setEditProjectData({});
                      setUpdateError(null);
                    }}
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
                      gap: '8px',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3db8af'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4ECDC4'}
                  >
                    <FaEdit size={14} />
                    Editar Projeto
                  </button>
                )}
                {onDeleteProject && (
                  <button
                    onClick={() => handleDeleteProject(selectedProject.id)}
                    disabled={isDeleting === selectedProject.id}
                    style={{
                      padding: '10px 16px',
                      backgroundColor: isDeleting === selectedProject.id ? '#ccc' : '#FF6B6B',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      cursor: isDeleting === selectedProject.id ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      if (isDeleting !== selectedProject.id) e.currentTarget.style.backgroundColor = '#e55a5a';
                    }}
                    onMouseLeave={(e) => {
                      if (isDeleting !== selectedProject.id) e.currentTarget.style.backgroundColor = '#FF6B6B';
                    }}
                  >
                    <FaTrash size={14} />
                    {isDeleting === selectedProject.id ? 'Excluindo...' : 'Excluir'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Estatísticas do Projeto */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '32px'
          }}>
            <div style={{
              backgroundColor: '#fff',
              padding: '20px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '32px', fontWeight: 700, color: '#333', marginBottom: '8px' }}>
                {stats.totalTasks}
              </div>
              <div style={{ fontSize: '14px', color: '#666', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <FaTasks size={16} />
                Total de Tarefas
              </div>
            </div>

            <div style={{
              backgroundColor: '#fff',
              padding: '20px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '32px', fontWeight: 700, color: '#06D6A0', marginBottom: '8px' }}>
                {stats.completedTasks}
              </div>
              <div style={{ fontSize: '14px', color: '#666', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <FaTasks size={16} />
                Tarefas Concluídas
              </div>
            </div>

            <div style={{
              backgroundColor: '#fff',
              padding: '20px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '32px', fontWeight: 700, color: '#FF6B6B', marginBottom: '8px' }}>
                {stats.overdueTasks}
              </div>
              <div style={{ fontSize: '14px', color: '#666', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <FaTasks size={16} />
                Tarefas Atrasadas
              </div>
            </div>

            <div style={{
              backgroundColor: '#fff',
              padding: '20px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '32px', fontWeight: 700, color: stats.progress >= 70 ? '#06D6A0' : stats.progress >= 30 ? '#FFD166' : '#FF6B6B', marginBottom: '8px' }}>
                {stats.progress}%
              </div>
              <div style={{ fontSize: '14px', color: '#666' }}>
                Progresso do Projeto
              </div>
            </div>
          </div>

          {/* Lista de Tarefas do Projeto */}
          <div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '24px' 
            }}>
              <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#333' }}>
                {showCompletedTasks ? 'Tarefas Completas' : 'Tarefas do Projeto'} ({projectTasks.length})
              </h2>
              
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: '#333' }}>
                  <input
                    type="checkbox"
                    checked={showCompletedTasks}
                    onChange={(e) => setShowCompletedTasks(e.target.checked)}
                    style={{ cursor: 'pointer' }}
                  />
                  Ver tarefas completas
                </label>
                <button
                  onClick={() => setViewMode('grid')}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: viewMode === 'grid' ? '#4ECDC4' : '#f8f9fa',
                    color: viewMode === 'grid' ? '#fff' : '#333',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  Grade
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: viewMode === 'list' ? '#4ECDC4' : '#f8f9fa',
                    color: viewMode === 'list' ? '#fff' : '#333',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  Lista
                </button>
              </div>
            </div>

            {projectTasks.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '48px',
                backgroundColor: '#f8f9fa',
                borderRadius: '12px',
                color: '#666'
              }}>
                <p style={{ fontSize: '16px', marginBottom: '8px' }}>
                  Nenhuma tarefa encontrada neste projeto.
                </p>
                <p style={{ fontSize: '14px', color: '#999' }}>
                  Crie a primeira tarefa para este projeto.
                </p>
              </div>
            ) : (
              <div style={viewMode === 'grid' ? {
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                gap: '16px'
              } : {
                display: 'grid',
                gap: '16px'
              }}>
                {projectTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    users={users}
                    statuses={statuses}
                    priorities={priorities}
                    projects={projects}
                    onTaskClick={onTaskSelect}
                    compact={viewMode === 'grid'}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Visualização de todos os projetos
  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#333', marginBottom: '8px' }}>
          Gestão de Projetos
        </h1>
        <p style={{ fontSize: '16px', color: '#666', marginBottom: '24px' }}>
          Organize suas tarefas por projeto para melhor acompanhamento e produtividade
        </p>
      </div>

      {/* Controles */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '12px'
      }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#333', marginBottom: '8px' }}>
            {projects.length} Projetos
          </h2>
          <p style={{ fontSize: '14px', color: '#666' }}>
            {tasks.length} tarefas distribuídas entre os projetos
          </p>
        </div>

        <button
          onClick={() => setIsCreatingProject(true)}
          style={{
            padding: '12px 24px',
            backgroundColor: '#4ECDC4',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 500,
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3db8af'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4ECDC4'}
        >
          <FaPlus size={16} />
          Novo Projeto
        </button>
      </div>

      {/* Formulário de Novo Projeto */}
      {isCreatingProject && (
        <div style={{
          backgroundColor: '#fff',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          marginBottom: '24px',
          border: '1px solid #e0e0e0'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#333', marginBottom: '16px' }}>
            Criar Novo Projeto
          </h3>
          
          <div style={{ display: 'grid', gap: '16px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#333', marginBottom: '8px' }}>
                Nome do Projeto *
              </label>
              <input
                type="text"
                value={newProjectData.name}
                onChange={(e) => setNewProjectData({ ...newProjectData, name: e.target.value })}
                placeholder="Digite o nome do projeto"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '14px', fontWeight: 500, color: '#333' }}>
                  Descrição
                </label>
                <span style={{ fontSize: '12px', color: newProjectData.description && newProjectData.description.length < 10 ? '#FF6B6B' : '#666' }}>
                  {newProjectData.description?.length || 0}/10 caracteres mínimos
                </span>
              </div>
              <textarea
                value={newProjectData.description}
                onChange={(e) => {
                  setNewProjectData({ ...newProjectData, description: e.target.value });
                  setCreateError(null); // Limpa erro quando o usuário começa a digitar
                }}
                placeholder="Descreva o propósito deste projeto (mínimo 10 caracteres)..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: newProjectData.description && newProjectData.description.length < 10 ? '1px solid #FF6B6B' : '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '14px',
                  resize: 'vertical'
                }}
              />
              {newProjectData.description && newProjectData.description.length < 10 && (
                <div style={{ fontSize: '12px', color: '#FF6B6B', marginTop: '4px' }}>
                  A descrição precisa ter pelo menos 10 caracteres
                </div>
              )}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#333', marginBottom: '8px' }}>
                Regras (opcional)
              </label>
              <textarea
                value={newProjectData.regras || ''}
                onChange={(e) => setNewProjectData({ ...newProjectData, regras: e.target.value })}
                placeholder="Defina as regras específicas deste projeto..."
                rows={4}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '14px',
                  resize: 'vertical'
                }}
              />
              <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                Sem limite de caracteres. Use para definir regras, políticas ou diretrizes do projeto.
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#333', marginBottom: '8px' }}>
                Ativo
              </label>
              <select
                value={newProjectData.ativo ? 'true' : 'false'}
                onChange={(e) => setNewProjectData({ ...newProjectData, ativo: e.target.value === 'true' })}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              >
                <option value="true">Ativo</option>
                <option value="false">Inativo</option>
              </select>
            </div>

            {/* Novos campos para configuração de repositórios (opcional na criação) */}
            <div style={{ borderTop: '1px solid #eee', paddingTop: '20px', marginTop: '10px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#666', marginBottom: '12px' }}>
                Configuração de Repositórios (Opcional)
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#666', marginBottom: '6px' }}>
                    Caminho do Frontend
                  </label>
                  <input
                    type="text"
                    value={newProjectData.frontendPath || ''}
                    onChange={(e) => setNewProjectData({ ...newProjectData, frontendPath: e.target.value })}
                    placeholder="/caminho/frontend"
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '13px'
                    }}
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#666', marginBottom: '6px' }}>
                    Porta do Frontend
                  </label>
                  <input
                    type="number"
                    value={newProjectData.frontendPort || ''}
                    onChange={(e) => setNewProjectData({ ...newProjectData, frontendPort: e.target.value ? parseInt(e.target.value) : null })}
                    placeholder="3000"
                    min="1"
                    max="65535"
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '13px'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#666', marginBottom: '6px' }}>
                    Caminho do Backend
                  </label>
                  <input
                    type="text"
                    value={newProjectData.backendPath || ''}
                    onChange={(e) => setNewProjectData({ ...newProjectData, backendPath: e.target.value })}
                    placeholder="/caminho/backend"
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '13px'
                    }}
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#666', marginBottom: '6px' }}>
                    Porta do Backend
                  </label>
                  <input
                    type="number"
                    value={newProjectData.backendPort || ''}
                    onChange={(e) => setNewProjectData({ ...newProjectData, backendPort: e.target.value ? parseInt(e.target.value) : null })}
                    placeholder="3001"
                    min="1"
                    max="65535"
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '13px'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#666', marginBottom: '6px' }}>
                  URL do Repositório
                </label>
                <input
                  type="url"
                  value={newProjectData.repositoryUrl || ''}
                  onChange={(e) => setNewProjectData({ ...newProjectData, repositoryUrl: e.target.value })}
                  placeholder="https://github.com/usuario/projeto"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '13px'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Mensagem de erro */}
          {createError && (
            <div style={{
              padding: '12px',
              backgroundColor: '#FF6B6B',
              color: '#fff',
              borderRadius: '8px',
              marginBottom: '16px',
              fontSize: '14px'
            }}>
              {createError}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button
              onClick={() => setIsCreatingProject(false)}
              style={{
                padding: '10px 20px',
                backgroundColor: '#f8f9fa',
                color: '#333',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              Cancelar
            </button>
            <button
              onClick={handleCreateProject}
              disabled={!newProjectData.name || (newProjectData.description ? newProjectData.description.length < 10 : false)}
              style={{
                padding: '10px 20px',
                backgroundColor: newProjectData.name && (!newProjectData.description || newProjectData.description.length >= 10) ? '#4ECDC4' : '#ccc',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                cursor: newProjectData.name && (!newProjectData.description || newProjectData.description.length >= 10) ? 'pointer' : 'not-allowed'
              }}
            >
              Criar Projeto
            </button>
          </div>
        </div>
      )}

      {/* Grid de Projetos */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
        gap: '24px'
      }}>
        {projects.map(project => {
          const stats = getProjectStats(project.id);
          const progress = stats.progress;

          return (
            <div
              key={project.id}
              onClick={() => handleProjectClick(project)}
              style={{
                backgroundColor: '#fff',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                border: '1px solid #e0e0e0',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
              }}
            >
              {/* Action buttons */}
              <div style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                display: 'flex',
                gap: '8px',
                zIndex: 10
              }}>
                {onUpdateProject && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingProject(project);
                      setEditProjectData({});
                      setUpdateError(null);
                    }}
                    style={{
                      width: '32px',
                      height: '32px',
                      backgroundColor: '#4ECDC4',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3db8af'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4ECDC4'}
                  >
                    <FaEdit size={14} />
                  </button>
                )}
                {onDeleteProject && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteProject(project.id);
                    }}
                    disabled={isDeleting === project.id}
                    style={{
                      width: '32px',
                      height: '32px',
                      backgroundColor: isDeleting === project.id ? '#ccc' : '#FF6B6B',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: isDeleting === project.id ? 'not-allowed' : 'pointer',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      if (isDeleting !== project.id) e.currentTarget.style.backgroundColor = '#e55a5a';
                    }}
                    onMouseLeave={(e) => {
                      if (isDeleting !== project.id) e.currentTarget.style.backgroundColor = '#FF6B6B';
                    }}
                  >
                    <FaTrash size={14} />
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '16px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: '#e3f2fd',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <FaFolder size={24} color="#1976d2" />
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#333', marginBottom: '8px' }}>
                      {project.name}
                    </h3>
                    <span style={{
                      backgroundColor: project.status ? '#06D6A0' : '#FF6B6B',
                      color: '#fff',
                      padding: '4px 12px',
                      borderRadius: '16px',
                      fontSize: '12px',
                      fontWeight: 500
                    }}>
                      {project.status ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  
                  <p style={{ fontSize: '14px', color: '#666', marginBottom: '16px', lineHeight: 1.5 }}>
                    {project.description.length > 100 
                      ? `${project.description.substring(0, 100)}...` 
                      : project.description}
                  </p>
                </div>
              </div>

              {/* Estatísticas do Projeto */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px',
                marginBottom: '20px'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: '#333' }}>
                    {stats.totalTasks}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Tarefas</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: '#06D6A0' }}>
                    {stats.completedTasks}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Concluídas</div>
                </div>
              </div>

              {/* Barra de Progresso */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  marginBottom: '8px' 
                }}>
                  <span style={{ fontSize: '12px', color: '#666' }}>Progresso</span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#333' }}>
                    {progress}%
                  </span>
                </div>
                <div style={{
                  height: '8px',
                  backgroundColor: '#e0e0e0',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${progress}%`,
                    height: '100%',
                    backgroundColor: progress >= 70 ? '#06D6A0' : progress >= 30 ? '#FFD166' : '#FF6B6B',
                    borderRadius: '4px',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              </div>

              {/* Informações Adicionais */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '16px',
                borderTop: '1px solid #e0e0e0'
              }}>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  Criado por: <strong>{getProjectOwner(project.createdById)}</strong>
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {new Date(project.createdAt).toLocaleDateString('pt-BR')}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Projeto Vazio (Placeholder para novo projeto) */}
      {projects.length === 0 && !isCreatingProject && (
        <div
          onClick={() => setIsCreatingProject(true)}
          style={{
            backgroundColor: '#f8f9fa',
            borderRadius: '12px',
            padding: '48px 24px',
            border: '2px dashed #ddd',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'border-color 0.2s',
            marginTop: '24px'
          }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = '#4ECDC4'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = '#ddd'}
        >
          <div style={{ marginBottom: '16px' }}>
            <FaFolder size={64} color="#999" />
          </div>
          <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#666', marginBottom: '8px' }}>
            Nenhum projeto encontrado
          </h3>
          <p style={{ fontSize: '16px', color: '#999', marginBottom: '24px' }}>
            Crie seu primeiro projeto para começar a organizar suas tarefas
          </p>
          <button
            style={{
              padding: '12px 24px',
              backgroundColor: '#4ECDC4',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              margin: '0 auto'
            }}
          >
            <FaPlus size={16} />
            Criar Primeiro Projeto
          </button>
        </div>
      )}

      {/* Edit Project Modal */}
      {editingProject && onUpdateProject && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '32px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#333' }}>
                Editar Projeto
              </h2>
              <button
                onClick={() => {
                  setEditingProject(null);
                  setEditProjectData({});
                  setUpdateError(null);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  color: '#666',
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '4px',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                ×
              </button>
            </div>

            <div style={{ display: 'grid', gap: '20px', marginBottom: '32px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#333', marginBottom: '8px' }}>
                  Nome do Projeto *
                </label>
                <input
                  type="text"
                  value={editProjectData.name || editingProject.name}
                  onChange={(e) => setEditProjectData({ ...editProjectData, name: e.target.value })}
                  placeholder="Digite o nome do projeto"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '14px', fontWeight: 500, color: '#333' }}>
                    Descrição
                  </label>
                  <span style={{ fontSize: '12px', color: (editProjectData.description || editingProject.description).length < 10 ? '#FF6B6B' : '#666' }}>
                    {(editProjectData.description || editingProject.description).length}/10 caracteres mínimos
                  </span>
                </div>
                <textarea
                  value={editProjectData.description || editingProject.description}
                  onChange={(e) => {
                    setEditProjectData({ ...editProjectData, description: e.target.value });
                    setUpdateError(null);
                  }}
                  placeholder="Descreva o propósito deste projeto (mínimo 10 caracteres)..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: (editProjectData.description || editingProject.description).length < 10 ? '1px solid #FF6B6B' : '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                />
                {(editProjectData.description || editingProject.description).length < 10 && (
                  <div style={{ fontSize: '12px', color: '#FF6B6B', marginTop: '4px' }}>
                    A descrição precisa ter pelo menos 10 caracteres
                  </div>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#333', marginBottom: '8px' }}>
                  Regras (opcional)
                </label>
                <textarea
                  value={editProjectData.regras !== undefined ? editProjectData.regras : (editingProject.regras || '')}
                  onChange={(e) => setEditProjectData({ ...editProjectData, regras: e.target.value })}
                  placeholder="Defina as regras específicas deste projeto..."
                  rows={6}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                />
                <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                  Sem limite de caracteres. Use para definir regras, políticas ou diretrizes do projeto.
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#333', marginBottom: '8px' }}>
                  Ativo
                </label>
                <select
                  value={editProjectData.ativo !== undefined ? editProjectData.ativo.toString() : editingProject.ativo.toString()}
                  onChange={(e) => setEditProjectData({ ...editProjectData, ativo: e.target.value === 'true' })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                >
                  <option value="true">Ativo</option>
                  <option value="false">Inativo</option>
                </select>
              </div>

              {/* Novos campos para configuração de repositórios */}
              <div style={{ borderTop: '1px solid #eee', paddingTop: '20px', marginTop: '10px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#333', marginBottom: '16px' }}>
                  Configuração de Repositórios
                </h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#333', marginBottom: '8px' }}>
                      Caminho do Frontend
                    </label>
                    <input
                      type="text"
                      value={editProjectData.frontendPath !== undefined ? editProjectData.frontendPath : (editingProject.frontendPath || '')}
                      onChange={(e) => setEditProjectData({ ...editProjectData, frontendPath: e.target.value })}
                      placeholder="/caminho/absoluto/frontend"
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#333', marginBottom: '8px' }}>
                      Porta do Frontend
                    </label>
                    <input
                      type="number"
                      value={editProjectData.frontendPort !== undefined ? editProjectData.frontendPort : (editingProject.frontendPort || '')}
                      onChange={(e) => setEditProjectData({ ...editProjectData, frontendPort: e.target.value ? parseInt(e.target.value) : null })}
                      placeholder="3000"
                      min="1"
                      max="65535"
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#333', marginBottom: '8px' }}>
                      Caminho do Backend
                    </label>
                    <input
                      type="text"
                      value={editProjectData.backendPath !== undefined ? editProjectData.backendPath : (editingProject.backendPath || '')}
                      onChange={(e) => setEditProjectData({ ...editProjectData, backendPath: e.target.value })}
                      placeholder="/caminho/absoluto/backend"
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#333', marginBottom: '8px' }}>
                      Porta do Backend
                    </label>
                    <input
                      type="number"
                      value={editProjectData.backendPort !== undefined ? editProjectData.backendPort : (editingProject.backendPort || '')}
                      onChange={(e) => setEditProjectData({ ...editProjectData, backendPort: e.target.value ? parseInt(e.target.value) : null })}
                      placeholder="3001"
                      min="1"
                      max="65535"
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#333', marginBottom: '8px' }}>
                    URL do Repositório
                  </label>
                  <input
                    type="url"
                    value={editProjectData.repositoryUrl !== undefined ? editProjectData.repositoryUrl : (editingProject.repositoryUrl || '')}
                    onChange={(e) => setEditProjectData({ ...editProjectData, repositoryUrl: e.target.value })}
                    placeholder="https://github.com/usuario/projeto"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                    URL do repositório Git (GitHub, GitLab, etc.)
                  </div>
                </div>
              </div>
            </div>

            {/* Update error message */}
            {updateError && (
              <div style={{
                padding: '12px',
                backgroundColor: '#FF6B6B',
                color: '#fff',
                borderRadius: '8px',
                marginBottom: '16px',
                fontSize: '14px'
              }}>
                {updateError}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                onClick={() => {
                  setEditingProject(null);
                  setEditProjectData({});
                  setUpdateError(null);
                }}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#f8f9fa',
                  color: '#333',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e9ecef'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
              >
                Cancelar
              </button>
              <button
                onClick={async () => {
                  if (!onUpdateProject || !editingProject) return;
                  
                  const data = {
                    name: editProjectData.name || editingProject.name,
                    description: editProjectData.description || editingProject.description,
                    regras: editProjectData.regras !== undefined ? editProjectData.regras : editingProject.regras,
                    status: editProjectData.status !== undefined ? editProjectData.status : editingProject.status,
                    // Novos campos
                    frontendPath: editProjectData.frontendPath !== undefined ? editProjectData.frontendPath : editingProject.frontendPath,
                    frontendPort: editProjectData.frontendPort !== undefined ? editProjectData.frontendPort : editingProject.frontendPort,
                    backendPath: editProjectData.backendPath !== undefined ? editProjectData.backendPath : editingProject.backendPath,
                    backendPort: editProjectData.backendPort !== undefined ? editProjectData.backendPort : editingProject.backendPort,
                    repositoryUrl: editProjectData.repositoryUrl !== undefined ? editProjectData.repositoryUrl : editingProject.repositoryUrl
                  };

                  // Validation
                  if (data.description.length < 10) {
                    setUpdateError('A descrição deve ter pelo menos 10 caracteres');
                    return;
                  }

                  setIsUpdating(true);
                  setUpdateError(null);

                  try {
                    await onUpdateProject(editingProject.id, data);
                    
                    // Close modal
                    setEditingProject(null);
                    setEditProjectData({});
                    setUpdateError(null);
                    
                    // If we're viewing this project, refresh the view
                    // Note: In a real app, you would refresh the project data here
                    console.log('Project updated, should refresh view');
                  } catch (error: any) {
                    console.error('Failed to update project:', error);
                    
                    let errorMessage = 'Falha ao atualizar projeto';
                    if (error.message && error.message.includes('Validation error')) {
                      errorMessage = 'Erro de validação: ';
                      if (error.message.includes('Description must be at least 10 characters')) {
                        errorMessage += 'A descrição deve ter pelo menos 10 caracteres';
                      } else {
                        errorMessage += error.message;
                      }
                    } else if (error.message) {
                      errorMessage = error.message;
                    }
                    
                    setUpdateError(errorMessage);
                  } finally {
                    setIsUpdating(false);
                  }
                }}
                disabled={isUpdating || (editProjectData.description || editingProject.description).length < 10}
                style={{
                  padding: '12px 24px',
                  backgroundColor: isUpdating || (editProjectData.description || editingProject.description).length < 10 ? '#ccc' : '#4ECDC4',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  cursor: isUpdating || (editProjectData.description || editingProject.description).length < 10 ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (!isUpdating && (editProjectData.description || editingProject.description).length >= 10) {
                    e.currentTarget.style.backgroundColor = '#3db8af';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isUpdating && (editProjectData.description || editingProject.description).length >= 10) {
                    e.currentTarget.style.backgroundColor = '#4ECDC4';
                  }
                }}
              >
                {isUpdating ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectView;