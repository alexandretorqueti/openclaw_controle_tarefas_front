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
  const [projectTypeId, setProjectTypeId] = useState('');
  const [status, setStatus] = useState(true);
  const [ativo, setAtivo] = useState(true);
  
  // Configurações técnicas
  const [frontendPath, setFrontendPath] = useState('');
  const [backendPath, setBackendPath] = useState('');
  const [databasePath, setDatabasePath] = useState('');
  const [deployPath, setDeployPath] = useState('');
  
  // Comandos
  const [buildCommand, setBuildCommand] = useState('');
  const [startCommand, setStartCommand] = useState('');
  const [testCommand, setTestCommand] = useState('');
  const [deployCommand, setDeployCommand] = useState('');
  
  // Estados da UI
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Inicializar formulário com dados do projeto
  useEffect(() => {
    if (project) {
      setName(project.name || '');
      setDescription(project.description || '');
      setProjectTypeId(project.projectTypeId || '');
      setStatus(project.status || true);
      setAtivo(project.ativo || true);
      
      // Configurações técnicas
      setFrontendPath(project.frontendPath || '');
      setBackendPath(project.backendPath || '');
      setDatabasePath(project.databasePath || '');
      setDeployPath(project.deployPath || '');
      
      // Comandos
      setBuildCommand(project.buildCommand || '');
      setStartCommand(project.startCommand || '');
      setTestCommand(project.testCommand || '');
      setDeployCommand(project.deployCommand || '');
    }
  }, [project]);

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
        projectTypeId: projectTypeId || null,
        status: status,
        ativo: ativo,
        frontendPath: frontendPath.trim() || null,
        backendPath: backendPath.trim() || null,
        databasePath: databasePath.trim() || null,
        deployPath: deployPath.trim() || null,
        buildCommand: buildCommand.trim() || null,
        startCommand: startCommand.trim() || null,
        testCommand: testCommand.trim() || null,
        deployCommand: deployCommand.trim() || null
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
                        Status do Projeto
                      </label>
                      <div className="edit-project-modal-radio-group">
                        <label className="edit-project-modal-radio-label">
                          <input
                            type="radio"
                            checked={status}
                            onChange={() => setStatus(true)}
                          />
                          <span>Ativo</span>
                        </label>
                        <label className="edit-project-modal-radio-label">
                          <input
                            type="radio"
                            checked={!status}
                            onChange={() => setStatus(false)}
                          />
                          <span>Inativo</span>
                        </label>
                      </div>
                    </div>
                    
                    <div className="edit-project-modal-form-group">
                      <label className="edit-project-modal-label">
                        Ativo no Sistema
                      </label>
                      <div className="edit-project-modal-radio-group">
                        <label className="edit-project-modal-radio-label">
                          <input
                            type="radio"
                            checked={ativo}
                            onChange={() => setAtivo(true)}
                          />
                          <span>Sim</span>
                        </label>
                        <label className="edit-project-modal-radio-label">
                          <input
                            type="radio"
                            checked={!ativo}
                            onChange={() => setAtivo(false)}
                          />
                          <span>Não</span>
                        </label>
                      </div>
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
                        <FaDatabase size={12} /> Caminho do Banco de Dados
                      </label>
                      <input
                        type="text"
                        className="edit-project-modal-input"
                        value={databasePath}
                        onChange={(e) => setDatabasePath(e.target.value)}
                        placeholder="ex: /home/usuario/projetos/database"
                      />
                      <p className="edit-project-modal-help">
                        Caminho para arquivos de banco de dados ou configurações
                      </p>
                    </div>
                    
                    <div className="edit-project-modal-form-group">
                      <label className="edit-project-modal-label">
                        <FaRocket size={12} /> Caminho de Deploy
                      </label>
                      <input
                        type="text"
                        className="edit-project-modal-input"
                        value={deployPath}
                        onChange={(e) => setDeployPath(e.target.value)}
                        placeholder="ex: /var/www/projeto"
                      />
                      <p className="edit-project-modal-help">
                        Caminho de destino para deploy da aplicação
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Seção 3: Comandos de Execução */}
                <div className="edit-project-modal-section">
                  <h3 className="edit-project-modal-section-title">
                    <FaHammer size={16} />
                    Comandos de Execução
                  </h3>
                  <div className="edit-project-modal-form-grid">
                    <div className="edit-project-modal-form-group">
                      <label className="edit-project-modal-label">
                        <FaHammer size={12} /> Comando de Build
                      </label>
                      <input
                        type="text"
                        className="edit-project-modal-input"
                        value={buildCommand}
                        onChange={(e) => setBuildCommand(e.target.value)}
                        placeholder="ex: npm run build"
                      />
                      <p className="edit-project-modal-help">
                        Comando para build/compilação do projeto
                      </p>
                    </div>
                    
                    <div className="edit-project-modal-form-group">
                      <label className="edit-project-modal-label">
                        <FaPlay size={12} /> Comando de Start
                      </label>
                      <input
                        type="text"
                        className="edit-project-modal-input"
                        value={startCommand}
                        onChange={(e) => setStartCommand(e.target.value)}
                        placeholder="ex: npm start"
                      />
                      <p className="edit-project-modal-help">
                        Comando para iniciar a aplicação
                      </p>
                    </div>
                    
                    <div className="edit-project-modal-form-group">
                      <label className="edit-project-modal-label">
                        <FaVial size={12} /> Comando de Test
                      </label>
                      <input
                        type="text"
                        className="edit-project-modal-input"
                        value={testCommand}
                        onChange={(e) => setTestCommand(e.target.value)}
                        placeholder="ex: npm test"
                      />
                      <p className="edit-project-modal-help">
                        Comando para executar testes
                      </p>
                    </div>
                    
                    <div className="edit-project-modal-form-group">
                      <label className="edit-project-modal-label">
                        <FaRocket size={12} /> Comando de Deploy
                      </label>
                      <input
                        type="text"
                        className="edit-project-modal-input"
                        value={deployCommand}
                        onChange={(e) => setDeployCommand(e.target.value)}
                        placeholder="ex: ./deploy.sh"
                      />
                      <p className="edit-project-modal-help">
                        Comando para deploy da aplicação
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