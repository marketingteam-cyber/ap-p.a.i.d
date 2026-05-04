const express = require('express');
const db = require('../db/database');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];

    const [
      { rows: [intelligence] },
      { rows: channelKpis },
      { rows: [fatigueRisk] },
      { rows: cplTrend },
      { rows: impressionsTrend },
      { rows: [lastRefresh] },
    ] = await Promise.all([
      db.query(`SELECT * FROM daily_intelligence ORDER BY report_date DESC LIMIT 1`),

      db.query(`
        SELECT
          channel,
          SUM(spend)       AS total_spend,
          AVG(cpl)         AS avg_cpl,
          AVG(ctr)         AS avg_ctr,
          SUM(impressions) AS total_impressions,
          SUM(reach)       AS total_reach,
          AVG(frequency)   AS avg_frequency,
          SUM(leads)       AS total_leads,
          SUM(clicks)      AS total_clicks,
          AVG(cpc)         AS avg_cpc
        FROM channel_snapshots
        WHERE snapshot_date >= CURRENT_DATE - INTERVAL '7 days'
        GROUP BY channel
      `),

      db.query(`
        SELECT COUNT(DISTINCT ad_id) AS count
        FROM creative_snapshots
        WHERE frequency >= 3.0
          AND snapshot_date = (SELECT MAX(snapshot_date) FROM creative_snapshots)
      `),

      db.query(`
        SELECT snapshot_date AS date, channel, AVG(cpl) AS avg_cpl
        FROM channel_snapshots
        WHERE snapshot_date >= $1
        GROUP BY snapshot_date, channel
        ORDER BY snapshot_date ASC
      `, [thirtyDaysAgo]),

      db.query(`
        SELECT snapshot_date AS date, channel,
               SUM(impressions) AS impressions,
               SUM(reach)       AS reach
        FROM channel_snapshots
        WHERE snapshot_date >= CURRENT_DATE - INTERVAL '7 days'
        GROUP BY snapshot_date, channel
        ORDER BY snapshot_date ASC
      `),

      db.query(`SELECT * FROM refresh_log ORDER BY created_at DESC LIMIT 1`),
    ]);

    // JS-side aggregation (pg returns numeric columns as strings)
    const n = (v) => Number(v || 0);
    const totals = channelKpis.reduce((acc, ch) => ({
      total_spend:        acc.total_spend        + n(ch.total_spend),
      total_impressions:  acc.total_impressions  + n(ch.total_impressions),
      total_leads:        acc.total_leads        + n(ch.total_leads),
      total_clicks:       acc.total_clicks       + n(ch.total_clicks),
    }), { total_spend: 0, total_impressions: 0, total_leads: 0, total_clicks: 0 });

    const withCPL = channelKpis.filter(c => c.avg_cpl);
    const avgCPL  = withCPL.length ? withCPL.reduce((s, c) => s + n(c.avg_cpl), 0) / withCPL.length : 0;
    const withCTR = channelKpis.filter(c => c.avg_ctr);
    const avgCTR  = withCTR.length ? withCTR.reduce((s, c) => s + n(c.avg_ctr), 0) / withCTR.length : 0;

    return res.json({
      intelligence,
      kpis: {
        ...totals,
        avg_cpl:            avgCPL,
        avg_ctr:            avgCTR,
        fatigue_risk_count: n(fatigueRisk?.count),
      },
      channel_breakdown:  channelKpis,
      cpl_trend:          cplTrend,
      impressions_trend:  impressionsTrend,
      last_refresh:       lastRefresh,
    });
  } catch (err) {
    console.error('Overview route error:', err);
    return res.status(500).json({ error: 'Failed to fetch overview data' });
  }
});

module.exports = router;
