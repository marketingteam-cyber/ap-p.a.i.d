const express = require('express');
const db = require('../db/database');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const daysAgo = new Date(Date.now() - Number(days) * 86400000).toISOString().split('T')[0];
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];

    const [
      { rows: [kpis] },
      { rows: trend },
      { rows: campaigns },
      { rows: creatives },
      { rows: [intel] },
    ] = await Promise.all([
      db.query(`
        SELECT
          SUM(spend)               AS total_spend,
          AVG(NULLIF(cpl,0))       AS avg_cpl,
          AVG(NULLIF(ctr,0))       AS avg_ctr,
          SUM(reach)               AS total_reach,
          AVG(NULLIF(frequency,0)) AS avg_frequency,
          SUM(leads)               AS total_leads,
          SUM(impressions)         AS total_impressions,
          SUM(clicks)              AS total_clicks
        FROM channel_snapshots
        WHERE channel = 'facebook_ads' AND snapshot_date >= $1
      `, [sevenDaysAgo]),

      db.query(`
        SELECT
          snapshot_date            AS date,
          SUM(spend)               AS spend,
          AVG(NULLIF(cpl,0))       AS avg_cpl,
          SUM(impressions)         AS impressions,
          SUM(reach)               AS reach,
          AVG(NULLIF(frequency,0)) AS avg_frequency
        FROM channel_snapshots
        WHERE channel = 'facebook_ads' AND snapshot_date >= $1
        GROUP BY snapshot_date
        ORDER BY snapshot_date
      `, [daysAgo]),

      db.query(`
        SELECT
          campaign_id,
          MAX(campaign_name)       AS campaign_name,
          SUM(spend)               AS total_spend,
          AVG(NULLIF(cpl,0))       AS avg_cpl,
          AVG(NULLIF(ctr,0))       AS avg_ctr,
          SUM(reach)               AS total_reach,
          AVG(NULLIF(frequency,0)) AS avg_frequency,
          SUM(leads)               AS total_leads,
          SUM(impressions)         AS total_impressions,
          SUM(clicks)              AS total_clicks
        FROM channel_snapshots
        WHERE channel = 'facebook_ads' AND snapshot_date >= $1
        GROUP BY campaign_id
        ORDER BY total_spend DESC
        LIMIT 25
      `, [daysAgo]),

      db.query(`
        SELECT *
        FROM creative_snapshots
        WHERE channel = 'facebook_ads' AND snapshot_date >= $1
        ORDER BY spend DESC NULLS LAST
        LIMIT 20
      `, [sevenDaysAgo]),

      db.query(`SELECT summary, top_insight FROM daily_intelligence ORDER BY report_date DESC LIMIT 1`),
    ]);

    return res.json({ kpis, trend, campaigns, creatives, intelligence: intel || null });
  } catch (err) {
    console.error('Meta Ads route error:', err);
    return res.status(500).json({ error: 'Failed to fetch Meta Ads data' });
  }
});

module.exports = router;
