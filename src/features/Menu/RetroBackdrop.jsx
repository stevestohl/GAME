import React from 'react';

/**
 * 📼 The Jeffinitely deck's background (AnimatedBackground, theme 'jeffinitely').
 * Same look as the deck card: a sunset that runs orange → hot pink → purple → teal, a neon sun sinking
 * into a magenta perspective grid, and stuff from the '80s and '90s drifting around the edges: troll
 * dolls with tall neon hair, a Rubik's cube, a slap bracelet, a lava lamp, a Walkman, floppy disks,
 * a keychain pet, a mixtape, plus the card's squiggle, triangle, diamond and dot.
 * All of it sits inside the background layer, so it's always behind the cards, the QR code and the text.
 */

const INK = '#1f1f2b';
const PINK = '#ff4f9a';
const MAGENTA = '#ff4fd8';
const TEAL = '#18b6c9';
const MINT = '#2ec4b6';
const PURPLE = '#7b3fd1';
const ORANGE = '#ff8a3d';
const YELLOW = '#ffd23f';
const GREEN = '#7ee081';
const CREAM = '#fff6d8';

// 🧌 A troll doll: tiny body, big grin, and a tall tuft of neon hair
function Troll({ hair, gem }) {
    return (
        <>
            <path d="M50 50 C34 44 22 30 28 6 C34 18 38 14 40 2 C44 14 48 10 50 0 C52 10 56 14 60 2 C62 14 66 18 72 6 C78 30 66 44 50 50 Z" fill={hair} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
            <path d="M40 14 C38 26 40 36 46 44 M60 14 C62 26 60 36 54 44 M50 6 V40" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="2" strokeLinecap="round" />
            <circle cx="34" cy="58" r="5" fill="#f2b184" stroke={INK} strokeWidth="2.2" />
            <circle cx="66" cy="58" r="5" fill="#f2b184" stroke={INK} strokeWidth="2.2" />
            <ellipse cx="50" cy="60" rx="15" ry="14" fill="#f6c39a" stroke={INK} strokeWidth="2.5" />
            <circle cx="44" cy="55" r="3.6" fill="#fff" stroke={INK} strokeWidth="1.4" />
            <circle cx="56" cy="55" r="3.6" fill="#fff" stroke={INK} strokeWidth="1.4" />
            <circle cx="44.6" cy="55.6" r="1.7" fill={INK} />
            <circle cx="56.6" cy="55.6" r="1.7" fill={INK} />
            <ellipse cx="50" cy="62" rx="5" ry="4" fill="#ee9a72" stroke={INK} strokeWidth="1.8" />
            <path d="M43 67 Q50 72 57 67" fill="none" stroke={INK} strokeWidth="2" strokeLinecap="round" />
            <path d="M38 74 Q50 70 62 74 L64 90 Q50 94 36 90 Z" fill="#f6c39a" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
            <path d="M38 76 L28 70 M62 76 L72 70" stroke={INK} strokeWidth="5" strokeLinecap="round" />
            <path d="M38 76 L28 70 M62 76 L72 70" stroke="#f6c39a" strokeWidth="2.6" strokeLinecap="round" />
            <path d="M50 77 L55 82 L50 87 L45 82 Z" fill={gem} stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />
            <ellipse cx="42" cy="93" rx="6" ry="3" fill="#f6c39a" stroke={INK} strokeWidth="2" />
            <ellipse cx="58" cy="93" rx="6" ry="3" fill="#f6c39a" stroke={INK} strokeWidth="2" />
        </>
    );
}

// 🧊 A Rubik's cube, mid-twist: three faces of nine stickers
function CubeFace({ o, u, v, colors }) {
    const at = (i, j) => [o[0] + u[0] * i / 3 + v[0] * j / 3, o[1] + u[1] * i / 3 + v[1] * j / 3];
    const stickers = [];
    for (let j = 0; j < 3; j += 1) {
        for (let i = 0; i < 3; i += 1) {
            const c = [at(i + 0.1, j + 0.1), at(i + 0.9, j + 0.1), at(i + 0.9, j + 0.9), at(i + 0.1, j + 0.9)];
            stickers.push(<path key={`${i}${j}`} d={`M${c.map((p) => p.join(' ')).join(' L')} Z`} fill={colors[j * 3 + i]} />);
        }
    }
    const corners = [o, at(3, 0), at(3, 3), at(0, 3)];
    return (
        <>
            <path d={`M${corners.map((p) => p.join(' ')).join(' L')} Z`} fill={INK} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
            {stickers}
        </>
    );
}
function Rubik() {
    const Y = YELLOW, P = PINK, T = TEAL, G = GREEN, O = ORANGE, W = '#ffffff';
    return (
        <>
            <CubeFace o={[50, 8]} u={[38, 20]} v={[-38, 20]} colors={[Y, G, Y, P, Y, T, Y, Y, O]} />
            <CubeFace o={[12, 28]} u={[38, 20]} v={[0, 44]} colors={[P, P, W, T, P, P, P, O, P]} />
            <CubeFace o={[50, 48]} u={[38, -20]} v={[0, 44]} colors={[T, T, G, T, Y, T, W, T, T]} />
        </>
    );
}

// ✨ A slap bracelet, curled up, in a loud zigzag print
function SlapBracelet() {
    const d = 'M12 62 C10 30 88 26 88 54 C88 78 34 82 34 60 C34 46 64 44 66 58';
    return (
        <>
            <path d={d} fill="none" stroke={INK} strokeWidth="17" strokeLinecap="round" />
            <path d={d} fill="none" stroke={MAGENTA} strokeWidth="12" strokeLinecap="round" />
            <path d={d} fill="none" stroke={YELLOW} strokeWidth="12" strokeDasharray="4 7" />
            <path d={d} fill="none" stroke={INK} strokeWidth="3" strokeDasharray="2 9" strokeDashoffset="-4" />
        </>
    );
}

// 🫧 A lava lamp, blobs rising and sinking
function LavaLamp() {
    return (
        <>
            <defs>
                <clipPath id="gt-retro-lava-glass">
                    <path d="M37 72 L44 24 H56 L63 72 Z" />
                </clipPath>
                <linearGradient id="gt-retro-lava-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor={MAGENTA} />
                    <stop offset="1" stopColor={PURPLE} />
                </linearGradient>
            </defs>
            <path d="M37 72 L44 24 H56 L63 72 Z" fill="url(#gt-retro-lava-fill)" />
            <g clipPath="url(#gt-retro-lava-glass)">
                <ellipse className="gt-retro-blob" cx="49" cy="60" rx="8" ry="7" fill={ORANGE} />
                <ellipse className="gt-retro-blob gt-retro-blob-late" cx="53" cy="40" rx="5" ry="6" fill={YELLOW} />
                <ellipse className="gt-retro-blob gt-retro-blob-later" cx="46" cy="30" rx="3.5" ry="4" fill={ORANGE} />
                <ellipse cx="50" cy="74" rx="16" ry="5" fill={YELLOW} />
            </g>
            <path d="M37 72 L44 24 H56 L63 72 Z" fill="none" stroke={INK} strokeWidth="2.6" strokeLinejoin="round" />
            <path d="M46 30 L42 62" stroke="rgba(255,255,255,0.5)" strokeWidth="2.4" strokeLinecap="round" />
            <path d="M44 24 L47 10 H53 L56 24 Z" fill="#b9bcd0" stroke={INK} strokeWidth="2.4" strokeLinejoin="round" />
            <path d="M37 72 H63 L70 94 H30 Z" fill="#b9bcd0" stroke={INK} strokeWidth="2.6" strokeLinejoin="round" />
            <path d="M34 84 H66" stroke={INK} strokeWidth="1.6" />
        </>
    );
}

// 🎧 A Walkman, with the headphones looped over the top
function Walkman() {
    return (
        <>
            <path d="M14 46 C14 6 86 6 86 46" fill="none" stroke={INK} strokeWidth="4" strokeLinecap="round" />
            <rect x="6" y="38" width="14" height="18" rx="6" fill={ORANGE} stroke={INK} strokeWidth="2.4" />
            <rect x="80" y="38" width="14" height="18" rx="6" fill={ORANGE} stroke={INK} strokeWidth="2.4" />
            <rect x="24" y="30" width="52" height="62" rx="6" fill={MINT} stroke={INK} strokeWidth="2.6" />
            <rect x="30" y="20" width="9" height="12" rx="2" fill={YELLOW} stroke={INK} strokeWidth="2" />
            <rect x="42" y="20" width="9" height="12" rx="2" fill={PINK} stroke={INK} strokeWidth="2" />
            <rect x="54" y="20" width="9" height="12" rx="2" fill={YELLOW} stroke={INK} strokeWidth="2" />
            <rect x="30" y="38" width="40" height="26" rx="3" fill="#1a1147" stroke={INK} strokeWidth="2" />
            <rect x="34" y="42" width="32" height="8" fill={CREAM} />
            <path d="M34 45 H66" stroke={PINK} strokeWidth="2" />
            <circle className="gt-retro-reel" cx="41" cy="57" r="4" fill="#fff" stroke={INK} strokeWidth="1.6" strokeDasharray="2 1.4" />
            <circle className="gt-retro-reel" cx="59" cy="57" r="4" fill="#fff" stroke={INK} strokeWidth="1.6" strokeDasharray="2 1.4" />
            <path d="M30 72 H70 M30 78 H70 M30 84 H58" stroke="rgba(31,31,43,0.55)" strokeWidth="2.4" strokeLinecap="round" />
            <text x="64" y="88" fontSize="7" fontWeight="900" fill={INK} fontFamily="system-ui, sans-serif" textAnchor="middle">FM</text>
        </>
    );
}

// 💾 A 3½" floppy disk
function Floppy({ body, label }) {
    return (
        <>
            <path d="M14 14 H78 L86 22 V86 H14 Z" fill={body} stroke={INK} strokeWidth="2.6" strokeLinejoin="round" />
            <rect x="30" y="14" width="38" height="26" fill="#c9cbd6" stroke={INK} strokeWidth="2.2" />
            <rect x="54" y="18" width="9" height="18" fill={body} stroke={INK} strokeWidth="1.6" />
            <rect x="24" y="50" width="52" height="36" fill={CREAM} stroke={INK} strokeWidth="2.2" />
            <path d="M24 56 H76" stroke={label} strokeWidth="3" />
            <path d="M30 66 H70 M30 74 H62" stroke="rgba(31,31,43,0.5)" strokeWidth="2.2" strokeLinecap="round" />
            <rect x="18" y="78" width="4" height="4" fill={INK} />
        </>
    );
}

// 🥚 A keychain virtual pet, with a pixel critter on its screen
function KeychainPet() {
    const px = [[3, 1], [4, 1], [2, 2], [5, 2], [2, 3], [3, 3], [4, 3], [5, 3], [1, 4], [6, 4], [2, 5], [5, 5]];
    return (
        <>
            <circle cx="50" cy="8" r="6" fill="none" stroke="#b9bcd0" strokeWidth="3" />
            <path d="M50 14 C76 14 88 40 88 60 C88 82 72 94 50 94 C28 94 12 82 12 60 C12 40 24 14 50 14 Z" fill={MAGENTA} stroke={INK} strokeWidth="2.6" />
            <path d="M24 44 C26 30 36 22 46 20" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="3" strokeLinecap="round" />
            <rect x="28" y="36" width="44" height="34" rx="5" fill="#c4ecd0" stroke={INK} strokeWidth="2.4" />
            <g className="gt-retro-pet">
                {px.map(([x, y]) => <rect key={`${x}-${y}`} x={36 + x * 3.6} y={40 + y * 3.6} width="3.6" height="3.6" fill={INK} />)}
            </g>
            <circle cx="36" cy="80" r="4.5" fill={YELLOW} stroke={INK} strokeWidth="2" />
            <circle cx="50" cy="83" r="4.5" fill={YELLOW} stroke={INK} strokeWidth="2" />
            <circle cx="64" cy="80" r="4.5" fill={YELLOW} stroke={INK} strokeWidth="2" />
        </>
    );
}

// 📼 The mixtape off the deck card
function Mixtape() {
    return (
        <>
            <rect x="8" y="22" width="84" height="56" rx="5" fill="#1f1f2b" stroke="#fff" strokeWidth="2.6" />
            <rect x="15" y="28" width="70" height="28" rx="2" fill={CREAM} />
            <path d="M15 33 H85" stroke={PINK} strokeWidth="3.6" />
            <path d="M15 38 H85" stroke={TEAL} strokeWidth="3.6" />
            <circle className="gt-retro-reel" cx="33" cy="48" r="5.5" fill="#1f1f2b" stroke="#fff" strokeWidth="1.4" strokeDasharray="2.4 1.6" />
            <circle className="gt-retro-reel" cx="67" cy="48" r="5.5" fill="#1f1f2b" stroke="#fff" strokeWidth="1.4" strokeDasharray="2.4 1.6" />
            <path d="M39 48 H61" stroke="#1f1f2b" strokeWidth="4" />
            <path d="M22 78 L26 66 H74 L78 78" fill="#3a3a4d" stroke="#fff" strokeWidth="1.6" />
        </>
    );
}

const ART = {
    trollPink: <Troll hair={MAGENTA} gem={TEAL} />,
    trollTeal: <Troll hair={TEAL} gem={PINK} />,
    trollGreen: <Troll hair={GREEN} gem={PURPLE} />,
    trollOrange: <Troll hair={ORANGE} gem={YELLOW} />,
    rubik: <Rubik />,
    bracelet: <SlapBracelet />,
    lavaLamp: <LavaLamp />,
    walkman: <Walkman />,
    floppyPurple: <Floppy body={PURPLE} label={PINK} />,
    floppyTeal: <Floppy body={TEAL} label={ORANGE} />,
    pet: <KeychainPet />,
    mixtape: <Mixtape />,
    squiggle: <path d="M8 50 q10.5 -18 21 0 t21 0 t21 0 t21 0" fill="none" stroke="#fff" strokeWidth="7" strokeLinecap="round" />,
    triangle: <path d="M18 80 L50 16 L84 80 Z" fill={GREEN} stroke={INK} strokeWidth="4" strokeLinejoin="round" />,
    diamond: <path d="M50 10 L88 50 L50 90 L12 50 Z" fill={TEAL} stroke={INK} strokeWidth="4" strokeLinejoin="round" />,
    dot: <circle cx="50" cy="50" r="36" fill={MAGENTA} stroke={INK} strokeWidth="4" />,
    zigzag: <path d="M6 60 L22 40 L38 60 L54 40 L70 60 L86 40" fill="none" stroke={YELLOW} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />,
};

// Where each piece drifts. Sizes are in vmin (with a floor in px, so a phone still gets a readable doll),
// and everything hugs the edges, where the cards in the middle don't sit.
const PIECES = [
    { art: 'trollPink',    top: '4%',  left: '1.5%', size: 17, dur: 34, delay: 0,   rot: -8 },
    { art: 'rubik',        top: '13%', left: '91%',  size: 11, dur: 40, delay: -9,  rot: 14 },
    { art: 'bracelet',     top: '1%',  left: '36%',  size: 10, dur: 30, delay: -4,  rot: -12 },
    { art: 'pet',          top: '33%', left: '91%',  size: 10, dur: 36, delay: -17, rot: 10 },
    { art: 'lavaLamp',     top: '40%', left: '-1%',  size: 18, dur: 46, delay: -6,  rot: 4 },
    { art: 'walkman',      top: '68%', left: '86%',  size: 14, dur: 42, delay: -21, rot: -10 },
    { art: 'floppyPurple', top: '78%', left: '10%',  size: 10, dur: 38, delay: -12, rot: 16 },
    { art: 'trollTeal',    top: '68%', left: '73%',  size: 15, dur: 32, delay: -3,  rot: 6 },
    { art: 'mixtape',      top: '84%', left: '27%',  size: 12, dur: 44, delay: -25, rot: -6 },
    { art: 'trollGreen',   top: '34%', left: '73%',  size: 12, dur: 37, delay: -14, rot: 10 },
    { art: 'floppyTeal',   top: '20%', left: '20%',  size: 8,  dur: 41, delay: -28, rot: -18 },
    { art: 'trollOrange',  top: '49%', left: '91%',  size: 11, dur: 35, delay: -19, rot: -4 },
    { art: 'squiggle',     top: '58%', left: '22%',  size: 8,  dur: 28, delay: -7,  rot: -10 },
    { art: 'triangle',     top: '3%',  left: '74%',  size: 5,  dur: 26, delay: -2,  rot: 12 },
    { art: 'diamond',      top: '88%', left: '76%',  size: 5,  dur: 31, delay: -11, rot: 20 },
    { art: 'dot',          top: '46%', left: '78%',  size: 4,  dur: 29, delay: -16, rot: 0 },
    { art: 'zigzag',       top: '44%', left: '28%',  size: 7,  dur: 33, delay: -22, rot: 8 },
    { art: 'diamond',      top: '64%', left: '4%',   size: 4,  dur: 27, delay: -5,  rot: -14 },
];

export default function RetroBackdrop() {
    return (
        <>
            {/* The neon sun on the horizon, and the magenta grid floor running off toward it */}
            <div className="gt-retro-sun" />
            <div className="gt-retro-floor"><div className="gt-retro-grid" /></div>

            {PIECES.map((p, i) => (
                <div
                    key={i}
                    className="gt-floater gt-retro-piece"
                    style={{
                        top: p.top,
                        left: p.left,
                        '--size': p.size,
                        '--dur': `${p.dur}s`,
                        '--delay': `${p.delay}s`,
                        '--rot': `${p.rot}deg`,
                    }}
                >
                    <svg viewBox="0 0 100 100" className="gt-retro-svg">{ART[p.art]}</svg>
                </div>
            ))}
        </>
    );
}
