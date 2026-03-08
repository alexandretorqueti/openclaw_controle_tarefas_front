export interface AgentIdentity {
  name: string;
  emoji?: string;
  avatar?: string;
}

export interface Agent {
  id: string;
  identity: AgentIdentity;
  bindings: string[];
  workspace?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAgentRequest {
  name: string;
  workspace?: string;
}

export interface UpdateAgentIdentityRequest {
  name?: string;
  emoji?: string;
  avatar?: string;
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