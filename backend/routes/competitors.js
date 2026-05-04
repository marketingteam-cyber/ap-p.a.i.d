const express = require('express');
const db = require('../db/database');

const router = express.Router();

router.get('/', (req, res) => {
  try {
    const { competitor } = req.query;
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];

    // Competitor summaries
    const summaries = db.prepare(`
      SELECT
        competitor_name,
        COUNT(*) as total_ads,
        SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_ads,
        MAX(fetched_date) as last_fetched,
        MAX(claude_analysis) as latest_analysis,
        MAX(messaging_theme) as messaging_theme,
        MAX(dominant_format) as dominant_format
      FROM competitor_ads
      GROUP BY competitor_name
      ORDER BY active_ads DESC
    `).all();

    // Gallery of ads
    let adsQuery = `
      SELECT *,
        CASE WHEN first_seen >= ? THEN 1 ELSE 0 END as is_new
      FROM competitor_ads
      WHERE 1=1
    `;
    const params = [sevenDaysAgo];

    if (competitor && competitor !== 'all') {
      adsQuery += ' AND competitor_name = ?';
      params.push(competitor);
    }
    adsQuery += ' ORDER BY first_seen DESC LIMIT 100';

    const ads = db.prepare(adsQuery).all(...params);

    // Parse claude_analysis JSON for each summary
    const processedSummaries = summaries.map(s => {
      let analysis = null;
      try {
        if (s.latest_analysis) {
          analysis = JSON.parse(s.latest_analysis);
        }
      } catch (_) {}
      return { ...s, analysis };
    });

    return res.json({
      summaries: processedSummaries,
      ads,
    });
  } catch (err) {
    console.error('Competitors route error:', err);
    return res.status(500).json({ error: 'Failed to fetch competitor data' });
  }
});

module.exports = router;
