import React, { useState } from 'react';
import { FaComment, FaUserCircle, FaTrash, FaEdit, FaReply, FaCheck, FaTimes } from 'react-icons/fa';
import { Comment } from '../../../types/tasks';
import CommentForm from '../components/CommentForm';
import CommentItem from '../components/CommentItem';

interface TaskCommentsProps {
  taskId: string;
  comments: Comment[];
  onCommentAdded: () => void;
  onCommentDeleted: () => void;
}

const TaskComments: React.FC<TaskCommentsProps> = ({
  taskId,
  comments,
  onCommentAdded,
  onCommentDeleted
}) => {
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [replyingToCommentId, setReplyingToCommentId] = useState<string | null>(null);

  // Função para lidar com sucesso na adição de comentário
  const handleCommentAdded = () => {
    onCommentAdded();
  };

  // Função para lidar com exclusão de comentário
  const handleCommentDeleted = () => {
    onCommentDeleted();
  };

  // Função para iniciar edição
  const handleStartEdit = (commentId: string) => {
    setEditingCommentId(commentId);
    setReplyingToCommentId(null);
  };

  // Função para cancelar edição
  const handleCancelEdit = () => {
    setEditingCommentId(null);
  };

  // Função para iniciar resposta
  const handleStartReply = (commentId: string) => {
    setReplyingToCommentId(commentId);
    setEditingCommentId(null);
  };

  // Função para cancelar resposta
  const handleCancelReply = () => {
    setReplyingToCommentId(null);
  };

  // Função para concluir edição
  const handleEditComplete = () => {
    setEditingCommentId(null);
    onCommentAdded(); // Recarregar comentários
  };

  // Função para concluir resposta
  const handleReplyComplete = () => {
    setReplyingToCommentId(null);
    onCommentAdded(); // Recarregar comentários
  };

  // Agrupar comentários por thread (comentário principal + respostas)
  const groupCommentsByThread = () => {
    const threads: { [key: string]: Comment[] } = {};
    
    comments.forEach(comment => {
      const threadId = comment.parentCommentId || comment.id;
      if (!threads[threadId]) {
        threads[threadId] = [];
      }
      threads[threadId].push(comment);
    });

    // Ordenar threads por data do comentário principal (mais recente primeiro)
    return Object.values(threads).sort((a, b) => {
      const dateA = new Date(a[0].createdAt).getTime();
      const dateB = new Date(b[0].createdAt).getTime();
      return dateB - dateA;
    });
  };

  const commentThreads = groupCommentsByThread();

  return (
    <div className="task-comments">
      {/* Cabeçalho */}
      <div className="comments-header">
        <h3 className="section-title">
          <FaComment /> Comentários ({comments.length})
        </h3>
        <div className="comments-stats">
          <span className="stat-item">
            <FaUserCircle /> {new Set(comments.map(c => c.userId)).size} participantes
          </span>
        </div>
      </div>

      {/* Formulário para novo comentário */}
      <div className="new-comment-section">
        <h4 className="form-title">Adicionar comentário</h4>
        <CommentForm
          taskId={taskId}
          parentCommentId={null}
          onSuccess={handleCommentAdded}
          mode="create"
        />
      </div>

      {/* Lista de comentários */}
      <div className="comments-list">
        {commentThreads.length === 0 ? (
          <div className="no-comments">
            <FaComment className="empty-icon" />
            <p>Nenhum comentário ainda. Seja o primeiro a comentar!</p>
          </div>
        ) : (
          commentThreads.map((thread, index) => {
            const mainComment = thread.find(c => !c.parentCommentId) || thread[0];
            const replies = thread.filter(c => c.parentCommentId === mainComment.id);

            return (
              <div key={mainComment.id} className="comment-thread">
                {/* Comentário principal */}
                <CommentItem
                  comment={mainComment}
                  isEditing={editingCommentId === mainComment.id}
                  onEdit={handleStartEdit}
                  onDelete={handleCommentDeleted}
                  onReply={handleStartReply}
                  onCancelEdit={handleCancelEdit}
                  onEditComplete={handleEditComplete}
                />

                {/* Formulário de resposta (se ativo) */}
                {replyingToCommentId === mainComment.id && (
                  <div className="reply-form-container">
                    <CommentForm
                      taskId={taskId}
                      parentCommentId={mainComment.id}
                      onSuccess={handleReplyComplete}
                      onCancel={handleCancelReply}
                      mode="reply"
                    />
                  </div>
                )}

                {/* Respostas */}
                {replies.length > 0 && (
                  <div className="replies-container">
                    {replies.map(reply => (
                      <div key={reply.id} className="reply-item">
                        <CommentItem
                          comment={reply}
                          isEditing={editingCommentId === reply.id}
                          onEdit={handleStartEdit}
                          onDelete={handleCommentDeleted}
                          onReply={handleStartReply}
                          onCancelEdit={handleCancelEdit}
                          onEditComplete={handleEditComplete}
                          isReply={true}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <style jsx>{`
        .task-comments {
          background: linear-gradient(135deg, #2d2d2d 0%, #3d3d3d 100%);
          border-radius: 12px;
          padding: 24px;
        }

        .comments-header {
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

        .comments-stats {
          display: flex;
          gap: 16px;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #a0a0a0;
          font-size: 14px;
        }

        .stat-item svg {
          color: #29b6f6;
        }

        .new-comment-section {
          background: #3d3d3d;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 24px;
          border: 1px solid #404040;
        }

        .form-title {
          font-size: 16px;
          font-weight: 600;
          color: #ffffff;
          margin: 0 0 16px 0;
        }

        .comments-list {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .no-comments {
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

        .no-comments p {
          font-size: 16px;
          margin: 0;
        }

        .comment-thread {
          background: #3d3d3d;
          border-radius: 8px;
          padding: 20px;
          border: 1px solid #404040;
        }

        .reply-form-container {
          margin: 16px 0 16px 40px;
          padding-left: 16px;
          border-left: 2px solid #404040;
        }

        .replies-container {
          margin: 16px 0 0 40px;
          padding-left: 16px;
          border-left: 2px solid #404040;
        }

        .reply-item {
          margin-bottom: 16px;
        }

        .reply-item:last-child {
          margin-bottom: 0;
        }

        @media (max-width: 768px) {
          .comments-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }
          
          .comments-stats {
            width: 100%;
            justify-content: space-between;
          }
          
          .reply-form-container,
          .replies-container {
            margin-left: 20px;
            padding-left: 12px;
          }
        }

        @media (max-width: 480px) {
          .task-comments {
            padding: 16px;
          }
          
          .new-comment-section {
            padding: 16px;
          }
          
          .comment-thread {
            padding: 16px;
          }
          
          .reply-form-container,
          .replies-container {
            margin-left: 16px;
            padding-left: 8px;
          }
        }
      `}</style>
    </div>
  );
};

export default TaskComments;