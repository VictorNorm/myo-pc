import React from 'react';
import './App.css';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthProvider';
import { Droppable } from 'react-beautiful-dnd';

Droppable.defaultProps = Droppable.defaultProps || {};

const App = ({ router }) => {
    return (
        <RouterProvider router={router}>
            <AuthProvider>
                <div className='App'>{/* Your App content here */}</div>
            </AuthProvider>
        </RouterProvider>
    );
};

export default App;
