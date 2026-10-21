// src/hooks/useWakeLock.js
import { useEffect } from 'react';
import { KEEP_AWAKE_VIDEO } from '../keepAwakeVideo.js';

// 🎞️ Backup for iPhones and iPads: their browsers often ignore the wake lock (Chrome on iPhone,
// Low Power Mode...), but they never let the screen sleep while a video is playing. So on those,
// a tiny silent, invisible video (src/keepAwakeVideo.js, 2 KB) loops for as long as the game is up.
export const isAppleTouch = () => /iPhone|iPad|iPod/.test(navigator.userAgent)
  || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);   // iPads say they're a Mac

let keepAwakeVideo = null;
const getKeepAwakeVideo = () => {
  if (!keepAwakeVideo) {
    const video = document.createElement('video');
    video.src = KEEP_AWAKE_VIDEO;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('aria-hidden', 'true');
    Object.assign(video.style, {
      position: 'fixed', left: '0', bottom: '0', width: '1px', height: '1px',
      opacity: '0.01', pointerEvents: 'none', zIndex: '-1',
    });
    document.body.appendChild(video);
    keepAwakeVideo = video;
  }
  return keepAwakeVideo;
};

/** Start the keep-awake video. Call it from a tap too: in Low Power Mode, video only starts from a tap. */
export function playKeepAwakeVideo() {
  const video = getKeepAwakeVideo();
  if (video.paused) video.play().catch(() => {});   // refused for now: the next tap tries again
}

const stopKeepAwakeVideo = () => {
  if (keepAwakeVideo && !keepAwakeVideo.paused) keepAwakeVideo.pause();
};

/**
 * Keeps the screen awake for as long as the calling component is on screen.
 *
 * The browser drops a wake lock on its own whenever the page is hidden
 * (switching apps, the "start casting" system dialog, locking the phone...)
 * and it can refuse one outright (battery saver, page not visible yet).
 * So one request on mount isn't enough: this keeps asking again whenever
 * the lock is lost or the page comes back.
 * On iPhones and iPads (and browsers with no wake lock, or that refuse it), the keep-awake
 * video above plays as well.
 */
export default function useWakeLock() {
  useEffect(() => {
    const hasWakeLock = 'wakeLock' in navigator;
    let useVideo = !hasWakeLock || isAppleTouch();

    let wakeLock = null;
    let isRequesting = false;
    let isActive = true; // false once the component has unmounted

    const requestWakeLock = async () => {
      if (!isActive || document.visibilityState !== 'visible') return;
      if (useVideo) playKeepAwakeVideo();
      // Already holding one, already asking, or no wake lock in this browser
      if (!hasWakeLock || isRequesting || (wakeLock && !wakeLock.released)) return;

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
        // Refused for now; the listeners below will try again, and the video steps in meanwhile
        console.warn(`Wake Lock error: ${err.message}`);
        useVideo = true;
        playKeepAwakeVideo();
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
      stopKeepAwakeVideo();
    };
  }, []);
}
