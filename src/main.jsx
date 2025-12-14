import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './AAASmores.jsx';
import './index.css'; // <--- This line enables the styles!

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);