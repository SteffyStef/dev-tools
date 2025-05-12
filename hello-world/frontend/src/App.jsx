import { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetch('http://44.245.204.124:3001/api/hello')
      .then(res => res.json())
      .then(data => setMsg(data.message));
  }, []);

  return (
    <div>
      <h1>Hello World App</h1>
      <p>{msg}</p>
    </div>
  );
}

export default App;

