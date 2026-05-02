import React, { useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

export default function AuthForms({ setToken, setUser }) {
  const [isLogin, setIsLogin] = useState(true);
  const [authMode, setAuthMode] = useState('customer'); // 'customer' or 'admin'
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
        body: JSON.stringify({ 
          username, 
          password
        })
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
      <div className="flex mb-4" style={{ borderBottom: '1px solid var(--border-color)' }}>
        <button 
          className={`flex-1 p-2 ${authMode === 'customer' ? 'active-tab' : ''}`} 
          style={{ background: 'none', border: 'none', color: authMode === 'customer' ? 'var(--primary-color)' : 'var(--text-light)', cursor: 'pointer', fontWeight: 'bold' }}
          onClick={() => setAuthMode('customer')}
        >
          Customer
        </button>
        <button 
          className={`flex-1 p-2 ${authMode === 'admin' ? 'active-tab' : ''}`} 
          style={{ background: 'none', border: 'none', color: authMode === 'admin' ? 'var(--primary-color)' : 'var(--text-light)', cursor: 'pointer', fontWeight: 'bold' }}
          onClick={() => { setAuthMode('admin'); setIsLogin(true); }}
        >
          Admin
        </button>
      </div>

      <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
        {authMode === 'admin' ? 'Admin ' : ''}{isLogin ? 'Login' : 'Registration'}
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
        <button type="submit" className="btn" style={{ width: '100%', marginTop: '1rem' }}>
          {isLogin ? 'Login' : 'Register'}
        </button>
      </form>
      
      {authMode === 'customer' && (
        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <span style={{ color: 'var(--text-light)', cursor: 'pointer' }} onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
          </span>
        </div>
      )}
    </div>
  );
}
