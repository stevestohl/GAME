import React, { useEffect, useRef } from 'react';
import { Robot, Dog, Alien, Cat, INK } from './CouchCrew.jsx';

// 🐈 Between rounds (Core deck): along the bottom of the "Round 3" card, one of the crew deals with
// the cat, taking turns round by round:
//   robot: its belly hatch opens, a grabber claw reels the cat in, and off it clanks
//   dog:   barks, and chases the cat off the screen
//   alien: shrink-rays the cat, which ends up riding off on its head
//
// Drawn in a fixed 400 × 100 strip (it scales to fit); the floor is at y = 96.
// The TV waits SCENE_MS for it before moving on to the prompts.

export const SCENE_MS = 5600;
const FLOOR = 96;
const S = 0.78;          // the crew's size here
const CAT = 0.7;         // the cat's size

const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
const easeOut = (t) => 1 - (1 - t) ** 3;
const linear = (t) => t;

const SCENES = ['robot', 'dog', 'alien'];
/** Which of the crew has the cat this round (round 2 is the first one with an intro) */
export const sceneFor = (round) => SCENES[(Math.max(2, round) - 2) % SCENES.length];

export default function RoundCatScene({ round }) {
    const who = sceneFor(round);
    const svgRef = useRef(null);
    const heroRef = useRef(null);
    const catRef = useRef(null);
    const clawRef = useRef(null);
    const barkRef = useRef(null);
    const rayRef = useRef(null);

    useEffect(() => {
        if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;
        const frames = new Set();
        const timers = new Set();
        let dead = false;

        // Just past the screen's real edges: the strip is wider than 400 units on a widescreen TV
        const box = svgRef.current.getBoundingClientRect();
        const extra = box.height ? Math.max(0, (box.width / (box.height / 100) - 400) / 2) : 0;
        const OFF_L = -extra - 45;
        const OFF_R = 400 + extra + 45;

        const hero = { x: OFF_R, y: FLOOR, rot: 0, lift: 0, size: S, flip: 1, el: heroRef.current };
        const cat = { x: OFF_L, y: FLOOR, rot: 0, lift: 0, size: CAT, flip: -1, el: catRef.current };
        const draw = (a) => a.el.setAttribute('transform',
            `translate(${a.x} ${a.y - a.lift}) rotate(${a.rot}) scale(${a.flip * a.size} ${a.size})`);
        const look = (where) => hero.el.setAttribute('data-look', where);

        const wait = (ms) => new Promise((resolve) => {
            const id = setTimeout(() => { timers.delete(id); resolve(); }, ms);
            timers.add(id);
        });
        const tween = (ms, ease, step) => new Promise((resolve) => {
            const start = performance.now();
            let id = requestAnimationFrame(function tick(now) {
                frames.delete(id);
                if (dead) return;
                const t = Math.min(1, (now - start) / ms);
                step(ease(t));
                if (t < 1) { id = requestAnimationFrame(tick); frames.add(id); } else resolve();
            });
            frames.add(id);
        });
        const walk = async (a, x, ms, gait = 'crew-walking') => {
            const from = a.x;
            if (a === cat) a.flip = x < from ? 1 : -1;   // the cat is drawn side-on, facing left
            else look(x < from ? 'left' : 'right');
            a.el.classList.add(gait);
            await tween(ms, linear, (t) => { a.x = from + (x - from) * t; draw(a); });
            a.el.classList.remove(gait);
        };
        // The cat's middle, for grabbing and zapping
        const catMiddle = () => ({ x: cat.x + 4 * cat.size * cat.flip, y: cat.y - 20 * cat.size });

        // 🤖 Belly hatch, grabber claw, clank away
        const robotScene = async () => {
            await Promise.all([walk(cat, 175, 1300), wait(300).then(() => walk(hero, 255, 1400))]);
            look('left');
            await wait(200);
            hero.el.classList.add('hatch-open');
            await wait(350);
            const hatch = { x: hero.x, y: hero.y - 38 * S };
            const claw = clawRef.current;
            const reach = (tip) => {
                claw.querySelectorAll('line').forEach((line) => {
                    line.setAttribute('x1', hatch.x);
                    line.setAttribute('y1', hatch.y);
                    line.setAttribute('x2', tip.x);
                    line.setAttribute('y2', tip.y);
                });
                claw.querySelector('.rcs-claw-head').setAttribute('transform', `translate(${tip.x} ${tip.y})`);
            };
            const grab = catMiddle();
            claw.classList.add('is-on');
            await tween(400, easeOut, (t) => reach({ x: hatch.x + (grab.x - hatch.x) * t, y: hatch.y + (grab.y - hatch.y) * t }));
            claw.classList.add('is-closed');
            cat.el.classList.add('crew-running');   // legs going
            await wait(150);
            await tween(550, easeInOut, (t) => {
                const tip = { x: grab.x + (hatch.x - grab.x) * t, y: grab.y + (hatch.y - grab.y) * t };
                reach(tip);
                cat.size = CAT * (1 - 0.6 * t);
                cat.x = tip.x - 4 * cat.size * cat.flip;
                cat.y = tip.y + 20 * cat.size;
                cat.rot = Math.sin(t * Math.PI * 3) * 20;
                draw(cat);
            });
            cat.el.style.opacity = 0;
            claw.classList.remove('is-on', 'is-closed');
            hero.el.classList.remove('hatch-open');
            await wait(350);
            hero.el.classList.add('belly-rattle');
            await walk(hero, OFF_R, 1500);
        };

        // 🐕 WOOF! and away
        const dogScene = async () => {
            await Promise.all([walk(cat, 190, 1200), wait(200).then(() => walk(hero, 285, 1300))]);
            look('left');
            await wait(200);
            const bubble = barkRef.current;
            bubble.setAttribute('transform', `translate(${hero.x + 16 * S} ${hero.y - 104 * S}) scale(${S})`);
            bubble.classList.add('is-on');
            await wait(700);
            bubble.classList.remove('is-on');
            await tween(260, linear, (t) => { cat.lift = Math.sin(Math.PI * t) * 12; draw(cat); });
            hero.rot = -8;   // leaning into the chase
            await Promise.all([
                walk(cat, OFF_L, 700, 'crew-running'),
                wait(150).then(() => walk(hero, OFF_L - 20, 1000, 'crew-running')),
            ]);
        };

        // 👽 Shrink ray, and a tiny cat riding home on its head
        const alienScene = async () => {
            await Promise.all([walk(cat, 165, 1200), wait(200).then(() => walk(hero, 280, 1300))]);
            look('left');
            await wait(250);
            const ray = rayRef.current;
            const from = { x: hero.x - 19 * S, y: hero.y - 32 * S };
            ray.classList.add('is-on');
            await tween(700, linear, (t) => {
                const to = catMiddle();
                // A zig-zag of zap from the alien's hand to the cat
                const pts = [0, 1, 2, 3, 4, 5].map((i) => {
                    const k = i / 5;
                    const wiggle = i % 5 ? Math.sin(t * 40 + i * 2) * 4 : 0;
                    return `${from.x + (to.x - from.x) * k},${from.y + (to.y - from.y) * k + wiggle}`;
                });
                ray.setAttribute('points', pts.join(' '));
                cat.size = CAT * (1 - 0.7 * t);
                cat.rot = t * 360;
                draw(cat);
            });
            ray.classList.remove('is-on');
            cat.rot = 0;
            // Float up and plonk down on top of its head
            const start = { x: cat.x, y: cat.y };
            const perch = () => ({ x: hero.x + 3 * cat.size, y: hero.y - 104 * S });
            await tween(600, easeInOut, (t) => {
                const end = perch();
                cat.x = start.x + (end.x - start.x) * t;
                cat.y = start.y + (end.y - start.y) * t - Math.sin(Math.PI * t) * 20;
                draw(cat);
            });
            cat.flip = -1;
            await wait(250);
            // Off it goes, cat and all
            const fromX = hero.x;
            hero.el.classList.add('crew-walking');
            look('right');
            await tween(1500, linear, (t) => {
                hero.x = fromX + (OFF_R - fromX) * t;
                draw(hero);
                const p = perch();
                cat.x = p.x;
                cat.y = p.y;
                draw(cat);
            });
        };

        draw(hero);
        draw(cat);
        ({ robot: robotScene, dog: dogScene, alien: alienScene })[who]();

        return () => {
            dead = true;
            frames.forEach((id) => cancelAnimationFrame(id));
            timers.forEach((id) => clearTimeout(id));
        };
    }, [round]);

    const Hero = { robot: Robot, dog: Dog, alien: Alien }[who];
    return (
        <svg ref={svgRef} className="cc-crew cc-round-scene-art" viewBox="0 0 400 100" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
            <polyline ref={rayRef} className="rcs-ray" points="0,0" />
            <Cat elRef={catRef} />
            <Hero elRef={heroRef} />
            <g ref={clawRef} className="rcs-claw">
                <line stroke="#9fb0c3" strokeWidth={2.4} strokeLinecap="round" />
                <line stroke={INK} strokeWidth={0.8} strokeDasharray="1.5 2" />
                <g className="rcs-claw-head">
                    <path className="rcs-claw-l" d="M 0 0 L -4 -4 L -6 0" fill="none" stroke={INK} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
                    <path className="rcs-claw-r" d="M 0 0 L -4 4 L -6 0" fill="none" stroke={INK} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
                </g>
            </g>
            <g ref={barkRef} className="crew-bark">
                <path d="M -4 -14 H 40 a 6 6 0 0 1 6 6 V 6 a 6 6 0 0 1 -6 6 H 8 L -2 20 L 0 12 H -4 a 6 6 0 0 1 -6 -6 V -8 a 6 6 0 0 1 6 -6 Z" fill="#fff" stroke={INK} strokeWidth={2.4} strokeLinejoin="round" />
                <text x={18} y={4} textAnchor="middle" fontSize={13} fontWeight={900} fill={INK} fontFamily="system-ui, sans-serif">WOOF!</text>
            </g>
        </svg>
    );
}
