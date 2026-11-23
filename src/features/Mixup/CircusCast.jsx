import React from 'react';

// 🎪 The drawings for Temple Mix Up's circus (CircusShow.jsx): two clowns, Oopsy and Daisy, the ringmaster, a lion,
// a clown car that's far too small, a cannon and a trapeze. The people are ~100 units tall with their feet at (0, 0),
// and wear their props as `gear`: groups that are switched on and off with wearGear().

const INK = '#16161d';
const ink = { stroke: INK, strokeWidth: 2.4, strokeLinejoin: 'round' };
const line = { stroke: INK, strokeLinecap: 'round', fill: 'none' };
const GLOVE = '#ffffff';

/**
 * Put these props on this performer, and take everything else off.
 * `data-without` marks the parts a prop replaces (the arms hanging down, while they're up holding a trapeze).
 */
export const wearGear = (el, gear = []) => {
    el.querySelectorAll('[data-gear]').forEach((g) => { g.style.display = gear.includes(g.dataset.gear) ? '' : 'none'; });
    el.querySelectorAll('[data-without]').forEach((g) => {
        g.style.display = g.dataset.without.split(' ').some((name) => gear.includes(name)) ? 'none' : '';
    });
};

// A daisy's five petals around (x, y)
const petals = (x, y, r = 3.2) => [0, 1, 2, 3, 4].map((k) => {
    const angle = (k * 72 - 90) * (Math.PI / 180);
    return { cx: x + r * Math.cos(angle), cy: y + r * Math.sin(angle) };
});

/**
 * A clown. `pattern`: 'dots' or 'stripes' on the suit (in `trim`). `hat`: 'bowler' or 'cone'.
 * `brows`: 'arches' (painted high eyebrows) or 'diamonds' (blue diamonds over the eyes). `flower`: one to squirt with.
 */
export function Clown({ elRef, suit, trim, pattern = 'dots', shoes, hair, hat = 'bowler', brows = 'arches', flower = false, skin = '#fbf7ef' }) {
    const tufts = [[-15, -86, 5.5], [-18.5, -79.5, 5], [-16, -73, 4]];
    return (
        <g ref={elRef} className="crew-actor circus-clown" data-look="front">
            <g className="crew-fig">
                {/* Baggy trousers and very long shoes */}
                <g className="crew-leg crew-leg-l">
                    <path d="M -14 -30 H -2 V -8 H -15 Z" fill={suit} {...ink} strokeWidth={2} />
                    <path d="M -2 0 H -24 Q -31 0 -31 -5 Q -31 -11 -22 -10 H -2 Z" fill={shoes} {...ink} strokeWidth={1.8} />
                </g>
                <g className="crew-leg crew-leg-r">
                    <path d="M 2 -30 H 14 L 15 -8 H 2 Z" fill={suit} {...ink} strokeWidth={2} />
                    <path d="M 2 0 H 24 Q 31 0 31 -5 Q 31 -11 22 -10 H 2 Z" fill={shoes} {...ink} strokeWidth={1.8} />
                </g>

                {/* The suit */}
                <path d="M -17 -62 Q -23 -44 -19 -26 H 19 Q 23 -44 17 -62 Q 0 -67 -17 -62 Z" fill={suit} {...ink} />
                {pattern === 'dots' && (
                    <g fill={trim}>
                        <circle cx={-10} cy={-54} r={2.6} /><circle cx={9} cy={-50} r={2.6} />
                        <circle cx={-7} cy={-38} r={2.6} /><circle cx={11} cy={-33} r={2.6} /><circle cx={-13} cy={-30} r={2.2} />
                    </g>
                )}
                {pattern === 'stripes' && <path d="M -9 -62 V -27 M 9 -62 V -27" stroke={trim} strokeWidth={3.2} />}
                <circle cx={0} cy={-53} r={2.8} fill="#fff" stroke={INK} strokeWidth={1.2} />
                <circle cx={0} cy={-42} r={2.8} fill="#fff" stroke={INK} strokeWidth={1.2} />
                {flower && (
                    <g>
                        {petals(-10, -52).map((p, i) => <circle key={i} {...p} r={2.4} fill="#fff" stroke={INK} strokeWidth={0.9} />)}
                        <circle cx={-10} cy={-52} r={2} fill="#ffd23f" stroke={INK} strokeWidth={0.9} />
                    </g>
                )}

                {/* Arms down (they go up for the trapeze and the ta-da) */}
                <g data-without="hands">
                    <rect x={-25} y={-60} width={9} height={24} rx={3} fill={suit} {...ink} strokeWidth={2} />
                    <circle cx={-20.5} cy={-34} r={4.4} fill={GLOVE} {...ink} strokeWidth={1.6} />
                    <g className="crew-arm-bump">
                        <rect x={16} y={-60} width={9} height={24} rx={3} fill={suit} {...ink} strokeWidth={2} />
                        {/* A bicycle horn */}
                        <g data-gear="horn" style={{ display: 'none' }}>
                            <path d="M 25 -35 L 33 -33" stroke={INK} strokeWidth={5} strokeLinecap="round" />
                            <path d="M 25 -35 L 33 -33" stroke="#e8b93c" strokeWidth={2.6} strokeLinecap="round" />
                            <path d="M 32 -37 L 42 -43 V -23 L 32 -29 Z" fill="#e8b93c" {...ink} strokeWidth={1.6} />
                            <circle cx={21} cy={-40} r={5} fill="#e5484d" {...ink} strokeWidth={1.6} />
                        </g>
                        {/* A cream pie */}
                        <g data-gear="pie" style={{ display: 'none' }}>
                            <path d="M 10 -37 H 38 L 35 -31 H 13 Z" fill="#c79a5b" {...ink} strokeWidth={1.6} />
                            <path d="M 11 -37 Q 12 -46 24 -46 Q 36 -46 37 -37 Z" fill="#fffaf0" {...ink} strokeWidth={1.6} />
                            <circle cx={24} cy={-48} r={2.6} fill="#d11f3a" stroke={INK} strokeWidth={1} />
                        </g>
                        <circle cx={20.5} cy={-34} r={4.4} fill={GLOVE} {...ink} strokeWidth={1.6} />
                    </g>
                </g>

                {/* A ruffled collar */}
                {[-12, -6, 0, 6, 12].map((x) => <circle key={x} cx={x} cy={-64} r={4.2} fill="#fff" stroke={INK} strokeWidth={1.4} />)}

                {/* Hair on the sides, a face painted white */}
                {tufts.map(([x, y, r]) => <circle key={`l${y}`} cx={x} cy={y} r={r} fill={hair} {...ink} strokeWidth={1.8} />)}
                {tufts.map(([x, y, r]) => <circle key={`r${y}`} cx={-x} cy={y} r={r} fill={hair} {...ink} strokeWidth={1.8} />)}
                <path d="M -14 -86 V -76 Q -14 -64 0 -63 Q 14 -64 14 -76 V -86 Q 0 -95 -14 -86 Z" fill={skin} {...ink} />
                {brows === 'arches' && <path d="M -9 -84.5 Q -5.5 -89 -2 -84.5 M 2 -84.5 Q 5.5 -89 9 -84.5" {...line} strokeWidth={1.4} />}
                {brows === 'diamonds' && <path d="M -5.5 -88 l 1.6 2.6 l -1.6 2.6 l -1.6 -2.6 Z M 5.5 -88 l 1.6 2.6 l -1.6 2.6 l -1.6 -2.6 Z" fill="#3b7bff" stroke={INK} strokeWidth={0.8} />}
                <g className="crew-eyes">
                    <circle cx={-5.5} cy={-79} r={2.8} fill="#f4efe4" stroke={INK} strokeWidth={0.9} />
                    <circle cx={5.5} cy={-79} r={2.8} fill="#f4efe4" stroke={INK} strokeWidth={0.9} />
                    <g className="crew-pupils"><circle cx={-5.5} cy={-79} r={1.4} fill={INK} /><circle cx={5.5} cy={-79} r={1.4} fill={INK} /></g>
                </g>
                <path d="M -8.5 -69.5 Q 0 -60 8.5 -69.5 Q 0 -67 -8.5 -69.5 Z" fill="#e5484d" stroke={INK} strokeWidth={1.2} strokeLinejoin="round" />
                <circle cx={0} cy={-74} r={4} fill="#e5484d" stroke={INK} strokeWidth={1.4} />
                <circle cx={-1.3} cy={-75.4} r={1.2} fill="#fff" opacity={0.8} />

                {/* The hat (blown off by the cannon) */}
                <g data-without="helmet sooty">
                    {hat === 'bowler' && (
                        <g>
                            <path d="M -7 -91 Q -7 -100 0 -100 Q 7 -100 7 -91 Z" fill="#2e9e5b" {...ink} strokeWidth={1.8} />
                            <path d="M -11 -91 Q 0 -94 11 -91" stroke={INK} strokeWidth={3} strokeLinecap="round" fill="none" />
                        </g>
                    )}
                    {hat === 'cone' && (
                        <g>
                            <path d="M -9 -89 L 1 -114 L 10 -89 Q 0.5 -92 -9 -89 Z" fill="#ffd23f" {...ink} strokeWidth={2} />
                            <circle cx={0.5} cy={-99} r={1.8} fill="#e5484d" />
                            <circle cx={3} cy={-106} r={1.5} fill="#e5484d" />
                            <circle cx={1.2} cy={-115.5} r={3.6} fill="#e5484d" stroke={INK} strokeWidth={1.4} />
                        </g>
                    )}
                </g>

                {/* A cream pie, right in the face */}
                <g data-gear="piefaced" style={{ display: 'none' }}>
                    <path d="M -15 -84 Q -17 -76 -14 -70 Q -16 -64 -10 -63 Q -8 -57 -5 -63 Q 0 -60 4 -63 Q 8 -56 10 -63 Q 16 -64 14 -71 Q 17 -78 14 -85 Q 0 -91 -15 -84 Z" fill="#fffaf0" stroke={INK} strokeWidth={1.6} strokeLinejoin="round" />
                    <circle cx={-5.5} cy={-78} r={1.6} fill={INK} />
                    <circle cx={5.5} cy={-78} r={1.6} fill={INK} />
                    <circle cx={3} cy={-89} r={2.4} fill="#d11f3a" stroke={INK} strokeWidth={1} />
                </g>

                {/* A crash helmet, for being fired out of a cannon */}
                <g data-gear="helmet" style={{ display: 'none' }}>
                    <path d="M -15.5 -84 Q -15.5 -103 0 -103 Q 15.5 -103 15.5 -84 Z" fill="#d5dae3" {...ink} strokeWidth={2} />
                    <path d="M 0 -102 V -85" stroke="#e5484d" strokeWidth={4} />
                    <path d="M -14 -84 Q -14 -71 -9 -66 M 14 -84 Q 14 -71 9 -66" {...line} strokeWidth={1.2} />
                </g>

                {/* After the cannon goes off in your face: soot, singed hair and a little smoke */}
                <g data-gear="sooty" style={{ display: 'none' }}>
                    <path d="M -12 -87 L -17 -100 L -8 -92 L -6 -107 L -1 -93 L 3 -108 L 6 -93 L 12 -103 L 12 -87 Z" fill="#3a3a40" {...ink} strokeWidth={1.6} />
                    <ellipse cx={0} cy={-77} rx={13.5} ry={13} fill="#26262c" opacity={0.88} />
                    <circle cx={-5.5} cy={-79} r={3} fill="#fff" /><circle cx={5.5} cy={-79} r={3} fill="#fff" />
                    <circle cx={-5.5} cy={-79} r={1.4} fill={INK} /><circle cx={5.5} cy={-79} r={1.4} fill={INK} />
                    <path d="M -2 -112 q -5 -5 0 -10 q 5 -5 0 -10 M 7 -110 q -4 -4 0 -8" stroke="#a9adb6" strokeWidth={1.6} strokeLinecap="round" fill="none" />
                </g>

                {/* Arms up: holding the trapeze, or ta-da! */}
                <g data-gear="hands" style={{ display: 'none' }}>
                    <path d="M -18 -60 L -27 -88 M 18 -60 L 27 -88" stroke={INK} strokeWidth={10} strokeLinecap="round" />
                    <path d="M -18 -60 L -27 -88 M 18 -60 L 27 -88" stroke={suit} strokeWidth={6} strokeLinecap="round" />
                    <circle cx={-27.5} cy={-92.5} r={4.4} fill={GLOVE} {...ink} strokeWidth={1.6} />
                    <circle cx={27.5} cy={-92.5} r={4.4} fill={GLOVE} {...ink} strokeWidth={1.6} />
                </g>
            </g>
        </g>
    );
}

// Where a clown's hands are when they're up (the trapeze bar), and its flower, in drawing units from its feet
export const HANDS_UP_Y = -92.5;
export const FLOWER = { x: -10, y: -52 };

export function Ringmaster({ elRef }) {
    return (
        <g ref={elRef} className="crew-actor circus-ringmaster" style={{ display: 'none' }} data-look="right">
            <g className="crew-fig">
                {/* The coat's tails, behind the legs */}
                <path d="M -17 -32 L -21 -11 L -7 -28 Z M 17 -32 L 21 -11 L 7 -28 Z" fill="#c8202c" {...ink} strokeWidth={1.8} />
                <g className="crew-leg crew-leg-l">
                    <rect x={-13} y={-30} width={10} height={20} fill="#1b1b22" {...ink} strokeWidth={2} />
                    <path d="M -3 0 H -19 Q -19 -7 -14 -7 V -13 H -3 Z" fill="#101016" {...ink} strokeWidth={1.8} />
                </g>
                <g className="crew-leg crew-leg-r">
                    <rect x={3} y={-30} width={10} height={20} fill="#1b1b22" {...ink} strokeWidth={2} />
                    <path d="M 3 0 H 19 Q 19 -7 14 -7 V -13 H 3 Z" fill="#101016" {...ink} strokeWidth={1.8} />
                </g>
                {/* A red tailcoat with gold buttons */}
                <path d="M -18 -62 L -18 -26 H 18 L 18 -62 Q 0 -67 -18 -62 Z" fill="#c8202c" {...ink} />
                <path d="M -6 -63 L 0 -40 L 6 -63 Z" fill="#f6f4ee" stroke={INK} strokeWidth={1.4} strokeLinejoin="round" />
                <path d="M -6 -63 L -12 -47 M 6 -63 L 12 -47" stroke="#8f1520" strokeWidth={2} />
                <path d="M -5 -62 L 0 -59.5 L 5 -62 V -57 L 0 -59.5 L -5 -57 Z" fill={INK} />
                {[[-11, -44], [-11, -35], [11, -44], [11, -35]].map(([x, y]) => <circle key={`${x}${y}`} cx={x} cy={y} r={1.9} fill="#e8b93c" stroke={INK} strokeWidth={0.8} />)}
                <path d="M -24 -61 H -14 M 14 -61 H 24" stroke="#e8b93c" strokeWidth={3} strokeLinecap="round" />
                <rect x={-26} y={-60} width={8} height={24} rx={3} fill="#c8202c" {...ink} strokeWidth={2} />
                <circle cx={-22} cy={-34} r={4} fill={GLOVE} {...ink} strokeWidth={1.6} />
                <g className="crew-arm-bump">
                    <rect x={18} y={-60} width={8} height={24} rx={3} fill="#c8202c" {...ink} strokeWidth={2} />
                    {/* The cane */}
                    <path d="M 23 -36 L 26 -1" stroke={INK} strokeWidth={3.4} strokeLinecap="round" />
                    <circle cx={22.5} cy={-39} r={3} fill="#e8b93c" stroke={INK} strokeWidth={1.2} />
                    <circle cx={22} cy={-34} r={4} fill={GLOVE} {...ink} strokeWidth={1.6} />
                </g>
                <rect x={-4} y={-70} width={8} height={8} fill="#e9b994" {...ink} strokeWidth={1.8} />
                <path d="M -13 -86 V -76 Q -13 -66 0 -65 Q 13 -66 13 -76 V -86 Q 0 -94 -13 -86 Z" fill="#e9b994" {...ink} />
                <path d="M -13 -86 V -78 M 13 -86 V -78" stroke="#3a2416" strokeWidth={3} strokeLinecap="round" />
                <g className="crew-eyes">
                    <circle cx={-5.5} cy={-80} r={2.6} fill="#f4efe4" stroke={INK} strokeWidth={0.9} />
                    <circle cx={5.5} cy={-80} r={2.6} fill="#f4efe4" stroke={INK} strokeWidth={0.9} />
                    <g className="crew-pupils"><circle cx={-5.5} cy={-80} r={1.3} fill={INK} /><circle cx={5.5} cy={-80} r={1.3} fill={INK} /></g>
                </g>
                {/* A very curly mustache */}
                <path d="M 0 -72.5 Q -5 -76 -9 -72 Q -12 -69 -14 -72 Q -13 -67 -8 -69 Q -4 -70 0 -70.5 Q 4 -70 8 -69 Q 13 -67 14 -72 Q 12 -69 9 -72 Q 5 -76 0 -72.5 Z" fill="#3a2416" stroke={INK} strokeWidth={0.8} />
                <path d="M -3.5 -67.5 Q 0 -65.5 3.5 -67.5" {...line} strokeWidth={1.4} />
                {/* The top hat */}
                <rect x={-11} y={-112} width={22} height={24} rx={1.5} fill="#1b1b22" {...ink} strokeWidth={2} />
                <rect x={-11} y={-95} width={22} height={4.5} fill="#c8202c" />
                <path d="M -18 -88 Q 0 -92 18 -88 Q 0 -85 -18 -88 Z" fill="#1b1b22" {...ink} strokeWidth={2} />
            </g>
        </g>
    );
}

export function Lion({ elRef }) {
    // Side-on and facing left, ~130 long with its paws on y = 0, its mane ~76 high
    const leg = (x, cls, fill) => (
        <g className={`crew-leg ${cls}`}>
            <rect x={x} y={-27} width={10} height={24} rx={4} fill={fill} {...ink} strokeWidth={2} />
            <ellipse cx={x + 4} cy={-3} rx={7} ry={3} fill={fill} {...ink} strokeWidth={1.8} />
        </g>
    );
    const mane = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((k) => {
        const angle = (k * 36) * (Math.PI / 180);
        return { cx: -37 + 16 * Math.cos(angle), cy: -58 + 16 * Math.sin(angle) };
    });
    return (
        <g ref={elRef} className="crew-actor circus-lion" style={{ display: 'none' }} data-look="left">
            <g className="crew-fig">
                <g transform="translate(0 6)"><g className="circus-lion-tail">
                    <path d="M 44 -44 Q 64 -46 63 -66" fill="none" stroke={INK} strokeWidth={5.5} strokeLinecap="round" />
                    <path d="M 44 -44 Q 64 -46 63 -66" fill="none" stroke="#e0a43a" strokeWidth={3} strokeLinecap="round" />
                    <circle cx={63} cy={-70} r={5} fill="#a8541c" {...ink} strokeWidth={1.6} />
                </g></g>
                {/* The far legs, a shade darker */}
                {leg(-22, 'crew-leg-r', '#c78a2c')}
                {leg(31, 'crew-leg-l', '#c78a2c')}
                <path d="M -30 -24 Q -34 -48 -10 -49 H 26 Q 47 -49 47 -32 Q 47 -18 32 -18 H -22 Q -30 -18 -30 -24 Z" fill="#e0a43a" {...ink} />
                {leg(-32, 'crew-leg-l', '#e0a43a')}
                {leg(21, 'crew-leg-r', '#e0a43a')}
                {/* The mane and the face */}
                <g transform="translate(0 6)">
                <circle cx={-37} cy={-58} r={18} fill="#a8541c" />
                {mane.map((p, i) => <circle key={i} {...p} r={8.5} fill="#a8541c" {...ink} strokeWidth={1.8} />)}
                <circle cx={-37} cy={-58} r={17} fill="#a8541c" />
                <circle cx={-38} cy={-57} r={12.5} fill="#efb851" {...ink} strokeWidth={2} />
                <g className="crew-eyes">
                    <circle cx={-43} cy={-61} r={2.6} fill="#f4efe4" stroke={INK} strokeWidth={0.9} />
                    <circle cx={-33.5} cy={-61} r={2.6} fill="#f4efe4" stroke={INK} strokeWidth={0.9} />
                    <g className="crew-pupils"><circle cx={-43} cy={-61} r={1.3} fill={INK} /><circle cx={-33.5} cy={-61} r={1.3} fill={INK} /></g>
                </g>
                <ellipse cx={-38.5} cy={-51} rx={7} ry={5} fill="#fbe3b0" stroke={INK} strokeWidth={1.4} />
                <path d="M -41.5 -55.5 H -35.5 L -38.5 -52.5 Z" fill="#4a2a1a" stroke={INK} strokeWidth={0.8} strokeLinejoin="round" />
                <path d="M -46 -52 H -52 M -46 -50 L -51 -48 M -31 -52 H -25 M -31 -50 L -26 -48" {...line} strokeWidth={0.9} />
                <g data-without="roar">
                    <path d="M -42 -48.5 Q -40 -46.5 -38.5 -49 Q -37 -46.5 -35 -48.5" {...line} strokeWidth={1.2} />
                </g>
                <g data-gear="roar" style={{ display: 'none' }}>
                    <ellipse cx={-38.5} cy={-45.5} rx={5.5} ry={5.5} fill="#7a1f24" stroke={INK} strokeWidth={1.4} />
                    <path d="M -42 -50 l 1.3 2.6 l 1.3 -2.6 Z M -37.6 -50 l 1.3 2.6 l 1.3 -2.6 Z" fill="#fff" stroke={INK} strokeWidth={0.6} />
                </g>
                </g>
            </g>
        </g>
    );
}

export function ClownCar({ elRef }) {
    // A very small car, side-on and facing left, ~70 long with its wheels on y = 0. `.has-clowns`: both clowns squeezed in
    return (
        <g ref={elRef} className="circus-car" style={{ display: 'none' }}>
            <g className="circus-car-body">
                {/* The antenna and its flag */}
                <path d="M 24 -36 L 30 -60" stroke={INK} strokeWidth={1.4} strokeLinecap="round" />
                <path d="M 30 -60 L 41 -57 L 30 -53 Z" fill="#e5484d" stroke={INK} strokeWidth={1.2} strokeLinejoin="round" />
                {/* Their hair and a party hat, poking out of the roof */}
                <g className="circus-car-clowns">
                    <circle cx={-9} cy={-45} r={5.5} fill="#ff8c1a" {...ink} strokeWidth={1.6} />
                    <circle cx={-2} cy={-47} r={4.5} fill="#ff8c1a" {...ink} strokeWidth={1.6} />
                    <circle cx={11} cy={-46} r={5} fill="#2ea866" {...ink} strokeWidth={1.6} />
                    <circle cx={17} cy={-44} r={4} fill="#2ea866" {...ink} strokeWidth={1.6} />
                    <path d="M 6 -46 L 13 -64 L 18 -46 Z" fill="#ffd23f" {...ink} strokeWidth={1.6} />
                    <circle cx={13} cy={-65} r={2.8} fill="#e5484d" stroke={INK} strokeWidth={1.2} />
                </g>
                <path d="M -34 -9 Q -37 -24 -22 -27 Q -14 -45 4 -45 Q 22 -45 27 -28 Q 37 -26 35 -9 Z" fill="#ffd23f" {...ink} />
                <path d="M -35 -16 H 36" stroke="#e5484d" strokeWidth={4} />
                <path d="M -14 -28 Q -9 -40 3 -40 Q 16 -40 20 -28 Z" fill="#a9d6ec" stroke={INK} strokeWidth={1.8} strokeLinejoin="round" />
                <g className="circus-car-clowns">
                    <circle cx={-4} cy={-32.5} r={4.5} fill="#fbf7ef" stroke={INK} strokeWidth={1.2} />
                    <circle cx={10} cy={-32.5} r={4.5} fill="#fbf7ef" stroke={INK} strokeWidth={1.2} />
                    <circle cx={-6} cy={-31.5} r={1.7} fill="#e5484d" />
                    <circle cx={8} cy={-31.5} r={1.7} fill="#e5484d" />
                </g>
                <path d="M -12 -27 H 19 V -13 H -12 Z" fill="none" stroke={INK} strokeWidth={1.2} />
                <circle cx={-34} cy={-20} r={3} fill="#fff3a0" stroke={INK} strokeWidth={1.2} />
            </g>
            <circle cx={-20} cy={-8} r={8} fill="#1d1a22" {...ink} strokeWidth={2} />
            <circle cx={-20} cy={-8} r={3} fill="#e5484d" stroke={INK} strokeWidth={1.1} />
            <circle cx={20} cy={-8} r={8} fill="#1d1a22" {...ink} strokeWidth={2} />
            <circle cx={20} cy={-8} r={3} fill="#e5484d" stroke={INK} strokeWidth={1.1} />
        </g>
    );
}

// The cannon points up and to the right, this many degrees above level, pivoting on its wheel's axle
const CANNON_ANGLE = 38;
const AXLE_Y = -19;
const MUZZLE_LENGTH = 68;
const cannonRad = CANNON_ANGLE * (Math.PI / 180);
/** The mouth of the cannon, from the bottom of its wheel, and which way a shot goes (unit vector) */
export const CANNON_MUZZLE = { x: MUZZLE_LENGTH * Math.cos(cannonRad), y: AXLE_Y - MUZZLE_LENGTH * Math.sin(cannonRad) };
export const CANNON_AIM = { x: Math.cos(cannonRad), y: -Math.sin(cannonRad) };

export function Cannon({ elRef }) {
    // Its wheel's bottom on (0, 0). `.is-lit`: the fuse fizzes
    const spokes = [0, 60, 120].map((deg) => {
        const r = deg * (Math.PI / 180);
        return `M ${-16 * Math.cos(r)} ${AXLE_Y - 16 * Math.sin(r)} L ${16 * Math.cos(r)} ${AXLE_Y + 16 * Math.sin(r)}`;
    }).join(' ');
    return (
        <g ref={elRef} className="circus-cannon" style={{ display: 'none' }}>
            <g transform={`translate(0 ${AXLE_Y}) rotate(${-CANNON_ANGLE})`}>
                <path d="M -30 0 Q -38 -6 -39 -15" stroke={INK} strokeWidth={1.8} fill="none" strokeLinecap="round" />
                <g className="circus-fuse-spark">
                    <path d="M -39 -24 L -37 -18 L -31 -17 L -36 -14 L -35 -8 L -39 -12 L -44 -9 L -42 -14 L -47 -18 L -41 -18 Z" fill="#ffd23f" stroke="#ff8c1a" strokeWidth={1} strokeLinejoin="round" />
                </g>
                <path d="M -30 -12 Q -36 0 -30 12 L 62 9 V -9 Z" fill="#3b7bff" {...ink} />
                <path d="M -12 -11.4 V 11.4 M 34 -10 V 10" stroke="#ffd23f" strokeWidth={3.4} />
                <path d="M 12 -5 L 13.5 -1.5 L 17 -1.5 L 14.3 0.8 L 15.3 4.3 L 12 2.2 L 8.7 4.3 L 9.7 0.8 L 7 -1.5 L 10.5 -1.5 Z" fill="#ffd23f" stroke={INK} strokeWidth={0.8} strokeLinejoin="round" />
                <rect x={60} y={-12} width={8} height={24} rx={2} fill="#e5484d" {...ink} strokeWidth={2} />
                <ellipse cx={68} cy={0} rx={2.5} ry={9} fill={INK} />
            </g>
            <circle cx={0} cy={AXLE_Y} r={19} fill="#e5484d" {...ink} />
            <path d={spokes} stroke={INK} strokeWidth={1.8} />
            <circle cx={0} cy={AXLE_Y} r={4} fill="#e8b93c" stroke={INK} strokeWidth={1.4} />
        </g>
    );
}

/** A trapeze: its ropes and bar are drawn in screen pixels by whoever's swinging it (CircusRulesShow) */
export function Trapeze({ elRef }) {
    return (
        <g ref={elRef} className="circus-trapeze" style={{ display: 'none' }}>
            <path className="circus-ropes" fill="none" stroke="#efe3c2" strokeLinecap="round" />
            <path className="circus-bar" fill="none" stroke={INK} strokeLinecap="round" />
            <path className="circus-bar-paint" fill="none" stroke="#e5484d" strokeLinecap="round" />
        </g>
    );
}

/** Three juggling balls */
export function JugglingBalls({ elRef }) {
    return (
        <g ref={elRef} className="circus-balls">
            {['#e5484d', '#ffd23f', '#3b7bff'].map((color) => (
                <g key={color} style={{ display: 'none' }}>
                    <circle r={5.5} fill={color} stroke={INK} strokeWidth={1.6} />
                    <circle cx={-1.8} cy={-1.8} r={1.6} fill="#fff" opacity={0.75} />
                </g>
            ))}
        </g>
    );
}

/** A puff of smoke, for the cannon */
export function Smoke({ elRef }) {
    return (
        <g ref={elRef} className="circus-smoke">
            {[[0, 0, 9], [-9, 4, 7], [8, 5, 7.5], [2, -8, 7], [-6, -6, 5.5]].map(([x, y, r]) => (
                <circle key={`${x}${y}`} cx={x} cy={y} r={r} fill="#ece8df" stroke={INK} strokeWidth={1.4} />
            ))}
        </g>
    );
}

/** The cartoon burst for bumps, bonks and bangs */
export function Pow({ elRef }) {
    return (
        <g ref={elRef} className="crew-pow">
            <path d="M 0 -13 L 3.5 -5 L 12 -7 L 6 0 L 12 7 L 3.5 5 L 0 13 L -3.5 5 L -12 7 L -6 0 L -12 -7 L -3.5 -5 Z" fill="#ffd23f" stroke={INK} strokeWidth={2} strokeLinejoin="round" />
        </g>
    );
}

// A speech bubble `width` wide, its tail on the left (or the right, near the edge of the screen)
const bubblePath = (width, tailRight) => {
    const right = width - 10;
    const mirror = (x) => width - 20 - x;
    const tail = tailRight ? `H ${mirror(0)} L ${mirror(-2)} 20 L ${mirror(8)} 12` : 'H 8 L -2 20 L 0 12';
    return `M -4 -14 H ${right - 6} a 6 6 0 0 1 6 6 V 6 a 6 6 0 0 1 -6 6 ${tail} H -4 a 6 6 0 0 1 -6 -6 V -8 a 6 6 0 0 1 6 -6 Z`;
};

/** A speech bubble: its text is set by whoever's talking (see sayIn) */
export function Bubble({ elRef }) {
    return (
        <g ref={elRef} className="crew-bark">
            <path d={bubblePath(86, false)} fill="#fff" stroke={INK} strokeWidth={2.4} strokeLinejoin="round" />
            <text x={33} y={4} textAnchor="middle" fontSize={12} fontWeight={900} fill={INK} fontFamily="system-ui, sans-serif" />
        </g>
    );
}

/**
 * Show `text` in a speech bubble whose tail points at (x, y), sized to fit, and flipped to point the other
 * way when it would run off the right of the picture (`maxX`). Resolves when it's gone again.
 */
export const sayIn = async (d, el, text, x, y, ms, scale, maxX = Infinity) => {
    const label = el.querySelector('text');
    label.textContent = text;
    const width = Math.max(48, (label.getComputedTextLength?.() || text.length * 8) + 20);
    const tailRight = x + (width - 12) * scale > maxX;
    el.querySelector('path').setAttribute('d', bubblePath(width, tailRight));
    label.setAttribute('x', width / 2 - 10);
    const tipX = tailRight ? width - 18 : -2;
    el.setAttribute('transform', `translate(${x - tipX * scale} ${y - 20 * scale}) scale(${scale})`);
    el.classList.add('is-on');
    await d.wait(ms);
    el.classList.remove('is-on');
};
