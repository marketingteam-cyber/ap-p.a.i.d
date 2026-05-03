import { useState } from 'react';
import { useApi } from '../hooks/useApi';
import Layout from '../components/layout/Layout';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import DataTable from '../components/ui/DataTable';
import Badge from '../components/ui/Badge';
import ChannelTag from '../components/ui/ChannelTag';
import FrequencyHeatmap from '../components/charts/FrequencyHeatmap';
import { formatINR, formatPct, formatNum } from '../utils/formatters';

const CHANNELS = [
  { key: 'all',          label: 'All Channels' },
  { key: 'google_ads',   label: 'Google' },
  { key: 'facebook_ads', label: 'Meta' },
  { key: 'linkedin_ads', label: 'LinkedIn' },
];

const DAYS_OPTIONS = [
  { value: 7,  label: '7D' },
  { value: 14, label: '14D' },
  { value: 30, label: '30D' },
];

function CreativeDrawer({ campaign, creatives, onClose }) {
  const campCreatives = creatives.filter(c => c.campaign_id === campaign.campaign_id);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-brand-gray-900 border-l border-brand-gray-700 overflow-y-auto p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-brand-gray-100">{campaign.campaign_name || 'Campaign'}</h3>
            <ChannelTag channel={campaign.channel} />
          </div>
          <button onClick={onClose} className="text-brand-gray-500 hover:text-brand-gray-100 text-xl leading-none">×</button>
        </div>

        <div className="text-xs text-brand-gray-500 font-mono">{campCreatives.length} creatives</div>

        {campCreatives.length === 0 ? (
          <p className="text-sm text-brand-gray-500">No creative-level data for this campaign.</p>
        ) : (
          campCreatives.map((c, i) => (
            <div key={c.ad_id || i} className="bg-brand-dark rounded-card border border-brand-gray-700 p-4">
              <div className="flex items-start justify-between mb-2">
                <p className="text-sm text-brand-gray-200 line-clamp-1">{c.ad_name || 'Unnamed Ad'}</p>
                <Badge variant={c.score || 'neutral'}>{c.score || 'neutral'}</Badge>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <div className="text-xs text-brand-gray-500">CPL</div>
                  <div className="text-sm font-mono">{formatINR(c.cpl)}</div>
                </div>
                <div>
                  <div className="text-xs text-brand-gray-500">CTR</div>
                  <div className="text-sm font-mono">{formatPct(c.ctr)}</div>
                </div>
                <div>
                  <div className="text-xs text-brand-gray-500">Freq</div>
                  <div className={`text-sm font-mono ${c.frequency >= 3 ? 'text-fatigue' : ''}`}>
                    {c.frequency ? Number(c.frequency).toFixed(1) + 'x' : '—'}
                  </div>
                </div>
              </div>
              {c.score_reason && (
                <p className="text-xs text-brand-gray-500 mt-2 italic">{c.score_reason}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const campaignColumns = [
  { key: 'campaign_name', label: 'Campaign',    render: (v) => <span className="text-brand-gray-200">{v || '—'}</span> },
  { key: 'channel',       label: 'Channel',     render: (v) => <ChannelTag channel={v} /> },
  { key: 'total_spend',   label: 'Spend',       render: (v) => <span className="font-mono">{formatINR(v)}</span> },
  { key: 'avg_cpl',       label: 'CPL',         render: (v) => <span className="font-mono">{formatINR(v)}</span> },
  { key: 'avg_cpc',       label: 'CPC',         render: (v) => <span className="font-mono">{formatINR(v)}</span> },
  { key: 'avg_ctr',       label: 'CTR',         render: (v) => <span className="font-mono">{formatPct(v)}</span> },
  {
    key: 'avg_frequency',
    label: 'Frequency',
    render: (v) => (
      <span className={`font-mono ${v >= 3 ? 'text-fatigue font-bold' : ''}`}>
        {v ? Number(v).toFixed(2) + 'x' : '—'}
      </span>
    ),
  },
  { key: 'total_leads',   label: 'Leads',       render: (v) => <span className="font-mono">{formatNum(v)}</span> },
];

export default function MyAds() {
  const [channel, setChannel] = useState('all');
  const [days, setDays] = useState(7);
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  const { data, loading, error } = useApi('/api/my-ads', {
    params: { channel: channel === 'all' ? undefined : channel, days },
  });

  const campaigns = data?.campaigns || [];
  const fatigue = data?.fatigue_data || [];
  const creatives = data?.creatives || [];

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-brand-gray-100">My Ads</h1>
          <p className="text-sm text-brand-gray-500 mt-0.5">Campaign and creative performance</p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="flex bg-brand-gray-900 border border-brand-gray-700 rounded-btn overflow-hidden">
          {CHANNELS.map(ch => (
            <button
              key={ch.key}
              onClick={() => setChannel(ch.key)}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                channel === ch.key
                  ? 'bg-brand-blue text-white'
                  : 'text-brand-gray-500 hover:text-brand-gray-300'
              }`}
            >
              {ch.label}
            </button>
          ))}
        </div>
        <div className="flex bg-brand-gray-900 border border-brand-gray-700 rounded-btn overflow-hidden">
          {DAYS_OPTIONS.map(d => (
            <button
              key={d.value}
              onClick={() => setDays(d.value)}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                days === d.value
                  ? 'bg-brand-blue text-white'
                  : 'text-brand-gray-500 hover:text-brand-gray-300'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" text="Loading campaign data..." />
        </div>
      ) : error ? (
        <div className="text-failing text-sm p-4 bg-failing/10 rounded-card border border-failing/20">{error}</div>
      ) : (
        <>
          {/* Fatigue Heatmap - Meta only */}
          {(channel === 'all' || channel === 'facebook_ads') && (
            <div className="bg-brand-gray-900 rounded-card border border-brand-gray-700 p-5 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-sm font-mono text-brand-gray-500 uppercase tracking-wider">Fatigue Heatmap · Meta</h2>
                <span className="text-xs text-brand-gray-500">(frequency by campaign)</span>
              </div>
              <FrequencyHeatmap campaigns={fatigue} />
            </div>
          )}

          {/* Campaign Table */}
          <div className="bg-brand-gray-900 rounded-card border border-brand-gray-700 p-5">
            <h2 className="text-sm font-mono text-brand-gray-500 uppercase tracking-wider mb-4">
              Campaigns ({campaigns.length})
            </h2>
            <DataTable
              columns={campaignColumns}
              data={campaigns}
              onRowClick={setSelectedCampaign}
              emptyText="No campaigns found. Run a refresh to populate data."
            />
            <p className="text-xs text-brand-gray-500 mt-2">Click a row to view creative breakdown</p>
          </div>
        </>
      )}

      {selectedCampaign && (
        <CreativeDrawer
          campaign={selectedCampaign}
          creatives={creatives}
          onClose={() => setSelectedCampaign(null)}
        />
      )}
    </Layout>
  );
}
