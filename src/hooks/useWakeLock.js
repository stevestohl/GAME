// src/hooks/useWakeLock.js
import { useEffect, useRef } from 'react';

export default function useWakeLock() {
  const wakeLockRef = useRef(null);

  useEffect(() => {
    const requestWakeLock = async () => {
      if ('wakeLock' in navigator) {
        try {
          wakeLockRef.current = await navigator.wakeLock.request('screen');
          console.log('Wake Lock active - screen will not sleep!');
        } catch (err) {
          console.error(`Wake Lock error: ${err.message}`);
        }
      }
    };

    // Fire immediately on mount
    requestWakeLock();

    // Re-fire if they switch tabs and come back
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && wakeLockRef.current === null) {
        await requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup: Release lock when component unmounts (game ends/leaves)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (wakeLockRef.current) {
        wakeLockRef.current.release();
        wakeLockRef.current = null;
      }
    };
  }, []);
}