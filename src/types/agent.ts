export interface AgentIdentity {
  name: string;
  emoji?: string;
  avatar?: string;
  model?: string;
  description?: string;
  vibe?: string;
}

export interface Agent {
  id: string;
  identity: AgentIdentity;
  bindings: number;  // Número de bindings (0, 1, 2...)
  bindingsList: string[];  // Lista de bindings ativos
  workspace?: string;
  createdAt?: string;
  updatedAt?: string;
  avatarUrl?: string;
}

export interface CreateAgentRequest {
  name: string;
  workspace?: string;
}

export interface UpdateAgentIdentityRequest {
  name?: string;
  emoji?: string;
  avatar?: string;
  model?: string;
}

export interface BindingRequest {
  binding: string; // formato: canal:conta
}

export interface AgentsResponse {
  success: boolean;
  data: Agent[];
  count: number;
}

export interface AgentResponse {
  success: boolean;
  data: Agent;
}

export interface OperationResponse {
  success: boolean;
  data?: any;
  message: string;
  error?: string;
  stderr?: string;
}

export interface AgentFormData {
  name: string;
  workspace: string;
}

export interface AgentEditFormData {
  name: string;
  emoji: string;
  avatar: string;
}

export interface BindingFormData {
  binding: string;
}