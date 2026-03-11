// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Project, Task, User, Status, Priority } from '../types';
import DataTable, { Column } from './shared/DataTable';
import Card from './shared/Card';
import Button from './shared/Button';
import FormModal from './shared/FormModal';
import { 
  FaFolder, FaTasks, FaUsers, FaCalendarAlt, FaPlus, 
  FaEdit, FaTrash, FaArrowLeft, FaCodeBranch, FaServer, 
  FaTerminal, FaDatabase, FaEye, FaCheck, FaTimes, 
  FaCog, FaExternalLinkAlt, FaInfoCircle 
} from 'react-icons/fa';

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
  onDeleteProject,
}) => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agents, setAgents] = useState<string[]>([]);

  // Handle project selection
  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
    onProjectSelect?.(project);
  };

  // Handle create project
  const handleCreateProject = async () => {
    try {
      setLoading(true);
      const newProject = await onCreateProject?.({
        name: 'Novo Projeto',
        description: 'Description...',
        status: 'active',
        priority: 'medium'
      });
      if (newProject) {
        setSelectedProject(newProject);
        alert('Projeto criado com sucesso!');
      }
    } catch (err) {
      setError('Erro ao criar projeto');
    } finally {
      setLoading(false);
    }
  };

  // Handle update project
  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      if (!selectedProject) {
        throw new Error('Nenhum projeto selecionado para edição');
      }
      
      // Extrair dados do formulário
      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);
      
      const name = formData.get('name') as string;
      const description = formData.get('description') as string;
      const status = formData.get('status') as string;
      const ativo = formData.get('ativo') as string;
      const regras = formData.get('regras') as string;
      const agent = formData.get('agent') as string;
      const frontendPath = formData.get('frontendPath') as string;
      const frontendPort = formData.get('frontendPort') as string;
      const backendPath = formData.get('backendPath') as string;
      const backendPort = formData.get('backendPort') as string;
      const repositoryUrl = formData.get('repositoryUrl') as string;
      const pastaBase = formData.get('pastaBase') as string;
      const frontendBuildCmd = formData.get('frontendBuildCmd') as string;
      const backendBuildCmd = formData.get('backendBuildCmd') as string;
      
      // Validar dados obrigatórios
      if (!name || name.trim() === '') {
        throw new Error('O nome do projeto é obrigatório');
      }
      
      if (!status) {
        throw new Error('O status do projeto é obrigatório');
      }
      
      // Chamar API para atualizar
      const updatedProject = await onUpdateProject?.(selectedProject.id, {
        name: name.trim(),
        description: description?.trim() || '',
        status: status === 'true',
        ativo: ativo === 'true',
        regras: regras?.trim() || '',
        agent: agent?.trim() || null,
        frontendPath: frontendPath?.trim() || '',
        frontendPort: frontendPort ? parseInt(frontendPort) : null,
        backendPath: backendPath?.trim() || '',
        backendPort: backendPort ? parseInt(backendPort) : null,
        repositoryUrl: repositoryUrl?.trim() || '',
        pastaBase: pastaBase?.trim() || '',
        frontendBuildCmd: frontendBuildCmd?.trim() || '',
        backendBuildCmd: backendBuildCmd?.trim() || ''
      });
      
      if (updatedProject) {
        // Atualizar estado local se necessário
        setIsEditModalOpen(false);
        setSelectedProject(null);
        alert('Projeto atualizado com sucesso!');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar projeto');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete project
  const handleDeleteProject = async (id: string) => {
    console.log('🔍 ProjectView.handleDeleteProject - ID recebido:', id);
    console.log('🔍 ProjectView.handleDeleteProject - Projeto selecionado:', selectedProject);
    
    if (!id || id.trim() === '') {
      console.error('❌ ProjectView.handleDeleteProject - ID vazio ou inválido');
      setError('ID do projeto é obrigatório');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 ProjectView.handleDeleteProject - Chamando onDeleteProject...');
      await onDeleteProject?.(id);
      
      console.log('✅ ProjectView.handleDeleteProject - Projeto excluído com sucesso');
      setSelectedProject(null);
      setIsDeleteConfirmOpen(false);
      
      // Usar toast em vez de alert para melhor UX
      if (typeof window !== 'undefined' && (window as any).toast) {
        (window as any).toast.success('Projeto excluído com sucesso!');
      } else {
        alert('Projeto excluído com sucesso!');
      }
      
    } catch (err: any) {
      console.error('❌ ProjectView.handleDeleteProject - Erro:', err);
      
      let errorMessage = 'Erro ao excluir projeto';
      
      if (err.response?.status === 404) {
        errorMessage = 'Projeto não encontrado';
      } else if (err.response?.status === 400) {
        if (err.response?.data?.code === 'PROJECT_HAS_TASKS') {
          errorMessage = 'Não é possível excluir projeto com tarefas ativas. Exclua as tarefas primeiro.';
        } else if (err.response?.data?.message?.includes('Invalid project ID format')) {
          errorMessage = 'ID do projeto inválido';
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      
      // Mostrar erro para o usuário
      if (typeof window !== 'undefined' && (window as any).toast) {
        (window as any).toast.error(errorMessage);
      } else {
        alert(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  // Define columns for DataTable
  const columns: Column[] = [
    {
      key: 'name',
      header: 'Nome',
      align: 'left',
      render: (project) => (
        <div className="font-medium text-gray-800">
          {project.name}
        </div>
      )
    },
    {
      key: 'tasksCount',
      header: 'Tarefas',
      align: 'left',
      render: (project) => (
        <div className="text-blue-600 font-semibold">
          {project.tasksCount}
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      align: 'left',
      render: (project) => (
        <div className={
          `px-2 py-1 rounded-full text-xs font-semibold text-center`
          + ` ${project.status === 'active' ? 'bg-green-100 text-green-800' : ''}`
          + ` ${project.status === 'inactive' ? 'bg-red-100 text-red-800' : ''}`
        }>
          {project.status}
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Ações',
      align: 'right',
      render: (project) => (
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          {/* BOTÃO VER TAREFAS */}
          <Button
            variant="primary"
            size="sm"
            icon={<FaEye size={14} />}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              if (onProjectSelect) {
                onProjectSelect(project);
              }
            }}
            style={{
              backgroundColor: '#3b82f6',
              borderColor: '#3b82f6',
              color: 'white',
              fontWeight: 500,
              padding: '8px 16px',
              borderRadius: '8px',
            }}
          >
            Ver Tarefas
          </Button>
          
          {/* Botão Editar */}
          <Button
            variant="outline"
            size="sm"
            icon={<FaEdit size={14} />}
            onClick={() => {
              setSelectedProject(project);
              setIsEditModalOpen(true);
            }}
          >
            Editar
          </Button>
          
          {/* Botão Excluir */}
          <Button
            variant="danger"
            size="sm"
            icon={<FaTrash size={14} />}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              setSelectedProject(project);
              setIsDeleteConfirmOpen(true);
            }}
          >
            Excluir
          </Button>
        </div>
      )
    }
  ];

  // Render the project view
  return (
    <div className="p-4 bg-white rounded-xl shadow-md">
      <h1 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
        <FaTasks className="text-3xl mr-2" />
        Seus Projetos
      </h1>
      
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {error && (
        <div className="text-red-500 text-center py-2 mb-4">
          {error}
        </div>
      )}
      
      {projects.length > 0 ? (
        <DataTable
          data={projects}
          columns={columns}
          keyExtractor={(project) => project.id}
          onRowClick={undefined}
          hover={false}
          emptyMessage={{
            title: 'Nenhum projeto encontrado',
            description: 'Crie um novo projeto para começar',
            action: {
              label: 'Criar projeto',
              onClick: () => setIsCreateModalOpen(true)
            }
          }}
        />
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-2">
            Você não tem projetos criados
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
            icon={<FaPlus size={14} />}
          >
            Criar Projeto
          </Button>
        </div>
      )}
      
      {/* Create Modal */}
      {isCreateModalOpen && (
        <FormModal
          isOpen={isCreateModalOpen}
          title="Criar Projeto"
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateProject}
        />
      )}
      
      {/* Edit Modal */}
      {isEditModalOpen && selectedProject && (
        <FormModal
          isOpen={isEditModalOpen}
          title="Editar Projeto"
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedProject(null);
          }}
          onSubmit={handleUpdateProject}
          size="lg"
        >
          <div className="space-y-4">
            {/* Nome do Projeto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome do Projeto *
              </label>
              <input
                type="text"
                name="name"
                defaultValue={selectedProject.name || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Digite o nome do projeto"
                required
              />
            </div>

            {/* Descrição */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição
              </label>
              <textarea
                name="description"
                defaultValue={selectedProject.description || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Digite a descrição do projeto"
                rows={3}
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status *
              </label>
              <select
                name="status"
                defaultValue={selectedProject.status ? 'true' : 'false'}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="true">Ativo</option>
                <option value="false">Inativo</option>
              </select>
            </div>

            {/* Ativo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ativo
              </label>
              <select
                name="ativo"
                defaultValue={selectedProject.ativo ? 'true' : 'false'}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="true">Sim</option>
                <option value="false">Não</option>
              </select>
            </div>

            {/* Regras */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Regras
              </label>
              <textarea
                name="regras"
                defaultValue={selectedProject.regras || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Digite as regras do projeto"
                rows={2}
              />
            </div>

            {/* Configurações Avançadas */}
            <div className="border-t pt-4 mt-4">
              <h3 className="text-lg font-medium text-gray-800 mb-3">Configurações Avançadas</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Agente */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Agente Responsável
                  </label>
                  <input
                    type="text"
                    name="agent"
                    defaultValue={selectedProject.agent || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nome do agente responsável"
                  />
                </div>

                {/* Frontend Path */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Caminho do Frontend
                  </label>
                  <input
                    type="text"
                    name="frontendPath"
                    defaultValue={selectedProject.frontendPath || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="/caminho/para/frontend"
                  />
                </div>

                {/* Frontend Port */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Porta do Frontend
                  </label>
                  <input
                    type="number"
                    name="frontendPort"
                    defaultValue={selectedProject.frontendPort || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="3000"
                  />
                </div>

                {/* Backend Path */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Caminho do Backend
                  </label>
                  <input
                    type="text"
                    name="backendPath"
                    defaultValue={selectedProject.backendPath || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="/caminho/para/backend"
                  />
                </div>

                {/* Backend Port */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Porta do Backend
                  </label>
                  <input
                    type="number"
                    name="backendPort"
                    defaultValue={selectedProject.backendPort || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="3001"
                  />
                </div>

                {/* Repository URL */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL do Repositório
                  </label>
                  <input
                    type="text"
                    name="repositoryUrl"
                    defaultValue={selectedProject.repositoryUrl || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://github.com/usuario/repositorio"
                  />
                </div>

                {/* Pasta Base */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pasta Base
                  </label>
                  <input
                    type="text"
                    name="pastaBase"
                    defaultValue={selectedProject.pastaBase || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="/home/usuario/projetos"
                  />
                </div>

                {/* Frontend Build Command */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Comando Build Frontend
                  </label>
                  <input
                    type="text"
                    name="frontendBuildCmd"
                    defaultValue={selectedProject.frontendBuildCmd || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="npm run build"
                  />
                </div>

                {/* Backend Build Command */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Comando Build Backend
                  </label>
                  <input
                    type="text"
                    name="backendBuildCmd"
                    defaultValue={selectedProject.backendBuildCmd || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="npm run build"
                  />
                </div>
              </div>
            </div>
          </div>
        </FormModal>
      )}
      
      {/* Delete Confirmation */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 relative">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Excluir Projeto
            </h2>
            <p className="text-gray-600 mb-6">
              Tem certeza que deseja excluir este projeto?
            </p>
            <div className="flex justify-end space-x-4">
              <Button
                variant="secondary"
                onClick={() => setIsDeleteConfirmOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  if (selectedProject?.id) {
                    console.log('🔍 Modal de confirmação - Excluindo projeto:', selectedProject.id);
                    handleDeleteProject(selectedProject.id);
                  } else {
                    console.error('❌ Modal de confirmação - Nenhum projeto selecionado');
                    setError('Nenhum projeto selecionado para exclusão');
                    setIsDeleteConfirmOpen(false);
                  }
                }}
                disabled={loading}
              >
                {loading ? 'Excluindo...' : 'Excluir'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectView;