import React from 'react';

/** ❌⭕ Game tile for Tic-Tac-Toe, drawn in code to match the other home tiles: a white board on a blue square, with the name */
export default function TicTacToeTile({ className = 'w-100 h-100', style }) {
    return (
        <svg viewBox="0 0 200 200" className={className} style={{ display: 'block', ...style }} role="img" aria-label="Tic-Tac-Toe">
            <defs>
                <linearGradient id="tttTileBg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#5d7fe8" />
                    <stop offset="1" stopColor="#3550c8" />
                </linearGradient>
            </defs>
            <rect width="200" height="200" fill="url(#tttTileBg)" />
            <g fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M72 18 V132 M128 18 V132 M38 56 H162 M38 94 H162" />
                <path d="M46 28 L64 46 M64 28 L46 46" />
                <circle cx="100" cy="75" r="12" />
                <path d="M137 104 L155 122 M155 104 L137 122" />
                <circle cx="55" cy="113" r="11" />
            </g>
            <text x="100" y="168" textAnchor="middle" fill="#fff" fontSize="25" fontWeight="700" fontFamily="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif">Tic-Tac-Toe</text>
        </svg>
    );
}
