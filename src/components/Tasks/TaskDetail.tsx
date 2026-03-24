// src/components/Tasks/TaskDetail.tsx
import React from 'react';
import './TaskDetail.css';
import { Task, Comment, Log, File, TaskDetailProps } from '../../types/tasks';
import { Agent } from '../../types/agent'; // Supondo que Agent type exista e seja necessário

// Mock data for demonstration if actual data fetching is not yet implemented
const mockTask: Task = {
  id: 'task-123',
  projectId: 'proj-abc',
  parentTaskId: null,
  title: 'Implementar TaskDetail Component',
  description: 'Criar o componente TaskDetail em React com TypeScript, incluindo layout básico e estilização tema escuro.',
  statusId: 'status-running',
  priorityId: 'priority-high',
  createdById: 'user-1',
  assignedToId: 'user-1',
  deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
  position: 1,
  isCompleted: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  agent: 'Jarbas',
  domain: 'Frontend',
  isDecomposed: false,
  isAtomic: true,
  isExecuting: false,
  // Recurrence fields not set for this task
  isRecurring: false,
  recurrenceType: null,
  recurrenceTimes: null,
  recurrenceDays: null,
  lastExecutedAt: null,
  nextExecutionAt: null,
  // Default values for other fields
  arquitetosPromptContent: null,
  arquitetosAnalysisContent: null,
  arquitetosTerminalContent: null,
  programadorTerminalContent: null,
  programadorReportContent: null,
};

const mockComments: Comment[] = [
  {
    id: 'comment-1',
    author: 'Alexandre Torqueti',
    authorAvatar: '/public/avatars/alexandre.png',
    text: 'Excelente trabalho com o componente!',
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
  },
  {
    id: 'comment-2',
    author: 'Igor',
    authorAvatar: '/public/avatars/igor.png',
    text: 'A interface está bem intuitiva. Ótima aplicação do tema escuro.',
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
  },
];

const mockLogs: Log[] = [
  {
    id: 'log-1',
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    level: 'INFO',
    message: 'Componente TaskDetail renderizado com sucesso.'
  },
  {
    id: 'log-2',
    timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    level: 'DEBUG',
    message: 'Verificando dados de comentários.'
  }
];

const mockFiles: File[] = [
  {
    id: 'file-1',
    name: 'task_detail_spec.ts',
    size: '2KB',
    mimeType: 'text/plain'
  },
  {
    id: 'file-2',
    name: 'screenshot.png',
    size: '150KB',
    mimeType: 'image/png',
    url: '/public/attachments/task-123/screenshot.png'
  }
];

// Mock de um objeto Agent para o avatar, se necessário
const mockAgent: Agent = {
  id: 'agent-1',
  identity: {
    name: 'Jarbas',
    avatar: '/public/avatars/jarbas.png',
    model: 'deepseek-chat',
  },
  bindings: 0,
  bindingsList: [],
  workspace: '/home/alexandrebragatorqueti/agentes/jarbas'
};

// Props para o componente TaskDetail
const taskDetailProps: TaskDetailProps = {
  task: mockTask,
  comments: mockComments,
  logs: mockLogs,
  files: mockFiles,
};

const TaskDetail: React.FC<TaskDetailProps> = ({ task, comments, logs, files }) => {
  // Estado para controlar a visibilidade dos detalhes (opcional)
  const [showDetails, setShowDetails] = React.useState(true);

  // Handler para fechar o modal (se fosse um modal)
  const handleClose = () => {
    console.log('Closing Task Detail');
  };

  return (
    <div className="task-detail-container">
      {/* Header da Tarefa */}
      <div className="task-detail-header">
        <div className="task-title">{task.title}</div>
        <div className="task-meta">
          <span className="task-id">ID: {task.id}</span>
          <span className={`task-status ${task.statusId}`}>{task.statusId}</span> {/* Usando statusId diretamente para exemplo */}
        </div>
      </div>

      {/* Corpo da Tarefa */}
      <div className="task-detail-body">
        <div className="task-description">
          <h3>Descrição</h3>
          <p>{task.description}</p>
        </div>

        {/* Comentários */}
        <div className="comments-section">
          <h3>Comentários (<span className="comment-count">{comments.length}</span>)</h3>
          {comments.map((comment) => (
            <div key={comment.id} className="comment-item">
              <div className="comment-header">
                <img src={comment.authorAvatar || '/public/avatars/default-avatar.png'} alt="Avatar" className="comment-avatar" /> {/* Avatar padrão */}
                <span className="comment-author">{comment.author}</span>
                <span className="comment-date">{new Date(comment.createdAt).toLocaleString()}</span> {/* Formatando data */}
              </div>
              <div className="comment-content">{comment.text}</div>
            </div>
          ))}
        </div>

        {/* Logs de Execução */}
        <div className="logs-section">
          <h3>Logs ({logs.length})</h3>
          {logs.map((log) => (
            <div key={log.id} className={`log-item log-${log.level.toLowerCase()}`}>
              <span className="log-timestamp">{new Date(log.timestamp).toLocaleString()}</span>
              <span className={`log-level log-${log.level.toLowerCase()}`}>{log.level}</span> {/* Usando level em minúsculo para classe CSS */}
              <span className="log-message">{log.message}</span>
            </div>
          ))}
        </div>

        {/* Arquivos Anexos */}
        <div className="files-section">
          <h3>Arquivos ({files.length})</h3>
          {files.map((file) => (
            <div key={file.id} className="file-item">
              <span className="file-name">{file.name}</span>
              <span className="file-size">{file.size}</span>
              {file.url && (
                <a href={file.url} download={file.name} className="download-btn">Download</a>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="task-detail-footer">
        <div className="task-actions">
          <button className="btn-edit">Editar</button>
          <button className="btn-delete">Excluir</button>
          <button className="btn-close" onClick={handleClose}>Fechar</button>
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;
