import React, { useEffect, useRef } from 'react';

// 🛋️ The Couch Cast crew (Core deck lobby): a couch on little legs crawls in and sits down, then a
// robot, a dog and an alien wander in, hop onto it, and the robot casts to "the screen", which is
// the QR code card. Now and then one of them gets up and peeks out from behind the QR card, and
// every so often a cat sneaks up to the screen until the dog chases it off. Once in a long while
// a mountain rumbles up beside the couch and Sasquatch strolls down it to fist-bump the crew.
//
// The whole scene is one SVG laid over the lobby *behind* the QR card, so nobody can ever walk in
// front of the code. The couch sits in `stageRef` (the space under the players card), facing the QR
// card (`screenRef`); `qrRef` is the code's own box, which lights up when the cast lands.
//
// Drawing units: each character is ~100 units tall with its feet at (0, 0); the couch is 200 wide.
// The cat is drawn side-on, facing left (it's flipped to run the other way).

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
    const barkRef = useRef(null);
    const bumpRef = useRef(null);
    const mountainRef = useRef(null);
    const actorEls = { robot: useRef(null), dog: useRef(null), alien: useRef(null), cat: useRef(null), sasquatch: useRef(null) };
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
            // ⛰️ The free ground to the right of the couch (no mountain if there's hardly any)
            const couchRight = cx + 104 * cs;
            const free = stage.right - root.left - 6 - couchRight;
            const mountain = free >= 80 * cs
                ? { x: couchRight + free / 2, left: couchRight, sx: Math.min(free, 260 * cs) / 200, sy: Math.min(stage.height * 0.74, 150 * cs) / 160 }   // low enough that Sasquatch fits on the peak
                : null;
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
                mountain,
                // Sasquatch up close: a head taller than the crew, but never taller than the couch's spot
                sqSize: Math.min(cs * 0.95, (stage.height - 4) / 146) / s,
            };
            svg.setAttribute('viewBox', `0 0 ${root.width} ${root.height}`);
        };

        // --- The cast: a couch and three characters, each a position the frames below move around ---
        const couch = { x: 0, y: 0, el: couchRef.current };
        const actors = Object.fromEntries(SEATS.map((name, i) => [name, {
            name, seat: i, x: 0, y: 0, rot: 0, lift: 0, size: 1, flip: 1, spot: 'off', busy: true, el: actorEls[name].current,
        }]));
        // 🐈 Not one of the crew: it turns up now and then (see catVisit)
        const cat = { name: 'cat', x: 0, y: 0, rot: 0, lift: 0, size: 0.9, flip: 1, spot: 'off', el: actorEls.cat.current };
        // ⛰️ The big one: Sasquatch, on a mountain that grows out of the floor (see sasquatchVisit)
        const sasquatch = { name: 'sasquatch', x: 0, y: 0, rot: 0, lift: 0, size: 1, flip: 1, spot: 'off', el: actorEls.sasquatch.current };
        const mountain = { grow: 0, el: mountainRef.current };
        let eventRunning = false;   // a peek, the cat or Sasquatch: one thing at a time
        const drawCouch = () => couch.el.setAttribute('transform', `translate(${couch.x} ${couch.y}) scale(${L.cs})`);
        const draw = (a) => a.el.setAttribute('transform',
            `translate(${a.x} ${a.y - a.lift}) rotate(${a.rot}) scale(${a.flip * L.s * a.size} ${L.s * a.size})`);
        const look = (a, where) => a.el.setAttribute('data-look', where);   // 'left' (the screen), 'right', 'front'

        // Put everyone where they belong (first draw, and after the screen changes size)
        const snap = () => {
            if (couch.spot === 'home') { couch.x = L.cx; couch.y = L.floorY; drawCouch(); }
            Object.values(actors).forEach((a) => {
                if (a.spot === 'seat') { a.x = L.seatX[a.seat]; a.y = L.seatY; draw(a); }
                else if (a.spot === 'off') { a.x = L.offRight; a.y = L.floorY; draw(a); }
            });
            if (couch.spot === 'off') { couch.x = L.offRight; couch.y = L.floorY; drawCouch(); }
            if (cat.spot === 'off') { cat.x = L.offRight; cat.y = L.floorY; draw(cat); }
            if (sasquatch.spot === 'off') { sasquatch.x = L.offRight; sasquatch.y = L.floorY; sasquatch.size = L.sqSize; draw(sasquatch); }
            drawMountain();
        };
        const drawMountain = () => {
            const m = L.mountain;
            mountain.el.style.display = m && mountain.grow > 0 ? '' : 'none';
            if (m) mountain.el.setAttribute('transform', `translate(${m.x} ${L.floorY + 2}) scale(${m.sx} ${m.sy * mountain.grow})`);
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
        // `speed` in couch units a second: 75 is a stroll, the chase is a lot quicker
        const walkTo = async (a, x, speed = 75, gait = 'crew-walking') => {
            const from = a.x;
            const ms = (Math.abs(x - from) / (speed * L.cs)) * 1000;
            a.el.classList.add(gait);
            if (a === cat || a === sasquatch) a.flip = x < from ? 1 : -1;   // side-on: face where it's going
            else look(a, x < from ? 'left' : 'right');
            await tween(ms, linear, (t) => { a.x = from + (x - from) * t; draw(a); });
            a.el.classList.remove(gait);
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
            eventRunning = true;
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
            eventRunning = false;
        };
        const peekNow = () => {
            if (dead) return;
            const free = Object.values(actors).filter((a) => a.spot === 'seat' && !a.busy);
            if (free.length && !eventRunning) peek(free[Math.floor(Math.random() * free.length)]);
            const id = setTimeout(() => { timers.delete(id); peekNow(); }, rand(17000, 27000));
            timers.add(id);
        };

        // 🐕 "WOOF!" over the dog's head
        const bark = async (dog) => {
            const bubble = barkRef.current;
            bubble.setAttribute('transform', `translate(${dog.x + 16 * L.s} ${dog.y - dog.lift - 104 * L.s}) scale(${L.s})`);
            bubble.classList.add('is-on');
            await wait(900);
            bubble.classList.remove('is-on');
        };

        // 🐈 A cat slinks in and goes for the screen; the dog isn't having it
        const catVisit = async () => {
            const dog = actors.dog;
            eventRunning = true;
            dog.busy = true;

            // In from the right, past the couch (the dog watches it go by)
            cat.spot = 'floor';
            cat.x = L.offRight;
            cat.y = L.floorY;
            look(dog, 'right');
            const lookLeft = setTimeout(() => look(dog, 'left'), 1600);
            timers.add(lookLeft);
            await walkTo(cat, L.screenRight + 6 * L.s, 70);   // right up against the screen's edge

            // It sits by the screen and paws at it
            cat.el.classList.add('crew-cat-swat');
            await wait(1300);

            // That does it: the dog barks, jumps down, and the cat bolts with the dog right behind
            await bark(dog);
            cat.el.classList.remove('crew-cat-swat');
            dog.spot = 'floor';
            await Promise.all([
                hop(dog, dog.x - 6 * L.cs, L.floorY, 14, 320),
                hop(cat, cat.x, cat.y, 22, 300).then(() => { cat.flip = -1; draw(cat); }),
            ]);
            dog.rot = 8;   // leaning into the run
            await Promise.all([
                walkTo(cat, L.offRight, 300, 'crew-running'),
                wait(250).then(() => walkTo(dog, L.offRight + 40 * L.cs, 230, 'crew-running')),
            ]);
            cat.spot = 'off';
            cat.flip = 1;
            cat.x = L.offRight;
            draw(cat);

            // A moment off-screen, then back to the couch, very pleased with itself
            await wait(1400);
            dog.rot = 0;
            await walkTo(dog, L.seatX[dog.seat] - 8 * L.cs, 85);
            await sitDown(dog);
            dog.busy = false;
            eventRunning = false;
            cheer();
        };
        const catNow = (delay) => {
            const id = setTimeout(() => {
                timers.delete(id);
                if (dead) return;
                // Wait for any peek to finish first
                if (eventRunning || actors.dog.busy || actors.dog.spot !== 'seat') { catNow(4000); return; }
                catVisit();
                catNow(rand(55000, 80000));
            }, delay);
            timers.add(id);
        };

        // ⛰️ Walk a path of { x, y, size } points (Sasquatch on the mountain: smaller is further away)
        const walkPath = async (a, points, speed) => {
            a.el.classList.add('crew-walking');
            for (const p of points) {
                const from = { x: a.x, y: a.y, size: a.size };
                a.flip = p.x < from.x ? 1 : -1;
                // Far away, a step covers less of the screen
                const dist = Math.hypot(p.x - from.x, p.y - from.y) / ((from.size + p.size) / 2 / L.sqSize);
                await tween(Math.max(250, (dist / (speed * L.cs)) * 1000), linear, (t) => {
                    a.x = from.x + (p.x - from.x) * t;
                    a.y = from.y + (p.y - from.y) * t;
                    a.size = from.size + (p.size - from.size) * t;
                    draw(a);
                });
            }
            a.el.classList.remove('crew-walking');
        };
        // 💥 A little burst where two fists meet
        const pow = (x, y) => {
            const burst = bumpRef.current;
            burst.setAttribute('transform', `translate(${x} ${y}) scale(${L.s})`);
            burst.classList.remove('is-on');
            burst.getBoundingClientRect();   // restart its pop
            burst.classList.add('is-on');
        };
        const rumble = (on) => svg.classList.toggle('is-rumbling', on);

        const sasquatchVisit = async () => {
            eventRunning = true;
            Object.values(actors).forEach((a) => { a.busy = true; look(a, 'right'); });
            const m = L.mountain;
            const near = L.sqSize;
            const groundY = L.floorY + 3 * L.cs;   // a touch nearer than the couch

            // The path down: over the peak, zig-zagging down the slope, out onto the floor
            const slope = m ? [
                { x: m.x + 34 * m.sx, y: L.floorY - 108 * m.sy, size: near * 0.42 },
                { x: m.x - 28 * m.sx, y: L.floorY - 58 * m.sy, size: near * 0.62 },
                { x: m.x + 10 * m.sx, y: L.floorY - 24 * m.sy, size: near * 0.8 },
                { x: m.left + 8 * L.cs, y: groundY, size: near },
            ] : [];

            if (m) {
                // The ground shakes and a mountain pushes up beside the couch
                rumble(true);
                await tween(1700, (t) => 1 - (1 - t) ** 3 + Math.sin(t * Math.PI * 3) * 0.04 * (1 - t), (t) => { mountain.grow = t; drawMountain(); });
                rumble(false);
                await wait(500);
                // He steps over the peak, small and far away
                sasquatch.spot = 'mountain';
                sasquatch.x = m.x + 10 * m.sx;
                sasquatch.y = L.floorY - 160 * m.sy;
                sasquatch.size = near * 0.22;
                draw(sasquatch);
                sasquatch.el.classList.add('is-arriving');
                await wait(500);
                sasquatch.el.classList.remove('is-arriving');
                await walkPath(sasquatch, slope, 34);
            } else {
                // No room for a mountain: he just strides in
                sasquatch.spot = 'floor';
                sasquatch.x = L.offRight;
                sasquatch.y = groundY;
                sasquatch.size = near;
                await walkTo(sasquatch, L.seatX[2] + 130 * L.s, 60);
            }
            sasquatch.spot = 'floor';

            // Fist bumps down the couch: alien, dog, robot
            const fistReach = 127;   // how far right of a character he stands so the fists meet (character units)
            for (const name of ['alien', 'dog', 'robot']) {
                const a = actors[name];
                await walkTo(sasquatch, a.x + fistReach * L.s, 55);
                sasquatch.flip = 1;
                draw(sasquatch);
                look(a, 'right');
                a.el.classList.add('crew-bumping');
                sasquatch.el.classList.add('sq-bumping');
                await wait(300);
                pow(a.x + 46 * L.s, a.y - 74 * L.s);
                a.lift = 3 * L.cs;
                draw(a);
                await wait(450);
                a.lift = 0;
                draw(a);
                a.el.classList.remove('crew-bumping');
                sasquatch.el.classList.remove('sq-bumping');
                await wait(350);
            }

            // And off he goes, back over the mountain (or out the way he came)
            Object.values(actors).forEach((a) => look(a, 'right'));
            if (m) {
                await walkTo(sasquatch, m.left + 8 * L.cs, 55);
                await walkPath(sasquatch, [...slope].reverse().slice(1).concat({ x: m.x + 10 * m.sx, y: L.floorY - 160 * m.sy, size: near * 0.22 }), 34);
                sasquatch.el.classList.add('is-leaving');
                await wait(500);
                sasquatch.el.classList.remove('is-leaving');
            } else {
                await walkTo(sasquatch, L.offRight, 60);
            }
            sasquatch.spot = 'off';
            sasquatch.x = L.offRight;
            draw(sasquatch);

            if (m) {
                await wait(400);
                rumble(true);
                await tween(1200, easeInOut, (t) => { mountain.grow = 1 - t; drawMountain(); });
                rumble(false);
            }
            Object.values(actors).forEach((a) => { a.busy = false; look(a, 'left'); });
            eventRunning = false;
            cheer();
        };
        const sasquatchNow = (delay) => {
            const id = setTimeout(() => {
                timers.delete(id);
                if (dead) return;
                if (eventRunning || Object.values(actors).some((a) => a.busy || a.spot !== 'seat')) { sasquatchNow(4000); return; }
                sasquatchVisit();
                sasquatchNow(rand(150000, 210000));
            }, delay);
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
            catNow(rand(26000, 34000));
            sasquatchNow(rand(60000, 75000));
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

            <g className="crew-world">
                <Mountain mountainRef={mountainRef} />
                <Couch couchRef={couchRef} />
                <Robot elRef={actorEls.robot} />
                <Dog elRef={actorEls.dog} />
                <Alien elRef={actorEls.alien} />
                <Cat elRef={actorEls.cat} />
                <Sasquatch elRef={actorEls.sasquatch} />
            </g>

            <g ref={bumpRef} className="crew-pow">
                <path d="M 0 -13 L 3.5 -5 L 12 -7 L 6 0 L 12 7 L 3.5 5 L 0 13 L -3.5 5 L -12 7 L -6 0 L -12 -7 L -3.5 -5 Z" fill="#ffd23f" stroke="#16161d" strokeWidth={2} strokeLinejoin="round" />
            </g>

            <g ref={barkRef} className="crew-bark">
                <path d="M -4 -14 H 40 a 6 6 0 0 1 6 6 V 6 a 6 6 0 0 1 -6 6 H 8 L -2 20 L 0 12 H -4 a 6 6 0 0 1 -6 -6 V -8 a 6 6 0 0 1 6 -6 Z" fill="#fff" stroke="#16161d" strokeWidth={2.4} strokeLinejoin="round" />
                <text x={18} y={4} textAnchor="middle" fontSize={13} fontWeight={900} fill="#16161d" fontFamily="system-ui, sans-serif">WOOF!</text>
            </g>
        </svg>
    );
}

// --- The drawings (feet at 0,0; up is negative y) ---

function Couch({ couchRef }) {
    // A well-loved thrift-store couch: worn rust velour, a patch, and a lumpy cushion
    return (
        <g ref={couchRef}>
            <g className="couch-legs">
                {[-86, -58, 50, 78].map((x) => <rect key={x} className="couch-leg" x={x} y={-13} width={8} height={13} rx={2} fill="#3b2a20" stroke="#16161d" strokeWidth={2} />)}
            </g>
            <g className="couch-body" stroke="#16161d" strokeWidth={2.4} strokeLinejoin="round">
                <rect x={-96} y={-27} width={192} height={16} rx={4} fill="#7a3a22" />
                <rect x={-86} y={-86} width={172} height={50} rx={12} fill="#b5532f" />
                <path d="M -60 -80 Q -60 -50 -54 -42 M 0 -80 Q 0 -50 0 -42 M 60 -80 Q 60 -50 54 -42" fill="none" strokeWidth={1.8} />
                <rect x={30} y={-76} width={16} height={13} fill="#d9a441" strokeWidth={1.8} transform="rotate(-8 38 -69.5)" />
                <path d="M 31 -75 l 2 2 M 44 -64 l -2 -2" strokeWidth={1.2} />
                {[-76, -25, 26].map((x, i) => <path key={x} d={`M ${x} -40 q 0 -6 6 -6 h 38 q 6 0 6 6 ${i === 1 ? 'q 0 4 -3 8' : 'v 8'} q 0 8 -6 8 h -38 q -6 0 -6 -8 Z`} fill="#c9653a" />)}
                <rect x={-102} y={-60} width={26} height={44} rx={9} fill="#a2482a" />
                <rect x={76} y={-60} width={26} height={44} rx={9} fill="#a2482a" />
            </g>
        </g>
    );
}

export const INK = '#16161d';   // the outline on everything
export const ink = { stroke: INK, strokeWidth: 2.4, strokeLinejoin: 'round' };

function Robot({ elRef }) {
    // A scrappy vintage machine: dented mustard paint, rusty boots, one red scanner for an eye
    return (
        <g ref={elRef} className="crew-actor crew-robot" data-look="left">
            <g className="crew-fig">
                <g className="crew-leg crew-leg-l"><rect x={-15} y={-30} width={10} height={24} fill="#6d7a86" {...ink} /><rect x={-19} y={-8} width={17} height={8} rx={2} fill="#c4512c" {...ink} /></g>
                <g className="crew-leg crew-leg-r"><rect x={5} y={-30} width={10} height={24} fill="#6d7a86" {...ink} /><rect x={2} y={-8} width={17} height={8} rx={2} fill="#c4512c" {...ink} /></g>
                <path d="M -22 -64 L 22 -64 L 18 -28 L -18 -28 Z" fill="#e0b04a" {...ink} />
                <path d="M -10 -41 H 10 M -10 -36.5 H 10 M -10 -32 H 10" stroke={INK} strokeWidth={1.6} />
                <circle cx={-9} cy={-53} r={4.2} fill="#f4efe4" {...ink} strokeWidth={1.6} />
                <path d="M -9 -53 L -6.5 -55.5" stroke="#d64545" strokeWidth={1.4} strokeLinecap="round" />
                <circle cx={9} cy={-53} r={3} fill="#d64545" {...ink} strokeWidth={1.6} />
                <path d="M 14 -62 l 4 3" stroke="#b8862e" strokeWidth={1.6} strokeLinecap="round" />
                {/* The arm on the screen side holds the phone it casts with */}
                <g className="crew-arm-cast">
                    <rect x={-27} y={-59} width={7} height={24} fill="#6d7a86" {...ink} strokeWidth={2} />
                    <path d="M -27 -51 H -20 M -27 -44 H -20" stroke={INK} strokeWidth={1.4} />
                    <rect x={-29} y={-38} width={11} height={8} rx={1.5} fill="#22232b" {...ink} strokeWidth={1.6} />
                    <rect x={-27.5} y={-36.5} width={8} height={5} fill="#4dd0e1" />
                </g>
                <g className="crew-arm-bump">
                    <rect x={20} y={-59} width={7} height={22} fill="#6d7a86" {...ink} strokeWidth={2} />
                    <path d="M 20 -37 l -2 6 M 27 -37 l 2 6" stroke={INK} strokeWidth={2.4} strokeLinecap="round" />
                </g>
                <rect x={-4} y={-70} width={8} height={7} fill="#6d7a86" {...ink} strokeWidth={2} />
                <circle cx={-19} cy={-81} r={3} fill="#6d7a86" {...ink} strokeWidth={1.6} />
                <circle cx={19} cy={-81} r={3} fill="#6d7a86" {...ink} strokeWidth={1.6} />
                <rect x={-16} y={-92} width={32} height={23} rx={3} fill="#e0b04a" {...ink} />
                <path d="M 9 -92 q -2 4 2 6" stroke="#b8862e" strokeWidth={1.6} fill="none" />
                <rect x={-12} y={-87} width={24} height={8} rx={2} fill={INK} />
                <g className="crew-eyes"><g className="crew-pupils">
                    <rect x={-4} y={-85.5} width={8} height={4.5} rx={1.5} fill="#ff4d3a" />
                </g></g>
                <path d="M -8 -74 H 8" stroke={INK} strokeWidth={2.4} strokeDasharray="2 2" />
                <path d="M 6 -92 L 8 -99 L 4 -102" stroke={INK} strokeWidth={2} fill="none" strokeLinejoin="round" />
                <circle className="crew-robot-light" cx={4} cy={-103.5} r={2.6} fill="#ff4d3a" {...ink} strokeWidth={1.4} />
            </g>
        </g>
    );
}

function Dog({ elRef }) {
    // A scruffy mutt: wiry brows, an underbite and a spiked collar, and not impressed by much
    const fur = '#8a7a66';
    const dark = '#4e4338';
    const muzzle = '#c9b8a0';
    return (
        <g ref={elRef} className="crew-actor crew-dog" data-look="left">
            <g className="crew-fig">
                <g className="crew-dog-tail">
                    <path d="M 15 -36 q 12 -6 10 -20 l 3 -3 l -1 4" stroke={INK} strokeWidth={7.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M 15 -36 q 12 -6 10 -20 l 3 -3 l -1 4" stroke={fur} strokeWidth={3.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </g>
                <g className="crew-leg crew-leg-l"><rect x={-14} y={-30} width={10} height={27} rx={3} fill={fur} {...ink} /><ellipse cx={-9} cy={-2.5} rx={7} ry={3.2} fill={dark} {...ink} strokeWidth={1.8} /></g>
                <g className="crew-leg crew-leg-r"><rect x={4} y={-30} width={10} height={27} rx={3} fill={fur} {...ink} /><ellipse cx={9} cy={-2.5} rx={7} ry={3.2} fill={dark} {...ink} strokeWidth={1.8} /></g>
                <path d="M -19 -58 Q -24 -40 -18 -26 L 18 -26 Q 24 -40 19 -58 Q 0 -65 -19 -58 Z" fill={fur} {...ink} />
                <path d="M -8 -52 l 2 4 M -2 -55 l 1.5 5 M 5 -51 l 2 3.5 M -4 -45 l 1.5 3" fill="none" stroke={muzzle} strokeWidth={1.8} strokeLinecap="round" />
                <path d="M -21 -54 q -3 10 -1 20" stroke={INK} strokeWidth={2} fill="none" />
                <g className="crew-arm-bump">
                    <rect x={16} y={-57} width={8} height={22} rx={3.5} fill={fur} {...ink} strokeWidth={2} />
                    <ellipse cx={20} cy={-35} rx={5} ry={4} fill={dark} {...ink} strokeWidth={1.6} />
                </g>
                <rect x={-13} y={-62} width={26} height={5} fill={INK} />
                <path d="M -9 -62 l 2 -4 l 2 4 M -1 -62 l 2 -4 l 2 4 M 7 -62 l 2 -4 l 2 4" fill="#cfd3d8" stroke={INK} strokeWidth={1.2} strokeLinejoin="round" />
                <path d="M -14 -89 L -25 -95 L -21 -77 Z" fill={dark} {...ink} />
                <path d="M 14 -89 L 25 -95 L 21 -77 Z" fill={dark} {...ink} />
                <rect x={-16} y={-92} width={32} height={26} rx={9} fill={fur} {...ink} />
                <path d="M -7 -92 l 2 -5 l 2 4 l 2 -5 l 2 4 l 2 -4 l 1 5" fill={fur} stroke={INK} strokeWidth={1.8} strokeLinejoin="round" />
                <g className="crew-eyes">
                    <ellipse cx={-7} cy={-80} rx={4} ry={3.6} fill="#f4efe4" stroke={INK} strokeWidth={1.4} />
                    <ellipse cx={7} cy={-80} rx={4} ry={3.6} fill="#f4efe4" stroke={INK} strokeWidth={1.4} />
                    <g className="crew-pupils"><circle cx={-7} cy={-79.5} r={2} fill={INK} /><circle cx={7} cy={-79.5} r={2} fill={INK} /></g>
                    {/* Heavy lids: unimpressed */}
                    <path d="M -11.2 -80 A 4 3.6 0 0 1 -2.8 -80 Z" fill={fur} stroke={INK} strokeWidth={1.4} />
                    <path d="M 2.8 -80 A 4 3.6 0 0 1 11.2 -80 Z" fill={fur} stroke={INK} strokeWidth={1.4} />
                </g>
                <path d="M -13 -87 L -3 -84.5 M 13 -87 L 3 -84.5" stroke={dark} strokeWidth={3.4} strokeLinecap="round" />
                <rect x={-9} y={-76} width={18} height={11} rx={5} fill={muzzle} {...ink} strokeWidth={1.8} />
                <ellipse cx={0} cy={-74.5} rx={3.8} ry={2.6} fill={INK} />
                <path d="M -5 -67.5 Q 0 -65.5 5 -67.5" stroke={INK} strokeWidth={1.6} fill="none" strokeLinecap="round" />
                <path d="M 1.5 -67 l 1.5 -3.2 l 1.5 3.2" fill="#fff" stroke={INK} strokeWidth={1} strokeLinejoin="round" />
            </g>
        </g>
    );
}

function Alien({ elRef }) {
    // A lanky grey in a hoodie, glowing eyes, smirking at whatever's on
    const skin = '#9fb8a8';
    const hoodie = '#2b2d42';
    const neon = '#39ff88';
    return (
        <g ref={elRef} className="crew-actor crew-alien" data-look="left">
            <g className="crew-fig">
                <g className="crew-leg crew-leg-l"><rect x={-10} y={-30} width={6} height={26} fill={hoodie} {...ink} strokeWidth={2} /><rect x={-14} y={-5} width={12} height={5} rx={2} fill="#f4efe4" {...ink} strokeWidth={1.8} /></g>
                <g className="crew-leg crew-leg-r"><rect x={4} y={-30} width={6} height={26} fill={hoodie} {...ink} strokeWidth={2} /><rect x={2} y={-5} width={12} height={5} rx={2} fill="#f4efe4" {...ink} strokeWidth={1.8} /></g>
                <path d="M -15 -60 Q -18 -42 -14 -27 L 14 -27 Q 18 -42 15 -60 Q 0 -64 -15 -60 Z" fill={hoodie} {...ink} />
                <circle cx={0} cy={-44} r={4} fill="none" stroke={neon} strokeWidth={1.8} />
                <path d="M -8 -42.5 Q 0 -38 8 -45.5" stroke={neon} strokeWidth={1.6} fill="none" strokeLinecap="round" />
                <path d="M -4 -60 v 7 M 4 -60 v 7" stroke="#cfd3d8" strokeWidth={1.4} strokeLinecap="round" />
                <rect x={-21} y={-58} width={6} height={24} rx={2} fill={hoodie} {...ink} strokeWidth={2} />
                <path d="M -20 -34 l -1 6 M -18 -34 l 0 7 M -16 -34 l 1 6" stroke={skin} strokeWidth={1.6} strokeLinecap="round" />
                <g className="crew-arm-bump">
                    <rect x={15} y={-58} width={6} height={24} rx={2} fill={hoodie} {...ink} strokeWidth={2} />
                    <path d="M 16 -34 l -1 6 M 18 -34 l 0 7 M 20 -34 l 1 6" stroke={skin} strokeWidth={1.6} strokeLinecap="round" />
                </g>
                <rect x={-2.5} y={-69} width={5} height={10} fill={skin} {...ink} strokeWidth={1.8} />
                <g className="crew-alien-antenna">
                    <path d="M -6 -97 L -10 -106 M 6 -97 L 10 -106" stroke={INK} strokeWidth={2} strokeLinecap="round" />
                    <circle cx={-10} cy={-107} r={2.4} fill={neon} {...ink} strokeWidth={1.2} />
                    <circle cx={10} cy={-107} r={2.4} fill={neon} {...ink} strokeWidth={1.2} />
                </g>
                <path d="M 0 -100 C 21 -100 22 -82 12 -72 Q 6 -66 0 -66 Q -6 -66 -12 -72 C -22 -82 -21 -100 0 -100 Z" fill={skin} {...ink} />
                <g className="crew-eyes">
                    <path d="M -16 -85 Q -10 -91 -3 -82 Q -10 -78 -16 -85 Z" fill={INK} />
                    <path d="M 16 -85 Q 10 -91 3 -82 Q 10 -78 16 -85 Z" fill={INK} />
                    <g className="crew-pupils"><circle cx={-8.5} cy={-83.5} r={1.4} fill={neon} /><circle cx={8.5} cy={-83.5} r={1.4} fill={neon} /></g>
                    {/* Half-closed: smug */}
                    <path d="M -17 -86.5 Q -10 -92 -2 -82 Q -9 -86.5 -17 -86.5 Z" fill={skin} stroke={INK} strokeWidth={1.4} strokeLinejoin="round" />
                    <path d="M 17 -86.5 Q 10 -92 2 -82 Q 9 -86.5 17 -86.5 Z" fill={skin} stroke={INK} strokeWidth={1.4} strokeLinejoin="round" />
                </g>
                <path d="M -4 -72 Q 1 -70 5.5 -74" stroke={INK} strokeWidth={1.6} fill="none" strokeLinecap="round" />
            </g>
        </g>
    );
}

export function Cat({ elRef }) {
    // A sleek black cat, side-on, facing left (towards the screen)
    const coat = '#26262f';
    return (
        <g ref={elRef} className="crew-actor crew-cat">
            <g className="crew-fig">
                <g className="crew-cat-tail">
                    <path d="M 21 -22 Q 34 -26 30 -44" stroke={INK} strokeWidth={6.5} fill="none" strokeLinecap="round" />
                    <path d="M 21 -22 Q 34 -26 30 -44" stroke={coat} strokeWidth={3} fill="none" strokeLinecap="round" />
                </g>
                <g className="crew-leg crew-leg-r"><rect x={-7} y={-15} width={4.5} height={15} rx={2} fill={coat} {...ink} strokeWidth={1.6} /><rect x={15} y={-15} width={4.5} height={15} rx={2} fill={coat} {...ink} strokeWidth={1.6} /></g>
                <ellipse cx={4} cy={-20} rx={18} ry={9.5} fill={coat} {...ink} />
                <g className="crew-leg crew-leg-l">
                    <g className="crew-cat-paw"><rect x={-13} y={-15} width={4.5} height={15} rx={2} fill={coat} {...ink} strokeWidth={1.6} /></g>
                    <rect x={9} y={-15} width={4.5} height={15} rx={2} fill={coat} {...ink} strokeWidth={1.6} />
                </g>
                <path d="M -23 -33 L -22 -44 L -15 -36 Z M -14 -36 L -9 -45 L -7 -34 Z" fill={coat} {...ink} strokeWidth={1.8} />
                <circle cx={-16} cy={-28} r={9} fill={coat} {...ink} />
                <ellipse cx={-19.5} cy={-29.5} rx={2.6} ry={2.2} fill="#ffd23f" />
                <rect x={-20.1} y={-31.4} width={1.2} height={3.8} rx={0.6} fill={INK} />
                <path d="M -24.5 -25 l -6 -1 M -24.5 -24 l -6 1.5" stroke="#9a9aa6" strokeWidth={0.9} strokeLinecap="round" />
            </g>
        </g>
    );
}

function Mountain({ mountainRef }) {
    // Slate rock, a snowy peak and a few pines; grows up out of the floor (base 200 wide, 160 tall)
    return (
        <g ref={mountainRef} style={{ display: 'none' }}>
            <g stroke={INK} strokeWidth={2.4} strokeLinejoin="round" vectorEffect="non-scaling-stroke">
                <path d="M -100 0 L -42 -108 L -24 -88 L 10 -160 L 46 -98 L 60 -114 L 100 0 Z" fill="#5d6b8a" vectorEffect="non-scaling-stroke" />
                <path d="M 10 -160 L 46 -98 L 60 -114 L 100 0 L 30 0 L 22 -60 Z" fill="#4a5672" vectorEffect="non-scaling-stroke" />
                <path d="M -8 -124 L 10 -160 L 30 -126 L 21 -131 L 14 -122 L 7 -133 L 0 -121 Z" fill="#f4efe4" vectorEffect="non-scaling-stroke" />
                <path d="M -52 -89 L -42 -108 L -32 -95 L -37 -97 L -42 -91 Z" fill="#f4efe4" vectorEffect="non-scaling-stroke" />
                {[[-74, 0], [-56, 0], [64, 0], [80, 0], [-20, 0]].map(([x]) => (
                    <path key={x} d={`M ${x} 0 L ${x - 7} 0 L ${x} -22 L ${x + 7} 0 Z`} fill="#2f5d4a" vectorEffect="non-scaling-stroke" />
                ))}
            </g>
        </g>
    );
}

function Sasquatch({ elRef }) {
    // Big, shaggy and friendly enough; side-on-ish, facing left (flipped to walk the other way)
    const fur = '#6b4a32';
    const dark = '#4a3222';
    const skin = '#5a4e48';
    return (
        <g ref={elRef} className="crew-actor crew-sasquatch">
            <g className="crew-fig">
                <rect x={28} y={-98} width={13} height={52} rx={6} fill={fur} {...ink} />
                <circle cx={34.5} cy={-46} r={7} fill={skin} {...ink} strokeWidth={1.8} />
                <g className="crew-leg crew-leg-l"><rect x={-22} y={-44} width={17} height={40} rx={6} fill={fur} {...ink} /><path d="M -32 0 Q -32 -9 -20 -9 H -6 Q -3 -9 -3 -4 V 0 Z" fill={dark} {...ink} /></g>
                <g className="crew-leg crew-leg-r"><rect x={5} y={-44} width={17} height={40} rx={6} fill={fur} {...ink} /><path d="M -5 0 Q -5 -9 7 -9 H 21 Q 24 -9 24 -4 V 0 Z" fill={dark} {...ink} /></g>
                <path d="M -32 -100 Q -40 -70 -30 -40 L -24 -36 L -18 -41 L -10 -35 L -2 -41 L 6 -35 L 14 -41 L 22 -36 L 30 -40 Q 40 -70 32 -100 Q 0 -112 -32 -100 Z" fill={fur} {...ink} />
                <path d="M -16 -92 Q -20 -70 -12 -58 Q 0 -54 10 -60 Q 16 -72 12 -92 Q 0 -96 -16 -92 Z" fill="#8a6446" />
                <path d="M -26 -80 l -4 6 M 24 -70 l 4 6 M -20 -52 l -3 5 M 18 -86 l 4 5" stroke={dark} strokeWidth={1.6} strokeLinecap="round" />
                <path d="M -24 -110 Q -27 -140 0 -143 Q 25 -140 24 -110 Q 0 -100 -24 -110 Z" fill={fur} {...ink} />
                <path d="M -6 -143 l 2 -6 l 3 5 l 3 -6 l 2 6" fill={fur} stroke={INK} strokeWidth={1.8} strokeLinejoin="round" />
                <ellipse cx={-7} cy={-119} rx={13} ry={11} fill={skin} {...ink} strokeWidth={1.8} />
                <path d="M -20 -126 Q -8 -132 4 -126" stroke={dark} strokeWidth={4} fill="none" strokeLinecap="round" />
                <g className="crew-eyes"><g className="crew-pupils">
                    <circle cx={-13} cy={-122} r={1.9} fill="#f4efe4" /><circle cx={-3} cy={-122} r={1.9} fill="#f4efe4" />
                </g></g>
                <path d="M -9 -118 q -4 4 0 5" stroke={INK} strokeWidth={1.6} fill="none" strokeLinecap="round" />
                <path d="M -15 -112 Q -8 -108 0 -113" stroke={INK} strokeWidth={1.8} fill="none" strokeLinecap="round" />
                {/* The fist-bump arm (the near one) */}
                <g className="sq-arm-bump">
                    <rect x={-41} y={-98} width={13} height={42} rx={6} fill={fur} {...ink} />
                    <circle cx={-34.5} cy={-55} r={8} fill={skin} {...ink} strokeWidth={1.8} />
                    <path d="M -40 -57 h 4 M -40 -53 h 4" stroke={INK} strokeWidth={1.2} strokeLinecap="round" />
                </g>
            </g>
        </g>
    );
}
