import React from 'react';

export const LEVEL_OPTIONS = [
    { id: 'easy', label: 'Easy' },
    { id: 'medium', label: 'Medium' },
    { id: 'hard', label: 'Hard' },
    { id: 'mixed', label: 'Mixed' },
];
export const DEFAULT_LEVEL = 'mixed';

/** 🎚️ "How hard should the questions be?": a row of glass pills, like RoundsPicker. Used on the Trivia setup screens. */
export default function LevelPicker({ value, onChange, disabled }) {
    return (
        <div className="gt-rounds" role="group" aria-label="Question level">
            {LEVEL_OPTIONS.map(({ id, label }) => (
                <button
                    key={id}
                    type="button"
                    className={`gt-rounds-pill gt-level-pill ${value === id ? 'selected' : ''}`}
                    aria-pressed={value === id}
                    disabled={disabled}
                    onClick={() => onChange(id)}
                >
                    {label}
                </button>
            ))}
        </div>
    );
}
