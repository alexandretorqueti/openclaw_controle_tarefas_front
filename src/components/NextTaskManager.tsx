import React, { useState, useEffect } from 'react';
import { FaTasks, FaUser, FaCalendarAlt, FaFlag, FaProjectDiagram, FaSpinner, FaTimes, FaCheckCircle, FaArrowRight } from 'react-icons/fa';
import apiService from '../services/api';
import { User, Task } from '../types';

interface NextTaskManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

const NextTaskManager: React.FC<NextTaskManagerProps> = ({ isOpen, onClose }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedUserNickname, setSelectedUserNickname] = useState<string>('');
  const [nextTask, setNextTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingTask, setLoadingTask] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      
      // Selecionar o primeiro usuário por padrão se existir
      if (response.users && response.users.length > 0) {
        const firstUser = response.users[0];
        setSelectedUserId(firstUser.id);
        setSelectedUserNickname(firstUser.nickname || '');
        // Carregar a próxima tarefa do primeiro usuário
        loadNextTask(firstUser.nickname || '');
      }
      
    } catch (err) {
      console.error('Erro ao carregar usuários:', err);
      setError('Não foi possível carregar os usuários. Verifique a conexão com o servidor.');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const loadNextTask = async (nickname: string) => {
    if (!nickname) return;
    
    try {
      setLoadingTask(true);
      setError(null);
      
      const response = await apiService.getNextTaskByNickname(nickname);
      setNextTask(response.task || null);
      
    } catch (err: any) {
      console.error('Erro ao carregar próxima tarefa:', err);
      const errorMessage = err?.response?.data?.message || err?.message || 'Erro ao carregar próxima tarefa.';
      setError(errorMessage);
      setNextTask(null);
    } finally {
      setLoadingTask(false);
    }
  };

  const handleUserChange = (userId: string) => {
    const selectedUser = users.find(user => user.id === userId);
    if (selectedUser) {
      setSelectedUserId(userId);
      setSelectedUserNickname(selectedUser.nickname || '');
      loadNextTask(selectedUser.nickname || '');
    }
  };

  const handleClose = () => {
    setSelectedUserId('');
    setSelectedUserNickname('');
    setNextTask(null);
    setError(null);
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
              <FaTasks size={24} color="#fff" />
            </div>
            <div>
              <h2 style={{
                fontSize: '24px',
                fontWeight: 700,
                color: '#333',
                margin: 0
              }}>
                Próxima Tarefa do Usuário
              </h2>
              <p style={{
                fontSize: '14px',
                color: '#666',
                margin: '4px 0 0 0'
              }}>
                Consulte a próxima tarefa pendente de cada usuário
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
          padding: '24px',
          overflowY: 'auto',
          flex: 1
        }}>
          {/* Seletor de Usuário */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: 600,
              color: '#333',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <FaUser size={16} color="#4ECDC4" />
              Selecione um Usuário
            </h3>
            
            {loading ? (
              <div style={{
                padding: '20px',
                textAlign: 'center',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                color: '#666'
              }}>
                <FaSpinner size={24} className="spin" style={{ animation: 'spin 1s linear infinite', marginBottom: '12px' }} />
                <p>Carregando usuários...</p>
              </div>
            ) : error ? (
              <div style={{
                padding: '16px',
                backgroundColor: '#FFE5E5',
                border: '1px solid #FF6B6B',
                borderRadius: '8px',
                color: '#FF6B6B'
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
                    cursor: 'pointer'
                  }}
                >
                  Tentar Novamente
                </button>
              </div>
            ) : users.length === 0 ? (
              <div style={{
                padding: '20px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                textAlign: 'center',
                color: '#666'
              }}>
                <FaUser size={32} color="#ddd" style={{ marginBottom: '12px' }} />
                <p>Nenhum usuário cadastrado</p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '12px'
              }}>
                {users.map(user => (
                  <button
                    key={user.id}
                    onClick={() => handleUserChange(user.id)}
                    style={{
                      padding: '16px',
                      backgroundColor: selectedUserId === user.id ? '#4ECDC4' : '#fff',
                      color: selectedUserId === user.id ? '#fff' : '#333',
                      border: `1px solid ${selectedUserId === user.id ? '#4ECDC4' : '#ddd'}`,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}
                    onMouseEnter={(e) => {
                      if (selectedUserId !== user.id) {
                        e.currentTarget.style.backgroundColor = '#f8f9fa';
                        e.currentTarget.style.borderColor = '#4ECDC4';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedUserId !== user.id) {
                        e.currentTarget.style.backgroundColor = '#fff';
                        e.currentTarget.style.borderColor = '#ddd';
                      }
                    }}
                  >
                    <div style={{
                      width: '40px',
                      height: '40px',
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
                        fontSize: '14px',
                        fontWeight: 600,
                        marginBottom: '2px'
                      }}>
                        {user.name}
                      </div>
                      <div style={{
                        fontSize: '12px',
                        opacity: selectedUserId === user.id ? 0.9 : 0.7
                      }}>
                        {user.nickname || user.email.split('@')[0]}
                      </div>
                    </div>
                    {selectedUserId === user.id && (
                      <FaCheckCircle size={16} />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Detalhes da Próxima Tarefa */}
          <div>
            <h3 style={{
              fontSize: '18px',
              fontWeight: 600,
              color: '#333',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <FaArrowRight size={16} color="#4ECDC4" />
              Próxima Tarefa Pendente
              {selectedUserNickname && (
                <span style={{
                  fontSize: '14px',
                  fontWeight: 400,
                  color: '#666',
                  marginLeft: '8px'
                }}>
                  (Usuário: {selectedUserNickname})
                </span>
              )}
            </h3>
            
            {loadingTask ? (
              <div style={{
                padding: '40px',
                textAlign: 'center',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                color: '#666'
              }}>
                <FaSpinner size={32} className="spin" style={{ animation: 'spin 1s linear infinite', marginBottom: '16px' }} />
                <p>Buscando próxima tarefa...</p>
              </div>
            ) : !selectedUserId ? (
              <div style={{
                padding: '40px',
                textAlign: 'center',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                color: '#666'
              }}>
                <FaTasks size={48} color="#ddd" style={{ marginBottom: '16px' }} />
                <p>Selecione um usuário para ver sua próxima tarefa</p>
              </div>
            ) : !nextTask ? (
              <div style={{
                padding: '40px',
                textAlign: 'center',
                backgroundColor: '#E8F5E9',
                border: '1px solid #C8E6C9',
                borderRadius: '8px',
                color: '#2E7D32'
              }}>
                <FaCheckCircle size={48} style={{ marginBottom: '16px' }} />
                <h4 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>
                  🎉 Nenhuma Tarefa Pendente!
                </h4>
                <p style={{ fontSize: '14px', marginBottom: '0' }}>
                  Este usuário não tem tarefas pendentes com status habilitado para IA.
                </p>
              </div>
            ) : (
              <div style={{
                backgroundColor: '#fff',
                border: '1px solid #e0e0e0',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
              }}>
                {/* Cabeçalho da Tarefa */}
                <div style={{
                  padding: '24px',
                  backgroundColor: '#4ECDC4',
                  color: '#fff'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '12px'
                  }}>
                    <h4 style={{
                      fontSize: '20px',
                      fontWeight: 700,
                      margin: 0,
                      flex: 1
                    }}>
                      {nextTask.title}
                    </h4>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      padding: '4px 12px',
                      borderRadius: '20px'
                    }}>
                      <FaFlag size={12} />
                      <span style={{ fontSize: '12px', fontWeight: 600 }}>
                        {nextTask.priority?.name || 'Sem prioridade'}
                      </span>
                    </div>
                  </div>
                  
                  {nextTask.description && (
                    <p style={{
                      fontSize: '14px',
                      opacity: 0.9,
                      margin: 0,
                      lineHeight: 1.5
                    }}>
                      {nextTask.description}
                    </p>
                  )}
                </div>

                {/* Detalhes da Tarefa */}
                <div style={{ padding: '24px' }}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '20px',
                    marginBottom: '24px'
                  }}>
                    {/* Status */}
                    <div>
                      <div style={{
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#666',
                        marginBottom: '8px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Status
                      </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <div style={{
                          width: '12px',
                          height: '12px',
                          backgroundColor: nextTask.status?.color || '#4ECDC4',
                          borderRadius: '50%'
                        }} />
                        <span style={{
                          fontSize: '16px',
                          fontWeight: 600,
                          color: '#333'
                        }}>
                          {nextTask.status?.name || 'Sem status'}
                        </span>
                      </div>
                    </div>

                    {/* Projeto */}
                    <div>
                      <div style={{
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#666',
                        marginBottom: '8px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Projeto
                      </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <FaProjectDiagram size={16} color="#666" />
                        <span style={{
                          fontSize: '16px',
                          fontWeight: 600,
                          color: '#333'
                        }}>
                          {nextTask.project?.name || 'Sem projeto'}
                        </span>
                      </div>
                    </div>

                    {/* Prazo */}
                    <div>
                      <div style={{
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#666',
                        marginBottom: '8px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Prazo
                      </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <FaCalendarAlt size={16} color="#666" />
                        <span style={{
                          fontSize: '16px',
                          fontWeight: 600,
                          color: '#333'
                        }}>
                          {nextTask.deadline ? new Date(nextTask.deadline).toLocaleDateString('pt-BR') : 'Sem prazo'}
                        </span>
                      </div>
                    </div>

                    {/* Prioridade */}
                    <div>
                      <div style={{
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#666',
                        marginBottom: '8px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Prioridade
                      </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <FaFlag size={16} color={nextTask.priority?.color || '#666'} />
                        <span style={{
                          fontSize: '16px',
                          fontWeight: 600,
                          color: nextTask.priority?.color || '#333'
                        }}>
                          {nextTask.priority?.name || 'Sem prioridade'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Regras do Projeto */}
                  {nextTask.project?.regras && (
                    <div style={{
                      backgroundColor: '#FFF3E0',
                      border: '1px solid #FFB74D',
                      padding: '16px',
                      borderRadius: '8px',
                      marginTop: '20px'
                    }}>
                      <h5 style={{
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#F57C00',
                        marginBottom: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        📜 Regras do Projeto
                      </h5>
                      <div style={{
                        fontSize: '13px',
                        color: '#666',
                        lineHeight: 1.6,
                        whiteSpace: 'pre-wrap',
                        backgroundColor: '#FFF9E6',
                        padding: '12px',
                        borderRadius: '6px',
                        border: '1px solid #FFE0B2'
                      }}>
                        {nextTask.project.regras}
                      </div>
                    </div>
                  )}

                  {/* Informações Adicionais */}
                  <div style={{
                    backgroundColor: '#f8f9fa',
                    padding: '16px',
                    borderRadius: '8px',
                    marginTop: '20px'
                  }}>
                    <h5 style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#333',
                      marginBottom: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      📋 Informações da Tarefa
                    </h5>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                      gap: '12px',
                      fontSize: '13px',
                      color: '#666'
                    }}>
                      <div>
                        <strong>ID:</strong> {nextTask.id.substring(0, 8)}...
                      </div>
                      <div>
                        <strong>Criada em:</strong> {nextTask.createdAt ? new Date(nextTask.createdAt).toLocaleDateString('pt-BR') : 'N/A'}
                      </div>
                      <div>
                        <strong>Atualizada em:</strong> {nextTask.updatedAt ? new Date(nextTask.updatedAt).toLocaleDateString('pt-BR') : 'N/A'}
                      </div>
                      <div>
                        <strong>Concluída:</strong> {nextTask.isCompleted ? '✅ Sim' : '❌ Não'}
                      </div>
                      {nextTask.project?.regras && (
                        <div>
                          <strong>Projeto tem regras:</strong> ✅ Sim
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Botão de Ação */}
                  <div style={{
                    marginTop: '24px',
                    textAlign: 'center'
                  }}>
                    <button
                      onClick={() => {
                        // Aqui você pode adicionar ação para marcar a tarefa como concluída
                        // ou navegar para a tarefa
                        alert(`Ação para a tarefa: ${nextTask.title}`);
                      }}
                      style={{
                        padding: '12px 32px',
                        backgroundColor: '#4ECDC4',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '10px',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3DB8AC'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4ECDC4'}
                    >
                      <FaCheckCircle size={18} />
                      Marcar como Concluída
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Rodapé */}
        <div style={{
          padding: '16px 24px',
          backgroundColor: '#f8f9fa',
          borderTop: '1px solid #e0e0e0',
          fontSize: '12px',
          color: '#666',
          textAlign: 'center'
        }}>
          <p style={{ margin: 0 }}>
            Endpoint testado: <code>GET /api/users/nickname/:nickname/next-task</code>
          </p>
          <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#999' }}>
            Filtra tarefas pendentes com status habilitado para IA, ordenadas por prioridade e data
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default NextTaskManager;