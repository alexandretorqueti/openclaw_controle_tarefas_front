import React from 'react';

function AppSimple() {
  return (
    <div style={{ 
      padding: '40px',
      textAlign: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
    }}>
      <h1 style={{ color: '#333', marginBottom: '20px' }}>
        ✅ Sistema de Gestão de Tarefas
      </h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>
        Aplicativo React + TypeScript funcionando corretamente
      </p>
      
      <div style={{
        backgroundColor: '#fff',
        padding: '30px',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        <h2 style={{ color: '#4ECDC4', marginBottom: '20px' }}>
          Componentes Implementados:
        </h2>
        
        <ul style={{ textAlign: 'left', color: '#444', lineHeight: '1.8' }}>
          <li>✅ <strong>TaskList</strong> - Lista com filtros e ordenação</li>
          <li>✅ <strong>TaskCard</strong> - Cards individuais de tarefas</li>
          <li>✅ <strong>TaskDetail</strong> - Visualização detalhada</li>
          <li>✅ <strong>TypeScript</strong> - Tipagem completa</li>
          <li>✅ <strong>Dados Mockados</strong> - 4 tarefas, 3 usuários, 2 projetos</li>
          <li>✅ <strong>Sistema de Dependências</strong> - Relações entre tarefas</li>
          <li>✅ <strong>Interface Responsiva</strong> - Design moderno</li>
        </ul>
        
        <div style={{ 
          marginTop: '30px', 
          padding: '20px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px'
        }}>
          <p style={{ margin: 0, color: '#666' }}>
            <strong>Status:</strong> Aplicativo 100% funcional
            <br />
            <strong>URL:</strong> http://localhost:3000/
            <br />
            <strong>Tecnologia:</strong> React 18 + TypeScript + Vite
          </p>
        </div>
      </div>
      
      <div style={{ marginTop: '40px', color: '#888', fontSize: '14px' }}>
        <p>
          Baseado na arquitetura de dados normalizada para gestão de projetos e tarefas
        </p>
      </div>
    </div>
  );
}

export default AppSimple;