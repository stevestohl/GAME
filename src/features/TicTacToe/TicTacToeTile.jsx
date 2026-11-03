import React from 'react';

/** ❌⭕ Game tile for Tic-Tac-Toe, drawn in code: a neon blue board on a dark square, with the name */
export default function TicTacToeTile({ className = 'w-100 h-100', style }) {
    return (
        <svg viewBox="0 0 200 200" className={className} style={{ display: 'block', ...style }} role="img" aria-label="Tic-Tac-Toe">
            <rect width="200" height="200" fill="#0a1238" />
            <g fill="none" stroke="#2de2ff" strokeWidth="6" strokeLinecap="round" className="ttt-neon">
                <path d="M72 20 V140 M128 20 V140 M38 58 H162 M38 102 H162" />
                <path d="M46 28 L62 48 M62 28 L46 48" />
                <circle cx="100" cy="80" r="12" />
                <path d="M138 112 L154 132 M154 112 L138 132" />
                <circle cx="54" cy="122" r="11" />
            </g>
            <text x="100" y="178" textAnchor="middle" fill="#fff" fontSize="24" fontWeight="800" fontFamily="system-ui, sans-serif">Tic-Tac-Toe</text>
        </svg>
    );
}
