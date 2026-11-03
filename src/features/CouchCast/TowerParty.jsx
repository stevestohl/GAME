import React, { useEffect, useRef, useState } from 'react';
import { Avatar } from '../../avatars.jsx';

// 🏗️ Tower Party: the lobby mini-game on the players' phones (the server side is sockets/towerParty.js).
// Everyone builds one tower together: when it's your turn your avatar swings above the top, and you
// tap to drop it. Land it on the block below and the tower grows; miss and it all comes down.

const BLOCK = 46;          // avatar size on the tower (px); the swing width is measured in these
const STAGE = 300;         // the stage's height (px), as in .tp-stage

const LAST_MESSAGES = {
    perfect: (name) => `✨ Perfect drop by ${name}!`,
    landed: (name) => `${name} stacked it!`,
    toppled: (name, height) => `💥 Timber! ${name} knocked it over at ${height} high`,
    skipped: (name) => `${name} let it pass`,
};

// `children`: the Room Leader's start button, right under the game so it can't be scrolled past and forgotten
export default function TowerParty({ socket, roomCode, roomData, children }) {
    const tower = roomData?.tower;
    const players = Object.values(roomData?.players || {})
        .filter((p) => !p.isCaster && p.isConnected !== false)
        .sort((a, b) => a.joinOrder - b.joinOrder);
    const turnPlayer = roomData?.players?.[tower?.turnId];
    const isMyTurn = !!tower?.turnId && tower.turnId === socket.id;

    // My turn: swing my avatar back and forth on this phone's clock, and remember where it is
    const [swingX, setSwingX] = useState(0);
    const swingRef = useRef(0);
    const [dropped, setDropped] = useState(false);
    useEffect(() => {
        setDropped(false);
        if (!isMyTurn || !tower?.swing) return undefined;
        const { period, width } = tower.swing;
        const started = performance.now();
        let frame = requestAnimationFrame(function tick(now) {
            const x = width * Math.sin(((now - started) / 1000 / period) * Math.PI * 2);
            swingRef.current = x;
            setSwingX(x);
            frame = requestAnimationFrame(tick);
        });
        return () => cancelAnimationFrame(frame);
    }, [isMyTurn, tower?.turnNumber]);

    const handleDrop = () => {
        if (!isMyTurn || dropped) return;
        setDropped(true);
        if (navigator.vibrate) navigator.vibrate(20);
        socket.emit('tower_drop', { roomCode, x: swingRef.current });
    };

    if (!tower) return null;

    const blocks = tower.blocks || [];
    // The view follows the top of the tower, leaving room above it for the swinging avatar
    const scroll = Math.max(0, (blocks.length + 2) * BLOCK - STAGE);
    const swingBottom = (blocks.length + 0.6) * BLOCK - scroll;
    const last = tower.last && roomData.players
        ? Object.values(roomData.players).find((p) => p.id === tower.last.playerId)
        : null;
    const lastLine = tower.last && LAST_MESSAGES[tower.last.type]
        ? LAST_MESSAGES[tower.last.type](last?.name || 'Someone', tower.last.height)
        : 'Take turns dropping your avatar. Stack it as high as you can, together!';

    return (
        <div className="tp-card">
            <div className="tp-header">
                <span className="tp-title">🏗️ Tower Party</span>
                <span className="tp-score">{blocks.length} high · best {tower.best}</span>
            </div>

            <button
                type="button"
                className={`tp-stage ${isMyTurn && !dropped ? 'is-my-turn' : ''}`}
                onClick={handleDrop}
                disabled={!isMyTurn || dropped}
                aria-label={isMyTurn ? 'Drop your avatar on the tower' : 'The team tower'}
            >
                {/* The tower, from the ground up */}
                {blocks.map((block, i) => (
                    <div
                        key={`${tower.towers}-${i}`}
                        className="tp-block"
                        style={{ bottom: i * BLOCK - scroll, transform: `translateX(calc(-50% + ${block.x * BLOCK}px))` }}
                    >
                        {/* The name too: with no (or an unknown) avatar it shows their initial */}
                        <Avatar id={block.avatar} name={block.name} size={BLOCK} />
                    </div>
                ))}
                {scroll === 0 && <div className="tp-ground" />}

                {/* Whoever's turn it is, swinging above the top */}
                {turnPlayer && (
                    isMyTurn ? (
                        !dropped && (
                            <div className="tp-block tp-swinger" style={{ bottom: swingBottom, transform: `translateX(calc(-50% + ${swingX * BLOCK}px))` }}>
                                <Avatar id={turnPlayer.avatar} name={turnPlayer.name} size={BLOCK} />
                            </div>
                        )
                    ) : (
                        <div className="tp-block tp-swinger tp-swing-demo" style={{ bottom: swingBottom }}>
                            <Avatar id={turnPlayer.avatar} name={turnPlayer.name} size={BLOCK} />
                        </div>
                    )
                )}
            </button>

            {children && <div className="tp-start">{children}</div>}

            <div className={`tp-turn ${isMyTurn && !dropped ? 'is-my-turn' : ''}`}>
                {isMyTurn && !dropped && 'Your turn! Tap to drop 👇'}
                {isMyTurn && dropped && 'Dropping...'}
                {!isMyTurn && turnPlayer && `${turnPlayer.name} is dropping...`}
            </div>
            <div className="tp-last">{lastLine}</div>

            {/* Everyone who's joined: more players, more turns */}
            <div className="tp-team">
                {players.map((p) => (
                    <div key={p.id} className={`tp-teammate ${p.id === tower.turnId ? 'is-up' : ''}`} title={p.name}>
                        <Avatar id={p.avatar} name={p.name} size={30} />
                        <span>{p.name}</span>
                    </div>
                ))}
            </div>
            <div className="tp-hint">Get everyone to join: the more of you, the taller the tower!</div>
        </div>
    );
}
