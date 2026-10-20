import { useEffect } from 'react';

// 📱 On an iPhone the TV screen can't go fullscreen, but the browser hides its address bar when the
// page scrolls. The cast screens are pinned in place and never scroll, so the bar would stay forever.
// While a cast screen is showing, this gives the page a little room to scroll underneath: one swipe up
// tucks the bar away, and the game screen grows to fill the space. (See src/fullscreen.js.)
export default function useHideBrowserBar(enabled = true) {
    useEffect(() => {
        if (!enabled) return undefined;
        document.documentElement.classList.add('cast-screen');
        return () => document.documentElement.classList.remove('cast-screen');
    }, [enabled]);
}
