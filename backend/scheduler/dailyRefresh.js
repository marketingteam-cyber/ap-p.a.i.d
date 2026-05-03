const cron = require('node-cron');
const { fetchWindsorData, fetchAdCreatives } = require('../connectors/windsor');
const { fetchAllCompetitors } = require('../connectors/metaAdLibrary');
const { scoreCreatives } = require('../analysis/creativeScorer');
const { analyseCompetitorAds, generateDailyIntelligence } = require('../analysis/competitorIntel');
const db = require('../db/database');

const CRON_SCHEDULE = process.env.REFRESH_CRON || '30 2 * * *';

async function runDailyRefresh() {
  const startTime = Date.now();
  const today = new Date().toISOString().split('T')[0];
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];

  console.log(`[P.A.I.D] Starting daily refresh for ${today}...`);
  let windsorStatus = 'pending';
  let metaStatus = 'pending';
  let claudeStatus = 'pending';
  let recordsUpdated = 0;
  let errorMessage = null;

  try {
    // STEP 1: Windsor.ai
    console.log('[P.A.I.D] Fetching Windsor.ai data...');
    const channelData = await fetchWindsorData(sevenDaysAgo, today);
    const creativeData = await fetchAdCreatives(sevenDaysAgo, today);
    windsorStatus = 'success';

    const insertChannel = db.prepare(`
      INSERT OR REPLACE INTO channel_snapshots
        (snapshot_date, channel, campaign_id, campaign_name, impressions, reach, clicks, spend, cpl, cpc, ctr, frequency, leads)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const [channel, rows] of Object.entries(channelData)) {
      for (const row of rows) {
        insertChannel.run(
          today, channel, row.campaign_id, row.campaign,
          row.impressions, row.reach, row.clicks, row.spend,
          row.cpl, row.cpc, row.ctr, row.frequency, row.leads
        );
        recordsUpdated++;
      }
    }

    // STEP 2: Score creatives with Claude
    console.log('[P.A.I.D] Running Claude creative scoring...');
    const allCPLs = creativeData.filter(c => c.cpl).map(c => c.cpl);
    const avgCPL = allCPLs.length
      ? allCPLs.reduce((a, b) => a + b, 0) / allCPLs.length
      : 50;
    const scoredCreatives = await scoreCreatives(creativeData, avgCPL);
    claudeStatus = 'success';

    const insertCreative = db.prepare(`
      INSERT OR REPLACE INTO creative_snapshots
        (snapshot_date, channel, campaign_id, ad_id, ad_name, format, cpl, ctr, frequency, impressions, spend, score, score_reason)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const c of scoredCreatives) {
      insertCreative.run(
        today, c.channel, c.campaign_id, c.ad_id, c.ad_name,
        c.format || 'unknown', c.cpl, c.ctr, c.frequency,
        c.impressions, c.spend, c.score, c.score_reason
      );
      recordsUpdated++;
    }

    // STEP 3: Meta Ad Library competitors
    console.log('[P.A.I.D] Fetching competitor ads...');
    const competitorAds = await fetchAllCompetitors();
    metaStatus = 'success';

    const upsertAd = db.prepare(`
      INSERT INTO competitor_ads
        (fetched_date, competitor_name, ad_id, page_name, ad_creative_body, ad_creative_link_title,
         call_to_action_type, ad_snapshot_url, ad_delivery_start_time, ad_delivery_stop_time,
         estimated_run_days, impressions_lower, impressions_upper, spend_lower, spend_upper, is_active, last_seen)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      ON CONFLICT(ad_id) DO UPDATE SET last_seen=datetime('now'), is_active=excluded.is_active
    `);
    for (const ad of competitorAds) {
      upsertAd.run(
        today, ad.competitor_name, ad.ad_id, ad.page_name,
        ad.ad_creative_body, ad.ad_creative_link_title, ad.call_to_action_type,
        ad.ad_snapshot_url, ad.ad_delivery_start_time, ad.ad_delivery_stop_time,
        ad.estimated_run_days, ad.impressions_lower, ad.impressions_upper,
        ad.spend_lower, ad.spend_upper, ad.is_active
      );
      recordsUpdated++;
    }

    // STEP 4: Claude competitor analysis
    const competitors = [...new Set(competitorAds.map(a => a.competitor_name))];
    const updateAd = db.prepare(`
      UPDATE competitor_ads SET messaging_theme=?, claude_analysis=?
      WHERE competitor_name=? AND fetched_date=?
    `);
    for (const competitor of competitors) {
      const ads = competitorAds.filter(a => a.competitor_name === competitor);
      const intel = await analyseCompetitorAds(competitor, ads);
      if (intel) {
        updateAd.run(intel.messaging_theme, JSON.stringify(intel), competitor, today);
      }
    }

    // STEP 5: Daily intelligence summary
    const channelSummary = Object.entries(channelData).map(([ch, rows]) => ({
      channel: ch,
      total_spend: rows.reduce((s, r) => s + (r.spend || 0), 0).toFixed(2),
      avg_cpl: rows.filter(r => r.cpl).length
        ? (rows.reduce((s, r) => s + (r.cpl || 0), 0) / rows.filter(r => r.cpl).length).toFixed(2)
        : null,
    }));
    const competitorSummary = competitors.map(name => ({
      competitor_name: name,
      active_ads: competitorAds.filter(a => a.competitor_name === name && a.is_active).length,
      messaging_theme: competitorAds.find(a => a.competitor_name === name)?.messaging_theme || 'unknown',
    }));

    const dailyIntel = await generateDailyIntelligence(channelSummary, competitorSummary, scoredCreatives);
    if (dailyIntel) {
      db.prepare(`
        INSERT OR REPLACE INTO daily_intelligence
          (report_date, summary, top_insight, creative_recommendation, competitor_watch)
        VALUES (?, ?, ?, ?, ?)
      `).run(
        today, dailyIntel.summary, dailyIntel.top_insight,
        dailyIntel.creative_recommendation, dailyIntel.competitor_watch
      );
    }

    // STEP 6: Log success
    const duration = Date.now() - startTime;
    db.prepare(`
      INSERT INTO refresh_log
        (refresh_date, status, windsor_status, meta_library_status, claude_analysis_status, records_updated, duration_ms)
      VALUES (?, 'success', ?, ?, ?, ?, ?)
    `).run(today, windsorStatus, metaStatus, claudeStatus, recordsUpdated, duration);
    console.log(`[P.A.I.D] Refresh complete. ${recordsUpdated} records in ${duration}ms`);

  } catch (err) {
    errorMessage = err.message;
    console.error('[P.A.I.D] Refresh FAILED:', err);
    db.prepare(`
      INSERT INTO refresh_log
        (refresh_date, status, windsor_status, meta_library_status, claude_analysis_status, error_message, duration_ms)
      VALUES (?, 'failed', ?, ?, ?, ?, ?)
    `).run(
      today, windsorStatus, metaStatus, claudeStatus,
      errorMessage, Date.now() - startTime
    );
  }
}

function startScheduler() {
  console.log('[P.A.I.D] Scheduler armed. Next refresh: 08:00 AM IST daily');
  cron.schedule(CRON_SCHEDULE, runDailyRefresh, { scheduled: true, timezone: 'UTC' });
}

module.exports = { startScheduler, runDailyRefresh };
