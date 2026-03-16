import React, { useState, useEffect } from 'react';
import { 
  FaFolder, FaPlus, FaEdit, FaTrash, FaEye, FaSync, FaTimes, 
  FaCheck, FaExclamationTriangle, FaSpinner, FaSearch, 
  FaFilter, FaSort, FaSortUp, FaSortDown 
} from 'react-icons/fa';
import api from '../services/api';
import './ProjectsDashboard.css';

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
const ProjectsDashboard: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [projectTypes, setProjectTypes] = useState<ProjectType[]>([]);
  
  // Filtros
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [projectTypeFilter, setProjectTypeFilter] = useState('');

  // Carregar dados
  useEffect(() => {
    console.log('🚀 ProjectsDashboard montado, carregando dados...');
    loadProjects();
    loadProjectTypes();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('📡 [DEBUG 1] Iniciando carregamento de projetos...');
      const response = await api.getProjects();
      console.log('✅ [DEBUG 2] Resposta da API recebida');
      console.log('📊 [DEBUG 3] response:', response);
      console.log('📊 [DEBUG 4] response.data:', response?.data);
      
      // DEBUG: Testar a API diretamente
      console.log('🔍 [DEBUG 5] Testando API diretamente via fetch...');
      try {
        const testResponse = await fetch('http://localhost:3001/api/projects');
        const testData = await testResponse.json();
        console.log('🔍 [DEBUG 6] Teste direto da API:', testData);
        console.log('🔍 [DEBUG 7] testData.projects:', testData.projects);
        console.log('🔍 [DEBUG 8] testData.projects é array?', Array.isArray(testData.projects));
        console.log('🔍 [DEBUG 9] Quantidade de projetos:', testData.projects?.length);
      } catch (fetchErr) {
        console.error('❌ [DEBUG] Erro no teste direto da API:', fetchErr);
      }
      
      if (response && response.data) {
        console.log('📊 [DEBUG 10] response.data.projects:', response.data.projects);
        console.log('📊 [DEBUG 11] response.data.projects é array?', Array.isArray(response.data.projects));
        
        // A API retorna { count: X, projects: [...] }
        const projectsData = response.data.projects || [];
        console.log(`✅ [DEBUG 12] ${projectsData.length} projetos extraídos`);
        
        if (projectsData.length > 0) {
          console.log('📊 [DEBUG 13] Primeiro projeto:', projectsData[0]);
          console.log('📊 [DEBUG 14] Nome do primeiro projeto:', projectsData[0]?.name);
          setProjects(projectsData);
          console.log(`✅ [DEBUG 15] setProjects chamado com ${projectsData.length} projetos`);
        } else {
          console.warn('⚠️ [DEBUG] Nenhum projeto encontrado na resposta');
          setProjects([]);
        }
      } else {
        console.warn('⚠️ [DEBUG] Resposta da API vazia ou sem dados');
        setProjects([]);
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Erro desconhecido';
      console.error('❌ [DEBUG] Erro ao carregar projetos:', err);
      setError(`Erro ao carregar projetos: ${errorMsg}. Verifique se o servidor está rodando.`);
    } finally {
      console.log('🏁 [DEBUG] loadProjects finalizado, setLoading(false)');
      setLoading(false);
    }
  };

  const loadProjectTypes = async () => {
    try {
      console.log('📡 Carregando tipos de projeto da API...');
      const response = await api.getProjectTypes();
      console.log('✅ Tipos de projeto:', response.data);
      
      if (response && response.data) {
        setProjectTypes(response.data);
      } else {
        setProjectTypes([]);
      }
    } catch (err) {
      console.error('❌ Erro ao carregar tipos de projeto:', err);
      setProjectTypes([]);
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
          <FaSync size={14} />
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
            <FaSync size={14} className={loading ? 'loading-spinner' : ''} />
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
            onClick={() => alert('Funcionalidade de criação de projeto em desenvolvimento')}
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
                      color: project.status ? '#10b981' : '#ef4444',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: '600',
                      textTransform: 'uppercase'
                    }}>
                      {project.status ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '6px',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'transparent',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                      e.currentTarget.style.color = 'var(--text-primary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'var(--text-secondary)';
                    }}
                    onClick={() => alert(`Visualizando: ${project.name}`)}
                    title="Visualizar"
                  >
                    <FaEye size={14} />
                  </button>
                  <button 
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '6px',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'transparent',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                      e.currentTarget.style.color = 'var(--text-primary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'var(--text-secondary)';
                    }}
                    onClick={() => alert(`Editando: ${project.name}`)}
                    title="Editar"
                  >
                    <FaEdit size={14} />
                  </button>
                  <button 
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '6px',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      backgroundColor: 'rgba(239, 68, 68, 0.1)',
                      color: '#ef4444',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s'
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
                      if (window.confirm(`Tem certeza que deseja excluir o projeto "${project.name}"?`)) {
                        setProjects(prev => prev.filter(p => p.id !== project.id));
                      }
                    }}
                    title="Excluir"
                  >
                    <FaTrash size={14} />
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
    </div>
  );
};

export default ProjectsDashboard;