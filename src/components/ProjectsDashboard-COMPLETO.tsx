import React, { useState, useEffect } from 'react';
import { 
  FaFolder, FaPlus, FaEdit, FaTrash, FaEye, FaSync, FaTimes, 
  FaCheck, FaExclamationTriangle, FaSpinner, FaSearch, 
  FaFilter, FaSort, FaSortUp, FaSortDown, FaInfoCircle,
  FaCalendar, FaUser, FaCode, FaDatabase, FaServer, FaGlobe
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

interface FilterState {
  search: string;
  status: string;
  projectTypeId: string;
  sortBy: 'name' | 'createdAt' | 'updatedAt';
  sortOrder: 'asc' | 'desc';
}

// Componente Principal
const ProjectsDashboard: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [projectTypes, setProjectTypes] = useState<ProjectType[]>([]);
  
  // Filtros
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [projectTypeFilter, setProjectTypeFilter] = useState('');

  // Estados para modais
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  // Estados para formulários
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    status: true
  });

  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    status: true,
    projectTypeId: ''
  });

  // Carregar dados
  useEffect(() => {
    loadProjects();
    loadProjectTypes();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.getProjects();
      
      if (response?.data?.projects) {
        setProjects(response.data.projects);
      } else {
        setProjects([]);
      }
    } catch (err: any) {
      setError(`Erro ao carregar projetos: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const loadProjectTypes = async () => {
    try {
      const response = await api.getProjectTypes();
      if (response?.data?.projectTypes) {
        setProjectTypes(response.data.projectTypes);
      }
    } catch (err) {
      console.error('Erro ao carregar tipos de projeto:', err);
    }
  };

  // Handlers para ações
  const handleViewProject = (project: Project) => {
    setSelectedProject(project);
    setViewModalOpen(true);
  };

  const handleEditProject = (project: Project) => {
    setSelectedProject(project);
    setEditForm({
      name: project.name,
      description: project.description || '',
      status: project.status
    });
    setEditModalOpen(true);
  };

  const handleUpdateProject = async () => {
    if (!selectedProject) return;
    
    try {
      await api.updateProject(selectedProject.id, editForm);
      await loadProjects();
      setEditModalOpen(false);
      alert('Projeto atualizado com sucesso!');
    } catch (err: any) {
      alert(`Erro ao atualizar projeto: ${err.message}`);
    }
  };

  const handleCreateProject = async () => {
    try {
      await api.createProject(createForm);
      await loadProjects();
      setCreateModalOpen(false);
      setCreateForm({ name: '', description: '', status: true, projectTypeId: '' });
      alert('Projeto criado com sucesso!');
    } catch (err: any) {
      alert(`Erro ao criar projeto: ${err.message}`);
    }
  };

  const handleDeleteProject = async () => {
    if (!selectedProject) return;
    
    try {
      await api.deleteProject(selectedProject.id);
      await loadProjects();
      setDeleteConfirmOpen(false);
      alert('Projeto excluído com sucesso!');
    } catch (err: any) {
      alert(`Erro ao excluir projeto: ${err.message}`);
    }
  };

  const confirmDelete = (project: Project) => {
    setSelectedProject(project);
    setDeleteConfirmOpen(true);
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

  // Calcular estatísticas
  const stats = {
    total: projects.length,
    active: projects.filter(p => p.status).length,
    inactive: projects.filter(p => !p.status).length
  };

  // Modal de Visualização
  const ViewModal = () => {
    if (!selectedProject || !viewModalOpen) return null;

    return (
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
          maxWidth: '800px',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ margin: 0, fontSize: '24px' }}>{selectedProject.name}</h2>
            <button 
              onClick={() => setViewModalOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer',
                color: '#666'
              }}
            >
              <FaTimes />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <h3 style={{ marginTop: 0, color: '#555' }}>Informações Básicas</h3>
              <p><strong>Descrição:</strong> {selectedProject.description || 'Não informada'}</p>
              <p><strong>Status:</strong> 
                <span style={{ 
                  color: selectedProject.status ? 'green' : 'red',
                  marginLeft: '8px'
                }}>
                  {selectedProject.status ? 'Ativo' : 'Inativo'}
                </span>
              </p>
              <p><strong>Criado em:</strong> {new Date(selectedProject.createdAt).toLocaleDateString('pt-BR')}</p>
              <p><strong>Atualizado em:</strong> {new Date(selectedProject.updatedAt).toLocaleDateString('pt-BR')}</p>
            </div>

            <div>
              <h3 style={{ marginTop: 0, color: '#555' }}>Configurações Técnicas</h3>
              {selectedProject.agent && <p><strong>Agente:</strong> {selectedProject.agent}</p>}
              {selectedProject.programadorContratado && <p><strong>Programador:</strong> {selectedProject.programadorContratado}</p>}
              {selectedProject.frontendPath && <p><strong>Frontend Path:</strong> {selectedProject.frontendPath}</p>}
              {selectedProject.backendPath && <p><strong>Backend Path:</strong> {selectedProject.backendPath}</p>}
              {selectedProject.pastaBase && <p><strong>Pasta Base:</strong> {selectedProject.pastaBase}</p>}
            </div>
          </div>

          {selectedProject.tasks && selectedProject.tasks.length > 0 && (
            <div style={{ marginTop: '20px' }}>
              <h3 style={{ color: '#555' }}>Tarefas ({selectedProject.tasks.length})</h3>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
                gap: '10px',
                marginTop: '10px'
              }}>
                {selectedProject.tasks.map(task => (
                  <div key={task.id} style={{
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    backgroundColor: task.isCompleted ? '#f0fff0' : '#fff0f0'
                  }}>
                    <div style={{ fontSize: '12px', color: '#666' }}>ID: {task.id.substring(0, 8)}...</div>
                    <div style={{ 
                      color: task.isCompleted ? 'green' : 'red',
                      fontWeight: 'bold',
                      marginTop: '5px'
                    }}>
                      {task.isCompleted ? 'Concluída' : 'Pendente'}
                    </div>
                    <div style={{ fontSize: '12px', marginTop: '5px' }}>
                      Prazo: {new Date(task.deadline).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              onClick={() => {
                setViewModalOpen(false);
                handleEditProject(selectedProject);
              }}
              style={{
                padding: '10px 20px',
                backgroundColor: '#4f46e5',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              <FaEdit style={{ marginRight: '8px' }} />
              Editar Projeto
            </button>
            <button
              onClick={() => setViewModalOpen(false)}
              style={{
                padding: '10px 20px',
                backgroundColor: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Modal de Edição
  const EditModal = () => {
    if (!selectedProject || !editModalOpen) return null;

    return (
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
          maxWidth: '500px'
        }}>
          <h2 style={{ marginTop: 0 }}>Editar Projeto</h2>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Nome do Projeto
            </label>
            <input
              type="text"
              value={editForm.name}
              onChange={(e) => setEditForm({...editForm, name: e.target.value})}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '16px'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Descrição
            </label>
            <textarea
              value={editForm.description}
              onChange={(e) => setEditForm({...editForm, description: e.target.value})}
              rows={4}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '16px',
                resize: 'vertical'
              }}
            />
          </div>

          <div style={{ marginBottom: '30px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Status
            </label>
            <div style={{ display: 'flex', gap: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="radio"
                  checked={editForm.status}
                  onChange={() => setEditForm({...editForm, status: true})}
                />
                Ativo
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="radio"
                  checked={!editForm.status}
                  onChange={() => setEditForm({...editForm, status: false})}
                />
                Inativo
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              onClick={() => setEditModalOpen(false)}
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
              onClick={handleUpdateProject}
              style={{
                padding: '10px 20px',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Salvar Alterações
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Modal de Criação
  const CreateModal = () => {
    if (!createModalOpen) return null;

    return (
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
          maxWidth: '500px'
        }}>
          <h2 style={{ marginTop: 0 }}>Criar Novo Projeto</h2>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Nome do Projeto *
            </label>
            <input
              type="text"
              value={createForm.name}
              onChange={(e) => setCreateForm({...createForm, name: e.target.value})}
              placeholder="Digite o nome do projeto"
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '16px'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Descrição
            </label>
            <textarea
              value={createForm.description}
              onChange={(e) => setCreateForm({...createForm, description: e.target.value})}
              placeholder="Descreva o projeto"
              rows={4}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '16px',
                resize: 'vertical'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Tipo de Projeto
            </label>
            <select
              value={createForm.projectType