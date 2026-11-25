import React, { useEffect, useState } from 'react';
import { Card, Alert, Spinner } from 'react-bootstrap';
import { adminFetch } from './adminApi.js';

/**
 * 📚 The Dashboard's Library tab: how much content there is, for each kind of content this account manages (only
 * its decks). The numbers come from GET /api/admin/dashboard/library (controllers/admin_dashboard_controller.js).
 */
export default function LibraryReport() {
    const [data, setData] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        adminFetch('/dashboard/library')
            .then((result) => { setData(result); setError(''); })
            .catch((err) => setError(err.message));
    }, []);

    if (error) return <Alert variant="danger" className="py-2">{error}</Alert>;
    if (!data) return <Spinner animation="border" size="sm" />;

    // Game Temple's content first, then TopCake's (only the owner sees those)
    const groups = [
        { title: null, sources: data.sources.filter((s) => s.game !== 'topcake') },
        { title: '🎂 TopCake', sources: data.sources.filter((s) => s.game === 'topcake') },
    ].filter((group) => group.sources.length > 0);

    return (
        <div className="d-flex flex-column gap-4">
            {groups.map((group, i) => (
                <section key={group.title || 'main'} className="d-flex flex-column gap-3">
                    <Headline sources={group.sources} days={data.days} title={group.title} hero={i === 0} onlyYours={!data.everything} />
                    <div className="admin-library">
                        {group.sources.map((source) => (
                            // Under the TopCake heading, "🎂 TopCake:" on every card would say it again
                            <SourceCard key={source.id} source={{ ...source, label: source.label.replace(/^🎂\s*TopCake:\s*/, '') }} days={data.days} />
                        ))}
                    </div>
                </section>
            ))}
        </div>
    );
}

const fmt = (n) => Number(n || 0).toLocaleString();
const plural = (n, noun) => `${noun}${n === 1 ? '' : 's'}`;
const share = (part, whole) => (whole ? Math.round((part / whole) * 100) : 0);

// What's counted in a total: tag screens share their cards with another source, so they aren't counted twice
const counted = (sources) => sources.filter((s) => !s.error && !s.tagsOnly);

// The big number at the top: all the content, and how much of it is new
function Headline({ sources, days, title, hero, onlyYours }) {
    const total = counted(sources).reduce((sum, s) => sum + s.total, 0);
    const added = counted(sources).reduce((sum, s) => sum + s.added, 0);
    const kinds = counted(sources).length;
    return (
        <div>
            {title && <h5 className="text-dark mb-1">{title}</h5>}
            <div className="d-flex flex-wrap align-items-baseline gap-2">
                <span className={hero ? 'admin-hero-number' : 'admin-stat-number'}>{fmt(total)}</span>
                <span className="text-dark">pieces of content</span>
            </div>
            <div className="small text-muted">
                {kinds} {kinds === 1 ? 'kind' : 'kinds'} of content · {fmt(added)} added in the last {days} days
                {onlyYours && ' · only the decks you manage'}
            </div>
        </div>
    );
}

// One kind of content (Couch Cast cards, trivia questions...): its total, then how it breaks down
function SourceCard({ source, days }) {
    if (source.error) {
        return (
            <Card className="border shadow-sm">
                <Card.Body>
                    <h6 className="text-dark">{source.label}</h6>
                    <p className="small text-muted mb-0">{source.error}</p>
                </Card.Body>
            </Card>
        );
    }
    const { total, noun } = source;
    const retired = source.inPlay === null ? 0 : total - source.inPlay;
    const people = source.people.filter((p) => p.name !== 'system');
    const notes = healthNotes(source);

    return (
        <Card className="border shadow-sm">
            <Card.Body className="d-flex flex-column gap-3">
                <div>
                    <h6 className="text-dark mb-1">{source.label}</h6>
                    <div className="d-flex align-items-baseline gap-2">
                        <span className="admin-stat-number">{fmt(total)}</span>
                        <span className="text-dark">{plural(total, noun)}</span>
                    </div>
                    <div className="small text-muted">
                        {!total ? `No ${plural(2, noun)} in your decks yet`
                            : source.tagsOnly
                            ? 'The same cards as their game: not counted again in the total'
                            : <>
                                {source.inPlay !== null && (retired > 0 ? `${fmt(source.inPlay)} in play · ${fmt(retired)} taken out · ` : 'All in play · ')}
                                {fmt(source.added)} added in the last {days} days
                            </>}
                    </div>
                </div>

                {source.checked !== null && (
                    <Meter label="Checked" done={source.checked} total={total} />
                )}

                {source.split && source.split.counts.length > 0 && !source.tagsOnly && (
                    <SplitBar split={source.split} total={total} noun={noun} />
                )}

                {source.decks && source.decks.length > 0 && (
                    <div>
                        <div className="admin-library-heading">Decks</div>
                        {source.checked !== null
                            ? source.decks.map((d) => <Meter key={d.deck} label={d.deck} done={d.checked} total={d.total} compact />)
                            : <DeckBars decks={source.decks} noun={noun} />}
                    </div>
                )}

                {people.length > 0 && (
                    <div className="small text-muted">
                        <span className="admin-library-heading d-inline me-1">Added by</span>
                        {source.people.map((p) => `${p.name === 'system' ? 'the original set' : p.name} ${fmt(p.count)}`).join(' · ')}
                    </div>
                )}

                {notes.length > 0 && (
                    <ul className="admin-library-notes list-unstyled small mb-0">
                        {notes.map((note) => <li key={note}><span aria-hidden="true">⚠️ </span>{note}</li>)}
                    </ul>
                )}
            </Card.Body>
        </Card>
    );
}

// 🎨 Prompt and response are two different things (two categorical colors); easy → hard is an order (one blue, light → dark)
const SPLIT_COLORS = {
    prompt: '#2a78d6', response: '#eb6834',
    easy: '#86b6ef', medium: '#2a78d6', hard: '#104281',
};
const DARK_TEXT_ON = new Set(['easy']);   // the light blue takes dark writing
const name = (value) => value.charAt(0).toUpperCase() + value.slice(1);

// One whole split into parts: prompts vs responses, or easy / medium / hard. Each part shows its share if it fits.
function SplitBar({ split, total, noun }) {
    const described = split.counts.map((c) => `${name(c.value)}: ${fmt(c.count)} (${share(c.count, total)}%)`).join(', ');
    return (
        <div>
            <div className="admin-library-heading">{split.field === 'type' ? 'Prompts and responses' : 'By level'}</div>
            <div className="admin-split" role="img" aria-label={`${plural(2, noun)} by ${split.label.toLowerCase()}: ${described}`}>
                {split.counts.map((c) => {
                    const pct = share(c.count, total);
                    return (
                        <div key={c.value} className="admin-split-part" title={`${name(c.value)}: ${fmt(c.count)} (${pct}%)`}
                            style={{ flexGrow: c.count, background: SPLIT_COLORS[c.value] || '#898781', color: DARK_TEXT_ON.has(c.value) ? '#0b0b0b' : '#fff' }}>
                            {/* Too narrow for its share: the legend and the hover say it */}
                            {pct >= 12 && <span>{pct}%</span>}
                        </div>
                    );
                })}
            </div>
            <div className="admin-legend small">
                {split.counts.map((c) => (
                    <span key={c.value}>
                        <span className="admin-legend-swatch" style={{ background: SPLIT_COLORS[c.value] || '#898781' }} />
                        {name(c.value)} {fmt(c.count)}
                    </span>
                ))}
            </div>
        </div>
    );
}

// A bar per deck, longest first, with its count at the end
function DeckBars({ decks, noun }) {
    const most = Math.max(...decks.map((d) => d.total), 1);
    return (
        <div className="d-flex flex-column gap-1">
            {decks.map((d) => {
                const parts = d.split.map((c) => `${fmt(c.count)} ${c.value}`).join(', ');
                return (
                    <div key={d.deck} className="admin-deck-row" title={`${d.deck}: ${fmt(d.total)} ${plural(d.total, noun)}${parts ? ` (${parts})` : ''}`}>
                        <span className="admin-deck-name text-dark">{d.deck}</span>
                        <span className="admin-deck-track">
                            {/* The longest bar leaves room for its count after it */}
                            <span className="admin-deck-fill" style={{ width: `calc((100% - 3.5rem) * ${Math.max(0.02, d.total / most)})` }} />
                            <span className="admin-deck-value">{fmt(d.total)}</span>
                        </span>
                    </div>
                );
            })}
        </div>
    );
}

// How much of something is done: checked cards
function Meter({ label, done, total, compact }) {
    const pct = share(done, total);
    return (
        <div className={compact ? 'admin-deck-row' : ''} title={`${label}: ${fmt(done)} of ${fmt(total)} (${pct}%)`}>
            <span className={compact ? 'admin-deck-name text-dark' : 'admin-library-heading'}>{label}</span>
            <span className="d-flex align-items-center gap-2 flex-grow-1">
                <span className="admin-meter" role="meter" aria-valuemin={0} aria-valuemax={total} aria-valuenow={done} aria-label={`${label}: ${done} of ${total}`}>
                    <span style={{ width: `${pct}%` }} />
                </span>
                <span className="small text-muted text-nowrap">{fmt(done)} of {fmt(total)}{compact ? '' : ` (${pct}%)`}</span>
            </span>
        </div>
    );
}

// 🩺 Things worth knowing about this content, worked out from its numbers
const PLAYERS = 6;   // a typical game, for "will the responses last as long as the prompts?"
const LOW_LEVEL = 15;   // a level that's less than this share of the questions or words

function healthNotes(source) {
    const notes = [];
    if (source.tagsOnly || !source.split || !source.total) return notes;
    if (source.split.field === 'type') {
        // Each round deals one prompt, and everyone but the judge plays a response from their hand
        const decks = source.decks?.length ? source.decks : [{ deck: null, split: source.split.counts }];
        for (const d of decks) {
            const count = (value) => d.split.find((c) => c.value === value)?.count || 0;
            const prompts = count('prompt');
            const responses = count('response');
            const where = d.deck ? `The ${d.deck} deck` : 'This content';
            if (!prompts || !responses) {
                notes.push(`${where} has no ${prompts ? 'responses' : 'prompts'}, so it can't be played on its own.`);
            } else if (responses / prompts < PLAYERS - 1) {
                notes.push(`${where} has ${(responses / prompts).toFixed(1)} responses per prompt. A ${PLAYERS}-player round uses ${PLAYERS - 1}, so its responses run out before its prompts.`);
            }
        }
    }
    if (source.split.field === 'difficulty') {
        const total = source.split.counts.reduce((sum, c) => sum + c.count, 0);
        for (const level of ['easy', 'medium', 'hard']) {
            const n = source.split.counts.find((c) => c.value === level)?.count || 0;
            if (!n) notes.push(`No ${level} ${plural(2, source.noun)} yet.`);
            else if (share(n, total) < LOW_LEVEL) notes.push(`Only ${share(n, total)}% are ${level} (${fmt(n)}).`);
        }
    }
    return notes;
}
