import React from 'react';
import { Couch, Robot, Dog, Alien } from '../CouchCast/CouchCrew.jsx';

// 🎉 The Game-Cast page's picture: the robot projects the game onto the TV from its visor, a card pops
// up on it, and the party bounces along. All SVG and CSS (crisper and far smaller than a real GIF); the styles are .gps-* in cards.css.

const FLOOR = 178;
const COUCH_X = 288;
const COUCH = 0.86;         // the couch's size here
const CREW = COUCH * 0.95;  // the crew's size
const SEAT_Y = FLOOR - 44 * COUCH + 30 * CREW;
const seatX = (u) => COUCH_X + u * COUCH;
// The robot's visor, where the projector light comes out
const LENS_X = seatX(-50) - 8 * CREW;
const LENS_Y = SEAT_Y - 83 * CREW;

// The drawings are placed through their refs, so give each one its spot as it arrives
const place = (x, y, size) => (el) => {
    if (el) el.setAttribute('transform', `translate(${x} ${y}) scale(${size})`);
};

const CONFETTI = [
    [36, '#ffd23f', 0], [58, '#ff6b8a', 0.7], [84, '#4dd0e1', 1.5], [108, '#7ee081', 0.3], [132, '#ffd23f', 1.1],
    [214, '#ff6b8a', 1.9], [250, '#4dd0e1', 0.5], [288, '#ffd23f', 1.4], [326, '#7ee081', 2.2], [366, '#ff6b8a', 0.9],
];

export default function CastPartyScene() {
    return (
        <svg className="cc-crew gt-party-scene" viewBox="0 0 400 190" role="img" aria-label="Friends on a couch playing a party game cast to their TV">
            <defs>
                <linearGradient id="gps-wall" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#2b3a8f" />
                    <stop offset="1" stopColor="#4f62c9" />
                </linearGradient>
                <linearGradient id="gps-light" x1="1" y1="0" x2="0" y2="0">
                    <stop offset="0" stopColor="#fff6c9" stopOpacity="0.85" />
                    <stop offset="1" stopColor="#fff6c9" stopOpacity="0.2" />
                </linearGradient>
                <linearGradient id="gps-screen" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#93a7f0" />
                    <stop offset="1" stopColor="#3a53c4" />
                </linearGradient>
            </defs>

            <rect width="400" height="190" fill="url(#gps-wall)" />
            <rect y={FLOOR} width="400" height="12" fill="#22307a" />

            {/* Confetti, behind everything */}
            {CONFETTI.map(([x, color, delay]) => (
                <rect key={x} className="gps-confetti" x={x} y={-8} width={5} height={8} rx={1} fill={color} style={{ animationDelay: `${delay}s` }} />
            ))}

            {/* The TV */}
            <rect className="gps-tv-glow" x={10} y={22} width={150} height={102} rx={14} />
            <path d="M 70 124 L 62 170 M 100 124 L 108 170 M 54 172 H 116" stroke="#16161d" strokeWidth={4} strokeLinecap="round" />
            <rect x={18} y={30} width={134} height={88} rx={7} fill="#16161d" />
            <rect x={23} y={35} width={124} height={78} rx={4} fill="url(#gps-screen)" />
            {/* On the TV: a question card, then the winning answer */}
            <g className="gps-card">
                <rect x={51} y={45} width={68} height={50} rx={5} fill="#16161d" />
                <rect x={59} y={55} width={52} height={4} rx={2} fill="#fff" />
                <rect x={59} y={64} width={38} height={4} rx={2} fill="#fff" />
                <rect x={59} y={78} width={30} height={5} rx={1} fill="#ffd23f" />
            </g>
            <g className="gps-card gps-card-2">
                <rect x={51} y={45} width={68} height={50} rx={5} fill="#fff" />
                <path d="M 85 51 l 4 9 l 10 1 l -7 7 l 2 10 l -9 -5 l -9 5 l 2 -10 l -7 -7 l 10 -1 Z" fill="#ffd23f" stroke="#16161d" strokeWidth={1.5} strokeLinejoin="round" />
                <rect x={66} y={84} width={38} height={4} rx={2} fill="#3a53c4" />
            </g>

            {/* The party */}
            <Couch couchRef={place(COUCH_X, FLOOR, COUCH)} />
            <Robot elRef={place(seatX(-50), SEAT_Y, CREW)} />
            <g className="gps-bounce gps-bounce-2"><Dog elRef={place(seatX(0), SEAT_Y, CREW)} /></g>
            <g className="gps-bounce gps-bounce-3"><Alien elRef={place(seatX(50), SEAT_Y, CREW)} /></g>

            {/* The projector light, from the robot's visor across the whole screen (it holds still for this) */}
            <polygon className="gps-light" points={`${LENS_X},${LENS_Y - 3} ${LENS_X},${LENS_Y + 3} 147,113 147,35`} fill="url(#gps-light)" />
            <circle className="gps-lens" cx={LENS_X} cy={LENS_Y} r={3.5} />

            {/* Everyone's having a good time */}
            <text className="gps-float" x={336} y={46} fontSize={18}>🎉</text>
            <text className="gps-float gps-float-2" x={238} y={40} fontSize={14}>😂</text>
            <text className="gps-float gps-float-3" x={376} y={70} fontSize={14}>🎵</text>
        </svg>
    );
}
