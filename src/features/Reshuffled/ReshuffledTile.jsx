import React from 'react';

/**
 * 🔀 Game tile for Couch Cast Re-Shuffled, drawn in code to match the List Cast and Trivia Cast tiles:
 * a blue glass square with a couch, two cards being shuffled above it, and the game's name.
 */
export default function ReshuffledTile({ className = 'w-100 h-100', style }) {
    return (
        <svg viewBox="0 0 200 200" className={className} style={{ display: 'block', ...style }} role="img" aria-label="Couch Cast Re-Shuffled">
            <defs>
                <linearGradient id="rsTileBg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#5d7fe8" />
                    <stop offset="1" stopColor="#3550c8" />
                </linearGradient>
            </defs>
            <rect width="200" height="200" fill="url(#rsTileBg)" />
            <g fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
                {/* Two cards, fanned */}
                <rect x="60" y="12" width="34" height="46" rx="6" transform="rotate(-14 77 35)" />
                <rect x="106" y="12" width="34" height="46" rx="6" transform="rotate(14 123 35)" />
                {/* Shuffle arrows crossing between the cards and the couch */}
                <path d="M74 88 C 92 88, 104 70, 122 70" strokeWidth="4" />
                <path d="M74 70 C 92 70, 104 88, 122 88" strokeWidth="4" />
                <path d="M116 64 L123 70 L116 76" strokeWidth="4" />
                <path d="M116 82 L123 88 L116 94" strokeWidth="4" />
                {/* Couch */}
                <path d="M54 118 V110 a8 8 0 0 1 8 -8 H138 a8 8 0 0 1 8 8 V118" />
                <rect x="40" y="114" width="18" height="24" rx="6" />
                <rect x="142" y="114" width="18" height="24" rx="6" />
                <path d="M58 122 H142 V138 H58" />
                <path d="M52 138 V146 M148 138 V146" />
            </g>
            <text x="100" y="176" textAnchor="middle" fill="#fff" fontSize="23" fontWeight="700" fontFamily="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif">
                Re-Shuffled
            </text>
        </svg>
    );
}
