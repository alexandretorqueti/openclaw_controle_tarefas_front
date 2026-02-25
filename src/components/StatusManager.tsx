import React, { useState, useEffect } from 'react';
import { FaTimes, FaPlus, FaEdit, FaTrash, FaSave, FaPalette, FaListOl, FaCheckCircle, FaBan, FaListAlt, FaRobot } from 'react-icons/fa';
import apiService from '../services/api';
import { Status } from '../types';

interface StatusManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate?: () => void;
}

const StatusManager: React.FC<StatusManagerProps> = ({ isOpen, onClose, onStatusUpdate }) => {
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    colorCode: '#4ECDC4',
    order: 0,
    isFinalState: false,
    visibleToAi: true
  });

  // Cores pré-definidas para facilitar a seleção
  const colorOptions = [
    { name: 'Teal', value: '#4ECDC4' },
    { name: 'Vermelho', value: '#FF6B6B' },
    { name: 'Verde', value: '#06D6A0' },
    { name: 'Amarelo', value: '#FFD166' },
    { name: 'Azul', value: '#118AB2' },
    { name: 'Roxo', value: '#9D4EDD' },
    { name: 'Rosa', value: '#EF476F' },
    { name: 'Cinza', value: '#6C757D' },
    { name: 'Preto', value: '#333333' },
    { name: 'Laranja', value: '#FF9F1C' }
  ];

  // Carregar status ao abrir o modal
  useEffect(() => {
    if (isOpen) {
      loadStatuses();
    }
  }, [isOpen]);

  const loadStatuses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getStatuses();
      setStatuses(response.statuses || []);
      
      // Definir ordem máxima + 1 para novo status
      const maxOrder = response.statuses.length > 0 
        ? Math.max(...response.statuses.map((s: any) => s.order || 0))
        : 0;
      
      setFormData(prev => ({ ...prev, order: maxOrder + 1 }));
      
    } catch (err) {
      console.error('Erro ao carregar status:', err);
      setError('Não foi possível carregar os status. Verifique a conexão com o servidor.');
      setStatuses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleColorSelect = (color: string) => {
    setFormData(prev => ({ ...prev, colorCode: color }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('O nome do status é obrigatório');
      return;
    }

    try {
      setError(null);
      
      const payload = {
        name: formData.name,
        color_code: formData.colorCode,
        order: formData.order,
        is_final_state: formData.isFinalState,
        visible_to_ai: formData.visibleToAi
      };

      if (editingId) {
        // Atualizar status existente
        await apiService.updateStatus(editingId, payload);
      } else {
        // Criar novo status
        await apiService.createStatus(payload);
      }
      
      // Recarregar lista
      await loadStatuses();
      
      // Limpar formulário
      resetForm();
      
      // Notificar componente pai
      if (onStatusUpdate) {
        onStatusUpdate();
      }
      
    } catch (err) {
      console.error('Erro ao salvar status:', err);
      setError('Erro ao salvar status. Verifique os dados e tente novamente.');
    }
  };

  const handleEdit = (status: Status) => {
    setFormData({
      name: status.name,
      colorCode: status.colorCode,
      order: status.order || 0,
      isFinalState: status.isFinalState,
      visibleToAi: status.visibleToAi ?? true
    });
    setEditingId(status.id);
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este status?')) {
      return;
    }

    try {
      await apiService.deleteStatus(id);
      await loadStatuses();
      
      if (onStatusUpdate) {
        onStatusUpdate();
      }
    } catch (err) {
      console.error('Erro ao excluir status:', err);
      setError('Erro ao excluir status. Verifique se não está sendo usado em tarefas.');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      colorCode: '#4ECDC4',
      order: statuses.length > 0 ? Math.max(...statuses.map(s => s.order || 0)) + 1 : 0,
      isFinalState: false,
      visibleToAi: true
    });
    setEditingId(null);
    setIsEditing(false);
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

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
      zIndex: 2000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '800px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        overflow: 'hidden'
      }}>
        {/* Cabeçalho */}
        <div style={{
          padding: '24px',
          backgroundColor: '#f8f9fa',
          borderBottom: '1px solid #e0e0e0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              backgroundColor: '#4ECDC4',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FaListAlt size={24} color="#fff" />
            </div>
            <div>
              <h2 style={{
                fontSize: '24px',
                fontWeight: 700,
                color: '#333',
                margin: 0
              }}>
                Gerenciar Status
              </h2>
              <p style={{
                fontSize: '14px',
                color: '#666',
                margin: '4px 0 0 0'
              }}>
                Configure os status disponíveis para as tarefas
              </p>
            </div>
          </div>
          
          <button
            onClick={handleClose}
            style={{
              width: '40px',
              height: '40px',
              backgroundColor: 'transparent',
              border: '1px solid #ddd',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f8f9fa';
              e.currentTarget.style.borderColor = '#FF6B6B';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.borderColor = '#ddd';
            }}
          >
            <FaTimes size={18} color="#666" />
          </button>
        </div>

        {/* Conteúdo */}
        <div style={{
          display: 'flex',
          flex: 1,
          overflow: 'hidden'
        }}>
          {/* Lista de status */}
          <div style={{
            flex: 1,
            padding: '24px',
            borderRight: '1px solid #e0e0e0',
            overflowY: 'auto'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: 600,
                color: '#333',
                margin: 0
              }}>
                Status Cadastrados
              </h3>
              <span style={{
                fontSize: '14px',
                color: '#666',
                backgroundColor: '#f8f9fa',
                padding: '4px 12px',
                borderRadius: '20px'
              }}>
                {statuses.length} status
              </span>
            </div>

            {loading ? (
              <div style={{
                padding: '40px',
                textAlign: 'center',
                color: '#666'
              }}>
                Carregando status...
              </div>
            ) : error ? (
              <div style={{
                padding: '20px',
                backgroundColor: '#FFE5E5',
                border: '1px solid #FF6B6B',
                borderRadius: '8px',
                color: '#FF6B6B',
                marginBottom: '20px'
              }}>
                {error}
                <button
                  onClick={loadStatuses}
                  style={{
                    marginTop: '10px',
                    padding: '8px 16px',
                    backgroundColor: '#FF6B6B',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'block'
                  }}
                >
                  Tentar Novamente
                </button>
              </div>
            ) : statuses.length === 0 ? (
              <div style={{
                padding: '40px',
                textAlign: 'center',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                color: '#666'
              }}>
                <FaListAlt size={48} color="#ddd" style={{ marginBottom: '16px' }} />
                <p style={{ margin: 0 }}>Nenhum status cadastrado</p>
                <p style={{ fontSize: '14px', marginTop: '8px' }}>
                  Use o formulário ao lado para criar o primeiro status
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {statuses
                  .sort((a, b) => (a.order || 0) - (b.order || 0))
                  .map(status => (
                    <div
                      key={status.id}
                      style={{
                        padding: '16px',
                        backgroundColor: '#fff',
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        transition: 'all 0.2s',
                        background: `linear-gradient(90deg, ${status.colorCode}10 0%, #fff 30%)`
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = status.colorCode;
                        e.currentTarget.style.boxShadow = `0 4px 12px ${status.colorCode}30`;
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#e0e0e0';
                        e.currentTarget.style.boxShadow = 'none';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <div style={{
                        width: '48px',
                        height: '48px',
                        backgroundColor: status.colorCode,
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontSize: '18px',
                        fontWeight: 'bold',
                        border: '2px solid #fff',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}>
                        {status.order}
                      </div>
                      
                      <div style={{ flex: 1 }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginBottom: '4px'
                        }}>
                          <span style={{
                            fontSize: '16px',
                            fontWeight: 600,
                            color: '#333'
                          }}>
                            {status.name}
                          </span>
                          {status.isFinalState && (
                            <span style={{
                              fontSize: '12px',
                              backgroundColor: '#06D6A0',
                              color: '#fff',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              <FaCheckCircle size={10} />
                              Final
                            </span>
                          )}
                          {status.visibleToAi && (
                            <span style={{
                              fontSize: '12px',
                              backgroundColor: '#4ECDC4',
                              color: '#fff',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              <FaRobot size={10} />
                              IA
                            </span>
                          )}
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color: '#666',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px'
                        }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <FaPalette size={10} />
                            {status.colorCode}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <FaListOl size={10} />
                            Ordem: {status.order}
                          </span>
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => handleEdit(status)}
                          style={{
                            padding: '8px 12px',
                            backgroundColor: '#E3F2FD',
                            color: '#1976D2',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '12px'
                          }}
                        >
                          <FaEdit size={12} />
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(status.id)}
                          style={{
                            padding: '8px 12px',
                            backgroundColor: '#FFE5E5',
                            color: '#FF6B6B',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '12px'
                          }}
                        >
                          <FaTrash size={12} />
                          Excluir
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Formulário */}
          <div style={{
            flex: 1,
            padding: '24px',
            backgroundColor: '#f8f9fa'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: 600,
              color: '#333',
              marginBottom: '20px'
            }}>
              {isEditing ? 'Editar Status' : 'Novo Status'}
            </h3>

            <form onSubmit={handleSubmit}>
              {/* Nome do Status */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#333',
                  marginBottom: '8px'
                }}>
                  Nome do Status *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Ex: Em Andamento, Concluído, Bloqueado"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: `1px solid ${error && !formData.name.trim() ? '#FF6B6B' : '#ddd'}`,
                    borderRadius: '8px',
                    fontSize: '16px',
                    boxSizing: 'border-box',
                    transition: 'all 0.2s'
                  }}
                  required
                />
              </div>

              {/* Cor do Status */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#333',
                  marginBottom: '12px'
                }}>
                  Cor do Status
                </label>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  marginBottom: '16px'
                }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    backgroundColor: formData.colorCode,
                    borderRadius: '8px',
                    border: '3px solid #fff',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }} />
                  
                  <div>
                    <div style={{
                      fontSize: '16px',
                      fontWeight: 600,
                      color: '#333',
                      marginBottom: '4px'
                    }}>
                      {formData.colorCode}
                    </div>
                    <input
                      type="text"
                      value={formData.colorCode}
                      onChange={(e) => handleInputChange('colorCode', e.target.value)}
                      style={{
                        width: '120px',
                        padding: '8px 12px',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontFamily: 'monospace'
                      }}
                      placeholder="#FFFFFF"
                    />
                  </div>
                </div>

                {/* Paleta de cores */}
                <div style={{ marginTop: '16px' }}>
                  <div style={{
                    fontSize: '12px',
                    color: '#666',
                    marginBottom: '8px'
                  }}>
                    Cores sugeridas:
                  </div>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(5, 1fr)',
                    gap: '8px'
                  }}>
                    {colorOptions.map(color => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => handleColorSelect(color.value)}
                        style={{
                          height: '40px',
                          backgroundColor: color.value,
                          border: formData.colorCode === color.value ? '3px solid #333' : '2px solid #fff',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                          transition: 'all 0.2s'
                        }}
                        title={color.name}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Ordem e Estado Final */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '20px',
                marginBottom: '20px'
              }}>
                {/* Ordem */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#333',
                    marginBottom: '8px'
                  }}>
                    Ordem *
                  </label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => handleInputChange('order', parseInt(e.target.value) || 0)}
                    min="0"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '16px',
                      boxSizing: 'border-box'
                    }}
                    required
                  />
                </div>

                {/* Estado Final */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#333',
                    marginBottom: '8px'
                  }}>
                    Estado Final
                  </label>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginTop: '8px'
                  }}>
                    <button
                      type="button"
                      onClick={() => handleInputChange('isFinalState', true)}
                      style={{
                        flex: 1,
                        padding: '12px',
                        backgroundColor: formData.isFinalState ? '#06D6A0' : '#f8f9fa',
                        color: formData.isFinalState ? '#fff' : '#333',
                        border: formData.isFinalState ? 'none' : '1px solid #ddd',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        transition: 'all 0.2s'
                      }}
                    >
                      <FaCheckCircle size={16} />
                      Sim
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInputChange('isFinalState', false)}
                      style={{
                        flex: 1,
                        padding: '12px',
                        backgroundColor: !formData.isFinalState ? '#FF6B6B' : '#f8f9fa',
                        color: !formData.isFinalState ? '#fff' : '#333',
                        border: !formData.isFinalState ? 'none' : '1px solid #ddd',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        transition: 'all 0.2s'
                      }}
                    >
                      <FaBan size={16} />
                      Não
                    </button>
                  </div>
                </div>
              </div>

              {/* Visível pela IA */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#333',
                  marginBottom: '8px'
                }}>
                  Visível pela IA
                </label>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginTop: '8px'
                }}>
                  <button
                    type="button"
                    onClick={() => handleInputChange('visibleToAi', true)}
                    style={{
                      flex: 1,
                      padding: '12px',
                      backgroundColor: formData.visibleToAi ? '#4ECDC4' : '#f8f9fa',
                      color: formData.visibleToAi ? '#fff' : '#333',
                      border: formData.visibleToAi ? 'none' : '1px solid #ddd',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'all 0.2s'
                    }}
                  >
                    <FaRobot size={16} />
                    Sim
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInputChange('visibleToAi', false)}
                    style={{
                      flex: 1,
                      padding: '12px',
                      backgroundColor: !formData.visibleToAi ? '#6C757D' : '#f8f9fa',
                      color: !formData.visibleToAi ? '#fff' : '#333',
                      border: !formData.visibleToAi ? 'none' : '1px solid #ddd',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'all 0.2s'
                    }}
                  >
                    <FaBan size={16} />
                    Não
                  </button>
                </div>
              </div>

              {/* Mensagem de erro */}
              {error && (
                <div style={{
                  padding: '12px 16px',
                  backgroundColor: '#FFE5E5',
                  border: '1px solid #FF6B6B',
                  borderRadius: '8px',
                  color: '#FF6B6B',
                  marginBottom: '20px',
                  fontSize: '14px'
                }}>
                  {error}
                </div>
              )}

              {/* Botões de ação */}
              <div style={{
                display: 'flex',
                gap: '12px',
                marginTop: '24px'
              }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '14px',
                    backgroundColor: '#4ECDC4',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3DB8AC'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4ECDC4'}
                >
                  <FaSave size={18} />
                  {isEditing ? 'Atualizar Status' : 'Criar Status'}
                </button>

                {isEditing && (
                  <button
                    type="button"
                    onClick={resetForm}
                    style={{
                      padding: '14px 24px',
                      backgroundColor: '#f8f9fa',
                      color: '#666',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      transition: 'all 0.2s'
                    }}
                  >
                    <FaTimes size={18} />
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusManager;
