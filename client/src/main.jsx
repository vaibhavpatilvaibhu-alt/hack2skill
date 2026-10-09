import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { ReportsProvider } from './context/ReportsContext.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ReportsProvider>
      <App />
    </ReportsProvider>
  </React.StrictMode>
);
