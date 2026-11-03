import React, { memo, useEffect, useRef, useState } from 'react';
import { Avatar } from '../../avatars.jsx';

// 👾 Avatar Attack: the lobby game on the players' phones (the server side is sockets/avatarAttack.js).
// The other players' avatars fall from the top, you slide along the bottom with the arrows and tap your
// own avatar to fire. Most hits leads the room. Until someone else joins, little aliens stand in for practice.
// Everything falling is local to this phone, so the controls never lag; only hits go to the server.

const STAGE_HEIGHT = 300;   // px, as in .aa-stage
const ALIEN = 44;           // px
const SHIP = 40;
const BULLET_SPEED = 430;   // px a second
const MOVE_SPEED = 240;
const FIRE_GAP = 230;       // ms between shots
const MAX_BULLETS = 3;
const MAX_ALIENS = 8;

// The more hits you've got, the faster and thicker they come
const spawnGap = (hits) => Math.max(520, 1500 - hits * 25);
const fallSpeed = (hits) => Math.min(190, 55 + hits * 3) * (0.85 + Math.random() * 0.3);

const Face = memo(({ avatar, name, size }) => <Avatar id={avatar} name={name} size={size} />);

let nextId = 1;

export default function AvatarAttack({ socket, roomCode, room }) {
    const players = Object.values(room.players).filter((p) => !p.isCaster && p.isConnected !== false);
    const me = room.players[socket.id];
    const scores = room.attack?.scores || {};
    const myHits = scores[me?.name]?.hits || 0;
    const leaders = Object.values(scores).filter((s) => s.hits > 0).sort((a, b) => b.hits - a.hits).slice(0, 3);

    const stageRef = useRef(null);
    const [, setFrame] = useState(0);
    const [gotcha, setGotcha] = useState('');

    // What the game loop needs, always up to date
    const live = useRef({});
    live.current.targets = players.filter((p) => p.id !== socket.id);
    live.current.hits = myHits;

    // The game itself lives in here, not in React state: it changes 60 times a second
    const game = useRef({ x: null, move: 0, firing: false, lastShot: 0, nextSpawn: 0, bullets: [], aliens: [], booms: [] });

    const fire = (now) => {
        const g = game.current;
        if (now - g.lastShot < FIRE_GAP || g.bullets.length >= MAX_BULLETS) return;
        g.lastShot = now;
        g.bullets.push({ id: nextId++, x: g.x, y: STAGE_HEIGHT - SHIP - 4 });
        if (navigator.vibrate) navigator.vibrate(8);
    };

    useEffect(() => {
        let frame;
        let last = performance.now();
        const tick = (now) => {
            const g = game.current;
            const width = stageRef.current?.clientWidth || 300;
            const dt = Math.min(0.05, (now - last) / 1000);
            last = now;
            if (g.x === null) g.x = width / 2;

            g.x = Math.max(SHIP / 2, Math.min(width - SHIP / 2, g.x + g.move * MOVE_SPEED * dt));
            if (g.firing) fire(now);

            // Someone new drops in (always someone different from the last one, if there's a choice)
            if (now >= g.nextSpawn && g.aliens.length < MAX_ALIENS) {
                const { targets, hits } = live.current;
                const pool = targets.length > 1 ? targets.filter((t) => t.id !== g.lastTarget) : targets;
                const target = pool.length ? pool[Math.floor(Math.random() * pool.length)] : null;
                g.lastTarget = target?.id;
                g.aliens.push({
                    id: nextId++,
                    player: target,
                    baseX: ALIEN / 2 + 14 + Math.random() * Math.max(0, width - ALIEN - 28),
                    y: -ALIEN,
                    speed: fallSpeed(hits),
                    phase: Math.random() * Math.PI * 2,
                });
                g.nextSpawn = now + spawnGap(hits);
            }

            g.bullets.forEach((b) => { b.y -= BULLET_SPEED * dt; });
            g.bullets = g.bullets.filter((b) => b.y > -12);

            g.aliens.forEach((a) => {
                a.y += a.speed * dt;
                a.x = a.baseX + Math.sin(now / 500 + a.phase) * 14;
            });

            // Hits
            g.bullets = g.bullets.filter((b) => {
                const hit = g.aliens.find((a) => Math.abs(a.x - b.x) < ALIEN / 2 + 4 && Math.abs(a.y + ALIEN / 2 - b.y) < ALIEN / 2 + 4);
                if (!hit) return true;
                g.aliens = g.aliens.filter((a) => a !== hit);
                g.booms.push({ id: nextId++, x: hit.x, y: hit.y + ALIEN / 2, born: now });
                if (hit.player) socket.emit('attack_hit', { roomCode, targetId: hit.player.id });
                return false;
            });

            g.aliens = g.aliens.filter((a) => a.y < STAGE_HEIGHT);
            g.booms = g.booms.filter((b) => now - b.born < 350);

            setFrame(now);
            frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frame);
    }, [roomCode]);

    // Someone shot your avatar on their screen
    useEffect(() => {
        let timer;
        const handleGotcha = ({ name }) => {
            setGotcha(`💥 ${name} got you!`);
            clearTimeout(timer);
            timer = setTimeout(() => setGotcha(''), 1400);
        };
        socket.on('attack_gotcha', handleGotcha);
        return () => {
            clearTimeout(timer);
            socket.off('attack_gotcha', handleGotcha);
        };
    }, []);

    // Hold an arrow to slide, hold your avatar to keep firing
    const holdButton = (start, stop) => ({
        onPointerDown: (e) => {
            e.preventDefault();
            e.currentTarget.setPointerCapture?.(e.pointerId);
            start();
        },
        onPointerUp: stop,
        onPointerCancel: stop,
        onContextMenu: (e) => e.preventDefault(),
    });
    const g = game.current;
    const stopMove = () => { g.move = 0; };

    return (
        <div className="aa-card">
            <div className="aa-header">
                <span className="aa-title">👾 Avatar Attack</span>
                <span className="aa-score">{myHits} {myHits === 1 ? 'hit' : 'hits'}</span>
            </div>

            <div className="aa-stage" ref={stageRef}>
                {g.aliens.map((a) => (
                    <div key={a.id} className="aa-thing" style={{ transform: `translate(${a.x - ALIEN / 2}px, ${a.y}px)` }}>
                        {a.player
                            ? <Face avatar={a.player.avatar} name={a.player.name} size={ALIEN} />
                            : <span className="aa-standin">👾</span>}
                    </div>
                ))}
                {g.bullets.map((b) => <div key={b.id} className="aa-bullet" style={{ transform: `translate(${b.x - 2}px, ${b.y}px)` }} />)}
                {g.booms.map((b) => <div key={b.id} className="aa-boom" style={{ transform: `translate(${b.x - 16}px, ${b.y - 16}px)` }}>💥</div>)}
                {g.x !== null && (
                    <div className="aa-thing aa-ship" style={{ transform: `translate(${g.x - SHIP / 2}px, ${STAGE_HEIGHT - SHIP - 4}px)` }}>
                        <Face avatar={me?.avatar} name={me?.name} size={SHIP} />
                    </div>
                )}
                {gotcha && <div className="aa-gotcha">{gotcha}</div>}
                {players.length < 2 && <div className="aa-hint">Practice round! When friends join, their faces start falling.</div>}
            </div>

            <div className="aa-controls">
                <button type="button" className="aa-arrow" aria-label="Move left" {...holdButton(() => { g.move = -1; }, stopMove)}>◀</button>
                <button type="button" className="aa-fire" aria-label="Fire" {...holdButton(() => { g.firing = true; fire(performance.now()); }, () => { g.firing = false; })}>
                    <Face avatar={me?.avatar} name={me?.name} size={72} />
                </button>
                <button type="button" className="aa-arrow" aria-label="Move right" {...holdButton(() => { g.move = 1; }, stopMove)}>▶</button>
            </div>

            {leaders.length > 0 && (
                <div className="aa-leaders">
                    {leaders.map((s, i) => (
                        <div key={s.name} className={`aa-leader ${s.name === me?.name ? 'is-me' : ''}`}>
                            <span>{['🥇', '🥈', '🥉'][i]}</span>
                            <Face avatar={s.avatar} name={s.name} size={24} />
                            <span className="aa-leader-name">{s.name}</span>
                            <strong>{s.hits}</strong>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
