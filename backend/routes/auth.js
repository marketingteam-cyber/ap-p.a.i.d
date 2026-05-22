const express = require('express');
const jwt = require('jsonwebtoken');

const router = express.Router();

function getSecret() {
  return process.env.SESSION_SECRET || 'dev-secret-change-me';
}

router.post('/login', (req, res) => {
  const { password } = req.body;
  if (!password) return res.status(400).json({ error: 'Password required' });

  const expected = process.env.DASHBOARD_PASSWORD || 'changeme';
  if (password !== expected) return res.status(401).json({ error: 'Invalid password' });

  const token = jwt.sign({ authenticated: true }, getSecret(), { expiresIn: '24h' });

  res.cookie('paid_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000,
    path: '/',
  });

  return res.json({ success: true });
});

router.post('/logout', (req, res) => {
  res.clearCookie('paid_token', { path: '/' });
  return res.json({ success: true });
});

router.get('/status', (req, res) => {
  const token = req.cookies?.paid_token;
  if (!token) return res.json({ authenticated: false });
  try {
    jwt.verify(token, getSecret());
    return res.json({ authenticated: true });
  } catch {
    return res.json({ authenticated: false });
  }
});

module.exports = router;
