import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';  // Tailwind styles
import App from './App.js';  // Added .js extension
import reportWebVitals from './reportWebVitals.js';  // Added .js extension

// Firebase is initialized in firebase.js, which is imported in the services


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Log web vitals to console (optional)
reportWebVitals(console.log);