import React, { useEffect, useState } from 'react';
import { Form, Alert, Spinner } from 'react-bootstrap';
import { adminFetch } from './adminApi.js';
import ContentGrid from './ContentGrid.jsx';

/**
 * 🃏 The Content tab: pick which content to edit (only what this account manages), then the grid.
 * Each "source" is one collection that one or more games share (e.g. Couch Cast & Prompt 2 cards).
 */
export default function ContentPage() {
    const [sources, setSources] = useState(null);
    const [selected, setSelected] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        adminFetch('/content')
            .then(({ sources: list }) => {
                setSources(list);
                if (list[0]) setSelected(list[0].id);
            })
            .catch((err) => setError(err.message));
    }, []);

    if (error) return <Alert variant="danger">{error}</Alert>;
    if (!sources) return <Spinner animation="border" />;
    if (sources.length === 0) {
        return <p className="text-muted">You don't manage any games or decks yet. Ask the owner to add some on the Users page.</p>;
    }

    const source = sources.find((s) => s.id === selected) || sources[0];

    return (
        <div>
            <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
                <Form.Select style={{ maxWidth: '320px' }} value={source.id} onChange={(e) => setSelected(e.target.value)} aria-label="Which content">
                    {sources.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                </Form.Select>
                <span className="small text-muted">
                    {source.decks === null ? 'All decks' : `Your decks: ${source.decks.join(', ')}`}
                </span>
            </div>
            <ContentGrid key={source.id} source={source} />
        </div>
    );
}
