/**
 * File: Điểm vào chính của ứng dụng React
 * 
 * Nhiệm vụ:
 * - Render App component vào DOM
 * - Setup các provider (nếu cần)
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/globals.css';

// Tìm element root trong HTML và render ứng dụng
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
