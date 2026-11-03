import React, { memo, useEffect, useRef, useState } from 'react';
import { Avatar } from '../../avatars.jsx';
import { startCreditsMarch } from '../../celebrationSounds.js';

// 🐍 Snake Snack: the lobby game on the players' phones (the server side is sockets/snakeGame.js).
// Swipe on the board to steer. Eat the other players' avatars to grow; the edges wrap around, so the only way
// to die is to bite yourself. Until someone else joins, apples stand in for practice.
// The board is local to this phone, so the controls never lag; only what's eaten goes to the server.

const COLS = 13;
const STAGE_HEIGHT = 340;      // px, about: it's trimmed to a whole number of rows
const START_LENGTH = 4;
const GROW_BY = 2;
const FOOD_COUNT = 3;
const SWIPE_PX = 16;           // a finger moves this far and that's a swipe
const MAX_TURNS_QUEUED = 2;
const DEAD_MS = 1400;

const UP = { x: 0, y: -1 };
const DOWN = { x: 0, y: 1 };
const LEFT = { x: -1, y: 0 };
const RIGHT = { x: 1, y: 0 };
const KEYS = { ArrowUp: UP, ArrowDown: DOWN, ArrowLeft: LEFT, ArrowRight: RIGHT };

// The longer you are, the faster you go
const stepMs = (length) => Math.max(95, 175 - length * 2);

const Face = memo(({ avatar, name, size }) => <Avatar id={avatar} name={name} size={size} />);

let nextId = 1;

export default function SnakeSnack({ socket, roomCode, room }) {
    const players = Object.values(room.players).filter((p) => !p.isCaster && p.isConnected !== false);
    const me = room.players[socket.id];
    const scores = room.snake?.scores || {};
    const myEaten = scores[me?.name]?.eaten || 0;
    const leaders = Object.values(scores).filter((s) => s.eaten > 0).sort((a, b) => b.eaten - a.eaten).slice(0, 3);

    const stageRef = useRef(null);
    const [, setFrame] = useState(0);
    const [gotcha, setGotcha] = useState('');
    const [size, setSize] = useState({ cell: 0, rows: 0 });

    const live = useRef({});
    live.current.targets = players.filter((p) => p.id !== socket.id);

    // The game itself lives in here, not in React state
    const game = useRef({ body: [], dir: UP, turns: [], grow: 0, foods: [], deadUntil: 0, hasSwiped: false, lastTarget: null });
    const g = game.current;

    const restart = (rows) => {
        const x = Math.floor(COLS / 2);
        const y = Math.floor(rows / 2);
        g.body = Array.from({ length: START_LENGTH }, (_, i) => ({ x, y: (y + i) % rows }));
        g.dir = UP;
        g.turns = [];
        g.grow = 0;
    };

    const steer = (dir) => {
        g.hasSwiped = true;
        const last = g.turns[g.turns.length - 1] || g.dir;
        if ((dir.x === last.x && dir.y === last.y) || (dir.x === -last.x && dir.y === -last.y)) return;   // no U-turns
        if (g.turns.length < MAX_TURNS_QUEUED) g.turns.push(dir);
    };

    // Sized from the phone: the columns fill the width and the rows are as many as fit
    useEffect(() => {
        const measure = () => {
            const width = stageRef.current?.clientWidth || 300;
            const cell = width / COLS;
            const rows = Math.max(8, Math.floor(STAGE_HEIGHT / cell));
            setSize({ cell, rows });
            if (!g.body.length) restart(rows);
            g.rows = rows;
        };
        measure();
        window.addEventListener('resize', measure);
        return () => window.removeEventListener('resize', measure);
    }, []);

    const addFood = () => {
        const { targets } = live.current;
        const pool = targets.length > 1 ? targets.filter((t) => t.id !== g.lastTarget) : targets;
        const player = pool.length ? pool[Math.floor(Math.random() * pool.length)] : null;
        g.lastTarget = player?.id;
        // Somewhere clear, and not right on top of the snake's head
        for (let tries = 0; tries < 40; tries++) {
            const x = Math.floor(Math.random() * COLS);
            const y = Math.floor(Math.random() * g.rows);
            const isClear = !g.body.some((c) => c.x === x && c.y === y) && !g.foods.some((f) => Math.abs(f.x - x) + Math.abs(f.y - y) < 3);
            if (isClear) { g.foods.push({ id: nextId++, x, y, player }); return; }
        }
    };

    const step = (now) => {
        if (now < g.deadUntil) return;
        if (g.deadUntil) {
            // Back in the game, a little shorter
            g.deadUntil = 0;
            restart(g.rows);
        }
        if (g.turns.length) g.dir = g.turns.shift();
        const head = g.body[0];
        const next = { x: (head.x + g.dir.x + COLS) % COLS, y: (head.y + g.dir.y + g.rows) % g.rows };
        const bodyToHit = g.grow > 0 ? g.body : g.body.slice(0, -1);   // the tail's about to move out of the way
        if (bodyToHit.some((c) => c.x === next.x && c.y === next.y)) {
            g.deadUntil = now + DEAD_MS;
            socket.emit('snake_crash', { roomCode, length: g.body.length });
            if (navigator.vibrate) navigator.vibrate(120);
            return;
        }
        g.body.unshift(next);
        if (g.grow > 0) g.grow -= 1;
        else g.body.pop();

        // A bite: the faces are bigger than a square, so anything next to the head counts
        const bite = g.foods.find((f) => Math.abs(f.x - next.x) + Math.abs(f.y - next.y) <= 1);
        if (bite) {
            g.foods = g.foods.filter((f) => f !== bite);
            g.grow += GROW_BY;
            if (bite.player) socket.emit('snake_eat', { roomCode, targetId: bite.player.id, length: g.body.length + g.grow });
            if (navigator.vibrate) navigator.vibrate(15);
        }
        while (g.foods.length < FOOD_COUNT) addFood();
    };

    useEffect(() => {
        let frame;
        let nextStep = 0;
        const tick = (now) => {
            if (g.rows && now >= nextStep) {
                step(now);
                nextStep = now + stepMs(g.body.length);
                setFrame(now);
            }
            frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frame);
    }, [roomCode]);

    // ☝️ Swiping. These are added by hand because the page must not scroll while a finger's on the board.
    useEffect(() => {
        const stage = stageRef.current;
        let from = null;
        const onStart = (e) => {
            const touch = e.touches[0];
            from = { x: touch.clientX, y: touch.clientY };
        };
        const onMove = (e) => {
            e.preventDefault();
            if (!from) return;
            const touch = e.touches[0];
            const dx = touch.clientX - from.x;
            const dy = touch.clientY - from.y;
            if (Math.max(Math.abs(dx), Math.abs(dy)) < SWIPE_PX) return;
            if (Math.abs(dx) > Math.abs(dy)) steer(dx > 0 ? RIGHT : LEFT);
            else steer(dy > 0 ? DOWN : UP);
            from = { x: touch.clientX, y: touch.clientY };   // keep the finger down and swipe again
        };
        stage.addEventListener('touchstart', onStart, { passive: true });
        stage.addEventListener('touchmove', onMove, { passive: false });
        // On a computer, the arrow keys
        const onKey = (e) => {
            if (!KEYS[e.key]) return;
            e.preventDefault();
            steer(KEYS[e.key]);
        };
        window.addEventListener('keydown', onKey);
        return () => {
            stage.removeEventListener('touchstart', onStart);
            stage.removeEventListener('touchmove', onMove);
            window.removeEventListener('keydown', onKey);
        };
    }, []);

    // Someone ate your avatar on their screen
    useEffect(() => {
        let timer;
        const handleGotcha = ({ name }) => {
            setGotcha(`😋 ${name} ate you!`);
            clearTimeout(timer);
            timer = setTimeout(() => setGotcha(''), 1400);
        };
        socket.on('snake_gotcha', handleGotcha);
        return () => {
            clearTimeout(timer);
            socket.off('snake_gotcha', handleGotcha);
        };
    }, []);

    const { cell, rows } = size;
    const foodSize = Math.round(cell * 1.7);
    const headSize = Math.round(cell * 1.5);
    const isDead = g.deadUntil > 0;
    const at = (x, y, width) => ({ transform: `translate(${(x + 0.5) * cell - width / 2}px, ${(y + 0.5) * cell - width / 2}px)` });

    return (
        <div className="aa-card">
            <div className="aa-header">
                <span className="aa-title">🐍 Snake Snack</span>
                <span className="aa-score">{myEaten} eaten</span>
            </div>

            <div className="sn-stage" ref={stageRef} style={{ height: rows ? rows * cell : STAGE_HEIGHT }}>
                {cell > 0 && g.foods.map((f) => (
                    <div key={f.id} className="sn-thing" style={at(f.x, f.y, foodSize)}>
                        {f.player
                            ? <Face avatar={f.player.avatar} name={f.player.name} size={foodSize} />
                            : <span className="sn-apple" style={{ width: foodSize, lineHeight: `${foodSize}px`, fontSize: foodSize * 0.8 }}>🍎</span>}
                    </div>
                ))}
                {cell > 0 && g.body.slice(1).map((c, i) => (
                    <div key={i} className={`sn-thing sn-seg ${i % 2 ? 'sn-seg-alt' : ''} ${isDead ? 'is-dead' : ''}`} style={{ width: cell, height: cell, ...at(c.x, c.y, cell) }} />
                ))}
                {cell > 0 && g.body[0] && (
                    <div className={`sn-thing sn-head ${isDead ? 'is-dead' : ''}`} style={at(g.body[0].x, g.body[0].y, headSize)}>
                        <Face avatar={me?.avatar} name={me?.name} size={headSize} />
                    </div>
                )}
                {gotcha && <div className="aa-gotcha">{gotcha}</div>}
                {isDead && <div className="sn-message">💥 You ate yourself!</div>}
                {!isDead && !g.hasSwiped && <div className="aa-hint">Swipe to steer! Go off one edge and you come back on the other. Just don't bite yourself.</div>}
                {!isDead && g.hasSwiped && players.length < 2 && <div className="aa-hint">Practice round! When friends join, you can eat their faces.</div>}
            </div>

            {leaders.length > 0 && (
                <div className="aa-leaders">
                    {leaders.map((s, i) => (
                        <div key={s.name} className={`aa-leader ${s.name === me?.name ? 'is-me' : ''}`}>
                            <span>{['🥇', '🥈', '🥉'][i]}</span>
                            <Face avatar={s.avatar} name={s.name} size={24} />
                            <span className="aa-leader-name">{s.name}</span>
                            <strong>{s.eaten}</strong>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

/** 🎬 After the final scores are read: the lobby game's results roll up the TV, to a march. Nobody played? No credits. */
export function SnakeCredits({ snake, onDone }) {
    const players = Object.values(snake?.scores || {})
        .filter((s) => s.eaten > 0 || s.crashes > 0)
        .sort((a, b) => b.eaten - a.eaten || b.longest - a.longest);
    const hasPlayers = players.length > 0;

    useEffect(() => {
        if (!hasPlayers) { onDone?.(); return undefined; }
        return startCreditsMarch();
    }, [hasPlayers]);
    if (!hasPlayers) return null;

    const longest = players.reduce((best, s) => (s.longest > best.longest ? s : best), players[0]);
    return (
        <div className="tp-credits" aria-live="polite">
            <div className="tp-credits-roll" style={{ animationDuration: `${12 + players.length * 2}s` }} onAnimationEnd={onDone}>
                <div className="tp-credits-kicker">And in the lobby...</div>
                <h2>🐍 Snake Snack</h2>
                <div className="tp-credits-best">Biggest appetite: <strong>{players[0].name}</strong></div>
                {longest.longest > 0 && <div className="tp-credits-sub">Longest snake: {longest.name}, {longest.longest} long</div>}
                <div className="tp-credits-heading">Final scores</div>
                {players.map((s) => (
                    <div key={s.name} className="tp-credits-line">
                        <Avatar id={s.avatar} name={s.name} size={44} />
                        <span className="tp-credits-name">{s.name}</span>
                        <span className="tp-credits-role">
                            ate {s.eaten}{s.timesEaten ? ` · eaten ${s.timesEaten}` : ''}{s.crashes ? ` · bit self ${s.crashes}` : ''}
                        </span>
                    </div>
                ))}
                <div className="tp-credits-end">Thanks for playing!</div>
            </div>
        </div>
    );
}
