import React from 'react';
import RoundCatScene from './RoundCatScene.jsx';

// 🎬 Between rounds: a title card on the TV ("Round 3") while the narrator calls it,
// and "Next: Round 3" on the phones. `crew`: one of the Couch Cast crew deals with the cat along
// the bottom of the TV; on the Halloween deck (`crewTheme`), its crew deals with a tiny ghost
export default function CouchCastRoundIntro({ round, totalRounds, isPhone = false, crew = false, crewTheme = 'core' }) {
    const isFinal = totalRounds && round >= totalRounds;

    if (isPhone) {
        return (
            <div className="cc-round-intro-phone">
                <div className="cc-round-intro-next">Next:</div>
                <div className="cc-round-intro-title">Round {round}</div>
                {isFinal && <div className="cc-round-intro-final">The final round!</div>}
            </div>
        );
    }

    return (
        <div className="fullscreen-gameplay-container justify-content-center">
            <div className="cc-round-intro" key={round}>
                {isFinal && <div className="cc-round-intro-final">The final round</div>}
                <div className="cc-round-intro-title">Round {round}</div>
                {totalRounds && <div className="cc-round-intro-of">of {totalRounds}</div>}
            </div>
            {crew && (
                <div className="cc-round-scene">
                    <RoundCatScene round={round} theme={crewTheme} />
                </div>
            )}
        </div>
    );
}
