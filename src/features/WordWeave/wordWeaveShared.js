import { useEffect, useState } from 'react';
import { serverNow } from '../../serverClock.js';

// 🧶 Word Weave: the settings, the score and the words the screens share.
// The server checks the same lists (sockets/wordweave_handler.js) and scores the same way (sockets/wordweaveRules.js).

export const ROUND_OPTIONS = Array.from({ length: 50 }, (_, i) => i + 1);
export const DEFAULT_ROUNDS = 3;
export const SIZE_OPTIONS = [
    { value: 4, label: '4 × 4' },
    { value: 5, label: '5 × 5' },
];
export const SECONDS_OPTIONS = [60, 90, 120, 150, 180, 240, 300];
export const DEFAULT_SECONDS = { 4: 120, 5: 180 };
export const MIN_LENGTH = 3;

/** 75 -> "1:15" */
export const clockText = (seconds) => {
    const s = Math.max(0, Math.round(seconds));
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};
export const secondsLabel = (seconds) => (seconds % 60 ? clockText(seconds) : `${seconds / 60} min`);

// Longer words score more, like the Fibonacci numbers (8 letters or more: 13)
export const POINTS_TABLE = [[3, 1], [4, 2], [5, 3], [6, 5], [7, 8], [8, 13]];
export const pointsFor = (word) => (word.length >= 8 ? 13 : POINTS_TABLE.find(([n]) => n === word.length)?.[1] || 0);
export const plural = (n, one, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

// Why a word didn't go in (the server's reason codes)
export const REASONS = {
    short: `Words need ${MIN_LENGTH} letters or more`,
    again: 'You already have that one',
    word: "That's not in our word list",
    grid: "Those letters don't touch on this grid",
    blocked: "That word's off the list in Word Weave",
    time: "Time's up!",
    paused: 'Paused: hang on a moment',
    closed: 'This round is over',
};

/** Seconds left until the server's `endTime` (null when there's no clock), on the server's clock */
export function useCountdown(endTime) {
    const [timeLeft, setTimeLeft] = useState(null);
    useEffect(() => {
        if (!endTime) { setTimeLeft(null); return undefined; }
        const update = () => setTimeLeft(Math.max(0, Math.ceil((endTime - serverNow()) / 1000)));
        update();
        const timer = setInterval(update, 250);
        return () => clearInterval(timer);
    }, [endTime]);
    return timeLeft;
}

/** The narrator's welcome on the TV */
export const rulesNarration = (room) => [
    'Welcome to Word Weave!',
    'Find words by sliding your finger through letters that touch, up, down, across or corner to corner. Each letter can only be used once in a word.',
    'Words need three letters or more, and they have to be real words.',
    'When the time runs out, any word that two or more of you found gets crossed out. So find the ones nobody else will!',
    'Longer words score more. Eight letters or more is worth thirteen points.',
    `${room.totalRounds === 1 ? 'One round' : `${room.totalRounds} rounds`}. Get weaving!`,
];

export const RULE_STEPS = [
    { icon: '🧶', title: 'Weave', text: 'Slide through letters that touch: across, up, down or corner to corner. Each letter once per word.' },
    { icon: '📖', title: 'Real words', text: `${MIN_LENGTH} letters or more, checked against a dictionary as you go.` },
    { icon: '✂️', title: 'Be original', text: 'When time runs out, any word two or more players found is crossed out.' },
    { icon: '📏', title: 'Go long', text: '3 letters 1 point, 4 → 2, 5 → 3, 6 → 5, 7 → 8, and 8 or more 13!' },
];

/** The players' place on the standings, as words: 1 -> "1st" */
export const placeText = (n) => {
    if (n % 100 >= 11 && n % 100 <= 13) return `${n}th`;
    return `${n}${['th', 'st', 'nd', 'rd'][n % 10] || 'th'}`;
};
