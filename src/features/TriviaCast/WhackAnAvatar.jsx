import React, { memo, useEffect, useReducer, useRef, useState } from 'react';
import { Avatar } from '../../avatars.jsx';

// 🔨 Whack-an-Avatar: the lobby game on the players' phones (the server side is sockets/whackGame.js).
// The other players' avatars pop up out of nine holes and you tap them before they duck back down. A golden one
// is worth three; tap the skunk and you lose one. The more you whack, the quicker they get. Until someone else
// joins, hamsters pop up for practice. Everything here runs on this phone, so taps never lag; whacks go to the server.

const HOLES = 9;
const AVATAR = 64;
const GOLD_CHANCE = 0.08;
const SKUNK_CHANCE = 0.12;

// How long one stays up, and how soon the next pops up: both shrink as you score
const upTime = (whacks) => Math.max(650, 1450 - whacks * 16) * (0.85 + Math.random() * 0.3);
const popGap = (whacks) => Math.max(360, 860 - whacks * 10) * (0.8 + Math.random() * 0.4);

const Face = memo(({ avatar, name, size }) => <Avatar id={avatar} name={name} size={size} />);

let nextId = 1;

export default function WhackAnAvatar({ socket, roomCode, room }) {
    const players = Object.values(room.players).filter((p) => !p.isCaster && p.isConnected !== false);
    const me = room.players[socket.id];
    const scores = room.whack?.scores || {};
    const myWhacks = scores[me?.name]?.whacks || 0;
    const leaders = Object.values(scores).filter((s) => s.whacks > 0).sort((a, b) => b.whacks - a.whacks).slice(0, 3);

    const [practice, setPractice] = useState(0);    // practice hamsters whacked (only counted here)
    const [gotcha, setGotcha] = useState('');
    const [, render] = useReducer((n) => n + 1, 0);

    // What the pop-up timer needs, always up to date
    const live = useRef({});
    live.current.targets = players.filter((p) => p.id !== socket.id);
    live.current.whacks = myWhacks + practice;

    // The holes live here, not in React state: each pop, duck and whack changes one, then we draw
    const holes = useRef(Array(HOLES).fill(null));

    useEffect(() => {
        let alive = true;
        const timers = new Set();
        const later = (fn, ms) => {
            const timer = setTimeout(() => { timers.delete(timer); if (alive) fn(); }, ms);
            timers.add(timer);
        };
        let lastTarget = null;

        const pop = () => {
            const free = holes.current.map((h, i) => (h ? -1 : i)).filter((i) => i >= 0);
            if (free.length) {
                const i = free[Math.floor(Math.random() * free.length)];
                const { targets, whacks } = live.current;
                let kind = 'practice';
                let player = null;
                if (targets.length) {
                    const roll = Math.random();
                    kind = roll < SKUNK_CHANCE ? 'skunk' : roll < SKUNK_CHANCE + GOLD_CHANCE ? 'gold' : 'player';
                    if (kind !== 'skunk') {
                        // Someone different from last time, if there's a choice
                        const pool = targets.length > 1 ? targets.filter((t) => t.id !== lastTarget) : targets;
                        player = pool[Math.floor(Math.random() * pool.length)];
                        lastTarget = player.id;
                    }
                }
                const mole = { id: nextId++, kind, player, state: 'up' };
                holes.current[i] = mole;
                render();
                // Not whacked in time: it ducks back down
                later(() => {
                    if (holes.current[i] !== mole || mole.state !== 'up') return;
                    mole.state = 'leaving';
                    render();
                    later(() => { if (holes.current[i] === mole) { holes.current[i] = null; render(); } }, 200);
                }, upTime(whacks));
            }
            later(pop, popGap(live.current.whacks));
        };
        later(pop, 500);
        return () => {
            alive = false;
            timers.forEach(clearTimeout);
        };
    }, [roomCode]);

    // Someone whacked your avatar on their screen
    useEffect(() => {
        let timer;
        const handleGotcha = ({ name }) => {
            setGotcha(`🔨 ${name} whacked you!`);
            clearTimeout(timer);
            timer = setTimeout(() => setGotcha(''), 1400);
        };
        socket.on('whack_gotcha', handleGotcha);
        return () => {
            clearTimeout(timer);
            socket.off('whack_gotcha', handleGotcha);
        };
    }, []);

    const whack = (i) => {
        const mole = holes.current[i];
        if (!mole || mole.state !== 'up') return;
        mole.state = 'whacked';
        if (mole.kind === 'skunk') {
            mole.points = '−1';
            socket.emit('whack_skunk', { roomCode });
            if (navigator.vibrate) navigator.vibrate([40, 40, 40]);
        } else if (mole.kind === 'practice') {
            mole.points = '+1';
            setPractice((n) => n + 1);
            if (navigator.vibrate) navigator.vibrate(12);
        } else {
            mole.points = mole.kind === 'gold' ? '+3' : '+1';
            socket.emit('whack_hit', { roomCode, targetId: mole.player.id, golden: mole.kind === 'gold' });
            if (navigator.vibrate) navigator.vibrate(mole.kind === 'gold' ? [15, 30, 15] : 12);
        }
        render();
        setTimeout(() => { if (holes.current[i] === mole) { holes.current[i] = null; render(); } }, 420);
    };

    const isPractice = live.current.targets.length === 0;
    const shown = isPractice ? practice : myWhacks;

    return (
        <div className="wa-card">
            <div className="wa-header">
                <span className="wa-title">🔨 Whack-an-Avatar</span>
                <span className="wa-score">{shown} {shown === 1 ? 'whack' : 'whacks'}</span>
            </div>

            <div className="wa-field">
                {holes.current.map((mole, i) => (
                    <button
                        key={i}
                        type="button"
                        className="wa-hole"
                        aria-label={mole && mole.state === 'up' ? `Whack ${mole.kind === 'skunk' ? 'the skunk' : mole.player?.name || 'the hamster'}` : 'Empty hole'}
                        onPointerDown={(e) => { e.preventDefault(); whack(i); }}
                        onContextMenu={(e) => e.preventDefault()}
                    >
                        <span className="wa-pit" aria-hidden="true" />
                        <span className="wa-window" aria-hidden="true">
                            {mole && (
                                <span key={mole.id} className={`wa-mole wa-${mole.kind} is-${mole.state}`}>
                                    {mole.kind === 'skunk' && <span className="wa-emoji">🦨</span>}
                                    {mole.kind === 'practice' && <span className="wa-emoji">🐹</span>}
                                    {mole.player && <Face avatar={mole.player.avatar} name={mole.player.name} size={AVATAR} />}
                                </span>
                            )}
                        </span>
                        <span className="wa-lip" aria-hidden="true" />
                        {mole?.state === 'whacked' && (
                            <>
                                <span className="wa-hammer" aria-hidden="true">🔨</span>
                                <span className={`wa-points ${mole.kind === 'skunk' ? 'is-minus' : ''}`} aria-hidden="true">{mole.points}</span>
                            </>
                        )}
                    </button>
                ))}
                {gotcha && <div className="wa-gotcha">{gotcha}</div>}
            </div>

            {isPractice
                ? <div className="wa-hint">Practice round! When friends join, their faces pop up. Golden ones are worth 3, and don't tap the skunk!</div>
                : <div className="wa-hint">Tap them before they duck! ⭐ Gold = 3 · 🦨 Skunk = −1</div>}

            {leaders.length > 0 && (
                <div className="aa-leaders">
                    {leaders.map((s, i) => (
                        <div key={s.name} className={`aa-leader ${s.name === me?.name ? 'is-me' : ''}`}>
                            <span>{['🥇', '🥈', '🥉'][i]}</span>
                            <Face avatar={s.avatar} name={s.name} size={24} />
                            <span className="aa-leader-name">{s.name}</span>
                            <strong>{s.whacks}</strong>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
