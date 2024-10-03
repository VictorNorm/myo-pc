import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './App.css';
import { AuthProvider } from './contexts/AuthProvider';
import { HashRouter } from 'react-router-dom';
import App from './App'; // Move your routes to a separate App component

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <AuthProvider>
            <HashRouter>
                <App />
            </HashRouter>
        </AuthProvider>
    </React.StrictMode>,
);
