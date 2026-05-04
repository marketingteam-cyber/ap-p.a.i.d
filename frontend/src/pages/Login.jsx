import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Login() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await axios.post('/api/auth/login', { password }, { withCredentials: true });
      navigate('/overview');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid password');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Wordmark */}
        <div className="text-center mb-10">
          <h1 className="font-display text-4xl font-extrabold tracking-tight mb-2">
            <span className="text-brand-gray-100">P</span>
            <span className="text-brand-red">.</span>
            <span className="text-brand-gray-100">A</span>
            <span className="text-brand-red">.</span>
            <span className="text-brand-gray-100">I</span>
            <span className="text-brand-red">.</span>
            <span className="text-brand-gray-100">D</span>
          </h1>
          <p className="text-brand-gray-500 text-sm">Paid Ads Intelligence Dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-brand-gray-900 rounded-card border border-brand-gray-700 p-6 flex flex-col gap-4">
          <div>
            <label className="block text-xs font-mono text-brand-gray-500 uppercase tracking-wider mb-2">
              Dashboard Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full bg-brand-dark border border-brand-gray-700 rounded-btn px-4 py-3 text-brand-gray-100 text-sm placeholder-brand-gray-500 focus:outline-none focus:border-brand-blue transition-colors"
              autoFocus
            />
          </div>

          {error && (
            <p className="text-xs text-failing bg-failing/10 border border-failing/20 rounded-btn px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full bg-brand-blue hover:bg-brand-blue-dark disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium text-sm py-3 rounded-btn transition-colors"
          >
            {loading ? 'Authenticating...' : 'Enter Dashboard'}
          </button>
        </form>

        <p className="text-center text-xs text-brand-gray-500 mt-4">
          AssetPlus · Internal Use Only
        </p>
      </div>
    </div>
  );
}
