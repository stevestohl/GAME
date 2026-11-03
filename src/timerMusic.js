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
import { MEDLEY_BPM, MEDLEY_STEPS, MEDLEY_LENGTH } from './holidaySongs.js';

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

const SILVER_RAIN_BPM = 118;

// The sound of a big room: two seconds and a bit of fading noise (one for each ear), kept for each audio context
const hallSounds = new WeakMap();
const getHallSound = (ctx) => {
    let sound = hallSounds.get(ctx);
    if (sound) return sound;
    const seconds = 2.6;
    sound = ctx.createBuffer(2, Math.floor(ctx.sampleRate * seconds), ctx.sampleRate);
    for (let ear = 0; ear < 2; ear++) {
        const data = sound.getChannelData(ear);
        for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length) ** 3 * 0.35;
    }
    hallSounds.set(ctx, sound);
    return sound;
};
const halls = new WeakMap();   // one hall per song playing

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
    // ⛪ A big soft hall with a long echo, for the lobby song below. Everything sent here washes back into `out`.
    hall: (ctx, out) => {
        let hall = halls.get(out);
        if (hall) return hall;
        const reverb = ctx.createConvolver();
        reverb.buffer = getHallSound(ctx);
        const level = ctx.createGain();
        level.gain.value = 0.7;
        reverb.connect(level);
        level.connect(out);
        const delay = ctx.createDelay(1);
        delay.delayTime.value = (60 / SILVER_RAIN_BPM) * 0.75;   // a dotted 8th note behind the voice
        const feedback = ctx.createGain();
        feedback.gain.value = 0.42;
        delay.connect(feedback);
        feedback.connect(delay);
        delay.connect(reverb);
        hall = { reverb, echo: delay };
        halls.set(out, hall);
        return hall;
    },
    // 🎶 A choir holding a chord: slow to swell, slow to fade, mostly heard through the hall
    choir: (ctx, out, t, notes, length, vol = 0.03) => {
        const { reverb } = inst.hall(ctx, out);
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1300, t);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.linearRampToValueAtTime(vol, t + length * 0.35);
        gain.gain.setValueAtTime(vol, t + length * 0.7);
        gain.gain.linearRampToValueAtTime(0.0001, t + length + 0.8);
        filter.connect(gain);
        gain.connect(out);
        gain.connect(reverb);
        notes.forEach((note, i) => [-7, 7].forEach((detune) => {
            const osc = ctx.createOscillator();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(midi(note), t);
            osc.detune.setValueAtTime(detune + i, t);
            osc.connect(filter);
            osc.start(t);
            osc.stop(t + length + 0.9);
        }));
    },
    // 🎤 One wordless voice, up high: it slides into each note, with a little vibrato once it's settled
    voice: (ctx, out, t, note, length, vol = 0.1, from = null) => {
        const { reverb, echo } = inst.hall(ctx, out);
        const lfo = ctx.createOscillator();
        const depth = ctx.createGain();
        lfo.frequency.setValueAtTime(5, t);
        depth.gain.setValueAtTime(0, t);
        depth.gain.linearRampToValueAtTime(midi(note) * 0.008, t + Math.min(0.7, length * 0.6));
        lfo.connect(depth);
        const formant = ctx.createBiquadFilter();
        formant.type = 'bandpass';
        formant.frequency.setValueAtTime(1050, t);
        formant.Q.setValueAtTime(0.6, t);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.linearRampToValueAtTime(vol, t + 0.22);
        gain.gain.setValueAtTime(vol, t + Math.max(0.22, length - 0.3));
        gain.gain.linearRampToValueAtTime(0.0001, t + length + 0.35);
        ['triangle', 'sine'].forEach((type, i) => {
            const osc = ctx.createOscillator();
            osc.type = type;
            osc.frequency.setValueAtTime(midi(from ?? note) * (i + 1), t);
            osc.frequency.exponentialRampToValueAtTime(midi(note) * (i + 1), t + 0.14);
            depth.connect(osc.frequency);
            osc.connect(i ? gain : formant);
            osc.start(t);
            osc.stop(t + length + 0.4);
        });
        formant.connect(gain);
        gain.connect(out);
        gain.connect(reverb);
        gain.connect(echo);
        lfo.start(t);
        lfo.stop(t + length + 0.4);
    },
    // 🎻 Plucked strings, short and bright, with a touch of the hall
    pluck: (ctx, out, t, note, vol = 0.08) => {
        const { reverb } = inst.hall(ctx, out);
        tone(ctx, out, t, { freq: midi(note), type: 'sawtooth', vol, attack: 0.003, decay: 0.15, filter: 2400 });
        tone(ctx, reverb, t, { freq: midi(note), type: 'triangle', vol: vol * 0.7, attack: 0.003, decay: 0.15 });
    },
    // 🥁 A deep, far-off drum
    boom: (ctx, out, t, vol = 0.3) => {
        const { reverb } = inst.hall(ctx, out);
        const osc = ctx.createOscillator();
        osc.frequency.setValueAtTime(92, t);
        osc.frequency.exponentialRampToValueAtTime(52, t + 0.3);
        const gain = envelope(ctx, t, vol, 0.008, 0.85);
        osc.connect(gain);
        gain.connect(out);
        gain.connect(reverb);
        osc.start(t);
        osc.stop(t + 0.95);
    },
    // 🔔 Sleigh bells: a bright shake with a little ring on top
    sleighBells: (ctx, out, t, vol = 0.05) => {
        noise(ctx, out, t, { vol, decay: 0.07, type: 'bandpass', freq: 7600, q: 3 });
        tone(ctx, out, t, { freq: 3950, vol: vol * 0.35, decay: 0.09 });
        tone(ctx, out, t, { freq: 5270, vol: vol * 0.2, decay: 0.06 });
    },
    // 👻 A theremin: a wobbly sine that slides into each note
    theremin: (ctx, out, t, note, length, vol = 0.07, from = null) => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(midi(from ?? note), t);
        osc.frequency.exponentialRampToValueAtTime(midi(note), t + Math.min(0.25, length / 2));
        const lfo = ctx.createOscillator();
        const depth = ctx.createGain();
        lfo.frequency.setValueAtTime(5.5, t);
        depth.gain.setValueAtTime(midi(note) * 0.018, t);
        lfo.connect(depth);
        depth.connect(osc.frequency);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.exponentialRampToValueAtTime(vol, t + 0.12);
        gain.gain.setValueAtTime(vol, t + length * 0.7);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + length);
        osc.connect(gain);
        gain.connect(out);
        osc.start(t);
        lfo.start(t);
        osc.stop(t + length + 0.05);
        lfo.stop(t + length + 0.05);
    },
    // A low, hollow drone (two slightly detuned triangles)
    drone: (ctx, out, t, note, length, vol = 0.08) => {
        [-6, 6].forEach((detune) => tone(ctx, out, t, { freq: midi(note), type: 'triangle', vol, attack: 0.4, decay: length, detune, filter: 500 }));
    },
    // 🪩 Dance-floor kit
    // A big, bright lead: three detuned saws stacked like a 90s "supersaw"
    supersaw: (ctx, out, t, note, vol = 0.05, decay = 0.3) => [-14, 0, 14].forEach((detune) =>
        tone(ctx, out, t, { freq: midi(note), type: 'sawtooth', vol, attack: 0.005, decay, detune, filter: 3400 })),
    // The pumping off-beat bass: short and buzzy, with a soft sub underneath
    offbeatBass: (ctx, out, t, note, vol = 0.2) => {
        tone(ctx, out, t, { freq: midi(note), type: 'sawtooth', vol, attack: 0.005, decay: 0.13, filter: 650 });
        tone(ctx, out, t, { freq: midi(note), vol: vol * 0.9, attack: 0.005, decay: 0.15 });
    },
    clap: (ctx, out, t, vol = 0.12) => {
        noise(ctx, out, t, { vol, decay: 0.03, type: 'bandpass', freq: 1400, q: 0.9 });
        noise(ctx, out, t + 0.012, { vol: vol * 0.9, decay: 0.14, type: 'bandpass', freq: 1200, q: 0.8 });
    },
    openHat: (ctx, out, t, vol = 0.05) => noise(ctx, out, t, { vol, decay: 0.16, freq: 9000 }),
    snare: (ctx, out, t, vol = 0.1) => {
        noise(ctx, out, t, { vol, decay: 0.08, type: 'bandpass', freq: 2200, q: 0.6 });
        tone(ctx, out, t, { freq: 190, type: 'triangle', vol: vol * 0.6, decay: 0.06 });
    },
    // A whoosh for the build: noise through a filter that's opened up further (`lift` 0..1) each time
    riser: (ctx, out, t, lift, vol = 0.05) => noise(ctx, out, t, { vol: vol * (0.3 + lift), decay: 0.12, type: 'bandpass', freq: 600 + lift * 7000, q: 1.2 }),
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
// 🎃 Spooky timer tracks: games played with the Halloween deck pick from these instead
// ---------------------------------------------------------------------------------------------
export const SPOOKY_TIMER_TRACKS = [
    {
        // A haunted music box winding down over a creaking clock and a low drone (A minor, with a sinister flat 2nd)
        id: 'haunted-music-box',
        name: 'Haunted Music Box',
        bpm: 84,
        play(ctx, out, step, t) {
            const pos = step % 16;
            const bar = Math.floor(step / 16) % 4;
            if (pos % 4 === 0) inst.tick(ctx, out, t, (pos / 4) % 2 === 0 ? 1300 : 900, 0.22);
            if (pos === 0 && bar % 2 === 0) inst.drone(ctx, out, t, [33, 34, 33, 29][bar], 5.5, 0.09);
            const tunes = [
                [[0, 81], [2, 76], [4, 77], [6, 76], [8, 72], [12, 71]],
                [[0, 72], [2, 69], [4, 70], [6, 69], [8, 64], [12, 63]],
                [[0, 81], [2, 80], [4, 76], [6, 77], [8, 74], [12, 73]],
                [[0, 69], [4, 70], [8, 68], [12, 69]],
            ];
            tunes[bar].forEach(([p, n]) => { if (p === pos) inst.musicBox(ctx, out, t, n, 0.09); });
            if (bar === 3 && pos === 14) inst.bell(ctx, out, t, 57, 0.06);
        },
    },
    {
        // Something creeping up the stairs: a sneaky plucked bass walking down by half steps, a heartbeat,
        // and a theremin wailing over the top (D minor)
        id: 'creeping-theremin',
        name: 'Creeping Theremin',
        bpm: 96,
        play(ctx, out, step, t) {
            const pos = step % 16;
            const bar = Math.floor(step / 16) % 4;
            const walk = [[38, 41, 45, 44], [43, 42, 41, 40], [38, 41, 45, 46], [45, 44, 43, 37]];
            if (pos % 4 === 0) inst.bass(ctx, out, t, walk[bar][pos / 4], 0.28, 0.22);
            if (pos === 0 || pos === 3) inst.kick(ctx, out, t, pos === 0 ? 0.32 : 0.2);   // lub-dub
            if (pos % 8 === 6) inst.tick(ctx, out, t, 2400, 0.05);
            const wails = { 0: [74, 3, 69], 1: [77, 2.4, 74], 2: [81, 3, 77], 3: [73, 2.4, 76] };
            if (pos === 0) { const [note, length, from] = wails[bar]; inst.theremin(ctx, out, t, note, length, 0.06, from); }
        },
    },
];

// ---------------------------------------------------------------------------------------------
// 🛋️ Lobby songs, made the same way (no audio files, nothing copyrighted). They loop forever and
// are never picked at random for a timer; lobbyMusic.js plays them by id.
// ---------------------------------------------------------------------------------------------
export const LOBBY_SYNTH_TRACKS = [
    {
        // Temple Mix Up's lobby: our own sneaky spy tune. A twangy bass line creeps along under brushed drums and
        // vibes, and muted trumpets answer a reverby surf guitar. A 16-bar loop:
        //   bars 1-4    just the bass and the drums, tiptoeing in
        //   bars 5-8    the guitar sneaks in
        //   bars 9-12   the trumpets chase it
        //   bars 13-16  the guitar comes back, with the trumpets stabbing behind it
        id: 'secret-mission',
        name: 'Secret Mission',
        bpm: 126,
        swing: 0.18,
        play(ctx, out, step, t) {
            const pos = step % 16;
            const bar = Math.floor(step / 16) % 16;
            const part = Math.floor(bar / 4);
            const { reverb } = inst.hall(ctx, out);

            // Am Am Dm Am | F E7 Am Am: the bass walks a two-bar creep that shifts with the chord
            const shift = [0, 0, 5, 0, -4, -5, 0, 0][bar % 8];
            const creep = [[0, 33], [3, 33], [6, 36], [8, 33], [10, 38], [12, 39], [14, 40]];
            creep.forEach(([p, note]) => { if (p === pos) inst.pulse(ctx, out, t, note + 12 + shift, 0.34, 0.24); });
            if (pos === 0 || pos === 8) inst.bass(ctx, out, t, 33 + shift, 0.34, 0.3);

            // Brushes and a light hat, with a rimshot on the back beat
            if (pos % 4 === 2) inst.hat(ctx, out, t, 0.05);
            if (pos === 4 || pos === 12) inst.tick(ctx, out, t, 1700, 0.13);
            inst.brush(ctx, out, t, pos % 4 === 0 ? 0.05 : 0.02);
            if (pos === 0 && bar % 2 === 0) inst.kick(ctx, out, t, 0.22);

            // Vibes on the off-beats, once things get going
            const vibes = [[69, 72, 76], [69, 72, 76], [69, 74, 77], [69, 72, 76], [69, 72, 77], [68, 71, 76], [69, 72, 76], [69, 72, 76]][bar % 8];
            if (part > 0 && pos === 6) vibes.forEach((note) => inst.bell(ctx, reverb, t, note, 0.035));

            // The guitar: [16th in the bar, note, length in beats]
            const GUITAR = [
                [[0, 76, 1.5], [6, 79, 0.5], [8, 81, 1], [12, 79, 0.5], [14, 76, 0.5]],
                [[0, 75, 1], [4, 76, 2.5]],
                [[0, 77, 1.5], [6, 81, 0.5], [8, 84, 1], [12, 81, 0.5], [14, 77, 0.5]],
                [[0, 76, 3], [14, 72, 0.5]],
            ];
            const guitar = (p) => GUITAR[bar % 4].filter(([at]) => at === p);
            if (part === 1 || part === 3) {
                guitar(pos).forEach(([, note, beats]) => {
                    inst.pluck(ctx, out, t, note, 0.15);
                    tone(ctx, reverb, t, { freq: midi(note), type: 'sawtooth', vol: 0.08, attack: 0.005, decay: beats * 0.45, filter: 1900 });
                });
            }

            // The trumpets
            const HORNS = [[[2, [64, 69, 72]], [5, [64, 69, 72]]], [[2, [65, 69, 72]], [8, [64, 68, 71]]], [[2, [64, 69, 72]], [5, [64, 69, 72]], [10, [65, 69, 72]]], [[0, [64, 68, 71]], [4, [64, 69, 72]]]];
            if (part === 2 || (part === 3 && pos >= 8)) {
                HORNS[bar % 4].forEach(([p, notes]) => { if (p === pos) inst.stab(ctx, out, t, notes, 0.075); });
            }
        },
    },
    {
        // Trivia Cast's lobby: our own tune in a misty, Celtic new-age style, with some get-up-and-go. Plucked
        // strings race along like rain under a swelling choir and a frame drum, with one soaring voice echoing
        // around a big hall. A 32-bar loop:
        //   bars 1-4    the rain, the choir and the drums
        //   bars 5-12   the voice comes in
        //   bars 13-20  it climbs higher, with a harmony and bells
        //   bars 21-24  the voice rests while the drums keep going, building back up
        //   bars 25-32  the first tune again, an octave doubled, with the drum
        id: 'silver-rain',
        name: 'Silver Rain',
        bpm: SILVER_RAIN_BPM,
        swing: 0,
        play(ctx, out, step, t) {
            const pos = step % 16;
            const bar = Math.floor(step / 16) % 32;
            const beat = 60 / SILVER_RAIN_BPM;
            // [bass, choir, the notes the strings pick through]
            const D = [38, [62, 66, 69, 74], [74, 78, 81, 86]];
            const A = [33, [61, 64, 69, 73], [73, 76, 81, 85]];
            const Bm = [35, [62, 66, 71, 74], [74, 78, 83, 86]];
            const G = [31, [62, 67, 71, 74], [74, 79, 83, 86]];
            const VERSE = [D, A, Bm, G, D, A, G, A];
            const CHORUS = [G, D, A, Bm, G, D, A, A];
            const section = bar < 4 ? 'intro' : bar < 12 ? 'verse' : bar < 20 ? 'chorus' : bar < 24 ? 'rain' : 'last';
            let chord = VERSE[bar % 8];
            if (section === 'chorus') chord = CHORUS[(bar - 12) % 8];
            if (section === 'verse') chord = VERSE[bar - 4];
            if (section === 'last') chord = VERSE[bar - 24];

            // The choir holds each bar's chord, swelling into the next
            if (pos === 0) inst.choir(ctx, out, t, chord[1], beat * 4, section === 'rain' || section === 'intro' ? 0.018 : 0.025);

            // The rain: strings running up and down the chord on every 16th note
            const quiet = section === 'intro' || section === 'rain' ? 0.8 : 1;
            const picks = [0, 2, 1, 3, 2, 0, 3, 1, 0, 2, 1, 3, 2, 3, 1, 2];
            inst.pluck(ctx, out, t, chord[2][picks[pos]], (pos % 4 === 0 ? 0.075 : pos % 2 === 0 ? 0.055 : 0.04) * quiet);

            // The bass: a galloping pulse, with the octave for a lift
            [[0, 0, 0.3], [3, 0, 0.16], [6, 0, 0.18], [8, 12, 0.2], [11, 0, 0.16], [14, 7, 0.18]].forEach(([p, interval, vol]) => {
                if (p === pos) inst.bass(ctx, out, t, chord[0] + interval, vol, 0.3);
            });

            // The frame drum and a shaker keep it moving; the big drum marks out each new part
            [[0, 0.3], [6, 0.16], [8, 0.24], [11, 0.14]].forEach(([p, vol]) => {
                if (p === pos) inst.kick(ctx, out, t, vol);
            });
            if (pos === 4 || pos === 12) inst.snare(ctx, out, t, 0.06);
            inst.hat(ctx, out, t, pos % 4 === 2 ? 0.035 : 0.016);
            if (pos === 0 && (bar % 4 === 0)) inst.boom(ctx, out, t, 0.3);
            // Into each new part, a roll on the drum
            if (bar % 8 === 3 && pos >= 12) inst.snare(ctx, out, t, 0.03 + (pos - 12) * 0.015);

            // The voice: [16th in the bar, note, length in beats]
            const VERSE_TUNE = [
                [[0, 69, 3], [12, 71, 1]], [[0, 73, 2], [8, 76, 2]], [[0, 74, 3], [12, 73, 1]], [[0, 71, 4]],
                [[0, 78, 2], [8, 76, 1], [12, 74, 1]], [[0, 76, 3], [12, 73, 1]], [[0, 74, 2], [8, 71, 2]], [[0, 69, 4]],
            ];
            const CHORUS_TUNE = [
                [[0, 83, 3], [12, 81, 1]], [[0, 78, 4]], [[0, 76, 2], [8, 81, 2]], [[0, 78, 4]],
                [[0, 79, 2], [8, 78, 1], [12, 76, 1]], [[0, 78, 3], [12, 81, 1]], [[0, 76, 2], [8, 73, 2]], [[0, 76, 4]],
            ];
            const sing = (tune, shift = 0, vol = 0.1) => tune.forEach(([p, note, beats], i) => {
                if (p === pos) inst.voice(ctx, out, t, note + shift, beats * beat, vol, i > 0 ? tune[i - 1][1] + shift : null);
            });
            if (section === 'verse') sing(VERSE_TUNE[bar - 4]);
            if (section === 'chorus') {
                sing(CHORUS_TUNE[bar - 12]);
                sing(CHORUS_TUNE[bar - 12], -5, 0.05);   // the harmony, underneath
                if (pos === 8 && bar % 2 === 1) inst.bell(ctx, inst.hall(ctx, out).reverb, t, chord[2][3], 0.07);
            }
            if (section === 'last') {
                sing(VERSE_TUNE[bar - 24]);
                sing(VERSE_TUNE[bar - 24], 12, 0.045);   // doubled up high
            }
            if (section === 'rain' && pos === 8) inst.bell(ctx, inst.hall(ctx, out).reverb, t, chord[2][bar % 4], 0.08);
        },
    },
    {
        // 🎄 The Holiday deck: four carols, one after another (see holidaySongs.js), over sleigh bells
        id: 'holiday-medley',
        name: 'Holiday Medley',
        bpm: MEDLEY_BPM,
        swing: 0,
        play(ctx, out, step, t) {
            const pos = step % MEDLEY_LENGTH;
            const beat = MEDLEY_STEPS[pos];
            if (pos % 2 === 0) inst.sleighBells(ctx, out, t, pos % 4 === 0 ? 0.05 : 0.028);
            if (!beat) return;
            if (beat.bass) inst.bass(ctx, out, t, beat.bass, 0.3, 0.32);
            if (beat.chord) inst.keys(ctx, out, t, beat.chord, 0.04, 0.26);
            if (!beat.lead) return;
            const { note, instrument } = beat.lead;
            if (instrument === 'stab') inst.stab(ctx, out, t, [note, note - 12], 0.1);
            else if (instrument === 'bell') inst.bell(ctx, out, t, note, 0.17);
            else if (instrument === 'musicBox') inst.musicBox(ctx, out, t, note, 0.22);
            else inst.marimba(ctx, out, t, note, 0.26);
        },
    },
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
    {
        // Couch Cast's core deck: a big, bright late-90s dance-floor anthem (our own tune), a 16-bar loop:
        //   bars 1-4   the groove, with the hook played as piano chord stabs
        //   bars 5-8   the drop: a supersaw lead takes the hook, claps and open hats
        //   bars 9-12  the breakdown: the hook on piano alone, then a snare roll and a whoosh building up
        //   bars 13-16 the drop again, with the lead doubled an octave up
        id: 'couch-anthem',
        name: 'Couch Anthem',
        bpm: 132,
        swing: 0,
        play(ctx, out, step, t) {
            const pos = step % 16;
            const bar = Math.floor(step / 16) % 16;
            const part = Math.floor(bar / 4);            // 0 groove, 1 drop, 2 breakdown, 3 drop
            const chord = bar % 4;
            // Am F C G, round and round
            const roots = [45, 41, 48, 43];
            const chords = [[57, 60, 64], [57, 60, 65], [55, 60, 64], [55, 59, 62]];
            // The hook: [16th in the bar, note], one bar per chord
            const hook = [
                [[0, 76], [3, 76], [6, 79], [8, 81], [11, 79], [14, 76]],
                [[0, 77], [3, 76], [6, 72], [10, 74], [12, 76]],
                [[0, 76], [3, 76], [6, 79], [8, 84], [11, 83], [14, 79]],
                [[0, 81], [3, 79], [6, 76], [8, 74], [12, 71]],
            ];
            const hookNote = hook[chord].find(([p]) => p === pos)?.[1];
            const isDrop = part === 1 || part === 3;
            const isBreakdown = part === 2;
            const isBuild = bar === 10 || bar === 11;

            // 💥 A crash to land each drop
            if (pos === 0 && (bar === 4 || bar === 12)) inst.openHat(ctx, out, t, 0.11);

            if (!isBreakdown) {
                // Four on the floor, the pumping off-beat bass and open hats in between
                if (pos % 4 === 0) inst.kick(ctx, out, t, isDrop ? 0.42 : 0.34);
                if (pos % 4 === 2) {
                    inst.offbeatBass(ctx, out, t, roots[chord], isDrop ? 0.17 : 0.13);
                    inst.openHat(ctx, out, t, isDrop ? 0.045 : 0.03);
                }
                if (pos === 4 || pos === 12) inst.clap(ctx, out, t, isDrop ? 0.11 : 0.07);
                if (isDrop && pos % 2 === 1) inst.hat(ctx, out, t, 0.018);
            } else if (!isBuild) {
                // Breakdown: just a long bass note under the piano
                if (pos === 0) inst.bass(ctx, out, t, roots[chord], 0.28, 1.6);
            } else {
                // The build: a snare roll that speeds up (8ths, then 16ths) and gets louder, plus the whoosh
                const lift = ((bar - 10) * 16 + pos) / 32;
                const roll = bar === 10 ? pos % 2 === 0 : pos < 15;    // a breath of silence right before the drop
                if (roll) inst.snare(ctx, out, t, 0.03 + lift * 0.09);
                if (pos < 15) inst.riser(ctx, out, t, lift);
                if (pos === 0 || pos === 8) inst.keys(ctx, out, t, chords[chord], 0.035, 0.5);
            }

            if (hookNote === undefined) return;
            if (part === 0) {
                // The hook as piano stabs: the chord with the tune on top
                inst.keys(ctx, out, t, [...chords[chord], hookNote], 0.036, 0.22);
            } else if (isDrop) {
                inst.supersaw(ctx, out, t, hookNote, 0.045, 0.26);
                inst.keys(ctx, out, t, chords[chord], 0.03, 0.18);
                if (part === 3) inst.supersaw(ctx, out, t, hookNote + 12, 0.014, 0.2);
            } else if (!isBuild) {
                // Breakdown: the tune alone on the piano, ringing out
                inst.keys(ctx, out, t, [hookNote, hookNote - 12], 0.06, 0.8);
            }
        },
    },
    {
        // ⚖️ The judge is reading the answers: curious, a little suspenseful, an 8-bar loop.
        // A ticking clock, a plucked walking bass, soft chords and a marimba asking "hmm...?"
        id: 'deliberation',
        name: 'Deliberation',
        bpm: 112,
        swing: 0.12,
        play(ctx, out, step, t) {
            const pos = step % 16;
            const bar = Math.floor(step / 16) % 8;
            const chord = bar % 4;
            // Dm Bb Gm A7
            const roots = [38, 34, 43, 45];
            const chords = [[62, 65, 69], [62, 65, 70], [62, 67, 70], [61, 64, 67]];
            const motif = [
                [[0, 74], [3, 77], [6, 81], [12, 79]],
                [[2, 77], [6, 74], [10, 72]],
                [[0, 74], [3, 79], [6, 82], [12, 81]],
                [[0, 79], [4, 76], [8, 73], [12, 76]],
                [[0, 74], [3, 77], [6, 81], [12, 79]],
                [[2, 77], [6, 74], [10, 72]],
                [[0, 74], [3, 79], [6, 82], [12, 81]],
                [[0, 81], [4, 79], [8, 76], [12, 73]],
            ];

            // The clock, tick... tock
            if (pos % 4 === 0) inst.tick(ctx, out, t, pos % 8 === 0 ? 1800 : 1300, 0.07);
            if (pos === 0 || pos === 8) inst.kick(ctx, out, t, 0.18);
            if (pos % 2 === 0) inst.hat(ctx, out, t, 0.012);

            // Plucked bass walking root, fifth, octave, fifth
            [[0, 0], [4, 7], [8, 12], [12, 7]].forEach(([p, interval]) => {
                if (p === pos) inst.bass(ctx, out, t, roots[chord] + interval, 0.24, 0.16);
            });

            // Soft chords, held
            if (pos === 0) inst.keys(ctx, out, t, chords[chord], 0.03, 1.6);

            motif[bar].forEach(([p, n]) => { if (p === pos) inst.marimba(ctx, out, t, n, 0.13); });
        },
    },
];

// ⚖️ While the judge reads the answers (played by id, like the lobby songs)
export const JUDGING_TRACK = 'deliberation';

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

const pickTrack = (trackId, theme) => {
    const chosen = [...TIMER_TRACKS, ...SPOOKY_TIMER_TRACKS, ...LOBBY_SYNTH_TRACKS].find((tr) => tr.id === trackId);
    if (chosen) return chosen;
    const pool = theme === 'halloween' ? SPOOKY_TIMER_TRACKS : TIMER_TRACKS;
    const choices = pool.filter((tr) => tr.id !== lastTrackId);
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
 * @param {string} [options.theme]    'halloween': pick from the spooky tracks
 */
export function startTimerMusic({ endTime = null, trackId = null, theme = null } = {}) {
    stopTimerMusic();
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});

    const track = pickTrack(trackId, theme);
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
 * A new `key` (e.g. the round number) starts a fresh track; `endTime` drives the hurry-up tick;
 * `theme: 'halloween'` plays the spooky tracks.
 */
export function useTimerMusic(isActive, { endTime = null, key = null, trackId = null, theme = null } = {}) {
    useEffect(() => {
        if (!isActive) return undefined;
        startTimerMusic({ endTime, trackId, theme });
        return () => stopTimerMusic();
    }, [isActive, key]);

    useEffect(() => {
        if (isActive) setTimerMusicEndTime(endTime);
    }, [isActive, endTime]);
}
