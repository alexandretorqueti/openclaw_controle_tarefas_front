// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Agent, AgentsResponse, OperationResponse } from '../types/agent';
import api from '../services/api';
import { FaRobot, FaPlus, FaEdit, FaTrash, FaLink, FaUnlink, FaSync, FaCheck, FaTimes, FaUserCircle, FaSpinner } from 'react-icons/fa';

const AgentManager: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [newAgentName, setNewAgentName] = useState<string>('');
  const [newAgentWorkspace, setNewAgentWorkspace] = useState<string>('');
  
  const loadAgents = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.getAgents() as AgentsResponse;
      if (response.success) {
        setAgents(response.data);
      } else {
        setError(response.error || 'Erro ao carregar agentes');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadAgents();
  }, []);
  
  const handleCreateAgent = async () => {
    if (!newAgentName.trim()) {
      setError('O nome do agente é obrigatório');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.createAgent({
        name: newAgentName,
        workspace: newAgentWorkspace || undefined
      }) as OperationResponse;
      
      if (response.success) {
        setSuccessMessage('Agente criado com sucesso!');
        setShowCreateModal(false);
        setNewAgentName('');
        setNewAgentWorkspace('');
        loadAgents();
      } else {
        setError(response.error || 'Erro ao criar agente');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao criar agente');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteAgent = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este agente?')) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.deleteAgent(id) as OperationResponse;
      
      if (response.success) {
        setSuccessMessage('Agente excluído com sucesso!');
        loadAgents();
      } else {
        setError(response.error || 'Erro ao excluir agente');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao excluir agente');
    } finally {
      setLoading(false);
    }
  };
  
  const clearMessages = () => {
    setError(null);
    setSuccessMessage(null);
  };
  
  const renderAgentAvatar = (agent: Agent) => {
    if (agent.identity && agent.identity.avatar) {
      return (
        <img 
          src={agent.identity.avatar} 
          alt={agent.identity.name || 'Agente'}
          className="w-8 h-8 rounded-full object-cover"
        />
      );
    }
    
    if (agent.identity && agent.identity.emoji) {
      return (
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-lg">
          {agent.identity.emoji}
        </div>
      );
    }
    
    return <FaUserCircle className="w-8 h-8 text-gray-400" />;
  };
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaRobot className="text-blue-500" />
            Gerenciamento de Agentes OpenClaw
          </h1>
          <p className="text-gray-600 mt-1">Gerencie agentes através da CLI do OpenClaw</p>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={loadAgents}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center gap-2"
            disabled={loading}
          >
            <FaSync className={loading ? 'animate-spin' : ''} />
            Atualizar
          </button>
          
          <button 
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center gap-2"
          >
            <FaPlus />
            Novo Agente
          </button>
        </div>
      </div>
      
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <FaTimes className="text-red-500" />
          <div>
            <p className="text-red-700 font-medium">Erro</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
          <button 
            onClick={clearMessages}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            <FaTimes />
          </button>
        </div>
      )}
      
      {successMessage && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <FaCheck className="text-green-500" />
          <div>
            <p className="text-green-700 font-medium">Sucesso</p>
            <p className="text-green-600 text-sm">{successMessage}</p>
          </div>
          <button 
            onClick={clearMessages}
            className="ml-auto text-green-500 hover:text-green-700"
          >
            <FaTimes />
          </button>
        </div>
      )}
      
      <div className="overflow-x-auto">
        {loading && agents.length === 0 ? (
          <div className="flex justify-center items-center py-12">
            <FaSpinner className="animate-spin text-3xl text-blue-500" />
            <span className="ml-3 text-gray-600">Carregando agentes...</span>
          </div>
        ) : agents.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FaRobot className="text-4xl mx-auto mb-3 text-gray-300" />
            <p className="text-lg">Nenhum agente encontrado</p>
            <p className="text-sm mt-1">Crie seu primeiro agente para começar</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Agente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bindings
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Workspace
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Criado em
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {agents.map((agent) => (
                <tr key={agent.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        {renderAgentAvatar(agent)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {agent.identity ? agent.identity.name : 'Sem nome'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {agent.identity && agent.identity.emoji && (
                            <span className="mr-2">{agent.identity.emoji}</span>
                          )}
                          {agent.identity && agent.identity.avatar && (
                            <span className="text-xs">Avatar configurado</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-mono">{agent.id}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {agent.bindings && agent.bindings.length > 0 ? (
                        agent.bindings.map((binding, index) => (
                          <span 
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {binding}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-gray-500">Nenhum binding</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {agent.workspace || '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(agent.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => alert('Edição ainda não implementada')}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteAgent(agent.id)}
                        className="text-red-600 hover:text-red-900"
                        disabled={loading}
                      >
                        <FaTrash />
                      </button>
                      <button
                        onClick={() => alert('Bindings ainda não implementado')}
                        className="text-green-600 hover:text-green-900"
                      >
                        <FaLink />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Criar Novo Agente</h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Agente *
                </label>
                <input
                  type="text"
                  value={newAgentName}
                  onChange={(e) => setNewAgentName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: MeuAgente"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Workspace (opcional)
                </label>
                <input
                  type="text"
                  value={newAgentWorkspace}
                  onChange={(e) => setNewAgentWorkspace(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="/caminho/para/workspace"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Caminho absoluto para o workspace do agente
                </p>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateAgent}
                disabled={loading || !newAgentName.trim()}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? <FaSpinner className="animate-spin" /> : <FaPlus />}
                Criar Agente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentManager;