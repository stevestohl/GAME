import React from 'react';

/**
 * 🎭 More player avatars: the characters from the games' own scenes, and some popular emoji.
 * Same rules as AVATARS in avatars.jsx (which adds these to its list): SVG shapes on a 100 x 100 canvas.
 */

const INK = '#16161d';
const ink = { stroke: INK, strokeWidth: 2.4, strokeLinejoin: 'round' };
const line = { fill: 'none', stroke: INK, strokeLinecap: 'round', strokeLinejoin: 'round' };

// A character's head, drawn with the same shapes as in its scene: (x, y) on the drawing lands at (50, cy) here
const Head = ({ x = 0, y, scale, cy = 52, children }) => (
    <g transform={`translate(50 ${cy}) scale(${scale}) translate(${-x} ${-y})`}>{children}</g>
);

// The yellow emoji face that the expressions below sit on
const EMOJI_FACE = '#ffd93b';
const Face = ({ children }) => (
    <>
        <circle cx="50" cy="50" r="31" fill={EMOJI_FACE} {...ink} />
        {children}
    </>
);

// --- 🛋️ The characters ---

const CHARACTERS = [
    {
        id: 'robot', label: 'Robot', bg: '#4dd0e1',
        draw: () => (
            <Head y={-84} scale={1.65} cy={55}>
                <rect x={-4} y={-70} width={8} height={7} fill="#6d7a86" {...ink} strokeWidth={2} />
                <circle cx={-19} cy={-81} r={3} fill="#6d7a86" {...ink} strokeWidth={1.6} />
                <circle cx={19} cy={-81} r={3} fill="#6d7a86" {...ink} strokeWidth={1.6} />
                <rect x={-16} y={-92} width={32} height={23} rx={3} fill="#e0b04a" {...ink} strokeWidth={2} />
                <path d="M 9 -92 q -2 4 2 6" stroke="#b8862e" strokeWidth={1.6} fill="none" />
                <rect x={-12} y={-87} width={24} height={8} rx={2} fill={INK} />
                <rect x={-4} y={-85.5} width={8} height={4.5} rx={1.5} fill="#ff4d3a" />
                <path d="M -8 -74 H 8" stroke={INK} strokeWidth={2.4} strokeDasharray="2 2" />
                <path d="M 6 -92 L 8 -99 L 4 -102" stroke={INK} strokeWidth={2} fill="none" strokeLinejoin="round" />
                <circle cx={4} cy={-103.5} r={2.6} fill="#ff4d3a" {...ink} strokeWidth={1.4} />
            </Head>
        ),
    },
    {
        id: 'alien', label: 'Alien', bg: '#3a2f6b',
        draw: () => (
            <Head y={-85} scale={1.6} cy={56}>
                <path d="M -15 -60 Q 0 -66 15 -60 L 18 -44 H -18 Z" fill="#2b2d42" {...ink} strokeWidth={1.8} />
                <path d="M -6 -97 L -10 -106 M 6 -97 L 10 -106" stroke={INK} strokeWidth={2} strokeLinecap="round" />
                <circle cx={-10} cy={-107} r={2.4} fill="#39ff88" {...ink} strokeWidth={1.2} />
                <circle cx={10} cy={-107} r={2.4} fill="#39ff88" {...ink} strokeWidth={1.2} />
                <path d="M 0 -100 C 21 -100 22 -82 12 -72 Q 6 -66 0 -66 Q -6 -66 -12 -72 C -22 -82 -21 -100 0 -100 Z" fill="#9fb8a8" {...ink} strokeWidth={2} />
                <path d="M -16 -85 Q -10 -91 -3 -82 Q -10 -78 -16 -85 Z" fill={INK} />
                <path d="M 16 -85 Q 10 -91 3 -82 Q 10 -78 16 -85 Z" fill={INK} />
                <circle cx={-8.5} cy={-83.5} r={1.4} fill="#39ff88" />
                <circle cx={8.5} cy={-83.5} r={1.4} fill="#39ff88" />
                <path d="M -17 -86.5 Q -10 -92 -2 -82 Q -9 -86.5 -17 -86.5 Z" fill="#9fb8a8" stroke={INK} strokeWidth={1.2} strokeLinejoin="round" />
                <path d="M 17 -86.5 Q 10 -92 2 -82 Q 9 -86.5 17 -86.5 Z" fill="#9fb8a8" stroke={INK} strokeWidth={1.2} strokeLinejoin="round" />
                <path d="M -4 -72 Q 1 -70 5.5 -74" {...line} strokeWidth={1.6} />
            </Head>
        ),
    },
    {
        id: 'sasquatch', label: 'Sasquatch', bg: '#74c69d',
        draw: () => (
            <Head x={0} y={-120} scale={1.45} cy={54}>
                <path d="M -30 -92 Q -34 -104 -24 -110 L 24 -110 Q 34 -104 30 -92 Z" fill="#6b4a32" {...ink} strokeWidth={2} />
                <path d="M -24 -110 Q -27 -140 0 -143 Q 25 -140 24 -110 Q 0 -100 -24 -110 Z" fill="#6b4a32" {...ink} strokeWidth={2} />
                <path d="M -6 -143 l 2 -6 l 3 5 l 3 -6 l 2 6" fill="#6b4a32" stroke={INK} strokeWidth={1.8} strokeLinejoin="round" />
                <ellipse cx={0} cy={-119} rx={14} ry={12} fill="#5a4e48" {...ink} strokeWidth={1.8} />
                <path d="M -13 -126 Q 0 -132 13 -126" stroke="#4a3222" strokeWidth={4} fill="none" strokeLinecap="round" />
                <circle cx={-6} cy={-122} r={2.1} fill="#f4efe4" />
                <circle cx={6} cy={-122} r={2.1} fill="#f4efe4" />
                <path d="M -2 -118 q 2 3 4 0" {...line} strokeWidth={1.6} />
                <path d="M -7 -112 Q 0 -108 7 -112" {...line} strokeWidth={1.8} />
            </Head>
        ),
    },
    {
        // The Button Burglar: bobble hat, bandit mask, striped jumper and a big grin
        id: 'burglar', label: 'Button Burglar', bg: '#bcd0ff',
        draw: () => (
            <>
                <path d="M20 100 C22 80 36 73 50 73 C64 73 78 80 80 100 Z" fill="#fff" {...ink} />
                <path d="M26 84 Q50 77 74 84 M21 95 Q50 88 79 95" fill="none" stroke="#123a9c" strokeWidth="5" />
                <circle cx="26" cy="50" r="5" fill="#fff" stroke="#123a9c" strokeWidth="2.6" />
                <circle cx="74" cy="50" r="5" fill="#fff" stroke="#123a9c" strokeWidth="2.6" />
                <ellipse cx="50" cy="52" rx="25" ry="23" fill="#fff" stroke="#123a9c" strokeWidth="2.8" />
                <path d="M25 44 Q50 34 75 44 L74 54 Q62 49 50 53 Q38 49 26 54 Z" fill="#123a9c" />
                <ellipse cx="40" cy="47" rx="6.5" ry="6" fill="#fff" />
                <ellipse cx="60" cy="47" rx="6.5" ry="6" fill="#fff" />
                <circle cx="41.5" cy="47.5" r="2.8" fill="#123a9c" />
                <circle cx="61.5" cy="47.5" r="2.8" fill="#123a9c" />
                <path d="M37 60 Q50 74 63 60 Q50 64 37 60 Z" fill="#123a9c" stroke="#123a9c" strokeWidth="2" strokeLinejoin="round" />
                <path d="M46 62.5 v4 h4 v-3.6" fill="#fff" />
                <path d="M26 37 C28 16 72 16 74 37 Q50 27 26 37 Z" fill="#123a9c" />
                <path d="M25 40 Q50 28 75 40 L74 33 Q50 21 26 33 Z" fill="#fff" stroke="#123a9c" strokeWidth="2.6" strokeLinejoin="round" />
                <path d="M34 28 v6 M42 25 v6 M50 24 v6 M58 25 v6 M66 28 v6" stroke="#123a9c" strokeWidth="2" strokeLinecap="round" />
                <circle cx="63" cy="15" r="7.5" fill="#fff" stroke="#123a9c" strokeWidth="2.6" />
            </>
        ),
    },
    {
        id: 'witch', label: 'Witch', bg: '#f4a259',
        draw: () => (
            <Head y={-88} scale={1.55} cy={53}>
                <path d="M -16 -88 Q -24 -72 -21 -56 L -17 -62 L -15 -54 L -11 -68 Z M 16 -88 Q 24 -72 21 -56 L 17 -62 L 15 -54 L 11 -68 Z" fill="#1d1a24" {...ink} strokeWidth={1.6} />
                <path d="M -15 -80 Q -16 -90 0 -91 Q 16 -90 15 -80 Q 15 -70 8 -65 Q 0 -61 -8 -65 Q -15 -70 -15 -80 Z" fill="#7d9a6a" {...ink} strokeWidth={2} />
                <ellipse cx={-7} cy={-81} rx={4} ry={3.2} fill="#e6d94a" stroke={INK} strokeWidth={1.3} />
                <ellipse cx={7} cy={-81} rx={4} ry={3.2} fill="#e6d94a" stroke={INK} strokeWidth={1.3} />
                <rect x={-7.7} y={-83.6} width={1.5} height={5.2} rx={0.7} fill={INK} />
                <rect x={6.3} y={-83.6} width={1.5} height={5.2} rx={0.7} fill={INK} />
                <path d="M -12 -86 L -3 -83.5 M 12 -86 L 3 -83.5" {...line} strokeWidth={2.2} />
                <path d="M 0 -81 Q -7 -74 -3 -71 Q 0 -70 2 -73" fill="#7d9a6a" stroke={INK} strokeWidth={1.6} strokeLinejoin="round" />
                <circle cx={-4.5} cy={-75} r={1.2} fill="#55704a" stroke={INK} strokeWidth={0.7} />
                <path d="M -7 -67 Q 0 -64.5 7 -68" {...line} strokeWidth={1.6} />
                <path d="M 2 -66.3 l 1.2 -3 l 1.4 2.5" fill="#e8e0b8" stroke={INK} strokeWidth={0.9} strokeLinejoin="round" />
                <path d="M -14 -92 Q -8 -106 -2 -111 L 8 -116 L 7 -106 Q 12 -100 14 -92 Z" fill="#26202e" {...ink} strokeWidth={2} />
                <path d="M 1 -102 l 6 2 l -1 5 l -6 -2 Z" fill="#4e3a60" stroke={INK} strokeWidth={1.2} strokeLinejoin="round" />
                <path d="M -24 -89 Q 0 -96 24 -89 Q 0 -85 -24 -89 Z" fill="#1d1a24" {...ink} strokeWidth={2} />
            </Head>
        ),
    },
    {
        id: 'vampire', label: 'Vampire', bg: '#9d4edd',
        draw: () => (
            <Head y={-79} scale={1.7} cy={52}>
                <path d="M -11 -64 L -27 -96 L -14 -82 L 0 -62 L 14 -82 L 27 -96 L 11 -64 Z" fill="#7a1226" {...ink} strokeWidth={2} />
                <path d="M -11 -64 L -27 -96 L -29 -70 Z M 11 -64 L 27 -96 L 29 -70 Z" fill="#101016" {...ink} strokeWidth={2} />
                <path d="M -13 -86 Q -14 -72 -7 -66 Q 0 -62 7 -66 Q 14 -72 13 -86 Q 0 -96 -13 -86 Z" fill="#dfe0d6" {...ink} strokeWidth={2} />
                <path d="M -15 -82 Q -18 -100 0 -101 Q 18 -100 15 -82 L 11 -89 Q 6 -92 0 -83 Q -6 -92 -11 -89 Z" fill="#101016" {...ink} strokeWidth={1.8} />
                <ellipse cx={-6} cy={-79} rx={3.8} ry={2.8} fill="#2e2a38" />
                <ellipse cx={6} cy={-79} rx={3.8} ry={2.8} fill="#2e2a38" />
                <circle cx={-6} cy={-79} r={1.5} fill="#ff3b30" />
                <circle cx={6} cy={-79} r={1.5} fill="#ff3b30" />
                <path d="M -1 -77 L -2.5 -72 H 0.5" {...line} strokeWidth={1.2} />
                <path d="M -6 -68.5 Q 0 -67 6 -70" {...line} strokeWidth={1.6} />
                <path d="M 2.5 -68.7 l 1 3.4 l 1.3 -3.9" fill="#fff" stroke={INK} strokeWidth={0.8} strokeLinejoin="round" />
            </Head>
        ),
    },
    {
        id: 'ghost', label: 'Ghost', bg: '#5a4fcf',
        draw: () => (
            <Head y={-24} scale={2.25} cy={52}>
                <path d="M -14 -6 L -14 -26 A 14 14 0 0 1 14 -26 L 14 -6 L 9.3 -11 L 4.6 -6 L 0 -11 L -4.6 -6 L -9.3 -11 Z" fill="#f2f0fb" {...ink} strokeWidth={1.4} />
                <path d="M -11 -22 Q -20 -22 -21 -15 Q -16 -14 -11 -17 Z" fill="#f2f0fb" {...ink} strokeWidth={1.2} />
                <ellipse cx={-5} cy={-29} rx={2.6} ry={3.6} fill={INK} />
                <ellipse cx={4} cy={-29} rx={2.6} ry={3.6} fill={INK} />
                <ellipse cx={-1} cy={-21} rx={2.2} ry={3} fill={INK} />
            </Head>
        ),
    },
    {
        id: 'frankenstein', label: 'Frankenstein', bg: '#ffd166',
        draw: () => (
            <Head x={-3} y={-124} scale={1.42} cy={52}>
                <rect x={-14} y={-112} width={22} height={12} fill="#5f7a4e" {...ink} strokeWidth={2} />
                <rect x={-30} y={-114} width={10} height={6} rx={1} fill="#9aa3ad" {...ink} strokeWidth={1.6} />
                <rect x={14} y={-114} width={10} height={6} rx={1} fill="#9aa3ad" {...ink} strokeWidth={1.6} />
                <rect x={-23} y={-143} width={40} height={35} rx={3} fill="#7f9c6a" {...ink} strokeWidth={2} />
                <path d="M -25 -128 V -146 H 19 V -130 L 15 -135 L 11 -131 L 6 -136 L 1 -132 L -4 -136 L -9 -132 L -14 -136 L -19 -131 Z" fill="#14131a" {...ink} strokeWidth={1.8} />
                <path d="M 2 -128 L 15 -124 M 5 -131 l -2 5 M 9 -130 l -2 5 M 13 -129 l -2 5" {...line} strokeWidth={1.3} />
                <ellipse cx={-12} cy={-122} rx={3.6} ry={3} fill="#e8e6c8" stroke={INK} strokeWidth={1.2} />
                <ellipse cx={1} cy={-122} rx={3.6} ry={3} fill="#e8e6c8" stroke={INK} strokeWidth={1.2} />
                <circle cx={-12} cy={-122} r={1.5} fill={INK} />
                <circle cx={1} cy={-122} r={1.5} fill={INK} />
                <path d="M -5 -120 L -7 -115 H -3" {...line} strokeWidth={1.5} />
                <path d="M -13 -112 H 3" {...line} strokeWidth={2} />
            </Head>
        ),
    },
    {
        // The HOA President: a crown, reading glasses and a look over the top of them
        id: 'hoa', label: 'HOA President', bg: '#90e0ef',
        draw: () => (
            <Head y={-96} scale={1.4} cy={52}>
                <rect x={-15} y={-92} width={30} height={26} rx={9} fill="#d9b08c" {...ink} strokeWidth={2} />
                <path d="M -17 -78 Q -20 -98 0 -99 Q 20 -98 17 -78 L 14 -82 Q 13 -89 -3 -90 Q -12 -89 -14 -83 Z" fill="#a8a8ac" {...ink} strokeWidth={2} />
                <path d="M -17 -106 L -20 -120 L -10 -112 L 0 -123 L 10 -112 L 20 -120 L 17 -106 Z" fill="#e0b04a" {...ink} strokeWidth={2} />
                <circle cx={-20} cy={-120} r={1.8} fill="#b5332f" stroke={INK} strokeWidth={1} />
                <circle cx={0} cy={-123} r={1.8} fill="#b5332f" stroke={INK} strokeWidth={1} />
                <circle cx={20} cy={-120} r={1.8} fill="#b5332f" stroke={INK} strokeWidth={1} />
                <rect x={-17} y={-107} width={34} height={13} rx={1.5} fill="#e0b04a" {...ink} strokeWidth={2} />
                <text x={0} y={-96.8} textAnchor="middle" fontSize={11} fontWeight={900} fill={INK} fontFamily="system-ui, sans-serif">HOA</text>
                <circle cx={-6.5} cy={-80} r={1.5} fill={INK} />
                <circle cx={6.5} cy={-80} r={1.5} fill={INK} />
                <rect x={-12} y={-83.5} width={10.5} height={7} rx={1} fill="none" stroke={INK} strokeWidth={1.5} />
                <rect x={1.5} y={-83.5} width={10.5} height={7} rx={1} fill="none" stroke={INK} strokeWidth={1.5} />
                <path d="M -1.5 -80.5 H 1.5" stroke={INK} strokeWidth={1.3} />
                <path d="M -12 -87 L -3 -85.5 M 12 -87 L 3 -85.5" {...line} strokeWidth={2.2} />
                <path d="M -5 -69.5 H 5" {...line} strokeWidth={1.9} />
            </Head>
        ),
    },
    {
        id: 'santa', label: 'Santa', bg: '#2d9d62',
        draw: () => (
            <Head x={0} y={-114} scale={1.3} cy={52}>
                <path d="M -24 -132 Q -18 -150 0 -150 Q 24 -150 30 -124 L 18 -132 Z" fill="#c8242c" {...ink} strokeWidth={2} />
                <circle cx={31} cy={-120} r={5.6} fill="#f6f4ee" {...ink} strokeWidth={1.8} />
                <ellipse cx={0} cy={-117} rx={18} ry={16} fill="#f2c9a5" {...ink} strokeWidth={2} />
                <rect x={-25} y={-136} width={49} height={10} rx={5} fill="#f6f4ee" {...ink} strokeWidth={2} />
                <circle cx={-7} cy={-120} r={2.2} fill={INK} />
                <circle cx={7} cy={-120} r={2.2} fill={INK} />
                <path d="M -13 -125 Q -7 -128 -2 -125 M 2 -125 Q 7 -128 13 -125" fill="none" stroke="#f6f4ee" strokeWidth={3} strokeLinecap="round" />
                <path d="M -21 -116 Q -28 -100 -18 -91 Q -11 -82 0 -85 Q 11 -82 18 -91 Q 28 -100 21 -116 Q 16 -106 0 -107 Q -16 -106 -21 -116 Z" fill="#f6f4ee" {...ink} strokeWidth={2} />
                <path d="M 0 -110 Q -9 -113 -14 -106 Q -6 -103 0 -106 Q 6 -103 14 -106 Q 9 -113 0 -110 Z" fill="#f6f4ee" {...ink} strokeWidth={1.6} />
                <circle cx={0} cy={-112} r={3.6} fill="#e87a6a" stroke={INK} strokeWidth={1.4} />
            </Head>
        ),
    },
    {
        // One of Temple Mix Up's two bad spies: a fedora, dark glasses and the collar turned up
        id: 'spy', label: 'Spy', bg: '#ffb703',
        draw: () => (
            <Head y={-80} scale={1.65} cy={54}>
                <path d="M -16 -56 L -16 -48 H 16 L 16 -56 Q 0 -61 -16 -56 Z" fill="#3a3d4a" {...ink} strokeWidth={1.8} />
                <path d="M -18 -62 L -7 -68 L 0 -54 L 7 -68 L 18 -62 L 14 -50 H -14 Z" fill="#c9a66b" {...ink} strokeWidth={1.8} />
                <path d="M -13 -86 V -76 Q -13 -66 0 -65 Q 13 -66 13 -76 V -86 Q 0 -94 -13 -86 Z" fill="#e6bd98" {...ink} strokeWidth={2} />
                <rect x={-12} y={-83} width={10.5} height={6.5} rx={2} fill={INK} />
                <rect x={1.5} y={-83} width={10.5} height={6.5} rx={2} fill={INK} />
                <path d="M -2 -81 H 2" stroke={INK} strokeWidth={1.4} />
                <path d="M -5 -71 Q 0 -69 5 -71" {...line} strokeWidth={1.5} />
                <path d="M -24 -89 Q 0 -96 24 -89 Q 0 -83 -24 -89 Z" fill="#2c2e38" {...ink} strokeWidth={1.8} />
                <path d="M -13 -90 Q -14 -105 -5 -106 Q 0 -102 5 -106 Q 14 -105 13 -90 Z" fill="#3a3d4a" {...ink} strokeWidth={1.8} />
                <path d="M -13 -94 Q 0 -91 13 -94" fill="none" stroke="#c9a66b" strokeWidth={2.6} />
            </Head>
        ),
    },
    {
        // Trivia Cast's T. rex, mid-roar
        id: 't-rex', label: 'T. rex', bg: '#ffb4a2',
        draw: () => (
            <>
                <path d="M66 100 C76 82 74 60 64 48 L34 66 C42 78 42 90 38 100 Z" fill="#4f9a48" {...ink} />
                <path d="M46 100 C50 88 50 80 44 72 L36 72 C42 82 42 92 38 100 Z" fill="#b9cf7e" />
                <path d="M72 44 l8 -6 l1 10 M76 58 l9 -4 l-1 10" fill="#3a7a37" {...ink} strokeWidth="2" />
                <path d="M16 58 Q36 72 62 60 L60 50 L18 50 Q13 53 16 58 Z" fill="#c9545c" {...ink} />
                <path d="M72 50 C76 30 62 18 44 20 C30 22 12 30 10 40 C9 46 14 48 20 48 L58 54 Z" fill="#4f9a48" {...ink} />
                <path d="M20 48 l3 8 l3 -7 M32 50 l3 8 l3 -7 M44 52 l3 8 l3 -7" fill="#fbf9f2" stroke={INK} strokeWidth="1.4" strokeLinejoin="round" />
                <path d="M24 61 l3 -6 l3 7 M38 63 l3 -6 l3 6" fill="#fbf9f2" stroke={INK} strokeWidth="1.4" strokeLinejoin="round" />
                <circle cx="48" cy="33" r="6" fill="#ffe14d" {...ink} strokeWidth="1.8" />
                <circle cx="47" cy="33" r="2.4" fill={INK} />
                <path d="M41 25 L55 29" {...line} strokeWidth="3" />
                <circle cx="17" cy="37" r="1.6" fill={INK} />
            </>
        ),
    },
    {
        // Trivia Cast's contestants
        id: 'lincoln', label: 'Abe Lincoln', bg: '#a0c4ff',
        draw: () => (
            <>
                <path d="M22 100 C24 84 36 78 50 78 C64 78 76 84 78 100 Z" fill="#23232c" {...ink} />
                <path d="M43 78 L50 86 L57 78 L60 86 L50 90 L40 86 Z" fill="#f4efe4" stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />
                <path d="M43 83 L50 87 L57 83 L57 91 L50 87 L43 91 Z" fill="#14141a" />
                <ellipse cx="50" cy="56" rx="19" ry="22" fill="#e0b793" {...ink} />
                <path d="M31 58 C31 78 42 84 50 84 C58 84 69 78 69 58 C65 66 60 68 50 68 C40 68 35 66 31 58 Z" fill="#23232c" {...ink} strokeWidth="1.8" />
                <circle cx="42" cy="51" r="2.4" fill={INK} />
                <circle cx="58" cy="51" r="2.4" fill={INK} />
                <path d="M38 46 H46 M54 46 H62" {...line} strokeWidth="2.4" />
                <path d="M50 52 L48 60 H52" {...line} strokeWidth="1.6" />
                <path d="M44 66 Q50 69 56 66" fill="none" stroke="#f4efe4" strokeWidth="2" strokeLinecap="round" />
                <rect x="34" y="4" width="32" height="34" fill="#23232c" {...ink} />
                <rect x="34" y="30" width="32" height="5" fill="#6d7a86" />
                <rect x="24" y="36" width="52" height="6" rx="3" fill="#23232c" {...ink} />
            </>
        ),
    },
    {
        id: 'cleopatra', label: 'Cleopatra', bg: '#4cc9f0',
        draw: () => (
            <>
                <path d="M24 26 C24 12 76 12 76 26 L78 74 L62 74 L38 74 L22 74 Z" fill="#14131a" {...ink} />
                <path d="M22 100 C24 84 36 78 50 78 C64 78 76 84 78 100 Z" fill="#e8b93c" {...ink} />
                <path d="M28 88 Q50 98 72 88" fill="none" stroke="#2a9d8f" strokeWidth="3.5" />
                <rect x="44" y="66" width="12" height="13" fill="#c98f62" />
                <ellipse cx="50" cy="51" rx="19" ry="22" fill="#c98f62" {...ink} />
                <path d="M31 46 C30 32 70 32 69 46 Q50 40 31 46 Z" fill="#14131a" />
                <path d="M36 54 Q42 49 48 54 Q42 57 36 54 Z M52 54 Q58 49 64 54 Q58 57 52 54 Z" fill="#fff" {...ink} strokeWidth="1.6" />
                <circle cx="42" cy="53.5" r="2" fill={INK} />
                <circle cx="58" cy="53.5" r="2" fill={INK} />
                <path d="M36 54 L30 52 M64 54 L70 52" {...line} strokeWidth="2.2" />
                <path d="M50 58 V62" {...line} strokeWidth="1.5" />
                <path d="M44 66 Q50 70 56 66 Q50 67 44 66 Z" fill="#b5332f" stroke="#b5332f" strokeWidth="1.6" strokeLinejoin="round" />
                <path d="M26 30 Q50 18 74 30 L73 38 Q50 27 27 38 Z" fill="#e8b93c" {...ink} strokeWidth="2" />
                <path d="M50 26 C44 18 46 8 50 8 C54 8 56 18 50 26 Z" fill="#2a9d8f" {...ink} strokeWidth="1.8" />
                <circle cx="48.5" cy="13" r="1" fill={INK} />
                <circle cx="51.5" cy="13" r="1" fill={INK} />
            </>
        ),
    },
];

// --- 😀 The emoji ---

const EMOJI = [
    {
        id: 'peach', label: 'Peach', bg: '#a7e8bd',
        draw: () => (
            <>
                <path d="M50 28 C58 14 74 14 80 20 C72 30 60 32 50 28 Z" fill="#4caf50" {...ink} />
                <path d="M50 28 C70 18 88 34 84 56 C81 74 64 84 50 76 C36 84 19 74 16 56 C12 34 30 18 50 28 Z" fill="#ff9a76" {...ink} />
                <path d="M50 28 C60 44 60 62 50 76" fill="none" stroke="#c9503c" strokeWidth="3" strokeLinecap="round" />
                <path d="M26 42 C24 50 26 58 30 62" fill="none" stroke="#ffd0b8" strokeWidth="5" strokeLinecap="round" />
            </>
        ),
    },
    {
        id: 'poop', label: 'Poop', bg: '#ffe066',
        draw: () => (
            <>
                <path d="M50 12 C54 18 64 20 62 28 C70 30 72 38 68 44 C78 46 86 56 80 68 C76 76 64 78 50 78 C36 78 24 76 20 68 C14 56 22 46 32 44 C28 38 30 30 38 28 C38 22 46 20 50 12 Z" fill="#8a5a33" {...ink} />
                <path d="M38 29 Q50 36 62 29 M31 45 Q50 54 69 45" fill="none" stroke="#5e3a1e" strokeWidth="2.4" strokeLinecap="round" />
                <circle cx="40" cy="55" r="6.5" fill="#fff" {...ink} strokeWidth="1.6" />
                <circle cx="60" cy="55" r="6.5" fill="#fff" {...ink} strokeWidth="1.6" />
                <circle cx="41" cy="56" r="3" fill={INK} />
                <circle cx="61" cy="56" r="3" fill={INK} />
                <path d="M38 66 Q50 76 62 66 Q50 69 38 66 Z" fill="#fff" {...ink} strokeWidth="1.8" />
            </>
        ),
    },
    {
        id: 'laugh-cry', label: 'Laughing', bg: '#74c0fc',
        draw: () => (
            <Face>
                <path d="M33 45 Q39 37 45 45 M55 45 Q61 37 67 45" {...line} strokeWidth="3.4" />
                <path d="M32 55 Q50 60 68 55 Q66 74 50 74 Q34 74 32 55 Z" fill="#7a2230" {...ink} strokeWidth="2.2" />
                <path d="M36 56 Q50 60 64 56 L63 60 Q50 63 37 60 Z" fill="#fff" />
                <path d="M26 46 C20 52 18 58 22 61 C27 62 29 54 26 46 Z M74 46 C80 52 82 58 78 61 C73 62 71 54 74 46 Z" fill="#4dabf7" {...ink} strokeWidth="1.6" />
            </Face>
        ),
    },
    {
        id: 'heart-eyes', label: 'Heart eyes', bg: '#ffc2d1',
        draw: () => (
            <Face>
                <path d="M38 52 C28 44 28 35 34 35 C37 35 38 38 38 38 C38 38 39 35 42 35 C48 35 48 44 38 52 Z M62 52 C52 44 52 35 58 35 C61 35 62 38 62 38 C62 38 63 35 66 35 C72 35 72 44 62 52 Z" fill="#e63946" {...ink} strokeWidth="1.6" />
                <path d="M34 60 Q50 76 66 60 Q50 65 34 60 Z" fill="#7a2230" {...ink} strokeWidth="2.2" />
            </Face>
        ),
    },
    {
        id: 'cool', label: 'Cool', bg: '#90dbf4',
        draw: () => (
            <Face>
                <path d="M23 42 H77 V47 Q74 58 62 58 Q53 58 51 47 H49 Q47 58 38 58 Q26 58 23 47 Z" fill="#16161d" />
                <path d="M30 46 L36 46 L32 53 Z M58 46 L64 46 L60 53 Z" fill="#6c757d" />
                <path d="M38 67 Q52 75 64 63" {...line} strokeWidth="3.4" />
            </Face>
        ),
    },
    {
        id: 'wink', label: 'Wink', bg: '#d0bfff',
        draw: () => (
            <Face>
                <ellipse cx="39" cy="44" rx="4" ry="6" fill={INK} />
                <path d="M55 45 Q61 39 67 45" {...line} strokeWidth="3.4" />
                <path d="M34 59 Q50 76 66 59" {...line} strokeWidth="3.4" />
                <path d="M54 66 Q56 78 62 76 Q66 74 62 63 Z" fill="#ff6b81" {...ink} strokeWidth="1.8" />
            </Face>
        ),
    },
    {
        id: 'party', label: 'Party', bg: '#b9fbc0',
        draw: () => (
            <Face>
                <path d="M34 22 L50 2 L64 24 Q49 15 34 22 Z" fill="#7b2cbf" {...ink} strokeWidth="2" />
                <path d="M43 11 L55 16 M38 17 L60 22" stroke="#ffd93b" strokeWidth="2.6" />
                <circle cx="50" cy="3" r="3.6" fill="#ff6b81" {...ink} strokeWidth="1.4" />
                <path d="M33 47 Q39 41 45 47 M55 47 Q61 41 67 47" {...line} strokeWidth="3.2" />
                <path d="M38 60 Q44 66 50 62" {...line} strokeWidth="3" />
                <path d="M50 62 L72 56 L74 64 Z" fill="#ff6b81" {...ink} strokeWidth="1.8" />
                <path d="M78 54 h4 M77 60 l5 2 M76 49 l3 -3" stroke="#e63946" strokeWidth="2.6" strokeLinecap="round" />
                <path d="M18 34 l4 4 M14 50 h5 M84 28 l-3 4" stroke="#2a9d8f" strokeWidth="2.8" strokeLinecap="round" />
            </Face>
        ),
    },
    {
        id: 'skull', label: 'Skull', bg: '#ff8fab',
        draw: () => (
            <>
                <path d="M50 16 C72 16 82 32 80 48 C79 58 74 62 68 65 V76 Q68 80 64 80 H36 Q32 80 32 76 V65 C26 62 21 58 20 48 C18 32 28 16 50 16 Z" fill="#f8f9fa" {...ink} />
                <ellipse cx="37" cy="47" rx="9" ry="10" fill={INK} />
                <ellipse cx="63" cy="47" rx="9" ry="10" fill={INK} />
                <path d="M50 56 L45 66 H55 Z" fill={INK} />
                <path d="M42 72 V80 M50 72 V80 M58 72 V80" stroke={INK} strokeWidth="2.4" />
            </>
        ),
    },
    {
        id: 'clown', label: 'Clown', bg: '#ffec99',
        draw: () => (
            <>
                <circle cx="24" cy="40" r="12" fill="#ff6b6b" {...ink} />
                <circle cx="76" cy="40" r="12" fill="#ff6b6b" {...ink} />
                <circle cx="50" cy="52" r="28" fill="#fff" {...ink} />
                <path d="M34 20 L50 2 L66 20 Q50 13 34 20 Z" fill="#4dabf7" {...ink} strokeWidth="2" />
                <circle cx="50" cy="3" r="4" fill="#ffd93b" {...ink} strokeWidth="1.4" />
                <path d="M37 37 V49 M63 37 V49" stroke="#7048e8" strokeWidth="7" strokeLinecap="round" />
                <circle cx="38" cy="44" r="2.6" fill={INK} />
                <circle cx="62" cy="44" r="2.6" fill={INK} />
                <circle cx="50" cy="55" r="6" fill="#e63946" {...ink} strokeWidth="1.8" />
                <path d="M30 60 Q50 84 70 60 Q50 68 30 60 Z" fill="#e63946" {...ink} strokeWidth="2" />
            </>
        ),
    },
    {
        id: 'unicorn', label: 'Unicorn', bg: '#c8b6ff',
        draw: () => (
            <>
                <path d="M70 24 C84 34 86 58 76 78 L66 62 Z" fill="#ff8fab" {...ink} />
                <path d="M72 42 C82 50 82 64 76 78 L68 62 Z" fill="#74c0fc" />
                <path d="M54 22 L58 2 L65 22 Z" fill="#ffd93b" {...ink} strokeWidth="2" />
                <path d="M55 15 L63 18 M57 8 L61 10" stroke="#e8890c" strokeWidth="1.8" />
                <path d="M68 86 C70 60 72 40 60 26 C50 18 36 22 34 36 L18 56 C14 62 18 70 26 68 C34 70 40 66 44 62 C46 72 44 80 40 88 Z" fill="#fff" {...ink} />
                <path d="M62 26 L72 14 L72 32 Z" fill="#fff" {...ink} strokeWidth="2" />
                <circle cx="44" cy="42" r="3.4" fill={INK} />
                <circle cx="23" cy="60" r="1.6" fill={INK} />
                <path d="M26 66 Q32 66 36 62" {...line} strokeWidth="1.8" />
                <ellipse cx="36" cy="52" rx="5" ry="3" fill="#ffc2d1" />
            </>
        ),
    },
    {
        id: 'monkey', label: 'Monkey', bg: '#b5e48c',
        draw: () => (
            <>
                <circle cx="20" cy="46" r="11" fill="#8a5a33" {...ink} />
                <circle cx="80" cy="46" r="11" fill="#8a5a33" {...ink} />
                <circle cx="20" cy="46" r="6" fill="#f2c9a5" />
                <circle cx="80" cy="46" r="6" fill="#f2c9a5" />
                <circle cx="50" cy="48" r="29" fill="#8a5a33" {...ink} />
                <path d="M30 42 C30 28 48 28 50 36 C52 28 70 28 70 42 C72 50 70 56 66 60 C62 72 38 72 34 60 C30 56 28 50 30 42 Z" fill="#f2c9a5" />
                <ellipse cx="41" cy="43" rx="3.4" ry="4.6" fill={INK} />
                <ellipse cx="59" cy="43" rx="3.4" ry="4.6" fill={INK} />
                <path d="M46 52 h1 M53 52 h1" {...line} strokeWidth="2.6" />
                <path d="M37 59 Q50 72 63 59" {...line} strokeWidth="3" />
            </>
        ),
    },
    {
        id: 'fire', label: 'Fire', bg: '#3a2f6b',
        draw: () => (
            <>
                <path d="M52 8 C58 26 78 36 78 60 C78 78 64 88 50 88 C34 88 22 76 22 60 C22 46 30 40 34 28 C38 34 40 38 42 42 C48 32 52 22 52 8 Z" fill="#ff6b1a" {...ink} />
                <path d="M52 40 C56 50 66 54 66 66 C66 78 58 84 50 84 C42 84 34 78 34 67 C34 60 38 56 41 52 C43 56 45 58 47 58 C50 54 52 48 52 40 Z" fill="#ffd93b" />
            </>
        ),
    },
    {
        id: 'pizza', label: 'Pizza', bg: '#ff8787',
        draw: () => (
            <>
                <path d="M50 88 L16 26 Q50 8 84 26 Z" fill="#ffd166" {...ink} />
                <path d="M16 26 Q50 8 84 26 L79 35 Q50 18 21 35 Z" fill="#c98a4b" {...ink} strokeWidth="2" />
                <circle cx="40" cy="38" r="7" fill="#d62828" {...ink} strokeWidth="1.6" />
                <circle cx="62" cy="42" r="7" fill="#d62828" {...ink} strokeWidth="1.6" />
                <circle cx="49" cy="62" r="6.5" fill="#d62828" {...ink} strokeWidth="1.6" />
                <path d="M30 42 q-1 8 2 12 q3 -2 2 -8 Z M70 52 q-1 8 -6 12 q-2 -4 1 -10 Z" fill="#ffb703" />
            </>
        ),
    },
    {
        id: 'taco', label: 'Taco', bg: '#48cae4',
        draw: () => (
            <>
                <path d="M18 56 C20 38 34 28 50 26 C66 28 80 38 82 56 Z" fill="#70c04a" {...ink} />
                <circle cx="36" cy="38" r="6" fill="#e63946" {...ink} strokeWidth="1.6" />
                <circle cx="62" cy="36" r="6" fill="#e63946" {...ink} strokeWidth="1.6" />
                <path d="M46 32 h9 v7 h-9 Z" fill="#ffd93b" {...ink} strokeWidth="1.4" />
                <path d="M12 76 C12 52 30 40 50 40 C70 40 88 52 88 76 Q88 78 86 78 H14 Q12 78 12 76 Z" fill="#f4c542" {...ink} />
                <circle cx="34" cy="60" r="2" fill="#c98a12" />
                <circle cx="52" cy="54" r="2" fill="#c98a12" />
                <circle cx="68" cy="64" r="2" fill="#c98a12" />
                <circle cx="46" cy="69" r="2" fill="#c98a12" />
            </>
        ),
    },
    {
        id: 'rainbow', label: 'Rainbow', bg: '#8ecae6',
        draw: () => (
            <>
                <path d="M12 72 A38 38 0 0 1 88 72" fill="none" stroke="#e63946" strokeWidth="7" />
                <path d="M19 72 A31 31 0 0 1 81 72" fill="none" stroke="#fb8500" strokeWidth="7" />
                <path d="M26 72 A24 24 0 0 1 74 72" fill="none" stroke="#ffd93b" strokeWidth="7" />
                <path d="M33 72 A17 17 0 0 1 67 72" fill="none" stroke="#38b000" strokeWidth="7" />
                <path d="M40 72 A10 10 0 0 1 60 72" fill="none" stroke="#3a86ff" strokeWidth="7" />
                <path d="M6 78 C6 68 16 66 20 70 C26 64 36 70 32 78 Q32 82 28 82 H10 Q6 82 6 78 Z" fill="#fff" {...ink} strokeWidth="2" />
                <path d="M68 78 C68 68 78 66 82 70 C88 64 98 70 94 78 Q94 82 90 82 H72 Q68 82 68 78 Z" fill="#fff" {...ink} strokeWidth="2" />
            </>
        ),
    },
    {
        id: 'star', label: 'Star', bg: '#5a4fcf',
        draw: () => (
            <>
                <path d="M50 12 L61 37 L88 40 L68 58 L74 85 L50 71 L26 85 L32 58 L12 40 L39 37 Z" fill="#ffd93b" {...ink} strokeWidth="3" />
                <ellipse cx="42" cy="48" rx="3" ry="4.5" fill={INK} />
                <ellipse cx="58" cy="48" rx="3" ry="4.5" fill={INK} />
                <path d="M42 57 Q50 65 58 57" {...line} strokeWidth="2.8" />
            </>
        ),
    },
];

export const MORE_AVATARS = [...CHARACTERS, ...EMOJI];
