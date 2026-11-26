import React, { useEffect, useRef } from 'react';
import { Robot, Dog, Alien, Cat, INK } from './CouchCrew.jsx';
import { Witch, HoaPresident, Vampire, Ghost } from './HalloweenCrew.jsx';
import { HolidayRobot, HolidayDog, HolidayAlien, HolidayCat } from './HolidayCrew.jsx';
import { DiscoDuke, MulletMitch, AerobicsAngie, Pixel } from './JeffCrew.jsx';

// 🐈 Between rounds (Core deck): along the bottom of the "Round 3" card, one of the crew deals with
// the cat, taking turns round by round:
//   robot: its belly hatch opens, a grabber claw reels the cat in, and off it clanks
//   dog:   barks, and chases the cat off the screen
//   alien: shrink-rays the cat, which ends up riding off on its head
// 👻 On the Halloween deck it's a tiny ghost:
//   hoa:     "VIOLATION!", and the ghost slinks off with a ticket stuck to it
//   vampire: "BLEH!", and chases it off the screen
//   witch:   shrinks it with her wand, and it rides off on her hat
// 🎄 The Holiday deck plays the Core deck's scenes, with everyone in their holiday clothes.
// 📼 On the Jeffinitely deck it's Pixel, the keychain pet, beeping at whoever turns up:
//   duke:  "GET DOWN!", a disco point, and he chases it off the screen in his platform shoes
//   mitch: "BOGUS!", and he blows on it like a dusty cartridge, which blows it clean off the screen
//   angie: "AND HOP!": it hops along with her workout, then jumps up into her hair and rides off
//
// Drawn in a fixed 400 × 100 strip (it scales to fit); the floor is at y = 96.
// The TV waits SCENE_MS for it before moving on to the prompts.

export const SCENE_MS = 5600;
const FLOOR = 96;
const S = 0.78;          // the crew's size here
const CAT = 0.7;         // the cat's size

const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
const easeOut = (t) => 1 - (1 - t) ** 3;
const linear = (t) => t;

const SCENES = {
    core: ['robot', 'dog', 'alien'],
    holiday: ['robot', 'dog', 'alien'],
    halloween: ['hoa', 'vampire', 'witch'],
    jeffinitely: ['duke', 'mitch', 'angie'],
};
/** Which of the crew has the cat this round (round 2 is the first one with an intro) */
// (a deck without its own round scenes gets the core crew's)
export const sceneFor = (round, theme = 'core') => {
    const scenes = SCENES[theme] || SCENES.core;
    return scenes[(Math.max(2, round) - 2) % scenes.length];
};

const HEROES = {
    robot: Robot, dog: Dog, alien: Alien,
    hoa: HoaPresident, vampire: Vampire, witch: Witch,
    duke: DiscoDuke, mitch: MulletMitch, angie: AerobicsAngie,
};
const HOLIDAY_HEROES = { robot: HolidayRobot, dog: HolidayDog, alien: HolidayAlien };
const BARKS = { dog: 'WOOF!', vampire: 'BLEH!', hoa: 'VIOLATION!', duke: 'GET DOWN!', mitch: 'BOGUS!', angie: 'AND HOP!' };
// Where the speech bubble sits, from the speaker's feet (in their drawing's units): clear of the big hair
const BUBBLE_AT = { hoa: [30, 104], duke: [24, 130], mitch: [24, 112], angie: [22, 134] };
/** The speech bubble's outline, `width` wide (its tail points down and left, at the speaker) */
export const bubblePath = (width = 40) => `M -4 -14 H ${width} a 6 6 0 0 1 6 6 V 6 a 6 6 0 0 1 -6 6 H 8 L -2 20 L 0 12 H -4 a 6 6 0 0 1 -6 -6 V -8 a 6 6 0 0 1 6 -6 Z`;
/** How wide a bubble `text` needs */
export const bubbleWidth = (text) => Math.max(40, Math.round(text.length * 8.2));

export default function RoundCatScene({ round, theme = 'core' }) {
    const isHalloween = theme === 'halloween';
    const who = sceneFor(round, theme);
    const svgRef = useRef(null);
    const heroRef = useRef(null);
    const catRef = useRef(null);
    const clawRef = useRef(null);
    const barkRef = useRef(null);
    const rayRef = useRef(null);
    const ticketRef = useRef(null);
    const gustRef = useRef(null);

    useEffect(() => {
        if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;
        const frames = new Set();
        const timers = new Set();
        let dead = false;

        // Just past the screen's real edges: the strip is wider than 400 units on a widescreen TV
        const box = svgRef.current.getBoundingClientRect();
        const extra = box.height ? Math.max(0, (box.width / (box.height / 100) - 400) / 2) : 0;
        const OFF_L = -extra - 45;
        const OFF_R = 400 + extra + 45;

        const hero = { x: OFF_R, y: FLOOR, rot: 0, lift: 0, size: S, flip: 1, el: heroRef.current };
        const cat = { x: OFF_L, y: FLOOR, rot: 0, lift: 0, size: CAT, flip: -1, el: catRef.current };
        const draw = (a) => a.el.setAttribute('transform',
            `translate(${a.x} ${a.y - a.lift}) rotate(${a.rot}) scale(${a.flip * a.size} ${a.size})`);
        const look = (where) => hero.el.setAttribute('data-look', where);

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
        const walk = async (a, x, ms, gait = 'crew-walking') => {
            const from = a.x;
            if (a === cat) a.flip = x < from ? 1 : -1;   // the cat is drawn side-on, facing left
            else look(x < from ? 'left' : 'right');
            a.el.classList.add(gait);
            await tween(ms, linear, (t) => { a.x = from + (x - from) * t; draw(a); });
            a.el.classList.remove(gait);
        };
        // The cat's middle, for grabbing and zapping
        const catMiddle = () => ({ x: cat.x + 4 * cat.size * cat.flip, y: cat.y - 20 * cat.size });
        const bubble = barkRef.current;
        const say = () => {
            const [dx, dy] = BUBBLE_AT[who] || [16, 104];
            bubble.setAttribute('transform', `translate(${hero.x + dx * S} ${hero.y - dy * S}) scale(${S})`);
            bubble.classList.add('is-on');
        };
        const hush = () => bubble.classList.remove('is-on');
        // 📼 Pixel beeps at whoever's coming (Jeffinitely)
        const beep = (on) => cat.el.classList.toggle('crew-cat-swat', on);

        // 🤖 Belly hatch, grabber claw, clank away
        const robotScene = async () => {
            await Promise.all([walk(cat, 175, 1300), wait(300).then(() => walk(hero, 255, 1400))]);
            look('left');
            await wait(200);
            hero.el.classList.add('hatch-open');
            await wait(350);
            const hatch = { x: hero.x, y: hero.y - 38 * S };
            const claw = clawRef.current;
            const reach = (tip) => {
                claw.querySelectorAll('line').forEach((line) => {
                    line.setAttribute('x1', hatch.x);
                    line.setAttribute('y1', hatch.y);
                    line.setAttribute('x2', tip.x);
                    line.setAttribute('y2', tip.y);
                });
                claw.querySelector('.rcs-claw-head').setAttribute('transform', `translate(${tip.x} ${tip.y})`);
            };
            const grab = catMiddle();
            claw.classList.add('is-on');
            await tween(400, easeOut, (t) => reach({ x: hatch.x + (grab.x - hatch.x) * t, y: hatch.y + (grab.y - hatch.y) * t }));
            claw.classList.add('is-closed');
            cat.el.classList.add('crew-running');   // legs going
            await wait(150);
            await tween(550, easeInOut, (t) => {
                const tip = { x: grab.x + (hatch.x - grab.x) * t, y: grab.y + (hatch.y - grab.y) * t };
                reach(tip);
                cat.size = CAT * (1 - 0.6 * t);
                cat.x = tip.x - 4 * cat.size * cat.flip;
                cat.y = tip.y + 20 * cat.size;
                cat.rot = Math.sin(t * Math.PI * 3) * 20;
                draw(cat);
            });
            cat.el.style.opacity = 0;
            claw.classList.remove('is-on', 'is-closed');
            hero.el.classList.remove('hatch-open');
            await wait(350);
            hero.el.classList.add('belly-rattle');
            await walk(hero, OFF_R, 1500);
        };

        // 📋 VIOLATION! A ticket lands on the ghost, and it slinks away, wearing it
        const hoaScene = async () => {
            await Promise.all([walk(cat, 150, 1200), wait(200).then(() => walk(hero, 255, 1200))]);
            look('left');
            await wait(150);
            say();
            await wait(600);
            const ticket = ticketRef.current;
            const from = { x: hero.x - 20 * S, y: hero.y - 45 * S };
            const stick = () => ({ x: cat.x, y: cat.y - 22 * cat.size });
            ticket.classList.add('is-on');
            const to = stick();
            await tween(420, easeOut, (t) => ticket.setAttribute('transform',
                `translate(${from.x + (to.x - from.x) * t} ${from.y + (to.y - from.y) * t - Math.sin(Math.PI * t) * 26}) rotate(${t * 360})`));
            hush();
            await wait(300);
            // Off it goes, head down, and off goes the president the other way
            cat.rot = -10;
            const fromCat = cat.x;
            await Promise.all([
                tween(1500, linear, (t) => {
                    cat.x = fromCat + (OFF_L - fromCat) * t;
                    draw(cat);
                    const at = stick();
                    ticket.setAttribute('transform', `translate(${at.x} ${at.y}) rotate(-10)`);
                }),
                wait(250).then(() => walk(hero, OFF_R, 1250)),
            ]);
        };

        // 🐕 WOOF! and away (🕺 Duke points at the sky first)
        const dogScene = async () => {
            await Promise.all([walk(cat, 190, 1200).then(() => beep(true)), wait(200).then(() => walk(hero, 285, 1300))]);
            look('left');
            await wait(200);
            say();
            if (who === 'duke') hero.el.classList.add('crew-bumping');
            await wait(700);
            hush();
            hero.el.classList.remove('crew-bumping');
            beep(false);
            await tween(260, linear, (t) => { cat.lift = Math.sin(Math.PI * t) * 12; draw(cat); });
            hero.rot = -8;   // leaning into the chase
            await Promise.all([
                walk(cat, OFF_L, 700, 'crew-running'),
                wait(150).then(() => walk(hero, OFF_L - 20, 1000, 'crew-running')),
            ]);
        };

        // 👽 Shrink ray, and a tiny cat riding home on its head
        const alienScene = async () => {
            await Promise.all([walk(cat, 165, 1200), wait(200).then(() => walk(hero, 280, 1300))]);
            look('left');
            await wait(250);
            const ray = rayRef.current;
            // The alien's hand, or the tip of the witch's raised wand
            if (who === 'witch') hero.el.classList.add('crew-casting');
            if (who === 'witch') await wait(300);
            const from = who === 'witch' ? { x: hero.x - 42 * S, y: hero.y - 81 * S } : { x: hero.x - 19 * S, y: hero.y - 32 * S };
            ray.classList.add('is-on');
            await tween(700, linear, (t) => {
                const to = catMiddle();
                // A zig-zag of zap from the alien's hand to the cat
                const pts = [0, 1, 2, 3, 4, 5].map((i) => {
                    const k = i / 5;
                    const wiggle = i % 5 ? Math.sin(t * 40 + i * 2) * 4 : 0;
                    return `${from.x + (to.x - from.x) * k},${from.y + (to.y - from.y) * k + wiggle}`;
                });
                ray.setAttribute('points', pts.join(' '));
                cat.size = CAT * (1 - 0.7 * t);
                cat.rot = t * 360;
                draw(cat);
            });
            ray.classList.remove('is-on');
            hero.el.classList.remove('crew-casting');
            cat.rot = 0;
            // Float up and plonk down on top of its head
            const start = { x: cat.x, y: cat.y };
            const perch = () => (who === 'witch' ? { x: hero.x - 1, y: hero.y - 110 * S } : { x: hero.x + 3 * cat.size, y: hero.y - 104 * S });
            await tween(600, easeInOut, (t) => {
                const end = perch();
                cat.x = start.x + (end.x - start.x) * t;
                cat.y = start.y + (end.y - start.y) * t - Math.sin(Math.PI * t) * 20;
                draw(cat);
            });
            cat.flip = -1;
            await wait(250);
            // Off it goes, cat and all
            const fromX = hero.x;
            hero.el.classList.add('crew-walking');
            look('right');
            await tween(1500, linear, (t) => {
                hero.x = fromX + (OFF_R - fromX) * t;
                draw(hero);
                const p = perch();
                cat.x = p.x;
                cat.y = p.y;
                draw(cat);
            });
        };

        // 🕹️ BOGUS! He blows on it like a dusty cartridge, and it tumbles away on the gust
        const blowScene = async () => {
            await Promise.all([walk(cat, 175, 1200).then(() => beep(true)), wait(200).then(() => walk(hero, 262, 1250))]);
            look('left');
            await wait(150);
            say();
            await wait(650);
            hush();
            hero.el.classList.add('crew-blowing');
            await wait(250);   // the puffs start coming
            // A gust of wind, from the end of the cartridge down to Pixel
            const gust = gustRef.current;
            const blowFrom = { x: hero.x - 70 * S, y: hero.y - 72 * S };   // (the streaks trail off to the right)
            const gustAt = (x, y, fade = 1) => {
                gust.setAttribute('transform', `translate(${x} ${y}) scale(${S})`);
                gust.style.opacity = fade;
            };
            const target = { x: cat.x + 14 * cat.size, y: cat.y - 20 * cat.size };
            await tween(450, easeOut, (t) => gustAt(blowFrom.x + (target.x - blowFrom.x) * t, blowFrom.y + (target.y - blowFrom.y) * t, Math.min(1, t * 3)));
            beep(false);
            // It digs in for a moment...
            await tween(300, linear, (t) => {
                cat.rot = Math.sin(t * Math.PI * 4) * 8;
                draw(cat);
                gustAt(target.x + Math.sin(t * Math.PI * 6) * 2, target.y);
            });
            // ...then off it goes, end over end, on the gust
            cat.el.classList.add('crew-running');
            const fromCat = cat.x;
            await tween(950, (t) => t * t, (t) => {
                cat.x = fromCat + (OFF_L - fromCat) * t;
                cat.lift = Math.sin(Math.PI * Math.min(1, t * 1.4)) * 22;
                cat.rot = -540 * t;
                draw(cat);
                gustAt(cat.x + 14 * cat.size, cat.y - cat.lift - 20 * cat.size, 1 - t);
            });
            hero.el.classList.remove('crew-blowing');
            await wait(150);
            await walk(hero, OFF_R, 1100);
        };

        // 🤸 AND HOP! It hops along with her workout, then jumps up into her hair for the jog home
        const hopScene = async () => {
            await Promise.all([walk(cat, 168, 1200).then(() => beep(true)), wait(150).then(() => walk(hero, 268, 1300, 'crew-running'))]);
            look('left');
            await wait(150);
            say();
            beep(false);
            for (let i = 0; i < 3; i++) {
                await tween(380, linear, (t) => {
                    hero.lift = Math.sin(Math.PI * t) * 12;
                    cat.lift = Math.sin(Math.PI * Math.max(0, t * 1.15 - 0.15)) * 9;   // a beat behind her
                    draw(hero);
                    draw(cat);
                });
            }
            hush();
            await wait(150);
            // Up into the hair, getting smaller as it goes up (it's further away, honest)
            const start = { x: cat.x, y: cat.y };
            const perch = () => ({ x: hero.x, y: hero.y - hero.lift - 119 * S });
            await tween(650, easeInOut, (t) => {
                const end = perch();
                cat.x = start.x + (end.x - start.x) * t;
                cat.y = start.y + (end.y - start.y) * t - Math.sin(Math.PI * t) * 26;
                cat.size = CAT * (1 - 0.3 * t);
                draw(cat);
            });
            cat.flip = -1;
            await wait(250);
            // Jogging off, with a passenger
            const fromX = hero.x;
            hero.el.classList.add('crew-running');
            look('right');
            await tween(1300, linear, (t) => {
                hero.x = fromX + (OFF_R - fromX) * t;
                draw(hero);
                const p = perch();
                cat.x = p.x;
                cat.y = p.y;
                draw(cat);
            });
        };

        draw(hero);
        draw(cat);
        ({
            robot: robotScene, dog: dogScene, alien: alienScene,
            hoa: hoaScene, vampire: dogScene, witch: alienScene,
            duke: dogScene, mitch: blowScene, angie: hopScene,
        })[who]();

        return () => {
            dead = true;
            frames.forEach((id) => cancelAnimationFrame(id));
            timers.forEach((id) => clearTimeout(id));
        };
    }, [round]);

    const isHoliday = theme === 'holiday';
    const Hero = (isHoliday ? HOLIDAY_HEROES : HEROES)[who];
    const Pest = isHalloween ? Ghost : isHoliday ? HolidayCat : theme === 'jeffinitely' ? Pixel : Cat;
    const bark = BARKS[who] || '';
    const barkWidth = bubbleWidth(bark);
    return (
        <svg ref={svgRef} className={`cc-crew cc-round-scene-art ${isHalloween ? 'cc-crew-halloween' : ''}`} viewBox="0 0 400 100" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
            <polyline ref={rayRef} className="rcs-ray" points="0,0" />
            <Pest elRef={catRef} />
            <Hero elRef={heroRef} />
            {/* 💨 Mitch's gust: streaks of wind, blowing to the left */}
            <g ref={gustRef} className="rcs-gust" style={{ opacity: 0 }}>
                {[[-6, 0, 36], [0, 4, 28], [6, -3, 34]].map(([y, x, len]) => (
                    <path key={y} d={`M ${x} ${y} q ${len / 6} -3 ${len / 3} 0 t ${len / 3} 0 t ${len / 3} 0`} fill="none" stroke="#fff" strokeWidth={2.2} strokeLinecap="round" />
                ))}
            </g>
            <g ref={ticketRef} className="rcs-ticket">
                <rect x={-5} y={-6.5} width={10} height={13} fill="#fff6d8" stroke={INK} strokeWidth={1.2} />
                <path d="M -3 -3.5 h 6 M -3 -0.5 h 6 M -3 2.5 h 4" stroke="#b5332f" strokeWidth={1} />
            </g>
            <g ref={clawRef} className="rcs-claw">
                <line stroke="#9fb0c3" strokeWidth={2.4} strokeLinecap="round" />
                <line stroke={INK} strokeWidth={0.8} strokeDasharray="1.5 2" />
                <g className="rcs-claw-head">
                    <path className="rcs-claw-l" d="M 0 0 L -4 -4 L -6 0" fill="none" stroke={INK} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
                    <path className="rcs-claw-r" d="M 0 0 L -4 4 L -6 0" fill="none" stroke={INK} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
                </g>
            </g>
            <g ref={barkRef} className="crew-bark">
                <path d={bubblePath(barkWidth)} fill="#fff" stroke={INK} strokeWidth={2.4} strokeLinejoin="round" />
                <text x={(barkWidth - 4) / 2} y={4} textAnchor="middle" fontSize={13} fontWeight={900} fill={INK} fontFamily="system-ui, sans-serif">{bark}</text>
            </g>
        </svg>
    );
}
