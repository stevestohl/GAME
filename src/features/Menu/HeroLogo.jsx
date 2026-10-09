import React from 'react';

/**
 * 🏛️ Animated Game Temple hero mark.
 * A playful temple in the "Join Room" blue: dice tumble between the columns,
 * a card wiggles, sparkles twinkle and confetti drifts up.
 * Pure SVG + CSS (see gt-theme.css), so it stays crisp at any size.
 */
export default function HeroLogo({ size = 260, className = '' }) {
    return (
        <div className={`gt-hero ${className}`} style={{ width: size }}>
            <svg viewBox="0 0 260 170" role="img" aria-label="Game Temple">
                <defs>
                    <linearGradient id="gtHeroBg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" className="gt-stop-top" />
                        <stop offset="1" className="gt-stop-bottom" />
                    </linearGradient>
                    <linearGradient id="gtHeroGloss" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" className="gt-stop-gloss" />
                        <stop offset="1" className="gt-stop-clear" />
                    </linearGradient>
                    <clipPath id="gtHeroClip">
                        <rect x="0" y="0" width="260" height="170" rx="22" />
                    </clipPath>
                </defs>

                <g clipPath="url(#gtHeroClip)">
                    {/* Tile + soft gloss */}
                    <rect className="gt-hero-bg" x="0" y="0" width="260" height="170" />
                    <rect className="gt-hero-gloss" x="0" y="0" width="260" height="78" />
                    <rect className="gt-hero-sweep" x="-80" y="-40" width="50" height="260" />

                    {/* Confetti drifting up */}
                    <rect className="gt-confetti c1" x="40" y="150" width="6" height="3" rx="1.5" />
                    <rect className="gt-confetti c2" x="96" y="156" width="5" height="3" rx="1.5" />
                    <circle className="gt-confetti c3" cx="168" cy="152" r="2.5" />
                    <rect className="gt-confetti c4" x="214" y="150" width="6" height="3" rx="1.5" />
                    <circle className="gt-confetti c5" cx="236" cy="158" r="2" />
                    <circle className="gt-confetti c6" cx="22" cy="160" r="2" />

                    {/* Temple */}
                    <g className="gt-temple">
                        <path className="gt-line" d="M66 70 L130 36 L194 70 Z" />
                        <rect className="gt-line" x="62" y="70" width="136" height="9" rx="2.5" />
                        <rect className="gt-line" x="72" y="83" width="14" height="47" rx="3" />
                        <rect className="gt-line" x="174" y="83" width="14" height="47" rx="3" />
                        <rect className="gt-line" x="60" y="130" width="140" height="7" rx="2.5" />
                        <rect className="gt-line" x="52" y="141" width="156" height="7" rx="2.5" />
                    </g>

                    {/* Spinning star medallion in the pediment */}
                    <g className="gt-medallion">
                        <path
                            className="gt-fill-white"
                            d="M130 47 l3.2 6.6 7.2 1 -5.2 5 1.3 7.2 -6.5 -3.4 -6.5 3.4 1.3 -7.2 -5.2 -5 7.2 -1 z"
                        />
                    </g>

                    {/* Dice shadows */}
                    <ellipse className="gt-die-shadow s1" cx="113" cy="128" rx="13" ry="2.6" />
                    <ellipse className="gt-die-shadow s2" cx="149" cy="128" rx="11" ry="2.4" />

                    {/* Die 1 (five) */}
                    <g className="gt-die d1">
                        <rect className="gt-die-face" x="100" y="102" width="26" height="26" rx="6" />
                        <circle className="gt-pip" cx="107" cy="109" r="2.3" />
                        <circle className="gt-pip" cx="119" cy="109" r="2.3" />
                        <circle className="gt-pip" cx="113" cy="115" r="2.3" />
                        <circle className="gt-pip" cx="107" cy="121" r="2.3" />
                        <circle className="gt-pip" cx="119" cy="121" r="2.3" />
                    </g>

                    {/* Die 2 (three) */}
                    <g className="gt-die d2">
                        <rect className="gt-die-face" x="138" y="106" width="22" height="22" rx="5" />
                        <circle className="gt-pip" cx="144" cy="112" r="2" />
                        <circle className="gt-pip" cx="149" cy="117" r="2" />
                        <circle className="gt-pip" cx="154" cy="122" r="2" />
                    </g>

                    {/* Floating playing card */}
                    <g className="gt-card">
                        <rect className="gt-card-face" x="205" y="26" width="26" height="36" rx="4" />
                        <path
                            className="gt-heart"
                            d="M218 50 c-6 -4.5 -8 -7.5 -8 -10 a3.6 3.6 0 0 1 8 -1.4 a3.6 3.6 0 0 1 8 1.4 c0 2.5 -2 5.5 -8 10 z"
                        />
                    </g>

                    {/* Floating game piece (left) */}
                    <g className="gt-pawn">
                        <circle className="gt-fill-white" cx="34" cy="64" r="6" />
                        <path className="gt-fill-white" d="M28 86 q6 -14 6 -16 q0 2 6 16 z" />
                        <rect className="gt-fill-white" x="25" y="85" width="18" height="4" rx="2" />
                    </g>

                    {/* Sparkles */}
                    <path className="gt-sparkle k1" d="M56 26 l2 6 6 2 -6 2 -2 6 -2 -6 -6 -2 6 -2 z" />
                    <path className="gt-sparkle k2" d="M196 104 l1.6 4.4 4.4 1.6 -4.4 1.6 -1.6 4.4 -1.6 -4.4 -4.4 -1.6 4.4 -1.6 z" />
                    <path className="gt-sparkle k3" d="M162 16 l1.4 3.6 3.6 1.4 -3.6 1.4 -1.4 3.6 -1.4 -3.6 -3.6 -1.4 3.6 -1.4 z" />
                    <path className="gt-sparkle k4" d="M232 82 l1.4 3.6 3.6 1.4 -3.6 1.4 -1.4 3.6 -1.4 -3.6 -3.6 -1.4 3.6 -1.4 z" />
                    <path className="gt-sparkle k5" d="M44 112 l1.2 3 3 1.2 -3 1.2 -1.2 3 -1.2 -3 -3 -1.2 3 -1.2 z" />
                </g>
            </svg>
        </div>
    );
}
