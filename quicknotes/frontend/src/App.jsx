import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

axios.defaults.withCredentials = true;

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ email: '', password: '' });
  const [noteTitle, setNoteTitle] = useState('');
  const [noteBody, setNoteBody] = useState('');
  const [currentNote, setCurrentNote] = useState({ id: null, title: '', body: '' });
  const [saveStatus, setSaveStatus] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);  // State to toggle between login and registration

  // Fetch notes and authenticate the user
  const fetchNotes = async () => {
    try {
      const res = await axios.get('http://44.245.204.124:3001/api/notes');
      setNotes(res.data);
      if (res.data.length > 0) {
        setSelectedNote(res.data[0]);
        
      }
    } catch (err) {
      console.error('Failed to fetch notes:', err);
    }
  };

  const handleLogin = async () => {
    try {
      await axios.post('http://44.245.204.124:3001/api/login', loginForm);
      setLoggedIn(true);
      fetchNotes();
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  const handleRegister = async () => {
    try {
      await axios.post('http://44.245.204.124:3001/api/register', registerForm);  // Assuming a register endpoint exists
      alert("Registration successful! You can now log in.");
      setIsRegistering(false);  // Switch to login form after successful registration
    } catch (err) {
      console.error('Registration failed:', err);
    }
  };

  const handleLogout = async () => {
    await axios.post('http://44.245.204.124:3001/api/logout');
    setLoggedIn(false);
    setNotes([]);
    setSelectedNote(null);
    setCurrentNote({ id: null, title: '', body: '' });
  };

  // Checking auth status on component mount
  useEffect(() => {
    axios.get('http://44.245.204.124:3001/api/check-auth')
      .then(() => {
        setLoggedIn(true);
        fetchNotes();
      })
      .catch(() => setLoggedIn(false));
  }, []);

// Polling every 10 seconds to fetch updated notes list
useEffect(() => {
  if (!loggedIn) return;

  const interval = setInterval(() => {
    fetchNotes();
  }, 10000); // 10 seconds

  return () => clearInterval(interval);
}, [loggedIn]);


  // Auto-save effect
  useEffect(() => {
    if (!selectedNote?.id) return;

    const timer = setTimeout(() => {
      handleSave();
    }, 5000);

    return () => clearTimeout(timer);
  }, [noteTitle, noteBody, selectedNote?.id]);

  // Handle selecting a note
  // Handle selecting a note
const selectNote = (note) => {
  if (!note) {
    console.error("Note is invalid.");
    return; // Exit early if the note is invalid
  }

  setSelectedNote(note);
  setCurrentNote(note);
  setNoteTitle(note.title);
  setNoteBody(note.body);

  // Optionally, handle any side effects here (e.g., saving progress, etc.)
  console.log('Note selected:', note);
};


  // Handle saving the note
  const handleSave = async () => {
  if (!noteTitle || !noteBody) return; // Don't save empty notes

  try {
    if (currentNote.id) {
      // ✅ Update existing note
      await axios.put(`http://44.245.204.124:3001/api/notes/${currentNote.id}`, {
        title: noteTitle,
        body: noteBody
      });

      // ✅ Update sidebar note in-place
      setNotes((prevNotes) =>
        prevNotes.map((note) =>
          note.id === currentNote.id
            ? { ...note, title: noteTitle, body: noteBody }
            : note
        )
      );
    } else {
      // ✅ Create new note
      const res = await axios.post('http://44.245.204.124:3001/api/notes', {
        title: noteTitle,
        body: noteBody
      });

      setCurrentNote(res.data);     // ✅ For continued editing
      setSelectedNote(res.data);    // ✅ Keeps the editor focused
      setNotes((prevNotes) => [res.data, ...prevNotes]);// ✅ Adds to top of sidebar
      console.log("All notes after save:", notes);

    }


    setSaveStatus('Saved!');
    // Optional: uncomment to always re-fetch full list
    // fetchNotes();
  } catch (err) {
    console.error('Save failed:', err);
    setSaveStatus('Save failed');
  }
};




  // Handle new note
  const handleNewNote = async () => {
  try {
    const res = await axios.post('http://44.245.204.124:3001/api/notes', {
      title: 'New Note',
      body: ''
    });
    const newNote = res.data;

    // Append new note to existing list
    setNotes(prevNotes => [...prevNotes, newNote]);

    // Set the newly created note as the selected note
    setSelectedNote(newNote);
  } catch (err) {
    console.error('Error creating note', err);
  }
};



  const handleDeleteNote = async () => {
    if (!selectedNote?.id) return;
    await axios.delete(`http://44.245.204.124:3001/api/notes/${selectedNote.id}`);
    setSelectedNote(null);
    setCurrentNote({ id: null, title: '', body: '' });
    fetchNotes();  // Refresh notes list
  };

useEffect(() => {
  console.log('Current Notes:', notes);
}, [notes]);

useEffect(() => {
  console.log('Selected Note:', selectedNote);
}, [selectedNote]);


// Handle change in note title or body
  const handleNoteChange = async (field, value) => {
    const updated = { ...selectedNote, [field]: value };
    setSelectedNote(updated);

    // Only update the note, don't create a new one
    await axios.put(`http://44.245.204.124:3001/api/notes/${updated.id}`, updated);
  };

  // If not logged in, show login or registration form
  if (!loggedIn) {
    return (
      <div className="auth">
        <h2>{isRegistering ? "Register" : "Login"}</h2>

        {/* Login Form */}
        {!isRegistering ? (
          <>
            <input
              placeholder="Email"
              value={loginForm.email}
              onChange={e => setLoginForm({ ...loginForm, email: e.target.value })}
            />
            <input
              type="password"
              placeholder="Password"
              value={loginForm.password}
              onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
            />
            <button onClick={handleLogin}>Login</button>
            <p>
              Don't have an account?{' '}
              <button onClick={() => setIsRegistering(true)}>Register here</button>
            </p>
          </>
        ) : (
          /* Register Form */
          <>
            <input
              placeholder="Email"
              value={registerForm.email}
              onChange={e => setRegisterForm({ ...registerForm, email: e.target.value })}
            />
            <input
              type="password"
              placeholder="Password"
              value={registerForm.password}
              onChange={e => setRegisterForm({ ...registerForm, password: e.target.value })}
            />
            <button onClick={handleRegister}>Register</button>
            <p>
              Already have an account?{' '}
              <button onClick={() => setIsRegistering(false)}>Login here</button>
            </p>
          </>
        )}
      </div>
    );
  }

  // Main content after successful login
  return (
    <div className="app">
      <aside className="sidebar">
        <button className="logout-button" onClick={handleLogout}>Logout</button>
        <h2>My Notes</h2>
        <div className="note-list">
          {notes.map((note) => (
            <div
              key={note.id}
              className={`note-title ${note.id === selectedNote?.id ? 'active' : ''}`}
              onClick={() => selectNote(note)}
            >
              {note.title || 'Untitled'}
            </div>
          ))}
        </div>
        <button onClick={handleNewNote}>New Note</button>
      </aside>

      <main className="main">
        {selectedNote || currentNote.id === null ? (
          <>
            <input
              className="note-input"
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              placeholder="Note Title"
            />
            <textarea
              className="note-body"
              value={noteBody}
              onChange={(e) => setNoteBody(e.target.value)}
              placeholder="Start typing your note..."
            />
            {selectedNote && (
              <button onClick={handleDeleteNote}>Delete Note</button>
            )}
            {saveStatus && <div className="save-status">{saveStatus}</div>}
          </>
        ) : (
          <p>Select or create a note to begin editing.</p>
        )}
      </main>
    </div>
  );
}

export default App;

