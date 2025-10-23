/**
 * Custom hook for handling async operations
 * Provides loading, error, and data states
 */
import { useState, useCallback } from 'react';

export const useAsync = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (asyncFunction) => {
    setLoading(true);
    setError(null);

    try {
      const result = await asyncFunction();
      setLoading(false);
      return result;
    } catch (err) {
      setError(err);
      setLoading(false);
      throw err;
    }
  }, []);

  return { loading, error, execute };
};

export default useAsync;
