'use client';

import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { useApi } from './useApi';

export function useApiRequest(endpoint, options = {}) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const api = useApi();

  const execute = useCallback(async (payload = null) => {
    try {
      setIsLoading(true);
      setError(null);

      const method = options.method?.toLowerCase() || 'get';
      const response = await api[method](endpoint, payload);

      setData(response);
      if (options.onSuccess) {
        options.onSuccess(response);
      }
      return response;
    } catch (err) {
      setError(err);
      if (options.onError) {
        options.onError(err);
      }
      toast.error(err.message || 'Something went wrong');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [api, endpoint, options]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    data,
    error,
    isLoading,
    execute,
    reset,
  };
}
