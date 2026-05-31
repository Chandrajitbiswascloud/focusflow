const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'focusflow_ultra_secure_secret_key';
const DB_PATH = path.join(__dirname, 'focusflow.db');

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Database
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error opening Database:', err.message);
  } else {
    console.log('Connected to FocusFlow SQLite Database.');
    initializeTables();
  }
});

// Helper database functions to use Promises
const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};

const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const dbAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

// Create tables schemas
async function initializeTables() {
  try {
    // Users Table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Profiles Table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS user_profiles (
        user_id INTEGER PRIMARY KEY,
        display_name TEXT NOT NULL,
        level INTEGER DEFAULT 1,
        current_xp INTEGER DEFAULT 0,
        credit_balance INTEGER DEFAULT 35,
        current_streak INTEGER DEFAULT 0,
        last_active_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Habits Table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS habits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        category TEXT DEFAULT 'custom',
        reward_credits INTEGER NOT NULL,
        xp_reward INTEGER NOT NULL,
        completed_today INTEGER DEFAULT 0, -- 0 for false, 1 for true
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Unlocked Sessions Table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS unlocked_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        app_identifier TEXT NOT NULL,
        duration_minutes INTEGER NOT NULL,
        cost_credits INTEGER NOT NULL,
        unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        expires_at DATETIME NOT NULL,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Transaction Ledger
    await dbRun(`
      CREATE TABLE IF NOT EXISTS credit_transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        change_amount INTEGER NOT NULL,
        type TEXT NOT NULL, -- 'earn' | 'spend'
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    console.log('Database tables verified/created successfully.');
  } catch (error) {
    console.error('Error during database table initialization:', error.message);
  }
}

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ success: false, error: 'Access token missing' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ success: false, error: 'Token invalid or expired' });
    req.user = user;
    next();
  });
};

// Seed default habits helper
async function seedDefaultHabits(userId) {
  const defaultHabits = [
    { title: 'Study/Focus for 1 hour', reward: 20, category: 'study' },
    { title: 'Workout/Exercise 30 mins', reward: 15, category: 'fitness' },
    { title: 'Drink 3L Water', reward: 5, category: 'health' },
    { title: 'Read book for 20 mins', reward: 10, category: 'mind' }
  ];

  for (const habit of defaultHabits) {
    await dbRun(
      `INSERT INTO habits (user_id, title, reward_credits, xp_reward, category) VALUES (?, ?, ?, ?, ?)`,
      [userId, habit.title, habit.reward, Math.floor(habit.reward * 1.5), habit.category]
    );
  }
}

// ================= AUTH ROUTES =================

// Register
app.post('/api/auth/register', async (req, res) => {
  const { email, password, displayName } = req.body;

  if (!email || !password || !displayName) {
    return res.status(400).json({ success: false, error: 'Missing required credentials' });
  }

  try {
    const existingUser = await dbGet(`SELECT id FROM users WHERE email = ?`, [email]);
    if (existingUser) {
      return res.status(409).json({ success: false, error: 'Email already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insert user
    const userResult = await dbRun(
      `INSERT INTO users (email, password_hash) VALUES (?, ?)`,
      [email, passwordHash]
    );
    const userId = userResult.lastID;

    // Create profile
    await dbRun(
      `INSERT INTO user_profiles (user_id, display_name) VALUES (?, ?)`,
      [userId, displayName]
    );

    // Seed default habits
    await seedDefaultHabits(userId);

    // Seed initial transaction
    await dbRun(
      `INSERT INTO credit_transactions (user_id, title, change_amount, type) VALUES (?, ?, ?, ?)`,
      [userId, 'Starting Balance bonus', 35, 'earn']
    );

    const token = jwt.sign({ id: userId, email }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ success: true, token, user: { id: userId, email, displayName } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password required' });
  }

  try {
    const user = await dbGet(`SELECT * FROM users WHERE email = ?`, [email]);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const profile = await dbGet(`SELECT display_name FROM user_profiles WHERE user_id = ?`, [user.id]);
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({
      success: true,
      token,
      user: { id: user.id, email: user.email, displayName: profile.display_name }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get profile
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const profile = await dbGet(
      `SELECT display_name as displayName, level, current_xp as currentXp, credit_balance as creditBalance, current_streak as currentStreak FROM user_profiles WHERE user_id = ?`,
      [req.user.id]
    );
    res.status(200).json({ success: true, profile });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ================= HABIT ROUTES =================

// Get all habits
app.get('/api/habits', authenticateToken, async (req, res) => {
  try {
    const habits = await dbAll(
      `SELECT id, title, reward_credits as reward, category, completed_today as completedToday FROM habits WHERE user_id = ?`,
      [req.user.id]
    );
    // Convert sqlite 0/1 to boolean
    const formattedHabits = habits.map(h => ({ ...h, completedToday: h.completedToday === 1 }));
    res.status(200).json({ success: true, habits: formattedHabits });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Add custom habit
app.post('/api/habits', authenticateToken, async (req, res) => {
  const { title, reward } = req.body;

  if (!title || !reward) {
    return res.status(400).json({ success: false, error: 'Title and credit reward values are required' });
  }

  try {
    const result = await dbRun(
      `INSERT INTO habits (user_id, title, reward_credits, xp_reward, category) VALUES (?, ?, ?, ?, ?)`,
      [req.user.id, title, reward, Math.floor(reward * 1.5), 'custom']
    );
    res.status(201).json({
      success: true,
      habit: { id: result.lastID, title, reward, category: 'custom', completedToday: false }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Complete/Uncheck Habit
app.post('/api/habits/:id/complete', authenticateToken, async (req, res) => {
  const habitId = req.params.id;

  try {
    const habit = await dbGet(`SELECT * FROM habits WHERE id = ? AND user_id = ?`, [habitId, req.user.id]);
    if (!habit) return res.status(404).json({ success: false, error: 'Habit not found' });

    const newCompletedState = habit.completed_today === 1 ? 0 : 1;
    const creditsChange = habit.reward_credits;
    const xpChange = habit.xp_reward;

    // Update habit state
    await dbRun(`UPDATE habits SET completed_today = ? WHERE id = ?`, [newCompletedState, habitId]);

    // Update credits and XP
    if (newCompletedState === 1) {
      // Complete -> Earn Credits
      await dbRun(
        `UPDATE user_profiles SET credit_balance = credit_balance + ?, current_xp = current_xp + ? WHERE user_id = ?`,
        [creditsChange, xpChange, req.user.id]
      );
      // Log transaction
      await dbRun(
        `INSERT INTO credit_transactions (user_id, title, change_amount, type) VALUES (?, ?, ?, ?)`,
        [req.user.id, `Completed: ${habit.title}`, creditsChange, 'earn']
      );
    } else {
      // Uncheck -> Deduct Credits
      await dbRun(
        `UPDATE user_profiles SET credit_balance = MAX(0, credit_balance - ?), current_xp = MAX(0, current_xp - ?) WHERE user_id = ?`,
        [creditsChange, xpChange, req.user.id]
      );
      // Log transaction
      await dbRun(
        `INSERT INTO credit_transactions (user_id, title, change_amount, type) VALUES (?, ?, ?, ?)`,
        [req.user.id, `Unchecked: ${habit.title}`, creditsChange, 'spend']
      );
    }

    // Refresh XP leveling
    const profile = await dbGet(`SELECT current_xp, level FROM user_profiles WHERE user_id = ?`, [req.user.id]);
    let currentLevel = profile.level;
    let currentXp = profile.current_xp;

    while (currentXp >= 100) {
      currentLevel += 1;
      currentXp -= 100;
    }
    await dbRun(`UPDATE user_profiles SET level = ?, current_xp = ? WHERE user_id = ?`, [currentLevel, currentXp, req.user.id]);

    const updatedProfile = await dbGet(
      `SELECT display_name as displayName, level, current_xp as currentXp, credit_balance as creditBalance FROM user_profiles WHERE user_id = ?`,
      [req.user.id]
    );

    res.status(200).json({
      success: true,
      completedToday: newCompletedState === 1,
      profile: updatedProfile
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ================= REWARD SHOP / GATEWAY ROUTES =================

// Get Unlocks & Status
app.get('/api/rewards/active', authenticateToken, async (req, res) => {
  try {
    const activeUnlocks = await dbAll(
      `SELECT app_identifier as appIdentifier, duration_minutes as duration, expires_at as expiresAt 
       FROM unlocked_sessions 
       WHERE user_id = ? AND expires_at > datetime('now')`,
      [req.user.id]
    );
    res.status(200).json({ success: true, activeUnlocks });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Unlock Reward / Spend Credits
app.post('/api/rewards/unlock', authenticateToken, async (req, res) => {
  const { appIdentifier, cost, durationMinutes, title } = req.body;

  if (!appIdentifier || !cost || !durationMinutes || !title) {
    return res.status(400).json({ success: false, error: 'Missing app unlock fields' });
  }

  try {
    const profile = await dbGet(`SELECT credit_balance FROM user_profiles WHERE user_id = ?`, [req.user.id]);
    if (profile.credit_balance < cost) {
      return res.status(400).json({ success: false, error: 'INSUFFICIENT_CREDITS', message: 'Insufficient focus credits' });
    }

    const expiresAt = new Date(Date.now() + durationMinutes * 60 * 1000).toISOString().replace('T', ' ').substring(0, 19);

    // Deduct credits
    await dbRun(
      `UPDATE user_profiles SET credit_balance = credit_balance - ? WHERE user_id = ?`,
      [cost, req.user.id]
    );

    // Record Unlock
    await dbRun(
      `INSERT INTO unlocked_sessions (user_id, app_identifier, duration_minutes, cost_credits, expires_at) VALUES (?, ?, ?, ?, ?)`,
      [req.user.id, appIdentifier, durationMinutes, cost, expiresAt]
    );

    // Log Transaction Ledger
    await dbRun(
      `INSERT INTO credit_transactions (user_id, title, change_amount, type) VALUES (?, ?, ?, ?)`,
      [req.user.id, `Unlocked: ${title}`, cost, 'spend']
    );

    const updatedProfile = await dbGet(
      `SELECT credit_balance as creditBalance FROM user_profiles WHERE user_id = ?`,
      [req.user.id]
    );

    res.status(200).json({
      success: true,
      expiresAt,
      profile: updatedProfile
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ================= POMODORO TIMER ROUTES =================

// Complete Focus Session
app.post('/api/focus/complete', authenticateToken, async (req, res) => {
  const creditsEarned = 15;
  const xpEarned = 30;

  try {
    // Award credits
    await dbRun(
      `UPDATE user_profiles SET credit_balance = credit_balance + ?, current_xp = current_xp + ? WHERE user_id = ?`,
      [creditsEarned, xpEarned, req.user.id]
    );

    // Log transaction
    await dbRun(
      `INSERT INTO credit_transactions (user_id, title, change_amount, type) VALUES (?, ?, ?, ?)`,
      [req.user.id, 'Completed Focus Session', creditsEarned, 'earn']
    );

    // Refresh Leveling
    const profile = await dbGet(`SELECT current_xp, level FROM user_profiles WHERE user_id = ?`, [req.user.id]);
    let currentLevel = profile.level;
    let currentXp = profile.current_xp;

    while (currentXp >= 100) {
      currentLevel += 1;
      currentXp -= 100;
    }
    await dbRun(`UPDATE user_profiles SET level = ?, current_xp = ? WHERE user_id = ?`, [currentLevel, currentXp, req.user.id]);

    const updatedProfile = await dbGet(
      `SELECT display_name as displayName, level, current_xp as currentXp, credit_balance as creditBalance FROM user_profiles WHERE user_id = ?`,
      [req.user.id]
    );

    res.status(200).json({
      success: true,
      creditsEarned,
      xpEarned,
      profile: updatedProfile
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ================= TRANSACTION LOGS =================

app.get('/api/transactions', authenticateToken, async (req, res) => {
  try {
    const transactions = await dbAll(
      `SELECT id, title, change_amount as change, type, timestamp FROM credit_transactions WHERE user_id = ? ORDER BY id DESC LIMIT 10`,
      [req.user.id]
    );
    res.status(200).json({ success: true, transactions });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`FocusFlow Backend running on port ${PORT}`);
});
