import React, { useEffect, useRef, useState } from 'react';
import { playCircusFanfare, stopCircusFanfare, playFireworkBang } from '../../circusSounds.js';

// 🎪 3 Ring Circus's final scores open like the big top: the tent's striped flaps cover the TV while the horns
// play a fanfare, then they swing open on the last chord and the fireworks go up over the scores.

/** How long the tent stays shut (the narrator waits for it before reading the final scores) */
export const TENT_OPEN_MS = 4000;
const TENT_GONE_MS = 5400;

const reduceMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export default function CircusGrandFinale() {
    const [phase, setPhase] = useState('shut');   // shut → opening → open
    useEffect(() => {
        playCircusFanfare();
        const opening = setTimeout(() => setPhase('opening'), TENT_OPEN_MS);
        const open = setTimeout(() => setPhase('open'), TENT_GONE_MS);
        return () => {
            clearTimeout(opening);
            clearTimeout(open);
            stopCircusFanfare();
        };
    }, []);

    return (
        <>
            {phase !== 'open' && (
                <div className={`cx-tent ${phase === 'opening' ? 'is-opening' : ''}`} role="status">
                    <div className="cx-tent-flap cx-tent-left" aria-hidden="true" />
                    <div className="cx-tent-flap cx-tent-right" aria-hidden="true" />
                    <div className="cx-tent-valance" aria-hidden="true" />
                    <div className="cx-tent-sign">
                        <div className="cx-tent-board">
                            <div className="cx-tent-stars" aria-hidden="true">★ ★ ★</div>
                            <div className="cx-tent-title">3 Ring Circus</div>
                            <div className="cx-tent-sub">The Final Scores!</div>
                        </div>
                    </div>
                </div>
            )}
            {phase !== 'shut' && !reduceMotion() && <CircusFireworks />}
        </>
    );
}

// =================================================================================================
// 🎆 Fireworks: glowing shells of several kinds, with trails, flashes and bangs
// =================================================================================================
const PALETTE = ['#ffd23f', '#ff4d6d', '#4dabf7', '#69db7c', '#f783ac', '#ffa94d', '#e5dbff', '#63e6be'];
const KINDS = ['peony', 'chrysanthemum', 'willow', 'ring', 'strobe', 'palm', 'peony', 'chrysanthemum'];

// A soft glowing dot for each colour, drawn once and stamped for every spark
const makeGlow = (color) => {
    const size = 64;
    const c = document.createElement('canvas');
    c.width = size;
    c.height = size;
    const g = c.getContext('2d');
    const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.18, color);
    grad.addColorStop(0.45, `${color}66`);
    grad.addColorStop(1, `${color}00`);
    g.fillStyle = grad;
    g.fillRect(0, 0, size, size);
    return c;
};

export function CircusFireworks({ durationMs = 13000 }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return undefined;
        const ctx = canvas.getContext('2d');
        let width = 0;
        let height = 0;
        const resize = () => {
            const scale = Math.min(2, window.devicePixelRatio || 1);
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width * scale;
            canvas.height = height * scale;
            ctx.setTransform(scale, 0, 0, scale, 0, 0);
        };
        resize();
        window.addEventListener('resize', resize);

        const glows = Object.fromEntries([...PALETTE, '#ffffff', '#ffcf6b', '#ff9a3c'].map((c) => [c, makeGlow(c)]));
        const pick = (list) => list[Math.floor(Math.random() * list.length)];
        const unit = () => Math.min(width, height);
        const rockets = [];
        const sparks = [];
        const MAX_SPARKS = 2600;

        const spark = (p) => { if (sparks.length < MAX_SPARKS) sparks.push({ age: 0, trail: 0, twinkle: false, ...p }); };

        const launch = (x = width * (0.12 + Math.random() * 0.76), kind = pick(KINDS)) => {
            const apex = height * (0.12 + Math.random() * 0.3);
            const rise = height - apex;
            rockets.push({
                x, y: height + 10,
                vx: (Math.random() - 0.5) * unit() * 0.08,
                vy: -Math.sqrt(2 * height * 0.9 * rise),   // just enough to reach the apex under gravity
                kind,
                color: pick(PALETTE),
            });
        };

        const burst = (r) => {
            const u = unit();
            const second = Math.random() < 0.45 ? pick(PALETTE) : r.color;
            // A flash that lights up the sky for a moment
            spark({ x: r.x, y: r.y, vx: 0, vy: 0, life: 0.2, size: u * 0.2, color: '#ffffff', drag: 0, gravity: 0, flash: true });
            let crackle = false;
            const shell = (count, speed, opts) => {
                for (let i = 0; i < count; i += 1) {
                    // A random direction on a sphere, seen from the front: it looks round, and fuller in the middle
                    const theta = Math.random() * Math.PI * 2;
                    const z = Math.random() * 2 - 1;
                    const ring = Math.sqrt(1 - z * z);
                    const v = speed * (0.85 + Math.random() * 0.3);
                    spark({ x: r.x, y: r.y, vx: Math.cos(theta) * ring * v, vy: Math.sin(theta) * ring * v, color: i % 2 ? r.color : second, ...opts() });
                }
            };
            switch (r.kind) {
            case 'chrysanthemum':
                shell(120, u * 0.42, () => ({ life: 1.5 + Math.random() * 0.5, size: 5, drag: 1.7, gravity: 120, trail: 0.5 }));
                break;
            case 'willow':
                r.color = '#ffcf6b';
                shell(100, u * 0.34, () => ({ life: 2.8 + Math.random() * 0.9, size: 4.4, drag: 2.3, gravity: 75, trail: 0.7, color: Math.random() < 0.6 ? '#ffcf6b' : '#ff9a3c', fadeTo: true }));
                crackle = true;
                break;
            case 'ring': {
                const tilt = Math.random() * Math.PI;
                const squash = 0.35 + Math.random() * 0.4;
                const count = 70;
                const speed = u * 0.4;
                for (let i = 0; i < count; i += 1) {
                    const a = (i / count) * Math.PI * 2;
                    const x = Math.cos(a) * speed;
                    const y = Math.sin(a) * speed * squash;
                    spark({
                        x: r.x, y: r.y,
                        vx: x * Math.cos(tilt) - y * Math.sin(tilt), vy: x * Math.sin(tilt) + y * Math.cos(tilt),
                        life: 1.4 + Math.random() * 0.3, size: 5, drag: 1.4, gravity: 100, color: r.color,
                    });
                }
                shell(30, u * 0.12, () => ({ life: 1.1, size: 4, drag: 1.5, gravity: 100, color: second }));
                break;
            }
            case 'strobe':
                shell(90, u * 0.36, () => ({ life: 1.8 + Math.random() * 0.6, size: 4.6, drag: 1.8, gravity: 90, twinkle: true, color: Math.random() < 0.5 ? '#ffffff' : '#e5dbff' }));
                crackle = true;
                break;
            case 'palm':
                for (let f = 0; f < 9; f += 1) {
                    const a = -Math.PI / 2 + (f - 4) * 0.36 + (Math.random() - 0.5) * 0.1;
                    const v = u * (0.5 + Math.random() * 0.12);
                    spark({ x: r.x, y: r.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 1.9, size: 7, drag: 1.2, gravity: 160, trail: 1, color: '#ffcf6b', fadeTo: true });
                }
                shell(40, u * 0.2, () => ({ life: 1.2, size: 4, drag: 1.6, gravity: 110 }));
                break;
            default:   // peony
                shell(130, u * 0.44, () => ({ life: 1.3 + Math.random() * 0.5, size: 5, drag: 1.8, gravity: 115 }));
            }
            playFireworkBang(Math.min(1, 0.5 + Math.random() * 0.5), crackle);
        };

        const startedAt = performance.now();
        let last = startedAt;
        let nextLaunch = 0;
        let frame = null;
        let salvo = false;

        const tick = (now) => {
            const dt = Math.min(0.05, (now - last) / 1000);
            last = now;
            const elapsed = now - startedAt;

            // Last frame fades into trails
            ctx.globalCompositeOperation = 'destination-out';
            ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            ctx.fillRect(0, 0, width, height);
            ctx.globalCompositeOperation = 'lighter';

            // An opening volley, a steady show, and a big finish at the end
            if (elapsed < 150 && !rockets.length && !sparks.length) {
                launch(width * 0.25, 'peony'); launch(width * 0.5, 'chrysanthemum'); launch(width * 0.75, 'peony');
            }
            if (elapsed < durationMs && elapsed >= nextLaunch) {
                launch();
                if (Math.random() < 0.35) launch();
                nextLaunch = elapsed + 380 + Math.random() * 420;
            }
            if (!salvo && elapsed > durationMs - 2600) {
                salvo = true;
                for (let k = 0; k < 7; k += 1) setTimeout(() => launch(width * (0.1 + 0.8 * (k / 6)), k % 2 ? 'willow' : 'chrysanthemum'), k * 140);
            }

            // Rockets climb with a sparkly tail, and burst near the top of their climb
            for (let i = rockets.length - 1; i >= 0; i -= 1) {
                const r = rockets[i];
                r.vy += height * 0.9 * dt;
                r.x += r.vx * dt;
                r.y += r.vy * dt;
                spark({ x: r.x, y: r.y, vx: (Math.random() - 0.5) * 30, vy: 40 + Math.random() * 40, life: 0.35, size: 3.4, drag: 2, gravity: 60, color: '#ff9a3c' });
                if (r.vy > -height * 0.06) {
                    burst(r);
                    rockets.splice(i, 1);
                }
            }

            for (let i = sparks.length - 1; i >= 0; i -= 1) {
                const s = sparks[i];
                s.age += dt;
                if (s.age >= s.life) { sparks.splice(i, 1); continue; }
                const k = Math.exp(-s.drag * dt);
                s.vx *= k;
                s.vy = s.vy * k + s.gravity * dt;
                s.x += s.vx * dt;
                s.y += s.vy * dt;
                const t = s.age / s.life;
                let alpha = s.flash ? (1 - t) * 0.45 : (1 - t * t);
                if (s.twinkle && t > 0.35) alpha *= Math.random() < 0.5 ? 1 : 0.12;
                // Trails: a fainter copy left behind now and then
                if (s.trail && Math.random() < s.trail * 0.5) {
                    spark({ x: s.x, y: s.y, vx: 0, vy: 0, life: 0.45, size: s.size * 0.6, drag: 0, gravity: 20, color: s.fadeTo ? '#ff9a3c' : s.color });
                }
                const color = s.fadeTo && t > 0.5 ? '#ff9a3c' : s.color;
                const size = s.flash ? s.size * (0.6 + t) : s.size * (1 - t * 0.5);
                ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
                ctx.drawImage(glows[color] || glows['#ffffff'], s.x - size, s.y - size, size * 2, size * 2);
            }
            ctx.globalAlpha = 1;

            if (elapsed < durationMs + 4000 && (elapsed < durationMs || rockets.length || sparks.length)) frame = requestAnimationFrame(tick);
            else ctx.clearRect(0, 0, width, height);
        };
        frame = requestAnimationFrame(tick);

        return () => {
            cancelAnimationFrame(frame);
            window.removeEventListener('resize', resize);
        };
    }, [durationMs]);

    return <canvas ref={canvasRef} className="cx-fireworks" aria-hidden="true" />;
}
