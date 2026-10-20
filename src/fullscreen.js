// 📺 Getting the TV screen to fill the whole display, with no browser bar.
//
//   Android, computers:  real fullscreen, asked for by the tap that creates the room
//   iPad:                the same, through Safari's older webkit- version of it
//   iPhone:              websites can't go fullscreen there (only videos can). Two ways round it:
//                        - swipe up once: cast screens have a little room to scroll
//                          (useHideBrowserBar), and the browser hides its bar when the page scrolls
//                        - Share -> Add to Home Screen: opened from there, there's no browser bar at all

import { playKeepAwakeVideo, isAppleTouch } from './hooks/useWakeLock.js';

/** Ask for fullscreen. Call it inside a tap; devices that don't allow it just carry on. */
export async function enterFullscreen() {
    // iPhone/iPad: start the keep-awake video in this tap (see hooks/useWakeLock.js)
    if (isAppleTouch()) playKeepAwakeVideo();
    const page = document.documentElement;
    const request = page.requestFullscreen || page.webkitRequestFullscreen;
    if (!request || document.fullscreenElement || document.webkitFullscreenElement) return;
    try {
        await request.call(page);
    } catch (err) {
        console.warn("Fullscreen bypassed:", err.message);
    }
}

// iPhone or iPod (iPads say they're a Mac, but they can go fullscreen, so they're not counted)
export const isIPhone = () => /iPhone|iPod/.test(navigator.userAgent);

// Opened from a home screen icon, so there's no browser bar to hide
export const isHomeScreenApp = () =>
    window.navigator.standalone === true || window.matchMedia?.('(display-mode: standalone)').matches
    || window.matchMedia?.('(display-mode: fullscreen)').matches;
