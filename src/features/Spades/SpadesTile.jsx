import React from 'react';

/**
 * ♠️ Game tile for Spades, drawn in code to match the other cast tiles: card-table green, two fanned cards in
 * white line art with a big spade on the front one, and the name.
 */
export default function SpadesTile({ className = 'w-100 h-100', style }) {
    return (
        <svg viewBox="0 0 200 200" className={className} style={{ display: 'block', ...style }} role="img" aria-label="Spades">
            <defs>
                <linearGradient id="spTileBg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#24935f" />
                    <stop offset="1" stopColor="#0f5c3a" />
                </linearGradient>
            </defs>
            <rect width="200" height="200" fill="url(#spTileBg)" />
            <g fill="none" stroke="#fff" strokeWidth="5" strokeLinejoin="round">
                {/* The card behind, tipped left */}
                <rect x="52" y="34" width="64" height="90" rx="8" transform="rotate(-12 84 79)" />
                {/* The card in front, tipped right */}
                <rect x="84" y="30" width="64" height="90" rx="8" transform="rotate(10 116 75)" fill="#0f5c3a" />
            </g>
            {/* A spade on the front card */}
            <path
                transform="rotate(10 116 75)"
                fill="#fff"
                d="M116 50 C104 64 96 70 96 79 C96 87 104 91 111 86 C110 92 107 97 103 100 H129 C125 97 122 92 121 86 C128 91 136 87 136 79 C136 70 128 64 116 50 Z"
            />
            <text x="100" y="170" textAnchor="middle" fill="#fff" fontSize="30" fontWeight="700" fontFamily="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif">
                Spades
            </text>
        </svg>
    );
}
