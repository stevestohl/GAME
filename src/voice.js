// 🎙️ Voice-overs for the Couch Cast TV screen.
// Each line is turned into speech by the backend (ElevenLabs) and played in order.
// If voice-overs aren't set up, or a line fails, the game just carries on silently.

const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const backendBase = isLocal ? 'http://localhost:5005' : 'https://game-temple-backend.onrender.com';

// One audio player for every line. Phones only let a page make sound after a tap,
// and that permission sticks to the player that was started by the tap (see unlockVoice).
const player = new Audio();
const SILENCE = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';

let queue = [];          // lines waiting to be spoken: { audioPromise, keep, done }
let currentDone = null;  // tells speak() how the current line ended
let isPlaying = false;
let session = 0;         // bumped by stopVoice() so stale lines never start

// Lines fetched ahead of time (text -> Promise of an audio URL), so they start instantly
const preloaded = new Map();
const MAX_PRELOADED = 60;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchAudio = async (text, roomCode, attempt = 1) => {
    try {
        const response = await fetch(`${backendBase}/api/tts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, roomCode }),
        });

        if (!response.ok) {
            const detail = await response.json().catch(() => ({}));
            console.warn(`Voice-over failed (${response.status}): ${detail.message || 'no details'} — "${text.slice(0, 40)}"`);
            // The voice service hiccuped: one more go. Anything else (no key, limit reached) won't change.
            if (response.status >= 500 && response.status !== 503 && attempt === 1) {
                await wait(400);
                return fetchAudio(text, roomCode, 2);
            }
            return null;
        }

        return URL.createObjectURL(await response.blob());
    } catch (err) {
        console.warn(`Voice-over unavailable: ${err.message}`);
        if (attempt === 1) {
            await wait(400);
            return fetchAudio(text, roomCode, 2);
        }
        return null;
    }
};

const playNext = async () => {
    if (isPlaying) return;
    const next = queue.shift();
    if (!next) return;

    isPlaying = true;
    const mySession = session;
    const url = await next.audioPromise;
    const release = () => { if (url && !next.keep) URL.revokeObjectURL(url); };

    // stopVoice() was called while this line was loading
    if (mySession !== session) {
        release();
        next.done(false);
        return;
    }

    // wasSpoken: true only if the line played all the way through
    const finish = (wasSpoken) => {
        player.onended = null;
        player.onerror = null;
        release();
        next.done(wasSpoken);
        if (mySession !== session) return;
        currentDone = null;
        isPlaying = false;
        playNext();
    };

    if (!url) return finish(false);

    currentDone = next.done;
    player.onended = () => finish(true);
    player.onerror = () => finish(false);
    player.src = url;
    player.play().catch((err) => {
        console.warn(`Voice-over blocked by the browser: ${err.message}`);
        finish(false);
    });
};

// Written blanks ("_______") are read out as the word "blank"
const toSpokenText = (text) => String(text || '').replace(/_{2,}/g, 'blank').replace(/\s+/g, ' ').trim();

// Call this from a tap/click (e.g. the button that starts the game) so the
// browser lets the narrator speak later without another tap.
export function unlockVoice() {
    if (isPlaying) return;
    player.src = SILENCE;
    player.play().catch(() => {});
}

// Fetch lines ahead of time so they start the moment they're needed
export function preloadVoice(lines, roomCode) {
    [].concat(lines).map(toSpokenText).filter(Boolean).forEach((text) => {
        if (preloaded.has(text)) return;

        // Full: drop the oldest line
        if (preloaded.size >= MAX_PRELOADED) {
            const [oldestText, oldestPromise] = preloaded.entries().next().value;
            preloaded.delete(oldestText);
            oldestPromise.then((url) => url && URL.revokeObjectURL(url));
        }

        const audioPromise = fetchAudio(text, roomCode);
        preloaded.set(text, audioPromise);
        // A failed line isn't kept, so it gets another chance when it's actually spoken
        audioPromise.then((url) => { if (!url && preloaded.get(text) === audioPromise) preloaded.delete(text); });
    });
}

// Say one or more lines, in order, after anything already queued.
// Resolves when they're finished: true if every line was actually spoken,
// false if the voice is unavailable or it was cut off by stopVoice().
export function speak(lines, roomCode) {
    const results = [].concat(lines).map(toSpokenText).filter(Boolean).map((text) => {
        return new Promise((resolve) => {
            const ready = preloaded.get(text);
            // Start loading straight away so there's no gap between lines
            queue.push({ audioPromise: ready || fetchAudio(text, roomCode), keep: !!ready, done: resolve });
        });
    });
    playNext();
    return Promise.all(results).then((spoken) => spoken.length > 0 && spoken.every(Boolean));
}

// Cut off the current line and forget anything queued (used when the screen changes)
export function stopVoice() {
    session += 1;
    queue.forEach((line) => line.done(false));
    queue = [];
    player.onended = null;
    player.onerror = null;
    player.pause();
    if (currentDone) {
        currentDone(false);
        currentDone = null;
    }
    isPlaying = false;
}
