import React, { useState } from 'react';
import './CommentsSection.css';

interface Comment {
  id: string;
  username: string;
  content: string;
  createdAt: Date;
}

interface CommentsSectionProps {
  comments: Comment[];
}

const CommentsSection: React.FC<CommentsSectionProps> = ({ comments }) => {
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});

  const toggleCommentExpansion = (id: string) => {
    setExpandedComments(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!comments || comments.length === 0) {
    return (
      <div className="comments-section">
        <h3>Comentários</h3>
        <p className="no-comments">Nenhum comentário ainda.</p>
      </div>
    );
  }

  return (
    <div className="comments-section">
      <h3>Comentários</h3>
      <div className="comments-list">
        {comments.map((comment) => {
          const isExpanded = expandedComments[comment.id];
          const truncatedContent = comment.content.length > 150 
            ? comment.content.substring(0, 150) + '...' 
            : comment.content;

          return (
            <div key={comment.id} className="comment-item">
              <div className="comment-header">
                <span className="comment-username">{comment.username}</span>
                <span className="comment-date">{formatDate(comment.createdAt)}</span>
              </div>
              <div className="comment-content">
                {isExpanded ? comment.content : truncatedContent}
              </div>
              {comment.content.length > 150 && (
                <button 
                  className="read-more-btn"
                  onClick={() => toggleCommentExpansion(comment.id)}
                >
                  {isExpanded ? 'Mostrar menos' : 'Ler mais...'}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CommentsSection;