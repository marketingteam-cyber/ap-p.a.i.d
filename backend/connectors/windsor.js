const axios = require('axios');

const WINDSOR_BASE = 'https://connectors.windsor.ai/all';

async function fetchWindsorData(startDate, endDate) {
  const channels = ['google_ads', 'facebook_ads', 'linkedin_ads'];
  const results = {};
  const fields = [
    'campaign', 'campaign_id', 'channel', 'date',
    'impressions', 'reach', 'clicks', 'spend',
    'leads', 'cpl', 'cpc', 'ctr', 'frequency',
  ].join(',');

  for (const channel of channels) {
    try {
      const response = await axios.get(WINDSOR_BASE, {
        params: {
          api_key: process.env.WINDSOR_API_KEY,
          date_from: startDate,
          date_to: endDate,
          fields,
          connector: channel,
        },
        timeout: 30000,
      });
      results[channel] = response.data?.data || [];
    } catch (err) {
      console.error(`Windsor connector error for ${channel}:`, err.message);
      results[channel] = [];
    }
  }
  return results;
}

async function fetchAdCreatives(startDate, endDate) {
  const fields = [
    'ad_id', 'ad_name', 'campaign', 'campaign_id', 'channel',
    'impressions', 'clicks', 'spend', 'cpl', 'ctr', 'frequency', 'leads',
  ].join(',');
  const channels = ['facebook_ads', 'google_ads', 'linkedin_ads'];
  const results = [];

  for (const channel of channels) {
    try {
      const response = await axios.get(WINDSOR_BASE, {
        params: {
          api_key: process.env.WINDSOR_API_KEY,
          date_from: startDate,
          date_to: endDate,
          fields,
          connector: channel,
          level: 'ad',
        },
        timeout: 30000,
      });
      const ads = (response.data?.data || []).map(ad => ({ ...ad, channel }));
      results.push(...ads);
    } catch (err) {
      console.error(`Windsor creative fetch error for ${channel}:`, err.message);
    }
  }
  return results;
}

module.exports = { fetchWindsorData, fetchAdCreatives };
