import { convertToCamelCase, convertToSnakeCase } from '../types';

// Use relative URL or detect environment
const getApiBaseUrl = () => {
  const hostname = window.location.hostname;
  const port = window.location.port;
  
  // For localhost (development)
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:3001/api';
  }
  // For IP address access (network)
  else if (hostname === '192.168.1.70') {
    return 'http://192.168.1.70:3001/api';
  }
  // For domain access (tarefas.local)
  else if (hostname === 'tarefas.local' || hostname === 'web.tarefas.local') {
    return 'http://api.tarefas.local:3001/api';
  }
  // For any other hostname
  else {
    // Try to use same host with port 3001
    return `http://${hostname}:3001/api`;
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
        console.log('📤 Request body (camelCase):', JSON.stringify(parsedBody, null, 2));
        const snakeCaseBody = convertToSnakeCase(parsedBody);
        console.log('📤 Request body (snake_case):', JSON.stringify(snakeCaseBody, null, 2));
        config.body = JSON.stringify(snakeCaseBody);
      } catch (error) {
        // If body is not valid JSON, leave it as is
        console.warn('Failed to parse request body for snake_case conversion:', error);
      }
    }

    try {
      console.log(`🌐 Making request to: ${url}`);
      console.log(`🌐 Method: ${config.method || 'GET'}`);
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

  // Priority endpoints
  async getPriorities() {
    return this.request('/priorities');
  }

  // User endpoints
  async getUsers() {
    return this.request('/users');
  }
}

export default new ApiService();