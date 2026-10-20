import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Alert, Spinner } from 'react-bootstrap';
import { triviaCastSocket as socket } from '../../socket';

import useWakeLock from '../../hooks/useWakeLock.js';
import useHideBrowserBar from '../../hooks/useHideBrowserBar.js';
import { useSetBackgroundTheme, triviaCastTheme } from '../Menu/backgroundTheme.js';
import { speak, stopVoice, preloadVoice, unlockVoice, canPlaySound } from '../../voice.js';
import { startLobbyMusic, lobbyTrackFor } from '../CouchCast/lobbyMusic.js';
import { useTimerMusic } from '../../timerMusic.js';

// TV screens (the lobby and scoreboard are shared with Couch Cast)
import CouchCastLobby from '../CouchCast/CouchCastLobby.jsx';
import CouchCastScoreboardTV from '../CouchCast/CouchCastScoreboardTV.jsx';
import { TriviaCastRulesTV, TriviaCastQuestionTV, TRIVIA_CAST_RULES_NARRATION } from './TriviaCastScreensTV.jsx';

// Phone controller
import TriviaCastPlayer from './TriviaCastPlayer.jsx';
import { scoreRecap } from '../../scoreRecap.js';
import GameOverActions from '../Menu/GameOverActions.jsx';
import { usePlayerSounds } from '../../playerSounds.js';

/**
 * 📺❔ Trivia Cast. One address, two jobs:
 *   role=caster -> the TV screen (this component)
 *   role=guest  -> a player's phone (TriviaCastPlayer)
 */
export default function TriviaCastManager() {

    useWakeLock();
    // 📱 iPhone: room to swipe the browser bar away (the TV screen only, not the players' phones)
    useHideBrowserBar(new URLSearchParams(window.location.search).get('role') !== 'guest');

    const searchParams = new URLSearchParams(window.location.search);
    const urlRoomCode = (searchParams.get('room') || '').toUpperCase();
    const urlPlayerName = searchParams.get('name') || 'Caster';
    const urlRole = searchParams.get('role');

    if (urlRole === 'guest') {
        return (
            <>
                <TriviaCastPlayer roomCode={urlRoomCode} playerName={urlPlayerName} />
                {urlRoomCode && (
                    <div className="cc-room-code">
                        Room <strong>{urlRoomCode}</strong>
                    </div>
                )}
            </>
        );
    }

    // --- TV STATE ---
    const navigate = useNavigate();
    const [room, setRoom] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");

    const gameState = room?.gameState;

    // 🎨 Background follows the question deck, and covers the nav bar on the TV
    useSetBackgroundTheme(triviaCastTheme(room?.expansion), true);
    // 🔊 Each player's own sound: when they join, and each time they answer
    usePlayerSounds(room?.roomCode, room?.players);
    const lobbyTrack = lobbyTrackFor('triviaCast', room?.expansion);

    // --- SOCKET LISTENERS ---
    useEffect(() => {
        // (Re)join our room on every connection: first load, a refresh, or a network blip
        const joinMyRoom = () => {
            socket.emit('joinRoom', { roomCode: urlRoomCode, playerName: urlPlayerName });
        };

        const handleRoomUpdate = (update) => {
            if (update?.roomCode === urlRoomCode) setRoom(update);
        };

        const handleJoinError = (msg) => {
            setErrorMessage(msg);
            setTimeout(() => setErrorMessage(""), 5000);
        };

        socket.on('room_updated', handleRoomUpdate);
        socket.on('joinError', handleJoinError);

        if (urlRoomCode) {
            socket.on('connect', joinMyRoom);
            if (socket.connected) joinMyRoom();
            else socket.connect();
        } else {
            setErrorMessage("No room code found in the URL!");
        }

        return () => {
            socket.off('connect', joinMyRoom);
            socket.off('room_updated', handleRoomUpdate);
            socket.off('joinError', handleJoinError);
        };
    }, [urlRoomCode, urlPlayerName]);

    // 🎙️ Voice-overs: one key per moment, so each is spoken exactly once
    let voiceMoment = null;
    if (gameState === 'question' && room.question) voiceMoment = `question-${room.currentRound}`;
    else if (gameState === 'reveal' && room.correctAnswer) voiceMoment = `reveal-${room.currentRound}`;
    else if (gameState === 'scoreboard' && room.isGameOver) voiceMoment = 'game-over';
    else if (gameState === 'scoreboard') voiceMoment = `scores-${room.currentRound}`;

    // 🏆 The score recap: on the scoreboard headline and read by the narrator
    const recap = useMemo(() => {
        if (gameState !== 'scoreboard' || !room) return null;
        const players = Object.values(room.players).filter((p) => !p.isCaster);
        return scoreRecap({
            players,
            roundHadWinner: players.some((p) => (p.lastPoints || 0) > 0),
            round: room.currentRound,
            isGameOver: !!room.isGameOver,
        });
    }, [gameState, room]);
    useEffect(() => {
        stopVoice();
        if (!voiceMoment || !room) return;
        const code = room.roomCode;

        if (voiceMoment.startsWith('question')) {
            // Two lines, so the question on its own is cached and re-reading it at the reveal is free
            speak([`Question ${room.currentRound}.`, room.question.text], code);
        } else if (voiceMoment.startsWith('reveal')) {
            // Read the question again, then the answer (the question is already cached, so it's instant)
            speak([room.question.text, `The answer is: ${room.correctAnswer}.`], code);
        } else if (voiceMoment === 'game-over' || voiceMoment.startsWith('scores')) {
            if (recap) speak(recap.spoken, code);
        }
    }, [voiceMoment]);

    // 🔁 End of the game: the caster picks what happens next
    const handlePlayAgain = () => {
        startLobbyMusic(lobbyTrack);   // this tap lets the lobby music play again
        socket.emit('playAgain', { roomCode: room?.roomCode });
    };
    const handleGoHome = () => {
        socket.emit('endGame', { roomCode: room?.roomCode });
        navigate('/home', { state: { toastMessage: 'Thanks for playing!' } });
    };

    // ⏳ Tick-tock music while everyone answers
    useTimerMusic(gameState === 'question', { endTime: room?.endTime, key: room?.currentRound });

    // Fetch the rules narration while everyone is still joining, so it starts instantly
    const lobbyRoomCode = room?.roomCode;
    useEffect(() => {
        if (lobbyRoomCode) preloadVoice(TRIVIA_CAST_RULES_NARRATION, lobbyRoomCode);
    }, [lobbyRoomCode]);

    // 🔇 After a page refresh the browser mutes us until someone taps the screen
    const [isSoundLocked, setIsSoundLocked] = useState(false);

    useEffect(() => {
        let isCurrent = true;
        canPlaySound().then((allowed) => {
            if (isCurrent) setIsSoundLocked(!allowed);
        });
        return () => { isCurrent = false; };
    }, []);

    const handleTurnSoundOn = () => {
        unlockVoice();
        if (gameState === 'lobby') startLobbyMusic(lobbyTrack);
        setIsSoundLocked(false);
    };

    // Leaving the game: stop talking
    useEffect(() => stopVoice, []);

    // --- TV RENDER ---
    const renderGamePhase = () => {
        if (!room) {
            return (
                <div className="fullscreen-gameplay-container justify-content-center">
                    <Spinner animation="border" variant="light" />
                    <h3 className="mt-3 text-white">Powering up the TV...</h3>
                </div>
            );
        }

        const playersArray = Object.values(room.players);

        switch (gameState) {
            case 'lobby':
                return <CouchCastLobby title="Trivia Cast Room Created" roomCode={room.roomCode} players={playersArray} musicTrack={lobbyTrack} />;

            case 'rules':
                return <TriviaCastRulesTV roomCode={room.roomCode} />;

            case 'question':
            case 'reveal':
                return <TriviaCastQuestionTV room={room} />;

            case 'scoreboard':
                return (
                    <CouchCastScoreboardTV
                        players={playersArray}
                        isGameOver={room.isGameOver}
                        nextLabel="Next question coming up..."
                        headline={recap?.headline}
                        endActions={<GameOverActions onPlayAgain={handlePlayAgain} onGoHome={handleGoHome} />}
                    />
                );

            default:
                return <div><h3 className="text-white">Unknown Game State: {gameState}</h3></div>;
        }
    };

    return (
        <Container fluid className="p-0" style={{ minHeight: '100vh' }}>
            {errorMessage && (
                <Alert variant="danger" className="text-center m-2 position-absolute w-100" style={{ zIndex: 10002 }}>
                    {errorMessage}
                </Alert>
            )}

            {renderGamePhase()}

            {isSoundLocked && (
                <button type="button" className="cc-sound-button" onClick={handleTurnSoundOn}>
                    🔇 Tap to turn sound back on
                </button>
            )}

            {/* Room code stays in the corner of every TV screen so latecomers can still join */}
            {room?.roomCode && (
                <div className="cc-room-code">
                    Room <strong>{room.roomCode}</strong>
                </div>
            )}
        </Container>
    );
}
