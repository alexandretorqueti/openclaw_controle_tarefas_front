// @ts-nocheck
import React, { useState, useEffect, useRef, useMemo } from "react";
import { Agent, AgentsResponse, OperationResponse } from "../types/agent";
import api from "../services/api";
import {
  FaRobot,
  FaPlus,
  FaEdit,
  FaTrash,
  FaLink,
  FaUnlink,
  FaSync,
  FaCheck,
  FaTimes,
  FaUserCircle,
  FaSpinner,
  FaSearch,
  FaTimesCircle,
} from "react-icons/fa";

// Estilos inline para animações
const styles = {
  "@keyframes spin": {
    "0%": { transform: "rotate(0deg)" },
    "100%": { transform: "rotate(360deg)" },
  },
  "@keyframes slideIn": {
    "0%": { transform: "translateX(100%)", opacity: 0 },
    "100%": { transform: "translateX(0)", opacity: 1 },
  },
};

const AgentManager: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filtros locais
  const [searchName, setSearchName] = useState("");
  const [searchModel, setSearchModel] = useState("");

  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showBindingsModal, setShowBindingsModal] = useState<boolean>(false);
  const [newAgentName, setNewAgentName] = useState<string>("");
  const [newAgentWorkspace, setNewAgentWorkspace] = useState<string>("");
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [editAgentName, setEditAgentName] = useState<string>("");
  const [editAgentEmoji, setEditAgentEmoji] = useState<string>("");
  const [editAgentAvatar, setEditAgentAvatar] = useState<string>("");
  const [editAgentModel, setEditAgentModel] = useState<string>("");
  const [editAgentWorkspace, setEditAgentWorkspace] = useState<string>("");
  const [editAgentVibe, setEditAgentVibe] = useState<string>("");
  const [editAgentSoul, setEditAgentSoul] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileLoading, setFileLoading] = useState(false);
  const [newBinding, setNewBinding] = useState<string>("");
  const [models, setModels] = useState<string[]>([]);

  // Estado para toast de processamento assíncrono
  const [processingToast, setProcessingToast] = useState<{
    visible: boolean;
    message: string;
    type: "processing" | "success" | "error";
    steps?: string[];
    currentStep?: number;
  }>({
    visible: false,
    message: "",
    type: "processing",
  });

  const loadAgents = async () => {
    setLoading(true);
    try {
      const response = (await api.getAgents()) as AgentsResponse;
      if (response.success) {
        setAgents(response.data);
      } else {
        // Mostrar erro via toast
        setProcessingToast({
          visible: true,
          message: `Erro ao carregar agentes: ${response.error || "Erro desconhecido"}`,
          type: "error",
        });
      }
    } catch (err: any) {
      // Mostrar erro via toast
      setProcessingToast({
        visible: true,
        message: `Erro ao conectar com o servidor: ${err.message || "Erro desconhecido"}`,
        type: "error",
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
        const data = await api.request("/models");
        setModels(data.models || []);
      } catch (error) {
        console.error("Error loading models:", error);
      }
    };

    loadModels();
  }, []);

  // Lógica de filtragem
  const filteredAgents = useMemo(() => {
    return agents.filter((agent) => {
      const name = (agent.identity?.name || "").toLowerCase();
      const model = (agent.identity?.model || "").toLowerCase();
      return (
        name.includes(searchName.toLowerCase()) &&
        model.includes(searchModel.toLowerCase())
      );
    });
  }, [agents, searchName, searchModel]);

  const handleCreateAgent = async () => {
    if (!newAgentName.trim()) {
      setProcessingToast({
        visible: true,
        message: "O nome do agente é obrigatório",
        type: "error",
      });
      return;
    }

    // Fechar modal imediatamente
    setShowCreateModal(false);

    // Mostrar toast de processamento
    setProcessingToast({
      visible: true,
      message: "Criando agente...",
      type: "processing",
    });

    try {
      const response = (await api.createAgent({
        name: newAgentName,
        workspace: newAgentWorkspace || undefined,
      })) as OperationResponse;

      if (response.success) {
        // Limpar formulário
        setNewAgentName("");
        setNewAgentWorkspace("");

        // Atualizar lista em background
        loadAgents().catch(console.error);

        // Mostrar toast de sucesso
        setProcessingToast({
          visible: true,
          message: "Agente criado com sucesso!",
          type: "success",
        });

        // Auto-esconder toast após 3 segundos
        setTimeout(() => {
          setProcessingToast((prev) => ({ ...prev, visible: false }));
        }, 3000);
      } else {
        setProcessingToast({
          visible: true,
          message: `Erro ao criar agente: ${response.error || "Erro desconhecido"}`,
          type: "error",
        });
      }
    } catch (err: any) {
      setProcessingToast({
        visible: true,
        message: `Erro ao criar agente: ${err.message || "Erro desconhecido"}`,
        type: "error",
      });
    }
  };

  const handleDeleteAgent = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este agente?")) return;

    // Mostrar toast de processamento
    setProcessingToast({
      visible: true,
      message: "Excluindo agente...",
      type: "processing",
    });

    try {
      const response = (await api.deleteAgent(id)) as OperationResponse;

      if (response.success) {
        // Atualizar lista em background
        loadAgents().catch(console.error);

        // Mostrar toast de sucesso
        setProcessingToast({
          visible: true,
          message: "Agente excluído com sucesso!",
          type: "success",
        });

        // Auto-esconder toast após 3 segundos
        setTimeout(() => {
          setProcessingToast((prev) => ({ ...prev, visible: false }));
        }, 3000);
      } else {
        setProcessingToast({
          visible: true,
          message: `Erro ao excluir agente: ${response.error || "Erro desconhecido"}`,
          type: "error",
        });
      }
    } catch (err: any) {
      setProcessingToast({
        visible: true,
        message: `Erro ao excluir agente: ${err.message || "Erro desconhecido"}`,
        type: "error",
      });
    }
  };

  const handleUpdateAgent = async () => {
    if (!selectedAgent) return;

    if (!editAgentName.trim()) {
      setProcessingToast({
        visible: true,
        message: "O nome do agente é obrigatório",
        type: "error",
      });
      return;
    }

    // Fechar modal imediatamente para UX não-bloqueante
    setShowEditModal(false);
    setSelectedAgent(null);

    // Mostrar toast de processamento
    setProcessingToast({
      visible: true,
      message: "Atualizando agente...",
      type: "processing",
      steps: [
        "Atualizando identidade",
        "Atualizando VIBE",
        "Atualizando SOUL.md",
      ],
      currentStep: 0,
    });

    try {
      // 1. Atualizar identidade do agente (assíncrono, não bloqueia UI)
      setProcessingToast((prev) => ({ ...prev, currentStep: 1 }));
      const identityPromise = api.updateAgentIdentity(selectedAgent.id, {
        name: editAgentName,
        emoji: editAgentEmoji,
        // Não enviamos avatar aqui - OpenClaw não aceita
        // Avatar é gerenciado separadamente via upload
        model: editAgentModel,
        workspace: editAgentWorkspace || undefined,
      }) as Promise<OperationResponse>;

      // 2. Preparar atualizações de arquivos (se houver conteúdo)
      const filePromises: Promise<any>[] = [];

      if (editAgentVibe.trim()) {
        setProcessingToast((prev) => ({ ...prev, currentStep: 2 }));
        filePromises.push(
          (async () => {
            try {
              // Ler IDENTITY.md atual
              const identityResponse = await api.request(
                `/agents/${selectedAgent.id}/files/IDENTITY.md`,
              );
              let identityContent =
                identityResponse.success && identityResponse.data
                  ? identityResponse.data
                  : "";

              // Atualizar ou adicionar VIBE
              if (identityContent.includes("VIBE:")) {
                identityContent = identityContent.replace(
                  /VIBE:\s*.+/i,
                  `VIBE: ${editAgentVibe}`,
                );
              } else {
                identityContent += `\n\nVIBE: ${editAgentVibe}`;
              }

              // Salvar IDENTITY.md atualizado
              return await api.request(
                `/agents/${selectedAgent.id}/files/IDENTITY.md`,
                {
                  method: "PUT",
                  body: JSON.stringify({ content: identityContent }),
                },
              );
            } catch (error) {
              console.error("Erro ao atualizar VIBE:", error);
              return { success: false, error };
            }
          })(),
        );
      }

      if (editAgentSoul.trim()) {
        setProcessingToast((prev) => ({ ...prev, currentStep: 3 }));
        filePromises.push(
          (async () => {
            try {
              return await api.request(
                `/agents/${selectedAgent.id}/files/SOUL.md`,
                {
                  method: "PUT",
                  body: JSON.stringify({ content: editAgentSoul }),
                },
              );
            } catch (error) {
              console.error("Erro ao atualizar SOUL.md:", error);
              return { success: false, error };
            }
          })(),
        );
      }

      // Executar todas as promessas em paralelo
      const [identityResult, ...fileResults] = await Promise.allSettled([
        identityPromise,
        ...filePromises,
      ]);

      // Verificar resultado da identidade
      if (
        identityResult.status === "rejected" ||
        (identityResult.status === "fulfilled" && !identityResult.value.success)
      ) {
        const error =
          identityResult.status === "rejected"
            ? identityResult.reason
            : identityResult.value.error;

        setProcessingToast({
          visible: true,
          message: `Erro ao atualizar agente: ${error?.message || error || "Erro desconhecido"}`,
          type: "error",
        });
        return;
      }

      // Atualizar lista de agentes em background
      loadAgents().catch(console.error);

      // Mostrar toast de sucesso
      setProcessingToast({
        visible: true,
        message: "Agente atualizado com sucesso!",
        type: "success",
      });

      // Limpar estados do formulário
      setEditAgentName("");
      setEditAgentEmoji("");
      setEditAgentAvatar("");
      setEditAgentModel("");
      setEditAgentWorkspace("");
      setEditAgentVibe("");
      setEditAgentSoul("");

      // Auto-esconder toast de sucesso após 3 segundos
      setTimeout(() => {
        setProcessingToast((prev) => ({ ...prev, visible: false }));
      }, 3000);
    } catch (err: any) {
      setProcessingToast({
        visible: true,
        message: `Erro ao atualizar agente: ${err.message || "Erro desconhecido"}`,
        type: "error",
      });
    }
  };

  const clearMessages = () => {
    // Função mantida para compatibilidade, mas não faz mais nada
  };

  const AgentAvatar: React.FC<{ agent: Agent }> = ({ agent }) => {
    const [imgError, setImgError] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

    // Buscar avatar do novo sistema
    useEffect(() => {
      const fetchAvatar = async () => {
        try {
          const response = await fetch(
            `http://localhost:3001/api/agents/${agent.id}/avatar`,
          );
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.data) {
              // URL já é completa no novo sistema
              setAvatarUrl(`http://localhost:3001${data.data.avatarUrl}`);
            }
          }
        } catch (error) {
          console.error("Erro ao buscar avatar:", error);
        }
      };

      fetchAvatar();
    }, [agent.id]);

    if (avatarUrl && !imgError) {
      return (
        <img
          src={avatarUrl}
          alt={agent.identity?.name || "Agente"}
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            objectFit: "cover",
          }}
          onError={() => setImgError(true)}
        />
      );
    }

    if (agent.identity && agent.identity.emoji) {
      return (
        <div
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            backgroundColor: "#f0f0f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "18px",
          }}
        >
          {agent.identity.emoji}
        </div>
      );
    }

    return (
      <FaUserCircle style={{ width: "32px", height: "32px", color: "#999" }} />
    );
  };

  const renderAgentAvatar = (agent: Agent) => {
    return <AgentAvatar agent={agent} />;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h2
            style={{
              fontSize: "24px",
              fontWeight: 600,
              color: "#333",
              margin: 0,
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                backgroundColor: "#4ECDC4",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FaRobot size={20} color="#fff" />
            </div>
            Gerenciamento de Agentes OpenClaw
          </h2>
          <p style={{ fontSize: "14px", color: "#666", margin: "8px 0 0" }}>
            Gerencie agentes através da CLI do OpenClaw
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={loadAgents}
            style={{
              padding: "10px 16px",
              backgroundColor: 'var(--bg-input)'",
              color: "#333",
              border: "1px solid #e0e0e0",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer",
              transition: "all 0.2s",
              opacity: loading ? 0.6 : 1,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#e9ecef";
              e.currentTarget.style.borderColor = "#ced4da";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#f8f9fa";
              e.currentTarget.style.borderColor = "#e0e0e0";
            }}
            disabled={loading}
          >
            <FaSync
              style={loading ? { animation: "spin 1s linear infinite" } : {}}
            />
            Atualizar
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              padding: "10px 16px",
              backgroundColor: "#4ECDC4",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#3dbcb4";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#4ECDC4";
            }}
          >
            <FaPlus />
            Novo Agente
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          flexWrap: "wrap",
          alignItems: "end",
          padding: "16px",
          backgroundColor: 'var(--bg-input)'",
          borderRadius: "12px",
          border: "1px solid #e0e0e0",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            flex: 1,
            minWidth: "200px",
          }}
        >
          <FaSearch size={16} color="#666" />
          <input
            placeholder="Filtrar por nome..."
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            style={{
              flex: 1,
              padding: "8px 12px",
              border: "1px solid #ddd",
              borderRadius: "6px",
              fontSize: "14px",
              outline: "none",
            }}
          />
          {searchName && (
            <FaTimesCircle
              size={16}
              color="#999"
              style={{ cursor: "pointer" }}
              onClick={() => setSearchName("")}
            />
          )}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            flex: 1,
            minWidth: "200px",
          }}
        >
          <FaSearch size={16} color="#666" />
          <input
            placeholder="Filtrar por modelo..."
            value={searchModel}
            onChange={(e) => setSearchModel(e.target.value)}
            style={{
              flex: 1,
              padding: "8px 12px",
              border: "1px solid #ddd",
              borderRadius: "6px",
              fontSize: "14px",
              outline: "none",
            }}
          />
          {searchModel && (
            <FaTimesCircle
              size={16}
              color="#999"
              style={{ cursor: "pointer" }}
              onClick={() => setSearchModel("")}
            />
          )}
        </div>
        <div
          style={{
            fontSize: "14px",
            color: "#666",
            whiteSpace: "nowrap",
            fontWeight: 500,
          }}
        >
          Resultados: {filteredAgents.length} de {agents.length}
        </div>
      </div>

      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "12px",
          border: "1px solid #e0e0e0",
          overflow: "auto",
        }}
      >
        {loading && agents.length === 0 ? (
          <div
            style={{
              padding: "48px",
              textAlign: "center",
              color: "#666",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <FaSpinner
              style={{
                animation: "spin 1s linear infinite",
                fontSize: "32px",
                color: "#4ECDC4",
              }}
            />
            <span style={{ fontSize: "16px" }}>Carregando agentes...</span>
          </div>
        ) : filteredAgents.length === 0 ? (
          <div
            style={{
              padding: "48px",
              textAlign: "center",
              color: "#666",
            }}
          >
            <FaRobot
              style={{ fontSize: "48px", margin: "0 auto 16px", color: "#ddd" }}
            />
            <p style={{ fontSize: "18px", margin: "0 0 8px" }}>
              Nenhum agente encontrado
              {(searchName || searchModel) && " com os filtros aplicados"}
            </p>
            <p style={{ fontSize: "14px" }}>
              {searchName || searchModel
                ? "Ajuste os filtros ou limpe para ver todos"
                : "Crie seu primeiro agente para começar"}
            </p>
          </div>
        ) : (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr
                style={{
                  backgroundColor: 'var(--bg-input)'",
                  borderBottom: "1px solid #e0e0e0",
                }}
              >
                <th
                  style={{
                    padding: "16px 24px",
                    textAlign: "left",
                    fontSize: "12px",
                    fontWeight: 500,
                    color: "#666",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Agente
                </th>
                <th
                  style={{
                    padding: "16px 24px",
                    textAlign: "left",
                    fontSize: "12px",
                    fontWeight: 500,
                    color: "#666",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Modelo
                </th>
                <th
                  style={{
                    padding: "16px 24px",
                    textAlign: "left",
                    fontSize: "12px",
                    fontWeight: 500,
                    color: "#666",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Ações
                </th>
              </tr>
            </thead>
            <tbody
              style={{
                backgroundColor: "#fff",
              }}
            >
              {filteredAgents.map((agent) => (
                <tr
                  key={agent.id}
                  style={{
                    borderBottom: "1px solid #f0f0f0",
                    transition: "background-color 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#f8f9fa";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#fff";
                  }}
                >
                  <td
                    style={{
                      padding: "16px 24px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <div style={{ flexShrink: 0 }}>
                        {renderAgentAvatar(agent)}
                      </div>
                      <div style={{ marginLeft: "16px" }}>
                        <div
                          style={{
                            fontSize: "14px",
                            fontWeight: 500,
                            color: "#333",
                          }}
                        >
                          {agent.identity ? agent.identity.name : "Sem nome"}
                        </div>
                        <div
                          style={{
                            fontSize: "14px",
                            color: "#666",
                            marginTop: "4px",
                          }}
                        >
                          {agent.identity && agent.identity.emoji && (
                            <span style={{ marginRight: "8px" }}>
                              {agent.identity.emoji}
                            </span>
                          )}
                          {/* Avatar agora é gerenciado separadamente */}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td
                    style={{
                      padding: "16px 24px",
                      whiteSpace: "nowrap",
                      fontSize: "14px",
                      color: "#666",
                    }}
                  >
                    {agent.identity?.model || "—"}
                  </td>
                  <td
                    style={{
                      padding: "16px 24px",
                      whiteSpace: "nowrap",
                      fontSize: "14px",
                      fontWeight: 500,
                    }}
                  >
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        onClick={async () => {
                          setSelectedAgent(agent);
                          setEditAgentName(agent.identity?.name || "");
                          setEditAgentEmoji(agent.identity?.emoji || "");
                          // Avatar não é mais gerenciado via identity.avatar do OpenClaw
                          // Será carregado separadamente se existir no workspace
                          setEditAgentAvatar("");
                          setEditAgentModel(agent.identity?.model || "");
                          setEditAgentWorkspace(agent.workspace || "");
                          setEditAgentVibe("");
                          setEditAgentSoul("");
                          setFileLoading(true);
                          setShowEditModal(true);

                          // Carregar arquivos em background
                          Promise.allSettled([
                            api
                              .request(`/agents/${agent.id}/files/IDENTITY.md`)
                              .then((res) => {
                                if (res.success && res.data) {
                                  const match = res.data.match(/VIBE:\s*(.+)/i);
                                  setEditAgentVibe(
                                    match ? match[1].trim() : "",
                                  );
                                }
                              }),
                            api
                              .request(`/agents/${agent.id}/files/SOUL.md`)
                              .then((res) => {
                                setEditAgentSoul(
                                  res.success && res.data ? res.data : "",
                                );
                              }),
                          ])
                            .finally(() => setFileLoading(false))
                            .catch(console.error);
                        }}
                        style={{
                          color: "#1976d2",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: "4px",
                          borderRadius: "4px",
                          transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = "#0d47a1";
                          e.currentTarget.style.backgroundColor = "#f5f5f5";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = "#1976d2";
                          e.currentTarget.style.backgroundColor = "transparent";
                        }}
                      >
                        <FaEdit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteAgent(agent.id)}
                        style={{
                          color: "#d32f2f",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: "4px",
                          borderRadius: "4px",
                          transition: "all 0.2s",
                          opacity: loading ? 0.5 : 1,
                        }}
                        onMouseEnter={(e) => {
                          if (!loading) {
                            e.currentTarget.style.color = "#b71c1c";
                            e.currentTarget.style.backgroundColor = "#f5f5f5";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!loading) {
                            e.currentTarget.style.color = "#d32f2f";
                            e.currentTarget.style.backgroundColor =
                              "transparent";
                          }
                        }}
                        disabled={loading}
                      >
                        <FaTrash size={16} />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedAgent(agent);
                          setShowBindingsModal(true);
                        }}
                        style={{
                          color: "#388e3c",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: "4px",
                          borderRadius: "4px",
                          transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = "#1b5e20";
                          e.currentTarget.style.backgroundColor = "#f5f5f5";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = "#388e3c";
                          e.currentTarget.style.backgroundColor = "transparent";
                        }}
                      >
                        <FaLink size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
          }}
        >
          {/* Full create modal code from original */}
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: "12px",
              boxShadow:
                "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              width: "100%",
              maxWidth: "28rem",
              padding: "24px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <h3
                style={{
                  fontSize: "18px",
                  fontWeight: 600,
                  color: "#333",
                }}
              >
                Criar Novo Agente
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{
                  color: "#999",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "4px",
                  borderRadius: "4px",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#666";
                  e.currentTarget.style.backgroundColor = "#f5f5f5";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "#999";
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <FaTimes />
              </button>
            </div>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "#333",
                    marginBottom: "8px",
                  }}
                >
                  Nome do Agente *
                </label>
                <input
                  type="text"
                  value={newAgentName}
                  onChange={(e) => setNewAgentName(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #e0e0e0",
                    borderRadius: "8px",
                    fontSize: "14px",
                    outline: "none",
                    transition: "all 0.2s",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#4ECDC4";
                    e.target.style.boxShadow =
                      "0 0 0 3px rgba(78, 205, 196, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e0e0e0";
                    e.target.style.boxShadow = "none";
                  }}
                  placeholder="Ex: MeuAgente"
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "#333",
                    marginBottom: "8px",
                  }}
                >
                  Workspace (opcional)
                </label>
                <input
                  type="text"
                  value={newAgentWorkspace}
                  onChange={(e) => setNewAgentWorkspace(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #e0e0e0",
                    borderRadius: "8px",
                    fontSize: "14px",
                    outline: "none",
                    transition: "all 0.2s",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#4ECDC4";
                    e.target.style.boxShadow =
                      "0 0 0 3px rgba(78, 205, 196, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e0e0e0";
                    e.target.style.boxShadow = "none";
                  }}
                  placeholder="/caminho/para/workspace"
                />
                <p
                  style={{
                    fontSize: "12px",
                    color: "#666",
                    marginTop: "4px",
                  }}
                >
                  Caminho absoluto para o workspace do agente
                </p>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "12px",
                marginTop: "24px",
              }}
            >
              <button
                onClick={() => setShowCreateModal(false)}
                style={{
                  padding: "10px 16px",
                  color: "#333",
                  backgroundColor: 'var(--bg-input)'",
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#e9ecef";
                  e.currentTarget.style.borderColor = "#ced4da";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#f8f9fa";
                  e.currentTarget.style.borderColor = "#e0e0e0";
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateAgent}
                disabled={loading || !newAgentName.trim()}
                style={{
                  padding: "10px 16px",
                  backgroundColor: "#4ECDC4",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  cursor:
                    loading || !newAgentName.trim() ? "not-allowed" : "pointer",
                  opacity: loading || !newAgentName.trim() ? 0.5 : 1,
                  transition: "all 0.2s",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
                onMouseEnter={(e) => {
                  if (!loading && newAgentName.trim()) {
                    e.currentTarget.style.backgroundColor = "#3dbcb4";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading && newAgentName.trim()) {
                    e.currentTarget.style.backgroundColor = "#4ECDC4";
                  }
                }}
              >
                {loading ? (
                  <FaSpinner style={{ animation: "spin 1s linear infinite" }} />
                ) : (
                  <FaPlus />
                )}
                Criar Agente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedAgent && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: "12px",
              boxShadow:
                "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              width: "100%",
              maxWidth: "28rem",
              padding: "24px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <h3
                style={{
                  fontSize: "18px",
                  fontWeight: 600,
                  color: "#333",
                }}
              >
                Editar Agente
              </h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedAgent(null);
                  setEditAgentName("");
                  setEditAgentEmoji("");
                  setEditAgentAvatar("");
                  setEditAgentModel("");
                  setEditAgentWorkspace("");
                  setEditAgentVibe("");
                  setEditAgentSoul("");
                }}
                style={{
                  color: "#999",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "4px",
                  borderRadius: "4px",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#666";
                  e.currentTarget.style.backgroundColor = "#f5f5f5";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "#999";
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <FaTimes />
              </button>
            </div>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              {/* Nome */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "#333",
                    marginBottom: "8px",
                  }}
                >
                  Nome do Agente *
                </label>
                <input
                  type="text"
                  value={editAgentName}
                  onChange={(e) => setEditAgentName(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #e0e0e0",
                    borderRadius: "8px",
                    fontSize: "14px",
                    outline: "none",
                    transition: "all 0.2s",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#4ECDC4";
                    e.target.style.boxShadow =
                      "0 0 0 3px rgba(78, 205, 196, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e0e0e0";
                    e.target.style.boxShadow = "none";
                  }}
                  placeholder="Nome do agente"
                />
              </div>

              {/* Emoji */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "#333",
                    marginBottom: "8px",
                  }}
                >
                  Emoji
                </label>
                <input
                  type="text"
                  value={editAgentEmoji}
                  onChange={(e) => setEditAgentEmoji(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #e0e0e0",
                    borderRadius: "8px",
                    fontSize: "14px",
                    outline: "none",
                    transition: "all 0.2s",
                  }}
                  placeholder="😀 🚀 🤖"
                />
              </div>

              {/* Modelo */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "#333",
                    marginBottom: "8px",
                  }}
                >
                  Modelo
                </label>
                <select
                  value={editAgentModel}
                  onChange={(e) => setEditAgentModel(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #e0e0e0",
                    borderRadius: "8px",
                    fontSize: "14px",
                    outline: "none",
                    backgroundColor: "white",
                  }}
                >
                  <option value="">Selecione um modelo</option>
                  {models.map((model) => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
                </select>
              </div>

              {/* Workspace */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "#333",
                    marginBottom: "8px",
                  }}
                >
                  Workspace
                </label>
                <input
                  type="text"
                  value={editAgentWorkspace}
                  onChange={(e) => setEditAgentWorkspace(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #e0e0e0",
                    borderRadius: "8px",
                    fontSize: "14px",
                    outline: "none",
                  }}
                  placeholder="/caminho/para/workspace"
                />
              </div>

              {/* VIBE */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "#333",
                    marginBottom: "8px",
                  }}
                >
                  VIBE{" "}
                  {fileLoading && (
                    <FaSpinner
                      style={{
                        animation: "spin 1s linear infinite",
                        marginLeft: "8px",
                      }}
                    />
                  )}
                </label>
                <input
                  type="text"
                  value={editAgentVibe}
                  onChange={(e) => setEditAgentVibe(e.target.value)}
                  disabled={fileLoading}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #e0e0e0",
                    borderRadius: "8px",
                    fontSize: "14px",
                    outline: "none",
                    opacity: fileLoading ? 0.6 : 1,
                  }}
                  placeholder="Ex: Informal, engraçado, inteligente"
                />
                <p
                  style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}
                >
                  Extraído do IDENTITY.md do agente
                </p>
              </div>

              {/* SOUL.md */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "#333",
                    marginBottom: "8px",
                  }}
                >
                  SOUL.md{" "}
                  {fileLoading && (
                    <FaSpinner
                      style={{
                        animation: "spin 1s linear infinite",
                        marginLeft: "8px",
                      }}
                    />
                  )}
                </label>
                <textarea
                  value={editAgentSoul}
                  onChange={(e) => setEditAgentSoul(e.target.value)}
                  disabled={fileLoading}
                  rows={6}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #e0e0e0",
                    borderRadius: "8px",
                    fontSize: "14px",
                    outline: "none",
                    fontFamily: "monospace",
                    resize: "vertical",
                    opacity: fileLoading ? 0.6 : 1,
                  }}
                  placeholder="Conteúdo do arquivo SOUL.md do agente"
                />
                <p
                  style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}
                >
                  Conteúdo completo do arquivo SOUL.md
                </p>
              </div>

              {/* Upload de Avatar */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "#333",
                    marginBottom: "8px",
                  }}
                >
                  Avatar
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    // Implementar upload de avatar aqui
                    alert("Upload de avatar será implementado separadamente");
                  }}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    padding: "10px 16px",
                    backgroundColor: 'var(--bg-input)'",
                    color: "#333",
                    border: "1px solid #e0e0e0",
                    borderRadius: "8px",
                    cursor: "pointer",
                    width: "100%",
                  }}
                >
                  Escolher arquivo para avatar
                </button>
                <p
                  style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}
                >
                  JPG, PNG ou GIF (máx. 5MB)
                </p>
              </div>
            </div>
            {/* ... full edit form fields, avatar upload, VIBE, SOUL.md ... */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "12px",
                marginTop: "24px",
              }}
            >
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedAgent(null);
                  setEditAgentName("");
                  setEditAgentEmoji("");
                  setEditAgentAvatar("");
                  setEditAgentModel("");
                  setEditAgentWorkspace("");
                  setEditAgentVibe("");
                  setEditAgentSoul("");
                }}
                style={{
                  padding: "10px 16px",
                  color: "#333",
                  backgroundColor: 'var(--bg-input)'",
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleUpdateAgent}
                disabled={loading || !editAgentName.trim()}
                style={{
                  padding: "10px 16px",
                  backgroundColor: "#4ECDC4",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  cursor:
                    loading || !editAgentName.trim()
                      ? "not-allowed"
                      : "pointer",
                  opacity: loading || !editAgentName.trim() ? 0.5 : 1,
                }}
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {processingToast.visible && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            backgroundColor:
              processingToast.type === "error"
                ? "#fef2f2"
                : processingToast.type === "success"
                  ? "#f0fdf4"
                  : "#f0f9ff",
            border: `1px solid ${
              processingToast.type === "error"
                ? "#fecaca"
                : processingToast.type === "success"
                  ? "#bbf7d0"
                  : "#bae6fd"
            }`,
            borderRadius: "12px",
            padding: "16px",
            minWidth: "300px",
            maxWidth: "400px",
            boxShadow:
              "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            zIndex: 100,
            animation: "slideIn 0.3s ease-out",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "12px",
            }}
          >
            <div
              style={{
                flexShrink: 0,
                width: "24px",
                height: "24px",
                borderRadius: "50%",
                backgroundColor:
                  processingToast.type === "error"
                    ? "#ef4444"
                    : processingToast.type === "success"
                      ? "#10b981"
                      : "#3b82f6",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: "12px",
              }}
            >
              {processingToast.type === "processing" ? (
                <FaSpinner style={{ animation: "spin 1s linear infinite" }} />
              ) : processingToast.type === "success" ? (
                <FaCheck />
              ) : (
                <FaTimes />
              )}
            </div>

            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "#333",
                  marginBottom: processingToast.steps ? "8px" : "0",
                }}
              >
                {processingToast.message}
              </div>

              {processingToast.steps && (
                <div style={{ marginTop: "8px" }}>
                  {processingToast.steps.map((step, index) => (
                    <div
                      key={index}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginBottom: "4px",
                        fontSize: "12px",
                        color:
                          index < (processingToast.currentStep || 0)
                            ? "#10b981"
                            : index === (processingToast.currentStep || 0)
                              ? "#3b82f6"
                              : "#666",
                      }}
                    >
                      <div
                        style={{
                          width: "16px",
                          height: "16px",
                          borderRadius: "50%",
                          backgroundColor:
                            index < (processingToast.currentStep || 0)
                              ? "#10b981"
                              : index === (processingToast.currentStep || 0)
                                ? "#3b82f6"
                                : "#e5e7eb",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                          fontSize: "8px",
                        }}
                      >
                        {index < (processingToast.currentStep || 0) ? (
                          <FaCheck />
                        ) : (
                          index + 1
                        )}
                      </div>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() =>
                setProcessingToast((prev) => ({ ...prev, visible: false }))
              }
              style={{
                color: "#999",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "4px",
                borderRadius: "4px",
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#666";
                e.currentTarget.style.backgroundColor = "#f5f5f5";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#999";
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <FaTimes />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentManager;
