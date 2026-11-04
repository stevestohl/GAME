import React, { useState, useEffect } from 'react';
import { Card, Button, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { ROOM_NOT_FOUND, joinAgain } from '../../hooks/useRoomGone.js';
import { triviaCastSocket as socket } from '../../socket';
import { useSetBackgroundTheme, triviaCastTheme } from '../Menu/backgroundTheme.js';
import { playChime } from '../../chime.js';
import { getMyAvatar } from '../../avatars.jsx';
import AvatarAttack from './AvatarAttack.jsx';
import CouchCastScoreboard, { preloadBurglar } from '../CouchCast/CouchCastScoreboard.jsx';
import CouchCastRoundIntro from '../CouchCast/CouchCastRoundIntro.jsx';
import { roundKicker } from './TriviaCastScreensTV.jsx';
import { CouchCastPausedOverlay } from '../CouchCast/CouchCastCasterControls.jsx';

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

/**
 * 📱 A player's phone in Trivia Cast: the buzzer.
 * The question lives on the TV; the phone shows the answer buttons and how you did.
 */
export default function TriviaCastPlayer({ roomCode, playerName }) {
    const navigate = useNavigate();
    const [room, setRoom] = useState(null);
    const [error, setError] = useState('');
    const [myPick, setMyPick] = useState(null);
    const [timeLeft, setTimeLeft] = useState(null);

    // 🎨 Background follows the question deck
    useSetBackgroundTheme(triviaCastTheme(room?.expansion));
    useEffect(preloadBurglar, []);

    useEffect(() => {
        // A saved ID lets this phone get its seat back after a refresh or a dropped connection
        let playerId = localStorage.getItem('templePlayerId');
        if (!playerId) {
            playerId = 'player_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('templePlayerId', playerId);
        }

        const joinMyRoom = () => socket.emit('joinRoom', { roomCode, playerName, playerId, avatar: getMyAvatar() });
        const handleRoomUpdate = (update) => { if (update?.roomCode === roomCode) setRoom(update); };
        const handleJoinError = (message) => {
            if (message === ROOM_NOT_FOUND) {
                navigate(...joinAgain(roomCode));
                return;
            }
            setError(message);
        };
        const handleRoomClosed = ({ message }) => {
            navigate('/home', { state: { toastMessage: message || 'That game has ended.' } });
        };

        socket.on('connect', joinMyRoom);
        socket.on('room_updated', handleRoomUpdate);
        socket.on('joinError', handleJoinError);
        socket.on('room_closed', handleRoomClosed);

        if (socket.connected) joinMyRoom();
        else socket.connect();

        return () => {
            socket.off('connect', joinMyRoom);
            socket.off('room_updated', handleRoomUpdate);
            socket.off('joinError', handleJoinError);
            socket.off('room_closed', handleRoomClosed);
        };
    }, [roomCode, playerName]);

    const me = room?.players?.[socket.id];
    const gameState = room?.gameState;
    const round = room?.currentRound;

    // New question: clear the last pick and chime so nobody misses it
    useEffect(() => {
        if (gameState === 'question') {
            setMyPick(null);
            playChime();
        }
    }, [gameState, round]);

    // Countdown to the server's deadline
    useEffect(() => {
        if (!room?.endTime) {
            setTimeLeft(null);
            return;
        }
        const update = () => setTimeLeft(Math.max(0, Math.ceil((room.endTime - Date.now()) / 1000)));
        update();
        const timer = setInterval(update, 250);
        return () => clearInterval(timer);
    }, [room?.endTime]);

    const handleAnswer = (option) => {
        if (myPick) return; // one answer per question
        setMyPick(option);
        socket.emit('submit_answer', { roomCode, answer: option });
    };

    const frame = (title, body) => (
        <div className="page-container">
            <Card className="main-card">
                <Card.Header className="main-card-header">{title}</Card.Header>
                <Card.Body className="p-3">{body}</Card.Body>
            </Card>
        </div>
    );

    // ---------- Couldn't join ----------
    if (error) {
        return frame('Trivia Cast', (
            <>
                <Alert variant="warning" className="fw-bold">{error}</Alert>
                <Button variant="primary" className="w-100 fw-bold" onClick={() => navigate(`/join?room=${roomCode}`)}>
                    Back to Join
                </Button>
            </>
        ));
    }

    // ---------- Connecting ----------
    if (!room || !me) {
        return frame('Trivia Cast', (
            <div className="py-4">
                <Spinner animation="border" variant="primary" />
                <h5 className="mt-3 text-muted">Connecting to room {roomCode}...</h5>
            </div>
        ));
    }

    const leader = room.players[room.hostId];

    // ⏸️ The caster paused the game
    if (room.isPaused) return <CouchCastPausedOverlay />;

    switch (gameState) {
        case 'lobby':
            return (
                <>
                    {/* 👑 Pinned under the nav bar, so the leader can't scroll away from it, and well away from the game's controls */}
                    {me.isPlayerHost && (
                        <div className="tc-leader-bar">
                            <span className="fw-bold text-dark small">👑 Room Leader</span>
                            <Button variant="success" className="fw-bold flex-grow-1" onClick={() => socket.emit('startGame', { roomCode })}>
                                Everyone's in!
                            </Button>
                        </div>
                    )}
                    {frame("You're In!", (
                        <>
                            {!me.isPlayerHost && (
                                <div className="p-2 border border-dashed rounded bg-light text-muted small">
                                    Waiting for <strong>{leader?.name || 'the room leader'}</strong> to start the game...
                                </div>
                            )}
                            {/* 👾 Something to do while everyone joins */}
                            <AvatarAttack socket={socket} roomCode={roomCode} room={room} />
                        </>
                    ))}
                </>
            );

        case 'rules':
            return frame('Trivia Cast', (
                <div className="py-3">
                    <h3 className="text-primary fw-bold mb-2">Get Ready!</h3>
                    <p className="text-muted mb-3">Keep your eyes on the TV to learn how to play.</p>
                    <Spinner animation="grow" variant="warning" />
                </div>
            ));

        case 'round_intro':
            return <CouchCastRoundIntro round={room.currentRound} totalRounds={room.totalRounds} isPhone kicker={roundKicker(room.currentRound, room.totalRounds)} />;

        case 'question':
            if (me.hasAnswered || myPick) {
                return frame(`Question ${room.currentRound} of ${room.totalRounds}`, (
                    <div className="py-3">
                        <h1 className="display-3 mb-2">🔒</h1>
                        <h3 className="fw-bold mb-2">Answer Locked!</h3>
                        {myPick && <p className="fs-5 fw-semibold text-primary mb-2">{myPick}</p>}
                        <p className="text-muted mb-0">Waiting for everyone else...</p>
                    </div>
                ));
            }
            return frame(`Question ${room.currentRound} of ${room.totalRounds}`, (
                <>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="fw-bold text-muted text-uppercase small">Tap your answer:</span>
                        <span className={`fw-bold fs-5 ${timeLeft !== null && timeLeft <= 5 ? 'text-danger' : 'text-info'}`}>⏱️ {timeLeft ?? ''}s</span>
                    </div>
                    <div className="fw-bold text-dark text-start mb-3">{room.question?.text}</div>
                    <div className="d-flex flex-column gap-2">
                        {(room.question?.options || []).map((option, i) => (
                            <button key={option} type="button" className={`tc-answer-btn tc-answer-${i % 4}`} onClick={() => handleAnswer(option)}>
                                <span className="tc-answer-letter">{LETTERS[i]}</span>
                                <span>{option}</span>
                            </button>
                        ))}
                    </div>
                </>
            ));

        case 'reveal':
            return frame(`Question ${room.currentRound} of ${room.totalRounds}`, (
                <div className="py-2">
                    {me.lastCorrect ? (
                        <>
                            <h1 className="display-3 mb-2">✅</h1>
                            <h3 className="fw-bold text-success mb-1">Correct!</h3>
                            <p className="fs-4 fw-bold text-success mb-2">+{me.lastPoints} points</p>
                        </>
                    ) : (
                        <>
                            <h1 className="display-3 mb-2">{me.currentAnswer ? '❌' : '⏰'}</h1>
                            <h3 className="fw-bold text-danger mb-2">{me.currentAnswer ? 'Not quite!' : "Time's up!"}</h3>
                        </>
                    )}
                    <div className="p-2 bg-light rounded border">
                        <div className="small text-muted text-uppercase fw-bold">The answer</div>
                        <div className="fw-bold text-dark fs-5">{room.correctAnswer}</div>
                    </div>
                </div>
            ));

        case 'scoreboard': {
            return <CouchCastScoreboard playerData={me} players={Object.values(room.players)} isGameOver={room.isGameOver} expansion={room.expansion} nextLabel="Next question coming up..." />;
        }

        default:
            return frame('Trivia Cast', <Spinner animation="grow" variant="warning" />);
    }
}
