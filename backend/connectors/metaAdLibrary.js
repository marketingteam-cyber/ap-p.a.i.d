const axios = require('axios');

const COMPETITORS = (process.env.COMPETITOR_NAMES || '').split(',').map(s => s.trim());

function getBaseUrl() {
  return `https://graph.facebook.com/${process.env.META_AD_LIBRARY_VERSION || 'v19.0'}/ads_archive`;
}

async function fetchCompetitorAds(competitorName) {
  try {
    const response = await axios.get(getBaseUrl(), {
      params: {
        access_token: process.env.META_ACCESS_TOKEN,
        search_terms: competitorName,
        ad_type: 'ALL',
        ad_reached_countries: '["IN"]',
        fields: [
          'id', 'page_name', 'ad_creative_bodies', 'ad_creative_link_titles',
          'call_to_action_type', 'ad_snapshot_url', 'ad_delivery_start_time',
          'ad_delivery_stop_time', 'impressions', 'spend',
        ].join(','),
        limit: 30,
      },
      timeout: 15000,
    });

    return (response.data?.data || []).map(ad => {
      const startTime = ad.ad_delivery_start_time;
      const stopTime = ad.ad_delivery_stop_time || new Date().toISOString();
      const runDays = startTime
        ? Math.floor((new Date(stopTime) - new Date(startTime)) / 86400000)
        : null;

      return {
        competitor_name: competitorName,
        ad_id: ad.id,
        page_name: ad.page_name,
        ad_creative_body: (ad.ad_creative_bodies || [])[0] || '',
        ad_creative_link_title: (ad.ad_creative_link_titles || [])[0] || '',
        call_to_action_type: ad.call_to_action_type || '',
        ad_snapshot_url: ad.ad_snapshot_url || '',
        ad_delivery_start_time: startTime || '',
        ad_delivery_stop_time: ad.ad_delivery_stop_time || '',
        estimated_run_days: runDays,
        impressions_lower: ad.impressions?.lower_bound || null,
        impressions_upper: ad.impressions?.upper_bound || null,
        spend_lower: ad.spend?.lower_bound || null,
        spend_upper: ad.spend?.upper_bound || null,
        is_active: !ad.ad_delivery_stop_time ? 1 : 0,
      };
    });
  } catch (err) {
    console.error(`Meta Ad Library fetch error for "${competitorName}":`, err.message);
    return [];
  }
}

async function fetchAllCompetitors() {
  const results = [];
  for (const competitor of COMPETITORS) {
    const ads = await fetchCompetitorAds(competitor);
    results.push(...ads);
    await new Promise(r => setTimeout(r, 200));
  }
  return results;
}

module.exports = { fetchAllCompetitors, fetchCompetitorAds };
