import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#1E2230', border: '1px solid #3A3F52', borderRadius: 8, padding: '10px 14px', fontSize: 12 }}>
      <p style={{ color: '#B8BCCF', marginBottom: 6 }}>{label}</p>
      {payload.map(entry => (
        <div key={entry.dataKey} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
          <span style={{ color: entry.color }}>●</span>
          <span style={{ color: '#6B7291' }}>{entry.name}:</span>
          <span style={{ fontFamily: 'monospace', color: '#E8EAF2' }}>
            {entry.dataKey === 'avg_cpl' ? `₹${Number(entry.value).toFixed(0)}` : `₹${Number(entry.value).toLocaleString('en-IN')}`}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function MetaTrendChart({ data = [] }) {
  const processed = data.map(d => ({
    date: new Date(d.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
    spend: Number(d.spend) || 0,
    avg_cpl: d.avg_cpl ? Number(d.avg_cpl) : null,
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <ComposedChart data={processed} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#3A3F52" vertical={false} />
        <XAxis dataKey="date" tick={{ fill: '#6B7291', fontSize: 11 }} tickLine={false} axisLine={{ stroke: '#3A3F52' }} interval="preserveStartEnd" />
        <YAxis yAxisId="spend" tick={{ fill: '#6B7291', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} width={52} />
        <YAxis yAxisId="cpl" orientation="right" tick={{ fill: '#6B7291', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `₹${v}`} width={52} />
        <Tooltip content={<CustomTooltip />} />
        <Legend formatter={v => <span style={{ color: '#B8BCCF', fontSize: 12 }}>{v === 'spend' ? 'Spend' : 'CPL'}</span>} />
        <Bar yAxisId="spend" dataKey="spend" name="spend" fill="#1A4FBA" opacity={0.8} radius={[3, 3, 0, 0]} />
        <Line yAxisId="cpl" type="monotone" dataKey="avg_cpl" name="avg_cpl" stroke="#D4880A" strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 0 }} connectNulls />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
