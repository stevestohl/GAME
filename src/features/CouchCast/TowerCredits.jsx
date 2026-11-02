import React from 'react';
import { Avatar } from '../../avatars.jsx';

// 🎬 The end credits: after the final scores are read, the lobby's Tower Party results roll up the
// screen like the end of a movie (on the TV and every phone). Nobody played? No credits.
export default function TowerCredits({ tower, onDone }) {
    const crew = Object.values(tower?.stats || {})
        .filter((s) => s.stacked > 0)
        .sort((a, b) => b.stacked - a.stacked || b.perfects - a.perfects);
    if (!crew.length) return null;

    // Longer credits for a bigger crew, so everyone can read their line
    const seconds = 12 + crew.length * 2;

    return (
        <div className="tp-credits" aria-live="polite">
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
        </div>
    );
}
