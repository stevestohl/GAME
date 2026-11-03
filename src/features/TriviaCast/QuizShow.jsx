import React, { useEffect, useRef } from 'react';
import { Lincoln, BabeRuth, Cleopatra, Earhart, Plane, Podium, JungleBack, JungleFront, Dinosaur } from './QuizCast.jsx';

// 🎓 Trivia Cast's lobby show, in the space under the players card: four podiums grow out of the floor, then
// Abraham Lincoln, Babe Ruth and Cleopatra grow up behind theirs, and Amelia Earhart flies in to take the last.
// Every so often the ground shakes, a jungle and a volcano push up behind them and a T. rex springs out and
// roars. Everyone runs for it behind the QR card (Earhart gets a lift), the jungle sinks away and they all come back.
//
// Like the Couch Cast crew, it's one SVG laid over the lobby *behind* the cards, so it can't cover the QR code.
// Drawing units: each character is ~100 units tall with its feet at (0, 0).

const SEATS = [
    { name: 'lincoln', letter: 'A', color: '#e5484d', Actor: Lincoln },
    { name: 'ruth', letter: 'B', color: '#2f7fd1', Actor: BabeRuth },
    { name: 'cleopatra', letter: 'C', color: '#e8a21c', Actor: Cleopatra },
    { name: 'earhart', letter: 'D', color: '#2ea866', Actor: Earhart },
];

const FIRST_DINO_MS = [22000, 30000];
const NEXT_DINO_MS = [70000, 100000];

const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
const easeOut = (t) => 1 - (1 - t) ** 3;
const easeIn = (t) => t * t;
const linear = (t) => t;
const springy = (t) => 1 + 2.4 * (t - 1) ** 3 + 1.4 * (t - 1) ** 2;   // overshoots, then settles
const rand = (min, max) => min + Math.random() * (max - min);

export default function QuizShow({ stageRef, screenRef, playerCount = 0 }) {
    const svgRef = useRef(null);
    const podiumEls = useRef([]);
    const actorEls = useRef([]);
    const planeRef = useRef(null);
    const backRef = useRef(null);
    const frontRef = useRef(null);
    const dinoRef = useRef(null);
    const clipRef = useRef(null);
    const roarRef = useRef(null);
    const yikesRef = useRef(null);
    const engineRef = useRef(null);

    useEffect(() => {
        const svg = svgRef.current;
        if (!svg || !stageRef.current || !screenRef.current) return undefined;

        const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
        const frames = new Set();
        const timers = new Set();
        let dead = false;

        // --- Where everything goes, measured from the page (redone when the screen changes size) ---
        let L = null;
        const measure = () => {
            const root = svg.parentElement.getBoundingClientRect();
            const stage = stageRef.current.getBoundingClientRect();
            const screen = screenRef.current.getBoundingClientRect();
            // Keep the last podium clear of the room code pill in the bottom corner
            const pill = document.querySelector('.cc-room-code')?.getBoundingClientRect();
            const usable = stage.width - (pill ? Math.min(pill.width * 0.75, stage.width * 0.2) : 0);
            const slot = usable / SEATS.length;
            const s = Math.max(0.3, Math.min(stage.height / 190, slot / 70));
            const left = stage.left - root.left;
            const floorY = stage.bottom - root.top - 2;
            L = {
                width: root.width,
                s,
                floorY,
                stageTop: stage.top - root.top,
                seatX: SEATS.map((_, i) => left + slot * (i + 0.5)),
                hiddenX: screen.right - root.left - 70 * s,   // all the way behind the QR card
                offRight: root.width + 110 * s,
                planeY: floorY - 142 * s,
                // The jungle fills the whole space; the dinosaur stands left of the volcano
                midX: left + stage.width / 2,
                jungleX: stage.width / 400,
                jungleY: stage.height / 190,
                dinoX: left + stage.width * 0.46,
                dinoSize: Math.min(stage.height / 190, stage.width / 280),
            };
            svg.setAttribute('viewBox', `0 0 ${root.width} ${root.height}`);
            clipRef.current.setAttribute('width', root.width);
            clipRef.current.setAttribute('height', floorY + 1);
        };

        // --- The cast ---
        const podiums = SEATS.map((_, i) => ({ grow: reduceMotion ? 1 : 0, el: podiumEls.current[i] }));
        const actors = SEATS.map((seat, i) => ({
            name: seat.name, seat: i, x: 0, y: 0, rot: 0, lift: 0, grow: reduceMotion ? 1 : 0, flip: 1,
            spot: reduceMotion ? 'seat' : 'off', busy: true, el: actorEls.current[i],
        }));
        const earhart = actors[3];
        const plane = { x: 0, y: 0, rot: 0, on: false, el: planeRef.current };
        const jungle = { grow: 0 };
        const dino = { y: 0, on: false, el: dinoRef.current };
        let eventRunning = false;

        const drawPodium = (p, i) => p.el.setAttribute('transform', `translate(${L.seatX[i]} ${L.floorY}) scale(${L.s} ${L.s * p.grow})`);
        const draw = (a) => a.el.setAttribute('transform',
            `translate(${a.x} ${a.y - a.lift}) rotate(${a.rot}) scale(${a.flip * L.s * a.grow} ${L.s * a.grow})`);
        const drawPlane = () => {
            plane.el.style.display = plane.on ? '' : 'none';
            plane.el.setAttribute('transform', `translate(${plane.x} ${plane.y}) rotate(${plane.rot}) scale(${L.s * 0.95})`);
        };
        const drawJungle = () => {
            [backRef.current, frontRef.current].forEach((el) => {
                el.style.display = jungle.grow > 0 ? '' : 'none';
                el.setAttribute('transform', `translate(${L.midX} ${L.floorY}) scale(${L.jungleX} ${L.jungleY * jungle.grow})`);
            });
        };
        const drawDino = () => {
            dino.el.style.display = dino.on ? '' : 'none';
            dino.el.setAttribute('transform', `translate(${L.dinoX} ${L.floorY + dino.y * L.dinoSize}) scale(${L.dinoSize})`);
        };
        const look = (a, where) => a.el.setAttribute('data-look', where);

        // Put everything where it belongs (first draw, and after the screen changes size)
        const snap = () => {
            podiums.forEach(drawPodium);
            actors.forEach((a) => {
                if (a.spot === 'seat') { a.x = L.seatX[a.seat]; a.y = L.floorY; }
                if (a.spot === 'off') { a.x = L.hiddenX; a.y = L.floorY; }
                draw(a);
            });
            drawPlane();
            drawJungle();
            drawDino();
        };

        // --- Little helpers for the choreography ---
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
        const walkTo = async (a, x, speed, gait = 'crew-walking') => {
            const from = a.x;
            a.el.classList.add(gait);
            look(a, x < from ? 'left' : 'right');
            await tween((Math.abs(x - from) / (speed * L.s)) * 1000, linear, (t) => { a.x = from + (x - from) * t; draw(a); });
            a.el.classList.remove(gait);
        };
        const hop = (a, toX, toY, height, ms) => {
            const fromX = a.x;
            const fromY = a.y;
            return tween(ms, easeInOut, (t) => {
                a.x = fromX + (toX - fromX) * t;
                a.y = fromY + (toY - fromY) * t;
                a.lift = Math.sin(Math.PI * t) * height * L.s;
                draw(a);
            });
        };
        const growUp = (a) => tween(700, springy, (t) => { a.grow = t; draw(a); });
        const flash = (i) => {
            const panel = podiums[i].el;
            panel.classList.remove('is-lit');
            panel.getBoundingClientRect();   // restart its flash
            panel.classList.add('is-lit');
        };
        const bubble = async (el, x, y, ms) => {
            el.setAttribute('transform', `translate(${x} ${Math.max(y, L.stageTop + 16 * L.s)}) scale(${L.s})`);
            el.classList.add('is-on');
            await wait(ms);
            el.classList.remove('is-on');
        };

        // 🎉 Someone joined: everyone at a podium bounces, and the podiums light up
        const cheer = () => actors.forEach((a, i) => {
            if (a.spot !== 'seat' || a.busy) return;
            a.busy = true;
            flash(i);
            wait(i * 110)
                .then(() => tween(460, linear, (t) => { a.lift = Math.sin(Math.PI * t) * 12 * L.s; draw(a); }))
                .then(() => { a.lift = 0; draw(a); a.busy = false; });
        });

        // ✈️ The plane comes in from the right, slows over the last podium, Earhart hops down, and it flies on
        const flyIn = async () => {
            const x = L.seatX[3];
            earhart.spot = 'moving';
            earhart.grow = 0;
            draw(earhart);
            plane.el.classList.remove('is-empty');
            plane.on = true;
            plane.x = L.offRight;
            await tween(1900, easeOut, (t) => {
                plane.x = L.offRight + (x + 26 * L.s - L.offRight) * t;
                plane.y = L.planeY - (1 - t) * 26 * L.s + Math.sin(t * Math.PI * 2) * 6 * L.s;
                plane.rot = -8 * (1 - t);
                drawPlane();
            });
            await wait(300);
            plane.el.classList.add('is-empty');
            earhart.grow = 1;
            earhart.x = plane.x + 10 * L.s;
            earhart.y = plane.y + 6 * L.s;
            earhart.flip = 1;
            draw(earhart);
            const fromX = plane.x;
            await Promise.all([
                hop(earhart, x, L.floorY, 14, 620),
                tween(1500, easeIn, (t) => {
                    plane.x = fromX + (L.hiddenX - fromX) * t;
                    plane.rot = -4 * t;
                    drawPlane();
                }),
            ]);
            plane.on = false;
            drawPlane();
            earhart.spot = 'seat';
            look(earhart, 'front');
            flash(3);
        };

        // ...and on the way out, it comes back just in time and off they go
        const flyOut = async () => {
            const x = L.seatX[3];
            plane.el.classList.add('is-empty');
            plane.on = true;
            plane.x = L.offRight;
            plane.rot = 0;
            await tween(1100, easeOut, (t) => {
                plane.x = L.offRight + (x + 26 * L.s - L.offRight) * t;
                plane.y = L.planeY;
                drawPlane();
            });
            earhart.spot = 'moving';
            await hop(earhart, plane.x + 10 * L.s, plane.y + 6 * L.s, 10, 300);
            earhart.grow = 0;
            draw(earhart);
            plane.el.classList.remove('is-empty');
            const fromX = plane.x;
            await tween(1200, easeIn, (t) => {
                plane.x = fromX + (L.hiddenX - fromX) * t;
                plane.rot = 5 * t;
                drawPlane();
            });
            plane.on = false;
            plane.rot = 0;
            drawPlane();
            earhart.spot = 'off';
        };

        const roar = async () => {
            dino.el.classList.add('is-roaring');
            await bubble(roarRef.current, L.dinoX - 150 * L.dinoSize, L.floorY - 180 * L.dinoSize, 1300);
            dino.el.classList.remove('is-roaring');
        };

        // 🦖 The big scare
        const dinoVisit = async () => {
            eventRunning = true;
            actors.forEach((a) => { a.busy = true; look(a, 'right'); });
            const walkers = actors.slice(0, 3);

            // The ground shakes, and up comes the jungle
            svg.classList.add('is-rumbling');
            await tween(1500, easeOut, (t) => { jungle.grow = t; drawJungle(); });
            svg.classList.remove('is-rumbling');
            backRef.current.classList.add('quiz-smoking');
            await wait(700);

            // The dinosaur springs out, from under the floor
            dino.on = true;
            dino.y = 190;
            drawDino();
            const jump = tween(620, springy, (t) => { dino.y = 190 * (1 - t); drawDino(); });
            await wait(250);
            const scream = bubble(yikesRef.current, L.seatX[0] + 14 * L.s, L.floorY - 138 * L.s, 900);
            actors.forEach((a) => a.el.classList.add('quiz-scared'));
            await jump;
            const roared = roar();

            // Everyone runs for it, behind the QR card (the plane comes back for Earhart)
            await wait(350);
            await Promise.all(walkers.map((a) => hop(a, a.x, a.y, 16, 260)));
            actors.forEach((a) => a.el.classList.remove('quiz-scared'));
            const escape = flyOut();
            await Promise.all(walkers.map(async (a) => {
                a.spot = 'moving';
                a.rot = -8;
                await wait((2 - a.seat) * 90);
                await walkTo(a, L.hiddenX, 340, 'crew-running');
                a.spot = 'off';
                a.rot = 0;
                a.grow = 0;
                draw(a);
            }));
            await Promise.all([roared, scream, escape]);

            // It has the place to itself for a moment, then it all sinks back into the floor
            await wait(500);
            await roar();
            await wait(400);
            await tween(700, easeIn, (t) => { dino.y = 190 * t; drawDino(); });
            dino.on = false;
            drawDino();
            backRef.current.classList.remove('quiz-smoking');
            svg.classList.add('is-rumbling');
            await tween(1200, easeInOut, (t) => { jungle.grow = 1 - t; drawJungle(); });
            svg.classList.remove('is-rumbling');
            await wait(1200);

            // The coast is clear: they creep back to their podiums, and the plane drops Earhart off
            await Promise.all(walkers.map(async (a) => {
                await wait(a.seat * 500);
                a.grow = 1;
                a.x = L.hiddenX;
                a.y = L.floorY;
                draw(a);
                a.spot = 'moving';
                await walkTo(a, L.seatX[a.seat], 90);
                a.spot = 'seat';
                look(a, 'front');
                flash(a.seat);
            }));
            await flyIn();
            actors.forEach((a) => { a.busy = false; });
            eventRunning = false;
            cheer();
        };
        const dinoNow = (delay) => {
            const id = setTimeout(() => {
                timers.delete(id);
                if (dead) return;
                if (eventRunning) { dinoNow(4000); return; }
                dinoVisit().then(() => { if (!dead) dinoNow(rand(...NEXT_DINO_MS)); });
            }, delay);
            timers.add(id);
        };

        // --- The show: the podiums grow, then three of the contestants, then Earhart flies in ---
        const intro = async () => {
            await Promise.all(podiums.map(async (p, i) => {
                await wait(i * 260);
                await tween(650, springy, (t) => { p.grow = t; drawPodium(p, i); });
            }));
            await wait(350);
            for (const a of actors.slice(0, 3)) {
                a.spot = 'seat';
                a.x = L.seatX[a.seat];
                a.y = L.floorY;
                growUp(a);
                flash(a.seat);
                await wait(520);
            }
            await wait(500);
            await flyIn();
            actors.forEach((a) => { a.busy = false; });
            cheer();
            dinoNow(rand(...FIRST_DINO_MS));
        };

        measure();
        snap();
        svg.classList.add('is-ready');
        if (!reduceMotion) intro();

        // The screen changed size (rotated, resized, the bar slid away): put everyone back in place
        const observer = new ResizeObserver(() => { measure(); snap(); });
        observer.observe(svg.parentElement);
        observer.observe(stageRef.current);

        engineRef.current = { cheer };
        return () => {
            dead = true;
            engineRef.current = null;
            observer.disconnect();
            frames.forEach((id) => cancelAnimationFrame(id));
            timers.forEach((id) => clearTimeout(id));
        };
    }, []);

    // Someone new joined: they all cheer
    const lastCount = useRef(playerCount);
    useEffect(() => {
        if (playerCount > lastCount.current) engineRef.current?.cheer();
        lastCount.current = playerCount;
    }, [playerCount]);

    const speech = "M -4 -14 H 40 a 6 6 0 0 1 6 6 V 6 a 6 6 0 0 1 -6 6 H 8 L -2 20 L 0 12 H -4 a 6 6 0 0 1 -6 -6 V -8 a 6 6 0 0 1 6 -6 Z";
    const label = { x: 18, y: 4, textAnchor: 'middle', fontSize: 13, fontWeight: 900, fill: '#16161d', fontFamily: 'system-ui, sans-serif' };

    return (
        <svg ref={svgRef} className="cc-crew" aria-hidden="true" preserveAspectRatio="none">
            <defs>
                {/* Nothing shows below the floor: that's where the dinosaur springs up from */}
                <clipPath id="quiz-floor"><rect ref={clipRef} x={0} y={0} width={0} height={0} /></clipPath>
            </defs>
            <g className="crew-world">
                <JungleBack backRef={backRef} />
                <g clipPath="url(#quiz-floor)"><Dinosaur elRef={dinoRef} /></g>
                <JungleFront frontRef={frontRef} />
                {SEATS.map(({ name, Actor }, i) => <Actor key={name} elRef={(el) => { actorEls.current[i] = el; }} />)}
                {SEATS.map(({ name, letter, color }, i) => <Podium key={name} letter={letter} color={color} elRef={(el) => { podiumEls.current[i] = el; }} />)}
                <Plane planeRef={planeRef} />
            </g>
            <g ref={roarRef} className="crew-bark">
                <path d={speech} fill="#fff" stroke="#16161d" strokeWidth={2.4} strokeLinejoin="round" />
                <text {...label}>ROAR!</text>
            </g>
            <g ref={yikesRef} className="crew-bark">
                <path d={speech} fill="#fff" stroke="#16161d" strokeWidth={2.4} strokeLinejoin="round" />
                <text {...label}>YIKES!</text>
            </g>
        </svg>
    );
}
