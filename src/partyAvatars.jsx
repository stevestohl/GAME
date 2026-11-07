import React from 'react';

/**
 * 🍞 Party avatars: toast, fruit, snacks and silly characters.
 * Same rules as AVATARS in avatars.jsx (which adds these to its list): SVG shapes on a 100 x 100 canvas,
 * kept inside the circle (about 12 to 88) and drawn bold enough to read at the picker's 46px.
 */

const INK = '#16161d';
const ink = { stroke: INK, strokeWidth: 2.4, strokeLinejoin: 'round' };
const line = { fill: 'none', stroke: INK, strokeLinecap: 'round', strokeLinejoin: 'round' };

// --- Faces: the bits most of the food wears ---

/** Two dot eyes with a white glint, (cx - x) and (cx + x) across */
const Eyes = ({ cx = 50, x = 9, y = 50, r = 3.4 }) => (
    <>
        <circle cx={cx - x} cy={y} r={r} fill={INK} />
        <circle cx={cx + x} cy={y} r={r} fill={INK} />
        <circle cx={cx - x + r * 0.35} cy={y - r * 0.4} r={r * 0.36} fill="#fff" />
        <circle cx={cx + x + r * 0.35} cy={y - r * 0.4} r={r * 0.36} fill="#fff" />
    </>
);

const Smile = ({ cx = 50, y = 58, w = 7, d = 6, sw = 2.6 }) => (
    <path d={`M${cx - w} ${y} Q${cx} ${y + d} ${cx + w} ${y}`} {...line} strokeWidth={sw} />
);

const Cheeks = ({ cx = 50, x = 15, y = 58, r = 4 }) => (
    <>
        <ellipse cx={cx - x} cy={y} rx={r} ry={r * 0.65} fill="#ff6b81" opacity="0.5" />
        <ellipse cx={cx + x} cy={y} rx={r} ry={r * 0.65} fill="#ff6b81" opacity="0.5" />
    </>
);

/** A googly eye: white, with the pupil rolled (px, py) off center */
const Googly = ({ cx, cy, r, px = 0, py = 0, pupil = 0.5 }) => (
    <>
        <circle cx={cx} cy={cy} r={r} fill="#fff" {...ink} strokeWidth={1.8} />
        <circle cx={cx + px} cy={cy + py} r={r * pupil} fill={INK} />
    </>
);

// --- 🍞 Toast: a slice of bread, crust and crumb, that the faces sit on ---

const TOAST_CRUST = 'M24 80 V46 C14 42 14 24 31 21 C39 12 61 12 69 21 C86 24 86 42 76 46 V80 Q76 84 72 84 H28 Q24 84 24 80 Z';
const TOAST_CRUMB = 'M30 76 V43 C22 40 22 29 34 27 C41 19 59 19 66 27 C78 29 78 40 70 43 V76 Q70 78 68 78 H32 Q30 78 30 76 Z';
const Toast = ({ crust = '#b8732e', crumb = '#f2c47a', transform, children }) => (
    <g transform={transform}>
        <path d={TOAST_CRUST} fill={crust} {...ink} />
        <path d={TOAST_CRUMB} fill={crumb} />
        {children}
    </g>
);

// Diagonal criss-cross lines inside an ellipse (a pineapple's skin)
const crossHatch = (cx, cy, rx, ry, gap) => {
    let d = '';
    for (const slope of [1, -1]) {
        for (let c = -(rx + ry); c <= rx + ry; c += gap) {
            // The line y = slope * x + c against x²/rx² + y²/ry² = 1, in the ellipse's own coordinates
            const a = 1 / (rx * rx) + 1 / (ry * ry);
            const b = (2 * slope * c) / (ry * ry);
            const k = (c * c) / (ry * ry) - 1;
            const disc = b * b - 4 * a * k;
            if (disc <= 0) continue;
            const s = Math.sqrt(disc);
            const [x1, x2] = [(-b - s) / (2 * a), (-b + s) / (2 * a)];
            d += `M${(cx + x1).toFixed(1)} ${(cy + slope * x1 + c).toFixed(1)} L${(cx + x2).toFixed(1)} ${(cy + slope * x2 + c).toFixed(1)} `;
        }
    }
    return d;
};
const PINEAPPLE_SKIN = crossHatch(50, 64, 21, 23, 9);

// A kiwi's seeds, in a ring around its core
const KIWI_SEEDS = Array.from({ length: 14 }, (_, i) => {
    const angle = (i / 14) * Math.PI * 2;
    return { x: 50 + Math.cos(angle) * 21, y: 53 + Math.sin(angle) * 19, deg: (angle * 180) / Math.PI };
});

// --- ✨ The ones asked for ---

const HEADLINERS = [
    {
        // An apple taking a bite out of itself, and looking a little guilty about it
        id: 'hungry-apple', label: 'Hungry Apple', bg: '#b9fbc0',
        draw: () => (
            <>
                <path d="M50 30 C50 22 52 17 56 13" {...line} stroke="#6b3e1f" strokeWidth="4" />
                <path d="M54 22 C58 12 70 10 74 14 C70 24 60 26 54 22 Z" fill="#52b043" {...ink} strokeWidth="2" />
                <path d="M50 30 C40 22 18 24 17 47 C16 68 30 85 42 85 C46 85 48 83 50 83 C52 83 54 85 58 85 C70 85 82 72 83 60 Q75 59 74 52 Q69 47 73 41 Q72.5 35 79 33 C74 25 60 24 50 30 Z" fill="#e63946" {...ink} />
                <path d="M83 60 Q75 59 74 52 Q69 47 73 41 Q72.5 35 79 33 L75 30.5 Q66 33 67 41 Q64 48 69 54 Q72 61 81.5 64 Z" fill="#fff1c1" />
                <path d="M83 60 Q75 59 74 52 Q69 47 73 41 Q72.5 35 79 33" {...line} strokeWidth="2.4" />
                <path d="M26 46 C26 38 30 33 36 32" {...line} stroke="#fff" strokeWidth="4" opacity="0.7" />
                <Googly cx={38} cy={50} r={6} px={2.4} py={-1} />
                <Googly cx={54} cy={50} r={6} px={2.4} py={-1} />
                <path d="M32 41 L42 39 M50 39 L60 41" {...line} strokeWidth="2.4" />
                <path d="M37 62 Q46 59 57 62 Q55 72 47 72 Q39 72 37 62 Z" fill="#7a2230" {...ink} strokeWidth="2" />
                <path d="M42 63 L53 62 L51 68 L44 68 Z" fill="#fff1c1" stroke={INK} strokeWidth="1.2" strokeLinejoin="round" />
                <path d="M42 63 L53 62" stroke="#e63946" strokeWidth="2" />
                <circle cx="87" cy="45" r="2" fill="#fff1c1" stroke={INK} strokeWidth="1" />
                <circle cx="85" cy="53" r="1.6" fill="#fff1c1" stroke={INK} strokeWidth="1" />
                <circle cx="84" cy="38" r="1.4" fill="#fff1c1" stroke={INK} strokeWidth="1" />
            </>
        ),
    },
    {
        // A broccoli eating a smaller (and quite alarmed) broccoli
        id: 'broccoli-chomp', label: 'Broccoli Chomp', bg: '#ffd166',
        draw: () => (
            <>
                <path d="M36 46 C40 56 38 72 33 86 Q50 92 67 86 C62 72 60 56 64 46 Z" fill="#a8d672" {...ink} />
                <path d="M28 50 C14 50 10 36 18 29 C16 18 28 11 36 15 C40 7 60 7 64 15 C72 11 84 18 82 29 C90 36 86 50 72 50 Q50 54 28 50 Z" fill="#2f8f3a" {...ink} />
                <circle cx="30" cy="30" r="5" fill="#3fa84a" />
                <circle cx="50" cy="22" r="6" fill="#3fa84a" />
                <circle cx="70" cy="31" r="5" fill="#3fa84a" />
                <circle cx="40" cy="40" r="4" fill="#3fa84a" />
                <circle cx="62" cy="42" r="4" fill="#3fa84a" />
                <Eyes x={8} y={58} r={3.2} />
                <path d="M37 52 L45 54 M63 52 L55 54" {...line} strokeWidth="2.4" />
                <ellipse cx="49" cy="74" rx="12" ry="8.5" fill="#7a2230" {...ink} strokeWidth="2" />
                {/* the little one, going in stalk first */}
                <path d="M47 72 L66 64 L70 71 L50 78 Z" fill="#c5e59a" {...ink} strokeWidth="1.8" />
                <path d="M40 68 l3 3 l3 -3.6 l3 3.4 l3 -3.8 l3 3.2" fill="#fff" stroke={INK} strokeWidth="1.2" strokeLinejoin="round" />
                <path d="M66 62 C62 54 70 49 74 52 C76 46 86 47 86 54 C92 57 90 68 84 68 C82 74 72 74 70 70 C64 70 62 64 66 62 Z" fill="#2f8f3a" {...ink} strokeWidth="2" />
                <circle cx="74" cy="59" r="2.6" fill="#fff" />
                <circle cx="81" cy="58" r="2.6" fill="#fff" />
                <circle cx="74.4" cy="59.4" r="1.2" fill={INK} />
                <circle cx="81.4" cy="58.4" r="1.2" fill={INK} />
                <ellipse cx="78" cy="65" rx="1.8" ry="2.2" fill={INK} />
            </>
        ),
    },
    {
        id: 'worried-bear', label: 'Worried Bear', bg: '#a0c4ff',
        draw: () => (
            <>
                <circle cx="27" cy="31" r="11" fill="#9c6b3f" {...ink} />
                <circle cx="73" cy="31" r="11" fill="#9c6b3f" {...ink} />
                <circle cx="27" cy="31" r="5.5" fill="#d9a77a" />
                <circle cx="73" cy="31" r="5.5" fill="#d9a77a" />
                <ellipse cx="50" cy="55" rx="30" ry="28" fill="#9c6b3f" {...ink} />
                <ellipse cx="50" cy="67" rx="14" ry="11" fill="#e8c49a" {...ink} strokeWidth="1.8" />
                <ellipse cx="50" cy="61" rx="5.5" ry="3.8" fill={INK} />
                <path d="M32 44 L45 38 M68 44 L55 38" {...line} strokeWidth="3" />
                <ellipse cx="40" cy="50" rx="4.6" ry="5.6" fill="#fff" {...ink} strokeWidth="1.6" />
                <ellipse cx="60" cy="50" rx="4.6" ry="5.6" fill="#fff" {...ink} strokeWidth="1.6" />
                <circle cx="40" cy="51.5" r="2.2" fill={INK} />
                <circle cx="60" cy="51.5" r="2.2" fill={INK} />
                <path d="M42 72 q2 -2.6 4 0 t4 0 t4 0 t4 0" {...line} strokeWidth="2.2" />
                <path d="M80 38 C75 45 75 50 80 50 C85 50 85 45 80 38 Z" fill="#74c0fc" {...ink} strokeWidth="1.4" />
            </>
        ),
    },
    {
        // An otter holding its favourite shell
        id: 'otter', label: 'Otter', bg: '#48cae4',
        draw: () => (
            <>
                <path d="M24 100 C24 80 36 68 50 68 C64 68 76 80 76 100 Z" fill="#8a5a33" {...ink} />
                <path d="M36 100 C36 86 42 78 50 78 C58 78 64 86 64 100 Z" fill="#d8bf9a" />
                <circle cx="27" cy="31" r="6" fill="#8a5a33" {...ink} strokeWidth="2" />
                <circle cx="73" cy="31" r="6" fill="#8a5a33" {...ink} strokeWidth="2" />
                <ellipse cx="50" cy="47" rx="27" ry="24" fill="#8a5a33" {...ink} />
                <path d="M28 52 C30 42 40 40 50 44 C60 40 70 42 72 52 C72 64 62 70 50 70 C38 70 28 64 28 52 Z" fill="#e8d5b5" />
                <Eyes x={10} y={39} r={3.4} />
                <path d="M44 49 Q50 46 56 49 Q54 54 50 54 Q46 54 44 49 Z" fill={INK} />
                <path d="M50 54 V57 M44 58 Q47 61 50 57 Q53 61 56 58" {...line} strokeWidth="1.8" />
                <path d="M38 55 L24 52 M38 58 L24 59 M62 55 L76 52 M62 58 L76 59" {...line} strokeWidth="1.2" />
                <path d="M38 88 C38 74 62 74 62 88 Q50 92 38 88 Z" fill="#ffb4c8" {...ink} strokeWidth="2" />
                <path d="M50 76 V89 M44 78 L42 88 M56 78 L58 88" {...line} stroke="#d97a96" strokeWidth="1.4" />
                <ellipse cx="37" cy="83" rx="6.5" ry="5.5" fill="#8a5a33" {...ink} strokeWidth="2" />
                <ellipse cx="63" cy="83" rx="6.5" ry="5.5" fill="#8a5a33" {...ink} strokeWidth="2" />
            </>
        ),
    },
    {
        id: 'dolphin', label: 'Dolphin', bg: '#ffd166',
        draw: () => (
            <>
                <path d="M48 36 C52 24 60 18 68 18 C65 25 65 32 67 39 Z" fill="#4f86d0" {...ink} strokeWidth="2.2" />
                <path d="M15 55 Q15 50 24 49 C28 38 42 32 56 34 C68 36 76 44 80 54 L89 44 Q90 56 83 62 L86 71 Q77 67 72 64 C60 70 40 71 30 63 Q24 59 18 59 Q13 59 15 55 Z" fill="#5b9be6" {...ink} />
                <path d="M23 59 C34 66 54 68 70 62 C60 70 40 71 30 63 Q27 61 23 59 Z" fill="#d6ecff" />
                <path d="M46 62 C44 70 38 76 33 79 C42 78 50 73 54 64 Z" fill="#4f86d0" {...ink} strokeWidth="2" />
                <circle cx="33" cy="47" r="3" fill={INK} />
                <circle cx="34" cy="46" r="1" fill="#fff" />
                <path d="M16 55 Q23 58 31 54" {...line} strokeWidth="2" />
                <path d="M8 86 Q18 80 28 86 T48 86 T68 86 T88 86 T108 86 V100 H8 Z" fill="#4cc9f0" {...ink} strokeWidth="2" />
                <circle cx="20" cy="76" r="2.4" fill="#4cc9f0" {...ink} strokeWidth="1" />
                <circle cx="80" cy="78" r="2" fill="#4cc9f0" {...ink} strokeWidth="1" />
            </>
        ),
    },
    {
        id: 'pirate', label: 'Pirate', bg: '#4cc9f0',
        draw: () => (
            <>
                <path d="M18 100 C20 80 34 72 50 72 C66 72 80 80 82 100 Z" fill="#fff" {...ink} />
                <path d="M22 88 Q50 80 78 88 M19 98 Q50 90 81 98" fill="none" stroke="#d62828" strokeWidth="5" />
                <circle cx="50" cy="49" r="21" fill="#f2c9a5" {...ink} />
                <path d="M29 50 C29 72 40 82 50 82 C60 82 71 72 71 50 C67 60 59 63 50 63 C41 63 33 60 29 50 Z" fill="#7a3e1d" {...ink} strokeWidth="2" />
                <path d="M41 61 C45 58 50 60 50 60 C50 60 55 58 59 61 C55 63 50 62 50 62 C50 62 45 63 41 61 Z" fill="#5a2c12" />
                <path d="M43 66 Q50 72 57 66 Q50 68 43 66 Z" fill="#fff" {...ink} strokeWidth="1.6" />
                <path d="M30 37 L68 49" stroke={INK} strokeWidth="2" />
                <ellipse cx="42" cy="47" rx="6" ry="5.5" fill={INK} />
                <circle cx="59" cy="47" r="2.8" fill={INK} />
                <circle cx="71" cy="57" r="3.2" fill="none" stroke="#e0b04a" strokeWidth="2" />
                <path d="M16 36 C24 18 38 14 50 20 C62 14 76 18 84 36 C72 31 61 31 50 33 C39 31 28 31 16 36 Z" fill="#1d1a24" {...ink} />
                <circle cx="50" cy="26" r="3.6" fill="#fff" />
                <path d="M45 30 L55 34 M55 30 L45 34" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
            </>
        ),
    },
    {
        // The 1928 boat-steering mouse, in black and white: pie-cut eyes, bare hands, rubber-hose arms
        id: 'steamboat-mouse', label: 'Steamboat Mouse', bg: '#cfcfcf',
        draw: () => (
            <>
                <path d="M40 68 L60 68 L62 90 L38 90 Z" fill="#111" />
                <circle cx="28" cy="28" r="12" fill="#111" />
                <circle cx="72" cy="28" r="12" fill="#111" />
                <circle cx="50" cy="48" r="20" fill="#111" />
                <path d="M34 50 C32 40 38 34 44 38 C46 34 54 34 56 38 C62 34 68 40 66 50 C72 56 70 66 60 68 C56 72 44 72 40 68 C30 66 28 56 34 50 Z" fill="#f6f6f2" stroke="#111" strokeWidth="1.6" />
                <ellipse cx="45" cy="45" rx="3.4" ry="6" fill="#111" />
                <ellipse cx="55" cy="45" rx="3.4" ry="6" fill="#111" />
                <path d="M45 44 L48.6 40.8 L48.8 45.2 Z M55 44 L58.6 40.8 L58.8 45.2 Z" fill="#f6f6f2" />
                <ellipse cx="50" cy="55" rx="6" ry="4.4" fill="#111" />
                <path d="M37 59 Q50 72 63 59" fill="none" stroke="#111" strokeWidth="2.4" strokeLinecap="round" />
                <path d="M44 64 Q50 69 56 64 Q50 66 44 64 Z" fill="#555" />
                {/* the ship's wheel, with bare black hands on it */}
                <circle cx="50" cy="86" r="13" fill="none" stroke="#6f6f6f" strokeWidth="4" />
                <path d="M50 66 V106 M30 86 H70 M36 72 L64 100 M64 72 L36 100" stroke="#6f6f6f" strokeWidth="3" strokeLinecap="round" />
                <circle cx="50" cy="86" r="4" fill="#6f6f6f" />
                <path d="M41 70 C34 74 32 78 36 80 M59 70 C66 74 68 78 64 80" fill="none" stroke="#111" strokeWidth="4" strokeLinecap="round" />
                <circle cx="36" cy="80" r="4" fill="#111" />
                <circle cx="64" cy="80" r="4" fill="#111" />
                <path d="M76 52 V40 L84 38 V50" fill="none" stroke="#111" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                <ellipse cx="74" cy="52" rx="3" ry="2.2" fill="#111" />
                <ellipse cx="82" cy="50" rx="3" ry="2.2" fill="#111" />
            </>
        ),
    },
];

// --- 🍞 Toast ---

const TOASTS = [
    {
        id: 'toast', label: 'Toast', bg: '#ff8fab',
        draw: () => (
            <Toast>
                <path d="M44 38 C44 32 70 30 72 36 C74 41 70 44 64 43 C62 47 58 47 57 43 C50 44 44 43 44 38 Z" fill="#fff3a8" opacity="0.9" />
                <rect x="50" y="27" width="17" height="11" rx="3" fill="#ffe066" {...ink} strokeWidth="1.8" transform="rotate(-10 58 32)" />
                <path d="M53 29 L61 27.6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" transform="rotate(-10 58 32)" />
                <Eyes y={52} />
                <Smile y={61} />
                <Cheeks y={60} x={16} />
            </Toast>
        ),
    },
    {
        id: 'burnt-toast', label: 'Burnt Toast', bg: '#ffb4a2',
        draw: () => (
            <>
                <path d="M38 22 q-4 -4 0 -8 t0 -8 M56 20 q-4 -4 0 -8 t0 -8" fill="none" stroke="#6c6c6c" strokeWidth="3.4" strokeLinecap="round" opacity="0.85" />
                <Toast crust="#2a1a10" crumb="#4a2e1b" transform="translate(50 56) scale(0.88) translate(-50 -50)">
                    <path d="M33 40 L45 45 M67 40 L55 45" fill="none" stroke="#f4efe4" strokeWidth="3" strokeLinecap="round" />
                    <circle cx="40" cy="52" r="5" fill="#f4efe4" />
                    <circle cx="60" cy="52" r="5" fill="#f4efe4" />
                    <circle cx="41" cy="53" r="2.4" fill={INK} />
                    <circle cx="59" cy="53" r="2.4" fill={INK} />
                    <path d="M41 67 Q50 60 59 67" fill="none" stroke="#f4efe4" strokeWidth="2.8" strokeLinecap="round" />
                </Toast>
            </>
        ),
    },
    {
        id: 'jam-toast', label: 'Jam Toast', bg: '#a0c4ff',
        draw: () => (
            <Toast>
                <path d="M31 31 C38 22 62 22 69 30 C73 35 71 41 67 41 C66 47 61 47 60 42 C54 43 48 41 45 45 C43 50 38 50 38 44 C31 44 27 37 31 31 Z" fill="#d62868" {...ink} strokeWidth="1.8" />
                <path d="M36 32 Q40 28 46 28" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" opacity="0.8" />
                <circle cx="41" cy="56" r="3.4" fill={INK} />
                <path d="M54 56 Q59 52 64 56" {...line} strokeWidth="2.8" />
                <path d="M40 64 Q50 72 60 64" {...line} strokeWidth="2.6" />
                <path d="M51 68 Q52 75 56 74 Q59 73 57 67 Z" fill="#ff6b81" {...ink} strokeWidth="1.4" />
            </Toast>
        ),
    },
    {
        id: 'avo-toast', label: 'Avo Toast', bg: '#ffc6ff',
        draw: () => (
            <Toast>
                <path d="M27 38 C30 26 40 22 48 26 C42 30 36 36 33 44 Z" fill="#9ccc54" stroke="#3f6b1e" strokeWidth="2.2" strokeLinejoin="round" />
                <path d="M38 34 C42 22 54 18 62 24 C56 26 48 32 45 40 Z" fill="#b5dc6c" stroke="#3f6b1e" strokeWidth="2.2" strokeLinejoin="round" />
                <path d="M52 34 C58 24 70 22 76 30 C70 31 62 36 58 42 Z" fill="#9ccc54" stroke="#3f6b1e" strokeWidth="2.2" strokeLinejoin="round" />
                <circle cx="42" cy="44" r="1.2" fill="#e63946" />
                <circle cx="63" cy="44" r="1.2" fill="#e63946" />
                <circle cx="52" cy="46" r="1" fill="#e63946" />
                <Eyes y={55} />
                <Smile y={64} />
            </Toast>
        ),
    },
    {
        id: 'popup-toast', label: 'Pop-Up Toast', bg: '#ffe066',
        draw: () => (
            <>
                <Toast transform="translate(50 34) scale(0.62) translate(-50 -50)">
                    <path d="M36 38 Q41 33 46 38 M54 38 Q59 33 64 38" {...line} strokeWidth="3.6" />
                    <circle cx="41" cy="48" r="4.4" fill={INK} />
                    <circle cx="59" cy="48" r="4.4" fill={INK} />
                    <ellipse cx="50" cy="63" rx="5" ry="6" fill="#7a2230" {...ink} strokeWidth="2.6" />
                </Toast>
                <path d="M20 22 l-6 -3 M19 30 h-7 M80 22 l6 -3 M81 30 h7" {...line} strokeWidth="2.4" />
                <rect x="18" y="52" width="64" height="32" rx="12" fill="#cfd8e0" {...ink} />
                <rect x="30" y="50" width="40" height="5" rx="2.5" fill="#5c6670" {...ink} strokeWidth="1.6" />
                <path d="M26 62 Q30 58 36 58" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity="0.9" />
                <rect x="82" y="60" width="5" height="12" rx="2" fill="#e63946" {...ink} strokeWidth="1.4" />
                <circle cx="32" cy="76" r="2.4" fill="#e63946" />
            </>
        ),
    },
    {
        id: 'sleepy-toast', label: 'Sleepy Toast', bg: '#5a4fcf',
        draw: () => (
            <>
                <Toast crust="#d99a52" crumb="#f8e2b2">
                    <path d="M36 54 Q41 58 46 54 M54 54 Q59 58 64 54" {...line} strokeWidth="2.8" />
                    <ellipse cx="48" cy="66" rx="3" ry="2.4" fill="#7a2230" />
                    <Cheeks y={62} x={16} />
                    {/* a sleep bubble */}
                    <circle cx="57" cy="66" r="5.5" fill="#bde0fe" fillOpacity="0.85" stroke={INK} strokeWidth="1.4" />
                    <circle cx="55.5" cy="64.5" r="1.4" fill="#fff" />
                </Toast>
                {/* the nightcap, flopping over to one side */}
                <path d="M22 36 C24 20 40 11 56 13 C70 15 81 25 85 40 C80 36 74 32 66 30 C52 28 36 31 22 36 Z" fill="#4361ee" {...ink} />
                <path d="M40 18 C46 22 48 26 48 30 M60 15 C64 20 66 25 66 30" fill="none" stroke="#7b9bff" strokeWidth="3" strokeLinecap="round" />
                <path d="M21 37 C36 30 52 28 68 31" fill="none" stroke={INK} strokeWidth="8.4" strokeLinecap="round" />
                <path d="M21 37 C36 30 52 28 68 31" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
                <circle cx="85" cy="43" r="5.5" fill="#fff" {...ink} strokeWidth="1.8" />
            </>
        ),
    },
];

// --- 🍓 Fruit ---

const FRUIT = [
    {
        // Peeled halfway, and very pleased about it
        id: 'banana', label: 'Banana', bg: '#4361ee',
        draw: () => (
            <>
                <path d="M37 64 C33 44 37 26 48 14 Q51 12 54 15 C64 28 67 46 63 64 Z" fill="#fff3c4" {...ink} />
                <path d="M38 60 C28 57 19 63 15 73 C24 74 32 72 39 70 Z" fill="#ffd23f" {...ink} />
                <path d="M62 60 C72 57 81 63 85 73 C76 74 68 72 61 70 Z" fill="#ffd23f" {...ink} />
                <path d="M35 58 Q50 64 65 58 L66 70 C64 80 58 86 50 88 C42 86 36 80 34 70 Z" fill="#ffd23f" {...ink} />
                <path d="M47 87 h6 l-1 4 h-4 Z" fill="#7a4a26" stroke={INK} strokeWidth="1.2" strokeLinejoin="round" />
                <path d="M40 66 Q50 70 60 66" fill="none" stroke="#e8b200" strokeWidth="2" strokeLinecap="round" />
                <Eyes x={6.5} y={38} r={2.9} />
                <Smile y={46} w={6} d={5} sw={2.4} />
                <Cheeks x={10} y={45} r={3} />
            </>
        ),
    },
    {
        id: 'strawberry', label: 'Strawberry', bg: '#b5e48c',
        draw: () => (
            <>
                <path d="M50 86 C34 80 18 64 18 46 C18 34 28 28 38 30 C43 30 47 32 50 33 C53 32 57 30 62 30 C72 28 82 34 82 46 C82 64 66 80 50 86 Z" fill="#ef3b4e" {...ink} />
                {[[30, 46], [36, 64], [50, 76], [64, 64], [70, 46], [28, 56], [72, 56], [44, 70], [56, 70]].map(([x, y]) => (
                    <ellipse key={`${x}-${y}`} cx={x} cy={y} rx="1.4" ry="2" fill="#ffe066" />
                ))}
                <path d="M28 34 L36 30 L32 24 L42 27 L44 19 L50 26 L56 19 L58 27 L68 24 L64 30 L72 34 Q60 38 50 34 Q40 38 28 34 Z" fill="#3a9a3f" {...ink} strokeWidth="2" />
                <path d="M50 26 L52 14" {...line} stroke="#2d6a2f" strokeWidth="3.4" />
                <Eyes y={50} />
                <Smile y={58} />
                <Cheeks y={58} x={17} />
            </>
        ),
    },
    {
        id: 'pineapple', label: 'Pineapple', bg: '#ff8fab',
        draw: () => (
            <>
                <path d="M50 44 L38 32 L43 32 L32 20 L43 23 L40 10 L50 21 L60 10 L57 23 L68 20 L57 32 L62 32 Z" fill="#3a9a3f" {...ink} strokeWidth="2" />
                <ellipse cx="50" cy="64" rx="22" ry="24" fill="#f9c440" {...ink} />
                <path d={PINEAPPLE_SKIN} stroke="#c98a12" strokeWidth="1.5" opacity="0.75" />
                <path d="M27 56 H73 V58 Q71 67 62 67 Q54 67 52 59 H48 Q46 67 38 67 Q29 67 27 58 Z" fill={INK} />
                <path d="M32 59 L36 59 L33 63 Z M57 59 L61 59 L58 63 Z" fill="#6c757d" />
                <path d="M42 75 Q50 81 58 75" {...line} strokeWidth="2.6" />
            </>
        ),
    },
    {
        id: 'watermelon', label: 'Watermelon', bg: '#ffd6a5',
        draw: () => (
            <g transform="rotate(-12 50 50)">
                <path d="M10 38 H90 A40 40 0 0 1 10 38 Z" fill="#3a9a3f" {...ink} />
                <path d="M15 38 H85 A35 35 0 0 1 15 38 Z" fill="#eef7d2" />
                <path d="M19 38 H81 A31 31 0 0 1 19 38 Z" fill="#ff4d6d" />
                <path d="M10 38 H90" stroke={INK} strokeWidth="2.4" />
                {[[29, 47], [71, 47], [37, 60], [63, 60], [50, 64]].map(([x, y]) => (
                    <ellipse key={`${x}-${y}`} cx={x} cy={y} rx="1.6" ry="2.6" fill={INK} />
                ))}
                <Eyes y={46} x={9} r={3.2} />
                <Smile y={53} w={6} d={5} />
            </g>
        ),
    },
    {
        id: 'grapes', label: 'Grapes', bg: '#80ed99',
        draw: () => (
            <>
                <path d="M50 24 C50 18 52 14 56 10" {...line} stroke="#6b3e1f" strokeWidth="3.4" />
                <path d="M54 18 C60 8 74 8 78 14 C72 22 60 24 54 18 Z" fill="#52b043" {...ink} strokeWidth="2" />
                {[[32, 31], [50, 29], [68, 31], [23, 46], [41, 45], [59, 45], [77, 46], [32, 61], [50, 61], [68, 61], [41, 75], [59, 75]].map(([x, y]) => (
                    <circle key={`${x}-${y}`} cx={x} cy={y} r="9.6" fill="#8e44ad" {...ink} strokeWidth="2" />
                ))}
                {[[29, 28], [47, 26], [65, 28], [20, 43], [74, 43], [29, 58], [65, 58], [38, 72], [56, 72]].map(([x, y]) => (
                    <circle key={`${x}-${y}`} cx={x} cy={y} r="2" fill="#fff" opacity="0.55" />
                ))}
                <Googly cx={41} cy={45} r={6} px={0.5} py={1} />
                <Googly cx={59} cy={45} r={6} px={0.5} py={1} />
                <path d="M43 60 Q50 67 57 60" {...line} stroke="#fff" strokeWidth="2.6" />
            </>
        ),
    },
    {
        id: 'sour-lemon', label: 'Sour Lemon', bg: '#4cc9f0',
        draw: () => (
            <>
                <path d="M16 52 C16 34 32 22 50 22 C66 22 78 30 84 44 L89 47 L84 51 C84 68 68 80 50 80 C33 80 18 70 16 56 L11 53 Z" fill="#ffe135" {...ink} />
                <path d="M58 22 C62 12 74 10 78 14 C74 22 66 24 58 22 Z" fill="#52b043" {...ink} strokeWidth="2" />
                <path d="M24 46 C24 38 30 32 36 30" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity="0.7" />
                <path d="M34 42 L43 47 L34 52 M66 42 L57 47 L66 52" {...line} strokeWidth="3" />
                <circle cx="50" cy="63" r="4" fill="#7a2230" {...ink} strokeWidth="2" />
                <path d="M44 58 l-2 -2 M56 58 l2 -2 M44 68 l-2 2 M56 68 l2 2" {...line} strokeWidth="1.6" />
                <path d="M27 58 l-3 3 M73 58 l3 3" {...line} strokeWidth="1.6" />
            </>
        ),
    },
    {
        id: 'cherries', label: 'Cherries', bg: '#ffe066',
        draw: () => (
            <>
                <path d="M33 52 C35 38 46 24 56 15 M67 52 C65 38 60 26 56 15" {...line} stroke="#3a7a37" strokeWidth="3" />
                <path d="M56 15 C62 7 76 7 80 13 C74 21 62 21 56 15 Z" fill="#52b043" {...ink} strokeWidth="2" />
                <circle cx="32" cy="65" r="17" fill="#d62839" {...ink} />
                <circle cx="68" cy="65" r="17" fill="#d62839" {...ink} />
                <path d="M22 60 Q23 54 28 52 M58 60 Q59 54 64 52" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" opacity="0.7" />
                <Eyes cx={32} x={5.5} y={64} r={2.6} />
                <Smile cx={32} y={70} w={5} d={4} sw={2.2} />
                <circle cx={62.5} cy={64} r={2.6} fill={INK} />
                <path d="M70.5 64.5 Q73.5 61.5 76.5 64.5" {...line} strokeWidth="2.2" />
                <Smile cx={68} y={70} w={5} d={4} sw={2.2} />
            </>
        ),
    },
    {
        // An orange with a slice of orange for a grin
        id: 'orange', label: 'Orange', bg: '#3a86ff',
        draw: () => (
            <>
                <path d="M50 22 C51 17 53 14 56 12" {...line} stroke="#6b3e1f" strokeWidth="3.4" />
                <path d="M54 18 C58 9 70 8 74 12 C70 20 60 22 54 18 Z" fill="#52b043" {...ink} strokeWidth="2" />
                <circle cx="50" cy="53" r="31" fill="#ff9f1c" {...ink} />
                {[[30, 42], [36, 34], [66, 36], [72, 46], [28, 62], [70, 66], [60, 78], [40, 78]].map(([x, y]) => (
                    <circle key={`${x}-${y}`} cx={x} cy={y} r="1.1" fill="#d97706" />
                ))}
                <path d="M28 44 C28 38 32 32 38 30" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity="0.6" />
                <Eyes y={45} x={10} />
                <path d="M30 56 Q50 62 70 56 Q67 77 50 78 Q33 77 30 56 Z" fill="#ff8c00" {...ink} />
                <path d="M33.5 58.5 Q50 63 66.5 58.5 Q63 73.5 50 74.5 Q37 73.5 33.5 58.5 Z" fill="#ffd27a" />
                <path d="M50 61 V74 M50 61 L40 71 M50 61 L60 71 M50 61 L36 64 M50 61 L64 64" fill="none" stroke="#f4a52c" strokeWidth="1.6" strokeLinecap="round" />
            </>
        ),
    },
    {
        id: 'coconut', label: 'Coconut', bg: '#ffafcc',
        draw: () => (
            <>
                <path d="M30 34 L36 52" stroke="#6b3e1f" strokeWidth="2" />
                <path d="M14 34 Q22 16 44 22 Q38 30 30 34 Q22 30 14 34 Z" fill="#ff006e" {...ink} strokeWidth="2" />
                <path d="M30 34 L30 25 M22 30 L28 24 M38 30 L34 24" stroke="#ffd6e7" strokeWidth="1.2" />
                <g transform="rotate(18 64 28)">
                    <rect x="61" y="8" width="6.4" height="36" rx="2" fill="#fff" {...ink} strokeWidth="1.6" />
                    <path d="M61 14 h6.4 M61 22 h6.4 M61 30 h6.4" stroke="#e63946" strokeWidth="3" />
                </g>
                <circle cx="50" cy="61" r="28" fill="#7a4a26" {...ink} />
                <ellipse cx="50" cy="41" rx="19" ry="6" fill="#fff8e8" {...ink} strokeWidth="2" />
                <ellipse cx="50" cy="41.5" rx="15" ry="3.8" fill="#efe2c4" />
                <path d="M26 58 l-3 -2 M28 70 l-3 1 M74 58 l3 -2 M72 70 l3 1 M38 82 l-1 3 M62 82 l1 3" {...line} stroke="#4a2c15" strokeWidth="1.8" />
                <Eyes y={60} x={10} />
                <Smile y={68} />
                <Cheeks y={67} x={17} />
            </>
        ),
    },
    {
        id: 'kiwi', label: 'Kiwi', bg: '#ffb4a2',
        draw: () => (
            <>
                <ellipse cx="50" cy="53" rx="33" ry="31" fill="#8b5e34" {...ink} />
                <ellipse cx="50" cy="53" rx="28.5" ry="26.5" fill="#7cb342" />
                <ellipse cx="50" cy="53" rx="24" ry="22" fill="#9ccc54" />
                {KIWI_SEEDS.map(({ x, y, deg }) => (
                    <ellipse key={deg} cx={x} cy={y} rx="2.4" ry="1.2" fill={INK} transform={`rotate(${deg} ${x} ${y})`} />
                ))}
                <ellipse cx="50" cy="53" rx="15" ry="13" fill="#fdfbe3" />
                <Eyes y={51} x={5.5} r={2.6} />
                <Smile y={57} w={4.5} d={4} sw={2.2} />
            </>
        ),
    },
    {
        // A pear with a monocle and a fine moustache
        id: 'fancy-pear', label: 'Fancy Pear', bg: '#9d4edd',
        draw: () => (
            <>
                <path d="M50 18 C51 13 53 10 56 8" {...line} stroke="#6b3e1f" strokeWidth="3.4" />
                <path d="M50 16 C57 16 59 22 59 30 C59 38 73 44 75 60 C77 76 65 87 50 87 C35 87 23 76 25 60 C27 44 41 38 41 30 C41 22 43 16 50 16 Z" fill="#c5d86d" {...ink} />
                <path d="M30 60 C30 52 34 46 39 44" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity="0.6" />
                <circle cx="42" cy="54" r="3" fill={INK} />
                <circle cx="59" cy="54" r="7" fill="#fff" fillOpacity="0.45" stroke="#e0b04a" strokeWidth="2.4" />
                <circle cx="59" cy="54" r="2.6" fill={INK} />
                <path d="M65 58 Q70 66 66 76" fill="none" stroke="#e0b04a" strokeWidth="1.4" />
                <path d="M37 50 L46 49 M54 46 L64 45" {...line} strokeWidth="2.2" />
                <path d="M50 64 C44 60 36 62 33 68 C39 66 45 69 50 66 C55 69 61 66 67 68 C64 62 56 60 50 64 Z" fill="#3a2a1a" {...ink} strokeWidth="1.6" />
            </>
        ),
    },
];

// --- 🍩 Snacks and food ---

const FOOD = [
    {
        id: 'donut', label: 'Donut', bg: '#4dd0e1',
        draw: () => (
            <>
                <path d="M50 24 C72 24 86 37 86 55 C86 73 70 85 50 85 C30 85 14 73 14 55 C14 37 28 24 50 24 Z M50 40 C43 40 39 43 39 46 C39 50 44 52 50 52 C56 52 61 50 61 46 C61 43 57 40 50 40 Z" fillRule="evenodd" fill="#e0a458" {...ink} />
                <path d="M17 52 C16 35 32 27 50 27 C68 27 84 35 83 52 Q80 58 76 55 Q73 64 68 58 Q62 62 58 58 Q54 66 48 59 Q42 62 38 57 Q32 64 28 56 Q22 60 17 52 Z M50 40 C43 40 39 43 39 46 C39 50 44 52 50 52 C56 52 61 50 61 46 C61 43 57 40 50 40 Z" fillRule="evenodd" fill="#ff8fc8" {...ink} strokeWidth="2" />
                {[[28, 40, 30, '#ffd23f'], [36, 32, -20, '#4cc9f0'], [64, 32, 30, '#80ed99'], [72, 42, -30, '#ffd23f'], [66, 50, 10, '#4cc9f0'], [30, 50, 60, '#7b2cbf'], [50, 33, 80, '#7b2cbf']].map(([x, y, deg, color]) => (
                    <rect key={`${x}-${y}`} x={x - 3} y={y - 1.2} width="6" height="2.4" rx="1.2" fill={color} transform={`rotate(${deg} ${x} ${y})`} />
                ))}
                <Eyes y={68} x={10} r={3.2} />
                <Smile y={75} w={6} d={5} />
            </>
        ),
    },
    {
        id: 'hot-dog', label: 'Hot Dog', bg: '#ffb703',
        draw: () => (
            <g transform="rotate(-14 50 54)">
                <path d="M17 50 C17 36 83 36 83 50 Z" fill="#e8a75a" {...ink} />
                <rect x="12" y="42" width="76" height="16" rx="8" fill="#d9534f" {...ink} />
                <path d="M20 47 l5 -3 l5 3 l5 -3 l5 3 l5 -3 l5 3 l5 -3 l5 3 l5 -3 l5 3 l5 -3" fill="none" stroke="#ffd23f" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M15 54 C15 82 85 82 85 54 Q50 62 15 54 Z" fill="#f2b866" {...ink} />
                <Eyes y={65} x={10} r={3.2} />
                <Smile y={71} w={6} d={4.5} />
            </g>
        ),
    },
    {
        id: 'burger', label: 'Burger', bg: '#90e0ef',
        draw: () => (
            <>
                <path d="M22 73 H78 Q78 85 66 85 H34 Q22 85 22 73 Z" fill="#e8a75a" {...ink} />
                <rect x="17" y="61" width="66" height="13" rx="6.5" fill="#6b3a1e" {...ink} />
                <path d="M16 56 H84 L80 60 L74 67 L68 60 L56 60 L50 68 L44 60 L32 60 L26 66 L20 60 Z" fill="#ffd23f" {...ink} strokeWidth="1.8" />
                <path d="M15 52 H85 V55 Q81 60 77 55 Q73 60 69 55 Q65 60 61 55 Q57 60 53 55 Q49 60 45 55 Q41 60 37 55 Q33 60 29 55 Q25 60 21 55 Q17 60 15 55 Z" fill="#70c04a" {...ink} strokeWidth="1.8" />
                <path d="M16 50 C16 27 32 16 50 16 C68 16 84 27 84 50 Q84 54 80 54 H20 Q16 54 16 50 Z" fill="#f2a541" {...ink} />
                {[[32, 26, -30], [44, 22, 10], [58, 22, -10], [68, 28, 30], [26, 38, -50], [74, 38, 50]].map(([x, y, deg]) => (
                    <ellipse key={`${x}-${y}`} cx={x} cy={y} rx="2.2" ry="1.2" fill="#fff8e1" transform={`rotate(${deg} ${x} ${y})`} />
                ))}
                <Eyes y={38} x={10} r={3.2} />
                <Smile y={45} w={7} d={5} />
            </>
        ),
    },
    {
        id: 'fries', label: 'Fries', bg: '#3a2f6b',
        draw: () => (
            <>
                {[[30, 20, -14], [40, 14, -6], [50, 11, 0], [60, 14, 6], [70, 20, 14], [45, 22, -2], [56, 20, 4]].map(([x, y, deg]) => (
                    <rect key={`${x}-${y}`} x={x - 4} y={y} width="8" height="40" rx="2" fill="#ffd23f" {...ink} strokeWidth="1.8" transform={`rotate(${deg} ${x} ${y + 20})`} />
                ))}
                <path d="M22 46 Q50 56 78 46 L70 86 Q50 90 30 86 Z" fill="#e63946" {...ink} />
                <path d="M22 46 Q50 56 78 46" fill="none" stroke="#fff" strokeWidth="2" opacity="0.6" />
                <Googly cx={41} cy={64} r={5.5} px={0.6} py={0.8} />
                <Googly cx={59} cy={64} r={5.5} px={0.6} py={0.8} />
                <path d="M41 74 Q50 82 59 74" {...line} strokeWidth="2.8" />
            </>
        ),
    },
    {
        id: 'sushi', label: 'Sushi', bg: '#2a9d8f',
        draw: () => (
            <>
                <path d="M18 62 C18 50 30 46 50 46 C70 46 82 50 82 62 C82 74 70 79 50 79 C30 79 18 74 18 62 Z" fill="#fbf8ef" {...ink} />
                <path d="M14 50 C16 34 40 28 58 30 C76 32 88 40 86 52 C80 46 70 44 50 46 C34 46 22 48 14 50 Z" fill="#ff8a5c" {...ink} />
                <path d="M26 42 C34 36 44 34 50 34 M42 44 C50 38 60 36 66 37 M60 44 C66 41 74 41 80 44" fill="none" stroke="#ffd3c2" strokeWidth="2.6" strokeLinecap="round" />
                <Eyes y={61} x={10} r={3.2} />
                <Smile y={67} w={6} d={5} />
                <Cheeks y={67} x={18} />
            </>
        ),
    },
    {
        id: 'ice-cream', label: 'Ice Cream', bg: '#bdb2ff',
        draw: () => (
            <>
                <path d="M31 52 L69 52 L50 90 Z" fill="#e0a458" {...ink} />
                <path d="M38 60 L57 76 M46 56 L62 66 M58 56 L65 60 M62 60 L43 76 M54 56 L37 68 M42 56 L35 60" fill="none" stroke="#b9772f" strokeWidth="1.6" strokeLinecap="round" />
                <path d="M24 49 C20 30 34 17 50 17 C66 17 80 30 76 49 C76 55 72 57 70 53 C68 61 62 61 62 55 C58 59 54 59 52 55 C50 63 44 63 44 55 C40 59 34 57 34 53 C30 57 24 55 24 49 Z" fill="#ff8fab" {...ink} />
                <path d="M50 17 C50 12 52 9 55 7" {...line} stroke="#3a7a37" strokeWidth="2" />
                <circle cx="50" cy="16" r="5" fill="#d62839" {...ink} strokeWidth="1.8" />
                {[[32, 30, 30, '#ffd23f'], [68, 30, -30, '#4cc9f0'], [36, 46, -10, '#80ed99'], [64, 46, 20, '#fff']].map(([x, y, deg, color]) => (
                    <rect key={`${x}-${y}`} x={x - 3} y={y - 1.1} width="6" height="2.2" rx="1.1" fill={color} transform={`rotate(${deg} ${x} ${y})`} />
                ))}
                <Eyes y={36} x={8.5} r={3.2} />
                <Smile y={43} w={6} d={5} />
            </>
        ),
    },
    {
        id: 'cupcake', label: 'Cupcake', bg: '#ffd6a5',
        draw: () => (
            <>
                <path d="M24 56 H76 L70 86 H30 Z" fill="#4dd0e1" {...ink} />
                <path d="M34 58 L36 85 M44 58 L45 85 M56 58 L55 85 M66 58 L64 85" stroke="#1f9bb0" strokeWidth="2" />
                <path d="M20 58 C13 52 18 41 28 42 C26 32 36 26 44 30 C46 20 58 18 62 28 C70 26 79 34 74 42 C84 42 88 54 80 58 Q50 62 20 58 Z" fill="#fff0f6" {...ink} />
                <path d="M28 50 Q50 44 72 50 M38 38 Q50 34 62 38" fill="none" stroke="#ffc2d9" strokeWidth="2.4" strokeLinecap="round" />
                <circle cx="54" cy="21" r="5" fill="#d62839" {...ink} strokeWidth="1.8" />
                {[[34, 44, 30, '#ff6b81'], [62, 32, -30, '#4cc9f0'], [68, 46, 60, '#ffd23f'], [46, 40, -60, '#80ed99'], [26, 52, 0, '#7b2cbf']].map(([x, y, deg, color]) => (
                    <rect key={`${x}-${y}`} x={x - 3} y={y - 1.1} width="6" height="2.2" rx="1.1" fill={color} transform={`rotate(${deg} ${x} ${y})`} />
                ))}
                <Eyes y={69} x={9} r={3.2} />
                <Smile y={76} w={6} d={4.5} />
            </>
        ),
    },
    {
        id: 'pretzel', label: 'Pretzel', bg: '#ffe066',
        draw: () => {
            const rope = 'M33 70 C42 60 58 50 61 38 C63 25 80 22 82 36 C84 52 67 70 50 72 C33 70 16 52 18 36 C20 22 37 25 39 38 C42 50 58 60 67 70';
            return (
                <>
                    <path d={rope} fill="none" stroke={INK} strokeWidth="15" strokeLinecap="round" strokeLinejoin="round" />
                    <path d={rope} fill="none" stroke="#a0581f" strokeWidth="10.4" strokeLinecap="round" strokeLinejoin="round" />
                    <path d={rope} fill="none" stroke="#c9782f" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
                    {[[22, 32], [28, 24], [74, 24], [80, 32], [50, 70], [36, 64], [64, 64], [44, 52], [56, 52]].map(([x, y]) => (
                        <rect key={`${x}-${y}`} x={x - 1.4} y={y - 1.4} width="2.8" height="2.8" fill="#fff" transform={`rotate(45 ${x} ${y})`} />
                    ))}
                    <Googly cx={42} cy={30} r={5} px={1} py={1} />
                    <Googly cx={58} cy={30} r={5} px={-1} py={1} />
                </>
            );
        },
    },
    {
        id: 'fried-egg', label: 'Fried Egg', bg: '#ff8787',
        draw: () => (
            <>
                <path d="M30 22 C44 12 60 18 68 24 C82 30 88 46 82 58 C78 70 84 80 70 84 C56 88 46 80 34 82 C20 84 12 70 16 58 C20 46 16 32 30 22 Z" fill="#fff" {...ink} />
                <circle cx="51" cy="51" r="17" fill="#ffc21a" {...ink} />
                <path d="M40 46 C40 42 43 39 47 38" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
                <Eyes y={50} x={6.5} r={2.8} cx={51} />
                <Smile cx={51} y={56} w={5} d={4} sw={2.2} />
            </>
        ),
    },
    {
        id: 'cheese', label: 'Cheese', bg: '#4361ee',
        draw: () => (
            <>
                <path d="M14 48 L66 24 L86 44 Z" fill="#ffe680" {...ink} />
                <path d="M14 48 L86 44 L86 74 L14 80 Z" fill="#ffd23f" {...ink} />
                <ellipse cx="24" cy="66" rx="4" ry="5" fill="#e0a800" />
                <ellipse cx="78" cy="58" rx="3.5" ry="4.5" fill="#e0a800" />
                <ellipse cx="72" cy="70" rx="2.6" ry="3" fill="#e0a800" />
                <ellipse cx="50" cy="36" rx="5" ry="2.4" fill="#e0b800" />
                <ellipse cx="66" cy="38" rx="3" ry="1.6" fill="#e0b800" />
                <Eyes y={58} x={9} r={3.2} />
                <Smile y={65} w={6} d={5} />
            </>
        ),
    },
    {
        id: 'popcorn', label: 'Popcorn', bg: '#7b2cbf',
        draw: () => (
            <>
                {[[30, 42, 9], [40, 32, 10], [54, 28, 10], [67, 36, 9], [72, 45, 7], [48, 42, 9], [26, 47, 6]].map(([x, y, r]) => (
                    <circle key={`${x}-${y}`} cx={x} cy={y} r={r} fill="#fff6d8" {...ink} strokeWidth="1.8" />
                ))}
                <circle cx="44" cy="30" r="2.2" fill="#ffd23f" />
                <circle cx="62" cy="40" r="2" fill="#ffd23f" />
                <path d="M24 46 L76 46 L70 88 L30 88 Z" fill="#fff" {...ink} />
                <path d="M24 46 H34.4 L38 88 H30 Z M44.8 46 H55.2 L54 88 H46 Z M65.6 46 H76 L70 88 H62 Z" fill="#e63946" />
                <path d="M24 46 L76 46 L70 88 L30 88 Z" fill="none" {...ink} />
                <Googly cx={41} cy={62} r={6} px={0.6} py={1} />
                <Googly cx={59} cy={62} r={6} px={0.6} py={1} />
                <path d="M41 74 Q50 82 59 74" {...line} strokeWidth="3" />
            </>
        ),
    },
    {
        id: 'hot-pepper', label: 'Hot Pepper', bg: '#ffd166',
        draw: () => (
            <>
                <path d="M58 24 C70 24 76 38 72 54 C66 74 46 84 24 86 C19 86 19 81 24 79 C38 73 46 60 46 44 C46 31 50 24 58 24 Z" fill="#e63946" {...ink} />
                <path d="M50 28 C52 22 60 20 66 24 C64 28 56 30 50 28 Z" fill="#3a9a3f" {...ink} strokeWidth="2" />
                <path d="M58 24 C58 18 62 14 66 12" {...line} stroke="#2d6a2f" strokeWidth="3.4" />
                <path d="M52 40 C50 46 50 54 48 60" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
                <path d="M52 40 L58 43 L52 46 M70 40 L64 43 L70 46" {...line} strokeWidth="2.4" />
                <path d="M52 54 Q55 51 58 54 T64 54 T70 54" {...line} strokeWidth="2.2" />
                <path d="M78 32 C74 38 74 42 78 42 C82 42 82 38 78 32 Z" fill="#74c0fc" {...ink} strokeWidth="1.3" />
                <path d="M30 34 q-4 -4 0 -8 t0 -8 M38 28 q-4 -4 0 -8" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity="0.9" />
            </>
        ),
    },
    {
        id: 'pickle', label: 'Pickle', bg: '#ffafcc',
        draw: () => (
            <g transform="rotate(14 50 50)">
                <rect x="31" y="11" width="38" height="79" rx="19" fill="#6aa84f" {...ink} />
                {[[38, 22], [62, 30], [36, 70], [60, 78], [64, 60], [40, 84]].map(([x, y]) => (
                    <ellipse key={`${x}-${y}`} cx={x} cy={y} rx="2.4" ry="3" fill="#4f8a3a" />
                ))}
                <Googly cx={42} cy={40} r={6.5} px={2} py={1.5} />
                <Googly cx={59} cy={39} r={8} px={-2.5} py={2.5} />
                <path d="M38 56 Q50 66 62 56 Q50 60 38 56 Z" fill="#7a2230" {...ink} strokeWidth="2" />
                <path d="M52 60 Q53 68 57 67 Q60 65 58 58 Z" fill="#ff6b81" {...ink} strokeWidth="1.4" />
            </g>
        ),
    },
    {
        // A potato on a couch with the remote (very CouchCast)
        id: 'couch-potato', label: 'Couch Potato', bg: '#90dbf4',
        draw: () => (
            <>
                <rect x="16" y="46" width="68" height="26" rx="10" fill="#7b2cbf" {...ink} />
                <path d="M30 60 C26 40 34 22 50 22 C66 22 74 40 70 60 C68 70 32 70 30 60 Z" fill="#c9a06a" {...ink} />
                <circle cx="40" cy="32" r="1.6" fill="#8a6a3c" />
                <circle cx="62" cy="38" r="2" fill="#8a6a3c" />
                <circle cx="58" cy="28" r="1.2" fill="#8a6a3c" />
                {/* half-closed, very relaxed eyes */}
                <path d="M36.5 42 a4.5 4.5 0 0 0 9 0 Z M54.5 42 a4.5 4.5 0 0 0 9 0 Z" fill={INK} />
                <path d="M35 42 H47 M53 42 H65" {...line} strokeWidth="2.2" />
                <Smile y={52} w={6} d={4.5} sw={2.4} />
                <rect x="20" y="62" width="60" height="16" rx="6" fill="#9d4edd" {...ink} />
                <rect x="13" y="54" width="14" height="26" rx="7" fill="#7b2cbf" {...ink} />
                <rect x="73" y="54" width="14" height="26" rx="7" fill="#7b2cbf" {...ink} />
                <path d="M24 80 v5 M76 80 v5" {...line} strokeWidth="3.4" />
                {/* the remote */}
                <g transform="rotate(-28 64 56)">
                    <rect x="59" y="46" width="10" height="20" rx="3" fill="#2b2d42" {...ink} strokeWidth="1.8" />
                    <circle cx="64" cy="51" r="2" fill="#e63946" />
                    <path d="M61.5 57 h5 M61.5 61 h5" stroke="#9aa5b1" strokeWidth="1.6" strokeLinecap="round" />
                </g>
                <path d="M62 58 C60 62 62 64 60 66" fill="none" stroke="#c9a06a" strokeWidth="5" strokeLinecap="round" />
            </>
        ),
    },
    {
        id: 'coffee', label: 'Coffee', bg: '#ffd166',
        draw: () => (
            <>
                <path d="M38 26 q-4 -4 0 -8 t0 -8 M52 24 q-4 -4 0 -8 t0 -8" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" opacity="0.95" />
                <path d="M68 44 C82 44 82 66 68 66" fill="none" stroke={INK} strokeWidth="10" />
                <path d="M68 44 C82 44 82 66 68 66" fill="none" stroke="#06d6a0" strokeWidth="5.4" />
                <path d="M22 34 H70 V70 Q70 82 58 82 H34 Q22 82 22 70 Z" fill="#06d6a0" {...ink} />
                <ellipse cx="46" cy="34" rx="24" ry="5" fill="#6b3a1e" {...ink} strokeWidth="2" />
                <Googly cx={37} cy={52} r={7} pupil={0.28} />
                <Googly cx={55} cy={52} r={7} pupil={0.28} />
                <path d="M34 67 L38 71 L42 67 L46 71 L50 67 L54 71 L58 67" {...line} strokeWidth="2.4" />
                <path d="M14 44 l-4 -2 M13 54 h-5 M14 64 l-4 2 M86 42 l4 -2 M88 54 h4 M86 66 l4 2" {...line} strokeWidth="2.4" />
            </>
        ),
    },
    {
        id: 'bacon', label: 'Bacon', bg: '#a0c4ff',
        draw: () => (
            <g transform="rotate(-10 50 50)">
                <path d="M35 12 C29 24 41 36 35 48 C29 60 41 72 35 88 H65 C71 72 59 60 65 48 C71 36 59 24 65 12 Z" fill="#d1495b" {...ink} />
                <path d="M44 13 C38 25 50 37 44 49 C38 61 50 73 44 87 M56 13 C50 25 62 37 56 49 C50 61 62 73 56 87" fill="none" stroke="#ffd6c2" strokeWidth="4" />
                <Googly cx={43} cy={42} r={5.5} px={0.8} py={0.8} />
                <Googly cx={57} cy={42} r={5.5} px={0.8} py={0.8} />
                <path d="M42 54 Q50 62 58 54" {...line} strokeWidth="2.8" />
            </g>
        ),
    },
    {
        id: 'waffle', label: 'Waffle', bg: '#ff8fab',
        draw: () => (
            <g transform="rotate(-8 50 52)">
                <rect x="20" y="22" width="60" height="60" rx="10" fill="#e8a54b" {...ink} />
                {[26, 39, 52, 65].map((x) => [28, 41, 54, 67].map((y) => (
                    <rect key={`${x}-${y}`} x={x} y={y} width="9" height="9" rx="1.6" fill="#c47f2c" />
                )))}
                <path d="M40 26 C40 34 44 36 46 44 C47 50 52 50 52 44 C52 38 58 36 60 30 C60 26 40 22 40 26 Z" fill="#9c4f1e" opacity="0.85" />
                <rect x="40" y="22" width="20" height="12" rx="3" fill="#fff3a8" {...ink} strokeWidth="1.8" />
                <Googly cx={39} cy={52} r={6.5} px={0.6} py={1} />
                <Googly cx={61} cy={52} r={6.5} px={0.6} py={1} />
                <path d="M40 66 Q50 74 60 66" {...line} strokeWidth="3" />
            </g>
        ),
    },
];

// --- 🦆 Silly characters ---

const SILLY = [
    {
        id: 'rubber-duck', label: 'Rubber Duck', bg: '#4cc9f0',
        draw: () => (
            <>
                <path d="M20 64 C20 54 30 50 40 54 L60 52 C70 52 76 46 84 42 C88 54 86 72 72 80 C60 86 32 86 24 76 C21 72 20 68 20 64 Z" fill="#ffd23f" {...ink} />
                <circle cx="40" cy="38" r="17" fill="#ffd23f" {...ink} />
                <path d="M25 40 C16 38 11 43 14 47 C18 50 25 48 28 45 Z" fill="#ff8c1a" {...ink} strokeWidth="2" />
                <circle cx="37" cy="33" r="3.2" fill={INK} />
                <circle cx="38" cy="32" r="1" fill="#fff" />
                <ellipse cx="45" cy="42" rx="3.6" ry="2.2" fill="#ff6b81" opacity="0.5" />
                <path d="M50 64 C56 58 68 58 72 64 C66 72 56 72 50 64 Z" fill="#ffc300" {...ink} strokeWidth="1.8" />
                <path d="M4 82 Q14 76 24 82 T44 82 T64 82 T84 82 T104 82 V100 H4 Z" fill="#a5e8ff" {...ink} strokeWidth="2" opacity="0.95" />
            </>
        ),
    },
    {
        id: 'sloth', label: 'Sloth', bg: '#80ed99',
        draw: () => (
            <>
                <circle cx="50" cy="52" r="31" fill="#a1866f" {...ink} />
                <path d="M40 22 l4 6 l3 -7 l3 7 l4 -6" fill="#a1866f" stroke={INK} strokeWidth="1.8" strokeLinejoin="round" />
                <ellipse cx="50" cy="56" rx="25" ry="21" fill="#efe2cf" />
                <path d="M28 50 C30 44 40 44 44 50 C46 56 38 62 32 58 C29 56 27 54 28 50 Z" fill="#5c4331" />
                <path d="M72 50 C70 44 60 44 56 50 C54 56 62 62 68 58 C71 56 73 54 72 50 Z" fill="#5c4331" />
                <circle cx="38" cy="51" r="2.8" fill={INK} />
                <circle cx="62" cy="51" r="2.8" fill={INK} />
                <circle cx="39" cy="50" r="0.9" fill="#fff" />
                <circle cx="63" cy="50" r="0.9" fill="#fff" />
                <ellipse cx="50" cy="60" rx="5" ry="3.5" fill="#3a2a1f" />
                <path d="M42 66 Q50 72 58 66" {...line} strokeWidth="2.4" />
            </>
        ),
    },
    {
        id: 'llama', label: 'Llama', bg: '#ffafcc',
        draw: () => (
            <>
                <path d="M34 66 C34 80 32 90 30 100 H70 C68 90 66 80 66 66 Z" fill="#f5ecdd" {...ink} />
                <path d="M32 84 Q50 78 68 84 L69 92 Q50 86 31 92 Z" fill="#06d6a0" />
                <path d="M31 92 Q50 86 69 92 L70 98 Q50 92 30 98 Z" fill="#ff006e" />
                <path d="M36 36 C29 24 30 12 34 9 C41 13 43 25 41 35 Z" fill="#f5ecdd" {...ink} strokeWidth="2" />
                <path d="M64 36 C71 24 70 12 66 9 C59 13 57 25 59 35 Z" fill="#f5ecdd" {...ink} strokeWidth="2" />
                <path d="M35 30 C32 22 33 16 35 14 C38 18 39 24 38 30 Z M65 30 C68 22 67 16 65 14 C62 18 61 24 62 30 Z" fill="#ffc2d1" />
                <circle cx="29" cy="30" r="3.2" fill="#ff006e" {...ink} strokeWidth="1.2" />
                <circle cx="71" cy="30" r="3.2" fill="#ffbe0b" {...ink} strokeWidth="1.2" />
                <ellipse cx="50" cy="52" rx="19" ry="22" fill="#f5ecdd" {...ink} />
                <ellipse cx="50" cy="65" rx="12" ry="8.5" fill="#e8d5bd" stroke={INK} strokeWidth="1.6" />
                <path d="M46 62 q-1 2 1 3 M54 62 q1 2 -1 3" {...line} strokeWidth="1.6" />
                <path d="M44 68.5 Q47 72 50 68.5 Q53 72 56 68.5" {...line} strokeWidth="1.8" />
                <path d="M38 37 C33 32 38 25 43 28 C44 22 56 22 57 28 C62 25 67 32 62 37 C56 35 44 35 38 37 Z" fill="#fff" {...ink} strokeWidth="2" />
                <Eyes y={49} x={8.5} r={3.6} />
                <path d="M37.5 46 l-3 -2.6 M37.5 49 l-3.6 -0.4 M62.5 46 l3 -2.6 M62.5 49 l3.6 -0.4" {...line} strokeWidth="1.5" />
                <Cheeks y={57} x={13} r={3.4} />
            </>
        ),
    },
    {
        id: 'penguin', label: 'Penguin', bg: '#ffb703',
        draw: () => (
            <>
                <ellipse cx="40" cy="87" rx="7" ry="3.6" fill="#ff9f1c" {...ink} strokeWidth="1.8" />
                <ellipse cx="60" cy="87" rx="7" ry="3.6" fill="#ff9f1c" {...ink} strokeWidth="1.8" />
                <path d="M25 52 C15 60 15 72 21 76 C25 68 27 62 28 56 Z" fill="#23232c" {...ink} />
                <path d="M74 50 C84 42 88 32 84 28 C78 34 74 42 71 48 Z" fill="#23232c" {...ink} />
                <ellipse cx="50" cy="56" rx="26" ry="31" fill="#23232c" {...ink} />
                <path d="M50 35 C44 27 32 29 32 41 C30 51 30 63 34 73 C38 83 62 83 66 73 C70 63 70 51 68 41 C68 29 56 27 50 35 Z" fill="#fff" />
                <Eyes y={44} x={8} r={3.2} />
                <path d="M44 51 L56 51 L50 58 Z" fill="#ff9f1c" {...ink} strokeWidth="1.6" />
                <Cheeks y={54} x={14} r={3.6} />
            </>
        ),
    },
    {
        id: 'octopus', label: 'Octopus', bg: '#48cae4',
        draw: () => {
            const legs = 'M28 62 C20 70 22 80 14 82 M38 66 C34 76 38 84 32 88 M50 68 C50 78 46 84 50 89 M62 66 C66 76 62 84 68 88 M72 62 C80 70 78 80 86 82';
            return (
                <>
                    <path d={legs} fill="none" stroke={INK} strokeWidth="11" strokeLinecap="round" />
                    <path d={legs} fill="none" stroke="#c77dff" strokeWidth="6.6" strokeLinecap="round" />
                    <path d="M22 52 C20 30 34 16 50 16 C66 16 80 30 78 52 C78 64 66 70 50 70 C34 70 22 64 22 52 Z" fill="#c77dff" {...ink} />
                    <circle cx="36" cy="28" r="3" fill="#e0b1ff" />
                    <circle cx="66" cy="30" r="2.4" fill="#e0b1ff" />
                    <circle cx="60" cy="22" r="1.6" fill="#e0b1ff" />
                    <Eyes y={46} x={10} r={3.6} />
                    <Smile y={55} w={6} d={5} />
                    <Cheeks y={54} x={18} />
                </>
            );
        },
    },
    {
        id: 'frog-king', label: 'Frog King', bg: '#ff8fab',
        draw: () => (
            <>
                <circle cx="33" cy="38" r="13" fill="#52b043" {...ink} />
                <circle cx="67" cy="38" r="13" fill="#52b043" {...ink} />
                <ellipse cx="50" cy="60" rx="34" ry="24" fill="#52b043" {...ink} />
                <circle cx="33" cy="38" r="11.8" fill="#52b043" />
                <circle cx="67" cy="38" r="11.8" fill="#52b043" />
                <path d="M43 36 L41 22 L46 27 L50 18 L54 27 L59 22 L57 36 Z" fill="#ffd23f" {...ink} strokeWidth="1.8" />
                <circle cx="50" cy="30" r="1.8" fill="#e63946" />
                <circle cx="33" cy="37" r="7.6" fill="#fff" {...ink} strokeWidth="1.6" />
                <circle cx="67" cy="37" r="7.6" fill="#fff" {...ink} strokeWidth="1.6" />
                <circle cx="34" cy="38" r="3.6" fill={INK} />
                <circle cx="66" cy="38" r="3.6" fill={INK} />
                <circle cx="46" cy="54" r="1.4" fill={INK} />
                <circle cx="54" cy="54" r="1.4" fill={INK} />
                <path d="M26 62 Q50 80 74 62" {...line} strokeWidth="3" />
                <Cheeks y={66} x={26} r={4.4} />
            </>
        ),
    },
    {
        id: 'chicken', label: 'Chicken', bg: '#4cc9f0',
        draw: () => (
            <>
                <path d="M38 32 C33 22 40 16 44 20 C44 12 54 10 56 18 C60 12 68 16 64 27 Z" fill="#e63946" {...ink} />
                <ellipse cx="50" cy="55" rx="26" ry="28" fill="#fff" {...ink} />
                <path d="M24 52 l-6 -2 l4 6 l-5 2 l7 2" fill="#fff" stroke={INK} strokeWidth="1.8" strokeLinejoin="round" />
                <Googly cx={40} cy={46} r={7} px={-2.2} py={-2} />
                <Googly cx={60} cy={46} r={7} px={2.4} py={2.4} />
                <path d="M48 70 C44 76 46 83 50 83 C54 83 56 76 52 70 Z" fill="#e63946" {...ink} strokeWidth="1.8" />
                <path d="M41 58 L59 58 L50 71 Z" fill="#ffb703" {...ink} />
                <path d="M45 63 L55 63" stroke={INK} strokeWidth="1.4" />
            </>
        ),
    },
    {
        // Glasses, a big nose and a moustache: nobody will ever know
        id: 'disguise', label: 'Disguise', bg: '#c8b6ff',
        draw: () => (
            <>
                <circle cx="50" cy="50" r="31" fill="#ffd93b" {...ink} />
                <path d="M29 34 Q37 28 46 34 M54 34 Q63 28 71 34" {...line} stroke="#3a2a1a" strokeWidth="5" />
                <circle cx="39" cy="44" r="2.6" fill={INK} />
                <circle cx="61" cy="44" r="2.6" fill={INK} />
                <circle cx="39" cy="44" r="8" fill="none" stroke={INK} strokeWidth="3" />
                <circle cx="61" cy="44" r="8" fill="none" stroke={INK} strokeWidth="3" />
                <path d="M47 43 Q50 40 53 43 M31 43 L20 40 M69 43 L80 40" {...line} strokeWidth="2.6" />
                <path d="M50 42 C43 50 41 58 45 61 Q50 63 55 61 C59 58 57 50 50 42 Z" fill="#ffb4a2" {...ink} strokeWidth="2" />
                <path d="M50 62 C44 59 34 61 30 69 C38 67 44 69 50 66 C56 69 62 67 70 69 C66 61 56 59 50 62 Z" fill="#3a2a1a" {...ink} strokeWidth="1.8" />
                <path d="M44 74 Q50 77 56 74" {...line} strokeWidth="2.4" />
            </>
        ),
    },
    {
        id: 'pet-rock', label: 'Pet Rock', bg: '#ffd166',
        draw: () => (
            <>
                <path d="M17 70 C13 56 21 40 33 36 C39 26 57 24 65 32 C77 34 86 48 84 62 C84 74 74 81 56 81 C40 83 21 81 17 70 Z" fill="#9aa0a6" {...ink} />
                <path d="M26 54 C27 46 32 42 38 40" fill="none" stroke="#c9cdd1" strokeWidth="3.4" strokeLinecap="round" />
                <circle cx="30" cy="68" r="1.6" fill="#6c737a" />
                <circle cx="72" cy="70" r="2" fill="#6c737a" />
                <circle cx="76" cy="54" r="1.4" fill="#6c737a" />
                <Googly cx={42} cy={54} r={7} px={1.2} py={2.4} />
                <Googly cx={60} cy={52} r={8} px={-1} py={3} />
                <path d="M46 68 Q51 71 56 68" {...line} strokeWidth="2.2" />
                <path d="M62 32 L54 26 L54 38 Z M62 32 L70 26 L70 38 Z" fill="#ff6b9d" {...ink} strokeWidth="1.6" />
                <circle cx="62" cy="32" r="2.6" fill="#ff3d84" {...ink} strokeWidth="1.4" />
            </>
        ),
    },
];

export const PARTY_AVATARS = [...HEADLINERS, ...TOASTS, ...FRUIT, ...FOOD, ...SILLY];
