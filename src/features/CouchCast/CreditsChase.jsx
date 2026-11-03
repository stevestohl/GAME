import React, { useEffect, useRef } from 'react';
import { getAudioContext } from '../../chime.js';
import { duckCreditsMarch } from '../../celebrationSounds.js';
import { Robot, Dog, Alien, Cat, INK } from './CouchCrew.jsx';

// 🐈 The crew's last bit, along the bottom of the end credits (Core deck, on the TV): the cat strolls
// on, and all three chase it off the screen. Now and then the cat comes back with backup: a giant cat,
// little cat riding on its head, chases the whole crew off the other way.
//
// Drawn in a fixed 400 × 100 strip (it scales to fit); the floor is at y = 96.

const FLOOR = 96;
const S = 0.72;          // the crew's size here
const CAT = 0.7;         // the cat's size
const GIANT = 4.5;       // the giant cat's size: about half the screen high
const GIANT_CHANCE = 1 / 3;
const START_MS = 1500;   // let the credits get going first

/** 😾 One long, low MEOW from the giant cat, made in the browser (no audio file needed) */
function playMeow() {
    duckCreditsMarch(1.3);
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    const t0 = ctx.currentTime + 0.02;
    const at = (seconds) => t0 + seconds;

    // The voice: up into the "ee", then a long slide down through the "ow"
    const voice = ctx.createOscillator();
    voice.type = 'sawtooth';
    voice.frequency.setValueAtTime(190, at(0));
    voice.frequency.exponentialRampToValueAtTime(340, at(0.28));
    voice.frequency.setValueAtTime(340, at(0.42));
    voice.frequency.exponentialRampToValueAtTime(150, at(1.25));

    // A wobble in the pitch and a rasp in the throat: this is a big animal
    const wobble = ctx.createOscillator();
    const wobbleDepth = ctx.createGain();
    wobble.frequency.value = 6;
    wobbleDepth.gain.value = 7;
    wobble.connect(wobbleDepth);
    wobbleDepth.connect(voice.frequency);

    const rasp = ctx.createOscillator();
    const raspDepth = ctx.createGain();
    const throat = ctx.createGain();
    rasp.frequency.value = 31;
    raspDepth.gain.value = 0.22;
    throat.gain.value = 0.78;
    rasp.connect(raspDepth);
    raspDepth.connect(throat.gain);

    // The mouth opening and closing: "m" to "ee" to "ow", shaped by two resonances
    const volume = ctx.createGain();
    [
        { hz: [[500, 0], [850, 0.3], [950, 0.5], [420, 1.25]], gain: 1 },
        { hz: [[1100, 0], [2300, 0.3], [2000, 0.55], [800, 1.25]], gain: 0.55 },
    ].forEach(({ hz, gain }) => {
        const mouth = ctx.createBiquadFilter();
        const level = ctx.createGain();
        mouth.type = 'bandpass';
        mouth.Q.value = 5;
        level.gain.value = gain;
        hz.forEach(([value, when], i) => {
            if (i === 0) mouth.frequency.setValueAtTime(value, at(when));
            else mouth.frequency.linearRampToValueAtTime(value, at(when));
        });
        throat.connect(mouth);
        mouth.connect(level);
        level.connect(volume);
    });

    volume.gain.setValueAtTime(0.0001, at(0));
    volume.gain.exponentialRampToValueAtTime(1.1, at(0.12));
    volume.gain.setValueAtTime(1.1, at(0.75));
    volume.gain.exponentialRampToValueAtTime(0.0001, at(1.3));

    voice.connect(throat);
    volume.connect(ctx.destination);
    [voice, wobble, rasp].forEach((osc) => {
        osc.start(at(0));
        osc.stop(at(1.35));
    });
}

export default function CreditsChase() {
    const svgRef = useRef(null);
    const robotRef = useRef(null);
    const dogRef = useRef(null);
    const alienRef = useRef(null);
    const catRef = useRef(null);
    const giantRef = useRef(null);
    const barkRef = useRef(null);
    const meowRef = useRef(null);

    useEffect(() => {
        const frames = new Set();
        const timers = new Set();
        let dead = false;

        // Just past the screen's real edges: the strip is wider than 400 units on a widescreen TV
        const box = svgRef.current.getBoundingClientRect();
        const extra = box.height ? Math.max(0, (box.width / (box.height / 100) - 400) / 2) : 0;
        const OFF_L = -extra - 45;
        const OFF_R = 400 + extra + 45;

        const actor = (el, x, size, flip = 1) => ({ x, y: FLOOR, rot: 0, lift: 0, size, flip, el });
        const dog = actor(dogRef.current, OFF_R, S);
        const robot = actor(robotRef.current, OFF_R + 60, S);
        const alien = actor(alienRef.current, OFF_R + 120, S);
        const crew = [dog, robot, alien];
        const cat = actor(catRef.current, OFF_R, CAT);
        // Faces right, and starts with its nose just out of sight
        const giant = actor(giantRef.current, OFF_L - 110, GIANT, -1);

        const draw = (a) => a.el.setAttribute('transform',
            `translate(${a.x} ${a.y - a.lift}) rotate(${a.rot}) scale(${a.flip * a.size} ${a.size})`);

        const wait = (ms) => new Promise((resolve) => {
            const id = setTimeout(() => { timers.delete(id); resolve(); }, ms);
            timers.add(id);
        });
        const tween = (ms, step) => new Promise((resolve) => {
            const start = performance.now();
            let id = requestAnimationFrame(function tick(now) {
                frames.delete(id);
                if (dead) return;
                const t = Math.min(1, (now - start) / ms);
                step(t);
                if (t < 1) { id = requestAnimationFrame(tick); frames.add(id); } else resolve();
            });
            frames.add(id);
        });
        const walk = async (a, x, ms, gait = 'crew-running') => {
            const from = a.x;
            a.el.setAttribute('data-look', x < from ? 'left' : 'right');
            a.el.classList.add(gait);
            await tween(ms, (t) => { a.x = from + (x - from) * t; draw(a); });
            a.el.classList.remove(gait);
        };
        const hop = (a, ms = 260, height = 12) => tween(ms, (t) => { a.lift = Math.sin(Math.PI * t) * height; draw(a); });
        const crewRun = (xs, ms, gap) => Promise.all(crew.map((a, i) => wait(i * gap).then(() => walk(a, xs[i], ms))));

        // The cat strolls on and stops for a swat at nothing, then the crew comes running and it bolts
        const opening = async () => {
            await walk(cat, 215, 1200, 'crew-walking');
            cat.el.classList.add('crew-cat-swat');
            await Promise.all([wait(700), crewRun([310, 365, 420], 900, 90)]);
            cat.el.classList.remove('crew-cat-swat');
            const bark = barkRef.current;
            bark.setAttribute('transform', `translate(${dog.x + 16 * S} ${dog.y - 104 * S}) scale(${S})`);
            bark.classList.add('is-on');
            await wait(550);
            bark.classList.remove('is-on');
            await hop(cat);
        };

        // 🐕🤖👽 Off they all go, and that's the end of that
        const chaseScene = async () => {
            await opening();
            await Promise.all([walk(cat, OFF_L, 900), crewRun([OFF_L, OFF_L, OFF_L], 1700, 120)]);
        };

        // 🐈‍⬛ ...until the floor starts shaking, and the cat comes back with a much bigger cat
        const giantScene = async () => {
            await opening();
            await Promise.all([walk(cat, OFF_L, 900), crewRun([140, 195, 250], 1000, 100)]);
            svgRef.current.classList.add('is-rumbling');
            crew.forEach((a) => a.el.setAttribute('data-look', 'left'));
            await wait(800);

            // The little cat rides on top of the giant's head
            cat.flip = -1;
            cat.size = 0.55;
            const ride = () => {
                cat.x = giant.x + 16 * GIANT;
                cat.y = giant.y - giant.lift - 38 * GIANT;
                draw(cat);
            };
            const from = giant.x;
            giant.el.classList.add('crew-walking');
            await tween(1100, (t) => { giant.x = from + (-20 - from) * t; draw(giant); ride(); });
            giant.el.classList.remove('crew-walking');
            svgRef.current.classList.remove('is-rumbling');

            meowRef.current.classList.add('is-on');
            playMeow();
            await Promise.all(crew.map((a) => hop(a, 300, 22)));
            await wait(250);
            meowRef.current.classList.remove('is-on');

            // Run! The dog was closest, so it's last out
            const away = giant.x;
            giant.el.classList.add('crew-running');
            await Promise.all([
                walk(alien, OFF_R + 30, 1100),
                wait(80).then(() => walk(robot, OFF_R + 30, 1200)),
                wait(160).then(() => walk(dog, OFF_R + 30, 1300)),
                wait(350).then(() => tween(1700, (t) => {
                    giant.x = away + (OFF_R + 170 - away) * t;
                    draw(giant);
                    ride();
                })),
            ]);
        };

        [...crew, cat, giant].forEach(draw);
        wait(START_MS).then(() => {
            if (!dead) (Math.random() < GIANT_CHANCE ? giantScene : chaseScene)();
        });

        return () => {
            dead = true;
            frames.forEach((id) => cancelAnimationFrame(id));
            timers.forEach((id) => clearTimeout(id));
        };
    }, []);

    const bubble = "M -4 -14 H 40 a 6 6 0 0 1 6 6 V 6 a 6 6 0 0 1 -6 6 H 8 L -2 20 L 0 12 H -4 a 6 6 0 0 1 -6 -6 V -8 a 6 6 0 0 1 6 -6 Z";
    return (
        <svg ref={svgRef} className="cc-crew cc-round-scene-art" viewBox="0 0 400 100" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
            <g className="crew-world">
                <Cat elRef={catRef} />
                <Alien elRef={alienRef} />
                <Robot elRef={robotRef} />
                <Dog elRef={dogRef} />
                <Cat elRef={giantRef} />
            </g>
            <g ref={barkRef} className="crew-bark">
                <path d={bubble} fill="#fff" stroke={INK} strokeWidth={2.4} strokeLinejoin="round" />
                <text x={18} y={4} textAnchor="middle" fontSize={13} fontWeight={900} fill={INK} fontFamily="system-ui, sans-serif">WOOF!</text>
            </g>
            <g ref={meowRef} className="crew-bark" transform="translate(112 -62) scale(1.6)">
                <path d={bubble} fill="#fff" stroke={INK} strokeWidth={2.4} strokeLinejoin="round" />
                <text x={18} y={4} textAnchor="middle" fontSize={13} fontWeight={900} fill={INK} fontFamily="system-ui, sans-serif">MEOW.</text>
            </g>
        </svg>
    );
}
