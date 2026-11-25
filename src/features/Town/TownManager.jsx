import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Alert, Spinner } from 'react-bootstrap';
import { townSocket as socket } from '../../socket.js';

import useWakeLock from '../../hooks/useWakeLock.js';
import useRoomGone from '../../hooks/useRoomGone.js';
import ConnectionLost from '../Menu/ConnectionLost.jsx';
import useHideBrowserBar from '../../hooks/useHideBrowserBar.js';
import { useSetBackgroundTheme } from '../Menu/backgroundTheme.js';
import { speak, stopVoice, preloadVoice, unlockVoice, canPlaySound } from '../../voice.js';
import { startLobbyMusic, lobbyTrackFor } from '../CouchCast/lobbyMusic.js';
import { useTimerMusic } from '../../timerMusic.js';
import { usePlayerSounds } from '../../playerSounds.js';
import { getAudioContext } from '../../chime.js';
import { useFinale, DrumrollOverlay, Fireworks, FinaleConfetti, FINALE_DRUMROLL_MS } from '../CouchCast/CouchCastFinale.jsx';

import CouchCastLobby from '../CouchCast/CouchCastLobby.jsx';
import CouchCastCasterControls, { CouchCastPausedOverlay } from '../CouchCast/CouchCastCasterControls.jsx';
import GameOverActions from '../Menu/GameOverActions.jsx';
import {
    TownMap, PlayersPanel, PhaseBar, HeadlineCard, SalesReveal, StandingsCard, TownRulesTV, TownFinalTV,
    TOWN_RULES_NARRATION, rankPlayers, playerByKey,
} from './TownScreensTV.jsx';
import TownPlayer from './TownPlayer.jsx';
import '../../styles/town.css';

/**
 * 🏙️ Temple Town. One address, two jobs:
 *   role=caster -> the TV screen (this component)
 *   role=guest  -> a player's phone (TownPlayer)
 */
export default function TownManager() {
    useWakeLock();
    useHideBrowserBar(new URLSearchParams(window.location.search).get('role') !== 'guest');
    const searchParams = new URLSearchParams(window.location.search);
    const roomCode = (searchParams.get('room') || '').toUpperCase();
    const name = searchParams.get('name') || 'Caster';

    if (searchParams.get('role') === 'guest') {
        return (
            <>
                <TownPlayer roomCode={roomCode} playerName={name} />
                {roomCode && <div className="cc-room-code">Room <strong>{roomCode}</strong></div>}
            </>
        );
    }
    return <TownTV roomCode={roomCode} casterName={name} />;
}

const lobbyTrack = lobbyTrackFor('town');

// 💰 Payday: a little "ka-ching" of coins, made in the browser
const playCoins = () => {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    [0, 0.09, 0.18, 0.3].forEach((delay, i) => {
        const start = ctx.currentTime + delay;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime([1976, 2637, 2349, 3136][i], start);
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(0.18, start + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.25);
        osc.connect(gain).connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.3);
    });
};

// The narrator's lines: short, and the same words each game where possible (they're saved and reused)
const LINES = {
    auction: 'Land grab! Place your bids.',
    sales: 'The bids are in!',
    build: 'Time to build!',
    night: 'Night out! Where are you going tonight?',
    payday: 'Payday!',
};

function TownTV({ roomCode, casterName }) {
    const navigate = useNavigate();
    const [room, setRoom] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    useRoomGone(socket, roomCode, !!room);
    const gameState = room?.gameState;
    const n = room?.currentRound;

    useSetBackgroundTheme('town', true);
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

    // 🏆 The finale: a drum roll, then the tycoon is revealed
    const isFinal = gameState === 'final';
    const finalePhase = useFinale(isFinal);
    const champions = useMemo(() => {
        if (!isFinal || !room) return [];
        const ranked = rankPlayers(room);
        return ranked.filter((p) => p.worth === ranked[0]?.worth);
    }, [isFinal, room]);

    // 🎙️ Voice-overs: one key per moment, so each is spoken exactly once
    let voiceMoment = null;
    if (gameState && !['lobby', 'rules'].includes(gameState)) voiceMoment = gameState === 'final' ? 'final' : `${gameState}-${n}`;
    useEffect(() => {
        if (!voiceMoment || !room) return undefined;
        const code = room.roomCode;
        const round = room.round;
        if (gameState === 'headline') {
            stopVoice();
            const opening = n === 1 ? 'Round one!' : n === room.totalRounds ? 'Final round!' : `Round ${n}.`;
            speak([opening, `${round.headline.title}!`, round.headline.text], code);
        } else if (gameState === 'auction') speak(LINES.auction, code);
        else if (gameState === 'auction_results') speak(LINES.sales, code);
        else if (gameState === 'build') speak(LINES.build, code);
        else if (gameState === 'night') speak(LINES.night, code);
        else if (gameState === 'payday') {
            playCoins();
            const results = Object.entries(round.payday?.results || {});
            const best = results.sort((a, b) => b[1].net - a[1].net)[0];
            const bestName = best && best[1].net > 0 ? playerByKey(room, best[0])?.name : null;
            speak(bestName ? [LINES.payday, `${bestName} had the best night.`] : LINES.payday, code);
        } else if (gameState === 'standings') {
            const leader = rankPlayers(room)[0];
            if (leader) speak(`${leader.name} is in the lead!`, code);
        } else if (gameState === 'final') {
            stopVoice();
            const names = champions.map((p) => p.name);
            const line = names.length > 1 ? `It's a tie! ${names.join(' and ')} share the title.` : `${names[0]} is the tycoon of Temple Town!`;
            const timer = setTimeout(() => speak(line, code), FINALE_DRUMROLL_MS);
            return () => clearTimeout(timer);
        }
        return undefined;
    }, [voiceMoment]);

    // ⏳ Timer music while everyone's bidding, building and choosing
    const isTimerPhase = ['auction', 'build', 'night'].includes(gameState);
    useTimerMusic(isTimerPhase && !room?.isPaused, { endTime: room?.endTime, key: `${gameState}-${n}` });

    // Fetch the rules narration while everyone is still joining, so it starts instantly
    const lobbyRoomCode = room?.roomCode;
    useEffect(() => {
        if (lobbyRoomCode) preloadVoice([...TOWN_RULES_NARRATION, ...Object.values(LINES), 'Round one!', 'Grand Opening!'], lobbyRoomCode);
    }, [lobbyRoomCode]);

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
    const canPause = !!room && !['lobby', 'rules'].includes(gameState) && !room.isGameOver;
    const handleTogglePause = () => socket.emit('set_paused', { roomCode: room?.roomCode, paused: !isPaused });
    useEffect(() => { if (isPaused) stopVoice(); }, [isPaused]);
    useEffect(() => stopVoice, []);

    const renderGamePhase = () => {
        if (!room) {
            return (
                <div className="fullscreen-gameplay-container justify-content-center">
                    <Spinner animation="border" variant="light" />
                    <h3 className="mt-3 text-white">Powering up the TV...</h3>
                </div>
            );
        }
        if (gameState === 'lobby') {
            return <CouchCastLobby title="Temple Town Room Created" roomCode={room.roomCode} players={Object.values(room.players)} musicTrack={lobbyTrack} scoreFor={(player) => room.snake?.scores?.[player.name]?.eaten} />;
        }
        if (gameState === 'rules') return <TownRulesTV roomCode={room.roomCode} totalRounds={room.totalRounds} />;
        if (gameState === 'final') {
            return (
                <>
                    <TownFinalTV room={room} isRevealed={finalePhase === 'reveal'} endActions={finalePhase === 'reveal' ? <GameOverActions onPlayAgain={handlePlayAgain} onGoHome={handleGoHome} /> : null} />
                    {finalePhase === 'drumroll' && <DrumrollOverlay />}
                    {finalePhase === 'reveal' && champions.length > 0 && <><Fireworks /><FinaleConfetti /></>}
                </>
            );
        }

        // A round: the town map, with a card over it for the moments that need one
        return (
            <div className="fullscreen-gameplay-container tt-tv">
                <PhaseBar room={room} />
                <div className="tt-main">
                    <TownMap room={room} />
                    <PlayersPanel room={room} />
                </div>
                {gameState === 'headline' && <HeadlineCard room={room} />}
                {gameState === 'auction_results' && <SalesReveal room={room} />}
                {gameState === 'standings' && <StandingsCard room={room} />}
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
