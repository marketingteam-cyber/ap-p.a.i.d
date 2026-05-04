const express = require('express');
const db = require('../db/database');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { channel, days = 7 } = req.query;
    const daysAgo = new Date(Date.now() - Number(days) * 86400000).toISOString().split('T')[0];

    // Build optional channel filter — parameterized to avoid injection
    const channelFilter  = (channel && channel !== 'all') ? `AND channel = $2`       : '';
    const csChannelFilter = (channel && channel !== 'all') ? `AND cs.channel = $2`   : '';
    const baseParams     = (channel && channel !== 'all') ? [daysAgo, channel]       : [daysAgo];

    const [
      { rows: campaigns },
      { rows: fatigueData },
      { rows: creatives },
    ] = await Promise.all([
      db.query(`
        SELECT
          campaign_id,
          campaign_name,
          channel,
          SUM(spend)       AS total_spend,
          AVG(cpl)         AS avg_cpl,
          AVG(cpc)         AS avg_cpc,
          AVG(ctr)         AS avg_ctr,
          SUM(impressions) AS total_impressions,
          AVG(frequency)   AS avg_frequency,
          SUM(leads)       AS total_leads,
          MAX(snapshot_date) AS last_date
        FROM channel_snapshots
        WHERE snapshot_date >= $1 ${channelFilter}
        GROUP BY campaign_id, campaign_name, channel
        ORDER BY total_spend DESC
      `, baseParams),

      db.query(`
        SELECT
          campaign_id,
          campaign_name,
          AVG(frequency)   AS avg_frequency,
          SUM(impressions) AS total_impressions,
          AVG(cpl)         AS avg_cpl,
          MAX(snapshot_date) AS last_date
        FROM channel_snapshots
        WHERE channel = 'facebook_ads' AND snapshot_date >= $1
        GROUP BY campaign_id, campaign_name
        ORDER BY avg_frequency DESC
      `, [daysAgo]),

      db.query(`
        WITH ranked AS (
          SELECT cs.*,
            ROW_NUMBER() OVER (
              PARTITION BY cs.campaign_id
              ORDER BY cs.snapshot_date DESC
            ) AS rn
          FROM creative_snapshots cs
          WHERE cs.snapshot_date >= $1 ${csChannelFilter}
        )
        SELECT * FROM ranked WHERE rn = 1
      `, baseParams),
    ]);

    return res.json({ campaigns, fatigue_data: fatigueData, creatives });
  } catch (err) {
    console.error('My Ads route error:', err);
    return res.status(500).json({ error: 'Failed to fetch my ads data' });
  }
});

module.exports = router;
