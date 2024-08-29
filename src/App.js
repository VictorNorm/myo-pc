import React from 'react';
import './App.css';
import { AuthProvider } from './contexts/AuthProvider';

const App = () => {
    return (
        <AuthProvider>
            <div className='App'>{/* Your App content here */}</div>
        </AuthProvider>
    );
};

export default App;
