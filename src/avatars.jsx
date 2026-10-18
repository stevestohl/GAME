import React from 'react';

/**
 * 🙂 Player avatars for the cast games. Players pick one on the Join Room screen; the phone
 * remembers it, sends it with every join, and the TV shows it in the lobby and on the scoreboards.
 * Each avatar is a little drawing in a glossy, lit circle (drawn in code, so it looks the same on every device).
 *
 *   <Avatar id="cat" size={40} />        one avatar
 *   <AvatarPicker value={id} onChange={setId} />
 *   getMyAvatar() / setMyAvatar(id)       this phone's pick (localStorage)
 *
 * To add one: add an entry to AVATARS with an id (lowercase letters, numbers, dashes), a label,
 * a background color and a draw() that returns SVG shapes on a 100 x 100 canvas.
 */

const OUTLINE = '#2b2b2b';

// A person: skin tone, hair color and a couple of hairstyles, smiling, with a shirt
const person = (skin, hair, shirt, style = 'short') => () => (
    <>
        <path d="M18 100 C20 78 34 70 50 70 C66 70 80 78 82 100 Z" fill={shirt} />
        <rect x="44" y="58" width="12" height="14" rx="4" fill={skin} />
        {style === 'long' && <path d="M27 46 C24 22 40 14 50 14 C62 14 77 22 73 48 L74 70 L62 66 L38 66 L26 70 Z" fill={hair} />}
        <circle cx="50" cy="42" r="21" fill={skin} />
        {style === 'short' && <path d="M29 40 C27 20 43 15 52 16 C66 17 74 26 71 40 C66 30 57 27 48 29 C40 30 33 34 29 40 Z" fill={hair} />}
        {style === 'curly' && <path d="M28 40 C22 30 28 16 40 16 C44 10 56 10 60 16 C72 16 78 30 72 40 C70 32 64 28 58 30 C54 26 46 26 42 30 C36 28 30 32 28 40 Z" fill={hair} />}
        {style === 'long' && <path d="M30 38 C34 24 50 20 64 26 C68 30 70 34 70 38 C60 30 44 30 30 38 Z" fill={hair} />}
        {style === 'bun' && <><circle cx="50" cy="15" r="9" fill={hair} /><path d="M29 40 C28 24 40 18 50 18 C62 18 72 24 71 40 C64 30 38 30 29 40 Z" fill={hair} /></>}
        <circle cx="42" cy="44" r="2.6" fill={OUTLINE} />
        <circle cx="58" cy="44" r="2.6" fill={OUTLINE} />
        <path d="M42 52 Q50 59 58 52" fill="none" stroke={OUTLINE} strokeWidth="2.6" strokeLinecap="round" />
    </>
);

export const AVATARS = [
    {
        id: 'cat', label: 'Cat', bg: '#ffb703',
        draw: () => (
            <>
                <path d="M24 30 L30 58 L44 40 Z M76 30 L70 58 L56 40 Z" fill="#f2f2f2" stroke={OUTLINE} strokeWidth="2.5" strokeLinejoin="round" />
                <path d="M28 34 L32 50 L40 41 Z M72 34 L68 50 L60 41 Z" fill="#ff9fb2" />
                <ellipse cx="50" cy="58" rx="28" ry="25" fill="#f2f2f2" stroke={OUTLINE} strokeWidth="2.5" />
                <ellipse cx="40" cy="54" rx="3.5" ry="5" fill={OUTLINE} />
                <ellipse cx="60" cy="54" rx="3.5" ry="5" fill={OUTLINE} />
                <path d="M46 63 L54 63 L50 67 Z" fill="#ff7a93" />
                <path d="M50 67 Q46 72 42 70 M50 67 Q54 72 58 70" fill="none" stroke={OUTLINE} strokeWidth="2" strokeLinecap="round" />
                <path d="M30 62 L16 60 M30 66 L16 68 M70 62 L84 60 M70 66 L84 68" stroke={OUTLINE} strokeWidth="1.8" strokeLinecap="round" />
            </>
        ),
    },
    {
        id: 'dog', label: 'Dog', bg: '#8ecae6',
        draw: () => (
            <>
                <path d="M22 36 C14 44 16 66 26 72 C32 62 34 48 32 38 Z M78 36 C86 44 84 66 74 72 C68 62 66 48 68 38 Z" fill="#7a4a24" />
                <ellipse cx="50" cy="54" rx="24" ry="26" fill="#c98a4b" />
                <ellipse cx="50" cy="66" rx="14" ry="11" fill="#f1d3b0" />
                <circle cx="41" cy="50" r="3.4" fill={OUTLINE} />
                <circle cx="59" cy="50" r="3.4" fill={OUTLINE} />
                <ellipse cx="50" cy="61" rx="5.5" ry="4" fill={OUTLINE} />
                <path d="M50 65 L50 69 M44 70 Q50 75 56 70" fill="none" stroke={OUTLINE} strokeWidth="2.2" strokeLinecap="round" />
                <path d="M47 72 Q50 82 53 72 Z" fill="#ff6b81" />
            </>
        ),
    },
    { id: 'person-1', label: 'Person', bg: '#a8dadc', draw: person('#f6d7c3', '#d9a441', '#e76f51', 'short') },
    { id: 'person-2', label: 'Person', bg: '#ffd6a5', draw: person('#e8b48a', '#3d2b1f', '#2a9d8f', 'long') },
    { id: 'person-3', label: 'Person', bg: '#caffbf', draw: person('#c68642', '#1f1410', '#6a4c93', 'curly') },
    { id: 'person-4', label: 'Person', bg: '#bdb2ff', draw: person('#8d5524', '#140c08', '#f4a261', 'bun') },
    { id: 'person-5', label: 'Person', bg: '#ffc6ff', draw: person('#5c3a21', '#0d0806', '#1d4ed8', 'curly') },
    {
        id: 'smiley', label: 'Smiley', bg: '#ff8fab',
        draw: () => (
            <>
                <circle cx="50" cy="50" r="30" fill="#ffd60a" stroke={OUTLINE} strokeWidth="2.5" />
                <ellipse cx="40" cy="43" rx="3.6" ry="5.5" fill={OUTLINE} />
                <ellipse cx="60" cy="43" rx="3.6" ry="5.5" fill={OUTLINE} />
                <path d="M35 56 Q50 72 65 56" fill="none" stroke={OUTLINE} strokeWidth="3.2" strokeLinecap="round" />
            </>
        ),
    },
    {
        id: 'heart', label: 'Heart', bg: '#ffd1dc',
        draw: () => (
            <>
                <path d="M50 78 C30 64 20 52 20 40 C20 30 28 23 37 23 C43 23 48 27 50 32 C52 27 57 23 63 23 C72 23 80 30 80 40 C80 52 70 64 50 78 Z" fill="#e63946" stroke={OUTLINE} strokeWidth="2.5" strokeLinejoin="round" />
                <path d="M32 36 C32 32 35 30 38 30" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
            </>
        ),
    },
    {
        id: 'goth', label: 'Goth', bg: '#5a189a',
        draw: () => (
            <>
                <path d="M18 100 C20 78 34 70 50 70 C66 70 80 78 82 100 Z" fill="#111" />
                <path d="M26 48 C22 22 38 12 50 12 C64 12 80 22 74 50 L76 82 L62 70 L38 70 L24 82 Z" fill="#0b0b0b" />
                <rect x="44" y="58" width="12" height="13" rx="4" fill="#eee6f2" />
                <circle cx="50" cy="42" r="20" fill="#eee6f2" />
                <path d="M30 40 C32 24 46 20 56 22 C64 24 70 30 70 38 C62 28 48 30 38 36 Z" fill="#0b0b0b" />
                <path d="M37 42 L45 42 L44 47 L38 47 Z M55 42 L63 42 L62 47 L56 47 Z" fill="#2b0a3d" />
                <circle cx="41" cy="44" r="2" fill="#000" />
                <circle cx="59" cy="44" r="2" fill="#000" />
                <path d="M44 53 Q50 57 56 53 Q50 55 44 53 Z" fill="#3c0d4f" stroke="#3c0d4f" strokeWidth="2" strokeLinejoin="round" />
                <path d="M40 70 L60 70" stroke="#222" strokeWidth="4" />
                <circle cx="50" cy="73" r="2.6" fill="#b5179e" />
            </>
        ),
    },
    {
        id: 'soccer', label: 'Soccer ball', bg: '#80ed99',
        draw: () => (
            <>
                <circle cx="50" cy="50" r="30" fill="#fff" stroke={OUTLINE} strokeWidth="2.5" />
                <path d="M50 38 L61 46 L57 59 L43 59 L39 46 Z" fill={OUTLINE} />
                <path d="M50 38 L50 22 M61 46 L76 41 M57 59 L66 72 M43 59 L34 72 M39 46 L24 41" stroke={OUTLINE} strokeWidth="2.2" />
                <path d="M44 21 L56 21 L50 26 Z M77 36 L80 48 L74 44 Z M70 74 L60 78 L64 71 Z M30 74 L40 78 L36 71 Z M23 36 L20 48 L26 44 Z" fill={OUTLINE} />
            </>
        ),
    },
    {
        id: 'basketball', label: 'Basketball', bg: '#ffe066',
        draw: () => (
            <>
                <circle cx="50" cy="50" r="30" fill="#f77f00" stroke={OUTLINE} strokeWidth="2.5" />
                <path d="M20 50 L80 50 M50 20 L50 80" stroke={OUTLINE} strokeWidth="2.4" />
                <path d="M29 29 C40 40 40 60 29 71 M71 29 C60 40 60 60 71 71" fill="none" stroke={OUTLINE} strokeWidth="2.4" />
            </>
        ),
    },
    {
        id: 'football', label: 'Football', bg: '#b7e4c7',
        draw: () => (
            <>
                <path d="M18 50 C30 28 70 28 82 50 C70 72 30 72 18 50 Z" fill="#8b4513" stroke={OUTLINE} strokeWidth="2.5" transform="rotate(-30 50 50)" />
                <g transform="rotate(-30 50 50)" stroke="#fff" strokeWidth="2.4" strokeLinecap="round">
                    <path d="M38 50 L62 50" />
                    <path d="M42 46 L42 54 M47 46 L47 54 M52 46 L52 54 M57 46 L57 54" />
                    <path d="M26 44 L26 56 M74 44 L74 56" />
                </g>
            </>
        ),
    },
    {
        id: 'baseball', label: 'Baseball', bg: '#a0c4ff',
        draw: () => (
            <>
                <circle cx="50" cy="50" r="30" fill="#fff" stroke={OUTLINE} strokeWidth="2.5" />
                <path d="M32 27 C42 40 42 60 32 73 M68 27 C58 40 58 60 68 73" fill="none" stroke="#e63946" strokeWidth="2.4" />
                <path d="M34 34 L40 32 M37 42 L43 41 M38 50 L44 50 M37 58 L43 59 M34 66 L40 68 M66 34 L60 32 M63 42 L57 41 M62 50 L56 50 M63 58 L57 59 M66 66 L60 68" stroke="#e63946" strokeWidth="1.8" strokeLinecap="round" />
            </>
        ),
    },
    {
        id: 'tennis', label: 'Tennis ball', bg: '#48cae4',
        draw: () => (
            <>
                <circle cx="50" cy="50" r="30" fill="#d4f73b" stroke={OUTLINE} strokeWidth="2.5" />
                <path d="M24 34 C38 42 38 58 24 66 M76 34 C62 42 62 58 76 66" fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" />
            </>
        ),
    },
];

const BY_ID = Object.fromEntries(AVATARS.map((a) => [a.id, a]));
export const isAvatar = (id) => !!BY_ID[id];

// ---- The 3D finish: every avatar sits in the same glossy, lit "medallion" ----

// Lighten (amount > 0) or darken (amount < 0) a #rrggbb color
const shade = (hex, amount) => {
    const n = parseInt(hex.slice(1), 16);
    const mix = (c) => Math.round(amount >= 0 ? c + (255 - c) * amount : c * (1 + amount));
    const r = mix((n >> 16) & 255), g = mix((n >> 8) & 255), b = mix(n & 255);
    return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
};

/**
 * The frame every avatar is drawn in: a lit, sphere-like background, the drawing raised off it with a
 * soft shadow, a gentle shadow toward the edges, a gloss highlight across the top and a beveled rim.
 * (Gradient and filter ids are per color/avatar, so many avatars on one screen share them safely.)
 */
function Medallion({ uid, bg, label, size, className, style, children }) {
    const k = `av-${uid}`;
    return (
        <svg viewBox="0 0 100 100" width={size} height={size} className={`gt-avatar ${className}`} style={{ flexShrink: 0, display: 'inline-block', ...style }} role="img" aria-label={label}>
            <defs>
                {/* Background lit from the top left */}
                <radialGradient id={`${k}-bg`} cx="35%" cy="28%" r="80%">
                    <stop offset="0%" stopColor={shade(bg, 0.45)} />
                    <stop offset="55%" stopColor={bg} />
                    <stop offset="100%" stopColor={shade(bg, -0.35)} />
                </radialGradient>
                {/* Darker toward the edges, so it reads as round */}
                <radialGradient id={`${k}-edge`} cx="50%" cy="45%" r="55%">
                    <stop offset="70%" stopColor="#000" stopOpacity="0" />
                    <stop offset="100%" stopColor="#000" stopOpacity="0.28" />
                </radialGradient>
                {/* Gloss across the top */}
                <linearGradient id={`${k}-gloss`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fff" stopOpacity="0.75" />
                    <stop offset="100%" stopColor="#fff" stopOpacity="0" />
                </linearGradient>
                {/* Beveled rim: bright on top, darker underneath */}
                <linearGradient id={`${k}-rim`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="50%" stopColor={shade(bg, 0.6)} />
                    <stop offset="100%" stopColor={shade(bg, -0.45)} />
                </linearGradient>
                {/* The drawing floats a little above the background */}
                <filter id={`${k}-lift`} x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="2.2" stdDeviation="1.8" floodColor="#000" floodOpacity="0.35" />
                </filter>
                <clipPath id={`${k}-clip`}><circle cx="50" cy="50" r="46" /></clipPath>
            </defs>

            <circle cx="50" cy="50" r="46" fill={`url(#${k}-bg)`} />
            <g clipPath={`url(#${k}-clip)`}>
                <g filter={`url(#${k}-lift)`}>{children}</g>
                <circle cx="50" cy="50" r="46" fill={`url(#${k}-edge)`} />
                <ellipse cx="50" cy="24" rx="34" ry="18" fill={`url(#${k}-gloss)`} />
            </g>
            <circle cx="50" cy="50" r="47" fill="none" stroke={`url(#${k}-rim)`} strokeWidth="4" />
            <circle cx="50" cy="50" r="49" fill="none" stroke="#000" strokeOpacity="0.18" strokeWidth="1" />
        </svg>
    );
}

/** One avatar: a drawing in a glossy, 3D-looking circle (a player with no avatar gets their first initial) */
export function Avatar({ id, name, size = 40, className = '', style }) {
    const avatar = BY_ID[id];
    if (!avatar) {
        if (!name) return null;
        return (
            <Medallion uid="initial" bg="#9ca3af" label={name} size={size} className={className} style={style}>
                <text x="50" y="66" textAnchor="middle" fontSize="46" fontWeight="800" fill="#fff" fontFamily="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif">
                    {String(name).trim().charAt(0).toUpperCase() || '?'}
                </text>
            </Medallion>
        );
    }
    return (
        <Medallion uid={id} bg={avatar.bg} label={avatar.label} size={size} className={className} style={style}>
            {avatar.draw()}
        </Medallion>
    );
}

// ---- This phone's pick ----
const STORAGE_KEY = 'templeAvatar';

/** The avatar this phone uses (picks one at random the first time) */
export function getMyAvatar() {
    let id = null;
    try { id = localStorage.getItem(STORAGE_KEY); } catch { /* private mode */ }
    if (isAvatar(id)) return id;
    id = AVATARS[Math.floor(Math.random() * AVATARS.length)].id;
    setMyAvatar(id);
    return id;
}

export function setMyAvatar(id) {
    if (!isAvatar(id)) return;
    try { localStorage.setItem(STORAGE_KEY, id); } catch { /* private mode */ }
}

/** A grid of avatars to tap (Join Room screen) */
export function AvatarPicker({ value, onChange }) {
    return (
        <div className="gt-avatar-picker" role="radiogroup" aria-label="Pick your avatar">
            {AVATARS.map((avatar) => (
                <button
                    key={avatar.id}
                    type="button"
                    role="radio"
                    aria-checked={value === avatar.id}
                    aria-label={avatar.label}
                    className={`gt-avatar-choice ${value === avatar.id ? 'selected' : ''}`}
                    onClick={() => onChange(avatar.id)}
                >
                    <Avatar id={avatar.id} size={46} />
                </button>
            ))}
        </div>
    );
}
