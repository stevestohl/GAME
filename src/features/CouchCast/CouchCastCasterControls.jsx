import React, { useEffect, useState } from 'react';
import { isMusicMuted, setMusicMuted, onMusicMuteChange } from '../../musicMute.js';

/**
 * 🔇⏸️ The caster's buttons, pinned to the top right of every TV screen:
 * music on/off (always), and pause/play while a game is running (`canPause`).
 */
export default function CouchCastCasterControls({ canPause, isPaused, onTogglePause }) {
    const [muted, setMuted] = useState(isMusicMuted());
    useEffect(() => onMusicMuteChange(setMuted), []);

    return (
        <div className="cc-caster-controls">
            {canPause && (
                <button
                    type="button"
                    className={`cc-caster-button ${isPaused ? 'is-on' : ''}`}
                    onClick={onTogglePause}
                    aria-label={isPaused ? 'Resume the game' : 'Pause the game'}
                    title={isPaused ? 'Resume the game' : 'Pause the game'}
                >
                    {isPaused ? '▶️' : '⏸️'}
                </button>
            )}
            <button
                type="button"
                className={`cc-caster-button ${muted ? 'is-on' : ''}`}
                onClick={() => setMusicMuted(!muted)}
                aria-label={muted ? 'Turn the music on' : 'Mute the music'}
                aria-pressed={muted}
                title={muted ? 'Turn the music on' : 'Mute the music'}
            >
                {muted ? '🔇' : '🎵'}
            </button>
        </div>
    );
}

/** ⏸️ Shown over the game while it's paused */
export function CouchCastPausedOverlay({ isCaster }) {
    return (
        <div className="cc-paused-overlay" role="status">
            <h2>⏸️ Paused</h2>
            <p>{isCaster ? 'Tap ▶️ at the top to pick up where you left off.' : 'Hang tight, the game will be right back.'}</p>
        </div>
    );
}
