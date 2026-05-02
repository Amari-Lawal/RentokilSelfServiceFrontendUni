import React, { useState } from 'react';

const API_URL = 'http://localhost:8080';

export default function AuthForms({ setToken, setUser }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const endpoint = isLogin ? '/auth/login' : '/auth/register';
    
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Authentication failed');
      }

      if (isLogin) {
        setToken(data.access_token);
        setUser(data.user);
      } else {
        setIsLogin(true);
        setError('Registration successful! Please login.');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '4rem auto' }} className="glass-panel">
      <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
        {isLogin ? 'Login to Account' : 'Create an Account'}
      </h2>
      
      {error && <div style={{ color: 'var(--danger-color)', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Username
          <input 
            type="text" 
            className="form-control" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          /></label>
        </div>
        <div className="form-group">
          <label>Password
          <input 
            type="password" 
            className="form-control" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          /></label>
        </div>
        <button type="submit" className="btn" style={{ width: '100%' }}>
          {isLogin ? 'Login' : 'Register'}
        </button>
      </form>
      
      <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
        <span style={{ color: 'var(--text-light)', cursor: 'pointer' }} onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
        </span>
      </div>
    </div>
  );
}
