const express = require('express');
const db = require('../db/database');

const router = express.Router();

router.get('/', (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];

    // Daily intelligence
    const intelligence = db.prepare(`
      SELECT * FROM daily_intelligence ORDER BY report_date DESC LIMIT 1
    `).get();

    // Channel KPIs (last 7 days)
    const channelKpis = db.prepare(`
      SELECT
        channel,
        SUM(spend) as total_spend,
        AVG(cpl) as avg_cpl,
        AVG(ctr) as avg_ctr,
        SUM(impressions) as total_impressions,
        SUM(reach) as total_reach,
        AVG(frequency) as avg_frequency,
        SUM(leads) as total_leads,
        SUM(clicks) as total_clicks,
        AVG(cpc) as avg_cpc
      FROM channel_snapshots
      WHERE snapshot_date >= date('now', '-7 days')
      GROUP BY channel
    `).all();

    // Fatigue risk count
    const fatigueRiskCount = db.prepare(`
      SELECT COUNT(DISTINCT ad_id) as count
      FROM creative_snapshots
      WHERE frequency >= 3.0 AND snapshot_date = (SELECT MAX(snapshot_date) FROM creative_snapshots)
    `).get();

    // CPL trend (30 days)
    const cplTrend = db.prepare(`
      SELECT snapshot_date as date, channel, AVG(cpl) as avg_cpl
      FROM channel_snapshots
      WHERE snapshot_date >= ?
      GROUP BY snapshot_date, channel
      ORDER BY snapshot_date ASC
    `).all(thirtyDaysAgo);

    // Impressions & reach trend (7 days)
    const impressionsTrend = db.prepare(`
      SELECT snapshot_date as date, channel, SUM(impressions) as impressions, SUM(reach) as reach
      FROM channel_snapshots
      WHERE snapshot_date >= date('now', '-7 days')
      GROUP BY snapshot_date, channel
      ORDER BY snapshot_date ASC
    `).all();

    // Last refresh
    const lastRefresh = db.prepare(`
      SELECT * FROM refresh_log ORDER BY created_at DESC LIMIT 1
    `).get();

    // Aggregate KPIs across all channels
    const totals = channelKpis.reduce((acc, ch) => ({
      total_spend: acc.total_spend + (ch.total_spend || 0),
      total_impressions: acc.total_impressions + (ch.total_impressions || 0),
      total_leads: acc.total_leads + (ch.total_leads || 0),
      total_clicks: acc.total_clicks + (ch.total_clicks || 0),
    }), { total_spend: 0, total_impressions: 0, total_leads: 0, total_clicks: 0 });

    const avgCPL = channelKpis.filter(c => c.avg_cpl).length
      ? channelKpis.reduce((s, c) => s + (c.avg_cpl || 0), 0) / channelKpis.filter(c => c.avg_cpl).length
      : 0;
    const avgCTR = channelKpis.filter(c => c.avg_ctr).length
      ? channelKpis.reduce((s, c) => s + (c.avg_ctr || 0), 0) / channelKpis.filter(c => c.avg_ctr).length
      : 0;

    return res.json({
      intelligence,
      kpis: {
        ...totals,
        avg_cpl: avgCPL,
        avg_ctr: avgCTR,
        fatigue_risk_count: fatigueRiskCount?.count || 0,
      },
      channel_breakdown: channelKpis,
      cpl_trend: cplTrend,
      impressions_trend: impressionsTrend,
      last_refresh: lastRefresh,
    });
  } catch (err) {
    console.error('Overview route error:', err);
    return res.status(500).json({ error: 'Failed to fetch overview data' });
  }
});

module.exports = router;
