import React from 'react';

/**
 * 📺❔ The Trivia Cast button artwork, drawn in code to match the other game tiles:
 * a blue glass square with a white line icon (a TV with a question mark) and the name.
 */
export default function TriviaCastTile({ className = 'w-100 h-100', style }) {
    return (
        <svg viewBox="0 0 200 200" className={className} style={{ display: 'block', ...style }} role="img" aria-label="Trivia Cast">
            <defs>
                <linearGradient id="tcTileBg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#5d7fe8" />
                    <stop offset="1" stopColor="#3550c8" />
                </linearGradient>
            </defs>
            <rect width="200" height="200" fill="url(#tcTileBg)" />
            <g fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
                {/* TV */}
                <rect x="52" y="38" width="96" height="66" rx="9" />
                <path d="M100 104 V118 M80 118 H120" />
                {/* Cast waves in the corner */}
                <path d="M62 84 a10 10 0 0 1 10 10" />
                <path d="M62 72 a22 22 0 0 1 22 22" />
                {/* Question mark */}
                <path d="M98 60 a11 11 0 1 1 17 9 q-5 3.5 -5 9" />
            </g>
            <circle cx="62" cy="94" r="3" fill="#fff" />
            <circle cx="110" cy="89" r="3.5" fill="#fff" />
            <text x="100" y="160" textAnchor="middle" fill="#fff" fontSize="25" fontWeight="700" fontFamily="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif">
                Trivia Cast
            </text>
        </svg>
    );
}
