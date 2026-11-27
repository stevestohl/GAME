import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Alert, Spinner } from 'react-bootstrap';
import { wordWeaveSocket as socket } from '../../socket.js';
import { toDeviceTime } from '../../serverClock.js';

import useWakeLock from '../../hooks/useWakeLock.js';
import useRoomGone from '../../hooks/useRoomGone.js';
import ConnectionLost from '../Menu/ConnectionLost.jsx';
import useHideBrowserBar from '../../hooks/useHideBrowserBar.js';
import { useSetBackgroundTheme } from '../Menu/backgroundTheme.js';
import { speak, stopVoice, preloadVoice, unlockVoice, canPlaySound } from '../../voice.js';
import { startLobbyMusic, lobbyTrackFor } from '../CouchCast/lobbyMusic.js';
import { usePlayerSounds } from '../../playerSounds.js';
import { useTimerMusic } from '../../timerMusic.js';
import { useFinale, DrumrollOverlay, Fireworks, FinaleConfetti, FINALE_DRUMROLL_MS } from '../CouchCast/CouchCastFinale.jsx';

import CouchCastLobby from '../CouchCast/CouchCastLobby.jsx';
import CouchCastCasterControls, { CouchCastPausedOverlay } from '../CouchCast/CouchCastCasterControls.jsx';
import GameOverActions from '../Menu/GameOverActions.jsx';
import { RulesTV, IntroTV, PlayingTV, ResultsTV, FinalTV, finalLine } from './WordWeaveTV.jsx';
import WordWeavePlayer from './WordWeavePlayer.jsx';
import { rulesNarration, useCountdown } from './wordWeaveShared.js';
import '../../styles/wordweave.css';

/**
 * 🧶 Word Weave. One address, two jobs:
 *   role=caster -> the TV (this component): the grid, the clock and the reveal
 *   role=guest  -> a player's phone (WordWeavePlayer), on a TV game or a just-phones one
 */
export default function WordWeaveManager() {
    useWakeLock();
    const searchParams = new URLSearchParams(window.location.search);
    const isGuest = searchParams.get('role') === 'guest';
    useHideBrowserBar(!isGuest);
    const roomCode = (searchParams.get('room') || '').toUpperCase();
    const name = searchParams.get('name') || 'Caster';

    if (isGuest) {
        return (
            <div className="ww-root">
                <WordWeavePlayer roomCode={roomCode} playerName={name} />
                {roomCode && <div className="cc-room-code">Room <strong>{roomCode}</strong></div>}
            </div>
        );
    }
    return <WordWeaveTV roomCode={roomCode} casterName={name} />;
}

const lobbyTrack = lobbyTrackFor('wordweave');

// The narrator's lines: short, and the same words each game where possible (they're saved and reused)
const LINES = {
    tenLeft: 'Ten seconds left!',
    timesUp: "Time's up!",
    last: 'Last round!',
};
const roundLine = (room) => (room.round === room.totalRounds && room.totalRounds > 1 ? LINES.last : `Round ${room.round}!`);

function WordWeaveTV({ roomCode, casterName }) {
    const navigate = useNavigate();
    const [room, setRoom] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    useRoomGone(socket, roomCode, !!room);
    const gameState = room?.gameState;

    useSetBackgroundTheme('wordweave', true);
    usePlayerSounds(room?.roomCode, room?.players);

    // --- SOCKET LISTENERS ---
    useEffect(() => {
        const joinMyRoom = () => socket.emit('joinRoom', { roomCode, playerName: casterName });
        const handleRoomUpdate = (update) => { if (update?.roomCode === roomCode) setRoom(update); };
        const handleJoinError = (msg) => {
            setErrorMessage(msg);
            setTimeout(() => setErrorMessage(''), 5000);
        };
        socket.on('room_updated', handleRoomUpdate);
        socket.on('joinError', handleJoinError);
        if (roomCode) {
            socket.on('connect', joinMyRoom);
            if (socket.connected) joinMyRoom();
            else socket.connect();
        } else {
            setErrorMessage('No room code found in the URL!');
        }
        return () => {
            socket.off('connect', joinMyRoom);
            socket.off('room_updated', handleRoomUpdate);
            socket.off('joinError', handleJoinError);
        };
    }, [roomCode, casterName]);

    // ⏳ Music while the clock runs (with a hurry-up tick at the end)
    const isPaused = !!room?.isPaused;
    useTimerMusic(gameState === 'playing' && !isPaused, { endTime: toDeviceTime(room?.endTime), key: room?.round });

    // 🏆 The finale: a drum roll, then the winners
    const finalePhase = useFinale(gameState === 'final');

    // 🎙️ Voice-overs: one key per moment, so each is spoken exactly once
    const timeLeft = useCountdown(gameState === 'playing' ? room?.endTime : null);
    let voiceMoment = null;
    if (gameState === 'intro') voiceMoment = `round-${room.round}`;
    else if (gameState === 'playing' && timeLeft !== null && timeLeft <= 10 && timeLeft > 0 && room.roundSeconds > 30) voiceMoment = `ten-${room.round}`;
    else if (gameState === 'round_results') voiceMoment = `up-${room.round}`;
    else if (gameState === 'final') voiceMoment = 'final';
    useEffect(() => {
        if (!voiceMoment || !room || isPaused) return undefined;
        const code = room.roomCode;
        if (voiceMoment.startsWith('round-')) speak(roundLine(room), code);
        else if (voiceMoment.startsWith('ten-')) speak(LINES.tenLeft, code);
        else if (voiceMoment.startsWith('up-')) speak(LINES.timesUp, code);
        else if (voiceMoment === 'final') {
            stopVoice();
            const line = finalLine(room);
            const timer = setTimeout(() => speak(line, code), FINALE_DRUMROLL_MS);
            return () => clearTimeout(timer);
        }
        return undefined;
    }, [voiceMoment]);

    // Fetch the rules and round lines while everyone is still joining, so they start instantly
    const lobbyRoomCode = room?.roomCode;
    const totalRounds = room?.totalRounds;
    useEffect(() => {
        if (!lobbyRoomCode || !totalRounds) return;
        const rounds = Array.from({ length: Math.min(totalRounds - 1, 5) }, (_, i) => `Round ${i + 1}!`);
        preloadVoice([...rulesNarration({ totalRounds }), ...Object.values(LINES), ...rounds], lobbyRoomCode);
    }, [lobbyRoomCode, totalRounds]);

    // 🔇 After a page refresh the browser mutes us until someone taps the screen
    const [isSoundLocked, setIsSoundLocked] = useState(false);
    useEffect(() => {
        let isCurrent = true;
        canPlaySound().then((allowed) => { if (isCurrent) setIsSoundLocked(!allowed); });
        return () => { isCurrent = false; };
    }, []);
    const handleTurnSoundOn = () => {
        unlockVoice();
        if (gameState === 'lobby') startLobbyMusic(lobbyTrack);
        setIsSoundLocked(false);
    };

    const handlePlayAgain = () => {
        startLobbyMusic(lobbyTrack);
        socket.emit('playAgain', { roomCode: room?.roomCode });
    };
    const handleGoHome = () => {
        socket.emit('endGame', { roomCode: room?.roomCode });
        navigate('/home', { state: { toastMessage: 'Thanks for playing!' } });
    };

    // ⏸️ The caster can pause a running game
    const canPause = !!room && ['intro', 'playing', 'round_results'].includes(gameState);
    const handleTogglePause = () => socket.emit('set_paused', { roomCode: room?.roomCode, paused: !isPaused });
    useEffect(() => { if (isPaused) stopVoice(); }, [isPaused]);
    useEffect(() => stopVoice, []);

    const renderGamePhase = () => {
        if (!room) {
            return (
                <div className="fullscreen-gameplay-container justify-content-center">
                    <Spinner animation="border" variant="light" />
                    <h3 className="mt-3 text-white">Spinning the yarn...</h3>
                </div>
            );
        }
        if (gameState === 'lobby') {
            return <CouchCastLobby title="Word Weave Room Created" roomCode={room.roomCode} players={Object.values(room.players)} musicTrack={lobbyTrack} scoreFor={(player) => room.snake?.scores?.[player.name]?.eaten} />;
        }
        if (gameState === 'rules') return <RulesTV room={room} />;
        if (gameState === 'intro') return <IntroTV room={room} />;
        if (gameState === 'playing') return <PlayingTV room={room} />;
        if (gameState === 'round_results') return <ResultsTV room={room} />;
        return (
            <>
                <FinalTV room={room} isRevealed={finalePhase === 'reveal'} endActions={finalePhase === 'reveal' ? <GameOverActions onPlayAgain={handlePlayAgain} onGoHome={handleGoHome} /> : null} />
                {finalePhase === 'drumroll' && <DrumrollOverlay />}
                {finalePhase === 'reveal' && <><Fireworks /><FinaleConfetti /></>}
            </>
        );
    };

    return (
        <Container fluid className="p-0 ww-root" style={{ minHeight: '100vh' }}>
            <ConnectionLost socket={socket} />
            {errorMessage && (
                <Alert variant="danger" className="text-center m-2 position-absolute w-100" style={{ zIndex: 10002 }}>
                    {errorMessage}
                </Alert>
            )}
            {renderGamePhase()}
            {isPaused && <CouchCastPausedOverlay isCaster />}
            {room && <CouchCastCasterControls canPause={canPause || isPaused} isPaused={isPaused} onTogglePause={handleTogglePause} />}
            {isSoundLocked && (
                <button type="button" className="cc-sound-button" onClick={handleTurnSoundOn}>
                    🔇 Tap to turn sound back on
                </button>
            )}
            {room?.roomCode && <div className="cc-room-code">Room <strong>{room.roomCode}</strong></div>}
        </Container>
    );
}
