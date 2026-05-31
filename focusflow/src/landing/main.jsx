import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import '../index.css';

// Suppress benign Framer Motion console warnings
const originalError = console.error;
console.error = (...args) => {
  if (
    args[0] &&
    typeof args[0] === "string" &&
    (args[0].includes("Framer Motion") || args[0].includes("FramerMotion"))
  ) {
    return;
  }
  originalError(...args);
};

const container = document.getElementById("root");
const root = ReactDOM.createRoot(container);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
