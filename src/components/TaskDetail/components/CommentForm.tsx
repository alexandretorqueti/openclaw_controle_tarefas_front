import React, { useState, useEffect } from 'react';
import { FaPaperPlane, FaTimes, FaUserCircle, FaSpinner } from 'react-icons/fa';
import api from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';

interface CommentFormProps {
  taskId: string;
  parentCommentId?: string | null;
  onSuccess: () => void;
  onCancel?: () => void;
  mode?: 'create' | 'reply' | 'edit';
  initialContent?: string;
  commentId?: string;
}

const CommentForm: React.FC<CommentFormProps> = ({
  taskId,
  parentCommentId = null,
  onSuccess,
  onCancel,
  mode = 'create',
  initialContent = '',
  commentId
}) => {
  const { user } = useAuth();
  const [content, setContent] = useState(initialContent);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Atualizar conteúdo quando initialContent mudar
  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError('O comentário não pode estar vazio');
      return;
    }

    if (!user) {
      setError('Usuário não autenticado');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (mode === 'edit' && commentId) {
        // Editar comentário existente
        await api.updateComment(commentId, { 
          content,
          userId: user.id
        });
      } else {
        // Criar novo comentário ou resposta
        await api.createComment({
          content,
          taskId,
          userId: user.id,
          parentCommentId: parentCommentId || undefined
        });
      }

      // Limpar formulário
      setContent('');
      
      // Notificar sucesso
      onSuccess();
      
    } catch (err) {
      console.error('Erro ao salvar comentário:', err);
      setError('Erro ao salvar comentário. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setContent('');
    setError(null);
    if (onCancel) {
      onCancel();
    }
  };

  const getPlaceholder = () => {
    switch (mode) {
      case 'reply':
        return 'Digite sua resposta...';
      case 'edit':
        return 'Edite seu comentário...';
      default:
        return 'Digite seu comentário...';
    }
  };

  const getButtonText = () => {
    switch (mode) {
      case 'reply':
        return 'Responder';
      case 'edit':
        return 'Salvar';
      default:
        return 'Comentar';
    }
  };

  return (
    <div className="comment-form">
      {/* Cabeçalho do formulário */}
      <div className="form-header">
        {user && (
          <div className="user-info">
            <FaUserCircle className="user-avatar" />
            <span className="user-name">{user.name || user.username || 'Usuário'}</span>
            {user.email && <span className="user-email">@{user.email.split('@')[0]}</span>}
          </div>
        )}
        
        {onCancel && (
          <button 
            type="button" 
            onClick={handleCancel}
            className="cancel-button"
            disabled={loading}
          >
            <FaTimes />
          </button>
        )}
      </div>

      {/* Formulário */}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={getPlaceholder()}
            className="comment-textarea"
            rows={4}
            disabled={loading}
            required
          />
        </div>

        {/* Mensagem de erro */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* Ações do formulário */}
        <div className="form-actions">
          <button
            type="submit"
            className="submit-button"
            disabled={loading || !content.trim()}
          >
            {loading ? (
              <>
                <FaSpinner className="spinner" />
                Enviando...
              </>
            ) : (
              <>
                <FaPaperPlane />
                {getButtonText()}
              </>
            )}
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={handleCancel}
              className="cancel-action-button"
              disabled={loading}
            >
              <FaTimes />
              Cancelar
            </button>
          )}
        </div>
      </form>

      <style jsx>{`
        .comment-form {
          background: #3d3d3d;
          border-radius: 8px;
          padding: 16px;
          border: 1px solid #404040;
        }

        .form-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .user-avatar {
          font-size: 24px;
          color: #29b6f6;
        }

        .user-name {
          color: #ffffff;
          font-weight: 500;
          font-size: 14px;
        }

        .cancel-button {
          background: transparent;
          border: none;
          color: #a0a0a0;
          font-size: 16px;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: all 0.3s ease;
        }

        .cancel-button:hover {
          color: #ffffff;
          background: #404040;
        }

        .cancel-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .form-group {
          margin-bottom: 12px;
        }

        .comment-textarea {
          width: 100%;
          padding: 12px;
          background: #2d2d2d;
          border: 1px solid #404040;
          border-radius: 6px;
          color: #ffffff;
          font-size: 14px;
          font-family: inherit;
          resize: vertical;
          transition: all 0.3s ease;
        }

        .comment-textarea:focus {
          outline: none;
          border-color: #29b6f6;
          box-shadow: 0 0 0 2px rgba(41, 182, 246, 0.2);
        }

        .comment-textarea:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .comment-textarea::placeholder {
          color: #a0a0a0;
        }

        .error-message {
          padding: 8px 12px;
          background: rgba(244, 67, 54, 0.1);
          border: 1px solid #f44336;
          border-radius: 6px;
          color: #f44336;
          font-size: 14px;
          margin-bottom: 12px;
        }

        .form-actions {
          display: flex;
          gap: 8px;
        }

        .submit-button {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px 16px;
          background: linear-gradient(135deg, #1976d2 0%, #2196f3 100%);
          border: none;
          border-radius: 6px;
          color: #ffffff;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .submit-button:hover:not(:disabled) {
          background: linear-gradient(135deg, #1565c0 0%, #1e88e5 100%);
          transform: translateY(-1px);
        }

        .submit-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .submit-button .spinner {
          animation: spin 1s linear infinite;
        }

        .cancel-action-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px 16px;
          background: #404040;
          border: 1px solid #505050;
          border-radius: 6px;
          color: #ffffff;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .cancel-action-button:hover:not(:disabled) {
          background: #505050;
        }

        .cancel-action-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 480px) {
          .comment-form {
            padding: 12px;
          }
          
          .form-actions {
            flex-direction: column;
          }
          
          .submit-button,
          .cancel-action-button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default CommentForm;