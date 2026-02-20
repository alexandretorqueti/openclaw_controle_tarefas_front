import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Capturar erros globais
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

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
  
  // Fallback UI em caso de erro
  root.render(
    <div style={{ 
      padding: '40px',
      textAlign: 'center',
      fontFamily: 'Arial, sans-serif',
      color: '#333'
    }}>
      <h1 style={{ color: '#FF6B6B' }}>⚠️ Erro no Aplicativo</h1>
      <p>Ocorreu um erro ao carregar o aplicativo.</p>
      <p style={{ 
        backgroundColor: '#f8f9fa', 
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
          backgroundColor: '#4ECDC4',
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