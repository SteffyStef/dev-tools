const express = require('express');
const cors = require('cors');
const session = require('express-session');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const app = express();
const port = 3001;

// Allow all CORS
app.use(cors({
  origin: 'http://54.190.139.122:5173',
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

// MySQL pool
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'password123',  // ✅ Use your actual MySQL password
  database: 'hello_app'
});

// Register route
app.post('/api/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  const hash = await bcrypt.hash(password, 10);
  try {
    await db.query('INSERT INTO users (email, hashed_password) VALUES (?, ?)', [email, hash]);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: 'Email already exists' });
  }
});

// Login route
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

  if (rows.length === 0) {
    return res.status(400).json({ error: 'Invalid email or password' });
  }

  const user = rows[0];
  const valid = await bcrypt.compare(password, user.hashed_password); // ✅ match field name

  if (!valid) {
    return res.status(400).json({ error: 'Invalid email or password' });
  }

  req.session.user = { id: user.id, email: user.email };
  res.json({ success: true });
});

// Get current user
app.get('/api/user', (req, res) => {
  if (req.session.user) {
    res.json({ user: req.session.user });
  } else {
    res.status(401).json({ error: 'Not logged in' });
  }
});

// Logout
app.post('/api/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

app.listen(port, () => {
  console.log(`Backend running on http://0.0.0.0:${port}`);
});

