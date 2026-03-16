import React, { useState, useEffect } from 'react';
import { Agent } from '../types/agent';
import api from '../services/api';
import './AgentManager.css';
import {
  FaRobot,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaTimes,
  FaUserCircle,
  FaSpinner,
  FaCheck,
  FaExclamationTriangle,
  FaInfoCircle,
  FaCalendarAlt,
  FaCode,
  FaFolder,
  FaUpload,
  FaTimesCircle,
  FaFilter
} from 'react-icons/fa';

// Componente de Toast para notificações
interface ToastProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ type, title, message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`toast toast-${type}`}>
      <div className="toast-header">
        <h4 className="toast-title">{title}</h4>
        <button className="toast-close" onClick={onClose}>
          <FaTimes size={14} />
        </button>
      </div>
      <p className="toast-message">{message}</p>
    </div>
  );
};

// Componente de Loading
const LoadingSpinner: React.FC = () => (
  <div className="loading-state">
    <FaSpinner className="loading-spinner" />
    <p className="loading-text">Carregando agentes...</p>
  </div>
);

// Componente de Estado Vazio
const EmptyState: React.FC<{ message: string; subMessage?: string }> = ({ message, subMessage }) => (
  <div className="empty-state">
    <FaRobot className="empty-state-icon" />
    <h3 className="empty-state-title">{message}</h3>
    {subMessage && <p className="empty-state-description">{subMessage}</p>}
  </div>
);

// Componente de Card de Agente
interface AgentCardProps {
  agent: Agent;
  onEdit: (agent: Agent) => void;
  onDelete: (agent: Agent) => void;
}

const AgentCard: React.FC<AgentCardProps> = ({ agent, onEdit, onDelete }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm(`Tem certeza que deseja excluir o agente "${agent.id}"?`)) {
      return;
    }
    
    setIsDeleting(true);
    try {
      await api.deleteAgent(agent.id);
      onDelete(agent);
    } catch (error) {
      console.error('Erro ao excluir agente:', error);
      alert('Erro ao excluir agente. Verifique o console para mais detalhes.');
    } finally {
      setIsDeleting(false);
    }
  };

  const getAvatarUrl = () => {
    if (agent.avatarUrl) {
      return agent.avatarUrl;
    }
    return null;
  };

  const getModelName = () => {
    if (agent.identity?.model) {
      return agent.identity.model;
    }
    return 'Modelo não definido';
  };

  const getDescription = () => {
    if (agent.identity?.description) {
      return agent.identity.description;
    }
    return 'Nenhuma descrição fornecida.';
  };

  return (
    <div className="agent-card">
      <div className="agent-card-header">
        {getAvatarUrl() ? (
          <img src={getAvatarUrl()} alt={agent.id} className="agent-avatar" />
        ) : (
          <div className="agent-avatar-placeholder">
            <FaRobot size={24} />
          </div>
        )}
        <div className="agent-info">
          <h3 className="agent-name">{agent.id}</h3>
          <p className="agent-model">{getModelName()}</p>
        </div>
      </div>
      
      <div className="agent-card-body">
        <div className="agent-meta">
          <div className="agent-meta-item">
            <FaCalendarAlt className="agent-meta-icon" />
            <span>Criado em: {new Date(agent.createdAt || Date.now()).toLocaleDateString()}</span>
          </div>
          {agent.identity?.emoji && (
            <div className="agent-meta-item">
              <FaInfoCircle className="agent-meta-icon" />
              <span>Emoji: {agent.identity.emoji}</span>
            </div>
          )}
        </div>
        
        <p className="agent-description">{getDescription()}</p>
      </div>
      
      <div className="agent-card-footer">
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => onEdit(agent)}
          disabled={isDeleting}
        >
          <FaEdit size={12} />
          Editar
        </button>
        <button
          className="btn btn-danger btn-sm"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <FaSpinner size={12} className="loading-spinner" />
          ) : (
            <FaTrash size={12} />
          )}
          Excluir
        </button>
      </div>
    </div>
  );
};

// Modal de Criação de Agente
interface CreateAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (agentData: { name: string; workspace?: string }) => Promise<void>;
}

const CreateAgentModal: React.FC<CreateAgentModalProps> = ({ isOpen, onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [workspace, setWorkspace] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('O nome do agente é obrigatório');
      return;
    }
    
    setIsCreating(true);
    setError('');
    
    try {
      await onCreate({ 
        name: name.trim(), 
        workspace: workspace.trim() || undefined 
      });
      setName('');
      setWorkspace('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao criar agente');
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">Criar Novo Agente</h2>
          <button className="modal-close" onClick={onClose}>
            <FaTimes size={16} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label form-label-required">
                Nome do Agente
              </label>
              <input
                type="text"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ex: analista-junior, programador-senior"
                required
              />
              <p className="form-help">
                Identificador único para o agente (sem espaços, preferencialmente com hífens)
              </p>
            </div>
            
            <div className="form-group">
              <label className="form-label">
                Workspace (Opcional)
              </label>
              <input
                type="text"
                className="form-input"
                value={workspace}
                onChange={(e) => setWorkspace(e.target.value)}
                placeholder="ex: /caminho/para/workspace"
              />
              <p className="form-help">
                Caminho absoluto para o workspace do agente. Deixe em branco para usar o padrão.
              </p>
            </div>
            
            {error && (
              <div className="form-group">
                <div className="form-error">
                  <FaExclamationTriangle size={12} /> {error}
                </div>
              </div>
            )}
          </div>
          
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isCreating}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isCreating || !name.trim()}
            >
              {isCreating ? (
                <>
                  <FaSpinner className="loading-spinner" size={14} />
                  Criando...
                </>
              ) : (
                <>
                  <FaPlus size={14} />
                  Criar Agente
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Modal de Edição de Agente
interface EditAgentModalProps {
  isOpen: boolean;
  agent: Agent | null;
  onClose: () => void;
  onUpdate: (agentId: string, identityData: any) => Promise<void>;
}

const EditAgentModal: React.FC<EditAgentModalProps> = ({ isOpen, agent, onClose, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<'identity' | 'files' | 'avatar'>('identity');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Campos de identidade
  const [emoji, setEmoji] = useState('');
  const [model, setModel] = useState('');
  const [description, setDescription] = useState('');
  const [vibe, setVibe] = useState('');
  
  // Campos de arquivos
  const [identityContent, setIdentityContent] = useState('');
  const [soulContent, setSoulContent] = useState('');
  
  // Campos de avatar
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    if (agent) {
      // Preencher campos de identidade
      setEmoji(agent.identity?.emoji || '');
      setModel(agent.identity?.model || '');
      setDescription(agent.identity?.description || '');
      setVibe(agent.identity?.vibe || '');
      
      // Preencher avatar preview
      if (agent.avatarUrl) {
        setAvatarPreview(agent.avatarUrl);
      }
      
      // Carregar arquivos
      loadAgentFiles();
    }
  }, [agent]);

  const loadAgentFiles = async () => {
    if (!agent) return;
    
    try {
      // Carregar IDENTITY.md
      const identityResponse = await api.getAgentFile(agent.id, 'IDENTITY.md');
      if (identityResponse.data) {
        setIdentityContent(identityResponse.data);
      }
      
      // Carregar SOUL.md
      const soulResponse = await api.getAgentFile(agent.id, 'SOUL.md');
      if (soulResponse.data) {
        setSoulContent(soulResponse.data);
      }
    } catch (error) {
      console.error('Erro ao carregar arquivos do agente:', error);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveIdentity = async () => {
    if (!agent) return;
    
    setIsSaving(true);
    setError('');
    setSuccess('');
    
    try {
      const identityData = {
        emoji: emoji.trim(),
        model: model.trim(),
        description: description.trim(),
        vibe: vibe.trim()
      };
      
      await onUpdate(agent.id, identityData);
      setSuccess('Identidade atualizada com sucesso!');
      
      // Salvar arquivos se necessário
      if (identityContent.trim()) {
        await api.updateAgentFile(agent.id, 'IDENTITY.md', identityContent);
      }
      
      if (soulContent.trim()) {
        await api.updateAgentFile(agent.id, 'SOUL.md', soulContent);
      }
      
      // Fechar modal após 2 segundos
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar agente');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen || !agent) return null;

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: '700px' }}>
        <div className="modal-header">
          <h2 className="modal-title">Editar Agente: {agent.id}</h2>
          <button className="modal-close" onClick={onClose}>
            <FaTimes size={16} />
          </button>
        </div>
        
        <div className="modal-body">
          {/* Tabs */}
          <div className="tabs">
            <button
              className={`tab ${activeTab === 'identity' ? 'active' : ''}`}
              onClick={() => setActiveTab('identity')}
            >
              <FaUserCircle size={14} /> Identidade
            </button>
            <button
              className={`tab ${activeTab === 'files' ? 'active' : ''}`}
              onClick={() => setActiveTab('files')}
            >
              <FaCode size={14} /> Arquivos
            </button>
            <button
              className={`tab ${activeTab === 'avatar' ? 'active' : ''}`}
              onClick={() => setActiveTab('avatar')}
            >
              <FaUpload size={14} /> Avatar
            </button>
          </div>
          
          {/* Tab: Identidade */}
          <div className={`tab-content ${activeTab === 'identity' ? 'active' : ''}`}>
            <div className="form-group">
              <label className="form-label">Emoji</label>
              <input
                type="text"
                className="form-input"
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                placeholder="ex: 🤖, 👨‍💻, 👩‍💼"
              />
              <p className="form-help">Emoji que representa o agente</p>
            </div>
            
            <div className="form-group">
              <label className="form-label">Modelo</label>
              <input
                type="text"
                className="form-input"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="ex: gpt-4, claude-3, gemini-pro"
              />
              <p className="form-help">Modelo de IA que o agente utiliza</p>
            </div>
            
            <div className="form-group">
              <label className="form-label">Descrição</label>
              <textarea
                className="form-textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva o propósito e especialidade do agente..."
                rows={3}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Vibe</label>
              <input
                type="text"
                className="form-input"
                value={vibe}
                onChange={(e) => setVibe(e.target.value)}
                placeholder="ex: Profissional, Criativo, Técnico, Amigável"
              />
              <p className="form-help">Tom e personalidade do agente</p>
            </div>
          </div>
          
          {/* Tab: Arquivos */}
          <div className={`tab-content ${activeTab === 'files' ? 'active' : ''}`}>
            <div className="form-group">
              <label className="form-label">IDENTITY.md</label>
              <textarea
                className="form-textarea"
                value={identityContent}
                onChange={(e) => setIdentityContent(e.target.value)}
                placeholder="# IDENTITY.md - Quem sou eu?"
                rows={8}
              />
              <p className="form-help">Arquivo de identidade do agente (Markdown)</p>
            </div>
            
            <div className="form-group">
              <label className="form-label">SOUL.md</label>
              <textarea
                className="form-textarea"
                value={soulContent}
                onChange={(e) => setSoulContent(e.target.value)}
                placeholder="# SOUL.md - Minha personalidade"
                rows={8}
              />
              <p className="form-help">Arquivo de personalidade do agente (Markdown)</p>
            </div>
          </div>
          
          {/* Tab: Avatar */}
          <div className={`tab-content ${activeTab === 'avatar' ? 'active' : ''}`}>
            <div className="avatar-upload">
              <div className="avatar-preview">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar preview" className="avatar-preview" />
                ) : (
                  <div className="avatar-preview-placeholder">
                    <FaRobot size={48} />
                  </div>
                )}
              </div>
              
              <div className="form-group">
                <label className="form-label">Upload de Avatar</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="form-input"
                />
                <p className="form-help">
                  Envie uma imagem para o avatar do agente (JPG, PNG, GIF)
                </p>
