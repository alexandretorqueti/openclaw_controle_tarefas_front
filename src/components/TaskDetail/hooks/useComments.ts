import { useState, useCallback, useContext } from 'react';
import api from '../../../services/api';
import { Comment } from '../../../types/tasks';
import { useAuth } from '../../../contexts/AuthContext';

interface UseCommentsReturn {
  comments: Comment[];
  loading: boolean;
  error: string | null;
  addComment: (content: string, taskId: string, parentCommentId?: string | null) => Promise<Comment | null>;
  deleteComment: (commentId: string) => Promise<boolean>;
  updateComment: (commentId: string, content: string) => Promise<Comment | null>;
  refetchComments: (taskId: string) => Promise<void>;
}

/**
 * Hook para gerenciar comentários de uma tarefa
 * Suporta: criar, excluir, editar e listar comentários
 */
export const useComments = (initialTaskId?: string): UseCommentsReturn => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Buscar comentários de uma tarefa
  const refetchComments = useCallback(async (taskId: string) => {
    if (!taskId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await api.getCommentsByTask(taskId);
      setComments(response || []);
    } catch (err) {
      console.error('Erro ao buscar comentários:', err);
      setError('Erro ao carregar comentários');
    } finally {
      setLoading(false);
    }
  }, []);

  // Adicionar novo comentário
  const addComment = useCallback(async (
    content: string, 
    taskId: string, 
    parentCommentId: string | null = null
  ): Promise<Comment | null> => {
    if (!content.trim() || !taskId || !user) {
      setError('Conteúdo, tarefa e usuário são obrigatórios');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const newComment = await api.createComment({
        content,
        taskId,
        userId: user.id,
        parentCommentId
      });

      // Atualizar lista localmente
      setComments(prev => [newComment, ...prev]);
      return newComment;
    } catch (err) {
      console.error('Erro ao criar comentário:', err);
      setError('Erro ao criar comentário');
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Excluir comentário
  const deleteComment = useCallback(async (commentId: string): Promise<boolean> => {
    if (!user) {
      setError('Usuário não autenticado');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      await api.deleteComment(commentId);
      
      // Remover da lista local
      setComments(prev => prev.filter(comment => comment.id !== commentId));
      return true;
    } catch (err) {
      console.error('Erro ao excluir comentário:', err);
      // Só retorna false se não foi erro de permissão
      if (!(err as any).response?.status === 403) {
        setError((err as any).message || 'Erro ao excluir comentário');
      }
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Editar comentário
  const updateComment = useCallback(async (commentId: string, content: string): Promise<Comment | null> => {
    if (!content.trim() || !user) {
      setError('Conteúdo não pode ser vazio e usuário deve estar autenticado');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const updatedComment = await api.updateComment(commentId, { 
        content,
        userId: user.id
      });
      
      // Atualizar na lista local
      setComments(prev => prev.map(comment => 
        comment.id === commentId ? updatedComment : comment
      ));
      
      return updatedComment;
    } catch (err) {
      console.error('Erro ao editar comentário:', err);
      setError('Erro ao editar comentário');
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Inicializar com comentários se taskId for fornecido
  useState(() => {
    if (initialTaskId && user) {
      refetchComments(initialTaskId);
    }
  });

  return {
    comments,
    loading,
    error,
    addComment,
    deleteComment,
    updateComment,
    refetchComments
  };
};

export default useComments;