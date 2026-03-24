import React from 'react';
import './TaskDetail.css';

// Definição das interfaces
interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
}

interface Comment {
  id: string;
  text: string;
  author: string;
  timestamp: string;
}

interface Log {
  id: string;
  level: 'INFO' | 'DEBUG' | 'WARN' | 'ERROR';
  message: string;
  timestamp: string;
}

interface File {
  id: string;
  name: string;
  url: string;
  size: string;
  type: string;
}

// Interface de props do componente
interface TaskDetailProps {
  task: Task;
  comments: Comment[];
  logs: Log[];
  files: File[];
}

const TaskDetail: React.FC<TaskDetailProps> = ({ task, comments, logs, files }) => {
  return (
    <div className="task-detail">
      <div className="task-header">
        <h2 className="task-title">{task.title}</h2>
        <div className="task-meta">
          <span className={`task-status ${task.status}`}>{task.status}</span>
        </div>
      </div>

      <div className="task-description">
        <h3>Descrição</h3>
        <p>{task.description}</p>
      </div>

      {comments !== undefined && comments.length > 0 ? (
        <div className="task-comments">
          <h3>Comentários</h3>
          <div className="comments-list">
            {comments.map(comment => (
              <div key={comment.id} className="comment-item">
                <div className="comment-author">{comment.author}</div>
                <div className="comment-text">{comment.text}</div>
                <div className="comment-timestamp">{comment.timestamp}</div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="task-comments empty">
          <h3>Comentários</h3>
          <p>Sem comentários</p>
        </div>
      )}

      {logs !== undefined && logs.length > 0 ? (
        <div className="task-logs">
          <h3>Logs</h3>
          <div className="logs-list">
            {logs.map(log => (
              <div key={log.id} className={`log-item log-${log.level.toLowerCase()}`}>
                <span className="log-level">{log.level}</span>
                <span className="log-message">{log.message}</span>
                <span className="log-timestamp">{log.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="task-logs empty">
          <h3>Logs</h3>
          <p>Sem logs registrados</p>
        </div>
      )}

      {files !== undefined && files.length > 0 ? (
        <div className="task-files">
          <h3>Arquivos Anexos</h3>
          <div className="files-list">
            {files.map(file => (
              <div key={file.id} className="file-item">
                <a href={file.url} target="_blank" rel="noopener noreferrer" className="file-link">
                  {file.name}
                </a>
                <span className="file-size">{file.size}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="task-files empty">
          <h3>Arquivos Anexos</h3>
          <p>Sem arquivos anexos</p>
        </div>
      )}

      <div className="task-footer">
        <button className="btn-edit">Editar</button>
        <button className="btn-delete">Excluir</button>
        <button className="btn-close">Fechar</button>
      </div>
    </div>
  );
};

export default TaskDetail;