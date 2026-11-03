import React, { useEffect } from 'react';
import { Avatar } from '../../avatars.jsx';
import CreditsChase from './CreditsChase.jsx';
import { startCreditsMarch } from '../../celebrationSounds.js';

// 🎬 The end credits: after the final scores are read, the lobby's Tower Party results roll up the
// screen like the end of a movie (on the TV and every phone). Nobody played? No credits.
// `chase`: the crew chases the cat along the bottom to a march while they roll (Couch Cast, on the TV; `chaseTheme` says which crew)
export default function TowerCredits({ tower, onDone, chase = false, chaseTheme = 'core' }) {
    const crew = Object.values(tower?.stats || {})
        .filter((s) => s.stacked > 0)
        .sort((a, b) => b.stacked - a.stacked || b.perfects - a.perfects);
    const playMarch = chase && crew.length > 0;
    useEffect(() => (playMarch ? startCreditsMarch() : undefined), [playMarch]);
    if (!crew.length) return null;

    // Longer credits for a bigger crew, so everyone can read their line
    const seconds = 12 + crew.length * 2;
    const showChase = chase && !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    return (
        <div className={`tp-credits ${showChase ? `tp-chase-${chaseTheme}` : ''}`} aria-live="polite">
            {showChase && <div className="tp-chase-floor" />}
            <div className="tp-credits-roll" style={{ animationDuration: `${seconds}s` }} onAnimationEnd={onDone}>
                <div className="tp-credits-kicker">And in the lobby...</div>
                <h2>🏗️ Tower Party</h2>
                <div className="tp-credits-best">Tallest tower: <strong>{tower.best} high</strong></div>
                {tower.towers > 0 && <div className="tp-credits-sub">Towers toppled along the way: {tower.towers}</div>}
                <div className="tp-credits-heading">Starring</div>
                {crew.map((s) => (
                    <div key={`${s.name}-${s.avatar}`} className="tp-credits-line">
                        <Avatar id={s.avatar} name={s.name} size={44} />
                        <span className="tp-credits-name">{s.name}</span>
                        <span className="tp-credits-role">
                            stacked {s.stacked}{s.perfects ? ` · ${s.perfects} perfect` : ''}
                        </span>
                    </div>
                ))}
                <div className="tp-credits-end">Thanks for building it together!</div>
            </div>
            {showChase && <div className="cc-round-scene"><CreditsChase theme={chaseTheme} /></div>}
        </div>
    );
}
