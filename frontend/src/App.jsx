import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';

import Login from './pages/Login';
import Overview from './pages/Overview';
import MyAds from './pages/MyAds';
import Competitors from './pages/Competitors';
import Creatives from './pages/Creatives';

function ProtectedRoute({ children }) {
  const [authChecked, setAuthChecked] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    axios.get('/api/auth/status', { withCredentials: true })
      .then(res => setAuthenticated(res.data.authenticated))
      .catch(() => setAuthenticated(false))
      .finally(() => setAuthChecked(true));
  }, []);

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-brand-dark flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-brand-gray-700 border-t-brand-blue rounded-full animate-spin" />
      </div>
    );
  }

  if (!authenticated) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/overview" element={<ProtectedRoute><Overview /></ProtectedRoute>} />
        <Route path="/my-ads" element={<ProtectedRoute><MyAds /></ProtectedRoute>} />
        <Route path="/competitors" element={<ProtectedRoute><Competitors /></ProtectedRoute>} />
        <Route path="/creatives" element={<ProtectedRoute><Creatives /></ProtectedRoute>} />
        <Route path="/" element={<Navigate to="/overview" replace />} />
        <Route path="*" element={<Navigate to="/overview" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
