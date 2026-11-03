import React from 'react';

// 🦇 The Halloween deck's lobby cast (run by the same show as the Core deck, in CouchCrew.jsx).
// Each character is drawn like the Core crew: ~100 units tall with its feet at (0, 0), the same class
// names for the moving parts, and the fist-bump arm in the same place, so the show can run them all.

const INK = '#16161d';
const ink = { stroke: INK, strokeWidth: 2.4, strokeLinejoin: 'round' };
const line = { stroke: INK, strokeLinecap: 'round', fill: 'none' };

export function Witch({ elRef }) {
    // An old crone in a tattered dress and a hat that's seen better centuries. She "casts" with a wand.
    const skin = '#7d9a6a';
    const dress = '#3a2450';
    return (
        <g ref={elRef} className="crew-actor crew-witch" data-look="left">
            <g className="crew-fig">
                <g className="crew-leg crew-leg-l">
                    <rect x={-13} y={-30} width={8} height={25} fill="#d9d4c5" {...ink} strokeWidth={2} />
                    <path d="M -13 -24 h 8 M -13 -17 h 8 M -13 -10 h 8" stroke="#7a1226" strokeWidth={3} />
                    <path d="M -5 0 H -24 Q -18 -2 -14 -6 H -5 Z" fill="#20182a" {...ink} strokeWidth={1.8} />
                </g>
                <g className="crew-leg crew-leg-r">
                    <rect x={5} y={-30} width={8} height={25} fill="#d9d4c5" {...ink} strokeWidth={2} />
                    <path d="M 5 -24 h 8 M 5 -17 h 8 M 5 -10 h 8" stroke="#7a1226" strokeWidth={3} />
                    <path d="M 5 0 H 24 Q 18 -2 14 -6 H 5 Z" fill="#20182a" {...ink} strokeWidth={1.8} />
                </g>
                {/* The rags, with a jagged hem */}
                <path d="M -17 -63 Q -25 -42 -23 -24 L -16 -29 L -10 -21 L -3 -28 L 4 -21 L 10 -29 L 16 -22 L 23 -26 Q 25 -42 17 -63 Q 0 -67 -17 -63 Z" fill={dress} {...ink} />
                <path d="M -10 -50 l 2 12 M 7 -55 l -2 10 M -3 -40 l 1 8" stroke="#22152f" strokeWidth={1.8} strokeLinecap="round" />
                <rect x={-20} y={-45} width={40} height={5} fill="#20182a" stroke={INK} strokeWidth={1.4} />
                <rect x={-4} y={-46.5} width={8} height={8} fill="#c9a24a" stroke={INK} strokeWidth={1.4} />
                {/* The wand arm: it swings up to cast, like the robot's phone */}
                <g className="crew-arm-cast">
                    <rect x={-27} y={-59} width={7} height={22} fill={dress} {...ink} strokeWidth={2} />
                    <circle cx={-23.5} cy={-37} r={3.6} fill={skin} {...ink} strokeWidth={1.6} />
                    <path d="M -23.5 -35 V -30" stroke="#5a3a22" strokeWidth={2.4} strokeLinecap="round" />
                    <path className="crew-wand-star" d="M -23.5 -33 l 1.3 3 l 3 0.4 l -2.3 2 l 0.7 3 l -2.7 -1.6 l -2.7 1.6 l 0.7 -3 l -2.3 -2 l 3 -0.4 Z" fill="#ffd23f" stroke={INK} strokeWidth={1} strokeLinejoin="round" />
                </g>
                <g className="crew-arm-bump">
                    <rect x={20} y={-59} width={7} height={22} fill={dress} {...ink} strokeWidth={2} />
                    <circle cx={23.5} cy={-36} r={4} fill={skin} {...ink} strokeWidth={1.6} />
                </g>
                {/* Stringy hair, behind the face */}
                <path d="M -16 -88 Q -24 -72 -21 -56 L -17 -62 L -15 -54 L -11 -68 Z M 16 -88 Q 24 -72 21 -56 L 17 -62 L 15 -54 L 11 -68 Z" fill="#1d1a24" {...ink} strokeWidth={1.6} />
                <rect x={-4} y={-68} width={8} height={7} fill={skin} {...ink} strokeWidth={1.8} />
                <path d="M -15 -80 Q -16 -90 0 -91 Q 16 -90 15 -80 Q 15 -70 8 -65 Q 0 -61 -8 -65 Q -15 -70 -15 -80 Z" fill={skin} {...ink} />
                <g className="crew-eyes">
                    <ellipse cx={-7} cy={-81} rx={4} ry={3.2} fill="#e6d94a" stroke={INK} strokeWidth={1.3} />
                    <ellipse cx={7} cy={-81} rx={4} ry={3.2} fill="#e6d94a" stroke={INK} strokeWidth={1.3} />
                    <g className="crew-pupils"><rect x={-7.7} y={-83.6} width={1.5} height={5.2} rx={0.7} fill={INK} /><rect x={6.3} y={-83.6} width={1.5} height={5.2} rx={0.7} fill={INK} /></g>
                </g>
                <path d="M -12 -86 L -3 -83.5 M 12 -86 L 3 -83.5" {...line} strokeWidth={2.2} />
                {/* A hook of a nose, with a wart */}
                <path d="M 0 -81 Q -7 -74 -3 -71 Q 0 -70 2 -73" fill={skin} stroke={INK} strokeWidth={1.6} strokeLinejoin="round" />
                <circle cx={-4.5} cy={-75} r={1.2} fill="#55704a" stroke={INK} strokeWidth={0.7} />
                <path d="M -7 -67 Q 0 -64.5 7 -68" {...line} strokeWidth={1.6} />
                <path d="M 2 -66.3 l 1.2 -3 l 1.4 2.5" fill="#e8e0b8" stroke={INK} strokeWidth={0.9} strokeLinejoin="round" />
                {/* The hat: bent at the tip, and patched */}
                <path d="M -14 -92 Q -8 -106 -2 -111 L 8 -116 L 7 -106 Q 12 -100 14 -92 Z" fill="#26202e" {...ink} />
                <path d="M 1 -102 l 6 2 l -1 5 l -6 -2 Z" fill="#4e3a60" stroke={INK} strokeWidth={1.2} strokeLinejoin="round" />
                <path d="M -24 -89 Q 0 -96 24 -89 Q 0 -85 -24 -89 Z" fill="#1d1a24" {...ink} strokeWidth={2} />
            </g>
        </g>
    );
}

export function HoaPresident({ elRef }) {
    // Pressed khakis, a lanyard, a clipboard and a list of your violations
    const skin = '#d9b08c';
    const polo = '#5d7a8c';
    return (
        <g ref={elRef} className="crew-actor crew-hoa" data-look="left">
            <g className="crew-fig">
                <g className="crew-leg crew-leg-l">
                    <rect x={-14} y={-30} width={11} height={25} fill="#c2ae85" {...ink} strokeWidth={2} />
                    <path d="M -9 -28 V -7" stroke="#a08e68" strokeWidth={1.2} />
                    <path d="M -3 0 H -19 Q -19 -6 -13 -6 H -3 Z" fill="#5a3a22" {...ink} strokeWidth={1.8} />
                </g>
                <g className="crew-leg crew-leg-r">
                    <rect x={3} y={-30} width={11} height={25} fill="#c2ae85" {...ink} strokeWidth={2} />
                    <path d="M 8 -28 V -7" stroke="#a08e68" strokeWidth={1.2} />
                    <path d="M 3 0 H 19 Q 19 -6 13 -6 H 3 Z" fill="#5a3a22" {...ink} strokeWidth={1.8} />
                </g>
                <rect x={-17} y={-62} width={34} height={36} rx={3} fill={polo} {...ink} />
                <rect x={-17} y={-31} width={34} height={5} fill="#3b2a20" stroke={INK} strokeWidth={1.4} />
                <rect x={-2.5} y={-32} width={5} height={7} fill="#c9a24a" stroke={INK} strokeWidth={1.2} />
                <path d="M -8 -62 L 0 -54 L 8 -62 L 4 -65 H -4 Z" fill="#6f90a4" {...ink} strokeWidth={1.6} />
                {/* The lanyard: authority */}
                <path d="M -6 -62 L 0 -45 L 6 -62" fill="none" stroke="#b5332f" strokeWidth={1.6} />
                <rect x={-5} y={-45} width={10} height={8} rx={1} fill="#f4efe4" stroke={INK} strokeWidth={1.2} />
                <path d="M -3 -42.5 h 6 M -3 -40 h 4" stroke={INK} strokeWidth={0.9} />
                {/* The clipboard, never out of reach */}
                <rect x={-24} y={-59} width={7} height={15} fill={polo} {...ink} strokeWidth={2} />
                <rect x={-24} y={-46} width={7} height={13} fill={skin} {...ink} strokeWidth={2} />
                <rect x={-38} y={-54} width={21} height={27} rx={2} fill="#7a5a3a" {...ink} strokeWidth={1.8} />
                <rect x={-35} y={-50} width={15} height={21} fill="#f4efe4" stroke={INK} strokeWidth={1} />
                <rect x={-31} y={-56} width={7} height={4} rx={1} fill="#9aa3ad" stroke={INK} strokeWidth={1} />
                <path d="M -33 -46 h 11 M -33 -42 h 11 M -33 -38 h 11 M -33 -34 h 6" stroke="#b5332f" strokeWidth={1.1} />
                <g className="crew-arm-bump">
                    <rect x={17} y={-59} width={8} height={13} fill={polo} {...ink} strokeWidth={2} />
                    <rect x={17.5} y={-46} width={7} height={11} fill={skin} {...ink} strokeWidth={2} />
                    <circle cx={21} cy={-34} r={4.2} fill={skin} {...ink} strokeWidth={1.6} />
                </g>
                <rect x={-4} y={-68} width={8} height={7} fill={skin} {...ink} strokeWidth={1.8} />
                <rect x={-15} y={-92} width={30} height={26} rx={9} fill={skin} {...ink} />
                {/* A helmet of grey hair, with a side parting you could rule a line by */}
                <path d="M -17 -78 Q -20 -98 0 -99 Q 20 -98 17 -78 L 14 -82 Q 13 -89 -3 -90 Q -12 -89 -14 -83 Z" fill="#a8a8ac" {...ink} strokeWidth={2} />
                <path d="M -3 -98 Q -5 -94 -3 -90" stroke="#77777c" strokeWidth={1.4} fill="none" />
                <g className="crew-eyes">
                    <circle cx={-6.5} cy={-80} r={2.8} fill="#f4efe4" />
                    <circle cx={6.5} cy={-80} r={2.8} fill="#f4efe4" />
                    <g className="crew-pupils"><circle cx={-6.5} cy={-80} r={1.5} fill={INK} /><circle cx={6.5} cy={-80} r={1.5} fill={INK} /></g>
                </g>
                {/* Reading glasses, and the look over the top of them */}
                <rect x={-12} y={-83.5} width={10.5} height={7} rx={1} fill="none" stroke={INK} strokeWidth={1.5} />
                <rect x={1.5} y={-83.5} width={10.5} height={7} rx={1} fill="none" stroke={INK} strokeWidth={1.5} />
                <path d="M -1.5 -80.5 H 1.5" stroke={INK} strokeWidth={1.3} />
                <path d="M -12 -87 L -3 -85.5 M 12 -87 L 3 -85.5" {...line} strokeWidth={2.2} />
                <path d="M -1 -76 v 3.5 h 2" {...line} strokeWidth={1.2} />
                <path d="M -5 -69.5 H 5" {...line} strokeWidth={1.9} />
            </g>
        </g>
    );
}

export function Vampire({ elRef }) {
    // A gaunt old count, bored by the last four hundred years, in a cape with a blood-red lining
    const skin = '#dfe0d6';
    const suit = '#23232f';
    return (
        <g ref={elRef} className="crew-actor crew-vampire" data-look="left">
            <g className="crew-fig">
                {/* The cape hangs behind everything */}
                <path d="M -18 -66 Q -34 -36 -29 -5 L -19 -11 L -9 -5 L 9 -5 L 19 -11 L 29 -5 Q 34 -36 18 -66 Z" fill="#7a1226" {...ink} />
                <g className="crew-leg crew-leg-l">
                    <rect x={-12} y={-30} width={9} height={25} fill={suit} {...ink} strokeWidth={2} />
                    <path d="M -3 0 H -18 Q -18 -6 -12 -6 H -3 Z" fill="#101016" {...ink} strokeWidth={1.8} />
                </g>
                <g className="crew-leg crew-leg-r">
                    <rect x={3} y={-30} width={9} height={25} fill={suit} {...ink} strokeWidth={2} />
                    <path d="M 3 0 H 18 Q 18 -6 12 -6 H 3 Z" fill="#101016" {...ink} strokeWidth={1.8} />
                </g>
                <path d="M -15 -62 L -14 -27 H 14 L 15 -62 Q 0 -66 -15 -62 Z" fill={suit} {...ink} />
                <path d="M -7 -63 L 0 -36 L 7 -63 Z" fill="#ecebe2" stroke={INK} strokeWidth={1.4} strokeLinejoin="round" />
                <path d="M -4 -60 L 0 -57 L 4 -60 V -55 L 0 -57 L -4 -55 Z" fill="#7a1226" stroke={INK} strokeWidth={1} strokeLinejoin="round" />
                <rect x={-22} y={-59} width={7} height={22} fill={suit} {...ink} strokeWidth={2} />
                <path d="M -21 -37 l -1 6 M -18.5 -37 l 0 7 M -16 -37 l 1 6" stroke={skin} strokeWidth={1.6} strokeLinecap="round" />
                <g className="crew-arm-bump">
                    <rect x={15} y={-59} width={7} height={22} fill={suit} {...ink} strokeWidth={2} />
                    <path d="M 16 -37 l -1 6 M 18.5 -37 l 0 7 M 21 -37 l 1 6" stroke={skin} strokeWidth={1.6} strokeLinecap="round" />
                </g>
                {/* The great high collar */}
                <path d="M -11 -64 L -27 -96 L -14 -82 L 0 -62 L 14 -82 L 27 -96 L 11 -64 Z" fill="#7a1226" {...ink} strokeWidth={2} />
                <path d="M -11 -64 L -27 -96 L -29 -70 Z M 11 -64 L 27 -96 L 29 -70 Z" fill="#101016" {...ink} strokeWidth={2} />
                <rect x={-3.5} y={-69} width={7} height={7} fill={skin} {...ink} strokeWidth={1.8} />
                <path d="M -13 -86 Q -14 -72 -7 -66 Q 0 -62 7 -66 Q 14 -72 13 -86 Q 0 -96 -13 -86 Z" fill={skin} {...ink} />
                {/* Slicked back, with the widow's peak */}
                <path d="M -15 -82 Q -18 -100 0 -101 Q 18 -100 15 -82 L 11 -89 Q 6 -92 0 -83 Q -6 -92 -11 -89 Z" fill="#101016" {...ink} strokeWidth={1.8} />
                <g className="crew-eyes">
                    <ellipse cx={-6} cy={-79} rx={3.8} ry={2.8} fill="#2e2a38" />
                    <ellipse cx={6} cy={-79} rx={3.8} ry={2.8} fill="#2e2a38" />
                    <g className="crew-pupils"><circle cx={-6} cy={-79} r={1.5} fill="#ff3b30" /><circle cx={6} cy={-79} r={1.5} fill="#ff3b30" /></g>
                    <path d="M -10 -80 Q -6 -83 -2 -80 V -81.5 Q -6 -84 -10 -81.5 Z" fill={skin} stroke={INK} strokeWidth={1} />
                    <path d="M 10 -80 Q 6 -83 2 -80 V -81.5 Q 6 -84 10 -81.5 Z" fill={skin} stroke={INK} strokeWidth={1} />
                </g>
                <path d="M -1 -77 L -2.5 -72 H 0.5" {...line} strokeWidth={1.2} />
                <path d="M -6 -68.5 Q 0 -67 6 -70" {...line} strokeWidth={1.6} />
                <path d="M 2.5 -68.7 l 1 3.4 l 1.3 -3.9" fill="#fff" stroke={INK} strokeWidth={0.8} strokeLinejoin="round" />
            </g>
        </g>
    );
}

export function Ghost({ elRef }) {
    // A very small ghost, side-on and facing left, with one arm for haunting the screen. It floats.
    return (
        <g ref={elRef} className="crew-actor crew-ghost">
            <g className="crew-fig">
                <path d="M -14 -6 L -14 -26 A 14 14 0 0 1 14 -26 L 14 -6 L 9.3 -11 L 4.6 -6 L 0 -11 L -4.6 -6 L -9.3 -11 Z" fill="#f2f0fb" {...ink} />
                <g className="crew-cat-paw">
                    <path d="M -11 -22 Q -20 -22 -21 -15 Q -16 -14 -11 -17 Z" fill="#f2f0fb" {...ink} strokeWidth={1.8} />
                </g>
                <ellipse cx={-7} cy={-29} rx={2.6} ry={3.6} fill={INK} />
                <ellipse cx={1} cy={-29} rx={2.6} ry={3.6} fill={INK} />
                <ellipse cx={-3} cy={-21} rx={2.2} ry={3} fill={INK} />
            </g>
        </g>
    );
}

export function GothicCouch({ couchRef }) {
    // Black carved wood and oxblood velvet, with a pointed back and claw feet (same seat as the Core couch)
    const wood = '#1a1720';
    const velvet = '#5a1226';
    const cushion = '#74182f';
    return (
        <g ref={couchRef}>
            <g className="couch-legs">
                {[-82, -54, 54, 82].map((x) => (
                    <path key={x} className="couch-leg" d={`M ${x - 4} -13 H ${x + 4} L ${x + 3} -5 L ${x + 7} 0 H ${x - 7} L ${x - 3} -5 Z`} fill={wood} stroke={INK} strokeWidth={2} strokeLinejoin="round" />
                ))}
            </g>
            <g className="couch-body" stroke={INK} strokeWidth={2.4} strokeLinejoin="round">
                <rect x={-96} y={-27} width={192} height={16} rx={2} fill={wood} />
                <path d="M -88 -14 q 8 6 16 0 q 8 6 16 0 M 56 -14 q 8 6 16 0 q 8 6 16 0" fill="none" stroke="#4a4552" strokeWidth={1.4} />
                {/* The pointed back: three arches, the middle one tallest */}
                <path d="M -86 -36 V -76 Q -72 -92 -58 -84 L -46 -80 Q -28 -96 -12 -100 L 0 -112 L 12 -100 Q 28 -96 46 -80 L 58 -84 Q 72 -92 86 -76 V -36 Z" fill={wood} />
                <path d="M -78 -36 V -72 Q -66 -84 -54 -76 L -44 -72 Q -26 -88 -8 -92 L 0 -101 L 8 -92 Q 26 -88 44 -72 L 54 -76 Q 66 -84 78 -72 V -36 Z" fill={velvet} strokeWidth={1.8} />
                {/* Button tufting */}
                {[[-56, -60], [-28, -66], [0, -74], [28, -66], [56, -60], [-42, -49], [-14, -52], [14, -52], [42, -49]].map(([x, y]) => (
                    <circle key={`${x}${y}`} cx={x} cy={y} r={1.8} fill="#2e0814" strokeWidth={1} />
                ))}
                <path d="M -56 -60 L -42 -49 L -28 -66 L -14 -52 L 0 -74 L 14 -52 L 28 -66 L 42 -49 L 56 -60" fill="none" stroke="#3a0b1a" strokeWidth={1.2} />
                {[-76, -25, 26].map((x) => <path key={x} d={`M ${x} -40 q 0 -6 6 -6 h 38 q 6 0 6 6 v 8 q 0 8 -6 8 h -38 q -6 0 -6 -8 Z`} fill={cushion} />)}
                <path d="M -102 -16 V -50 Q -102 -62 -90 -62 Q -76 -62 -76 -50 V -16 Z" fill={wood} />
                <path d="M 102 -16 V -50 Q 102 -62 90 -62 Q 76 -62 76 -50 V -16 Z" fill={wood} />
                <path d="M -96 -50 q 7 -8 14 0 q -7 6 -7 0 M 96 -50 q -7 -8 -14 0 q 7 6 7 0" fill="none" stroke="#4a4552" strokeWidth={1.4} />
            </g>
        </g>
    );
}

export function Castle({ castleRef }) {
    // Grows up out of the floor, like the Core deck's mountain (base 200 wide, 160 tall). The door is at x = 0.
    const stone = '#3f3a4d';
    const shade = '#322e3f';
    const outline = { stroke: INK, strokeWidth: 2.4, strokeLinejoin: 'round', vectorEffect: 'non-scaling-stroke' };
    const windows = [[-80, -72], [80, -96], [80, -60], [-18, -92], [18, -92]];
    return (
        <g ref={castleRef} className="crew-castle" style={{ display: 'none' }}>
            <path d="M 80 -128 L 80 -160 L 60 -152 L 80 -146" fill="#7a1226" {...outline} />
            {/* The two towers, with their witch-hat roofs */}
            <rect x={-98} y={-100} width={36} height={100} fill={shade} {...outline} />
            <path d="M -104 -100 L -80 -142 L -56 -100 Z" fill="#26202e" {...outline} />
            <rect x={62} y={-128} width={36} height={128} fill={shade} {...outline} />
            {/* The wall and the keep, with battlements */}
            <path d="M -62 0 V -66 H -54 V -58 H -46 V -66 H -40 V -118 H -30 V -110 H -20 V -118 H -10 V -110 H 0 V -118 H 10 V -110 H 20 V -118 H 30 V -110 H 40 V -66 H 46 V -58 H 54 V -66 H 62 V 0 Z" fill={stone} {...outline} />
            <path d="M -32 -96 h 10 M -8 -102 h 12 M 22 -84 h 12 M -52 -40 h 12 M 36 -34 h 14 M -28 -66 h 10 M 18 -58 h 10" stroke={shade} strokeWidth={2.4} vectorEffect="non-scaling-stroke" />
            {windows.map(([x, y]) => (
                <path key={`${x}${y}`} className="crew-castle-window" d={`M ${x - 5} ${y + 14} V ${y + 4} Q ${x} ${y - 6} ${x + 5} ${y + 4} V ${y + 14} Z`} fill="#ffb347" {...outline} />
            ))}
            {/* The doorway, and the door that swings open */}
            <path d="M -20 0 V -32 Q 0 -60 20 -32 V 0 Z" fill="#0e0c12" {...outline} />
            <g className="crew-castle-door">
                <path d="M -20 0 V -32 Q 0 -60 20 -32 V 0 Z" fill="#4a3222" {...outline} />
                <path d="M -8 0 V -46 M 8 0 V -46" stroke={INK} strokeWidth={1.6} vectorEffect="non-scaling-stroke" />
                <circle cx={13} cy={-18} r={2.4} fill="#c9a24a" stroke={INK} strokeWidth={1.2} vectorEffect="non-scaling-stroke" />
            </g>
        </g>
    );
}

export function Chandelier({ chandelierRef }) {
    // Black iron, hanging from (0, 0) at the top of the screen, about 100 units tall and 110 wide
    const iron = '#14131a';
    const candles = [-46, -24, 24, 46];
    const top = (x) => 54 - Math.abs(x) / 8;
    return (
        <g ref={chandelierRef} className="crew-chandelier">
            <g className="crew-chandelier-sway">
                {/* The chain */}
                <path d="M 0 0 V 42" stroke={iron} strokeWidth={4} strokeDasharray="5 1.5" />
                {/* The arms */}
                <path d="M 0 74 Q -22 80 -36 70 Q -44 66 -46 52 M 0 74 Q 22 80 36 70 Q 44 66 46 52 M 0 62 Q -14 68 -22 62 Q -24 60 -24 54 M 0 62 Q 14 68 22 62 Q 24 60 24 54" fill="none" stroke={iron} strokeWidth={3.6} strokeLinecap="round" />
                <path d="M 0 40 L 5 50 L 3 58 L 6 66 L 3 78 L 0 90 L -3 78 L -6 66 L -3 58 L -5 50 Z" fill={iron} stroke="#3a3a48" strokeWidth={0.8} strokeLinejoin="round" />
                {/* Black crystal drops */}
                <path d="M 0 90 V 100 M -34 72 V 80 M 34 72 V 80 M -16 76 V 82 M 16 76 V 82" stroke={iron} strokeWidth={1.8} strokeLinecap="round" />
                <path d="M -34 78 l -3 7 l 3 6 l 3 -6 Z M 34 78 l -3 7 l 3 6 l 3 -6 Z M -16 81 l -2.4 5 l 2.4 5 l 2.4 -5 Z M 16 81 l -2.4 5 l 2.4 5 l 2.4 -5 Z" fill={iron} stroke="#3a3a48" strokeWidth={0.6} strokeLinejoin="round" />
                {candles.map((x) => (
                    <g key={x}>
                        <rect x={x - 3} y={top(x) - 12} width={6} height={12} fill="#2a2830" stroke={iron} strokeWidth={1} />
                        <path d={`M ${x - 6} ${top(x)} H ${x + 6} L ${x + 3} ${top(x) + 4} H ${x - 3} Z`} fill={iron} />
                        <path className="crew-flame" d={`M ${x} ${top(x) - 22} Q ${x + 4.5} ${top(x) - 15} ${x} ${top(x) - 12} Q ${x - 4.5} ${top(x) - 15} ${x} ${top(x) - 22} Z`} fill="#ffb347" stroke="#c4512c" strokeWidth={0.8} />
                    </g>
                ))}
            </g>
        </g>
    );
}

export function Bat({ elRef }) {
    return (
        <g ref={elRef} className="crew-bat" transform="translate(-200 -200)">
            <path className="crew-bat-wing crew-bat-wing-l" d="M -2 -2 Q -9 -11 -20 -8 Q -17 -4 -18 0 Q -13 -3 -11 2 Q -7 -2 -2 3 Z" fill="#14131a" stroke="#14131a" strokeWidth={0.6} strokeLinejoin="round" />
            <path className="crew-bat-wing crew-bat-wing-r" d="M 2 -2 Q 9 -11 20 -8 Q 17 -4 18 0 Q 13 -3 11 2 Q 7 -2 2 3 Z" fill="#14131a" stroke="#14131a" strokeWidth={0.6} strokeLinejoin="round" />
            <path d="M -3 -6 L -4 -10 L -1.5 -8 H 1.5 L 4 -10 L 3 -6 Q 4 2 0 6 Q -4 2 -3 -6 Z" fill="#14131a" />
            <circle cx={-1.3} cy={-5} r={0.7} fill="#ff3b30" />
            <circle cx={1.3} cy={-5} r={0.7} fill="#ff3b30" />
        </g>
    );
}

export function BroomWitch() {
    // The witch out for a ride, side-on and facing left (centered on 0,0, with her wand pointing down)
    const skin = '#7d9a6a';
    return (
        <g className="abduct-saucer">
            <path d="M -36 5 L 22 2" stroke="#5a3a22" strokeWidth={2.6} strokeLinecap="round" />
            <path d="M 21 -2 L 40 -7 L 37 0 L 42 3 L 37 5 L 40 11 L 21 6 Z" fill="#c9a24a" {...ink} strokeWidth={1.4} />
            <path d="M 25 0 L 34 -1 M 25 3 L 35 4" stroke="#8a6d2e" strokeWidth={1} />
            <path d="M -4 3 L -5 13 L -10 15 M 3 3 L 3 12 L -2 15" fill="none" stroke="#20182a" strokeWidth={2.4} strokeLinejoin="round" strokeLinecap="round" />
            <path d="M -9 -9 Q -13 2 -9 5 L -3 3 L 2 6 L 9 3 Q 8 -5 3 -9 Z" fill="#3a2450" {...ink} strokeWidth={1.4} />
            {/* The wand arm, reaching down */}
            <path d="M -6 -6 L -13 2 L -14 8" fill="none" stroke="#3a2450" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
            <path d="M -14 8 V 13" stroke="#5a3a22" strokeWidth={1.4} strokeLinecap="round" />
            <circle cx={-14} cy={14} r={1.6} fill="#ffd23f" stroke={INK} strokeWidth={0.8} />
            <path d="M 2 -18 Q 8 -10 5 -6 L 1 -9 Z" fill="#1d1a24" {...ink} strokeWidth={1.2} />
            <circle cx={-2} cy={-14} r={6.5} fill={skin} {...ink} strokeWidth={1.4} />
            <path d="M -7 -14 L -13 -10 L -7 -10 Z" fill={skin} stroke={INK} strokeWidth={1.2} strokeLinejoin="round" />
            <circle cx={-5} cy={-15.5} r={1.1} fill="#e6d94a" stroke={INK} strokeWidth={0.6} />
            <path d="M -8 -18 Q -2 -33 6 -35 L 5 -29 Q 7 -24 6 -18 Z" fill="#26202e" {...ink} strokeWidth={1.4} />
            <path d="M -13 -17 Q -1 -21 11 -17 Q -1 -14 -13 -17 Z" fill="#1d1a24" {...ink} strokeWidth={1.2} />
        </g>
    );
}
