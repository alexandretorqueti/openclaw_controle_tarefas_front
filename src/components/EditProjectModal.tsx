import React, { useState, useEffect } from 'react';
import { Project, ProjectType, User } from '../types/index';
import api from '../services/api';
import './EditProjectModal.css';
import {
  FaTimes,
  FaSpinner,
  FaCheck,
  FaExclamationTriangle,
  FaFolder,
  FaCode,
  FaServer,
  FaDatabase,
  FaRocket,
  FaHammer,
  FaPlay,
  FaVial,
  FaCalendar,
  FaUser,
  FaInfoCircle,
  FaEdit,
  FaTag
} from 'react-icons/fa';

interface EditProjectModalProps {
  isOpen: boolean;
  project: Project | null;
  onClose: () => void;
  onUpdate: (projectId: string, projectData: any) => Promise<void>;
  projectTypes: ProjectType[];
  currentUser: User | null;
}

const EditProjectModal: React.FC<EditProjectModalProps> = ({
  isOpen,
  project,
  onClose,
  onUpdate,
  projectTypes,
  currentUser
}) => {
  // Estados do formulário
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [regras, setRegras] = useState('');
  const [projectTypeId, setProjectTypeId] = useState('');
  const [status, setStatus] = useState(true);
  const [ativo, setAtivo] = useState(true);
  
  // Configurações técnicas
  const [frontendPath, setFrontendPath] = useState('');
  const [frontendPort, setFrontendPort] = useState<number | undefined>(undefined);
  const [backendPath, setBackendPath] = useState('');
  const [backendPort, setBackendPort] = useState<number | undefined>(undefined);
  const [repositoryUrl, setRepositoryUrl] = useState('');
  const [pastaBase, setPastaBase] = useState('');
  
  // Agentes e modelos
  const [agent, setAgent] = useState('');
  const [programadorFront, setProgramadorFront] = useState('');
  const [programadorBack, setProgramadorBack] = useState('');
  const [modeloAuxiliar, setModeloAuxiliar] = useState('');
  
  // Comandos de build
  const [frontendBuildCmd, setFrontendBuildCmd] = useState('');
  const [backendBuildCmd, setBackendBuildCmd] = useState('');
  
  // Estados da UI
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [agents, setAgents] = useState<any[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(false);
  const [models, setModels] = useState<string[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);
  
  // Inicializar formulário com dados do projeto
  useEffect(() => {
    if (project) {
      setName(project.name || '');
      setDescription(project.description || '');
      setRegras(project.regras || '');
      setProjectTypeId(project.projectTypeId || '');
      setStatus(project.status || true);
      setAtivo(project.ativo || true);
      
      // Configurações técnicas
      setFrontendPath(project.frontendPath || '');
      setFrontendPort(project.frontendPort || undefined);
      setBackendPath(project.backendPath || '');
      setBackendPort(project.backendPort || undefined);
      setRepositoryUrl(project.repositoryUrl || '');
      setPastaBase(project.pastaBase || '');
      
      // Agentes e modelos
      setAgent(project.agent || '');
      setProgramadorFront(project.programadorFront || '');
      setProgramadorBack(project.programadorBack || '');
      setModeloAuxiliar(project.modeloAuxiliar || '');
      
      // Comandos de build
      setFrontendBuildCmd(project.frontendBuildCmd || '');
      setBackendBuildCmd(project.backendBuildCmd || '');
    }
  }, [project]);

  // Carregar lista de agentes e modelos quando o modal abrir
  useEffect(() => {
    const loadAgents = async () => {
      setLoadingAgents(true);
      try {
        const response = await api.getAgents();
        setAgents(response.data || []);
      } catch (error) {
        console.error('Erro ao carregar agentes:', error);
        setAgents([]);
      } finally {
        setLoadingAgents(false);
      }
    };

    const loadModels = async () => {
      setLoadingModels(true);
      try {
        const response = await api.request('/models');
        setModels(response.models || []);
      } catch (error) {
        console.error('Erro ao carregar modelos:', error);
        setModels([]);
      } finally {
        setLoadingModels(false);
      }
    };

    if (isOpen) {
      loadAgents();
      loadModels();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;
    
    // Validação
    if (!name.trim()) {
      setError('O nome do projeto é obrigatório');
      return;
    }
    
    setIsSaving(true);
    setError('');
    setSuccess('');
    
    try {
      const projectData = {
        name: name.trim(),
        description: description.trim() || null,
        regras: regras.trim() || null,
        projectTypeId: projectTypeId || null,
        status: status,
        ativo: ativo,
        frontendPath: frontendPath.trim() || null,
        frontendPort: frontendPort || null,
        backendPath: backendPath.trim() || null,
        backendPort: backendPort || null,
        repositoryUrl: repositoryUrl.trim() || null,
        pastaBase: pastaBase.trim() || null,
        agent: agent || null,
        programadorFront: programadorFront || null,
        programadorBack: programadorBack || null,
        modeloAuxiliar: modeloAuxiliar || null,
        frontendBuildCmd: frontendBuildCmd.trim() || null,
        backendBuildCmd: backendBuildCmd.trim() || null
      };
      
      await onUpdate(project.id, projectData);
      setSuccess('Projeto atualizado com sucesso!');
      
      // Fechar modal após 2 segundos
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar projeto');
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Não disponível';
    return new Date(dateString).toLocaleString('pt-BR');
  };

  if (!isOpen || !project) return null;

  return (
    <div className="edit-project-modal-overlay">
      <div className="edit-project-modal">
        {/* Header */}
        <div className="edit-project-modal-header">
          <h2 className="edit-project-modal-title">
            <FaEdit size={20} />
            Editar Projeto: {project.name}
          </h2>
          <button className="edit-project-modal-close" onClick={onClose}>
            <FaTimes size={16} />
          </button>
        </div>
        
        {/* Container rolável para o conteúdo */}
        <div className="edit-project-modal-scrollable">
          <form onSubmit={handleSubmit}>
            <div className="edit-project-modal-body">
              <div className="edit-project-modal-sections">
                
                {/* Seção 1: Informações Básicas */}
                <div className="edit-project-modal-section">
                  <h3 className="edit-project-modal-section-title">
                    <FaFolder size={16} />
                    Informações Básicas
                  </h3>
                  <div className="edit-project-modal-form-grid">
                    <div className="edit-project-modal-form-group">
                      <label className="edit-project-modal-label edit-project-modal-label-required">
                        Nome do Projeto
                      </label>
                      <input
                        type="text"
                        className="edit-project-modal-input"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Digite o nome do projeto"
                        required
                      />
                      <p className="edit-project-modal-help">
                        Nome descritivo para identificar o projeto
                      </p>
                    </div>
                    
                    <div className="edit-project-modal-form-group">
                      <label className="edit-project-modal-label">
                        Tipo de Projeto
                      </label>
                      <select
                        className="edit-project-modal-select"
                        value={projectTypeId}
                        onChange={(e) => setProjectTypeId(e.target.value)}
                      >
                        <option value="">Selecione um tipo (opcional)</option>
                        {projectTypes.map(type => (
                          <option key={type.id} value={type.id}>
                            {type.name}
                          </option>
                        ))}
                      </select>
                      <p className="edit-project-modal-help">
                        O tipo de projeto define regras e prompts específicos
                      </p>
                    </div>
                    
                    <div className="edit-project-modal-form-group">
                      <label className="edit-project-modal-label">
                        Descrição
                      </label>
                      <textarea
                        className="edit-project-modal-textarea"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Descreva o objetivo e escopo do projeto..."
                        rows={3}
                      />
                    </div>
                    
                    <div className="edit-project-modal-form-group">
                      <label className="edit-project-modal-label">
                        Regras (opcional)
                      </label>
                      <textarea
                        className="edit-project-modal-textarea"
                        value={regras}
                        onChange={(e) => setRegras(e.target.value)}
                        placeholder="Insira as regras específicas para este projeto..."
                        rows={4}
                      />
                      <p className="edit-project-modal-help">
                        Regras de negócio, restrições ou diretrizes especiais
                      </p>
                    </div>
                    
                    <div className="edit-project-modal-form-group">
                      <label className="edit-project-modal-label" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input
                          type="checkbox"
                          checked={status}
                          onChange={(e) => setStatus(e.target.checked)}
                          style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                        />
                        <span>Projeto Ativo para IA</span>
                      </label>
                      <p className="edit-project-modal-help" style={{ marginLeft: '28px' }}>
                        Se marcado, o monitor Jarbas processará as tarefas deste projeto.
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Seção 2: Configurações Técnicas */}
                <div className="edit-project-modal-section">
                  <h3 className="edit-project-modal-section-title">
                    <FaCode size={16} />
                    Configurações Técnicas
                  </h3>
                  <div className="edit-project-modal-form-grid">
                    <div className="edit-project-modal-form-group">
                      <label className="edit-project-modal-label">
                        <FaCode size={12} /> Caminho do Frontend
                      </label>
                      <input
                        type="text"
                        className="edit-project-modal-input"
                        value={frontendPath}
                        onChange={(e) => setFrontendPath(e.target.value)}
                        placeholder="ex: /home/usuario/projetos/frontend"
                      />
                      <p className="edit-project-modal-help">
                        Caminho absoluto ou relativo para o diretório do frontend
                      </p>
                    </div>
                    
                    <div className="edit-project-modal-form-group">
                      <label className="edit-project-modal-label">
                        Porta Frontend
                      </label>
                      <input
                        type="number"
                        className="edit-project-modal-input"
                        value={frontendPort || ''}
                        onChange={(e) => setFrontendPort(e.target.value ? parseInt(e.target.value) : undefined)}
                        placeholder="ex: 3000"
                        min="1"
                        max="65535"
                      />
                      <p className="edit-project-modal-help">
                        Porta para execução do frontend (1-65535)
                      </p>
                    </div>
                    
                    <div className="edit-project-modal-form-group">
                      <label className="edit-project-modal-label">
                        <FaServer size={12} /> Caminho do Backend
                      </label>
                      <input
                        type="text"
                        className="edit-project-modal-input"
                        value={backendPath}
                        onChange={(e) => setBackendPath(e.target.value)}
                        placeholder="ex: /home/usuario/projetos/backend"
                      />
                      <p className="edit-project-modal-help">
                        Caminho absoluto ou relativo para o diretório do backend
                      </p>
                    </div>
                    
                    <div className="edit-project-modal-form-group">
                      <label className="edit-project-modal-label">
                        Porta Backend
                      </label>
                      <input
                        type="number"
                        className="edit-project-modal-input"
                        value={backendPort || ''}
                        onChange={(e) => setBackendPort(e.target.value ? parseInt(e.target.value) : undefined)}
                        placeholder="ex: 4001"
                        min="1"
                        max="65535"
                      />
                      <p className="edit-project-modal-help">
                        Porta para execução do backend (1-65535)
                      </p>
                    </div>
                    
                    <div className="edit-project-modal-form-group">
                      <label className="edit-project-modal-label">
                        URL do Repositório
                      </label>
                      <input
                        type="text"
                        className="edit-project-modal-input"
                        value={repositoryUrl}
                        onChange={(e) => setRepositoryUrl(e.target.value)}
                        placeholder="ex: https://github.com/usuario/projeto"
                      />
                      <p className="edit-project-modal-help">
                        URL do repositório Git do projeto
                      </p>
                    </div>
                    
                    <div className="edit-project-modal-form-group">
                      <label className="edit-project-modal-label">
                        Pasta Base
                      </label>
                      <input
                        type="text"
                        className="edit-project-modal-input"
                        value={pastaBase}
                        onChange={(e) => setPastaBase(e.target.value)}
                        placeholder="ex: /home/usuario/projetos/projeto/"
                      />
                      <p className="edit-project-modal-help">
                        Caminho base do projeto no sistema de arquivos
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Seção 3: Agentes e Modelos */}
                <div className="edit-project-modal-section">
                  <h3 className="edit-project-modal-section-title">
                    <FaUser size={16} />
                    Agentes e Modelos
                  </h3>
                  <div className="edit-project-modal-form-grid">
                    <div className="edit-project-modal-form-group">
                      <label className="edit-project-modal-label">
                        Analista Contratado
                      </label>
                      <select
                        className="edit-project-modal-select"
                        value={agent}
                        onChange={(e) => setAgent(e.target.value)}
                        disabled={loadingAgents}
                      >
                        <option value="">{loadingAgents ? 'Carregando agentes...' : 'Selecione um analista...'}</option>
                        {agents.map(agentItem => (
                          <option key={agentItem.id} value={agentItem.id}>
                            {agentItem.identity?.name || agentItem.id}
                          </option>
                        ))}
                      </select>
                      <p className="edit-project-modal-help">
                        Analista padrão para tarefas deste projeto
                      </p>
                    </div>

                    <div className="edit-project-modal-form-group">
                      <label className="edit-project-modal-label">
                        Programador Frontend
                      </label>
                      <select
                        className="edit-project-modal-select"
                        value={programadorFront}
                        onChange={(e) => setProgramadorFront(e.target.value)}
                        disabled={loadingAgents}
                      >
                        <option value="">{loadingAgents ? 'Carregando agentes...' : 'Selecione um programador front...'}</option>
                        {agents.map(agentItem => (
                          <option key={agentItem.id} value={agentItem.id}>
                            {agentItem.identity?.name || agentItem.id}
                          </option>
                        ))}
                      </select>
                      <p className="edit-project-modal-help">
                        Agente programador frontend para o projeto
                      </p>
                    </div>

                    <div className="edit-project-modal-form-group">
                      <label className="edit-project-modal-label">
                        Programador Backend
                      </label>
                      <select
                        className="edit-project-modal-select"
                        value={programadorBack}
                        onChange={(e) => setProgramadorBack(e.target.value)}
                        disabled={loadingAgents}
                      >
                        <option value="">{loadingAgents ? 'Carregando agentes...' : 'Selecione um programador back...'}</option>
                        {agents.map(agentItem => (
                          <option key={agentItem.id} value={agentItem.id}>
                            {agentItem.identity?.name || agentItem.id}
                          </option>
                        ))}
                      </select>
                      <p className="edit-project-modal-help">
                        Agente programador backend para o projeto
                      </p>
                    </div>
                    
                    <div className="edit-project-modal-form-group">
                      <label className="edit-project-modal-label">
                        Modelo Auxiliar
                      </label>
                      <select
                        className="edit-project-modal-select"
                        value={modeloAuxiliar}
                        onChange={(e) => setModeloAuxiliar(e.target.value)}
                        disabled={loadingModels}
                      >
                        <option value="">{loadingModels ? 'Carregando modelos...' : 'Selecione um modelo...'}</option>
                        {models.map((modelName, index) => (
                          <option key={index} value={modelName}>
                            {modelName}
                          </option>
                        ))}
                      </select>
                      <p className="edit-project-modal-help">
                        Modelo de IA auxiliar para o projeto
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Seção 4: Comandos de Build */}
                <div className="edit-project-modal-section">
                  <h3 className="edit-project-modal-section-title">
                    <FaHammer size={16} />
                    Comandos de Build
                  </h3>
                  <div className="edit-project-modal-form-grid">
                    <div className="edit-project-modal-form-group">
                      <label className="edit-project-modal-label">
                        Comando Build Frontend
                      </label>
                      <input
                        type="text"
                        className="edit-project-modal-input"
                        value={frontendBuildCmd}
                        onChange={(e) => setFrontendBuildCmd(e.target.value)}
                        placeholder="ex: npm run build"
                      />
                      <p className="edit-project-modal-help">
                        Comando para build/compilação do frontend
                      </p>
                    </div>
                    
                    <div className="edit-project-modal-form-group">
                      <label className="edit-project-modal-label">
                        Comando Build Backend
                      </label>
                      <input
                        type="text"
                        className="edit-project-modal-input"
                        value={backendBuildCmd}
                        onChange={(e) => setBackendBuildCmd(e.target.value)}
                        placeholder="ex: npm run build"
                      />
                      <p className="edit-project-modal-help">
                        Comando para build/compilação do backend
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Seção 4: Metadados (somente leitura) */}
                <div className="edit-project-modal-section">
                  <h3 className="edit-project-modal-section-title">
                    <FaInfoCircle size={16} />
                    Metadados
                  </h3>
                  <div className="edit-project-modal-metadata">
                    <div className="edit-project-modal-metadata-item">
                      <span className="edit-project-modal-metadata-label">
                        <FaCalendar size={12} /> Criado em
                      </span>
                      <span className="edit-project-modal-metadata-value">
                        {formatDate(project.createdAt)}
                      </span>
                    </div>
                    
                    <div className="edit-project-modal-metadata-item">
                      <span className="edit-project-modal-metadata-label">
                        <FaCalendar size={12} /> Última atualização
                      </span>
                      <span className="edit-project-modal-metadata-value">
                        {formatDate(project.updatedAt)}
                      </span>
                    </div>
                    
                    {project.createdBy && (
                      <div className="edit-project-modal-metadata-item">
                        <span className="edit-project-modal-metadata-label">
                          <FaUser size={12} /> Criado por
                        </span>
                        <span className="edit-project-modal-metadata-value">
                          {project.createdBy.name}
                        </span>
                      </div>
                    )}
                    
                    {project.projectType && (
                      <div className="edit-project-modal-metadata-item">
                        <span className="edit-project-modal-metadata-label">
                          <FaTag size={12} /> Tipo Atual
                        </span>
                        <span className="edit-project-modal-metadata-value">
                          {project.projectType.name}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Mensagens de erro/sucesso */}
                {error && (
                  <div className="edit-project-modal-error">
                    <FaExclamationTriangle size={12} /> {error}
                  </div>
                )}
                
                {success && (
                  <div className="edit-project-modal-success">
                    <FaCheck size={12} /> {success}
                  </div>
                )}
              </div>
            </div>
            
            {/* Footer com botões */}
            <div className="edit-project-modal-footer">
              <button
                type="button"
                className="edit-project-modal-btn edit-project-modal-btn-secondary"
                onClick={onClose}
                disabled={isSaving}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="edit-project-modal-btn edit-project-modal-btn-primary"
                disabled={isSaving || !name.trim()}
              >
                {isSaving ? (
                  <>
                    <FaSpinner className="loading-spinner" size={14} />
                    Salvando...
                  </>
                ) : (
                  <>
                    <FaCheck size={14} />
                    Salvar Alterações
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProjectModal;