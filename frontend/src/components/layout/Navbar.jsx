import { NavLink, useNavigate } from 'react-router-dom';
import { useRefreshCountdown } from '../../hooks/useRefreshCountdown';
import axios from 'axios';

const NAV_ITEMS = [
  { to: '/overview',    label: 'Overview' },
  { to: '/my-ads',      label: 'My Ads' },
  { to: '/meta-ads',    label: 'Meta Ads' },
  { to: '/competitors', label: 'Competitors' },
  { to: '/creatives',   label: 'Creatives' },
];

export default function Navbar() {
  const countdown = useRefreshCountdown();
  const navigate = useNavigate();

  async function handleLogout() {
    await axios.post('/api/auth/logout', {}, { withCredentials: true });
    navigate('/login');
  }

  return (
    <header className="h-14 bg-brand-dark border-b border-brand-gray-700 flex items-center px-6 gap-8 sticky top-0 z-50">
      {/* Wordmark */}
      <div className="font-display text-xl font-extrabold tracking-tight shrink-0">
        <span className="text-brand-gray-100">P</span>
        <span className="text-brand-red">.</span>
        <span className="text-brand-gray-100">A</span>
        <span className="text-brand-red">.</span>
        <span className="text-brand-gray-100">I</span>
        <span className="text-brand-red">.</span>
        <span className="text-brand-gray-100">D</span>
      </div>

      {/* Nav links */}
      <nav className="flex items-center gap-1 flex-1">
        {NAV_ITEMS.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `px-3 py-1.5 text-sm font-medium rounded-btn transition-colors border-b-2 ${
                isActive
                  ? 'text-brand-gray-100 border-brand-blue'
                  : 'text-brand-gray-500 border-transparent hover:text-brand-gray-300'
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Right side */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-1.5 bg-brand-gray-900 border border-brand-gray-700 rounded-pill px-3 py-1">
          <span className="w-1.5 h-1.5 rounded-full bg-winning animate-pulse" />
          <span className="text-xs font-mono text-brand-gray-400">
            Next refresh <span className="text-brand-blue-light">{countdown}</span>
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="w-8 h-8 rounded-full bg-brand-blue/20 border border-brand-blue/30 text-brand-blue-light text-xs font-bold flex items-center justify-center hover:bg-brand-blue/30 transition-colors"
          title="Logout"
        >
          AP
        </button>
      </div>
    </header>
  );
}
