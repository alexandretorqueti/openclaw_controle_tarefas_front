
// Types that match the API response (camelCase)

import { Task, Comment, Log, File, Status } from '../types/tasks';
import { Project } from '../types/project';
import { User } from '../types/user';


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
  visible_to_ai: boolean;
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

export interface Stage {
  id: number;
  etapa: string;
  createdAt?: string;
  updatedAt?: string;
}

// Helper function to convert legacy snake_case to camelCase
export function convertToCamelCase<T>(obj: any): T {
  if (Array.isArray(obj)) {
    return obj.map(item => convertToCamelCase(item)) as any;
  }
  
  if (obj !== null && typeof obj === 'object') {
    const newObj: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        // Preserve specific keys that should NOT be converted
        // This includes "statuses" array wrapper from API responses
        if (key === 'statuses' || key === 'status') {
          newObj[key] = obj[key];
        } else {
          const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
          const value = obj[key];
          
          // Special handling for JSON strings that should be arrays
          if ((camelKey === 'recurrenceTimes' || camelKey === 'recurrenceDays') && 
              typeof value === 'string' && value.trim().startsWith('[')) {
            try {
              newObj[camelKey] = JSON.parse(value);
            } catch (error) {
              console.warn(`Failed to parse ${camelKey} as JSON:`, value, error);
              newObj[camelKey] = value;
            }
          } else {
            newObj[camelKey] = convertToCamelCase(value);
          }
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

// Export task-related types for components
export type TaskDetailProps = {
  task: Task;
  comments: Comment[];
  logs: Log[];
  files: File[];
};