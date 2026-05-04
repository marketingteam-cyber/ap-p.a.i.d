const { fetchWindsorData, fetchAdCreatives } = require('../connectors/windsor');
const { fetchAllCompetitors } = require('../connectors/metaAdLibrary');
const { scoreCreatives } = require('../analysis/creativeScorer');
const { analyseCompetitorAds, generateDailyIntelligence } = require('../analysis/competitorIntel');
const db = require('../db/database');

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
    // STEP 1: Windsor.ai channel + creative data
    console.log('[P.A.I.D] Fetching Windsor.ai data...');
    const channelData = await fetchWindsorData(sevenDaysAgo, today);
    const creativeData = await fetchAdCreatives(sevenDaysAgo, today);
    windsorStatus = 'success';

    // Clear today's channel snapshots before re-inserting (idempotent refresh)
    for (const channel of Object.keys(channelData)) {
      await db.query(
        `DELETE FROM channel_snapshots WHERE snapshot_date = $1 AND channel = $2`,
        [today, channel]
      );
      for (const row of channelData[channel]) {
        await db.query(`
          INSERT INTO channel_snapshots
            (snapshot_date, channel, campaign_id, campaign_name, impressions, reach, clicks,
             spend, cpl, cpc, ctr, frequency, leads)
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
        `, [
          today, channel, row.campaign_id, row.campaign,
          row.impressions, row.reach, row.clicks, row.spend,
          row.cpl, row.cpc, row.ctr, row.frequency, row.leads,
        ]);
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

    // Clear today's creative snapshots before re-inserting
    await db.query(`DELETE FROM creative_snapshots WHERE snapshot_date = $1`, [today]);
    for (const c of scoredCreatives) {
      await db.query(`
        INSERT INTO creative_snapshots
          (snapshot_date, channel, campaign_id, ad_id, ad_name, format,
           cpl, ctr, frequency, impressions, spend, score, score_reason)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
      `, [
        today, c.channel, c.campaign_id, c.ad_id, c.ad_name,
        c.format || 'unknown', c.cpl, c.ctr, c.frequency,
        c.impressions, c.spend, c.score, c.score_reason,
      ]);
      recordsUpdated++;
    }

    // STEP 3: Meta Ad Library competitors
    console.log('[P.A.I.D] Fetching competitor ads...');
    const competitorAds = await fetchAllCompetitors();
    metaStatus = 'success';

    for (const ad of competitorAds) {
      await db.query(`
        INSERT INTO competitor_ads
          (fetched_date, competitor_name, ad_id, page_name, ad_creative_body,
           ad_creative_link_title, call_to_action_type, ad_snapshot_url,
           ad_delivery_start_time, ad_delivery_stop_time, estimated_run_days,
           impressions_lower, impressions_upper, spend_lower, spend_upper,
           is_active, last_seen)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,NOW())
        ON CONFLICT (ad_id) DO UPDATE SET
          last_seen  = NOW(),
          is_active  = EXCLUDED.is_active,
          fetched_date = EXCLUDED.fetched_date
      `, [
        today, ad.competitor_name, ad.ad_id, ad.page_name,
        ad.ad_creative_body, ad.ad_creative_link_title, ad.call_to_action_type,
        ad.ad_snapshot_url, ad.ad_delivery_start_time, ad.ad_delivery_stop_time,
        ad.estimated_run_days, ad.impressions_lower, ad.impressions_upper,
        ad.spend_lower, ad.spend_upper, ad.is_active,
      ]);
      recordsUpdated++;
    }

    // STEP 4: Claude competitor analysis
    const competitors = [...new Set(competitorAds.map(a => a.competitor_name))];
    for (const competitor of competitors) {
      const ads = competitorAds.filter(a => a.competitor_name === competitor);
      const intel = await analyseCompetitorAds(competitor, ads);
      if (intel) {
        await db.query(`
          UPDATE competitor_ads
          SET messaging_theme = $1, claude_analysis = $2, dominant_format = $3
          WHERE competitor_name = $4 AND fetched_date = $5
        `, [intel.messaging_theme, JSON.stringify(intel), intel.dominant_format, competitor, today]);
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
      await db.query(`
        INSERT INTO daily_intelligence
          (report_date, summary, top_insight, creative_recommendation, competitor_watch)
        VALUES ($1,$2,$3,$4,$5)
        ON CONFLICT (report_date) DO UPDATE SET
          summary                 = EXCLUDED.summary,
          top_insight             = EXCLUDED.top_insight,
          creative_recommendation = EXCLUDED.creative_recommendation,
          competitor_watch        = EXCLUDED.competitor_watch,
          generated_at            = NOW()
      `, [
        today, dailyIntel.summary, dailyIntel.top_insight,
        dailyIntel.creative_recommendation, dailyIntel.competitor_watch,
      ]);
    }

    // STEP 6: Log success
    const duration = Date.now() - startTime;
    await db.query(`
      INSERT INTO refresh_log
        (refresh_date, status, windsor_status, meta_library_status,
         claude_analysis_status, records_updated, duration_ms)
      VALUES ($1,'success',$2,$3,$4,$5,$6)
    `, [today, windsorStatus, metaStatus, claudeStatus, recordsUpdated, duration]);
    console.log(`[P.A.I.D] Refresh complete. ${recordsUpdated} records in ${duration}ms`);

  } catch (err) {
    errorMessage = err.message;
    console.error('[P.A.I.D] Refresh FAILED:', err);
    await db.query(`
      INSERT INTO refresh_log
        (refresh_date, status, windsor_status, meta_library_status,
         claude_analysis_status, error_message, duration_ms)
      VALUES ($1,'failed',$2,$3,$4,$5,$6)
    `, [today, windsorStatus, metaStatus, claudeStatus, errorMessage, Date.now() - startTime]);
  }
}

module.exports = { runDailyRefresh };
