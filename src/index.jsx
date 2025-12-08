import React from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from '@asgardeo/auth-react';
import asgardeoConfig from './asgardeoConfig';
import App from './App';
import './global.css';

const root = createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <AuthProvider config={asgardeoConfig}>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
