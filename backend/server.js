require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');

const { requireAuth } = require('./middleware/auth');
const { startScheduler } = require('./scheduler/dailyRefresh');

const authRouter = require('./routes/auth');
const overviewRouter = require('./routes/overview');
const myAdsRouter = require('./routes/myAds');
const competitorsRouter = require('./routes/competitors');
const creativesRouter = require('./routes/creatives');

const { runDailyRefresh } = require('./scheduler/dailyRefresh');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? false
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
  },
}));

// Auth routes (no auth required)
app.use('/api/auth', authRouter);

// Protected API routes
app.use('/api/overview', requireAuth, overviewRouter);
app.use('/api/my-ads', requireAuth, myAdsRouter);
app.use('/api/competitors', requireAuth, competitorsRouter);
app.use('/api/creatives', requireAuth, creativesRouter);

// Refresh status and trigger
app.get('/api/refresh/status', requireAuth, (req, res) => {
  try {
    const db = require('./db/database');
    const last = db.prepare('SELECT * FROM refresh_log ORDER BY created_at DESC LIMIT 1').get();
    const now = new Date();
    const next = new Date();
    next.setUTCHours(2, 30, 0, 0);
    if (next <= now) next.setUTCDate(next.getUTCDate() + 1);

    return res.json({
      last_refresh: last,
      next_refresh: next.toISOString(),
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to get refresh status' });
  }
});

app.post('/api/refresh/trigger', requireAuth, async (req, res) => {
  try {
    res.json({ message: 'Refresh triggered', status: 'running' });
    runDailyRefresh().catch(err => console.error('Manual refresh error:', err));
  } catch (err) {
    return res.status(500).json({ error: 'Failed to trigger refresh' });
  }
});

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`[P.A.I.D] Server running on port ${PORT}`);
  startScheduler();
});

module.exports = app;
