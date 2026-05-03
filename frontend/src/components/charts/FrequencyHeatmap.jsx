export default function FrequencyHeatmap({ campaigns = [] }) {
  function getFrequencyColor(freq) {
    if (freq > 3) return { bg: 'bg-failing/10', border: 'border-failing/40', text: 'text-failing', badge: 'bg-failing' };
    if (freq >= 2) return { bg: 'bg-fatigue/10', border: 'border-fatigue/40', text: 'text-fatigue', badge: 'bg-fatigue' };
    return { bg: 'bg-winning/10', border: 'border-winning/40', text: 'text-winning', badge: 'bg-winning' };
  }

  if (!campaigns.length) {
    return (
      <div className="text-center py-8 text-brand-gray-500 text-sm">
        No Meta campaign data available
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
      {campaigns.map((campaign, idx) => {
        const freq = Number(campaign.avg_frequency || 0);
        const colors = getFrequencyColor(freq);

        return (
          <div
            key={campaign.campaign_id || idx}
            className={`relative rounded-card p-3 border ${colors.bg} ${colors.border} flex flex-col gap-1`}
          >
            {freq > 3 && (
              <span className={`absolute top-2 right-2 w-2 h-2 rounded-full ${colors.badge} pulse-red`} />
            )}
            <p className="text-xs text-brand-gray-300 line-clamp-2 leading-tight pr-3">
              {campaign.campaign_name || 'Unnamed'}
            </p>
            <div className={`text-xl font-display font-bold ${colors.text}`}>
              {freq.toFixed(1)}x
            </div>
            <div className="text-xs text-brand-gray-500">frequency</div>
          </div>
        );
      })}
    </div>
  );
}
