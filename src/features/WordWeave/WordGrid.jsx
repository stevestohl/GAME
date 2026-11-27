import React, { useEffect, useRef } from 'react';

// 🧶 The letter grid, with the thread woven through a word's letters.
// On a phone it's where you weave: slide a finger through letters that touch (and back up to undo), or tap them
// one at a time and tap the last one again to send. On the TV it just shows the grid, and a word's thread.

const touches = (size, a, b) => a !== b
    && Math.abs(Math.floor(a / size) - Math.floor(b / size)) <= 1
    && Math.abs((a % size) - (b % size)) <= 1;

const HIT = 0.4;      // while sliding, a finger has to be this near a letter's middle (of a tile's width), so corners work
const INSET = 0.025;  // the tiles' margin inside the grid, as a share of its width (.ww-tiles in wordweave.css)

/** The thread through some tiles (`tone`: 'trace', 'ok', 'bad' or 'show') */
function Thread({ path, size, tone, drawKey }) {
    if (!path?.length) return null;
    const points = path.map((tile) => `${(tile % size) + 0.5},${Math.floor(tile / size) + 0.5}`).join(' ');
    const [x, y] = points.split(' ')[0].split(',');
    return (
        <svg className={`ww-thread is-${tone}`} viewBox={`0 0 ${size} ${size}`} aria-hidden="true" key={drawKey}>
            {path.length > 1 && (
                <>
                    <polyline className="ww-thread-yarn" points={points} pathLength="1" />
                    <polyline className="ww-thread-stitch" points={points} />
                </>
            )}
            <circle className="ww-thread-knot" cx={x} cy={y} r="0.16" />
        </svg>
    );
}

export default function WordGrid({
    letters, size, path = [], tone = 'trace', drawKey, flash = null,
    interactive = false, disabled = false, onPathChange, onSubmit, minLength = 3, className = '',
}) {
    const boxRef = useRef(null);
    const pathRef = useRef(path);
    const gesture = useRef({ active: false, moved: false, pressedLast: false, tapping: false });
    useEffect(() => {
        pathRef.current = path;
        if (!path.length) gesture.current.tapping = false;
    }, [path]);

    const setPath = (next) => {
        pathRef.current = next;
        onPathChange?.(next);
    };
    const send = (tiles) => {
        gesture.current.tapping = false;
        setPath([]);
        onSubmit?.(tiles);
    };

    // The tile under a finger (`near`: only close to its middle)
    const tileAt = (event, near) => {
        const box = boxRef.current?.getBoundingClientRect();
        if (!box) return null;
        // The tiles sit INSET in from the grid's edge (wordweave.css)
        const edge = box.width * INSET;
        const cell = (box.width - 2 * edge) / size;
        const x = event.clientX - box.left - edge;
        const y = event.clientY - box.top - edge;
        const col = Math.floor(x / cell);
        const row = Math.floor(y / cell);
        if (col < 0 || row < 0 || col >= size || row >= size) return null;
        if (near) {
            const dx = x - (col + 0.5) * cell;
            const dy = y - (row + 0.5) * cell;
            if (dx * dx + dy * dy > (HIT * cell) ** 2) return null;
        }
        return row * size + col;
    };

    const canTouch = interactive && !disabled;

    const handleDown = (event) => {
        if (!canTouch) return;
        const tile = tileAt(event, false);
        if (tile === null) return;
        event.preventDefault();
        try { event.currentTarget.setPointerCapture?.(event.pointerId); } catch { /* not a live pointer: moves still arrive over the grid */ }
        const g = gesture.current;
        const current = pathRef.current;
        const last = current[current.length - 1];
        g.active = true;
        g.moved = false;
        g.pressedLast = false;
        if (g.tapping && current.length) {
            if (tile === last) g.pressedLast = true;
            else if (current.includes(tile)) setPath(current.slice(0, current.indexOf(tile) + 1));
            else if (touches(size, last, tile)) setPath([...current, tile]);
            else setPath([tile]);
        } else {
            setPath([tile]);
        }
    };

    const handleMove = (event) => {
        const g = gesture.current;
        if (!g.active) return;
        const tile = tileAt(event, true);
        if (tile === null) return;
        const current = pathRef.current;
        const last = current[current.length - 1];
        if (tile === last) return;
        if (current.length >= 2 && tile === current[current.length - 2]) {
            setPath(current.slice(0, -1));   // slid back: undo the last letter
            g.moved = true;
        } else if (!current.includes(tile) && touches(size, last, tile)) {
            setPath([...current, tile]);
            g.moved = true;
        }
    };

    const handleUp = () => {
        const g = gesture.current;
        if (!g.active) return;
        g.active = false;
        const current = pathRef.current;
        if (g.moved) {
            // A slide: long enough, it's sent; too short, it stays for tapping on
            if (current.length >= minLength) send(current);
            else g.tapping = true;
            return;
        }
        if (g.pressedLast) {
            // Tapped the last letter again: send it, or (too short) take it back off
            if (current.length >= minLength) send(current);
            else setPath(current.slice(0, -1));
            return;
        }
        g.tapping = true;
    };

    const handleCancel = () => { gesture.current.active = false; };

    const shown = flash?.path?.length ? flash.path : path;
    const shownTone = flash?.path?.length ? (flash.ok ? 'ok' : 'bad') : tone;
    const lit = new Set(shown);
    const lastTile = shown[shown.length - 1];
    // A new grid deals in from the top left corner
    const delay = (i) => `${(Math.floor(i / size) + (i % size)) * 45}ms`;

    return (
        <div
            ref={boxRef}
            className={`ww-grid ww-size-${size} ${canTouch ? 'is-live' : ''} ${disabled ? 'is-disabled' : ''} ${flash && !flash.ok ? 'is-shaking' : ''} ${className}`}
            style={{ '--ww-size': size }}
            role="group"
            aria-label={`Letter grid, ${size} by ${size}`}
            onPointerDown={handleDown}
            onPointerMove={handleMove}
            onPointerUp={handleUp}
            onPointerCancel={handleCancel}
            onContextMenu={(e) => interactive && e.preventDefault()}
        >
            {/* Three layers: the tiles, the thread over them, and the letters on top so the thread never hides one */}
            <div className="ww-tiles" aria-hidden="true">
                {letters.map((letter, i) => (
                    <div
                        key={i}
                        className={`ww-tile ${lit.has(i) ? `is-on is-${shownTone}` : ''} ${i === shown[0] ? 'is-first' : ''} ${i === lastTile ? 'is-last' : ''}`}
                        style={{ '--ww-delay': delay(i) }}
                    />
                ))}
            </div>
            <Thread path={shown} size={size} tone={shownTone} drawKey={flash?.id ?? drawKey} />
            <div className="ww-letters">
                {letters.map((letter, i) => (
                    <span key={i} className="ww-letter" style={{ '--ww-delay': delay(i) }}>{letter}</span>
                ))}
            </div>
        </div>
    );
}
