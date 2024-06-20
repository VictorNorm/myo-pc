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
    <>
      <div className='header-top'>
          {isAuthenticated && (
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          )}
      </div>
        <div className='header'>
          <p id='logoName'>Myo</p>
        </div>
    </>
  );
}

export default Header;
