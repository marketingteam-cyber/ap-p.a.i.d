const express = require('express');
const bcrypt = require('bcrypt');

const router = express.Router();

const HASH_ROUNDS = 10;
let passwordHash = null;

async function getPasswordHash() {
  if (!passwordHash) {
    const pw = process.env.DASHBOARD_PASSWORD || 'changeme';
    passwordHash = await bcrypt.hash(pw, HASH_ROUNDS);
  }
  return passwordHash;
}

router.post('/login', async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ error: 'Password required' });
    }

    const plain = process.env.DASHBOARD_PASSWORD || 'changeme';
    const match = password === plain;

    if (!match) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    req.session.authenticated = true;
    req.session.loginTime = new Date().toISOString();
    return res.json({ success: true });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.clearCookie('connect.sid');
    return res.json({ success: true });
  });
});

router.get('/status', (req, res) => {
  return res.json({ authenticated: !!(req.session && req.session.authenticated) });
});

module.exports = router;
