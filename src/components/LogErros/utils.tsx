import { FaExclamationTriangle, FaExclamationCircle, FaInfoCircle, FaBug } from 'react-icons/fa';
import { ErrorLog } from './types';

export const getLogStyle = (log: ErrorLog) => {
  switch (log.level) {
    case 'ERROR':
      return {
        color: 'var(--danger-color)',
        bgColor: 'var(--bg-primary)',
        icon: <FaExclamationTriangle />
      };
    case 'WARN':
      return {
        color: 'var(--text-secondary)',
        bgColor: 'var(--bg-card)',
        icon: <FaExclamationCircle />
      };
    case 'INFO':
      return {
        color: 'var(--accent-color)',
        bgColor: 'var(--bg-secondary)',
        icon: <FaInfoCircle />
      };
    case 'DEBUG':
      return {
        color: 'var(--success-color)',
        bgColor: 'var(--bg-secondary)',
        icon: <FaBug />
      };
    default:
      return {
        color: '#888',
        bgColor: 'var(--bg-primary)',
        icon: <FaInfoCircle />
      };
  }
};

export const formatMethod = (method: string) => {
  const colors: Record<string, string> = {
    GET: '#0f0',
    POST: '#ff0',
    PUT: '#0ff',
    DELETE: '#f00',
    PATCH: '#f0f'
  };
  
  const color = colors[method] || '#888';
  return (
    <span style={{ color, fontWeight: 'bold', fontFamily: 'monospace' }}>
      {method}
    </span>
  );
};

export const formatStatusCode = (statusCode: number) => {
  let color = '#888';
  if (statusCode >= 200 && statusCode < 300) color = '#0f0';
  else if (statusCode >= 300 && statusCode < 400) color = '#ff0';
  else if (statusCode >= 400 && statusCode < 500) color = '#f80';
  else if (statusCode >= 500) color = '#f00';
  
  return (
    <span style={{ color, fontWeight: 'bold', fontFamily: 'monospace' }}>
      {statusCode}
    </span>
  );
};

export const formatDate = (timestamp: string) => {
  const date = new Date(timestamp);
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

export const formatHeaders = (headers: string) => {
  try {
    const parsed = JSON.parse(headers);
    return JSON.stringify(parsed, null, 2);
  } catch {
    return headers;
  }
};

export const formatRequestBody = (body: string) => {
  try {
    const parsed = JSON.parse(body);
    return JSON.stringify(parsed, null, 2);
  } catch {
    return body || '{}';
  }
};