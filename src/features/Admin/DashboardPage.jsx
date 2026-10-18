import React, { useEffect, useState } from 'react';
import { Card, Form, Alert, Spinner, Badge } from 'react-bootstrap';
import { adminFetch } from './adminApi.js';

/**
 * 📊 The Dashboard tab. First report: the Couch Cast & Prompt 2 answers judges pick the most.
 */
export default function DashboardPage() {
    return (
        <div className="d-flex flex-column gap-3">
            <TopResponses />
        </div>
    );
}

const formatDate = (value) => (value ? new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—');

// 🏆 Top 10 favorite responses: a bar for each answer's wins, with times played and win rate
function TopResponses() {
    const [data, setData] = useState(null);
    const [error, setError] = useState('');
    const [writeIns, setWriteIns] = useState(false);

    useEffect(() => {
        setData(null);
        adminFetch(`/dashboard/couchcast/top-responses?limit=10&writeIns=${writeIns}`)
            .then((result) => { setData(result); setError(''); })
            .catch((err) => setError(err.message));
    }, [writeIns]);

    const most = data?.rows?.[0]?.wins || 1;

    return (
        <Card className="border shadow-sm">
            <Card.Body>
                <div className="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-3">
                    <div>
                        <h5 className="text-dark mb-0">🏆 Top 10 favorite responses</h5>
                        <div className="small text-muted">
                            Couch Cast &amp; Prompt 2: how many times the judge picked each answer
                            {data?.decks ? ` (your decks: ${data.decks.join(', ')})` : ''}
                        </div>
                    </div>
                    <Form.Check type="switch" id="top-responses-write-ins" label="Include write-ins" className="small text-dark"
                        checked={writeIns} onChange={(e) => setWriteIns(e.target.checked)} />
                </div>

                {error && <Alert variant="danger" className="py-2">{error}</Alert>}
                {!data && !error && <Spinner animation="border" size="sm" />}
                {data && data.rows.length === 0 && <p className="text-muted mb-0">No winning answers yet. Play a few rounds and check back!</p>}

                {data && data.rows.length > 0 && (
                    <ol className="admin-bars list-unstyled mb-2">
                        {data.rows.map((row, i) => (
                            <li key={row.answer} className="admin-bar-row">
                                <div className="admin-bar-label">
                                    <span className="admin-bar-rank">{i + 1}</span>
                                    <span className="text-dark">{row.answer}</span>
                                    {row.writeIn && <Badge bg="info" className="ms-1">write-in</Badge>}
                                </div>
                                <div className="admin-bar-track" title={`Last won ${formatDate(row.lastWon)}`}>
                                    <div className="admin-bar-fill" style={{ width: `${Math.max(4, (row.wins / most) * 100)}%` }}>
                                        <span>{row.wins} {row.wins === 1 ? 'win' : 'wins'}</span>
                                    </div>
                                </div>
                                <div className="admin-bar-meta small text-muted">
                                    played {row.played}× · {Math.round(row.winRate * 100)}% win rate
                                </div>
                            </li>
                        ))}
                    </ol>
                )}

                {data && (
                    <div className="small text-muted border-top pt-2">
                        From {data.totals.games} {data.totals.games === 1 ? 'game' : 'games'}, {data.totals.answers} answers played and {data.totals.judgeWins} judge picks.
                        Random picks (when the judge ran out of time) don't count as wins.
                    </div>
                )}
            </Card.Body>
        </Card>
    );
}
