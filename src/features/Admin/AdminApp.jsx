import React, { useEffect, useState } from 'react';
import { Card, Form, Button, Alert, Spinner, Nav, Badge } from 'react-bootstrap';
import { adminFetch, signIn, signOut, getToken } from './adminApi.js';
import UsersPage from './UsersPage.jsx';

/**
 * 🔐 game-temple.org/admin. Sign in, then:
 *   Dashboard -> games played and visitors (coming in stage 2)
 *   Content   -> edit cards, questions and topics for the games and decks you manage (stage 3)
 *   Users     -> owner only: add accounts and choose which games/decks each admin manages
 */
export default function AdminApp() {
    const [user, setUser] = useState(null);
    const [catalog, setCatalog] = useState([]);
    const [checking, setChecking] = useState(!!getToken());
    const [tab, setTab] = useState('dashboard');

    // Already signed in on this tab? Pick the session back up.
    useEffect(() => {
        if (!getToken()) return;
        adminFetch('/me')
            .then(({ user: me }) => setUser(me))
            .catch(() => setUser(null))
            .finally(() => setChecking(false));
    }, []);

    useEffect(() => {
        if (user) adminFetch('/catalog').then(({ games }) => setCatalog(games)).catch(() => {});
    }, [user]);

    const handleSignOut = () => {
        signOut();
        setUser(null);
    };

    if (checking) {
        return <div className="page-container"><Spinner animation="border" variant="light" /></div>;
    }
    if (!user) return <SignIn onSignedIn={setUser} />;

    const isOwner = user.role === 'owner';
    const gameName = (id) => catalog.find((g) => g.id === id)?.name || id;

    return (
        <div className="page-container" style={{ maxWidth: '1000px', width: '100%', margin: '0 auto' }}>
            {/* The admin site is a work screen, not a game card: let it use the full width */}
            <Card className="main-card w-100" style={{ maxWidth: '1000px' }}>
                <Card.Header className="main-card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
                    <span>Game Temple Admin</span>
                    <span className="d-flex align-items-center gap-2 small">
                        <span className="text-white">{user.displayName}</span>
                        <Badge bg={isOwner ? 'warning' : 'light'} text="dark" className="text-uppercase">{user.role}</Badge>
                        <Button size="sm" variant="outline-light" onClick={handleSignOut}>Sign out</Button>
                    </span>
                </Card.Header>
                <Card.Body className="text-start">
                    <Nav variant="tabs" activeKey={tab} onSelect={(key) => setTab(key)} className="mb-3">
                        <Nav.Item><Nav.Link eventKey="dashboard">📊 Dashboard</Nav.Link></Nav.Item>
                        <Nav.Item><Nav.Link eventKey="content">🃏 Content</Nav.Link></Nav.Item>
                        {isOwner && <Nav.Item><Nav.Link eventKey="users">👥 Users</Nav.Link></Nav.Item>}
                    </Nav>

                    {tab === 'dashboard' && (
                        <div className="text-muted">
                            <h5 className="text-dark">Dashboard</h5>
                            <p className="mb-0">Games played by game, unique and returning visitors: coming in the next stage.</p>
                        </div>
                    )}

                    {tab === 'content' && (
                        <div>
                            <h5>Content</h5>
                            {isOwner ? (
                                <p className="text-muted">As the owner you can manage every game and deck. The card, question and topic editors come in a later stage.</p>
                            ) : user.access.length === 0 ? (
                                <p className="text-muted">You don't manage any games or decks yet. Ask the owner to add some.</p>
                            ) : (
                                <>
                                    <p className="text-muted mb-2">You manage these games and decks (editors coming in a later stage):</p>
                                    <ul>
                                        {user.access.map((a) => <li key={`${a.game}:${a.deck}`}><strong>{gameName(a.game)}</strong>: {a.deck} deck</li>)}
                                    </ul>
                                </>
                            )}
                        </div>
                    )}

                    {tab === 'users' && isOwner && <UsersPage me={user} catalog={catalog} />}
                </Card.Body>
            </Card>
        </div>
    );
}

function SignIn({ onSignedIn }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setBusy(true);
        setError('');
        try {
            onSignedIn(await signIn(username, password));
        } catch (err) {
            setError(err.message);
            setPassword('');
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="page-container">
            <Card className="main-card">
                <Card.Header className="main-card-header">Admin Sign In</Card.Header>
                <Card.Body>
                    <Form onSubmit={handleSubmit} className="text-start">
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold small text-secondary">Username</Form.Label>
                            <Form.Control value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" autoCapitalize="none" required />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold small text-secondary">Password</Form.Label>
                            <Form.Control type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
                        </Form.Group>
                        {error && <Alert variant="danger" className="py-2">{error}</Alert>}
                        <Button type="submit" variant="primary" className="w-100 fw-bold" disabled={busy}>
                            {busy ? <Spinner size="sm" animation="border" /> : 'Sign in'}
                        </Button>
                    </Form>
                </Card.Body>
            </Card>
        </div>
    );
}
