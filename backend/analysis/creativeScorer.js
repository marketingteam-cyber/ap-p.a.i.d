const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const FATIGUE_FREQUENCY_THRESHOLD = 3.0;
const WINNING_CTR_THRESHOLD = 2.5;
const FAILING_CPL_SPIKE_THRESHOLD = 1.4;

async function scoreCreatives(creatives, averageCPL) {
  const prescored = creatives.map(c => {
    let score = 'neutral';
    if (c.frequency >= FATIGUE_FREQUENCY_THRESHOLD) score = 'fatigue';
    else if (c.ctr >= WINNING_CTR_THRESHOLD && c.cpl <= averageCPL * 0.9) score = 'winning';
    else if (c.cpl >= averageCPL * FAILING_CPL_SPIKE_THRESHOLD) score = 'failing';
    return { ...c, score };
  });

  const sample = prescored.slice(0, 20);
  const prompt = `You are an expert paid advertising analyst for an Indian fintech/wealth management company (AssetPlus).

Analyse these ad creatives and return a JSON array. For each creative provide:
- "ad_id": the original ad_id
- "score": "winning" | "failing" | "fatigue" | "neutral"
- "score_reason": one sharp sentence explaining why (max 15 words, data-driven)
- "recommendation": one specific action (max 20 words)

Creatives data:
${JSON.stringify(sample.map(c => ({
    ad_id: c.ad_id,
    ad_name: c.ad_name,
    channel: c.channel,
    cpl: c.cpl,
    ctr: c.ctr,
    frequency: c.frequency,
    impressions: c.impressions,
    spend: c.spend,
    score: c.score,
  })), null, 2)}

Average CPL benchmark: Rs.${averageCPL?.toFixed(2) || 'unknown'}

Return ONLY a valid JSON array. No markdown, no explanation outside the JSON.`;

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    });
    const responseText = message.content[0].text
      .trim()
      .replace(/^```json\s*/i, '')
      .replace(/```\s*$/i, '');
    const scored = JSON.parse(responseText);
    const claudeMap = Object.fromEntries(scored.map(s => [s.ad_id, s]));
    return prescored.map(c => ({ ...c, ...(claudeMap[c.ad_id] || {}) }));
  } catch (err) {
    console.error('Claude scoring error:', err.message);
    return prescored;
  }
}

module.exports = { scoreCreatives };
