export default function KPICard({ label, value, sub, trend, icon, accent }) {
  const accentMap = {
    blue:    'border-brand-blue',
    winning: 'border-winning',
    failing: 'border-failing',
    fatigue: 'border-fatigue',
    default: 'border-brand-gray-700',
  };
  const borderColor = accentMap[accent] || accentMap.default;

  return (
    <div className={`bg-brand-gray-900 rounded-card p-5 border border-brand-gray-700 border-t-2 ${borderColor} flex flex-col gap-1`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono text-brand-gray-500 uppercase tracking-widest">{label}</span>
        {icon && <span className="text-brand-gray-500 text-lg">{icon}</span>}
      </div>
      <div className="text-2xl font-display text-brand-gray-100 mt-1">{value ?? '—'}</div>
      {sub && <div className="text-xs text-brand-gray-500">{sub}</div>}
      {trend !== undefined && (
        <div className={`text-xs font-mono mt-1 ${trend >= 0 ? 'text-failing' : 'text-winning'}`}>
          {trend >= 0 ? '▲' : '▼'} {Math.abs(trend).toFixed(1)}% vs last week
        </div>
      )}
    </div>
  );
}
