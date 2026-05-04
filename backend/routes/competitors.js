const express = require('express');
const db = require('../db/database');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { competitor } = req.query;
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];

    // Competitor summaries (all — unfiltered)
    const { rows: summaries } = await db.query(`
      SELECT
        competitor_name,
        COUNT(*)                                    AS total_ads,
        SUM(CASE WHEN is_active THEN 1 ELSE 0 END) AS active_ads,
        MAX(fetched_date)                           AS last_fetched,
        MAX(claude_analysis)                        AS latest_analysis,
        MAX(messaging_theme)                        AS messaging_theme,
        MAX(dominant_format)                        AS dominant_format
      FROM competitor_ads
      GROUP BY competitor_name
      ORDER BY active_ads DESC
    `);

    // Ad gallery — optionally filtered by competitor
    let adsQuery = `
      SELECT *,
        (first_seen::date >= $1) AS is_new
      FROM competitor_ads
      WHERE 1=1
    `;
    const params = [sevenDaysAgo];
    if (competitor && competitor !== 'all') {
      adsQuery += ` AND competitor_name = $2`;
      params.push(competitor);
    }
    adsQuery += ` ORDER BY first_seen DESC LIMIT 100`;

    const { rows: ads } = await db.query(adsQuery, params);

    // Parse claude_analysis JSON for each summary
    const processedSummaries = summaries.map(s => {
      let analysis = null;
      try { if (s.latest_analysis) analysis = JSON.parse(s.latest_analysis); } catch (_) {}
      return { ...s, analysis };
    });

    return res.json({ summaries: processedSummaries, ads });
  } catch (err) {
    console.error('Competitors route error:', err);
    return res.status(500).json({ error: 'Failed to fetch competitor data' });
  }
});

module.exports = router;
