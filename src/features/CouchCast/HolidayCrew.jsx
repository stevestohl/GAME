import React from 'react';
import { Robot, Dog, Alien, Cat, Couch } from './CouchCrew.jsx';

// 🎄 The Holiday deck's lobby cast: the Core crew (run by the same show, in CouchCrew.jsx) dressed up
// for the season, plus Santa, who lands beside the couch in place of Sasquatch on his mountain.
// The sleigh flies on its own. Nobody's asking how.
//
// The outfits are drawn over the Core drawings, in the same units: feet at (0, 0), up is negative y.

const INK = '#16161d';
const ink = { stroke: INK, strokeWidth: 2.4, strokeLinejoin: 'round' };

const RED = '#c8242c';
const GREEN = '#1f7a4a';
const SNOW = '#f6f4ee';
const GOLD = '#e8b93c';

// A strip of knitted zigzag across a sweater, from x1 to x2
const zigzag = (x1, x2, y, size = 3) => {
    let d = `M ${x1} ${y}`;
    for (let x = x1 + size, up = true; x <= x2; x += size, up = !up) d += ` L ${x} ${y + (up ? -size : 0)}`;
    return d;
};

function Bulbs({ points }) {
    const colors = ['#ff4d4d', '#ffd23f', '#4dd97a', '#5ab8ff'];
    return points.map(([x, y], i) => (
        <circle key={`${x}${y}`} className={`crew-bulb crew-bulb-${i % 2}`} cx={x} cy={y} r={2.4} fill={colors[i % colors.length]} stroke={INK} strokeWidth={1} />
    ));
}

export function HolidayRobot({ elRef }) {
    // A Santa hat over the antenna, a string of lights round the chest and a bow at the neck
    return (
        <Robot elRef={elRef}>
            <path d="M -21 -62 Q 0 -49 21 -62" fill="none" stroke="#1d3a2a" strokeWidth={1.6} />
            <Bulbs points={[[-16, -58], [-8, -55], [0, -54], [8, -55], [16, -58]]} />
            <path d="M 0 -66 L -9 -71 V -61 Z M 0 -66 L 9 -71 V -61 Z" fill={RED} {...ink} strokeWidth={1.6} />
            <circle cx={0} cy={-66} r={2.4} fill={GOLD} stroke={INK} strokeWidth={1.2} />
            <path d="M -16 -96 Q -11 -116 6 -117 Q 22 -117 26 -103 L 15 -96 Z" fill={RED} {...ink} />
            <circle cx={27} cy={-100} r={4.6} fill={SNOW} {...ink} strokeWidth={1.8} />
            <rect x={-19} y={-98} width={38} height={7.5} rx={3.5} fill={SNOW} {...ink} strokeWidth={2} />
        </Robot>
    );
}

export function HolidayDog({ elRef }) {
    // Rudolph, reluctantly: antlers, a glowing red nose, a jingle bell on the spiked collar and an ugly sweater
    return (
        <Dog elRef={elRef}>
            <path d="M -18 -55 Q -22 -40 -17 -26 L 17 -26 Q 22 -40 18 -55 Q 0 -60 -18 -55 Z" fill={RED} {...ink} />
            <path d={zigzag(-18, 18, -47)} fill="none" stroke={SNOW} strokeWidth={1.8} strokeLinejoin="round" />
            <path d={zigzag(-18, 18, -30)} fill="none" stroke={SNOW} strokeWidth={1.8} strokeLinejoin="round" />
            <path d="M 0 -45 L 6 -35 H 3 L 7 -31 H -7 L -3 -35 H -6 Z" fill={GREEN} stroke={INK} strokeWidth={1.2} strokeLinejoin="round" />
            <circle cx={0} cy={-56} r={3.6} fill={GOLD} stroke={INK} strokeWidth={1.4} />
            <path d="M -2 -55.5 H 2" stroke={INK} strokeWidth={1} />
            {[-1, 1].map((side) => (
                <g key={side}>
                    <path d={`M ${side * 8} -92 Q ${side * 10} -103 ${side * 20} -112 M ${side * 12} -102 L ${side * 22} -102 M ${side * 15} -106 L ${side * 13} -116`} fill="none" stroke={INK} strokeWidth={6} strokeLinecap="round" />
                    <path d={`M ${side * 8} -92 Q ${side * 10} -103 ${side * 20} -112 M ${side * 12} -102 L ${side * 22} -102 M ${side * 15} -106 L ${side * 13} -116`} fill="none" stroke="#a9794a" strokeWidth={2.8} strokeLinecap="round" />
                </g>
            ))}
            <circle className="crew-red-nose" cx={0} cy={-74.5} r={4.6} fill="#ff2d2d" stroke={INK} strokeWidth={1.4} />
            <circle cx={-1.5} cy={-76} r={1.1} fill="#ffc9c9" />
        </Dog>
    );
}

export function HolidayAlien({ elRef }) {
    // Still smug, now in a little elf hat (perched between the antennae), a sweater and a striped scarf
    return (
        <Alien elRef={elRef} hoodie={GREEN}>
            <path d="M -15 -60 Q -18 -42 -14 -27 L 14 -27 Q 18 -42 15 -60 Q 0 -64 -15 -60 Z" fill={GREEN} {...ink} />
            <path d={zigzag(-15, 15, -46)} fill="none" stroke={SNOW} strokeWidth={1.8} strokeLinejoin="round" />
            <path d={zigzag(-15, 15, -34)} fill="none" stroke="#ff6b6b" strokeWidth={1.8} strokeLinejoin="round" />
            {/* The scarf */}
            <rect x={-10} y={-66} width={20} height={7} rx={3.5} fill={RED} {...ink} strokeWidth={1.8} />
            <path d="M 2 -60 L 10 -60 L 11 -41 L 3 -41 Z" fill={RED} {...ink} strokeWidth={1.8} />
            <path d="M 2.6 -54 L 10.4 -54 M 2.9 -48 L 10.8 -48" stroke={SNOW} strokeWidth={2.2} />
            <path d="M -5 -65.5 v 6 M 1 -65.5 v 6" stroke={SNOW} strokeWidth={2} />
            {/* The hat */}
            <path d="M -7 -101 L -2 -123 Q 6 -130 14 -119 L 8 -117 L 7 -101 Z" fill="#2ea866" {...ink} strokeWidth={2} />
            <circle cx={15} cy={-117} r={3} fill={GOLD} stroke={INK} strokeWidth={1.4} />
            <rect x={-9} y={-103.5} width={18} height={5} rx={2.5} fill={RED} {...ink} strokeWidth={1.6} />
        </Alien>
    );
}

export function HolidayCat({ elRef }) {
    // Same cat, same attitude, plus a scarf with its end flying out behind
    return (
        <Cat elRef={elRef}>
            <path className="crew-scarf-end" d="M -4 -24 Q 6 -30 15 -27 L 20 -31 L 21 -24 L 25 -21 Q 12 -24 -3 -18 Z" fill={RED} {...ink} strokeWidth={1.5} />
            <path d="M 8 -28.5 L 10 -22.5 M 15 -28 L 16 -23" stroke={SNOW} strokeWidth={2} />
            <path d="M -14 -22 Q -9 -18 -2 -25 L 1 -18 Q -8 -11 -16 -16 Z" fill={RED} {...ink} strokeWidth={1.6} />
            <path d="M -10.5 -20.5 L -11 -13.5 M -5 -22 L -3.5 -15.5" stroke={SNOW} strokeWidth={2} />
        </Cat>
    );
}

export function HolidayCouch({ couchRef }) {
    // The same old couch, with a garland along the back and a stocking hung from each arm
    return (
        <Couch couchRef={couchRef}>
            <path d="M -86 -82 Q -58 -66 -29 -82 Q 0 -66 29 -82 Q 58 -66 86 -82" fill="none" stroke="#123f27" strokeWidth={9} strokeLinecap="round" />
            <path d="M -86 -82 Q -58 -66 -29 -82 Q 0 -66 29 -82 Q 58 -66 86 -82" fill="none" stroke="#2ea866" strokeWidth={5} strokeLinecap="round" strokeDasharray="3 3" />
            <Bulbs points={[[-68, -76], [-44, -76], [-14, -76], [14, -76], [44, -76], [68, -76]]} />
            {[-89, 89].map((x) => (
                <path key={x} d={`M ${x - 6} -58 h 12 v 18 q 0 5 -5 5 h -11 q -4 0 -4 -4 q 0 -4 4 -4 h 4 Z`} fill={RED} stroke={INK} strokeWidth={1.8} strokeLinejoin="round" />
            ))}
            {[-89, 89].map((x) => <rect key={x} x={x - 7} y={-61} width={14} height={6} rx={2} fill={SNOW} stroke={INK} strokeWidth={1.6} />)}
        </Couch>
    );
}

function SantaHead() {
    // Drawn around the same spot as Sasquatch's head, facing left, with the hat flopping back to fit under the card
    return (
        <>
            <path d="M -24 -132 Q -18 -150 0 -150 Q 24 -150 30 -124 L 18 -132 Z" fill={RED} {...ink} />
            <circle cx={31} cy={-120} r={5.6} fill={SNOW} {...ink} strokeWidth={1.8} />
            <ellipse cx={-3} cy={-117} rx={18} ry={16} fill="#f2c9a5" {...ink} strokeWidth={2} />
            <rect x={-27} y={-136} width={49} height={10} rx={5} fill={SNOW} {...ink} strokeWidth={2} />
            <g className="crew-eyes">
                <circle cx={-12} cy={-120} r={2.2} fill={INK} />
                <circle cx={2} cy={-120} r={2.2} fill={INK} />
            </g>
            <path d="M -18 -125 Q -12 -128 -7 -125 M -3 -125 Q 2 -128 8 -125" fill="none" stroke={SNOW} strokeWidth={3} strokeLinecap="round" />
            <path d="M -24 -116 Q -31 -100 -21 -91 Q -14 -82 -3 -85 Q 8 -82 15 -91 Q 25 -100 18 -116 Q 13 -106 -3 -107 Q -19 -106 -24 -116 Z" fill={SNOW} {...ink} strokeWidth={2} />
            <path d="M -5 -110 Q -14 -113 -19 -106 Q -11 -103 -5 -106 Q 1 -103 9 -106 Q 4 -113 -5 -110 Z" fill={SNOW} {...ink} strokeWidth={1.6} />
            <circle cx={-5} cy={-112} r={3.6} fill="#e87a6a" stroke={INK} strokeWidth={1.4} />
        </>
    );
}

export function Santa({ elRef }) {
    // Steps out of the sleigh for fist bumps: as big as Sasquatch, with the fist-bump arm in the same place
    return (
        <g ref={elRef} className="crew-actor crew-sasquatch crew-santa">
            <g className="crew-fig">
                <rect x={28} y={-98} width={13} height={38} rx={5} fill={RED} {...ink} />
                <rect x={27} y={-64} width={15} height={7} rx={3} fill={SNOW} {...ink} strokeWidth={1.8} />
                <circle cx={34.5} cy={-51} r={7} fill={GREEN} {...ink} strokeWidth={1.8} />
                <g className="crew-leg crew-leg-l">
                    <rect x={-22} y={-44} width={17} height={34} fill={RED} {...ink} />
                    <path d="M -36 0 V -8 Q -36 -16 -26 -16 H -3 V 0 Z" fill="#14131a" {...ink} />
                </g>
                <g className="crew-leg crew-leg-r">
                    <rect x={5} y={-44} width={17} height={34} fill={RED} {...ink} />
                    <path d="M -9 0 V -8 Q -9 -16 1 -16 H 24 V 0 Z" fill="#14131a" {...ink} />
                </g>
                {/* The coat, the belly and the belt */}
                <path d="M -30 -102 Q -46 -68 -36 -38 H 36 Q 46 -68 30 -102 Q 0 -110 -30 -102 Z" fill={RED} {...ink} />
                <rect x={-38} y={-46} width={76} height={10} rx={5} fill={SNOW} {...ink} strokeWidth={2} />
                <rect x={-8} y={-104} width={16} height={60} fill={SNOW} stroke={INK} strokeWidth={1.8} />
                <rect x={-41} y={-72} width={82} height={11} fill="#14131a" stroke={INK} strokeWidth={1.8} />
                <rect x={-10} y={-74} width={20} height={15} rx={2} fill={GOLD} stroke={INK} strokeWidth={1.8} />
                <rect x={-5} y={-70} width={10} height={7} fill="#14131a" />
                <SantaHead />
                {/* The fist-bump arm (the near one) */}
                <g className="sq-arm-bump">
                    <rect x={-41} y={-98} width={13} height={36} rx={5} fill={RED} {...ink} />
                    <rect x={-42} y={-66} width={15} height={7} rx={3} fill={SNOW} {...ink} strokeWidth={1.8} />
                    <circle cx={-34.5} cy={-53} r={8} fill={GREEN} {...ink} strokeWidth={1.8} />
                </g>
            </g>
        </g>
    );
}

export function Sleigh({ sleighRef }) {
    // Faces left, base about 200 wide with its runners on y = 0. Santa's in it until he hops out (`.is-empty`).
    return (
        <g ref={sleighRef} className="crew-sleigh" style={{ display: 'none' }}>
            {/* Magic does the flying: sparkles off the runners while it's in the air */}
            <g className="crew-sleigh-sparkles">
                {[[70, 10, 1], [96, 2, 0.8], [118, 14, 1.1], [142, 4, 0.7], [166, 12, 0.9]].map(([x, y, size]) => (
                    <path key={x} d={`M ${x} ${y - 7 * size} L ${x + 2 * size} ${y - 2 * size} L ${x + 7 * size} ${y} L ${x + 2 * size} ${y + 2 * size} L ${x} ${y + 7 * size} L ${x - 2 * size} ${y + 2 * size} L ${x - 7 * size} ${y} L ${x - 2 * size} ${y - 2 * size} Z`} fill="#ffe27a" />
                ))}
            </g>
            {/* The sack of presents, behind the seat */}
            <path d="M 34 -74 Q 28 -112 56 -118 Q 88 -118 90 -74 Z" fill="#7d5a34" {...ink} />
            <rect x={38} y={-124} width={20} height={18} fill="#2f7fd1" {...ink} strokeWidth={2} />
            <path d="M 48 -124 V -106" stroke={GOLD} strokeWidth={3} />
            <rect x={60} y={-118} width={18} height={15} fill="#d94f8a" {...ink} strokeWidth={2} />
            <path d="M 60 -111 H 78" stroke={SNOW} strokeWidth={3} />
            {/* Santa, from the lap up */}
            <g className="crew-sleigh-santa">
                <path d="M -32 -46 Q -40 -84 -24 -100 H 18 Q 36 -84 28 -46 Z" fill={RED} {...ink} />
                <rect x={-11} y={-102} width={16} height={56} fill={SNOW} stroke={INK} strokeWidth={1.8} />
                <g transform="translate(-3 18)"><SantaHead /></g>
                <g className="crew-sleigh-wave">
                    <path d="M -30 -84 L -46 -112" stroke={INK} strokeWidth={13} strokeLinecap="round" />
                    <path d="M -30 -84 L -46 -112" stroke={RED} strokeWidth={8.5} strokeLinecap="round" />
                    <circle cx={-48} cy={-117} r={7} fill={GREEN} {...ink} strokeWidth={1.8} />
                </g>
            </g>
            {/* The runners, with a curl at the front */}
            <path d="M 94 -9 Q 92 -2 82 -2 H -92 Q -110 -2 -110 -18 Q -110 -31 -98 -31" fill="none" stroke={INK} strokeWidth={8} strokeLinecap="round" />
            <path d="M 94 -9 Q 92 -2 82 -2 H -92 Q -110 -2 -110 -18 Q -110 -31 -98 -31" fill="none" stroke={GOLD} strokeWidth={4} strokeLinecap="round" />
            <path d="M -60 -2 V -20 M 56 -2 V -20" stroke={INK} strokeWidth={5} />
            {/* The body */}
            <path d="M -90 -18 Q -100 -60 -82 -82 Q -72 -66 -54 -56 L 28 -56 Q 32 -86 62 -90 Q 88 -90 92 -68 Q 94 -40 80 -18 Z" fill={RED} {...ink} />
            <path d="M -82 -24 Q -90 -56 -80 -72 Q -68 -58 -52 -50 L 34 -50 Q 38 -80 62 -82 Q 82 -82 85 -66 Q 86 -42 74 -24 Z" fill="none" stroke={GOLD} strokeWidth={2.4} />
            <path d="M -30 -38 Q -18 -48 -8 -38 Q 0 -30 8 -38 Q 18 -48 30 -38" fill="none" stroke={GOLD} strokeWidth={2.6} strokeLinecap="round" />
            <circle cx={0} cy={-34} r={4} fill={GOLD} stroke={INK} strokeWidth={1.4} />
        </g>
    );
}
