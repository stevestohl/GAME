import React from 'react';

/**
 * 🎪 Game tile for 3 Ring Circus (Temple Mix Up), drawn in code to match the other cast tiles: a blue glass
 * square with a big top tent in white line art, and the name.
 */
export default function MixupTile({ className = 'w-100 h-100', style }) {
    return (
        <svg viewBox="0 0 200 200" className={className} style={{ display: 'block', ...style }} role="img" aria-label="3 Ring Circus">
            <defs>
                <linearGradient id="mxTileBg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#5d7fe8" />
                    <stop offset="1" stopColor="#3550c8" />
                </linearGradient>
            </defs>
            <rect width="200" height="200" fill="url(#mxTileBg)" />
            <g fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
                {/* The big top: its roof, the striped panels and the scalloped edge */}
                <path d="M100 40 Q80 60 52 76 M100 40 Q120 60 148 76" />
                <path d="M100 40 L84 76 M100 40 L116 76" strokeWidth="4" />
                <path d="M52 76 Q60 87 68 76 Q76 87 84 76 Q92 87 100 76 Q108 87 116 76 Q124 87 132 76 Q140 87 148 76" />
                {/* The walls, the ground and the open flaps of the entrance */}
                <path d="M58 84 V116 M142 84 V116 M46 116 H154" />
                <path d="M100 86 Q92 100 86 116 M100 86 Q108 100 114 116" strokeWidth="4" />
                {/* The flagpole */}
                <path d="M100 40 V22" strokeWidth="4" />
            </g>
            <path d="M101 21 L117 26 L101 31 Z" fill="#fff" />
            <text x="100" y="150" textAnchor="middle" fill="#fff" fontSize="25" fontWeight="700" fontFamily="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif">
                3 Ring
            </text>
            <text x="100" y="178" textAnchor="middle" fill="#fff" fontSize="25" fontWeight="700" fontFamily="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif">
                Circus
            </text>
        </svg>
    );
}
