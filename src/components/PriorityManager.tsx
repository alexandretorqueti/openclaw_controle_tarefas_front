import React, { useState, useEffect } from 'react';
import { FaTimes, FaPlus, FaEdit, FaTrash, FaSave, FaFlag, FaSortNumericDown, FaExclamationTriangle } from 'react-icons/fa';
import apiService from '../services/api';
import { Priority } from '../types';

interface PriorityManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onPriorityUpdate?: () => void;
}

const PriorityManager: React.FC<PriorityManagerProps> = ({ isOpen, onClose, onPriorityUpdate }) => {
  const [priorities, setPriorities] = useState<Priority[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    weight: 1
  });

  // Carregar prioridades ao abrir o modal
  useEffect(() => {
    if (isOpen) {
      loadPriorities();
    }
  }, [isOpen]);

  const loadPriorities = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getPriorities();
      setPriorities(response.priorities || []);
      
      // Definir peso máximo + 1 para nova prioridade
      const maxWeight = response.priorities.length > 0 
        ? Math.max(...response.priorities.map((p: any) => p.weight || 1))
        : 0;
      
      setFormData(prev => ({ ...prev, weight: maxWeight + 1 }));
      
    } catch (err) {
      console.error('Erro ao carregar prioridades:', err);
      setError('Não foi possível carregar as prioridades. Verifique a conexão com o servidor.');
      setPriorities([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('O nome da prioridade é obrigatório');
      return;
    }

    if (formData.weight < 1) {
      setError('O peso deve ser maior que 0');
      return;
    }

    try {
      setError(null);
      
      if (editingId) {
        // Atualizar prioridade existente
        await apiService.updatePriority(editingId, formData);
      } else {
        // Criar nova prioridade
        await apiService.createPriority(formData);
      }
      
      // Recarregar lista
      await loadPriorities();
      
      // Limpar formulário
      resetForm();
      
      // Notificar componente pai
      if (onPriorityUpdate) {
        onPriorityUpdate();
      }
      
    } catch (err) {
      console.error('Erro ao salvar prioridade:', err);
      setError('Erro ao salvar prioridade. Verifique os dados e tente novamente.');
    }
  };

  const handleEdit = (priority: Priority) => {
    setFormData({
      name: priority.name,
      weight: priority.weight
    });
    setEditingId(priority.id);
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta prioridade?')) {
      return;
    }

    try {
      await apiService.deletePriority(id);
      await loadPriorities();
      
      if (onPriorityUpdate) {
        onPriorityUpdate();
      }
    } catch (err) {
      console.error('Erro ao excluir prioridade:', err);
      setError('Erro ao excluir prioridade. Verifique se não está sendo usada em tarefas.');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      weight: priorities.length > 0 ? Math.max(...priorities.map(p => p.weight || 1)) + 1 : 1
    });
    setEditingId(null);
    setIsEditing(false);
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Função para obter cor baseada no peso
  const getPriorityColor = (weight: number) => {
    if (weight >= 6) return '#FF6B6B'; // Crítica/Urgente - Vermelho
    if (weight >= 4) return '#FF9F1C'; // Alta/Muito Alta - Laranja
    if (weight >= 3) return '#FFD166'; // Média - Amarelo
    if (weight >= 2) return '#4ECDC4'; // Baixa - Teal
    return '#06D6A0'; // Muito Baixa - Verde
  };

  // Função para obter ícone baseado no peso
  const getPriorityIcon = (weight: number) => {
    if (weight >= 6) return <FaExclamationTriangle size={16} />;
    if (weight >= 4) return <FaFlag size={16} />;
    return <FaFlag size={16} />;
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
              backgroundColor: '#FF9F1C',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FaFlag size={24} color="#fff" />
            </div>
            <div>
              <h2 style={{
                fontSize: '24px',
                fontWeight: 700,
                color: '#333',
                margin: 0
              }}>
                Gerenciar Prioridades
              </h2>
              <p style={{
                fontSize: '14px',
                color: '#666',
                margin: '4px 0 0 0'
              }}>
                Configure os níveis de prioridade das tarefas
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
          {/* Lista de prioridades */}
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
                Prioridades Cadastradas
              </h3>
              <span style={{
                fontSize: '14px',
                color: '#666',
                backgroundColor: '#f8f9fa',
                padding: '4px 12px',
                borderRadius: '20px'
              }}>
                {priorities.length} prioridades
              </span>
            </div>

            {loading ? (
              <div style={{
                padding: '40px',
                textAlign: 'center',
                color: '#666'
              }}>
                Carregando prioridades...
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
                  onClick={loadPriorities}
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
            ) : priorities.length === 0 ? (
              <div style={{
                padding: '40px',
                textAlign: 'center',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                color: '#666'
              }}>
                <FaFlag size={48} color="#ddd" style={{ marginBottom: '16px' }} />
                <p style={{ margin: 0 }}>Nenhuma prioridade cadastrada</p>
                <p style={{ fontSize: '14px', marginTop: '8px' }}>
                  Use o formulário ao lado para criar a primeira prioridade
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {priorities
                  .sort((a, b) => (b.weight || 1) - (a.weight || 1))
                  .map(priority => {
                    const color = getPriorityColor(priority.weight);
                    const icon = getPriorityIcon(priority.weight);
                    
                    return (
                      <div
                        key={priority.id}
                        style={{
                          padding: '16px',
                          backgroundColor: '#fff',
                          border: `1px solid ${color}20`,
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '16px',
                          transition: 'all 0.2s',
                          background: `linear-gradient(90deg, ${color}10 0%, #fff 30%)`
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = color;
                          e.currentTarget.style.boxShadow = `0 4px 12px ${color}30`;
                          e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = `${color}20`;
                          e.currentTarget.style.boxShadow = 'none';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        <div style={{
                          width: '48px',
                          height: '48px',
                          backgroundColor: color,
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          fontSize: '20px',
                          fontWeight: 'bold'
                        }}>
                          {priority.weight}
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
                              {priority.name}
                            </span>
                            <span style={{
                              fontSize: '12px',
                              backgroundColor: color,
                              color: '#fff',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              {icon}
                              Peso: {priority.weight}
                            </span>
                          </div>
                          <div style={{
                            fontSize: '12px',
                            color: '#666'
                          }}>
                            {priority.weight >= 6 && 'Prioridade máxima - ação imediata necessária'}
                            {priority.weight === 5 && 'Prioridade muito alta - atenção urgente'}
                            {priority.weight === 4 && 'Prioridade alta - importante'}
                            {priority.weight === 3 && 'Prioridade média - atenção normal'}
                            {priority.weight === 2 && 'Prioridade baixa - quando possível'}
                            {priority.weight === 1 && 'Prioridade muito baixa - sem urgência'}
                          </div>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => handleEdit(priority)}
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
                            onClick={() => handleDelete(priority.id)}
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
                    );
                  })}
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
              {isEditing ? 'Editar Prioridade' : 'Nova Prioridade'}
            </h3>

            <form onSubmit={handleSubmit}>
              {/* Nome da Prioridade */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#333',
                  marginBottom: '8px'
                }}>
                  Nome da Prioridade *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Ex: Crítica, Alta, Média, Baixa"
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

              {/* Peso da Prioridade */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#333',
                  marginBottom: '8px'
                }}>
                  Peso (1-10) *
                </label>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px'
                }}>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={formData.weight}
                    onChange={(e) => handleInputChange('weight', parseInt(e.target.value))}
                    style={{
                      flex: 1,
                      height: '8px',
                      borderRadius: '4px',
                      backgroundColor: '#ddd',
                      outline: 'none'
                    }}
                  />
                  <div style={{
                    width: '60px',
                    height: '60px',
                    backgroundColor: getPriorityColor(formData.weight),
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: '24px',
                    fontWeight: 'bold'
                  }}>
                    {formData.weight}
                  </div>
                </div>
                
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: '8px',
                  fontSize: '12px',
                  color: '#666'
                }}>
                  <span>Muito Baixa (1)</span>
                  <span>Média (5)</span>
                  <span>Crítica (10)</span>
                </div>
                
                <div style={{
                  marginTop: '12px',
                  fontSize: '12px',
                  color: '#666'
                }}>
                  <strong>Significado dos pesos:</strong>
                  <ul style={{ margin: '8px 0 0 20px', padding: 0 }}>
                    <li>1-2: Prioridade muito baixa/baixa</li>
                    <li>3-4: Prioridade média</li>
                    <li>5-6: Prioridade alta</li>
                    <li>7-8: Prioridade muito alta</li>
                    <li>9-10: Prioridade crítica/urgente</li>
                  </ul>
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
                    backgroundColor: '#FF9F1C',
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
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E68A00'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FF9F1C'}
                >
                  <FaSave size={18} />
                  {isEditing ? 'Atualizar Prioridade' : 'Criar Prioridade'}
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
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#e9ecef';
                      e.currentTarget.style.borderColor = '#666';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#f8f9fa';
                      e.currentTarget.style.borderColor = '#ddd';
                    }}
                  >
                    <FaTimes size={18} />
                    Cancelar
                  </button>
                )}
              </div>
            </form>

            {/* Informações */}
            <div style={{
              marginTop: '32px',
              padding: '16px',
              backgroundColor: '#fff',
              borderRadius: '8px',
              border: '1px solid #e0e0e0'
            }}>
              <h4 style={{
                fontSize: '14px',
                fontWeight: 600,
                color: '#333',
                marginBottom: '8px'
              }}>
                💡 Dicas sobre Prioridades
              </h4>
              <ul style={{
                fontSize: '12px',
                color: '#666',
                margin: 0,
                paddingLeft: '20px',
                lineHeight: 1.6
              }}>
                <li>Use pesos diferentes para cada nível de prioridade</li>
                <li>Maior peso = maior prioridade</li>
                <li>Mantenha uma escala consistente (ex: 1-10)</li>
                <li>Evite muitos níveis (3-5 são suficientes para a maioria dos casos)</li>
                <li>Prioridades críticas devem ter peso 9-10</li>
                <li>Evite excluir prioridades em uso por tarefas</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriorityManager;