import React, { useState, useEffect } from 'react';
import api from '../services/api';

const ProjectsDashboardSimples: React.FC = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('🚀 useEffect executado');
    loadProjects();
  }, []);

  const loadProjects = async () => {
    console.log('📡 loadProjects chamado');
    setLoading(true);
    
    try {
      console.log('🔍 Chamando api.getProjects()...');
      const response = await api.getProjects();
      console.log('✅ Resposta recebida:', response);
      console.log('📊 response.data:', response?.data);
      console.log('📊 response.data?.projects:', response?.data?.projects);
      
      if (response?.data?.projects) {
        console.log(`✅ ${response.data.projects.length} projetos encontrados`);
        setProjects(response.data.projects);
      } else {
        console.warn('⚠️ Nenhum projeto encontrado');
        setProjects([]);
      }
    } catch (err: any) {
      console.error('❌ Erro:', err);
      setError(err.message);
    } finally {
      console.log('🏁 Finalizando loadProjects');
      setLoading(false);
    }
  };

  console.log('🎯 Renderizando, projects:', projects.length, 'loading:', loading, 'error:', error);

  if (loading) {
    return <div>Carregando projetos...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>Erro: {error}</div>;
  }

  return (
    <div>
      <h1>Projetos ({projects.length})</h1>
      {projects.length === 0 ? (
        <p>Nenhum projeto encontrado</p>
      ) : (
        <div>
          {projects.map(project => (
            <div key={project.id} style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}>
              <h3>{project.name}</h3>
              <p>{project.description || 'Sem descrição'}</p>
              <small>ID: {project.id}</small>
            </div>
          ))}
        </div>
      )}
      <button onClick={loadProjects}>Recarregar</button>
    </div>
  );
};

export default ProjectsDashboardSimples;