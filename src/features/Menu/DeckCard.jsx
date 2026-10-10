import React from 'react';

/**
 * 🃏 One card deck (expansion), drawn as a tall glass playing card.
 * Used on the Couch Cast deck page and the Prompt 2 create screen.
 *
 * Pass `selected` (true/false) to use it as a pick-one toggle;
 * leave it undefined for a plain "tap to go" button.
 */

// Glass artwork, keyed by the deck's `icon` in cardDecks.js
const ICONS = {
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
};

export default function DeckCard({ deck, index = 0, selected, disabled, onClick, ariaLabel }) {
    const isToggle = selected !== undefined;

    return (
        <button
            type="button"
            className={`glass-btn cc-deck-card ${selected ? 'selected' : ''}`}
            disabled={disabled}
            onClick={onClick}
            aria-label={ariaLabel || `${deck.title} deck`}
            aria-pressed={isToggle ? selected : undefined}
            style={{
                '--deck-from': deck.colors[0],
                '--deck-to': deck.colors[1],
                '--shimmer-delay': `${index * 0.4}s`,
            }}
        >
            <span className="cc-deck-tag">{selected ? '✓ Selected' : deck.tag}</span>
            <svg viewBox="0 0 100 100" className="cc-deck-icon" aria-hidden="true">
                {ICONS[deck.icon] || ICONS.core}
            </svg>
            <span className="cc-deck-title">{deck.title}</span>
            <span className="cc-deck-desc">{deck.description}</span>
        </button>
    );
}
