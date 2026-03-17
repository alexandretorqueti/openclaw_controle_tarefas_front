import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import apiService from '../services/api';
import { User } from '../types';

// Helper function to get backend URL based on current frontend URL
const getBackendUrl = (): string => {
  const hostname = window.location.hostname;
  const port = window.location.port;
  
  // Determine backend port based on frontend port
  let backendPort = 4001; // Default to backend development port
  
  if (port === '8090' || port === '8091') {
    // Production environment
    backendPort = 8091;
  } else if (port === '4000') {
    // Development environment - backend runs on port 3000
    backendPort = 4001;
  } else if (!port) {
    // No port specified (default ports)
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      // Default to development for localhost without port
      backendPort = 4001;
    } else {
      // For other hosts without port, assume production
      backendPort = 8091;
    }
  }
  
  console.log(`🌐 AuthContext: Frontend ${hostname}:${port} → Backend port ${backendPort}`);
  
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

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateUser: (updatedUser: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = async () => {
    try {
      setIsLoading(true);
      
      // Check local storage for user
      const savedUser = localStorage.getItem('tarefas_user');
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        
        // Verificar se o usuário ainda existe no banco de dados
        const backendUrl = getBackendUrl();
        try {
          const response = await fetch(`${backendUrl}/api/auth/check`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId: parsedUser.id }),
            credentials: 'include'
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.isAuthenticated && data.user) {
              // Atualizar usuário com dados do banco
              setUser(data.user);
              setIsAuthenticated(true);
              // Atualizar localStorage
              localStorage.setItem('tarefas_user', JSON.stringify(data.user));
            } else {
              // Usuário não encontrado no banco, limpar localStorage
              localStorage.removeItem('tarefas_user');
              setUser(null);
              setIsAuthenticated(false);
            }
          } else {
            // Erro na verificação, manter usuário local
            setUser(parsedUser);
            setIsAuthenticated(true);
          }
        } catch (error) {
          // Erro de conexão, manter usuário local
          console.error('Erro ao verificar autenticação:', error);
          setUser(parsedUser);
          setIsAuthenticated(true);
        }
      } else {
        // Nenhum usuário no localStorage
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = () => {
    // Get backend URL using helper function
    const backendUrl = getBackendUrl();
    const currentOrigin = window.location.origin;
    
    // Redirect to Google OAuth with origin parameter
    const authUrl = `${backendUrl}/api/auth/google?origin=${encodeURIComponent(currentOrigin)}`;
    console.log(`🔐 Redirecting to auth: ${authUrl}`);
    window.location.href = authUrl;
  };

  const logout = async () => {
    try {
      // Clear local storage
      localStorage.removeItem('tarefas_user');
      
      // Get backend URL using helper function
      const backendUrl = getBackendUrl();
      
      await fetch(`${backendUrl}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
      
      setUser(null);
      setIsAuthenticated(false);
      
      // Reload the page to clear any state
      window.location.href = '/';
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('tarefas_user', JSON.stringify(updatedUser));
  };

  useEffect(() => {
    checkAuth();
  }, []);

  // Check for OAuth callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const isCallback = window.location.pathname === '/auth/callback';
    
    if (isCallback) {
      // We're on the callback page, check auth status
      checkAuth().then(() => {
        // Redirect to home after successful auth check
        window.history.replaceState({}, '', '/');
        window.location.href = '/';
      });
    }
  }, []);

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    checkAuth,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};