import React from 'react';

// 🎓 The drawings for Trivia Cast's lobby show (QuizShow.jsx). Like the Couch Cast crew, each character is
// ~100 units tall with its feet at (0, 0), and uses the same class names for the parts that move.

const INK = '#16161d';
const ink = { stroke: INK, strokeWidth: 2.4, strokeLinejoin: 'round' };
const line = { stroke: INK, strokeLinecap: 'round', fill: 'none' };

export function Lincoln({ elRef }) {
    // A tall stovepipe hat, a chin beard with no mustache, a bow tie and a long black frock coat
    const skin = '#e0b793';
    const coat = '#23232c';
    return (
        <g ref={elRef} className="crew-actor quiz-lincoln" data-look="front">
            <g className="crew-fig">
                <g className="crew-leg crew-leg-l">
                    <rect x={-12} y={-30} width={9} height={25} fill="#2f2f39" {...ink} strokeWidth={2} />
                    <path d="M -3 0 H -18 Q -18 -6 -12 -6 H -3 Z" fill="#101016" {...ink} strokeWidth={1.8} />
                </g>
                <g className="crew-leg crew-leg-r">
                    <rect x={3} y={-30} width={9} height={25} fill="#2f2f39" {...ink} strokeWidth={2} />
                    <path d="M 3 0 H 18 Q 18 -6 12 -6 H 3 Z" fill="#101016" {...ink} strokeWidth={1.8} />
                </g>
                <path d="M -15 -62 L -18 -22 H 18 L 15 -62 Q 0 -67 -15 -62 Z" fill={coat} {...ink} />
                <path d="M -7 -63 L 0 -38 L 7 -63 Z" fill="#f2efe6" stroke={INK} strokeWidth={1.4} strokeLinejoin="round" />
                <path d="M 0 -60 L -7 -64 V -56 Z M 0 -60 L 7 -64 V -56 Z" fill="#101016" stroke={INK} strokeWidth={1} strokeLinejoin="round" />
                <rect x={-22} y={-60} width={7} height={25} rx={2} fill={coat} {...ink} strokeWidth={2} />
                <circle cx={-18.5} cy={-34} r={3.6} fill={skin} {...ink} strokeWidth={1.6} />
                <g className="crew-arm-bump">
                    <rect x={15} y={-60} width={7} height={25} rx={2} fill={coat} {...ink} strokeWidth={2} />
                    <circle cx={18.5} cy={-34} r={3.6} fill={skin} {...ink} strokeWidth={1.6} />
                </g>
                <rect x={-3.5} y={-70} width={7} height={8} fill={skin} {...ink} strokeWidth={1.8} />
                {/* A long, gaunt face */}
                <path d="M -12 -94 V -76 Q -12 -66 0 -65 Q 12 -66 12 -76 V -94 Z" fill={skin} {...ink} />
                <circle cx={-13} cy={-83} r={2.4} fill={skin} {...ink} strokeWidth={1.4} />
                <circle cx={13} cy={-83} r={2.4} fill={skin} {...ink} strokeWidth={1.4} />
                <g className="crew-eyes">
                    <circle cx={-5} cy={-85} r={2.5} fill="#f4efe4" stroke={INK} strokeWidth={0.9} />
                    <circle cx={5} cy={-85} r={2.5} fill="#f4efe4" stroke={INK} strokeWidth={0.9} />
                    <g className="crew-pupils"><circle cx={-5} cy={-85} r={1.3} fill={INK} /><circle cx={5} cy={-85} r={1.3} fill={INK} /></g>
                </g>
                <path d="M -9 -89.5 L -2 -88.5 M 9 -89.5 L 2 -88.5" {...line} strokeWidth={2.4} />
                <path d="M 0 -84 L -1.8 -77.5 H 1.5" {...line} strokeWidth={1.4} />
                <path d="M -4 -74 H 4" {...line} strokeWidth={1.6} />
                {/* The chin beard: along the jaw, with a clean upper lip */}
                <path d="M -12.5 -80 Q -13 -62 0 -60 Q 13 -62 12.5 -80 L 9 -77 Q 8 -71 4 -71 H -4 Q -8 -71 -9 -77 Z" fill="#17151a" {...ink} strokeWidth={1.4} />
                <path d="M -12 -90 Q -14 -96 -9 -96 H 9 Q 14 -96 12 -90 Q 8 -93 0 -92 Q -8 -93 -12 -90 Z" fill="#17151a" />
                {/* The hat */}
                <rect x={-12} y={-132} width={24} height={38} fill="#15151b" {...ink} />
                <rect x={-12} y={-102} width={24} height={5} fill="#3b3b47" stroke={INK} strokeWidth={1} />
                <rect x={-19} y={-98} width={38} height={5} rx={2.5} fill="#15151b" {...ink} strokeWidth={2} />
            </g>
        </g>
    );
}

export function BabeRuth({ elRef }) {
    // A round-faced slugger in old-time pinstripes and a plain navy cap, with a bat over the shoulder
    const skin = '#e8bd98';
    const flannel = '#f3f0e6';
    return (
        <g ref={elRef} className="crew-actor quiz-ruth" data-look="front">
            <g className="crew-fig">
                {/* The bat, behind everything */}
                <path d="M 16 -48 L 35 -102" stroke={INK} strokeWidth={8.5} strokeLinecap="round" />
                <path d="M 16 -48 L 35 -102" stroke="#c6924f" strokeWidth={5.5} strokeLinecap="round" />
                <g className="crew-leg crew-leg-l">
                    <rect x={-15} y={-30} width={12} height={18} fill={flannel} {...ink} strokeWidth={2} />
                    <rect x={-15} y={-14} width={12} height={9} fill="#1b2a4e" {...ink} strokeWidth={2} />
                    <path d="M -3 0 H -20 Q -20 -6 -14 -6 H -3 Z" fill="#101016" {...ink} strokeWidth={1.8} />
                </g>
                <g className="crew-leg crew-leg-r">
                    <rect x={3} y={-30} width={12} height={18} fill={flannel} {...ink} strokeWidth={2} />
                    <rect x={3} y={-14} width={12} height={9} fill="#1b2a4e" {...ink} strokeWidth={2} />
                    <path d="M 3 0 H 20 Q 20 -6 14 -6 H 3 Z" fill="#101016" {...ink} strokeWidth={1.8} />
                </g>
                {/* The barrel chest, in pinstripes */}
                <path d="M -19 -62 Q -26 -42 -19 -26 H 19 Q 26 -42 19 -62 Q 0 -68 -19 -62 Z" fill={flannel} {...ink} />
                <path d="M -13 -63 V -27 M -6.5 -64 V -26 M 6.5 -64 V -26 M 13 -63 V -27" stroke="#27386b" strokeWidth={1.1} />
                <path d="M 0 -64 V -26" stroke={INK} strokeWidth={1.6} />
                <rect x={-20} y={-31} width={40} height={5} fill="#1b2a4e" stroke={INK} strokeWidth={1.4} />
                <rect x={-28} y={-60} width={9} height={22} rx={3} fill={flannel} {...ink} strokeWidth={2} />
                <circle cx={-23.5} cy={-36} r={4.4} fill={skin} {...ink} strokeWidth={1.6} />
                <g className="crew-arm-bump">
                    <rect x={19} y={-60} width={9} height={18} rx={3} fill={flannel} {...ink} strokeWidth={2} />
                    <circle cx={23.5} cy={-41} r={4.4} fill={skin} {...ink} strokeWidth={1.6} />
                </g>
                <rect x={-5} y={-69} width={10} height={7} fill={skin} {...ink} strokeWidth={1.8} />
                <path d="M -7 -65 L 0 -58 L 7 -65 L 3 -68 H -3 Z" fill={flannel} {...ink} strokeWidth={1.4} />
                {/* The big moon face */}
                <path d="M -17 -84 Q -18 -66 0 -65 Q 18 -66 17 -84 Q 17 -94 0 -94 Q -17 -94 -17 -84 Z" fill={skin} {...ink} />
                <g className="crew-eyes">
                    <circle cx={-6.5} cy={-82} r={2.6} fill="#f4efe4" stroke={INK} strokeWidth={0.9} />
                    <circle cx={6.5} cy={-82} r={2.6} fill="#f4efe4" stroke={INK} strokeWidth={0.9} />
                    <g className="crew-pupils"><circle cx={-6.5} cy={-82} r={1.4} fill={INK} /><circle cx={6.5} cy={-82} r={1.4} fill={INK} /></g>
                </g>
                <path d="M -11 -86.5 L -3 -86 M 11 -86.5 L 3 -86" {...line} strokeWidth={2.2} />
                {/* The wide nose, and the grin */}
                <path d="M -4 -78 Q -5.5 -74 -2 -74 H 2 Q 5.5 -74 4 -78" {...line} strokeWidth={1.6} />
                <path d="M -8 -70.5 Q 0 -66.5 8 -70.5" {...line} strokeWidth={1.8} />
                {/* The cap */}
                <path d="M -17 -86 Q -18 -104 0 -104 Q 18 -104 17 -86 Z" fill="#1b2a4e" {...ink} />
                <path d="M -21 -85 Q 0 -91 21 -85 Q 0 -82 -21 -85 Z" fill="#14203d" {...ink} strokeWidth={1.8} />
                <path d="M -6 -103 V -89 M 6 -103 V -89" stroke="#3c5088" strokeWidth={1} />
            </g>
        </g>
    );
}

export function Cleopatra({ elRef }) {
    // A black bob with heavy bangs, a gold headdress with a cobra on it, and a great deal of eyeliner
    const skin = '#c98f62';
    const gold = '#e8b93c';
    return (
        <g ref={elRef} className="crew-actor quiz-cleopatra" data-look="front">
            <g className="crew-fig">
                <path d="M -15 -86 Q -22 -72 -20 -55 H -11 V -86 Z M 15 -86 Q 22 -72 20 -55 H 11 V -86 Z" fill="#111016" {...ink} strokeWidth={1.8} />
                <g className="crew-leg crew-leg-l">
                    <rect x={-11} y={-24} width={8} height={20} fill={skin} {...ink} strokeWidth={1.8} />
                    <path d="M -3 0 H -17 Q -17 -5 -11 -5 H -3 Z" fill={gold} {...ink} strokeWidth={1.6} />
                </g>
                <g className="crew-leg crew-leg-r">
                    <rect x={3} y={-24} width={8} height={20} fill={skin} {...ink} strokeWidth={1.8} />
                    <path d="M 3 0 H 17 Q 17 -5 11 -5 H 3 Z" fill={gold} {...ink} strokeWidth={1.6} />
                </g>
                {/* The white linen dress */}
                <path d="M -13 -62 L -19 -14 H 19 L 13 -62 Q 0 -66 -13 -62 Z" fill="#f6f2e4" {...ink} />
                <path d="M -9 -42 L -12 -16 M 9 -42 L 12 -16 M 0 -40 V -16" stroke="#d9d3bd" strokeWidth={1.4} />
                <path d="M -17 -38 H 17 L 4 -33 V -18 H -4 V -33 Z" fill="#2f7fd1" stroke={INK} strokeWidth={1.4} strokeLinejoin="round" />
                <rect x={-20} y={-59} width={6} height={22} rx={2} fill={skin} {...ink} strokeWidth={1.8} />
                <rect x={-21} y={-50} width={8} height={3.5} fill={gold} stroke={INK} strokeWidth={1} />
                <circle cx={-17} cy={-36} r={3.4} fill={skin} {...ink} strokeWidth={1.5} />
                <g className="crew-arm-bump">
                    <rect x={14} y={-59} width={6} height={22} rx={2} fill={skin} {...ink} strokeWidth={1.8} />
                    <rect x={13} y={-50} width={8} height={3.5} fill={gold} stroke={INK} strokeWidth={1} />
                    <circle cx={17} cy={-36} r={3.4} fill={skin} {...ink} strokeWidth={1.5} />
                </g>
                <rect x={-3.5} y={-69} width={7} height={8} fill={skin} {...ink} strokeWidth={1.8} />
                {/* The broad jeweled collar */}
                <path d="M -15 -64 Q 0 -70 15 -64 Q 12 -50 0 -48 Q -12 -50 -15 -64 Z" fill={gold} {...ink} strokeWidth={1.8} />
                <path d="M -11 -61 Q 0 -64 11 -61 Q 8 -54 0 -53 Q -8 -54 -11 -61 Z" fill="#1f8f8a" stroke={INK} strokeWidth={1} />
                <path d="M -12 -86 V -76 Q -12 -67 0 -66 Q 12 -67 12 -76 V -86 Q 0 -98 -12 -86 Z" fill={skin} {...ink} />
                <g className="crew-eyes">
                    <ellipse cx={-5.5} cy={-80} rx={3.2} ry={2.4} fill="#f8f4ea" stroke={INK} strokeWidth={1.3} />
                    <ellipse cx={5.5} cy={-80} rx={3.2} ry={2.4} fill="#f8f4ea" stroke={INK} strokeWidth={1.3} />
                    <g className="crew-pupils"><circle cx={-5.5} cy={-80} r={1.4} fill={INK} /><circle cx={5.5} cy={-80} r={1.4} fill={INK} /></g>
                </g>
                {/* The eyeliner, out past the temples, and blue lids */}
                <path d="M -9 -82 Q -6 -84.5 -2 -82 M 9 -82 Q 6 -84.5 2 -82" fill="#3a7fd0" stroke="#3a7fd0" strokeWidth={1.4} />
                <path d="M -2.5 -79.5 Q -6 -77.5 -12 -80 M 2.5 -79.5 Q 6 -77.5 12 -80" {...line} strokeWidth={1.6} />
                <path d="M -9 -86.5 Q -5 -88 -2 -86 M 9 -86.5 Q 5 -88 2 -86" {...line} strokeWidth={1.5} />
                <path d="M 0 -79 V -74.5 H 1.6" {...line} strokeWidth={1.2} />
                <path d="M -3.5 -71 Q 0 -69 3.5 -71 Q 0 -72.5 -3.5 -71 Z" fill="#a8222f" stroke="#a8222f" strokeWidth={1} />
                {/* The bangs */}
                <path d="M -15 -84 Q -16 -102 0 -102 Q 16 -102 15 -84 L 11 -84 Q 0 -88 -11 -84 Z" fill="#111016" {...ink} strokeWidth={1.8} />
                {/* The headdress and the cobra */}
                <path d="M -15 -90 Q 0 -100 15 -90 L 15 -95 Q 0 -106 -15 -95 Z" fill={gold} {...ink} strokeWidth={1.8} />
                <path d="M 0 -96 Q -4 -102 -1 -107 Q 2 -112 4 -107 Q 4 -103 1.5 -99 Z" fill="#2ea866" stroke={INK} strokeWidth={1.3} strokeLinejoin="round" />
                <circle cx={1} cy={-107.5} r={0.8} fill="#ff4d4d" />
            </g>
        </g>
    );
}

export function Earhart({ elRef }) {
    // Short curls under a leather flying cap with goggles pushed up, a bomber jacket and a white scarf
    const skin = '#ecc6a4';
    const leather = '#7a4a26';
    return (
        <g ref={elRef} className="crew-actor quiz-earhart" data-look="front">
            <g className="crew-fig">
                <g className="crew-leg crew-leg-l">
                    <rect x={-12} y={-30} width={9} height={14} fill="#c4ad84" {...ink} strokeWidth={2} />
                    <path d="M -3 0 H -17 Q -17 -6 -12 -6 V -18 H -3 Z" fill="#3b2415" {...ink} strokeWidth={1.8} />
                </g>
                <g className="crew-leg crew-leg-r">
                    <rect x={3} y={-30} width={9} height={14} fill="#c4ad84" {...ink} strokeWidth={2} />
                    <path d="M 3 0 H 17 Q 17 -6 12 -6 V -18 H 3 Z" fill="#3b2415" {...ink} strokeWidth={1.8} />
                </g>
                <path d="M -16 -62 Q -19 -42 -15 -27 H 15 Q 19 -42 16 -62 Q 0 -67 -16 -62 Z" fill={leather} {...ink} />
                <path d="M 0 -62 V -27" stroke={INK} strokeWidth={1.5} />
                <rect x={-16} y={-31} width={32} height={5} fill="#4f2f17" stroke={INK} strokeWidth={1.4} />
                <rect x={-23} y={-60} width={7} height={22} rx={2.5} fill={leather} {...ink} strokeWidth={2} />
                <circle cx={-19.5} cy={-36} r={3.6} fill={skin} {...ink} strokeWidth={1.6} />
                <g className="crew-arm-bump">
                    <rect x={16} y={-60} width={7} height={22} rx={2.5} fill={leather} {...ink} strokeWidth={2} />
                    <circle cx={19.5} cy={-36} r={3.6} fill={skin} {...ink} strokeWidth={1.6} />
                </g>
                {/* The scarf, one end flying out */}
                <path className="crew-scarf-end" d="M 3 -64 Q 16 -68 25 -60 L 30 -63 L 29 -55 Q 16 -60 4 -58 Z" fill="#fbf9f2" {...ink} strokeWidth={1.5} />
                <rect x={-3.5} y={-70} width={7} height={8} fill={skin} {...ink} strokeWidth={1.8} />
                <rect x={-10} y={-67} width={20} height={7} rx={3.5} fill="#fbf9f2" {...ink} strokeWidth={1.7} />
                <path d="M -13 -84 Q -13 -68 0 -67 Q 13 -68 13 -84 Q 13 -96 0 -96 Q -13 -96 -13 -84 Z" fill={skin} {...ink} />
                <g className="crew-eyes">
                    <circle cx={-5.5} cy={-82} r={2.5} fill="#f4efe4" stroke={INK} strokeWidth={0.9} />
                    <circle cx={5.5} cy={-82} r={2.5} fill="#f4efe4" stroke={INK} strokeWidth={0.9} />
                    <g className="crew-pupils"><circle cx={-5.5} cy={-82} r={1.3} fill={INK} /><circle cx={5.5} cy={-82} r={1.3} fill={INK} /></g>
                </g>
                <path d="M -1 -79 L -2 -75 H 1" {...line} strokeWidth={1.2} />
                <path d="M -6 -72 Q 0 -68.5 6 -72" {...line} strokeWidth={1.7} />
                {/* Curls poking out under the cap */}
                <path d="M -14 -85 q -3 3 0 5 q -2 3 1 5 M 14 -85 q 3 3 0 5 q 2 3 -1 5" fill="none" stroke="#b5793b" strokeWidth={3} strokeLinecap="round" />
                {/* The cap and goggles */}
                <path d="M -14 -84 Q -16 -103 0 -103 Q 16 -103 14 -84 Q 0 -90 -14 -84 Z" fill="#5c3519" {...ink} />
                <path d="M -13 -94 Q 0 -99 13 -94" stroke="#2b2118" strokeWidth={2.2} fill="none" />
                <circle cx={-5.5} cy={-95} r={4.2} fill="#9fd5e8" {...ink} strokeWidth={1.6} />
                <circle cx={5.5} cy={-95} r={4.2} fill="#9fd5e8" {...ink} strokeWidth={1.6} />
            </g>
        </g>
    );
}

export function Plane({ planeRef }) {
    // A little red plane, side-on and facing left (centered on 0,0), which seems to know the way home
    return (
        <g ref={planeRef} className="quiz-plane" style={{ display: 'none' }}>
            <path d="M 42 -2 L 60 -22 H 69 L 64 2 Z" fill="#a81f28" {...ink} />
            <g className="quiz-plane-pilot">
                <path d="M 2 -6 Q 2 -20 14 -20 Q 25 -20 25 -6 Z" fill="#7a4a26" {...ink} strokeWidth={2} />
                <circle cx={13} cy={-27} r={8} fill="#ecc6a4" {...ink} strokeWidth={2} />
                <path d="M 5 -28 Q 5 -37 13 -37 Q 22 -37 22 -27 Q 13 -31 5 -28 Z" fill="#5c3519" {...ink} strokeWidth={1.8} />
                <circle cx={9} cy={-33} r={2.6} fill="#9fd5e8" stroke={INK} strokeWidth={1.2} />
                <path d="M 20 -18 Q 32 -22 40 -15 L 44 -19 L 44 -11 Q 32 -15 21 -13 Z" fill="#fbf9f2" stroke={INK} strokeWidth={1.4} strokeLinejoin="round" />
            </g>
            {/* The body and the wing */}
            <path d="M -44 -4 Q -44 -14 -30 -14 L 40 -8 Q 58 -4 64 0 Q 46 8 -30 10 Q -44 10 -44 -4 Z" fill="#c8242c" {...ink} />
            <path d="M -30 1 L 56 0" stroke="#f6f2e4" strokeWidth={2.6} />
            <path d="M -16 2 Q 8 -3 32 2 L 28 14 Q 4 20 -20 14 Z" fill="#a81f28" {...ink} strokeWidth={2} />
            <path d="M -14 10 L -22 24 M 20 11 L 26 24" stroke={INK} strokeWidth={2.4} />
            <circle cx={-22} cy={26} r={4} fill="#1d1a22" {...ink} strokeWidth={1.6} />
            <circle cx={26} cy={26} r={4} fill="#1d1a22" {...ink} strokeWidth={1.6} />
            {/* The propeller */}
            <circle cx={-46} cy={-2} r={4} fill="#e8b93c" {...ink} strokeWidth={1.6} />
            <path className="quiz-prop" d="M -47 -2 Q -51 -18 -47 -26 Q -43 -18 -45 -2 Q -43 14 -47 22 Q -51 14 -47 -2 Z" fill="#3b3b47" stroke={INK} strokeWidth={1} />
        </g>
    );
}

export function Podium({ elRef, letter, color }) {
    // A game show podium, 50 wide and 46 tall, with a lit panel and a light along the top
    return (
        <g ref={elRef} className="quiz-podium">
            <path d="M -24 -38 L -20 0 H 20 L 24 -38 Z" fill="#20345f" {...ink} />
            <rect x={-27} y={-46} width={54} height={9} rx={2.5} fill="#2d4a85" {...ink} strokeWidth={2} />
            <rect className="quiz-podium-light" x={-22} y={-43.5} width={44} height={3.5} rx={1.6} fill={color} />
            <rect x={-14} y={-31} width={28} height={25} rx={3} fill={color} {...ink} strokeWidth={1.8} />
            <text x={0} y={-12} textAnchor="middle" fontSize={20} fontWeight={900} fill="#fff" stroke={INK} strokeWidth={0.6} fontFamily="system-ui, sans-serif">{letter}</text>
        </g>
    );
}

// The backdrop grows out of the floor: base 400 wide and 190 tall, stretched to fit the space under the players
// card (so the outlines keep their width however it's stretched), with the volcano off to the right
const outline = { stroke: INK, strokeWidth: 2.4, strokeLinejoin: 'round', vectorEffect: 'non-scaling-stroke' };

function Palm({ x, height, lean = 0 }) {
    const top = [x + lean, -height];
    const frond = (dx, dy) => `M ${top[0]} ${top[1]} Q ${top[0] + dx * 0.6} ${top[1] + dy - 18} ${top[0] + dx} ${top[1] + dy + 6} Q ${top[0] + dx * 0.5} ${top[1] + dy - 6} ${top[0]} ${top[1]} Z`;
    return (
        <g>
            <path d={`M ${x - 4} 0 Q ${x + lean * 0.3} ${-height * 0.5} ${top[0] - 2} ${top[1]} L ${top[0] + 2} ${top[1]} Q ${x + lean * 0.3 + 5} ${-height * 0.5} ${x + 4} 0 Z`} fill="#6b4a2c" {...outline} />
            {[[-38, 14], [38, 14], [-30, -4], [30, -4], [-14, 24], [14, 24]].map(([dx, dy]) => (
                <path key={`${dx}${dy}`} d={frond(dx, dy)} fill={dy > 10 ? '#1f8f4d' : '#2fae5f'} {...outline} />
            ))}
        </g>
    );
}

export function JungleBack({ backRef }) {
    return (
        <g ref={backRef} style={{ display: 'none' }}>
            {/* The volcano */}
            <path d="M 18 0 L 96 -146 H 138 L 214 0 Z" fill="#574a48" {...outline} />
            <path d="M 117 -146 L 214 0 H 150 L 118 -80 Z" fill="#463a39" {...outline} />
            <path d="M 96 -146 Q 117 -136 138 -146 Q 117 -156 96 -146 Z" fill="#ff7a1f" {...outline} />
            <path d="M 106 -143 Q 100 -120 108 -102 Q 114 -82 102 -52 Q 118 -80 118 -104 Q 116 -124 124 -143 Z" fill="#ff8f2e" {...outline} />
            {/* The smoke */}
            <g className="quiz-smoke">
                <circle cx={110} cy={-160} r={9} fill="#8a8486" {...outline} />
                <circle cx={124} cy={-170} r={12} fill="#9d9799" {...outline} />
                <circle cx={106} cy={-180} r={8} fill="#b3adaf" {...outline} />
            </g>
            <Palm x={-170} height={130} lean={8} />
            <Palm x={-82} height={158} lean={-10} />
            <Palm x={-8} height={118} lean={6} />
            <Palm x={172} height={124} lean={-8} />
            <path d="M -200 0 Q -190 -42 -150 -36 Q -130 -60 -96 -40 Q -70 -56 -40 -38 Q -10 -56 22 -36 Q 60 -52 92 -34 Q 130 -50 160 -34 Q 190 -44 200 0 Z" fill="#17703d" {...outline} />
        </g>
    );
}

export function JungleFront({ frontRef }) {
    // Low ferns, in front of the dinosaur's feet and behind the crew
    const fern = (x, h) => `M ${x - 22} 0 Q ${x - 18} ${-h * 0.7} ${x - 26} ${-h} Q ${x - 8} ${-h * 0.8} ${x - 6} ${-h * 0.4} Q ${x - 4} ${-h * 1.05} ${x} ${-h * 1.2} Q ${x + 4} ${-h * 1.05} ${x + 6} ${-h * 0.4} Q ${x + 8} ${-h * 0.8} ${x + 26} ${-h} Q ${x + 18} ${-h * 0.7} ${x + 22} 0 Z`;
    return (
        <g ref={frontRef} style={{ display: 'none' }}>
            {[[-178, 28], [-128, 36], [-74, 26], [-28, 38], [26, 28], [78, 36], [130, 26], [180, 34]].map(([x, h], i) => (
                <path key={x} d={fern(x, h)} fill={i % 2 ? '#25a158' : '#1a8245'} {...outline} />
            ))}
        </g>
    );
}

export function Dinosaur({ elRef }) {
    // A big green T. rex, side-on and facing left, feet at (0, 0) and about 185 tall
    const hide = '#4f9a48';
    const belly = '#b9cf7e';
    const dark = '#3a7a37';
    return (
        <g ref={elRef} className="quiz-dino" style={{ display: 'none' }}>
            <g className="quiz-dino-body">
                {/* The tail and the far leg */}
                <path d="M 26 -108 Q 92 -112 138 -66 Q 102 -78 34 -62 Z" fill={hide} {...ink} />
                <path d="M 22 -68 L 34 -22 L 18 -2 H 44 L 54 -26 L 50 -70 Z" fill={dark} {...ink} />
                {/* The body */}
                <path d="M -40 -128 Q -46 -86 -18 -58 Q 14 -40 44 -60 Q 54 -92 28 -122 Q -6 -146 -40 -128 Z" fill={hide} {...ink} />
                <path d="M -40 -118 Q -44 -84 -18 -60 Q -2 -52 12 -54 Q -20 -80 -22 -122 Z" fill={belly} stroke={INK} strokeWidth={1.8} strokeLinejoin="round" />
                <path d="M 12 -128 l 6 -9 l 6 11 M 28 -120 l 8 -8 l 4 12 M 46 -108 l 9 -6 l 2 12 M 66 -102 l 8 -5 l 2 10" fill={dark} stroke={INK} strokeWidth={1.6} strokeLinejoin="round" />
                {/* The near leg */}
                <path d="M -12 -74 Q -22 -40 -14 -20 L -30 -6 V 0 H 8 L 8 -20 Q 26 -50 20 -74 Z" fill={hide} {...ink} />
                <path d="M -30 0 v -5 M -21 0 v -5 M -12 0 v -5" stroke="#f4efe4" strokeWidth={2.4} />
                {/* The silly little arm */}
                <path d="M -32 -92 Q -48 -88 -54 -78 L -50 -74 Q -42 -82 -28 -82 Z" fill={dark} {...ink} strokeWidth={1.8} />
                <path d="M -54 -78 l -5 2 M -52 -76 l -4 4" stroke={INK} strokeWidth={1.6} strokeLinecap="round" />
                {/* The head: the top half stays put, the jaw drops to ROAR */}
                <g className="quiz-dino-head">
                    <path className="quiz-dino-jaw" d="M -24 -128 Q -60 -112 -94 -122 L -98 -130 L -22 -146 Z" fill="#c9545c" {...ink} />
                    <g className="quiz-dino-jaw">
                        <path d="M -20 -120 Q -60 -106 -96 -118 Q -102 -122 -96 -128 L -20 -134 Z" fill={hide} {...ink} />
                        <path d="M -88 -126 l 4 -8 l 3 7 M -76 -126 l 4 -8 l 3 7 M -64 -127 l 4 -8 l 3 7 M -52 -128 l 4 -8 l 3 7" fill="#fbf9f2" stroke={INK} strokeWidth={1} strokeLinejoin="round" />
                    </g>
                    <path d="M -8 -134 Q -4 -176 -36 -184 Q -74 -188 -100 -162 Q -108 -150 -100 -140 L -22 -136 Z" fill={hide} {...ink} />
                    <path d="M -96 -140 l 3 7 l 4 -7 M -84 -139 l 3 7 l 4 -7 M -72 -138 l 3 7 l 4 -7 M -60 -138 l 3 7 l 4 -7 M -48 -137 l 3 7 l 4 -7" fill="#fbf9f2" stroke={INK} strokeWidth={1} strokeLinejoin="round" />
                    <circle cx={-90} cy={-156} r={2} fill={INK} />
                    {/* A furious eye under a heavy brow */}
                    <circle cx={-44} cy={-163} r={7} fill="#ffe27a" {...ink} strokeWidth={1.8} />
                    <rect x={-46} y={-168} width={3} height={10} rx={1.5} fill={INK} />
                    <path d="M -58 -174 L -30 -166" stroke={INK} strokeWidth={4.5} strokeLinecap="round" />
                </g>
            </g>
        </g>
    );
}
