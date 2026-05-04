import { formatRelativeTime, formatDate } from '../../utils/formatters';
import { useRefreshCountdown } from '../../hooks/useRefreshCountdown';

export default function LastUpdated({ lastRefresh }) {
  const countdown = useRefreshCountdown();

  const refreshTime = lastRefresh?.created_at
    ? new Date(lastRefresh.created_at).toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }) + ' IST'
    : 'Never';

  return (
    <div className="flex items-center gap-3 text-xs text-brand-gray-500">
      <span>
        Last refreshed: <span className="text-brand-gray-300">{refreshTime}</span>
      </span>
      <span className="bg-brand-gray-900 border border-brand-gray-700 rounded-pill px-3 py-1 font-mono text-brand-gray-300">
        Next in: <span className="text-brand-blue-light">{countdown}</span>
      </span>
    </div>
  );
}
