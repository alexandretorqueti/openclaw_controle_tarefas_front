import React from 'react';
import ReactDOM from 'react-dom/client';
import TestApp from './TestApp';

console.log('React index.test.tsx loading');

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

const root = ReactDOM.createRoot(rootElement);

try {
  root.render(
    <React.StrictMode>
      <TestApp />
    </React.StrictMode>
  );
  console.log('React rendered successfully');
} catch (error) {
  console.error('React render error:', error);
}