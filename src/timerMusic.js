// ⏳ Timer music: tick-tock / waiting music that plays while a clock is running
// (picking a prompt, writing an answer, answering a trivia question, writing a list).
//
// All four tracks are made in the browser with the Web Audio API, like the chime, so there are
// no audio files to download. Each time a timer starts, a track is picked at random (never the
// same one twice in a row). In the last 10 seconds a hurry-up tick joins in, and in the last 5
// it doubles up. While the narrator is speaking, the music dips so the voice stays clear.
//
//   useTimerMusic(isActive, { endTime, key })   <- the easy way, from a React screen
//   startTimerMusic({ endTime, trackId }) / stopTimerMusic()

import { useEffect } from 'react';
import { getAudioContext } from './chime.js';
import { onVoiceChange } from './voice.js';
import { isMusicMuted, onMusicMuteChange } from './musicMute.js';

const VOLUME = 1.1;           // overall loudness of the music (about as loud as the lobby music)
const DUCKED = 0.3;           // how much of that is left while the narrator talks
const HURRY_SECONDS = 10;     // the hurry-up tick starts here...
const PANIC_SECONDS = 5;      // ...and doubles up here
const LOOKAHEAD = 0.15;       // schedule notes this far ahead (seconds)
const SCHEDULER_MS = 25;

const midi = (note) => 440 * Math.pow(2, (note - 69) / 12);

// ---------------------------------------------------------------------------------------------
// 🥁 Instruments: each one makes a short sound at time `t` into `out`
// ---------------------------------------------------------------------------------------------
let noiseBuffer = null;
const getNoise = (ctx) => {
    if (noiseBuffer && noiseBuffer.sampleRate === ctx.sampleRate) return noiseBuffer;
    noiseBuffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    return noiseBuffer;
};

const envelope = (ctx, t, peak, attack, decay) => {
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0002), t + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
    return gain;
};

const tone = (ctx, out, t, { freq, type = 'sine', vol = 0.2, attack = 0.005, decay = 0.3, filter = null, detune = 0 }) => {
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (detune) osc.detune.setValueAtTime(detune, t);
    const gain = envelope(ctx, t, vol, attack, decay);
    let node = osc;
    if (filter) {
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.setValueAtTime(filter, t);
        osc.connect(lp);
        node = lp;
    }
    node.connect(gain);
    gain.connect(out);
    osc.start(t);
    osc.stop(t + attack + decay + 0.05);
};

const noise = (ctx, out, t, { vol = 0.1, decay = 0.05, type = 'highpass', freq = 7000, q = 0.7 }) => {
    const src = ctx.createBufferSource();
    src.buffer = getNoise(ctx);
    const filter = ctx.createBiquadFilter();
    filter.type = type;
    filter.frequency.setValueAtTime(freq, t);
    filter.Q.setValueAtTime(q, t);
    const gain = envelope(ctx, t, vol, 0.002, decay);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(out);
    src.start(t, Math.random() * 0.5);
    src.stop(t + decay + 0.05);
};

const inst = {
    // A wooden clock "tick" (high) or "tock" (low)
    tick: (ctx, out, t, freq = 2000, vol = 0.25) => {
        noise(ctx, out, t, { vol: vol * 2.5, decay: 0.025, type: 'bandpass', freq, q: 2.5 });
        tone(ctx, out, t, { freq, vol: vol * 0.7, decay: 0.035 });
        tone(ctx, out, t, { freq: freq * 0.5, type: 'triangle', vol: vol * 0.5, decay: 0.02 });
    },
    hat: (ctx, out, t, vol = 0.05) => noise(ctx, out, t, { vol, decay: 0.04, freq: 8000 }),
    brush: (ctx, out, t, vol = 0.04) => noise(ctx, out, t, { vol, decay: 0.12, type: 'bandpass', freq: 5000, q: 0.6 }),
    kick: (ctx, out, t, vol = 0.5) => {
        const osc = ctx.createOscillator();
        osc.frequency.setValueAtTime(130, t);
        osc.frequency.exponentialRampToValueAtTime(42, t + 0.14);
        const gain = envelope(ctx, t, vol, 0.003, 0.22);
        osc.connect(gain);
        gain.connect(out);
        osc.start(t);
        osc.stop(t + 0.3);
    },
    bass: (ctx, out, t, note, vol = 0.3, decay = 0.35) =>
        tone(ctx, out, t, { freq: midi(note), type: 'triangle', vol, attack: 0.01, decay, filter: 900 }),
    pulse: (ctx, out, t, note, vol = 0.12, decay = 0.18) =>
        tone(ctx, out, t, { freq: midi(note), type: 'sawtooth', vol, attack: 0.005, decay, filter: 700 }),
    marimba: (ctx, out, t, note, vol = 0.22) => {
        tone(ctx, out, t, { freq: midi(note), vol, decay: 0.45 });
        tone(ctx, out, t, { freq: midi(note) * 4, vol: vol * 0.25, decay: 0.08 });
    },
    musicBox: (ctx, out, t, note, vol = 0.1) => {
        tone(ctx, out, t, { freq: midi(note), vol, decay: 0.9 });
        tone(ctx, out, t, { freq: midi(note) * 3, vol: vol * 0.15, decay: 0.3 });
    },
    keys: (ctx, out, t, notes, vol = 0.07, decay = 0.7) => notes.forEach((n, i) => {
        tone(ctx, out, t, { freq: midi(n), vol, attack: 0.01, decay, detune: i % 2 ? 4 : -4 });
        tone(ctx, out, t, { freq: midi(n) * 2, type: 'triangle', vol: vol * 0.2, attack: 0.01, decay: decay * 0.5 });
    }),
    stab: (ctx, out, t, notes, vol = 0.05) => notes.forEach((n) =>
        tone(ctx, out, t, { freq: midi(n), type: 'sawtooth', vol, attack: 0.01, decay: 0.25, filter: 1600 })),
    bell: (ctx, out, t, note, vol = 0.12) => {
        tone(ctx, out, t, { freq: midi(note), vol, decay: 1.6 });
        tone(ctx, out, t, { freq: midi(note) * 2.76, vol: vol * 0.3, decay: 0.8 });
    },
};

// ---------------------------------------------------------------------------------------------
// 🎼 The four tracks. play() is called once per 16th note: `step` counts up forever from 0,
// so step % 16 is the position in the bar and Math.floor(step / 16) is the bar number.
// ---------------------------------------------------------------------------------------------
export const TIMER_TRACKS = [
    {
        // The classic: a grandfather clock with a little music box drifting over it
        id: 'grandfather-clock',
        name: 'Grandfather Clock',
        bpm: 100,
        play(ctx, out, step, t) {
            const pos = step % 16;
            const bar = Math.floor(step / 16) % 8;
            if (pos % 4 === 0) inst.tick(ctx, out, t, (pos / 4) % 2 === 0 ? 2100 : 1400, 0.28);
            const roots = [45, 41, 43, 40, 45, 41, 38, 40]; // A F G E A F D E
            if (pos === 0) inst.bass(ctx, out, t, roots[bar], 0.22, 1.1);
            if (pos === 8) inst.bass(ctx, out, t, roots[bar] + 7, 0.14, 0.9);
            if (bar === 0 && pos === 0 && step > 0) inst.bell(ctx, out, t, 81, 0.08);
            // A sparse music-box line every other bar
            const tunes = { 1: [[0, 76], [6, 74], [12, 72]], 3: [[0, 71], [4, 72], [8, 74]], 5: [[0, 76], [6, 79], [12, 77]], 7: [[0, 76], [8, 71]] };
            (tunes[bar] || []).forEach(([p, n]) => { if (p === pos) inst.musicBox(ctx, out, t, n); });
        },
    },
    {
        // A cocktail-lounge shuffle: walking bass, brushes and soft electric piano
        id: 'lounge-wait',
        name: 'Lounge Wait',
        bpm: 104,
        swing: 0.33,
        play(ctx, out, step, t) {
            const pos = step % 16;
            const bar = Math.floor(step / 16) % 4;
            const walks = [[38, 41, 45, 48], [43, 47, 50, 49], [36, 40, 43, 45], [45, 44, 43, 40]]; // Dm7 G7 Cmaj7 A7
            const chords = [[62, 65, 69, 72], [59, 65, 67, 71], [60, 64, 67, 71], [61, 64, 67, 69]];
            if (pos % 4 === 0) inst.bass(ctx, out, t, walks[bar][pos / 4], 0.3, 0.32);
            if (pos % 2 === 0) inst.brush(ctx, out, t, pos % 4 === 0 ? 0.035 : 0.05);
            if (pos === 4 || pos === 12) inst.tick(ctx, out, t, 1700, 0.12);
            if (pos === 4) inst.keys(ctx, out, t, chords[bar], 0.06, 0.6);
            if (pos === 14) inst.keys(ctx, out, t, chords[bar], 0.05, 0.4);
        },
    },
    {
        // Light and bouncy: a marimba noodling over a woodblock tick-tock
        id: 'marimba-mull',
        name: 'Marimba Mull',
        bpm: 116,
        play(ctx, out, step, t) {
            const pos = step % 16;
            const bar = Math.floor(step / 16) % 4;
            const arps = [[60, 64, 67, 72, 67, 64, 67, 64], [57, 60, 64, 69, 64, 60, 64, 60], [53, 57, 60, 65, 60, 57, 60, 57], [55, 59, 62, 67, 62, 59, 62, 65]];
            if (pos % 2 === 0) inst.marimba(ctx, out, t, arps[bar][pos / 2] + 12, pos === 0 ? 0.2 : 0.13);
            if (pos % 4 === 0) inst.tick(ctx, out, t, (pos / 4) % 2 === 0 ? 1900 : 1250, 0.2);
            if (pos === 0 || pos === 8) inst.bass(ctx, out, t, [36, 33, 29, 31][bar] + 12, 0.25, 0.3);
        },
    },
    {
        // Game-show tension: a pulsing bass, a heartbeat kick and a racing clock
        id: 'countdown-pulse',
        name: 'Countdown Pulse',
        bpm: 120,
        play(ctx, out, step, t) {
            const pos = step % 16;
            const bar = Math.floor(step / 16) % 4;
            const roots = [45, 41, 38, 40]; // Am F Dm E
            const stabs = [[69, 72, 76], [69, 72, 77], [69, 74, 77], [68, 71, 76]];
            if (pos % 2 === 0) inst.pulse(ctx, out, t, roots[bar] + (pos % 8 === 6 ? 12 : 0), 0.11);
            if (pos === 0 || pos === 8 || pos === 10) inst.kick(ctx, out, t, pos === 10 ? 0.3 : 0.45);
            inst.tick(ctx, out, t, 2600, pos % 4 === 0 ? 0.08 : 0.035);
            if (pos === 0 || pos === 6 || pos === 12) inst.stab(ctx, out, t, stabs[bar], 0.035);
        },
    },
];

// ---------------------------------------------------------------------------------------------
// 🛋️ Lobby songs, made the same way (no audio files, nothing copyrighted). They loop forever and
// are never picked at random for a timer; lobbyMusic.js plays them by id.
// ---------------------------------------------------------------------------------------------
export const LOBBY_SYNTH_TRACKS = [
    {
        // Couch Cast's core deck: a laid-back groove with a marimba hook, an 8-bar loop
        id: 'couch-groove',
        name: 'Couch Groove',
        bpm: 108,
        swing: 0.2,
        play(ctx, out, step, t) {
            const pos = step % 16;
            const bar = Math.floor(step / 16) % 8;
            // Cmaj7 Am7 Dm7 G7 | Cmaj7 Am7 Fmaj7 G7
            const roots = [36, 45, 38, 43, 36, 45, 41, 43];
            const chords = [[60, 64, 67, 71], [60, 64, 67, 69], [60, 62, 65, 69], [59, 62, 65, 67], [60, 64, 67, 71], [60, 64, 67, 69], [60, 64, 65, 69], [59, 62, 65, 67]];

            // Drums: kick, a brushy backbeat and soft hats
            if (pos === 0 || pos === 8) inst.kick(ctx, out, t, 0.32);
            if (pos === 7) inst.kick(ctx, out, t, 0.14);
            if (pos === 4 || pos === 12) { inst.brush(ctx, out, t, 0.09); inst.tick(ctx, out, t, 1500, 0.06); }
            if (pos % 2 === 0) inst.hat(ctx, out, t, pos % 4 === 2 ? 0.035 : 0.02);

            // Bass: root, fifth and an octave pop
            [[0, 0, 0.3], [6, 7, 0.2], [8, 0, 0.26], [11, 12, 0.16], [14, 7, 0.2]].forEach(([p, interval, vol]) => {
                if (p === pos) inst.bass(ctx, out, t, roots[bar] + interval, vol, 0.28);
            });

            // Electric piano on the off-beats
            if (pos === 2 || pos === 10) inst.keys(ctx, out, t, chords[bar], 0.045, 0.32);

            // The hook
            const hook = [
                [[0, 76], [3, 79], [6, 76], [10, 74], [12, 72]],
                [[2, 72], [4, 74], [8, 76], [14, 72]],
                [[0, 77], [3, 76], [6, 74], [10, 72], [12, 69]],
                [[0, 71], [4, 74], [8, 79]],
                [[0, 76], [3, 79], [6, 76], [10, 74], [12, 72]],
                [[2, 72], [4, 74], [8, 76], [14, 72]],
                [[0, 77], [4, 76], [8, 77], [10, 79], [12, 81]],
                [[0, 79], [6, 74], [8, 71]],
            ];
            hook[bar].forEach(([p, n]) => { if (p === pos) inst.marimba(ctx, out, t, n, 0.16); });
        },
    },
];

// ---------------------------------------------------------------------------------------------
// ▶️ The player
// ---------------------------------------------------------------------------------------------
let current = null;     // { track, master, step, nextTime, endTime, timer }
let lastTrackId = null;
let isDucked = false;

const masterLevel = () => (isMusicMuted() ? 0.0001 : VOLUME * (isDucked ? DUCKED : 1));

// The narrator speaks -> dip the music; the narrator stops -> bring it back
onVoiceChange((speaking) => {
    isDucked = speaking;
    if (!current) return;
    const ctx = current.master.context;
    current.master.gain.setTargetAtTime(masterLevel(), ctx.currentTime, speaking ? 0.08 : 0.4);
});

// Music switched off (or back on): fade to silence and back, without stopping the beat
onMusicMuteChange(() => {
    if (!current) return;
    const ctx = current.master.context;
    current.master.gain.setTargetAtTime(masterLevel(), ctx.currentTime, 0.1);
});

const pickTrack = (trackId) => {
    const chosen = [...TIMER_TRACKS, ...LOBBY_SYNTH_TRACKS].find((tr) => tr.id === trackId);
    if (chosen) return chosen;
    const choices = TIMER_TRACKS.filter((tr) => tr.id !== lastTrackId);
    return choices[Math.floor(Math.random() * choices.length)];
};

const runScheduler = () => {
    const playing = current;
    if (!playing) return;
    const ctx = playing.master.context;
    const { track } = playing;
    const sixteenth = 60 / track.bpm / 4;

    // A big pause (a sleeping tab, a busy phone): skip ahead instead of firing a pile of old notes
    if (playing.nextTime < ctx.currentTime - 0.2) playing.nextTime = ctx.currentTime + 0.05;

    while (playing.nextTime < ctx.currentTime + LOOKAHEAD) {
        const step = playing.step;
        // Swing pushes every second 8th note late
        const swingDelay = track.swing && step % 4 === 2 ? sixteenth * track.swing : 0;
        const t = playing.nextTime + swingDelay;
        try {
            track.play(ctx, playing.master, step, t);
            playHurry(ctx, playing, step, t);
        } catch (err) {
            console.warn('Timer music hiccup:', err.message);
        }
        playing.step += 1;
        playing.nextTime += sixteenth;
    }
};

// ⏰ Hurry up! A bright tick on every 8th note in the last 10 seconds, every 16th in the last 5
const playHurry = (ctx, playing, step, t) => {
    if (!playing.endTime) return;
    const secondsLeft = (playing.endTime - Date.now()) / 1000 - (t - ctx.currentTime);
    if (secondsLeft <= 0 || secondsLeft > HURRY_SECONDS) return;
    if (secondsLeft <= PANIC_SECONDS) inst.tick(ctx, playing.master, t, step % 2 === 0 ? 3200 : 2800, step % 4 === 0 ? 0.22 : 0.14);
    else if (step % 2 === 0) inst.tick(ctx, playing.master, t, 3000, step % 4 === 0 ? 0.18 : 0.11);
};

/**
 * Start (or restart) the timer music.
 * @param {object} options
 * @param {number} [options.endTime]  when the clock runs out (ms since 1970, like Date.now()), for the hurry-up tick
 * @param {string} [options.trackId]  pick a track instead of a random one (see TIMER_TRACKS)
 */
export function startTimerMusic({ endTime = null, trackId = null } = {}) {
    stopTimerMusic();
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});

    const track = pickTrack(trackId);
    lastTrackId = track.id;

    const master = ctx.createGain();
    master.gain.setValueAtTime(0.0001, ctx.currentTime);
    master.gain.setTargetAtTime(masterLevel(), ctx.currentTime, 0.3); // a soft fade in
    master.connect(ctx.destination);

    current = { track, master, step: 0, nextTime: ctx.currentTime + 0.1, endTime, timer: null };
    current.timer = setInterval(runScheduler, SCHEDULER_MS);
    runScheduler();
}

/** The id of the track playing right now, or null */
export const playingTimerTrackId = () => current?.track.id || null;

/** Move the finish line (e.g. the server's clock arrived after the music started) */
export function setTimerMusicEndTime(endTime) {
    if (current) current.endTime = endTime || null;
}

/** Fade the music out and stop */
export function stopTimerMusic() {
    if (!current) return;
    const { master, timer } = current;
    current = null;
    clearInterval(timer);
    const ctx = master.context;
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.12);
    setTimeout(() => master.disconnect(), 1500);
}

/**
 * 🎣 React: play timer music while `isActive` is true.
 * A new `key` (e.g. the round number) starts a fresh track; `endTime` drives the hurry-up tick.
 */
export function useTimerMusic(isActive, { endTime = null, key = null } = {}) {
    useEffect(() => {
        if (!isActive) return undefined;
        startTimerMusic({ endTime });
        return () => stopTimerMusic();
    }, [isActive, key]);

    useEffect(() => {
        if (isActive) setTimerMusicEndTime(endTime);
    }, [isActive, endTime]);
}
