import React, { useEffect, useRef } from 'react';

// 🕵️ Temple Mix Up's lobby show, in the space under the players card: three secret agents who can't stop changing
// their disguises (the game keeps changing too). A puff of smoke and each one is someone else: a trench coat,
// a chef, a tourist, a granny, the fake nose and glasses, a walking bush, a cardboard box. Now and then one of
// them tiptoes off behind the QR card and comes back as somebody new, while a searchlight sweeps the room.
//
// Like the other lobby shows, it's one SVG laid over the lobby *behind* the cards, so it can't cover the QR code.
// Each figure is ~100 units tall with its feet at (0, 0).

const INK = '#16161d';
const ink = { stroke: INK, strokeWidth: 2.4, strokeLinejoin: 'round' };
const line = { stroke: INK, strokeLinecap: 'round', fill: 'none' };
const SKIN = '#e2b692';

const AGENTS = 3;
const DISGUISE_GAP_MS = [1500, 2800];   // between one quick change and the next
const SNEAK_GAP_MS = [14000, 24000];    // between trips behind the QR card

const rand = (min, max) => min + Math.random() * (max - min);
const linear = (t) => t;
const easeOut = (t) => 1 - (1 - t) ** 3;

// Two legs, under anything that shows them
function Legs({ color = '#23232c', shoe = '#101016' }) {
    return (
        <>
            <g className="crew-leg crew-leg-l">
                <rect x={-12} y={-30} width={9} height={25} fill={color} {...ink} strokeWidth={2} />
                <path d="M -3 0 H -18 Q -18 -6 -12 -6 H -3 Z" fill={shoe} {...ink} strokeWidth={1.8} />
            </g>
            <g className="crew-leg crew-leg-r">
                <rect x={3} y={-30} width={9} height={25} fill={color} {...ink} strokeWidth={2} />
                <path d="M 3 0 H 18 Q 18 -6 12 -6 H 3 Z" fill={shoe} {...ink} strokeWidth={1.8} />
            </g>
        </>
    );
}

const Face = ({ fill = SKIN }) => <path d="M -13 -86 V -76 Q -13 -66 0 -65 Q 13 -66 13 -76 V -86 Q 0 -94 -13 -86 Z" fill={fill} {...ink} />;

const Trench = () => (
    <>
        <Legs />
        <path d="M -18 -62 L -24 -20 H 24 L 18 -62 Q 0 -67 -18 -62 Z" fill="#b39a6b" {...ink} />
        <path d="M 0 -62 V -20 M -21 -44 H 21" stroke={INK} strokeWidth={2} />
        <path d="M -8 -64 L 0 -52 L 8 -64 L 14 -56 L 3 -44 H -3 L -14 -56 Z" fill="#a08755" {...ink} strokeWidth={1.6} />
        <rect x={-26} y={-60} width={8} height={26} rx={3} fill="#b39a6b" {...ink} strokeWidth={2} />
        <rect x={18} y={-60} width={8} height={26} rx={3} fill="#b39a6b" {...ink} strokeWidth={2} />
        <rect x={15} y={-34} width={24} height={17} rx={2} fill="#3d2a1a" {...ink} strokeWidth={2} />
        <rect x={24} y={-37} width={6} height={4} fill={INK} />
        <Face />
        <path d="M -12 -80 H 12 L 11 -74 H 2 L 0 -77 L -2 -74 H -11 Z" fill="#111016" stroke={INK} strokeWidth={1} />
        <path d="M -5 -68 H 5" {...line} strokeWidth={1.6} />
        <path d="M -15 -86 Q -14 -102 0 -102 Q 14 -102 15 -86 Z" fill="#3a3a44" {...ink} />
        <path d="M -24 -86 Q 0 -92 24 -86 Q 0 -81 -24 -86 Z" fill="#2c2c34" {...ink} strokeWidth={2} />
        <rect x={-14} y={-92} width={28} height={4} fill="#e5484d" />
    </>
);

const Chef = () => (
    <>
        <Legs color="#3b3b47" />
        <path d="M -17 -62 L -19 -24 H 19 L 17 -62 Q 0 -67 -17 -62 Z" fill="#f6f4ee" {...ink} />
        <path d="M -5 -56 v 2 M 5 -56 v 2 M -5 -46 v 2 M 5 -46 v 2 M -5 -36 v 2 M 5 -36 v 2" stroke={INK} strokeWidth={2.4} strokeLinecap="round" />
        <rect x={-25} y={-60} width={8} height={24} rx={3} fill="#f6f4ee" {...ink} strokeWidth={2} />
        <rect x={17} y={-60} width={8} height={24} rx={3} fill="#f6f4ee" {...ink} strokeWidth={2} />
        <path d="M 22 -38 L 34 -58" stroke="#8a6d3a" strokeWidth={4} strokeLinecap="round" />
        <ellipse cx={36} cy={-62} rx={6} ry={8} fill="#8a6d3a" {...ink} strokeWidth={1.6} />
        <Face />
        <circle cx={-5} cy={-79} r={1.8} fill={INK} />
        <circle cx={5} cy={-79} r={1.8} fill={INK} />
        <path d="M 0 -74 Q -11 -74 -13 -68 Q -5 -70 0 -71 Q 5 -70 13 -68 Q 11 -74 0 -74 Z" fill="#14131a" {...ink} strokeWidth={1.2} />
        <path d="M -13 -88 V -96 Q -24 -100 -18 -110 Q -14 -118 -6 -114 Q 0 -122 6 -114 Q 14 -118 18 -110 Q 24 -100 13 -96 V -88 Z" fill="#fff" {...ink} />
    </>
);

const Tourist = () => (
    <>
        <Legs color="#e2b692" shoe="#f6f4ee" />
        <rect x={-15} y={-34} width={30} height={12} fill="#c2ae85" {...ink} strokeWidth={2} />
        <path d="M -17 -62 L -16 -30 H 16 L 17 -62 Q 0 -67 -17 -62 Z" fill="#2fa8a0" {...ink} />
        <circle cx={-8} cy={-52} r={3} fill="#ff6b6b" /><circle cx={7} cy={-46} r={3} fill="#ffd23f" /><circle cx={-4} cy={-38} r={3} fill="#ff6b6b" /><circle cx={9} cy={-56} r={2.4} fill="#fff" />
        <rect x={-24} y={-60} width={7} height={22} rx={3} fill={SKIN} {...ink} strokeWidth={2} />
        <rect x={17} y={-60} width={7} height={22} rx={3} fill={SKIN} {...ink} strokeWidth={2} />
        <path d="M -8 -63 L 0 -44 L 8 -63" fill="none" stroke={INK} strokeWidth={1.4} />
        <rect x={-9} y={-48} width={18} height={12} rx={2} fill="#23232c" {...ink} strokeWidth={1.8} />
        <circle cx={0} cy={-42} r={3.6} fill="#7fb5e0" stroke={INK} strokeWidth={1.2} />
        <Face />
        <circle cx={-5} cy={-79} r={1.8} fill={INK} />
        <circle cx={5} cy={-79} r={1.8} fill={INK} />
        <path d="M -6 -71 Q 0 -67 6 -71" {...line} strokeWidth={1.6} />
        <path d="M -24 -87 Q 0 -91 24 -87 Q 12 -80 0 -82 Q -12 -80 -24 -87 Z" fill="#f2d774" {...ink} strokeWidth={2} />
        <path d="M -13 -87 Q -12 -99 0 -99 Q 12 -99 13 -87 Z" fill="#f2d774" {...ink} strokeWidth={2} />
    </>
);

const Granny = () => (
    <>
        <Legs color="#d9d4c5" shoe="#6b4a2c" />
        <path d="M -15 -62 L -24 -14 H 24 L 15 -62 Q 0 -67 -15 -62 Z" fill="#9c6fb3" {...ink} />
        <path d="M -20 -60 L 0 -40 L 20 -60 L 14 -66 H -14 Z" fill="#d94f8a" {...ink} strokeWidth={2} />
        <path d="M -21 -26 H 21" stroke="#7a5691" strokeWidth={2} />
        <rect x={17} y={-56} width={7} height={22} rx={3} fill="#9c6fb3" {...ink} strokeWidth={2} />
        <path d="M 21 -34 V 0" stroke="#5a3a22" strokeWidth={3} strokeLinecap="round" />
        <path d="M 21 -34 Q 21 -40 27 -38" stroke="#5a3a22" strokeWidth={3} fill="none" strokeLinecap="round" />
        <Face />
        <circle cx={-6} cy={-78} r={4.4} fill="#fff" fillOpacity={0.6} stroke={INK} strokeWidth={1.4} />
        <circle cx={6} cy={-78} r={4.4} fill="#fff" fillOpacity={0.6} stroke={INK} strokeWidth={1.4} />
        <path d="M -1.6 -78 H 1.6" stroke={INK} strokeWidth={1.2} />
        <circle cx={-6} cy={-78} r={1.5} fill={INK} /><circle cx={6} cy={-78} r={1.5} fill={INK} />
        <path d="M -5 -70 Q 0 -67 5 -70" {...line} strokeWidth={1.5} />
        <path d="M -15 -80 Q -17 -96 0 -96 Q 17 -96 15 -80 Q 8 -88 0 -88 Q -8 -88 -15 -80 Z" fill="#cfcfd6" {...ink} strokeWidth={2} />
        <circle cx={0} cy={-100} r={7} fill="#cfcfd6" {...ink} strokeWidth={2} />
    </>
);

const FakeNose = () => (
    <>
        <Legs />
        <path d="M -16 -62 L -16 -26 H 16 L 16 -62 Q 0 -67 -16 -62 Z" fill="#2c3e6e" {...ink} />
        <path d="M -7 -63 L 0 -38 L 7 -63 Z" fill="#f6f4ee" stroke={INK} strokeWidth={1.4} strokeLinejoin="round" />
        <path d="M 0 -60 L -3 -50 L 0 -40 L 3 -50 Z" fill="#e5484d" stroke={INK} strokeWidth={1} strokeLinejoin="round" />
        <rect x={-24} y={-60} width={8} height={24} rx={3} fill="#2c3e6e" {...ink} strokeWidth={2} />
        <rect x={16} y={-60} width={8} height={24} rx={3} fill="#2c3e6e" {...ink} strokeWidth={2} />
        <Face />
        <circle cx={-6} cy={-79} r={5} fill="#fff" stroke={INK} strokeWidth={2} />
        <circle cx={6} cy={-79} r={5} fill="#fff" stroke={INK} strokeWidth={2} />
        <circle cx={-6} cy={-79} r={1.7} fill={INK} /><circle cx={6} cy={-79} r={1.7} fill={INK} />
        <path d="M -12 -86 Q -6 -92 -1 -86 M 1 -86 Q 6 -92 12 -86" fill="none" stroke={INK} strokeWidth={3.6} strokeLinecap="round" />
        <path d="M 0 -80 Q -8 -68 0 -68 Q 6 -68 3 -76 Z" fill="#f0a58a" {...ink} strokeWidth={1.8} />
        <path d="M -13 -67 Q -5 -71 0 -66 Q 5 -71 13 -67 Q 7 -62 0 -63 Q -7 -62 -13 -67 Z" fill="#14131a" {...ink} strokeWidth={1.2} />
        <path d="M -14 -84 Q -14 -97 0 -97 Q 14 -97 14 -84 L 9 -90 H -9 Z" fill="#14131a" {...ink} strokeWidth={2} />
    </>
);

const Bush = () => (
    <>
        <Legs color="#23232c" />
        <path d="M -30 -20 Q -40 -36 -28 -46 Q -34 -68 -14 -72 Q -8 -92 10 -84 Q 28 -86 28 -66 Q 42 -56 32 -40 Q 38 -22 22 -18 Q 0 -10 -18 -16 Q -26 -14 -30 -20 Z" fill="#2fa84f" {...ink} />
        <path d="M -16 -56 q 6 -6 12 0 M 8 -38 q 6 -6 12 0 M -12 -30 q 6 -6 12 0 M 12 -66 q 5 -5 10 0" fill="none" stroke="#1d7a38" strokeWidth={2.6} strokeLinecap="round" />
        <ellipse cx={-5} cy={-50} rx={4.6} ry={5.4} fill="#fff" stroke={INK} strokeWidth={1.6} />
        <ellipse cx={8} cy={-50} rx={4.6} ry={5.4} fill="#fff" stroke={INK} strokeWidth={1.6} />
        <g className="spy-peek"><circle cx={-5} cy={-50} r={2} fill={INK} /><circle cx={8} cy={-50} r={2} fill={INK} /></g>
    </>
);

const Box = () => (
    <>
        <Legs color="#23232c" />
        <path d="M -26 -16 V -68 H 26 V -16 Z" fill="#c69a5e" {...ink} />
        <path d="M -26 -68 L -18 -80 H 34 L 26 -68 Z" fill="#d8ad72" {...ink} />
        <path d="M 26 -68 L 34 -80 V -28 L 26 -16 Z" fill="#a67f48" {...ink} />
        <path d="M 0 -68 V -50 M -8 -68 H 8" stroke="#8f6c3c" strokeWidth={3} />
        <rect x={-13} y={-48} width={26} height={9} rx={2} fill="#14131a" />
        <g className="spy-peek"><circle cx={-6} cy={-43.5} r={2} fill="#fff" /><circle cx={6} cy={-43.5} r={2} fill="#fff" /></g>
        <text x={0} y={-24} textAnchor="middle" fontSize={8} fontWeight={800} fill="#5c4524" fontFamily="system-ui, sans-serif">THIS WAY UP</text>
    </>
);

const DISGUISES = [Trench, Chef, Tourist, Granny, FakeNose, Bush, Box];

function Smoke({ elRef }) {
    return (
        <g ref={elRef} className="spy-smoke">
            {[[0, -50, 26], [-22, -34, 20], [22, -34, 20], [-14, -72, 18], [16, -72, 18], [0, -16, 18]].map(([x, y, r]) => (
                <circle key={`${x}${y}`} cx={x} cy={y} r={r} fill="#e8e8f0" stroke="#9a9aa8" strokeWidth={2} />
            ))}
        </g>
    );
}

export default function SpyShow({ stageRef, screenRef, playerCount = 0 }) {
    const svgRef = useRef(null);
    const actorEls = useRef([]);
    const smokeEls = useRef([]);
    const beamRef = useRef(null);
    const engineRef = useRef(null);

    useEffect(() => {
        const svg = svgRef.current;
        if (!svg || !stageRef.current || !screenRef.current) return undefined;
        const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
        const frames = new Set();
        const timers = new Set();
        let dead = false;

        let L = null;
        const measure = () => {
            const root = svg.parentElement.getBoundingClientRect();
            const stage = stageRef.current.getBoundingClientRect();
            const screen = screenRef.current.getBoundingClientRect();
            const pill = document.querySelector('.cc-room-code')?.getBoundingClientRect();
            const usable = stage.width - (pill ? Math.min(pill.width * 0.75, stage.width * 0.2) : 0);
            const slot = usable / AGENTS;
            const s = Math.max(0.3, Math.min(stage.height / 128, slot / 62));
            const left = stage.left - root.left;
            L = {
                s,
                floorY: stage.bottom - root.top - 3,
                seatX: Array.from({ length: AGENTS }, (_, i) => left + slot * (i + 0.5)),
                hiddenX: screen.right - root.left - 60 * s,
            };
            svg.setAttribute('viewBox', `0 0 ${root.width} ${root.height}`);
        };

        const agents = actorEls.current.map((el, i) => ({ seat: i, x: 0, grow: reduceMotion ? 1 : 0, look: i, busy: false, away: false, el, smoke: smokeEls.current[i] }));
        const draw = (a) => {
            a.el.setAttribute('transform', `translate(${a.x} ${L.floorY}) scale(${L.s * a.grow})`);
            a.smoke.setAttribute('transform', `translate(${a.x} ${L.floorY}) scale(${L.s})`);
        };
        const wear = (a, look) => {
            a.look = look;
            a.el.querySelectorAll('.spy-look').forEach((g, i) => { g.style.display = i === look ? '' : 'none'; });
        };
        const snap = () => agents.forEach((a) => {
            if (!a.away) a.x = L.seatX[a.seat];
            draw(a);
        });

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

        // Nobody wears what anyone else on stage has on
        const freshLook = (a) => {
            const taken = agents.map((other) => other.look);
            const choices = DISGUISES.map((_, i) => i).filter((i) => !taken.includes(i));
            return choices[Math.floor(Math.random() * choices.length)];
        };

        // 💨 A puff of smoke, and it's somebody else
        const quickChange = async (a) => {
            a.smoke.classList.remove('is-on');
            a.smoke.getBoundingClientRect();   // restart the puff
            a.smoke.classList.add('is-on');
            await wait(210);
            wear(a, freshLook(a));
        };

        const tiptoe = async (a, toX, ms) => {
            const from = a.x;
            a.el.classList.add('crew-walking', 'spy-tiptoe');
            await tween(ms, linear, (t) => { a.x = from + (toX - from) * t; draw(a); });
            a.el.classList.remove('crew-walking', 'spy-tiptoe');
        };

        // Off behind the QR card, and back as somebody new
        const sneak = async (a) => {
            a.busy = true;
            a.away = true;
            await tiptoe(a, L.hiddenX, 1900);
            await wait(500);
            wear(a, freshLook(a));
            await tiptoe(a, L.seatX[a.seat], 1900);
            a.away = false;
            a.busy = false;
        };

        const changeLoop = async () => {
            while (!dead) {
                await wait(rand(...DISGUISE_GAP_MS));
                const free = agents.filter((a) => !a.busy);
                if (free.length) await quickChange(free[Math.floor(Math.random() * free.length)]);
            }
        };
        const sneakLoop = async () => {
            while (!dead) {
                await wait(rand(...SNEAK_GAP_MS));
                const free = agents.filter((a) => !a.busy);
                if (free.length) await sneak(free[Math.floor(Math.random() * free.length)]);
            }
        };

        const cheer = () => agents.forEach((a, i) => { if (!a.busy) wait(i * 120).then(() => { if (!dead && !a.busy) quickChange(a); }); });

        measure();
        agents.forEach((a, i) => wear(a, i));
        snap();
        svg.classList.add('is-ready');

        const intro = async () => {
            // One by one they appear in a puff of smoke
            for (const a of agents) {
                a.smoke.classList.add('is-on');
                await wait(190);
                await tween(260, easeOut, (t) => { a.grow = t; draw(a); });
                await wait(280);
            }
            changeLoop();
            sneakLoop();
        };
        if (!reduceMotion) intro();

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

    // Someone new joined: everybody changes
    const lastCount = useRef(playerCount);
    useEffect(() => {
        if (playerCount > lastCount.current) engineRef.current?.cheer();
        lastCount.current = playerCount;
    }, [playerCount]);

    return (
        <svg ref={svgRef} className="cc-crew spy-show" aria-hidden="true" preserveAspectRatio="none">
            <g className="crew-world">
                {Array.from({ length: AGENTS }, (_, i) => (
                    <g key={i}>
                        <g ref={(el) => { actorEls.current[i] = el; }} className="crew-actor spy-agent">
                            <g className="crew-fig">
                                {DISGUISES.map((Look, look) => <g key={look} className="spy-look" style={{ display: 'none' }}><Look /></g>)}
                            </g>
                        </g>
                        <Smoke elRef={(el) => { smokeEls.current[i] = el; }} />
                    </g>
                ))}
            </g>
        </svg>
    );
}
