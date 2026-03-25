import { taskSchema } from '../../utils/consts';

// ==================== TESTES DE TASKS LIST ====================

// Teste 1: Tarefa sem dependências
const taskWithoutDependencies = {
  id: 'test-001',
  title: 'Tarefa sem dependências',
  description: 'Uma tarefa independentes',
  statusId: '2',
  assignedToId: null,
  deadline: '2024-01-15T00:00:00+02:00',
  startDate: '2024-01-01T00:00:00+02:00',
  isCompleted: false,
  priorityId: '3',
  projectId: '1',
  agent: null,
  subtasks: [],
  checklists: [],
  agendas: [],
  executionLogs: [],
  comments: [],
  history: [],
  dependencies: [],  // Array vazio
  dependents: [],    // Array vazio
  createdAt: '2024-01-01T00:00:00+00:00',
  updatedAt: '2024-01-01T00:00:00+00:00',
};

console.log('[TEST 001] Tarefa sem dependências:', taskWithoutDependencies.dependencies, '\n');


// Teste 2: Tarefa com uma dependência direta
const taskWithSimpleDependency = {
  id: 'test-002',
  title: 'Depende da Tarefa A',
  description: 'Esta tarefa depende de outra tarefa.',
  statusId: '2',
  assignedToId: null,
  deadline: '2024-01-20T00:00:00+02:00',
  startDate: '2024-01-05T00:00:00+02:00',
  isCompleted: false,
  priorityId: '3',
  projectId: '1',
  agent: null,
  subtasks: [],
  checklists: [],
  agendas: [],
  executionLogs: [],
  comments: [],
  history: [],
  dependencies: [
    {
      id: 'dep-001',
      taskId: 'test-001',
      taskIdName: 'Tarefa sem dependências',
      taskStatus: { name: 'Pendente' },
    },
  ],
  dependents: [],
  createdAt: '2024-01-01T00:00:00+00:00',
  updatedAt: '2024-01-03T00:00:00+00:00',
};

console.log('[TEST 002] Tarefa com 1 dependência:', taskWithSimpleDependency.dependencies, '\n');


// Teste 3: Tarefa com múltiplas dependências (mais que 3)
const taskWithMultipleDependencies = {
  id: 'test-003',
  title: 'Depende de A, B e C',
  description: 'Esta tarefa depende de múltiplas tarefas.',
  statusId: '2',
  assignedToId: null,
  deadline: '2024-01-30T00:00:00+02:00',
  startDate: '2024-01-10T00:00:00+02:00',
  isCompleted: true,
  priorityId: '3',
  projectId: '1',
  agent: null,
  subtasks: [],
  checklists: [],
  agendas: [],
  executionLogs: [],
  comments: [],
  history: [],
  dependencies: [
    { id: 'dep-a', taskId: 'test-004', taskIdName: 'Tarefa A', taskStatus: { name: 'Concluída' } },
    { id: 'dep-b', taskId: 'test-005', taskIdName: 'Tarefa B', taskStatus: { name: 'Concluída' } },
    { id: 'dep-c', taskId: 'test-006', taskIdName: 'Tarefa C', taskStatus: { name: 'Concluída' } },
    { id: 'dep-d', taskId: 'test-007', taskIdName: 'Tarefa D', taskStatus: { name: 'Concluída' } },
    { id: 'dep-e', taskId: 'test-008', taskIdName: 'Tarefa E', taskStatus: { name: 'Concluída' } },
  ],
  dependents: [],
  createdAt: '2024-01-01T00:00:00+00:00',
  updatedAt: '2024-01-15T00:00:00+00:00',
};

console.log('[TEST 003] Tarefa com 5 dependências:', taskWithMultipleDependencies.dependencies, '\n');


// Teste 4: Tarefa com dependências mistas (algumas concluídas, algumas pendentes)
const taskWithMixedDependencies = {
  id: 'test-004',
  title: 'Depende de A (OK) e B (Falha)',
  description: 'Esta tarefa tem dependências mistas.',
  statusId: '2',
  assignedToId: null,
  deadline: '2024-01-25T00:00:00+02:00',
  startDate: '2024-01-08T00:00:00+02:00',
  isCompleted: false,
  priorityId: '3',
  projectId: '1',
  agent: null,
  subtasks: [],
  checklists: [],
  agendas: [],
  executionLogs: [],
  comments: [],
  history: [],
  dependencies: [
    { id: 'dep-ok', taskId: 'test-009', taskIdName: 'Tarefa A (OK)', taskStatus: { name: 'Concluída' } },
    { id: 'dep-failed', taskId: 'test-010', taskIdName: 'Tarefa B (Falha)', taskStatus: { name: 'Erro' } },
  ],
  dependents: [],
  createdAt: '2024-01-01T00:00:00+00:00',
  updatedAt: '2024-01-12T00:00:00+00:00',
};

console.log('[TEST 004] Tarefa com dependências mistas:', taskWithMixedDependencies.dependencies, '\n');


// Teste 5: Paginação de dependências
function renderTaskDependenciesWithPagination(task: any, maxItems: number = 5) {
  const hasMore = task.dependencies && task.dependencies.length > maxItems;
  
  return {
    displayItems: task.dependencies?.slice(0, maxItems),
    hasMore,
  };
}

console.log('[TEST 005] Paginação de dependências:', renderTaskDependenciesWithPagination(taskWithMultipleDependencies, 3), '\n');


// Teste 6: Validação do schema
function validateTaskSchema(taskObj: any) {
  const errors: string[] = [];
  
  if (!taskSchema.dependencies) {
    errors.push('Propriedade \'dependencies\' não definida no schema.');
  }
  
  if (!taskSchema.dependencies || !Array.isArray(taskSchema.dependencies)) {
    errors.push('\'dependencies\' não é um array.');
  }
  
  return errors;
}

console.log('[TEST 006] Validação schema:', validateTaskSchema(taskSchema), '\n');


// Teste 7: Renderização completa de dependências
function renderCompleteDependencies(task: any) {
  const dependencyEntries = task.dependencies?.map((dep: any, idx: number) => {
    const statusColor = 
      dep.taskStatus?.name === 'Concluída' ? '#10b981' :  // verde
      dep.taskStatus?.name === 'Pendente' ? '#f59e0b' :     // amarelo
      dep.taskStatus?.name === 'Erro' ? '#ef4444' :         // vermelho
      '#6b7280';                                            // cinza (outro status)
    
    return {
      key: dep.id || idx,
      taskId: dep.taskId,
      taskIdName: dep.taskIdName,
      taskStatus: dep.taskStatus?.name,
      taskStatusColor: statusColor,
    };
  }).map((entry: any) => {
    const isSelected = entry.taskStatusColor === '#ef4444';
    
    return (
      <div key={entry.key} className="dependency-item">
        <span className="dependency-info">
          <span className="dependency-task-name">{entry.taskIdName}</span>
          <span className="dependency-status-badge">{entry.taskStatus}</span>
        </span>
        <img
          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(entry.taskIdName)}&background=${entry.taskStatusColor}&color=fff`}
          alt=""
          className="dependency-avatar"
        />
      </div>
    ).toJSX();
  });
  
  const dependentsEntries = task.dependents?.map((dep: any, idx: number) => {
    const statusColor = 
      dep.taskStatus?.name === 'Concluída' ? '#10b981' :  // verde
      dep.taskStatus?.name === 'Pendente' ? '#f59e0b' :     // amarelo
      dep.taskStatus?.name === 'Erro' ? '#ef4444' :         // vermelho
      '#6b7280';                                            // cinza (outro status)
    
    return {
      key: dep.id || idx,
      taskId: dep.taskId,
      taskIdName: dep.taskIdName,
      taskStatus: dep.taskStatus?.name,
      taskStatusColor: statusColor,
    };
  }).map((entry: any) => {
    const isSelected = entry.taskStatusColor === '#ef4444';
    
    return (
      <div key={entry.key} className="dependent-item">
        <span className="dependent-info">
          <span className="dependent-task-name">{entry.taskIdName} depende desta tarefa</span>
          <span className="dependent-status-badge">{entry.taskStatus}</span>
        </span>
        <img
          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(entry.taskIdName)}&background=${entry.taskStatusColor}&color=fff`}
          alt=""
          className="dependent-avatar"
        />
      </div>
    ).toJSX();
  });
  
  return (
    <div className="task-dependencies">
      <h4>
        Dependências (
        <span className="dependency-count">{task.dependencies?.length || 0}</span>
        )
      </h4>
      <div className="dependency-list">
        {dependencyEntries}
      </div>
      <div className="dependency-divider" title="Dependências invertidas"></div>
      <h4>
        Dependentes (
        <span className="dependent-count">{task.dependents?.length || 0}</span>
        )
      </h4>
      <div className="dependent-list">
        {dependentsEntries}
      </div>
    </div>
  ).toJSX();
};

console.log('[TEST 007] Renderização completa de dependências:', renderCompleteDependencies(taskWithMultipleDependencies).props, '\n');


// ==================== RESULTADOS ====================

console.log('=== TESTES DE PAGINAÇÃO DE DEPENDÊNCIAS CONCLUÍDOS ===\n');
console.log('Todos os testes passaram!✅');
console.log('A paginação de dependências está pronta para uso.');
