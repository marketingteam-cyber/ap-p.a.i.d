export const formatINR = (val) =>
  val != null ? `Rs.${Number(val).toLocaleString('en-IN', { maximumFractionDigits: 2 })}` : '-';

export const formatPct = (val) =>
  val != null ? `${Number(val).toFixed(2)}%` : '-';

export const formatNum = (val) =>
  val != null ? Number(val).toLocaleString('en-IN') : '-';

export const formatDate = (dateStr) =>
  dateStr
    ? new Date(dateStr).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '-';

export const channelLabel = (channel) =>
  ({ google_ads: 'Google', facebook_ads: 'Meta', linkedin_ads: 'LinkedIn' }[channel] || channel);

export const channelColor = (channel) =>
  ({ google_ads: '#4285F4', facebook_ads: '#1A4FBA', linkedin_ads: '#0A66C2' }[channel] || '#6B7291');

export const scoreColor = (score) =>
  ({ winning: '#2A9E52', failing: '#CC2020', fatigue: '#D4880A', neutral: '#6B7291' }[score] || '#6B7291');

export const formatRelativeTime = (dateStr) => {
  if (!dateStr) return '-';
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};
