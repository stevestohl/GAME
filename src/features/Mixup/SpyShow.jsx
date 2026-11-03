import React, { useEffect, useRef } from 'react';
import { Plane } from '../TriviaCast/QuizCast.jsx';
import { makeDirector } from '../TriviaCast/QuizScenes.jsx';
import { Spy, Bush, PoliceCar, Officer, DroppedHat, DroppedGlasses, DroppedCase, SpyBubble, wearGear } from './SpyCast.jsx';

// 🕵️ Temple Mix Up's two very bad spies, who keep changing their disguises (the game keeps changing too).
//   SpyShow:      the lobby, under the players card. They take turns at: announcing obviously fake disguises, popping
//                 out of a bush, walking into each other and grabbing the wrong disguises, the old suitcase handoff,
//                 and hiding from a police car that's looking for them (it doesn't catch them yet).
//   SpyRulesShow: the rules screen. They parachute from two planes and walk across the bottom of the screen.
//   SpyArrest:    the end credits. The police finally catch them and take them away.

const easeOut = (t) => 1 - (1 - t) ** 3;
const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
const linear = (t) => t;

const SPY_A = { suit: '#6b4a32', tie: '#e5484d', skin: '#e2b692', hair: '#2c2118' };
const SPY_B = { suit: '#47506a', tie: '#2ea866', skin: '#dcb08a', hair: '#7a3b1e' };

const reduceMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// The shared moves. `unit` is how many screen pixels a drawing unit is here.
const makeMoves = (d, getUnit) => {
    const place = (a) => {
        const u = getUnit() * (a.size || 1);
        a.el.setAttribute('transform', `translate(${a.x} ${a.y + (a.drop || 0) * getUnit() - (a.lift || 0)}) rotate(${a.rot || 0}) scale(${(a.flip || 1) * u} ${u})`);
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
    const say = async (el, text, x, y, ms) => {
        el.querySelector('text').textContent = text;
        el.setAttribute('transform', `translate(${x} ${y}) scale(${Math.max(0.55, getUnit())})`);
        el.classList.add('is-on');
        await d.wait(ms);
        el.classList.remove('is-on');
    };
    return { place, walk, hop, say };
};

export default function SpyShow({ stageRef, screenRef, playerCount = 0 }) {
    const svgRef = useRef(null);
    const clipRef = useRef(null);
    const aRef = useRef(null);
    const bRef = useRef(null);
    const bushRef = useRef(null);
    const carRef = useRef(null);
    const hatRef = useRef(null);
    const glassesRef = useRef(null);
    const caseRef = useRef(null);
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
                bushX: left + usable * 0.5,
                hiddenX: screen.right - root.left - 60,
                offRight: root.width + 130,
            };
            svg.setAttribute('viewBox', `0 0 ${root.width} ${root.height}`);
            clipRef.current.setAttribute('width', root.width);
            clipRef.current.setAttribute('height', L.floorY + 1);
        };
        measure();

        const d = makeDirector();
        const { place, walk, hop, say } = makeMoves(d, () => L.u);
        const A = { x: L.hiddenX, y: L.floorY, size: 0.94, el: aRef.current };
        const B = { x: L.offRight, y: L.floorY, size: 1.06, el: bRef.current };
        const bush = { x: L.bushX, grow: 0, el: bushRef.current };
        const car = { x: L.offRight + 100, el: carRef.current };
        const drawBush = () => {
            bush.el.style.display = bush.grow > 0 ? '' : 'none';
            bush.el.setAttribute('transform', `translate(${bush.x} ${L.floorY}) scale(${L.u * 1.15} ${L.u * 1.15 * bush.grow})`);
        };
        const drawCar = () => {
            car.el.setAttribute('transform', `translate(${car.x} ${L.floorY}) scale(${L.u * 0.95})`);
        };
        const putItem = (el, x, y) => {
            el.style.display = '';
            el.setAttribute('transform', `translate(${x} ${y}) scale(${L.u * 0.9})`);
        };
        const hide = (...els) => els.forEach((el) => { el.style.display = 'none'; });
        const headY = (a) => a.y - 112 * L.u * a.size;
        const bubbleAt = (a, text, ms = 1300) => say(sayRef.current, text, a.x + 8 * L.u, Math.max(L.stageTop + 18 * L.u, headY(a)), ms);
        const pow = (x, y) => {
            const burst = powRef.current;
            burst.setAttribute('transform', `translate(${x} ${y}) scale(${L.u * 1.4})`);
            burst.classList.remove('is-on');
            burst.getBoundingClientRect();
            burst.classList.add('is-on');
        };
        const goHome = async () => {
            await Promise.all([walk(A, L.spotA), walk(B, L.spotB)]);
        };

        // 🥸 Two obvious disguises, and two terrible cover stories
        const announce = async () => {
            wearGear(A.el, ['nose']);
            await d.wait(350);
            await bubbleAt(A, 'NOT A SPY!');
            wearGear(B.el, ['trench']);
            await d.wait(350);
            await bubbleAt(B, 'ME NEITHER');
            await d.wait(300);
            wearGear(B.el, ['paper']);
            await d.wait(900);
            await bubbleAt(B, 'JUST READING');
            wearGear(B.el, ['trench']);
            await d.wait(500);
        };

        // 🌳 A bush nobody planted, and somebody in it
        const inTheBush = async () => {
            await d.tween(600, easeOut, (t) => { bush.grow = t; drawBush(); });
            await d.wait(200);
            await walk(A, bush.x - 8 * L.u, 110);
            await d.tween(240, easeInOut, (t) => { A.drop = 80 * t; place(A); });
            bush.el.classList.add('is-rustling');
            await d.wait(800);
            bush.el.classList.remove('is-rustling');
            const pop = async (x) => {
                A.x = bush.x + x * L.u;
                await d.tween(200, easeOut, (t) => { A.drop = 80 - 44 * t; place(A); });
                await d.wait(700);
                await d.tween(160, easeInOut, (t) => { A.drop = 36 + 44 * t; place(A); });
                await d.wait(450);
            };
            await pop(-20);
            await pop(24);
            await pop(-4);
            await d.tween(240, easeOut, (t) => { A.drop = 80 * (1 - t); place(A); });
            A.drop = 0;
            place(A);
            await bubbleAt(A, 'NAILED IT', 900);
            await walk(A, L.spotA, 110);
            await d.tween(400, easeInOut, (t) => { bush.grow = 1 - t; drawBush(); });
        };

        // 💥 They walk into each other (one's reading the paper), and leave in each other's disguises
        const theBump = async () => {
            const wearingA = A.wearing || 'nose';
            const wearingB = wearingA === 'nose' ? 'trench' : 'nose';
            wearGear(A.el, [wearingA]);
            wearGear(B.el, ['paper']);
            const hitX = L.mid;
            await Promise.all([walk(A, hitX - 18 * L.u, 70), walk(B, hitX + 18 * L.u, 70)]);
            pow(hitX, L.floorY - 72 * L.u);
            wearGear(A.el, []);
            wearGear(B.el, []);
            A.rot = -14;
            B.rot = 14;
            const itemFor = { nose: glassesRef.current, trench: hatRef.current };
            const fall = (el, fromX, toX) => d.tween(520, linear, (t) => {
                const y = L.floorY - 80 * L.u * (1 - t) ** 2 - Math.sin(Math.PI * t) * 18 * L.u;
                putItem(el, fromX + (toX - fromX) * t, y);
            });
            await Promise.all([
                hop(A, hitX - 46 * L.u, L.floorY, 8, 380),
                hop(B, hitX + 46 * L.u, L.floorY, 8, 380),
                fall(itemFor[wearingA], hitX - 8 * L.u, hitX + 14 * L.u),
                fall(itemFor[wearingB], hitX + 8 * L.u, hitX - 14 * L.u),
            ]);
            A.rot = 0;
            B.rot = 0;
            place(A);
            place(B);
            await bubbleAt(A, 'WATCH IT!', 900);
            // Each dives for the nearest one: the other's
            A.el.classList.add('spy-scrambling');
            B.el.classList.add('spy-scrambling');
            await Promise.all([hop(A, hitX - 16 * L.u, L.floorY, 6, 300), hop(B, hitX + 16 * L.u, L.floorY, 6, 300)]);
            await d.wait(450);
            A.el.classList.remove('spy-scrambling');
            B.el.classList.remove('spy-scrambling');
            hide(hatRef.current, glassesRef.current);
            wearGear(A.el, [wearingB]);
            wearGear(B.el, [wearingA]);
            A.wearing = wearingB;
            await d.wait(350);
            await Promise.all([walk(A, L.spotA, 70), walk(B, L.spotB, 70)]);
            A.el.setAttribute('data-look', 'right');
            await bubbleAt(B, '...HUH?', 1000);
        };

        // 💼 The handoff, like in the movies
        const theHandoff = async () => {
            const worn = A.wearing || 'nose';
            wearGear(A.el, [worn, 'case']);
            await walk(A, L.mid - 14 * L.u, 65);
            await d.wait(300);
            wearGear(A.el, [worn]);
            putItem(caseRef.current, L.mid + 8 * L.u, L.floorY);
            await d.wait(300);
            await bubbleAt(A, '*WHISTLES*', 800);
            await walk(A, L.spotA, 65);
            await walk(B, L.mid + 22 * L.u, 80);
            await d.wait(350);
            hide(caseRef.current);
            const wornB = worn === 'nose' ? 'trench' : 'nose';
            wearGear(B.el, [wornB, 'case']);
            await bubbleAt(B, 'THE PLANS!', 900);
            await walk(B, L.spotB, 80);
            await d.wait(500);
            wearGear(B.el, [wornB]);
        };

        // 🚓 The police come looking, and two people suddenly have to read the paper
        const thePolice = async () => {
            wearGear(A.el, ['paper']);
            wearGear(B.el, ['paper']);
            car.el.style.display = '';
            car.x = L.offRight + 100;
            await d.tween(1400, easeOut, (t) => {
                car.x = L.offRight + 100 + (L.mid - L.offRight - 100) * t;
                drawCar();
            });
            await d.wait(250);
            await say(sayRef.current, 'HMM...', car.x - 30 * L.u, Math.max(L.stageTop + 18 * L.u, L.floorY - 92 * L.u), 1100);
            await d.wait(200);
            const fromX = car.x;
            await d.tween(1200, (t) => t * t, (t) => { car.x = fromX + (L.hiddenX - 40 - fromX) * t; drawCar(); });
            hide(car.el);
            await d.wait(500);
            await bubbleAt(B, 'PHEW!', 900);
            const worn = A.wearing || 'nose';
            wearGear(A.el, [worn]);
            wearGear(B.el, [worn === 'nose' ? 'trench' : 'nose']);
            await d.wait(400);
        };

        const run = async () => {
            place(A);
            place(B);
            drawCar();
            wearGear(A.el, []);
            wearGear(B.el, []);
            await goHome();
            const scenes = [announce, inTheBush, theBump, theHandoff, thePolice];
            for (let i = 0; !d.isDead(); i = (i + 1) % scenes.length) {
                await d.wait(800);
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
            wearGear(A.el, ['nose']);
            wearGear(B.el, ['trench']);
        } else {
            run();
        }

        const observer = new ResizeObserver(() => {
            measure();
            bush.x = L.bushX;
            A.y = L.floorY;
            B.y = L.floorY;
            place(A);
            place(B);
            drawBush();
            drawCar();
        });
        observer.observe(svg.parentElement);
        observer.observe(stageRef.current);

        engineRef.current = { greet: () => bubbleAt(B, 'WHO WAS THAT?', 1000) };
        return () => {
            engineRef.current = null;
            observer.disconnect();
            d.stop();
        };
    }, []);

    // Someone new joined: the spies notice, a little late
    const lastCount = useRef(playerCount);
    useEffect(() => {
        if (playerCount > lastCount.current) engineRef.current?.greet();
        lastCount.current = playerCount;
    }, [playerCount]);

    return (
        <svg ref={svgRef} className="cc-crew spy-show" aria-hidden="true" preserveAspectRatio="none">
            <defs>
                <clipPath id="spy-floor"><rect ref={clipRef} x={0} y={0} width={0} height={0} /></clipPath>
            </defs>
            <g className="crew-world">
                <g clipPath="url(#spy-floor)">
                    <Spy elRef={aRef} {...SPY_A} />
                </g>
                <Bush elRef={bushRef} />
                <Spy elRef={bRef} {...SPY_B} />
                <DroppedHat elRef={hatRef} />
                <DroppedGlasses elRef={glassesRef} />
                <DroppedCase elRef={caseRef} />
                <PoliceCar elRef={carRef} />
            </g>
            <g ref={powRef} className="crew-pow">
                <path d="M 0 -13 L 3.5 -5 L 12 -7 L 6 0 L 12 7 L 3.5 5 L 0 13 L -3.5 5 L -12 7 L -6 0 L -12 -7 L -3.5 -5 Z" fill="#ffd23f" stroke="#16161d" strokeWidth={2} strokeLinejoin="round" />
            </g>
            <SpyBubble elRef={sayRef} />
        </svg>
    );
}

/** 🪂 The rules screen: two planes, two parachutes, and a stroll along the bottom */
export function SpyRulesShow() {
    const svgRef = useRef(null);
    const aRef = useRef(null);
    const bRef = useRef(null);
    const planeARef = useRef(null);
    const planeBRef = useRef(null);

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
        const { place, walk } = makeMoves(d, () => u);
        const A = { x: -200, y: 0, size: 0.94, el: aRef.current };
        const B = { x: -200, y: 0, size: 1.06, el: bRef.current };
        wearGear(A.el, ['nose']);
        wearGear(B.el, ['trench']);
        const floor = () => H - 6;
        const drawPlane = (el, x, y, flip) => {
            el.setAttribute('transform', `translate(${x} ${y}) scale(${flip * u * 0.9} ${u * 0.9})`);
        };

        // One plane crosses the top of the screen; at `dropAt` of the way across, out comes a spy
        const arrive = async (spy, planeEl, fromLeft, height, dropAt) => {
            const startX = fromLeft ? -130 * u : W + 130 * u;
            const endX = fromLeft ? W + 130 * u : -130 * u;
            planeEl.style.display = '';
            planeEl.classList.add('is-empty');
            const jumpX = startX + (endX - startX) * dropAt;
            const planeFlight = d.tween(4200, linear, (t) => drawPlane(planeEl, startX + (endX - startX) * t, height, fromLeft ? -1 : 1));
            await d.wait(4200 * dropAt);
            if (d.isDead()) return;
            wearGear(spy.el, [spy === A ? 'nose' : 'trench', 'chute']);
            spy.x = jumpX;
            spy.y = height + 20 * u;
            const startY = spy.y;
            await d.tween(3000, linear, (t) => {
                spy.y = startY + (floor() - startY) * t;
                spy.rot = Math.sin(t * Math.PI * 4) * 6;
                place(spy);
            });
            spy.rot = 0;
            wearGear(spy.el, [spy === A ? 'nose' : 'trench']);
            place(spy);
            await planeFlight;
            planeEl.style.display = 'none';
        };

        const run = async () => {
            while (!d.isDead()) {
                await Promise.all([
                    arrive(A, planeARef.current, true, H * 0.09, 0.28),
                    d.wait(900).then(() => arrive(B, planeBRef.current, false, H * 0.16, 0.3)),
                ]);
                await d.wait(300);
                // Across the bottom of the screen, in opposite directions, and off
                await Promise.all([walk(A, W + 90 * u, 130), walk(B, -90 * u, 130)]);
                await d.wait(1200);
            }
        };

        svg.classList.add('is-ready');
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
        <svg ref={svgRef} className="cc-crew spy-rules-show" aria-hidden="true" preserveAspectRatio="none">
            <Plane planeRef={planeARef} />
            <Plane planeRef={planeBRef} />
            <Spy elRef={aRef} {...SPY_A} />
            <Spy elRef={bRef} {...SPY_B} />
        </svg>
    );
}

/** 🚓 The end credits: the spies try to sneak off, the police pull up, and that's that */
export function SpyArrest({ onDone }) {
    const svgRef = useRef(null);
    const aRef = useRef(null);
    const bRef = useRef(null);
    const copRef = useRef(null);
    const carRef = useRef(null);
    const sayRef = useRef(null);

    useEffect(() => {
        const box = svgRef.current.getBoundingClientRect();
        const extra = box.height ? Math.max(0, (box.width / (box.height / 100) - 400) / 2) : 0;
        const offLeft = -extra - 60;
        const offRight = 400 + extra + 140;
        const FLOOR = 96;
        const S = 0.7;
        const d = makeDirector();
        const { place, walk, say } = makeMoves(d, () => S);
        const A = { x: offRight + 60, y: FLOOR, size: 0.94, el: aRef.current };
        const B = { x: offRight, y: FLOOR, size: 1.06, el: bRef.current };
        const cop = { x: 0, y: FLOOR, size: 1, el: copRef.current };
        const car = { x: offLeft - 100, el: carRef.current };
        const drawCar = () => car.el.setAttribute('transform', `translate(${car.x} ${FLOOR}) scale(${S})`);

        wearGear(A.el, ['nose']);
        wearGear(B.el, ['trench']);
        place(A);
        place(B);
        drawCar();
        if (reduceMotion()) { onDone?.(); return () => d.stop(); }

        const run = async () => {
            await d.wait(1200);
            // They tiptoe in from the right, very pleased with themselves
            await Promise.all([walk(B, 240, 90), walk(A, 300, 90)]);
            // And here's the police, heading them off
            car.el.style.display = '';
            await d.tween(1100, easeOut, (t) => { car.x = offLeft - 100 + (130 - offLeft + 100) * t; drawCar(); });
            wearGear(A.el, ['nose', 'hands']);
            wearGear(B.el, ['trench', 'hands']);
            A.el.classList.add('quiz-scared');
            B.el.classList.add('quiz-scared');
            cop.x = 130;
            place(cop);
            cop.el.style.display = '';
            await walk(cop, 196, 70);
            cop.el.setAttribute('data-look', 'right');
            await say(sayRef.current, 'BUSTED!', 150, 22, 1500);
            A.el.classList.remove('quiz-scared');
            B.el.classList.remove('quiz-scared');
            // Off to the car, in a sorry little line
            await Promise.all([walk(cop, 130, 50), walk(B, 178, 50), walk(A, 216, 50)]);
            [cop, A, B].forEach((p) => { p.el.style.display = 'none'; });
            car.el.classList.add('has-prisoners');
            await d.wait(500);
            await d.tween(1600, (t) => t * t, (t) => { car.x = 130 + (offLeft - 100 - 130) * t; drawCar(); });
            await d.wait(600);
            onDone?.();
        };
        run();
        return () => d.stop();
    }, []);

    return (
        <svg ref={svgRef} className="cc-crew cc-round-scene-art" viewBox="0 0 400 100" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
            <Spy elRef={aRef} {...SPY_A} />
            <Spy elRef={bRef} {...SPY_B} />
            <Officer elRef={copRef} />
            <PoliceCar elRef={carRef} />
            <SpyBubble elRef={sayRef} />
        </svg>
    );
}
