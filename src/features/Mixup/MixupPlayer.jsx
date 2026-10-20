import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Spinner, Alert, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { mixupSocket as socket } from '../../socket.js';
import { playChime } from '../../chime.js';
import { useSetBackgroundTheme, mixupTheme } from '../Menu/backgroundTheme.js';
import { DrawingPad, DrawingView } from './DrawingCanvas.jsx';
import { MemeImage, ROUND_LOOKS, useCountdown } from './MixupScreensTV.jsx';
import '../../styles/mixup.css';
import { getMyAvatar } from '../../avatars.jsx';

/**
 * 📱 Temple Mix Up on a player's phone: write captions, vote, draw or guess, answer trivia.
 * The TV shows everything big; the phone is the controller.
 */
export default function MixupPlayer({ roomCode, playerName }) {
    const navigate = useNavigate();
    const [room, setRoom] = useState(null);
    const [mine, setMine] = useState({});          // this phone's private bits (my caption id, my word to draw)
    const [error, setError] = useState('');
    const [caption, setCaption] = useState('');
    const [guess, setGuess] = useState('');
    const [guessFeedback, setGuessFeedback] = useState(null);   // 'wrong' | 'right'
    const [myGuesses, setMyGuesses] = useState([]);
    const lastRound = useRef(null);

    useSetBackgroundTheme(mixupTheme(room?.round?.type));

    // --- Join, and stay joined through refreshes and network blips ---
    useEffect(() => {
        let playerId = localStorage.getItem('templePlayerId');
        if (!playerId) {
            playerId = 'player_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('templePlayerId', playerId);
        }
        const joinMyRoom = () => socket.emit('joinRoom', { roomCode, playerName, playerId, avatar: getMyAvatar() });
        const handleRoom = (update) => { if (update?.roomCode === roomCode) setRoom(update); };
        const handleMyState = (state) => setMine((prev) => ({ ...prev, ...state }));
        const handleJoinError = (msg) => setError(msg);
        const handleClosed = ({ message } = {}) => navigate('/home', { state: { toastMessage: message || 'That game has ended.' } });
        const handleGuessResult = ({ correct }) => {
            setGuessFeedback(correct ? 'right' : 'wrong');
            if (correct) playChime();
        };

        socket.on('room_updated', handleRoom);
        socket.on('my_state', handleMyState);
        socket.on('joinError', handleJoinError);
        socket.on('room_closed', handleClosed);
        socket.on('guess_result', handleGuessResult);
        socket.on('connect', joinMyRoom);
        if (socket.connected) joinMyRoom();
        else socket.connect();

        return () => {
            socket.off('room_updated', handleRoom);
            socket.off('my_state', handleMyState);
            socket.off('joinError', handleJoinError);
            socket.off('room_closed', handleClosed);
            socket.off('guess_result', handleGuessResult);
            socket.off('connect', joinMyRoom);
        };
    }, [roomCode, playerName]);

    // A new round: clear the boxes
    const roundKey = room ? `${room.currentRound}-${room.round?.type}` : null;
    useEffect(() => {
        if (!roundKey || roundKey === lastRound.current) return;
        lastRound.current = roundKey;
        setCaption('');
        setGuess('');
        setGuessFeedback(null);
        setMyGuesses([]);
        setMine({});
    }, [roundKey]);

    const timeLeft = useCountdown(room?.endTime);

    if (error && !room) {
        return (
            <Frame title="Temple Mix Up">
                <Alert variant="danger">{error}</Alert>
                <Button variant="primary" className="w-100" onClick={() => navigate('/join')}>Back to Join</Button>
            </Frame>
        );
    }
    if (!room) {
        return (
            <Frame title="Temple Mix Up">
                <Spinner animation="border" variant="primary" />
                <p className="text-muted mt-2 mb-0">Joining room {roomCode}...</p>
            </Frame>
        );
    }

    const me = Object.values(room.players).find((p) => p.id === socket.id) || {};
    const round = room.round;
    const isLeader = room.hostId === socket.id;
    const players = Object.values(room.players).filter((p) => !p.isCaster && p.isConnected);
    const roundTitle = round ? `Round ${room.currentRound} of ${room.totalRounds}` : 'Temple Mix Up';
    const clock = timeLeft !== null && <span className={`mx-phone-clock ${timeLeft <= 10 ? 'low' : ''}`}>⏱️ {timeLeft}s</span>;

    switch (room.gameState) {
        // ===================== LOBBY / RULES =====================
        case 'lobby':
            return (
                <Frame title="You're In!">
                    <p className="text-muted">Look up at the TV. {players.length} player{players.length === 1 ? '' : 's'} so far.</p>
                    {error && <Alert variant="warning" className="py-2">{error}</Alert>}
                    {isLeader ? (
                        <div className="p-3 border border-warning rounded bg-white shadow-sm">
                            <p className="fw-bold text-dark mb-3">👑 You are the Room Leader</p>
                            <Button variant="primary" size="lg" className="w-100 fw-bold py-3" onClick={() => { setError(''); socket.emit('startGame', { roomCode }); }}>
                                All in!
                            </Button>
                            {players.length < room.minPlayers && <p className="small text-muted mt-2 mb-0">You need at least {room.minPlayers} players.</p>}
                        </div>
                    ) : (
                        <div className="p-3 border rounded bg-light text-muted">
                            Waiting for <strong>{players.find((p) => p.id === room.hostId)?.name || 'the leader'}</strong> to start the game...
                        </div>
                    )}
                </Frame>
            );
        case 'rules':
            return (
                <Frame title="How to Play">
                    <div className="mx-phone-rules text-start">
                        {['meme', 'draw', 'trivia'].map((type) => (
                            <div key={type} className="mb-2"><span className="me-2">{ROUND_LOOKS[type].icon}</span><strong>{ROUND_LOOKS[type].title}</strong> {ROUND_LOOKS[type].blurb}</div>
                        ))}
                    </div>
                    <p className="text-muted small mb-0 mt-2">Listen to the TV. The game starts in a moment!</p>
                </Frame>
            );

        // ===================== A ROUND'S TITLE CARD =====================
        case 'intro': {
            const look = ROUND_LOOKS[round.type];
            const amDrawing = round.type === 'draw' && round.drawerId === socket.id;
            return (
                <Frame title={roundTitle}>
                    <div className="mx-phone-intro-icon">{look.icon}</div>
                    <h2 className="fw-bold">{look.title}</h2>
                    <p className="text-muted mb-0">
                        {round.type === 'draw'
                            ? (amDrawing ? "🎨 You're drawing! Get ready..." : <><strong>{round.drawerName}</strong> is drawing. Get ready to guess!</>)
                            : look.blurb}
                    </p>
                </Frame>
            );
        }

        // ===================== MEMES =====================
        case 'meme_write':
            if (me.hasSubmitted) return <Waiting title={roundTitle} icon="✅" text="Caption in! Waiting for everyone else..." />;
            return (
                <Frame title={roundTitle} right={clock}>
                    <MemeImage meme={round.meme} className="mx-meme-small mb-3" />
                    <Form onSubmit={(e) => { e.preventDefault(); if (caption.trim()) socket.emit('submit_caption', { roomCode, caption }); }}>
                        <Form.Control
                            as="textarea"
                            rows={2}
                            maxLength={120}
                            value={caption}
                            onChange={(e) => setCaption(e.target.value)}
                            placeholder="Write the funniest caption..."
                            className="fs-5 fw-bold mb-2"
                            aria-label="Your caption"
                        />
                        <Button type="submit" variant="success" size="lg" className="w-100 fw-bold" disabled={!caption.trim()}>
                            Send caption
                        </Button>
                    </Form>
                </Frame>
            );
        case 'meme_vote': {
            const choices = (round.captions || []).filter((c) => c.id !== mine.myCaptionId);
            if (me.hasVoted) return <Waiting title={roundTitle} icon="🗳️" text="Vote in! Waiting for everyone else..." />;
            if (!choices.length) return <Waiting title={roundTitle} icon="🍿" text="Nothing to vote on this time. Watch the TV!" />;
            return (
                <Frame title={roundTitle} right={clock}>
                    <h5 className="fw-bold mb-1">Which caption is funniest?</h5>
                    <p className="small text-muted mb-3">Tap one. Yours isn't on the list.</p>
                    <div className="d-flex flex-column gap-2">
                        {choices.map((c) => (
                            <Button key={c.id} variant="outline-primary" className="text-start p-3 text-wrap fw-bold bg-white text-dark cc-tap-option" onClick={() => socket.emit('submit_vote', { roomCode, captionId: c.id })}>
                                {c.text}
                            </Button>
                        ))}
                    </div>
                </Frame>
            );
        }
        case 'meme_results': {
            const winners = (round.captions || []).filter((c) => (round.winnerIds || []).includes(c.id));
            const iWon = winners.some((c) => c.playerId === socket.id);
            return (
                <Frame title={roundTitle}>
                    <div className="mx-phone-intro-icon">{iWon ? '🏆' : winners.length ? '😂' : '🦗'}</div>
                    <h3 className="fw-bold">
                        {iWon ? 'Your caption won! +100' : winners.length ? `${winners.map((w) => w.name).join(' & ')} ${winners.length > 1 ? 'tie!' : 'wins!'}` : 'No captions this time'}
                    </h3>
                    {winners[0] && <MemeImage meme={round.meme} caption={winners[0].text} className="mx-meme-small mt-2" />}
                </Frame>
            );
        }

        // ===================== PICTIONARY =====================
        case 'draw': {
            if (round.drawerId === socket.id) {
                return (
                    <Frame title="🎨 You're drawing!" right={clock}>
                        <div className="mx-draw-word">Draw: <strong>{mine.drawWord || '...'}</strong></div>
                        <p className="small text-muted mb-2">No letters or numbers! Everyone's guessing on their phones.</p>
                        <DrawingPad roomCode={roomCode} />
                    </Frame>
                );
            }
            const sendGuess = (e) => {
                e.preventDefault();
                const text = guess.trim();
                if (!text) return;
                socket.emit('submit_guess', { roomCode, guess: text });
                setMyGuesses((prev) => [text, ...prev].slice(0, 5));
                setGuess('');
            };
            return (
                <Frame title={`${round.drawerName} is drawing`} right={clock}>
                    <DrawingView roomCode={roomCode} className="mx-canvas-small mb-2" />
                    <Form onSubmit={sendGuess} className="d-flex gap-2">
                        <Form.Control
                            value={guess}
                            onChange={(e) => { setGuess(e.target.value); setGuessFeedback(null); }}
                            placeholder="Type a guess..."
                            maxLength={40}
                            autoComplete="off"
                            className="fs-5 fw-bold"
                            aria-label="Your guess"
                        />
                        <Button type="submit" variant="success" className="fw-bold px-3" disabled={!guess.trim()}>Guess</Button>
                    </Form>
                    {guessFeedback === 'wrong' && <div className="mx-guess-nope mt-2">❌ Nope! Keep guessing.</div>}
                    {myGuesses.length > 0 && <div className="small text-muted mt-1">Tried: {myGuesses.join(', ')}</div>}
                </Frame>
            );
        }
        case 'draw_results': {
            const iGuessed = round.guessedBy && round.guessedBy === me.name;
            const iDrew = round.drawerId === socket.id;
            return (
                <Frame title={roundTitle}>
                    <div className="mx-phone-intro-icon">{iGuessed ? '🎯' : iDrew && round.guessedBy ? '🎨' : round.guessedBy ? '✏️' : '⏰'}</div>
                    <h3 className="fw-bold">
                        {iGuessed ? 'You got it! +100' : iDrew && round.guessedBy ? `${round.guessedBy} guessed your drawing! +50` : round.guessedBy ? `${round.guessedBy} got it!` : "Time's up!"}
                    </h3>
                    <p className="fs-5 mb-0">It was <strong>{round.word}</strong>.</p>
                </Frame>
            );
        }

        // ===================== TRIVIA =====================
        case 'trivia':
            if (me.hasSubmitted) return <Waiting title={roundTitle} icon="🔒" text="Answer locked in! Waiting for everyone else..." />;
            return (
                <Frame title={roundTitle} right={clock}>
                    <h5 className="fw-bold mb-3 lh-base">{round.question.text}</h5>
                    <div className="d-flex flex-column gap-2">
                        {round.question.options.map((option, i) => (
                            <Button key={option} variant="outline-primary" className="text-start p-3 text-wrap fw-bold bg-white text-dark cc-tap-option" onClick={() => socket.emit('submit_answer', { roomCode, option })}>
                                <span className="me-2 text-primary">{String.fromCharCode(65 + i)}.</span>{option}
                            </Button>
                        ))}
                    </div>
                </Frame>
            );
        case 'trivia_results':
            return (
                <Frame title={roundTitle}>
                    <div className="mx-phone-intro-icon">{me.lastCorrect ? '🎉' : '😬'}</div>
                    <h3 className="fw-bold">{me.lastCorrect ? 'Correct! +100' : 'Not this time'}</h3>
                    <p className="fs-5 mb-0">The answer: <strong>{round.correctAnswer}</strong></p>
                </Frame>
            );

        // ===================== SCORES =====================
        case 'scoreboard': {
            const ranked = [...players].sort((a, b) => (b.score || 0) - (a.score || 0));
            const place = ranked.findIndex((p) => p.id === socket.id) + 1;
            return (
                <Frame title={room.isGameOver ? 'Final Scores' : roundTitle}>
                    <div className="mx-phone-intro-icon">{room.isGameOver ? (place === 1 ? '👑' : '🎉') : '📊'}</div>
                    <h3 className="fw-bold mb-1">{me.score || 0} points</h3>
                    <p className="text-muted">{place ? `You're #${place} of ${ranked.length}` : ''}</p>
                    {room.isGameOver && (
                        <Button variant="outline-secondary" className="w-100 fw-bold" onClick={() => navigate('/home')}>Back to Home</Button>
                    )}
                </Frame>
            );
        }
        default:
            return <Frame title="Temple Mix Up"><Spinner animation="border" /></Frame>;
    }
}

function Frame({ title, right, children }) {
    return (
        <div className="page-container">
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

function Waiting({ title, icon, text }) {
    return (
        <Frame title={title}>
            <div className="mx-phone-intro-icon">{icon}</div>
            <p className="fs-5 fw-bold mb-0">{text}</p>
        </Frame>
    );
}
