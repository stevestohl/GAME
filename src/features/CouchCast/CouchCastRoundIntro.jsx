import React from 'react';
import RoundCatScene from './RoundCatScene.jsx';

// 🎬 Between rounds: a title card on the TV ("Round 3") while the narrator calls it,
// and "Next: Round 3" on the phones. `crew`: one of the Couch Cast crew deals with the cat along
// the bottom of the TV; on the Halloween deck (`crewTheme`), its crew deals with a tiny ghost.
// `kicker`: says something else above the round number ("Halfway there!"); `tagline`: a line under it.
export default function CouchCastRoundIntro({ round, totalRounds, isPhone = false, crew = false, crewTheme = 'core', kicker, tagline }) {
    const isFinal = totalRounds && round >= totalRounds;
    const topLine = kicker || (isFinal ? 'The final round' : null);

    if (isPhone) {
        return (
            <div className="cc-round-intro-phone">
                <div className="cc-round-intro-next">Next:</div>
                <div className="cc-round-intro-title">Round {round}</div>
                {(kicker || isFinal) && <div className="cc-round-intro-final">{kicker || 'The final round!'}</div>}
            </div>
        );
    }

    return (
        <div className="fullscreen-gameplay-container justify-content-center">
            <div className="cc-round-intro" key={round}>
                {topLine && <div className="cc-round-intro-final">{topLine}</div>}
                <div className="cc-round-intro-title">Round {round}</div>
                {totalRounds && <div className="cc-round-intro-of">of {totalRounds}</div>}
                {tagline && <div className="cc-round-intro-of">{tagline}</div>}
            </div>
            {crew && (
                <div className="cc-round-scene">
                    <RoundCatScene round={round} theme={crewTheme} />
                </div>
            )}
        </div>
    );
}
