import React, { useState, useEffect } from 'react';
import { Project, Task, User, Status, Priority } from '../types';
import TaskCard from './TaskCard';
import apiService from '../services/api';
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
  const [projectStats, setProjectStats] = useState<Record<string, { totalTasks: number; completedTasks: number; overdueTasks: number; progress: number }>>({});
  const [selectedProjectStats, setSelectedProjectStats] = useState<{ totalTasks: number; completedTasks: number; overdueTasks: number; progress: number } | null>(null);

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

  const getProjectOwner = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : 'Desconhecido';
  };

  // Carrega estatísticas quando um projeto é selecionado
  useEffect(() => {
    if (selectedProject) {
      const loadStats = async () => {
        try {
          const stats = await apiService.getProjectStatistics(selectedProject.id);
          setSelectedProjectStats({
            totalTasks: stats.totalTasks || 0,
            completedTasks: stats.completedTasks || 0,
            overdueTasks: stats.overdueTasks || 0,
            progress: stats.progress || 0
          });
        } catch (error) {
          console.error('Failed to load project statistics:', error);
          // Fallback: calcular localmente
          const projectTasks = getProjectTasks(selectedProject.id);
          const totalTasks = projectTasks.length;
          const completedTasks = projectTasks.filter(t => t.isCompleted).length;
          const overdueTasks = projectTasks.filter(t => 
            !t.isCompleted && new Date(t.deadline) < new Date()
          ).length;
          const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
          setSelectedProjectStats({ totalTasks, completedTasks, overdueTasks, progress });
        }
      };
      loadStats();
    } else {
      setSelectedProjectStats(null);
    }
  }, [selectedProject]);

  // Pré-carrega estatísticas para todos os projetos na lista
  useEffect(() => {
    const loadAllProjectsStats = async () => {
      for (const project of projects) {
        if (!projectStats[project.id]) {
          try {
            const stats = await apiService.getProjectStatistics(project.id);
            setProjectStats(prev => ({
              ...prev,
              [project.id]: {
                totalTasks: stats.totalTasks || 0,
                completedTasks: stats.completedTasks || 0,
                overdueTasks: stats.overdueTasks || 0,
                progress: stats.progress || 0
              }
            }));
          } catch (error) {
            console.error(`Failed to load statistics for project ${project.id}:`, error);
            // Fallback: calcular localmente
            const projectTasks = getProjectTasks(project.id);
            const totalTasks = projectTasks.length;
            const completedTasks = projectTasks.filter(t => t.isCompleted).length;
            const overdueTasks = projectTasks.filter(t => 
              !t.isCompleted && new Date(t.deadline) < new Date()
            ).length;
            const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
            setProjectStats(prev => ({
              ...prev,
              [project.id]: { totalTasks, completedTasks, overdueTasks, progress }
            }));
          }
        }
      }
    };

    if (projects.length > 0) {
      loadAllProjectsStats();
    }
  }, [projects]);

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
    // Usa as estatísticas carregadas da API ou fallback
    const stats = selectedProjectStats || { totalTasks: 0, completedTasks: 0, overdueTasks: 0, progress: 0 };

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
              textAlign: 'center