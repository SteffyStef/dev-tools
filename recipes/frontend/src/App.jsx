import { useState } from 'react';
import LoginPage from './LoginPage';
import Dashboard from './Dashboard';
import './App.css';

function App() {
  const [loggedIn, setLoggedIn] = useState(false);

  return (
    <div className="App">
      {loggedIn ? <Dashboard setLoggedIn={setLoggedIn} /> : <LoginPage setLoggedIn={setLoggedIn} />}
    </div>
  );
}

export default App;

