const express = require('express');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
const cors = require('cors');
const app = express();
const port = 3001;

// Setup Database connection
const dbOptions = {
  host: '44.243.22.68',
  user: 'root',
  password: 'password123',
  database: 'hello_app',
};
const db = mysql.createPool(dbOptions);

// Setup Session store
const sessionStore = new MySQLStore(dbOptions);

// Middleware
app.use(cors({
  origin: 'http://44.243.22.68:5173',
  credentials: true,
}));
app.use(express.json());
app.use(session({
  key: 'tasktrackr_sid',
  secret: 'your_secret_key',
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false, // only true if using https
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24, // 1 day
  }
}));

// Auth routes
app.post('/api/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Missing fields' });

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const [existingUser] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    await db.query('INSERT INTO users (email, hashed_password) VALUES (?, ?)', [email, hashedPassword]);
    return res.status(200).json({ message: 'User registered' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error registering user' });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const [results] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

  if (!results.length) return res.status(401).json({ message: 'Invalid credentials' });

  const user = results[0];
  const passwordMatch = await bcrypt.compare(password, user.hashed_password);
  if (!passwordMatch) return res.status(401).json({ message: 'Invalid credentials' });

  req.session.userId = user.id;
  req.session.save(err => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Session error' });
    }
    res.json({ message: 'Logged in' });
  });
});

app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Logout error' });
    }
    res.clearCookie('tasktrackr_sid');
    res.json({ message: 'Logged out' });
  });
});

// Auth Middleware
function authMiddleware(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  next();
}

// Tasks Routes
app.get('/api/tasks', authMiddleware, async (req, res) => {
  const [tasks] = await db.query('SELECT * FROM tasks WHERE user_id = ?', [req.session.userId]);
  res.json(tasks);
});

app.post('/api/tasks', authMiddleware, async (req, res) => {
  const { title, description, due_date, category, completed } = req.body;

  await db.query(
    'INSERT INTO tasks (user_id, title, description, due_date, category, completed) VALUES (?, ?, ?, ?, ?, ?)',
    [req.session.userId, title, description, due_date, category, completed || false]
  );

  res.sendStatus(201);
});


// Update task route (PUT)
app.put('/api/tasks/:id', authMiddleware, async (req, res) => {
  let { title, description, due_date, completed, category } = req.body;

  // Fix the due_date format (YYYY-MM-DD)
  const fixedDueDate = due_date ? due_date.split('T')[0] : null;

  await db.query(
    'UPDATE tasks SET title = ?, description = ?, due_date = ?, completed = ?, category = ?, updated_at = NOW() WHERE id = ? AND user_id = ?',
    [title, description, fixedDueDate, completed, category, req.params.id, req.session.userId]
  );

  res.sendStatus(200);
});



// Delete task route (DELETE)
app.delete('/api/tasks/:id', authMiddleware, async (req, res) => {
  await db.query(
    'DELETE FROM tasks WHERE id = ? AND user_id = ?',
    [req.params.id, req.session.userId]
  );
  
  res.sendStatus(200);
});



// Test Route
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from the backend!' });
});

app.listen(port, () => {
  console.log(`Backend running on http://44.243.22.68:${port}`);
});

