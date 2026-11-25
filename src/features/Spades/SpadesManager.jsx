import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Alert, Spinner } from 'react-bootstrap';
import { spadesSocket as socket } from '../../socket.js';

import useWakeLock from '../../hooks/useWakeLock.js';
import useRoomGone from '../../hooks/useRoomGone.js';
import ConnectionLost from '../Menu/ConnectionLost.jsx';
import useHideBrowserBar from '../../hooks/useHideBrowserBar.js';
import { useSetBackgroundTheme } from '../Menu/backgroundTheme.js';
import { speak, stopVoice, preloadVoice, unlockVoice, canPlaySound } from '../../voice.js';
import { startLobbyMusic, lobbyTrackFor } from '../CouchCast/lobbyMusic.js';
import { usePlayerSounds } from '../../playerSounds.js';
import { getAudioContext } from '../../chime.js';
import { useFinale, DrumrollOverlay, Fireworks, FinaleConfetti, FINALE_DRUMROLL_MS } from '../CouchCast/CouchCastFinale.jsx';

import CouchCastLobby from '../CouchCast/CouchCastLobby.jsx';
import CouchCastCasterControls, { CouchCastPausedOverlay } from '../CouchCast/CouchCastCasterControls.jsx';
import GameOverActions from '../Menu/GameOverActions.jsx';
import { TopBar, SpadesTable, HandResults, SpadesRulesTV, SpadesFinalTV, TEAMS, seatName, rulesNarration } from './SpadesTable.jsx';
import SpadesPlayer from './SpadesPlayer.jsx';
import '../../styles/spades.css';

/**
 * ♠️ Spades. One address, two jobs:
 *   role=caster -> the TV's table (this component)
 *   role=guest  -> a player's hand, on their phone (SpadesPlayer)
 */
export default function SpadesManager() {
    useWakeLock();
    useHideBrowserBar(new URLSearchParams(window.location.search).get('role') !== 'guest');
    const searchParams = new URLSearchParams(window.location.search);
    const roomCode = (searchParams.get('room') || '').toUpperCase();
    const name = searchParams.get('name') || 'Caster';

    if (searchParams.get('role') === 'guest') {
        return (
            <>
                <SpadesPlayer roomCode={roomCode} playerName={name} />
                {roomCode && <div className="cc-room-code">Room <strong>{roomCode}</strong></div>}
            </>
        );
    }
    return <SpadesTV roomCode={roomCode} casterName={name} />;
}

const lobbyTrack = lobbyTrackFor('spades');

// 🃏 A card hitting the felt: a short, soft "thwip", made in the browser
const playCardSound = () => {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    const length = Math.floor(ctx.sampleRate * 0.07);
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / length) ** 2;
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 2200;
    const gain = ctx.createGain();
    gain.gain.value = 0.35;
    noise.connect(filter).connect(gain).connect(ctx.destination);
    noise.start();
};

// The narrator's lines: short, and the same words each game where possible (they're saved and reused)
const LINES = {
    bid: 'Time to bid!',
    broken: 'Spades are broken!',
};
const resultLine = (room) => {
    const lines = [];
    room.hand.results.forEach((r) => {
        const team = `${TEAMS[r.team].name} team`;
        if (r.made === true) lines.push(`${team} made it!`);
        else if (r.made === false) lines.push(`${team} got set!`);
        r.nils.forEach((n) => lines.push(n.made ? `${seatName(room, n.seat)}'s nil worked!` : `${seatName(room, n.seat)}'s nil failed!`));
        if (r.bagPenalty) lines.push(`${team} piled up ten bags!`);
    });
    return lines;
};

function SpadesTV({ roomCode, casterName }) {
    const navigate = useNavigate();
    const [room, setRoom] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    useRoomGone(socket, roomCode, !!room);
    const gameState = room?.gameState;
    const hand = room?.hand;

    useSetBackgroundTheme('spades', true);
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

    // 🃏 A soft sound each time a card lands
    const cardsOnTable = hand ? `${room.handNumber}-${hand.trick.length}-${hand.cardsLeft.join()}` : null;
    useEffect(() => {
        if (hand && gameState === 'playing' && hand.trick.length) playCardSound();
    }, [cardsOnTable]);

    // 🏆 The finale: a drum roll, then the winning team
    const isFinal = gameState === 'final';
    const finalePhase = useFinale(isFinal);

    // 🎙️ Voice-overs: one key per moment, so each is spoken exactly once
    let voiceMoment = null;
    if (gameState === 'bidding' && hand?.turn !== null) voiceMoment = `bid-${room.handNumber}`;
    else if (gameState === 'playing' && hand?.spadesBroken) voiceMoment = `broken-${room.handNumber}`;
    else if (gameState === 'hand_results') voiceMoment = `results-${room.handNumber}`;
    else if (gameState === 'final') voiceMoment = 'final';
    useEffect(() => {
        if (!voiceMoment || !room) return undefined;
        const code = room.roomCode;
        if (voiceMoment.startsWith('bid-')) speak(LINES.bid, code);
        else if (voiceMoment.startsWith('broken-')) speak(LINES.broken, code);
        else if (voiceMoment.startsWith('results-')) speak(resultLine(room), code);
        else if (voiceMoment === 'final') {
            stopVoice();
            const team = room.winner ?? 0;
            const line = `Team ${TEAMS[team].name} wins! Well played, ${seatName(room, team)} and ${seatName(room, team + 2)}!`;
            const timer = setTimeout(() => speak(line, code), FINALE_DRUMROLL_MS);
            return () => clearTimeout(timer);
        }
        return undefined;
    }, [voiceMoment]);

    // Fetch the rules narration while everyone is still joining, so it starts instantly
    const lobbyRoomCode = room?.roomCode;
    const target = room?.target;
    useEffect(() => {
        if (lobbyRoomCode) preloadVoice([...rulesNarration(target), ...Object.values(LINES)], lobbyRoomCode);
    }, [lobbyRoomCode, target]);

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
    const isPaused = !!room?.isPaused;
    const canPause = !!room && ['bidding', 'playing', 'hand_results'].includes(gameState);
    const handleTogglePause = () => socket.emit('set_paused', { roomCode: room?.roomCode, paused: !isPaused });
    useEffect(() => { if (isPaused) stopVoice(); }, [isPaused]);
    useEffect(() => stopVoice, []);

    const renderGamePhase = () => {
        if (!room) {
            return (
                <div className="fullscreen-gameplay-container justify-content-center">
                    <Spinner animation="border" variant="light" />
                    <h3 className="mt-3 text-white">Shuffling the deck...</h3>
                </div>
            );
        }
        if (gameState === 'lobby') {
            return <CouchCastLobby title="Spades Room Created" roomCode={room.roomCode} players={Object.values(room.players)} musicTrack={lobbyTrack} scoreFor={(player) => room.snake?.scores?.[player.name]?.eaten} />;
        }
        if (gameState === 'rules') return <SpadesRulesTV room={room} />;
        if (gameState === 'final') {
            return (
                <>
                    <SpadesFinalTV room={room} isRevealed={finalePhase === 'reveal'} endActions={finalePhase === 'reveal' ? <GameOverActions onPlayAgain={handlePlayAgain} onGoHome={handleGoHome} /> : null} />
                    {finalePhase === 'drumroll' && <DrumrollOverlay />}
                    {finalePhase === 'reveal' && <><Fireworks /><FinaleConfetti /></>}
                </>
            );
        }
        return (
            <div className="fullscreen-gameplay-container sp-tv">
                <TopBar room={room} />
                <SpadesTable room={room} />
                {gameState === 'hand_results' && <HandResults room={room} />}
            </div>
        );
    };

    return (
        <Container fluid className="p-0" style={{ minHeight: '100vh' }}>
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
