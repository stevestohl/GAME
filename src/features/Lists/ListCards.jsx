import React from 'react';
import '../../styles/lists.css';

/**
 * 🃏 The three round cards for List Cast and Listopia (the rules live on the server in
 * sockets/listMatching.js; the room sends each round's card as `room.card`).
 *
 *   One-on-One     -> list 10, match exactly ONE other player
 *   Threefold      -> list 3,  match as many players as you can
 *   Forgotten Four -> list 4,  match NOBODY
 */
export const CARD_LOOKS = {
    one_on_one: { icon: '🤝', className: 'one-on-one', short: 'Match exactly one player' },
    threefold: { icon: '🎯', className: 'threefold', short: 'Match as many as you can' },
    forgotten_four: { icon: '👻', className: 'forgotten-four', short: 'Match nobody' },
};

const lookFor = (card) => CARD_LOOKS[card?.id] || CARD_LOOKS.forgotten_four;

/** What the narrator says when a card is drawn (no round number, so all three can be fetched ahead of time) */
const SPOKEN_NUMBERS = { 3: 'three', 4: 'four', 10: 'ten' };
export const cardAnnouncement = (card) =>
    card ? `${card.name}! List ${SPOKEN_NUMBERS[card.listSize] || card.listSize}. ${card.goal.replace('ONE', 'one').replace('NOBODY', 'nobody')}.` : '';

/** The three announcements, for preloading the narrator in the lobby */
export const ALL_CARD_ANNOUNCEMENTS = [
    cardAnnouncement({ name: 'One-on-One', listSize: 10, goal: 'Match exactly ONE other player' }),
    cardAnnouncement({ name: 'Threefold', listSize: 3, goal: 'Match as many players as you can' }),
    cardAnnouncement({ name: 'Forgotten Four', listSize: 4, goal: 'Match NOBODY' }),
];

/** The tip under the answer boxes while writing */
export const cardWritingTip = (card) => {
    if (card?.id === 'one_on_one') return 'Think of what exactly ONE other player will write. Too popular and it gets crossed out!';
    if (card?.id === 'threefold') return 'Go for the obvious! Every player who writes your answer scores you points.';
    return 'Go for the unusual! Answers someone else also writes get crossed out.';
};

/** 🃏 The card itself: big on the TV reveal, medium on phones */
export function RoundCard({ card, size = 'md', pointsPerItem = 100 }) {
    if (!card) return null;
    const look = lookFor(card);
    const scoring = card.id === 'threefold'
        ? `+${pointsPerItem} for every player you match`
        : `+${pointsPerItem} per scoring answer`;

    return (
        <div className={`ls-roundcard ${look.className} ${size}`} role="group" aria-label={`${card.name} card`}>
            <div className="ls-roundcard-corner" aria-hidden="true">{card.listSize}</div>
            <div className="ls-roundcard-icon" aria-hidden="true">{look.icon}</div>
            <div className="ls-roundcard-name">{card.name}</div>
            <div className="ls-roundcard-goal">{card.goal}</div>
            <div className="ls-roundcard-how">{card.howTo}</div>
            <div className="ls-roundcard-points">{scoring}</div>
        </div>
    );
}

/** A small pill naming the round's card, for the corner of the writing and board screens */
export function CardChip({ card }) {
    if (!card) return null;
    const look = lookFor(card);
    return (
        <span className={`ls-card-chip ${look.className}`}>
            <span aria-hidden="true">{look.icon}</span> {card.name} · {look.short}
        </span>
    );
}
