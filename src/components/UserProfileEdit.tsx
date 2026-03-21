// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { FaUser, FaEnvelope, FaImage, FaUserTag, FaSave, FaTimes, FaKey, FaHome, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import AvatarUpload from './shared/AvatarUpload';
import { getAvatarUrl } from '../utils/avatarUrl';

const UserProfileEdit: React.FC = () => {
  const navigate = useNavigate();
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

  // Carregar dados do usuário quando o componente montar
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        nickname: user.nickname || '',
        avatarUrl: user.avatarUrl || ''
      });
      setAvatarFile(null);
      setError(null);
      setSuccess(null);
      setIsUploadingAvatar(false);
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarChange = (file: File | null) => {
    setAvatarFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          avatarUrl: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadAvatar = async (): Promise<string | null> => {
    if (!avatarFile || !user) return null;

    try {
      setIsUploadingAvatar(true);
      const formData = new FormData();
      formData.append('avatar', avatarFile);
      
      const response = await apiService.uploadAvatar(formData);
      return response.avatarUrl || null;
    } catch (err) {
      console.error('Erro ao fazer upload do avatar:', err);
      return null;
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('Usuário não autenticado');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      // Upload do avatar primeiro, se houver
      let finalAvatarUrl = formData.avatarUrl;
      if (avatarFile) {
        const uploadedAvatarUrl = await uploadAvatar();
        if (uploadedAvatarUrl) {
          finalAvatarUrl = uploadedAvatarUrl;
        }
      }

      // Atualizar perfil do usuário
      const updateData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        nickname: formData.nickname.trim(),
        avatarUrl: finalAvatarUrl
      };

      const updatedUser = await apiService.updateUserProfile(user.id, updateData);
      
      // Atualizar contexto de autenticação
      updateUser(updatedUser);
      
      setSuccess('Perfil atualizado com sucesso!');
      
      // Limpar estado do avatar após sucesso
      setAvatarFile(null);
      
    } catch (err: any) {
      console.error('Erro ao atualizar perfil:', err);
      const errorMessage = err?.response?.data?.message || err?.message || 'Erro ao atualizar perfil.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  if (!user) {
    return (
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '40px',
        textAlign: 'center',
        color: 'var(--text-primary)'
      }}>
        <h2>Usuário não autenticado</h2>
        <p>Faça login para acessar esta página.</p>
        <button
          onClick={() => navigate('/login')}
          style={{
            padding: '12px 24px',
            backgroundColor: 'var(--accent-color)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            marginTop: '20px'
          }}
        >
          Ir para Login
        </button>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: '800px',
      margin: '0 auto',
      padding: '24px',
      backgroundColor: 'var(--bg-primary)',
      color: 'var(--text-primary)',
      minHeight: 'calc(100vh - 64px)'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px',
        paddingBottom: '16px',
        borderBottom: '1px solid var(--border-color)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            backgroundColor: 'var(--accent-color)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <FaUser size={24} color="white" />
          </div>
          <div>
            <h1 style={{
              fontSize: '28px',
              fontWeight: 700,
              margin: 0,
              color: 'var(--text-primary)'
            }}>
              Meu Perfil
            </h1>
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
          onClick={handleBack}
          style={{
            padding: '10px 20px',
            backgroundColor: 'var(--bg-input)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            fontSize: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s'
          }}
        >
          <FaArrowLeft size={14} />
          Voltar
        </button>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div style={{
          padding: '16px',
          backgroundColor: 'var(--success-color)',
          color: 'white',
          borderRadius: '8px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <FaSave size={16} />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div style={{
          padding: '16px',
          backgroundColor: 'var(--danger-color)',
          color: 'white',
          borderRadius: '8px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <FaTimes size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Main Content */}
      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: '12px',
        padding: '32px',
        border: '1px solid var(--border-color)'
      }}>
        <form onSubmit={handleSubmit}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 2fr',
            gap: '32px',
            alignItems: 'start'
          }}>
            {/* Left Column - Avatar */}
            <div>
              <h3 style={{
                fontSize: '18px',
                fontWeight: 600,
                margin: '0 0 16px 0',
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <FaImage size={16} />
                Foto de Perfil
              </h3>
              
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '16px'
              }}>
                <div style={{
                  width: '160px',
                  height: '160px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--bg-input)',
                  backgroundImage: formData.avatarUrl ? `url(${getAvatarUrl(formData.avatarUrl)})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  border: '3px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden'
                }}>
                  {!formData.avatarUrl && (
                    <FaUser size={64} color="var(--text-secondary)" />
                  )}
                </div>
                
                <AvatarUpload
                  onAvatarChange={handleAvatarChange}
                  currentAvatarUrl={formData.avatarUrl}
                  isUploading={isUploadingAvatar}
                />
                
                {avatarFile && (
                  <div style={{
                    fontSize: '12px',
                    color: 'var(--text-secondary)',
                    textAlign: 'center'
                  }}>
                    Nova imagem selecionada: {avatarFile.name}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Form Fields */}
            <div>
              <h3 style={{
                fontSize: '18px',
                fontWeight: 600,
                margin: '0 0 24px 0',
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <FaUser size={16} />
                Informações Pessoais
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Name Field */}
                <div>
                  <label style={{
                    fontSize: '14px',
                    fontWeight: 500,
                    color: 'var(--text-secondary)',
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <FaUser size={12} />
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      backgroundColor: 'var(--bg-input)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      fontSize: '16px',
                      outline: 'none',
                      transition: 'border-color 0.2s'
                    }}
                    placeholder="Digite seu nome completo"
                    required
                  />
                </div>

                {/* Email Field */}
                <div>
                  <label style={{
                    fontSize: '14px',
                    fontWeight: 500,
                    color: 'var(--text-secondary)',
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <FaEnvelope size={12} />
                    E-mail
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      backgroundColor: 'var(--bg-input)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      fontSize: '16px',
                      outline: 'none',
                      transition: 'border-color 0.2s'
                    }}
                    placeholder="seu@email.com"
                    required
                  />
                </div>

                {/* Nickname Field */}
                <div>
                  <label style={{
                    fontSize: '14px',
                    fontWeight: 500,
                    color: 'var(--text-secondary)',
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <FaUserTag size={12} />
                    Apelido (Nickname)
                  </label>
                  <input
                    type="text"
                    name="nickname"
                    value={formData.nickname}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      backgroundColor: 'var(--bg-input)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      fontSize: '16px',
                      outline: 'none',
                      transition: 'border-color 0.2s'
                    }}
                    placeholder="Seu apelido no sistema"
                  />
                  <div style={{
                    fontSize: '12px',
                    color: 'var(--text-secondary)',
                    marginTop: '4px'
                  }}>
                    Usado para identificar suas tarefas e atividades
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px',
                marginTop: '32px',
                paddingTop: '24px',
                borderTop: '1px solid var(--border-color)'
              }}>
                <button
                  type="button"
                  onClick={handleBack}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: 'var(--bg-input)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s'
                  }}
                >
                  <FaTimes size={14} />
                  Cancelar
                </button>
                
                <button
                  type="submit"
                  disabled={loading || isUploadingAvatar}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: 'var(--accent-color)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    cursor: loading || isUploadingAvatar ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s',
                    opacity: loading || isUploadingAvatar ? 0.7 : 1
                  }}
                >
                  {loading || isUploadingAvatar ? (
                    <>
                      <div style={{
                        width: '14px',
                        height: '14px',
                        border: '2px solid white',
                        borderTop: '2px solid transparent',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }} />
                      {isUploadingAvatar ? 'Enviando imagem...' : 'Salvando...'}
                    </>
                  ) : (
                    <>
                      <FaSave size={14} />
                      Salvar Alterações
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        input:focus {
          border-color: var(--accent-color) !important;
        }
      `}</style>
    </div>
  );
};

export default UserProfileEdit;