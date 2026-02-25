import React, { useState, useEffect } from 'react';
import apiService from '../services/api';

/**
 * Componente de teste para verificar processamento IA
 * Este componente demonstra que o sistema de IA pode criar novos componentes
 * e integrá-los com a API do backend.
 */
const IATest: React.FC = () => {
  const [testResult, setTestResult] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [timestamp, setTimestamp] = useState<string>('');

  const runTest = async () => {
    setLoading(true);
    try {
      const data = await apiService.request('/ia-test');
      setTestResult(JSON.stringify(data, null, 2));
      setTimestamp(new Date().toISOString());
    } catch (error: any) {
      setTestResult(`Erro: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Executa teste automaticamente ao montar
    runTest();
  }, []);

  return (
    <div style={{ 
      padding: '20px', 
      margin: '20px', 
      border: '1px solid #ccc', 
      borderRadius: '8px',
      backgroundColor: '#f9f9f9'
    }}>
      <h3>Teste de Processamento IA</h3>
      <p>
        Este componente foi criado automaticamente pelo sistema de processamento de IA
        como parte do teste da tarefa <strong>acce83e6-542f-49e1-87f9-be6a102fabdd</strong> (anteriormente afaa26ed-96d9-4067-a9e9-19e5854cdcec).
      </p>
      
      <div style={{ margin: '15px 0' }}>
        <button 
          onClick={runTest}
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: loading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Testando...' : 'Executar Teste'}
        </button>
      </div>

      {testResult && (
        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          backgroundColor: 'white', 
          border: '1px solid #ddd',
          borderRadius: '4px',
          fontFamily: 'monospace',
          fontSize: '14px',
          whiteSpace: 'pre-wrap'
        }}>
          <strong>Resposta da API:</strong>
          <pre>{testResult}</pre>
          {timestamp && <div><small>Timestamp: {timestamp}</small></div>}
        </div>
      )}

      <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
        <strong>Detalhes técnicos:</strong>
        <ul>
          <li>Endpoint testado: GET /api/ia-test</li>
          <li>Frontend: projetos-web (porta 3000)</li>
          <li>Backend: projetos-server (porta 3001)</li>
          <li>Alterações realizadas por subagent OpenClaw</li>
        </ul>
      </div>
    </div>
  );
};

export default IATest;