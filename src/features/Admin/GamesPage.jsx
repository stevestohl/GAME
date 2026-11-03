import React, { useEffect, useState } from 'react';
import { Alert, Form, Spinner } from 'react-bootstrap';
import { adminFetch } from './adminApi.js';
import { setVisibleGames } from '../../gameVisibility.js';

/**
 * 🎮 Owner only: hide and show games and decks. Hidden ones disappear from the public menus and can't be
 * started, but the owner and admins still see them (with a "Hidden" badge) and can play them.
 */
export default function GamesPage() {
    const [games, setGames] = useState(null);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState('');

    useEffect(() => {
        adminFetch('/visible-games').then((data) => setGames(data.games)).catch((err) => setError(err.message));
    }, []);

    const setHidden = async (game, deck, hidden) => {
        setSaving(deck ? `${game}/${deck}` : game);
        setError('');
        try {
            const data = await adminFetch('/visibility', { method: 'PUT', body: { game, deck, hidden } });
            setGames(data.games);
            setVisibleGames(data.games);
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving('');
        }
    };

    if (!games) return error ? <Alert variant="danger">{error}</Alert> : <Spinner animation="border" />;

    const sections = [...new Set(games.map((g) => g.section))];
    return (
        <div>
            <p className="small text-secondary">
                Hidden games and decks don't show on the public menus and can't be started. You and your admins still see them, marked Hidden.
                Hiding only affects new rooms: a game already being played carries on.
            </p>
            {error && <Alert variant="danger" className="py-2">{error}</Alert>}
            {sections.map((section) => (
                <div key={section} className="mb-3">
                    <h6 className="fw-bold text-secondary text-uppercase small mb-2">{section}</h6>
                    {games.filter((g) => g.section === section).map((game) => (
                        <div key={game.id} className="border rounded p-2 mb-2 bg-white">
                            <VisibilitySwitch
                                id={game.id}
                                label={<span className="fw-bold">{game.name}</span>}
                                hidden={game.hidden}
                                disabled={saving === game.id}
                                onChange={(hidden) => setHidden(game.id, null, hidden)}
                            />
                            {game.decks.map((deck) => (
                                <div key={deck.id} className="ms-3 mt-1">
                                    <VisibilitySwitch
                                        id={`${game.id}/${deck.id}`}
                                        label={deck.name}
                                        hidden={deck.hidden}
                                        disabled={saving === `${game.id}/${deck.id}`}
                                        onChange={(hidden) => setHidden(game.id, deck.id, hidden)}
                                    />
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}

function VisibilitySwitch({ id, label, hidden, disabled, onChange }) {
    return (
        <div className="d-flex justify-content-between align-items-center gap-2">
            <span>{label}</span>
            <Form.Check
                type="switch"
                id={`visibility-${id}`}
                className="mb-0"
                label={hidden ? 'Hidden' : 'Showing'}
                checked={!hidden}
                disabled={disabled}
                onChange={(e) => onChange(!e.target.checked)}
            />
        </div>
    );
}
