import { useState, useEffect } from 'react';

export function useRefreshCountdown() {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const next = new Date();
      next.setUTCHours(2, 30, 0, 0);
      if (next <= now) next.setUTCDate(next.getUTCDate() + 1);
      const diff = next - now;
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${h}h ${m}m ${s}s`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return timeLeft;
}
