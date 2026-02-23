import { convertToCamelCase, convertToSnakeCase } from '../types';

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
  constructor() {
    this.baseUrl = getApiBaseUrl();
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies for session authentication
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
        
        // Remove campos undefined/null para evitar problemas
        const cleanedBody = Object.fromEntries(
          Object.entries(parsedBody).filter(([_, value]) => value !== undefined && value !== null)
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

  async getProject(id) {
    return this.request(`/projects/${id}`);
  }

  async createProject(data) {
    return this.request('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProject(id, data) {
    return this.request(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteProject(id) {
    return this.request(`/projects/${id}`, {
      method: 'DELETE',
    });
  }

  async getProjectStatistics(id) {
    return this.request(`/projects/${id}/statistics`);
  }

  // Task endpoints
  async getTasks(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = queryParams ? `/tasks?${queryParams}` : '/tasks';
    return this.request(endpoint);
  }

  async getTask(id) {
    return this.request(`/tasks/${id}`);
  }

  async createTask(data) {
    return this.request('/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTask(id, data) {
    return this.request(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteTask(id) {
    return this.request(`/tasks/${id}`, {
      method: 'DELETE',
    });
  }

  async toggleTaskCompletion(id) {
    return this.request(`/tasks/${id}/toggle-completion`, {
      method: 'PATCH',
    });
  }

  async updateTaskPosition(id, position) {
    return this.request(`/tasks/${id}/position`, {
      method: 'PATCH',
      body: JSON.stringify({ position }),
    });
  }

  async getTasksByProject(projectId, filters = {}) {
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

  async getStatus(id) {
    return this.request(`/statuses/${id}`);
  }

  async createStatus(statusData) {
    return this.request('/statuses', {
      method: 'POST',
      body: JSON.stringify(statusData),
    });
  }

  async updateStatus(id, statusData) {
    return this.request(`/statuses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(statusData),
    });
  }

  async deleteStatus(id) {
    return this.request(`/statuses/${id}`, {
      method: 'DELETE',
    });
  }

  // Priority endpoints
  async getPriorities() {
    return this.request('/priorities');
  }

  async getPriority(id) {
    return this.request(`/priorities/${id}`);
  }

  async createPriority(priorityData) {
    return this.request('/priorities', {
      method: 'POST',
      body: JSON.stringify(priorityData),
    });
  }

  async updatePriority(id, priorityData) {
    return this.request(`/priorities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(priorityData),
    });
  }

  async deletePriority(id) {
    return this.request(`/priorities/${id}`, {
      method: 'DELETE',
    });
  }

  // User endpoints
  async getUsers() {
    return this.request('/users');
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
}

export default new ApiService();