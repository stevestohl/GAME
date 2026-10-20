// 🔇 Music on/off for this device: the lobby songs and the timer music both listen to it.
// (The narrator and the players' sounds aren't music, so they keep playing.)
// The choice is remembered on this device for next time.
const STORAGE_KEY = 'gt-music-muted';

let muted = false;
try {
    muted = localStorage.getItem(STORAGE_KEY) === '1';
} catch {
    // Private browsing etc.: just start with music on
}

const listeners = new Set();

export const isMusicMuted = () => muted;

export function setMusicMuted(value) {
    muted = !!value;
    try {
        localStorage.setItem(STORAGE_KEY, muted ? '1' : '0');
    } catch {
        // Not saved, but it still works for this visit
    }
    listeners.forEach((listener) => listener(muted));
}

/** Call `listener(muted)` whenever music is switched on or off. Returns a function that stops listening. */
export function onMusicMuteChange(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}
