import React, { useEffect, useRef } from 'react';
import { makeDirector } from '../TriviaCast/QuizScenes.jsx';
import {
    Clown, Ringmaster, Lion, ClownCar, Cannon, Trapeze, JugglingBalls, Smoke, Pow, Bubble,
    wearGear, sayIn, HANDS_UP_Y, FLOWER, CANNON_MUZZLE, CANNON_AIM,
} from './CircusCast.jsx';

// 🎪 Temple Mix Up's circus: two clowns, Oopsy and Daisy, who are always mid-act (three rings, three games).
//   CircusShow:      the lobby, under the players card. They take turns at: arriving in a car that's far too small,
//                    juggling (badly), the flower that squirts, a cream pie, and running away from the lion.
//   CircusRulesShow: the rules screen. They swing in on two trapezes, flip down and walk across the bottom.
//   CircusFinale:    the end credits. The ringmaster's big finish: one of them is fired out of a cannon.

const easeOut = (t) => 1 - (1 - t) ** 3;
const easeIn = (t) => t * t;
const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
const linear = (t) => t;

const OOPSY = { suit: '#e5484d', trim: '#ffd23f', pattern: 'dots', shoes: '#ffd23f', hair: '#ff8c1a', hat: 'bowler', brows: 'arches' };
const DAISY = { suit: '#3b7bff', trim: '#ffffff', pattern: 'stripes', shoes: '#e5484d', hair: '#2ea866', hat: 'cone', brows: 'diamonds', flower: true };

const reduceMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// The shared moves. `unit` is how many screen pixels a drawing unit is here; `maxX`, the right edge of the picture.
const makeMoves = (d, getUnit, getMaxX = () => Infinity) => {
    const place = (a) => {
        const u = getUnit() * (a.size || 1);
        a.el.setAttribute('transform', `translate(${a.x} ${a.y - (a.lift || 0)}) rotate(${a.rot || 0}) scale(${(a.flip || 1) * u} ${u})`);
    };
    const walk = async (a, x, speed = 75, gait = 'crew-walking') => {
        const from = a.x;
        a.el.classList.add(gait);
        a.el.setAttribute('data-look', x < from ? 'left' : 'right');
        await d.tween((Math.abs(x - from) / (speed * getUnit())) * 1000, linear, (t) => { a.x = from + (x - from) * t; place(a); });
        a.el.classList.remove(gait);
        a.el.setAttribute('data-look', 'front');
    };
    const hop = (a, x, y, height, ms) => {
        const fromX = a.x;
        const fromY = a.y;
        return d.tween(ms, easeInOut, (t) => {
            a.x = fromX + (x - fromX) * t;
            a.y = fromY + (y - fromY) * t;
            a.lift = Math.sin(Math.PI * t) * height * getUnit();
            place(a);
        });
    };
    const say = (el, text, x, y, ms) => sayIn(d, el, text, x, y, ms, Math.max(0.55, getUnit()), getMaxX());
    // A whole somersault, turning about the middle of the body rather than the feet
    const flipTo = (a, x, y, height, ms, turns = 1) => {
        const fromX = a.x;
        const fromY = a.y;
        const mid = 50 * getUnit() * (a.size || 1);
        return d.tween(ms, linear, (t) => {
            const spin = (turns * 360 * easeInOut(t)) * (x >= fromX ? 1 : -1);
            const r = spin * (Math.PI / 180);
            const cx = fromX + (x - fromX) * t;
            const cy = fromY + (y - fromY) * t - mid - Math.sin(Math.PI * t) * height * getUnit();
            a.rot = spin;
            a.x = cx - mid * Math.sin(r);
            a.y = cy + mid * Math.cos(r);
            a.lift = 0;
            place(a);
        }).then(() => { a.rot = 0; a.x = x; a.y = y; place(a); });
    };
    return { place, walk, hop, say, flipTo };
};

const show = (...els) => els.forEach((el) => { el.style.display = ''; });
const hide = (...els) => els.forEach((el) => { el.style.display = 'none'; });

// A cartoon burst at (x, y)
const burst = (el, x, y, scale) => {
    el.setAttribute('transform', `translate(${x} ${y}) scale(${scale})`);
    el.classList.remove('is-on');
    el.getBoundingClientRect();
    el.classList.add('is-on');
};

export default function CircusShow({ stageRef, screenRef, playerCount = 0 }) {
    const svgRef = useRef(null);
    const aRef = useRef(null);
    const bRef = useRef(null);
    const carRef = useRef(null);
    const lionRef = useRef(null);
    const ballsRef = useRef(null);
    const squirtRef = useRef(null);
    const powRef = useRef(null);
    const sayRef = useRef(null);
    const engineRef = useRef(null);

    useEffect(() => {
        const svg = svgRef.current;
        if (!svg || !stageRef.current || !screenRef.current) return undefined;
        let L = null;
        const measure = () => {
            const root = svg.parentElement.getBoundingClientRect();
            const stage = stageRef.current.getBoundingClientRect();
            const screen = screenRef.current.getBoundingClientRect();
            const pill = document.querySelector('.cc-room-code')?.getBoundingClientRect();
            const left = stage.left - root.left;
            const usable = stage.width - (pill ? Math.min(pill.width * 0.75, stage.width * 0.2) : 0);
            L = {
                u: Math.max(0.35, Math.min(stage.height / 122, usable / 290)),
                floorY: stage.bottom - root.top - 3,
                stageTop: stage.top - root.top,
                left,
                width: usable,
                mid: left + usable * 0.5,
                spotA: left + usable * 0.2,
                spotB: left + usable * 0.8,
                behindScreen: screen.right - root.left - 80,   // out of sight, behind the QR card
                rootWidth: root.width,
                offRight: root.width + 130,
            };
            svg.setAttribute('viewBox', `0 0 ${root.width} ${root.height}`);
        };
        measure();

        const d = makeDirector();
        const { place, walk, hop, say, flipTo } = makeMoves(d, () => L.u, () => L.rootWidth - 8);
        const A = { x: L.offRight, y: L.floorY, size: 0.94, el: aRef.current };
        const B = { x: L.offRight, y: L.floorY, size: 1.0, el: bRef.current };
        const car = { x: L.offRight + 100, y: L.floorY, size: 1.15, el: carRef.current };
        const lion = { x: L.offRight + 120, y: L.floorY, size: 1.3, el: lionRef.current };
        const balls = [...ballsRef.current.children];
        const headY = (a) => a.y - 104 * L.u * a.size;
        const bubbleAt = (a, text, ms = 1300) => say(sayRef.current, text, a.x + 6 * L.u, Math.max(L.stageTop + 26 * L.u, headY(a)), ms);
        const pow = (x, y) => burst(powRef.current, x, y, L.u * 1.3);
        const putBall = (ball, x, y) => ball.setAttribute('transform', `translate(${x} ${y}) scale(${L.u})`);
        const goHome = () => Promise.all([walk(A, L.spotA), walk(B, L.spotB)]);
        const bow = async (...who) => {
            who.forEach((a) => a.el.classList.add('quiz-bowing'));
            await d.wait(1600);
            who.forEach((a) => a.el.classList.remove('quiz-bowing'));
        };

        // 🚗 The little car pulls up, and two whole clowns climb out of it
        const driveIn = async () => {
            show(car.el);
            car.el.classList.add('has-clowns', 'is-bouncing');
            car.x = L.offRight + 60;
            place(car);
            const from = car.x;
            await d.tween(1500, easeOut, (t) => { car.x = from + (L.mid - from) * t; place(car); });
            car.el.classList.remove('is-bouncing');
            await d.wait(300);
            car.el.classList.remove('has-clowns');
            // Out they come, over the roof
            A.x = car.x;
            A.y = L.floorY;
            show(A.el);
            await hop(A, L.spotA, L.floorY, 78, 750);
            B.x = car.x;
            B.y = L.floorY;
            show(B.el);
            await hop(B, L.spotB, L.floorY, 78, 750);
            wearGear(A.el, ['hands']);
            wearGear(B.el, ['hands']);
            await bubbleAt(B, 'TA-DA!', 1000);
            wearGear(A.el, []);
            wearGear(B.el, []);
            // And off it goes, much lighter
            const parked = car.x;
            car.el.classList.add('is-bouncing');
            await d.tween(1100, easeIn, (t) => { car.x = parked + (-160 - parked) * t; place(car); });
            car.el.classList.remove('is-bouncing');
            hide(car.el);
        };

        // 🚗 ...and later they squeeze back in, go once round the world, and climb out again
        const carRide = async () => {
            show(car.el);
            car.x = L.offRight + 60;
            place(car);
            const from = car.x;
            await d.tween(1300, easeOut, (t) => { car.x = from + (L.mid - from) * t; place(car); });
            await d.wait(300);
            await bubbleAt(A, 'ALL ABOARD!', 1000);
            await Promise.all([walk(A, car.x - 34 * L.u, 90), walk(B, car.x + 34 * L.u, 90)]);
            await hop(A, car.x, L.floorY, 50, 450);
            hide(A.el);
            car.el.classList.add('is-bouncing');
            await d.wait(350);
            await hop(B, car.x, L.floorY, 50, 450);
            hide(B.el);
            car.el.classList.add('has-clowns');
            await d.wait(500);
            await say(sayRef.current, 'HONK HONK!', car.x - 10 * L.u, car.y - 70 * L.u, 900);
            const parked = car.x;
            await d.tween(1100, easeIn, (t) => { car.x = parked + (-160 - parked) * t; place(car); });
            await d.wait(900);
            car.el.classList.remove('is-bouncing');
            await driveIn();
        };

        // 🤹 Oopsy juggles, then throws them all to Daisy, who catches every one with their head
        const juggle = async () => {
            const hands = () => ({ left: A.x - 13 * L.u, right: A.x + 13 * L.u, y: A.y - 36 * L.u * A.size });
            balls.forEach((ball) => { putBall(ball, hands().left, hands().y); show(ball); });
            await d.tween(3000, linear, (t) => {
                const seconds = t * 3;
                const h = hands();
                balls.forEach((ball, i) => {
                    const phase = (seconds * 1.4 + i / 3) % 1;
                    // Up from the left hand and over to the right, then back across low
                    const p = phase < 0.62 ? phase / 0.62 : (phase - 0.62) / 0.38;
                    const x = phase < 0.62 ? h.left + (h.right - h.left) * p : h.right + (h.left - h.right) * p;
                    const height = phase < 0.62 ? 58 : 6;
                    putBall(ball, x, h.y - 4 * height * L.u * p * (1 - p));
                });
            });
            await bubbleAt(A, 'CATCH!', 700);
            // One at a time, onto Daisy's head
            const head = { x: B.x, y: B.y - 98 * L.u * B.size };
            const throwOne = async (ball, i) => {
                await d.wait(i * 330);
                const fromX = A.x + 13 * L.u;
                const fromY = A.y - 40 * L.u;
                await d.tween(650, linear, (t) => {
                    putBall(ball, fromX + (head.x - fromX) * t, fromY + (head.y - fromY) * t - Math.sin(Math.PI * t) * 46 * L.u);
                });
                pow(head.x, head.y);
                // ...and down to the floor, with a bounce
                const landX = head.x + (i - 1) * 22 * L.u;
                await d.tween(520, linear, (t) => {
                    putBall(ball, head.x + (landX - head.x) * t, head.y + (L.floorY - 5 * L.u - head.y) * t * t - Math.sin(Math.PI * t) * 10 * L.u);
                });
            };
            await Promise.all(balls.map((ball, i) => throwOne(ball, i)));
            B.el.classList.add('circus-dizzy');
            await d.wait(500);
            await bubbleAt(B, 'BONK BONK BONK', 1100);
            B.el.classList.remove('circus-dizzy');
            balls.forEach((ball) => hide(ball));
            await bow(A);
        };

        // 🌼 "Smell my flower!" Never smell the flower.
        const theFlower = async () => {
            await bubbleAt(B, 'SMELL MY FLOWER!', 1200);
            await walk(A, B.x - 54 * L.u, 80);
            A.el.setAttribute('data-look', 'right');
            B.el.setAttribute('data-look', 'left');
            await d.wait(300);
            const squirt = squirtRef.current;
            const from = { x: B.x + FLOWER.x * L.u * B.size, y: B.y + FLOWER.y * L.u * B.size };
            const to = { x: A.x + 4 * L.u, y: A.y - 74 * L.u * A.size };
            squirt.setAttribute('d', `M ${from.x} ${from.y} Q ${(from.x + to.x) / 2} ${Math.min(from.y, to.y) - 26 * L.u} ${to.x} ${to.y}`);
            squirt.style.strokeWidth = `${2.6 * L.u}px`;
            squirt.style.strokeDasharray = `${2.4 * L.u} ${5 * L.u}`;
            show(squirt);
            A.el.classList.add('quiz-scared');
            await d.tween(1100, linear, (t) => { squirt.style.strokeDashoffset = `${-t * 70 * L.u}px`; });
            hide(squirt);
            A.el.classList.remove('quiz-scared');
            await bubbleAt(A, 'HEY!', 800);
            // Payback
            wearGear(A.el, ['horn']);
            await d.wait(250);
            await bubbleAt(A, 'HONK!', 600);
            await hop(B, B.x + 10 * L.u, B.y, 34, 380);
            await bubbleAt(B, 'EEK!', 800);
            wearGear(A.el, []);
            await walk(A, L.spotA, 80);
            await hop(B, L.spotB, B.y, 6, 300);
            B.el.setAttribute('data-look', 'front');
        };

        // 🥧 A sneak attack with a cream pie, and those very long shoes
        const thePie = async () => {
            wearGear(B.el, ['pie']);
            await d.wait(400);
            await walk(B, L.mid + 8 * L.u, 50);
            // Trips over their own feet, face first into the pie
            await d.tween(320, easeIn, (t) => { B.rot = -82 * t; place(B); });
            wearGear(B.el, ['piefaced']);
            pow(B.x - 70 * L.u * B.size, L.floorY - 8 * L.u);
            await bubbleAt(A, 'HA HA HA!', 1100);
            await d.tween(500, easeInOut, (t) => { B.rot = -82 * (1 - t); place(B); });
            B.rot = 0;
            await d.wait(300);
            await bubbleAt(B, '...LEMON.', 1100);
            await walk(B, L.spotB, 70);
            await d.wait(500);
            wearGear(B.el, []);
        };

        // 🦁 The lion's out! Everybody run (it's only curious)
        const theLion = async () => {
            show(lion.el);
            lion.x = L.offRight + 40;
            lion.flip = 1;
            place(lion);
            await walk(lion, L.spotB + 92 * L.u, 70);
            lion.el.setAttribute('data-look', 'left');
            wearGear(lion.el, ['roar']);
            lion.el.classList.add('is-roaring');
            wearGear(A.el, ['hands']);
            wearGear(B.el, ['hands']);
            A.el.classList.add('quiz-scared');
            B.el.classList.add('quiz-scared');
            await say(sayRef.current, 'ROAR!', lion.x - 40 * L.u * lion.size, lion.y - 80 * L.u * lion.size, 1000);
            wearGear(lion.el, []);
            lion.el.classList.remove('is-roaring');
            A.el.classList.remove('quiz-scared');
            B.el.classList.remove('quiz-scared');
            // Behind the TV card they go
            await Promise.all([walk(A, L.behindScreen, 260, 'crew-running'), d.wait(150).then(() => walk(B, L.behindScreen, 260, 'crew-running'))]);
            wearGear(A.el, []);
            wearGear(B.el, []);
            await walk(lion, L.mid, 60);
            await say(sayRef.current, 'SNIFF SNIFF', lion.x - 40 * L.u * lion.size, lion.y - 80 * L.u * lion.size, 1100);
            await d.wait(300);
            lion.flip = -1;
            await walk(lion, L.offRight + 40, 75);
            hide(lion.el);
            await d.wait(600);
            // Tiptoeing back
            await Promise.all([walk(A, L.spotA, 45), walk(B, L.spotB, 60)]);
            await bubbleAt(B, 'IS IT GONE?', 1000);
            await bubbleAt(A, 'PHEW!', 800);
        };

        const run = async () => {
            wearGear(A.el, []);
            wearGear(B.el, []);
            hide(A.el, B.el);
            place(car);
            await driveIn();
            const scenes = [juggle, theFlower, thePie, theLion, carRide];
            for (let i = 0; !d.isDead(); i = (i + 1) % scenes.length) {
                await d.wait(900);
                await scenes[i]();
                await d.wait(1400);
            }
        };

        svg.classList.add('is-ready');
        if (reduceMotion()) {
            A.x = L.spotA;
            B.x = L.spotB;
            place(A);
            place(B);
            wearGear(A.el, []);
            wearGear(B.el, []);
        } else {
            run();
        }

        const observer = new ResizeObserver(() => {
            measure();
            [A, B, car, lion].forEach((a) => { a.y = L.floorY; place(a); });
        });
        observer.observe(svg.parentElement);
        observer.observe(stageRef.current);

        engineRef.current = { greet: () => { if (A.el.style.display !== 'none') bubbleAt(A, 'A VOLUNTEER!', 1000); } };
        return () => {
            engineRef.current = null;
            observer.disconnect();
            d.stop();
        };
    }, []);

    // Someone new joined: the clowns have spotted a volunteer
    const lastCount = useRef(playerCount);
    useEffect(() => {
        if (playerCount > lastCount.current) engineRef.current?.greet();
        lastCount.current = playerCount;
    }, [playerCount]);

    return (
        <svg ref={svgRef} className="cc-crew circus-show" aria-hidden="true" preserveAspectRatio="none">
            <g className="crew-world">
                <Clown elRef={aRef} {...OOPSY} />
                <Clown elRef={bRef} {...DAISY} />
                <ClownCar elRef={carRef} />
                <Lion elRef={lionRef} />
                <path ref={squirtRef} className="circus-squirt" fill="none" stroke="#6cc8ff" strokeLinecap="round" style={{ display: 'none' }} />
                <JugglingBalls elRef={ballsRef} />
            </g>
            <Pow elRef={powRef} />
            <Bubble elRef={sayRef} />
        </svg>
    );
}

/** 🎪 The rules screen: two trapezes swing in from the top, the clowns let go, flip down and stroll along the bottom */
export function CircusRulesShow() {
    const svgRef = useRef(null);
    const aRef = useRef(null);
    const bRef = useRef(null);
    const trapARef = useRef(null);
    const trapBRef = useRef(null);

    useEffect(() => {
        const svg = svgRef.current;
        let W = 0;
        let H = 0;
        let u = 1;
        const measure = () => {
            const box = svg.getBoundingClientRect();
            W = box.width;
            H = box.height;
            u = Math.max(0.5, H * 0.14 / 100);
            svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
        };
        measure();
        const d = makeDirector();
        const { place, walk, flipTo } = makeMoves(d, () => u);
        const A = { x: -400, y: -400, size: 0.94, el: aRef.current };
        const B = { x: -400, y: -400, size: 1.0, el: bRef.current };
        const floor = () => H - 6;

        // Draw a trapeze hanging from (px, py) at `deg` degrees from straight down, with the clown (if any) on it
        const drawSwing = (trap, px, py, length, deg, clown, size) => {
            const r = deg * (Math.PI / 180);
            const sin = Math.sin(r);
            const cos = Math.cos(r);
            const half = 30 * u * size;
            const bx = px + length * sin;
            const by = py + length * cos;
            const end1 = [bx - half * cos, by + half * sin];
            const end2 = [bx + half * cos, by - half * sin];
            trap.querySelector('.circus-ropes').setAttribute('d', `M ${px - half} ${py} L ${end1[0]} ${end1[1]} M ${px + half} ${py} L ${end2[0]} ${end2[1]}`);
            trap.querySelector('.circus-ropes').style.strokeWidth = `${2 * u}px`;
            ['.circus-bar', '.circus-bar-paint'].forEach((sel, i) => {
                const bar = trap.querySelector(sel);
                bar.setAttribute('d', `M ${end1[0]} ${end1[1]} L ${end2[0]} ${end2[1]}`);
                bar.style.strokeWidth = `${(i ? 3 : 6) * u}px`;
            });
            if (clown) {
                // Hanging by the hands: the feet carry on down the line of the ropes
                const reach = -HANDS_UP_Y * u * clown.size;
                clown.x = bx + reach * sin;
                clown.y = by + reach * cos;
                clown.rot = -deg;
                clown.lift = 0;
                place(clown);
            }
        };

        // In on the trapeze from one side, a few swings, then let go at the bottom of a swing and flip down
        const arrive = async (clown, trap, fromLeft) => {
            const px = fromLeft ? W * 0.32 : W * 0.68;
            const py = -H * 0.22;
            const length = H * 0.58;
            const side = fromLeft ? -1 : 1;
            const angle = (t) => side * 78 * Math.cos(3 * Math.PI * t) * (1 - 0.45 * t);
            trap.style.display = '';
            wearGear(clown.el, ['hands']);
            const SWING_MS = 3400;
            await d.tween(SWING_MS, linear, (t) => drawSwing(trap, px, py, length, angle(t * (5 / 6)), clown, clown.size));
            if (d.isDead()) return;
            // Let go: the empty trapeze swings on, up and away
            const away = d.tween(1100, easeOut, (t) => drawSwing(trap, px, py, length, -side * 88 * t, null, clown.size));
            const landX = clown.x - side * W * 0.1;
            await flipTo(clown, landX, floor(), 70, 950);
            wearGear(clown.el, ['hands']);
            await away;
            trap.style.display = 'none';
            await d.wait(700);
            wearGear(clown.el, []);
        };

        const run = async () => {
            while (!d.isDead()) {
                await Promise.all([
                    arrive(A, trapARef.current, true),
                    d.wait(700).then(() => arrive(B, trapBRef.current, false)),
                ]);
                await d.wait(300);
                // Across the bottom of the screen, in opposite directions, and off
                await Promise.all([walk(A, W + 90 * u, 130), walk(B, -90 * u, 130)]);
                await d.wait(1200);
            }
        };

        svg.classList.add('is-ready');
        wearGear(A.el, []);
        wearGear(B.el, []);
        if (reduceMotion()) {
            A.x = W * 0.3;
            B.x = W * 0.7;
            A.y = floor();
            B.y = floor();
            place(A);
            place(B);
        } else {
            place(A);
            place(B);
            run();
        }
        const observer = new ResizeObserver(measure);
        observer.observe(svg);
        return () => {
            observer.disconnect();
            d.stop();
        };
    }, []);

    return (
        <svg ref={svgRef} className="cc-crew circus-rules-show" aria-hidden="true" preserveAspectRatio="none">
            <Trapeze elRef={trapARef} />
            <Trapeze elRef={trapBRef} />
            <Clown elRef={aRef} {...OOPSY} />
            <Clown elRef={bRef} {...DAISY} />
        </svg>
    );
}

/** 💥 The end credits: the ringmaster announces the big finish, and Oopsy is fired out of a cannon */
export function CircusFinale({ onDone }) {
    const svgRef = useRef(null);
    const aRef = useRef(null);
    const bRef = useRef(null);
    const ringRef = useRef(null);
    const cannonRef = useRef(null);
    const smokeRef = useRef(null);
    const powRef = useRef(null);
    const sayRef = useRef(null);

    useEffect(() => {
        const box = svgRef.current.getBoundingClientRect();
        const extra = box.height ? Math.max(0, (box.width / (box.height / 100) - 400) / 2) : 0;
        const offLeft = -extra - 60;
        const offRight = 400 + extra + 120;
        const FLOOR = 96;
        const S = 0.7;
        const d = makeDirector();
        const { place, walk, hop, say } = makeMoves(d, () => S, () => 400 + extra - 4);
        const A = { x: offRight + 40, y: FLOOR, size: 0.94, el: aRef.current };
        const B = { x: offRight + 80, y: FLOOR, size: 1.0, el: bRef.current };
        const ring = { x: offLeft, y: FLOOR, size: 1.05, el: ringRef.current };
        const cannon = { x: offRight, y: FLOOR, size: 1, el: cannonRef.current };
        const muzzle = () => ({ x: cannon.x + CANNON_MUZZLE.x * S, y: FLOOR + CANNON_MUZZLE.y * S });
        const puff = () => {
            const m = muzzle();
            burst(smokeRef.current, m.x, m.y, S);
            burst(powRef.current, m.x + 6, m.y - 4, S * 1.8);
        };
        const sayAbove = (a, text, ms) => say(sayRef.current, text, a.x + 6 * S, FLOOR - 116 * S * a.size, ms);

        wearGear(A.el, []);
        wearGear(B.el, []);
        [A, B, ring, cannon].forEach(place);
        if (reduceMotion()) { onDone?.(); return () => d.stop(); }

        const run = async () => {
            await d.wait(1000);
            // The ringmaster steps out
            show(ring.el);
            await walk(ring, 70, 80);
            ring.el.setAttribute('data-look', 'right');
            await sayAbove(ring, 'AND NOW...', 1100);
            // In comes the cannon, pushed by the clowns
            show(cannon.el);
            await Promise.all([
                d.tween(2200, easeOut, (t) => { cannon.x = offRight + (240 - offRight) * t; place(cannon); }),
                d.tween(2200, easeOut, (t) => {
                    A.x = offRight + 40 + (282 - offRight - 40) * t;
                    B.x = offRight + 80 + (312 - offRight - 80) * t;
                    place(A);
                    place(B);
                }),
            ]);
            await sayAbove(ring, 'THE HUMAN CANNONBALL!', 1300);
            // Helmet on, and in
            wearGear(A.el, ['helmet']);
            await d.wait(400);
            const m = muzzle();
            await hop(A, m.x, m.y + 20, 30, 650);
            hide(A.el);
            // Daisy lights the fuse
            await walk(B, cannon.x - 34, 80);
            cannon.el.classList.add('is-lit');
            await sayAbove(ring, '3...', 550);
            await sayAbove(ring, '2...', 550);
            await sayAbove(ring, '1...', 550);
            cannon.el.classList.remove('is-lit');
            // BOOM: out and up, right off the top of the screen
            puff();
            const from = muzzle();
            A.x = from.x;
            A.y = from.y + 30;
            show(A.el);
            const recoil = d.tween(400, easeOut, (t) => { cannon.x = 240 - Math.sin(Math.PI * t) * 8; place(cannon); });
            await d.tween(900, linear, (t) => {
                A.x = from.x + CANNON_AIM.x * 330 * t;
                A.y = from.y + 30 + CANNON_AIM.y * 330 * t - 160 * t * t;
                A.rot = 720 * t;
                place(A);
            });
            await recoil;
            hide(A.el);
            A.rot = 0;
            await d.wait(500);
            // Daisy has a look down the barrel. It hasn't quite finished.
            await walk(B, cannon.x + CANNON_MUZZLE.x * S + 14, 70);
            B.el.setAttribute('data-look', 'left');
            await sayAbove(B, 'HELLO?', 800);
            puff();
            wearGear(B.el, ['sooty']);
            B.el.classList.add('quiz-scared');
            await d.wait(600);
            B.el.classList.remove('quiz-scared');
            await d.wait(300);
            // And here's Oopsy again, coming down
            A.x = 350;
            A.y = -260;
            show(A.el);
            await d.tween(700, easeIn, (t) => { A.y = -260 + (FLOOR + 260) * t; place(A); });
            burst(powRef.current, A.x, FLOOR - 4, S * 1.4);
            await d.wait(250);
            wearGear(A.el, ['helmet', 'hands']);
            wearGear(B.el, ['sooty', 'hands']);
            await sayAbove(A, 'TA-DA!', 1100);
            wearGear(A.el, ['helmet']);
            wearGear(B.el, ['sooty']);
            await bow(ring, A, B);
            await d.wait(500);
            onDone?.();
        };
        const bow = async (...who) => {
            who.forEach((a) => a.el.classList.add('quiz-bowing'));
            await d.wait(1600);
            who.forEach((a) => a.el.classList.remove('quiz-bowing'));
        };
        run();
        return () => d.stop();
    }, []);

    return (
        <svg ref={svgRef} className="cc-crew cc-round-scene-art" viewBox="0 0 400 100" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
            <Ringmaster elRef={ringRef} />
            <Clown elRef={bRef} {...DAISY} />
            <Cannon elRef={cannonRef} />
            <Clown elRef={aRef} {...OOPSY} />
            <Smoke elRef={smokeRef} />
            <Pow elRef={powRef} />
            <Bubble elRef={sayRef} />
        </svg>
    );
}
