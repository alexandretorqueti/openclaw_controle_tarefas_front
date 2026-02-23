import React, { useState, useEffect } from 'react';
import { TaskComment, User } from '../types';
import api from '../services/api';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  FaUser, 
  FaComment, 
  FaPaperPlane, 
  FaEdit, 
  FaTrash, 
  FaReply,
  FaTimes,
  FaSave,
  FaChevronDown,
  FaChevronUp
} from 'react-icons/fa';

interface CommentsSectionProps {
  taskId: string;
  currentUser: User | null;
}

const CommentsSection: React.FC<CommentsSectionProps> = ({ taskId, currentUser }) => {
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [replyingToCommentId, setReplyingToCommentId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());

  // Load comments
  useEffect(() => {
    loadComments();
  }, [taskId]);

  const loadComments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getCommentsByTask(taskId);
      setComments(response.comments || []);
    } catch (error: any) {
      console.error('Failed to load comments:', error);
      setError('Erro ao carregar comentários. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUser) return;

    try {
      setError(null);
      const comment = await api.createComment({
        content: newComment,
        taskId,
        userId: currentUser.id
      });
      
      setComments(prev => [...prev, comment.comment]);
      setNewComment('');
    } catch (error: any) {
      console.error('Failed to create comment:', error);
      setError('Erro ao criar comentário. Tente novamente.');
    }
  };

  const handleSubmitReply = async (parentCommentId: string) => {
    if (!replyContent.trim() || !currentUser) return;

    try {
      setError(null);
      const comment = await api.createComment({
        content: replyContent,
        taskId,
        userId: currentUser.id,
        parentCommentId
      });
      
      // Update the parent comment with the new reply
      setComments(prev => prev.map(comment => {
        if (comment.id === parentCommentId) {
          return {
            ...comment,
            replies: [...(comment.replies || []), comment.comment]
          };
        }
        return comment;
      }));
      
      setReplyContent('');
      setReplyingToCommentId(null);
    } catch (error: any) {
      console.error('Failed to create reply:', error);
      setError('Erro ao criar resposta. Tente novamente.');
    }
  };

  const handleUpdateComment = async (commentId: string) => {
    if (!editingContent.trim()) return;

    try {
      setError(null);
      const response = await api.updateComment(commentId, {
        content: editingContent
      });
      
      setComments(prev => prev.map(comment => {
        if (comment.id === commentId) {
          return response.comment;
        }
        return comment;
      }));
      
      setEditingCommentId(null);
      setEditingContent('');
    } catch (error: any) {
      console.error('Failed to update comment:', error);
      setError('Erro ao atualizar comentário. Tente novamente.');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este comentário?')) return;

    try {
      setError(null);
      await api.deleteComment(commentId);
      
      // Remove comment from state
      setComments(prev => prev.filter(comment => comment.id !== commentId));
    } catch (error: any) {
      console.error('Failed to delete comment:', error);
      setError('Erro ao excluir comentário. Tente novamente.');
    }
  };

  const toggleReplies = (commentId: string) => {
    const newExpanded = new Set(expandedReplies);
    if (newExpanded.has(commentId)) {
      newExpanded.delete(commentId);
    } else {
      newExpanded.add(commentId);
    }
    setExpandedReplies(newExpanded);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  const renderComment = (comment: TaskComment, isReply = false) => {
    const isOwner = currentUser && comment.user?.id === currentUser.id;
    const hasReplies = comment.replies && comment.replies.length > 0;
    const isExpanded = expandedReplies.has(comment.id);

    return (
      <div key={comment.id} style={{
        marginBottom: '16px',
        marginLeft: isReply ? '32px' : '0',
        padding: '16px',
        backgroundColor: '#fff',
        borderRadius: '8px',
        border: '1px solid #e9ecef',
        position: 'relative'
      }}>
        {/* Comment header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {comment.user?.avatarUrl ? (
              <img 
                src={comment.user.avatarUrl} 
                alt={comment.user.name}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  objectFit: 'cover'
                }}
              />
            ) : (
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#e3f2fd',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <FaUser size={16} color="#1976d2" />
              </div>
            )}
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#333' }}>
                {comment.user?.name || 'Usuário desconhecido'}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                {formatDate(comment.createdAt)}
                {comment.createdAt !== comment.updatedAt && ' (editado)'}
              </div>
            </div>
          </div>

          {/* Comment actions */}
          {isOwner && !isReply && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => {
                  setEditingCommentId(comment.id);
                  setEditingContent(comment.content);
                }}
                style={{
                  padding: '6px 10px',
                  backgroundColor: '#f8f9fa',
                  color: '#333',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <FaEdit size={12} />
                Editar
              </button>
              <button
                onClick={() => handleDeleteComment(comment.id)}
                style={{
                  padding: '6px 10px',
                  backgroundColor: '#fff5f5',
                  color: '#e53e3e',
                  border: '1px solid #fed7d7',
                  borderRadius: '4px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <FaTrash size={12} />
                Excluir
              </button>
            </div>
          )}
        </div>

        {/* Comment content */}
        {editingCommentId === comment.id ? (
          <div>
            <textarea
              value={editingContent}
              onChange={(e) => setEditingContent(e.target.value)}
              rows={3}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
                resize: 'vertical',
                marginBottom: '10px'
              }}
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => handleUpdateComment(comment.id)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#06D6A0',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <FaSave size={14} />
                Salvar
              </button>
              <button
                onClick={() => {
                  setEditingCommentId(null);
                  setEditingContent('');
                }}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#f8f9fa',
                  color: '#333',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <FaTimes size={14} />
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <div style={{ 
            fontSize: '14px', 
            color: '#333', 
            lineHeight: 1.6,
            marginBottom: '12px'
          }}>
            {comment.content}
          </div>
        )}

        {/* Reply button */}
        {!isReply && currentUser && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              onClick={() => {
                setReplyingToCommentId(comment.id);
                setReplyContent('');
              }}
              style={{
                padding: '6px 12px',
                backgroundColor: '#f8f9fa',
                color: '#666',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <FaReply size={12} />
              Responder
            </button>

            {/* Show replies toggle */}
            {hasReplies && (
              <button
                onClick={() => toggleReplies(comment.id)}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#f8f9fa',
                  color: '#666',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {isExpanded ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
                {comment.replies?.length || 0} resposta{comment.replies?.length !== 1 ? 's' : ''}
              </button>
            )}
          </div>
        )}

        {/* Reply form */}
        {replyingToCommentId === comment.id && (
          <div style={{ marginTop: '16px' }}>
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Digite sua resposta..."
              rows={3}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
                resize: 'vertical',
                marginBottom: '10px'
              }}
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => handleSubmitReply(comment.id)}
                disabled={!replyContent.trim()}
                style={{
                  padding: '8px 16px',
                  backgroundColor: replyContent.trim() ? '#4ECDC4' : '#ccc',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: replyContent.trim() ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <FaPaperPlane size={14} />
                Enviar resposta
              </button>
              <button
                onClick={() => {
                  setReplyingToCommentId(null);
                  setReplyContent('');
                }}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#f8f9fa',
                  color: '#333',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <FaTimes size={14} />
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Replies */}
        {isExpanded && hasReplies && (
          <div style={{ marginTop: '16px' }}>
            {comment.replies?.map(reply => renderComment(reply, true))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
        Carregando comentários...
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#333', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <FaComment size={18} />
        Comentários ({comments.length})
      </h3>

      {/* Error message */}
      {error && (
        <div style={{
          backgroundColor: '#FFE5E5',
          border: '1px solid #FF6B6B',
          color: '#D32F2F',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          {error}
        </div>
      )}

      {/* New comment form */}
      {currentUser ? (
        <div style={{ marginBottom: '32px' }}>
          <form onSubmit={handleSubmitComment}>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Adicione um comentário..."
              rows={4}
              style={{
                width: '100%',
                padding: '16px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '14px',
                resize: 'vertical',
                marginBottom: '12px'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="submit"
                disabled={!newComment.trim()}
                style={{
                  padding: '12px 24px',
                  backgroundColor: newComment.trim() ? '#4ECDC4' : '#ccc',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  cursor: newComment.trim() ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <FaPaperPlane size={14} />
                Enviar comentário
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '20px',
          borderRadius: '8px',
          textAlign: 'center',
          marginBottom: '24px',
          color: '#666'
        }}>
          Faça login para adicionar comentários.
        </div>
      )}

      {/* Comments list */}
      {comments.length === 0 ? (
        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '40px',
          borderRadius: '8px',
          textAlign: 'center',
          color: '#666'
        }}>
          <FaComment size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
          <div style={{ fontSize: '16px', marginBottom: '8px' }}>Nenhum comentário ainda</div>
          <div style={{ fontSize: '14px' }}>Seja o primeiro a comentar!</div>
        </div>
      ) : (
        <div>
          {comments.map(comment => renderComment(comment))}
        </div>
      )}
    </div>
  );
};

export default CommentsSection;