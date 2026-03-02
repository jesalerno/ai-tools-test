import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';
import {ErrorBoundary} from './components/ErrorBoundary';

const rootNode = document.getElementById('root');

if (!rootNode) {
  throw new Error('Missing #root element.');
}

const root = ReactDOM.createRoot(rootNode);

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
