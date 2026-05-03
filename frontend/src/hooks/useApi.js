import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export function useApi(url, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { params, skip } = options;

  const fetch = useCallback(async () => {
    if (skip) return;
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(url, { params, withCredentials: true });
      setData(response.data);
    } catch (err) {
      if (err.response?.status === 401) {
        window.location.href = '/login';
      }
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }, [url, JSON.stringify(params), skip]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

export function usePost(url) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const post = useCallback(async (body) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(url, body, { withCredentials: true });
      return response.data;
    } catch (err) {
      const errMsg = err.response?.data?.error || err.message;
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setLoading(false);
    }
  }, [url]);

  return { post, loading, error };
}
