/**
 * DTO para representacao de comentarios de tarefa.
 * Cada comentario inclui id, user, task, conteudo e timestamp.
 */

export default interface CommentDTO {
  /** Identificador unico do comentario */
  id: string;
  /** ID do usuario que criou o comentario */
  userId: string;
  /** ID da tarefa a qual o comentario se refere */
  taskId: string;
  /** Nome do usuario que fez o comentario */
  username: string;
  /** Conteudo do comentario */
  content: string;
  /** Timestamp de criacao do comentario */
  createdAt: Date;
}
