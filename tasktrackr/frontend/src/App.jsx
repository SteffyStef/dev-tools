import { useState } from 'react';
import axios from 'axios';
import Dashboard from './Dashboard';

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const backendURL = 'http://44.243.22.68:3001';

  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    if (isRegistering) {
      await axios.post(`${backendURL}/api/register`, { email, password }, { withCredentials: true });
      alert('Registration successful. Please log in.');
      setIsRegistering(false); // Switch to login view
    } else {
      await axios.post(`${backendURL}/api/login`, { email, password }, { withCredentials: true });
      setLoggedIn(true);
    }
  } catch (err) {
    console.error('Auth failed:', err);
  }
};


  if (loggedIn) {
    return <Dashboard backendURL={backendURL} />;
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h2>{isRegistering ? 'Register' : 'Login'}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        /><br />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        /><br />
        <button type="submit">{isRegistering ? 'Register' : 'Login'}</button>
      </form>
      <button onClick={() => setIsRegistering(!isRegistering)} style={{ marginTop: '1rem' }}>
        {isRegistering ? 'Switch to Login' : 'Switch to Register'}
      </button>
    </div>
  );
}

export default App;

