const FREQUENCY_THRESHOLDS = {
  low: 2.0,
  medium: 3.0,
  high: 4.0,
};

function detectFatigue(creatives, averageCPL) {
  return creatives.map(creative => {
    const frequencyScore = creative.frequency || 0;
    const cplDrift = averageCPL > 0 ? (creative.cpl - averageCPL) / averageCPL : 0;

    let fatigueLevel = 'none';
    let fatigueScore = 0;

    if (frequencyScore >= FREQUENCY_THRESHOLDS.high) {
      fatigueLevel = 'critical';
      fatigueScore = 90 + Math.min(10, (frequencyScore - FREQUENCY_THRESHOLDS.high) * 5);
    } else if (frequencyScore >= FREQUENCY_THRESHOLDS.medium) {
      fatigueLevel = 'high';
      fatigueScore = 60 + ((frequencyScore - FREQUENCY_THRESHOLDS.medium) / (FREQUENCY_THRESHOLDS.high - FREQUENCY_THRESHOLDS.medium)) * 30;
    } else if (frequencyScore >= FREQUENCY_THRESHOLDS.low) {
      fatigueLevel = 'medium';
      fatigueScore = 30 + ((frequencyScore - FREQUENCY_THRESHOLDS.low) / (FREQUENCY_THRESHOLDS.medium - FREQUENCY_THRESHOLDS.low)) * 30;
    }

    if (cplDrift > 0.3 && fatigueScore > 0) {
      fatigueScore = Math.min(100, fatigueScore + cplDrift * 20);
    }

    return {
      ...creative,
      fatigue_level: fatigueLevel,
      fatigue_score: Math.round(fatigueScore),
      cpl_drift_pct: Math.round(cplDrift * 100),
    };
  });
}

function getCampaignFatigueRisk(campaignCreatives) {
  const fatigued = campaignCreatives.filter(c => (c.frequency || 0) >= FREQUENCY_THRESHOLDS.medium);
  const ratio = campaignCreatives.length > 0 ? fatigued.length / campaignCreatives.length : 0;

  if (ratio >= 0.6) return 'high';
  if (ratio >= 0.3) return 'medium';
  return 'low';
}

module.exports = { detectFatigue, getCampaignFatigueRisk, FREQUENCY_THRESHOLDS };
