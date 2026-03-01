import { FaExclamationTriangle, FaExclamationCircle, FaInfoCircle, FaBug } from 'react-icons/fa';
import { ErrorLog } from './types';

export const getLogStyle = (log: ErrorLog) => {
  switch (log.level) {
    case 'ERROR':
      return {
        color: '#ff4444',
        bgColor: '#1a0a0a',
        icon: <FaExclamationTriangle />
      };
    case 'WARN':
      return {
        color: '#ffaa00',
        bgColor: '#1a140a',
        icon: <FaExclamationCircle />
      };
    case 'INFO':
      return {
        color: '#44aaff',
        bgColor: '#0a0f1a',
        icon: <FaInfoCircle />
      };
    case 'DEBUG':
      return {
        color: '#44ff44',
        bgColor: '#0a1a0a',
        icon: <FaBug />
      };
    default:
      return {
        color: '#888',
        bgColor: '#0a0a0a',
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