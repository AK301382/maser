/**
 * Custom hook for geolocation
 * Handles user location with loading and error states
 */
import { useState, useEffect } from 'react';

const DEFAULT_LOCATION = [35.6892, 51.389]; // Tehran default

export const useGeolocation = (options = {}) => {
  const [location, setLocation] = useState(DEFAULT_LOCATION);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported');
      setLoading(false);
      return;
    }

    const handleSuccess = (position) => {
      setLocation([position.coords.latitude, position.coords.longitude]);
      setLoading(false);
      setError(null);
    };

    const handleError = (err) => {
      console.error('Geolocation error:', err);
      setError(err.message);
      setLoading(false);
      // Keep default location on error
    };

    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
      ...options,
    });
  }, []);

  const refreshLocation = () => {
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation([position.coords.latitude, position.coords.longitude]);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
        ...options,
      }
    );
  };

  return { location, loading, error, refreshLocation };
};

export default useGeolocation;
