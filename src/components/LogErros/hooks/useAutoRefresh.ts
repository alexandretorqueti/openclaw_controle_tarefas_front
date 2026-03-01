import { useState, useEffect, useRef } from 'react';

const POLLING_INTERVAL = 300000; // 5 minutes

export const useAutoRefresh = (refreshCallback: () => Promise<void>) => {
  const [autoRefresh, setAutoRefresh] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (autoRefresh) {
      // Start polling
      intervalRef.current = setInterval(() => {
        refreshCallback();
      }, POLLING_INTERVAL);
    } else if (intervalRef.current) {
      // Clear polling
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoRefresh, refreshCallback]);

  return { autoRefresh, setAutoRefresh };
};