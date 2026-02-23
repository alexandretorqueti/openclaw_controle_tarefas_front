// Types that match the API response (camelCase)
export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: 'Admin' | 'Viewer' | 'Editor';
  createdAt?: string;
  updatedAt?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  regras?: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  status: boolean;
  createdBy?: User;
  tasks?: Task[];
  statistics?: {
    totalTasks: number;
    completedTasks: number;
    overdueTasks: number;
    progress: number;
  };
}

export interface Status {
  id: string;
  name: string;
  colorCode: string;
  isFinalState: boolean;
  order?: number;
}

export interface Priority {
  id: string;
  name: string;
  weight: number;
}

export interface Task {
  id: string;
  projectId: string;
  parentTaskId: string | null;
  title: string;
  description: string;
  statusId: string;
  priorityId: string;
  createdById: string;
  assignedToId: string;
  deadline: string;
  position: number;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
  
  // Recurrence fields
  isRecurring?: boolean;
  recurrenceType?: 'daily' | 'weekly' | 'monthly' | null;
  recurrenceTimes?: string[] | null;
  recurrenceDays?: number[] | null;
  lastExecutedAt?: string | null;
  nextExecutionAt?: string | null;
  
  // Optional relations (from API includes)
  project?: {
    id: string;
    name: string;
    description?: string;
  };
  status?: Status;
  priority?: Priority;
  createdBy?: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
  assignedTo?: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
  parentTask?: {
    id: string;
    title: string;
  };
  subtasks?: Task[];
}

export interface TaskDependency {
  id: string;
  taskId: string;
  dependentTaskId: string;
  type: 'BLOCKING' | 'PARALLEL';
}

export interface TaskComment {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  parentCommentId: string | null;
  user?: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  replies?: TaskComment[];
}

export interface TaskAttachment {
  id: string;
  taskId: string;
  fileName: string;
  fileUrl: string;
  mimeType: string;
  userId: string;
  createdAt: string;
  user?: {
    id: string;
    name: string;
  };
}

export interface TaskHistory {
  id: string;
  taskId: string;
  userId: string;
  oldStatusId: string;
  newStatusId: string;
  notes?: string;
  timestamp: string;
  user?: {
    id: string;
    name: string;
  };
}

// Legacy types (snake_case) for backward compatibility
export type LegacyUser = User & {
  avatar_url?: string;
};

export type LegacyProject = Project & {
  created_by: string;
  created_at: string;
};

export type LegacyStatus = Status & {
  color_code: string;
  is_final_state: boolean;
};

export type LegacyTask = Task & {
  project_id: string;
  parent_task_id: string | null;
  status_id: string;
  priority_id: string;
  created_by: string;
  assigned_to: string;
  is_completed: boolean;
};

// Helper function to convert legacy snake_case to camelCase
export function convertToCamelCase<T>(obj: any): T {
  if (Array.isArray(obj)) {
    return obj.map(item => convertToCamelCase(item)) as any;
  }
  
  if (obj !== null && typeof obj === 'object') {
    const newObj: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
        const value = obj[key];
        
        // Special handling for JSON strings that should be arrays
        if ((camelKey === 'recurrenceTimes' || camelKey === 'recurrenceDays') && 
            typeof value === 'string') {
          // Handle empty string, "null", or "[]" as null/empty array
          const trimmedValue = value.trim();
          if (trimmedValue === '' || trimmedValue === 'null') {
            newObj[camelKey] = null;
          } else if (trimmedValue === '[]') {
            newObj[camelKey] = [];
          } else if (trimmedValue.startsWith('[')) {
            try {
              newObj[camelKey] = JSON.parse(value);
            } catch (error) {
              console.warn(`Failed to parse ${camelKey} as JSON:`, value, error);
              newObj[camelKey] = null; // Fallback to null instead of keeping invalid string
            }
          } else {
            // If it's a string but not JSON array, treat as null
            newObj[camelKey] = null;
          }
        } else {
          newObj[camelKey] = convertToCamelCase(value);
        }
      }
    }
    return newObj;
  }
  
  return obj;
}

// Helper function to convert camelCase to snake_case for API requests
export function convertToSnakeCase<T>(obj: any): T {
  if (Array.isArray(obj)) {
    return obj.map(item => convertToSnakeCase(item)) as any;
  }
  
  if (obj !== null && typeof obj === 'object') {
    const newObj: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        const value = obj[key];
        
        // Special handling for arrays that should be JSON strings
        if ((key === 'recurrenceTimes' || key === 'recurrenceDays') && Array.isArray(value)) {
          newObj[snakeKey] = JSON.stringify(value);
        } else {
          newObj[snakeKey] = convertToSnakeCase(value);
        }
      }
    }
    return newObj;
  }
  
  return obj;
}