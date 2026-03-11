import React, { useState, useEffect } from 'react';
import { Project } from '../types';
import { FaFolder, FaCodeBranch, FaTerminal } from 'react-icons/fa';
import './FormStyles.css';

interface ProjectFormProps {
  project?: Project | null;
  onSubmit: (data: Partial<Project>) => Promise<void>;
  loading?: boolean;
  error?: string | null;
  agents?: string[];
}

const ProjectForm: React.FC<ProjectFormProps> = ({
  project,
  onSubmit,
  loading = false,
  error = null,
  agents = [],
}) => {
  const [formData, setFormData] = useState<Partial<Project>>({
    name: '',
    description: '',
    regras: '',
    status: true,
    ativo: true,
    frontendPath: '',
    frontendPort: undefined,
    backendPath: '',
    backendPort: undefined,
    repositoryUrl: '',
    pastaBase: '',
    agent: '',
    frontendBuildCmd: '',
    backendBuildCmd: '',
  });

  const [localAgents, setLocalAgents] = useState<string[]>(agents);

  // Carregar agentes se não fornecidos
  useEffect(() => {
    if (agents.length === 0) {
      const loadAgents = async () => {
        try {
          const response = await fetch('http://localhost:3001/api/agents');
          if (response.ok) {
            const data = await response.json();
            const agentIds = data.data ? data.data.map((agent: any) => agent.id) : [];
            setLocalAgents(agentIds);
          }
        } catch (error) {
          console.error('Erro ao carregar agentes:', error);
        }
      };
      loadAgents();
    }
  }, [agents]);

  // Preencher formulário se projeto fornecido
  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || '',
        description: project.description || '',
        regras: project.regras || '',
        status: project.status !== undefined ? project.status : true,
        ativo: project.ativo !== undefined ? project.ativo : true,
        frontendPath: project.frontendPath || '',
        frontendPort: project.frontendPort || undefined,
        backendPath: project.backendPath || '',
        backendPort: project.backendPort || undefined,
        repositoryUrl: project.repositoryUrl || '',
        pastaBase: project.pastaBase || '',
        agent: project.agent || '',
        frontendBuildCmd: project.frontendBuildCmd || '',
        backendBuildCmd: project.backendBuildCmd || '',
      });
    }
  }, [project]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Converter campos vazios para null/undefined conforme esperado pelo backend
    const submitData: Partial<Project> = {
      ...formData,
      description: formData.description || '',
      regras: formData.regras || null,
      frontendPath: formData.frontendPath || null,
      frontendPort: formData.frontendPort || null,
      backendPath: formData.backendPath || null,
      backendPort: formData.backendPort || null,
      repositoryUrl: formData.repositoryUrl || null,
      pastaBase: formData.pastaBase || null,
      agent: formData.agent || null,
      frontendBuildCmd: formData.frontendBuildCmd || null,
      backendBuildCmd: formData.backendBuildCmd || null,
    };

    await onSubmit(submitData);
  };

  const handleChange = (field: keyof Project, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="form-container">
      {error && (
        <div className="form-message form-message-error">
          {error}
        </div>
      )}

      {/* Seção: Informações Básicas */}
      <div className="form-section">
        <div className="form-section-header">
          <div className="form-section-icon">
            <FaFolder size={20} />
          </div>
          <div>
            <h3 className="form-section-title">Informações Básicas</h3>
            <p className="form-section-subtitle">
              Dados principais do projeto
            </p>
          </div>
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label className="form-label form-label-required">
              Nome do Projeto
            </label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => handleChange('name', e.target.value)}
              className="form-input"
              required
              minLength={3}
              maxLength={100}
              placeholder="Ex: Sistema de Gestão de Tarefas"
            />
            <p className="form-help">
              Mínimo 3 caracteres, máximo 100
            </p>
          </div>

          <div className="form-group">
            <label className="form-label">
              Status
            </label>
            <select
              value={formData.status ? 'true' : 'false'}
              onChange={(e) => handleChange('status', e.target.value === 'true')}
              className="form-select"
            >
              <option value="true">Ativo</option>
              <option value="false">Inativo</option>
            </select>
          </div>

          <div className="form-group form-grid-full">
            <label className="form-label">
              Descrição
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
              className="form-textarea"
              placeholder="Descreva o propósito e objetivos do projeto"
              maxLength={500}
            />
            <p className="form-help">
              Máximo 500 caracteres
            </p>
          </div>

          <div className="form-group form-grid-full">
            <label className="form-label">
              Regras (opcional)
            </label>
            <textarea
              value={formData.regras || ''}
              onChange={(e) => handleChange('regras', e.target.value)}
              rows={4}
              className="form-textarea form-textarea-monospace"
              placeholder="Insira as regras específicas para este projeto..."
            />
            <p className="form-help">
              Regras de negócio, restrições ou diretrizes especiais
            </p>
          </div>
        </div>
      </div>

      {/* Seção: Configurações de Repositório */}
      <div className="form-section">
        <div className="form-section-header">
          <div className="form-section-icon">
            <FaCodeBranch size={20} />
          </div>
          <div>
            <h3 className="form-section-title">Configurações de Repositório</h3>
            <p className="form-section-subtitle">
              Caminhos e URLs dos repositórios
            </p>
          </div>
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">
              Caminho Frontend
            </label>
            <input
              type="text"
              value={formData.frontendPath || ''}
              onChange={(e) => handleChange('frontendPath', e.target.value)}
              className="form-input"
              placeholder="/caminho/para/frontend"
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Caminho Backend
            </label>
            <input
              type="text"
              value={formData.backendPath || ''}
              onChange={(e) => handleChange('backendPath', e.target.value)}
              className="form-input"
              placeholder="/caminho/para/backend"
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Porta Frontend
            </label>
            <input
              type="number"
              value={formData.frontendPort || ''}
              onChange={(e) => handleChange('frontendPort', e.target.value ? parseInt(e.target.value) : null)}
              className="form-input"
              placeholder="3000"
              min="1"
              max="65535"
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Porta Backend
            </label>
            <input
              type="number"
              value={formData.backendPort || ''}
              onChange={(e) => handleChange('backendPort', e.target.value ? parseInt(e.target.value) : null)}
              className="form-input"
              placeholder="3001"
              min="1"
              max="65535"
            />
          </div>

          <div className="form-group form-grid-full">
            <label className="form-label">
              URL do Repositório
            </label>
            <input
              type="text"
              value={formData.repositoryUrl || ''}
              onChange={(e) => handleChange('repositoryUrl', e.target.value)}
              className="form-input"
              placeholder="https://github.com/usuario/projeto"
            />
          </div>

          <div className="form-group form-grid-full">
            <label className="form-label">
              Pasta Base
            </label>
            <input
              type="text"
              value={formData.pastaBase || ''}
              onChange={(e) => handleChange('pastaBase', e.target.value)}
              className="form-input"
              placeholder="/caminho/para/pasta-base"
            />
          </div>
        </div>
      </div>

      {/* Seção: Configurações Avançadas */}
      <div className="form-section">
        <div className="form-section-header">
          <div className="form-section-icon">
            <FaTerminal size={20} />
          </div>
          <div>
            <h3 className="form-section-title">Configurações Avançadas</h3>
            <p className="form-section-subtitle">
              Agente e comandos de build
            </p>
          </div>
        </div>

        <div className="form-grid">
          <div className="form-group form-grid-full">
            <label className="form-label">
              Agente Padrão
            </label>
            <select
              value={formData.agent || ''}
              onChange={(e) => handleChange('agent', e.target.value || null)}
              className="form-select"
            >
              <option value="">Selecione um agente...</option>
              {localAgents.length > 0 ? (
                localAgents.map((agentId) => (
                  <option key={agentId} value={agentId}>
                    {agentId}
                  </option>
                ))
              ) : (
                <option value="">Carregando agentes...</option>
              )}
            </select>
            <p className="form-help">
              Agente padrão para tarefas deste projeto
            </p>
          </div>

          <div className="form-group form-grid-full">
            <label className="form-label">
              Comando Build Frontend
            </label>
            <input
              type="text"
              value={formData.frontendBuildCmd || ''}
              onChange={(e) => handleChange('frontendBuildCmd', e.target.value)}
              className="form-input"
              placeholder="npm run build"
            />
          </div>

          <div className="form-group form-grid-full">
            <label className="form-label">
              Comando Build Backend
            </label>
            <input
              type="text"
              value={formData.backendBuildCmd || ''}
              onChange={(e) => handleChange('backendBuildCmd', e.target.value)}
              className="form-input"
              placeholder="npm run build"
            />
          </div>
        </div>
      </div>

      {/* Botões de Ação */}
      <div className="form-actions">
        <button
          type="submit"
          disabled={loading}
          className="form-button form-button-primary"
        >
          {loading ? 'Salvando...' : (project ? 'Atualizar Projeto' : 'Criar Projeto')}
        </button>
      </div>
    </form>
  );
};

export default ProjectForm;