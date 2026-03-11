// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Agent, AgentsResponse, OperationResponse } from '../types/agent';
import api from '../services/api';
import { FaRobot, FaPlus, FaEdit, FaTrash, FaLink, FaUnlink, FaSync, FaCheck, FaTimes, FaUserCircle, FaSpinner } from 'react-icons/fa';

// Estilos inline para animações
const styles = {
  '@keyframes spin': {
    '0%': { transform: 'rotate(0deg)' },
    '100%': { transform: 'rotate(360deg)' }
  }
};

const AgentManager: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showBindingsModal, setShowBindingsModal] = useState<boolean>(false);
  const [newAgentName, setNewAgentName] = useState<string>('');
  const [newAgentWorkspace, setNewAgentWorkspace] = useState<string>('');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [editAgentName, setEditAgentName] = useState<string>('');
  const [editAgentEmoji, setEditAgentEmoji] = useState<string>('');
  const [editAgentAvatar, setEditAgentAvatar] = useState<string>('');
  const [editAgentModel, setEditAgentModel] = useState<string>('');
  const [editAgentWorkspace, setEditAgentWorkspace] = useState<string>('');
  const [newBinding, setNewBinding] = useState<string>('');
  const [models, setModels] = useState<string[]>([]);
  
  const loadAgents = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.getAgents() as AgentsResponse;
      if (response.success) {
        setAgents(response.data);
      } else {
        setError(response.error || 'Erro ao carregar agentes');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadAgents();
    
    // Load models
    const loadModels = async () => {
      try {
        const data = await api.request('/models');
        setModels(data.models || []);
      } catch (error) {
        console.error('Error loading models:', error);
      }
    };
    
    loadModels();
  }, []);
  
  const handleCreateAgent = async () => {
    if (!newAgentName.trim()) {
      setError('O nome do agente é obrigatório');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.createAgent({
        name: newAgentName,
        workspace: newAgentWorkspace || undefined
      }) as OperationResponse;
      
      if (response.success) {
        setSuccessMessage('Agente criado com sucesso!');
        setShowCreateModal(false);
        setNewAgentName('');
        setNewAgentWorkspace('');
        loadAgents();
      } else {
        setError(response.error || 'Erro ao criar agente');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao criar agente');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteAgent = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este agente?')) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.deleteAgent(id) as OperationResponse;
      
      if (response.success) {
        setSuccessMessage('Agente excluído com sucesso!');
        loadAgents();
      } else {
        setError(response.error || 'Erro ao excluir agente');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao excluir agente');
    } finally {
      setLoading(false);
    }
  };
  
  const handleUpdateAgent = async () => {
    if (!selectedAgent) return;
    
    if (!editAgentName.trim()) {
      setError('O nome do agente é obrigatório');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.updateAgentIdentity(selectedAgent.id, {
        name: editAgentName,
        emoji: editAgentEmoji,
        avatar: editAgentAvatar,
        model: editAgentModel,
        workspace: editAgentWorkspace || undefined
      }) as OperationResponse;
      
      if (response.success) {
        setSuccessMessage('Agente atualizado com sucesso!');
        setShowEditModal(false);
        setSelectedAgent(null);
        setEditAgentName('');
        setEditAgentEmoji('');
        setEditAgentAvatar('');
        setEditAgentModel('');
        setEditAgentWorkspace('');
        loadAgents();
      } else {
        setError(response.error || 'Erro ao atualizar agente');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar agente');
    } finally {
      setLoading(false);
    }
  };
  
  const clearMessages = () => {
    setError(null);
    setSuccessMessage(null);
  };
  
  const AgentAvatar: React.FC<{agent: Agent}> = ({ agent }) => {
    const [imgError, setImgError] = useState(false);
    
    if (agent.identity && agent.identity.avatar && !imgError) {
      return (
        <img 
          src={agent.identity.avatar} 
          alt={agent.identity.name || 'Agente'}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            objectFit: 'cover'
          }}
          onError={() => setImgError(true)}
        />
      );
    }
    
    if (agent.identity && agent.identity.emoji) {
      return (
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          backgroundColor: '#f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '18px'
        }}>
          {agent.identity.emoji}
        </div>
      );
    }
    
    return <FaUserCircle style={{ width: '32px', height: '32px', color: '#999' }} />;
  };
  
  const renderAgentAvatar = (agent: Agent) => {
    return <AgentAvatar agent={agent} />;
  };
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#333', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', backgroundColor: '#4ECDC4', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FaRobot size={20} color="#fff" />
            </div>
            Gerenciamento de Agentes OpenClaw
          </h2>
          <p style={{ fontSize: '14px', color: '#666', margin: '8px 0 0' }}>
            Gerencie agentes através da CLI do OpenClaw
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={loadAgents}
            style={{
              padding: '10px 16px',
              backgroundColor: '#f8f9fa',
              color: '#333',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              opacity: loading ? 0.6 : 1
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#e9ecef';
              e.currentTarget.style.borderColor = '#ced4da';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#f8f9fa';
              e.currentTarget.style.borderColor = '#e0e0e0';
            }}
            disabled={loading}
          >
            <FaSync style={loading ? { animation: 'spin 1s linear infinite' } : {}} />
            Atualizar
          </button>
          
          <button 
            onClick={() => setShowCreateModal(true)}
            style={{
              padding: '10px 16px',
              backgroundColor: '#4ECDC4',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#3dbcb4';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#4ECDC4';
            }}
          >
            <FaPlus />
            Novo Agente
          </button>
        </div>
      </div>
      
      {error && (
        <div style={{
          marginBottom: '16px',
          padding: '16px',
          backgroundColor: '#FFE5E5',
          border: '1px solid #FF6B6B',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <FaTimes style={{ color: '#FF6B6B' }} />
          <div>
            <p style={{ color: '#FF6B6B', fontWeight: 500, margin: 0 }}>Erro</p>
            <p style={{ color: '#FF6B6B', fontSize: '14px', margin: '4px 0 0' }}>{error}</p>
          </div>
          <button 
            onClick={clearMessages}
            style={{
              marginLeft: 'auto',
              color: '#FF6B6B',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#ff5252';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#FF6B6B';
            }}
          >
            <FaTimes />
          </button>
        </div>
      )}
      
      {successMessage && (
        <div style={{
          marginBottom: '16px',
          padding: '16px',
          backgroundColor: '#E5FFE5',
          border: '1px solid #06D6A0',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <FaCheck style={{ color: '#06D6A0' }} />
          <div>
            <p style={{ color: '#06D6A0', fontWeight: 500, margin: 0 }}>Sucesso</p>
            <p style={{ color: '#06D6A0', fontSize: '14px', margin: '4px 0 0' }}>{successMessage}</p>
          </div>
          <button 
            onClick={clearMessages}
            style={{
              marginLeft: 'auto',
              color: '#06D6A0',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#05c595';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#06D6A0';
            }}
          >
            <FaTimes />
          </button>
        </div>
      )}
      
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '12px',
        border: '1px solid #e0e0e0',
        overflow: 'auto'
      }}>
        {loading && agents.length === 0 ? (
          <div style={{
            padding: '48px',
            textAlign: 'center',
            color: '#666',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px'
          }}>
            <FaSpinner style={{ animation: 'spin 1s linear infinite', fontSize: '32px', color: '#4ECDC4' }} />
            <span style={{ fontSize: '16px' }}>Carregando agentes...</span>
          </div>
        ) : agents.length === 0 ? (
          <div style={{
            padding: '48px',
            textAlign: 'center',
            color: '#666'
          }}>
            <FaRobot style={{ fontSize: '48px', margin: '0 auto 16px', color: '#ddd' }} />
            <p style={{ fontSize: '18px', margin: '0 0 8px' }}>Nenhum agente encontrado</p>
            <p style={{ fontSize: '14px' }}>Crie seu primeiro agente para começar</p>
          </div>
        ) : (
          <table style={{
            width: '100%',
            borderCollapse: 'collapse'
          }}>
            <thead>
              <tr style={{
                backgroundColor: '#f8f9fa',
                borderBottom: '1px solid #e0e0e0'
              }}>
                <th style={{
                  padding: '16px 24px',
                  textAlign: 'left',
                  fontSize: '12px',
                  fontWeight: 500,
                  color: '#666',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Agente
                </th>
                <th style={{
                  padding: '16px 24px',
                  textAlign: 'left',
                  fontSize: '12px',
                  fontWeight: 500,
                  color: '#666',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  ID
                </th>
                <th style={{
                  padding: '16px 24px',
                  textAlign: 'left',
                  fontSize: '12px',
                  fontWeight: 500,
                  color: '#666',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Bindings
                </th>
                <th style={{
                  padding: '16px 24px',
                  textAlign: 'left',
                  fontSize: '12px',
                  fontWeight: 500,
                  color: '#666',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Modelo
                </th>
                <th style={{
                  padding: '16px 24px',
                  textAlign: 'left',
                  fontSize: '12px',
                  fontWeight: 500,
                  color: '#666',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Workspace
                </th>
                <th style={{
                  padding: '16px 24px',
                  textAlign: 'left',
                  fontSize: '12px',
                  fontWeight: 500,
                  color: '#666',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Criado em
                </th>
                <th style={{
                  padding: '16px 24px',
                  textAlign: 'left',
                  fontSize: '12px',
                  fontWeight: 500,
                  color: '#666',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Ações
                </th>
              </tr>
            </thead>
            <tbody style={{
              backgroundColor: '#fff'
            }}>
              {agents.map((agent) => (
                <tr 
                  key={agent.id} 
                  style={{
                    borderBottom: '1px solid #f0f0f0',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#fff';
                  }}
                >
                  <td style={{
                    padding: '16px 24px',
                    whiteSpace: 'nowrap'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <div style={{ flexShrink: 0 }}>
                        {renderAgentAvatar(agent)}
                      </div>
                      <div style={{ marginLeft: '16px' }}>
                        <div style={{
                          fontSize: '14px',
                          fontWeight: 500,
                          color: '#333'
                        }}>
                          {agent.identity ? agent.identity.name : 'Sem nome'}
                        </div>
                        <div style={{
                          fontSize: '14px',
                          color: '#666',
                          marginTop: '4px'
                        }}>
                          {agent.identity && agent.identity.emoji && (
                            <span style={{ marginRight: '8px' }}>{agent.identity.emoji}</span>
                          )}
                          {agent.identity && agent.identity.avatar && (
                            <span style={{ fontSize: '12px' }}>Avatar configurado</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{
                    padding: '16px 24px',
                    whiteSpace: 'nowrap'
                  }}>
                    <div style={{
                      fontSize: '14px',
                      color: '#333',
                      fontFamily: 'monospace'
                    }}>{agent.id}</div>
                  </td>
                  <td style={{
                    padding: '16px 24px'
                  }}>
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '4px'
                    }}>
                      {agent.bindings && agent.bindings.length > 0 ? (
                        agent.bindings.map((binding, index) => (
                          <span 
                            key={index}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              fontWeight: 500,
                              backgroundColor: '#e3f2fd',
                              color: '#1976d2'
                            }}
                          >
                            {binding}
                          </span>
                        ))
                      ) : (
                        <span style={{
                          fontSize: '14px',
                          color: '#666'
                        }}>Nenhum binding</span>
                      )}
                    </div>
                  </td>
                  <td style={{
                    padding: '16px 24px',
                    whiteSpace: 'nowrap',
                    fontSize: '14px',
                    color: '#666'
                  }}>
                    {agent.identity?.model || '—'}
                  </td>
                  <td style={{
                    padding: '16px 24px',
                    whiteSpace: 'nowrap',
                    fontSize: '14px',
                    color: '#666'
                  }}>
                    {agent.workspace || '—'}
                  </td>
                  <td style={{
                    padding: '16px 24px',
                    whiteSpace: 'nowrap',
                    fontSize: '14px',
                    color: '#666'
                  }}>
                    {formatDate(agent.createdAt)}
                  </td>
                  <td style={{
                    padding: '16px 24px',
                    whiteSpace: 'nowrap',
                    fontSize: '14px',
                    fontWeight: 500
                  }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => {
                          setSelectedAgent(agent);
                          setEditAgentName(agent.identity?.name || '');
                          setEditAgentEmoji(agent.identity?.emoji || '');
                          setEditAgentAvatar(agent.identity?.avatar || '');
                          setEditAgentModel(agent.identity?.model || '');
                          setEditAgentWorkspace(agent.workspace || '');
                          setShowEditModal(true);
                        }}
                        style={{
                          color: '#1976d2',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '4px',
                          borderRadius: '4px',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = '#0d47a1';
                          e.currentTarget.style.backgroundColor = '#f5f5f5';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = '#1976d2';
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <FaEdit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteAgent(agent.id)}
                        style={{
                          color: '#d32f2f',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '4px',
                          borderRadius: '4px',
                          transition: 'all 0.2s',
                          opacity: loading ? 0.5 : 1
                        }}
                        onMouseEnter={(e) => {
                          if (!loading) {
                            e.currentTarget.style.color = '#b71c1c';
                            e.currentTarget.style.backgroundColor = '#f5f5f5';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!loading) {
                            e.currentTarget.style.color = '#d32f2f';
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }
                        }}
                        disabled={loading}
                      >
                        <FaTrash size={16} />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedAgent(agent);
                          setShowBindingsModal(true);
                        }}
                        style={{
                          color: '#388e3c',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '4px',
                          borderRadius: '4px',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = '#1b5e20';
                          e.currentTarget.style.backgroundColor = '#f5f5f5';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = '#388e3c';
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <FaLink size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50
        }}>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            width: '100%',
            maxWidth: '28rem',
            padding: '24px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: 600,
                color: '#333'
              }}>Criar Novo Agente</h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                style={{
                  color: '#999',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '4px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#666';
                  e.currentTarget.style.backgroundColor = '#f5f5f5';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#999';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <FaTimes />
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#333',
                  marginBottom: '8px'
                }}>
                  Nome do Agente *
                </label>
                <input
                  type="text"
                  value={newAgentName}
                  onChange={(e) => setNewAgentName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'all 0.2s'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#4ECDC4';
                    e.target.style.boxShadow = '0 0 0 3px rgba(78, 205, 196, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e0e0e0';
                    e.target.style.boxShadow = 'none';
                  }}
                  placeholder="Ex: MeuAgente"
                />
              </div>
              
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#333',
                  marginBottom: '8px'
                }}>
                  Workspace (opcional)
                </label>
                <input
                  type="text"
                  value={newAgentWorkspace}
                  onChange={(e) => setNewAgentWorkspace(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'all 0.2s'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#4ECDC4';
                    e.target.style.boxShadow = '0 0 0 3px rgba(78, 205, 196, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e0e0e0';
                    e.target.style.boxShadow = 'none';
                  }}
                  placeholder="/caminho/para/workspace"
                />
                <p style={{
                  fontSize: '12px',
                  color: '#666',
                  marginTop: '4px'
                }}>
                  Caminho absoluto para o workspace do agente
                </p>
              </div>
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              marginTop: '24px'
            }}>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{
                  padding: '10px 16px',
                  color: '#333',
                  backgroundColor: '#f8f9fa',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#e9ecef';
                  e.currentTarget.style.borderColor = '#ced4da';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f8f9fa';
                  e.currentTarget.style.borderColor = '#e0e0e0';
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateAgent}
                disabled={loading || !newAgentName.trim()}
                style={{
                  padding: '10px 16px',
                  backgroundColor: '#4ECDC4',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: loading || !newAgentName.trim() ? 'not-allowed' : 'pointer',
                  opacity: loading || !newAgentName.trim() ? 0.5 : 1,
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  if (!loading && newAgentName.trim()) {
                    e.currentTarget.style.backgroundColor = '#3dbcb4';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading && newAgentName.trim()) {
                    e.currentTarget.style.backgroundColor = '#4ECDC4';
                  }
                }}
              >
                {loading ? <FaSpinner style={{ animation: 'spin 1s linear infinite' }} /> : <FaPlus />}
                Criar Agente
              </button>
            </div>
          </div>
        </div>
      )}
      
      {showEditModal && selectedAgent && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50
        }}>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            width: '100%',
            maxWidth: '28rem',
            padding: '24px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: 600,
                color: '#333'
              }}>Editar Agente</h3>
              <button 
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedAgent(null);
                  setEditAgentName('');
                  setEditAgentEmoji('');
                  setEditAgentAvatar('');
                  setEditAgentModel('');
                  setEditAgentWorkspace('');
                }}
                style={{
                  color: '#999',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '4px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#666';
                  e.currentTarget.style.backgroundColor = '#f5f5f5';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#999';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <FaTimes />
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#333',
                  marginBottom: '8px'
                }}>
                  Nome do Agente *
                </label>
                <input
                  type="text"
                  value={editAgentName}
                  onChange={(e) => setEditAgentName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'all 0.2s'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#4ECDC4';
                    e.target.style.boxShadow = '0 0 0 3px rgba(78, 205, 196, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e0e0e0';
                    e.target.style.boxShadow = 'none';
                  }}
                  placeholder="Ex: MeuAgente"
                />
              </div>
              
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#333',
                  marginBottom: '8px'
                }}>
                  Emoji (opcional)
                </label>
                <input
                  type="text"
                  value={editAgentEmoji}
                  onChange={(e) => setEditAgentEmoji(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'all 0.2s'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#4ECDC4';
                    e.target.style.boxShadow = '0 0 0 3px rgba(78, 205, 196, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e0e0e0';
                    e.target.style.boxShadow = 'none';
                  }}
                  placeholder="Ex: 🤖"
                />
                <p style={{
                  fontSize: '12px',
                  color: '#666',
                  marginTop: '4px'
                }}>
                  Emoji para representar o agente
                </p>
              </div>
              
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#333',
                  marginBottom: '8px'
                }}>
                  Avatar URL (opcional)
                </label>
                <input
                  type="text"
                  value={editAgentAvatar}
                  onChange={(e) => setEditAgentAvatar(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'all 0.2s'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#4ECDC4';
                    e.target.style.boxShadow = '0 0 0 3px rgba(78, 205, 196, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e0e0e0';
                    e.target.style.boxShadow = 'none';
                  }}
                  placeholder="https://exemplo.com/avatar.jpg"
                />
                <p style={{
                  fontSize: '12px',
                  color: '#666',
                  marginTop: '4px'
                }}>
                  URL da imagem de avatar do agente
                </p>
              </div>
              
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#333',
                  marginBottom: '8px'
                }}>
                  Modelo (opcional)
                </label>
                <select
                  value={editAgentModel || ''}
                  onChange={(e) => setEditAgentModel(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px',
                    backgroundColor: '#fff'
                  }}
                >
                  <option value="">Selecione um modelo</option>
                  {models.length > 0 ? (
                    models.map((model, index) => (
                      <option key={index} value={model}>
                        {model}
                      </option>
                    ))
                  ) : (
                    <option value="">Carregando modelos...</option>
                  )}
                </select>
                <p style={{
                  fontSize: '12px',
                  color: '#666',
                  marginTop: '4px'
                }}>
                  Modelo de IA para o agente
                </p>
              </div>
              
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#333',
                  marginBottom: '8px'
                }}>
                  Workspace (opcional)
                </label>
                <input
                  type="text"
                  value={editAgentWorkspace}
                  onChange={(e) => setEditAgentWorkspace(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'all 0.2s'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#4ECDC4';
                    e.target.style.boxShadow = '0 0 0 3px rgba(78, 205, 196, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e0e0e0';
                    e.target.style.boxShadow = 'none';
                  }}
                  placeholder="/caminho/para/workspace"
                />
                <p style={{
                  fontSize: '12px',
                  color: '#666',
                  marginTop: '4px'
                }}>
                  Caminho absoluto para o workspace do agente
                </p>
              </div>
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              marginTop: '24px'
            }}>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedAgent(null);
                  setEditAgentName('');
                  setEditAgentEmoji('');
                  setEditAgentAvatar('');
                  setEditAgentModel('');
                  setEditAgentWorkspace('');
                }}
                style={{
                  padding: '10px 16px',
                  color: '#333',
                  backgroundColor: '#f8f9fa',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#e9ecef';
                  e.currentTarget.style.borderColor = '#ced4da';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f8f9fa';
                  e.currentTarget.style.borderColor = '#e0e0e0';
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleUpdateAgent}
                disabled={loading || !editAgentName.trim()}
                style={{
                  padding: '10px 16px',
                  backgroundColor: '#4ECDC4',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: loading || !editAgentName.trim() ? 'not-allowed' : 'pointer',
                  opacity: loading || !editAgentName.trim() ? 0.5 : 1,
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  if (!loading && editAgentName.trim()) {
                    e.currentTarget.style.backgroundColor = '#3dbcb4';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading && editAgentName.trim()) {
                    e.currentTarget.style.backgroundColor = '#4ECDC4';
                  }
                }}
              >
                {loading ? <FaSpinner style={{ animation: 'spin 1s linear infinite' }} /> : <FaCheck />}
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentManager;