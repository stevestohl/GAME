import React from 'react';

/**
 * 🎃 Halloween costumes for the avatars: in a game played with the Halloween deck, every player's
 * avatar is shown as its Halloween twin (see COSTUME_FOR below and AvatarTheme in avatars.jsx).
 * Same 100 x 100 canvas and glossy medallion as the everyday avatars.
 */

const OUTLINE = '#2b2b2b';

export const HALLOWEEN_AVATARS = [
    {
        id: 'hw-ghost', label: 'Ghost', bg: '#7b2cbf',
        draw: () => (
            <>
                <path d="M26 86 L26 46 C26 28 37 18 50 18 C63 18 74 28 74 46 L74 86 L66 79 L58 86 L50 79 L42 86 L34 79 Z" fill="#f8f9fa" stroke={OUTLINE} strokeWidth="2.5" strokeLinejoin="round" />
                <ellipse cx="41" cy="45" rx="4.5" ry="6.5" fill={OUTLINE} />
                <ellipse cx="59" cy="45" rx="4.5" ry="6.5" fill={OUTLINE} />
                <ellipse cx="50" cy="60" rx="5" ry="6.5" fill={OUTLINE} />
            </>
        ),
    },
    {
        id: 'hw-spider', label: 'Spider', bg: '#ff9f1c',
        draw: () => (
            <>
                <path d="M50 4 L50 34" stroke="#f8f9fa" strokeWidth="1.5" />
                <path d="M40 50 L22 36 L12 46 M40 56 L18 54 L8 64 M41 62 L22 70 L16 82 M44 66 L32 82 L30 94 M60 50 L78 36 L88 46 M60 56 L82 54 L92 64 M59 62 L78 70 L84 82 M56 66 L68 82 L70 94"
                    fill="none" stroke="#1b1b1b" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
                <ellipse cx="50" cy="60" rx="15" ry="16" fill="#1b1b1b" />
                <circle cx="50" cy="40" r="10" fill="#1b1b1b" />
                <circle cx="46" cy="39" r="3" fill="#fff" />
                <circle cx="54" cy="39" r="3" fill="#fff" />
                <circle cx="46.5" cy="39.5" r="1.4" fill="#c1121f" />
                <circle cx="54.5" cy="39.5" r="1.4" fill="#c1121f" />
            </>
        ),
    },
    {
        id: 'hw-pumpkin', label: 'Jack-o\'-lantern', bg: '#3c096c',
        draw: () => (
            <>
                <path d="M48 26 C47 18 50 14 56 12" fill="none" stroke="#386641" strokeWidth="5" strokeLinecap="round" />
                <ellipse cx="38" cy="56" rx="16" ry="25" fill="#f77f00" stroke={OUTLINE} strokeWidth="2" />
                <ellipse cx="62" cy="56" rx="16" ry="25" fill="#f77f00" stroke={OUTLINE} strokeWidth="2" />
                <ellipse cx="50" cy="56" rx="15" ry="26" fill="#fb8b24" stroke={OUTLINE} strokeWidth="2" />
                <path d="M33 47 L40 38 L44 49 Z M67 47 L60 38 L56 49 Z" fill="#ffd60a" stroke={OUTLINE} strokeWidth="1.5" strokeLinejoin="round" />
                <path d="M32 60 L38 66 L42 61 L46 67 L50 62 L54 67 L58 61 L62 66 L68 60 Q60 76 50 76 Q40 76 32 60 Z" fill="#ffd60a" stroke={OUTLINE} strokeWidth="1.5" strokeLinejoin="round" />
            </>
        ),
    },
    {
        id: 'hw-candy', label: 'Candy', bg: '#2ec4b6',
        draw: () => (
            <>
                <path d="M30 50 L12 36 L16 50 L12 64 Z M70 50 L88 36 L84 50 L88 64 Z" fill="#ff006e" stroke={OUTLINE} strokeWidth="2.2" strokeLinejoin="round" />
                <ellipse cx="50" cy="50" rx="22" ry="16" fill="#ff006e" stroke={OUTLINE} strokeWidth="2.5" />
                <path d="M36 38 L46 62 M48 35 L58 65 M60 37 L66 52" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity="0.85" />
            </>
        ),
    },
    {
        id: 'hw-treat-bag', label: 'Trick-or-treat bag', bg: '#9d4edd',
        draw: () => (
            <>
                <path d="M34 34 C34 18 66 18 66 34" fill="none" stroke="#1b1b1b" strokeWidth="4" strokeLinecap="round" />
                <path d="M26 34 L74 34 L80 84 Q50 90 20 84 Z" fill="#f77f00" stroke={OUTLINE} strokeWidth="2.5" strokeLinejoin="round" />
                <path d="M38 50 L44 44 L46 52 Z M62 50 L56 44 L54 52 Z" fill="#1b1b1b" />
                <path d="M36 62 Q50 74 64 62 L60 64 L56 60 L52 65 L48 60 L44 65 L40 60 Z" fill="#1b1b1b" />
                <circle cx="40" cy="30" r="5" fill="#ff006e" stroke={OUTLINE} strokeWidth="1.5" />
                <rect x="52" y="22" width="9" height="12" rx="2" fill="#ffd60a" stroke={OUTLINE} strokeWidth="1.5" />
            </>
        ),
    },
    {
        id: 'hw-bat', label: 'Bat', bg: '#ffd166',
        draw: () => (
            <>
                <path d="M50 46 C42 40 30 36 14 40 C20 44 22 50 20 56 C26 52 32 54 34 60 C38 54 44 54 50 58 C56 54 62 54 66 60 C68 54 74 52 80 56 C78 50 80 44 86 40 C70 36 58 40 50 46 Z" fill="#1b1b1b" />
                <path d="M42 40 L44 30 L48 38 M58 40 L56 30 L52 38" fill="#1b1b1b" stroke="#1b1b1b" strokeWidth="3" strokeLinejoin="round" />
                <ellipse cx="50" cy="45" rx="10" ry="11" fill="#1b1b1b" />
                <circle cx="46" cy="43" r="2.4" fill="#ffd60a" />
                <circle cx="54" cy="43" r="2.4" fill="#ffd60a" />
                <path d="M46 50 L47.5 54 L49 50 M51 50 L52.5 54 L54 50" fill="#fff" />
            </>
        ),
    },
    {
        id: 'hw-witch', label: 'Witch', bg: '#80ed99',
        draw: () => (
            <>
                <circle cx="50" cy="58" r="20" fill="#95d5b2" stroke={OUTLINE} strokeWidth="2" />
                <path d="M30 52 C28 64 30 74 34 82 L40 66 Z M70 52 C72 64 70 74 66 82 L60 66 Z" fill="#6a040f" />
                <ellipse cx="50" cy="40" rx="34" ry="7" fill="#1b1b1b" />
                <path d="M32 40 L52 4 L66 40 Z" fill="#1b1b1b" />
                <rect x="34" y="31" width="30" height="6" fill="#7b2cbf" />
                <circle cx="43" cy="56" r="2.6" fill={OUTLINE} />
                <circle cx="57" cy="56" r="2.6" fill={OUTLINE} />
                <path d="M50 58 L47 66 L52 65" fill="none" stroke={OUTLINE} strokeWidth="2" strokeLinejoin="round" />
                <path d="M43 70 Q50 75 57 70" fill="none" stroke={OUTLINE} strokeWidth="2.4" strokeLinecap="round" />
            </>
        ),
    },
    {
        id: 'hw-skull', label: 'Skull', bg: '#ff6d00',
        draw: () => (
            <>
                <path d="M26 46 C26 28 37 18 50 18 C63 18 74 28 74 46 C74 56 68 60 66 64 L66 74 L34 74 L34 64 C32 60 26 56 26 46 Z" fill="#f8f9fa" stroke={OUTLINE} strokeWidth="2.5" strokeLinejoin="round" />
                <path d="M34 74 L34 82 L66 82 L66 74" fill="#f8f9fa" stroke={OUTLINE} strokeWidth="2.5" />
                <path d="M42 74 L42 82 M50 74 L50 82 M58 74 L58 82" stroke={OUTLINE} strokeWidth="2" />
                <ellipse cx="40" cy="47" rx="7" ry="8" fill={OUTLINE} />
                <ellipse cx="60" cy="47" rx="7" ry="8" fill={OUTLINE} />
                <path d="M50 56 L46 64 L54 64 Z" fill={OUTLINE} />
            </>
        ),
    },
    {
        id: 'hw-black-cat', label: 'Black cat', bg: '#ffbe0b',
        draw: () => (
            <>
                <path d="M24 30 L30 58 L44 40 Z M76 30 L70 58 L56 40 Z" fill="#1b1b1b" strokeLinejoin="round" />
                <ellipse cx="50" cy="58" rx="28" ry="25" fill="#1b1b1b" />
                <ellipse cx="40" cy="54" rx="5" ry="6" fill="#80ed99" />
                <ellipse cx="60" cy="54" rx="5" ry="6" fill="#80ed99" />
                <ellipse cx="40" cy="54" rx="1.6" ry="5" fill="#1b1b1b" />
                <ellipse cx="60" cy="54" rx="1.6" ry="5" fill="#1b1b1b" />
                <path d="M46 63 L54 63 L50 67 Z" fill="#ff7a93" />
                <path d="M30 62 L14 60 M30 66 L14 68 M70 62 L86 60 M70 66 L86 68" stroke="#e9ecef" strokeWidth="1.6" strokeLinecap="round" />
            </>
        ),
    },
    {
        id: 'hw-candy-corn', label: 'Candy corn', bg: '#5a189a',
        draw: () => (
            <>
                <path d="M50 12 C56 12 76 70 74 80 C72 88 28 88 26 80 C24 70 44 12 50 12 Z" fill="#fff8e7" stroke={OUTLINE} strokeWidth="2.5" strokeLinejoin="round" />
                <path d="M33 58 C38 60 62 60 67 58 L72 76 C70 82 30 82 28 76 Z" fill="#ffbe0b" />
                <path d="M28 76 C30 82 70 82 72 76 L74 80 C72 88 28 88 26 80 Z" fill="#fb8500" />
                <path d="M41 38 C45 40 55 40 59 38 L67 58 C62 60 38 60 33 58 Z" fill="#fb8500" />
                <path d="M50 12 C56 12 76 70 74 80 C72 88 28 88 26 80 C24 70 44 12 50 12 Z" fill="none" stroke={OUTLINE} strokeWidth="2.5" strokeLinejoin="round" />
            </>
        ),
    },
    {
        id: 'hw-mummy', label: 'Mummy', bg: '#e9c46a',
        draw: () => (
            <>
                <circle cx="50" cy="50" r="28" fill="#f1e9da" stroke={OUTLINE} strokeWidth="2.5" />
                <path d="M24 38 L76 32 M23 50 L77 44 M25 62 L75 58 M30 72 L70 70 M28 28 L62 24" stroke="#c9b79c" strokeWidth="3" strokeLinecap="round" />
                <rect x="30" y="43" width="40" height="11" rx="5" fill="#1b1b1b" />
                <circle cx="41" cy="48.5" r="3.2" fill="#ffd60a" />
                <circle cx="59" cy="48.5" r="3.2" fill="#ffd60a" />
            </>
        ),
    },
    {
        id: 'hw-vampire', label: 'Vampire', bg: '#c1121f',
        draw: () => (
            <>
                <path d="M16 100 L22 70 L34 82 L50 74 L66 82 L78 70 L84 100 Z" fill="#1b1b1b" />
                <path d="M22 70 L34 82 L50 74 L66 82 L78 70 L70 62 L30 62 Z" fill="#9d0208" />
                <circle cx="50" cy="46" r="21" fill="#e9ecef" stroke={OUTLINE} strokeWidth="2" />
                <path d="M29 42 C30 22 70 22 71 42 C66 34 56 32 50 40 C44 32 34 34 29 42 Z" fill="#1b1b1b" />
                <path d="M40 46 L46 48 M60 46 L54 48" stroke={OUTLINE} strokeWidth="2.4" strokeLinecap="round" />
                <circle cx="43" cy="51" r="2.4" fill="#9d0208" />
                <circle cx="57" cy="51" r="2.4" fill="#9d0208" />
                <path d="M42 58 Q50 63 58 58" fill="none" stroke={OUTLINE} strokeWidth="2.2" strokeLinecap="round" />
                <path d="M45 59.5 L46.5 64 L48 60.5 M52 60.5 L53.5 64 L55 59.5" fill="#fff" stroke={OUTLINE} strokeWidth="0.8" />
            </>
        ),
    },
    {
        id: 'hw-monster', label: 'Monster', bg: '#a7c957',
        draw: () => (
            <>
                <rect x="28" y="24" width="44" height="52" rx="6" fill="#74c69d" stroke={OUTLINE} strokeWidth="2.5" />
                <path d="M28 24 L72 24 L72 36 L64 32 L56 37 L48 31 L40 37 L28 32 Z" fill="#1b1b1b" />
                <rect x="20" y="58" width="8" height="6" rx="2" fill="#adb5bd" stroke={OUTLINE} strokeWidth="1.5" />
                <rect x="72" y="58" width="8" height="6" rx="2" fill="#adb5bd" stroke={OUTLINE} strokeWidth="1.5" />
                <path d="M37 47 L45 47 M55 47 L63 47" stroke={OUTLINE} strokeWidth="3" strokeLinecap="round" />
                <circle cx="41" cy="51" r="2.6" fill={OUTLINE} />
                <circle cx="59" cy="51" r="2.6" fill={OUTLINE} />
                <path d="M40 66 L60 66 M44 63 L44 69 M50 63 L50 69 M56 63 L56 69" stroke={OUTLINE} strokeWidth="2" strokeLinecap="round" />
                <path d="M58 30 L62 40 M60 34 L64 33" stroke={OUTLINE} strokeWidth="1.5" />
            </>
        ),
    },
    {
        id: 'hw-cauldron', label: 'Cauldron', bg: '#ff8fab',
        draw: () => (
            <>
                <circle cx="40" cy="30" r="6" fill="#70e000" opacity="0.85" />
                <circle cx="55" cy="22" r="4.5" fill="#70e000" opacity="0.85" />
                <circle cx="62" cy="34" r="3.5" fill="#70e000" opacity="0.85" />
                <path d="M22 46 C22 82 78 82 78 46 Z" fill="#1b1b1b" />
                <ellipse cx="50" cy="45" rx="30" ry="7" fill="#38b000" stroke="#1b1b1b" strokeWidth="4" />
                <path d="M30 78 L26 88 M70 78 L74 88" stroke="#1b1b1b" strokeWidth="5" strokeLinecap="round" />
            </>
        ),
    },
    {
        id: 'hw-lollipop', label: 'Lollipop', bg: '#4cc9f0',
        draw: () => (
            <>
                <path d="M50 58 L50 94" stroke="#f8f9fa" strokeWidth="5" strokeLinecap="round" />
                <circle cx="50" cy="40" r="24" fill="#ff006e" stroke={OUTLINE} strokeWidth="2.5" />
                <path d="M50 40 m0 -4 a4 4 0 1 1 -4 4 a8 8 0 1 1 8 8 a12 12 0 1 1 -12 -12 a16 16 0 1 1 16 16" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" />
                <path d="M44 62 Q50 56 56 62" fill="#7b2cbf" stroke={OUTLINE} strokeWidth="1.5" />
            </>
        ),
    },
];

// Each everyday avatar's Halloween twin (every one different, so no two players end up the same)
export const COSTUME_FOR = {
    'cat': 'hw-black-cat',
    'dog': 'hw-bat',
    'person-1': 'hw-witch',
    'person-2': 'hw-vampire',
    'person-3': 'hw-mummy',
    'person-4': 'hw-monster',
    'person-5': 'hw-skull',
    'smiley': 'hw-pumpkin',
    'heart': 'hw-candy',
    'goth': 'hw-ghost',
    'soccer': 'hw-spider',
    'basketball': 'hw-candy-corn',
    'football': 'hw-treat-bag',
    'baseball': 'hw-cauldron',
    'tennis': 'hw-lollipop',
};
