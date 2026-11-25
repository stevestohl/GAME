import React, { useEffect, useState } from 'react';
import { Card, Alert, Spinner, Form } from 'react-bootstrap';
import { adminFetch } from './adminApi.js';

/**
 * 📚 The Dashboard's Library tab: how much content there is in every deck, shown to everyone who makes content, so a
 * thin deck (like Holiday) is there for all of them to see. "Added by" narrows it to what one person added. Editing
 * still stays within each person's own decks, on the Content tab, and TopCake's content is only shown to the owner.
 * The numbers come from GET /api/admin/dashboard/library (controllers/admin_dashboard_controller.js).
 */
const WHO_KEY = 'gtAdminLibraryWho';   // the "Added by" choice, kept while this browser tab is open

export default function LibraryReport() {
    const [who, setWho] = useState(() => sessionStorage.getItem(WHO_KEY) || '');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let current = true;   // a quicker answer for a later choice wins over a slow one for an earlier choice
        setLoading(true);
        adminFetch(`/dashboard/library${who ? `?createdBy=${encodeURIComponent(who)}` : ''}`)
            .then((result) => {
                // A server from before the Library report answers with a web page, not numbers: say so, don't go blank
                if (!Array.isArray(result?.sources)) throw new Error("The server doesn't have the Library report yet. If it was just updated, try again in a few minutes.");
                if (!current) return;
                setData(result);
                setError('');
            })
            .catch((err) => { if (current) setError(err.message); })
            .finally(() => { if (current) setLoading(false); });
        return () => { current = false; };
    }, [who]);

    const pick = (value) => {
        setWho(value);
        sessionStorage.setItem(WHO_KEY, value);
    };

    if (!data) return error ? <Alert variant="danger" className="py-2">{error}</Alert> : <Spinner animation="border" size="sm" />;

    const byWhom = who ? creatorName(who, data.me) : null;
    // One person's content: just the kinds they've added
    const shown = who ? data.sources.filter((s) => s.error || s.total > 0) : data.sources;
    // Game Temple's content first, then TopCake's (only the owner sees those)
    const groups = [
        { title: null, sources: shown.filter((s) => s.game !== 'topcake') },
        { title: '🎂 TopCake', sources: shown.filter((s) => s.game === 'topcake') },
    ].filter((group) => group.sources.length > 0);

    return (
        <div className="d-flex flex-column gap-4">
            <CreatorFilter who={who} onPick={pick} creators={data.creators || []} me={data.me} loading={loading} />
            {error && <Alert variant="danger" className="py-2 mb-0">{error}</Alert>}
            {groups.length === 0 && <p className="text-muted mb-0">Nothing added by {byWhom} yet.</p>}
            {groups.map((group, i) => (
                <section key={group.title || 'main'} className="d-flex flex-column gap-3">
                    <Headline sources={group.sources} days={data.days} title={group.title} hero={i === 0} byWhom={byWhom} />
                    <div className="admin-library">
                        {group.sources.map((source) => (
                            // Under the TopCake heading, "🎂 TopCake:" on every card would say it again
                            <SourceCard key={source.id} source={{ ...source, label: source.label.replace(/^🎂\s*TopCake:\s*/, '') }} filtered={!!who} />
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

// Content nobody added on the admin site is "system": the set the games started with
const creatorName = (name, me) => (name === me ? 'you' : name === 'system' ? 'the original set' : name);

// What's counted in a total: tag screens share their cards with another source, so they aren't counted twice
const counted = (sources) => sources.filter((s) => !s.error && !s.tagsOnly);

// 🔎 "Added by": everyone, or one person (you first, even before you've added anything), with how much each has added
function CreatorFilter({ who, onPick, creators, me, loading }) {
    const options = [creators.find((c) => c.name === me) || { name: me, count: 0 }, ...creators.filter((c) => c.name !== me)];
    if (who && !options.some((c) => c.name === who)) options.push({ name: who, count: 0 });
    const label = (c) => (c.name === me ? `You (${me})` : c.name === 'system' ? 'The original set' : c.name);
    return (
        <div className="d-flex flex-wrap align-items-center gap-2">
            <Form.Label htmlFor="library-added-by" className="small fw-bold text-secondary mb-0">Added by</Form.Label>
            <Form.Select id="library-added-by" size="sm" style={{ maxWidth: '260px' }} value={who} onChange={(e) => onPick(e.target.value)}>
                <option value="">Everyone</option>
                {options.filter((c) => c.name).map((c) => <option key={c.name} value={c.name}>{label(c)} · {fmt(c.count)}</option>)}
            </Form.Select>
            {loading && <Spinner animation="border" size="sm" role="status" aria-label="Counting" />}
        </div>
    );
}

// The big number at the top: all the content (or one person's), and how much of it is new
function Headline({ sources, days, title, hero, byWhom }) {
    const total = counted(sources).reduce((sum, s) => sum + s.total, 0);
    const added = counted(sources).reduce((sum, s) => sum + s.added, 0);
    const kinds = counted(sources).length;
    return (
        <div>
            {title && <h5 className="text-dark mb-1">{title}</h5>}
            <div className="d-flex flex-wrap align-items-baseline gap-2">
                <span className={hero ? 'admin-hero-number' : 'admin-stat-number'}>{fmt(total)}</span>
                <span className="text-dark">{plural(total, 'piece')} of content{byWhom ? ` added by ${byWhom}` : ''}</span>
            </div>
            <div className="small text-muted">
                {kinds} {kinds === 1 ? 'kind' : 'kinds'} of content · {fmt(added)} added in the last {days} days
            </div>
        </div>
    );
}

// One kind of content (Couch Cast cards, trivia questions...): its total, a column per deck, who added it, and what's
// worth knowing about it. Filtered to one person: their part of it, without the deck warnings (those are about whole decks).
function SourceCard({ source, filtered }) {
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
    const people = filtered ? [] : source.people.filter((p) => p.name !== 'system');
    const notes = filtered ? [] : healthNotes(source);
    // Content with no decks (some of TopCake's) is one column of its own, if it has parts to show
    const hasDecks = source.decks?.length > 0;
    const columns = hasDecks ? source.decks
        : source.split?.counts.length ? [{ deck: 'all', total, split: source.split.counts }] : [];
    const aside = !total ? `No ${plural(2, noun)} yet`
        : source.tagsOnly ? 'The same cards as their game: not counted again in the total'
        : retired > 0 ? `${fmt(retired)} taken out of play`
        : null;

    return (
        <Card className="border shadow-sm">
            <Card.Body className="d-flex flex-column gap-3">
                <div>
                    <h6 className="text-dark mb-1">{source.label}</h6>
                    <div className="d-flex align-items-baseline gap-2">
                        <span className="admin-stat-number">{fmt(total)}</span>
                        <span className="text-dark">{plural(total, noun)}</span>
                    </div>
                    {aside && <div className="small text-muted">{aside}</div>}
                </div>

                {/* Tag screens: how many of their cards have been checked */}
                {source.checked !== null ? (
                    <>
                        <Meter label="Checked" done={source.checked} total={total} />
                        {hasDecks && (
                            <div>
                                <div className="admin-library-heading">Decks</div>
                                {source.decks.map((d) => <Meter key={d.deck} label={d.deck} done={d.checked} total={d.total} compact />)}
                            </div>
                        )}
                    </>
                ) : columns.length > 0 && (
                    <DeckColumns decks={columns} split={source.split} noun={noun} heading={hasDecks ? 'Decks' : source.split.label} />
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
const ONE_COLOR = '#2a78d6';   // content that isn't split into parts
const colorOf = (value) => (value ? SPLIT_COLORS[value] || '#898781' : ONE_COLOR);   // gray: a level that isn't set
const name = (value) => value.charAt(0).toUpperCase() + value.slice(1);

const PLOT = 140;   // px: the biggest deck's column
const GAP = 2;   // px of white between the parts of a column
const MIN_PART = 2;   // px: even one card still shows

// 📊 A column per deck, biggest first, so decks compare side by side. Each column is stacked from the bottom in its
// parts' order (prompts, then responses / easy → hard), with the deck's count on top. Hovering or tapping a column
// gives its parts; the legend has the totals.
function DeckColumns({ decks, split, noun, heading }) {
    const [hovered, setActive] = useState(null);
    // By deck name, so new numbers (another "Added by") never leave a column lit that isn't there any more
    const active = decks.some((d) => d.deck === hovered) ? hovered : null;
    const most =Math.max(...decks.map((d) => d.total), 1);
    const partsOf = (d) => (d.split.length ? d.split : [{ value: null, count: d.total }]);
    const describe = (d) => `${d.deck}: ${fmt(d.total)} ${plural(d.total, noun)}${d.split.length ? ` (${d.split.map((c) => `${fmt(c.count)} ${c.value}`).join(', ')})` : ''}`;

    return (
        <div>
            <div className="d-flex flex-wrap justify-content-between align-items-baseline gap-2">
                <span className="admin-library-heading mb-0">{heading}</span>
                {split && split.counts.length > 1 && (
                    <span className="admin-legend small">
                        {split.counts.map((c) => (
                            <span key={c.value}>
                                <span className="admin-legend-swatch" style={{ background: colorOf(c.value) }} />
                                {name(c.value)} {fmt(c.count)}
                            </span>
                        ))}
                    </span>
                )}
            </div>
            <div className="admin-columns" role="list" aria-label={`${plural(2, noun)} by deck`} onMouseLeave={() => setActive(null)}>
                {decks.map((d, i) => {
                    const parts = partsOf(d);
                    const room = Math.max(0, (d.total / most) * PLOT - GAP * (parts.length - 1));
                    return (
                        <div key={d.deck} role="listitem" tabIndex={0} aria-label={describe(d)}
                            className={`admin-column-slot${active !== null && active !== d.deck ? ' is-dim' : ''}`}
                            onMouseEnter={() => setActive(d.deck)} onFocus={() => setActive(d.deck)} onBlur={() => setActive(null)} onClick={() => setActive(d.deck)}>
                            <div className="admin-column-plot" style={{ height: `${PLOT + 20}px` }}>
                                <div className="admin-column">
                                    <span className="admin-column-total">{fmt(d.total)}</span>
                                    {parts.map((p) => (
                                        <span key={p.value || 'all'} style={{ height: `${Math.max(MIN_PART, (p.count / d.total) * room)}px`, background: colorOf(p.value) }} />
                                    ))}
                                </div>
                            </div>
                            <div className="admin-column-name">{d.deck}</div>
                            {/* Kept inside the card: the first column's opens to the right, the last one's to the left */}
                            {active === d.deck && (
                                <ColumnTip deck={d} noun={noun} align={i === 0 ? 'start' : i === decks.length - 1 ? 'end' : 'center'} />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// The hovered column's parts (the column's own label already says all this to a screen reader)
function ColumnTip({ deck, noun, align }) {
    const count = (value) => deck.split.find((c) => c.value === value)?.count || 0;
    const perPrompt = count('prompt') && count('response') ? Math.floor((count('response') / count('prompt')) * 10) / 10 : null;
    return (
        <div className={`admin-column-tip is-${align}`} aria-hidden="true">
            <div className="fw-bold">{deck.deck} · {fmt(deck.total)} {plural(deck.total, noun)}</div>
            {deck.split.map((c) => (
                <div key={c.value}>
                    <span className="admin-legend-swatch" style={{ background: colorOf(c.value) }} />
                    {name(c.value)} {fmt(c.count)} <span className="text-muted">({share(c.count, deck.total)}%)</span>
                </div>
            ))}
            {perPrompt !== null && <div className="text-muted">{perPrompt} responses per prompt</div>}
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

// 🩺 Things worth knowing about this content, worked out from today's numbers each time the page loads: each one says
// how many more would settle it, and goes away by itself once there are enough
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
                // Rounded down, so it never reads "5.0" while it's still short
                const perPrompt = Math.floor((responses / prompts) * 10) / 10;
                const more = prompts * (PLAYERS - 1) - responses;
                notes.push(`${where} has ${perPrompt} responses per prompt. A ${PLAYERS}-player round uses ${PLAYERS - 1}: ${fmt(more)} more ${plural(more, 'response')} would cover its prompts.`);
            }
        }
    }
    if (source.split.field === 'difficulty') {
        const total = source.split.counts.reduce((sum, c) => sum + c.count, 0);
        for (const level of ['easy', 'medium', 'hard']) {
            const n = source.split.counts.find((c) => c.value === level)?.count || 0;
            if (!n) notes.push(`No ${level} ${plural(2, source.noun)} yet.`);
            else if (share(n, total) < LOW_LEVEL) {
                let more = 1;   // the fewest new ones at this level that bring it up to LOW_LEVEL
                while (share(n + more, total + more) < LOW_LEVEL) more += 1;
                notes.push(`Only ${share(n, total)}% are ${level} (${fmt(n)}): ${fmt(more)} more ${level} ${plural(more, source.noun)} would make it ${LOW_LEVEL}%.`);
            }
        }
    }
    return notes;
}
