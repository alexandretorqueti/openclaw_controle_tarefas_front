import { Task } from "./tasks";

export interface Project {
  id: string;
  name: string;
  description: string;
  regras?: string;
  status: boolean;
  ativo: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdById: string;
  projectTypeId?: string;
  frontendPath?: string;
  frontendPort?: number;
  backendPath?: string;
  backendPort?: number;
  repositoryUrl?: string;
  pastaBase?: string;
  agent?: string;
  programadorFront?: string;
  programadorBack?: string;
  frontendBuildCmd?: string;
  backendBuildCmd?: string;
  modeloAuxiliar?: string;

  // Relacionamentos
  projectType?: any;
  createdBy?: any;
  tasks?: Task[];
}