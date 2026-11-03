import React, { useEffect, useRef } from 'react';
import { Lincoln, BabeRuth, Cleopatra, Earhart, Dinosaur, Ball, Litter, TheatreBoxBack, TheatreBoxFront } from './QuizCast.jsx';

// 🎓 The Trivia Cast cast's other bits on the TV (their lobby show is QuizShow.jsx):
//   QuizRulesScene: under the countdown, Babe Ruth hits one and runs for it, over and over
//   QuizRoundScene: along the bottom of the "Round 3" card, taking turns round by round:
//     ball:   a game of ball; Ruth connects, and everybody runs off after it
//     litter: Ruth, Earhart, Lincoln and the dinosaur carry Cleopatra across the screen
//     box:    everyone's watching from a theatre box when the dinosaur turns up and chases them off
//   QuizBows: the whole cast takes a bow in the credits
//
// The round scene and the bows are drawn in a fixed 400 × 100 strip (it scales to fit); the floor is at y = 96.
// The TV waits SCENE_MS for a round scene before moving on, which has to stay under the server's
// backup timer for the round card (ROUND_INTRO_BACKUP_MS).

export const SCENE_MS = 6800;
const FLOOR = 96;
const S = 0.62;           // the cast's size in a round scene (they have to clear the words on the card)
const SCENES = ['ball', 'litter', 'box'];

const easeOut = (t) => 1 - (1 - t) ** 3;
const easeIn = (t) => t * t;
const linear = (t) => t;

// Timers that all stop together when the scene leaves
export const makeDirector = () => {
    const frames = new Set();
    const timers = new Set();
    let dead = false;
    return {
        isDead: () => dead,
        wait: (ms) => new Promise((resolve) => {
            const id = setTimeout(() => { timers.delete(id); resolve(); }, ms);
            timers.add(id);
        }),
        tween: (ms, ease, step) => new Promise((resolve) => {
            const start = performance.now();
            let id = requestAnimationFrame(function tick(now) {
                frames.delete(id);
                if (dead) return;
                const t = Math.min(1, (now - start) / ms);
                step(ease(t));
                if (t < 1) { id = requestAnimationFrame(tick); frames.add(id); } else resolve();
            });
            frames.add(id);
        }),
        stop: () => {
            dead = true;
            frames.forEach((id) => cancelAnimationFrame(id));
            timers.forEach((id) => clearTimeout(id));
        },
    };
};

const place = (a) => a.el.setAttribute('transform', `translate(${a.x} ${a.y - (a.lift || 0)}) rotate(${a.rot || 0}) scale(${(a.flip || 1) * a.size} ${a.size})`);
const reduceMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// Speech bubble, its text set by the scene
function Bubble({ elRef }) {
    return (
        <g ref={elRef} className="crew-bark">
            <path d="M -4 -14 H 62 a 6 6 0 0 1 6 6 V 6 a 6 6 0 0 1 -6 6 H 8 L -2 20 L 0 12 H -4 a 6 6 0 0 1 -6 -6 V -8 a 6 6 0 0 1 6 -6 Z" fill="#fff" stroke="#16161d" strokeWidth={2.4} strokeLinejoin="round" />
            <text x={29} y={4} textAnchor="middle" fontSize={13} fontWeight={900} fill="#16161d" fontFamily="system-ui, sans-serif" />
        </g>
    );
}
const say = async (d, el, text, x, y, ms, size = 0.8) => {
    el.querySelector('text').textContent = text;
    el.setAttribute('transform', `translate(${x} ${y}) scale(${size})`);
    el.classList.add('is-on');
    await d.wait(ms);
    el.classList.remove('is-on');
};

// Ruth's swing: round from over the shoulder, about the hands (drawn on the near side of the figure)
const swing = (d, ruth) => {
    const bat = ruth.el.querySelector('.quiz-bat');
    return d.tween(190, easeIn, (t) => bat.setAttribute('transform', `rotate(${t * 250} 23.5 -41)`));
};
const resetBat = (ruth) => ruth.el.querySelector('.quiz-bat').removeAttribute('transform');

const runTo = async (d, a, x, speed, gait = 'crew-running') => {
    const from = a.x;
    a.el.classList.add(gait);
    await d.tween((Math.abs(x - from) / speed) * 1000, linear, (t) => { a.x = from + (x - from) * t; place(a); });
    a.el.classList.remove(gait);
};
const hop = (d, a, toX, toY, height, ms) => {
    const fromX = a.x;
    const fromY = a.y;
    return d.tween(ms, linear, (t) => {
        a.x = fromX + (toX - fromX) * t;
        a.y = fromY + (toY - fromY) * t;
        a.lift = Math.sin(Math.PI * t) * height;
        place(a);
    });
};

export function QuizRulesScene() {
    const ruthRef = useRef(null);
    const ballRef = useRef(null);
    const bubbleRef = useRef(null);

    useEffect(() => {
        const FLOOR_Y = 112;
        const ruth = { x: 62, y: FLOOR_Y, size: 0.74, flip: -1, el: ruthRef.current };
        place(ruth);
        if (reduceMotion()) return undefined;
        const d = makeDirector();
        const ball = ballRef.current;
        const drawBall = (x, y) => ball.setAttribute('transform', `translate(${x} ${y})`);

        const inning = async () => {
            while (!d.isDead()) {
                // The pitch comes in from the right
                ball.style.display = '';
                const fly = d.tween(760, linear, (t) => drawBall(230 - 150 * t, 58 + 24 * t));
                await d.wait(590);
                if (d.isDead()) return;
                swing(d, ruth);
                await fly;
                // CRACK! Up it goes, and off he runs
                say(d, bubbleRef.current, 'CRACK!', 96, 30, 900, 0.72);
                d.tween(1100, easeOut, (t) => drawBall(80 + 170 * t, 82 - 90 * t)).then(() => { ball.style.display = 'none'; });
                await d.wait(320);
                await runTo(d, ruth, 260, 200);
                // Round the bases and back in from the other side, ready for the next one
                await d.wait(700);
                resetBat(ruth);
                ruth.x = -50;
                place(ruth);
                await runTo(d, ruth, 62, 110, 'crew-walking');
                await d.wait(800);
            }
        };
        inning();
        return () => d.stop();
    }, []);

    return (
        <svg className="cc-crew cc-abduct" viewBox="0 0 200 120" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
            <path d="M 0 113 H 200" stroke="rgba(0, 0, 0, 0.25)" strokeWidth={2} />
            <BabeRuth elRef={ruthRef} />
            <Ball elRef={ballRef} />
            <Bubble elRef={bubbleRef} />
        </svg>
    );
}

export function QuizRoundScene({ round }) {
    const svgRef = useRef(null);
    const ruthRef = useRef(null);
    const lincolnRef = useRef(null);
    const cleoRef = useRef(null);
    const earhartRef = useRef(null);
    const dinoRef = useRef(null);
    const ballRef = useRef(null);
    const litterRef = useRef(null);
    const boxBackRef = useRef(null);
    const boxFrontRef = useRef(null);
    const frontRef = useRef(null);
    const bubbleRef = useRef(null);
    const scene = SCENES[(Math.max(2, round) - 2) % SCENES.length];

    useEffect(() => {
        // Just past the screen's real edges: the strip is wider than 400 units on a widescreen TV
        const box = svgRef.current.getBoundingClientRect();
        const extra = box.height ? Math.max(0, (box.width / (box.height / 100) - 400) / 2) : 0;
        const offLeft = -extra - 80;
        const offRight = 400 + extra + 80;

        const ruth = { x: offLeft, y: FLOOR, size: S, el: ruthRef.current };
        const lincoln = { x: offLeft, y: FLOOR, size: S, el: lincolnRef.current };
        const cleo = { x: offLeft, y: FLOOR, size: S, el: cleoRef.current };
        const earhart = { x: offLeft, y: FLOOR, size: S, el: earhartRef.current };
        const dino = { x: offLeft, y: FLOOR, size: 0.42, el: dinoRef.current };
        const everyone = [ruth, lincoln, cleo, earhart, dino];
        dino.el.style.display = '';
        const ball = ballRef.current;
        const litter = { x: offLeft, y: FLOOR, size: 0.46, el: litterRef.current };

        const setUp = (positions) => positions.forEach(([a, x, extras]) => { Object.assign(a, { x }, extras); place(a); });

        // ⚾ A game of ball
        const stageBall = () => setUp([
            [dino, 66, { flip: -1, size: 0.36 }],
            [ruth, 118, { flip: -1 }],
            [lincoln, 236, {}],
            [cleo, 306, {}],
            [earhart, 366, {}],
        ]);
        const playBall = async (d) => {
            const drawBall = (x, y) => ball.setAttribute('transform', `translate(${x} ${y})`);
            await d.wait(800);
            // Lincoln winds up and pitches
            await d.tween(350, easeIn, (t) => { lincoln.rot = 14 * t; place(lincoln); });
            ball.style.display = '';
            lincoln.rot = -8;
            place(lincoln);
            const fly = d.tween(620, linear, (t) => drawBall(226 - 100 * t, 44 + 22 * t));
            await d.wait(450);
            swing(d, ruth);
            await fly;
            lincoln.rot = 0;
            place(lincoln);
            say(d, bubbleRef.current, 'CRACK!', 130, 22, 1100);
            d.tween(1200, easeOut, (t) => drawBall(126 + 330 * t, 66 - 100 * t)).then(() => { ball.style.display = 'none'; });
            await d.wait(350);
            // Everybody's off after it
            await Promise.all([ruth, lincoln, cleo, earhart, dino].map(async (a, i) => {
                await d.wait([0, 200, 80, 40, 420][i]);
                a.rot = 8;
                place(a);
                await runTo(d, a, offRight, a === dino ? 340 : 360, a === dino ? 'quiz-dino-running' : 'crew-running');
            }));
        };

        // 👑 Cleopatra in her litter, all the way across
        const stageLitter = () => {
            const k = litter.size;
            setUp([[lincoln, offLeft, { size: k }], [ruth, offLeft, { size: k }], [earhart, offLeft, { size: k }], [cleo, offLeft, { size: k, y: FLOOR - 70 * k }], [dino, offLeft, { size: 0.32, flip: -1 }]]);
            place(litter);
        };
        const playLitter = async (d) => {
            const k = litter.size;
            const walking = [ruth, lincoln, earhart];
            walking.forEach((a) => { a.el.classList.add('crew-walking'); a.el.setAttribute('data-look', 'right'); });
            dino.el.classList.add('quiz-dino-running');
            cleo.el.setAttribute('data-look', 'right');
            d.wait(2700).then(() => { if (!d.isDead()) say(d, bubbleRef.current, 'FASTER!', cleo.x + 12, FLOOR - 186 * k, 1200); });
            await d.tween(6300, linear, (t) => {
                const x = offLeft + (offRight - offLeft) * t;
                litter.x = x;
                cleo.x = x;
                ruth.x = x + 58 * k * 1.2;
                earhart.x = x + 28 * k * 1.2;
                lincoln.x = x - 28 * k * 1.2;
                dino.x = x - 78 * k * 1.2;
                [litter, cleo, ruth, earhart, lincoln, dino].forEach(place);
            });
        };

        // 🎭 A night at the theatre, until the dinosaur shows up
        const stageBox = () => {
            boxBackRef.current.style.display = '';
            boxFrontRef.current.style.display = '';
            setUp([[lincoln, 138, { size: 0.58 }], [cleo, 180, { size: 0.58 }], [ruth, 222, { size: 0.58 }], [earhart, 264, { size: 0.58 }], [dino, offRight, { size: 0.46 }]]);
        };
        const playBox = async (d) => {
            const audience = [lincoln, cleo, ruth, earhart];
            audience.forEach((a) => a.el.setAttribute('data-look', 'front'));
            await d.wait(1100);
            audience.forEach((a) => a.el.setAttribute('data-look', 'right'));
            await runTo(d, dino, 356, 150, 'quiz-dino-running');
            dino.el.classList.add('is-roaring');
            say(d, bubbleRef.current, 'ROAR!', 296, 18, 900);
            audience.forEach((a) => a.el.classList.add('quiz-scared'));
            await d.wait(500);
            dino.el.classList.remove('is-roaring');
            // Over the front of the box and away, with the dinosaur right behind them
            audience.forEach((a) => { frontRef.current.appendChild(a.el); a.el.classList.remove('quiz-scared'); });
            await Promise.all(audience.map(async (a, i) => {
                await hop(d, a, a.x - 8, FLOOR + 2, 22, 300);
                await d.wait(i * 60);
                a.rot = -8;
                a.el.setAttribute('data-look', 'left');
                place(a);
                await runTo(d, a, offLeft, 380);
            }));
        };
        const chaseBox = (d) => d.wait(2800).then(() => runTo(d, dino, offLeft, 330, 'quiz-dino-running'));

        const stage = { ball: stageBall, litter: stageLitter, box: stageBox }[scene];
        stage();
        if (reduceMotion()) return undefined;

        const d = makeDirector();
        if (scene === 'ball') playBall(d);
        if (scene === 'litter') playLitter(d);
        if (scene === 'box') { playBox(d); chaseBox(d); }
        return () => d.stop();
    }, [round]);

    return (
        <svg ref={svgRef} key={round} className="cc-crew cc-round-scene-art" viewBox="0 0 400 100" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
            <TheatreBoxBack elRef={boxBackRef} />
            <Dinosaur elRef={dinoRef} />
            <Lincoln elRef={lincolnRef} />
            <Earhart elRef={earhartRef} />
            <Cleopatra elRef={cleoRef} />
            <BabeRuth elRef={ruthRef} />
            {scene === 'litter' && <Litter elRef={litterRef} />}
            {scene !== 'litter' && <g ref={litterRef} />}
            <TheatreBoxFront elRef={boxFrontRef} />
            <g ref={frontRef} />
            <Ball elRef={ballRef} />
            <Bubble elRef={bubbleRef} />
        </svg>
    );
}

export function QuizBows() {
    const refs = useRef([]);

    useEffect(() => {
        const dinoIndex = 2;
        const line = [46, 118, 200, 282, 354];
        const actors = refs.current.map((el, i) => ({ x: line[i], y: FLOOR, size: i === dinoIndex ? 0.44 : 0.68, el }));
        actors[dinoIndex].el.style.display = '';
        actors.forEach(place);
        if (reduceMotion()) return undefined;

        const d = makeDirector();
        const bowing = async () => {
            await d.wait(1200);
            while (!d.isDead()) {
                // Down the line, then the dinosaur gets a moment all to itself
                await Promise.all(actors.map(async (a, i) => {
                    if (i === dinoIndex) return;
                    await d.wait(i * 160);
                    a.el.classList.add('quiz-bowing');
                    await d.wait(1600);
                    a.el.classList.remove('quiz-bowing');
                }));
                await d.wait(350);
                actors[dinoIndex].el.classList.add('quiz-bowing');
                await d.wait(1700);
                actors[dinoIndex].el.classList.remove('quiz-bowing');
                await d.wait(500);
            }
        };
        bowing();
        return () => d.stop();
    }, []);

    const ref = (i) => (el) => { refs.current[i] = el; };
    return (
        <svg className="cc-crew cc-round-scene-art" viewBox="0 0 400 100" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
            <Dinosaur elRef={ref(2)} />
            <Lincoln elRef={ref(0)} />
            <BabeRuth elRef={ref(1)} />
            <Cleopatra elRef={ref(3)} />
            <Earhart elRef={ref(4)} />
        </svg>
    );
}
