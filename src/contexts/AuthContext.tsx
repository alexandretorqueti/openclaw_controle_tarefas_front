import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import apiService from '../services/api';
import { User } from '../types';

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
      
      // Check local storage for simple auth user
      const savedUser = localStorage.getItem('tarefas_user');
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
        setIsLoading(false);
        return;
      }

      // Get backend URL using helper function
      const backendUrl = getBackendUrl();
      
      const response = await fetch(`${backendUrl}/api/auth/check`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.isAuthenticated) {
          setUser(data.user);
          setIsAuthenticated(data.isAuthenticated);
        }
      }
    } catch (error) {
      console.error('Error checking auth:', error);
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
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};