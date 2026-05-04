const express = require('express');
const db = require('../db/database');

const router = express.Router();

router.get('/', (req, res) => {
  try {
    const { channel, days = 7 } = req.query;
    const daysAgo = new Date(Date.now() - Number(days) * 86400000).toISOString().split('T')[0];

    let channelFilter = '';
    const params = [daysAgo];
    if (channel && channel !== 'all') {
      channelFilter = 'AND channel = ?';
      params.push(channel);
    }

    const baseQuery = (scoreFilter) => `
      SELECT
        cs.*,
        ch.campaign_name
      FROM creative_snapshots cs
      LEFT JOIN (
        SELECT campaign_id, MAX(campaign_name) as campaign_name
        FROM channel_snapshots GROUP BY campaign_id
      ) ch ON cs.campaign_id = ch.campaign_id
      WHERE cs.snapshot_date >= ? ${channelFilter}
        AND cs.score = '${scoreFilter}'
      ORDER BY cs.spend DESC
      LIMIT 50
    `;

    const winning = db.prepare(baseQuery('winning')).all(...params);
    const failing = db.prepare(baseQuery('failing')).all(...params);
    const fatigue = db.prepare(baseQuery('fatigue')).all(...params);
    const neutral = db.prepare(baseQuery('neutral')).all(...params);

    // Stats
    const stats = db.prepare(`
      SELECT
        score,
        COUNT(*) as count,
        AVG(cpl) as avg_cpl,
        AVG(ctr) as avg_ctr,
        SUM(spend) as total_spend
      FROM creative_snapshots
      WHERE snapshot_date >= ? ${channelFilter}
      GROUP BY score
    `).all(...params);

    // Latest daily intel recommendation
    const intel = db.prepare(`
      SELECT creative_recommendation FROM daily_intelligence ORDER BY report_date DESC LIMIT 1
    `).get();

    return res.json({
      winning,
      failing,
      fatigue,
      neutral,
      stats,
      creative_recommendation: intel?.creative_recommendation || null,
    });
  } catch (err) {
    console.error('Creatives route error:', err);
    return res.status(500).json({ error: 'Failed to fetch creatives data' });
  }
});

module.exports = router;
