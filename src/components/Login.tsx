import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FaGoogle, FaTasks, FaSpinner, FaUser, FaUserPlus, FaSignInAlt, FaEnvelope, FaIdCard } from 'react-icons/fa';

// Helper function to get backend URL based on current frontend URL
const getBackendUrl = (): string => {
  const hostname = window.location.hostname;
  const port = window.location.port;
  
  // Determine backend port based on frontend port
  let backendPort = 3001; // Default to development
  
  if (port === '8090' || port === '8091') {
    // Production environment
    backendPort = 8091;
  } else if (port === '3000' || port === '3001') {
    // Development environment
    backendPort = 3001;
  } else if (!port) {
    // No port specified (default ports)
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      // Default to development for localhost without port
      backendPort = 3001;
    } else {
      // For other hosts without port, assume production
      backendPort = 8091;
    }
  }
  
  console.log(`🌐 Login Component: Frontend ${hostname}:${port} → Backend port ${backendPort}`);
  
  // Build backend URL
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `http://localhost:${backendPort}`;
  } else if (hostname === '192.168.1.70') {
    return `http://192.168.1.70:${backendPort}`;
  } else if (hostname === 'tarefas.local' || hostname === 'web.tarefas.local') {
    return `http://api.tarefas.local:${backendPort}`;
  } else {
    // For any other hostname
    return `http://${hostname}:${backendPort}`;
  }
};

const Login: React.FC = () => {
  const { login, isLoading } = useAuth();
  const [loginNickname, setLoginNickname] = useState('');
  const [registerData, setRegisterData] = useState({
    name: '',
    nickname: '',
    email: ''
  });
  const [isLoadingAction, setIsLoadingAction] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<'google' | 'login' | 'register'>('google');
  const [rememberLogin, setRememberLogin] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('saved_nickname');
    if (saved) {
      setLoginNickname(saved);
      setRememberLogin(true);
      setActiveTab('login');
    }
  }, []);

  const handleLogin = async () => {
    if (!loginNickname.trim() || loginNickname.length < 2) {
      setError('O nickname deve ter pelo menos 2 caracteres');
      return;
    }

    setIsLoadingAction(true);
    setError('');
    setSuccess('');

    try {
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nickname: loginNickname.trim() }),
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok) {
        // Save or clear login preference
        if (rememberLogin) {
          localStorage.setItem('saved_nickname', loginNickname.trim());
        } else {
          localStorage.removeItem('saved_nickname');
        }

        // Persist user in localStorage
        localStorage.setItem('tarefas_user', JSON.stringify(data.user));
        window.location.reload();
      } else {
        setError(data.message || 'Erro ao fazer login');
      }
    } catch (err) {
      setError('Erro de conexão com o servidor');
      console.error('Erro no login:', err);
    } finally {
      setIsLoadingAction(false);
    }
  };

  const handleRegister = async () => {
    // Validações
    if (!registerData.name.trim() || registerData.name.length < 2) {
      setError('O nome deve ter pelo menos 2 caracteres');
      return;
    }
    
    if (!registerData.nickname.trim() || registerData.nickname.length < 2) {
      setError('O nickname deve ter pelo menos 2 caracteres');
      return;
    }
    
    // Validação de email opcional, mas se fornecido, deve ser válido
    if (registerData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerData.email)) {
      setError('Por favor, insira um email válido');
      return;
    }

    setIsLoadingAction(true);
    setError('');
    setSuccess('');

    try {
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: registerData.name.trim(),
          nickname: registerData.nickname.trim(),
          email: registerData.email.trim() || null
        }),
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Cadastro realizado com sucesso! Você já pode fazer login.');
        // Limpar formulário
        setRegisterData({ name: '', nickname: '', email: '' });
        // Mudar para aba de login
        setTimeout(() => {
          setActiveTab('login');
          setLoginNickname(registerData.nickname.trim());
        }, 2000);
      } else {
        setError(data.message || 'Erro ao criar conta');
      }
    } catch (err) {
      setError('Erro de conexão com o servidor');
      console.error('Erro no registro:', err);
    } finally {
      setIsLoadingAction(false);
    }
  };

  const handleInputChange = (field: keyof typeof registerData, value: string) => {
    setRegisterData(prev => ({ ...prev, [field]: value }));
    setError('');
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
                value={loginNickname}
                onChange={(e) => {
                  setLoginNickname(e.target.value);
                  setError('');
                }}
                placeholder="Digite seu nickname"
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
                    handleLogin();
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
              {success && (
                <div style={{
                  marginTop: '8px',
                  padding: '8px 12px',
                  backgroundColor: '#E5FFE5',
                  border: '1px solid #06D6A0',
                  borderRadius: '6px',
                  fontSize: '14px',
                  color: '#06D6A0'
                }}>
                  {success}
                </div>
              )}
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '16px',
              paddingLeft: '4px'
            }}>
              <input
                type="checkbox"
                id="rememberLogin"
                checked={rememberLogin}
                onChange={(e) => setRememberLogin(e.target.checked)}
                style={{
                  marginRight: '8px',
                  width: '16px',
                  height: '16px',
                  cursor: 'pointer'
                }}
              />
              <label 
                htmlFor="rememberLogin"
                style={{
                  fontSize: '14px',
                  color: '#666',
                  cursor: 'pointer',
                  userSelect: 'none'
                }}
              >
                Lembrar Login
              </label>
            </div>

            <button
              onClick={handleLogin}
              disabled={isLoadingAction || !loginNickname.trim()}
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
                opacity: (isLoadingAction || !loginNickname.trim()) ? 0.7 : 1
              }}
              onMouseEnter={(e) => {
                if (!isLoadingAction && loginNickname.trim()) {
                  e.currentTarget.style.backgroundColor = '#3DB8AC';
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoadingAction && loginNickname.trim()) {
                  e.currentTarget.style.backgroundColor = '#4ECDC4';
                }
              }}
            >
              {isLoadingAction ? (
                <FaSpinner className="spin" style={{ animation: 'spin 1s linear infinite' }} />
              ) : (
                <FaSignInAlt size={20} />
              )}
              {isLoadingAction ? 'Entrando...' : 'Entrar com Nickname'}
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
                <strong>👤 Login persistente:</strong> Use seu nickname para acessar o sistema.
              </p>
              <p style={{ margin: 0 }}>
                Se ainda não tem uma conta, vá para a aba "Cadastrar".
              </p>
            </div>
          </>
        )}

        {/* Cadastro Tab */}
        {activeTab === 'register' && (
          <>
            <div style={{
              marginBottom: '24px',
              textAlign: 'left'
            }}>
              {/* Nome */}
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: 600,
                color: '#333'
              }}>
                <FaIdCard style={{ marginRight: '8px' }} />
                Nome Completo *
              </label>
              <input
                type="text"
                value={registerData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Digite seu nome completo"
                style={{
                  width: '100%',
                  padding: '14px',
                  border: `1px solid ${error && !registerData.name.trim() ? '#FF6B6B' : '#e0e0e0'}`,
                  borderRadius: '8px',
                  fontSize: '16px',
                  marginBottom: '16px',
                  transition: 'all 0.2s',
                  boxSizing: 'border-box'
                }}
              />

              {/* Nickname */}
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: 600,
                color: '#333'
              }}>
                <FaUser style={{ marginRight: '8px' }} />
                Nickname *
              </label>
              <input
                type="text"
                value={registerData.nickname}
                onChange={(e) => handleInputChange('nickname', e.target.value)}
                placeholder="Escolha um nickname único"
                style={{
                  width: '100%',
                  padding: '14px',
                  border: `1px solid ${error && !registerData.nickname.trim() ? '#FF6B6B' : '#e0e0e0'}`,
                  borderRadius: '8px',
                  fontSize: '16px',
                  marginBottom: '16px',
                  transition: 'all 0.2s',
                  boxSizing: 'border-box'
                }}
              />

              {/* Email (opcional) */}
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: 600,
                color: '#333'
              }}>
                <FaEnvelope style={{ marginRight: '8px' }} />
                Email (opcional)
              </label>
              <input
                type="email"
                value={registerData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="seu@email.com (opcional)"
                style={{
                  width: '100%',
                  padding: '14px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '16px',
                  marginBottom: '16px',
                  transition: 'all 0.2s',
                  boxSizing: 'border-box'
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
              {success && (
                <div style={{
                  marginTop: '8px',
                  padding: '8px 12px',
                  backgroundColor: '#E5FFE5',
                  border: '1px solid #06D6A0',
                  borderRadius: '6px',
                  fontSize: '14px',
                  color: '#06D6A0'
                }}>
                  {success}
                </div>
              )}
            </div>

            <button
              onClick={handleRegister}
              disabled={isLoadingAction || !registerData.name.trim() || !registerData.nickname.trim()}
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
                opacity: (isLoadingAction || !registerData.name.trim() || !registerData.nickname.trim()) ? 0.7 : 1
              }}
              onMouseEnter={(e) => {
                if (!isLoadingAction && registerData.name.trim() && registerData.nickname.trim()) {
                  e.currentTarget.style.backgroundColor = '#05C592';
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoadingAction && registerData.name.trim() && registerData.nickname.trim()) {
                  e.currentTarget.style.backgroundColor = '#06D6A0';
                }
              }}
            >
              {isLoadingAction ? (
                <FaSpinner className="spin" style={{ animation: 'spin 1s linear infinite' }} />
              ) : (
                <FaUserPlus size={20} />
              )}
              {isLoadingAction ? 'Criando conta...' : 'Criar Conta'}
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
                <strong>📝 Cadastro completo:</strong> Crie uma conta persistente no banco de dados.
              </p>
              <p style={{ margin: 0 }}>
                Seus dados serão armazenados permanentemente. Email é opcional.
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
            Backend: {getBackendUrl().replace('/api', '')} • Frontend: http://{window.location.hostname}:{window.location.port || (window.location.protocol === 'https:' ? '443' : '80')}
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