import React from 'react';

/**
 * 🎪 Game tile for Temple Mix Up, drawn in code to match the other cast tiles: a blue glass square
 * with the three round types on it (a meme picture, a pencil and a question mark) and the name.
 */
export default function MixupTile({ className = 'w-100 h-100', style }) {
    return (
        <svg viewBox="0 0 200 200" className={className} style={{ display: 'block', ...style }} role="img" aria-label="Temple Mix Up">
            <defs>
                <linearGradient id="mxTileBg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#5d7fe8" />
                    <stop offset="1" stopColor="#3550c8" />
                </linearGradient>
            </defs>
            <rect width="200" height="200" fill="url(#mxTileBg)" />
            <g fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
                {/* A meme: a picture with a caption bar */}
                <rect x="22" y="40" width="54" height="50" rx="6" />
                <path d="M28 82 L42 66 L52 76 L60 68 L70 82" strokeWidth="4" />
                <path d="M30 50 H68" strokeWidth="4" />
                {/* A pencil, mid-scribble */}
                <path d="M92 92 L128 44 L138 52 L102 100 L90 104 Z" />
                <path d="M122 52 L132 60" strokeWidth="4" />
                <path d="M84 116 q8 -8 14 0 t14 0" strokeWidth="4" />
                {/* A question mark */}
                <path d="M152 52 q0 -14 14 -14 q14 0 14 13 q0 10 -12 15 q-3 2 -3 9" />
            </g>
            <circle cx="165" cy="92" r="4" fill="#fff" />
            <text x="100" y="152" textAnchor="middle" fill="#fff" fontSize="25" fontWeight="700" fontFamily="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif">
                Temple
            </text>
            <text x="100" y="180" textAnchor="middle" fill="#fff" fontSize="25" fontWeight="700" fontFamily="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif">
                Mix Up!
            </text>
        </svg>
    );
}
