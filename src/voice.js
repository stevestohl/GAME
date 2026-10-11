// 🎙️ Voice-overs for the Couch Cast TV screen.
// Each line is turned into speech by the backend (ElevenLabs) and played in order.
// If voice-overs aren't set up, or a line fails, the game just carries on silently.

const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const backendBase = isLocal ? 'http://localhost:5005' : 'https://game-temple-backend.onrender.com';

let queue = [];          // lines waiting to be spoken: { audioPromise }
let currentAudio = null; // the line being spoken right now
let isPlaying = false;
let session = 0;         // bumped by stopVoice() so stale lines never start

const fetchAudio = async (text, roomCode) => {
    try {
        const response = await fetch(`${backendBase}/api/tts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, roomCode }),
        });
        if (!response.ok) return null;
        return URL.createObjectURL(await response.blob());
    } catch (err) {
        console.warn('Voice-over unavailable:', err.message);
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

    // stopVoice() was called while this line was loading
    if (mySession !== session) {
        if (url) URL.revokeObjectURL(url);
        return;
    }

    const finish = () => {
        if (url) URL.revokeObjectURL(url);
        if (mySession !== session) return;
        currentAudio = null;
        isPlaying = false;
        playNext();
    };

    if (!url) return finish();

    currentAudio = new Audio(url);
    currentAudio.onended = finish;
    currentAudio.onerror = finish;
    currentAudio.play().catch((err) => {
        console.warn('Voice-over blocked:', err.message);
        finish();
    });
};

// Written blanks ("_______") are read out as the word "blank"
const toSpokenText = (text) => String(text || '').replace(/_{2,}/g, 'blank').replace(/\s+/g, ' ').trim();

// Say one or more lines, in order, after anything already queued
export function speak(lines, roomCode) {
    [].concat(lines).map(toSpokenText).filter(Boolean).forEach((text) => {
        // Start loading straight away so there's no gap between lines
        queue.push({ audioPromise: fetchAudio(text, roomCode) });
    });
    playNext();
}

// Cut off the current line and forget anything queued (used when the screen changes)
export function stopVoice() {
    session += 1;
    queue = [];
    if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
    }
    isPlaying = false;
}
