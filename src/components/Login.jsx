
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthProvider';

function Login() {
  const [username, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const {login} = useAuth();

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    const response = await fetch(`${process.env.REACT_APP_API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });
  
    if (response.ok) {
      const data = await response.json();
      login(data.token);
      navigate('/');
    } else {
      console.error('Login failed');
    }
  };

  return (
    <div className='loginForm'>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div className='loginForm__usernameContainer'>
          <label htmlFor="username">Email</label>
          <input
            type="username"
            id="username"
            value={username}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className='loginForm__passwordContainer'>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default Login;
