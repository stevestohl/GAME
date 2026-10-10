import React from 'react';
import { useBackgroundTheme } from './backgroundTheme.js';

/**
 * 🌌 Full-screen animated background.
 * Deep-blue gradient, slowly drifting light blobs and outlined party icons
 * (dice, martini, cards, controller, stars). Vector-only, so it is sharp on
 * any screen and weighs almost nothing. Render it once, near the top of App.
 *
 * Games can swap the floating icons and colours with a theme
 * (see backgroundTheme.js): Couch Cast gets couches, gavels and cast screens,
 * its Halloween deck goes orange with pumpkins and ghosts.
 */

const ICONS = {
    die: (
        <>
            <rect x="8" y="8" width="84" height="84" rx="18" />
            <circle cx="30" cy="30" r="6" className="gt-icon-dot" />
            <circle cx="70" cy="30" r="6" className="gt-icon-dot" />
            <circle cx="50" cy="50" r="6" className="gt-icon-dot" />
            <circle cx="30" cy="70" r="6" className="gt-icon-dot" />
            <circle cx="70" cy="70" r="6" className="gt-icon-dot" />
        </>
    ),
    martini: (
        <>
            <path d="M12 18 H88 L50 58 Z" />
            <path d="M50 58 V88" />
            <path d="M30 92 H70" />
            <path d="M62 8 L44 40" />
            <circle cx="44" cy="40" r="6" />
        </>
    ),
    card: (
        <>
            <rect x="22" y="6" width="56" height="88" rx="10" />
            <path d="M50 66 c-14 -10 -18 -17 -18 -23 a8 8 0 0 1 18 -3 a8 8 0 0 1 18 3 c0 6 -4 13 -18 23 z" />
        </>
    ),
    controller: (
        <>
            <path d="M28 30 H72 a20 20 0 0 1 20 20 v10 a14 14 0 0 1 -26 7 l-6 -9 H40 l-6 9 a14 14 0 0 1 -26 -7 v-10 a20 20 0 0 1 20 -20 z" />
            <path d="M28 42 v14 M21 49 h14" />
            <circle cx="68" cy="45" r="3.5" className="gt-icon-dot" />
            <circle cx="76" cy="53" r="3.5" className="gt-icon-dot" />
        </>
    ),
    star: <path d="M50 8 l11 26 28 3 -21 19 6 28 -24 -14 -24 14 6 -28 -21 -19 28 -3 z" />,
    xo: (
        <>
            <path d="M10 22 L42 54 M42 22 L10 54" />
            <circle cx="72" cy="66" r="18" />
        </>
    ),

    // 🛋️ Couch Cast
    couch: (
        <>
            <path d="M22 52 V36 a10 10 0 0 1 10 -10 H68 a10 10 0 0 1 10 10 V52" />
            <path d="M10 56 a8 8 0 0 1 16 0 V64 H74 V56 a8 8 0 0 1 16 0 V78 H10 Z" />
            <path d="M50 28 V64" />
            <path d="M20 78 V86 M80 78 V86" />
        </>
    ),
    gavel: (
        <>
            <g transform="rotate(-40 46 46)">
                <rect x="24" y="16" width="44" height="24" rx="6" />
                <rect x="42" y="40" width="8" height="46" rx="4" />
            </g>
            <rect x="54" y="80" width="38" height="10" rx="4" />
        </>
    ),
    castScreen: (
        <>
            <rect x="8" y="16" width="84" height="58" rx="8" />
            <path d="M50 74 V88 M34 88 H66" />
            <circle cx="22" cy="60" r="3.5" className="gt-icon-dot" />
            <path d="M20 47 a15 15 0 0 1 15 15" />
            <path d="M20 34 a28 28 0 0 1 28 28" />
        </>
    ),
    phone: (
        <>
            <rect x="28" y="6" width="44" height="88" rx="10" />
            <path d="M44 82 H56" />
            <rect x="38" y="24" width="24" height="34" rx="5" />
        </>
    ),
    bubble: (
        <>
            <path d="M14 18 H86 a8 8 0 0 1 8 8 V58 a8 8 0 0 1 -8 8 H48 L28 84 V66 H14 a8 8 0 0 1 -8 -8 V26 a8 8 0 0 1 8 -8 z" />
            <circle cx="32" cy="42" r="4" className="gt-icon-dot" />
            <circle cx="50" cy="42" r="4" className="gt-icon-dot" />
            <circle cx="68" cy="42" r="4" className="gt-icon-dot" />
        </>
    ),

    // 🎃 Halloween
    pumpkin: (
        <>
            <path d="M46 26 q1 -13 12 -16 l4 6 q-7 3 -7 10" />
            <ellipse cx="32" cy="58" rx="22" ry="28" />
            <ellipse cx="68" cy="58" rx="22" ry="28" />
            <ellipse cx="50" cy="58" rx="19" ry="31" />
            <path d="M30 52 l9 -11 l6 12 z" className="gt-icon-dot" />
            <path d="M70 52 l-9 -11 l-6 12 z" className="gt-icon-dot" />
            <path d="M29 66 l7 4 l5 -5 l9 6 l9 -6 l5 5 l7 -4 q-5 15 -21 15 q-16 0 -21 -15 z" className="gt-icon-dot" />
        </>
    ),
    ghost: (
        <>
            <path d="M22 88 V44 a28 28 0 0 1 56 0 V88 l-9.33 -10 l-9.33 10 l-9.34 -10 l-9.33 10 l-9.33 -10 z" />
            <ellipse cx="40" cy="44" rx="4.5" ry="6.5" className="gt-icon-dot" />
            <ellipse cx="60" cy="44" rx="4.5" ry="6.5" className="gt-icon-dot" />
            <ellipse cx="50" cy="61" rx="5" ry="7" />
        </>
    ),
    bat: (
        <path d="M50 40 L45 29 L42 40 Q26 28 6 36 Q19 43 20 60 Q28 51 36 59 Q42 53 46 63 L50 72 L54 63 Q58 53 64 59 Q72 51 80 60 Q81 43 94 36 Q74 28 58 40 L55 29 Z" />
    ),
    moon: <path d="M60 10 a40 40 0 1 0 30 58 a32 32 0 1 1 -30 -58 z" />,
    candy: (
        <>
            <circle cx="50" cy="50" r="17" />
            <path d="M34 44 L14 34 V66 L34 56" />
            <path d="M66 44 L86 34 V66 L66 56" />
            <path d="M41 46 q9 -6 14 3 q-2 9 -11 6" />
        </>
    ),
};

// Placement of each floating icon. dur/delay in seconds; rot = base tilt.
const FLOATERS = [
    { icon: 'martini',    top: '14%', left: '4%',  size: 170, dur: 38, delay: 0,   rot: -14 },
    { icon: 'die',        top: '62%', left: '78%', size: 190, dur: 44, delay: -8,  rot: 18 },
    { icon: 'card',       top: '70%', left: '6%',  size: 120, dur: 36, delay: -14, rot: 12 },
    { icon: 'controller', top: '10%', left: '80%', size: 150, dur: 48, delay: -20, rot: -8 },
    { icon: 'star',       top: '42%', left: '90%', size: 60,  dur: 30, delay: -5,  rot: 0 },
    { icon: 'xo',         top: '40%', left: '-1%', size: 110, dur: 42, delay: -26, rot: 6 },
    { icon: 'die',        top: '86%', left: '44%', size: 90,  dur: 40, delay: -12, rot: -22 },
    { icon: 'star',       top: '6%',  left: '42%', size: 44,  dur: 28, delay: -18, rot: 10 },
];

const COUCHCAST_FLOATERS = [
    { icon: 'couch',      top: '12%', left: '3%',  size: 180, dur: 38, delay: 0,   rot: -10 },
    { icon: 'castScreen', top: '60%', left: '78%', size: 190, dur: 44, delay: -8,  rot: 12 },
    { icon: 'gavel',      top: '68%', left: '5%',  size: 130, dur: 36, delay: -14, rot: 8 },
    { icon: 'phone',      top: '8%',  left: '82%', size: 130, dur: 48, delay: -20, rot: -14 },
    { icon: 'star',       top: '42%', left: '91%', size: 60,  dur: 30, delay: -5,  rot: 0 },
    { icon: 'bubble',     top: '38%', left: '-1%', size: 110, dur: 42, delay: -26, rot: 6 },
    { icon: 'card',       top: '84%', left: '44%', size: 100, dur: 40, delay: -12, rot: -18 },
    { icon: 'gavel',      top: '4%',  left: '44%', size: 70,  dur: 34, delay: -18, rot: 20 },
];

const HALLOWEEN_FLOATERS = [
    { icon: 'pumpkin', top: '12%', left: '3%',  size: 180, dur: 38, delay: 0,   rot: -10 },
    { icon: 'ghost',   top: '58%', left: '79%', size: 190, dur: 44, delay: -8,  rot: 10 },
    { icon: 'ghost',   top: '66%', left: '5%',  size: 130, dur: 36, delay: -14, rot: -8 },
    { icon: 'bat',     top: '8%',  left: '80%', size: 150, dur: 48, delay: -20, rot: -8 },
    { icon: 'candy',   top: '42%', left: '90%', size: 80,  dur: 30, delay: -5,  rot: 30 },
    { icon: 'moon',    top: '38%', left: '-1%', size: 110, dur: 42, delay: -26, rot: 6 },
    { icon: 'pumpkin', top: '84%', left: '44%', size: 100, dur: 40, delay: -12, rot: 14 },
    { icon: 'bat',     top: '4%',  left: '42%', size: 80,  dur: 34, delay: -18, rot: 10 },
];

// Each theme = which icons float around. Colours live in cards.css (.gt-bg.theme-*).
const THEMES = {
    home: FLOATERS,
    couchcast: COUCHCAST_FLOATERS,
    halloween: HALLOWEEN_FLOATERS,
};

export default function AnimatedBackground() {
    const { theme, cover } = useBackgroundTheme();
    const floaters = THEMES[theme] || THEMES.home;

    return (
        <div className={`gt-bg theme-${theme} ${cover ? 'gt-bg-cover' : ''}`} aria-hidden="true">
            <div className="gt-blob b1" />
            <div className="gt-blob b2" />
            <div className="gt-blob b3" />

            {floaters.map((f, i) => (
                <div
                    key={i}
                    className="gt-floater"
                    style={{
                        top: f.top,
                        left: f.left,
                        width: f.size,
                        height: f.size,
                        '--dur': `${f.dur}s`,
                        '--delay': `${f.delay}s`,
                        '--rot': `${f.rot}deg`,
                    }}
                >
                    <svg viewBox="0 0 100 100" className="gt-floater-svg">
                        {ICONS[f.icon]}
                    </svg>
                </div>
            ))}

            <div className="gt-vignette" />
        </div>
    );
}
