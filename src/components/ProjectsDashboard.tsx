import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaFolder, FaPlus, FaEdit, FaTrash, FaEye, FaSync, FaTimes, 
  FaCheck, FaExclamationTriangle, FaSpinner, FaSearch, 
  FaFilter, FaSort, FaSortUp, FaSortDown 
} from 'react-icons/fa';
import api from '../services/api';
import { getBackendBaseUrl } from '../config/api';
import './ProjectsDashboard.css';
import EditProjectModal from './EditProjectModal';
import { set } from 'date-fns';

// Interfaces
interface Project {
  id: string;
  name: string;
  description: string;
  status: boolean;
  ativo: boolean;
  projectTypeId: string | null;
  createdAt: string;
  updatedAt: string;
  regras?: string;
  frontendPath?: string;
  frontendPort?: number;
  backendPath?: string;
  backendPort?: number;
  repositoryUrl?: string | null;
  pastaBase?: string;
  agent?: string;
  programadorContratado?: string;
  programadorFront?: string;
  programadorBack?: string;
  frontendBuildCmd?: string;
  backendBuildCmd?: string;
  modeloAuxiliar?: string;
  createdBy?: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string;
  };
  tasks?: Array<{
    id: string;
    isCompleted: boolean;
    deadline: string;
  }>;
}

interface ProjectType {
  id: string;
  name: string;
  description: string;
}

// Componente Principal Simplificado
interface ProjectsDashboardProps {
  // Prop removida - não usamos mais
}

const ProjectsDashboard: React.FC<ProjectsDashboardProps> = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [projectTypes, setProjectTypes] = useState<ProjectType[]>([]);
  const [loadingProjectTypes, setLoadingProjectTypes] = useState(true);
  
  // Função para visualizar tarefas de um projeto
  const handleViewProjectTasks = (project: Project) => {
    // SEMPRE navegar para a página de tarefas do projeto
    // Ignorar onProjectSelect mesmo se for fornecido
    console.log('🔍 Navegando para:', `/projects/${project.id}/tasks`);
    navigate(`/projects/${project.id}/tasks`);
  };
  
  // Filtros
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [projectTypeFilter, setProjectTypeFilter] = useState('');

  // Estados para modais
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  // Estados para formulários
  // Nota: createForm removido - agora usamos EditProjectModal para criação

  // Carregar dados
  useEffect(() => {
    console.log('🚀 ProjectsDashboard montado, carregando dados...');
    
    // Teste direto da API
    const testAPI = async () => {
      try {
        console.log('🔍 TESTE: Chamando API diretamente com fetch...');
        // Use centralized configuration
        const backendUrl = getBackendBaseUrl();
        const response = await fetch(`${backendUrl}/api/projects`);
        const data = await response.json();
        console.log('🔍 TESTE: Resposta direta:', data);
        console.log('🔍 TESTE: data.projects:', data.projects);
        console.log('🔍 TESTE: Quantidade:', data.projects?.length);
      } catch (err) {
        console.error('🔍 TESTE: Erro no fetch direto:', err);
      }
    };
    
    testAPI();
    loadProjects();
    loadProjectTypes();
  }, []);

  

  const loadProjects = async () => {
    console.log('=== INÍCIO loadProjects ===');
    setLoading(true);
    setError(null);
    
    try {
      console.log('1. Chamando api.getProjects()...');
      const response = await api.getProjects();
      console.log('2. Resposta recebida:', response);
      
      if (!response) {
        console.error('3. Resposta é undefined ou null');
        throw new Error('Resposta da API é undefined');
      }
      
      console.log('4. response.data:', response);
      console.log('5. response.data?.projects:', response.projects);
      
      // A API retorna { count: X, projects: [...] }
      const projectsData = response.projects || [];
      console.log(`6. ${projectsData.length} projetos extraídos`);
      
      setProjects(projectsData);
      console.log('7. setProjects chamado');
      
    } catch (err: any) {
      console.error('❌ Erro em loadProjects:', err);
      setError(`Erro: ${err.message}`);
    } finally {
      console.log('8. Finalizando, setLoading(false)');
      setLoading(false);
      console.log('=== FIM loadProjects ===');
    }
  };

  const loadProjectTypes = async () => {
    try {
      console.log('📡 Carregando tipos de projeto da API...');
      setLoadingProjectTypes(true);
      const response = await api.getProjectTypes();
      console.log('✅ Resposta completa da API:', response);
      console.log('✅ response:', response);
      console.log('✅ response.projectTypes:', response?.projectTypes);
      
      if (response && response.projectTypes) {
        console.log('✅ Definindo projectTypes:', response.projectTypes);
        setProjectTypes(response.projectTypes);
      } else {
        console.log('⚠️ Nenhum tipo de projeto encontrado, definindo array vazio');
        setProjectTypes([]);
      }
    } catch (err) {
      console.error('❌ Erro ao carregar tipos de projeto:', err);
      setProjectTypes([]);
    } finally {
      setLoadingProjectTypes(false);
    }
  };

  // Handlers para ações de Projeto
  const handleEditProject = (project: Project) => {
    console.log('📝 Abrindo modal de edição para projeto:', project.name);
    console.log('📝 projectTypes disponíveis:', projectTypes.length);
    console.log('📝 loadingProjectTypes:', loadingProjectTypes);
    console.log('📝 projectTypes:', projectTypes);
    
    if (loadingProjectTypes) {
      console.log('⚠️ Tipos de projeto ainda carregando, aguarde...');
      // Poderia mostrar um toast ou mensagem aqui
    }
    
    setSelectedProject(project);
    setEditModalOpen(true);
  };

  const confirmDelete = (project: Project) => {
    setSelectedProject(project);
    setDeleteConfirmOpen(true);
  };

  const handleInativeProject = async (projectId: string, projectData: any) => {
    try {
      await api.updateProject(projectId, projectData);
      handleUpdateProject(projectId, projectData);
    }
    catch (err: any) {
      console.error(`Erro ao inativar projeto: ${err.message}`);
      throw err;
    }
  }

  // Funções de API para Modais
  const handleUpdateProject = async (projectId: string, projectData: any) => {
    try {
      if (!projectData.ativo) {
        setProjects(
          prev => prev.filter(project => project.id !== projectId)
        )
      } else {
        setProjects(
          prev => prev.map(
            (project) => 
            {
              return project.id === projectId ? { ...project, ...projectData } : project
            }
          )
        );
      }
    } catch (err: any) {
      console.error(`Erro ao atualizar projeto: ${err.message}`);
      throw err;
    }
  };

  const handleCreateProjectSubmit = async (projectData: any) => {
    try {
      setProjects(prev => [...prev, projectData]);
    } catch (err: any) {
      console.error(`Erro ao criar projeto: ${err.message}`);
      throw err;
    }
  };

  const handleDeleteProject = async () => {
    if (!selectedProject) return;

    try {
      await api.deleteProject(selectedProject.id);
      setDeleteConfirmOpen(false);
      setProjects(prev => prev.filter(project => project.id !== selectedProject.id));
    } catch (err: any) {
      console.error(`Erro ao excluir projeto: ${err.message}`);
    }
  };

  // Filtrar projetos
  const filteredProjects = projects.filter(project => {
    if (search && !project.name.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    
    if (statusFilter === 'active' && !project.status) return false;
    if (statusFilter === 'inactive' && project.status) return false;
    
    if (projectTypeFilter && project.projectTypeId !== projectTypeFilter) return false;
    
    return true;
  });

  // DEBUG: Log do estado atual
  console.log('🎯 [RENDER DEBUG] Estado atual:');
  console.log('🎯 [RENDER DEBUG] projects:', projects);
  console.log('🎯 [RENDER DEBUG] projects.length:', projects.length);
  console.log('🎯 [RENDER DEBUG] filteredProjects:', filteredProjects);
  console.log('🎯 [RENDER DEBUG] filteredProjects.length:', filteredProjects.length);
  console.log('🎯 [RENDER DEBUG] loading:', loading);
  console.log('🎯 [RENDER DEBUG] error:', error);

  // Calcular estatísticas
  const stats = {
    total: projects.length,
    active: projects.filter(p => p.status).length,
    inactive: projects.filter(p => !p.status).length
  };

  if (loading) {
    return (
      <div className="loading-container">
        <FaSpinner className="loading-spinner" size={24} />
        <p>Carregando projetos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <FaExclamationTriangle size={32} />
        <h3>Erro ao carregar projetos</h3>
        <p>{error}</p>
        <button onClick={loadProjects} className="btn btn-primary">
          <FaSync size={14} style={{ display: 'block', color: 'currentColor' }} />
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="projects-dashboard" style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '32px',
        paddingBottom: '20px',
        borderBottom: '1px solid var(--border-color)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ 
            width: '56px', 
            height: '56px', 
            backgroundColor: 'var(--accent-color)', 
            borderRadius: '12px', 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <FaFolder size={28} color="white" />
          </div>
          <div>
            <h1 style={{ margin: '0 0 4px 0', fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)' }}>
              Gerenciar Projetos
            </h1>
            <p style={{ margin: '0', fontSize: '16px', color: 'var(--text-secondary)' }}>
              Crie, edite e gerencie seus projetos
            </p>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            style={{
              padding: '10px 16px',
              backgroundColor: 'var(--bg-input)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-input)'}
            onClick={loadProjects}
            disabled={loading}
          >
            <FaSync size={14} className={loading ? 'loading-spinner' : ''} style={{ display: 'block', color: 'currentColor' }} />
            {loading ? 'Atualizando...' : 'Atualizar'}
          </button>
          <button
            style={{
              padding: '10px 20px',
              backgroundColor: 'var(--primary-color)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--primary-dark)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--primary-color)'}
            onClick={() => {
              setSelectedProject(null);
              setEditModalOpen(true);
            }}
          >
            <FaPlus size={14} />
            Novo Projeto
          </button>
        </div>
      </div>

      {/* Estatísticas */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '16px',
        marginBottom: '32px'
      }}>
        <div style={{ 
          backgroundColor: 'var(--bg-card)', 
          padding: '20px', 
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{ 
            width: '48px', 
            height: '48px', 
            backgroundColor: 'rgba(59, 130, 246, 0.1)', 
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <FaFolder size={24} color="#3b82f6" />
          </div>
          <div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)' }}>
              {stats.total}
            </div>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              Total de Projetos
            </div>
          </div>
        </div>
        
        <div style={{ 
          backgroundColor: 'var(--bg-card)', 
          padding: '20px', 
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{ 
            width: '48px', 
            height: '48px', 
            backgroundColor: 'rgba(16, 185, 129, 0.1)', 
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <FaCheck size={24} color="#10b981" />
          </div>
          <div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)' }}>
              {stats.active}
            </div>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              Projetos Ativos
            </div>
          </div>
        </div>
        
        <div style={{ 
          backgroundColor: 'var(--bg-card)', 
          padding: '20px', 
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{ 
            width: '48px', 
            height: '48px', 
            backgroundColor: 'rgba(245, 158, 11, 0.1)', 
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <FaExclamationTriangle size={24} color="#f59e0b" />
          </div>
          <div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)' }}>
              {stats.inactive}
            </div>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              Projetos Inativos
            </div>
          </div>
        </div>
      </div>

      {/* Filtros - Layout em linha melhorado */}
      <div className="filters-container" style={{ 
        backgroundColor: 'var(--bg-card)', 
        padding: '20px', 
        borderRadius: '8px',
        marginBottom: '24px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '16px',
          alignItems: 'end'
        }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: 'var(--text-primary)' }}>
              <FaSearch size={14} style={{ marginRight: '8px' }} />
              Buscar projetos
            </label>
            <input
              type="text"
              placeholder="Digite para buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '10px 12px',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                fontSize: '14px',
                backgroundColor: 'var(--bg-input)',
                color: 'var(--text-primary)'
              }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: 'var(--text-primary)' }}>
              <FaFilter size={14} style={{ marginRight: '8px' }} />
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '10px 12px',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                fontSize: '14px',
                backgroundColor: 'var(--bg-input)',
                color: 'var(--text-primary)',
                cursor: 'pointer'
              }}
            >
              <option value="">Todos os status</option>
              <option value="active">Ativos</option>
              <option value="inactive">Inativos</option>
            </select>
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: 'var(--text-primary)' }}>
              <FaFilter size={14} style={{ marginRight: '8px' }} />
              Tipo de Projeto
            </label>
            <select
              value={projectTypeFilter}
              onChange={(e) => setProjectTypeFilter(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '10px 12px',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                fontSize: '14px',
                backgroundColor: 'var(--bg-input)',
                color: 'var(--text-primary)',
                cursor: 'pointer'
              }}
            >
              <option value="">Todos os tipos</option>
              {projectTypes.map(type => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Projetos */}
      {filteredProjects.length === 0 ? (
        <div className="empty-state">
          <FaFolder size={48} />
          <h3>Nenhum projeto encontrado</h3>
          <p>{projects.length === 0 ? 'Crie seu primeiro projeto para começar' : 'Tente ajustar os filtros de busca'}</p>
        </div>
      ) : (
        <div className="projects-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '20px',
          marginTop: '24px'
        }}>
          {filteredProjects.map(project => (
            <div key={project.id} style={{
              backgroundColor: 'var(--bg-card)',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              border: '1px solid var(--border-color)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              display: 'flex',
              flexDirection: 'column',
              height: '100%'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '16px',
                borderBottom: '1px solid var(--border-color)',
                paddingBottom: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    backgroundColor: project.status ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <FaFolder size={18} color={project.status ? '#10b981' : '#ef4444'} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ 
                      margin: '0 0 4px 0', 
                      fontSize: '18px', 
                      fontWeight: '600',
                      color: 'var(--text-primary)'
                    }}>
                      {project.name}
                    </h3>
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 8px',
                      backgroundColor: project.status ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                      color: project.status ? 'var(--status-active)' : 'var(--status-cancelled)',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: '600',
                      textTransform: 'uppercase'
                    }}>
                      {project.status ? 'Ativo para IA' : 'Pausado para IA'}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    type="button"
                    style={{
                      padding: '8px',
                      borderRadius: '6px',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'transparent',
                      color: 'var(--text-secondary, #b0b0b0)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s',
                      minWidth: '32px',
                      minHeight: '32px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                      e.currentTarget.style.color = 'var(--text-primary, #ffffff)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'var(--text-secondary, #b0b0b0)';
                    }}
                    onClick={(e) => {
                      console.log('🔍 Botão Visualizar clicado! Evento:', e.type);
                      console.log('🔍 Projeto alvo:', project.name);
                      handleViewProjectTasks(project);
                    }}
                    title="Visualizar"
                  >
                    <FaEye size={14} style={{ display: 'block', color: 'currentColor' }} />
                  </button>
                  <button 
                    style={{
                      padding: '8px',
                      borderRadius: '6px',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'transparent',
                      color: 'var(--text-secondary, #b0b0b0)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s',
                      minWidth: '32px',
                      minHeight: '32px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                      e.currentTarget.style.color = 'var(--text-primary, #ffffff)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'var(--text-secondary, #b0b0b0)';
                    }}
                    onClick={() => handleEditProject(project)}
                    title="Editar"
                  >
                    <FaEdit size={14} style={{ display: 'block', color: 'currentColor' }} />
                  </button>
                  <button 
                    style={{
                      padding: '8px',
                      borderRadius: '6px',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      backgroundColor: 'rgba(239, 68, 68, 0.1)',
                      color: 'var(--status-cancelled)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s',
                      minWidth: '32px',
                      minHeight: '32px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
                      e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.5)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                      e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
                    }}
                    onClick={() => {
                      if (window.confirm(`Tem certeza que deseja desativar o projeto "${project.name}"? Ele não aparecerá mais no dashboard.`)) {
                        handleInativeProject(project.id, { ativo: false });
                      }
                    }}
                    title="Desativar Projeto"
                  >
                    <FaTrash size={14} style={{ display: 'block', color: 'currentColor' }} />
                  </button>
                </div>
              </div>
              
              <div className="project-card-body">
                <p className="project-description" style={{ marginBottom: '12px' }}>
                  {project.description || 'Sem descrição'}
                </p>
                
                {project.tasks && project.tasks.length > 0 && (
                  <div style={{ 
                    display: 'flex', 
                    gap: '12px', 
                    fontSize: '12px',
                    color: 'var(--text-secondary)',
                    marginTop: '8px'
                  }}>
                    <span>Tarefas: {project.tasks.length}</span>
                    <span>Concluídas: {project.tasks.filter(t => t.isCompleted).length}</span>
                  </div>
                )}
                
                {project.agent && (
                  <div style={{ 
                    marginTop: '8px',
                    fontSize: '12px',
                    color: 'var(--text-secondary)'
                  }}>
                    <strong>Agente:</strong> {project.agent}
                  </div>
                )}
              </div>
              
              <div className="project-card-footer">
                <div className="project-meta" style={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  gap: '4px',
                  fontSize: '11px',
                  color: 'var(--text-tertiary)'
                }}>
                  <span>Criado em: {new Date(project.createdAt).toLocaleDateString('pt-BR')}</span>
                  <span>Atualizado em: {new Date(project.updatedAt).toLocaleDateString('pt-BR')}</span>
                  {project.createdBy && (
                    <span>Criado por: {project.createdBy.name}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Edição - Novo Componente */}
      <EditProjectModal
        isOpen={editModalOpen}
        project={selectedProject}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedProject(null);
        }}
        onUpdate={handleUpdateProject}
        onCreate={handleCreateProjectSubmit}
        projectTypes={projectTypes}
        loadingProjectTypes={loadingProjectTypes}
        currentUser={null} // Poderia passar o usuário atual se necessário
      />



      {/* Modal de Confirmação de Exclusão */}
      {deleteConfirmOpen && selectedProject && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '30px',
            width: '90%',
            maxWidth: '400px'
          }}>
            <h2 style={{ marginTop: 0, color: 'var(--danger-color)' }}>Confirmar Exclusão</h2>
            
            <p style={{ marginBottom: '20px' }}>
              Tem certeza que deseja excluir o projeto <strong>{selectedProject.name}</strong>?
              Esta ação não pode ser desfeita.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setDeleteConfirmOpen(false)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteProject}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Excluir Projeto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsDashboard;