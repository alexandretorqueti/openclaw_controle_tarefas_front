import React from 'react';

const TestApp: React.FC = () => {
  console.log('TestApp rendering');
  
  return (
    <div style={{ 
      padding: '40px',
      textAlign: 'center',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ color: 'green' }}>✅ TESTE REACT FUNCIONANDO</h1>
      <p>Se você está vendo esta mensagem, o React está carregando corretamente.</p>
      <p>Hora atual: {new Date().toLocaleTimeString()}</p>
    </div>
  );
};

export default TestApp;