import React from 'react';

/**
 * 📝 Game tiles for the home page, drawn in code to match the Trivia Cast tile:
 * a blue glass square with a white line icon and the game's name.
 */

const tileText = (label) => (
    <text x="100" y="168" textAnchor="middle" fill="#fff" fontSize="25" fontWeight="700" fontFamily="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif">
        {label}
    </text>
);

// A list with one answer crossed out
const listIcon = (x, y) => (
    <g transform={`translate(${x} ${y})`}>
        <rect x="0" y="0" width="64" height="80" rx="8" />
        <path d="M14 20 H50" />
        <path d="M14 38 H50" />
        <path d="M14 56 H40" />
        <path d="M10 38 H54" strokeWidth="6" />
    </g>
);

/** 📺📝 List Cast: blue, a TV with a list on it */
export function ListCastTile({ className = 'w-100 h-100', style }) {
    return (
        <svg viewBox="0 0 200 200" className={className} style={{ display: 'block', ...style }} role="img" aria-label="List Cast">
            <defs>
                <linearGradient id="lcTileBg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#5d7fe8" />
                    <stop offset="1" stopColor="#3550c8" />
                </linearGradient>
            </defs>
            <rect width="200" height="200" fill="url(#lcTileBg)" />
            <g fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
                {/* TV */}
                <rect x="40" y="30" width="120" height="86" rx="10" />
                <path d="M100 116 V130 M78 130 H122" />
                {/* List on the screen */}
                <path d="M62 52 H120" />
                <path d="M62 73 H138" />
                <path d="M62 94 H110" />
                <path d="M56 73 H144" strokeWidth="6" />
            </g>
            <circle cx="52" cy="52" r="3.5" fill="#fff" />
            <circle cx="52" cy="94" r="3.5" fill="#fff" />
            {tileText('List Cast')}
        </svg>
    );
}

/** 📱📝 Listopia: blue, two phones with lists */
export function ListopiaTile({ className = 'w-100 h-100', style }) {
    return (
        <svg viewBox="0 0 200 200" className={className} style={{ display: 'block', ...style }} role="img" aria-label="Listopia">
            <defs>
                <linearGradient id="lpTileBg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#5d7fe8" />
                    <stop offset="1" stopColor="#3550c8" />
                </linearGradient>
            </defs>
            <rect width="200" height="200" fill="url(#lpTileBg)" />
            <g fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
                {listIcon(36, 34)}
                <g transform="rotate(10 132 74)">{listIcon(100, 34)}</g>
            </g>
            {tileText('Listopia')}
        </svg>
    );
}
