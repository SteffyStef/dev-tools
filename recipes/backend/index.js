const express = require('express');
const session = require('express-session');
const cors = require('cors');
const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');

const app = express();
const port = 3001;

app.use(cors({
  origin: 'http://54.185.142.99:5173',
  credentials: true
}));
app.use(express.json());

app.use(session({
  secret: 'secret_recipe_key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'password123',
  database: 'hello_app'
};

async function getDb() {
  return await mysql.createConnection(dbConfig);
}

// Auth middleware
function requireLogin(req, res, next) {
  if (!req.session.userId) return res.status(401).json({ message: 'Unauthorized' });
  next();
}

// Register
app.post('/api/register', async (req, res) => {
  const { email, password } = req.body;
  const conn = await getDb();
  const [existing] = await conn.query('SELECT * FROM users WHERE email = ?', [email]);
  if (existing.length > 0) return res.status(400).json({ message: 'User exists' });

  const hashed = await bcrypt.hash(password, 10);
  await conn.query('INSERT INTO users (email, hashed_password) VALUES (?, ?)', [email, hashed]);
  res.json({ message: 'User registered' });
});

// Login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const conn = await getDb();
  const [rows] = await conn.query('SELECT * FROM users WHERE email = ?', [email]);
  if (rows.length === 0) return res.status(400).json({ message: 'User not found' });

  const user = rows[0];
  const valid = await bcrypt.compare(password, user.hashed_password);
  if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

  req.session.userId = user.id;
  res.json({ message: 'Logged in' });
});

// Logout
app.post('/api/logout', (req, res) => {
  req.session.destroy();
  res.json({ message: 'Logged out' });
});

// Get recipes
app.get('/api/recipes', requireLogin, async (req, res) => {
  const conn = await getDb();
  const [rows] = await conn.query('SELECT * FROM recipes WHERE user_id = ?', [req.session.userId]);
  res.json(rows);
});

// Get one recipe
app.get('/api/recipes/:id', requireLogin, async (req, res) => {
  const conn = await getDb();
  const [rows] = await conn.query('SELECT * FROM recipes WHERE id = ? AND user_id = ?', [req.params.id, req.session.userId]);
  res.json(rows[0]);
});

// Create recipe
app.post('/api/recipes', requireLogin, async (req, res) => {
  const { title, ingredients, instructions, tags, image_url } = req.body;
  const conn = await getDb();
  await conn.query(
    'INSERT INTO recipes (user_id, title, ingredients, instructions, tags, image_url) VALUES (?, ?, ?, ?, ?, ?)',
    [req.session.userId, title, ingredients, instructions, tags, image_url]
  );
  res.json({ message: 'Recipe added' });
});

// Update recipe
app.put('/api/recipes/:id', requireLogin, async (req, res) => {
  const { title, ingredients, instructions, tags, image_url } = req.body;
  const conn = await getDb();
  await conn.query(
    'UPDATE recipes SET title = ?, ingredients = ?, instructions = ?, tags = ?, image_url = ? WHERE id = ? AND user_id = ?',
    [title, ingredients, instructions, tags, image_url, req.params.id, req.session.userId]
  );
  res.json({ message: 'Recipe updated' });
});

// Delete recipe
app.delete('/api/recipes/:id', requireLogin, async (req, res) => {
  const conn = await getDb();
  await conn.query('DELETE FROM recipes WHERE id = ? AND user_id = ?', [req.params.id, req.session.userId]);
  res.json({ message: 'Recipe deleted' });
});

app.listen(port, () => {
  console.log(`Backend running on http://54.185.142.99:${port}`);
});

