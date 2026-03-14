// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { FaUser, FaEnvelope, FaImage, FaUserTag, FaSave, FaTimes, FaKey } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import AvatarUpload from './shared/AvatarUpload';
import { getAvatarUrl } from '../utils/avatarUrl';

interface UserProfileEditProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdate?: () => void;
}

const UserProfileEdit: React.FC<UserProfileEditProps> = ({ isOpen, onClose, onProfileUpdate }) => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    nickname: '',
    avatarUrl: ''
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Carregar dados do usuário quando o modal abrir
  useEffect(() => {
    if (isOpen && user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        nickname: user.nickname || '',
        avatarUrl: user.avatarUrl || ''
      });
      setAvatarFile(null); // Reset avatar file when opening
      setError(null);
      setSuccess(null);
      setIsUploadingAvatar(false);
    }
  }, [isOpen, user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarChange = (file: File | null, previewUrl: string) => {
    setAvatarFile(file);
    // If we have a previewUrl from a file, don't update formData.avatarUrl yet
    // We'll update it after successful upload
    if (!file && previewUrl === '') {
      // User removed avatar
      setFormData(prev => ({ ...prev, avatarUrl: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      setError('Usuário não identificado');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      // Validar campos obrigatórios
      if (!formData.name.trim()) {
        throw new Error('Nome é obrigatório');
      }

      if (!formData.email.trim()) {
        throw new Error('Email é obrigatório');
      }

      let finalAvatarUrl = formData.avatarUrl;

      // Upload avatar file if selected
      if (avatarFile && user) {
        setIsUploadingAvatar(true);
        try {
          const uploadResponse = await apiService.uploadAvatar(user.id, avatarFile);
          finalAvatarUrl = uploadResponse.avatarUrl;
        } catch (uploadErr: any) {
          console.error('Erro ao fazer upload do avatar:', uploadErr);
          const uploadErrorMessage = uploadErr?.response?.data?.error || uploadErr?.message || 'Erro ao fazer upload do avatar.';
          throw new Error(`Erro no upload do avatar: ${uploadErrorMessage}`);
        } finally {
          setIsUploadingAvatar(false);
        }
      }

      // Prepare user data
      const userData = {
        ...formData,
        avatarUrl: finalAvatarUrl || undefined
      };

      // Atualizar usuário no backend
      const response = await apiService.updateUser(user.id, userData);
      
      // Atualizar no contexto de autenticação
      if (updateUser) {
        updateUser(response.user);
      }

      setSuccess('Perfil atualizado com sucesso!');
      
      // Notificar componente pai se necessário
      if (onProfileUpdate) {
        onProfileUpdate();
      }

      // Fechar modal após 2 segundos
      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (err: any) {
      console.error('Failed to update profile:', err);
      setError(err.message || 'Falha ao atualizar perfil. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
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
      zIndex: 2000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '500px',
        maxHeight: '90vh',
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Cabeçalho */}
        <div style={{
          padding: '24px',
          backgroundColor: 'var(--bg-input)',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: '#4ECDC4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FaUser size={24} color="#fff" />
            </div>
            <div>
              <h2 style={{
                fontSize: '20px',
                fontWeight: 700,
                color: '#333',
                margin: 0
              }}>
                Meu Perfil
              </h2>
              <p style={{
                fontSize: '14px',
                color: 'var(--text-secondary)',
                margin: '4px 0 0 0'
              }}>
                Atualize suas informações pessoais
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: 'transparent',
              border: '1px solid var(--border-color)',
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
            <FaTimes size={16} color="#666" />
          </button>
        </div>

        {/* Conteúdo */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          {error && (
            <div style={{
              padding: '12px 16px',
              backgroundColor: '#FFE5E5',
              border: '1px solid #FF6B6B',
              borderRadius: '8px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: '#FF6B6B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <FaTimes size={12} color="#fff" />
              </div>
              <span style={{ color: '#FF6B6B', fontSize: '14px' }}>{error}</span>
            </div>
          )}

          {success && (
            <div style={{
              padding: '12px 16px',
              backgroundColor: '#E5F7ED',
              border: '1px solid #4ECDC4',
              borderRadius: '8px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: '#4ECDC4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <FaSave size={12} color="#fff" />
              </div>
              <span style={{ color: '#4ECDC4', fontSize: '14px' }}>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Avatar */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                fontSize: '14px',
                fontWeight: 500,
                color: '#333',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <FaImage size={14} color="#4ECDC4" />
                Foto do Perfil
              </label>
              <AvatarUpload
                currentAvatarUrl={formData.avatarUrl}
                onAvatarChange={handleAvatarChange}
                userId={user?.id}
                disabled={isUploadingAvatar || loading}
              />
            </div>

            {/* Nome */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                
                fontSize: '14px',
                fontWeight: 500,
                color: '#333',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <FaUser size={14} color="#4ECDC4" />
                Nome Completo *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Seu nome completo"
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: '#333',
                  backgroundColor: 'var(--bg-input)',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#4ECDC4';
                  e.target.style.backgroundColor = '#fff';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#ddd';
                  e.target.style.backgroundColor = '#f8f9fa';
                }}
              />
            </div>

            {/* Email */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                
                fontSize: '14px',
                fontWeight: 500,
                color: '#333',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <FaEnvelope size={14} color="#4ECDC4" />
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="seu@email.com"
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: '#333',
                  backgroundColor: 'var(--bg-input)',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#4ECDC4';
                  e.target.style.backgroundColor = '#fff';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#ddd';
                  e.target.style.backgroundColor = '#f8f9fa';
                }}
              />
            </div>

            {/* Apelido */}
            <div style={{ marginBottom: '32px' }}>
              <label style={{
                
                fontSize: '14px',
                fontWeight: 500,
                color: '#333',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <FaUserTag size={14} color="#4ECDC4" />
                Apelido (Nickname)
              </label>
              <input
                type="text"
                name="nickname"
                value={formData.nickname}
                onChange={handleInputChange}
                placeholder="Seu apelido no sistema"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: '#333',
                  backgroundColor: 'var(--bg-input)',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#4ECDC4';
                  e.target.style.backgroundColor = '#fff';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#ddd';
                  e.target.style.backgroundColor = '#f8f9fa';
                }}
              />
              <p style={{
                fontSize: '12px',
                color: '#999',
                marginTop: '8px'
              }}>
                Apelido usado para identificação no sistema (opcional)
              </p>
            </div>

            {/* Botões */}
            <div style={{
              display: 'flex',
              gap: '12px',
              paddingTop: '20px',
              borderTop: '1px solid #e0e0e0'
            }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  flex: 1,
                  padding: '14px 20px',
                  backgroundColor: 'transparent',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f8f9fa';
                  e.currentTarget.style.borderColor = '#999';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.borderColor = '#ddd';
                }}
                disabled={loading}
              >
                Cancelar
              </button>
              
              <button
                type="submit"
                style={{
                  flex: 1,
                  padding: '14px 20px',
                  backgroundColor: '#4ECDC4',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3DB8AC'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4ECDC4'}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTopColor: '#fff',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                    Salvando...
                  </>
                ) : (
                  <>
                    <FaSave size={14} />
                    Salvar Alterações
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default UserProfileEdit;