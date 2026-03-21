/// <reference types="vite/client" />

/**
 * Centralized API configuration
 * Uses VITE_API_URL environment variable or falls back to automatic detection
 */

/**
 * Get the base backend URL (without /api suffix)
 */
export const getBackendBaseUrl = (): string => {
  // First, try to use VITE_API_URL environment variable
  if (import.meta.env.VITE_API_URL) {
    const apiUrl = import.meta.env.VITE_API_URL;
    // Remove /api suffix if present to get base URL
    const apiUrl_ = apiUrl.replace(/\/api$/, '');
    console.log(`0 -🌐 Config: Using VITE_API_URL: ${apiUrl_}`);
    return apiUrl_;
  }
  
  // Fallback to automatic detection (for backward compatibility)
  const hostname = window.location.hostname;
  const port = window.location.port;
  
  // Determine backend port based on frontend port
  let backendPort = 8091; // Default to backend production port
  console.log(`00 - 🌐 Config: Frontend ${hostname}:${port} → Backend port ${backendPort}`);
  if (port === '8090' || port === '8091') {
    // Production environment
    backendPort = 8091;
    console.log(`1 - 🌐 Config: Frontend ${hostname}:${port} → Backend port ${backendPort}`);
  } else if (port === '3000') {
    // Development environment - backend runs on port 4001
    backendPort = 4001;
    console.log(`2 - 🌐 Config: Frontend ${hostname}:${port} → Backend port ${backendPort}`);
  } else if (!port) {
    // No port specified (default ports)
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      // Default to development for localhost without port
      backendPort = 4001;
      console.log(`3 - 🌐 Config: Frontend ${hostname}:${port} → Backend port ${backendPort}`);
    } else {
      // For other hosts without port, assume production
      backendPort = 8091;
      console.log(`4 - 🌐 Config: Frontend ${hostname}:${port} → Backend port ${backendPort}`);
    }
  }
  
  console.log(`🌐 Config: Frontend ${hostname}:${port} → Backend port ${backendPort}`);
  
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

/**
 * Get the full API URL (with /api suffix)
 */
export const getApiUrl = (): string => {
  return `${getBackendBaseUrl()}/api`;
};

/**
 * Configuration object for easy access
 */
export const config = {
  apiUrl: getApiUrl(),
  backendUrl: getBackendBaseUrl(),
  isProduction: window.location.port === '8090' || window.location.port === '8091',
  isDevelopment: window.location.port === '4000' || window.location.port === '3000' || (!window.location.port && window.location.hostname === 'localhost')
};