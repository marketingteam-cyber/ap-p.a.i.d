const express = require('express');
const db = require('../db/database');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { channel, days = 7 } = req.query;
    const daysAgo = new Date(Date.now() - Number(days) * 86400000).toISOString().split('T')[0];

    const channelFilter = (channel && channel !== 'all') ? `AND cs.channel = $2` : '';
    const params        = (channel && channel !== 'all') ? [daysAgo, channel]    : [daysAgo];

    const scoreQuery = (score) => `
      SELECT cs.*, ch.campaign_name
      FROM creative_snapshots cs
      LEFT JOIN (
        SELECT campaign_id, MAX(campaign_name) AS campaign_name
        FROM channel_snapshots GROUP BY campaign_id
      ) ch ON cs.campaign_id = ch.campaign_id
      WHERE cs.snapshot_date >= $1 ${channelFilter}
        AND cs.score = '${score}'
      ORDER BY cs.spend DESC
      LIMIT 50
    `;

    const [
      { rows: winning },
      { rows: failing },
      { rows: fatigue },
      { rows: stats },
      { rows: [intel] },
    ] = await Promise.all([
      db.query(scoreQuery('winning'), params),
      db.query(scoreQuery('failing'), params),
      db.query(scoreQuery('fatigue'), params),

      db.query(`
        SELECT
          score,
          COUNT(*)  AS count,
          AVG(cpl)  AS avg_cpl,
          AVG(ctr)  AS avg_ctr,
          SUM(spend) AS total_spend
        FROM creative_snapshots
        WHERE snapshot_date >= $1 ${channelFilter}
        GROUP BY score
      `, params),

      db.query(
        `SELECT creative_recommendation FROM daily_intelligence ORDER BY report_date DESC LIMIT 1`
      ),
    ]);

    return res.json({
      winning,
      failing,
      fatigue,
      stats,
      creative_recommendation: intel?.creative_recommendation || null,
    });
  } catch (err) {
    console.error('Creatives route error:', err);
    return res.status(500).json({ error: 'Failed to fetch creatives data' });
  }
});

module.exports = router;
