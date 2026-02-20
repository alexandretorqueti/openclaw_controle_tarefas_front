import { v4 as uuidv4 } from 'uuid';
import { User, Project, Status, Priority, Task, TaskDependency, TaskComment, TaskAttachment, TaskHistory } from '../types';

// Helper function to create mock data with camelCase
export const mockUsers: User[] = [
  {
    id: uuidv4(),
    name: 'Alexandre Bragato',
    email: 'alexandre@example.com',
    avatarUrl: 'https://i.pravatar.cc/150?img=1',
    role: 'Admin'
  },
  {
    id: uuidv4(),
    name: 'Maria Silva',
    email: 'maria@example.com',
    avatarUrl: 'https://i.pravatar.cc/150?img=2',
    role: 'Editor'
  },
  {
    id: uuidv4(),
    name: 'João Santos',
    email: 'joao@example.com',
    avatarUrl: 'https://i.pravatar.cc/150?img=3',
    role: 'Viewer'
  }
];

export const mockStatuses: Status[] = [
  { id: uuidv4(), name: 'Pendente', colorCode: '#FF6B6B', isFinalState: false },
  { id: uuidv4(), name: 'Em Andamento', colorCode: '#4ECDC4', isFinalState: false },
  { id: uuidv4(), name: 'Em Revisão', colorCode: '#FFD166', isFinalState: false },
  { id: uuidv4(), name: 'Concluído', colorCode: '#06D6A0', isFinalState: true },
  { id: uuidv4(), name: 'Bloqueado', colorCode: '#118AB2', isFinalState: false }
];

export const mockPriorities: Priority[] = [
  { id: uuidv4(), name: 'Baixa', weight: 1 },
  { id: uuidv4(), name: 'Média', weight: 2 },
  { id: uuidv4(), name: 'Alta', weight: 3 },
  { id: uuidv4(), name: 'Crítica', weight: 4 }
];

export const mockProjects: Project[] = [
  {
    id: uuidv4(),
    name: 'Sistema de Gestão de Tarefas',
    description: 'Desenvolvimento do novo sistema de gestão de tarefas com React e TypeScript. Inclui todas as funcionalidades de CRUD, filtros, ordenação e visualização por projeto.',
    createdById: mockUsers[0].id,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    status: true
  },
  {
    id: uuidv4(),
    name: 'Documentação Técnica',
    description: 'Criação da documentação completa do sistema, incluindo guias de instalação, manuais de usuário e documentação da API.',
    createdById: mockUsers[1].id,
    createdAt: '2024-01-10T14:30:00Z',
    updatedAt: '2024-01-10T14:30:00Z',
    status: true
  },
  {
    id: uuidv4(),
    name: 'Marketing Digital',
    description: 'Campanha de marketing para lançamento do novo produto. Inclui estratégia de conteúdo, anúncios patrocinados e redes sociais.',
    createdById: mockUsers[0].id,
    createdAt: '2024-01-05T09:15:00Z',
    updatedAt: '2024-01-05T09:15:00Z',
    status: true
  },
  {
    id: uuidv4(),
    name: 'Infraestrutura DevOps',
    description: 'Configuração de pipeline CI/CD, containers Docker, monitoramento e infraestrutura em nuvem.',
    createdById: mockUsers[2].id,
    createdAt: '2024-01-20T16:45:00Z',
    updatedAt: '2024-01-20T16:45:00Z',
    status: false
  },
  {
    id: uuidv4(),
    name: 'Treinamento da Equipe',
    description: 'Programa de treinamento para capacitação da equipe nas novas tecnologias e processos.',
    createdById: mockUsers[1].id,
    createdAt: '2024-01-25T11:20:00Z',
    updatedAt: '2024-01-25T11:20:00Z',
    status: true
  }
];

export const mockTasks: Task[] = [
  {
    id: uuidv4(),
    projectId: mockProjects[0].id,
    parentTaskId: null,
    title: 'Criar Componente de Lista de Tarefas',
    description: 'Desenvolver o componente principal que exibe a lista de tarefas com filtros e ordenação.',
    statusId: mockStatuses[1].id,
    priorityId: mockPriorities[2].id,
    createdById: mockUsers[0].id,
    assignedToId: mockUsers[1].id,
    deadline: '2024-02-15T23:59:59Z',
    position: 1,
    isCompleted: false,
    createdAt: '2024-01-16T09:00:00Z',
    updatedAt: '2024-01-16T09:00:00Z'
  },
  {
    id: uuidv4(),
    projectId: mockProjects[0].id,
    parentTaskId: null,
    title: 'Implementar Sistema de Dependências',
    description: 'Criar a lógica para gerenciar dependências entre tarefas (bloqueio, paralelismo).',
    statusId: mockStatuses[0].id,
    priorityId: mockPriorities[3].id,
    createdById: mockUsers[0].id,
    assignedToId: mockUsers[0].id,
    deadline: '2024-02-20T23:59:59Z',
    position: 2,
    isCompleted: false,
    createdAt: '2024-01-16T10:30:00Z',
    updatedAt: '2024-01-16T10:30:00Z'
  },
  {
    id: uuidv4(),
    projectId: mockProjects[0].id,
    parentTaskId: null,
    title: 'Criar Componente de Subtarefas',
    description: 'Implementar a funcionalidade de subtarefas hierárquicas.',
    statusId: mockStatuses[0].id,
    priorityId: mockPriorities[1].id,
    createdById: mockUsers[1].id,
    assignedToId: mockUsers[2].id,
    deadline: '2024-02-10T23:59:59Z',
    position: 3,
    isCompleted: false,
    createdAt: '2024-01-17T14:20:00Z',
    updatedAt: '2024-01-17T14:20:00Z'
  },
  {
    id: uuidv4(),
    projectId: mockProjects[1].id,
    parentTaskId: null,
    title: 'Escrever Documentação de API',
    description: 'Documentar todos os endpoints da API REST com exemplos de requisição e resposta.',
    statusId: mockStatuses[3].id,
    priorityId: mockPriorities[2].id,
    createdById: mockUsers[1].id,
    assignedToId: mockUsers[0].id,
    deadline: '2024-01-28T23:59:59Z',
    position: 1,
    isCompleted: true,
    createdAt: '2024-01-11T11:00:00Z',
    updatedAt: '2024-01-28T18:30:00Z'
  },
  {
    id: uuidv4(),
    projectId: mockProjects[1].id,
    parentTaskId: null,
    title: 'Criar Guia de Instalação',
    description: 'Documentar passo a passo para instalação do sistema em diferentes ambientes.',
    statusId: mockStatuses[1].id,
    priorityId: mockPriorities[1].id,
    createdById: mockUsers[0].id,
    assignedToId: mockUsers[1].id,
    deadline: '2024-02-05T23:59:59Z',
    position: 2,
    isCompleted: false,
    createdAt: '2024-01-12T15:45:00Z',
    updatedAt: '2024-01-12T15:45:00Z'
  },
  {
    id: uuidv4(),
    projectId: mockProjects[2].id,
    parentTaskId: null,
    title: 'Criar Estratégia de Conteúdo',
    description: 'Desenvolver calendário editorial e temas para posts nas redes sociais.',
    statusId: mockStatuses[0].id,
    priorityId: mockPriorities[2].id,
    createdById: mockUsers[0].id,
    assignedToId: mockUsers[1].id,
    deadline: '2024-02-25T23:59:59Z',
    position: 1,
    isCompleted: false,
    createdAt: '2024-01-06T10:15:00Z',
    updatedAt: '2024-01-06T10:15:00Z'
  },
  {
    id: uuidv4(),
    projectId: mockProjects[2].id,
    parentTaskId: null,
    title: 'Configurar Anúncios no Google Ads',
    description: 'Criar campanhas de anúncios patrocinados e configurar remarketing.',
    statusId: mockStatuses[0].id,
    priorityId: mockPriorities[1].id,
    createdById: mockUsers[1].id,
    assignedToId: mockUsers[2].id,
    deadline: '2024-02-28T23:59:59Z',
    position: 2,
    isCompleted: false,
    createdAt: '2024-01-07T14:30:00Z',
    updatedAt: '2024-01-07T14:30:00Z'
  },
  {
    id: uuidv4(),
    projectId: mockProjects[3].id,
    parentTaskId: null,
    title: 'Configurar Pipeline CI/CD',
    description: 'Implementar pipeline de integração e deploy contínuo com GitHub Actions.',
    statusId: mockStatuses[0].id,
    priorityId: mockPriorities[3].id,
    createdById: mockUsers[2].id,
    assignedToId: mockUsers[0].id,
    deadline: '2024-02-15T23:59:59Z',
    position: 1,
    isCompleted: false,
    createdAt: '2024-01-21T09:00:00Z',
    updatedAt: '2024-01-21T09:00:00Z'
  },
  {
    id: uuidv4(),
    projectId: mockProjects[4].id,
    parentTaskId: null,
    title: 'Preparar Material de Treinamento',
    description: 'Criar apresentações, exercícios práticos e materiais de referência.',
    statusId: mockStatuses[1].id,
    priorityId: mockPriorities[2].id,
    createdById: mockUsers[1].id,
    assignedToId: mockUsers[0].id,
    deadline: '2024-02-10T23:59:59Z',
    position: 1,
    isCompleted: false,
    createdAt: '2024-01-26T13:45:00Z',
    updatedAt: '2024-01-26T13:45:00Z'
  },
  {
    id: uuidv4(),
    projectId: mockProjects[4].id,
    parentTaskId: null,
    title: 'Agendar Sessões de Treinamento',
    description: 'Organizar calendário de treinamentos e convidar participantes.',
    statusId: mockStatuses[0].id,
    priorityId: mockPriorities[1].id,
    createdById: mockUsers[0].id,
    assignedToId: mockUsers[1].id,
    deadline: '2024-02-05T23:59:59Z',
    position: 2,
    isCompleted: false,
    createdAt: '2024-01-27T16:20:00Z',
    updatedAt: '2024-01-27T16:20:00Z'
  }
];

export const mockDependencies: TaskDependency[] = [
  {
    id: uuidv4(),
    taskId: mockTasks[1].id,
    dependentTaskId: mockTasks[0].id,
    type: 'BLOCKING'
  }
];

export const mockComments: TaskComment[] = [
  {
    id: uuidv4(),
    taskId: mockTasks[0].id,
    userId: mockUsers[0].id,
    content: 'Precisamos adicionar suporte para drag and drop na lista de tarefas.',
    createdAt: '2024-01-16T11:30:00Z',
    updatedAt: '2024-01-16T11:30:00Z',
    parentCommentId: null
  },
  {
    id: uuidv4(),
    taskId: mockTasks[0].id,
    userId: mockUsers[1].id,
    content: 'Concordo, vou pesquisar sobre react-dnd para implementação.',
    createdAt: '2024-01-16T14:45:00Z',
    updatedAt: '2024-01-16T14:45:00Z',
    parentCommentId: null
  }
];

export const mockAttachments: TaskAttachment[] = [
  {
    id: uuidv4(),
    taskId: mockTasks[3].id,
    fileName: 'api-documentation.pdf',
    fileUrl: 'https://example.com/files/api-documentation.pdf',
    mimeType: 'application/pdf',
    userId: mockUsers[0].id,
    createdAt: '2024-01-28T17:00:00Z'
  }
];

export const mockTaskHistory: TaskHistory[] = [
  {
    id: uuidv4(),
    taskId: mockTasks[3].id,
    userId: mockUsers[0].id,
    oldStatusId: mockStatuses[1].id,
    newStatusId: mockStatuses[3].id,
    timestamp: '2024-01-28T18:30:00Z',
    notes: 'Documentação concluída e revisada.'
  }
];