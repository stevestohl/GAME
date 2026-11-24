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

// ---------------------------------------------------------------------------------------------
// 🎪 Sound effects for the circus acts between rounds (CircusSkit). Short, and not too loud: the narrator's
// reading the round's title card at the same time.
// ---------------------------------------------------------------------------------------------
const act = (fn) => (...args) => {
    const ctx = ready();
    if (!ctx) return;
    fn(ctx, ctx.currentTime + 0.02, ...args);
};

// A burst of noise through a filter, with its own envelope
const noiseBurst = (ctx, t, { len = 0.3, vol = 0.15, type = 'lowpass', from = 2000, to = 300, q = 1, offset = Math.random() * Math.max(0, 1.4 - len) } = {}) => {
    const src = ctx.createBufferSource();
    src.buffer = getNoise(ctx);
    const filter = ctx.createBiquadFilter();
    filter.type = type;
    filter.Q.value = q;
    filter.frequency.setValueAtTime(from, t);
    filter.frequency.exponentialRampToValueAtTime(Math.max(30, to), t + len);
    src.connect(filter);
    filter.connect(envelope(ctx, t, len, vol));
    src.start(t, offset, len + 0.05);
};

/** 📯 HONK HONK */
export const playHonkHonk = act((ctx, t) => { honk(ctx, t); honk(ctx, t + 0.26); });

/** 🐤 A squeak (or a few) */
export const playSqueak = act((ctx, t, times = 1) => { for (let k = 0; k < times; k += 1) squeak(ctx, t + k * 0.2); });

/** 🔔 A bicycle bell: ring-ring */
export const playBikeBell = act((ctx, t) => {
    [0, 0.18].forEach((dt) => [2100, 2620, 3300].forEach((f, i) => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = f;
        osc.connect(envelope(ctx, t + dt, 0.5, 0.05 / (i + 1)));
        osc.start(t + dt);
        osc.stop(t + dt + 0.55);
    }));
});

/** 🦁 A lion's roar: a growl that swells and sinks, with breath in it */
export const playLionRoar = act((ctx, t) => {
    const len = 1.1;
    const out = ctx.createGain();
    out.gain.setValueAtTime(0.0001, t);
    out.gain.exponentialRampToValueAtTime(0.32, t + 0.18);
    out.gain.setValueAtTime(0.32, t + 0.55);
    out.gain.exponentialRampToValueAtTime(0.0001, t + len);
    const tone = ctx.createBiquadFilter();
    tone.type = 'lowpass';
    tone.frequency.setValueAtTime(700, t);
    tone.frequency.linearRampToValueAtTime(1400, t + 0.25);
    tone.frequency.exponentialRampToValueAtTime(380, t + len);
    tone.connect(out);
    out.connect(ctx.destination);
    [[95, 'sawtooth'], [97.5, 'sawtooth'], [142, 'square']].forEach(([f, type]) => {
        const osc = ctx.createOscillator();
        osc.type = type;
        osc.frequency.setValueAtTime(f * 0.8, t);
        osc.frequency.linearRampToValueAtTime(f * 1.15, t + 0.3);
        osc.frequency.exponentialRampToValueAtTime(f * 0.7, t + len);
        // The rattle in the throat
        const rattle = ctx.createOscillator();
        const depth = ctx.createGain();
        rattle.frequency.value = 23;
        depth.gain.value = f * 0.18;
        rattle.connect(depth);
        depth.connect(osc.frequency);
        osc.connect(tone);
        osc.start(t);
        rattle.start(t);
        osc.stop(t + len + 0.05);
        rattle.stop(t + len + 0.05);
    });
    noiseBurst(ctx, t, { len, vol: 0.12, type: 'bandpass', from: 900, to: 400, q: 0.8 });
});

/** 🚗 A tiny car's engine: putt-putt-putt for `seconds` */
export const playCarEngine = act((ctx, t, seconds = 1.1) => {
    for (let at = 0; at < seconds; at += 0.09) {
        noiseBurst(ctx, t + at, { len: 0.06, vol: 0.09, from: 600, to: 150, q: 2 });
        const osc = ctx.createOscillator();
        osc.type = 'square';
        osc.frequency.value = 55 + Math.random() * 6;
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.value = 260;
        osc.connect(lp);
        lp.connect(envelope(ctx, t + at, 0.06, 0.07));
        osc.start(t + at);
        osc.stop(t + at + 0.08);
    }
});

/** 🪀 A spring: boing! */
export const playBoing = act((ctx, t) => {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(520, t + 0.12);
    osc.frequency.exponentialRampToValueAtTime(300, t + 0.35);
    const wobble = ctx.createOscillator();
    const depth = ctx.createGain();
    wobble.frequency.value = 16;
    depth.gain.value = 45;
    wobble.connect(depth);
    depth.connect(osc.frequency);
    osc.connect(envelope(ctx, t, 0.38, 0.13));
    osc.start(t);
    wobble.start(t);
    osc.stop(t + 0.4);
    wobble.stop(t + 0.4);
});

/** 🎉 Ta-da: two quick brassy notes and a cymbal */
export const playTaDa = act((ctx, t) => {
    [[523, 0, 0.12], [784, 0.13, 0.5]].forEach(([f, dt, len]) => [1, 1.5, 2].forEach((h, i) => {
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.value = f * h;
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.value = 2400;
        osc.connect(lp);
        lp.connect(envelope(ctx, t + dt, len, 0.06 / (i + 1)));
        osc.start(t + dt);
        osc.stop(t + dt + len + 0.02);
    }));
    noiseBurst(ctx, t + 0.13, { len: 0.9, vol: 0.09, type: 'highpass', from: 6000, to: 5000 });
});

/** 🤕 A cartoon bonk on the head */
export const playBonk = act((ctx, t) => {
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(900, t);
    osc.frequency.exponentialRampToValueAtTime(180, t + 0.12);
    osc.connect(envelope(ctx, t, 0.16, 0.22));
    osc.start(t);
    osc.stop(t + 0.18);
    noiseBurst(ctx, t, { len: 0.05, vol: 0.12, type: 'bandpass', from: 2500, to: 1500, q: 3 });
});

/** 🧨 A fizzing fuse, for `seconds` */
export const playFuseFizz = act((ctx, t, seconds = 1) => {
    noiseBurst(ctx, t, { len: seconds, vol: 0.06, type: 'highpass', from: 4000, to: 3000 });
    for (let at = 0.05; at < seconds; at += 0.07 + Math.random() * 0.08) noiseBurst(ctx, t + at, { len: 0.02, vol: 0.07, type: 'highpass', from: 5000, to: 5000 });
});

/** 💥 The cannon going off */
export const playCannonBoom = act((ctx, t) => {
    noiseBurst(ctx, t, { len: 1.0, vol: 0.38, from: 2200, to: 90 });
    const thump = ctx.createOscillator();
    thump.frequency.setValueAtTime(110, t);
    thump.frequency.exponentialRampToValueAtTime(35, t + 0.4);
    thump.connect(envelope(ctx, t, 0.5, 0.35));
    thump.start(t);
    thump.stop(t + 0.55);
});

/** 💨 Something flying past */
export const playWhoosh = act((ctx, t, len = 0.5) => {
    noiseBurst(ctx, t, { len, vol: 0.1, type: 'bandpass', from: 400, to: 2400, q: 1.5 });
});

/** 🥧 A cream pie landing */
export const playSplat = act((ctx, t) => {
    noiseBurst(ctx, t, { len: 0.25, vol: 0.28, from: 2600, to: 200, q: 0.7 });
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(260, t);
    osc.frequency.exponentialRampToValueAtTime(70, t + 0.2);
    osc.connect(envelope(ctx, t, 0.22, 0.2));
    osc.start(t);
    osc.stop(t + 0.25);
});

/** 🎶 A slide whistle going down (a little "wah-wah" moment) */
export const playSlideDown = act((ctx, t) => slide(ctx, t, 1500, 500, 0.6, 0.08));
