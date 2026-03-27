import React, { useState } from 'react';
import { FaUserCircle, FaTrash, FaEdit, FaReply, FaCheck, FaTimes, FaEllipsisH, FaClock } from 'react-icons/fa';
import { Comment } from '../../../types/tasks';
import CommentForm from './CommentForm';
import { useAuth } from '../../../contexts/AuthContext';
import api from '../../../services/api';

interface CommentItemProps {
  comment: Comment;
  isEditing: boolean;
  onEdit: (commentId: string) => void;
  onDelete: () => void;
  onReply: (commentId: string) => void;
  onCancelEdit: () => void;
  onEditComplete: () => void;
  isReply?: boolean;
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  isEditing,
  onEdit,
  onDelete,
  onReply,
  onCancelEdit,
  onEditComplete,
  isReply = false
}) => {
  const { user } = useAuth();
  const [showActions, setShowActions] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Formatar data
  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Agora mesmo';
    if (diffMins < 60) return `${diffMins} min atrás`;
    if (diffHours < 24) return `${diffHours} h atrás`;
    if (diffDays < 7) return `${diffDays} dias atrás`;
    
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Verificar se o usuário atual é o autor do comentário
  const isCurrentUserAuthor = () => {
    if (!user) return false;
    // Comparar userId para permitir edição/exclusão
    return user.id === comment.userId;
  };

  const handleEdit = () => {
    onEdit(comment.id);
    setShowActions(false);
  };

  const handleReply = () => {
    onReply(comment.id);
    setShowActions(false);
  };

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }

    try {
      // TODO: Implementar exclusão real
      // await api.deleteComment(comment.id);
      onDelete();
    } catch (err) {
      console.error('Erro ao excluir comentário:', err);
    }
  };

  const handleCancelDelete = () => {
    setConfirmDelete(false);
  };

  // Se estiver em modo de edição, mostrar o formulário
  if (isEditing) {
    return (
      <div className={`comment-item ${isReply ? 'reply' : ''} editing`}>
        <CommentForm
          taskId={comment.taskId}
          parentCommentId={comment.parentCommentId}
          onSuccess={onEditComplete}
          onCancel={onCancelEdit}
          mode="edit"
          initialContent={comment.content}
          commentId={comment.id}
        />
      </div>
    );
  }

  return (
    <div className={`comment-item ${isReply ? 'reply' : ''}`}>
      {/* Avatar e informações do usuário */}
      <div className="comment-header">
        <div className="user-info">
          <FaUserCircle className="user-avatar" />
          <div className="user-details">
            <span className="user-name">{comment.user?.name || 'Usuário'}</span>
            <span className="comment-date">
              <FaClock /> {formatDate(comment.createdAt)}
              {comment.updatedAt !== comment.createdAt && ' (editado)'}
            </span>
          </div>
        </div>

        {/* Menu de ações */}
        <div className="comment-actions">
          <button 
            className="actions-toggle"
            onClick={() => setShowActions(!showActions)}
          >
            <FaEllipsisH />
          </button>

          {showActions && (
            <div className="actions-menu">
              <button onClick={handleReply} className="action-button">
                <FaReply /> Responder
              </button>
              
              {isCurrentUserAuthor() && (
                <>
                  <button onClick={handleEdit} className="action-button">
                    <FaEdit /> Editar
                  </button>
                  
                  <button 
                    onClick={confirmDelete ? handleDelete : () => setConfirmDelete(true)}
                    className={`action-button delete ${confirmDelete ? 'confirm' : ''}`}
                  >
                    {confirmDelete ? (
                      <>
                        <FaCheck /> Confirmar
                      </>
                    ) : (
                      <>
                        <FaTrash /> Excluir
                      </>
                    )}
                  </button>
                  
                  {confirmDelete && (
                    <button 
                      onClick={handleCancelDelete}
                      className="action-button cancel"
                    >
                      <FaTimes /> Cancelar
                    </button>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Conteúdo do comentário */}
      <div className="comment-content">
        {comment.content}
      </div>

      {/* Informações adicionais */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="comment-replies-count">
          {comment.replies.length} {comment.replies.length === 1 ? 'resposta' : 'respostas'}
        </div>
      )}

      <style jsx>{`
        .comment-item {
          background: ${isReply ? '#3d3d3d' : '#2d2d2d'};
          border-radius: 8px;
          padding: 16px;
          border: 1px solid #404040;
          position: relative;
          transition: all 0.3s ease;
        }

        .comment-item.reply {
          margin-left: ${isReply ? '20px' : '0'};
          border-left: 2px solid #404040;
        }

        .comment-item.editing {
          background: #3d3d3d;
          border-color: #29b6f6;
        }

        .comment-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .user-avatar {
          font-size: 32px;
          color: #29b6f6;
        }

        .user-details {
          display: flex;
          flex-direction: column;
        }

        .user-name {
          color: #ffffff;
          font-weight: 600;
          font-size: 14px;
        }

        .comment-date {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #a0a0a0;
          font-size: 12px;
          margin-top: 2px;
        }

        .comment-date svg {
          font-size: 10px;
        }

        .comment-actions {
          position: relative;
        }

        .actions-toggle {
          background: transparent;
          border: none;
          color: #a0a0a0;
          font-size: 16px;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 4px;
          transition: all 0.3s ease;
        }

        .actions-toggle:hover {
          color: #ffffff;
          background: #404040;
        }

        .actions-menu {
          position: absolute;
          top: 100%;
          right: 0;
          background: #3d3d3d;
          border: 1px solid #404040;
          border-radius: 6px;
          padding: 8px;
          min-width: 150px;
          z-index: 10;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        .action-button {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 8px 12px;
          background: transparent;
          border: none;
          color: #ffffff;
          font-size: 13px;
          text-align: left;
          cursor: pointer;
          border-radius: 4px;
          transition: all 0.3s ease;
        }

        .action-button:hover {
          background: #404040;
        }

        .action-button.delete {
          color: #f44336;
        }

        .action-button.delete.confirm {
          color: #66bb6a;
          font-weight: 600;
        }

        .action-button.cancel {
          color: #ffa726;
        }

        .action-button svg {
          font-size: 12px;
        }

        .comment-content {
          color: #e0e0e0;
          font-size: 14px;
          line-height: 1.6;
          white-space: pre-wrap;
          word-break: break-word;
        }

        .comment-replies-count {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid #404040;
          color: #a0a0a0;
          font-size: 12px;
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .comment-item.reply {
            margin-left: 12px;
          }
          
          .actions-menu {
            position: fixed;
            top: auto;
            bottom: 0;
            left: 0;
            right: 0;
            border-radius: 12px 12px 0 0;
            padding: 16px;
            min-width: auto;
          }
        }

        @media (max-width: 480px) {
          .comment-item {
            padding: 12px;
          }
          
          .user-avatar {
            font-size: 24px;
          }
          
          .user-name {
            font-size: 13px;
          }
          
          .comment-content {
            font-size: 13px;
          }
        }
      `}</style>
    </div>
  );
};

export default CommentItem;