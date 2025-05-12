import { useState, useEffect } from 'react';
import './App.css';

const API = 'http://44.224.136.57:3001';

export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [books, setBooks] = useState([]);
  const [tab, setTab] = useState('To Read');
  const [selectedBook, setSelectedBook] = useState(null);

  const [search, setSearch] = useState('');


  useEffect(() => {
    fetch(`${API}/api/user`, { credentials: 'include' })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.user) {
          setUser(data.user);
          loadBooks();
        }
      });
  }, []);

  const loadBooks = () => {
    fetch(`${API}/api/books`, { credentials: 'include' })
      .then(res => res.json())
      .then(setBooks);
  };

  const saveBook = (book) => {
    const method = book.id ? 'PUT' : 'POST';
    const url = book.id ? `${API}/api/books/${book.id}` : `${API}/api/books`;

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(book)
    }).then(() => {
      loadBooks();
      setSelectedBook(null);
    });
  };

  const deleteBook = (id) => {
    fetch(`${API}/api/books/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    }).then(loadBooks);
  };

  const login = () => {
    fetch(`${API}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    }).then(res => {
      if (res.ok) {
        setEmail('');
        setPassword('');
        fetch(`${API}/api/user`, { credentials: 'include' })
          .then(res => res.json())
          .then(data => {
            setUser(data.user);
            loadBooks();
          });
      } else {
        alert('Login failed');
      }
    });
  };

  const register = () => {
    fetch(`${API}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    }).then(res => {
      if (res.ok) {
        alert('Registered successfully');
        setView('login');
        setEmail('');
        setPassword('');
      } else {
        alert('Registration failed');
      }
    });
  };

  const logout = () => {
    fetch(`${API}/api/logout`, { method: 'POST', credentials: 'include' })
      .then(() => setUser(null));
  };

  const filteredBooks = books.filter(book => book.status === tab);

  if (!user) {
    return (
      <div>
        <h2>{view === 'login' ? 'Login' : 'Register'}</h2>
        <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        {view === 'login' ? (
          <>
            <button onClick={login}>Login</button>
            <p>No account? <button onClick={() => setView('register')}>Register</button></p>
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

  return (
    <div>
      <input
        type="text"
        placeholder="Filter by title or genre"
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ padding: '0.5rem', marginBottom: '1rem', width: '100%', maxWidth: '400px' }}
      />
      <div className="book-list">
        {filteredBooks.map(book => (
          <div className="book-card" key={book.id} onClick={() => setSelectedBook(book)}>
            <strong>{book.title}</strong><br />
            <span>{book.author}</span><br />
            <span><em>{book.genre}</em></span>
          </div>
        ))}
      </div>
    </div>

  );
}


