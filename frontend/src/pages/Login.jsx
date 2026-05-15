import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function MatrixRain() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const fontSize = 14;
    const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    let cols, drops, animId;

    const init = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      cols  = Math.floor(canvas.width / fontSize);
      drops = Array.from({ length: cols }, () => Math.floor(Math.random() * -50));
    };

    const draw = () => {
      ctx.fillStyle = 'rgba(10, 12, 18, 0.18)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < cols; i++) {
        const y = drops[i] * fontSize;
        const x = i * fontSize;

        // bright head
        ctx.fillStyle = '#E8EAF2';
        ctx.fillText(chars[Math.floor(Math.random() * chars.length)], x, y);

        // trail character
        ctx.fillStyle = '#1A4FBA';
        ctx.fillText(chars[Math.floor(Math.random() * chars.length)], x, y + fontSize);

        if (y > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }

      animId = requestAnimationFrame(draw);
    };

    init();
    draw();
    window.addEventListener('resize', init);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', init);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0, left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        display: 'block',
        backgroundColor: '#0A0C12',
      }}
    />
  );
}

export default function Login() {
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
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
    <>
      <MatrixRain />

      {/* Form layer — completely independent from canvas */}
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}>
        <div style={{ width: '100%', maxWidth: '360px' }}>

          {/* Wordmark */}
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h1 className="font-display" style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
              <span style={{ color: '#E8EAF2' }}>P</span>
              <span style={{ color: '#CC2020' }}>.</span>
              <span style={{ color: '#E8EAF2' }}>A</span>
              <span style={{ color: '#CC2020' }}>.</span>
              <span style={{ color: '#E8EAF2' }}>I</span>
              <span style={{ color: '#CC2020' }}>.</span>
              <span style={{ color: '#E8EAF2' }}>D</span>
            </h1>
            <p style={{ color: '#6B7291', fontSize: '0.875rem', letterSpacing: '0.05em' }}>
              Paid Ads Intelligence Dashboard
            </p>
          </div>

          {/* Card */}
          <form
            onSubmit={handleSubmit}
            style={{
              background: 'rgba(30, 34, 48, 0.88)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid #3A3F52',
              borderRadius: '12px',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', fontFamily: 'monospace', color: '#6B7291', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
                Dashboard Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter password"
                autoFocus
                style={{
                  width: '100%',
                  background: '#131722',
                  border: '1px solid #3A3F52',
                  borderRadius: '8px',
                  padding: '0.75rem 1rem',
                  color: '#E8EAF2',
                  fontSize: '0.875rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {error && (
              <p style={{ fontSize: '0.75rem', color: '#CC2020', background: 'rgba(204,32,32,0.1)', border: '1px solid rgba(204,32,32,0.2)', borderRadius: '8px', padding: '0.5rem 0.75rem', margin: 0 }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              style={{
                width: '100%',
                background: loading || !password ? '#1A3070' : '#1A4FBA',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '0.75rem',
                fontSize: '0.875rem',
                fontWeight: 500,
                cursor: loading || !password ? 'not-allowed' : 'pointer',
                opacity: loading || !password ? 0.5 : 1,
                transition: 'background 0.2s',
              }}
            >
              {loading ? 'Authenticating...' : 'Enter Dashboard'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '0.7rem', color: '#6B7291', marginTop: '1rem' }}>
            AssetPlus · Internal Use Only
          </p>
        </div>
      </div>
    </>
  );
}
