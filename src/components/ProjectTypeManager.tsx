// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { FaTimes, FaPlus, FaEdit, FaTrash, FaSave, FaRobot, FaFileAlt, FaUsers, FaCode, FaChartLine, FaPalette } from 'react-icons/fa';
import apiService from '../services/api';
import { ProjectType } from '../types';

interface ProjectTypeManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectTypeUpdate?: () => void;
}

const ProjectTypeManager: React.FC<ProjectTypeManagerProps> = ({ isOpen, onClose, onProjectTypeUpdate }) => {
  const [projectTypes, setProjectTypes] = useState<ProjectType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    personaPrompt: '',
    baseRules: ''
  });

  // Ícones disponíveis para representar tipos de projeto
  const iconOptions = [
    { name: 'Desenvolvimento', icon: <FaCode size={20} />, color: '#118AB2' },
    { name: 'Marketing', icon: <FaChartLine size={20} />, color: 'var(--success-color)' },
    { name: 'Vendas', icon: <FaUsers size={20} />, color: 'var(--accent-color)' },
    { name: 'Design', icon: <FaPalette size={20} />, color: 'var(--accent-color)' },
    { name: 'IA', icon: <FaRobot size={20} />, color: 'var(--accent-color)' },
    { name: 'Documentação', icon: <FaFileAlt size={20} />, color: '#6C757D' }
  ];

  // Carregar project types ao abrir o modal
  useEffect(() => {
    if (isOpen) {
      loadProjectTypes();
    }
  }, [isOpen]);

  const loadProjectTypes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getProjectTypes();
      setProjectTypes(response.projectTypes || []);
      
    } catch (err) {
      console.error('Erro ao carregar tipos de projeto:', err);
      setError('Não foi possível carregar os tipos de projeto. Verifique a conexão com o servidor.');
      setProjectTypes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('O nome do tipo de projeto é obrigatório');
      return;
    }

    if (!formData.personaPrompt.trim()) {
      setError('O prompt da persona é obrigatório');
      return;
    }

    try {
      setError(null);
      
      const payload = {
        name: formData.name,
        personaPrompt: formData.personaPrompt,
        baseRules: formData.baseRules
      };

      if (editingId) {
        // Atualizar project type existente
        await apiService.updateProjectType(editingId, payload);
      } else {
        // Criar novo project type
        await apiService.createProjectType(payload);
      }
      
      // Recarregar lista
      await loadProjectTypes();
      
      // Limpar formulário
      resetForm();
      
      // Notificar componente pai
      if (onProjectTypeUpdate) {
        onProjectTypeUpdate();
      }
      
    } catch (err) {
      console.error('Erro ao salvar tipo de projeto:', err);
      setError('Erro ao salvar tipo de projeto. Verifique os dados e tente novamente.');
    }
  };

  const handleEdit = (projectType: ProjectType) => {
    setFormData({
      name: projectType.name,
      personaPrompt: projectType.personaPrompt,
      baseRules: projectType.baseRules
    });
    setEditingId(projectType.id);
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este tipo de projeto?\n\nAtenção: Projetos vinculados a este tipo não serão excluídos, mas perderão a referência.')) {
      return;
    }

    try {
      await apiService.deleteProjectType(id);
      await loadProjectTypes();
      
      if (onProjectTypeUpdate) {
        onProjectTypeUpdate();
      }
    } catch (err) {
      console.error('Erro ao excluir tipo de projeto:', err);
      setError('Erro ao excluir tipo de projeto. Verifique se não está sendo usado em projetos.');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      personaPrompt: '',
      baseRules: ''
    });
    setEditingId(null);
    setIsEditing(false);
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Função para sugerir personaPrompt baseado no nome
  const suggestPersonaPrompt = () => {
    const name = formData.name.toLowerCase();
    let suggestion = '';

    if (name.includes('dev') || name.includes('desenvolvimento') || name.includes('programação')) {
      suggestion = 'Você é um Desenvolvedor Sênior especializado em arquitetura de software e boas práticas de código. Sua missão é garantir que as soluções sejam escaláveis, mantíveis e seguindo os padrões da indústria.';
    } else if (name.includes('marketing') || name.includes('mkt')) {
      suggestion = 'Você é um Especialista em Marketing Digital com foco em estratégias de crescimento, análise de métricas e campanhas de conversão. Sua abordagem é data-driven e orientada a resultados.';
    } else if (name.includes('venda') || name.includes('comercial')) {
      suggestion = 'Você é um Executivo de Vendas com expertise em prospecção, negociação e fechamento de contratos. Foca em construir relacionamentos de longo prazo e entender profundamente as necessidades do cliente.';
    } else if (name.includes('design') || name.includes('ux')) {
      suggestion = 'Você é um Designer de Experiência do Usuário (UX/UI) com olhar crítico para usabilidade, acessibilidade e estética. Prioriza a jornada do usuário e a consistência visual.';
    } else if (name.includes('ia') || name.includes('inteligência artificial')) {
      suggestion = 'Você é um Especialista em IA com conhecimento em modelos de linguagem, processamento de dados e automação inteligente. Aborda problemas com pensamento algorítmico e criatividade técnica.';
    } else {
      suggestion = 'Você é um Profissional Especializado nesta área. Sua expertise inclui planejamento estratégico, execução disciplinada e entrega de resultados de alta qualidade.';
    }

    setFormData(prev => ({ ...prev, personaPrompt: suggestion }));
  };

  // Função para sugerir baseRules baseado no nome
  const suggestBaseRules = () => {
    const name = formData.name.toLowerCase();
    let suggestion = '';

    if (name.includes('dev') || name.includes('desenvolvimento')) {
      suggestion = '1. Sempre priorize código limpo e legível.\n2. Use versionamento (Git) para todas as alterações.\n3. Escreva testes automatizados quando aplicável.\n4. Documente decisões arquiteturais importantes.\n5. Siga os princípios SOLID e padrões de design apropriados.';
    } else if (name.includes('marketing')) {
      suggestion = '1. Todas as campanhas devem ter KPIs claramente definidos.\n2. Análise de ROI é obrigatória para qualquer investimento.\n3. Conteúdo deve ser otimizado para SEO.\n4. Use ferramentas de analytics para medir desempenho.\n5. Testes A/B são recomendados para otimização contínua.';
    } else if (name.includes('venda')) {
      suggestion = '1. Mantenha o CRM sempre atualizado.\n2. Follow-up deve ocorrer em até 24h após o primeiro contato.\n3. Propostas comerciais devem incluir escopo, prazos e valores claros.\n4. Negocie com foco em criar valor mútuo.\n5. Feedback do cliente deve ser documentado e analisado.';
    } else if (name.includes('design')) {
      suggestion = '1. Protótipos devem ser testados com usuários reais.\n2. Siga o sistema de design estabelecido (cores, tipografia, componentes).\n3. Priorize acessibilidade (WCAG 2.1 AA).\n4. Documente decisões de design no Figma/Zeplin.\n5. Colabore com desenvolvedores para garantir fidelidade na implementação.';
    } else {
      suggestion = '1. Defina objetivos claros e mensuráveis.\n2. Estabeleça prazos realistas com marcos intermediários.\n3. Documente processos e decisões importantes.\n4. Comunicação regular com stakeholders é essencial.\n5. Revise e aprenda com cada ciclo de trabalho.';
    }

    setFormData(prev => ({ ...prev, baseRules: suggestion }));
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '1000px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        overflow: 'hidden'
      }}>
        {/* Cabeçalho */}
        <div style={{
          padding: '24px',
          backgroundColor: 'var(--bg-input)',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              backgroundColor: 'var(--accent-color)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FaRobot size={24} color="white" />
            </div>
            <div>
              <h2 style={{
                fontSize: '24px',
                fontWeight: 700,
                color: '#333',
                margin: 0
              }}>
                Gerenciar Tipos de Projeto
              </h2>
              <p style={{
                fontSize: '14px',
                color: 'var(--text-secondary)',
                margin: '4px 0 0 0'
              }}>
                Configure personas e regras base para diferentes domínios (DEV, MARKETING, VENDAS, etc.)
              </p>
            </div>
          </div>
          
          <button
            onClick={handleClose}
            style={{
              width: '40px',
              height: '40px',
              backgroundColor: 'transparent',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-card)';
              e.currentTarget.style.borderColor = 'var(--danger-color)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.borderColor = 'var(--border-color)';
            }}
          >
            <FaTimes size={18} color="var(--text-secondary)" />
          </button>
        </div>

        {/* Conteúdo */}
        <div style={{
          display: 'flex',
          flex: 1,
          overflow: 'hidden'
        }}>
          {/* Lista de tipos de projeto */}
          <div style={{
            flex: 1,
            padding: '24px',
            borderRight: '1px solid var(--text-primary)',
            overflowY: 'auto'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: 600,
                color: '#333',
                margin: 0
              }}>
                Tipos Cadastrados
              </h3>
              <span style={{
                fontSize: '14px',
                color: 'var(--text-secondary)',
                backgroundColor: 'var(--bg-input)',
                padding: '4px 12px',
                borderRadius: '20px'
              }}>
                {projectTypes.length} tipos
              </span>
            </div>

            {loading ? (
              <div style={{
                padding: '40px',
                textAlign: 'center',
                color: 'var(--text-secondary)'
              }}>
                Carregando tipos de projeto...
              </div>
            ) : error ? (
              <div style={{
                padding: '20px',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--danger-color)',
                borderRadius: '8px',
                color: 'var(--danger-color)',
                marginBottom: '20px'
              }}>
                {error}
                <button
                  onClick={loadProjectTypes}
                  style={{
                    marginTop: '10px',
                    padding: '8px 16px',
                    backgroundColor: 'var(--danger-color)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'block'
                  }}
                >
                  Tentar Novamente
                </button>
              </div>
            ) : projectTypes.length === 0 ? (
              <div style={{
                padding: '40px',
                textAlign: 'center',
                backgroundColor: 'var(--bg-input)',
                borderRadius: '8px',
                color: 'var(--text-secondary)'
              }}>
                <FaRobot size={48} color='var(--border-color)' style={{ marginBottom: '16px' }} />
                <p style={{ margin: 0 }}>Nenhum tipo de projeto cadastrado</p>
                <p style={{ fontSize: '14px', marginTop: '8px' }}>
                  Use o formulário ao lado para criar o primeiro tipo
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {projectTypes.map(projectType => {
                  // Encontrar ícone correspondente
                  const matchedIcon = iconOptions.find(icon => 
                    projectType.name.toLowerCase().includes(icon.name.toLowerCase().substring(0, 4))
                  ) || iconOptions[0];

                  return (
                    <div
                      key={projectType.id}
                      style={{
                        padding: '16px',
                        backgroundColor: 'white',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        transition: 'all 0.2s',
                        background: `linear-gradient(90deg, ${matchedIcon.color}10 0%, white 30%)`
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = matchedIcon.color;
                        e.currentTarget.style.boxShadow = `0 4px 12px ${matchedIcon.color}30`;
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--text-primary)';
                        e.currentTarget.style.boxShadow = 'none';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <div style={{
                        width: '48px',
                        height: '48px',
                        backgroundColor: matchedIcon.color,
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '20px',
                        border: '2px solid white',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}>
                        {matchedIcon.icon}
                      </div>
                      
                      <div style={{ flex: 1 }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginBottom: '4px'
                        }}>
                          <span style={{
                            fontSize: '16px',
                            fontWeight: 600,
                            color: '#333'
                          }}>
                            {projectType.name}
                          </span>
                          <span style={{
                            fontSize: '12px',
                            backgroundColor: 'var(--bg-input)',
                            color: 'var(--text-secondary)',
                            padding: '2px 8px',
                            borderRadius: '4px'
                          }}>
                            {projectType.projects?.length || 0} projetos
                          </span>
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color: 'var(--text-secondary)',
                          lineHeight: '1.4',
                          maxHeight: '40px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical'
                        }}>
                          {projectType.personaPrompt.substring(0, 120)}...
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => handleEdit(projectType)}
                          style={{
                            padding: '8px 12px',
                            backgroundColor: 'var(--bg-card)',
                            color: 'var(--accent-color)',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '12px'
                          }}
                        >
                          <FaEdit size={12} />
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(projectType.id)}
                          style={{
                            padding: '8px 12px',
                            backgroundColor: 'var(--bg-card)',
                            color: 'var(--danger-color)',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '12px'
                          }}
                        >
                          <FaTrash size={12} />
                          Excluir
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Formulário */}
          <div style={{
            flex: 1,
            padding: '24px',
            backgroundColor: 'var(--bg-input)',
            overflowY: 'auto'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: 600,
              color: '#333',
              marginBottom: '20px'
            }}>
              {isEditing ? 'Editar Tipo de Projeto' : 'Novo Tipo de Projeto'}
            </h3>

            <form onSubmit={handleSubmit}>
              {/* Nome do Tipo */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#333',
                  marginBottom: '8px'
                }}>
                  Nome do Tipo *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Ex: DEV, MARKETING, VENDAS, DESIGN, IA"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: `1px solid ${error && !formData.name.trim() ? 'var(--danger-color)' : 'var(--border-color)'}`,
                    borderRadius: '8px',
                    fontSize: '16px',
                    boxSizing: 'border-box',
                    transition: 'all 0.2s'
                  }}
                  required
                />
                <div style={{
                  marginTop: '8px',
                  fontSize: '12px',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  gap: '8px'
                }}>
                  <span>Sugestões:</span>
                  {['DEV', 'MARKETING', 'VENDAS', 'DESIGN', 'IA'].map(suggestion => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => {
                        handleInputChange('name', suggestion);
                        suggestPersonaPrompt();
                        suggestBaseRules();
                      }}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: 'white',
                        border: '1px solid var(--border-color)',
                        borderRadius: '4px',
                        fontSize: '11px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-color)'}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>

              {/* Persona Prompt */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '8px'
                }}>
                  <label style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#333'
                  }}>
                    Persona Prompt *
                  </label>
                  <button
                    type="button"
                    onClick={suggestPersonaPrompt}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: 'var(--bg-input)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <FaRobot size={12} />
                    Sugerir
                  </button>
                </div>
                <textarea
                  value={formData.personaPrompt}
                  onChange={(e) => handleInputChange('personaPrompt', e.target.value)}
                  placeholder="Ex: Você é um Desenvolvedor Sênior especializado em..."
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: `1px solid ${error && !formData.personaPrompt.trim() ? 'var(--danger-color)' : 'var(--border-color)'}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    resize: 'vertical',
                    fontFamily: 'monospace',
                    lineHeight: '1.5'
                  }}
                  required
                />
                <div style={{
                  marginTop: '8px',
                  fontSize: '12px',
                  color: 'var(--text-secondary)'
                }}>
                  Este texto define "quem a IA é" ao executar tarefas deste tipo.
                </div>
              </div>

              {/* Base Rules */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '8px'
                }}>
                  <label style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#333'
                  }}>
                    Regras Base
                  </label>
                  <button
                    type="button"
                    onClick={suggestBaseRules}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: 'var(--bg-input)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <FaFileAlt size={12} />
                    Sugerir
                  </button>
                </div>
                <textarea
                  value={formData.baseRules}
                  onChange={(e) => handleInputChange('baseRules', e.target.value)}
                  placeholder="Ex: 1. Sempre priorize código limpo...&#10;2. Use versionamento..."
                  rows={6}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    resize: 'vertical',
                    fontFamily: 'monospace',
                    lineHeight: '1.5'
                  }}
                />
                <div style={{
                  marginTop: '8px',
                  fontSize: '12px',
                  color: 'var(--text-secondary)'
                }}>
                  Regras gerais que serão combinadas com regras específicas de cada projeto.
                </div>
              </div>

              {/* Mensagem de erro */}
              {error && (
                <div style={{
                  padding: '12px 16px',
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--danger-color)',
                  borderRadius: '8px',
                  color: 'var(--danger-color)',
                  marginBottom: '20px',
                  fontSize: '14px'
                }}>
                  {error}
                </div>
              )}

              {/* Botões de ação */}
              <div style={{
                display: 'flex',
                gap: '12px',
                marginTop: '24px'
              }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '14px',
                    backgroundColor: 'var(--accent-color)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-color)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-color)'}
                >
                  <FaSave size={18} />
                  {isEditing ? 'Atualizar Tipo' : 'Criar Tipo'}
                </button>

                {isEditing && (
                  <button
                    type="button"
                    onClick={resetForm}
                    style={{
                      padding: '14px 24px',
                      backgroundColor: 'var(--bg-input)',
                      color: 'var(--text-secondary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      transition: 'all 0.2s'
                    }}
                  >
                    <FaTimes size={18} />
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectTypeManager;