import React, { useEffect, useRef, useState } from 'react';
import { mixupSocket as socket } from '../../socket.js';

/**
 * ✏️ Pictionary drawing for Temple Mix Up.
 *   DrawingPad  -> the drawer's phone: draw with a finger, the strokes stream to the server
 *   DrawingView -> the TV (and the guessers' phones): the same drawing, appearing live
 *
 * A drawing is a list of strokes: { id, c: color, w: width, p: [[x, y], ...] }, with x, y and the
 * width as fractions of the (square) canvas, so it looks the same on every screen size.
 */

export const PEN_COLORS = ['#222222', '#e63946', '#1d4ed8', '#2a9d43', '#f4a11a', '#8b5cf6', '#8d5524'];
export const PEN_SIZES = [
    { id: 'thin', w: 0.008, label: 'Thin' },
    { id: 'medium', w: 0.018, label: 'Medium' },
    { id: 'thick', w: 0.035, label: 'Thick' },
];
const ERASER = '#ffffff';
const SEND_EVERY_MS = 50;

const drawStroke = (ctx, stroke, size) => {
    const points = stroke.p;
    if (!points.length) return;
    ctx.strokeStyle = stroke.c;
    ctx.fillStyle = stroke.c;
    ctx.lineWidth = Math.max(1, stroke.w * size);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    if (points.length === 1) {
        // A tap is a dot
        ctx.beginPath();
        ctx.arc(points[0][0] * size, points[0][1] * size, ctx.lineWidth / 2, 0, Math.PI * 2);
        ctx.fill();
        return;
    }
    ctx.beginPath();
    ctx.moveTo(points[0][0] * size, points[0][1] * size);
    for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0] * size, points[i][1] * size);
    ctx.stroke();
};

// Keeps a square canvas sharp at any size, and redraws everything when asked
const useSquareCanvas = (strokesRef) => {
    const canvasRef = useRef(null);
    const sizeRef = useRef(0);

    const redraw = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const size = sizeRef.current;
        ctx.setTransform(window.devicePixelRatio || 1, 0, 0, window.devicePixelRatio || 1, 0, 0);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, size, size);
        strokesRef.current.forEach((stroke) => drawStroke(ctx, stroke, size));
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return undefined;
        const fit = () => {
            const size = canvas.clientWidth;
            if (!size) return;
            const ratio = window.devicePixelRatio || 1;
            sizeRef.current = size;
            canvas.width = Math.round(size * ratio);
            canvas.height = Math.round(size * ratio);
            redraw();
        };
        fit();
        const observer = new ResizeObserver(fit);
        observer.observe(canvas);
        return () => observer.disconnect();
    }, []);

    return { canvasRef, sizeRef, redraw };
};

/** 📺 Watch the drawing appear (TV, and guessers' phones) */
export function DrawingView({ roomCode, className = '', style }) {
    const strokesRef = useRef([]);
    const { canvasRef, redraw } = useSquareCanvas(strokesRef);
    const frame = useRef(null);

    useEffect(() => {
        const queueRedraw = () => {
            if (frame.current) return;
            frame.current = requestAnimationFrame(() => { frame.current = null; redraw(); });
        };
        const handleSnapshot = ({ strokes }) => {
            strokesRef.current = (strokes || []).map((s) => ({ ...s, p: [...s.p] }));
            queueRedraw();
        };
        const handlePoints = ({ stroke }) => {
            const existing = strokesRef.current.find((s) => s.id === stroke.id);
            if (existing) existing.p.push(...stroke.p);
            else strokesRef.current.push({ ...stroke, p: [...stroke.p] });
            queueRedraw();
        };
        socket.on('drawing_snapshot', handleSnapshot);
        socket.on('draw_points', handlePoints);
        socket.emit('get_drawing', { roomCode });   // catch up on anything drawn already
        return () => {
            socket.off('drawing_snapshot', handleSnapshot);
            socket.off('draw_points', handlePoints);
            if (frame.current) cancelAnimationFrame(frame.current);
        };
    }, [roomCode]);

    return (
        <canvas
            ref={canvasRef}
            className={`mx-canvas ${className}`}
            style={{ aspectRatio: '1 / 1', width: '100%', display: 'block', ...style }}
            aria-label="The drawing"
            role="img"
        />
    );
}

/** 📱 Draw with a finger (the drawer's phone) */
export function DrawingPad({ roomCode }) {
    const strokesRef = useRef([]);
    const { canvasRef, sizeRef, redraw } = useSquareCanvas(strokesRef);
    const [color, setColor] = useState(PEN_COLORS[0]);
    const [sizeId, setSizeId] = useState('medium');
    const [isErasing, setIsErasing] = useState(false);
    const current = useRef(null);      // the stroke being drawn
    const unsent = useRef([]);         // its points not sent yet

    const penWidth = () => (isErasing ? 0.05 : PEN_SIZES.find((s) => s.id === sizeId).w);

    // A clear (or a reconnect) from the server replaces what's on the pad
    useEffect(() => {
        const handleSnapshot = ({ strokes }) => {
            strokesRef.current = (strokes || []).map((s) => ({ ...s, p: [...s.p] }));
            redraw();
        };
        socket.on('drawing_snapshot', handleSnapshot);
        return () => socket.off('drawing_snapshot', handleSnapshot);
    }, []);

    // Send new points in small batches, not one message per finger movement
    useEffect(() => {
        const timer = setInterval(() => {
            const stroke = current.current;
            if (!stroke || !unsent.current.length) return;
            socket.emit('draw_points', { roomCode, stroke: { id: stroke.id, c: stroke.c, w: stroke.w, p: unsent.current } });
            unsent.current = [];
        }, SEND_EVERY_MS);
        return () => clearInterval(timer);
    }, [roomCode]);

    const pointFrom = (e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        return [(e.clientX - rect.left) / rect.width, (e.clientY - rect.top) / rect.height];
    };

    const handleDown = (e) => {
        e.preventDefault();
        canvasRef.current.setPointerCapture?.(e.pointerId);
        const stroke = { id: Math.random().toString(36).slice(2, 10), c: isErasing ? ERASER : color, w: penWidth(), p: [pointFrom(e)] };
        current.current = stroke;
        strokesRef.current.push(stroke);
        unsent.current = [...stroke.p];
        redraw();
    };

    const handleMove = (e) => {
        const stroke = current.current;
        if (!stroke) return;
        e.preventDefault();
        const point = pointFrom(e);
        const last = stroke.p[stroke.p.length - 1];
        if (Math.hypot(point[0] - last[0], point[1] - last[1]) < 0.003) return; // ignore tiny jitters
        stroke.p.push(point);
        unsent.current.push(point);
        // Draw just the new bit (a full redraw on every move is too slow on phones)
        const ctx = canvasRef.current.getContext('2d');
        drawStroke(ctx, { ...stroke, p: [last, point] }, sizeRef.current);
    };

    const handleUp = () => {
        const stroke = current.current;
        if (stroke && unsent.current.length) {
            socket.emit('draw_points', { roomCode, stroke: { id: stroke.id, c: stroke.c, w: stroke.w, p: unsent.current } });
        }
        unsent.current = [];
        current.current = null;
    };

    const handleClear = () => {
        strokesRef.current = [];
        redraw();
        socket.emit('draw_clear', { roomCode });
    };

    return (
        <div>
            <canvas
                ref={canvasRef}
                className="mx-canvas mx-canvas-pad"
                style={{ aspectRatio: '1 / 1', width: '100%', display: 'block', touchAction: 'none' }}
                onPointerDown={handleDown}
                onPointerMove={handleMove}
                onPointerUp={handleUp}
                onPointerCancel={handleUp}
                onPointerLeave={handleUp}
                aria-label="Drawing pad: draw with your finger"
            />

            {/* Pens */}
            <div className="mx-tools mt-2" role="group" aria-label="Pen color">
                {PEN_COLORS.map((c) => (
                    <button
                        key={c}
                        type="button"
                        className={`mx-swatch ${!isErasing && color === c ? 'selected' : ''}`}
                        style={{ background: c }}
                        aria-label={`Pen color ${c}`}
                        aria-pressed={!isErasing && color === c}
                        onClick={() => { setColor(c); setIsErasing(false); }}
                    />
                ))}
                <button
                    type="button"
                    className={`mx-tool-btn ${isErasing ? 'selected' : ''}`}
                    aria-pressed={isErasing}
                    onClick={() => setIsErasing((v) => !v)}
                >
                    🧽 Eraser
                </button>
            </div>
            <div className="mx-tools mt-2" role="group" aria-label="Pen size">
                {PEN_SIZES.map((s) => (
                    <button
                        key={s.id}
                        type="button"
                        className={`mx-tool-btn ${!isErasing && sizeId === s.id ? 'selected' : ''}`}
                        aria-pressed={!isErasing && sizeId === s.id}
                        onClick={() => { setSizeId(s.id); setIsErasing(false); }}
                    >
                        <span className="mx-size-dot" style={{ width: `${6 + s.w * 300}px`, height: `${6 + s.w * 300}px` }} />
                        {s.label}
                    </button>
                ))}
                <button type="button" className="mx-tool-btn mx-clear" onClick={handleClear}>🗑️ Clear</button>
            </div>
        </div>
    );
}
