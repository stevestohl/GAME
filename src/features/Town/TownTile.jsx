import React from 'react';

/**
 * 🏙️ Game tile for Temple Town, drawn in code to match the other cast tiles: a glass square with a little
 * skyline (a shop, a tower and a crane) in white line art, and the name.
 */
export default function TownTile({ className = 'w-100 h-100', style }) {
    return (
        <svg viewBox="0 0 200 200" className={className} style={{ display: 'block', ...style }} role="img" aria-label="Temple Town">
            <defs>
                <linearGradient id="ttTileBg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#2fb39a" />
                    <stop offset="1" stopColor="#13806f" />
                </linearGradient>
            </defs>
            <rect width="200" height="200" fill="url(#ttTileBg)" />
            <g fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
                {/* The ground */}
                <path d="M30 118 H170" />
                {/* A shop with an awning */}
                <path d="M40 118 V92 H78 V118" />
                <path d="M36 92 L44 82 H74 L82 92" />
                <path d="M54 118 V104 H64 V118" strokeWidth="4" />
                {/* A tower with windows */}
                <path d="M92 118 V44 H124 V118" />
                <path d="M100 56 H104 M112 56 H116 M100 70 H104 M112 70 H116 M100 84 H104 M112 84 H116 M100 98 H104 M112 98 H116" strokeWidth="4" />
                {/* A crane, putting up the next one */}
                <path d="M146 118 V40 M138 40 H170 M146 52 L158 40 M166 40 V54" />
                <rect x="160" y="54" width="12" height="10" rx="2" strokeWidth="4" />
            </g>
            <text x="100" y="152" textAnchor="middle" fill="#fff" fontSize="25" fontWeight="700" fontFamily="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif">
                Temple
            </text>
            <text x="100" y="180" textAnchor="middle" fill="#fff" fontSize="25" fontWeight="700" fontFamily="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif">
                Town
            </text>
        </svg>
    );
}
