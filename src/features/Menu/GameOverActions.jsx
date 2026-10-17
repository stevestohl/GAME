import React, { useState } from 'react';

/**
 * 🔁 The caster's choices on the final scores: same players again, or done for the night.
 * Shown on the TV screen, which the caster is holding (or can reach) to tap.
 */
export default function GameOverActions({ onPlayAgain, onGoHome }) {
    const [isBusy, setIsBusy] = useState(false);

    const choose = (action) => {
        if (isBusy) return;
        setIsBusy(true);
        action();
    };

    return (
        <div className="game-over-actions">
            <button type="button" className="game-over-btn again" disabled={isBusy} onClick={() => choose(onPlayAgain)}>
                🔁 Play Again
            </button>
            <button type="button" className="game-over-btn home" disabled={isBusy} onClick={() => choose(onGoHome)}>
                🏠 Home
            </button>
        </div>
    );
}
