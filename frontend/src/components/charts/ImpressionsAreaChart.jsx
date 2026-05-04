import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from 'recharts';
import { channelColor, channelLabel } from '../../utils/formatters';

const CHANNELS = ['google_ads', 'facebook_ads', 'linkedin_ads'];

function processData(rawData) {
  const byDate = {};
  for (const row of rawData) {
    if (!byDate[row.date]) byDate[row.date] = { date: row.date };
    byDate[row.date][row.channel] = row.impressions || 0;
  }
  return Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date));
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-brand-gray-900 border border-brand-gray-700 rounded-card p-3 text-xs">
      <p className="text-brand-gray-300 mb-2">{label}</p>
      {payload.map(entry => (
        <div key={entry.dataKey} className="flex items-center gap-2 mb-1">
          <span style={{ color: entry.color }}>●</span>
          <span className="text-brand-gray-400">{channelLabel(entry.dataKey)}:</span>
          <span className="font-mono text-brand-gray-100">{Number(entry.value).toLocaleString('en-IN')}</span>
        </div>
      ))}
    </div>
  );
};

export default function ImpressionsAreaChart({ data = [] }) {
  const processed = processData(data);

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={processed} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <defs>
          {CHANNELS.map(ch => (
            <linearGradient key={ch} id={`grad-${ch}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={channelColor(ch)} stopOpacity={0.3} />
              <stop offset="95%" stopColor={channelColor(ch)} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#3A3F52" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fill: '#6B7291', fontSize: 11 }}
          tickLine={false}
          axisLine={{ stroke: '#3A3F52' }}
          tickFormatter={(v) => {
            const d = new Date(v);
            return `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}`;
          }}
        />
        <YAxis
          tick={{ fill: '#6B7291', fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v}
          width={45}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          formatter={(value) => <span style={{ color: '#B8BCCF', fontSize: 12 }}>{channelLabel(value)}</span>}
        />
        {CHANNELS.map(ch => (
          <Area
            key={ch}
            type="monotone"
            dataKey={ch}
            stroke={channelColor(ch)}
            fill={`url(#grad-${ch})`}
            strokeWidth={2}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}
