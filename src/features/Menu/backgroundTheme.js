import { useEffect, useSyncExternalStore } from 'react';

/**
 * 🎨 Which look the animated background is wearing right now.
 * The background is rendered once (in Page.jsx); any screen can re-theme it
 * with useSetBackgroundTheme() and it snaps back to 'home' when that screen leaves.
 *
 * theme: a key of THEMES in AnimatedBackground.jsx ('home', 'couchcast', 'halloween')
 * cover: true lifts the background above the nav bar (used by the fullscreen TV screens)
 */
const DEFAULT_THEME = { theme: 'home', cover: false };

let current = DEFAULT_THEME;
const listeners = new Set();

const setBackgroundTheme = (next) => {
    if (next.theme === current.theme && next.cover === current.cover) return;
    current = next;
    // Also stamped on <html> so plain CSS can follow the theme (e.g. the shimmer borders)
    document.documentElement.dataset.gtTheme = next.theme;
    listeners.forEach((listener) => listener());
};

const subscribe = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
};

// Read the current theme (used by AnimatedBackground)
export function useBackgroundTheme() {
    return useSyncExternalStore(subscribe, () => current);
}

// Wear a theme for as long as the calling component is on screen
export function useSetBackgroundTheme(theme, cover = false) {
    useEffect(() => {
        setBackgroundTheme({ theme, cover });
        return () => setBackgroundTheme(DEFAULT_THEME);
    }, [theme, cover]);
}

// Couch Cast: each card deck (expansion) gets its own background
export function couchCastTheme(expansion) {
    return expansion === 'halloween' ? 'halloween' : 'couchcast';
}
