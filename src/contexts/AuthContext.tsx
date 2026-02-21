import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import apiService from '../services/api';
import { User } from '../types';

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
      
      // Get current origin to determine backend URL
      const currentOrigin = window.location.origin;
      let backendUrl = 'http://localhost:3001';
      
      if (currentOrigin.includes('192.168.1.70')) {
        backendUrl = 'http://192.168.1.70:3001';
      } else if (currentOrigin.includes('tarefas.local')) {
        backendUrl = 'http://api.tarefas.local:3001';
      }
      
      const response = await fetch(`${backendUrl}/auth/check`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setIsAuthenticated(data.isAuthenticated);
      } else {
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
    // Get current origin (supports localhost, IP, or domain)
    const currentOrigin = window.location.origin;
    
    // Determine backend URL based on current frontend URL
    let backendUrl = 'http://localhost:3001';
    
    if (currentOrigin.includes('192.168.1.70')) {
      backendUrl = 'http://192.168.1.70:3001';
    } else if (currentOrigin.includes('tarefas.local')) {
      backendUrl = 'http://api.tarefas.local:3001';
    }
    
    // Redirect to Google OAuth with origin parameter
    const authUrl = `${backendUrl}/auth/google?origin=${encodeURIComponent(currentOrigin)}`;
    console.log(`🔐 Redirecting to auth: ${authUrl}`);
    window.location.href = authUrl;
  };

  const logout = async () => {
    try {
      // Get current origin to determine backend URL
      const currentOrigin = window.location.origin;
      let backendUrl = 'http://localhost:3001';
      
      if (currentOrigin.includes('192.168.1.70')) {
        backendUrl = 'http://192.168.1.70:3001';
      } else if (currentOrigin.includes('tarefas.local')) {
        backendUrl = 'http://api.tarefas.local:3001';
      }
      
      await fetch(`${backendUrl}/auth/logout`, {
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