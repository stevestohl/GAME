import React, { useMemo } from 'react';

// ❄️ Snow falling behind the Holiday deck's lobby. It sits under the cards, so it never covers the QR code.
const FLAKES = 80;
const rand = (min, max) => min + Math.random() * (max - min);

export default function Snowfall() {
    const flakes = useMemo(() => Array.from({ length: FLAKES }, () => {
        const size = rand(4, 12);
        const dur = rand(9, 20);
        return {
            left: `${rand(-2, 100)}%`,
            width: size,
            height: size,
            opacity: rand(0.55, 0.95),
            animationDuration: `${dur}s`,
            animationDelay: `${-rand(0, dur)}s`,   // already falling when the lobby appears
            '--sway': `${rand(-46, 46)}px`,
        };
    }), []);

    return (
        <div className="cc-snow" aria-hidden="true">
            {flakes.map((style, i) => <span key={i} className="cc-snowflake" style={style} />)}
        </div>
    );
}
