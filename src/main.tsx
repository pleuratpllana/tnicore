import React from 'react';
import { createRoot } from 'react-dom/client';
import PortalPage from './PortalPage';
import './styles.css';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode><PortalPage /></React.StrictMode>,
);
