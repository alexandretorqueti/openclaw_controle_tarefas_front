import { convertToCamelCase, convertToSnakeCase } from '../types';

// Type definitions for API parameters
interface ProjectData {
  name: string;
  description: string;
  regras?: string;
}

interface UpdateProjectData {
  name?: string;
  description?: string;
  regras?: string;
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

// Use relative URL or detect environment
const getApiBaseUrl = () => {
  const hostname = window.location.hostname;
  const port = window.location.port;
  const protocol = window.location.protocol;
  
  // Determine backend port based on frontend port
  let backendPort = 3001; // Default to development
  
  if (port === '8090' || port === '8091') {
    // Production environment
    backendPort = 8091;
  } else if (port === '3000' || port === '3001') {
    // Development environment
    backendPort = 3001;
  } else if (!port) {
    // No port specified (default ports)
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      // Default to development for localhost without port
      backendPort = 3001;
    } else {
      // For other hosts without port, try to detect
      backendPort = 8091; // Assume production
    }
  }
  
  console.log(`🌐 Frontend: ${hostname}:${port} → Backend: ${hostname}:${backendPort}`);
  
  // For localhost (development or production)
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `http://localhost:${backendPort}/api`;
  }
  // For IP address access (network)
  else if (hostname === '192.168.1.70') {
    return `http://192.168.1.70:${backendPort}/api`;
  }
  // For domain access (tarefas.local)
  else if (hostname === 'tarefas.local' || hostname === 'web.tarefas.local') {
    return `http://api.tarefas.local:${backendPort}/api`;
  }
  // For any other hostname
  else {
    // Use same host with calculated backend port
    return `http://${hostname}:${backendPort}/api`;
  }
};

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = getApiBaseUrl();
  }

  async request(endpoint: string, options: any = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include' as RequestCredentials, // Include cookies for session authentication
    };

    const config = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    };

    // Convert request body to snake_case if present
    if (config.body && typeof config.body === 'string') {
      try {
        const parsedBody = JSON.parse(config.body);
        
        // Remove campos undefined para evitar problemas, mantendo booleanos (false)
        const cleanedBody = Object.fromEntries(
          Object.entries(parsedBody).filter(([_, value]) => value !== undefined)
        );
        
        const snakeCaseBody = convertToSnakeCase(cleanedBody);
        config.body = JSON.stringify(snakeCaseBody);
      } catch (error) {
        // If body is not valid JSON, leave it as is
        console.warn('Failed to parse request body for snake_case conversion:', error);
      }
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({
          error: `HTTP error ${response.status}`,
        }));
        throw new Error(error.error || `HTTP error ${response.status}`);
      }

      const data = await response.json();
      
      // Convert response data to camelCase
      return convertToCamelCase(data);
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Project endpoints
  async getProjects() {
    return this.request('/projects');
  }

  async getProject(id: string) {
    return this.request(`/projects/${id}`);
  }

  async createProject(data: ProjectData) {
    return this.request('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProject(id: string, data: UpdateProjectData) {
    return this.request(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
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
  async getTasks(filters: Record<string, any> = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = queryParams ? `/tasks?${queryParams}` : '/tasks';
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
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = queryParams
      ? `/tasks/project/${projectId}?${queryParams}`
      : `/tasks/project/${projectId}`;
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

  async deleteUser(id: string) {
    return this.request(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  // Next task by nickname endpoint
  async getNextTaskByNickname(nickname: string) {
    return this.request(`/users/nickname/${nickname}/next-task`);
  }

  // Recurrence endpoints
  async getRecurringTasksDue() {
    return this.request('/recurrence/due');
  }

  async markTaskAsExecuted(id) {
    return this.request(`/recurrence/${id}/execute`, {
      method: 'POST',
    });
  }

  async executeAllDueTasks() {
    return this.request('/recurrence/execute-all', {
      method: 'POST',
    });
  }

  async calculateNextExecution(id) {
    return this.request(`/recurrence/${id}/next-execution`);
  }

  // Comment endpoints
  async getCommentsByTask(taskId) {
    return this.request(`/comments/task/${taskId}`);
  }

  async getComment(id) {
    return this.request(`/comments/${id}`);
  }

  async createComment(data) {
    return this.request('/comments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateComment(id, data) {
    return this.request(`/comments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteComment(id) {
    return this.request(`/comments/${id}`, {
      method: 'DELETE',
    });
  }

  async getCommentReplies(commentId) {
    return this.request(`/comments/${commentId}/replies`);
  }
}

export default new ApiService();