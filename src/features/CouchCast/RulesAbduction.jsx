import React, { useEffect, useRef } from 'react';
import { Cat, INK, ink } from './CouchCrew.jsx';

// 🛸 The rules screen's little show (Core deck): the lobby's cat wanders in and sits down, then the
// alien's flying saucer glides over and beams it up. Near the end of the countdown the saucer comes
// back and drops it off again, and the cat stalks away in a huff.
//
// Drawn in a fixed 200 × 120 box (it scales to fit its spot); the floor is at y = 112.

const FLOOR = 112;
const CAT_SIZE = 0.9;

const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
const easeOut = (t) => 1 - (1 - t) ** 3;
const easeIn = (t) => t * t * t;
const linear = (t) => t;

export default function RulesAbduction() {
    const catRef = useRef(null);
    const saucerRef = useRef(null);
    const beamRef = useRef(null);

    useEffect(() => {
        if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;
        const frames = new Set();
        const timers = new Set();
        let dead = false;

        const cat = { x: 240, y: FLOOR, rot: 0, size: CAT_SIZE, flip: 1, el: catRef.current };
        const saucer = { x: -60, y: 8, rot: 0, el: saucerRef.current };
        const beam = beamRef.current;
        const drawCat = () => cat.el.setAttribute('transform',
            `translate(${cat.x} ${cat.y}) rotate(${cat.rot}) scale(${cat.flip * cat.size} ${cat.size})`);
        const drawSaucer = () => saucer.el.setAttribute('transform', `translate(${saucer.x} ${saucer.y}) rotate(${saucer.rot})`);
        const beamOn = (on) => {
            if (on) beam.setAttribute('points', `${saucer.x - 11},${saucer.y + 8} ${saucer.x + 11},${saucer.y + 8} ${saucer.x + 30},${FLOOR + 2} ${saucer.x - 30},${FLOOR + 2}`);
            beam.classList.toggle('is-on', on);
        };

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
        const fly = (x, y, ms, ease = easeInOut) => {
            const from = { x: saucer.x, y: saucer.y };
            return tween(ms, ease, (t) => {
                saucer.x = from.x + (x - from.x) * t;
                saucer.y = from.y + (y - from.y) * t;
                saucer.rot = Math.sin(t * Math.PI) * (x > from.x ? 8 : -8);   // banks into the turn
                drawSaucer();
            });
        };
        const walk = async (x, ms) => {
            const from = cat.x;
            cat.flip = x < from ? 1 : -1;
            cat.el.classList.add('crew-walking');
            await tween(ms, linear, (t) => { cat.x = from + (x - from) * t; drawCat(); });
            cat.el.classList.remove('crew-walking');
        };

        const show = async () => {
            drawCat();
            drawSaucer();
            await wait(1000);

            // The cat wanders in and settles down
            await walk(112, 2200);
            await wait(700);

            // Here comes the saucer
            await fly(112, 30, 1700, easeOut);
            await wait(500);
            beamOn(true);
            await wait(500);

            // Up it goes, legs going, into the saucer
            cat.el.classList.add('crew-running');
            await tween(2400, easeInOut, (t) => {
                cat.y = FLOOR - (FLOOR - 40) * t;
                cat.rot = Math.sin(t * Math.PI * 4) * 16;
                cat.size = CAT_SIZE * (1 - 0.45 * t);
                drawCat();
            });
            cat.el.classList.remove('crew-running');
            cat.el.style.opacity = 0;
            beamOn(false);
            await wait(400);
            saucer.el.classList.add('is-wobbling');
            await wait(700);
            saucer.el.classList.remove('is-wobbling');
            await fly(260, -30, 600, easeIn);

            // ...and back again, later: dropping it off
            await wait(3500);   // back in time to finish before the narrator does
            saucer.x = 260;
            saucer.y = -30;
            await fly(100, 30, 1300, easeOut);
            beamOn(true);
            cat.x = 100;
            cat.y = 40;
            cat.rot = 180;
            cat.size = CAT_SIZE * 0.55;
            cat.el.style.opacity = 1;
            drawCat();
            await tween(700, easeIn, (t) => {
                cat.y = 40 + (FLOOR - 40) * t;
                cat.rot = 180 * (1 - t) + 360 * t;
                cat.size = CAT_SIZE * (0.55 + 0.45 * t);
                drawCat();
            });
            cat.rot = 0;
            beamOn(false);
            // Thud: a squash, a puffed-up glare, then off in a huff
            cat.el.classList.add('is-landing');
            await wait(900);
            cat.el.classList.remove('is-landing');
            fly(-60, -30, 700, easeIn);
            await wait(300);
            await walk(240, 1800);
        };
        show();

        return () => {
            dead = true;
            frames.forEach((id) => cancelAnimationFrame(id));
            timers.forEach((id) => clearTimeout(id));
        };
    }, []);

    return (
        <svg className="cc-crew cc-abduct" viewBox="0 0 200 120" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
            <polygon ref={beamRef} className="abduct-beam" points="0,0 0,0 0,0" />
            <Cat elRef={catRef} />
            <g ref={saucerRef}>
                <Saucer />
            </g>
        </svg>
    );
}

function Saucer() {
    // The alien at the wheel, under a glass dome (centered on 0,0)
    const skin = '#9fb8a8';
    return (
        <g className="abduct-saucer">
            <path d="M 0 -16 C 8 -16 8.5 -9 5 -5 Q 0 -1.5 -5 -5 C -8.5 -9 -8 -16 0 -16 Z" fill={skin} {...ink} strokeWidth={1.2} />
            <path d="M -6.5 -10.5 Q -4 -12.5 -1 -9 Q -4 -7.5 -6.5 -10.5 Z M 6.5 -10.5 Q 4 -12.5 1 -9 Q 4 -7.5 6.5 -10.5 Z" fill={INK} />
            <circle cx={-3.6} cy={-10} r={0.7} fill="#39ff88" /><circle cx={3.6} cy={-10} r={0.7} fill="#39ff88" />
            <path d="M -14 -3 A 14 14 0 0 1 14 -3 Z" fill="rgba(180, 235, 255, 0.45)" {...ink} strokeWidth={1.4} />
            <path d="M -8 -10 Q -5 -14 0 -15" stroke="#fff" strokeWidth={1.2} fill="none" strokeLinecap="round" opacity={0.8} />
            <ellipse cx={0} cy={6} rx={13} ry={4} fill="#4a5672" {...ink} strokeWidth={1.4} />
            <ellipse cx={0} cy={0} rx={34} ry={7.5} fill="#9aa5b1" {...ink} strokeWidth={1.6} />
            <path d="M -33 1 Q 0 7 33 1" stroke={INK} strokeWidth={1.2} fill="none" />
            {[-24, -12, 0, 12, 24].map((x, i) => (
                <circle key={x} className={`abduct-light abduct-light-${i % 2}`} cx={x} cy={2.5} r={1.8} fill={i % 2 ? '#39ff88' : '#ffd23f'} stroke={INK} strokeWidth={0.8} />
            ))}
        </g>
    );
}
