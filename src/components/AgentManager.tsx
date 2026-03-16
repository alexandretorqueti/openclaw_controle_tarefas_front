import React, { useState, useEffect, useCallback } from 'react';
import { 
  FaRobot, FaPlus, FaSync, FaSearch, FaFilter, FaTimes, 
  FaEdit, FaTrash, FaUser, FaCode, FaLink, FaCalendarAlt,
  FaCheck, FaExclamationTriangle, FaInfoCircle, FaTimesCircle
} from 'react-icons/fa';
import './AgentManager.css';
import apiService from '../services/api';
import { Agent, AgentIdentity } from '../types/agent';

// Componentes auxiliares
interface LoadingSpinnerProps {
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message = 'Carregando...' }) => (
  <div className="loading-state">
    <div className="loading-spinner">
      <FaSync />
    </div>
    <div className="loading-text">{message}</div>
  </div>
);

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ 
  icon = <FaRobot />, 
  title, 
  description 
}) => (
  <div className="empty-state">
    <div className="empty-state-icon">{icon}</div>
    <div className="empty-state-title">{title}</div>
    <div className="empty-state-description">{description}</div>
  </div>
);

interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ id, type, title, message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, 5000);
    return () => clearTimeout(timer);
  }, [id, onClose]);

  return (
    <div className={`toast toast-${type}`}>
      <div className="toast-header">
        <h4 className="toast-title">{title}</h4>
        <button 
          className="toast-close" 
          onClick={() => onClose(id)}
        >
          <FaTimes size={12} />
        </button>
      </div>
      <p className="toast-message">{message}</p>
    </div>
  );
};

interface AgentCardProps {
  agent: Agent;
  onEdit: (agent: Agent) => void;
  onDelete: (agent: Agent) => void;
}

const AgentCard: React.FC<AgentCardProps> = ({ agent, onEdit, onDelete }) => {
  const getAvatarContent = () => {
    if (agent.avatarUrl) {
      return <img src={agent.avatarUrl} alt={agent.identity.name} className="agent-avatar" />;
    }
    if (agent.identity.emoji) {
      return (
        <div className="agent-avatar-placeholder">
          <span>{agent.identity.emoji}</span>
        </div>
      );
    }
    return (
      <div className="agent-avatar-placeholder">
        <FaRobot size={24} />
      </div>
    );
  };

  return (
    <div className="agent-card">
      <div className="agent-card-header">
        {getAvatarContent()}
        <div className="agent-info">
          <h3 className="agent-name">{agent.identity.name}</h3>
          <p className="agent-model">{agent.identity.model || 'Modelo não especificado'}</p>
        </div>
      </div>
      
      <div className="agent-card-body">
        <div className="agent-meta">
          <div className="agent-meta-item">
            <FaLink className="agent-meta-icon" />
            <span>{agent.bindings} binding{agent.bindings !== 1 ? 's' : ''}</span>
          </div>
          {agent.createdAt && (
            <div className="agent-meta-item">
              <FaCalendarAlt className="agent-meta-icon" />
              <span>{new Date(agent.createdAt).toLocaleDateString('pt-BR')}</span>
            </div>
          )}
        </div>
        
        {agent.identity.description && (
          <p className="agent-description">{agent.identity.description}</p>
        )}
      </div>
      
      <div className="agent-card-footer">
        <button 
          className="btn btn-secondary btn-sm"
          onClick={() => onEdit(agent)}
        >
          <FaEdit size={12} />
          Editar
        </button>
        <button 
          className="btn btn-danger btn-sm"
          onClick={() => onDelete(agent)}
        >
          <FaTrash size={12} />
          Excluir
        </button>
      </div>
    </div>
  );
};

interface CreateAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, workspace?: string) => Promise<void>;
}

const CreateAgentModal: React.FC<CreateAgentModalProps> = ({ isOpen, onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [workspace, setWorkspace] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('O nome do agente é obrigatório');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      await onCreate(name, workspace.trim() || undefined);
      setName('');
      setWorkspace('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao criar agente');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">Criar Novo Agente</h2>
          <button className="modal-close" onClick={onClose}>
            <FaTimes size={18} />
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
                placeholder="Ex: Meu Agente IA"
                disabled={loading}
                required
              />
              <div className="form-help">
                Este será o nome exibido na lista de agentes
              </div>
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
                placeholder="Ex: /caminho/para/workspace"
                disabled={loading}
              />
              <div className="form-help">
                Caminho absoluto para o diretório do agente. Deixe em branco para usar o padrão.
              </div>
            </div>
            
            {error && (
              <div className="form-error">
                <FaExclamationTriangle size={12} /> {error}
              </div>
            )}
          </div>
          
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !name.trim()}
            >
              {loading ? 'Criando...' : 'Criar Agente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface EditAgentModalProps {
  isOpen: boolean;
  agent: Agent | null;
  onClose: () => void;
  onUpdate: (agentId: string, identity: AgentIdentity) => Promise<void>;
}

const EditAgentModal: React.FC<EditAgentModalProps> = ({ isOpen, agent, onClose, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<'identity' | 'files' | 'bindings'>('identity');
  const [identity, setIdentity] = useState<AgentIdentity>({
    name: '',
    emoji: '',
    avatar: '',
    model: '',
    description: '',
    vibe: ''
  });
  const [bindings, setBindings] = useState<string[]>([]);
  const [newBinding, setNewBinding] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [bindingError, setBindingError] = useState('');
  const [models, setModels] = useState<string[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);

  useEffect(() => {
    if (agent) {
      setIdentity({
        name: agent.identity.name || '',
        emoji: agent.identity.emoji || '',
        avatar: agent.identity.avatar || '',
        model: agent.identity.model || '',
        description: agent.identity.description || '',
        vibe: agent.identity.vibe || ''
      });
      setBindings(agent.bindingsList || []);
    }
  }, [agent]);

  useEffect(() => {
    const loadModels = async () => {
      setLoadingModels(true);
      try {
        const response = await apiService.request('/models');
        setModels(response.models || []);
      } catch (error) {
        console.error('Erro ao carregar modelos:', error);
        setModels([]);
      } finally {
        setLoadingModels(false);
      }
    };

    if (isOpen) {
      loadModels();
    }
  }, [isOpen]);

  const handleAddBinding = () => {
    if (!newBinding.trim()) {
      setBindingError('O binding não pode estar vazio');
      return;
    }
    
    if (!newBinding.includes(':')) {
      setBindingError('Formato inválido. Use: canal:conta');
      return;
    }
    
    if (bindings.includes(newBinding.trim())) {
      setBindingError('Este binding já está adicionado');
      return;
    }
    
    setBindings([...bindings, newBinding.trim()]);
    setNewBinding('');
    setBindingError('');
  };

  const handleRemoveBinding = (index: number) => {
    const newBindings = [...bindings];
    newBindings.splice(index, 1);
    setBindings(newBindings);
  };

  const updateAgentBindings = async (agentId: string, bindingsList: string[]) => {
    try {
      const currentBindings = agent?.bindingsList || [];
      
      const toAdd = bindingsList.filter(b => !currentBindings.includes(b));
      const toRemove = currentBindings.filter(b => !bindingsList.includes(b));
      
      for (const binding of toAdd) {
        await apiService.post(`/agents/${agentId}/bindings`, { binding });
      }
      
      for (const binding of toRemove) {
        await apiService.delete(`/agents/${agentId}/bindings`, { 
          data: { binding } 
        });
      }
      
    } catch (error) {
      console.error('Erro ao atualizar bindings:', error);
      throw new Error('Falha ao atualizar bindings do agente');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agent || !identity.name.trim()) {
      setError('O nome do agente é obrigatório');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    setBindingError('');
    
    try {
      await onUpdate(agent.id, identity);
      
      if (JSON.stringify(bindings) !== JSON.stringify(agent.bindingsList || [])) {
        await updateAgentBindings(agent.id, bindings);
      }
      
      setSuccess('Agente atualizado com sucesso!');
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar agente');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !agent) return null;

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: '600px' }}>
        <div className="modal-header">
          <h2 className="modal-title">Editar Agente: {agent.identity.name}</h2>
          <button className="modal-close" onClick={onClose}>
            <FaTimes size={18} />
          </button>
        </div>
        
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'identity' ? 'active' : ''}`}
            onClick={() => setActiveTab('identity')}
          >
            <FaUser size={14} /> Identidade
          </button>
          <button
            className={`tab ${activeTab === 'bindings' ? 'active' : ''}`}
            onClick={() => setActiveTab('bindings')}
          >
            <FaLink size={14} /> Bindings
          </button>
          <button
            className={`tab ${activeTab === 'files' ? 'active' : ''}`}
            onClick={() => setActiveTab('files')}
          >
            <FaCode size={14} /> Arquivos
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {activeTab === 'identity' ? (
              <>
                <div className="form-group">
                  <label className="form-label form-label-required">
                    Nome
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={identity.name}
                    onChange={(e) => setIdentity({...identity, name: e.target.value})}
                    disabled={loading}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">
                    Emoji
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={identity.emoji}
                    onChange={(e) => setIdentity({...identity, emoji: e.target.value})}
                    placeholder="Ex: 🤖"
                    disabled={loading}
                  />
                  <div className="form-help">
                    Emoji que representa o agente (opcional)
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">
                    Modelo
                  </label>
                  <select
                    className="form-input"
                    value={identity.model}
                    onChange={(e) => setIdentity({...identity, model: e.target.value})}
                    disabled={loading || loadingModels}
                  >
                    <option value="">{loadingModels ? 'Carregando modelos...' : 'Selecione um modelo...'}</option>
                    {models.map((modelName, index) => (
                      <option key={index} value={modelName}>
                        {modelName}
                      </option>
                    ))}
                  </select>
                  <div className="form-help">
                    Modelo de IA que o agente usa (opcional)
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">
                    Descrição
                  </label>
                  <textarea
                    className="form-textarea"
                    value={identity.description}
                    onChange={(e) => setIdentity({...identity, description: e.target.value})}
                    placeholder="Descreva a função deste agente..."
                    disabled={loading}
                    rows={3}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">
                    Vibe
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={identity.vibe}
                    onChange={(e) => setIdentity({...identity, vibe: e.target.value})}
                    placeholder="Ex: Profissional, Divertido, Técnico"
                    disabled={loading}
                  />
                  <div className="form-help">
                    Personalidade ou tom do agente (opcional)
                  </div>
                </div>
              </>
            ) : activeTab === 'bindings' ? (
              <div className="bindings-tab">
                <div className="form-group">
                  <label className="form-label">
                    Bindings Ativos
                  </label>
                  <div className="bindings-list">
                    {bindings.length === 0 ? (
                      <div className="empty-bindings">
                        <FaInfoCircle size={16} />
                        <span>Nenhum binding configurado</span>
                      </div>
                    ) : (
                      <ul className="bindings-items">
                        {bindings.map((binding, index) => (
                          <li key={index} className="binding-item">
                            <span className="binding-text">{binding}</span>
                            <button
                              type="button"
                              className="btn btn-sm btn-danger btn-icon"
                              onClick={() => handleRemoveBinding(index)}
                              disabled={loading}
                            >
                              <FaTimes size={12} />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="form-help">
                    Bindings são conexões do agente com canais (ex: "telegram:meu-canal")
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">
                    Adicionar Novo Binding
                  </label>
                  <div className="binding-input-group">
                    <input
                      type="text"
                      className="form-input"
                      value={newBinding}
                      onChange={(e) => setNewBinding(e.target.value)}
                      placeholder="Ex: telegram:meu-canal"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleAddBinding}
                      disabled={loading || !newBinding.trim()}
                    >
                      <FaPlus size={12} /> Adicionar
                    </button>
                  </div>
                  {bindingError && (
                    <div className="form-error">
                      <FaExclamationTriangle size={12} /> {bindingError}
                    </div>
                  )}
                  <div className="form-help">
                    Formato: canal:conta (ex: "telegram:meu-canal", "discord:servidor")
                  </div>
                </div>
                
                <div className="binding-stats">
                  <div className="stat-item">
                    <span className="stat-label">Total de Bindings:</span>
                    <span className="stat-value">{bindings.length}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="tab-content active">
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px' }}>
                  Os arquivos do agente (SOUL.md, USER.md, MEMORY.md) podem ser editados diretamente
                  no workspace do agente em: <code>{agent.workspace || 'Workspace não configurado'}</code>
                </p>
                
                <div className="form-group">
                  <label className="form-label">
                    Avatar URL
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={identity.avatar}
                    onChange={(e) => setIdentity({...identity, avatar: e.target.value})}
                    placeholder="URL da imagem do avatar"
                    disabled={loading}
                  />
                  <div className="form-help">
                    URL completa para a imagem do avatar (opcional)
                  </div>
                </div>
              </div>
            )}
            
            {error && (
              <div className="form-error">
                <FaExclamationTriangle size={12} /> {error}
              </div>
            )}
            
            {success && (
              <div style={{ 
                color: 'var(--success-color)', 
                fontSize: '14px', 
                marginTop: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <FaCheck /> {success}
              </div>
            )}
          </div>
          
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !identity.name.trim()}
            >
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Componente principal
const AgentManager: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [modelFilter, setModelFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [toasts, setToasts] = useState<Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
  }>>([]);

  const addToast = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, type, title, message }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const loadAgents = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.getAgents();
      if (response.success) {
        setAgents(response.data || []);
      } else {
        setError(response.error || 'Erro ao carregar agentes');
      }
    } catch (err: any) {
      setError(err.message || 'Erro de conexão com o servidor');
      addToast('error', 'Erro', 'Falha ao carregar agentes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAgents();
  }, [loadAgents]);

  const handleCreateAgent = async (name: string, workspace?: string) => {
    try {
      const response = await apiService.createAgent({ name, workspace });
      if (response.success) {
        addToast('success', 'Sucesso', 'Agente criado com sucesso!');
        await loadAgents();
      } else {
        throw new Error(response.error || 'Erro ao criar agente');
      }
    } catch (err: any) {
      addToast('error', 'Erro', err.message || 'Falha ao criar agente');
      throw err;
    }
  };

  const handleUpdateAgent = async (agentId: string, identity: AgentIdentity) => {
    try {
      const response = await apiService.updateAgentIdentity(agentId, identity);
      if (response.success) {
        addToast('success', 'Sucesso', 'Agente atualizado com sucesso!');
        await loadAgents();
      } else {
        throw new Error(response.error || 'Erro ao atualizar agente');
      }
    } catch (err: any) {
      addToast('error', 'Erro', err.message || 'Falha ao atualizar agente');
      throw err;
    }
  };

  const handleDeleteAgent = async (agent: Agent) => {
    if (!window.confirm(`Tem certeza que deseja excluir o agente "${agent.identity.name}"? Esta ação não pode ser desfeita.`)) {
      return;
    }

    try {
      const response = await apiService.deleteAgent(agent.id);
      if (response.success) {
        addToast('success', 'Sucesso', 'Agente excluído com sucesso!');
        await loadAgents();
      } else {
        throw new Error(response.error || 'Erro ao excluir agente');
      }
    } catch (err: any) {
      addToast('error', 'Erro', err.message || 'Falha ao excluir agente');
    }
  };

  const handleEditAgent = (agent: Agent) => {
    setSelectedAgent(agent);
    setShowEditModal(true);
  };

  // Filtrar agentes
  const filteredAgents = agents.filter(agent => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      agent.identity.name.toLowerCase().includes(searchLower) ||
      agent.identity.description?.toLowerCase().includes(searchLower) ||
      agent.identity.vibe?.toLowerCase().includes(searchLower) ||
      agent.identity.model?.toLowerCase().includes(searchLower);
    
    const matchesModel = modelFilter === '' || 
      agent.identity.model?.toLowerCase().includes(modelFilter.toLowerCase());
    
    return matchesSearch && matchesModel;
  });

  // Obter modelos únicos para o filtro
  const uniqueModels = Array.from(new Set(
    agents
      .map(agent => agent.identity?.model)
      .filter((model): model is string => !!model)
  )).sort();

  return (
    <div className="agent-manager">
      {/* Header */}
      <div className="agent-header">
        <div className="agent-header-title">
          <div className="agent-header-icon">
            <FaRobot size={24} />
          </div>
          <div className="agent-header-text">
            <h1>Gerenciar Agentes</h1>
            <p>Crie, edite e gerencie seus agentes de IA</p>
          </div>
        </div>
        
        <div className="agent-header-actions">
          <button
            className="btn btn-secondary"
            onClick={loadAgents}
            disabled={loading}
          >
            <FaSync size={14} />
            {loading ? 'Atualizando...' : 'Atualizar'}
          </button>
          <button
            className="btn btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            <FaPlus size={14} />
            Novo Agente
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="agent-filters">
        <div className="filter-group">
          <label className="filter-label">
            <FaSearch size={12} /> Buscar Agentes
          </label>
          <div className="filter-input-with-icon">
            <input
              type="text"
              className="filter-input"
              placeholder="Buscar por nome, descrição ou vibe..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FaSearch className="filter-icon" size={14} />
            {searchTerm && (
              <button
                className="filter-clear"
                onClick={() => setSearchTerm('')}
                title="Limpar busca"
              >
                <FaTimes size={12} />
              </button>
            )}
          </div>
        </div>
        
        <div className="filter-group">
          <label className="filter-label">
            <FaFilter size={12} /> Filtrar por Modelo
          </label>
          <select
            className="filter-input"
            value={modelFilter}
            onChange={(e) => setModelFilter(e.target.value)}
          >
            <option value="">Todos os modelos</option>
            {uniqueModels.map(model => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
        </div>
        
        <div className="filter-stats">
          <span>
            {filteredAgents.length} de {agents.length} agentes
          </span>
        </div>
      </div>

      {/* Conteúdo */}
      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <EmptyState 
          icon={<FaExclamationTriangle />}
          title="Erro ao carregar agentes" 
          description={error}
        />
      ) : filteredAgents.length === 0 ? (
        agents.length === 0 ? (
          <EmptyState 
            title="Nenhum agente encontrado" 
            description="Crie seu primeiro agente para começar"
          />
        ) : (
          <EmptyState 
            title="Nenhum agente corresponde aos filtros" 
            description="Tente ajustar os critérios de busca"
          />
        )
      ) : (
        <div className="agent-grid">
          {filteredAgents.map(agent => (
            <AgentCard
              key={agent.id}
              agent={agent}
              onEdit={handleEditAgent}
              onDelete={handleDeleteAgent}
            />
          ))}
        </div>
      )}

      {/* Modais */}
      <CreateAgentModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateAgent}
      />
      
      <EditAgentModal
        isOpen={showEditModal}
        agent={selectedAgent}
        onClose={() => {
          setShowEditModal(false);
          setSelectedAgent(null);
        }}
        onUpdate={handleUpdateAgent}
      />

      {/* Toasts */}
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          type={toast.type}
          title={toast.title}
          message={toast.message}
          onClose={removeToast}
        />
      ))}
    </div>
  );
};

export default AgentManager;
