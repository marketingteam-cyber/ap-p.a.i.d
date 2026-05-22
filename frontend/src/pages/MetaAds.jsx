import { useState } from 'react';
import { useApi } from '../hooks/useApi';
import Layout from '../components/layout/Layout';
import KPICard from '../components/ui/KPICard';
import DataTable from '../components/ui/DataTable';
import Badge from '../components/ui/Badge';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import LastUpdated from '../components/ui/LastUpdated';
import MetaTrendChart from '../components/charts/MetaTrendChart';
import { formatINR, formatPct, formatNum } from '../utils/formatters';

const SCORE_COLOR = { winning: '#2A9E52', failing: '#CC2020', fatigue: '#D4880A' };

const campaignColumns = [
  { key: 'campaign_name', label: 'Campaign', render: v => <span className="text-brand-gray-200 text-sm">{v || '—'}</span> },
  { key: 'total_spend',   label: 'Spend',        render: v => <span className="font-mono">{formatINR(v)}</span> },
  { key: 'avg_cpl',       label: 'CPL',          render: v => <span className="font-mono">{formatINR(v)}</span> },
  { key: 'avg_ctr',       label: 'CTR',          render: v => <span className="font-mono">{formatPct(v)}</span> },
  { key: 'total_reach',   label: 'Reach',        render: v => <span className="font-mono">{formatNum(v)}</span> },
  { key: 'avg_frequency', label: 'Frequency',    render: v => <span className={`font-mono ${v >= 3 ? 'text-fatigue' : ''}`}>{v ? Number(v).toFixed(2) + 'x' : '—'}</span> },
  { key: 'total_leads',   label: 'Leads',        render: v => <span className="font-mono">{formatNum(v)}</span> },
  { key: 'total_impressions', label: 'Impressions', render: v => <span className="font-mono">{formatNum(v)}</span> },
];

const creativeColumns = [
  { key: 'ad_name',   label: 'Ad Name',    render: v => <span className="text-brand-gray-200 text-sm truncate max-w-xs block">{v || '—'}</span> },
  { key: 'spend',     label: 'Spend',      render: v => <span className="font-mono">{formatINR(v)}</span> },
  { key: 'cpl',       label: 'CPL',        render: v => <span className="font-mono">{formatINR(v)}</span> },
  { key: 'ctr',       label: 'CTR',        render: v => <span className="font-mono">{formatPct(v)}</span> },
  { key: 'frequency', label: 'Frequency',  render: v => <span className={`font-mono ${v >= 3 ? 'text-fatigue' : ''}`}>{v ? Number(v).toFixed(2) + 'x' : '—'}</span> },
  { key: 'impressions', label: 'Impressions', render: v => <span className="font-mono">{formatNum(v)}</span> },
  {
    key: 'score', label: 'Score',
    render: v => v ? (
      <span style={{ color: SCORE_COLOR[v] || '#6B7291', fontFamily: 'monospace', fontSize: 12, fontWeight: 600, textTransform: 'capitalize' }}>{v}</span>
    ) : <span className="text-brand-gray-500 text-xs font-mono">—</span>
  },
];

const DAY_OPTIONS = [
  { label: '7 Days',  value: 7 },
  { label: '14 Days', value: 14 },
  { label: '30 Days', value: 30 },
];

export default function MetaAds() {
  const [days, setDays] = useState(30);
  const { data, loading, error } = useApi(`/api/meta-ads?days=${days}`);

  if (loading) return <Layout><div className="flex items-center justify-center h-96"><LoadingSpinner size="lg" text="Loading Meta Ads..." /></div></Layout>;
  if (error) return <Layout><div className="text-failing text-sm p-4 bg-failing/10 rounded-card border border-failing/20">Failed to load Meta Ads: {error}</div></Layout>;

  const kpis = data?.kpis || {};

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          {/* Meta logo mark */}
          <div className="w-8 h-8 rounded-btn flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0081FB 0%, #00C6FF 100%)' }}>
            <span className="text-white font-bold text-xs">f</span>
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-brand-gray-100">Meta Ads</h1>
            <p className="text-sm text-brand-gray-500 mt-0.5">Facebook & Instagram campaign performance</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Day range selector */}
          <div className="flex items-center bg-brand-gray-900 border border-brand-gray-700 rounded-btn p-0.5 gap-0.5">
            {DAY_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setDays(opt.value)}
                className={`px-3 py-1 text-xs font-mono rounded transition-colors ${days === opt.value ? 'bg-brand-blue text-white' : 'text-brand-gray-500 hover:text-brand-gray-300'}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <LastUpdated lastRefresh={data?.last_refresh} />
        </div>
      </div>

      {/* Intelligence strip */}
      {data?.intelligence && (
        <div className="mb-6 rounded-card border border-brand-blue/30 p-4 flex gap-4 flex-wrap" style={{ background: 'rgba(13,27,62,0.7)' }}>
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-2 h-2 rounded-full bg-brand-blue animate-pulse" />
            <span className="text-xs font-mono text-brand-blue uppercase tracking-widest">AI Insight</span>
          </div>
          <p className="text-sm text-brand-gray-300 leading-relaxed flex-1">{data.intelligence.top_insight || data.intelligence.summary}</p>
        </div>
      )}

      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <KPICard label="Spend"       value={formatINR(kpis.total_spend)}    sub="Last 7 days" accent="blue" />
        <KPICard label="Avg CPL"     value={formatINR(kpis.avg_cpl)}        sub="Cost per lead" accent="blue" />
        <KPICard label="Avg CTR"     value={formatPct(kpis.avg_ctr)}        sub="Click-through rate" accent="blue" />
        <KPICard label="Reach"       value={formatNum(kpis.total_reach)}    sub="Unique people" accent="blue" />
        <KPICard label="Frequency"   value={kpis.avg_frequency ? Number(kpis.avg_frequency).toFixed(2) + 'x' : '—'} sub="Avg impressions/person" accent={Number(kpis.avg_frequency) >= 3 ? 'fatigue' : 'blue'} />
        <KPICard label="Leads"       value={formatNum(kpis.total_leads)}    sub="Total conversions" accent="blue" />
      </div>

      {/* Trend chart */}
      <div className="bg-brand-gray-900 rounded-card border border-brand-gray-700 p-5 mb-6">
        <h2 className="text-sm font-mono text-brand-gray-500 uppercase tracking-wider mb-4">Spend & CPL Trend · {days} Days</h2>
        <MetaTrendChart data={data?.trend || []} />
      </div>

      {/* Campaign table */}
      <div className="bg-brand-gray-900 rounded-card border border-brand-gray-700 p-5 mb-6">
        <h2 className="text-sm font-mono text-brand-gray-500 uppercase tracking-wider mb-4">Campaign Performance · {days} Days</h2>
        <DataTable columns={campaignColumns} data={data?.campaigns || []} emptyText="No campaign data yet. Run a refresh to populate." />
      </div>

      {/* Creatives table */}
      <div className="bg-brand-gray-900 rounded-card border border-brand-gray-700 p-5">
        <h2 className="text-sm font-mono text-brand-gray-500 uppercase tracking-wider mb-4">Ad Creatives · Last 7 Days</h2>
        <DataTable columns={creativeColumns} data={data?.creatives || []} emptyText="No creative data yet. Run a refresh to populate." />
      </div>
    </Layout>
  );
}
