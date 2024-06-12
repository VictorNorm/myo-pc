import React from 'react';
import { useAuth } from '../contexts/AuthProvider';

const HomePage = () => {
  const { user } = useAuth();

  return (
    <div>
      <h1>Welcome to the Home Page!</h1>
      {user && <p>Hello, {user.firstName} {user.lastName}!</p>}
    </div>
  );
};

export default HomePage;
