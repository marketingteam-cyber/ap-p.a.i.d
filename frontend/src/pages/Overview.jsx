import { useApi } from '../hooks/useApi';
import Layout from '../components/layout/Layout';
import KPICard from '../components/ui/KPICard';
import LastUpdated from '../components/ui/LastUpdated';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import CPLTrendChart from '../components/charts/CPLTrendChart';
import ImpressionsAreaChart from '../components/charts/ImpressionsAreaChart';
import DataTable from '../components/ui/DataTable';
import ChannelTag from '../components/ui/ChannelTag';
import { formatINR, formatPct, formatNum, channelLabel } from '../utils/formatters';

function IntelligenceCard({ intel }) {
  if (!intel) {
    return (
      <div className="bg-brand-gray-900 rounded-card border border-brand-gray-700 p-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-brand-blue" />
          <span className="text-xs font-mono text-brand-gray-500 uppercase tracking-widest">Daily Intelligence</span>
        </div>
        <p className="text-brand-gray-500 text-sm">No intelligence report yet. Trigger a refresh to generate today's briefing.</p>
      </div>
    );
  }

  const rows = [
    { label: 'Briefing',     value: intel.summary },
    { label: 'Top Insight',  value: intel.top_insight },
    { label: 'Creative Action', value: intel.creative_recommendation },
    { label: 'Watch',        value: intel.competitor_watch },
  ];

  return (
    <div className="bg-[#0D1B3E] border border-brand-blue/30 rounded-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 rounded-full bg-brand-blue animate-pulse" />
        <span className="text-xs font-mono text-brand-blue-light uppercase tracking-widest">Daily Intelligence · Claude AI</span>
      </div>
      <div className="flex flex-col gap-3">
        {rows.map(({ label, value }) => value && (
          <div key={label} className="flex gap-3">
            <span className="text-xs font-mono text-brand-gray-500 uppercase tracking-wider w-32 shrink-0 pt-0.5">{label}</span>
            <p className="text-sm text-brand-gray-200 leading-relaxed">{value}</p>
          </div>
        ))}
      </div>
      {intel.generated_at && (
        <p className="text-xs text-brand-gray-500 mt-4 pt-3 border-t border-brand-blue/20">
          Generated {new Date(intel.generated_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST
        </p>
      )}
    </div>
  );
}

const channelTableColumns = [
  { key: 'channel',           label: 'Channel',     render: (v) => <ChannelTag channel={v} /> },
  { key: 'total_spend',       label: 'Spend',       render: (v) => <span className="font-mono">{formatINR(v)}</span> },
  { key: 'avg_cpl',           label: 'Avg CPL',     render: (v) => <span className="font-mono">{formatINR(v)}</span> },
  { key: 'avg_cpc',           label: 'Avg CPC',     render: (v) => <span className="font-mono">{formatINR(v)}</span> },
  { key: 'avg_ctr',           label: 'CTR',         render: (v) => <span className="font-mono">{formatPct(v)}</span> },
  { key: 'total_impressions', label: 'Impressions', render: (v) => <span className="font-mono">{formatNum(v)}</span> },
  { key: 'avg_frequency',     label: 'Frequency',   render: (v) => <span className={`font-mono ${v >= 3 ? 'text-fatigue' : ''}`}>{v ? Number(v).toFixed(2) + 'x' : '—'}</span> },
  { key: 'total_leads',       label: 'Leads',       render: (v) => <span className="font-mono">{formatNum(v)}</span> },
];

export default function Overview() {
  const { data, loading, error } = useApi('/api/overview');

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <LoadingSpinner size="lg" text="Loading dashboard..." />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="text-failing text-sm p-4 bg-failing/10 rounded-card border border-failing/20">
          Failed to load overview: {error}
        </div>
      </Layout>
    );
  }

  const kpis = data?.kpis || {};
  const channels = data?.channel_breakdown || [];

  return (
    <Layout>
      {/* Top strip */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-brand-gray-100">Overview</h1>
          <p className="text-sm text-brand-gray-500 mt-0.5">AssetPlus paid media performance</p>
        </div>
        <LastUpdated lastRefresh={data?.last_refresh} />
      </div>

      {/* Daily Intelligence */}
      <div className="mb-6">
        <IntelligenceCard intel={data?.intelligence} />
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard
          label="Total Spend"
          value={formatINR(kpis.total_spend)}
          sub="Last 7 days, all channels"
          accent="blue"
        />
        <KPICard
          label="Avg CPL"
          value={formatINR(kpis.avg_cpl)}
          sub="Cost per lead"
          accent="blue"
        />
        <KPICard
          label="Avg CTR"
          value={formatPct(kpis.avg_ctr)}
          sub="Click-through rate"
          accent="blue"
        />
        <KPICard
          label="Fatigue Risk"
          value={kpis.fatigue_risk_count ?? '0'}
          sub="Creatives with freq ≥ 3"
          accent={kpis.fatigue_risk_count > 0 ? 'fatigue' : 'default'}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        <div className="bg-brand-gray-900 rounded-card border border-brand-gray-700 p-5">
          <h2 className="text-sm font-mono text-brand-gray-500 uppercase tracking-wider mb-4">CPL Trend · 30 Days</h2>
          <CPLTrendChart data={data?.cpl_trend || []} />
        </div>
        <div className="bg-brand-gray-900 rounded-card border border-brand-gray-700 p-5">
          <h2 className="text-sm font-mono text-brand-gray-500 uppercase tracking-wider mb-4">Impressions · 7 Days</h2>
          <ImpressionsAreaChart data={data?.impressions_trend || []} />
        </div>
      </div>

      {/* Channel Performance Table */}
      <div className="bg-brand-gray-900 rounded-card border border-brand-gray-700 p-5">
        <h2 className="text-sm font-mono text-brand-gray-500 uppercase tracking-wider mb-4">Channel Performance · 7 Days</h2>
        <DataTable
          columns={channelTableColumns}
          data={channels}
          emptyText="No channel data. Run a refresh to populate."
        />
      </div>
    </Layout>
  );
}
