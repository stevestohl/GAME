import React, { useEffect, useRef, useState } from 'react';
import { Table, Form, Button, Alert, Spinner, Badge, InputGroup } from 'react-bootstrap';
import { adminFetch } from './adminApi.js';

const COLUMN_LABELS = { text: 'Card text', type: 'Type', deck: 'Deck', createdBy: 'Created by', updatedAt: 'Last edited' };
const PAGE_SIZE = 30;

const formatDate = (value) => (value ? new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—');

/**
 * 🃏 One content source (e.g. Couch Cast & Prompt 2 cards) as a grid: 30 rows a page, a search box,
 * filter dropdowns and sorting on the column headers, and add / edit / delete. The server limits
 * everything to the decks this account manages, so admins only ever see their own decks.
 */
export default function ContentGrid({ source }) {
    const [data, setData] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [query, setQuery] = useState({ page: 1, sort: 'text', dir: 'asc', search: '', filters: {} });
    const [editing, setEditing] = useState(null);     // { id, draft } (id 'new' = the add row)
    const searchTimer = useRef(null);
    const isOwner = source.decks === null;

    // Load a page whenever the query changes
    useEffect(() => {
        const params = new URLSearchParams({ page: query.page, limit: PAGE_SIZE, sort: query.sort, dir: query.dir, search: query.search });
        Object.entries(query.filters).forEach(([key, value]) => { if (value) params.set(key, value); });
        setLoading(true);
        adminFetch(`/content/${source.id}?${params}`)
            .then((result) => { setData(result); setError(''); })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [source.id, query]);

    // Search as you type, after a short pause
    const handleSearch = (value) => {
        setSearch(value);
        clearTimeout(searchTimer.current);
        searchTimer.current = setTimeout(() => setQuery((q) => ({ ...q, search: value.trim(), page: 1 })), 300);
    };
    const setFilter = (key, value) => setQuery((q) => ({ ...q, filters: { ...q.filters, [key]: value }, page: 1 }));
    const setSort = (key) => setQuery((q) => ({ ...q, sort: key, dir: q.sort === key && q.dir === 'asc' ? 'desc' : 'asc' }));
    const goTo = (page) => setQuery((q) => ({ ...q, page }));
    const reload = () => setQuery((q) => ({ ...q }));
    const clearAll = () => { setSearch(''); setQuery((q) => ({ ...q, search: '', filters: {}, page: 1 })); };

    // Decks this account can put content in: the owner can also type a brand-new deck name
    const deckChoices = isOwner ? (data?.facets?.deck || []).map((f) => f.value) : source.decks;

    const blankDraft = () => {
        const draft = { deck: query.filters.deck || deckChoices?.[0] || 'core' };
        Object.entries(source.fields).forEach(([key, field]) => { draft[key] = field.kind === 'choice' ? (query.filters[key] || field.choices[0]) : ''; });
        return draft;
    };

    const save = async () => {
        const { id, draft } = editing;
        setError('');
        try {
            if (id === 'new') await adminFetch(`/content/${source.id}`, { method: 'POST', body: draft });
            else await adminFetch(`/content/${source.id}/${id}`, { method: 'PATCH', body: draft });
            setEditing(null);
            reload();
        } catch (err) {
            setError(err.message);
        }
    };

    const remove = async (row) => {
        if (!window.confirm(`Delete this ${source.noun}?\n\n"${row.text}"`)) return;
        setError('');
        try {
            await adminFetch(`/content/${source.id}/${row.id}`, { method: 'DELETE' });
            reload();
        } catch (err) {
            setError(err.message);
        }
    };

    const hasFilters = query.search || Object.values(query.filters).some(Boolean);
    const first = data ? (data.page - 1) * data.limit + 1 : 0;
    const last = data ? Math.min(data.total, data.page * data.limit) : 0;

    // The edit form, used both for a row being edited and for the "add" row
    const editCells = () => (
        <>
            {source.columns.map((col) => {
                if (col === 'text') {
                    return (
                        <td key={col}>
                            <Form.Control as="textarea" rows={2} size="sm" value={editing.draft.text} maxLength={source.fields.text.max}
                                onChange={(e) => setEditing((ed) => ({ ...ed, draft: { ...ed.draft, text: e.target.value } }))} aria-label="Card text" autoFocus />
                        </td>
                    );
                }
                if (source.fields[col]?.kind === 'choice') {
                    return (
                        <td key={col}>
                            <Form.Select size="sm" value={editing.draft[col]} onChange={(e) => setEditing((ed) => ({ ...ed, draft: { ...ed.draft, [col]: e.target.value } }))} aria-label={COLUMN_LABELS[col]}>
                                {source.fields[col].choices.map((c) => <option key={c} value={c}>{c}</option>)}
                            </Form.Select>
                        </td>
                    );
                }
                if (col === 'deck') {
                    return (
                        <td key={col}>
                            {isOwner ? (
                                <>
                                    <Form.Control size="sm" list={`deck-options-${source.id}`} value={editing.draft.deck}
                                        onChange={(e) => setEditing((ed) => ({ ...ed, draft: { ...ed.draft, deck: e.target.value } }))} aria-label="Deck" />
                                    <datalist id={`deck-options-${source.id}`}>{deckChoices.map((d) => <option key={d} value={d} />)}</datalist>
                                </>
                            ) : (
                                <Form.Select size="sm" value={editing.draft.deck} onChange={(e) => setEditing((ed) => ({ ...ed, draft: { ...ed.draft, deck: e.target.value } }))} aria-label="Deck">
                                    {deckChoices.map((d) => <option key={d} value={d}>{d}</option>)}
                                </Form.Select>
                            )}
                        </td>
                    );
                }
                return <td key={col} className="text-muted small">—</td>;
            })}
            <td className="text-nowrap">
                <Button size="sm" variant="success" className="me-1" onClick={save}>Save</Button>
                <Button size="sm" variant="outline-secondary" onClick={() => setEditing(null)}>Cancel</Button>
            </td>
        </>
    );

    return (
        <div>
            {/* Toolbar: search, clear, add */}
            <div className="d-flex flex-wrap gap-2 align-items-center mb-2">
                <InputGroup size="sm" style={{ maxWidth: '340px' }}>
                    <InputGroup.Text>🔍</InputGroup.Text>
                    <Form.Control placeholder={`Search ${source.noun}s...`} value={search} onChange={(e) => handleSearch(e.target.value)} aria-label="Search" />
                </InputGroup>
                {hasFilters && <Button size="sm" variant="link" onClick={clearAll}>Clear search &amp; filters</Button>}
                <div className="ms-auto d-flex align-items-center gap-2">
                    {loading && <Spinner size="sm" animation="border" />}
                    <Button size="sm" variant="primary" disabled={editing?.id === 'new'} onClick={() => setEditing({ id: 'new', draft: blankDraft() })}>
                        ➕ Add {source.noun}
                    </Button>
                </div>
            </div>

            {error && <Alert variant="danger" className="py-2" dismissible onClose={() => setError('')}>{error}</Alert>}

            <div className="table-responsive">
                <Table hover size="sm" className="align-middle mb-2 admin-grid">
                    <thead>
                        <tr>
                            {source.columns.map((col) => (
                                <th key={col} className={col === 'text' ? 'w-50' : 'text-nowrap'}>
                                    {source.sortable.includes(col) ? (
                                        <button type="button" className="admin-sort" onClick={() => setSort(col)} aria-label={`Sort by ${COLUMN_LABELS[col]}`}>
                                            {COLUMN_LABELS[col]} {query.sort === col ? (query.dir === 'asc' ? '▲' : '▼') : <span className="text-muted">↕</span>}
                                        </button>
                                    ) : COLUMN_LABELS[col]}
                                    {source.filters.includes(col) && (
                                        <Form.Select size="sm" className="mt-1 admin-filter" value={query.filters[col] || ''} onChange={(e) => setFilter(col, e.target.value)} aria-label={`Filter by ${COLUMN_LABELS[col]}`}>
                                            <option value="">All</option>
                                            {(data?.facets?.[col] || []).map((f) => <option key={f.value} value={f.value}>{f.value} ({f.count})</option>)}
                                        </Form.Select>
                                    )}
                                </th>
                            ))}
                            <th className="text-nowrap" style={{ width: '1%' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {editing?.id === 'new' && <tr className="table-success">{editCells()}</tr>}
                        {data?.rows.map((row) => (editing?.id === row.id ? (
                            <tr key={row.id} className="table-warning">{editCells()}</tr>
                        ) : (
                            <tr key={row.id}>
                                {source.columns.map((col) => (
                                    <td key={col} className={col === 'text' ? '' : 'text-nowrap small'}>
                                        {col === 'type' ? <Badge bg={row.type === 'prompt' ? 'primary' : 'secondary'}>{row.type}</Badge>
                                            : col === 'deck' ? <Badge bg="light" text="dark" className="border">{row.deck}</Badge>
                                                : col === 'updatedAt' ? <span title={row.updatedBy ? `by ${row.updatedBy}` : ''}>{formatDate(row.updatedAt)}</span>
                                                    : row[col]}
                                    </td>
                                ))}
                                <td className="text-nowrap">
                                    <Button size="sm" variant="outline-primary" className="me-1" disabled={!!editing} onClick={() => setEditing({ id: row.id, draft: { ...row } })} aria-label="Edit">✏️</Button>
                                    <Button size="sm" variant="outline-danger" disabled={!!editing} onClick={() => remove(row)} aria-label="Delete">🗑️</Button>
                                </td>
                            </tr>
                        )))}
                        {data && data.rows.length === 0 && (
                            <tr><td colSpan={source.columns.length + 1} className="text-center text-muted py-4">No {source.noun}s match.</td></tr>
                        )}
                    </tbody>
                </Table>
            </div>

            {/* Paging */}
            {data && (
                <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
                    <span className="small text-muted">{data.total ? `Showing ${first}–${last} of ${data.total}` : 'Nothing to show'}</span>
                    <div className="d-flex gap-1 align-items-center">
                        <Button size="sm" variant="outline-secondary" disabled={data.page <= 1} onClick={() => goTo(1)} aria-label="First page">«</Button>
                        <Button size="sm" variant="outline-secondary" disabled={data.page <= 1} onClick={() => goTo(data.page - 1)}>‹ Prev</Button>
                        <span className="small px-2">Page {data.page} of {data.pages}</span>
                        <Button size="sm" variant="outline-secondary" disabled={data.page >= data.pages} onClick={() => goTo(data.page + 1)}>Next ›</Button>
                        <Button size="sm" variant="outline-secondary" disabled={data.page >= data.pages} onClick={() => goTo(data.pages)} aria-label="Last page">»</Button>
                    </div>
                </div>
            )}
        </div>
    );
}
