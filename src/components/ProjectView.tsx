// @ts-nocheck
import React, { useState, useRef } from 'react';
import { Project, Task, User, Status, Priority, Agent } from '../types';
import DataTable, { Column } from './shared/DataTable';
import Card from './shared/Card';
import Button from './shared/Button';
import FormModal from './shared/FormModal';
import ProjectForm from './shared/ProjectForm';
import './ProjectView.css';
import { FaFolder, FaTasks, FaUsers, FaCalendarAlt, FaPlus, FaEdit, FaTrash, FaArrowLeft, FaCodeBranch, FaServer, FaTerminal, FaDatabase } from 'react-icons/fa';

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

const ProjectViewNew: React.FC<ProjectViewProps> = ({
  projects,
  tasks,
  users,
  statuses,
  priorities,
  onTaskSelect,
  onProjectSelect,
  onCreateProject,
  onUpdateProject,
  onDeleteProject,
}) => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [disableRowClick, setDisableRowClick] = useState(false);
  const [agents, setAgents] = useState<Agent[]>([]);
  const projectFormRef = useRef<any>(null);

  // Carregar agentes
  React.useEffect(() => {
    const loadAgents = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/agents');
        if (response.ok) {
          const data = await response.json();
          // Armazenar objetos completos dos agentes para acessar informações do modelo
          const agentsList = data.data ? data.data : [];
          setAgents(agentsList);
        }
      } catch (error) {
        console.error('Erro ao carregar agentes:', error);
      }
    };
    loadAgents();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('DEBUG: handleCreateProject called');
    if (!onCreateProject) return;
    
    // Usar o ref do ProjectForm para obter os dados
    if (projectFormRef.current) {
      setLoading(true);
      setError(null);
      try {
        await projectFormRef.current.submitForm();
      } catch (err: any) {
        console.error('DEBUG: Error from ProjectForm submit in create', err);
        setError(err.message || 'Erro ao criar projeto');
      } finally {
        setLoading(false);
      }
    } else {
      console.error('DEBUG: projectFormRef.current is null in handleCreateProject');
      setError('Erro interno: formulário não disponível');
    }
  };

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('DEBUG: handleUpdateProject called (FormModal)', { selectedProject });
    if (!onUpdateProject || !selectedProject) {
      console.error('DEBUG: Missing onUpdateProject or selectedProject', { onUpdateProject, selectedProject });
      return;
    }
    if (!selectedProject.id) {
      console.error('DEBUG: selectedProject.id is undefined', selectedProject);
      setError('ID do projeto não encontrado');
      return;
    }
    
    // Usar o ref do ProjectForm para obter os dados
    if (projectFormRef.current) {
      try {
        await projectFormRef.current.submitForm();
      } catch (err: any) {
        console.error('DEBUG: Error from ProjectForm submit', err);
        setError(err.message || 'Erro ao atualizar projeto');
      }
    } else {
      console.error('DEBUG: projectFormRef.current is null');
      setError('Erro interno: formulário não disponível');
    }
  };

  const handleDeleteProject = async () => {
    if (!onDeleteProject || !selectedProject) return;
    setLoading(true);
    setError(null);
    try {
      await onDeleteProject(selectedProject.id);
      setIsDeleteConfirmOpen(false);
      setSelectedProject(null);
    } catch (err: any) {
      setError(err.message || 'Erro ao excluir projeto');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedProject(null);
    setError(null);
  };



  const columns: Column<Project>[] = [
    {
      key: 'name',
      header: 'Nome',
      render: (project) => (
        <div className="project-view-row">
          <div className="project-view-icon-container">
            <FaFolder size={20} />
          </div>
          <div>
            <div className="project-view-name">{project.name}</div>
            <div className="project-view-task-count">
              {project.tasks?.length || 0} tarefas
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'description',
      header: 'Descrição',
      render: (project) => {
        const description = project.description;
        const displayText = !description || description.trim() === '' ? 'Sem descrição' : description;
        return (
          <div className="project-view-description">
            {displayText}
          </div>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (project) => (
        <div className={`project-view-status-badge project-view-status-${project.status ? 'active' : 'inactive'}`}>
          {project.status ? 'Ativo' : 'Inativo'}
        </div>
      ),
    },
    {
      key: 'agent',
      header: 'Arquiteto contratado',
      render: (project) => (
        <div className={`project-view-agent-badge project-view-agent-${project.agent ? 'assigned' : 'unassigned'}`}>
          {project.agent || 'Não definido'}
        </div>
      ),
    },
    {
      key: 'programadorContratado',
      header: 'Programador Contratado',
      render: (project) => {
        // Encontrar o agente pelo ID para mostrar o nome
        const programador = agents.find(a => a.id === project.programadorContratado);
        const displayName = programador ? 
          `${programador.identity?.name || programador.id}${programador.identity?.model ? ` (${programador.identity.model})` : ''}` : 
          (project.programadorContratado || 'Não definido');
        
        return (
          <div className={`project-view-agent-badge project-view-agent-${project.programadorContratado ? 'assigned' : 'unassigned'}`}>
            {displayName}
          </div>
        );
      },
    },
    {
      key: 'actions',
      header: 'Ações',
      align: 'center',
      render: (project) => (
        <div className="project-view-actions">
          <Button
            className="prevent-row-click"
            variant="outline"
            size="sm"
            icon={<FaEdit size={14} />}
            data-prevent-row-click="true"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              setSelectedProject(project);
              
              // Extrair apenas os campos do projeto, não a resposta completa da API
              const projectFields = {
                name: project.name || '',
                description: project.description || '',
                regras: project.regras || '',
                status: project.status !== undefined ? project.status : true,
                ativo: project.ativo !== undefined ? project.ativo : true,
                frontendPath: project.frontendPath || '',
                frontendPort: project.frontendPort || 0,
                backendPath: project.backendPath || '',
                backendPort: project.backendPort || 0,
                repositoryUrl: project.repositoryUrl || '',
                pastaBase: project.pastaBase || '',
                agent: project.agent || '',
                frontendBuildCmd: project.frontendBuildCmd || '',
                backendBuildCmd: project.backendBuildCmd || '',
              };
              
              setIsEditModalOpen(true);
              
              // Desabilitar clique na linha temporariamente
              setDisableRowClick(true);
              setTimeout(() => setDisableRowClick(false), 100);
            }}
          >
            Editar
          </Button>
          <Button
            className="prevent-row-click"
            variant="danger"
            size="sm"
            icon={<FaTrash size={14} />}
            data-prevent-row-click="true"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              setSelectedProject(project);
              setIsDeleteConfirmOpen(true);
              
              // Desabilitar clique na linha temporariamente
              setDisableRowClick(true);
              setTimeout(() => setDisableRowClick(false), 100);
            }}
          >
            Excluir
          </Button>
        </div>
      ),
    },
  ];

  // Removido redirecionamento automático - agora só ocorre no clique da linha da tabela
  // if (selectedProject && onProjectSelect) {
  //   onProjectSelect(selectedProject);
  //   return null;
  // }

  return (
    <>
      <div className="project-view-title-section">
        <div className="project-view-header-row">
          <div>
            <h2 className="project-view-main-title">Projetos</h2>
            <p className="project-view-subtitle">
              Gerencie seus projetos e visualize as tarefas associadas
            </p>
          </div>
          <Button
            variant="primary"
            icon={<FaPlus size={16} />}
            onClick={() => setIsCreateModalOpen(true)}
          >
            Novo Projeto
          </Button>
        </div>

        <Card padding="none">
          <DataTable
            data={projects}
            columns={columns}
            keyExtractor={(project) => project.id}
            onRowClick={disableRowClick ? undefined : ((project) => onProjectSelect?.(project))}
            hover
            bordered={false}
            emptyMessage="Nenhum projeto encontrado. Clique em 'Novo Projeto' para criar um."
          />
        </Card>
      </div>

      {/* Create Project Modal */}
      <FormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Criar Novo Projeto"
        subtitle="Preencha os detalhes do projeto"
        onSubmit={handleCreateProject}
        submitLabel="Criar Projeto"
        cancelLabel="Cancelar"
        size="lg"
        loading={loading}
      >
        <ProjectForm
          ref={projectFormRef}
          project={null}
          onSubmit={async (data) => {
            console.log('DEBUG: ProjectForm onSubmit (criação) chamado com dados:', data);
            if (!onCreateProject) return;
            setLoading(true);
            setError(null);
            try {
              await onCreateProject(data);
              setIsCreateModalOpen(false);
              resetForm();
            } catch (err: any) {
              console.error('DEBUG: Error in ProjectForm onSubmit (criação)', err);
              setError(err.message || 'Erro ao criar projeto');
              throw err;
            } finally {
              setLoading(false);
            }
          }}
          loading={loading}
          error={error}
          agents={agents}
        />
      </FormModal>

      {/* Edit Project Modal */}
      <FormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Editar Projeto"
        subtitle={`Editando: ${selectedProject?.name}`}
        onSubmit={handleUpdateProject}
        submitLabel="Atualizar"
        cancelLabel="Cancelar"
        size="lg"
        loading={loading}
      >
        <ProjectForm
          ref={projectFormRef}
          project={selectedProject}
          onSubmit={async (data) => {
            console.log('DEBUG: ProjectForm onSubmit chamado com dados:', data);
            if (!onUpdateProject || !selectedProject) return;
            setLoading(true);
            setError(null);
            try {
              await onUpdateProject(selectedProject.id, data);
              setIsEditModalOpen(false);
              resetForm();
            } catch (err: any) {
              console.error('DEBUG: Error in ProjectForm onSubmit', err);
              setError(err.message || 'Erro ao atualizar projeto');
              throw err; // Re-throw para o ProjectForm saber que falhou
            } finally {
              setLoading(false);
            }
          }}
          loading={loading}
          error={error}
          agents={agents}
        />
      </FormModal>

      {/* Delete Confirmation Modal */}
      <FormModal
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        title="Confirmar Exclusão"
        subtitle={`Tem certeza que deseja excluir o projeto "${selectedProject?.name}"? Esta ação não pode ser desfeita.`}
        hideFooter
        size="sm"
      >
        <div className="project-view-empty">
          <p className="project-view-empty-text">
            Todas as tarefas associadas a este projeto serão mantidas, mas o projeto será removido permanentemente.
          </p>
          <div className="project-view-actions">
            <Button
              variant="ghost"
              onClick={() => setIsDeleteConfirmOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteProject}
              loading={loading}
            >
              Excluir Projeto
            </Button>
          </div>
        </div>
      </FormModal>
    </>
  );
};

export default ProjectViewNew;