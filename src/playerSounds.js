import { useEffect, useRef } from 'react';
import { getAudioContext } from './chime.js';

// 🔊 Each player's own sound on the TV: 16 distinct noises, made in the browser (no audio files).
// A player gets a random one (no repeats until all 16 are used) the moment they enter the lobby,
// keeps it for the whole game, and the TV plays it again every time they answer, buzz or vote.

const VOLUME = 0.25;

// One synth "voice": an oscillator gliding between frequencies, with a quick fade in and out
const tone = (ctx, { type = 'sine', from, to = from, start = 0, length = 0.2, volume = 1, filter = null }) => {
    const t = ctx.currentTime + start;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(from, t);
    if (to !== from) osc.frequency.exponentialRampToValueAtTime(to, t + length);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(VOLUME * volume, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + length);
    let node = osc;
    if (filter) {
        const f = ctx.createBiquadFilter();
        f.type = filter.type || 'bandpass';
        f.frequency.value = filter.frequency;
        f.Q.value = filter.q || 1;
        osc.connect(f);
        node = f;
    }
    node.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + length + 0.05);
    return osc;
};

// A burst of noise through a sweeping filter (whooshes and drum hits)
const noise = (ctx, { start = 0, length = 0.3, from = 400, to = 4000, volume = 1, q = 2 }) => {
    const t = ctx.currentTime + start;
    const buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * length), ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const f = ctx.createBiquadFilter();
    f.type = 'bandpass';
    f.Q.value = q;
    f.frequency.setValueAtTime(from, t);
    f.frequency.exponentialRampToValueAtTime(to, t + length);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(VOLUME * volume, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + length);
    src.connect(f);
    f.connect(gain);
    gain.connect(ctx.destination);
    src.start(t);
};

// A wobble (vibrato) on an oscillator's pitch
const wobble = (ctx, osc, { rate, depth }) => {
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = rate;
    lfoGain.gain.value = depth;
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    lfo.start();
    lfo.stop(ctx.currentTime + 1);
};

export const PLAYER_SOUNDS = [
    // 0 Boing
    (ctx) => wobble(ctx, tone(ctx, { from: 320, to: 90, length: 0.5 }), { rate: 18, depth: 40 }),
    // 1 Laser zap
    (ctx) => tone(ctx, { type: 'square', from: 1600, to: 180, length: 0.25, volume: 0.5 }),
    // 2 Slide whistle up
    (ctx) => tone(ctx, { from: 400, to: 1700, length: 0.45 }),
    // 3 Duck quack (twice)
    (ctx) => [0, 0.17].forEach((start) => tone(ctx, { type: 'sawtooth', from: 520, to: 380, start, length: 0.14, filter: { frequency: 1300, q: 4 } })),
    // 4 Bubble pop
    (ctx) => { tone(ctx, { from: 300, to: 1400, length: 0.08 }); tone(ctx, { from: 1400, to: 700, start: 0.08, length: 0.06 }); },
    // 5 Cowbell
    (ctx) => { tone(ctx, { type: 'square', from: 540, length: 0.4, volume: 0.5, filter: { frequency: 800, q: 3 } }); tone(ctx, { type: 'square', from: 800, length: 0.4, volume: 0.5, filter: { frequency: 800, q: 3 } }); },
    // 6 Coin (8-bit)
    (ctx) => { tone(ctx, { type: 'square', from: 988, length: 0.08, volume: 0.4 }); tone(ctx, { type: 'square', from: 1319, start: 0.08, length: 0.35, volume: 0.4 }); },
    // 7 Power-up arpeggio
    (ctx) => [523, 659, 784, 1047].forEach((from, i) => tone(ctx, { type: 'triangle', from, start: i * 0.07, length: 0.12 })),
    // 8 Raspberry / kazoo
    (ctx) => wobble(ctx, tone(ctx, { type: 'sawtooth', from: 140, to: 110, length: 0.45, volume: 0.6, filter: { frequency: 900, q: 1 } }), { rate: 32, depth: 25 }),
    // 9 Whoosh
    (ctx) => noise(ctx, { length: 0.45, from: 300, to: 5000, q: 1.5 }),
    // 10 Doorbell ding-dong
    (ctx) => { tone(ctx, { from: 659, length: 0.45 }); tone(ctx, { from: 523, start: 0.35, length: 0.6 }); },
    // 11 Spring zip (three quick rises)
    (ctx) => [0, 0.09, 0.18].forEach((start) => tone(ctx, { type: 'triangle', from: 300, to: 1200, start, length: 0.08 })),
    // 12 Bass drop with a thump
    (ctx) => { tone(ctx, { from: 160, to: 40, length: 0.5, volume: 1.4 }); noise(ctx, { length: 0.12, from: 150, to: 80, q: 1 }); },
    // 13 Clown horn (honk honk)
    (ctx) => [0, 0.2].forEach((start) => { tone(ctx, { type: 'square', from: 480, start, length: 0.15, volume: 0.4, filter: { frequency: 1000, q: 2 } }); tone(ctx, { type: 'square', from: 600, start, length: 0.15, volume: 0.4, filter: { frequency: 1000, q: 2 } }); }),
    // 14 Xylophone tumble down
    (ctx) => [1568, 1319, 1047, 784].forEach((from, i) => tone(ctx, { from, start: i * 0.08, length: 0.2 })),
    // 15 Robot bleeps
    (ctx) => [880, 1760, 660, 1320].forEach((from, i) => tone(ctx, { type: 'square', from, start: i * 0.06, length: 0.05, volume: 0.35 })),
];

export function playPlayerSound(index) {
    const ctx = getAudioContext();
    const sound = PLAYER_SOUNDS[index];
    if (!ctx || !sound) return;
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    try { sound(ctx); } catch (err) { console.warn('Player sound failed:', err.message); }
}

// Remember who has which sound for this room, so a TV refresh keeps everyone's sound
const storageKey = (roomCode) => `playerSounds:${roomCode}`;
const loadSounds = (roomCode) => {
    try { return JSON.parse(sessionStorage.getItem(storageKey(roomCode))) || {}; } catch { return {}; }
};
const saveSounds = (roomCode, map) => {
    try { sessionStorage.setItem(storageKey(roomCode), JSON.stringify(map)); } catch { /* sound still works, just not after a refresh */ }
};

const pickSound = (taken) => {
    const used = new Set(Object.values(taken));
    let free = PLAYER_SOUNDS.map((_, i) => i).filter((i) => !used.has(i));
    if (free.length === 0) free = PLAYER_SOUNDS.map((_, i) => i); // more than 16 players: start sharing
    return free[Math.floor(Math.random() * free.length)];
};

// Has this player just done their thing this round? (each game names it a little differently)
const isDone = (p) => !!(p.hasSubmitted || p.hasAnswered || p.hasVoted);

/**
 * For a TV screen: plays a player's sound when they first appear, and again each time they answer/vote.
 * `players` can be the room's players object or an array.
 */
export function usePlayerSounds(roomCode, players) {
    const soundsRef = useRef(null);
    const doneRef = useRef({});

    useEffect(() => {
        if (!roomCode || !players) return;
        if (!soundsRef.current || soundsRef.current.roomCode !== roomCode) {
            soundsRef.current = { roomCode, map: loadSounds(roomCode) };
            doneRef.current = {};
        }
        const { map } = soundsRef.current;
        let changed = false;

        Object.values(players)
            .filter((p) => p && p.name && !p.isCaster)
            .forEach((p) => {
                const key = p.name.trim().toLowerCase(); // names are unique within a room
                const done = isDone(p);
                if (map[key] === undefined) {
                    // New in the lobby: hand out a sound and let everyone hear it
                    map[key] = pickSound(map);
                    changed = true;
                    playPlayerSound(map[key]);
                } else if (done && doneRef.current[key] === false) {
                    playPlayerSound(map[key]);
                }
                doneRef.current[key] = done;
            });

        if (changed) saveSounds(roomCode, map);
    }, [roomCode, players]);
}
