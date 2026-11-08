import React from 'react';

// 📼 The Jeffinitely deck's lobby cast (run by the same show as the Core deck, in CouchCrew.jsx): three
// decades of questionable decisions. Disco Duke ('70s), Aerobics Angie and Mullet Mitch ('80s) and Boomer
// the Boombox pile onto a plaid couch and play the Jeffcom, a knock-off console that only works once Mitch
// has blown on the cartridge. Dial-Up Dana ('90s) climbs out of her computer now and then to say hi, and
// Pixel, a keychain pet, keeps bugging the screen until the gamers chase it off.
//
// Each character is drawn like the Core crew: ~100 units tall with its feet at (0, 0), the same class
// names for the moving parts (legs, eyes, pupils, the fist-bump arm on the right), and the arm on the
// screen side as `crew-arm-cast`. Gamers hold a controller (`crew-controller`), which shows while they play.

const INK = '#16161d';
const ink = { stroke: INK, strokeWidth: 2.4, strokeLinejoin: 'round' };
const line = { stroke: INK, strokeLinecap: 'round', fill: 'none' };

// 🎮 The Jeffcom's controller, held in both hands in front of the belly (only while playing)
function Controller({ y = -40 }) {
    return (
        <g className="crew-controller">
            {/* The cord, coiled, dangling down to the console */}
            <path d={`M 0 ${y + 7} q 3 3 0 6 q -3 3 0 6 q 3 3 0 6 q -3 3 0 6`} {...line} strokeWidth={1.4} />
            <g className="crew-controller-pad">
                <rect x={-14} y={y} width={28} height={10} rx={2.5} fill="#cfcac0" {...ink} strokeWidth={1.8} />
                <rect x={-12} y={y + 2} width={24} height={6} rx={1.5} fill="#3a3a44" />
                <path d={`M -8.5 ${y + 5} h 5 M -6 ${y + 2.5} v 5`} stroke="#cfcac0" strokeWidth={1.6} strokeLinecap="round" />
                <circle className="crew-controller-a" cx={6} cy={y + 5.5} r={1.7} fill="#e2343c" />
                <circle className="crew-controller-b" cx={10} cy={y + 4.2} r={1.7} fill="#e2343c" />
            </g>
        </g>
    );
}

export function DiscoDuke({ elRef }) {
    // A white leisure suit with lapels you could land a plane on, a mirror-ball medallion and an afro to match
    const skin = '#8d5a3b';
    const suit = '#f6f2e8';
    const hair = '#2a1a12';
    return (
        <g ref={elRef} className="crew-actor crew-duke" data-look="left">
            <g className="crew-fig">
                {/* Bell-bottoms and platform shoes */}
                <g className="crew-leg crew-leg-l">
                    <path d="M -13 -30 H -4 L -2 -6 H -16 Z" fill={suit} {...ink} strokeWidth={2} />
                    <rect x={-17} y={-7} width={16} height={7} rx={2} fill="#b8862e" {...ink} strokeWidth={1.8} />
                    <path d="M -17 -3 H -1" stroke={INK} strokeWidth={1.4} />
                </g>
                <g className="crew-leg crew-leg-r">
                    <path d="M 4 -30 H 13 L 16 -6 H 2 Z" fill={suit} {...ink} strokeWidth={2} />
                    <rect x={1} y={-7} width={16} height={7} rx={2} fill="#b8862e" {...ink} strokeWidth={1.8} />
                    <path d="M 1 -3 H 17" stroke={INK} strokeWidth={1.4} />
                </g>
                {/* The jacket, open over an orange shirt, with the big collar out on top */}
                <path d="M -18 -62 Q -21 -44 -17 -28 L 17 -28 Q 21 -44 18 -62 Q 0 -66 -18 -62 Z" fill={suit} {...ink} />
                <path d="M -8 -63 L 0 -44 L 8 -63 Z" fill="#ff8a2a" {...ink} strokeWidth={1.6} />
                <path d="M -8 -63 L -14 -62 L -5 -48 Z M 8 -63 L 14 -62 L 5 -48 Z" fill="#ff8a2a" {...ink} strokeWidth={1.4} />
                <path d="M -13 -62 L -4 -42 L -10 -40 Z M 13 -62 L 4 -42 L 10 -40 Z" fill="#e8e1d0" {...ink} strokeWidth={1.6} />
                <rect x={-17} y={-32} width={34} height={4} fill="#e8e1d0" stroke={INK} strokeWidth={1.4} />
                {/* The medallion: a little mirror ball */}
                <path d="M -4 -62 Q 0 -54 4 -62" stroke="#d9a441" strokeWidth={1.2} fill="none" />
                <circle cx={0} cy={-52} r={3.4} fill="#cfd6e0" stroke={INK} strokeWidth={1.2} />
                <path d="M -3.4 -52 H 3.4 M 0 -55.4 V -48.6" stroke="#8a95a5" strokeWidth={0.8} />
                <circle cx={-1.2} cy={-53.3} r={0.8} fill="#fff" />
                <g className="crew-arm-cast">
                    <rect x={-26} y={-60} width={8} height={23} rx={2} fill={suit} {...ink} strokeWidth={2} />
                    <circle cx={-22} cy={-36} r={3.8} fill={skin} {...ink} strokeWidth={1.6} />
                </g>
                <g className="crew-arm-bump">
                    <rect x={18} y={-60} width={8} height={23} rx={2} fill={suit} {...ink} strokeWidth={2} />
                    <circle cx={22} cy={-36} r={3.8} fill={skin} {...ink} strokeWidth={1.6} />
                </g>
                <Controller />
                <rect x={-3.5} y={-69} width={7} height={7} fill={skin} {...ink} strokeWidth={1.8} />
                {/* The afro, behind the face */}
                <path d="M -15 -76 C -30 -78 -30 -100 -18 -104 C -16 -116 2 -120 8 -112 C 20 -116 30 -104 24 -96 C 32 -90 28 -76 15 -76 Z" fill={hair} {...ink} />
                <path d="M -14 -80 Q -15 -92 0 -93 Q 15 -92 14 -80 Q 14 -69 7 -66 Q 0 -63 -7 -66 Q -14 -69 -14 -80 Z" fill={skin} {...ink} />
                {/* Sideburns */}
                <path d="M -14 -84 V -73 L -11 -75 V -84 Z M 14 -84 V -73 L 11 -75 V -84 Z" fill={hair} />
                <g className="crew-eyes">
                    <ellipse cx={-6} cy={-81} rx={3.4} ry={3.2} fill="#f4efe4" stroke={INK} strokeWidth={1.3} />
                    <ellipse cx={6} cy={-81} rx={3.4} ry={3.2} fill="#f4efe4" stroke={INK} strokeWidth={1.3} />
                    <g className="crew-pupils"><circle cx={-6} cy={-80.6} r={1.8} fill={INK} /><circle cx={6} cy={-80.6} r={1.8} fill={INK} /></g>
                </g>
                <path d="M -10 -86.5 L -3 -85.5 M 10 -86.5 L 3 -85.5" stroke={hair} strokeWidth={2.2} strokeLinecap="round" />
                {/* A mustache, and a grin under it */}
                <path d="M -7 -73.5 Q -3 -76.5 0 -74.5 Q 3 -76.5 7 -73.5 Q 3 -72.5 0 -73.5 Q -3 -72.5 -7 -73.5 Z" fill={hair} />
                <path d="M -4 -70.8 Q 0 -68 4 -70.8" {...line} strokeWidth={1.4} />
            </g>
        </g>
    );
}

export function AerobicsAngie({ elRef }) {
    // A neon leotard over pink tights, striped leg warmers, a sweatband and very, very big hair
    const skin = '#f1c7a5';
    const hair = '#f2b33d';
    const leo = '#ff3fa4';
    return (
        <g ref={elRef} className="crew-actor crew-angie" data-look="left">
            <g className="crew-fig">
                {/* The hair at the back: crimped, and down past the shoulders */}
                <path d="M -18 -92 C -30 -84 -28 -66 -22 -56 L -18 -62 L -16 -54 L -12 -64 L 12 -64 L 16 -54 L 18 -62 L 22 -56 C 28 -66 30 -84 18 -92 Z" fill={hair} {...ink} strokeWidth={2} />
                <g className="crew-leg crew-leg-l">
                    <rect x={-12} y={-30} width={7} height={26} fill="#ff9ccd" {...ink} strokeWidth={2} />
                    <rect x={-13.5} y={-18} width={10} height={14} rx={2} fill="#7cff6b" {...ink} strokeWidth={1.8} />
                    <path d="M -13.5 -14 h 10 M -13.5 -10 h 10" stroke="#2bb7c9" strokeWidth={1.6} />
                    <path d="M -16 0 Q -16 -5 -10 -5 H -4 V 0 Z" fill="#fff" {...ink} strokeWidth={1.6} />
                </g>
                <g className="crew-leg crew-leg-r">
                    <rect x={5} y={-30} width={7} height={26} fill="#ff9ccd" {...ink} strokeWidth={2} />
                    <rect x={3.5} y={-18} width={10} height={14} rx={2} fill="#7cff6b" {...ink} strokeWidth={1.8} />
                    <path d="M 3.5 -14 h 10 M 3.5 -10 h 10" stroke="#2bb7c9" strokeWidth={1.6} />
                    <path d="M 16 0 Q 16 -5 10 -5 H 4 V 0 Z" fill="#fff" {...ink} strokeWidth={1.6} />
                </g>
                {/* The leotard: high-cut, with a teal stripe and a belt */}
                <path d="M -15 -62 Q -18 -46 -14 -34 L -6 -28 L 6 -28 L 14 -34 Q 18 -46 15 -62 Q 0 -66 -15 -62 Z" fill={leo} {...ink} />
                <path d="M -15 -54 L 15 -46" stroke="#2ee6d6" strokeWidth={4} />
                <rect x={-15} y={-38} width={30} height={4.5} rx={1.5} fill="#2ee6d6" stroke={INK} strokeWidth={1.4} />
                {/* Her cassette player, clipped to the belt */}
                <rect x={6} y={-41} width={8} height={6} rx={1} fill="#3a3a44" stroke={INK} strokeWidth={1.2} />
                <rect x={7.5} y={-39.5} width={5} height={2.4} fill="#ffd23f" />
                <g className="crew-arm-cast">
                    <rect x={-22} y={-60} width={6} height={22} rx={2.5} fill={skin} {...ink} strokeWidth={2} />
                    <rect x={-23} y={-43} width={8} height={4} rx={1} fill="#2ee6d6" stroke={INK} strokeWidth={1.2} />
                    <circle cx={-19} cy={-36} r={3.4} fill={skin} {...ink} strokeWidth={1.6} />
                </g>
                <g className="crew-arm-bump">
                    <rect x={16} y={-60} width={6} height={22} rx={2.5} fill={skin} {...ink} strokeWidth={2} />
                    <rect x={15} y={-43} width={8} height={4} rx={1} fill="#2ee6d6" stroke={INK} strokeWidth={1.2} />
                    <circle cx={19} cy={-36} r={3.4} fill={skin} {...ink} strokeWidth={1.6} />
                </g>
                <Controller />
                <rect x={-3} y={-69} width={6} height={7} fill={skin} {...ink} strokeWidth={1.8} />
                {/* Headphones around the neck */}
                <path d="M -8 -64 Q 0 -60 8 -64" stroke="#3a3a44" strokeWidth={1.8} fill="none" />
                <circle cx={-8.5} cy={-64} r={2.6} fill="#ff8a2a" stroke={INK} strokeWidth={1.1} />
                <circle cx={8.5} cy={-64} r={2.6} fill="#ff8a2a" stroke={INK} strokeWidth={1.1} />
                <path d="M -13 -80 Q -14 -91 0 -92 Q 14 -91 13 -80 Q 13 -69 6 -66 Q 0 -63.5 -6 -66 Q -13 -69 -13 -80 Z" fill={skin} {...ink} />
                <g className="crew-eyes">
                    <ellipse cx={-5.5} cy={-80} rx={3.4} ry={3.4} fill="#f4efe4" stroke={INK} strokeWidth={1.3} />
                    <ellipse cx={5.5} cy={-80} rx={3.4} ry={3.4} fill="#f4efe4" stroke={INK} strokeWidth={1.3} />
                    <g className="crew-pupils"><circle cx={-5.5} cy={-79.6} r={1.9} fill="#2a6fb8" /><circle cx={5.5} cy={-79.6} r={1.9} fill="#2a6fb8" /></g>
                    {/* Blue eye shadow, naturally */}
                    <path d="M -9 -81 Q -5.5 -86 -2 -81 M 2 -81 Q 5.5 -86 9 -81" stroke="#4dc3ff" strokeWidth={1.8} fill="none" strokeLinecap="round" />
                </g>
                <path d="M -9 -84.5 q -2 -1 -3 -3 M 9 -84.5 q 2 -1 3 -3" {...line} strokeWidth={1} />
                <circle cx={-8} cy={-73} r={2.4} fill="#ff7aa8" opacity={0.6} />
                <circle cx={8} cy={-73} r={2.4} fill="#ff7aa8" opacity={0.6} />
                <path d="M -4 -71 Q 0 -67.5 4 -71 Z" fill="#c81d5e" stroke={INK} strokeWidth={1.2} strokeLinejoin="round" />
                {/* The hair on top: teased up as high as it'll go, with a sweatband holding it back */}
                <path d="M -16 -84 C -28 -92 -24 -114 -10 -112 C -8 -124 10 -124 12 -112 C 26 -114 28 -92 16 -84 Q 0 -94 -16 -84 Z" fill={hair} {...ink} />
                <path d="M -8 -104 l 3 -4 l 3 4 l 3 -4 l 3 4 M -14 -96 l 3 -3 l 3 3 M 6 -97 l 3 -3 l 3 3" stroke="#c98a1f" strokeWidth={1.3} fill="none" strokeLinejoin="round" />
                <path d="M -15 -88 Q 0 -96 15 -88 L 15 -84 Q 0 -92 -15 -84 Z" fill="#2ee6d6" stroke={INK} strokeWidth={1.4} strokeLinejoin="round" />
            </g>
        </g>
    );
}

export function MulletMitch({ elRef }) {
    // Business in the front, party in the back: a jean jacket over a band tee, high-tops and mirrored shades.
    // He's the one who gets the console going: the cartridge in his hand only shows while he blows on it.
    const skin = '#e9b48f';
    const hair = '#7a4a26';
    const denim = '#4f7fc4';
    return (
        <g ref={elRef} className="crew-actor crew-mitch" data-look="left">
            <g className="crew-fig">
                {/* The party: the long bit at the back, down to the shoulders */}
                <path d="M -15 -84 Q -20 -66 -14 -58 L -9 -63 L -6 -57 L -2 -64 L 2 -64 L 6 -57 L 9 -63 L 14 -58 Q 20 -66 15 -84 Z" fill={hair} {...ink} strokeWidth={2} />
                <g className="crew-leg crew-leg-l">
                    <rect x={-13} y={-30} width={9} height={24} fill="#8fb3e3" {...ink} strokeWidth={2} />
                    <path d="M -11 -22 l 3 2 M -10 -14 l 2 2" stroke="#c9dcf4" strokeWidth={1.4} strokeLinecap="round" />
                    <path d="M -17 0 V -5 Q -17 -10 -12 -10 H -4 V 0 Z" fill="#fff" {...ink} strokeWidth={1.6} />
                    <path d="M -17 -3 H -4" stroke="#e2343c" strokeWidth={1.6} />
                </g>
                <g className="crew-leg crew-leg-r">
                    <rect x={4} y={-30} width={9} height={24} fill="#8fb3e3" {...ink} strokeWidth={2} />
                    <path d="M 6 -22 l 3 2 M 7 -14 l 2 2" stroke="#c9dcf4" strokeWidth={1.4} strokeLinecap="round" />
                    <path d="M 17 0 V -5 Q 17 -10 12 -10 H 4 V 0 Z" fill="#fff" {...ink} strokeWidth={1.6} />
                    <path d="M 4 -3 H 17" stroke="#e2343c" strokeWidth={1.6} />
                </g>
                {/* The band tee, under the jacket */}
                <path d="M -17 -62 Q -20 -45 -16 -28 L 16 -28 Q 20 -45 17 -62 Q 0 -66 -17 -62 Z" fill="#22222a" {...ink} />
                <path d="M 1 -56 L -4 -46 L 0 -46 L -2 -38 L 5 -49 L 1 -49 L 3 -56 Z" fill="#ffd23f" stroke={INK} strokeWidth={0.8} strokeLinejoin="round" />
                {/* The jacket, sleeves rolled, collar popped */}
                <path d="M -17 -62 Q -20 -45 -16 -28 L -7 -28 L -8 -60 Z M 17 -62 Q 20 -45 16 -28 L 7 -28 L 8 -60 Z" fill={denim} {...ink} strokeWidth={2} />
                <path d="M -15 -50 h 5 M 10 -50 h 5" stroke="#2e5a99" strokeWidth={1.4} />
                <path d="M -9 -62 L -13 -68 L -15 -60 Z M 9 -62 L 13 -68 L 15 -60 Z" fill={denim} stroke={INK} strokeWidth={1.4} strokeLinejoin="round" />
                <g className="crew-arm-cast">
                    <rect x={-26} y={-60} width={8} height={18} rx={2} fill={denim} {...ink} strokeWidth={2} />
                    <rect x={-25} y={-43} width={6} height={5} fill={skin} {...ink} strokeWidth={1.6} />
                    <circle cx={-22} cy={-36} r={3.6} fill={skin} {...ink} strokeWidth={1.6} />
                </g>
                <g className="crew-arm-bump">
                    <rect x={18} y={-60} width={8} height={18} rx={2} fill={denim} {...ink} strokeWidth={2} />
                    <rect x={19} y={-43} width={6} height={5} fill={skin} {...ink} strokeWidth={1.6} />
                    <circle cx={22} cy={-36} r={3.6} fill={skin} {...ink} strokeWidth={1.6} />
                </g>
                <Controller />
                <rect x={-3.5} y={-69} width={7} height={7} fill={skin} {...ink} strokeWidth={1.8} />
                <path d="M -14 -80 Q -15 -91 0 -92 Q 15 -91 14 -80 Q 14 -69 7 -66 Q 0 -63 -7 -66 Q -14 -69 -14 -80 Z" fill={skin} {...ink} />
                {/* The business: short and spiky on top */}
                <path d="M -15 -82 Q -17 -96 -6 -98 L -4 -102 L 0 -97 L 3 -102 L 6 -97 L 10 -100 L 11 -95 Q 17 -93 15 -82 Q 8 -90 0 -89 Q -8 -90 -15 -82 Z" fill={hair} {...ink} strokeWidth={2} />
                {/* Mirrored aviators: the shine slides across when he looks around */}
                <g className="crew-eyes">
                    <path d="M -13 -84 H -2 Q -2 -76 -7.5 -76 Q -13 -76 -13 -84 Z M 2 -84 H 13 Q 13 -76 7.5 -76 Q 2 -76 2 -84 Z" fill="#ff7ac0" stroke={INK} strokeWidth={1.4} strokeLinejoin="round" />
                    <path d="M -13 -81 Q -7.5 -80 -2 -82 V -84 H -13 Z M 2 -82 Q 7.5 -80 13 -81 V -84 H 2 Z" fill="#46d6ff" />
                    <g className="crew-pupils"><path d="M -9 -83 l -2 4 M 6 -83 l -2 4" stroke="#fff" strokeWidth={1.4} strokeLinecap="round" /></g>
                    <path d="M -2 -83 H 2" stroke={INK} strokeWidth={1.4} />
                </g>
                {/* A smirk, and a 'stache he's very proud of */}
                <path d="M -6 -72.5 Q 0 -75 6 -72.5" stroke={hair} strokeWidth={2.4} strokeLinecap="round" fill="none" />
                <path d="M -3 -69.5 Q 1 -68 4.5 -70.5" {...line} strokeWidth={1.4} />
                {/* 🕹️ Blowing on the cartridge: held up to his mouth (in front of the face, so it shows), dust puffing out the far end */}
                <g className="crew-held-cart">
                    <rect x={-19} y={-76} width={15} height={11} rx={1.2} fill="#8a8a94" {...ink} strokeWidth={1.4} transform="rotate(-8 -11.5 -70.5)" />
                    <rect x={-16.5} y={-74} width={10} height={6} fill="#ff4f9a" stroke={INK} strokeWidth={0.8} transform="rotate(-8 -11.5 -70.5)" />
                    <circle cx={-5} cy={-66.5} r={3} fill={skin} stroke={INK} strokeWidth={1.4} />
                </g>
                <g className="crew-puffs">
                    <circle className="crew-puff crew-puff-1" cx={-23} cy={-72} r={2.4} fill="#fff" stroke={INK} strokeWidth={1} />
                    <circle className="crew-puff crew-puff-2" cx={-29} cy={-75} r={3} fill="#fff" stroke={INK} strokeWidth={1} />
                    <circle className="crew-puff crew-puff-3" cx={-36} cy={-72} r={3.6} fill="#fff" stroke={INK} strokeWidth={1} />
                </g>
            </g>
        </g>
    );
}

export function BoomerBoombox({ elRef }) {
    // A walking boombox: speakers for eyes, a tape deck for a mouth (its reels turn), and a bent antenna
    const silver = '#c6ccd6';
    return (
        <g ref={elRef} className="crew-actor crew-boomer" data-look="left">
            <g className="crew-fig">
                <g className="crew-leg crew-leg-l">
                    <rect x={-12} y={-32} width={5} height={27} fill="#3a3a44" {...ink} strokeWidth={1.8} />
                    <path d="M -17 0 Q -17 -6 -11 -6 H -5 V 0 Z" fill="#ff8a2a" {...ink} strokeWidth={1.6} />
                </g>
                <g className="crew-leg crew-leg-r">
                    <rect x={7} y={-32} width={5} height={27} fill="#3a3a44" {...ink} strokeWidth={1.8} />
                    <path d="M 17 0 Q 17 -6 11 -6 H 5 V 0 Z" fill="#ff8a2a" {...ink} strokeWidth={1.6} />
                </g>
                <g className="crew-arm-cast">
                    <path d="M -24 -58 Q -28 -48 -25 -38" stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />
                    <path d="M -24 -58 Q -28 -48 -25 -38" stroke="#3a3a44" strokeWidth={2.4} fill="none" strokeLinecap="round" />
                    <circle cx={-25} cy={-36} r={3.6} fill="#fff" {...ink} strokeWidth={1.6} />
                </g>
                <g className="crew-arm-bump">
                    <path d="M 24 -58 Q 28 -48 25 -38" stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />
                    <path d="M 24 -58 Q 28 -48 25 -38" stroke="#3a3a44" strokeWidth={2.4} fill="none" strokeLinecap="round" />
                    <circle cx={25} cy={-36} r={3.6} fill="#fff" {...ink} strokeWidth={1.6} />
                </g>
                {/* The antenna and the carry handle */}
                <path className="crew-boomer-antenna" d="M 14 -86 L 22 -108 L 28 -106" stroke={INK} strokeWidth={1.8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx={28.5} cy={-106} r={1.8} fill="#ff4f9a" stroke={INK} strokeWidth={1} />
                <path d="M -14 -86 V -94 Q -14 -97 -11 -97 H 11 Q 14 -97 14 -94 V -86" stroke={INK} strokeWidth={5.5} fill="none" strokeLinejoin="round" />
                <path d="M -14 -86 V -94 Q -14 -97 -11 -97 H 11 Q 14 -97 14 -94 V -86" stroke="#3a3a44" strokeWidth={2.5} fill="none" strokeLinejoin="round" />
                {/* The box */}
                <rect x={-27} y={-87} width={54} height={56} rx={6} fill={silver} {...ink} />
                <rect x={-24} y={-84} width={48} height={7} rx={2} fill="#9aa2ae" stroke={INK} strokeWidth={1.2} />
                <path d="M -20 -80.5 h 4 M -12 -80.5 h 4 M 8 -80.5 h 12" stroke="#ff4f9a" strokeWidth={2} strokeLinecap="round" />
                {/* Speaker eyes: the cones look where it looks */}
                <g className="crew-eyes">
                    <circle cx={-14} cy={-63} r={10} fill="#2a2a32" stroke={INK} strokeWidth={1.8} />
                    <circle cx={14} cy={-63} r={10} fill="#2a2a32" stroke={INK} strokeWidth={1.8} />
                    <circle cx={-14} cy={-63} r={6.5} fill="none" stroke="#4a4a56" strokeWidth={1.4} />
                    <circle cx={14} cy={-63} r={6.5} fill="none" stroke="#4a4a56" strokeWidth={1.4} />
                    <g className="crew-pupils">
                        <circle cx={-14} cy={-63} r={3} fill="#f4efe4" stroke={INK} strokeWidth={1} />
                        <circle cx={14} cy={-63} r={3} fill="#f4efe4" stroke={INK} strokeWidth={1} />
                    </g>
                </g>
                {/* The tape deck mouth, grinning, with a mixtape going round */}
                <rect x={-11} y={-48} width={22} height={13} rx={2} fill="#1d1d24" stroke={INK} strokeWidth={1.4} />
                <rect x={-9} y={-46.5} width={18} height={9.5} rx={1} fill="#ffb347" />
                <rect x={-6} y={-44.5} width={12} height={5} fill="#2a2a32" />
                <g className="crew-boomer-reel"><circle cx={-3.5} cy={-42} r={1.8} fill="#f4efe4" /><path d="M -3.5 -43.8 V -40.2" stroke="#2a2a32" strokeWidth={0.8} /></g>
                <g className="crew-boomer-reel"><circle cx={3.5} cy={-42} r={1.8} fill="#f4efe4" /><path d="M 3.5 -43.8 V -40.2" stroke="#2a2a32" strokeWidth={0.8} /></g>
                <Controller y={-34} />
            </g>
        </g>
    );
}

export function DialUpDana({ elRef }) {
    // Overalls with one strap down, a flannel round the waist, a beanie and chunky sneakers. She lives in her
    // computer and climbs out of the monitor to say hi (she's the deck's visitor, like Sasquatch).
    // Her bump arm is on the left: she comes from the right, so her fist meets theirs.
    const skin = '#c68863';
    const hair = '#3b2418';
    const denim = '#5b7fb5';
    return (
        <g ref={elRef} className="crew-actor crew-dana" data-look="left">
            <g className="crew-fig">
                {/* Long hair, down the back */}
                <path d="M -15 -86 Q -20 -68 -16 -58 L 16 -58 Q 20 -68 15 -86 Z" fill={hair} {...ink} strokeWidth={2} />
                <g className="crew-leg crew-leg-l">
                    <rect x={-13} y={-30} width={10} height={24} fill={denim} {...ink} strokeWidth={2} />
                    <path d="M -19 0 V -5 Q -19 -9 -14 -9 H -2 V 0 Z" fill="#f4efe4" {...ink} strokeWidth={1.8} />
                    <path d="M -19 -2 H -2" stroke="#7c4dff" strokeWidth={2} />
                </g>
                <g className="crew-leg crew-leg-r">
                    <rect x={3} y={-30} width={10} height={24} fill={denim} {...ink} strokeWidth={2} />
                    <path d="M 19 0 V -5 Q 19 -9 14 -9 H 2 V 0 Z" fill="#f4efe4" {...ink} strokeWidth={1.8} />
                    <path d="M 2 -2 H 19" stroke="#7c4dff" strokeWidth={2} />
                </g>
                {/* A striped tee, overalls over it (one strap down) */}
                <path d="M -16 -62 Q -19 -45 -15 -30 L 15 -30 Q 19 -45 16 -62 Q 0 -66 -16 -62 Z" fill="#f4efe4" {...ink} />
                <path d="M -17 -55 H 17 M -17.5 -48 H 17.5" stroke="#2bb7c9" strokeWidth={2.4} />
                <path d="M -13 -48 H 13 L 14 -28 H -14 Z" fill={denim} {...ink} strokeWidth={2} />
                <rect x={-6} y={-45} width={12} height={8} rx={1} fill="#4a6fa5" stroke={INK} strokeWidth={1.2} />
                <path d="M 8 -48 L 11 -62" stroke={denim} strokeWidth={4} />
                <path d="M 8 -48 L 11 -62" stroke={INK} strokeWidth={1} strokeDasharray="0" opacity={0.5} />
                <circle cx={9} cy={-49} r={1.4} fill="#d9a441" stroke={INK} strokeWidth={0.8} />
                <path d="M -9 -48 Q -14 -42 -12 -36" stroke={denim} strokeWidth={3.5} fill="none" strokeLinecap="round" />
                {/* The flannel, tied round the waist */}
                <path d="M -16 -32 L 16 -32 L 18 -24 L 8 -26 L 2 -18 L -2 -26 L -18 -24 Z" fill="#c8303a" {...ink} strokeWidth={1.8} />
                <path d="M -12 -32 L -13 -25 M -6 -32 V -27 M 6 -32 V -27 M 12 -32 L 13 -25 M -16 -29 H 16" stroke="#3a1418" strokeWidth={1.2} />
                <g className="sq-arm-bump">
                    <rect x={-25} y={-60} width={8} height={22} rx={3} fill="#f4efe4" {...ink} strokeWidth={2} />
                    <path d="M -25 -53 h 8" stroke="#2bb7c9" strokeWidth={2} />
                    <circle cx={-21} cy={-36} r={3.8} fill={skin} {...ink} strokeWidth={1.6} />
                </g>
                <g className="crew-arm-bump">
                    <rect x={17} y={-60} width={8} height={22} rx={3} fill="#f4efe4" {...ink} strokeWidth={2} />
                    <path d="M 17 -53 h 8" stroke="#2bb7c9" strokeWidth={2} />
                    <circle cx={21} cy={-36} r={3.8} fill={skin} {...ink} strokeWidth={1.6} />
                    {/* Her pager */}
                    <rect x={18} y={-34} width={7} height={5} rx={1} fill="#2a2a32" stroke={INK} strokeWidth={1} />
                    <rect x={19} y={-33} width={5} height={2} fill="#7cff6b" />
                </g>
                <rect x={-3.5} y={-69} width={7} height={7} fill={skin} {...ink} strokeWidth={1.8} />
                <path d="M -14 -80 Q -15 -91 0 -92 Q 15 -91 14 -80 Q 14 -69 7 -66 Q 0 -63 -7 -66 Q -14 -69 -14 -80 Z" fill={skin} {...ink} />
                <g className="crew-eyes">
                    <ellipse cx={-6} cy={-80} rx={3.3} ry={3.3} fill="#f4efe4" stroke={INK} strokeWidth={1.2} />
                    <ellipse cx={6} cy={-80} rx={3.3} ry={3.3} fill="#f4efe4" stroke={INK} strokeWidth={1.2} />
                    <g className="crew-pupils"><circle cx={-6} cy={-79.6} r={1.8} fill={INK} /><circle cx={6} cy={-79.6} r={1.8} fill={INK} /></g>
                </g>
                {/* Little round glasses */}
                <circle cx={-6} cy={-80} r={5} fill="none" stroke={INK} strokeWidth={1.3} />
                <circle cx={6} cy={-80} r={5} fill="none" stroke={INK} strokeWidth={1.3} />
                <path d="M -1 -80.5 H 1" stroke={INK} strokeWidth={1.3} />
                <path d="M -4.5 -71 Q 0 -67.5 4.5 -71" {...line} strokeWidth={1.5} />
                {/* Bangs, and a beanie with a fold */}
                <path d="M -14 -83 Q -10 -88 -4 -86 Q 0 -89 5 -86 Q 10 -88 14 -83 L 14 -88 L -14 -88 Z" fill={hair} />
                <path d="M -15 -86 Q -16 -102 0 -103 Q 16 -102 15 -86 Z" fill="#e8b23a" {...ink} />
                <rect x={-16} y={-91} width={32} height={6} rx={2} fill="#d29a24" stroke={INK} strokeWidth={1.6} />
                <path d="M -10 -91 V -85 M -4 -91 V -85 M 2 -91 V -85 M 8 -91 V -85" stroke="#b07e17" strokeWidth={1} />
            </g>
        </g>
    );
}

export function Pixel({ elRef }) {
    // 🥚 The little one: a keychain pet in a plastic egg. Its screen's face blinks, and it beeps at the screen
    // until somebody chases it off (it's the deck's pest, like the cat). The stubby arm is the one that swats.
    return (
        <g ref={elRef} className="crew-actor crew-pixel">
            <g className="crew-fig">
                <g className="crew-leg crew-leg-l"><ellipse cx={-5} cy={-2} rx={4} ry={2.4} fill="#ff4f9a" {...ink} strokeWidth={1.4} /></g>
                <g className="crew-leg crew-leg-r"><ellipse cx={5} cy={-2} rx={4} ry={2.4} fill="#ff4f9a" {...ink} strokeWidth={1.4} /></g>
                {/* The key ring and its little chain */}
                <circle cx={0} cy={-38} r={4} fill="none" stroke="#b8bec8" strokeWidth={2.2} />
                <circle cx={0} cy={-38} r={4} fill="none" stroke={INK} strokeWidth={0.8} />
                <g className="crew-cat-paw">
                    <ellipse cx={-12} cy={-18} rx={2.6} ry={4} fill="#b48cff" {...ink} strokeWidth={1.4} />
                </g>
                <path d="M 0 -35 C 12 -35 14 -14 11 -8 Q 6 -3 0 -3 Q -6 -3 -11 -8 C -14 -14 -12 -35 0 -35 Z" fill="#b48cff" {...ink} strokeWidth={1.8} />
                <path d="M -6 -30 Q -9 -26 -9 -21" stroke="#fff" strokeWidth={1.6} strokeLinecap="round" fill="none" opacity={0.7} />
                <rect x={-6.5} y={-26} width={13} height={11} rx={1.5} fill="#bfe8a0" stroke={INK} strokeWidth={1.2} />
                {/* The pet on the screen: a little blob made of pixels */}
                <g className="crew-eyes">
                    <g className="crew-pupils">
                        <rect x={-3.5} y={-23} width={2} height={2} fill="#2f4a26" />
                        <rect x={1.5} y={-23} width={2} height={2} fill="#2f4a26" />
                    </g>
                </g>
                <path d="M -2.5 -19 h 1 v 1 h 3 v -1 h 1" stroke="#2f4a26" strokeWidth={1} fill="none" />
                <circle cx={-4} cy={-10} r={1.4} fill="#ffd23f" stroke={INK} strokeWidth={0.8} />
                <circle cx={0} cy={-9} r={1.4} fill="#ffd23f" stroke={INK} strokeWidth={0.8} />
                <circle cx={4} cy={-10} r={1.4} fill="#ffd23f" stroke={INK} strokeWidth={0.8} />
                {/* "!" when it's beeping at the screen */}
                <g className="crew-pixel-beep">
                    <path d="M -16 -40 l -3 -7 M -20 -34 l -7 -2 M -12 -44 l -1 -7" stroke="#ffd23f" strokeWidth={2} strokeLinecap="round" />
                </g>
            </g>
        </g>
    );
}

export function JeffCouch({ couchRef }) {
    // A '70s plaid couch, big enough for four: mustard and brown, with button-tufted cushions. 240 units wide.
    const plaid = '#d9a03a';
    return (
        <g ref={couchRef}>
            <g className="couch-legs">
                {[-108, -76, 68, 100].map((x) => <rect key={x} className="couch-leg" x={x} y={-13} width={8} height={13} rx={2} fill="#4a2e1a" stroke={INK} strokeWidth={2} />)}
            </g>
            <g className="couch-body" stroke={INK} strokeWidth={2.4} strokeLinejoin="round">
                <rect x={-118} y={-27} width={236} height={16} rx={4} fill="#8a4f1f" />
                <rect x={-106} y={-92} width={212} height={56} rx={12} fill={plaid} />
                {/* The plaid */}
                <path d="M -84 -90 V -38 M -42 -91 V -37 M 0 -91 V -37 M 42 -91 V -37 M 84 -90 V -38" stroke="#8a4f1f" strokeWidth={5} opacity={0.55} />
                <path d="M -104 -76 H 104 M -104 -56 H 104" stroke="#b5532f" strokeWidth={4} opacity={0.6} />
                <path d="M -104 -66 H 104" stroke="#f4dfa0" strokeWidth={1.4} opacity={0.7} />
                {[-75, -25, 25, 75].map((x) => <circle key={x} cx={x} cy={-72} r={2.4} fill="#8a4f1f" strokeWidth={1.4} />)}
                {/* Four cushions, one sagging */}
                {[-99, -49, 1, 51].map((x, i) => <path key={x} d={`M ${x} -40 q 0 -6 6 -6 h 36 q 6 0 6 6 ${i === 2 ? 'q 0 4 -3 8' : 'v 8'} q 0 8 -6 8 h -36 q -6 0 -6 -8 Z`} fill="#e6b04e" />)}
                <path d="M -99 -36 H 97" stroke="#b5532f" strokeWidth={1.6} opacity={0.5} />
                <rect x={-124} y={-62} width={26} height={46} rx={9} fill="#c58a2c" />
                <rect x={98} y={-62} width={26} height={46} rx={9} fill="#c58a2c" />
                <path d="M -111 -58 V -20 M 111 -58 V -20" stroke="#8a4f1f" strokeWidth={4} opacity={0.5} />
            </g>
        </g>
    );
}

export function Jeffcom({ consoleRef }) {
    // 🎮 The Jeffcom: a knock-off console on the floor in front of the couch (couch units, feet at 0, 0).
    // `is-in`: the cartridge is pushed in. `is-empty`: it's out, in Mitch's hand. `is-powered`: the light's on.
    return (
        <g ref={consoleRef} className="crew-jeffcom" style={{ display: 'none' }}>
            <g className="crew-jeffcom-cart">
                <rect x={-10} y={-24} width={20} height={16} rx={1.5} fill="#8a8a94" {...ink} strokeWidth={1.8} />
                <rect x={-7.5} y={-22} width={15} height={8} fill="#ff4f9a" stroke={INK} strokeWidth={1} />
                <path d="M -5 -19 h 10 M -5 -16.5 h 6" stroke="#fff" strokeWidth={1} />
            </g>
            <rect x={-24} y={-14} width={48} height={14} rx={2.5} fill="#cfcac0" {...ink} />
            <rect x={-12} y={-15.5} width={24} height={4} rx={1} fill="#3a3a44" stroke={INK} strokeWidth={1.2} />
            <rect x={-22} y={-6} width={44} height={3} fill="#3a3a44" />
            <rect x={-20} y={-11} width={6} height={3} rx={0.8} fill="#9b968c" stroke={INK} strokeWidth={0.8} />
            <circle className="crew-jeffcom-light" cx={18} cy={-9.5} r={1.6} fill="#5a1616" stroke={INK} strokeWidth={0.8} />
            <text x={2} y={-7.4} textAnchor="middle" fontSize={3.6} fontWeight={900} fill="#e2343c" fontFamily="system-ui, sans-serif" stroke="none">JEFFCOM</text>
        </g>
    );
}

export function DanaComputer({ mountainRef }) {
    // 🖥️ Dana's place: a beige computer on a rolling desk, with a modem whose lights blink. It rolls in beside
    // the couch, the screen comes on, and she climbs out of the monitor (`is-on`: the screen's glowing).
    // ~116 units wide; the screen's middle is at (0, -82), its bottom edge at y -63.
    return (
        <g ref={mountainRef} className="crew-computer" style={{ display: 'none' }}>
            {/* The desk on casters */}
            <g stroke={INK} strokeWidth={2.2} strokeLinejoin="round">
                {[-46, 40].map((x) => <rect key={x} x={x} y={-45} width={6} height={38} fill="#7a4a26" />)}
                {[-43, 43].map((x) => <circle key={x} className="crew-computer-wheel" cx={x} cy={-4} r={3.6} fill="#2a2a32" />)}
                <rect x={-56} y={-51} width={112} height={7} rx={2} fill="#a8683a" />
                <rect x={-40} y={-30} width={80} height={5} fill="#8a5530" />
                {/* The tower, under the desk */}
                <rect x={10} y={-44} width={24} height={36} rx={2} fill="#e3dbc6" />
                <rect x={14} y={-40} width={16} height={3} fill="#bfb69e" strokeWidth={1.2} />
                <rect x={14} y={-34} width={16} height={3} fill="#bfb69e" strokeWidth={1.2} />
                <circle cx={22} cy={-16} r={2} fill="#7cff6b" strokeWidth={1} />
                {/* The monitor */}
                <rect x={-12} y={-58} width={24} height={7} fill="#d6ceb6" />
                <rect x={-32} y={-110} width={64} height={54} rx={6} fill="#e3dbc6" />
                <rect className="crew-computer-screen" x={-24} y={-102} width={48} height={39} rx={4} fill="#1d2630" strokeWidth={1.8} />
                <rect x={-30} y={-62} width={10} height={2} fill="#bfb69e" stroke="none" />
                <circle cx={24} cy={-60} r={1.4} fill="#7cff6b" strokeWidth={0.8} />
                {/* The keyboard and the modem */}
                <rect x={-30} y={-55} width={34} height={5} rx={1} fill="#d6ceb6" strokeWidth={1.6} />
                <rect x={34} y={-60} width={18} height={9} rx={1.5} fill="#2a2a32" strokeWidth={1.6} />
            </g>
            <g className="crew-computer-modem">
                {[37, 41, 45, 49].map((x) => <circle key={x} cx={x} cy={-55.5} r={1} fill="#7cff6b" />)}
            </g>
            {/* What's on the screen once it's on: a glow, and a little dial-up progress bar */}
            <g className="crew-computer-glow">
                <rect x={-22} y={-100} width={44} height={35} rx={3} fill="#3fe0d0" opacity={0.85} />
                <rect x={-16} y={-86} width={32} height={6} rx={1} fill="#fff" stroke={INK} strokeWidth={1} />
                <rect className="crew-computer-bar" x={-15} y={-85} width={30} height={4} fill="#7c4dff" />
                <text x={0} y={-91} textAnchor="middle" fontSize={5.5} fontWeight={900} fill="#16161d" fontFamily="system-ui, sans-serif">CONNECTING…</text>
            </g>
        </g>
    );
}
