import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, Cell,
} from 'recharts';
import { channelLabel } from '../../utils/formatters';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-brand-gray-900 border border-brand-gray-700 rounded-card p-3 text-xs">
      <p className="text-brand-gray-300 mb-2">{label}</p>
      {payload.map(entry => (
        <div key={entry.name} className="flex items-center gap-2 mb-1">
          <span style={{ color: entry.fill }}>●</span>
          <span className="text-brand-gray-400">CTR:</span>
          <span className="font-mono text-brand-gray-100">{Number(entry.value).toFixed(2)}%</span>
        </div>
      ))}
    </div>
  );
};

const CHANNEL_COLORS = {
  Google: '#4285F4',
  Meta: '#1A4FBA',
  LinkedIn: '#0A66C2',
};

export default function CTRBarChart({ data = [] }) {
  const chartData = data.map(d => ({
    name: channelLabel(d.channel),
    ctr: Number(d.avg_ctr || 0).toFixed(2),
  }));

  return (
    <ResponsiveContainer width="100%" height={160}>
      <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#3A3F52" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fill: '#6B7291', fontSize: 11 }}
          tickLine={false}
          axisLine={{ stroke: '#3A3F52' }}
        />
        <YAxis
          tick={{ fill: '#6B7291', fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `${v}%`}
          width={35}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="ctr" radius={[4, 4, 0, 0]}>
          {chartData.map((entry) => (
            <Cell key={entry.name} fill={CHANNEL_COLORS[entry.name] || '#6B7291'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
