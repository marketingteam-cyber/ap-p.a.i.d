const jwt = require('jsonwebtoken');

function requireAuth(req, res, next) {
  const token = req.cookies?.paid_token;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    jwt.verify(token, process.env.SESSION_SECRET || 'dev-secret-change-me');
    return next();
  } catch {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

module.exports = { requireAuth };
