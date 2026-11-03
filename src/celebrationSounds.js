// 🥁🎺 The end-of-game celebration: a drum roll, then horns, a cymbal crash and a cheering crowd.
// Made in the browser with the Web Audio API, like the chime and the timer music (no audio files).
// They're part of the soundtrack, so the caster's 🔇 music button silences them too.

import { getAudioContext } from './chime.js';
import { isMusicMuted, onMusicMuteChange } from './musicMute.js';

const midi = (note) => 440 * Math.pow(2, (note - 69) / 12);

let noiseBuffer = null;
const getNoise = (ctx) => {
    if (noiseBuffer && noiseBuffer.sampleRate === ctx.sampleRate) return noiseBuffer;
    noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    return noiseBuffer;
};

// A burst of filtered noise (a drum hit, a cymbal, a crowd)
const noise = (ctx, out, t, { vol, attack = 0.002, hold = 0, decay, type = 'bandpass', freq = 2000, q = 0.8 }) => {
    const src = ctx.createBufferSource();
    src.buffer = getNoise(ctx);
    src.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = type;
    filter.frequency.setValueAtTime(freq, t);
    filter.Q.setValueAtTime(q, t);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(vol, t + attack);
    gain.gain.setValueAtTime(vol, t + attack + hold);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + attack + hold + decay);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(out);
    src.start(t, Math.random());
    src.stop(t + attack + hold + decay + 0.05);
    return { filter, gain };
};

// One brassy horn note: a few slightly detuned saws through a filter that opens as it's blown
const horn = (ctx, out, t, note, length, vol = 0.07) => {
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(vol, t + 0.04);
    gain.gain.setValueAtTime(vol, t + Math.max(0.05, length - 0.08));
    gain.gain.exponentialRampToValueAtTime(0.0001, t + length + 0.12);
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, t);
    filter.frequency.exponentialRampToValueAtTime(2600, t + 0.08);
    filter.connect(gain);
    gain.connect(out);
    [-7, 0, 7].forEach((detune) => {
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(midi(note), t);
        osc.detune.setValueAtTime(detune, t);
        osc.connect(filter);
        osc.start(t);
        osc.stop(t + length + 0.2);
    });
};

const kick = (ctx, out, t, vol = 0.6) => {
    const osc = ctx.createOscillator();
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.25);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
    osc.connect(gain);
    gain.connect(out);
    osc.start(t);
    osc.stop(t + 0.55);
};

// Everything plays through one output, so it can all be faded out at once
const startOutput = () => {
    if (isMusicMuted()) return null;
    const ctx = getAudioContext();
    if (!ctx) return null;
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    const out = ctx.createGain();
    out.gain.setValueAtTime(1, ctx.currentTime);
    out.connect(ctx.destination);
    return { ctx, out };
};

let current = null;

/** Stop the celebration sounds (e.g. "Play Again" was tapped) */
export function stopCelebration() {
    if (!current) return;
    const { ctx, out } = current;
    current = null;
    out.gain.cancelScheduledValues(ctx.currentTime);
    out.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.1);
    setTimeout(() => out.disconnect(), 1000);
}

/**
 * 🥁 A snare roll that builds for `seconds`, ending on a big hit.
 * Then 🎺 a fanfare with a cymbal crash, and 📣 the crowd going wild.
 * @param {number} seconds  how long the drum roll lasts (the reveal lands right after)
 */
export function playCelebration(seconds = 3) {
    stopCelebration();
    const output = startOutput();
    if (!output) return;
    current = output;
    const { ctx, out } = output;
    const start = ctx.currentTime + 0.05;

    // --- The drum roll: fast snare strokes that get louder and quicker ---
    let t = start;
    while (t < start + seconds) {
        const progress = (t - start) / seconds;
        noise(ctx, out, t, { vol: 0.05 + progress * 0.22, decay: 0.07, freq: 1800 + progress * 1200, q: 0.6 });
        t += 0.055 - progress * 0.02;
    }
    // A soft rumble under the roll
    noise(ctx, out, start, { vol: 0.08, attack: seconds * 0.9, decay: 0.2, type: 'lowpass', freq: 180, q: 0.5 });

    // --- The reveal: boom, crash and a fanfare (C major: da-da-da-DAAA, then up to the top) ---
    const hit = start + seconds;
    kick(ctx, out, hit, 0.8);
    noise(ctx, out, hit, { vol: 0.35, decay: 2.4, type: 'highpass', freq: 5000, q: 0.4 });   // cymbal crash
    const fanfare = [
        // [beats from the hit, length in beats, notes]
        [0, 0.33, [60, 64, 67]],
        [0.33, 0.33, [60, 64, 67]],
        [0.66, 0.33, [60, 64, 67]],
        [1, 1.5, [65, 69, 72]],
        [2.5, 0.5, [67, 71, 74]],
        [3, 2.5, [72, 76, 79]],
    ];
    const beat = 0.32;
    fanfare.forEach(([at, length, notes]) => notes.forEach((n) => horn(ctx, out, hit + at * beat, n, length * beat)));
    kick(ctx, out, hit + 3 * beat, 0.6);
    noise(ctx, out, hit + 3 * beat, { vol: 0.25, decay: 2, type: 'highpass', freq: 6000, q: 0.4 });

    // --- The crowd: a roar that swells and slowly dies down, with whistles on top ---
    const crowd = noise(ctx, out, hit + 0.1, { vol: 0.16, attack: 0.5, hold: 2.5, decay: 3, type: 'bandpass', freq: 1100, q: 0.4 });
    // Wobble it a little so it sounds like lots of people rather than static
    const wobble = ctx.createOscillator();
    const wobbleDepth = ctx.createGain();
    wobble.frequency.setValueAtTime(5, hit);
    wobbleDepth.gain.setValueAtTime(250, hit);
    wobble.connect(wobbleDepth);
    wobbleDepth.connect(crowd.filter.frequency);
    wobble.start(hit);
    wobble.stop(hit + 6.5);
    // Whistles: quick rising and falling sine sweeps
    [0.6, 1.4, 2.1, 3.0].forEach((at) => {
        const w = hit + at;
        const osc = ctx.createOscillator();
        osc.frequency.setValueAtTime(1800, w);
        osc.frequency.exponentialRampToValueAtTime(2600, w + 0.15);
        osc.frequency.exponentialRampToValueAtTime(1500, w + 0.45);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.0001, w);
        gain.gain.exponentialRampToValueAtTime(0.025, w + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, w + 0.5);
        osc.connect(gain);
        gain.connect(out);
        osc.start(w);
        osc.stop(w + 0.55);
    });
}

// 🔊 Trivia Cast's reveal: sounds for how the wrong answers leave (TriviaCastScreensTV.jsx, whose timings
// these follow, and the .tc-fx-* animations in cards.css), then a bright "ta-da" for the right one.
// `sides`: one per wrong answer, in the order they go: -1 heads left, 1 heads right.
const STAGGER = 0.35;        // seconds between one wrong answer and the next
const RIGHT_ANSWER_AT = 2.15;

// 💥 A crack, then the pieces burst and tinkle down
const glassBreak = (ctx, out, t) => {
    noise(ctx, out, t, { vol: 0.12, decay: 0.05, type: 'highpass', freq: 3500, q: 0.7 });   // the crack
    const smash = t + 0.45;
    noise(ctx, out, smash, { vol: 0.5, decay: 0.28, type: 'highpass', freq: 2600, q: 0.6 });
    noise(ctx, out, smash, { vol: 0.28, decay: 0.12, type: 'bandpass', freq: 900, q: 0.8 });
    for (let i = 0; i < 16; i++) {
        const at = smash + 0.02 + Math.random() * 0.75;
        const osc = ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(3200 + Math.random() * 5200, at);
        const gain = ctx.createGain();
        const vol = 0.09 * (1 - (at - smash) / 1.1);
        gain.gain.setValueAtTime(vol, at);
        gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.09 + Math.random() * 0.12);
        osc.connect(gain);
        gain.connect(out);
        osc.start(at);
        osc.stop(at + 0.25);
    }
};

// 🦵 Little shoes on a hard floor, fading away as the card strolls off
const footsteps = (ctx, out, t) => {
    const start = t + 0.5;
    const stepEvery = 0.28;      // the legs' swing (.tc-leg)
    const steps = 8;
    for (let i = 0; i < steps; i++) {
        const at = start + i * stepEvery;
        const fade = 1 - i / steps;
        const isHeel = i % 2 === 0;
        noise(ctx, out, at, { vol: 0.42 * fade, decay: 0.05, type: 'bandpass', freq: isHeel ? 1500 : 1150, q: 1.4 });
        const thud = ctx.createOscillator();
        thud.frequency.setValueAtTime(isHeel ? 170 : 140, at);
        thud.frequency.exponentialRampToValueAtTime(70, at + 0.07);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.32 * fade, at);
        gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.09);
        thud.connect(gain);
        gain.connect(out);
        thud.start(at);
        thud.stop(at + 0.1);
    }
};

// 🟢 Chompy's teeth going through the card, one crunchy bite per snap of his jaws
const chomps = (ctx, out, t) => {
    const start = t + 0.2;
    const biteEvery = 0.36;      // his jaws (.tc-jaw)
    for (let i = 0; i < 5; i++) {
        const at = start + i * biteEvery;
        noise(ctx, out, at, { vol: 0.34, decay: 0.09, type: 'bandpass', freq: 1900 + Math.random() * 700, q: 0.9 });
        const jaw = ctx.createOscillator();
        jaw.type = 'square';
        jaw.frequency.setValueAtTime(190, at);
        jaw.frequency.exponentialRampToValueAtTime(85, at + 0.1);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.12, at);
        gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.12);
        jaw.connect(gain);
        gain.connect(out);
        jaw.start(at);
        jaw.stop(at + 0.14);
    }
};

const REVEAL_SOUNDS = { shatter: glassBreak, walk: footsteps, chomp: chomps };

export function playRevealSounds(effect, sides = []) {
    const output = startOutput();
    if (!output) return;
    const { ctx, out } = output;
    const start = ctx.currentTime + 0.03;
    const sound = REVEAL_SOUNDS[effect];

    sides.forEach((side, i) => {
        // Each one comes from its own side of the room, where the speakers allow it
        const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
        if (pan) {
            pan.pan.setValueAtTime(side * 0.55, start);
            pan.connect(out);
        }
        if (sound) sound(ctx, pan || out, start + i * STAGGER);
    });

    // ✨ And the right answer zooms in
    [[76, 0], [79, 0.09], [84, 0.18]].forEach(([note, at]) => {
        const t = start + RIGHT_ANSWER_AT + at;
        const osc = ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(midi(note), t);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.exponentialRampToValueAtTime(0.22, t + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.7);
        osc.connect(gain);
        gain.connect(out);
        osc.start(t);
        osc.stop(t + 0.75);
    });

    setTimeout(() => out.disconnect(), 6000);
}

// 🎺 The end credits' march: eight bars in C major, round and round until the credits finish.
// Each bar: the horns' chord, then the tune as [beat in the bar, length in beats, note]
const MARCH_BEAT = 0.5;          // seconds
const MARCH_VOLUME = 0.8;
const MARCH_DUCKED = 0.2;        // how much is left while the giant cat has the floor
const C = [48, 55, 60, 64];
const F = [48, 57, 60, 65];
const G = [47, 55, 62, 67];
const MARCH = [
    [C, [[0, 0.33, 67], [0.33, 0.33, 67], [0.66, 0.34, 67], [1, 3, 72]]],
    [C, [[0, 1, 76], [1, 0.5, 74], [1.5, 0.5, 72], [2, 2, 76]]],
    [F, [[0, 1, 77], [1, 1, 76], [2, 2, 72]]],
    [G, [[0, 0.5, 74], [0.5, 0.5, 76], [1, 1, 77], [2, 2, 79]]],
    [F, [[0, 1, 81], [1, 0.5, 79], [1.5, 0.5, 77], [2, 2, 77]]],
    [C, [[0, 1, 79], [1, 1, 76], [2, 2, 72]]],
    [G, [[0, 1, 74], [1, 0.5, 76], [1.5, 0.5, 77], [2, 2, 79]]],
    [C, [[0, 0.33, 79], [0.33, 0.33, 79], [0.66, 0.34, 79], [1, 3, 84]]],
];

let march = null;

/** Starts the march, and returns the function that fades it out. The caster's 🔇 mutes it like the rest. */
export function startCreditsMarch() {
    const ctx = getAudioContext();
    if (!ctx) return () => {};
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});

    const out = ctx.createGain();
    const level = () => (isMusicMuted() ? 0.0001 : MARCH_VOLUME);
    out.gain.setValueAtTime(level(), ctx.currentTime);
    out.connect(ctx.destination);
    const stopWatchingMute = onMusicMuteChange(() => out.gain.setTargetAtTime(level(), ctx.currentTime, 0.05));
    const me = { ctx, out, level };
    march = me;

    let bar = 0;
    let barStart = ctx.currentTime + 0.05;
    let timer = null;
    // One bar at a time, a little ahead of the clock, so stopping leaves nothing queued up
    const playBar = () => {
        const [chord, tune] = MARCH[bar % MARCH.length];
        const at = (beat) => barStart + beat * MARCH_BEAT;
        [0, 2].forEach((beat) => {
            chord.forEach((note) => horn(ctx, out, at(beat), note, 1.5 * MARCH_BEAT, 0.03));
            kick(ctx, out, at(beat), 0.3);
        });
        [1, 3].forEach((beat) => noise(ctx, out, at(beat), { vol: 0.07, decay: 0.12, freq: 2200, q: 0.6 }));
        if (bar % MARCH.length === 0) noise(ctx, out, at(0), { vol: 0.1, decay: 1.2, type: 'highpass', freq: 6000, q: 0.4 });
        tune.forEach(([beat, length, note]) => horn(ctx, out, at(beat), note, length * MARCH_BEAT, 0.07));
        bar += 1;
        barStart += 4 * MARCH_BEAT;
        timer = setTimeout(playBar, Math.max(0, (barStart - ctx.currentTime - 0.4) * 1000));
    };
    playBar();

    return () => {
        clearTimeout(timer);
        stopWatchingMute();
        if (march === me) march = null;
        out.gain.cancelScheduledValues(ctx.currentTime);
        out.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.25);
        setTimeout(() => out.disconnect(), 2500);
    };
}

/** Drop the march for a moment, so a sound effect (the giant cat's meow) comes through */
export function duckCreditsMarch(seconds) {
    if (!march) return;
    const { ctx, out, level } = march;
    const now = ctx.currentTime;
    out.gain.cancelScheduledValues(now);
    out.gain.setTargetAtTime(level() * MARCH_DUCKED, now, 0.04);
    out.gain.setTargetAtTime(level(), now + seconds, 0.2);
}
