// @ts-nocheck
import React, { useState } from 'react';
import { Project, Task, User, Status, Priority } from '../types';
import DataTable, { Column } from './shared/DataTable';
import Card from './shared/Card';
import Button from './shared/Button';
import FormModal from './shared/FormModal';
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
  const initialFormData: Partial<Project> = {
    name: '',
    description: '',
    regras: '',
    status: true,
    ativo: true,
    frontendPath: '',
    pastaBase: '',
    frontendPort: 0,
    backendPath: '',
    backendPort: 0,
    repositoryUrl: '',
    frontendBuildCmd: '',
    backendBuildCmd: '',
  };
  const [formData, setFormData] = useState<Partial<Project>>(initialFormData);
  const [agents, setAgents] = useState<string[]>([]);

  // Carregar agentes
  React.useEffect(() => {
    const loadAgents = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/agents');
        if (response.ok) {
          const data = await response.json();
          // Extrair IDs dos agentes do array de objetos
          const agentIds = data.data ? data.data.map((agent: any) => agent.id) : [];
          setAgents(agentIds);
        }
      } catch (error) {
        console.error('Erro ao carregar agentes:', error);
      }
    };
    loadAgents();
  }, []);

  const handleCreateProject = async () => {
    if (!onCreateProject) return;
    setLoading(true);
    setError(null);
    try {
      await onCreateProject(formData);
      setIsCreateModalOpen(false);
      resetForm();
    } catch (err: any) {
      setError(err.message || 'Erro ao criar projeto');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProject = async () => {
    if (!onUpdateProject || !selectedProject) return;
    setLoading(true);
    setError(null);
    try {
      await onUpdateProject(selectedProject.id, formData);
      setIsEditModalOpen(false);
      resetForm();
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar projeto');
    } finally {
      setLoading(false);
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
    setFormData(initialFormData);
    setSelectedProject(null);
    setError(null);
  };

  const renderFormFields = () => (
    <>
      {error && (
        <div style={{
          padding: '12px 16px',
          backgroundColor: '#fee2e2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          color: '#dc2626',
          marginBottom: '20px',
          fontSize: '14px',
        }}>
          {error}
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: '#333' }}>
            Nome do Projeto *
          </label>
          <input
            type="text"
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              fontSize: '14px',
              transition: 'all 0.2s',
            }}
            required
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: '#333' }}>
            Status
          </label>
          <select
            value={formData.status ? 'true' : 'false'}
            onChange={(e) => setFormData({ ...formData, status: e.target.value === 'true' })}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              fontSize: '14px',
              backgroundColor: '#fff',
            }}
          >
            <option value="true">Ativo</option>
            <option value="false">Inativo</option>
          </select>
        </div>
        <div style={{ gridColumn: 'span 2' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: '#333' }}>
            Descrição
          </label>
          <textarea
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              fontSize: '14px',
              resize: 'vertical',
            }}
          />
        </div>
        <div style={{ gridColumn: 'span 2' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: '#333' }}>
            Regras (opcional)
          </label>
          <textarea
            value={formData.regras || ''}
            onChange={(e) => setFormData({ ...formData, regras: e.target.value })}
            rows={4}
            placeholder="Insira as regras específicas para este projeto..."
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              fontSize: '14px',
              resize: 'vertical',
              fontFamily: 'monospace',
            }}
          />
        </div>
        <div style={{ gridColumn: 'span 2', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #e0e0e0' }}>
          <h4 style={{ marginBottom: '16px', color: '#555', fontSize: '16px' }}>Configurações Avançadas</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: '#333' }}>
                Caminho Frontend
              </label>
              <input
                type="text"
                value={formData.frontendPath || ''}
                onChange={(e) => setFormData({ ...formData, frontendPath: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '14px',
                }}
                placeholder="/caminho/para/frontend"
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: '#333' }}>
                Caminho Backend
              </label>
              <input
                type="text"
                value={formData.backendPath || ''}
                onChange={(e) => setFormData({ ...formData, backendPath: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '14px',
                }}
                placeholder="/caminho/para/backend"
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: '#333' }}>
                Porta Frontend
              </label>
              <input
                type="number"
                value={formData.frontendPort || ''}
                onChange={(e) => setFormData({ ...formData, frontendPort: parseInt(e.target.value) || 0 })}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '14px',
                }}
                placeholder="3000"
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: '#333' }}>
                Porta Backend
              </label>
              <input
                type="number"
                value={formData.backendPort || ''}
                onChange={(e) => setFormData({ ...formData, backendPort: parseInt(e.target.value) || 0 })}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '14px',
                }}
                placeholder="3001"
              />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: '#333' }}>
                URL do Repositório
              </label>
              <input
                type="text"
                value={formData.repositoryUrl || ''}
                onChange={(e) => setFormData({ ...formData, repositoryUrl: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '14px',
                }}
                placeholder="https://github.com/usuario/projeto"
              />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: '#333' }}>
                Pasta Base (pastaBase)
              </label>
              <input
                type="text"
                value={formData.pastaBase || ''}
                onChange={(e) => setFormData({ ...formData, pastaBase: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '14px',
                }}
                placeholder="/caminho/para/pasta-base"
              />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: '#333' }}>
                Agente Padrão
              </label>
              <select
                value={formData.agent || ''}
                onChange={(e) => setFormData({ ...formData, agent: e.target.value || null })}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  backgroundColor: '#fff'
                }}
              >
                <option value="">Selecione um agente...</option>
                {agents.length > 0 ? (
                  agents.map((agentId) => (
                    <option key={agentId} value={agentId}>
                      {agentId}
                    </option>
                  ))
                ) : (
                  <option value="">Carregando agentes...</option>
                )}
              </select>
              <p style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                Agente padrão para tarefas deste projeto
              </p>
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: '#333' }}>
                Comando Build Frontend
              </label>
              <input
                type="text"
                value={formData.frontendBuildCmd || ''}
                onChange={(e) => setFormData({ ...formData, frontendBuildCmd: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '14px',
                }}
                placeholder="npm run build"
              />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: '#333' }}>
                Comando Build Backend
              </label>
              <input
                type="text"
                value={formData.backendBuildCmd || ''}
                onChange={(e) => setFormData({ ...formData, backendBuildCmd: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '14px',
                }}
                placeholder="npm run build"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );

  const columns: Column<Project>[] = [
    {
      key: 'name',
      header: 'Nome',
      render: (project) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            backgroundColor: '#f0f9ff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#2563eb',
          }}>
            <FaFolder size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 600, color: '#333' }}>{project.name}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {project.tasks?.length || 0} tarefas
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'description',
      header: 'Descrição',
      render: (project) => (
        <div style={{ color: '#666', fontSize: '14px' }}>
          {project.description || 'Sem descrição'}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (project) => (
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          padding: '4px 12px',
          borderRadius: '20px',
          backgroundColor: project.status ? '#dcfce7' : '#fee2e2',
          color: project.status ? '#166534' : '#991b1b',
          fontSize: '12px',
          fontWeight: 500,
        }}>
          {project.status ? 'Ativo' : 'Inativo'}
        </div>
      ),
    },
    {
      key: 'agent',
      header: 'Agente',
      render: (project) => (
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          padding: '4px 12px',
          borderRadius: '20px',
          backgroundColor: project.agent ? '#dbeafe' : '#f3f4f6',
          color: project.agent ? '#1e40af' : '#6b7280',
          fontSize: '12px',
          fontWeight: 500,
        }}>
          {project.agent || 'Não definido'}
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Ações',
      align: 'center',
      render: (project) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button
            variant="outline"
            size="sm"
            icon={<FaEdit size={14} />}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedProject(project);
              setFormData({ ...initialFormData, ...project });
              setIsEditModalOpen(true);
            }}
          >
            Editar
          </Button>
          <Button
            variant="danger"
            size="sm"
            icon={<FaTrash size={14} />}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedProject(project);
              setIsDeleteConfirmOpen(true);
            }}
          >
            Excluir
          </Button>
        </div>
      ),
    },
  ];

  if (selectedProject && onProjectSelect) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Button
            variant="ghost"
            icon={<FaArrowLeft size={16} />}
            onClick={() => setSelectedProject(null)}
          >
            Voltar
          </Button>
          <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#333', margin: 0 }}>
            {selectedProject.name}
          </h2>
        </div>
        <Card title="Detalhes do Projeto" padding="lg">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#666', marginBottom: '8px' }}>Descrição</h4>
              <p style={{ color: '#333', lineHeight: 1.6 }}>{selectedProject.description || 'Sem descrição'}</p>
            </div>
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#666', marginBottom: '8px' }}>Regras</h4>
              <pre style={{
                backgroundColor: '#f8f9fa',
                padding: '16px',
                borderRadius: '8px',
                fontSize: '13px',
                color: '#333',
                whiteSpace: 'pre-wrap',
                maxHeight: '200px',
                overflowY: 'auto',
              }}>
                {selectedProject.regras || 'Nenhuma regra definida'}
              </pre>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#333', margin: 0 }}>Projetos</h2>
            <p style={{ fontSize: '14px', color: '#666', margin: '8px 0 0' }}>
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
            onRowClick={(project) => onProjectSelect?.(project)}
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
        {renderFormFields()}
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
        {renderFormFields()}
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
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <p style={{ color: '#666', marginBottom: '24px' }}>
            Todas as tarefas associadas a este projeto serão mantidas, mas o projeto será removido permanentemente.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
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