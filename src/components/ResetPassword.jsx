import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [token, setToken] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Extract token from URL parameters with HashRouter
    // This handles URLs like /#/reset-password?token=...
    const hash = window.location.hash;
    const searchParams = hash.includes('?') 
      ? new URLSearchParams(hash.split('?')[1])
      : new URLSearchParams('');
    
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }

    if(password.length < 4) {
      setMessage('Password must be at least 4 characters.')
      return;
    }

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/reset-password`, 
        { token, newPassword: password }
      );
      setMessage(response.data.message);
      
      // Use navigate instead of window.location for proper routing
      setTimeout(() => {
        navigate('/login');
      }, 1500); // Short delay to show success message
      
    } catch (error) {
      setMessage(error.response?.data?.error || 'An error occurred');
    }
  };

  return (
    <div className='reset-password-form'>
      <h2>Reset Password</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="password">New Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="confirmPassword">Confirm New Password:</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Reset Password</button>
      </form>
      {message && <p className={message.includes('success') ? 'success-message' : 'error-message'}>{message}</p>}
    </div>
  );
}

export default ResetPassword;