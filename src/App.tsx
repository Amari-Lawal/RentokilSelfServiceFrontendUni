import { useState, useEffect } from 'react';
import './index.css';
import AuthForms from './components/AuthForms';
import Dashboard from './components/Dashboard';
import { User } from './types';

const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (err) {
      console.error(err);
    }
    setUser(null);
  };

  return (
    <>
      <header className="app-header">
        <div className="app-title">Rentokil Self Service</div>
        {user && (
          <div className="flex align-center gap-4">
            <span>Welcome, <strong>{user?.username}</strong> {user?.is_admin ? '(Admin)' : ''}</span>
            <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
          </div>
        )}
      </header>

      <main className="container animate-fade-in">
        {!user ? (
          <AuthForms setUser={setUser} />
        ) : (
          <Dashboard user={user} />
        )}
      </main>
    </>
  );
}

export default App;
