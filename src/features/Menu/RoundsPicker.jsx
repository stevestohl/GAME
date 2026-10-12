import React from 'react';

/**
 * 🔢 "How long should the game be?" picker: a row of glass pills, one per option.
 * Used on the Couch Cast, Prompt 2 and Trivia setup screens.
 */
export default function RoundsPicker({ label = 'Rounds', options, value, onChange, disabled }) {
    return (
        <div className="gt-rounds" role="group" aria-label={`Number of ${label.toLowerCase()}`}>
            {options.map((count) => (
                <button
                    key={count}
                    type="button"
                    className={`gt-rounds-pill ${value === count ? 'selected' : ''}`}
                    aria-pressed={value === count}
                    disabled={disabled}
                    onClick={() => onChange(count)}
                >
                    <span className="gt-rounds-number">{count}</span>
                    <span className="gt-rounds-label">{label}</span>
                </button>
            ))}
        </div>
    );
}
