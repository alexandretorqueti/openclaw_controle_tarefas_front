import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FaGoogle, FaTasks, FaSpinner, FaUser, FaUserPlus, FaSignInAlt } from 'react-icons/fa';

const Login: React.FC = () => {
  const { login, isLoading } = useAuth();
  const [nickname, setNickname] = useState('');
  const [isNicknameLoading, setIsNicknameLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'google' | 'login' | 'register'>('google');

  const handleNicknameLogin = async () => {
    if (!nickname.trim() || nickname.length < 2) {
      setError('O nickname deve ter pelo menos 2 caracteres');
      return;
    }

    setIsNicknameLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3001/api/simple-auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nickname: nickname.trim() }),
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok) {
        window.location.reload();
      } else {
        setError(data.message || 'Erro ao fazer login');
      }
    } catch (err) {
      setError('Erro de conexão com o servidor');
      console.error('Erro no login com nickname:', err);
    } finally {
      setIsNicknameLoading(false);
    }
  };

  const handleNicknameRegister = async () => {
    if (!nickname.trim() || nickname.length < 2) {
      setError('O nickname deve ter pelo menos 2 caracteres');
      return;
    }

    setIsNicknameLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3001/api/simple-auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nickname: nickname.trim() }),
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok) {
        window.location.reload();
      } else {
        setError(data.message || 'Erro ao criar conta');
      }
    } catch (err) {
      setError('Erro de conexão com o servidor');
      console.error('Erro no registro com nickname:', err);
    } finally {
      setIsNicknameLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f5f5f5',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      <div style={{
        backgroundColor: '#fff',
        padding: '48px',
        borderRadius: '16px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '450px',
        textAlign: 'center'
      }}>
        {/* Logo */}
        <div style={{
          width: '80px',
          height: '80px',
          backgroundColor: '#4ECDC4',
          borderRadius: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px'
        }}>
          <FaTasks size={36} color="#fff" />
        </div>

        <h1 style={{
          fontSize: '28px',
          fontWeight: 700,
          color: '#333',
          marginBottom: '8px'
        }}>
          Sistema de Gestão
        </h1>
        
        <p style={{
          color: '#666',
          fontSize: '16px',
          marginBottom: '32px',
          lineHeight: 1.5
        }}>
          Escolha como deseja acessar o sistema
        </p>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '24px',
          borderBottom: '1px solid #e0e0e0',
          paddingBottom: '16px'
        }}>
          <button
            onClick={() => setActiveTab('google')}
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: activeTab === 'google' ? '#4285F4' : '#f8f9fa',
              color: activeTab === 'google' ? '#fff' : '#666',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
          >
            <FaGoogle size={16} />
            Google
          </button>
          
          <button
            onClick={() => setActiveTab('login')}
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: activeTab === 'login' ? '#4ECDC4' : '#f8f9fa',
              color: activeTab === 'login' ? '#fff' : '#666',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
          >
            <FaSignInAlt size={16} />
            Login
          </button>
          
          <button
            onClick={() => setActiveTab('register')}
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: activeTab === 'register' ? '#06D6A0' : '#f8f9fa',
              color: activeTab === 'register' ? '#fff' : '#666',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
          >
            <FaUserPlus size={16} />
            Cadastrar
          </button>
        </div>

        {/* Google Login Tab */}
        {activeTab === 'google' && (
          <>
            <button
              onClick={login}
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '16px',
                backgroundColor: '#4285F4',
                color: '#fff',
                border: 'none',
                borderRadius: '10px',
                fontSize: '16px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                transition: 'all 0.2s',
                opacity: isLoading ? 0.7 : 1
              }}
              onMouseEnter={(e) => {
                if (!isLoading) e.currentTarget.style.backgroundColor = '#3367D6';
              }}
              onMouseLeave={(e) => {
                if (!isLoading) e.currentTarget.style.backgroundColor = '#4285F4';
              }}
            >
              {isLoading ? (
                <FaSpinner className="spin" style={{ animation: 'spin 1s linear infinite' }} />
              ) : (
                <FaGoogle size={20} />
              )}
              {isLoading ? 'Carregando...' : 'Login com Google'}
            </button>

            <div style={{
              marginTop: '24px',
              padding: '16px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              fontSize: '14px',
              color: '#666',
              textAlign: 'left'
            }}>
              <p style={{ marginBottom: '8px' }}>
                <strong>🔐 Login seguro:</strong> Use sua conta Google para acesso rápido e seguro.
              </p>
              <p style={{ margin: 0 }}>
                Seu perfil será criado automaticamente na primeira vez.
              </p>
            </div>
          </>
        )}

        {/* Nickname Login Tab */}
        {activeTab === 'login' && (
          <>
            <div style={{
              marginBottom: '24px',
              textAlign: 'left'
            }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: 600,
                color: '#333'
              }}>
                <FaUser style={{ marginRight: '8px' }} />
                Nickname
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => {
                  setNickname(e.target.value);
                  setError('');
                }}
                placeholder="Digite seu nickname (mínimo 2 caracteres)"
                style={{
                  width: '100%',
                  padding: '14px',
                  border: `1px solid ${error ? '#FF6B6B' : '#e0e0e0'}`,
                  borderRadius: '8px',
                  fontSize: '16px',
                  transition: 'all 0.2s',
                  boxSizing: 'border-box'
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleNicknameLogin();
                  }
                }}
              />
              {error && (
                <div style={{
                  marginTop: '8px',
                  padding: '8px 12px',
                  backgroundColor: '#FFE5E5',
                  border: '1px solid #FF6B6B',
                  borderRadius: '6px',
                  fontSize: '14px',
                  color: '#FF6B6B'
                }}>
                  {error}
                </div>
              )}
            </div>

            <button
              onClick={handleNicknameLogin}
              disabled={isNicknameLoading || !nickname.trim()}
              style={{
                width: '100%',
                padding: '16px',
                backgroundColor: '#4ECDC4',
                color: '#fff',
                border: 'none',
                borderRadius: '10px',
                fontSize: '16px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                transition: 'all 0.2s',
                opacity: (isNicknameLoading || !nickname.trim()) ? 0.7 : 1
              }}
              onMouseEnter={(e) => {
                if (!isNicknameLoading && nickname.trim()) {
                  e.currentTarget.style.backgroundColor = '#3DB8AC';
                }
              }}
              onMouseLeave={(e) => {
                if (!isNicknameLoading && nickname.trim()) {
                  e.currentTarget.style.backgroundColor = '#4ECDC4';
                }
              }}
            >
              {isNicknameLoading ? (
                <FaSpinner className="spin" style={{ animation: 'spin 1s linear infinite' }} />
              ) : (
                <FaSignInAlt size={20} />
              )}
              {isNicknameLoading ? 'Entrando...' : 'Entrar com Nickname'}
            </button>

            <div style={{
              marginTop: '24px',
              padding: '16px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              fontSize: '14px',
              color: '#666',
              textAlign: 'left'
            }}>
              <p style={{ marginBottom: '8px' }}>
                <strong>👤 Login simples:</strong> Use um nickname para acesso rápido.
              </p>
              <p style={{ margin: 0 }}>
                Se o nickname não existir, você será redirecionado para cadastro.
              </p>
            </div>
          </>
        )}

        {/* Nickname Register Tab */}
        {activeTab === 'register' && (
          <>
            <div style={{
              marginBottom: '24px',
              textAlign: 'left'
            }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: 600,
                color: '#333'
              }}>
                <FaUserPlus style={{ marginRight: '8px' }} />
                Escolha um Nickname
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => {
                  setNickname(e.target.value);
                  setError('');
                }}
                placeholder="Escolha um nickname único (mínimo 2 caracteres)"
                style={{
                  width: '100%',
                  padding: '14px',
                  border: `1px solid ${error ? '#FF6B6B' : '#e0e0e0'}`,
                  borderRadius: '8px',
                  fontSize: '16px',
                  transition: 'all 0.2s',
                  boxSizing: 'border-box'
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleNicknameRegister();
                  }
                }}
              />
              {error && (
                <div style={{
                  marginTop: '8px',
                  padding: '8px 12px',
                  backgroundColor: '#FFE5E5',
                  border: '1px solid #FF6B6B',
                  borderRadius: '6px',
                  fontSize: '14px',
                  color: '#FF6B6B'
                }}>
                  {error}
                </div>
              )}
            </div>

            <button
              onClick={handleNicknameRegister}
              disabled={isNicknameLoading || !nickname.trim()}
              style={{
                width: '100%',
                padding: '16px',
                backgroundColor: '#06D6A0',
                color: '#fff',
                border: 'none',
                borderRadius: '10px',
                fontSize: '16px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                transition: 'all 0.2s',
                opacity: (isNicknameLoading || !nickname.trim()) ? 0.7 : 1
              }}
              onMouseEnter={(e) => {
                if (!isNicknameLoading && nickname.trim()) {
                  e.currentTarget.style.backgroundColor = '#05C592';
                }
              }}
              onMouseLeave={(e) => {
                if (!isNicknameLoading && nickname.trim()) {
                  e.currentTarget.style.backgroundColor = '#06D6A0';
                }
              }}
            >
              {isNicknameLoading ? (
                <FaSpinner className="spin" style={{ animation: 'spin 1s linear infinite' }} />
              ) : (
                <FaUserPlus size={20} />
              )}
              {isNicknameLoading ? 'Criando conta...' : 'Criar Conta com Nickname'}
            </button>

            <div style={{
              marginTop: '24px',
              padding: '16px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              fontSize: '14px',
              color: '#666',
              textAlign: 'left'
            }}>
              <p style={{ marginBottom: '8px' }}>
                <strong>🚀 Cadastro rápido:</strong> Crie uma conta em segundos.
              </p>
              <p style={{ margin: 0 }}>
                Basta escolher um nickname único. Sem senhas, sem emails complicados.
              </p>
            </div>
          </>
        )}

        {/* Footer */}
        <div style={{
          marginTop: '32px',
          paddingTop: '16px',
          borderTop: '1px solid #e0e0e0',
          fontSize: '12px',
          color: '#999'
        }}>
          <p style={{ margin: 0 }}>
            Backend: http://localhost:3001 • Frontend: http://localhost:3000
          </p>
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
    </div>
  );
};

export default Login;