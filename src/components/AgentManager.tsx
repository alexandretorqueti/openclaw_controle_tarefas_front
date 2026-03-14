// @ts-nocheck
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Agent, AgentsResponse, OperationResponse } from '../types/agent';
import api from '../services/api';
import { FaRobot, FaPlus, FaEdit, FaTrash, FaLink, FaUnlink, FaSync, FaCheck, FaTimes, FaUserCircle, FaSpinner, FaSearch, FaTimesCircle } from 'react-icons/fa';

// Estilos inline para animações
const styles = {
  '@keyframes spin': {
    '0%': { transform: 'rotate(0deg)' },
    '100%': { transform: 'rotate(360deg)' }
  },
  '@keyframes slideIn': {
    '0%': { transform: 'translateX(100%)', opacity: 0 },
    '100%': { transform: 'translateX(0)', opacity: 1 }
  }
};

const AgentManager: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Filtros locais
  const [filterName, setFilterName] = useState('');
  const [filterModel, setFilterModel] = useState('');
  
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showBindingsModal, setShowBindingsModal] = useState<boolean>(false);
  const [newAgentName, setNewAgentName] = useState<string>('');
  const [newAgentWorkspace, setNewAgentWorkspace] = useState<string>('');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [editAgentName, setEditAgentName] = useState<string>('');
  const [editAgentEmoji, setEditAgentEmoji] = useState<string>('');
  const [editAgentAvatar, setEditAgentAvatar] = useState<string>('');
  const [editAgentModel, setEditAgentModel] = useState<string>('');
  const [editAgentWorkspace, setEditAgentWorkspace] = useState<string>('');
  const [editAgentVibe, setEditAgentVibe] = useState<string>('');
  const [editAgentSoul, setEditAgentSoul] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileLoading, setFileLoading] = useState(false);
  const [newBinding, setNewBinding] = useState<string>('');
  const [models, setModels] = useState<string[]>([]);
  
  // Estado para toast de processamento assíncrono
  const [processingToast, setProcessingToast] = useState<{
    visible: boolean;
    message: string;
    type: 'processing' | 'success' | 'error';
    steps?: string[];
    currentStep?: number;
  }>({
    visible: false,
    message: '',
    type: 'processing'
  });
  
  // Filtered agents (local filter)
  const filteredAgents = useMemo(() => {
    return agents.filter(agent =>
      agent.identity?.name?.toLowerCase().includes(filterName.toLowerCase()) &&
      (!filterModel || agent.identity?.model?.toLowerCase().includes(filterModel.toLowerCase()))
    );
  }, [agents, filterName, filterModel]);
  
  const loadAgents = async () => {
    setLoading(true);
    try {
      const response = await api.getAgents() as AgentsResponse;
      if (response.success) {
        setAgents(response.data);
      } else {
        // Mostrar erro via toast
        setProcessingToast({
          visible: true,
          message: `Erro ao carregar agentes: ${response.error || 'Erro desconhecido'}`,
          type: 'error'
        });
      }
    } catch (err: any) {
      // Mostrar erro via toast
      setProcessingToast({
        visible: true,
        message: `Erro ao conectar com o servidor: ${err.message || 'Erro desconhecido'}`,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadAgents();
    
    // Load models
    const loadModels = async () => {
      try {
        const data = await api.request('/models');
        setModels(data.models || []);
      } catch (error) {
        console.error('Error loading models:', error);
      }
    };
    
    loadModels();
  }, []);
  
  // ... resto do código igual (handleCreateAgent, handleDeleteAgent, etc. mantidos)
  
  const handleCreateAgent = async () => {
    // ... código existente
  };
  
  const handleDeleteAgent = async (id: string) => {
    // ... código existente
  };
  
  const handleUpdateAgent = async () => {
    // ... código existente
  };
  
  const clearMessages = () => {
    // ... código existente
  };
  
  const AgentAvatar: React.FC<{agent: Agent}> = ({ agent }) => {
    // ... código existente
  };
  
  const renderAgentAvatar = (agent: Agent) => {
    return <AgentAvatar agent={agent} />;
  };
  
  const formatDate = (dateString?: string) => {
    // ... código existente
  };
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header existente */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {/* ... header code */}
      </div>
      
      {/* Filtros Novos */}
      <div style={{
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap',
        alignItems: 'center',
        padding: '16px',
        backgroundColor: '#f8f9fa',
        borderRadius: '12px',
        border: '1px solid #e0e0e0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '200px' }}>
          <FaSearch size={16} color="#666" />
          <input
            placeholder="Filtrar por nome..."
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
            style={{
              flex: 1,
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '14px',
              outline: 'none'
            }}
          />
          {filterName && (
            <FaTimesCircle 
              size={16} 
              color="#999" 
              style={{ cursor: 'pointer' }}
              onClick={() => setFilterName('')}
            />
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '200px' }}>
          <FaSearch size={16} color="#666" />
          <input
            placeholder="Filtrar por modelo..."
            value={filterModel}
            onChange={(e) => setFilterModel(e.target.value)}
            style={{
              flex: 1,
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '14px',
              outline: 'none'
            }}
          />
          {filterModel && (
            <FaTimesCircle 
              size={16} 
              color="#999" 
              style={{ cursor: 'pointer' }}
              onClick={() => setFilterModel('')}
            />
          )}
        </div>
        <div style={{ 
          fontSize: '14px', 
          color: '#666', 
          whiteSpace: 'nowrap',
          fontWeight: 500
        }}>
          Resultados: {filteredAgents.length} de {agents.length}
        </div>
      </div>
      
      {/* Table existente, mas use filteredAgents */}
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '12px',
        border: '1px solid #e0e0e0',
        overflow: 'auto'
      }}>
        {loading && agents.length === 0 ? (
          // ... loading spinner
        ) : filteredAgents.length === 0 ? (
          <div style={{
            padding: '48px',
            textAlign: 'center',
            color: '#666'
          }}>
            <FaRobot style={{ fontSize: '48px', margin: '0 auto 16px', color: '#ddd' }} />
            <p style={{ fontSize: '18px', margin: '0 0 8px' }}>
              Nenhum agente encontrado
              {filterName || filterModel ? ' com os filtros aplicados' : ''}
            </p>
            <p style={{ fontSize: '14px' }}>
              {filterName || filterModel 
                ? 'Ajuste os filtros ou limpe para ver todos' 
                : 'Crie seu primeiro agente para começar'
              }
            </p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            {/* thead existente */}
            <thead>
              {/* ... thead code */}
            </thead>
            <tbody>
              {filteredAgents.map((agent) => (
                // ... tr code existente
              ))}
            </tbody>
          </table>
        )}
      </div>
      
      {/* Modals existentes mantidos */}
      {/* ... create/edit/bindings modals */}
    </div>
  );
};

export default AgentManager;