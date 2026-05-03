import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from 'recharts';
import { channelColor, channelLabel } from '../../utils/formatters';

const CHANNELS = ['google_ads', 'facebook_ads', 'linkedin_ads'];

function processData(rawData) {
  const byDate = {};
  for (const row of rawData) {
    if (!byDate[row.date]) byDate[row.date] = { date: row.date };
    byDate[row.date][row.channel] = row.avg_cpl ? Number(row.avg_cpl).toFixed(0) : null;
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
          <span className="font-mono text-brand-gray-100">Rs.{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function CPLTrendChart({ data = [] }) {
  const processed = processData(data);

  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={processed} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
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
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fill: '#6B7291', fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `Rs.${v}`}
          width={55}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          formatter={(value) => <span style={{ color: '#B8BCCF', fontSize: 12 }}>{channelLabel(value)}</span>}
        />
        {CHANNELS.map(ch => (
          <Line
            key={ch}
            type="monotone"
            dataKey={ch}
            stroke={channelColor(ch)}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
            connectNulls
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
