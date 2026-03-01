import React from 'react';
import { FaTimes, FaCopy, FaCode, FaUser, FaServer, FaGlobe, FaFileAlt, FaKey } from 'react-icons/fa';
import { LogDetailsModalProps } from './types';
import './styles.css';

export const LogDetailsModal: React.FC<LogDetailsModalProps> = ({ 
  log, 
  isOpen, 
  onClose, 
  isLoading 
}) => {
  if (!isOpen || !log) return null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Copiado para a área de transferência!');
    });
  };

  const formatHeaders = (headers: any) => {
    try {
      // Se headers já for um objeto, stringify diretamente
      if (typeof headers === 'object' && headers !== null) {
        return JSON.stringify(headers, null, 2);
      }
      // Se for string, tenta parsear
      if (typeof headers === 'string') {
        const parsed = JSON.parse(headers);
        return JSON.stringify(parsed, null, 2);
      }
      // Caso contrário, retorna como string
      return String(headers);
    } catch {
      // Se falhar, retorna como string
      return String(headers);
    }
  };

  const formatRequestBody = (body: any) => {
    try {
      // Se body já for um objeto, stringify diretamente
      if (typeof body === 'object' && body !== null) {
        return JSON.stringify(body, null, 2);
      }
      // Se for string, tenta parsear
      if (typeof body === 'string') {
        const parsed = JSON.parse(body);
        return JSON.stringify(parsed, null, 2);
      }
      // Caso contrário, retorna como string
      return String(body || '{}');
    } catch {
      // Se falhar, retorna como string
      return String(body || '{}');
    }
  };

  if (isLoading) {
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="modal-loading">
            <div className="loading-spinner"></div>
            <div>Carregando detalhes...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            <FaCode />
            Detalhes do Erro
          </h2>
          <button className="modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="modal-body">
          {/* Basic Info */}
          <div className="detail-section">
            <h3 className="detail-section-title">
              <FaFileAlt />
              Informações Básicas
            </h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">ID:</span>
                <span className="detail-value">{log.id}</span>
                <button 
                  className="copy-button"
                  onClick={() => copyToClipboard(log.id)}
                  title="Copiar ID"
                >
                  <FaCopy size={12} />
                </button>
              </div>
              <div className="detail-item">
                <span className="detail-label">Timestamp:</span>
                <span className="detail-value">{new Date(log.timestamp).toLocaleString('pt-BR')}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Nível:</span>
                <span className="detail-value">{log.level}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Tipo de Erro:</span>
                <span className="detail-value">{log.errorType}</span>
              </div>
            </div>
          </div>

          {/* Request Info */}
          <div className="detail-section">
            <h3 className="detail-section-title">
              <FaServer />
              Informações da Requisição
            </h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Endpoint:</span>
                <span className="detail-value">{log.endpoint}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Método:</span>
                <span className="detail-value">{log.method}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Status Code:</span>
                <span className="detail-value">{log.statusCode}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Tempo de Resposta:</span>
                <span className="detail-value">{log.responseTime}ms</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Client IP:</span>
                <span className="detail-value">{log.clientIp}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Correlation ID:</span>
                <span className="detail-value">{log.correlationId}</span>
                <button 
                  className="copy-button"
                  onClick={() => copyToClipboard(log.correlationId)}
                  title="Copiar Correlation ID"
                >
                  <FaCopy size={12} />
                </button>
              </div>
            </div>
          </div>

          {/* Message */}
          <div className="detail-section">
            <h3 className="detail-section-title">Mensagem de Erro</h3>
            <div className="detail-message">
              {log.message}
            </div>
          </div>

          {/* Stack Trace */}
          {log.stackTrace && (
            <div className="detail-section">
              <h3 className="detail-section-title">Stack Trace</h3>
              <pre className="detail-stack-trace">
                {log.stackTrace}
              </pre>
              <button 
                className="copy-button-large"
                onClick={() => copyToClipboard(log.stackTrace)}
              >
                <FaCopy />
                Copiar Stack Trace
              </button>
            </div>
          )}

          {/* Request Body */}
          {log.requestBody && log.requestBody !== '{}' && (
            <div className="detail-section">
              <h3 className="detail-section-title">Request Body</h3>
              <pre className="detail-code">
                {formatRequestBody(log.requestBody)}
              </pre>
              <button 
                className="copy-button-large"
                onClick={() => copyToClipboard(typeof log.requestBody === 'string' ? log.requestBody : JSON.stringify(log.requestBody))}
              >
                <FaCopy />
                Copiar Request Body
              </button>
            </div>
          )}

          {/* Headers */}
          {log.headers && log.headers !== '{}' && (
            <div className="detail-section">
              <h3 className="detail-section-title">
                <FaGlobe />
                Headers
              </h3>
              <pre className="detail-code">
                {formatHeaders(log.headers)}
              </pre>
              <button 
                className="copy-button-large"
                onClick={() => copyToClipboard(typeof log.headers === 'string' ? log.headers : JSON.stringify(log.headers))}
              >
                <FaCopy />
                Copiar Headers
              </button>
            </div>
          )}

          {/* User Info */}
          {log.user && (
            <div className="detail-section">
              <h3 className="detail-section-title">
                <FaUser />
                Informações do Usuário
              </h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">ID:</span>
                  <span className="detail-value">{log.user.id}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Nome:</span>
                  <span className="detail-value">{log.user.name}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Email:</span>
                  <span className="detail-value">{log.user.email}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="modal-button" onClick={onClose}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};