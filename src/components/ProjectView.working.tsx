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
  // State declarations (fixed duplicate declarations removed)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newProjectData, setNewProjectData] = useState<Partial<Project>>({});
  const [creationError, setCreationError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editProjectData, setEditProjectData] = useState<Partial<Project>>({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [showCompletedTasks, setShowCompletedTasks] = useState(false);
  const [projectStats, setProjectStats] = useState<Record<string, { totalTasks: number; completedTasks: number; overdueTasks: number; progress: number }>>({});
  const [selectedProjectStats, setSelectedProjectStats] = useState<{ totalTasks: number; completedTasks: number; overdueTasks: number; progress: number } | null>(null);
  const [loadingStats, setLoadingStats] = useState<Record<string, boolean>>({});
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Handler functions
  const handleBackToProjects = () => {
    setSelectedProject(null);
    setSelectedProjectStats(null);
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

  // Early return when a project is selected
  if (selectedProject) {
    return (
      <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
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
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <FaFolder size={24} color="#4ECDC4" />
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#333', margin: 0 }}>
                  {selectedProject.name}
                </h2>
                <p style={{ fontSize: '14px', color: '#666', margin: '4px 0 0 0' }}>
                  {selectedProject.description}
                </p>
              </div>
            </div>
            
            <div style={{ marginLeft: 'auto', display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setEditingProject(selectedProject)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#6c757d',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <FaEdit size={12} />
                Editar
              </button>
              
              <button
                onClick={() => handleDeleteProject(selectedProject.id)}
                disabled={isDeleting === selectedProject.id}
                style={{
                  padding: '8px 16px',
                  backgroundColor: isDeleting === selectedProject.id ? '#ccc' : '#dc3545',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '13px',
                  cursor: isDeleting === selectedProject.id ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <FaTrash size={12} />
                {isDeleting === selectedProject.id ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
        
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#333', marginBottom: '20px' }}>
            Tarefas do Projeto
          </h3>
          
          <div style={{ display: 'grid', gap: '16px' }}>
            {tasks
              .filter(task => task.projectId === selectedProject.id)
              .map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  users={users}
                  statuses={statuses}
                  priorities={priorities}
                  projects={projects}
                  onTaskClick={onTaskSelect}
                  compact={false}
                />
              ))}
          </div>
        </div>
      </div>
    );
  }

  // Main return - all projects view
  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#333', marginBottom: '8px' }}>
          Gestão de Projetos
        </h1>
        <p style={{ fontSize: '15px', color: '#666' }}>
          Gerencie todos os seus projetos e visualize as tarefas associadas
        </p>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => setViewMode('grid')}
            style={{
              padding: '8px 16px',
              backgroundColor: viewMode === 'grid' ? '#4ECDC4' : '#f8f9fa',
              color: viewMode === 'grid' ? '#fff' : '#333',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '13px',
              cursor: 'pointer'
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
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            Lista
          </button>
        </div>
        
        <button
          onClick={() => setIsCreatingProject(true)}
          style={{
            padding: '10px 20px',
            backgroundColor: '#4ECDC4',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <FaPlus size={14} />
          Novo Projeto
        </button>
      </div>
      
      {projects.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#f8f9fa', borderRadius: '12px' }}>
          <FaFolder size={48} color="#ccc" style={{ marginBottom: '16px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#666', marginBottom: '8px' }}>
            Nenhum projeto encontrado
          </h3>
          <p style={{ fontSize: '14px', color: '#999' }}>
            Crie seu primeiro projeto para começar a gerenciar tarefas
          </p>
        </div>
      ) : (
        <div style={{ display: viewMode === 'grid' ? 'grid' : 'block', gap: '24px', gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(300px, 1fr))' : '1fr' }}>
          {projects.map(project => (
            <div
              key={project.id}
              onClick={() => {
                setSelectedProject(project);
                if (onProjectSelect) onProjectSelect(project);
              }}
              style={{
                backgroundColor: '#fff',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                border: '1px solid #eee',
                display: viewMode === 'list' ? 'flex' : 'block',
                alignItems: viewMode === 'list' ? 'center' : 'flex-start',
                gap: viewMode === 'list' ? '20px' : '0'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: viewMode === 'grid' ? '16px' : '0' }}>
                <FaFolder size={20} color="#4ECDC4" />
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#333', margin: 0 }}>
                    {project.name}
                  </h3>
                  <p style={{ fontSize: '13px', color: '#666', margin: '4px 0 0 0', lineHeight: '1.4' }}>
                    {project.description}
                  </p>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '12px', marginTop: viewMode === 'grid' ? '16px' : '0', marginLeft: viewMode === 'list' ? 'auto' : '0' }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingProject(project);
                  }}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#6c757d',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <FaEdit size={10} />
                  Editar
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteProject(project.id);
                  }}
                  disabled={isDeleting === project.id}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: isDeleting === project.id ? '#ccc' : '#dc3545',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '12px',
                    cursor: isDeleting === project.id ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <FaTrash size={10} />
                  {isDeleting === project.id ? '...' : 'Excluir'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectView;