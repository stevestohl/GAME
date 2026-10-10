// src/hooks/useWakeLock.js
import { useEffect } from 'react';

/**
 * Keeps the screen awake for as long as the calling component is on screen.
 *
 * The browser drops a wake lock on its own whenever the page is hidden
 * (switching apps, the "start casting" system dialog, locking the phone...)
 * and it can refuse one outright (battery saver, page not visible yet).
 * So one request on mount isn't enough: this keeps asking again whenever
 * the lock is lost or the page comes back.
 */
export default function useWakeLock() {
  useEffect(() => {
    if (!('wakeLock' in navigator)) {
      console.warn('Wake Lock is not supported on this browser - the screen may sleep.');
      return;
    }

    let wakeLock = null;
    let isRequesting = false;
    let isActive = true; // false once the component has unmounted

    const requestWakeLock = async () => {
      // Already holding one, already asking, or the browser would refuse (hidden page)
      if (!isActive || isRequesting || (wakeLock && !wakeLock.released)) return;
      if (document.visibilityState !== 'visible') return;

      isRequesting = true;
      try {
        const lock = await navigator.wakeLock.request('screen');

        // Unmounted while we were waiting: hand it straight back
        if (!isActive) {
          lock.release();
          return;
        }

        wakeLock = lock;
        console.log('Wake Lock active - screen will not sleep!');

        // The browser took it away: grab it again as soon as we're allowed to
        lock.addEventListener('release', () => {
          if (wakeLock === lock) wakeLock = null;
          requestWakeLock();
        });
      } catch (err) {
        // Refused for now; the listeners below will try again
        console.warn(`Wake Lock error: ${err.message}`);
      } finally {
        isRequesting = false;
      }
    };

    // Fire immediately on mount
    requestWakeLock();

    // Try again whenever the page comes back, changes fullscreen, or gets touched.
    // (A tap is the fallback for browsers that refused the first request.)
    document.addEventListener('visibilitychange', requestWakeLock);
    document.addEventListener('fullscreenchange', requestWakeLock);
    document.addEventListener('pointerdown', requestWakeLock);
    window.addEventListener('focus', requestWakeLock);
    window.addEventListener('pageshow', requestWakeLock);

    // Cleanup: Release lock when component unmounts (game ends/leaves)
    return () => {
      isActive = false;
      document.removeEventListener('visibilitychange', requestWakeLock);
      document.removeEventListener('fullscreenchange', requestWakeLock);
      document.removeEventListener('pointerdown', requestWakeLock);
      window.removeEventListener('focus', requestWakeLock);
      window.removeEventListener('pageshow', requestWakeLock);
      if (wakeLock) {
        wakeLock.release();
        wakeLock = null;
      }
    };
  }, []);
}
