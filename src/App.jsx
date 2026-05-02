import React, { useState, useEffect } from 'react';
import './index.css';
import AuthForms from './components/AuthForms';
import Dashboard from './components/Dashboard';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }, [token, user]);

  const handleLogout = () => {
    setToken(null);
    setUser(null);
  };

  return (
    <>
      <header className="app-header">
        <div className="app-title">Rentokil Self Service</div>
        {token && (
          <div className="flex align-center gap-4">
            <span>Welcome, <strong>{user?.username}</strong> {user?.is_admin ? '(Admin)' : ''}</span>
            <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
          </div>
        )}
      </header>

      <main className="container animate-fade-in">
        {!token ? (
          <AuthForms setToken={setToken} setUser={setUser} />
        ) : (
          <Dashboard token={token} user={user} />
        )}
      </main>
    </>
  );
}

export default App;
