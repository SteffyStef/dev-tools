const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const app = express();
const port = 3001;

app.use(cors({
  origin: 'http://44.245.204.124:5173', // Add your frontend IP here
  credentials: true
}));

app.use(express.json());

app.use(session({
  secret: 'secret_key', // replace with your own secret
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

app.get('/api/check-auth', (req, res) => {
  if (req.session.userId) {
    return res.json({ authenticated: true });
  }
  res.status(401).json({ error: 'Not authenticated' });
});

// MySQL connection
const db = mysql.createPool({
  host: 'localhost',
  user: 'quicknotes_user',
  password: 'strongpassword123!',
  database: 'hello_app'
});


// --- Auth Routes ---

app.post('/api/register', async (req, res) => {
  const { email, password } = req.body;
  const [userExists] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
  if (userExists.length) return res.status(400).json({ error: 'Email already exists' });

  const hashedPassword = await bcrypt.hash(password, 10);
  await db.query('INSERT INTO users (email, hashed_password) VALUES (?, ?)', [email, hashedPassword]);
  res.json({ success: true });
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = rows[0];
    if (!user || !(await bcrypt.compare(password, user.hashed_password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    req.session.userId = user.id;
    res.json({ success: true, user: { id: user.id, email: user.email } });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});


app.post('/api/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

function authMiddleware(req, res, next) {
  if (!req.session.userId) return res.status(401).json({ error: 'Not authenticated' });
  next();
}

// --- Notes Routes (protected) ---

app.get('/api/notes', authMiddleware, async (req, res) => {
  const [notes] = await db.query('SELECT * FROM notes WHERE user_id = ?', [req.session.userId]);
  res.json(notes);
});

app.get('/api/notes/:id', authMiddleware, async (req, res) => {
  const [note] = await db.query('SELECT * FROM notes WHERE id = ? AND user_id = ?', [req.params.id, req.session.userId]);
  res.json(note[0] || {});
});

app.post('/api/notes', authMiddleware,  async (req, res) => {
  const { title, body } = req.body;
  const userId = req.session.userId;
// Check if user is authenticated
  if (!userId) {
    return res.status(401).json({ error: 'User not authenticated' }); // <-- Add this check
  }

console.log("Creating note for user:", userId);

  const [result] = await db.execute(
    'INSERT INTO notes (user_id, title, body) VALUES (?, ?, ?)',
    [userId, title, body]
  );

  const [newNote] = await db.execute(
    'SELECT * FROM notes WHERE id = ?',
    [result.insertId]
  );

  res.json(newNote[0]);
});


app.put('/api/notes/:id', authMiddleware, async (req, res) => {
  const { title, body } = req.body;
  await db.query('UPDATE notes SET title = ?, body = ? WHERE id = ? AND user_id = ?', [title, body, req.params.id, req.session.userId]);
  res.json({ success: true });
});

app.delete('/api/notes/:id', authMiddleware, async (req, res) => {
  await db.query('DELETE FROM notes WHERE id = ? AND user_id = ?', [req.params.id, req.session.userId]);
  res.json({ success: true });
});

app.get('/api/hello', (req, res) => {
  res.send('Hello from the backend!');
});


app.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}`);
});

