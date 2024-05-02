import { useState, useEffect } from 'react';

export function useFetch(url: string, options?: RequestInit) {
  const [data, setData] = useState<Response | null>(null);
  const [loading, setLoading] = useState<string | boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading('loading...');
    setData(null);
    setError(null);

    fetch(url, options)
      .then(res => {
        setLoading(false);
        setData(res);
      })
      .catch(err => {
        setLoading(false);
        setError(err);
      });
  }, [url, options])

  return { data, loading, error };
}