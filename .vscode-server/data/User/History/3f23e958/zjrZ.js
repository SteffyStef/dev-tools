const express = require('express');
const cors = require('cors');
const session = require('express-session');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const app = express();
const port = 3001;

// Accept all CORS
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

app.use(session({
  secret: 'supersecretkey',
  resave: false,
  saveUninitialized: false,
  cookie: {
    sameSite: 'lax',
    httpOnly: true,
    maxAge: 1000 * 60 * 60 // 1 hour
  }
}));

// MySQL connection
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'password123',
  database: 'hello_app'
});

// Auth Middleware
function authMiddleware(req, res, next) {
  if (!req.session.user) return res.status(401).json({ error: 'Unauthorized' });
  next();
}

// Register
app.post('/api/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Required fields missing' });

  const hash = await bcrypt.hash(password, 10);
  try {
    await db.query('INSERT INTO users (email, hashed_password) VALUES (?, ?)', [email, hash]);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: 'Email already exists' });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

  if (rows.length === 0) return res.status(400).json({ error: 'Invalid credentials' });

  const user = rows[0];
  const valid = await bcrypt.compare(password, user.hashed_password);
  if (!valid) return res.status(400).json({ error: 'Invalid credentials' });

  req.session.user = { id: user.id, email: user.email };
  res.json({ success: true });
});

// Check Session
app.get('/api/user', (req, res) => {
  if (req.session.user) res.json({ user: req.session.user });
  else res.status(401).json({ error: 'Not logged in' });
});

// Logout
app.post('/api/logout', (req, res) => {
  req.session.destroy(() => res.json({ success: true }));
});

// Get all books
app.get('/api/books', authMiddleware, async (req, res) => {
  const [books] = await db.query('SELECT * FROM books WHERE user_id = ?', [req.session.user.id]);
  res.json(books);
});

// Get single book
app.get('/api/books/:id', authMiddleware, async (req, res) => {
  const [books] = await db.query('SELECT * FROM books WHERE id = ? AND user_id = ?', [req.params.id, req.session.user.id]);
  if (books.length === 0) return res.status(404).json({ error: 'Not found' });
  res.json(books[0]);
});

// Add book
app.post('/api/books', authMiddleware, async (req, res) => {
  const { title, author, genre, status, notes } = req.body;
  await db.query(
    'INSERT INTO books (user_id, title, author, genre, status, notes, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
    [req.session.user.id, title, author, genre, status, notes]
  );
  res.json({ success: true });
});

// Update book
app.put('/api/books/:id', authMiddleware, async (req, res) => {
  const { title, author, genre, status, notes } = req.body;
  await db.query(
    'UPDATE books SET title=?, author=?, genre=?, status=?, notes=?, updated_at=NOW() WHERE id=? AND user_id=?',
    [title, author, genre, status, notes, req.params.id, req.session.user.id]
  );
  res.json({ success: true });
});

// Delete book
app.delete('/api/books/:id', authMiddleware, async (req, res) => {
  await db.query('DELETE FROM books WHERE id=? AND user_id=?', [req.params.id, req.session.user.id]);
  res.json({ success: true });
});

app.listen(port, () => {
  console.log(`Server running on http://0.0.0.0:${port}`);
});

