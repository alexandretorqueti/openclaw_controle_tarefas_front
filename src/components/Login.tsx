import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FaGoogle, FaTasks, FaSpinner } from 'react-icons/fa';

const Login: React.FC = () => {
  const { login, isLoading } = useAuth();

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
        maxWidth: '400px',
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
          Faça login para acessar o sistema de gestão de tarefas
        </p>

        {/* Login Button */}
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

        {/* Info */}
        <div style={{
          marginTop: '32px',
          padding: '16px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          fontSize: '14px',
          color: '#666',
          textAlign: 'left'
        }}>
          <p style={{ marginBottom: '8px' }}>
            <strong>⚠️ Aviso:</strong> Este é um ambiente de desenvolvimento.
          </p>
          <p style={{ margin: 0 }}>
            Use sua conta Google para fazer login. O sistema criará automaticamente seu perfil.
          </p>
        </div>

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