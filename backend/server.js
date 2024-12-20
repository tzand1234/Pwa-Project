'use strict';

import { default as Express } from 'express';
import * as HTTP from 'http';
import * as Vite from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import sqlite3 from 'sqlite3';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { sendResetEmail } from './sendEmail.js';

// Load environment variables from .env file
dotenv.config();

// Create our express app
const app = Express();
app.use(Express.json());

// Connect it to a web server
const httpServer = HTTP.createServer();
httpServer.on('request', app);

// Determine absolute path to the database file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, 'database.db');

// Connect to SQLite database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Could not connect to database', err);
  } else {
    console.log('Connected to database');
    // Initialize database with schema from SQL file
    const initSql = readFileSync(join(__dirname, 'schema.sql')).toString();
    db.exec(initSql, (err) => {
      if (err) {
        console.error('Could not initialize database', err);
      } else {
        console.log('Database initialized');
      }
    });
  }
});

// Middleware for verifying JWT tokens
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Validate email format
const validateEmail = (email) => {
  // Regular expression for basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate password strength
const validatePassword = (password) => {
  // Minimum 8 characters, at least one letter and one number
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
  return passwordRegex.test(password);
};

// User registration route with input validation
app.post('/users/register', async (req, res) => {
  const { username, email, password } = req.body;
  console.log(username, email, password);

  // Validate inputs
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  if (!validateEmail(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }
  if (!validatePassword(password)) {
    return res.status(400).json({ error: 'Password must be at least 8 characters long and contain at least one letter and one number' });
  }

  try {
    // Hash the password using bcrypt with a salt rounds value of 10
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user data (username, email, and hashed password) into the database
    db.run(`INSERT INTO users (username, email, password) VALUES (?, ?, ?)`, [username, email, hashedPassword], function (err) {
      if (err) {
        return res.status(400).json({ error: 'Username or email already exists' });
      }
      res.status(201).json({ id: this.lastID });
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// User login route
app.post('/users/login', (req, res) => {
  const { username, password } = req.body;

  // Query the database to find the user by username
  db.get(`SELECT * FROM users WHERE username = ?`, [username], async (err, user) => {
    // Handle errors or user not found
    if (err || !user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // If username and password match, generate an access token using JWT
    const accessToken = jwt.sign({ id: user.id, username: user.username }, process.env.ACCESS_TOKEN_SECRET);

    // Respond with the generated access token
    res.json({ accessToken });
  });
});

// Password reset initiation route
app.post('/users/reset-password', async (req, res) => {
  const { email } = req.body;

  // Query the database to find the user by email
  db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, user) => {
    if (err || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate reset token
    const resetToken = jwt.sign({ id: user.id, email: user.email }, process.env.RESET_PASSWORD_SECRET, { expiresIn: '1h' });

    // Send email with reset link
    sendResetEmail(email, resetToken)
      .then(() => res.json({ message: 'Password reset email sent' }))
      .catch((err) => {
        console.error('Failed to send reset email', err);
        res.status(500).json({ error: 'Failed to send reset email' });
      });
  });
});

// Password reset confirmation route
app.post('/users/reset-password-confirm', async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    // Verify reset token
    const decodedToken = jwt.verify(token, process.env.RESET_PASSWORD_SECRET);
    const { id } = decodedToken;

    // Validate new password
    if (!validatePassword(newPassword)) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long and contain at least one letter and one number' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user's password in the database
    db.run(`UPDATE users SET password = ? WHERE id = ?`, [hashedPassword, id], function (err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to update password' });
      }
      res.status(200).json({ message: 'Password reset successful' });
    });
  } catch (error) {
    res.status(403).json({ error: 'Invalid or expired token' });
  }
});

// Get user info
app.get('/users/:username', (req, res) => {
  const { username } = req.params;
  db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
    if (err) {
      console.error('Error getting user:', err);
      return res.status(500).json({ error: 'Failed to get user' });
    }
    if (!row) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(row);
  });
});

app.put('/users/:username', (req, res) => {
  const { username } = req.params;
  const { name, bio, profilePicture } = req.body;

  const query = `UPDATE users SET name = ?, bio = ?, profilePicture = ? WHERE username = ?`;
  const params = [name, bio, profilePicture, username];

  db.run(query, params, function(err) {
    if (err) {
      console.error('Error updating user:', err);
      return res.status(500).json({ error: 'Failed to update user' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'Profile updated successfully' });
    console.log(name, bio, profilePicture, username);
  });
});

// Endpoint to get workouts by user ID
app.get('/users/:userId/workouts', authenticateToken, async (req, res) => {
  const { userId } = req.params;
  try {
    db.all('SELECT * FROM workouts WHERE userId = ?', [userId], (err, rows) => {
      if (err) {
        console.error('Error getting workouts:', err);
        return res.status(500).json({ error: 'Failed to get workouts' });
      }
      res.json(rows);
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch workouts' });
  }
});

// Create a new workout
app.post('/workouts', authenticateToken, (req, res) => {
  const { userId, exercise, description, date, imageUrl } = req.body;

  db.run(`INSERT INTO workouts (userId, exercise, description, date, imageUrl) VALUES (?, ?, ?, ?, ?)`,
    [userId, exercise, description, date, imageUrl], function (err) {
      if (err) {
        console.error('Error creating workout:', err);
        return res.status(500).json({ error: 'Failed to create workout' });
      }
      res.status(201).json({ id: this.lastID });
    });
});

// Get all workouts
app.get('/workouts', (req, res) => {
  db.all(`SELECT * FROM workouts`, (err, rows) => {
    if (err) {
      console.error('Error getting workouts:', err);
      return res.status(500).json({ error: 'Failed to get workouts' });
    }
    res.json(rows);
  });
});

// Get a specific workout by ID
app.get('/workouts/:id', (req, res) => {
  const { id } = req.params;

  db.get(`SELECT * FROM workouts WHERE id = ?`, [id], (err, row) => {
    if (err) {
      console.error(`Error getting workout ${id}:`, err);
      return res.status(500).json({ error: `Failed to get workout ${id}` });
    }
    if (!row) {
      return res.status(404).json({ error: `Workout ${id} not found` });
    }
    res.json(row);
  });
});

// Update a workout by ID
app.put('/workouts/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { userId, exercise, description, date, imageUrl } = req.body;

  db.run(`UPDATE workouts SET userId = ?, exercise = ?, description = ?, date = ?, imageUrl = ? WHERE id = ?`,
    [userId, exercise, description, date, imageUrl, id], function (err) {
      if (err) {
        console.error(`Error updating workout ${id}:`, err);
        return res.status(500).json({ error: `Failed to update workout ${id}` });
      }
      res.json({ message: `Workout ${id} updated successfully` });
    });
});

// Delete a workout by ID
app.delete('/workouts/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  db.run(`DELETE FROM workouts WHERE id = ?`, [id], function (err) {
    if (err) {
      console.error(`Error deleting workout ${id}:`, err);
      return res.status(500).json({ error: `Failed to delete workout ${id}` });
    }
    res.json({ message: `Workout ${id} deleted successfully` });
  });
});

// Search workouts by description
app.get('/search/workouts', authenticateToken, (req, res) => {
  const { description } = req.query;
  const searchQuery = `%${description}%`;

  db.all(`SELECT * FROM workouts WHERE description LIKE ?`, [searchQuery], (err, rows) => {
    if (err) {
      console.error('Error searching workouts:', err);
      return res.status(500).json({ error: 'Failed to search workouts' });
    }
    res.json(rows);
  });
});

// All other requests are handled by Vite, to serve our Svelte frontend application.
app.use((await Vite.createServer({
  root: 'frontend/',
  logLevel: 'info',
  server: {
    middlewareMode: true,
    hmr: { server: httpServer }
  },
  plugins: [
    svelte(),
  ],
  appType: 'spa',
})).middlewares);

// Read host and port from environment variables and start the web server
const host = process.env.HOST || '0.0.0.0';
const port = (0 | process.env.PORT) || 3000;
httpServer.listen(port, host, () => {
  console.log(`Running at http://${host}:${port}`);
});
