import { useEffect } from 'react';

// 📱 On an iPhone the TV screen can't go fullscreen, but the browser hides its address bar when the
// page scrolls. The cast screens are pinned in place and never scroll, so the bar would stay forever.
// While a cast screen is showing, this gives the page a little room to scroll underneath: one swipe up
// tucks the bar away, and the game screen grows to fill the space. (See src/fullscreen.js.)
//
// Where the page sits in that room matters. It arrives wherever the last page was scrolled to, and
// at either end a swipe goes nowhere: at the top Safari shows its bar (and a pull down reloads the TV),
// at the bottom there's no room left to swipe up into. So it's parked in the middle, with room both ways.
const parkInMiddle = () => {
    const room = document.documentElement.scrollHeight - window.innerHeight;
    if (room > 0) window.scrollTo(0, Math.round(room / 2));
};

export default function useHideBrowserBar(enabled = true) {
    useEffect(() => {
        if (!enabled) return undefined;
        document.documentElement.classList.add('cast-screen');
        // Once the extra room is laid out, and again after the phone is turned
        const timer = setTimeout(parkInMiddle, 100);
        const onTurn = () => setTimeout(parkInMiddle, 300);
        window.addEventListener('orientationchange', onTurn);
        return () => {
            clearTimeout(timer);
            window.removeEventListener('orientationchange', onTurn);
            document.documentElement.classList.remove('cast-screen');
        };
    }, [enabled]);
}
