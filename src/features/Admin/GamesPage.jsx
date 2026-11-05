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
    const [tabs, setTabs] = useState([]);
    const [topcake, setTopcake] = useState(null);
    const [topcakeError, setTopcakeError] = useState('');
    const [saving, setSaving] = useState('');

    useEffect(() => {
        adminFetch('/visible-games').then((data) => { setGames(data.games); setTabs(data.tabs || []); }).catch((err) => setError(err.message));
        adminFetch('/topcake/games').then((data) => setTopcake(data.games)).catch((err) => setTopcakeError(err.message));
    }, []);

    const setHidden = async (game, deck, hidden) => {
        setSaving(deck ? `${game}/${deck}` : game);
        setError('');
        try {
            const data = await adminFetch('/visibility', { method: 'PATCH', body: { game, deck, hidden } });
            setGames(data.games);
            setTabs(data.tabs);
            setVisibleGames(data.games, data.tabs);
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving('');
        }
    };

    const setTabHidden = async (tab, hidden) => {
        setSaving(`tab:${tab}`);
        setError('');
        try {
            const data = await adminFetch('/visibility', { method: 'PATCH', body: { tab, hidden } });
            setTabs(data.tabs);
            setVisibleGames(data.games, data.tabs);
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving('');
        }
    };

    const setTopcakeHidden = async (game, deck, hidden) => {
        setSaving(`topcake:${deck ? `${game}/${deck}` : game}`);
        setTopcakeError('');
        try {
            const data = await adminFetch('/topcake/visibility', { method: 'PATCH', body: { game, deck, hidden } });
            setTopcake(data.games);
        } catch (err) {
            setTopcakeError(err.message);
        } finally {
            setSaving('');
        }
    };

    if (!games) return error ? <Alert variant="danger">{error}</Alert> : <Spinner animation="border" />;

    return (
        <div>
            <p className="small text-secondary">
                Hidden games and decks don't show on the public menus and can't be started. You and your admins still see them, marked Hidden.
                Hiding only affects new rooms: a game already being played carries on.
            </p>
            {error && <Alert variant="danger" className="py-2">{error}</Alert>}
            <div className="mb-3">
                <h6 className="fw-bold text-secondary text-uppercase small mb-1">Tabs</h6>
                <p className="small text-secondary mb-2">
                    A hidden tab's button comes off the nav bar for the public. Its page and games still work from a direct link. You and your admins still see it, dashed.
                </p>
                <div className="border rounded p-2 bg-white">
                    {tabs.map((tab) => (
                        <div key={tab.id} className="mb-1">
                            <VisibilitySwitch
                                id={`tab-${tab.id}`}
                                label={tab.name}
                                hidden={tab.hidden}
                                disabled={saving === `tab:${tab.id}`}
                                onChange={(hidden) => setTabHidden(tab.id, hidden)}
                            />
                        </div>
                    ))}
                </div>
            </div>
            <GameSwitches games={games} saving={saving} idPrefix="" onChange={setHidden} />

            <hr />
            <h5 className="fw-bold mb-1">🎂 TopCake</h5>
            <p className="small text-secondary">
                For topcake.party. Hidden games and decks are off the menus there and can't be started. Only you still see them, after signing in with the key on TopCake.
                A change can take up to 30 seconds to reach it.
            </p>
            {topcakeError && <Alert variant="danger" className="py-2">{topcakeError}</Alert>}
            {topcake
                ? <GameSwitches games={topcake} saving={saving} idPrefix="topcake:" onChange={setTopcakeHidden} />
                : !topcakeError && <Spinner animation="border" />}
        </div>
    );
}

// One site's games, by section, each with its decks underneath
function GameSwitches({ games, saving, idPrefix, onChange }) {
    const sections = [...new Set(games.map((g) => g.section))];
    return sections.map((section) => (
        <div key={section} className="mb-3">
            <h6 className="fw-bold text-secondary text-uppercase small mb-2">{section}</h6>
            {games.filter((g) => g.section === section).map((game) => (
                <div key={game.id} className="border rounded p-2 mb-2 bg-white">
                    <VisibilitySwitch
                        id={`${idPrefix}${game.id}`}
                        label={<span className="fw-bold">{game.name}</span>}
                        hidden={game.hidden}
                        disabled={saving === `${idPrefix}${game.id}`}
                        onChange={(hidden) => onChange(game.id, null, hidden)}
                    />
                    {game.decks.map((deck) => (
                        <div key={deck.id} className="ms-3 mt-1">
                            <VisibilitySwitch
                                id={`${idPrefix}${game.id}/${deck.id}`}
                                label={deck.name}
                                hidden={deck.hidden}
                                disabled={saving === `${idPrefix}${game.id}/${deck.id}`}
                                onChange={(hidden) => onChange(game.id, deck.id, hidden)}
                            />
                        </div>
                    ))}
                </div>
            ))}
        </div>
    ));
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
