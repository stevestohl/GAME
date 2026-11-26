import React, { useState } from 'react';
import { Form, Button, InputGroup } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import { getRandomFunnyName } from '../../funnyNames.js';

/**
 * 📺📱 TV or just phones: the choice at the top of a game's setup screen, for the games that come both ways
 * (Couch Cast, Trivia Cast and List Cast; their phone versions are the games with ids prompt2, trivia and listopia).
 * Under the hood they stay separate games;
 * the choice picks which one a deck starts. It's remembered on this device, so it's usually already right.
 * `?play=phones` in the address (the old Game-Temple links) picks phones.
 */
const MODE_KEY = 'gtPlayMode';

const saved = () => {
    try { return localStorage.getItem(MODE_KEY) === 'phones' ? 'phones' : 'tv'; } catch { return 'tv'; }
};
const save = (mode) => {
    try { localStorage.setItem(MODE_KEY, mode); } catch { /* private mode */ }
};

/** `tv` / `phones`: whether each version can be started (the owner can hide either one in /admin) */
export function usePlayMode({ tv = true, phones = true } = {}) {
    const location = useLocation();
    const [chosen, setChosen] = useState(() => {
        const asked = new URLSearchParams(location.search).get('play');
        if (asked === 'tv' || asked === 'phones') {
            save(asked);
            return asked;
        }
        return saved();
    });
    const choose = (mode) => {
        setChosen(mode);
        save(mode);
    };
    // Only one version open: that's the one
    const mode = !phones ? 'tv' : !tv ? 'phones' : chosen;
    return { mode, choose, canChoose: tv && phones };
}

const OPTIONS = [
    { value: 'tv', icon: '📺', label: 'On a TV' },
    { value: 'phones', icon: '📱', label: 'Just phones' },
];

/** Two big buttons. `hidden`: which versions are hidden from the public (a badge, for the owner and admins). */
export function PlayModeSwitch({ mode, onChange, disabled, hidden = {} }) {
    return (
        <div className="gt-playmode" role="radiogroup" aria-label="Where are you playing?">
            {OPTIONS.map(({ value, icon, label }) => (
                <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={mode === value}
                    className={`gt-playmode-option ${mode === value ? 'selected' : ''}`}
                    disabled={disabled}
                    onClick={() => onChange(value)}
                >
                    <span className="gt-playmode-icon" aria-hidden="true">{icon}</span>
                    <span>{label}</span>
                    {hidden[value] && <span className="gt-hidden-badge ms-1">Hidden</span>}
                </button>
            ))}
        </div>
    );
}

/** What each choice means, under the switch */
export const playModeHint = (mode) => (mode === 'phones'
    ? 'No TV needed. You play too, right here on this phone.'
    : 'This device goes on the TV. Everyone joins on their phone.');

/** Your nickname for the phone version (you're playing too): the last one used on this device, or a funny one */
export function useHostName() {
    const [name, setName] = useState(() => {
        try { return localStorage.getItem('templePlayerName') || getRandomFunnyName(); } catch { return getRandomFunnyName(); }
    });
    // The name to start with (saved for next time)
    const finalName = () => {
        const clean = name.trim() || 'Host';
        try { localStorage.setItem('templePlayerName', clean); } catch { /* private mode */ }
        return clean;
    };
    return { name, setName, finalName };
}

export function HostNameField({ name, setName, disabled }) {
    return (
        <InputGroup>
            <Form.Control
                type="text"
                placeholder="Your nickname"
                aria-label="Your nickname"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={12}
                className="text-center fw-bold"
                disabled={disabled}
            />
            <Button
                variant="outline-primary"
                type="button"
                title="Pick a random name"
                aria-label="Pick a random name"
                className="px-3"
                onClick={() => setName(getRandomFunnyName())}
                disabled={disabled}
            >
                🎲
            </Button>
        </InputGroup>
    );
}

/** The "──── TITLE ────" line between the parts of a setup screen */
export function SetupDivider({ children, className = 'mt-3 mb-2' }) {
    return (
        <div className={`d-flex align-items-center ${className}`}>
            <hr className="flex-grow-1 my-0 opacity-25" />
            <span className="mx-2 small fw-bold text-muted text-uppercase">{children}</span>
            <hr className="flex-grow-1 my-0 opacity-25" />
        </div>
    );
}
