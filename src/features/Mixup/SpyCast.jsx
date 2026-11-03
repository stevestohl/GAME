import React from 'react';

// 🕵️ The drawings for Temple Mix Up's two very bad spies (SpyShow.jsx). Each is ~100 units tall with its feet at
// (0, 0), and wears its disguises as `gear`: groups that are switched on and off with wearGear().

const INK = '#16161d';
const ink = { stroke: INK, strokeWidth: 2.4, strokeLinejoin: 'round' };
const line = { stroke: INK, strokeLinecap: 'round', fill: 'none' };

/** Put these disguises on this spy, and take everything else off */
export const wearGear = (el, gear = []) => {
    el.querySelectorAll('[data-gear]').forEach((g) => { g.style.display = gear.includes(g.dataset.gear) ? '' : 'none'; });
};

export function Spy({ elRef, suit = '#5c4a3a', tie = '#e5484d', skin = '#e2b692', hair = '#2c2118' }) {
    return (
        <g ref={elRef} className="crew-actor spy-agent" data-look="front">
            <g className="crew-fig">
                {/* A parachute, for arriving */}
                <g data-gear="chute" style={{ display: 'none' }}>
                    <path d="M -46 -118 Q 0 -178 46 -118 Q 34 -128 23 -118 Q 11 -128 0 -118 Q -11 -128 -23 -118 Q -34 -128 -46 -118 Z" fill="#f2d774" {...ink} />
                    <path d="M -23 -118 Q 0 -178 23 -118" fill="#e5484d" stroke={INK} strokeWidth={1.8} />
                    <path d="M -46 -118 L -16 -60 M -23 -118 L -10 -60 M 23 -118 L 10 -60 M 46 -118 L 16 -60" stroke={INK} strokeWidth={1.2} />
                </g>
                <g className="crew-leg crew-leg-l">
                    <rect x={-12} y={-30} width={9} height={25} fill={suit} {...ink} strokeWidth={2} />
                    <path d="M -3 0 H -18 Q -18 -6 -12 -6 H -3 Z" fill="#101016" {...ink} strokeWidth={1.8} />
                </g>
                <g className="crew-leg crew-leg-r">
                    <rect x={3} y={-30} width={9} height={25} fill={suit} {...ink} strokeWidth={2} />
                    <path d="M 3 0 H 18 Q 18 -6 12 -6 H 3 Z" fill="#101016" {...ink} strokeWidth={1.8} />
                </g>
                <path d="M -16 -62 L -16 -26 H 16 L 16 -62 Q 0 -67 -16 -62 Z" fill={suit} {...ink} />
                <path d="M -7 -63 L 0 -38 L 7 -63 Z" fill="#f6f4ee" stroke={INK} strokeWidth={1.4} strokeLinejoin="round" />
                <path d="M 0 -60 L -3 -50 L 0 -40 L 3 -50 Z" fill={tie} stroke={INK} strokeWidth={1} strokeLinejoin="round" />
                <rect x={-24} y={-60} width={8} height={24} rx={3} fill={suit} {...ink} strokeWidth={2} />
                <circle cx={-20} cy={-34} r={3.8} fill={skin} {...ink} strokeWidth={1.6} />
                <g className="crew-arm-bump">
                    <rect x={16} y={-60} width={8} height={24} rx={3} fill={suit} {...ink} strokeWidth={2} />
                    <circle cx={20} cy={-34} r={3.8} fill={skin} {...ink} strokeWidth={1.6} />
                </g>
                <rect x={-4} y={-70} width={8} height={8} fill={skin} {...ink} strokeWidth={1.8} />
                <path d="M -13 -86 V -76 Q -13 -66 0 -65 Q 13 -66 13 -76 V -86 Q 0 -94 -13 -86 Z" fill={skin} {...ink} />
                <g className="crew-eyes">
                    <circle cx={-5.5} cy={-79} r={2.8} fill="#f4efe4" stroke={INK} strokeWidth={0.9} />
                    <circle cx={5.5} cy={-79} r={2.8} fill="#f4efe4" stroke={INK} strokeWidth={0.9} />
                    <g className="crew-pupils"><circle cx={-5.5} cy={-79} r={1.4} fill={INK} /><circle cx={5.5} cy={-79} r={1.4} fill={INK} /></g>
                </g>
                <path d="M -5 -70 Q 0 -67.5 5 -70" {...line} strokeWidth={1.6} />
                <path d="M -14 -84 Q -15 -97 0 -97 Q 15 -97 14 -84 L 9 -90 H -9 Z" fill={hair} {...ink} strokeWidth={2} />

                {/* Trench coat and fedora */}
                <g data-gear="trench" style={{ display: 'none' }}>
                    <path d="M -19 -63 L -26 -18 H 26 L 19 -63 Q 0 -68 -19 -63 Z" fill="#b39a6b" {...ink} />
                    <path d="M 0 -63 V -18 M -22 -44 H 22" stroke={INK} strokeWidth={2} />
                    <path d="M -9 -65 L 0 -50 L 9 -65 L 16 -56 L 3 -42 H -3 L -16 -56 Z" fill="#a08755" {...ink} strokeWidth={1.6} />
                    <rect x={-27} y={-60} width={8} height={26} rx={3} fill="#b39a6b" {...ink} strokeWidth={2} />
                    <rect x={19} y={-60} width={8} height={26} rx={3} fill="#b39a6b" {...ink} strokeWidth={2} />
                    <path d="M -16 -88 Q -15 -104 0 -104 Q 15 -104 16 -88 Z" fill="#3a3a44" {...ink} />
                    <path d="M -26 -88 Q 0 -94 26 -88 Q 0 -83 -26 -88 Z" fill="#2c2c34" {...ink} strokeWidth={2} />
                    <rect x={-15} y={-94} width={30} height={4} fill="#e5484d" />
                </g>

                {/* The fake glasses, nose and mustache */}
                <g data-gear="nose" style={{ display: 'none' }}>
                    <circle cx={-6.5} cy={-79} r={6} fill="#fff" fillOpacity={0.5} stroke={INK} strokeWidth={2.4} />
                    <circle cx={6.5} cy={-79} r={6} fill="#fff" fillOpacity={0.5} stroke={INK} strokeWidth={2.4} />
                    <path d="M -13 -87 Q -7 -93 -1 -87 M 1 -87 Q 7 -93 13 -87" fill="none" stroke={INK} strokeWidth={4} strokeLinecap="round" />
                    <path d="M 0 -80 Q -10 -66 0 -66 Q 8 -66 4 -76 Z" fill="#f4a58f" {...ink} strokeWidth={2} />
                    <path d="M -15 -66 Q -6 -71 0 -65 Q 6 -71 15 -66 Q 8 -60 0 -62 Q -8 -60 -15 -66 Z" fill="#14131a" {...ink} strokeWidth={1.2} />
                </g>

                {/* The newspaper, with an eye-hole cut in it */}
                <g data-gear="paper" style={{ display: 'none' }}>
                    <rect x={-29} y={-98} width={58} height={46} rx={1.5} fill="#f4f1e6" {...ink} strokeWidth={2} />
                    <path d="M 0 -98 V -52" stroke="#a9a598" strokeWidth={1.2} />
                    <text x={-14.5} y={-90} textAnchor="middle" fontSize={5.4} fontWeight={900} fill={INK} fontFamily="Georgia, serif">THE DAILY</text>
                    <text x={14.5} y={-90} textAnchor="middle" fontSize={5.4} fontWeight={900} fill={INK} fontFamily="Georgia, serif">NEWS</text>
                    <path d="M -25 -70 H -5 M -25 -66 H -5 M -25 -62 H -5 M -25 -58 H -5 M 5 -70 H 25 M 5 -66 H 25 M 5 -62 H 25 M 5 -58 H 25" stroke="#8f8b7e" strokeWidth={1.2} />
                    <ellipse cx={-13} cy={-80} rx={5.5} ry={4.5} fill="#14131a" />
                    <ellipse cx={13} cy={-80} rx={5.5} ry={4.5} fill="#14131a" />
                    <g className="spy-peek"><circle cx={-13} cy={-80} r={2.6} fill="#fff" /><circle cx={13} cy={-80} r={2.6} fill="#fff" /></g>
                    <circle cx={-29} cy={-54} r={3.8} fill={skin} {...ink} strokeWidth={1.6} />
                    <circle cx={29} cy={-54} r={3.8} fill={skin} {...ink} strokeWidth={1.6} />
                </g>

                {/* The suitcase */}
                <g data-gear="case" style={{ display: 'none' }}>
                    <rect x={13} y={-30} width={28} height={20} rx={2} fill="#3d2a1a" {...ink} strokeWidth={2} />
                    <rect x={23} y={-34} width={8} height={5} fill="none" stroke={INK} strokeWidth={2} />
                    <rect x={25} y={-22} width={4} height={4} fill="#e8b93c" />
                </g>

                {/* Hands up! */}
                <g data-gear="hands" style={{ display: 'none' }}>
                    <path d="M -18 -60 L -26 -88 M 18 -60 L 26 -88" stroke={INK} strokeWidth={10} strokeLinecap="round" />
                    <path d="M -18 -60 L -26 -88 M 18 -60 L 26 -88" stroke={suit} strokeWidth={6} strokeLinecap="round" />
                    <circle cx={-27} cy={-93} r={4} fill={skin} {...ink} strokeWidth={1.6} />
                    <circle cx={27} cy={-93} r={4} fill={skin} {...ink} strokeWidth={1.6} />
                </g>
            </g>
        </g>
    );
}

export function Bush({ elRef }) {
    return (
        <g ref={elRef} className="spy-bush" style={{ display: 'none' }}>
            <g className="spy-bush-leaves">
                <path d="M -46 0 Q -62 -22 -46 -38 Q -52 -64 -24 -68 Q -14 -90 12 -78 Q 40 -82 40 -56 Q 62 -44 48 -22 Q 56 0 40 0 Z" fill="#2fa84f" {...ink} />
                <path d="M -26 -46 q 7 -7 14 0 M 12 -30 q 7 -7 14 0 M -20 -20 q 7 -7 14 0 M 18 -60 q 6 -6 12 0" fill="none" stroke="#1d7a38" strokeWidth={2.8} strokeLinecap="round" />
            </g>
        </g>
    );
}

export function PoliceCar({ elRef }) {
    // Side-on and facing left, 170 long with its wheels on y = 0. `.has-prisoners`: two sorry faces in the back
    return (
        <g ref={elRef} className="spy-car" style={{ display: 'none' }}>
            <path d="M -86 -14 Q -88 -32 -60 -34 L -38 -36 L -18 -62 H 44 L 62 -36 L 82 -32 Q 92 -28 88 -14 Z" fill="#f4f4f6" {...ink} />
            <path d="M -86 -22 H 88 V -14 H -86 Z" fill="#14182c" />
            <path d="M -30 -37 L -13 -57 H 10 V -37 Z M 16 -37 V -57 H 41 L 54 -37 Z" fill="#a9d6ec" stroke={INK} strokeWidth={2} strokeLinejoin="round" />
            {/* The officer at the wheel */}
            <g className="spy-car-cop">
                <circle cx={-6} cy={-44} r={7} fill="#e2b692" stroke={INK} strokeWidth={1.6} />
                <path d="M -15 -49 H 3 L 1 -55 H -12 Z" fill="#1d2a52" stroke={INK} strokeWidth={1.4} strokeLinejoin="round" />
                <circle cx={-9} cy={-44} r={1.2} fill={INK} />
            </g>
            {/* The back seat */}
            <g className="spy-car-prisoners">
                <circle cx={24} cy={-44} r={6.5} fill="#e2b692" stroke={INK} strokeWidth={1.5} />
                <circle cx={40} cy={-44} r={6.5} fill="#dcb08a" stroke={INK} strokeWidth={1.5} />
                <path d="M 21 -41 q 3 -2 6 0 M 37 -41 q 3 -2 6 0" fill="none" stroke={INK} strokeWidth={1.2} />
                <path d="M 18 -57 V -37 M 26 -57 V -37 M 34 -57 V -37 M 44 -57 V -37" stroke={INK} strokeWidth={1.4} />
            </g>
            <text x={2} y={-25} textAnchor="middle" fontSize={8.5} fontWeight={900} fill="#fff" fontFamily="system-ui, sans-serif">POLICE</text>
            <rect x={-2} y={-68} width={24} height={7} rx={2.4} fill="#14182c" stroke={INK} strokeWidth={1.6} />
            <rect className="spy-siren spy-siren-red" x={-1} y={-67} width={11} height={5} fill="#ff3b3b" />
            <rect className="spy-siren spy-siren-blue" x={10} y={-67} width={11} height={5} fill="#3b7bff" />
            <circle cx={-52} cy={-12} r={13} fill="#1d1a22" {...ink} />
            <circle cx={-52} cy={-12} r={5} fill="#9aa3ad" stroke={INK} strokeWidth={1.4} />
            <circle cx={54} cy={-12} r={13} fill="#1d1a22" {...ink} />
            <circle cx={54} cy={-12} r={5} fill="#9aa3ad" stroke={INK} strokeWidth={1.4} />
            <rect x={-92} y={-30} width={8} height={7} rx={2} fill="#ffe27a" stroke={INK} strokeWidth={1.3} />
        </g>
    );
}

export function Officer({ elRef }) {
    return (
        <g ref={elRef} className="crew-actor spy-officer" style={{ display: 'none' }} data-look="right">
            <g className="crew-fig">
                <g className="crew-leg crew-leg-l">
                    <rect x={-13} y={-30} width={10} height={25} fill="#1d2a52" {...ink} strokeWidth={2} />
                    <path d="M -3 0 H -19 Q -19 -6 -13 -6 H -3 Z" fill="#101016" {...ink} strokeWidth={1.8} />
                </g>
                <g className="crew-leg crew-leg-r">
                    <rect x={3} y={-30} width={10} height={25} fill="#1d2a52" {...ink} strokeWidth={2} />
                    <path d="M 3 0 H 19 Q 19 -6 13 -6 H 3 Z" fill="#101016" {...ink} strokeWidth={1.8} />
                </g>
                <path d="M -18 -62 L -18 -26 H 18 L 18 -62 Q 0 -67 -18 -62 Z" fill="#2c4178" {...ink} />
                <rect x={-18} y={-31} width={36} height={6} fill="#14131a" />
                <path d="M -9 -52 l 3 -3 l 3 3 v 5 l -3 2 l -3 -2 Z" fill="#e8b93c" stroke={INK} strokeWidth={1.1} />
                <rect x={-26} y={-60} width={8} height={24} rx={3} fill="#2c4178" {...ink} strokeWidth={2} />
                <circle cx={-22} cy={-34} r={3.8} fill="#d8a981" {...ink} strokeWidth={1.6} />
                <g className="crew-arm-bump">
                    <rect x={18} y={-60} width={8} height={24} rx={3} fill="#2c4178" {...ink} strokeWidth={2} />
                    <circle cx={22} cy={-34} r={3.8} fill="#d8a981" {...ink} strokeWidth={1.6} />
                </g>
                <rect x={-4} y={-70} width={8} height={8} fill="#d8a981" {...ink} strokeWidth={1.8} />
                <path d="M -13 -86 V -76 Q -13 -66 0 -65 Q 13 -66 13 -76 V -86 Q 0 -94 -13 -86 Z" fill="#d8a981" {...ink} />
                <g className="crew-eyes">
                    <circle cx={-5.5} cy={-79} r={2.2} fill={INK} />
                    <circle cx={5.5} cy={-79} r={2.2} fill={INK} />
                </g>
                <path d="M -7 -71 H 7" {...line} strokeWidth={2} />
                <path d="M -9 -74 Q 0 -77 9 -74 Q 5 -71 0 -72 Q -5 -71 -9 -74 Z" fill="#3a2a1a" stroke={INK} strokeWidth={1} />
                <path d="M -17 -86 H 17 L 19 -96 Q 0 -106 -19 -96 Z" fill="#1d2a52" {...ink} />
                <rect x={-17} y={-88} width={34} height={4} fill="#14131a" />
                <circle cx={0} cy={-95} r={3} fill="#e8b93c" stroke={INK} strokeWidth={1} />
            </g>
        </g>
    );
}

// The disguises lying where they fell
export function DroppedHat({ elRef }) {
    return (
        <g ref={elRef} style={{ display: 'none' }}>
            <path d="M -18 2 L -14 -8 H 14 L 18 2 Z" fill="#b39a6b" {...ink} strokeWidth={2} />
            <path d="M -10 -8 Q -9 -20 0 -20 Q 9 -20 10 -8 Z" fill="#3a3a44" {...ink} strokeWidth={2} />
            <path d="M -17 -8 Q 0 -13 17 -8 Q 0 -4 -17 -8 Z" fill="#2c2c34" {...ink} strokeWidth={1.6} />
        </g>
    );
}

export function DroppedGlasses({ elRef }) {
    return (
        <g ref={elRef} style={{ display: 'none' }}>
            <circle cx={-7} cy={-6} r={6} fill="#fff" fillOpacity={0.5} stroke={INK} strokeWidth={2.2} />
            <circle cx={7} cy={-6} r={6} fill="#fff" fillOpacity={0.5} stroke={INK} strokeWidth={2.2} />
            <path d="M 0 -6 Q -7 4 0 4 Q 6 4 3 -3 Z" fill="#f4a58f" {...ink} strokeWidth={1.8} />
        </g>
    );
}

export function DroppedCase({ elRef }) {
    return (
        <g ref={elRef} style={{ display: 'none' }}>
            <rect x={-14} y={-20} width={28} height={20} rx={2} fill="#3d2a1a" {...ink} strokeWidth={2} />
            <rect x={-4} y={-24} width={8} height={5} fill="none" stroke={INK} strokeWidth={2} />
            <rect x={-2} y={-12} width={4} height={4} fill="#e8b93c" />
        </g>
    );
}

/** A speech bubble: its text is set by whoever's talking */
export function SpyBubble({ elRef }) {
    return (
        <g ref={elRef} className="crew-bark">
            <path d="M -4 -14 H 70 a 6 6 0 0 1 6 6 V 6 a 6 6 0 0 1 -6 6 H 8 L -2 20 L 0 12 H -4 a 6 6 0 0 1 -6 -6 V -8 a 6 6 0 0 1 6 -6 Z" fill="#fff" stroke={INK} strokeWidth={2.4} strokeLinejoin="round" />
            <text x={33} y={4} textAnchor="middle" fontSize={12} fontWeight={900} fill={INK} fontFamily="system-ui, sans-serif" />
        </g>
    );
}
