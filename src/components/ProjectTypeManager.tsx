import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { ProjectType } from '../types';
import './ProjectTypeManager.css';

const ProjectTypeManager: React.FC = () => {
  const [projectTypes, setProjectTypes] = useState<ProjectType[]>([]);
  const [editingProjectType, setEditingProjectType] = useState<ProjectType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state for new project type
  const [newProjectType, setNewProjectType] = useState({
    name: '',
    personaPrompt: '',
    baseRules: '',
    color: '#9D4EDD' // Cor padrão
  });

  // Form visibility state
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Paleta de cores
  const colorPalette = [
    '#9D4EDD', // Roxo
    '#10B981', // Verde
    '#118AB2', // Azul
    '#F59E0B', // Amarelo
    '#EF4444', // Vermelho
    '#8B5CF6', // Violeta
    '#EC4899', // Rosa
    '#14B8A6', // Turquesa
    '#F97316', // Laranja
    '#6366F1'  // Índigo
  ];

  // Sugestões de tipos comuns
  const commonTypes = [
    { name: 'DEV', personaPrompt: 'Você é um Desenvolvedor Sênior especializado em arquitetura de software e boas práticas de código. Sua missão é garantir que as soluções sejam escaláveis, mantíveis e seguindo os padrões da indústria.', baseRules: '1. Sempre priorize código limpo e legível.\n2. Use versionamento (Git) para todas as alterações.\n3. Escreva testes automatizados quando aplicável.\n4. Documente decisões arquiteturais importantes.\n5. Siga os princípios SOLID e padrões de design apropriados.' },
    { name: 'MARKETING', personaPrompt: 'Você é um Especialista em Marketing Digital com foco em estratégias de crescimento, análise de métricas e campanhas de conversão. Sua abordagem é data-driven e orientada a resultados.', baseRules: '1. Todas as campanhas devem ter KPIs claramente definidos.\n2. Análise de ROI é obrigatória para qualquer investimento.\n3. Conteúdo deve ser otimizado para SEO.\n4. Use ferramentas de analytics para medir desempenho.\n5. Testes A/B são recomendados para otimização contínua.' },
    { name: 'VENDAS', personaPrompt: 'Você é um Executivo de Vendas com expertise em prospecção, negociação e fechamento de contratos. Foca em construir relacionamentos de longo prazo e entender profundamente as necessidades do cliente.', baseRules: '1. Mantenha o CRM sempre atualizado.\n2. Follow-up deve ocorrer em até 24h após o primeiro contato.\n3. Propostas comerciais devem incluir escopo, prazos e valores claros.\n4. Negocie com foco em criar valor mútuo.\n5. Feedback do cliente deve ser documentado e analisado.' },
    { name: 'DESIGN', personaPrompt: 'Você é um Designer de Experiência do Usuário (UX/UI) com olhar crítico para usabilidade, acessibilidade e estética. Prioriza a jornada do usuário e a consistência visual.', baseRules: '1. Protótipos devem ser testados com usuários reais.\n2. Siga o sistema de design estabelecido (cores, tipografia, componentes).\n3. Priorize acessibilidade (WCAG 2.1 AA).\n4. Documente decisões de design no Figma/Zeplin.\n5. Colabore com desenvolvedores para garantir fidelidade na implementação.' },
    { name: 'IA', personaPrompt: 'Você é um Especialista em IA com conhecimento em modelos de linguagem, processamento de dados e automação inteligente. Aborda problemas com pensamento algorítmico e creatividade técnica.', baseRules: '1. Avalie sempre a qualidade e relevância dos dados.\n2. Considere viés algorítmico e ética em IA.\n3. Documente modelos e parâmetros usados.\n4. Teste com cenários diversos e casos extremos.\n5. Mantenha-se atualizado com avanços na área.' }
  ];

  useEffect(() => {
    loadProjectTypes();
  }, []);

  const loadProjectTypes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getProjectTypes();
      const data = (response as any).data || response;
      const projectTypesArray = Array.isArray(data) ? data : (data.projectTypes || []);
      setProjectTypes(projectTypesArray);
    } catch (error) {
      console.error('Erro ao carregar tipos de projeto:', error);
      setError('Não foi possível carregar os tipos de projeto. Verifique a conexão com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    // Validation
    if (!newProjectType.name.trim()) {
      setError('O nome do tipo de projeto é obrigatório');
      return;
    }
    if (!newProjectType.personaPrompt.trim()) {
      setError('O prompt da persona é obrigatório');
      return;
    }

    try {
      setError(null);
      const projectTypeData = {
        name: newProjectType.name,
        personaPrompt: newProjectType.personaPrompt,
        baseRules: newProjectType.baseRules || undefined
      };

      await api.createProjectType(projectTypeData);

      // Reset form
      setNewProjectType({
        name: '',
        personaPrompt: '',
        baseRules: '',
        color: '#9D4EDD'
      });

      // Close form
      setShowCreateForm(false);

      // Reload project types
      loadProjectTypes();
    } catch (error) {
      console.error('Erro ao criar tipo de projeto:', error);
      setError('Erro ao criar tipo de projeto. Verifique os dados e tente novamente.');
    }
  };

  const handleUpdate = async () => {
    if (!editingProjectType) return;
    
    try {
      setError(null);
      const { id, ...updateData } = editingProjectType;
      await api.updateProjectType(id, updateData);
      setEditingProjectType(null);
      loadProjectTypes();
    } catch (error) {
      console.error('Erro ao atualizar tipo de projeto:', error);
      setError('Erro ao atualizar tipo de projeto. Verifique os dados e tente novamente.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este tipo de projeto?\n\nAtenção: Projetos vinculados a este tipo não serão excluídos, mas perderão a referência.')) return;
    
    try {
      setError(null);
      await api.deleteProjectType(id);
      loadProjectTypes();
    } catch (error) {
      console.error('Erro ao excluir tipo de projeto:', error);
      setError('Erro ao excluir tipo de projeto. Verifique se não está sendo usado em projetos.');
    }
  };

  const handleEdit = (projectType: ProjectType) => {
    setEditingProjectType(projectType);
  };

  const handleCancelEdit = () => {
    setEditingProjectType(null);
  };

  const handleNewProjectTypeChange = (field: keyof typeof newProjectType, value: string) => {
    setNewProjectType(prev => ({ ...prev, [field]: value }));
  };

  const handleEditProjectTypeChange = (field: keyof ProjectType, value: string) => {
    if (editingProjectType) {
      setEditingProjectType(prev => prev ? { ...prev, [field]: value } : null);
    }
  };

  const handleColorSelect = (color: string, isEdit: boolean = false) => {
    if (isEdit && editingProjectType) {
      // Nota: O campo 'color' não existe na interface ProjectType atual
      // Se precisar adicionar, seria necessário atualizar a interface
      console.log('Cor selecionada para edição:', color);
    } else {
      setNewProjectType(prev => ({ ...prev, color }));
    }
  };

  const loadCommonType = (type: typeof commonTypes[0]) => {
    setNewProjectType({
      name: type.name,
      personaPrompt: type.personaPrompt,
      baseRules: type.baseRules,
      color: '#9D4EDD'
    });
  };

  // Função para obter iniciais do nome
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Função para obter cor baseada no nome (para consistência visual)
  const getColorForName = (name: string) => {
    const nameLower = name.toLowerCase();
    if (nameLower.includes('dev') || nameLower.includes('desenvolvimento')) return '#118AB2';
    if (nameLower.includes('marketing') || nameLower.includes('mkt')) return '#10B981';
    if (nameLower.includes('venda') || nameLower.includes('comercial')) return '#9D4EDD';
    if (nameLower.includes('design') || nameLower.includes('ux')) return '#EC4899';
    if (nameLower.includes('ia') || nameLower.includes('inteligência artificial')) return '#F59E0B';
    return '#9D4EDD'; // Cor padrão
  };

  return (
    <div className="project-type-manager">
      <div className="project-type-header">
        <h1>Gerenciar Tipos de Projeto</h1>
        {!showCreateForm && (
          <button 
            className="add-project-type-button"
            onClick={() => setShowCreateForm(true)}
          >
            Incluir Tipo de Projeto
          </button>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="error-message">
          {error}
          <button
            onClick={() => setError(null)}
            style={{
              marginLeft: '12px',
              padding: '4px 12px',
              backgroundColor: 'var(--danger-color)',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Fechar
          </button>
        </div>
      )}

      {/* Create form - visible only when showCreateForm is true */}
      {showCreateForm && (
        <div className="project-type-form">
          <div className="form-group">
            <label>Nome do Tipo *</label>
            <input
              type="text"
              value={newProjectType.name}
              onChange={(e) => handleNewProjectTypeChange('name', e.target.value)}
              placeholder="Ex: DEV, MARKETING, VENDAS, DESIGN, IA"
            />
            <div className="common-types">
              <span className="common-types-label">Tipos comuns:</span>
              {commonTypes.map(type => (
                <button
                  key={type.name}
                  type="button"
                  onClick={() => loadCommonType(type)}
                  className="common-type-button"
                >
                  {type.name}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Persona Prompt *</label>
            <textarea
              value={newProjectType.personaPrompt}
              onChange={(e) => handleNewProjectTypeChange('personaPrompt', e.target.value)}
              placeholder="Ex: Você é um Desenvolvedor Sênior especializado em..."
              rows={4}
            />
            <div className="field-hint">
              Este texto define "quem a IA é" ao executar tarefas deste tipo
            </div>
          </div>

          <div className="form-group">
            <label>Regras Base</label>
            <textarea
              value={newProjectType.baseRules}
              onChange={(e) => handleNewProjectTypeChange('baseRules', e.target.value)}
              placeholder="Ex: 1. Sempre priorize código limpo...&#10;2. Use versionamento..."
              rows={6}
            />
            <div className="field-hint">
              Regras gerais que serão combinadas com regras específicas de cada projeto
            </div>
          </div>

          <div className="form-group">
            <label>Cor (Visual)</label>
            <div className="color-palette">
              {colorPalette.map(color => (
                <div
                  key={color}
                  className={`color-option ${newProjectType.color === color ? 'selected' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => handleColorSelect(color)}
                  title={color}
                />
              ))}
            </div>
            <div className="field-hint">
              Apenas para identificação visual na interface
            </div>
          </div>

          <div className="form-actions">
            <button 
              onClick={handleCreate}
              disabled={!newProjectType.name.trim() || !newProjectType.personaPrompt.trim() || loading}
            >
              Criar Tipo de Projeto
            </button>
            <button 
              onClick={() => setShowCreateForm(false)}
              className="cancel-button"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Edit form */}
      {editingProjectType && (
        <div className="project-type-edit-form">
          <div className="project-type-edit-form-header">
            <h3>Editar Tipo de Projeto</h3>
          </div>
          
          <div className="project-type-edit-form-fields">
            <div className="form-group">
              <label>Nome do Tipo *</label>
              <input
                type="text"
                value={editingProjectType.name}
                onChange={(e) => handleEditProjectTypeChange('name', e.target.value)}
                placeholder="Ex: DEV, MARKETING, VENDAS, DESIGN, IA"
              />
            </div>

            <div className="form-group">
              <label>Persona Prompt *</label>
              <textarea
                value={editingProjectType.personaPrompt}
                onChange={(e) => handleEditProjectTypeChange('personaPrompt', e.target.value)}
                placeholder="Ex: Você é um Desenvolvedor Sênior especializado em..."
                rows={4}
              />
            </div>

            <div className="form-group">
              <label>Regras Base</label>
              <textarea
                value={editingProjectType.baseRules || ''}
                onChange={(e) => handleEditProjectTypeChange('baseRules', e.target.value)}
                placeholder="Ex: 1. Sempre priorize código limpo...&#10;2. Use versionamento..."
                rows={6}
              />
            </div>
          </div>

          <div className="project-type-edit-form-actions">
            <button onClick={handleUpdate} disabled={!editingProjectType.name.trim() || !editingProjectType.personaPrompt.trim() || loading}>
              Salvar Alterações
            </button>
            <button onClick={handleCancelEdit}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Project type list */}
      <div className="project-type-list">
        {loading ? (
          <div className="loading">Carregando tipos de projeto...</div>
        ) : projectTypes.length === 0 ? (
          <div className="empty-state">
            <p>Nenhum tipo de projeto cadastrado</p>
            <p>Clique em "Incluir Tipo de Projeto" para criar o primeiro tipo</p>
          </div>
        ) : (
          projectTypes.map(projectType => {
            const color = getColorForName(projectType.name);
            const initials = getInitials(projectType.name);
            
            return (
              <div key={projectType.id} className="project-type-item">
                <div className="project-type-info">
                  <div className="project-type-color">
                    <div 
                      className="color-circle"
                      style={{ backgroundColor: color }}
                    >
                      {initials}
                    </div>
                  </div>
                  <div className="project-type-details">
                    <div className="project-type-name">{projectType.name}</div>
                    <div className="project-type-meta">
                      <span className="project-type-meta-item">
                        <span className="meta-label">Criado em:</span> {projectType.createdAt ? new Date(projectType.createdAt).toLocaleDateString('pt-BR') : 'N/A'}
                      </span>
                      <span className="project-type-meta-item">
                        <span className="meta-label">Atualizado em:</span> {projectType.updatedAt ? new Date(projectType.updatedAt).toLocaleDateString('pt-BR') : 'N/A'}
                      </span>
                    </div>
                    <div className="project-type-preview">
                      <div className="preview-label">Persona:</div>
                      <div className="preview-text">
                        {projectType.personaPrompt.substring(0, 120)}...
                      </div>
                    </div>
                    {projectType.baseRules && (
                      <div className="project-type-preview">
                        <div className="preview-label">Regras:</div>
                        <div className="preview-text">
                          {projectType.baseRules.substring(0, 80)}...
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="project-type-actions">
                  <button onClick={() => handleEdit(projectType)}>
                    Editar
                  </button>
                  <button onClick={() => handleDelete(projectType.id)}>
                    Excluir
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Informações sobre tipos de projeto */}
      <div className="project-type-info-section">
        <h3>💡 Sobre Tipos de Projeto</h3>
        <ul>
          <li><strong>Nome:</strong> Identificador único do tipo (ex: DEV, MARKETING)</li>
          <li><strong>Persona Prompt:</strong> Define "quem a IA é" ao executar tarefas deste tipo</li>
          <li><strong>Regras Base:</strong> Diretrizes gerais aplicadas a todos os projetos deste tipo</li>
          <li><strong>Cor:</strong> Apenas para identificação visual na interface</li>
          <li>Tipos comuns incluem: DEV, MARKETING, VENDAS, DESIGN, IA</li>
          <li>Cada tipo pode ter múltiplos projetos associados</li>
          <li>Excluir um tipo não exclui os projetos vinculados</li>
        </ul>
      </div>
    </div>
  );
};

export default ProjectTypeManager;