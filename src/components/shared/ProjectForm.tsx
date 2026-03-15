import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Project, Agent } from '../types';
import { FaFolder, FaCodeBranch, FaTerminal } from 'react-icons/fa';
import './FormStyles.css';

interface ProjectFormProps {
  project?: Project | null;
  onSubmit: (data: Partial<Project>) => Promise<void>;
  loading?: boolean;
  error?: string | null;
  agents?: Agent[];
}

interface ProjectFormHandle {
  submitForm: () => Promise<void>;
  getFormData: () => Partial<Project>;
}

const ProjectForm = forwardRef<ProjectFormHandle, ProjectFormProps>(({
  project,
  onSubmit,
  loading = false,
  error = null,
  agents = [] as Agent[],
}, ref) => {
  const [formData, setFormData] = useState<Partial<Project>>({
    name: '',
    description: '',
    regras: '',
    status: true,
    ativo: true,
    frontendPath: '',
    frontendPort: undefined,
    backendPath: '',
    backendPort: undefined,
    repositoryUrl: '',
    pastaBase: '',
    agent: '',
    programadorContratado: '',
    modeloAuxiliar: '',
    modeloAuxiliarCustom: '',
    frontendBuildCmd: '',
    backendBuildCmd: '',
  });

  const [localAgents, setLocalAgents] = useState<Agent[]>(agents);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [loadingModels, setLoadingModels] = useState<boolean>(false);

  // Carregar agentes se não fornecidos
  useEffect(() => {
    if (agents.length === 0) {
      const loadAgents = async () => {
        try {
          console.log('DEBUG: Carregando agentes...');
          const response = await fetch('http://localhost:3001/api/agents');
          if (response.ok) {
            const data = await response.json();
            const agentsList = data.data ? data.data : [];
            console.log('DEBUG: Agentes carregados:', agentsList.length, agentsList);
            setLocalAgents(agentsList);
          } else {
            console.error('DEBUG: Erro na resposta ao carregar agentes:', response.status);
          }
        } catch (error) {
          console.error('DEBUG: Erro ao carregar agentes:', error);
        }
      };
      loadAgents();
    } else {
      console.log('DEBUG: Agentes fornecidos via props:', agents.length);
      setLocalAgents(agents);
    }
  }, [agents]);

  // Carregar modelos disponíveis da API
  useEffect(() => {
    const loadModels = async () => {
      try {
        setLoadingModels(true);
        console.log('DEBUG: Carregando modelos da API...');
        const response = await fetch('http://localhost:3001/api/models');
        if (response.ok) {
          const data = await response.json();
          const modelsList = data.models || [];
          console.log('DEBUG: Modelos carregados:', modelsList.length, modelsList.slice(0, 5));
          setAvailableModels(modelsList);
        } else {
          console.error('DEBUG: Erro na resposta ao carregar modelos:', response.status);
          // Fallback para lista fixa se API falhar
          setAvailableModels([
            'deepseek/deepseek-chat',
            'gpt-4o',
            'gpt-4-turbo',
            'claude-3-opus',
            'claude-3-sonnet',
            'claude-3-haiku',
            'gemini-1.5-pro',
            'gemini-1.5-flash',
            'llama-3.1-70b',
            'llama-3.2-3b',
            'mistral-large',
            'mixtral-8x7b',
            'phi-4',
            'codellama'
          ]);
        }
      } catch (error) {
        console.error('DEBUG: Erro ao carregar modelos:', error);
        // Fallback para lista fixa
        setAvailableModels([
          'deepseek/deepseek-chat',
          'gpt-4o',
          'gpt-4-turbo',
          'claude-3-opus',
          'claude-3-sonnet',
          'claude-3-haiku',
          'gemini-1.5-pro',
          'gemini-1.5-flash',
          'llama-3.1-70b',
          'llama-3.2-3b',
          'mistral-large',
          'mixtral-8x7b',
          'phi-4',
          'codellama'
        ]);
      } finally {
        setLoadingModels(false);
      }
    };

    loadModels();
  }, []);

  // Recarregar formulário quando modelos terminarem de carregar
  useEffect(() => {
    if (project && !loadingModels && availableModels.length > 0) {
      console.log('DEBUG: Modelos carregados, recalculando modeloAuxiliar...');
      
      // Determinar se o modelo auxiliar é um valor da lista ou custom
      const modeloAuxiliarValue = project.modeloAuxiliar || '';
      const isInList = availableModels.includes(modeloAuxiliarValue);
      
      console.log('DEBUG: Recalculando modelo auxiliar:', {
        modeloAuxiliarValue,
        isInList,
        availableModels: availableModels.slice(0, 5)
      });
      
      setFormData(prev => ({
        ...prev,
        modeloAuxiliar: isInList ? modeloAuxiliarValue : (modeloAuxiliarValue ? 'custom' : ''),
        modeloAuxiliarCustom: !isInList ? modeloAuxiliarValue : '',
      }));
    }
  }, [loadingModels, availableModels, project]);

  // Preencher formulário se projeto fornecido
  useEffect(() => {
    if (project) {
      console.log('DEBUG: ProjectForm inicializando com projeto:', {
        project,
        agent: project.agent,
        name: project.name,
        description: project.description,
        modeloAuxiliar: project.modeloAuxiliar,
        availableModelsLength: availableModels.length,
        loadingModels
      });
      
      // Se ainda estiver carregando modelos, não preencher o campo modeloAuxiliar ainda
      if (loadingModels) {
        console.log('DEBUG: Ainda carregando modelos, aguardando...');
        return;
      }
      
      // Determinar se o modelo auxiliar é um valor da lista ou custom
      const modeloAuxiliarValue = project.modeloAuxiliar || '';
      const isInList = availableModels.includes(modeloAuxiliarValue);
      
      console.log('DEBUG: Modelo auxiliar lógica:', {
        modeloAuxiliarValue,
        isInList,
        availableModels: availableModels.slice(0, 5)
      });
      
      setFormData({
        name: project.name || '',
        description: project.description || '',
        regras: project.regras || '',
        status: project.status !== undefined ? project.status : true,
        ativo: project.ativo !== undefined ? project.ativo : true,
        frontendPath: project.frontendPath || '',
        frontendPort: project.frontendPort || undefined,
        backendPath: project.backendPath || '',
        backendPort: project.backendPort || undefined,
        repositoryUrl: project.repositoryUrl || '',
        pastaBase: project.pastaBase || '',
        agent: project.agent || '',
        programadorContratado: project.programadorContratado || '',
        modeloAuxiliar: isInList ? modeloAuxiliarValue : (modeloAuxiliarValue ? 'custom' : ''),
        modeloAuxiliarCustom: !isInList ? modeloAuxiliarValue : '',
        frontendBuildCmd: project.frontendBuildCmd || '',
        backendBuildCmd: project.backendBuildCmd || '',
      });
    } else {
      console.log('DEBUG: ProjectForm em modo criação (project é null)');
    }
  }, [project, availableModels, loadingModels]);

  const handleSubmit = async () => {
    console.log('DEBUG: ProjectForm handleSubmit CHAMADO, formData:', formData);
    
    // Converter campos vazios para null/undefined conforme esperado pelo backend
    const submitData: Partial<Project> = {
      ...formData,
      description: formData.description || '',
      regras: formData.regras || null,
      frontendPath: formData.frontendPath || null,
      frontendPort: formData.frontendPort || null,
      backendPath: formData.backendPath || null,
      backendPort: formData.backendPort || null,
      repositoryUrl: formData.repositoryUrl || null,
      pastaBase: formData.pastaBase || null,
      agent: formData.agent || null,
      programadorContratado: formData.programadorContratado || null,
      frontendBuildCmd: formData.frontendBuildCmd || null,
      backendBuildCmd: formData.backendBuildCmd || null,
    };

    console.log('DEBUG: submitData após conversão:', submitData);
    
    // Remover campos que não foram modificados (valores padrão)
    const cleanedData: Partial<Project> = {};
    
    // Apenas incluir campos que têm valores diferentes dos padrões
    if (submitData.name && submitData.name !== '') cleanedData.name = submitData.name;
    if (submitData.description !== undefined) cleanedData.description = submitData.description;
    if (submitData.regras !== undefined) cleanedData.regras = submitData.regras;
    if (submitData.status !== undefined) cleanedData.status = submitData.status;
    if (submitData.ativo !== undefined) cleanedData.ativo = submitData.ativo;
    if (submitData.frontendPath !== undefined) cleanedData.frontendPath = submitData.frontendPath;
    if (submitData.frontendPort !== undefined && submitData.frontendPort !== 0) cleanedData.frontendPort = submitData.frontendPort;
    if (submitData.backendPath !== undefined) cleanedData.backendPath = submitData.backendPath;
    if (submitData.backendPort !== undefined && submitData.backendPort !== 0) cleanedData.backendPort = submitData.backendPort;
    if (submitData.repositoryUrl !== undefined) cleanedData.repositoryUrl = submitData.repositoryUrl;
    if (submitData.pastaBase !== undefined) cleanedData.pastaBase = submitData.pastaBase;
    if (submitData.agent !== undefined) cleanedData.agent = submitData.agent;
    if (submitData.programadorContratado !== undefined) cleanedData.programadorContratado = submitData.programadorContratado;
    
    // Lógica especial para modelo auxiliar
    if (submitData.modeloAuxiliar !== undefined) {
      if (submitData.modeloAuxiliar === 'custom' && submitData.modeloAuxiliarCustom) {
        // Se selecionou "custom" e preencheu campo personalizado
        cleanedData.modeloAuxiliar = submitData.modeloAuxiliarCustom;
      } else if (submitData.modeloAuxiliar && submitData.modeloAuxiliar !== 'custom') {
        // Se selecionou um modelo da lista (não custom)
        cleanedData.modeloAuxiliar = submitData.modeloAuxiliar;
      } else {
        // Vazio ou custom sem valor personalizado
        cleanedData.modeloAuxiliar = null;
      }
    }
    
    if (submitData.frontendBuildCmd !== undefined) cleanedData.frontendBuildCmd = submitData.frontendBuildCmd;
    if (submitData.backendBuildCmd !== undefined) cleanedData.backendBuildCmd = submitData.backendBuildCmd;

    console.log('DEBUG: cleanedData a ser enviado:', cleanedData);
    
    await onSubmit(cleanedData);
  };

  const handleChange = (field: keyof Project, value: any) => {
    console.log('DEBUG: handleChange chamado', { field, value, currentFormData: formData });
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value
      };
      console.log('DEBUG: Novo formData após handleChange', newData);
      return newData;
    });
  };

  // Expor métodos via ref
  useImperativeHandle(ref, () => ({
    submitForm: handleSubmit,
    getFormData: () => formData
  }));

  return (
    <div className="form-container">
      {error && (
        <div className="form-message form-message-error">
          {error}
        </div>
      )}

      {/* Seção: Informações Básicas */}
      <div className="form-section">
        <div className="form-section-header">
          <div className="form-section-icon">
            <FaFolder size={20} />
          </div>
          <div>
            <h3 className="form-section-title">Informações Básicas</h3>
            <p className="form-section-subtitle">
              Dados principais do projeto
            </p>
          </div>
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label className="form-label form-label-required">
              Nome do Projeto
            </label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => handleChange('name', e.target.value)}
              className="form-input"
              required
              minLength={3}
              maxLength={100}
              placeholder="Ex: Sistema de Gestão de Tarefas"
            />
            <p className="form-help">
              Mínimo 3 caracteres, máximo 100
            </p>
          </div>

          <div className="form-group">
            <label className="form-label">
              Status
            </label>
            <select
              value={formData.status ? 'true' : 'false'}
              onChange={(e) => handleChange('status', e.target.value === 'true')}
              className="form-select"
            >
              <option value="true">Ativo</option>
              <option value="false">Inativo</option>
            </select>
          </div>

          <div className="form-group form-grid-full">
            <label className="form-label">
              Descrição
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
              className="form-textarea"
              placeholder="Descreva o propósito e objetivos do projeto"
              maxLength={500}
            />
            <p className="form-help">
              Máximo 500 caracteres
            </p>
          </div>

          <div className="form-group form-grid-full">
            <label className="form-label">
              Regras (opcional)
            </label>
            <textarea
              value={formData.regras || ''}
              onChange={(e) => handleChange('regras', e.target.value)}
              rows={4}
              className="form-textarea form-textarea-monospace"
              placeholder="Insira as regras específicas para este projeto..."
            />
            <p className="form-help">
              Regras de negócio, restrições ou diretrizes especiais
            </p>
          </div>
        </div>
      </div>

      {/* Seção: Configurações de Repositório */}
      <div className="form-section">
        <div className="form-section-header">
          <div className="form-section-icon">
            <FaCodeBranch size={20} />
          </div>
          <div>
            <h3 className="form-section-title">Configurações de Repositório</h3>
            <p className="form-section-subtitle">
              Caminhos e URLs dos repositórios
            </p>
          </div>
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">
              Caminho Frontend
            </label>
            <input
              type="text"
              value={formData.frontendPath || ''}
              onChange={(e) => handleChange('frontendPath', e.target.value)}
              className="form-input"
              placeholder="/caminho/para/frontend"
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Caminho Backend
            </label>
            <input
              type="text"
              value={formData.backendPath || ''}
              onChange={(e) => handleChange('backendPath', e.target.value)}
              className="form-input"
              placeholder="/caminho/para/backend"
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Porta Frontend
            </label>
            <input
              type="number"
              value={formData.frontendPort || ''}
              onChange={(e) => handleChange('frontendPort', e.target.value ? parseInt(e.target.value) : null)}
              className="form-input"
              placeholder="3000"
              min="1"
              max="65535"
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Porta Backend
            </label>
            <input
              type="number"
              value={formData.backendPort || ''}
              onChange={(e) => handleChange('backendPort', e.target.value ? parseInt(e.target.value) : null)}
              className="form-input"
              placeholder="3001"
              min="1"
              max="65535"
            />
          </div>

          <div className="form-group form-grid-full">
            <label className="form-label">
              URL do Repositório
            </label>
            <input
              type="text"
              value={formData.repositoryUrl || ''}
              onChange={(e) => handleChange('repositoryUrl', e.target.value)}
              className="form-input"
              placeholder="https://github.com/usuario/projeto"
            />
          </div>

          <div className="form-group form-grid-full">
            <label className="form-label">
              Pasta Base
            </label>
            <input
              type="text"
              value={formData.pastaBase || ''}
              onChange={(e) => handleChange('pastaBase', e.target.value)}
              className="form-input"
              placeholder="/caminho/para/pasta-base"
            />
          </div>
        </div>
      </div>

      {/* Seção: Configurações Avançadas */}
      <div className="form-section">
        <div className="form-section-header">
          <div className="form-section-icon">
            <FaTerminal size={20} />
          </div>
          <div>
            <h3 className="form-section-title">Configurações Avançadas</h3>
            <p className="form-section-subtitle">
              Agente e comandos de build
            </p>
          </div>
        </div>

        <div className="form-grid">
          <div className="form-group form-grid-full">
            <label className="form-label">
              Arquiteto contratado
            </label>
            <select
              value={formData.agent || ''}
              onChange={(e) => {
                console.log('DEBUG: Select onChange disparado', { 
                  value: e.target.value,
                  selectedIndex: e.target.selectedIndex,
                  options: e.target.options
                });
                handleChange('agent', e.target.value || null);
              }}
              className="form-select"
            >
              <option value="">Selecione um agente...</option>
              {localAgents.length > 0 ? (
                localAgents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.identity?.name || agent.id} {agent.identity?.model ? `(${agent.identity.model})` : ''}
                  </option>
                ))
              ) : (
                <option value="">Carregando agentes...</option>
              )}
            </select>
            <p className="form-help">
              Agente padrão para tarefas deste projeto
            </p>
          </div>

          <div className="form-group form-grid-full">
            <label className="form-label">
              Programador Contratado
            </label>
            <select
              value={formData.programadorContratado || ''}
              onChange={(e) => {
                console.log('DEBUG: Select onChange disparado para programadorContratado', { 
                  value: e.target.value,
                  selectedIndex: e.target.selectedIndex,
                  options: e.target.options
                });
                handleChange('programadorContratado', e.target.value || null);
              }}
              className="form-select"
            >
              <option value="">Selecione um programador...</option>
              {localAgents.length > 0 ? (
                localAgents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.identity?.name || agent.id} {agent.identity?.model ? `(${agent.identity.model})` : ''}
                  </option>
                ))
              ) : (
                <option value="">Carregando agentes...</option>
              )}
            </select>
            <p className="form-help">
              Programador padrão para novas tarefas deste projeto
            </p>
          </div>

          <div className="form-group form-grid-full">
            <label className="form-label">
              Modelo Auxiliar
            </label>
            <select
              value={formData.modeloAuxiliar || ''}
              onChange={(e) => handleChange('modeloAuxiliar', e.target.value || null)}
              className="form-select"
              disabled={loadingModels}
            >
              <option value="">{loadingModels ? 'Carregando modelos...' : 'Selecione um modelo (opcional)...'}</option>
              {availableModels.map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
              <option value="custom">Personalizado (digite abaixo)</option>
            </select>
            <p className="form-help">
              Modelo auxiliar para tarefas específicas. Deixe vazio para usar o padrão do sistema.
            </p>
            
            {/* Campo para modelo personalizado (aparece apenas se "custom" selecionado) */}
            {formData.modeloAuxiliar === 'custom' && (
              <div className="form-group margin-top-10">
                <label className="form-label">
                  Nome do Modelo Personalizado
                </label>
                <input
                  type="text"
                  value={formData.modeloAuxiliarCustom || ''}
                  onChange={(e) => handleChange('modeloAuxiliarCustom', e.target.value)}
                  className="form-input"
                  placeholder="Ex: meu-modelo-local, provider/modelo"
                  maxLength={100}
                />
                <p className="form-help">
                  Digite o nome completo do modelo (provedor/modelo)
                </p>
              </div>
            )}
          </div>

          <div className="form-group form-grid-full">
            <label className="form-label">
              Comando Build Frontend
            </label>
            <input
              type="text"
              value={formData.frontendBuildCmd || ''}
              onChange={(e) => handleChange('frontendBuildCmd', e.target.value)}
              className="form-input"
              placeholder="npm run build"
            />
          </div>

          <div className="form-group form-grid-full">
            <label className="form-label">
              Comando Build Backend
            </label>
            <input
              type="text"
              value={formData.backendBuildCmd || ''}
              onChange={(e) => handleChange('backendBuildCmd', e.target.value)}
              className="form-input"
              placeholder="npm run build"
            />
          </div>
        </div>
      </div>

    </div>
  );
});

export default ProjectForm;