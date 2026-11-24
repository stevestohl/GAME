// 🤡 Clown noises for 3 Ring Circus, made in the browser (no audio files): a bicycle horn, a squeaky toy and a
// slide whistle. The TV plays them when someone wins a round, and when time runs out. Plus the final scores'
// fanfare and fireworks (further down).
import { getAudioContext, isAudioAsleep } from './chime.js';
import { isMusicMuted } from './musicMute.js';

const ready = () => {
    const ctx = getAudioContext();
    if (!ctx) return null;
    if (isAudioAsleep(ctx)) ctx.resume().catch(() => {});
    return ctx;
};

// One envelope: up fast, hold, then away
const envelope = (ctx, t, len, vol) => {
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.012);
    g.gain.setValueAtTime(vol, Math.max(t + 0.013, t + len - 0.05));
    g.gain.exponentialRampToValueAtTime(0.0001, t + len);
    g.connect(ctx.destination);
    return g;
};

// 📯 A bicycle horn: two buzzy notes through a narrow, honky tube, sagging a little in pitch
const honk = (ctx, t, freq = 410, len = 0.2, vol = 0.2) => {
    const out = envelope(ctx, t, len, vol);
    const tube = ctx.createBiquadFilter();
    tube.type = 'bandpass';
    tube.frequency.value = 1150;
    tube.Q.value = 2.5;
    tube.connect(out);
    [[1, 'sawtooth'], [1.01, 'square']].forEach(([ratio, type]) => {
        const osc = ctx.createOscillator();
        osc.type = type;
        osc.frequency.setValueAtTime(freq * ratio, t);
        osc.frequency.exponentialRampToValueAtTime(freq * ratio * 0.92, t + len);
        osc.connect(tube);
        osc.start(t);
        osc.stop(t + len + 0.02);
    });
};

// 🐤 A squeaky toy: a quick whistle up and back down
const squeak = (ctx, t, len = 0.16, vol = 0.12) => {
    const out = envelope(ctx, t, len, vol);
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1150, t);
    osc.frequency.exponentialRampToValueAtTime(2300, t + len * 0.45);
    osc.frequency.exponentialRampToValueAtTime(1500, t + len);
    osc.connect(out);
    osc.start(t);
    osc.stop(t + len + 0.02);
};

// 🎶 A slide whistle, falling (time's up) or rising, with a wobble
const slide = (ctx, t, from, to, len = 0.7, vol = 0.1) => {
    const out = envelope(ctx, t, len, vol);
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(from, t);
    osc.frequency.exponentialRampToValueAtTime(to, t + len);
    const wobble = ctx.createOscillator();
    const depth = ctx.createGain();
    wobble.frequency.value = 7;
    depth.gain.value = 18;
    wobble.connect(depth);
    depth.connect(osc.frequency);
    osc.connect(out);
    osc.start(t);
    wobble.start(t);
    osc.stop(t + len + 0.02);
    wobble.stop(t + len + 0.02);
};

/** 🏆 Someone won: HONK-HONK and a squeak-squeak */
export function playClownWin() {
    const ctx = ready();
    if (!ctx) return;
    const t = ctx.currentTime + 0.03;
    honk(ctx, t);
    honk(ctx, t + 0.26);
    squeak(ctx, t + 0.58);
    squeak(ctx, t + 0.78);
}

/** ⏰ Time's up: a slide whistle down, and one sad honk */
export function playClownTimesUp() {
    const ctx = ready();
    if (!ctx) return;
    const t = ctx.currentTime + 0.03;
    slide(ctx, t, 1700, 420);
    honk(ctx, t + 0.78, 300, 0.32, 0.18);
}

// ---------------------------------------------------------------------------------------------
// 🎺 The final scores' fanfare (our own recording, public/audio/CircusFanfare.m4a), and the fireworks' bangs
// ---------------------------------------------------------------------------------------------
let fanfare = null;      // the decoded recording
let fanfareLoad = null;
let fanfarePlaying = null;

/** Start downloading the fanfare (the TV does this when the game starts, so it plays the moment it's needed) */
export function preloadCircusFanfare() {
    const ctx = getAudioContext();
    if (!ctx || fanfareLoad) return fanfareLoad;
    fanfareLoad = fetch('/audio/CircusFanfare.m4a')
        .then((res) => res.arrayBuffer())
        .then((data) => new Promise((resolve, reject) => ctx.decodeAudioData(data, resolve, reject)))
        .then((buffer) => { fanfare = buffer; return buffer; })
        .catch(() => { fanfareLoad = null; return null; });
    return fanfareLoad;
}

/** 🎺 Play the fanfare once (unless the music's switched off) */
export function playCircusFanfare() {
    const ctx = ready();
    if (!ctx || isMusicMuted()) return;
    const start = (buffer) => {
        if (!buffer) return;
        stopCircusFanfare();
        const source = ctx.createBufferSource();
        const level = ctx.createGain();
        level.gain.value = 0.55;
        source.buffer = buffer;
        source.connect(level);
        level.connect(ctx.destination);
        source.start();
        fanfarePlaying = source;
    };
    if (fanfare) start(fanfare);
    else preloadCircusFanfare()?.then(start);
}

export function stopCircusFanfare() {
    if (!fanfarePlaying) return;
    try { fanfarePlaying.stop(); } catch (err) { /* already over */ }
    fanfarePlaying = null;
}

// A second of noise, made once, for the bangs
let noise = null;
const getNoise = (ctx) => {
    if (noise) return noise;
    noise = ctx.createBuffer(1, ctx.sampleRate * 1.5, ctx.sampleRate);
    const data = noise.getChannelData(0);
    for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
    return noise;
};

/** 🎆 A firework bursting: a deep boom, and (for the sparkly ones) a crackle after it. `size` 0..1 */
export function playFireworkBang(size = 1, crackle = false) {
    const ctx = getAudioContext();
    if (!ctx || isAudioAsleep(ctx) || isMusicMuted()) return;
    const t = ctx.currentTime + 0.01;
    const boom = ctx.createBufferSource();
    boom.buffer = getNoise(ctx);
    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(1800, t);
    lowpass.frequency.exponentialRampToValueAtTime(120, t + 0.35);
    const level = ctx.createGain();
    const vol = 0.16 + 0.16 * size;
    level.gain.setValueAtTime(0.0001, t);
    level.gain.exponentialRampToValueAtTime(vol, t + 0.008);
    level.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);
    boom.connect(lowpass);
    lowpass.connect(level);
    level.connect(ctx.destination);
    boom.start(t, Math.random() * 0.4, 1);
    // The thump under it
    const thump = ctx.createOscillator();
    const thumpLevel = ctx.createGain();
    thump.frequency.setValueAtTime(90, t);
    thump.frequency.exponentialRampToValueAtTime(38, t + 0.3);
    thumpLevel.gain.setValueAtTime(0.0001, t);
    thumpLevel.gain.exponentialRampToValueAtTime(0.22 * size + 0.05, t + 0.01);
    thumpLevel.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
    thump.connect(thumpLevel);
    thumpLevel.connect(ctx.destination);
    thump.start(t);
    thump.stop(t + 0.5);
    if (!crackle) return;
    // Crackle: lots of tiny snaps scattered over a second
    for (let k = 0; k < 26; k += 1) {
        const at = t + 0.35 + Math.random() * 1.1;
        const snap = ctx.createBufferSource();
        snap.buffer = getNoise(ctx);
        const hp = ctx.createBiquadFilter();
        hp.type = 'highpass';
        hp.frequency.value = 2500;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, at);
        g.gain.exponentialRampToValueAtTime(0.05 + Math.random() * 0.05, at + 0.002);
        g.gain.exponentialRampToValueAtTime(0.0001, at + 0.03);
        snap.connect(hp);
        hp.connect(g);
        g.connect(ctx.destination);
        snap.start(at, Math.random(), 0.04);
    }
}
