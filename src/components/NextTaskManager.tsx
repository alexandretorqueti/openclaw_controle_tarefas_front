// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { FaTasks, FaUser, FaCalendarAlt, FaFlag, FaProjectDiagram, FaSpinner, FaCheckCircle, FaArrowRight, FaHome, FaSync, FaExclamationTriangle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import { User, Task } from '../types';

const NextTaskManager: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedUserNickname, setSelectedUserNickname] = useState<string>('');
  const [nextTask, setNextTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingTask, setLoadingTask] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getUsers();
      setUsers(response.users || []);
      if (response.users && response.users.length > 0) {
        const firstUser = response.users[0];
        setSelectedUserId(firstUser.id);
        setSelectedUserNickname(firstUser.nickname || '');
        loadNextTask(firstUser.nickname || '');
      }
    } catch (err) {
      console.error('Erro ao carregar usuários:', err);
      setError('Não foi possível carregar os usuários.');
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
    const selectedUser = users?.find(user => user.id === userId);
    if (selectedUser) {
      setSelectedUserId(userId);
      setSelectedUserNickname(selectedUser.nickname || '');
      loadNextTask(selectedUser.nickname || '');
    }
  };

  const handleRefresh = () => {
    if (selectedUserNickname) {
      loadNextTask(selectedUserNickname);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', backgroundColor: 'var(--accent-color)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FaTasks size={24} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Próximas Tarefas</h1>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>Visualize e gerencie a próxima tarefa de cada usuário</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={handleRefresh} style={{ padding: '10px 20px', backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }} disabled={loadingTask}>
            <FaSync size={14} className={loadingTask ? 'spin' : ''} />
            {loadingTask ? 'Carregando...' : 'Atualizar'}
          </button>
          <button onClick={() => navigate('/')} style={{ padding: '10px 20px', backgroundColor: 'var(--accent-color)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaHome size={14} /> Voltar ao Dashboard
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px', marginTop: '24px' }}>
        <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', padding: '24px', border: '1px solid var(--border-color)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 20px 0', color: 'var(--text-primary)' }}><FaUser style={{ marginRight: '8px' }} />Selecionar Usuário</h2>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}><FaSpinner size={24} style={{ animation: 'spin 1s linear infinite', color: 'var(--accent-color)' }} /></div>
          ) : users.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)' }}><FaUser size={48} style={{ marginBottom: '16px', opacity: 0.5 }} /><p style={{ margin: 0 }}>Nenhum usuário encontrado</p></div>
          ) : (
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {users.map(user => (
                <div key={user.id} onClick={() => handleUserChange(user.id)} style={{ padding: '16px', backgroundColor: selectedUserId === user.id ? 'var(--bg-input)' : 'transparent', border: `1px solid ${selectedUserId === user.id ? 'var(--accent-color)' : 'var(--border-color)'}`, borderRadius: '8px', marginBottom: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: selectedUserId === user.id ? 'var(--accent-color)' : 'var(--text-primary)', backgroundImage: user.avatarUrl ? `url(${user.avatarUrl})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
                    {!user.avatarUrl && (user.name?.charAt(0) || user.nickname?.charAt(0) || 'U')}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '16px', fontWeight: 600, color: selectedUserId === user.id ? 'var(--accent-color)' : 'var(--text-primary)' }}>{user.name || user.nickname}</div>
                    <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>{user.email}</div>
                    {user.nickname && <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>@{user.nickname}</div>}
                  </div>
                  {selectedUserId === user.id && <FaCheckCircle size={16} color="var(--accent-color)" />}
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', padding: '24px', border: '1px solid var(--border-color)', minHeight: '400px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaTasks /> Próxima Tarefa
              {selectedUserNickname && <span style={{ fontSize: '14px', fontWeight: 400, color: 'var(--text-secondary)', marginLeft: '8px' }}>para @{selectedUserNickname}</span>}
            </h2>
            {loadingTask && <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FaSpinner size={14} style={{ animation: 'spin 1s linear infinite' }} /><span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Buscando tarefa...</span></div>}
          </div>

          {error ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--danger-color)' }}>
              <FaExclamationTriangle size={48} style={{ marginBottom: '16px', opacity: 0.7 }} />
              <h3 style={{ margin: '0 0 8px 0' }}>Erro</h3>
              <p style={{ margin: 0, color: 'var(--text-secondary)' }}>{error}</p>
            </div>
          ) : !nextTask ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <FaTasks size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
              <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-primary)' }}>Nenhuma tarefa encontrada</h3>
              <p style={{ margin: 0 }}>{selectedUserNickname ? `O usuário @${selectedUserNickname} não tem tarefas pendentes.` : 'Selecione um usuário para visualizar sua próxima tarefa.'}</p>
            </div>
          ) : (
            <div style={{ backgroundColor: 'var(--bg-primary)', borderRadius: '12px', padding: '24px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                <div>
                  <h3 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 8px 0', color: 'var(--text-primary)' }}>{nextTask.title}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: 'var(--text-secondary)' }}><FaCalendarAlt size={12} />{new Date(nextTask.createdAt).toLocaleDateString('pt-BR')}</div>
                    {nextTask.priority && <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: 'var(--text-secondary)' }}><FaFlag size={12} />{nextTask.priority.name}</div>}
                  </div>
                </div>
                <div style={{ padding: '8px 16px', backgroundColor: nextTask.isCompleted ? 'var(--success-color)' : 'var(--warning-color)', color: 'white', borderRadius: '20px', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>
                  {nextTask.isCompleted ? 'Concluída' : 'Pendente'}
                </div>
              </div>

              {nextTask.description && (
                <div style={{ marginBottom: '24px' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 12px 0', color: 'var(--text-primary)' }}>Descrição</h4>
                  <div style={{ padding: '16px', backgroundColor: 'var(--bg-input)', borderRadius: '8px', color: 'var(--text-primary)', lineHeight: '1.6' }}>{nextTask.description}</div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '24px' }}>
                {nextTask.project && (
                  <div style={{ padding: '16px', backgroundColor: 'var(--bg-input)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}><FaProjectDiagram size={12} />Projeto</div>
                    <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>{nextTask.project.name}</div>
                  </div>
                )}
                {nextTask.status && (
                  <div style={{ padding: '16px', backgroundColor: 'var(--bg-input)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Status</div>
                    <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>{nextTask.status.name}</div>
                  </div>
                )}
                {nextTask.assignedTo && (
                  <div style={{ padding: '16px', backgroundColor: 'var(--bg-input)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}><FaUser size={12} />Atribuído a</div>
                    <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>{nextTask.assignedTo.name || nextTask.assignedTo.nickname}</div>
                  </div>
                )}
                {nextTask.dueDate && (
                  <div style={{ padding: '16px', backgroundColor: 'var(--bg-input)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}><FaCalendarAlt size={12} />Data de Vencimento</div>
                    <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>{new Date(nextTask.dueDate).toLocaleDateString('pt-BR')}</div>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--border-color)' }}>
                <button onClick={handleRefresh} style={{ padding: '12px 24px', backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }} disabled={loadingTask}>
                  <FaSync size={14} className={loadingTask ? 'spin' : ''} /> Atualizar Tarefa
                </button>
                <button onClick={() => navigate('/')} style={{ padding: '12px 24px', backgroundColor: 'var(--accent-color)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FaArrowRight size={14} /> Ver Todas as Tarefas
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
};

export default NextTaskManager;