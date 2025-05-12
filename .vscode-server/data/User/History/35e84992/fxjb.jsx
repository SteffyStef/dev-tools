import { useState, useEffect } from 'react';

const API = 'http://44.224.136.57:3001';

function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);

  // Check session on load
  useEffect(() => {
    fetch(`${API}/api/user`, { credentials: 'include' })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.user) setUser(data.user);
        setLoading(false);
      });
  }, []);

  const login = async () => {
    const res = await fetch(`${API}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    });

    if (res.ok) {
      const userRes = await fetch(`${API}/api/user`, { credentials: 'include' });
      const data = await userRes.json();
      setUser(data.user);
      setEmail('');
      setPassword('');
    } else {
      alert('Login failed');
    }
  };

  const register = async () => {
    const res = await fetch(`${API}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (res.ok) {
      alert('Registered successfully! You can now log in.');
      setView('login');
      setEmail('');
      setPassword('');
    } else {
      alert('Registration failed. Try a different email.');
    }
  };

  const logout = async () => {
    await fetch(`${API}/api/logout`, {
      method: 'POST',
      credentials: 'include'
    });
    setUser(null);
  };

  if (loading) return <p>Loading...</p>;

  if (user) {
    return (
      <div>
        <h2>Welcome, {user.email}</h2>
        <button onClick={logout}>Logout</button>
      </div>
    );
  }

  return (
    <div>
      <h2>{view === 'login' ? 'Login' : 'Register'}</h2>
      <input
        type="email"
        value={email}
        placeholder="Email"
        onChange={e => setEmail(e.target.value)}
      />
      <input
        type="password"
        value={password}
        placeholder="Password"
        onChange={e => setPassword(e.target.value)}
      />
      {view === 'login' ? (
        <>
          <button onClick={login}>Login</button>
          <p>Don't have an account? <button onClick={() => setView('register')}>Register</button></p>
        </>
      ) : (
        <>
          <button onClick={register}>Register</button>
          <p>Already have an account? <button onClick={() => setView('login')}>Login</button></p>
        </>
      )}
    </div>
  );
}

export default App;

