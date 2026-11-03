import React from 'react';

/**
 * 🃏 One card deck (expansion), drawn as a tall glass playing card.
 * Used on the Couch Cast deck page and the Prompt 2 and Trivia create screens.
 *
 * Pass `selected` (true/false) to use it as a pick-one toggle;
 * leave it undefined for a plain "tap to go" button.
 */

// 🎄 The Holiday deck's wreath: leaves around a ring, each tilted along the circle
const WREATH_LEAVES = Array.from({ length: 22 }, (_, i) => {
    const angle = (i / 22) * 360;
    const radius = i % 2 ? 36 : 28;
    return { angle, radius, fill: ['#0b4a2c', '#7fe3a6', '#1f8f57'][i % 3] };
});

// Glass artwork, keyed by the deck's `icon` in cardDecks.js
const ICONS = {
    holiday: (
        <>
            <circle cx="50" cy="48" r="32" fill="none" stroke="#0a3f26" strokeWidth="17" />
            {WREATH_LEAVES.map(({ angle, radius, fill }) => (
                <path key={angle} transform={`rotate(${angle} 50 48) translate(50 ${48 - radius}) rotate(58)`} d="M -9 0 Q 0 -6.5 9 0 Q 0 6.5 -9 0 Z" fill={fill} stroke="#07331e" strokeWidth="0.8" />
            ))}
            {[[50, 12], [79, 28], [84, 60], [64, 80], [21, 66], [17, 33], [33, 19], [68, 17]].map(([x, y]) => (
                <circle key={`${x}${y}`} cx={x} cy={y} r="3.1" fill="#e5262f" stroke="#fff" strokeWidth="0.9" />
            ))}
            {/* The bow */}
            <path d="M 50 80 L 38 96 L 44 96 L 50 86 Z M 50 80 L 62 96 L 56 96 L 50 86 Z" fill="#b91c26" stroke="#fff" strokeWidth="1" strokeLinejoin="round" />
            <path d="M 50 80 Q 34 66 28 74 Q 26 84 50 80 Z M 50 80 Q 66 66 72 74 Q 74 84 50 80 Z" fill="#e5262f" stroke="#fff" strokeWidth="1.2" strokeLinejoin="round" />
            <circle cx="50" cy="79" r="4.2" fill="#ffd23f" stroke="#fff" strokeWidth="1" />
        </>
    ),
    // 🕺 Jeffinitely: the '70s rainbow, an '80s neon grid and a '90s squiggle, around a mixtape
    jeffinitely: (
        <>
            {/* '70s: a big rainbow sun */}
            <circle cx="50" cy="42" r="40" fill="#e8532b" />
            <circle cx="50" cy="42" r="33" fill="#f59a23" />
            <circle cx="50" cy="42" r="26" fill="#ffd23f" />
            <circle cx="50" cy="42" r="19" fill="#2ec4b6" />
            {/* '80s: a neon grid floor */}
            <rect x="3" y="58" width="94" height="35" rx="3" fill="#1a1147" />
            <path d="M 3 66 H 97 M 3 75 H 97 M 3 86 H 97 M 50 58 V 93 M 34 58 L 20 93 M 66 58 L 80 93 M 18 58 L -8 93 M 82 58 L 108 93" fill="none" stroke="#ff4fd8" strokeWidth="1.3" />
            {/* A mixtape */}
            <g transform="rotate(-6 50 56)">
                <rect x="20" y="37" width="60" height="38" rx="4" fill="#1f1f2b" stroke="#fff" strokeWidth="2" />
                <rect x="25" y="41" width="50" height="19" rx="2" fill="#fff6d8" />
                <path d="M 25 45 H 75" stroke="#ff4f9a" strokeWidth="2.6" />
                <path d="M 25 48.5 H 75" stroke="#2ec4b6" strokeWidth="2.6" />
                <circle cx="38" cy="55" r="4" fill="#1f1f2b" />
                <circle cx="62" cy="55" r="4" fill="#1f1f2b" />
                <path d="M 42 55 H 58" stroke="#1f1f2b" strokeWidth="3" />
                <path d="M 29 75 L 32 66 H 68 L 71 75" fill="#3a3a4d" stroke="#fff" strokeWidth="1.2" />
            </g>
            {/* '90s: a squiggle and some loud shapes */}
            <path d="M 6 16 q 5 -8 10 0 t 10 0 t 10 0" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" />
            <path d="M 84 8 L 96 22 L 78 24 Z" fill="#7ee081" stroke="#1f1f2b" strokeWidth="1.5" strokeLinejoin="round" />
            <circle cx="90" cy="52" r="5" fill="#ff4fd8" stroke="#1f1f2b" strokeWidth="1.5" />
            <rect x="3" y="44" width="10" height="10" fill="#18b6c9" stroke="#1f1f2b" strokeWidth="1.5" transform="rotate(20 8 49)" />
        </>
    ),
    // Two fanned cards with a sparkle
    core: (
        <>
            <g transform="rotate(14 50 82)">
                <rect x="28" y="16" width="44" height="62" rx="8" className="deck-glass" />
            </g>
            <g transform="rotate(-9 50 82)">
                <rect x="28" y="16" width="44" height="62" rx="8" className="deck-glass" />
                <path d="M35 34 V27 a4 4 0 0 1 4 -4 H47" className="deck-shine" />
                <path d="M50 31 Q52 45 66 47 Q52 49 50 63 Q48 49 34 47 Q48 45 50 31 Z" className="deck-solid" />
            </g>
        </>
    ),
    // Jack-o'-lantern
    halloween: (
        <>
            <path d="M46 27 q1 -13 12 -16 l4 6 q-7 3 -7 10 z" className="deck-glass" />
            <ellipse cx="33" cy="58" rx="21" ry="27" className="deck-glass" />
            <ellipse cx="67" cy="58" rx="21" ry="27" className="deck-glass" />
            <ellipse cx="50" cy="58" rx="19" ry="30" className="deck-glass" />
            <path d="M19 48 q4 -13 13 -16" className="deck-shine" />
            <path d="M30 52 l9 -11 l6 12 z" className="deck-solid" />
            <path d="M70 52 l-9 -11 l-6 12 z" className="deck-solid" />
            <path d="M50 55 l-4 7 h8 z" className="deck-solid" />
            <path d="M29 66 l7 4 l5 -5 l9 6 l9 -6 l5 5 l7 -4 q-5 16 -21 16 q-16 0 -21 -16 z" className="deck-solid" />
        </>
    ),
    // Speech bubble with a question mark
    trivia: (
        <>
            <path d="M16 14 H84 a10 10 0 0 1 10 10 V62 a10 10 0 0 1 -10 10 H50 L30 90 V72 H16 a10 10 0 0 1 -10 -10 V24 a10 10 0 0 1 10 -10 z" className="deck-glass" />
            <path d="M16 30 V26 a4 4 0 0 1 4 -4 H30" className="deck-shine" />
            <path d="M39 36 a11 11 0 1 1 16 9.5 q-5 3 -5 9" className="deck-line" />
            <circle cx="50" cy="63" r="3.5" className="deck-solid" />
        </>
    ),
    // A list with one answer crossed out
    list: (
        <>
            <rect x="22" y="10" width="56" height="80" rx="9" className="deck-glass" />
            <path d="M29 22 V18 a4 4 0 0 1 4 -4 H43" className="deck-shine" />
            <path d="M34 34 H66 M34 50 H66 M34 66 H56" className="deck-line" />
            <path d="M28 50 H72" className="deck-line" style={{ stroke: '#ffcf4a' }} />
        </>
    ),
    // Paw print
    animals: (
        <>
            <ellipse cx="24" cy="46" rx="9" ry="12" transform="rotate(-18 24 46)" className="deck-glass" />
            <ellipse cx="41" cy="27" rx="9" ry="12" transform="rotate(-6 41 27)" className="deck-glass" />
            <ellipse cx="60" cy="27" rx="9" ry="12" transform="rotate(6 60 27)" className="deck-glass" />
            <ellipse cx="77" cy="46" rx="9" ry="12" transform="rotate(18 77 46)" className="deck-glass" />
            <path d="M50 48 c-14 0 -25 13 -25 25 c0 9 7 14 14 14 c5 0 7 -3 11 -3 c4 0 6 3 11 3 c7 0 14 -5 14 -14 c0 -12 -11 -25 -25 -25 z" className="deck-solid" />
        </>
    ),
};

export default function DeckCard({ deck, index = 0, selected, disabled, onClick, ariaLabel, compact }) {
    const isToggle = selected !== undefined;

    return (
        <button
            type="button"
            className={`glass-btn cc-deck-card ${selected ? 'selected' : ''} ${compact ? 'compact' : ''}`}
            disabled={disabled}
            onClick={onClick}
            aria-label={ariaLabel || `${deck.title} deck`}
            aria-pressed={isToggle ? selected : undefined}
            style={{
                '--deck-from': deck.colors[0],
                '--deck-to': deck.colors[1],
                ...(deck.background ? { background: deck.background } : {}),
                '--shimmer-delay': `${index * 0.4}s`,
            }}
        >
            <span className="cc-deck-tag">{selected ? '✓ Selected' : deck.tag}</span>
            {deck.hidden && <span className="gt-hidden-badge cc-deck-hidden">Hidden</span>}
            <svg viewBox="0 0 100 100" className="cc-deck-icon" aria-hidden="true">
                {ICONS[deck.icon] || ICONS.core}
            </svg>
            <span className="cc-deck-title">{deck.title}</span>
            <span className="cc-deck-desc">{deck.description}</span>
        </button>
    );
}
