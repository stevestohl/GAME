import React, { useEffect, useRef } from 'react';

// 🛋️ The Couch Cast crew (Core deck lobby): a couch on little legs crawls in and sits down, then a
// robot, a dog and an alien wander in, hop onto it, and the robot casts to "the screen", which is
// the QR code card. Now and then one of them gets up and peeks out from behind the QR card.
//
// The whole scene is one SVG laid over the lobby *behind* the QR card, so nobody can ever walk in
// front of the code. The couch sits in `stageRef` (the space under the players card), facing the QR
// card (`screenRef`); `qrRef` is the code's own box, which lights up when the cast lands.
//
// Drawing units: each character is ~100 units tall with its feet at (0, 0); the couch is 200 wide.

const SEATS = ['robot', 'dog', 'alien'];   // left to right: the robot sits nearest the screen
const HIP = 30;          // where a character bends to sit (units up from its feet)
const SEAT_TOP = 44;     // the couch cushions' top (units up from the floor)

const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
const easeOut = (t) => 1 - (1 - t) ** 3;
const linear = (t) => t;
const rand = (min, max) => min + Math.random() * (max - min);

export default function CouchCrew({ stageRef, screenRef, qrRef, playerCount = 0 }) {
    const svgRef = useRef(null);
    const couchRef = useRef(null);
    const beamRef = useRef(null);
    const actorEls = { robot: useRef(null), dog: useRef(null), alien: useRef(null) };
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
            const qr = (qrRef?.current || screenRef.current).getBoundingClientRect();
            const cs = Math.max(0.4, Math.min((stage.width * 0.92) / 200, stage.height / 128));
            // Toward the screen side of its spot, clear of the room code pill in the bottom corner
            const cx = stage.left - root.left + Math.min(stage.width / 2, 104 * cs + 8);
            const floorY = stage.bottom - root.top - 2;
            const s = cs * 0.95;   // character scale
            L = {
                width: root.width,
                height: root.height,
                cs,
                s,
                cx,
                floorY,
                seatX: [-50, 0, 50].map((u) => cx + u * cs),
                seatY: floorY - SEAT_TOP * cs + HIP * s,   // feet position for a seated character
                offRight: root.width + 120 * cs,
                screenRight: screen.right - root.left,
                qrMidY: qr.top - root.top + qr.height / 2,
            };
            svg.setAttribute('viewBox', `0 0 ${root.width} ${root.height}`);
        };

        // --- The cast: a couch and three characters, each a position the frames below move around ---
        const couch = { x: 0, y: 0, el: couchRef.current };
        const actors = Object.fromEntries(SEATS.map((name, i) => [name, {
            name, seat: i, x: 0, y: 0, rot: 0, lift: 0, spot: 'off', busy: true, el: actorEls[name].current,
        }]));
        const drawCouch = () => couch.el.setAttribute('transform', `translate(${couch.x} ${couch.y}) scale(${L.cs})`);
        const draw = (a) => a.el.setAttribute('transform', `translate(${a.x} ${a.y - a.lift}) rotate(${a.rot}) scale(${L.s})`);
        const look = (a, where) => a.el.setAttribute('data-look', where);   // 'left' (the screen), 'right', 'front'

        // Put everyone where they belong (first draw, and after the screen changes size)
        const snap = () => {
            if (couch.spot === 'home') { couch.x = L.cx; couch.y = L.floorY; drawCouch(); }
            Object.values(actors).forEach((a) => {
                if (a.spot === 'seat') { a.x = L.seatX[a.seat]; a.y = L.seatY; draw(a); }
                else if (a.spot === 'off') { a.x = L.offRight; a.y = L.floorY; draw(a); }
            });
            if (couch.spot === 'off') { couch.x = L.offRight; couch.y = L.floorY; drawCouch(); }
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
        const walkTo = async (a, x) => {
            const from = a.x;
            const ms = (Math.abs(x - from) / (75 * L.cs)) * 1000;
            a.el.classList.add('crew-walking');
            look(a, x < from ? 'left' : 'right');
            await tween(ms, linear, (t) => { a.x = from + (x - from) * t; draw(a); });
            a.el.classList.remove('crew-walking');
        };
        const hop = (a, toX, toY, height, ms = 420) => {
            const fromX = a.x;
            const fromY = a.y;
            return tween(ms, easeInOut, (t) => {
                a.x = fromX + (toX - fromX) * t;
                a.y = fromY + (toY - fromY) * t;
                a.lift = Math.sin(Math.PI * t) * height * L.cs;
                draw(a);
            });
        };
        const sitDown = async (a) => {
            await hop(a, L.seatX[a.seat], L.seatY, 22);
            a.spot = 'seat';
            look(a, 'left');
        };
        const standUp = async (a) => {
            a.spot = 'floor';
            await hop(a, L.seatX[a.seat] - 8 * L.cs, L.floorY, 16, 380);
        };

        // 📡 The robot holds up its phone: cast waves, a beam to the QR card, and the code lights up
        const cast = async () => {
            const robot = actors.robot;
            robot.el.classList.add('crew-casting');
            await wait(350);
            // The phone, at the end of the robot's raised arm (see the robot's drawing)
            const px = robot.x - 39 * L.s;
            const py = robot.y - 78 * L.s;
            const tx = L.screenRight + 6;
            const ty = L.qrMidY;
            const lift = Math.min(py, ty) - 70 * L.cs;
            const beam = beamRef.current;
            beam.querySelector('.crew-beam-path').setAttribute('d', `M ${px} ${py} Q ${(px + tx) / 2} ${lift} ${tx} ${ty}`);
            beam.querySelectorAll('.crew-wave').forEach((c) => {
                c.setAttribute('cx', px);
                c.setAttribute('cy', py);
            });
            beam.querySelectorAll('.crew-wave').forEach((c, i) => c.setAttribute('r', (6 + i * 7) * L.cs));
            beam.classList.add('is-on');
            await wait(900);
            qrRef?.current?.classList.add('cc-qr-on');
            await wait(2200);
            beam.classList.remove('is-on');
            robot.el.classList.remove('crew-casting');
        };

        // 🎉 Everyone on the couch bounces (someone joined, or the cast landed)
        const cheer = () => Object.values(actors).forEach((a, i) => {
            if (a.spot !== 'seat' || a.busy) return;
            a.busy = true;
            wait(i * 110)
                .then(() => tween(460, linear, (t) => { a.lift = Math.sin(Math.PI * t) * 14 * L.cs; draw(a); }))
                .then(() => { a.lift = 0; draw(a); a.busy = false; });
        });

        // 👀 Someone gets up, walks behind the QR card and peeks out from its edge, then comes back
        const peek = async (a) => {
            a.busy = true;
            await standUp(a);
            const hidden = L.screenRight - 42 * L.s;   // all the way behind the card
            await walkTo(a, hidden);
            const times = Math.random() < 0.4 ? 2 : 1;
            for (let n = 0; n < times; n++) {
                await wait(rand(400, 900));
                // Lean out past the card's edge, have a look around the room, lean back
                const fromX = a.x;
                await tween(420, easeOut, (t) => { a.x = fromX + 20 * L.s * t; a.rot = 15 * t; draw(a); });
                look(a, n === 0 ? 'right' : 'front');
                await wait(rand(1300, 2000));
                await tween(360, easeInOut, (t) => { a.x = fromX + 20 * L.s * (1 - t); a.rot = 15 * (1 - t); draw(a); });
            }
            await wait(500);
            await walkTo(a, L.seatX[a.seat] - 8 * L.cs);
            await sitDown(a);
            a.busy = false;
        };
        const peekNow = () => {
            if (dead) return;
            const free = Object.values(actors).filter((a) => a.spot === 'seat' && !a.busy);
            if (free.length) peek(free[Math.floor(Math.random() * free.length)]);
            const id = setTimeout(() => { timers.delete(id); peekNow(); }, rand(17000, 27000));
            timers.add(id);
        };

        // --- The show ---
        const intro = async () => {
            // The couch scuttles in from the right and plops down
            couch.spot = 'moving';
            couch.el.classList.add('couch-crawling');
            await tween(2400, (t) => easeOut(t) * 0.25 + t * 0.75, (t) => {
                couch.x = L.offRight + (L.cx - L.offRight) * t;
                drawCouch();
            });
            couch.spot = 'home';
            couch.el.classList.remove('couch-crawling');
            couch.el.classList.add('couch-plop');
            await wait(450);

            // The crew strolls in one after another and hops up
            await Promise.all(SEATS.map(async (name, i) => {
                const a = actors[name];
                await wait(i * 750);
                a.spot = 'floor';
                await walkTo(a, L.seatX[a.seat] - 8 * L.cs);
                await sitDown(a);
            }));
            await wait(500);
            await cast();
            Object.values(actors).forEach((a) => { a.busy = false; });
            cheer();
            const id = setTimeout(() => { timers.delete(id); peekNow(); }, rand(9000, 14000));
            timers.add(id);
        };

        measure();
        couch.spot = reduceMotion ? 'home' : 'off';
        if (reduceMotion) {
            // No moving about: the crew is already settled on the couch, the code already lit
            Object.values(actors).forEach((a) => { a.spot = 'seat'; a.busy = false; look(a, 'left'); });
            qrRef?.current?.classList.add('cc-qr-on');
        }
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

    // Someone new joined: the crew cheers
    const lastCount = useRef(playerCount);
    useEffect(() => {
        if (playerCount > lastCount.current) engineRef.current?.cheer();
        lastCount.current = playerCount;
    }, [playerCount]);

    return (
        <svg ref={svgRef} className="cc-crew" aria-hidden="true" preserveAspectRatio="none">
            {/* 📡 The cast beam (only while the robot is casting) */}
            <g ref={beamRef} className="crew-beam">
                <path className="crew-beam-path" d="" />
                <circle className="crew-wave" />
                <circle className="crew-wave" />
                <circle className="crew-wave" />
            </g>

            <Couch couchRef={couchRef} />
            <Robot elRef={actorEls.robot} />
            <Dog elRef={actorEls.dog} />
            <Alien elRef={actorEls.alien} />
        </svg>
    );
}

// --- The drawings (feet at 0,0; up is negative y) ---

function Couch({ couchRef }) {
    return (
        <g ref={couchRef}>
            <g className="couch-legs">
                {[-86, -58, 50, 78].map((x) => <rect key={x} className="couch-leg" x={x} y={-13} width={8} height={13} rx={3} />)}
            </g>
            <g className="couch-body">
                <rect x={-96} y={-27} width={192} height={16} rx={6} fill="#c96d1c" />
                <rect x={-86} y={-86} width={172} height={50} rx={16} fill="#f19a3e" />
                <path d="M -60 -78 Q -60 -48 -54 -42 M 0 -78 Q 0 -48 0 -42 M 60 -78 Q 60 -48 54 -42" stroke="#d67f26" strokeWidth={3} fill="none" strokeLinecap="round" />
                {[-76, -25, 26].map((x) => <rect key={x} x={x} y={-46} width={50} height={22} rx={7} fill="#f7b260" stroke="#d67f26" strokeWidth={2} />)}
                <rect x={-102} y={-60} width={26} height={44} rx={11} fill="#e8892f" />
                <rect x={76} y={-60} width={26} height={44} rx={11} fill="#e8892f" />
            </g>
        </g>
    );
}

function Robot({ elRef }) {
    return (
        <g ref={elRef} className="crew-actor crew-robot" data-look="left">
            <g className="crew-fig">
                <g className="crew-leg crew-leg-l"><rect x={-14} y={-30} width={9} height={27} rx={3} fill="#5b6b7f" /><rect x={-17} y={-6} width={14} height={6} rx={3} fill="#3c4858" /></g>
                <g className="crew-leg crew-leg-r"><rect x={5} y={-30} width={9} height={27} rx={3} fill="#5b6b7f" /><rect x={3} y={-6} width={14} height={6} rx={3} fill="#3c4858" /></g>
                <rect x={-20} y={-62} width={40} height={36} rx={8} fill="#d5dee9" stroke="#5b6b7f" strokeWidth={2} />
                <rect x={-10} y={-54} width={20} height={11} rx={3} fill="#34d1bf" />
                <circle cx={-12} cy={-33} r={2.2} fill="#ff5a5f" /><circle cx={12} cy={-33} r={2.2} fill="#ffd23f" />
                {/* The arm on the screen side holds the phone it casts with */}
                <g className="crew-arm-cast">
                    <rect x={-27} y={-59} width={7} height={24} rx={3.5} fill="#9fb0c3" />
                    <rect x={-29} y={-38} width={11} height={8} rx={2} fill="#1d2a3a" />
                </g>
                <rect x={20} y={-59} width={7} height={24} rx={3.5} fill="#9fb0c3" />
                <rect x={-5} y={-67} width={10} height={6} fill="#9fb0c3" />
                <rect x={-17} y={-92} width={34} height={26} rx={7} fill="#d5dee9" stroke="#5b6b7f" strokeWidth={2} />
                <rect x={-12} y={-86} width={24} height={13} rx={4} fill="#1d2a3a" />
                <g className="crew-eyes"><g className="crew-pupils">
                    <rect x={-8} y={-82.5} width={5} height={6} rx={2} fill="#34d1bf" />
                    <rect x={3} y={-82.5} width={5} height={6} rx={2} fill="#34d1bf" />
                </g></g>
                <line x1={0} y1={-92} x2={0} y2={-99} stroke="#5b6b7f" strokeWidth={2.5} />
                <circle className="crew-robot-light" cx={0} cy={-101} r={3.2} fill="#ff5a5f" />
            </g>
        </g>
    );
}

function Dog({ elRef }) {
    return (
        <g ref={elRef} className="crew-actor crew-dog" data-look="left">
            <g className="crew-fig">
                <path className="crew-dog-tail" d="M 15 -38 q 15 -4 13 -21" stroke="#c98a4b" strokeWidth={6} fill="none" strokeLinecap="round" />
                <g className="crew-leg crew-leg-l"><rect x={-14} y={-28} width={10} height={26} rx={5} fill="#d9a066" /><ellipse cx={-9} cy={-2.5} rx={7} ry={3.5} fill="#f3d3a8" /></g>
                <g className="crew-leg crew-leg-r"><rect x={4} y={-28} width={10} height={26} rx={5} fill="#d9a066" /><ellipse cx={9} cy={-2.5} rx={7} ry={3.5} fill="#f3d3a8" /></g>
                <ellipse cx={0} cy={-44} rx={20} ry={20} fill="#d9a066" />
                <ellipse cx={0} cy={-40} rx={11} ry={13} fill="#f3d3a8" />
                <ellipse cx={-19} cy={-44} rx={5} ry={10} fill="#c98a4b" />
                <ellipse cx={19} cy={-44} rx={5} ry={10} fill="#c98a4b" />
                <rect x={-12} y={-62} width={24} height={5} rx={2.5} fill="#e63946" />
                <circle cx={0} cy={-56} r={2.6} fill="#ffd23f" />
                <ellipse cx={-17} cy={-76} rx={6.5} ry={14} fill="#a8703a" transform="rotate(18 -17 -76)" />
                <ellipse cx={17} cy={-76} rx={6.5} ry={14} fill="#a8703a" transform="rotate(-18 17 -76)" />
                <circle cx={0} cy={-77} r={18} fill="#d9a066" />
                <ellipse cx={0} cy={-68} rx={10.5} ry={7.5} fill="#f3d3a8" />
                <path d="M -3 -62.5 q 3 6 6 0 Z" fill="#ff7b9c" />
                <ellipse cx={0} cy={-72} rx={4} ry={3} fill="#3b2a20" />
                <g className="crew-eyes"><g className="crew-pupils">
                    <circle cx={-7} cy={-82} r={3.2} fill="#3b2a20" /><circle cx={-6} cy={-83} r={1} fill="#fff" />
                    <circle cx={7} cy={-82} r={3.2} fill="#3b2a20" /><circle cx={8} cy={-83} r={1} fill="#fff" />
                </g></g>
            </g>
        </g>
    );
}

function Alien({ elRef }) {
    return (
        <g ref={elRef} className="crew-actor crew-alien" data-look="left">
            <g className="crew-fig">
                <g className="crew-leg crew-leg-l"><rect x={-11} y={-28} width={7} height={26} rx={3.5} fill="#6cc84a" /><ellipse cx={-8} cy={-2.5} rx={6} ry={3} fill="#4fa33a" /></g>
                <g className="crew-leg crew-leg-r"><rect x={4} y={-28} width={7} height={26} rx={3.5} fill="#6cc84a" /><ellipse cx={8} cy={-2.5} rx={6} ry={3} fill="#4fa33a" /></g>
                <rect x={-14} y={-58} width={28} height={33} rx={12} fill="#7ed957" />
                <rect x={-15} y={-52} width={30} height={24} rx={10} fill="#8b5cf6" />
                <circle cx={0} cy={-41} r={3.5} fill="#ffd23f" />
                <rect x={-21} y={-54} width={6} height={22} rx={3} fill="#7ed957" />
                <rect x={15} y={-54} width={6} height={22} rx={3} fill="#7ed957" />
                <rect x={-3.5} y={-62} width={7} height={6} fill="#6cc84a" />
                <g className="crew-alien-antenna">
                    <line x1={-8} y1={-92} x2={-15} y2={-104} stroke="#4fa33a" strokeWidth={2.5} strokeLinecap="round" />
                    <circle cx={-15} cy={-105} r={3.4} fill="#ffd23f" />
                    <line x1={8} y1={-92} x2={15} y2={-104} stroke="#4fa33a" strokeWidth={2.5} strokeLinecap="round" />
                    <circle cx={15} cy={-105} r={3.4} fill="#ffd23f" />
                </g>
                <ellipse cx={0} cy={-78} rx={22} ry={17} fill="#7ed957" />
                <g className="crew-eyes">
                    <ellipse cx={-9} cy={-79} rx={6.5} ry={8.5} fill="#1b1b2f" transform="rotate(-22 -9 -79)" />
                    <ellipse cx={9} cy={-79} rx={6.5} ry={8.5} fill="#1b1b2f" transform="rotate(22 9 -79)" />
                    <g className="crew-pupils"><circle cx={-9} cy={-82} r={2} fill="#fff" /><circle cx={9} cy={-82} r={2} fill="#fff" /></g>
                </g>
                <path d="M -5 -67 q 5 4 10 0" stroke="#2f6b22" strokeWidth={2} fill="none" strokeLinecap="round" />
            </g>
        </g>
    );
}
