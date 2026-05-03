const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function analyseCompetitorAds(competitorName, ads) {
  if (!ads || ads.length === 0) return null;

  const prompt = `You are a paid ads strategist analysing competitor ads for an Indian fintech company (AssetPlus).

Competitor: ${competitorName}
Number of active ads: ${ads.length}

Ad copy samples:
${ads.slice(0, 10).map((a, i) =>
    `${i + 1}. CTA: ${a.call_to_action_type || 'N/A'} | Headline: ${a.ad_creative_link_title || 'N/A'} | Body: ${(a.ad_creative_body || '').slice(0, 200)}`
  ).join('\n')}

Return a JSON object with:
- "dominant_format": "video" | "static" | "carousel" | "lead_form"
- "messaging_theme": 3-5 word description of their core message hook
- "hook_pattern": emotional/logical hook being used
- "offer_type": primary CTA or offer
- "longevity_signal": "high" | "medium" | "low"
- "threat_level": "high" | "medium" | "low"
- "steal_this": one specific tactic AssetPlus should consider borrowing (max 20 words)

Return ONLY valid JSON. No markdown.`;

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }],
    });
    return JSON.parse(
      message.content[0].text.trim().replace(/^```json\s*/i, '').replace(/```\s*$/i, '')
    );
  } catch (err) {
    console.error(`Competitor intel error for ${competitorName}:`, err.message);
    return null;
  }
}

async function generateDailyIntelligence(channelData, competitorData, scoredCreatives) {
  const prompt = `You are the head of paid media at AssetPlus (Indian fintech, mutual fund distribution).

Write today's daily intelligence briefing. Be sharp, specific, data-driven. No fluff.

Own performance summary:
${JSON.stringify(channelData, null, 2)}

Top competitor signals:
${competitorData.slice(0, 5).map(c =>
    `${c.competitor_name}: ${c.active_ads} active ads, theme: ${c.messaging_theme || 'unknown'}`
  ).join('\n')}

Creative performance:
- Winning: ${scoredCreatives.filter(c => c.score === 'winning').length} creatives
- Failing: ${scoredCreatives.filter(c => c.score === 'failing').length} creatives
- Fatigue: ${scoredCreatives.filter(c => c.score === 'fatigue').length} creatives

Return JSON with:
- "summary": 2-sentence morning briefing
- "top_insight": single most important finding (1 sentence, data-specific)
- "creative_recommendation": #1 creative action to take today (1 sentence)
- "competitor_watch": competitor to watch most closely today and why (1 sentence)

Return ONLY valid JSON.`;

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 600,
      messages: [{ role: 'user', content: prompt }],
    });
    return JSON.parse(
      message.content[0].text.trim().replace(/^```json\s*/i, '').replace(/```\s*$/i, '')
    );
  } catch (err) {
    console.error('Daily intelligence generation error:', err.message);
    return null;
  }
}

module.exports = { analyseCompetitorAds, generateDailyIntelligence };
