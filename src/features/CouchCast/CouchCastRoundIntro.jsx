import React from 'react';

// 🎬 Between rounds: a title card on the TV ("Round 3") while the narrator calls it,
// and "Next: Round 3" on the phones
export default function CouchCastRoundIntro({ round, totalRounds, isPhone = false }) {
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
        </div>
    );
}
