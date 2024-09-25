import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const VerifyEmail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search);
  const token = query.get('token');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/verify-email?token=${token}`);
        const result = await response.json();
        setMessage(result.message);
        
        // Redirect to login page after a short delay
        setTimeout(() => {
          navigate('/login');
        }, 2500);
      } catch (error) {
        setMessage('An error occurred while verifying your email.');
      }
    };

    if (token) {
      verifyEmail();
    }
  }, [token, navigate]);

  return (
    <div>
      <h1>{message}</h1>
    </div>
  );
};

export default VerifyEmail;