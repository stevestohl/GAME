import React, { useEffect, useRef, useState } from 'react';
import Confetti from 'react-confetti';
import { Avatar } from '../../avatars.jsx';
import { playCelebration, stopCelebration } from '../../celebrationSounds.js';

// 🏆 The end of the game on the TV: a drum roll ("And the champion is..."), then the reveal:
// horns, cheers, fireworks and a spotlight on the winner above the final rankings.

/** How long the drum roll lasts before the winner is revealed (the narrator waits for it too) */
export const FINALE_DRUMROLL_MS = 3200;

/** 'drumroll', then 'reveal'. Starts the celebration sounds, and stops them when the screen goes. */
export function useFinale(active) {
    const [phase, setPhase] = useState(active ? 'drumroll' : 'reveal');
    useEffect(() => {
        if (!active) return undefined;
        setPhase('drumroll');
        playCelebration(FINALE_DRUMROLL_MS / 1000);
        const timer = setTimeout(() => setPhase('reveal'), FINALE_DRUMROLL_MS);
        return () => {
            clearTimeout(timer);
            stopCelebration();
        };
    }, [active]);
    return phase;
}

/** 🥁 Full-screen "And the champion is..." while the drums roll */
export function DrumrollOverlay() {
    return (
        <div className="cc-finale-drumroll" role="status">
            <div className="cc-finale-spotlight" aria-hidden="true" />
            <div className="cc-finale-drum" aria-hidden="true">🥁</div>
            <h1>And the champion is...</h1>
        </div>
    );
}

/** 👑 The winner (or winners, for a tie), big and gold */
export function ChampionBanner({ champions }) {
    const score = champions[0]?.score || 0;
    return (
        <div className="cc-finale-champion" role="status">
            <div className="cc-finale-crown" aria-hidden="true">👑</div>
            <div className="cc-finale-label">{champions.length > 1 ? 'Co-Champions!' : 'Champion!'}</div>
            <div className="d-flex justify-content-center align-items-center gap-3 flex-wrap">
                {champions.map((p) => (
                    <div key={p.id} className="d-flex align-items-center gap-2" style={{ minWidth: 0 }}>
                        <Avatar id={p.avatar} name={p.name} size={96} className="cc-finale-avatar" />
                        <span className="cc-finale-name text-truncate">{p.name}</span>
                    </div>
                ))}
            </div>
            <div className="cc-finale-score">{score} points</div>
        </div>
    );
}

// 🎆 Fireworks: rockets shoot up from the bottom and burst into sparks that fall and fade
const COLORS = ['#ffd700', '#ff4d6d', '#4dabf7', '#69db7c', '#f783ac', '#ffa94d', '#ffffff', '#b197fc'];

export function Fireworks({ durationMs = 14000 }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return undefined;
        const ctx = canvas.getContext('2d');
        let width = 0;
        let height = 0;
        const resize = () => {
            const scale = window.devicePixelRatio || 1;
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width * scale;
            canvas.height = height * scale;
            ctx.setTransform(scale, 0, 0, scale, 0, 0);
        };
        resize();
        window.addEventListener('resize', resize);

        const rockets = [];
        const sparks = [];
        const startedAt = performance.now();
        let nextLaunch = 0;
        let frame = null;
        let last = startedAt;

        const launch = () => {
            rockets.push({
                x: width * (0.15 + Math.random() * 0.7),
                y: height,
                vx: (Math.random() - 0.5) * 60,
                vy: -(height * (0.9 + Math.random() * 0.45)),
                fuse: 0.75 + Math.random() * 0.35,
                color: COLORS[Math.floor(Math.random() * COLORS.length)],
            });
        };

        const burst = (rocket) => {
            const count = 70 + Math.floor(Math.random() * 50);
            const speed = Math.min(width, height) * (0.35 + Math.random() * 0.2);
            const second = Math.random() < 0.4 ? COLORS[Math.floor(Math.random() * COLORS.length)] : rocket.color;
            for (let i = 0; i < count; i++) {
                const angle = (i / count) * Math.PI * 2 + Math.random() * 0.1;
                const v = speed * (0.6 + Math.random() * 0.4);
                sparks.push({
                    x: rocket.x, y: rocket.y,
                    vx: Math.cos(angle) * v, vy: Math.sin(angle) * v,
                    life: 1.2 + Math.random() * 0.6, age: 0,
                    color: i % 2 ? rocket.color : second,
                });
            }
        };

        const tick = (now) => {
            const dt = Math.min(0.05, (now - last) / 1000);
            last = now;
            const elapsed = now - startedAt;

            // Fade what was drawn last frame, leaving short trails
            ctx.globalCompositeOperation = 'destination-out';
            ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
            ctx.fillRect(0, 0, width, height);
            ctx.globalCompositeOperation = 'lighter';

            // Lots of rockets at first, then fewer, then they stop
            if (elapsed < durationMs && elapsed >= nextLaunch) {
                launch();
                if (elapsed < 2500 && Math.random() < 0.6) launch();
                nextLaunch = elapsed + (elapsed < 4000 ? 260 : 550) + Math.random() * 250;
            }

            for (let i = rockets.length - 1; i >= 0; i--) {
                const r = rockets[i];
                r.fuse -= dt;
                r.vy += height * 0.9 * dt;   // gravity
                r.x += r.vx * dt;
                r.y += r.vy * dt;
                ctx.fillStyle = r.color;
                ctx.beginPath();
                ctx.arc(r.x, r.y, 2.5, 0, Math.PI * 2);
                ctx.fill();
                if (r.fuse <= 0 || r.vy > 0) {
                    burst(r);
                    rockets.splice(i, 1);
                }
            }

            for (let i = sparks.length - 1; i >= 0; i--) {
                const s = sparks[i];
                s.age += dt;
                if (s.age >= s.life) { sparks.splice(i, 1); continue; }
                s.vx *= 0.97;
                s.vy = s.vy * 0.97 + height * 0.25 * dt;
                s.x += s.vx * dt;
                s.y += s.vy * dt;
                ctx.globalAlpha = 1 - s.age / s.life;
                ctx.fillStyle = s.color;
                ctx.beginPath();
                ctx.arc(s.x, s.y, 2.2, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.globalAlpha = 1;

            if (elapsed < durationMs || rockets.length || sparks.length) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);

        return () => {
            cancelAnimationFrame(frame);
            window.removeEventListener('resize', resize);
        };
    }, [durationMs]);

    return <canvas ref={canvasRef} className="cc-finale-fireworks" aria-hidden="true" />;
}

/** 🎊 Gold and white confetti pouring down over the reveal */
export function FinaleConfetti() {
    const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight });
    useEffect(() => {
        const onResize = () => setSize({ width: window.innerWidth, height: window.innerHeight });
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);
    return (
        <Confetti
            width={size.width}
            height={size.height}
            numberOfPieces={900}
            recycle={false}
            gravity={0.12}
            colors={['#ffd700', '#ffffff', '#ffe066', '#fab005', '#4dabf7', '#ff4d6d']}
            style={{ position: 'fixed', top: 0, left: 0, zIndex: 10000, pointerEvents: 'none' }}
        />
    );
}
