require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');
const db = require('./db/database');

const authRouter = require('./routes/auth');
const overviewRouter = require('./routes/overview');
const myAdsRouter = require('./routes/myAds');
const competitorsRouter = require('./routes/competitors');
const creativesRouter = require('./routes/creatives');
const metaAdsRouter = require('./routes/metaAds');
const { requireAuth } = require('./middleware/auth');
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
app.use(cookieParser());

// Auth routes (public)
app.use('/api/auth', authRouter);

// Protected API routes
app.use('/api/overview',    requireAuth, overviewRouter);
app.use('/api/my-ads',      requireAuth, myAdsRouter);
app.use('/api/competitors', requireAuth, competitorsRouter);
app.use('/api/creatives',   requireAuth, creativesRouter);
app.use('/api/meta-ads',    requireAuth, metaAdsRouter);

// Refresh status
app.get('/api/refresh/status', requireAuth, async (req, res) => {
  try {
    const { rows: [last] } = await db.query(
      `SELECT * FROM refresh_log ORDER BY created_at DESC LIMIT 1`
    );
    const now = new Date();
    const next = new Date();
    next.setUTCHours(2, 30, 0, 0);
    if (next <= now) next.setUTCDate(next.getUTCDate() + 1);
    return res.json({ last_refresh: last, next_refresh: next.toISOString() });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to get refresh status' });
  }
});

// Manual refresh trigger (auth required)
app.post('/api/refresh/trigger', requireAuth, (req, res) => {
  res.json({ message: 'Refresh triggered', status: 'running' });
  runDailyRefresh().catch(err => console.error('Manual refresh error:', err));
});

// Cron trigger endpoint — called by Vercel Cron or external scheduler
app.get('/api/refresh/cron', (req, res) => {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.query.secret !== secret) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  res.json({ message: 'Cron refresh started' });
  runDailyRefresh().catch(err => console.error('Cron refresh error:', err));
});

// Serve frontend in production (non-Vercel)
if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  });
}

// Local dev only — Vercel handles serving in production
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`[P.A.I.D] Server running on port ${PORT}`);
  });
}

module.exports = app;
