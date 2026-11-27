import React from 'react';

/**
 * 🧶 Game tile for Word Weave, drawn in code to match the other tiles: the same blue, a 3 × 3 grid of letter
 * tiles in white line art, with a thread stitched through W-O-R-D and a needle on the end, and the name.
 */
const CELL = 30;
const STEP = 38;
const LEFT = 47;
const TOP = 24;
const at = (col, row) => [LEFT + col * STEP + CELL / 2, TOP + row * STEP + CELL / 2];
const WORD = [['W', 0, 0], ['O', 1, 1], ['R', 2, 0], ['D', 2, 1]];

export default function WordWeaveTile({ className = 'w-100 h-100', style }) {
    const thread = WORD.map(([, c, r]) => at(c, r).join(',')).join(' ');
    const [endX, endY] = at(2, 1);
    return (
        <svg viewBox="0 0 200 200" className={className} style={{ display: 'block', ...style }} role="img" aria-label="Word Weave">
            <defs>
                <linearGradient id="wwTileBg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#5d7fe8" />
                    <stop offset="1" stopColor="#3550c8" />
                </linearGradient>
            </defs>
            <rect width="200" height="200" fill="url(#wwTileBg)" />
            {/* The thread runs behind the tiles, so it shows between them, then trails off to the needle */}
            <polyline points={thread} fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
            <path d={`M${endX} ${endY} C ${endX + 8} ${endY + 30}, ${endX - 30} ${endY + 34}, ${endX - 12} ${endY + 52}`} fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
            {[0, 1, 2].map((row) => [0, 1, 2].map((col) => {
                const on = WORD.some(([, c, r]) => c === col && r === row);
                return (
                    <rect
                        key={`${col}-${row}`}
                        x={LEFT + col * STEP}
                        y={TOP + row * STEP}
                        width={CELL}
                        height={CELL}
                        rx="7"
                        fill={on ? '#4e6ddc' : '#4562d4'}
                        stroke="#fff"
                        strokeWidth={on ? 4.5 : 3}
                        opacity={on ? 1 : 0.7}
                    />
                );
            }))}
            {WORD.map(([letter, c, r]) => {
                const [x, y] = at(c, r);
                return (
                    <text key={letter} x={x} y={y + 7} textAnchor="middle" fill="#fff" fontSize="20" fontWeight="800" fontFamily="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif">
                        {letter}
                    </text>
                );
            })}
            {/* The needle, its eye on the thread's end */}
            <g transform={`rotate(-38 ${endX - 12} ${endY + 52})`}>
                <path d={`M${endX - 15} ${endY + 50} h30 l12 2 l-12 2 h-30 z`} fill="#fff" />
                <ellipse cx={endX - 9} cy={endY + 52} rx="4" ry="1.3" fill="#3f5bd0" />
            </g>
            <text x="100" y="170" textAnchor="middle" fill="#fff" fontSize="30" fontWeight="700" fontFamily="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif">
                Word Weave
            </text>
        </svg>
    );
}
