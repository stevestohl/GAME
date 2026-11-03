import React, { useEffect, useRef } from 'react';
import { lobbyAnalyser } from '../CouchCast/lobbyMusic.js';

// 🎶 Trivia Cast's lobby, under the players card: a blue and white visualizer that really listens to the
// lobby song. Bass sits in the middle, treble toward the edges, with a wave line and sparks on top. With no
// sound coming through (not started yet, or the browser's waiting for a tap) it just breathes gently.
// It's drawn with no background and fades out at the edges (.cc-visualizer), so there's no box around it.

const BARS = 34;          // each side of the middle
const SPARKS = 36;
const FIRST_BIN = 2;      // skip the very bottom of the spectrum: it's just rumble
const LAST_BIN = 0.62;    // and the very top: there's rarely anything up there

export default function LobbyVisualizer() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const calm = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
        const levels = new Array(BARS).fill(0);
        const sparks = Array.from({ length: SPARKS }, () => ({
            x: Math.random(), y: Math.random(), size: 0.6 + Math.random() * 1.6, speed: 0.3 + Math.random(), twinkle: Math.random() * 6.28,
        }));
        let frame;
        let last = performance.now();
        let freq = null;
        let wave = null;
        let bars = null;   // the bar colours for this size of canvas

        const draw = (now) => {
            frame = requestAnimationFrame(draw);
            const dt = Math.min(0.05, (now - last) / 1000);
            last = now;

            // Stay sharp on any screen
            const dpr = Math.min(2, window.devicePixelRatio || 1);
            const w = Math.round(canvas.clientWidth * dpr);
            const h = Math.round(canvas.clientHeight * dpr);
            if (!w || !h) return;
            if (canvas.width !== w || canvas.height !== h) {
                canvas.width = w;
                canvas.height = h;
                bars = ctx.createLinearGradient(0, 0, 0, h);
                bars.addColorStop(0, 'rgba(120, 150, 255, 0)');
                bars.addColorStop(0.28, 'rgba(120, 150, 255, 0.85)');
                bars.addColorStop(0.5, 'rgba(255, 255, 255, 1)');
                bars.addColorStop(0.72, 'rgba(120, 150, 255, 0.85)');
                bars.addColorStop(1, 'rgba(120, 150, 255, 0)');
            }

            // What the music's doing right now
            const analyser = lobbyAnalyser();
            let loudness = 0;
            let bass = 0;
            if (analyser) {
                if (!freq) {
                    freq = new Uint8Array(analyser.frequencyBinCount);
                    wave = new Uint8Array(analyser.fftSize);
                }
                analyser.getByteFrequencyData(freq);
                analyser.getByteTimeDomainData(wave);
            }
            const topBin = freq ? freq.length * LAST_BIN : 1;
            for (let i = 0; i < BARS; i++) {
                // Evenly spaced to the ear: each bar covers more of the high notes than the low ones
                const from = FIRST_BIN * (topBin / FIRST_BIN) ** (i / BARS);
                const to = Math.max(from + 1, FIRST_BIN * (topBin / FIRST_BIN) ** ((i + 1) / BARS));
                let sum = 0;
                let count = 0;
                for (let b = Math.floor(from); b < to && freq; b++) { sum += freq[b]; count++; }
                const heard = count ? sum / count / 255 : 0;
                loudness += heard / BARS;
                if (i < 6) bass += heard / 6;
                // Jump up with the beat, fall away slowly
                const speed = heard > levels[i] ? 22 : 5;
                levels[i] += (heard - levels[i]) * Math.min(1, speed * dt);
            }
            const silent = loudness < 0.01;

            ctx.clearRect(0, 0, w, h);
            ctx.globalCompositeOperation = 'lighter';
            ctx.lineCap = 'round';
            const midX = w / 2;
            const midY = h / 2;
            const t = calm ? 0 : now / 1000;

            // A soft glow behind it all that swells with the bass
            const glow = ctx.createRadialGradient(midX, midY, 0, midX, midY, Math.max(w * 0.5, 1));
            glow.addColorStop(0, `rgba(150, 175, 255, ${0.12 + bass * 0.4})`);
            glow.addColorStop(1, 'rgba(150, 175, 255, 0)');
            ctx.fillStyle = glow;
            ctx.fillRect(0, 0, w, h);

            // Sparks drifting up, faster and brighter on the beat
            sparks.forEach((s) => {
                if (!calm) {
                    s.y -= (0.03 + bass * 0.28) * s.speed * dt;
                    if (s.y < 0) { s.y = 1; s.x = Math.random(); }
                }
                const alpha = (0.2 + bass * 0.7) * (0.5 + 0.5 * Math.sin(t * 2 + s.twinkle));
                ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
                ctx.beginPath();
                ctx.arc(s.x * w, s.y * h, s.size * dpr, 0, Math.PI * 2);
                ctx.fill();
            });

            // The bars, mirrored out from the middle, and up and down from the centre line
            const gap = (w * 0.94) / (BARS * 2);
            ctx.lineWidth = Math.max(1, gap * 0.55);
            ctx.strokeStyle = bars;
            for (let i = 0; i < BARS; i++) {
                const breathing = 0.05 + 0.035 * Math.sin(t * 1.4 - i * 0.28);
                const level = silent ? breathing : Math.max(levels[i] ** 1.35, 0.015);
                const reach = level * h * 0.46;
                [midX - (i + 0.5) * gap, midX + (i + 0.5) * gap].forEach((x) => {
                    ctx.beginPath();
                    ctx.moveTo(x, midY - reach);
                    ctx.lineTo(x, midY + reach);
                    ctx.stroke();
                });
            }

            // The wave itself, across the middle
            const points = 96;
            const trace = () => {
                ctx.beginPath();
                for (let p = 0; p <= points; p++) {
                    const k = p / points;
                    const sample = !silent && wave ? (wave[Math.floor(k * (wave.length - 1))] - 128) / 128 : Math.sin(k * 18 + t * 2) * 0.05;
                    const y = midY + sample * h * 0.42 * Math.sin(k * Math.PI);   // pinned down at both ends
                    if (p === 0) ctx.moveTo(k * w, y);
                    else ctx.lineTo(k * w, y);
                }
                ctx.stroke();
            };
            ctx.strokeStyle = 'rgba(190, 210, 255, 0.28)';
            ctx.lineWidth = 5 * dpr;
            trace();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.lineWidth = 1.3 * dpr;
            trace();
        };
        frame = requestAnimationFrame(draw);
        return () => cancelAnimationFrame(frame);
    }, []);

    return <canvas ref={canvasRef} className="cc-visualizer" aria-hidden="true" />;
}
