import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthProvider';
import { authAPI } from '../utils/api/apiV2';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      const data = await authAPI.login({ email, password });
      login(data.token);
      navigate('/');
    } catch (error) {
      setErrorMessage(error.message || 'Authentication failed.');
      console.error('Login failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='loginForm'>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div className='loginForm__usernameContainer'>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
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
            disabled={loading}
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
        {errorMessage && <p>{errorMessage}</p>}
      </form>
    </div>
  );
}

export default Login;
