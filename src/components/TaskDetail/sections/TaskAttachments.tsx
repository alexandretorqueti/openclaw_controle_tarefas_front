import React from 'react';
import { FaFile, FaImage, FaVideo, FaDownload, FaTrash, FaUpload } from 'react-icons/fa';
import { TaskAttachment } from '../../../types/tasks';

interface TaskAttachmentsProps {
  attachments: TaskAttachment[];
  isUploading: boolean;
  onUpload: (files: FileList | null) => void;
  onDelete: (attachmentId: string) => void;
}

const TaskAttachments: React.FC<TaskAttachmentsProps> = ({
  attachments,
  isUploading,
  onUpload,
  onDelete
}) => {
  const getFileIcon = (mimeType?: string) => {
    if (mimeType?.includes('image')) return <FaImage />;
    if (mimeType?.includes('video')) return <FaVideo />;
    return <FaFile />;
  };

  const getFileIconColor = (mimeType?: string) => {
    if (mimeType?.includes('image')) return '#4caf50';
    if (mimeType?.includes('video')) return '#f44336';
    return '#2196f3';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="task-attachments">
      <div className="attachments-header">
        <h3 className="section-title">
          <FaUpload /> Anexos
        </h3>
        <div className="attachments-count">
          {attachments.length} arquivo(s)
        </div>
      </div>

      {attachments.length === 0 ? (
        <div className="no-attachments">
          <FaUpload className="empty-icon" />
          <p>Sem anexos nesta tarefa.</p>
          <small>Use os botões abaixo para fazer upload de arquivos</small>
        </div>
      ) : (
        <div className="attachments-actions">
          {attachments.map(attachment => (
            <div key={attachment.id} className="attachment-card">
              <div className="attachment-icon">
                {getFileIcon(attachment.mimeType)}
              </div>
              <div className="attachment-info">
                <div className="attachment-name">{attachment.name}</div>
                <div className="attachment-meta">
                  <span>{formatFileSize(attachment.size)}</span>
                  <span>•</span>
                  <span>{formatDate(attachment.createdAt)}</span>
                </div>
                <div className="attachment-actions">
                  <a
                    href={attachment.url}
                    className="download-btn"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaDownload /> Baixar
                  </a>
                  <button
                    className="delete-btn"
                    onClick={() => onDelete(attachment.id)}
                    title="Excluir anexo"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="upload-section">
        {isUploading ? (
          <div className="uploading-indicator">
            <div className="upload-spinner" />
            <span>Upload em progresso...</span>
          </div>
        ) : (
          <>
            <input
              type="file"
              id="attachment-upload"
              className="file-input"
              onChange={(e) => onUpload(e.target.files)}
              multiple
            />
            <label htmlFor="attachment-upload" className="upload-button">
              <FaUpload /> Adicionar anexo
            </label>
          </>
        )}
      </div>

      <style jsx>{`
        .task-attachments {
          background: linear-gradient(135deg, #2d2d2d 0%, #3d3d3d 100%);
          border-radius: 12px;
          padding: 24px;
        }

        .attachments-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid #404040;
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 20px;
          font-weight: 600;
          color: #ffffff;
          margin: 0;
        }

        .section-title svg {
          color: #29b6f6;
        }

        .attachments-count {
          background: #404040;
          padding: 4px 12px;
          border-radius: 12px;
          color: #a0a0a0;
          font-size: 12px;
          font-weight: 500;
        }

        .no-attachments {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          text-align: center;
          color: #a0a0a0;
        }

        .empty-icon {
          font-size: 48px;
          color: #404040;
          margin-bottom: 16px;
        }

        .no-attachments p {
          font-size: 16px;
          margin: 0 0 8px 0;
          color: #ffffff;
        }

        .no-attachments small {
          font-size: 13px;
          color: #a0a0a0;
        }

        .attachments-actions {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 20px;
        }

        .attachment-card {
          display: flex;
          align-items: center;
          gap: 16px;
          background: #3d3d3d;
          padding: 12px 16px;
          border-radius: 8px;
          border: 1px solid #404040;
          transition: all 0.3s ease;
        }

        .attachment-card:hover {
          background: #424242;
          border-color: #29b6f6;
          transform: translateX(4px);
        }

        .attachment-icon {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(29, 185, 84, 0.1);
          border-radius: 8px;
          font-size: 20px;
        }

        .attachment-icon svg {
          color: #29b6f6;
        }

        .attachment-info {
          flex: 1;
          min-width: 0;
        }

        .attachment-name {
          color: #ffffff;
          font-weight: 600;
          font-size: 14px;
          margin-bottom: 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .attachment-meta {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #a0a0a0;
          font-size: 12px;
        }

        .attachment-meta span:not(:last-child) {
          margin-right: 8px;
        }

        .attachment-actions {
          display: flex;
          gap: 8px;
          margin-top: 8px;
        }

        .download-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: rgba(33, 150, 243, 0.1);
          border: 1px solid rgba(33, 150, 243, 0.3);
          border-radius: 6px;
          color: #2196f3;
          font-size: 12px;
          font-weight: 500;
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .download-btn:hover {
          background: rgba(33, 150, 243, 0.2);
          border-color: #2196f3;
          color: #2196f3;
        }

        .download-btn svg {
          font-size: 12px;
        }

        .delete-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 6px 12px;
          background: rgba(244, 67, 54, 0.1);
          border: 1px solid rgba(244, 67, 54, 0.3);
          border-radius: 6px;
          color: #f44336;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .delete-btn:hover {
          background: rgba(244, 67, 54, 0.2);
          border-color: #f44336;
          color: #ff5252;
        }

        .delete-btn svg {
          font-size: 12px;
        }

        .upload-section {
          display: flex;
          justify-content: center;
          padding-top: 20px;
          border-top: 1px solid #404040;
        }

        .uploading-indicator {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #a0a0a0;
          font-size: 14px;
        }

        .upload-spinner {
          width: 20px;
          height: 20px;
          border: 3px solid #3d3d3d;
          border-top-color: #29b6f6;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .file-input {
          position: absolute;
          opacity: 0;
          width: 0;
          height: 0;
        }

        .upload-button {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: #2196f3;
          border: none;
          border-radius: 8px;
          color: #ffffff;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
        }

        .upload-button:hover {
          background: #1976d2;
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(33, 150, 243, 0.4);
        }

        .upload-button:active {
          transform: translateY(0);
        }

        .upload-button svg {
          font-size: 14px;
        }

        @media (max-width: 480px) {
          .task-attachments {
            padding: 16px;
          }

          .attachment-card {
            padding: 10px 12px;
            gap: 12px;
          }

          .attachment-icon {
            width: 40px;
            height: 40px;
          }

          .attachment-actions {
            margin-top: 6px;
          }
        }
      `}</style>
    </div>
  );
};

export default TaskAttachments;