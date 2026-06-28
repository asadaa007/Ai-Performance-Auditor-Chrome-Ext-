import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '@report/App';
import '@/styles/globals.css';
import '@report/styles/report.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
