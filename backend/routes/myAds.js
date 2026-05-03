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

    // Campaign-level data
    const campaigns = db.prepare(`
      SELECT
        campaign_id,
        campaign_name,
        channel,
        SUM(spend) as total_spend,
        AVG(cpl) as avg_cpl,
        AVG(cpc) as avg_cpc,
        AVG(ctr) as avg_ctr,
        SUM(impressions) as total_impressions,
        AVG(frequency) as avg_frequency,
        SUM(leads) as total_leads,
        MAX(snapshot_date) as last_date
      FROM channel_snapshots
      WHERE snapshot_date >= ? ${channelFilter}
      GROUP BY campaign_id, campaign_name, channel
      ORDER BY total_spend DESC
    `).all(...params);

    // Fatigue heatmap data (Meta only)
    const fatigueData = db.prepare(`
      SELECT
        campaign_id,
        campaign_name,
        AVG(frequency) as avg_frequency,
        SUM(impressions) as total_impressions,
        AVG(cpl) as avg_cpl,
        MAX(snapshot_date) as last_date
      FROM channel_snapshots
      WHERE channel = 'facebook_ads' AND snapshot_date >= ?
      GROUP BY campaign_id, campaign_name
      ORDER BY avg_frequency DESC
    `).all(daysAgo);

    // Creative-level data
    const creatives = db.prepare(`
      SELECT
        cs.*,
        ROW_NUMBER() OVER (PARTITION BY cs.campaign_id ORDER BY cs.snapshot_date DESC) as rn
      FROM creative_snapshots cs
      WHERE cs.snapshot_date >= ? ${channelFilter ? channelFilter.replace('channel', 'cs.channel') : ''}
    `).all(...params);

    return res.json({
      campaigns,
      fatigue_data: fatigueData,
      creatives: creatives.filter(c => c.rn === 1),
    });
  } catch (err) {
    console.error('My Ads route error:', err);
    return res.status(500).json({ error: 'Failed to fetch my ads data' });
  }
});

module.exports = router;
