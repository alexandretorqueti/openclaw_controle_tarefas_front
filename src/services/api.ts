import { convertToCamelCase, convertToSnakeCase } from '../types';
import { getApiUrl } from '../config/api';
import { Project } from '../types/project';
import { reportErrorToBackend, flushPendingErrors } from '../utils/errorReporter';

// Type definitions for API parameters
interface ProjectData {
  name: string;
  description: string;
  regras?: string;
  status?: boolean;
  ativo?: boolean;
  projectTypeId?: string;
  frontendPath?: string;
  frontendPort?: number;
  backendPath?: string;
  backendPort?: number;
  repositoryUrl?: string;
  pastaBase?: string;
  frontendBuildCmd?: string;
  backendBuildCmd?: string;
  frontendTestCommand?: string;  // NOVO
  backendTestCommand?: string;   // NOVO
  createdById?: string; // Campo opcional para compatibilidade com backend
}

interface UpdateProjectData {
  name?: string;
  description?: string;
  regras?: string;
  status?: boolean;
  ativo?: boolean;
  projectTypeId?: string;
  frontendPath?: string;
  frontendPort?: number;
  backendPath?: string;
  backendPort?: number;
  repositoryUrl?: string;
  pastaBase?: string;
  frontendBuildCmd?: string;
  backendBuildCmd?: string;
  frontendTestCommand?: string;  // NOVO
  backendTestCommand?: string;   // NOVO
}

interface TaskData {
  title: string;
  description: string;
  projectId: string;
  statusId: string;
  priorityId: string;
  assignedToId: string;
  deadline: string;
  parentTaskId?: string | null;
  position?: number;
  agent?: string | null;
}

interface DependencyData {
  taskId: string;
  dependentTaskId: string;
  type?: string;
}

interface UpdateTaskData {
  title?: string;
  description?: string;
  statusId?: string;
  priorityId?: string;
  assignedToId?: string;
  deadline?: string;
  position?: number;
  isCompleted?: boolean;
  agent?: string | null;
}

interface UpdateTaskPositionData {
  position: number;
}

interface StatusData {
  name: string;
  colorCode?: string;
  isFinalState?: boolean;
  order?: number;
}

interface UpdateStatusData {
  name?: string;
  colorCode?: string;
  isFinalState?: boolean;
  order?: number;
}

interface PriorityData {
  name: string;
  weight?: number;
}

interface UpdatePriorityData {
  name?: string;
  weight?: number;
}

interface ProjectTypeData {
  name: string;
  personaPrompt: string;
  baseRules: string;
}

interface UpdateProjectTypeData {
  name?: string;
  personaPrompt?: string;
  baseRules?: string;
}

interface UserData {
  name: string;
  email: string;
  nickname?: string;
  avatarUrl?: string;
  role?: string;
}

interface UpdateUserData {
  name?: string;
  email?: string;
  nickname?: string;
  avatarUrl?: string;
  role?: string;
}

interface CommentData {
  content: string;
  taskId: string;
  userId: string;
  parentCommentId?: string | null;
}

// Use centralized configuration
const getApiBaseUrl = () => {
  return getApiUrl();
};

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = getApiBaseUrl();
    
    // 2. Tenta limpar a gaveta de erros logo que o serviço de API é iniciado!
    flushPendingErrors();
  }

  async request<T>(endpoint: string, options: any = {}, skipJsonProcessing: boolean = false) : Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    // ... (Mantenha a configuração de defaultOptions e config intactas) ...
    const defaultOptions: RequestInit = {
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include' as RequestCredentials,
    };

    const config = {
      ...defaultOptions,
      ...options,
      headers: { ...defaultOptions.headers, ...options.headers },
    };

    if (config.body instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    console.log('[DEBUG api.ts] Body antes snake_case:', config.body);
    if (config.body && typeof config.body === 'string' && !skipJsonProcessing) {
      // ... (Mantenha a lógica de snake_case idêntica) ...
      try {
        const parsedBody = JSON.parse(config.body);
        const cleanedBody = Object.fromEntries(
          Object.entries(parsedBody).filter(([_, value]) => value !== undefined)
        );
        const snakeCaseBody = convertToSnakeCase(cleanedBody);
        config.body = JSON.stringify(snakeCaseBody);
      } catch (error) {
        console.warn('Failed to parse request body for snake_case conversion:', error);
      }
    }

    // 3. A MÁGICA ACONTECE AQUI: Separamos o fetch em um try...catch próprio
    let response: Response;
    try {
      response = await fetch(url, config);
    } catch (networkError: any) {
      // Se cair aqui, a requisição NUNCA chegou no backend (Offline, CORS, Backend caído)
      // Portanto, o front-end assume a responsabilidade e gera a tarefa!
      reportErrorToBackend({
        type: 'Network Error',
        message: `Falha de rede ao tentar acessar ${endpoint}: ${networkError.message}`,
        stack: networkError.stack
      });
      console.error('API network request failed:', networkError);
      throw networkError; // Continua quebrando para a tela mostrar o erro
    }

    // Se a requisição chegou até aqui, a rede está funcionando!
    // Aproveitamos a carona para esvaziar qualquer erro que estivesse preso na gaveta
    if (response.ok) {
      flushPendingErrors();
    }

    // 4. Tratamento de erros de API (onde o backend já sabe do erro)
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: `HTTP error ${response.status}`,
      }));
      
      // NÃO chamamos reportErrorToBackend aqui, pois o backend (ErrorMiddleware) 
      // já capturou esse 400/500 e já criou a tarefa lá do lado dele!
      throw new Error(errorData.error || `HTTP error ${response.status}`);
    }

    const data = await response.json();
    return convertToCamelCase(data);
  }  // Project endpoints
  
  async getProjects() {
    return this.request('/projects');
  }

  async getProject(id: string) : Promise<{ project : Project }> {
    return this.request<{ project : Project}>(`/projects/${id}`);
  }

  async createProject(data: ProjectData) {
    return this.request('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProject(id: string, data: UpdateProjectData): Promise<Project> {
    type UpdateResponse = Project | { message: string; project: Project; correlationId?: string };
    
    const response = await this.request<UpdateResponse>(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });

    if ('project' in response && response.project) {
      return response.project; // É o wrapper, retornamos apenas o projeto
    }
    // A API retorna { message, project, correlationId }
    // Precisamos retornar apenas o projeto
    return response as Project;
  }

  async deleteProject(id: string) {
    return this.request(`/projects/${id}`, {
      method: 'DELETE',
    });
  }

  async getProjectStatistics(id: string) {
    return this.request(`/projects/${id}/statistics`);
  }

  // Task endpoints
  async getTasks(filters: Record<string, any> = {}, sortBy?: string, sortOrder?: 'asc' | 'desc') {
    const queryParams = new URLSearchParams(filters).toString();
    
    // Adicionar parâmetros de ordenação se fornecidos
    const sortParams = [];
    if (sortBy) sortParams.push(`sortBy=${sortBy}`);
    if (sortOrder) sortParams.push(`sortOrder=${sortOrder}`);
    
    const sortQuery = sortParams.length > 0 ? `&${sortParams.join('&')}` : '';
    const endpoint = queryParams ? `/tasks?${queryParams}${sortQuery}` : `/tasks?${sortQuery}`;
    
    return this.request(endpoint);
  }

  async getTask(id: string) {
    return this.request(`/tasks/${id}`);
  }

  async createTask(data: TaskData) {
    return this.request('/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTask(id: string, data: UpdateTaskData) {
    return this.request(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteTask(id: string) {
    return this.request(`/tasks/${id}`, {
      method: 'DELETE',
    });
  }

  async createDependency(data: DependencyData) {
    return this.request('/api/dependencies', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteDependency(taskId: string, dependentTaskId: string) {
    return this.request(`/api/dependencies/${taskId}/${dependentTaskId}`, {
      method: 'DELETE',
    });
  }

  async toggleTaskCompletion(id: string) {
    return this.request(`/tasks/${id}/toggle-completion`, {
      method: 'PATCH',
    });
  }

  async updateTaskPosition(id: string, position: number) {
    return this.request(`/tasks/${id}/position`, {
      method: 'PATCH',
      body: JSON.stringify({ position }),
    });
  }

  async getTasksByProject(projectId: string, filters: Record<string, any> = {}) {
    console.log('🔍 getTasksByProject filters:', filters);
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = queryParams
      ? `/tasks/project/${projectId}?${queryParams}`
      : `/tasks/project/${projectId}?isCompleted=false`; // Default to show only incomplete tasks
    console.log('🔍 getTasksByProject endpoint:', endpoint);
    return this.request(endpoint);
  }

  // Status endpoints
  async getStatuses() {
    return this.request('/statuses');
  }

  async getStatus(id: string) {
    return this.request(`/statuses/${id}`);
  }

  async createStatus(statusData: StatusData) {
    return this.request('/statuses', {
      method: 'POST',
      body: JSON.stringify(statusData),
    });
  }

  async updateStatus(id: string, statusData: UpdateStatusData) {
    return this.request(`/statuses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(statusData),
    });
  }

  async deleteStatus(id: string) {
    return this.request(`/statuses/${id}`, {
      method: 'DELETE',
    });
  }

  // Priority endpoints
  async getPriorities() {
    return this.request('/priorities');
  }

  async getPriority(id: string) {
    return this.request(`/priorities/${id}`);
  }

  async createPriority(priorityData: PriorityData) {
    return this.request('/priorities', {
      method: 'POST',
      body: JSON.stringify(priorityData),
    });
  }

  async updatePriority(id: string, priorityData: UpdatePriorityData) {
    return this.request(`/priorities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(priorityData),
    });
  }

  async deletePriority(id: string) {
    return this.request(`/priorities/${id}`, {
      method: 'DELETE',
    });
  }

  // User endpoints
  async getUsers() {
    return this.request('/users');
  }

  async createUser(data: UserData) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateUser(id: string, data: UpdateUserData) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async uploadAvatar(userId: string, file: File): Promise<{ avatarUrl: string }> {
    const formData = new FormData();
    formData.append('avatar', file);
    formData.append('userId', userId);

    return this.request('/users/upload-avatar', {
      method: 'POST',
      body: formData,
    });
  }

  async deleteUser(id: string) {
    return this.request(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  // Next task by nickname endpoint
  async getNextTaskByNickname(nickname: string) {
    return this.request(`/tasks/next/${nickname}`);
  }

  // Recurrence endpoints
  async getRecurringTasksDue() {
    return this.request('/recurrence/due');
  }

  async markTaskAsExecuted(id: string) {
    return this.request(`/recurrence/${id}/execute`, {
      method: 'POST',
    });
  }

  async executeAllDueTasks() {
    return this.request('/recurrence/execute-all', {
      method: 'POST',
    });
  }

  async calculateNextExecution(id: string) {
    return this.request(`/recurrence/${id}/next-execution`);
  }

  // ProjectType endpoints
  async getProjectTypes() {
    return this.request('/project-types');
  }

  async getProjectType(id: string) {
    return this.request(`/project-types/${id}`);
  }

  async createProjectType(projectTypeData: ProjectTypeData) {
    return this.request('/project-types', {
      method: 'POST',
      body: JSON.stringify(projectTypeData),
    });
  }

  async updateProjectType(id: string, projectTypeData: UpdateProjectTypeData) {
    return this.request(`/project-types/${id}`, {
      method: 'PUT',
      body: JSON.stringify(projectTypeData),
    });
  }

  async deleteProjectType(id: string) {
    return this.request(`/project-types/${id}`, {
      method: 'DELETE',
    });
  }

  // Comment endpoints
  async getCommentsByTask(taskId: string) {
    return this.request(`/comments/task/${taskId}`);
  }

  async getComment(id: string) {
    return this.request(`/comments/${id}`);
  }

  async createComment(data: any) {
    console.log('[DEBUG api.ts createComment] Enviando data:', data);
    return this.request('/comments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateComment(id: string, data: any) {
    return this.request(`/comments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteComment(id: string) {
    return this.request(`/comments/${id}`, {
      method: 'DELETE',
    });
  }
  // Task History endpoints
  async getTaskHistoryByTask(taskId: string) {
    return this.request(`/task-history/task/${taskId}`);
  }

  async getTaskHistory(id: string) {
    return this.request(`/task-history/${id}`);
  }

  // Task Execution endpoints
  async getTaskExecutions(taskId: string) {
    return this.request(`/task-executions/${taskId}`);
  }

  async createTaskHistory(data: any) {
    return this.request('/task-history', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteTaskHistory(id: string) {
    return this.request(`/task-history/${id}`, {
      method: 'DELETE',
    });
  }


  async getCommentReplies(commentId: string) {
    return this.request(`/comments/${commentId}/replies`);
  }

  // Logs endpoints
  async getMonitorLogs() {
    return this.request('/logs/monitor');
  }

  async getErrorLogs(filters: Record<string, any> = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = queryParams ? `/logs/errors?${queryParams}` : '/logs/errors';
    return this.request(endpoint);
  }

  async getErrorDetails(logId: string) {
    return this.request(`/logs/errors/${logId}/details`);
  }

  async getAllLogs(filters: Record<string, any> = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = queryParams ? `/logs?${queryParams}` : '/logs';
    return this.request(endpoint);
  }

  // Agent Management
  async getAgents() {
    return this.request('/agents');
  }

  async getAgent(id: string) {
    return this.request(`/agents/${id}`);
  }

  async createAgent(data: { name: string; workspace?: string }) {
    return this.request('/agents', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateAgentIdentity(id: string, data: { name?: string; emoji?: string; avatar?: string; model?: string; workspace?: string }) {
    return this.request(`/agents/${id}/identity`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async addAgentBinding(id: string, binding: string) {
    return this.request(`/agents/${id}/bindings`, {
      method: 'POST',
      body: JSON.stringify({ binding })
    });
  }

  async removeAgentBinding(id: string, binding: string) {
    return this.request(`/agents/${id}/bindings`, {
      method: 'DELETE',
      body: JSON.stringify({ binding })
    });
  }

  async deleteAgent(id: string) {
    return this.request(`/agents/${id}`, {
      method: 'DELETE'
    });
  }

  // Agent Files
  async getAgentFile(agentId: string, filename: string) {
    return this.request(`/agents/${agentId}/files/${filename}`);
  }

  async updateAgentFile(agentId: string, filename: string, content: string) {
    return this.request(`/agents/${agentId}/files/${filename}`, {
      method: 'PUT',
      body: JSON.stringify({ content })
    });
  }

  // Agent Avatar
  async getAgentAvatar(agentId: string) {
    return this.request(`/agents/${agentId}/avatar`);
  }

  async uploadAgentAvatar(agentId: string, file: File) {
    const formData = new FormData();
    formData.append('avatar', file);
    
    return this.request(`/agents/${agentId}/avatar`, {
      method: 'POST',
      body: formData,
      skipJsonProcessing: true
    });
  }

  // Stage endpoints
  async getStages() {
    return this.request('/stages');
  }

  async getStage(id: number) {
    return this.request(`/stages/${id}`);
  }

  async createStage(data: { etapa: string }) {
    return this.request('/stages', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateStage(id: number, data: { etapa: string }) {
    return this.request(`/stages/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteStage(id: number) {
    return this.request(`/stages/${id}`, {
      method: 'DELETE',
    });
  }
}

export default new ApiService();
