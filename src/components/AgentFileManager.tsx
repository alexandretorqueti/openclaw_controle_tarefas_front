import React, { useState, useEffect } from 'react';
import { FaFile, FaSave, FaSync, FaCode, FaTimes, FaInfoCircle } from 'react-icons/fa';
import apiService from '../services/api';
import './AgentFileManager.css';

interface AgentFileManagerProps {
  agentId: string;
  onClose?: () => void;
}

interface AgentFile {
  name: string;
  description: string;
  icon?: React.ReactNode;
}

const AGENT_FILES: AgentFile[] = [
  {
    name: 'SOUL.md',
    description: 'Instruções principais e comportamento do agente',
    icon: <FaCode />
  },
  {
    name: 'IDENTITY.md',
    description: 'Definição da identidade e personalização do agente',
    icon: <FaFile />
  }
];

const AgentFileManager: React.FC<AgentFileManagerProps> = ({ agentId, onClose }) => {
  const [selectedFile, setSelectedFile] = useState<AgentFile | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [fileNotFound, setFileNotFound] = useState<boolean>(false);

  const loadFile = async (file: AgentFile) => {
    setLoading(true);
    setError('');
    setSuccess('');
    setFileNotFound(false);

    try {
      const response = await apiService.request(`/agents/${agentId}/files/${file.name}`);
      
      if (response.success) {
        setFileContent(response.data || '');
      } else {
        setFileContent('');
        setFileNotFound(true);
        setError(`Arquivo ${file.name} não encontrado no workspace do agente`);
      }
    } catch (err: any) {
      // Se arquivo não existe, consideramos sucesso com conteúdo vazio
      if (err.message?.includes('Não encontrado') || err.message?.includes('not found')) {
        setFileContent('');
        setFileNotFound(true);
        setError(`Arquivo ${file.name} não existe ainda. Criado automaticamente ao salvar.`);
      } else {
        setError(err.message || 'Erro ao carregar arquivo');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedFile) return;

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await apiService.updateAgentFile(agentId, selectedFile.name, fileContent);
      setSuccess(`Arquivo ${selectedFile.name} salvo com sucesso!`);
      setTimeout(() => {
        if (onClose) {
          onClose();
        }
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar arquivo');
    } finally {
      setSaving(false);
    }
  };

  const handleLoad = () => {
    if (selectedFile) {
      loadFile(selectedFile);
    }
  };

  useEffect(() => {
    if (selectedFile) {
      handleLoad();
    }
  }, [selectedFile, agentId]);

  // Se o arquivo não foi selecionado ainda, mostrar lista
  if (!selectedFile) {
    return (
      <div className="agent-file-manager">
        <div className="agent-file-manager-header">
          <h3>Gerenciar Arquivos do Agente</h3>
          <button 
            className="btn btn-secondary btn-sm"
            onClick={onClose}
          >
            <FaTimes size={12} /> Fechar
          </button>
        </div>
        
        <div className="agent-file-list">
          <p className="agent-file-description">
            Selecione um arquivo para editar as instruções do agente:
          </p>
          
          {AGENT_FILES.map((file) => (
            <div 
              key={file.name}
              className="agent-file-item"
              onClick={() => setSelectedFile(file)}
            >
              <div className="agent-file-icon">
                {file.icon}
              </div>
              <div className="agent-file-info">
                <h4>{file.name}</h4>
                <p>{file.description}</p>
              </div>
              <div className="agent-file-action">
                <span className="file-action-text">Editar</span>
                <FaCode className="file-action-icon" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="agent-file-manager">
      <div className="agent-file-manager-header">
        <div className="file-header-info">
          <h3>{selectedFile.name}</h3>
          <p>{selectedFile.description}</p>
        </div>
        <div className="file-header-actions">
          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => window.confirm('Deseja voltar? As alterações não salvas serão perdidas.') && setSelectedFile(null)}
            disabled={loading || saving}
          >
            <FaTimes size={12} /> Voltar
          </button>
          
          {loading && (
            <button className="btn btn-secondary btn-sm" disabled>
              <FaSync className="loading-icon" /> Carregando...
            </button>
          )}
          
          <button 
            className="btn btn-primary btn-sm"
            onClick={handleSave}
            disabled={saving || loading}
          >
            <FaSave size={12} /> {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>

      {error && (
        <div className="file-error">
          <FaInfoCircle /> {error}
        </div>
      )}

      {success && (
        <div className="file-success">
          ✓ {success}
        </div>
      )}

      <div className="file-editor-container">
        <textarea
          className="file-textarea"
          value={fileContent}
          onChange={(e) => setFileContent(e.target.value)}
          disabled={loading || saving}
          placeholder={fileNotFound ? 'Arquivo não existe. Digite o conteúdo para criar...' : 'Editar conteúdo do arquivo...'}
          spellCheck={false}
        />
      </div>

      <div className="file-editor-footer">
        <div className="file-info">
          <span className="char-count">
            Caracteres: {fileContent.length}
          </span>
          <span className="line-count">
            Linhas: {fileContent ? fileContent.split('\n').length : 0}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AgentFileManager;