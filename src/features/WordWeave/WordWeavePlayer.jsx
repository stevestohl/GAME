import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Spinner, Alert, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { ROOM_NOT_FOUND, joinAgain } from '../../hooks/useRoomGone.js';
import { wordWeaveSocket as socket } from '../../socket.js';
import { toDeviceTime } from '../../serverClock.js';
import { useSetBackgroundTheme } from '../Menu/backgroundTheme.js';
import { useTimerMusic } from '../../timerMusic.js';
import SnakeSnack from '../Mixup/SnakeSnack.jsx';
import TempleWaitingRoom from '../Menu/TempleWaitingRoom.jsx';
import { CouchCastPausedOverlay } from '../CouchCast/CouchCastCasterControls.jsx';
import { Avatar, getMyAvatar } from '../../avatars.jsx';
import WordGrid from './WordGrid.jsx';
import {
    useCountdown, clockText, REASONS, MIN_LENGTH, POINTS_TABLE, plural, placeText, secondsLabel,
} from './wordWeaveShared.js';

/**
 * 📱 Word Weave on a player's phone: the grid to weave words on, and how you did.
 * On a TV game the TV shows the big grid and the reveal; on just phones (room.mode 'phones') this screen shows
 * everyone's scores too, and the room leader's phone runs the game (start, pause, next round, Play Again).
 */
const buzz = (pattern) => { try { navigator.vibrate?.(pattern); } catch { /* not on this phone */ } };

export default function WordWeavePlayer({ roomCode, playerName }) {
    const navigate = useNavigate();
    const [room, setRoom] = useState(null);
    const [mine, setMine] = useState({ round: 0, words: [] });
    const [error, setError] = useState('');
    const [path, setPath] = useState([]);
    const [flash, setFlash] = useState(null);         // the thread lit green or red for a moment
    const [feedback, setFeedback] = useState(null);   // the line under the grid
    const [isTyping, setIsTyping] = useState(false);
    const [typed, setTyped] = useState('');
    const traced = useRef(new Map());                 // word -> the tiles it was traced on (to light a refusal)
    const roomRef = useRef(null);
    const flashId = useRef(0);
    roomRef.current = room;

    useSetBackgroundTheme('wordweave');

    const showFlash = (tiles, ok, text) => {
        flashId.current += 1;
        const id = flashId.current;
        setFlash(tiles?.length ? { path: tiles, ok, id } : null);
        setFeedback({ ok, text, id });
        setTimeout(() => setFlash((f) => (f?.id === id ? null : f)), ok ? 650 : 750);
    };

    // --- Join, and stay joined through refreshes and network blips ---
    useEffect(() => {
        let playerId = localStorage.getItem('templePlayerId');
        if (!playerId) {
            playerId = 'player_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('templePlayerId', playerId);
        }
        const joinMyRoom = () => socket.emit('joinRoom', { roomCode, playerName, playerId, avatar: getMyAvatar() });
        const handleRoom = (update) => { if (update?.roomCode === roomCode) setRoom(update); };
        const handleMine = (update) => setMine(update);
        const handleResult = (result) => {
            const tiles = traced.current.get(result.word) || null;
            traced.current.delete(result.word);
            if (result.round !== roomRef.current?.round) return;
            if (result.ok) {
                setMine((prev) => (prev.round === result.round
                    ? { ...prev, words: prev.words.includes(result.word) ? prev.words : [...prev.words, result.word] }
                    : { round: result.round, words: [result.word] }));
                showFlash(result.path || tiles, true, `✓ ${result.word.toUpperCase()}  +${result.points}`);
                buzz(25);
            } else {
                showFlash(tiles, false, `✗ ${REASONS[result.reason] || 'Try another one'}`);
                buzz([30, 40, 30]);
            }
        };
        const handleJoinError = (msg) => {
            if (msg === ROOM_NOT_FOUND) {
                navigate(...joinAgain(roomCode));
                return;
            }
            setError(msg);
        };
        const handleClosed = ({ message } = {}) => navigate('/home', { state: { toastMessage: message || 'That game has ended.' } });

        socket.on('room_updated', handleRoom);
        socket.on('my_words', handleMine);
        socket.on('word_result', handleResult);
        socket.on('joinError', handleJoinError);
        socket.on('room_closed', handleClosed);
        socket.on('connect', joinMyRoom);
        if (socket.connected) joinMyRoom();
        else socket.connect();

        return () => {
            socket.off('room_updated', handleRoom);
            socket.off('my_words', handleMine);
            socket.off('word_result', handleResult);
            socket.off('joinError', handleJoinError);
            socket.off('room_closed', handleClosed);
            socket.off('connect', joinMyRoom);
        };
    }, [roomCode, playerName]);

    // A new round: a clean slate
    const round = room?.round;
    useEffect(() => {
        setPath([]);
        setFlash(null);
        setFeedback(null);
        setTyped('');
        traced.current.clear();
    }, [round]);

    const gameState = room?.gameState;
    const onPhones = room?.mode === 'phones';
    const isLeader = !!room && room.hostId === socket.id;
    const timeLeft = useCountdown(['rules', 'intro', 'playing', 'round_results'].includes(gameState) && !room?.isPaused ? room.endTime : null);
    // ⏳ On just phones, the leader's phone plays the clock's music
    useTimerMusic(onPhones && isLeader && gameState === 'playing' && !room?.isPaused, { endTime: toDeviceTime(room?.endTime), key: round });

    if (error && !room) {
        return (
            <Frame title="Word Weave">
                <Alert variant="danger">{error}</Alert>
                <Button variant="primary" className="w-100" onClick={() => navigate('/join')}>Back to Join</Button>
            </Frame>
        );
    }
    if (!room) {
        return (
            <Frame title="Word Weave">
                <Spinner animation="border" variant="primary" />
                <p className="text-muted mt-2 mb-0">Joining room {roomCode}...</p>
            </Frame>
        );
    }

    const me = room.players[socket.id];
    const myKey = me?.key;
    const people = Object.values(room.players).filter((p) => !p.isCaster && p.isConnected).sort((a, b) => a.joinOrder - b.joinOrder);
    const leaderName = room.players[room.hostId]?.name || 'the leader';
    const settings = `${room.size} × ${room.size} · ${secondsLabel(room.roundSeconds)} a round · ${plural(room.totalRounds, 'round')}`;
    const errorBox = error && <Alert variant="warning" className="py-2 small" onClose={() => setError('')} dismissible>{error}</Alert>;

    // ⏸️ Paused: on just phones the leader has the play button
    if (room.isPaused) {
        if (onPhones && isLeader) {
            return (
                <Frame title="Paused">
                    <div className="ww-big">⏸️</div>
                    <p className="fw-bold">The game is paused for everyone.</p>
                    <Button variant="success" size="lg" className="w-100 fw-bold" onClick={() => socket.emit('set_paused', { roomCode, paused: false })}>▶️ Carry on</Button>
                </Frame>
            );
        }
        return <CouchCastPausedOverlay />;
    }

    // ===================== LOBBY =====================
    if (gameState === 'lobby') {
        const start = () => { setError(''); socket.emit('startGame', { roomCode }); };
        if (onPhones) {
            return (
                <>
                    {errorBox && <div className="page-container pb-0">{errorBox}</div>}
                    <TempleWaitingRoom
                        game="wordweave"
                        title="Word Weave"
                        roomCode={roomCode}
                        players={people}
                        meId={socket.id}
                        leaderId={room.hostId}
                        onStart={isLeader ? start : undefined}
                        startLabel={people.length > 1 ? `Start (${people.length} players)` : 'Start (just me for now)'}
                        status={isLeader ? `${settings}. Start when everyone's in.` : `Waiting for ${leaderName} to start...`}
                    />
                </>
            );
        }
        return (
            <>
                {isLeader && (
                    <div className="tc-leader-bar">
                        <span className="fw-bold text-dark small">👑 Room Leader</span>
                        <Button variant="primary" className="fw-bold flex-grow-1" onClick={start}>
                            Start Word Weave ({plural(people.length, 'player')})
                        </Button>
                    </div>
                )}
                <Frame title="You're In!">
                    {errorBox}
                    <p className="small text-muted mb-2">{settings}</p>
                    <div className="tw-players justify-content-center mb-2">
                        {people.map((p) => (
                            <div key={p.id} className={`tw-player ${p.id === socket.id ? 'is-me' : ''}`}>
                                <Avatar id={p.avatar} name={p.name} size={28} />
                                <span className="tw-player-name">{p.name}{p.id === socket.id ? ' (you)' : ''}</span>
                                {p.id === room.hostId && <span aria-label="Room leader">👑</span>}
                            </div>
                        ))}
                    </div>
                    {!isLeader && (
                        <div className="p-2 border rounded bg-light text-muted small mb-2">
                            Waiting for <strong>{leaderName}</strong> to start...
                        </div>
                    )}
                    <SnakeSnack socket={socket} roomCode={roomCode} room={room} />
                </Frame>
            </>
        );
    }

    // ===================== RULES =====================
    if (gameState === 'rules') {
        return (
            <Frame title="How to Play" right={onPhones && timeLeft !== null && <span className="ww-clock">{timeLeft}s</span>}>
                <div className="ww-rules-phone">
                    <p><strong>🧶 Weave:</strong> slide your finger through letters that touch: across, up, down or corner to corner. Each letter once per word. (Or tap the letters, then tap the last one again.)</p>
                    <p><strong>📖 Real words</strong> of {MIN_LENGTH} letters or more. You'll know straight away if one counts.</p>
                    <p><strong>✂️ Be original:</strong> when time's up, any word two or more players found is crossed out.</p>
                    <p className="mb-1"><strong>📏 Go long:</strong> longer words score more.</p>
                </div>
                <PointsTable />
                {onPhones && isLeader
                    ? <Button variant="primary" size="lg" className="w-100 fw-bold" onClick={() => socket.emit('startRounds', { roomCode })}>Let's weave!</Button>
                    : <p className="text-muted small mb-0">{onPhones ? `${leaderName} will start the first round.` : 'Listen to the TV!'}</p>}
            </Frame>
        );
    }

    // ===================== ROUND N, 3-2-1 =====================
    if (gameState === 'intro') {
        const isLast = room.round === room.totalRounds && room.totalRounds > 1;
        return (
            <Frame title={isLast ? 'Last round!' : `Round ${room.round} of ${room.totalRounds}`}>
                <p className="fw-bold mb-1">Get ready to weave...</p>
                {timeLeft !== null && <div key={timeLeft} className="ww-countdown">{timeLeft > 0 ? timeLeft : 'Go!'}</div>}
                <p className="small text-muted mb-0">A new {room.size} × {room.size} grid is coming.</p>
            </Frame>
        );
    }

    // ===================== WEAVING =====================
    if (gameState === 'playing' && room.grid) {
        const isOver = timeLeft === 0;
        const words = mine.round === room.round ? mine.words : [];
        const wordOf = (tiles) => tiles.map((i) => room.grid[i]).join('').toLowerCase();
        const send = (word, tiles = null) => {
            const clean = word.toLowerCase().replace(/[^a-z]/g, '');
            if (!clean) return;
            if (clean.length < MIN_LENGTH) return showFlash(tiles, false, `✗ ${REASONS.short}`);
            if (words.includes(clean)) return showFlash(tiles, false, `✗ ${REASONS.again}`);
            traced.current.set(clean, tiles);
            socket.emit('submit_word', { roomCode, word: clean, round: room.round });
            return undefined;
        };
        const current = wordOf(path);
        const ready = current.length >= MIN_LENGTH;
        const clock = (
            <span className="d-flex align-items-center gap-2">
                {onPhones && isLeader && (
                    <button type="button" className="ww-pause-btn" aria-label="Pause the game" onClick={() => socket.emit('set_paused', { roomCode, paused: true })}>⏸</button>
                )}
                {timeLeft !== null && <span className={`ww-clock ${timeLeft <= 10 ? 'is-low' : ''}`} role="timer">{clockText(timeLeft)}</span>}
            </span>
        );
        const newest = [...words].reverse();
        const potential = words.reduce((sum, w) => sum + (POINTS_TABLE.find(([n]) => n === Math.min(w.length, 8))?.[1] || 0), 0);
        return (
            <Frame title={`Round ${room.round} of ${room.totalRounds}`} right={clock} className="ww-phone">
                <div className="ww-wordbar">
                    <button type="button" className="ww-icon-btn is-clear" aria-label="Clear the letters" disabled={!path.length} onClick={() => setPath([])}>✕</button>
                    <div className={`ww-current ${current ? '' : 'is-empty'} ${ready ? 'is-ready' : ''}`} aria-live="polite">
                        {isOver ? "Time's up!" : current ? current.toUpperCase() : 'Slide or tap letters that touch'}
                    </div>
                    <button
                        type="button"
                        className="ww-icon-btn is-send"
                        disabled={!ready || isOver}
                        onClick={() => { send(current, path); setPath([]); }}
                    >
                        Send
                    </button>
                </div>
                <div className="ww-phone-grid">
                    <WordGrid
                        key={room.round}
                        letters={room.grid}
                        size={room.size}
                        path={path}
                        flash={flash}
                        interactive
                        disabled={isOver}
                        minLength={MIN_LENGTH}
                        onPathChange={setPath}
                        onSubmit={(tiles) => send(wordOf(tiles), tiles)}
                    />
                </div>
                <div className={`ww-feedback ${feedback ? (feedback.ok ? 'is-ok' : 'is-bad') : ''}`} aria-live="polite">
                    {feedback && <span key={feedback.id}>{feedback.text}</span>}
                </div>

                {isTyping ? (
                    <Form
                        className="ww-type"
                        onSubmit={(e) => {
                            e.preventDefault();
                            send(typed);
                            setTyped('');
                        }}
                    >
                        <Form.Control
                            autoFocus
                            value={typed}
                            onChange={(e) => setTyped(e.target.value.replace(/[^a-zA-Z]/g, '').slice(0, 25))}
                            placeholder="Type a word"
                            aria-label="Type a word"
                            autoCapitalize="characters"
                            autoComplete="off"
                            autoCorrect="off"
                            spellCheck={false}
                            disabled={isOver}
                        />
                        <Button type="submit" variant="success" className="fw-bold" disabled={isOver || typed.length < MIN_LENGTH}>Send</Button>
                        <Button variant="outline-secondary" onClick={() => setIsTyping(false)} aria-label="Stop typing">✕</Button>
                    </Form>
                ) : (
                    <Button variant="link" size="sm" className="ww-type-toggle" onClick={() => setIsTyping(true)}>⌨️ Rather type? Tap here</Button>
                )}

                <div className="ww-found-head">
                    <span>Your words: {words.length}</span>
                    {words.length > 0 && <span>up to {potential} pts</span>}
                </div>
                {words.length ? (
                    <div className="ww-chips">
                        {newest.map((w, i) => (
                            <span key={w} className={`ww-chip ${i === 0 ? 'is-new' : ''}`}>{w}</span>
                        ))}
                    </div>
                ) : <p className="small text-muted mb-0">The words you find go here. Nobody else sees them until time's up.</p>}
            </Frame>
        );
    }

    // ===================== THE ROUND'S RESULTS =====================
    if (gameState === 'round_results' && room.results) {
        const results = room.results;
        const myResult = results.players.find((p) => p.key === myKey);
        const myStanding = room.standings.find((s) => s.key === myKey);
        const nameOf = (key) => results.players.find((p) => p.key === key)?.name || 'someone';
        const others = (word) => results.shared.find((s) => s.word === word)?.by.filter((k) => k !== myKey).map(nameOf) || [];
        const bestBy = results.best ? results.players.find((p) => p.key === results.best.key) : null;
        return (
            <Frame title={`Round ${results.round} results`}>
                <div className="ww-score-line">
                    <div><strong>+{myResult?.points ?? 0}</strong><span>This round</span></div>
                    <div><strong>{myStanding?.score ?? 0}</strong><span>Total</span></div>
                    <div><strong>{myStanding ? placeText(myStanding.place) : '–'}</strong><span>Place</span></div>
                </div>
                {myResult?.words.length ? (
                    <>
                        <div className="ww-found-head"><span>Your words</span><span>{myResult.kept} kept · {myResult.words.length - myResult.kept} crossed out</span></div>
                        <div className="ww-chips mb-2">
                            {myResult.words.map((w) => (
                                <span key={w.word} className={`ww-chip ${w.cancelled ? 'is-cancelled' : 'is-kept'}`}>
                                    {w.word}
                                    {w.cancelled ? <span className="ww-chip-who">also {others(w.word).join(', ')}</span> : <sup>+{w.points}</sup>}
                                </span>
                            ))}
                        </div>
                    </>
                ) : <p className="small text-muted">No words for you this round.</p>}

                {results.best && (
                    <p className="small mb-2">
                        🏅 Best word: <strong>{results.best.word.toUpperCase()}</strong> by {bestBy?.key === myKey ? 'you!' : bestBy?.name} (+{results.best.points})
                    </p>
                )}
                {onPhones && <Standings room={room} myKey={myKey} roundPoints={results.players} />}
                {/* No TV to show everyone's words: on just phones, the crossed-out ones and who found them */}
                {onPhones && results.shared.length > 0 && (
                    <>
                        <div className="ww-found-head"><span>Crossed out</span><span>{plural(results.shared.length, 'word')}</span></div>
                        <div className="ww-chips mb-2">
                            {results.shared.map((s) => (
                                <span key={s.word} className="ww-chip is-cancelled">
                                    {s.word}<span className="ww-chip-who">{s.by.map((k) => (k === myKey ? 'you' : nameOf(k))).join(', ')}</span>
                                </span>
                            ))}
                        </div>
                    </>
                )}
                {results.missed.length > 0 && (
                    <>
                        <div className="ww-found-head"><span>Nobody found</span><span>{results.foundByAnyone} of {results.possible} found</span></div>
                        <div className="ww-chips mb-3">
                            {results.missed.slice(0, 6).map((m) => <span key={m.word} className="ww-chip is-missed">{m.word}<sup>{m.points}</sup></span>)}
                        </div>
                    </>
                )}
                {isLeader ? (
                    <Button variant="primary" className="w-100 fw-bold" onClick={() => socket.emit('next_round', { roomCode })}>
                        {room.isGameOver ? 'See the winners' : 'Next round'}{timeLeft !== null ? ` (${timeLeft}s)` : ''}
                    </Button>
                ) : (
                    <p className="small text-muted mb-0">{room.isGameOver ? 'The winners are coming' : 'Next round'}{timeLeft !== null ? ` in ${timeLeft}s` : ' soon'}{onPhones ? '' : '. Look at the TV!'}</p>
                )}
            </Frame>
        );
    }

    // ===================== FINAL =====================
    if (gameState === 'final') {
        const myStanding = room.standings.find((s) => s.key === myKey);
        const won = myStanding?.place === 1 && myStanding.score > 0;
        const best = room.bestOfGame;
        return (
            <Frame title="Game Over">
                <div className="ww-big">{won ? '🏆' : '🧶'}</div>
                <p className="fw-bold fs-5 mb-1">{won ? 'You win!' : myStanding ? `You came ${placeText(myStanding.place)}` : 'Thanks for watching!'}</p>
                {myStanding && <p className="small text-muted">{myStanding.score} points</p>}
                <Standings room={room} myKey={myKey} />
                {best && <p className="small">Best word of the game: <strong>{best.word.toUpperCase()}</strong> by {best.key === myKey ? 'you' : best.name}</p>}
                {onPhones && isLeader ? (
                    <>
                        <Button variant="primary" size="lg" className="w-100 fw-bold mb-2" onClick={() => socket.emit('playAgain', { roomCode })}>🔁 Play Again</Button>
                        <Button
                            variant="outline-secondary"
                            className="w-100 fw-bold"
                            onClick={() => {
                                socket.emit('endGame', { roomCode });
                                navigate('/home', { state: { toastMessage: 'Thanks for playing!' } });
                            }}
                        >
                            🏠 End the game
                        </Button>
                    </>
                ) : <p className="small text-muted mb-0">{onPhones ? `${leaderName} can start another game.` : 'Look at the TV!'}</p>}
            </Frame>
        );
    }

    return (
        <Frame title="Word Weave">
            <Spinner animation="border" variant="primary" />
        </Frame>
    );
}

function PointsTable() {
    return (
        <div className="ww-points" aria-label="Points for each word length">
            {POINTS_TABLE.map(([letters, points]) => (
                <span key={letters}>{letters}{letters === 8 ? '+' : ''} letters <b>{points}</b></span>
            ))}
        </div>
    );
}

/** Everyone's totals (and this round's points, on the results) */
function Standings({ room, myKey, roundPoints = null }) {
    const roundOf = (key) => roundPoints?.find((p) => p.key === key)?.points;
    return (
        <ol className="ww-standings">
            {room.standings.map((s) => (
                <li key={s.key} className={s.key === myKey ? 'is-me' : ''}>
                    <span className="ww-place">{placeText(s.place)}</span>
                    <Avatar id={s.avatar} name={s.name} size={28} />
                    <span className="ww-name">{s.name}{s.key === myKey ? ' (you)' : ''}</span>
                    {roundPoints && <span className="ww-round">+{roundOf(s.key) ?? 0}</span>}
                    <span className="ww-total">{s.score}</span>
                </li>
            ))}
        </ol>
    );
}

function Frame({ title, right, children, className = '' }) {
    return (
        <div className={`page-container ${className}`}>
            <Card className="main-card">
                <Card.Header className="main-card-header d-flex justify-content-between align-items-center">
                    <span>{title}</span>
                    {right}
                </Card.Header>
                <Card.Body className="text-center p-3">{children}</Card.Body>
            </Card>
        </div>
    );
}
