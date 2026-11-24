// 🤡 Clown noises for 3 Ring Circus, made in the browser (no audio files): a bicycle horn, a squeaky toy and a
// slide whistle. The TV plays them when someone wins a round, and when time runs out.
import { getAudioContext, isAudioAsleep } from './chime.js';

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
