import React, { useState, useEffect } from 'react';
import { FaTimes, FaPlus, FaEdit, FaTrash, FaSave, FaUser, FaEnvelope, FaImage, FaUserTag, FaCalendarAlt, FaKey } from 'react-icons/fa';
import apiService from '../services/api';
import { User } from '../types';

interface UserManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onUserUpdate?: () => void;
}

const UserManager: React.FC<UserManagerProps> = ({ isOpen, onClose, onUserUpdate }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    nickname: '',
    avatarUrl: '',
    role: 'Viewer' as 'Admin' | 'Viewer' | 'Editor'
  });

  // Opções de role
  const roleOptions = [
    { value: 'Admin', label: 'Administrador', description: 'Acesso total ao sistema' },
    { value: 'Editor', label: 'Editor', description: 'Pode criar e editar tarefas' },
    { value: 'Viewer', label: 'Visualizador', description: 'Somente leitura' }
  ];

  // Carregar usuários ao abrir o modal
  useEffect(() => {
    if (isOpen) {
      loadUsers();
    }
  }, [isOpen]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getUsers();
      setUsers(response.users || []);
      
    } catch (err) {
      console.error('Erro ao carregar usuários:', err);
      setError('Não foi possível carregar os usuários. Verifique a conexão com o servidor.');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRoleChange = (role: 'Admin' | 'Viewer' | 'Editor') => {
    setFormData(prev => ({ ...prev, role }));
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError('O nome do usuário é obrigatório');
      return false;
    }
    if (!formData.email.trim()) {
      setError('O email do usuário é obrigatório');
      return false;
    }
    // Email básico validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Por favor, insira um email válido');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setError(null);
      
      if (editingId) {
        // Atualizar usuário existente
        await apiService.updateUser(editingId, formData);
      } else {
        // Criar novo usuário
        await apiService.createUser(formData);
      }
      
      // Recarregar lista
      await loadUsers();
      
      // Limpar formulário
      resetForm();
      
      // Notificar componente pai
      if (onUserUpdate) {
        onUserUpdate();
      }
      
    } catch (err: any) {
      console.error('Erro ao salvar usuário:', err);
      const errorMessage = err?.response?.data?.message || err?.message || 'Erro ao salvar usuário. Verifique os dados e tente novamente.';
      setError(errorMessage);
    }
  };

  const handleEdit = (user: User) => {
    setFormData({
      name: user.name,
      email: user.email,
      nickname: user.nickname || '',
      avatarUrl: user.avatarUrl || '',
      role: user.role
    });
    setEditingId(user.id);
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este usuário?\nEsta ação não poderá ser desfeita.')) {
      return;
    }

    try {
      await apiService.deleteUser(id);
      await loadUsers();
      
      if (onUserUpdate) {
        onUserUpdate();
      }
    } catch (err: any) {
      console.error('Erro ao excluir usuário:', err);
      const errorMessage = err?.response?.data?.message || err?.message || 'Erro ao excluir usuário. Verifique se o usuário não está associado a projetos ou tarefas.';
      setError(errorMessage);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      avatarUrl: '',
      role: 'Viewer'
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
        maxWidth: '1000px',
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
              backgroundColor: '#9D4EDD',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FaUser size={24} color="#fff" />
            </div>
            <div>
              <h2 style={{
                fontSize: '24px',
                fontWeight: 700,
                color: '#333',
                margin: 0
              }}>
                Gerenciar Usuários
              </h2>
              <p style={{
                fontSize: '14px',
                color: '#666',
                margin: '4px 0 0 0'
              }}>
                Cadastre e gerencie os usuários do sistema
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
          {/* Lista de usuários */}
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
                Usuários Cadastrados
              </h3>
              <span style={{
                fontSize: '14px',
                color: '#666',
                backgroundColor: '#f8f9fa',
                padding: '4px 12px',
                borderRadius: '20px'
              }}>
                {users.length} usuários
              </span>
            </div>

            {loading ? (
              <div style={{
                padding: '40px',
                textAlign: 'center',
                color: '#666'
              }}>
                Carregando usuários...
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
                  onClick={loadUsers}
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
            ) : users.length === 0 ? (
              <div style={{
                padding: '40px',
                textAlign: 'center',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                color: '#666'
              }}>
                <FaUser size={48} color="#ddd" style={{ marginBottom: '16px' }} />
                <p style={{ margin: 0 }}>Nenhum usuário cadastrado</p>
                <p style={{ fontSize: '14px', marginTop: '8px' }}>
                  Use o formulário ao lado para criar o primeiro usuário
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {users.map(user => (
                  <div
                    key={user.id}
                    style={{
                      padding: '16px',
                      backgroundColor: '#fff',
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#9D4EDD';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(157, 78, 221, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#e0e0e0';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      backgroundColor: '#e3f2fd',
                      flexShrink: 0
                    }}>
                      <img 
                        src={user.avatarUrl || 'https://i.pravatar.cc/150?img=1'} 
                        alt={user.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
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
                          {user.name}
                        </span>
                        <span style={{
                          fontSize: '12px',
                          backgroundColor: user.role === 'Admin' ? '#9D4EDD' : 
                                         user.role === 'Editor' ? '#06D6A0' : '#118AB2',
                          color: '#fff',
                          padding: '2px 8px',
                          borderRadius: '4px'
                        }}>
                          {user.role === 'Admin' ? 'Administrador' : 
                           user.role === 'Editor' ? 'Editor' : 'Visualizador'}
                        </span>
                      </div>
                      <div style={{
                        fontSize: '14px',
                        color: '#666',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                        marginBottom: '4px'
                      }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <FaEnvelope size={12} />
                          {user.email}
                        </span>
                        {user.nickname && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <FaUserTag size={10} />
                            Apelido: {user.nickname}
                          </span>
                        )}
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: '#999',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <FaCalendarAlt size={10} />
                          Criado em: {user.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-BR') : 'N/A'}
                        </span>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleEdit(user)}
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
                        onClick={() => handleDelete(user.id)}
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
            backgroundColor: '#f8f9fa',
            overflowY: 'auto'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: 600,
              color: '#333',
              marginBottom: '20px'
            }}>
              {isEditing ? 'Editar Usuário' : 'Novo Usuário'}
            </h3>
            {isEditing && editingId && (
              <div style={{
                fontSize: '14px',
                color: '#666',
                marginBottom: '20px',
                padding: '12px 16px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                border: '1px solid #e0e0e0',
                fontFamily: 'monospace',
                wordBreak: 'break-all'
              }}>
                <strong>ID do usuário:</strong> {editingId}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Nome do Usuário */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#333',
                  marginBottom: '8px'
                }}>
                  Nome Completo *
                </label>
                <div style={{ position: 'relative' }}>
                  <FaUser size={16} style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#999'
                  }} />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Ex: João da Silva"
                    style={{
                      width: '100%',
                      padding: '12px 16px 12px 40px',
                      border: `1px solid ${error && !formData.name.trim() ? '#FF6B6B' : '#ddd'}`,
                      borderRadius: '8px',
                      fontSize: '16px',
                      boxSizing: 'border-box',
                      transition: 'all 0.2s'
                    }}
                    required
                  />
                </div>
              </div>

              {/* Email do Usuário */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#333',
                  marginBottom: '8px'
                }}>
                  Email *
                </label>
                <div style={{ position: 'relative' }}>
                  <FaEnvelope size={16} style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#999'
                  }} />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Ex: joao@empresa.com"
                    style={{
                      width: '100%',
                      padding: '12px 16px 12px 40px',
                      border: `1px solid ${error && !formData.email.trim() ? '#FF6B6B' : '#ddd'}`,
                      borderRadius: '8px',
                      fontSize: '16px',
                      boxSizing: 'border-box',
                      transition: 'all 0.2s'
                    }}
                    required
                  />
                </div>
              </div>

              {/* Nickname do Usuário (Opcional) */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#333',
                  marginBottom: '8px'
                }}>
                  Apelido (Opcional)
                </label>
                <div style={{ position: 'relative' }}>
                  <FaUserTag size={16} style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#999'
                  }} />
                  <input
                    type="text"
                    value={formData.nickname}
                    onChange={(e) => handleInputChange('nickname', e.target.value)}
                    placeholder="Ex: joaosilva (será gerado a partir do email se não informado)"
                    style={{
                      width: '100%',
                      padding: '12px 16px 12px 40px',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '16px',
                      boxSizing: 'border-box',
                      transition: 'all 0.2s'
                    }}
                  />
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#666',
                  marginTop: '4px'
                }}>
                  Deixe em branco para gerar automaticamente a partir do email
                </div>
              </div>

              {/* URL do Avatar */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#333',
                  marginBottom: '8px'
                }}>
                  URL do Avatar (Opcional)
                </label>
                <div style={{ position: 'relative' }}>
                  <FaImage size={16} style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#999'
                  }} />
                  <input
                    type="text"
                    value={formData.avatarUrl}
                    onChange={(e) => handleInputChange('avatarUrl', e.target.value)}
                    placeholder="Ex: https://example.com/avatar.jpg"
                    style={{
                      width: '100%',
                      padding: '12px 16px 12px 40px',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '16px',
                      boxSizing: 'border-box',
                      transition: 'all 0.2s'
                    }}
                  />
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#666',
                  marginTop: '4px'
                }}>
                  Deixe em branco para usar avatar padrão
                </div>
              </div>

              {/* Role do Usuário */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#333',
                  marginBottom: '12px'
                }}>
                  Permissão de Acesso
                </label>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {roleOptions.map(option => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleRoleChange(option.value as 'Admin' | 'Viewer' | 'Editor')}
                      style={{
                        padding: '16px',
                        backgroundColor: formData.role === option.value ? 
                          (option.value === 'Admin' ? '#9D4EDD' : 
                           option.value === 'Editor' ? '#06D6A0' : '#118AB2') : '#fff',
                        color: formData.role === option.value ? '#fff' : '#333',
                        border: `1px solid ${formData.role === option.value ? 'transparent' : '#ddd'}`,
                        borderRadius: '8px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}
                      onMouseEnter={(e) => {
                        if (formData.role !== option.value) {
                          e.currentTarget.style.backgroundColor = '#f8f9fa';
                          e.currentTarget.style.borderColor = '#9D4EDD';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (formData.role !== option.value) {
                          e.currentTarget.style.backgroundColor = '#fff';
                          e.currentTarget.style.borderColor = '#ddd';
                        }
                      }}
                    >
                      <div style={{
                        width: '40px',
                        height: '40px',
                        backgroundColor: formData.role === option.value ? '#fff' : '#f8f9fa',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <FaUserTag size={18} color={formData.role === option.value ? 
                          (option.value === 'Admin' ? '#9D4EDD' : 
                           option.value === 'Editor' ? '#06D6A0' : '#118AB2') : '#666'} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontSize: '16px',
                          fontWeight: 600,
                          marginBottom: '2px'
                        }}>
                          {option.label}
                        </div>
                        <div style={{
                          fontSize: '12px',
                          opacity: formData.role === option.value ? 0.9 : 0.7
                        }}>
                          {option.description}
                        </div>
                      </div>
                      {formData.role === option.value && (
                        <div style={{
                          width: '20px',
                          height: '20px',
                          backgroundColor: '#fff',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          <div style={{
                            width: '10px',
                            height: '10px',
                            backgroundColor: option.value === 'Admin' ? '#9D4EDD' : 
                                           option.value === 'Editor' ? '#06D6A0' : '#118AB2',
                            borderRadius: '50%'
                          }} />
                        </div>
                      )}
                    </button>
                  ))}
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
                    backgroundColor: '#9D4EDD',
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
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#8A3EC8'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#9D4EDD'}
                >
                  <FaSave size={18} />
                  {isEditing ? 'Atualizar Usuário' : 'Criar Usuário'}
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
                💡 Dicas sobre Usuários
              </h4>
              <ul style={{
                fontSize: '12px',
                color: '#666',
                margin: 0,
                paddingLeft: '20px',
                lineHeight: 1.6
              }}>
                <li>Administradores têm acesso total ao sistema</li>
                <li>Editores podem criar e editar tarefas</li>
                <li>Visualizadores podem apenas visualizar tarefas</li>
                <li>Use avatares para facilitar a identificação</li>
                <li>Evite excluir usuários associados a projetos ou tarefas</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManager;