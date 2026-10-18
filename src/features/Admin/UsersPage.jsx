import React, { useEffect, useState } from 'react';
import { Card, Form, Button, Alert, Badge, Row, Col, Spinner, Modal } from 'react-bootstrap';
import { adminFetch } from './adminApi.js';

// Deck ids the site already uses, offered as suggestions (any new id like "jeffinitely" works too)
const KNOWN_DECKS = ['core', 'halloween', 'animals', 'jeffinitely'];

/**
 * 👥 Owner only: the admin accounts. Each admin manages a list of game + deck pairs
 * ("Couch Cast & Prompt 2: jeffinitely"); the owner can do everything.
 */
export default function UsersPage({ me, catalog }) {
    const [users, setUsers] = useState(null);
    const [error, setError] = useState('');
    const [passwordFor, setPasswordFor] = useState(null);

    const load = () => adminFetch('/users').then(({ users: list }) => setUsers(list)).catch((err) => setError(err.message));
    useEffect(() => { load(); }, []);

    const save = async (user, changes) => {
        setError('');
        try {
            const { user: updated } = await adminFetch(`/users/${user.id}`, { method: 'PATCH', body: changes });
            setUsers((list) => list.map((u) => (u.id === updated.id ? updated : u)));
        } catch (err) {
            setError(err.message);
        }
    };

    const remove = async (user) => {
        if (!window.confirm(`Delete ${user.displayName}'s account? This can't be undone.`)) return;
        setError('');
        try {
            await adminFetch(`/users/${user.id}`, { method: 'DELETE' });
            setUsers((list) => list.filter((u) => u.id !== user.id));
        } catch (err) {
            setError(err.message);
        }
    };

    if (!users) return error ? <Alert variant="danger">{error}</Alert> : <Spinner animation="border" />;

    return (
        <div>
            {error && <Alert variant="danger" className="py-2" dismissible onClose={() => setError('')}>{error}</Alert>}

            {users.map((user) => (
                <Card key={user.id} className={`mb-3 ${user.active ? '' : 'opacity-50'}`}>
                    <Card.Body>
                        <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                            <div>
                                <span className="fw-bold fs-5">{user.displayName}</span>
                                <span className="text-muted ms-2">@{user.username}</span>
                                <Badge bg={user.role === 'owner' ? 'warning' : 'secondary'} text={user.role === 'owner' ? 'dark' : 'light'} className="ms-2 text-uppercase">{user.role}</Badge>
                                {!user.active && <Badge bg="dark" className="ms-2">Deactivated</Badge>}
                                <div className="small text-muted">
                                    {user.lastLoginAt ? `Last signed in ${new Date(user.lastLoginAt).toLocaleString()}` : 'Never signed in'}
                                </div>
                            </div>
                            <div className="d-flex gap-2 flex-wrap">
                                <Button size="sm" variant="outline-primary" onClick={() => setPasswordFor(user)}>Set password</Button>
                                {user.id !== me.id && (
                                    <>
                                        <Button size="sm" variant="outline-secondary" onClick={() => save(user, { active: !user.active })}>
                                            {user.active ? 'Deactivate' : 'Reactivate'}
                                        </Button>
                                        <Button size="sm" variant="outline-danger" onClick={() => remove(user)}>Delete</Button>
                                    </>
                                )}
                            </div>
                        </div>

                        {user.role === 'owner' ? (
                            <p className="small text-muted mb-0 mt-2">Full access to every game and deck.</p>
                        ) : (
                            <AccessEditor user={user} catalog={catalog} onChange={(access) => save(user, { access })} />
                        )}
                    </Card.Body>
                </Card>
            ))}

            <AddUser catalog={catalog} onAdded={(user) => setUsers((list) => [...list, user])} />

            <PasswordModal user={passwordFor} onClose={() => setPasswordFor(null)} onSave={(password) => save(passwordFor, { password })} />
        </div>
    );
}

/** An admin's game + deck pairs: chips to remove, and a row to add one */
function AccessEditor({ user, catalog, onChange }) {
    const [game, setGame] = useState(catalog[0]?.id || '');
    const [deck, setDeck] = useState('');
    const gameName = (id) => catalog.find((g) => g.id === id)?.name || id;

    useEffect(() => { if (!game && catalog[0]) setGame(catalog[0].id); }, [catalog]);

    const add = (e) => {
        e.preventDefault();
        const clean = deck.trim().toLowerCase();
        if (!game || !/^[a-z0-9-]{1,40}$/.test(clean)) return;
        onChange([...user.access, { game, deck: clean }]);
        setDeck('');
    };

    return (
        <div className="mt-2">
            <div className="small fw-bold text-secondary mb-1">Manages</div>
            {user.access.length === 0 && <div className="small text-muted mb-2">Nothing yet.</div>}
            <div className="d-flex flex-wrap gap-2 mb-2">
                {user.access.map((a) => (
                    <Badge key={`${a.game}:${a.deck}`} bg="light" text="dark" className="border d-flex align-items-center gap-2 fw-normal" style={{ fontSize: '0.85rem' }}>
                        <span><strong>{gameName(a.game)}</strong> · {a.deck}</span>
                        <button
                            type="button"
                            className="btn-close"
                            style={{ fontSize: '0.6rem' }}
                            aria-label={`Remove ${gameName(a.game)} ${a.deck}`}
                            onClick={() => onChange(user.access.filter((x) => !(x.game === a.game && x.deck === a.deck)))}
                        />
                    </Badge>
                ))}
            </div>
            <Form onSubmit={add} className="d-flex gap-2 flex-wrap">
                <Form.Select size="sm" value={game} onChange={(e) => setGame(e.target.value)} style={{ maxWidth: '240px' }} aria-label="Game">
                    {catalog.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                </Form.Select>
                <Form.Control size="sm" value={deck} onChange={(e) => setDeck(e.target.value)} placeholder="deck, e.g. jeffinitely" list={`decks-${user.id}`} style={{ maxWidth: '200px' }} aria-label="Deck" />
                <datalist id={`decks-${user.id}`}>{KNOWN_DECKS.map((d) => <option key={d} value={d} />)}</datalist>
                <Button size="sm" type="submit" variant="success" disabled={!deck.trim()}>Add</Button>
            </Form>
        </div>
    );
}

/** A new account: username, name, role and a starting password (the owner types it and shares it privately) */
function AddUser({ catalog, onAdded }) {
    const [form, setForm] = useState({ username: '', displayName: '', role: 'admin', password: '', confirm: '' });
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);
    const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

    const submit = async (e) => {
        e.preventDefault();
        setError('');
        if (form.password !== form.confirm) return setError("The passwords don't match.");
        setBusy(true);
        try {
            const { user } = await adminFetch('/users', {
                method: 'POST',
                body: { username: form.username, displayName: form.displayName, role: form.role, password: form.password, access: [] },
            });
            onAdded(user);
            setForm({ username: '', displayName: '', role: 'admin', password: '', confirm: '' });
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    };

    return (
        <Card className="border-success">
            <Card.Body>
                <h6 className="fw-bold">➕ Add an account</h6>
                <Form onSubmit={submit}>
                    <Row className="g-2">
                        <Col sm={6}><Form.Control size="sm" placeholder="username (e.g. jeff)" value={form.username} onChange={set('username')} autoCapitalize="none" required /></Col>
                        <Col sm={6}><Form.Control size="sm" placeholder="Display name (e.g. Jeff)" value={form.displayName} onChange={set('displayName')} /></Col>
                        <Col sm={4}>
                            <Form.Select size="sm" value={form.role} onChange={set('role')} aria-label="Role">
                                <option value="admin">Admin (chosen games and decks)</option>
                                <option value="owner">Owner (everything)</option>
                            </Form.Select>
                        </Col>
                        <Col sm={4}><Form.Control size="sm" type="password" placeholder="Starting password (10+)" value={form.password} onChange={set('password')} autoComplete="new-password" required /></Col>
                        <Col sm={4}><Form.Control size="sm" type="password" placeholder="Type it again" value={form.confirm} onChange={set('confirm')} autoComplete="new-password" required /></Col>
                    </Row>
                    {error && <Alert variant="danger" className="py-2 mt-2 mb-0">{error}</Alert>}
                    <Button type="submit" size="sm" variant="success" className="mt-2 fw-bold" disabled={busy}>Add account</Button>
                    <span className="small text-muted ms-2">Then add the games and decks they manage on their card above.</span>
                </Form>
            </Card.Body>
        </Card>
    );
}

function PasswordModal({ user, onClose, onSave }) {
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [error, setError] = useState('');
    useEffect(() => { setPassword(''); setConfirm(''); setError(''); }, [user]);

    const submit = (e) => {
        e.preventDefault();
        if (password.length < 10) return setError('Passwords need at least 10 characters.');
        if (password !== confirm) return setError("The passwords don't match.");
        onSave(password);
        onClose();
    };

    return (
        <Modal show={!!user} onHide={onClose} centered>
            <Form onSubmit={submit}>
                <Modal.Header closeButton><Modal.Title className="fs-5">New password for {user?.displayName}</Modal.Title></Modal.Header>
                <Modal.Body>
                    <Form.Control type="password" className="mb-2" placeholder="New password (10+ characters)" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
                    <Form.Control type="password" placeholder="Type it again" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" />
                    {error && <Alert variant="danger" className="py-2 mt-2 mb-0">{error}</Alert>}
                    <p className="small text-muted mt-2 mb-0">They'll be signed out everywhere and need the new password next time.</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit" variant="primary">Save password</Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}
