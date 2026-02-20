import React from 'react';
import ReactDOM from 'react-dom/client';
import AppSimple from './App.simple';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <AppSimple />
  </React.StrictMode>
);