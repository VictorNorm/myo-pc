import React from 'react';
import { useAuth } from '../contexts/AuthProvider';
import { useNavigate } from 'react-router-dom';

function Header() {
  const { isAuthenticated, clearAuth } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuth();
    navigate('/login'); 
  };

  return (
    <div className='header'>
      Myo
      {isAuthenticated && (
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      )}
    </div>
  );
}

export default Header;
