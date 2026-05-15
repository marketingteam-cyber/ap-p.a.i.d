import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function MatrixRain() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const fontSize = 14;
    const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    let cols = Math.floor(canvas.width / fontSize);
    let drops = Array.from({ length: cols }, () => Math.random() * -100);

    let animId;
    const draw = () => {
      // Semi-transparent black overlay to create fade trail
      ctx.fillStyle = 'rgba(10, 12, 18, 0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      cols = Math.floor(canvas.width / fontSize);
      if (drops.length !== cols) {
        drops = Array.from({ length: cols }, () => Math.random() * -100);
      }

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        // Lead character is bright
        ctx.fillStyle = '#3B6ED4';
        ctx.font = `${fontSize}px 'JetBrains Mono', monospace`;
        ctx.fillText(char, x, y);

        // Occasionally add a brighter "head" character
        if (drops[i] > 1) {
          ctx.fillStyle = '#E8EAF2';
          ctx.fillText(chars[Math.floor(Math.random() * chars.length)], x, y - fontSize);
        }

        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i] += 0.5;
      }

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full"
      style={{ zIndex: 0 }}
    />
  );
}

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
    <div className="min-h-screen bg-brand-black flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <MatrixRain />

      {/* Content above canvas */}
      <div className="relative w-full max-w-sm" style={{ zIndex: 1 }}>
        {/* Wordmark */}
        <div className="text-center mb-10">
          <h1 className="font-display text-4xl font-extrabold tracking-tight mb-2 drop-shadow-lg">
            <span className="text-brand-gray-100">P</span>
            <span className="text-brand-red">.</span>
            <span className="text-brand-gray-100">A</span>
            <span className="text-brand-red">.</span>
            <span className="text-brand-gray-100">I</span>
            <span className="text-brand-red">.</span>
            <span className="text-brand-gray-100">D</span>
          </h1>
          <p className="text-brand-gray-400 text-sm tracking-wide">Paid Ads Intelligence Dashboard</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-card border border-brand-gray-700 p-6 flex flex-col gap-4"
          style={{ background: 'rgba(30, 34, 48, 0.85)', backdropFilter: 'blur(12px)' }}
        >
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
