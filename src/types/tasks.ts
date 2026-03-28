import { Project } from "./project";

export interface Task {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  deadline: Date;
  position: number;
  createdAt: Date;
  updatedAt: Date;
  isRecurring: boolean;
  recurrenceType?: string;
  recurrenceTimes?: string;
  recurrenceDays?: string;
  lastExecutedAt?: Date;
  nextExecutionAt?: Date;
  agent?: string;
  domain?: string;
  isDecomposed: boolean;
  isAtomic: boolean;
  isExecuting: boolean;
  hasChildExecuting: boolean; // Corrigido o erro de digitação
  projectId: string;
  parentTaskId?: string;
  statusId: string;
  priorityId: string;
  createdById: string;
  assignedToId: string;
  arquitetosPromptContent?: string;
  arquitetosAnalysisContent?: string;
  arquitetosTerminalContent?: string;
  programadorTerminalContent?: string;
  programadorReportContent?: string;
  totalSubtasks: number;
  
  // Relacionamentos (opcionais, dependendo da sua consulta)
  attachments?: Attachment[];
  comments?: Comment[];
  dependencies?: Dependency[];
  dependents?: Dependency[];
  executionLogs?: TaskExecutionLog[];
  history?: TaskHistory[];
  project?: Project;
  parentTask?: Task;
  subtasks?: Task[];
  status?: Status;
  priority?: Priority;
  createdBy?: any;
  assignedTo?: any;
}

export interface Comment {
  id: string;
  author: string;
  authorAvatar: string;
  text: string;
  createdAt: string;
}

export interface Log {
  id: string;
  timestamp: string;
  level: 'INFO' | 'DEBUG' | 'WARN' | 'ERROR';
  message: string;
}

export interface Status {
  id: string;
  name: string;
  colorCode: string; // Ex: "#FF0000"
  isFinalState: boolean;
  visibleToAi: boolean;
  order: number;
  
  // Relacionamentos
  tasks?: Task[];
}


export interface Priority {
  id: string;
  name: string;
  weight: number;
  
  // Relacionamentos
  tasks?: Task[];
}
export interface File {
  id: string;
  name: string;
  size: string;
  url?: string;
  mimeType?: string;
}

export interface Dependency {
  id: string;
  type: string; // Ex: "BLOCKING", "NON_BLOCKING"
  taskId: string;
  dependentTaskId: string;
  
  // Relacionamentos (Opcionais no TS para evitar recursividade infinita)
  task?: Task;
  dependentTask?: Task;
}

export interface Attachment {
  id: string;
  fileName: string;
  fileUrl: string;
  mimeType: string;
  createdAt: Date;
  taskId: string;
  userId: string;

  // Relacionamentos Opcionais
  task?: Task;
  user?: any;
}

export interface TaskHistory {
  id: string;
  oldStatusId: string;
  newStatusId: string;
  notes?: string;
  timestamp: Date;
  taskId: string;
  userId: string;

  // Relacionamentos Opcionais
  task?: Task;
  user?: any;
}

export interface TaskExecutionLog {
  id: string;
  taskId: string;
  userId?: string;
  startedAt: Date;
  finishedAt?: Date;
  model: string;
  executionNotes?: string;
  success: boolean;
  durationMs?: number; // Int no Prisma vira number no TS
  exitCode?: number;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;

  // Relacionamentos
  user?: any;
  task?: Task;
}