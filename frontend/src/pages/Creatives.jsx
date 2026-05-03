import { useState } from 'react';
import { useApi } from '../hooks/useApi';
import Layout from '../components/layout/Layout';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import CreativeCard from '../components/ui/CreativeCard';
import ChannelTag from '../components/ui/ChannelTag';
import { formatINR } from '../utils/formatters';

const CHANNELS = [
  { key: 'all',          label: 'All' },
  { key: 'google_ads',   label: 'Google' },
  { key: 'facebook_ads', label: 'Meta' },
  { key: 'linkedin_ads', label: 'LinkedIn' },
];

function SectionHeader({ title, count, color }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className={`w-3 h-3 rounded-full ${color}`} />
      <h2 className="text-sm font-mono text-brand-gray-400 uppercase tracking-wider">{title}</h2>
      <span className="text-xs font-mono text-brand-gray-500 bg-brand-gray-900 border border-brand-gray-700 rounded-pill px-2 py-0.5">
        {count}
      </span>
    </div>
  );
}

function EmptySection({ message }) {
  return (
    <p className="text-sm text-brand-gray-500 py-4">{message}</p>
  );
}

export default function Creatives() {
  const [channel, setChannel] = useState('all');
  const [days, setDays] = useState(7);

  const { data, loading, error } = useApi('/api/creatives', {
    params: {
      channel: channel === 'all' ? undefined : channel,
      days,
    },
  });

  const winning = data?.winning || [];
  const failing = data?.failing || [];
  const fatigue = data?.fatigue || [];
  const stats = data?.stats || [];
  const recommendation = data?.creative_recommendation;

  const totalWinning = stats.find(s => s.score === 'winning')?.count || winning.length;
  const totalFailing = stats.find(s => s.score === 'failing')?.count || failing.length;
  const totalFatigue = stats.find(s => s.score === 'fatigue')?.count || fatigue.length;

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-brand-gray-100">Creatives</h1>
          <p className="text-sm text-brand-gray-500 mt-0.5">AI-scored ad creative performance</p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
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
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" text="Loading creatives..." />
        </div>
      ) : error ? (
        <div className="text-failing text-sm p-4 bg-failing/10 rounded-card border border-failing/20">{error}</div>
      ) : (
        <div className="flex flex-col gap-8">
          {/* Winning Creatives */}
          <section>
            <SectionHeader title="Winning Creatives" count={totalWinning} color="bg-winning" />
            {winning.length === 0 ? (
              <EmptySection message="No winning creatives yet. Run a refresh to score your ads." />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {winning.map((c, i) => <CreativeCard key={c.ad_id || i} creative={c} />)}
              </div>
            )}
          </section>

          {/* Failing Creatives */}
          <section>
            <SectionHeader title="Failing Creatives" count={totalFailing} color="bg-failing" />
            {failing.length === 0 ? (
              <EmptySection message="No failing creatives detected." />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {failing.map((c, i) => <CreativeCard key={c.ad_id || i} creative={c} />)}
              </div>
            )}
          </section>

          {/* Fatigue Watch */}
          <section>
            <SectionHeader title="Fatigue Watch" count={totalFatigue} color="bg-fatigue" />
            {fatigue.length === 0 ? (
              <EmptySection message="No creatives showing fatigue signals." />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {fatigue.map((c, i) => (
                  <div key={c.ad_id || i} className="bg-brand-gray-900 rounded-card border border-brand-gray-700 border-t-2 border-t-fatigue p-4 flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-brand-gray-200 line-clamp-2">{c.ad_name || 'Unnamed Ad'}</p>
                      <span className="text-xs font-mono text-fatigue bg-fatigue/10 border border-fatigue/30 rounded-tag px-1.5 py-0.5">FATIGUE</span>
                    </div>
                    <ChannelTag channel={c.channel} />
                    <div className="flex items-end gap-2">
                      <span className="text-4xl font-display font-bold text-fatigue">
                        {Number(c.frequency || 0).toFixed(1)}
                      </span>
                      <span className="text-sm text-brand-gray-500 mb-1">× frequency</span>
                    </div>
                    {c.score_reason && (
                      <p className="text-xs text-brand-gray-500 italic border-t border-brand-gray-700 pt-2">{c.score_reason}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Dynamic Strategy Card */}
          <div className="bg-[#0D1B3E] border border-brand-blue/30 rounded-card p-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-brand-blue animate-pulse" />
              <span className="text-xs font-mono text-brand-blue-light uppercase tracking-widest">Creative Strategy · Claude AI</span>
            </div>
            <p className="text-brand-gray-200 leading-relaxed">
              {recommendation || 'No strategy recommendation yet. Run a refresh to generate AI insights.'}
            </p>
            <p className="text-xs text-brand-gray-500 mt-4 pt-3 border-t border-brand-blue/20">
              Based on {totalWinning} winning creatives and competitor ad patterns from Meta Ad Library
            </p>
          </div>
        </div>
      )}
    </Layout>
  );
}
