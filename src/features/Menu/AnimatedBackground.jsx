import React from 'react';

/**
 * 🌌 Full-screen animated background.
 * Deep-blue gradient, slowly drifting light blobs and outlined party icons
 * (dice, martini, cards, controller, stars). Vector-only, so it is sharp on
 * any screen and weighs almost nothing. Render it once, near the top of App.
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

export default function AnimatedBackground() {
    return (
        <div className="gt-bg" aria-hidden="true">
            <div className="gt-blob b1" />
            <div className="gt-blob b2" />
            <div className="gt-blob b3" />

            {FLOATERS.map((f, i) => (
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
