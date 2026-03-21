import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { User } from '../types';
import AvatarUpload from './shared/AvatarUpload';
import { getAvatarUrl } from '../utils/avatarUrl';
import './UserManager.css';

const UserManager: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [uploadingAvatarFor, setUploadingAvatarFor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state for new user
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    nickname: '',
    password: '',
    confirmPassword: '',
    role: 'Viewer' as 'Admin' | 'Viewer' | 'Editor'
  });

  // Avatar state
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Role options
  const roleOptions = [
    { value: 'Admin', label: 'Administrador', description: 'Acesso total ao sistema', color: '#9D4EDD' },
    { value: 'Editor', label: 'Editor', description: 'Pode criar e editar tarefas', color: '#10B981' },
    { value: 'Viewer', label: 'Visualizador', description: 'Somente leitura', color: '#118AB2' }
  ];

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getUsers();
      const data = (response as any).data || response;
      const usersArray = Array.isArray(data) ? data : (data.users || []);
      setUsers(usersArray);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      setError('Não foi possível carregar os usuários. Verifique a conexão com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    // Validation
    if (!newUser.name.trim()) {
      setError('O nome do usuário é obrigatório');
      return;
    }
    if (!newUser.email.trim()) {
      setError('O email do usuário é obrigatório');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newUser.email)) {
      setError('Por favor, insira um email válido');
      return;
    }
    if (!newUser.password) {
      setError('A senha é obrigatória');
      return;
    }
    if (newUser.password !== newUser.confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }
    if (newUser.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    try {
      setError(null);
      const userData = {
        name: newUser.name,
        email: newUser.email,
        nickname: newUser.nickname || undefined,
        role: newUser.role,
        password: newUser.password
      };

      const createdUser = await api.createUser(userData);
      
      // Upload avatar if selected
      if (avatarFile && createdUser.id) {
        try {
          await api.uploadAvatar(createdUser.id, avatarFile);
        } catch (uploadErr) {
          console.error('Erro ao fazer upload do avatar:', uploadErr);
          // Don't fail the entire operation if avatar upload fails
        }
      }

      // Reset form
      setNewUser({
        name: '',
        email: '',
        nickname: '',
        password: '',
        confirmPassword: '',
        role: 'Viewer'
      });
      setAvatarFile(null);
      setAvatarPreview(null);

      // Reload users
      loadUsers();
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      setError('Erro ao criar usuário. Verifique os dados e tente novamente.');
    }
  };

  const handleUpdate = async () => {
    if (!editingUser) return;
    
    try {
      setError(null);
      const { id, ...updateData } = editingUser;
      await api.updateUser(id, updateData);
      setEditingUser(null);
      loadUsers();
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      setError('Erro ao atualizar usuário. Verifique os dados e tente novamente.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este usuário?\nEsta ação não poderá ser desfeita.')) return;
    
    try {
      setError(null);
      await api.deleteUser(id);
      loadUsers();
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      setError('Erro ao excluir usuário. Verifique se o usuário não está associado a projetos ou tarefas.');
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
  };

  const handleNewUserChange = (field: keyof typeof newUser, value: string) => {
    setNewUser(prev => ({ ...prev, [field]: value }));
  };

  const handleEditUserChange = (field: keyof User, value: string) => {
    if (editingUser) {
      setEditingUser(prev => prev ? { ...prev, [field]: value } : null);
    }
  };

  const handleRoleSelect = (role: 'Admin' | 'Viewer' | 'Editor', isEdit: boolean = false) => {
    if (isEdit && editingUser) {
      setEditingUser({ ...editingUser, role });
    } else {
      setNewUser(prev => ({ ...prev, role }));
    }
  };

  const handleAvatarUpload = async (userId: string, file: File) => {
    try {
      setUploadingAvatarFor(userId);
      await api.uploadAvatar(userId, file);
      loadUsers();
    } catch (error) {
      console.error('Erro ao fazer upload do avatar:', error);
      setError('Erro ao fazer upload do avatar. Verifique o formato e tamanho do arquivo.');
    } finally {
      setUploadingAvatarFor(null);
    }
  };

  const handleAvatarFileSelect = (file: File | null, previewUrl: string) => {
    setAvatarFile(file);
    setAvatarPreview(previewUrl);
  };

  // Função para obter iniciais do nome
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Função para obter cor baseada na role
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Admin': return '#9D4EDD';
      case 'Editor': return '#10B981';
      case 'Viewer': return '#118AB2';
      default: return '#6B7280';
    }
  };

  // Função para obter label da role
  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'Admin': return 'Administrador';
      case 'Editor': return 'Editor';
      case 'Viewer': return 'Visualizador';
      default: return role;
    }
  };

  return (
    <div className="user-manager">
      <div className="user-header">
        <h1>Gerenciar Usuários</h1>
      </div>

      {/* Error message */}
      {error && (
        <div className="error-message">
          {error}
          <button
            onClick={() => setError(null)}
            style={{
              marginLeft: '12px',
              padding: '4px 12px',
              backgroundColor: 'var(--danger-color)',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Fechar
          </button>
        </div>
      )}

      {/* Create form */}
      <div className="user-form">
        <div className="form-group">
          <label>Nome Completo *</label>
          <input
            type="text"
            value={newUser.name}
            onChange={(e) => handleNewUserChange('name', e.target.value)}
            placeholder="Ex: João da Silva"
          />
        </div>

        <div className="form-group">
          <label>Email *</label>
          <input
            type="email"
            value={newUser.email}
            onChange={(e) => handleNewUserChange('email', e.target.value)}
            placeholder="Ex: joao@empresa.com"
          />
        </div>

        <div className="form-group">
          <label>Apelido (Opcional)</label>
          <input
            type="text"
            value={newUser.nickname}
            onChange={(e) => handleNewUserChange('nickname', e.target.value)}
            placeholder="Ex: joaosilva"
          />
          <div className="field-hint">
            Deixe em branco para gerar automaticamente a partir do email
          </div>
        </div>

        <div className="form-group">
          <label>Senha *</label>
          <input
            type="password"
            value={newUser.password}
            onChange={(e) => handleNewUserChange('password', e.target.value)}
            placeholder="Mínimo 6 caracteres"
          />
        </div>

        <div className="form-group">
          <label>Confirmar Senha *</label>
          <input
            type="password"
            value={newUser.confirmPassword}
            onChange={(e) => handleNewUserChange('confirmPassword', e.target.value)}
            placeholder="Digite a senha novamente"
          />
        </div>

        <div className="form-group">
          <label>Permissão de Acesso</label>
          <div className="role-palette">
            {roleOptions.map(option => (
              <div
                key={option.value}
                className={`role-option ${newUser.role === option.value ? 'selected' : ''}`}
                style={{ backgroundColor: option.color }}
                onClick={() => handleRoleSelect(option.value)}
                title={option.description}
              >
                <div className="role-option-label">{option.label}</div>
                <div className="role-option-description">{option.description}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Avatar (Opcional)</label>
          <div className="avatar-upload-section">
            <AvatarUpload
              currentAvatarUrl={avatarPreview || ''}
              onAvatarChange={handleAvatarFileSelect}
              disabled={false}
            />
          </div>
        </div>

        <button 
          onClick={handleCreate}
          disabled={!newUser.name.trim() || !newUser.email.trim() || !newUser.password || loading}
        >
          Criar Usuário
        </button>
      </div>

      {/* Edit form */}
      {editingUser && (
        <div className="user-edit-form">
          <div className="user-edit-form-header">
            <h3>Editar Usuário</h3>
          </div>
          
          <div className="user-edit-form-fields">
            <div className="form-group">
              <label>Nome Completo *</label>
              <input
                type="text"
                value={editingUser.name}
                onChange={(e) => handleEditUserChange('name', e.target.value)}
                placeholder="Ex: João da Silva"
              />
            </div>

            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                value={editingUser.email}
                onChange={(e) => handleEditUserChange('email', e.target.value)}
                placeholder="Ex: joao@empresa.com"
              />
            </div>

            <div className="form-group">
              <label>Apelido (Opcional)</label>
              <input
                type="text"
                value={editingUser.nickname || ''}
                onChange={(e) => handleEditUserChange('nickname', e.target.value)}
                placeholder="Ex: joaosilva"
              />
            </div>

            <div className="form-group">
              <label>Permissão de Acesso</label>
              <div className="role-palette">
                {roleOptions.map(option => (
                  <div
                    key={option.value}
                    className={`role-option ${editingUser.role === option.value ? 'selected' : ''}`}
                    style={{ backgroundColor: option.color }}
                    onClick={() => handleRoleSelect(option.value, true)}
                    title={option.description}
                  >
                    <div className="role-option-label">{option.label}</div>
                    <div className="role-option-description">{option.description}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Avatar</label>
              <div className="avatar-upload-section">
                <AvatarUpload
                  currentAvatarUrl={editingUser.avatarUrl || ''}
                  onAvatarChange={(file, previewUrl) => {
                    if (file) {
                      handleAvatarUpload(editingUser.id, file);
                    }
                  }}
                  disabled={uploadingAvatarFor === editingUser.id}
                />
                {uploadingAvatarFor === editingUser.id && (
                  <div className="uploading-indicator">Enviando avatar...</div>
                )}
              </div>
            </div>
          </div>

          <div className="user-edit-form-actions">
            <button onClick={handleUpdate} disabled={!editingUser.name.trim() || !editingUser.email.trim() || loading}>
              Salvar Alterações
            </button>
            <button onClick={handleCancelEdit}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* User list */}
      <div className="user-list">
        {loading ? (
          <div className="loading">Carregando usuários...</div>
        ) : users.length === 0 ? (
          <div className="empty-state">
            <p>Nenhum usuário cadastrado</p>
            <p>Use o formulário acima para criar o primeiro usuário</p>
          </div>
        ) : (
          users.map(user => {
            const roleColor = getRoleColor(user.role);
            const roleLabel = getRoleLabel(user.role);
            const avatarUrl = getAvatarUrl(user.avatarUrl);
            
            return (
              <div key={user.id} className="user-item">
                <div className="user-info">
                  <div className="user-avatar">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={user.name} className="avatar-image" />
                    ) : (
                      <div 
                        className="avatar-placeholder"
                        style={{ backgroundColor: roleColor }}
                      >
                        {getInitials(user.name)}
                      </div>
                    )}
                  </div>
                  <div className="user-details">
                    <div className="user-name">{user.name}</div>
                    <div className="user-meta">
                      <span className="user-meta-item">
                        <span className="meta-label">Email:</span> {user.email}
                      </span>
                      {user.nickname && (
                        <span className="user-meta-item">
                          <span className="meta-label">Apelido:</span> {user.nickname}
                        </span>
                      )}
                      <span className="user-meta-item">
                        <span className="meta-label">Criado em:</span> {user.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-BR') : 'N/A'}
                      </span>
                    </div>
                  </div>
                  <div className="user-role">
                    <div 
                      className="role-badge"
                      style={{ backgroundColor: roleColor }}
                    >
                      {roleLabel}
                    </div>
                  </div>
                </div>
                <div className="user-actions">
                  <button onClick={() => handleEdit(user)}>
                    Editar
                  </button>
                  <button onClick={() => handleDelete(user.id)}>
                    Excluir
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Informações sobre usuários */}
      <div className="user-info-section">
        <h3>💡 Dicas sobre Usuários</h3>
        <ul>
          <li>Administradores têm acesso total ao sistema</li>
          <li>Editores podem criar e editar tarefas</li>
          <li>Visualizadores podem apenas visualizar tarefas</li>
          <li>Use avatares para facilitar a identificação</li>
          <li>Evite excluir usuários associados a projetos ou tarefas</li>
          <li>Senhas devem ter pelo menos 6 caracteres</li>
          <li>Apelidos são opcionais e podem ser gerados automaticamente</li>
        </ul>
      </div>
    </div>
  );
};

export default UserManager;