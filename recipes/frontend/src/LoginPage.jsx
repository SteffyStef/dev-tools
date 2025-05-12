import { useState } from 'react';
import { login, register } from './api';

export default function LoginPage({ setLoggedIn }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="login">
      <h2>Login</h2>
      <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
      <button onClick={() => login(email, password).then(() => setLoggedIn(true))}>Login</button>
      <button onClick={() => register(email, password)}>Register</button>
    </div>
  );
}

