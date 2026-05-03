export default function DataTable({ columns, data, onRowClick, emptyText = 'No data available' }) {
  return (
    <div className="overflow-x-auto rounded-card border border-brand-gray-700">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-brand-gray-700 bg-brand-gray-900">
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-4 py-3 text-left text-xs font-mono text-brand-gray-500 uppercase tracking-wider whitespace-nowrap"
                style={{ width: col.width }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-brand-gray-500">
                {emptyText}
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr
                key={row.id || idx}
                onClick={() => onRowClick?.(row)}
                className={`border-b border-brand-gray-700/50 transition-colors ${onRowClick ? 'cursor-pointer hover:bg-brand-gray-900' : ''}`}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-brand-gray-300 whitespace-nowrap">
                    {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
