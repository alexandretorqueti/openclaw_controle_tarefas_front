import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'; // Importar CSS global com variáveis
import { reportErrorToBackend } from './utils/errorReporter'; 

// --- 1. DEFINIÇÕES DE TIPAGEM E FUNÇÃO DE ENVIO PARA O BACKEND ---
interface ErrorData {
  type: string;
  message: string;
  stack?: string;
  line?: number;
  col?: number;
}

// --- 2. CAPTURA DE ERROS GLOBAIS ---
window.addEventListener('error', (event: ErrorEvent) => {
  console.error('Global error caught:', event.error);
  
  reportErrorToBackend({
    type: 'Sync Error',
    message: event.message,
    stack: event.error?.stack,
    line: event.lineno,
    col: event.colno
  });
});

window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
  console.error('Unhandled promise rejection:', event.reason);
  
  const reason = event.reason;
  reportErrorToBackend({
    type: 'Unhandled Promise',
    message: reason instanceof Error ? reason.message : String(reason),
    stack: reason instanceof Error ? reason.stack : undefined
  });
});

// --- 3. INICIALIZAÇÃO DO REACT ---
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element #root not found');
}

const root = ReactDOM.createRoot(rootElement);

try {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log('React application rendered successfully');
} catch (error) {
  console.error('Failed to render React app:', error);
  
  // Envia o erro de inicialização para o backend também
  reportErrorToBackend({
    type: 'React Initialization Error',
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined
  });
  
  // Fallback UI em caso de erro
  root.render(
    <div style={{ 
      padding: '40px',
      textAlign: 'center',
      fontFamily: 'Arial, sans-serif',
      color: '#333'
    }}>
      <h1 style={{ color: 'var(--danger-color)' }}>⚠️ Erro no Aplicativo</h1>
      <p>Ocorreu um erro ao carregar o aplicativo.</p>
      <p style={{ 
        backgroundColor: 'var(--bg-card)', 
        padding: '15px',
        borderRadius: '8px',
        marginTop: '20px',
        fontFamily: 'monospace',
        fontSize: '14px'
      }}>
        {error instanceof Error ? error.message : String(error)}
      </p>
      <button 
        onClick={() => window.location.reload()}
        style={{
          marginTop: '20px',
          padding: '10px 20px',
          backgroundColor: 'var(--accent-color)',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer'
        }}
      >
        Recarregar Página
      </button>
    </div>
  );
}