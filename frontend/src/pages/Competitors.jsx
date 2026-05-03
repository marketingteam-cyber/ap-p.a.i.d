import { useState } from 'react';
import { useApi } from '../hooks/useApi';
import Layout from '../components/layout/Layout';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Badge from '../components/ui/Badge';
import { formatDate } from '../utils/formatters';

function CompetitorSummaryCard({ summary, selected, onClick }) {
  const analysis = summary.analysis || {};
  const threatVariant = { high: 'high', medium: 'medium', low: 'low' }[analysis.threat_level] || 'default';

  return (
    <button
      onClick={onClick}
      className={`text-left w-full rounded-card border p-4 transition-colors ${
        selected
          ? 'border-brand-blue bg-brand-blue/10'
          : 'border-brand-gray-700 bg-brand-gray-900 hover:border-brand-gray-500'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-medium text-brand-gray-100 text-sm">{summary.competitor_name}</h3>
        {analysis.threat_level && (
          <Badge variant={threatVariant} size="xs">{analysis.threat_level} threat</Badge>
        )}
      </div>
      <div className="text-2xl font-display font-bold text-brand-gray-100 mb-1">
        {summary.active_ads ?? 0}
      </div>
      <div className="text-xs text-brand-gray-500 mb-2">active ads</div>
      {summary.messaging_theme && (
        <p className="text-xs text-brand-blue-light italic">"{summary.messaging_theme}"</p>
      )}
      {analysis.dominant_format && (
        <div className="mt-2">
          <Badge variant="blue" size="xs">{analysis.dominant_format}</Badge>
        </div>
      )}
    </button>
  );
}

function AdCard({ ad, isNew }) {
  const runDays = ad.estimated_run_days;
  return (
    <div className="bg-brand-gray-900 border border-brand-gray-700 rounded-card overflow-hidden flex flex-col">
      {/* Image placeholder */}
      {ad.ad_snapshot_url ? (
        <div className="h-40 bg-brand-gray-900 flex items-center justify-center overflow-hidden">
          <img
            src={ad.ad_snapshot_url}
            alt="Ad preview"
            className="w-full h-full object-cover"
            onError={e => { e.target.style.display = 'none'; }}
          />
        </div>
      ) : (
        <div className="h-32 bg-brand-gray-700/30 flex items-center justify-center">
          <span className="text-brand-gray-500 text-xs">No preview</span>
        </div>
      )}

      <div className="p-3 flex flex-col gap-2 flex-1">
        <div className="flex items-start justify-between gap-2">
          {isNew && <Badge variant="new" size="xs">New this week</Badge>}
          {ad.call_to_action_type && (
            <Badge variant="blue" size="xs">{ad.call_to_action_type.replace(/_/g, ' ')}</Badge>
          )}
        </div>

        {ad.ad_creative_link_title && (
          <p className="text-sm font-medium text-brand-gray-200 leading-snug line-clamp-2">
            {ad.ad_creative_link_title}
          </p>
        )}
        {ad.ad_creative_body && (
          <p className="text-xs text-brand-gray-500 line-clamp-3">
            {ad.ad_creative_body}
          </p>
        )}

        <div className="flex items-center justify-between mt-auto pt-2">
          <span className="text-xs text-brand-gray-500">
            {ad.ad_delivery_start_time ? formatDate(ad.ad_delivery_start_time) : '—'}
          </span>
          {runDays != null && (
            <span className="text-xs font-mono text-brand-gray-500">
              {runDays}d running
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function IntelPanel({ summary }) {
  const a = summary?.analysis;
  if (!a) {
    return (
      <div className="p-4 text-sm text-brand-gray-500">
        No Claude analysis available for this competitor yet.
      </div>
    );
  }

  const rows = [
    { label: 'Format',        value: a.dominant_format },
    { label: 'Theme',         value: a.messaging_theme },
    { label: 'Hook',          value: a.hook_pattern },
    { label: 'Offer',         value: a.offer_type },
    { label: 'Longevity',     value: a.longevity_signal },
    { label: 'Threat Level',  value: a.threat_level },
  ];

  return (
    <div className="p-4 flex flex-col gap-4">
      <h3 className="text-sm font-mono text-brand-gray-500 uppercase tracking-wider">Intelligence · {summary.competitor_name}</h3>
      <div className="flex flex-col gap-2">
        {rows.map(({ label, value }) => value && (
          <div key={label} className="flex gap-3">
            <span className="text-xs font-mono text-brand-gray-500 w-24 shrink-0 pt-0.5">{label}</span>
            <span className="text-sm text-brand-gray-200 capitalize">{value}</span>
          </div>
        ))}
      </div>
      {a.steal_this && (
        <div className="bg-brand-blue/10 border border-brand-blue/30 rounded-card p-3 mt-2">
          <div className="text-xs font-mono text-brand-blue-light uppercase tracking-wider mb-1">Steal This</div>
          <p className="text-sm text-brand-gray-200">{a.steal_this}</p>
        </div>
      )}
    </div>
  );
}

export default function Competitors() {
  const [selectedCompetitor, setSelectedCompetitor] = useState(null);
  const { data, loading, error } = useApi('/api/competitors', {
    params: selectedCompetitor ? { competitor: selectedCompetitor } : {},
  });

  const allData = useApi('/api/competitors');
  const summaries = allData.data?.summaries || [];

  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
  const ads = data?.ads || [];
  const selectedSummary = summaries.find(s => s.competitor_name === selectedCompetitor);

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-brand-gray-100">Competitors</h1>
        <p className="text-sm text-brand-gray-500 mt-0.5">Meta Ad Library intelligence</p>
      </div>

      {allData.loading ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" text="Loading competitor data..." />
        </div>
      ) : (
        <>
          {/* Competitor Summary Row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            {summaries.map(s => (
              <CompetitorSummaryCard
                key={s.competitor_name}
                summary={s}
                selected={selectedCompetitor === s.competitor_name}
                onClick={() => setSelectedCompetitor(
                  selectedCompetitor === s.competitor_name ? null : s.competitor_name
                )}
              />
            ))}
          </div>

          <div className="flex gap-5">
            {/* Gallery */}
            <div className="flex-1 min-w-0">
              {/* Competitor tabs */}
              <div className="flex gap-2 mb-4 flex-wrap">
                <button
                  onClick={() => setSelectedCompetitor(null)}
                  className={`px-3 py-1.5 text-xs rounded-btn border transition-colors ${
                    !selectedCompetitor
                      ? 'bg-brand-blue text-white border-brand-blue'
                      : 'border-brand-gray-700 text-brand-gray-500 hover:text-brand-gray-300'
                  }`}
                >
                  All
                </button>
                {summaries.map(s => (
                  <button
                    key={s.competitor_name}
                    onClick={() => setSelectedCompetitor(
                      selectedCompetitor === s.competitor_name ? null : s.competitor_name
                    )}
                    className={`px-3 py-1.5 text-xs rounded-btn border transition-colors ${
                      selectedCompetitor === s.competitor_name
                        ? 'bg-brand-blue text-white border-brand-blue'
                        : 'border-brand-gray-700 text-brand-gray-500 hover:text-brand-gray-300'
                    }`}
                  >
                    {s.competitor_name}
                  </button>
                ))}
              </div>

              {loading ? (
                <div className="flex items-center justify-center h-48">
                  <LoadingSpinner />
                </div>
              ) : ads.length === 0 ? (
                <div className="text-center py-12 text-brand-gray-500 text-sm">
                  No competitor ads found. Run a refresh to fetch Meta Ad Library data.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {ads.map(ad => (
                    <AdCard
                      key={ad.id}
                      ad={ad}
                      isNew={ad.first_seen >= sevenDaysAgo}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Intelligence Panel */}
            {selectedSummary && (
              <div className="w-72 shrink-0 bg-brand-gray-900 border border-brand-gray-700 rounded-card self-start sticky top-20">
                <IntelPanel summary={selectedSummary} />
              </div>
            )}
          </div>
        </>
      )}
    </Layout>
  );
}
