// 🎭 Trivia Cast's curtain call: the end credits' music, our own recording (public/audio/TriviaCurtainCall.m4a, made
// in audio-originals/trivia-curtain-call). One bar is 1.8 s, so it keeps time with the finale (QuizFinale.jsx): a drum
// roll while the curtains sweep in (bar 0), a fanfare as they part (bars 1-2), the theme in B-flat (bars 3-10), then
// a bigger one in C (bars 11-18) that goes round for as long as the credits roll. When they're over it finishes on
// the next bar line with one of its two endings, in the key it's playing in.
// It's part of the soundtrack, so the caster's 🔇 music button silences it like the rest.

import { getAudioContext } from '../../chime.js';
import { isMusicMuted, onMusicMuteChange } from '../../musicMute.js';

const SRC = '/audio/TriviaCurtainCall.m4a';
const BAR = 1.8;
const LOOP_FROM = 11;            // the theme in C: bars 11-18 go round
const LOOP_TO = 19;
const ENDINGS = { bb: 22 * BAR, c: 27 * BAR };   // where each ending starts in the file
const ENDING_SECONDS = 8.5;      // the stabs, the held chord, the last hit and its ring
const LAST_HIT = 1.75 * BAR;     // the last hit, from the start of the ending
const VOLUME = 0.42;             // as loud as the lobby songs (a touch louder than the old march)
const LOOP_FADE = 0.02;          // seconds blended across the loop's join

let song = null;
let loading = null;

// The loop's two ends come from different passes of the room's reverb: blend the last moment before the end into
// the moment before the start, so going round doesn't click
const smoothLoopJoin = (buffer) => {
    const rate = buffer.sampleRate;
    const fade = Math.round(LOOP_FADE * rate);
    const s = Math.round(LOOP_FROM * BAR * rate);
    const e = Math.round(LOOP_TO * BAR * rate);
    for (let c = 0; c < buffer.numberOfChannels; c++) {
        const data = buffer.getChannelData(c);
        for (let i = 0; i < fade; i++) {
            const t = (i + 1) / fade;
            data[e - fade + i] = data[e - fade + i] * Math.cos(t * Math.PI / 2) + data[s - fade + i] * Math.sin(t * Math.PI / 2);
        }
    }
};

/** Start downloading it (the TV does this once the game's under way, so it's ready for the end) */
export function preloadCurtainCall() {
    const ctx = getAudioContext();
    if (!ctx || loading) return loading;
    loading = fetch(SRC)
        .then((res) => res.arrayBuffer())
        .then((data) => new Promise((resolve, reject) => ctx.decodeAudioData(data, resolve, reject)))
        .then((buffer) => {
            smoothLoopJoin(buffer);
            song = buffer;
            return buffer;
        })
        .catch(() => { loading = null; return null; });
    return loading;
}

/**
 * Start the curtain call from its drum roll. Returns null if it hasn't downloaded yet (the finale falls back to
 * the old drum roll and march), else:
 *   finish(): the credits are over, so end it on the next bar line
 *   stop():   the finale's gone (Play Again, or it's over): fade out, but never before the last hit
 */
export function startCurtainCall() {
    const ctx = getAudioContext();
    if (!ctx || !song) return null;
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});

    const out = ctx.createGain();
    const level = () => (isMusicMuted() ? 0.0001 : VOLUME);
    out.gain.setValueAtTime(level(), ctx.currentTime);
    out.connect(ctx.destination);
    let fading = false;
    const stopWatchingMute = onMusicMuteChange(() => {
        if (!fading) out.gain.setTargetAtTime(level(), ctx.currentTime, 0.05);
    });

    const main = ctx.createGain();
    main.connect(out);
    const source = ctx.createBufferSource();
    source.buffer = song;
    source.loop = true;
    source.loopStart = LOOP_FROM * BAR;
    source.loopEnd = LOOP_TO * BAR;
    source.connect(main);
    const t0 = ctx.currentTime + 0.05;
    source.start(t0);

    let lastHitAt = null;         // set once the ending is on its way
    let done = false;
    const cleanUp = (afterSeconds) => {
        setTimeout(() => {
            stopWatchingMute();
            out.disconnect();
        }, afterSeconds * 1000);
    };

    return {
        finish() {
            if (done || lastHitAt !== null) return;
            const now = ctx.currentTime;
            // The next bar line at least 60 ms away; which bar of the music that is (bars 19 on go round 11-18)
            const bar = Math.max(3, Math.ceil((now + 0.06 - t0) / BAR));
            const musicBar = bar < LOOP_TO ? bar : LOOP_FROM + ((bar - LOOP_TO) % (LOOP_TO - LOOP_FROM));
            const when = t0 + bar * BAR;
            const ending = ctx.createBufferSource();
            ending.buffer = song;
            ending.connect(out);
            ending.start(when, musicBar >= LOOP_FROM ? ENDINGS.c : ENDINGS.bb, ENDING_SECONDS);
            main.gain.setValueAtTime(1, when);
            main.gain.linearRampToValueAtTime(0.0001, when + 0.12);
            source.stop(when + 0.15);
            lastHitAt = when + LAST_HIT;
            cleanUp(when - now + ENDING_SECONDS + 0.5);
        },
        stop() {
            if (done) return;
            done = true;
            fading = true;
            const now = ctx.currentTime;
            // During the ending, let the last hit land and ring a moment first. Stopped before it's even got going
            // (React's development mode starts the finale twice), it goes at once, so the two don't overlap.
            const justStarted = now < t0 + 0.3;
            const from = lastHitAt !== null ? Math.max(now, lastHitAt + 1) : now;
            out.gain.cancelScheduledValues(now);
            out.gain.setValueAtTime(out.gain.value, now);
            out.gain.setTargetAtTime(0.0001, from, lastHitAt !== null ? 0.5 : justStarted ? 0.005 : 0.2);
            if (lastHitAt === null) {
                try { source.stop(now + (justStarted ? 0.05 : 1.5)); } catch (err) { /* already stopped */ }
                cleanUp(2);
            }
        },
    };
}
