import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Alert, Spinner } from 'react-bootstrap';
import { mixupSocket as socket } from '../../socket.js';

import useWakeLock from '../../hooks/useWakeLock.js';
import { useSetBackgroundTheme, mixupTheme } from '../Menu/backgroundTheme.js';
import { speak, stopVoice, preloadVoice, unlockVoice, canPlaySound } from '../../voice.js';
import { startLobbyMusic } from '../CouchCast/lobbyMusic.js';
import { useTimerMusic } from '../../timerMusic.js';
import { scoreRecap } from '../../scoreRecap.js';

import CouchCastLobby from '../CouchCast/CouchCastLobby.jsx';
import CouchCastScoreboardTV from '../CouchCast/CouchCastScoreboardTV.jsx';
import GameOverActions from '../Menu/GameOverActions.jsx';
import { MixupRulesTV, RoundIntroTV, MemeTV, DrawTV, TriviaTV, MIXUP_RULES_NARRATION, ROUND_LOOKS } from './MixupScreensTV.jsx';
import MixupPlayer from './MixupPlayer.jsx';
import { usePlayerSounds, useTvChime } from '../../playerSounds.js';

/**
 * 🎪 Temple Mix Up. One address, two jobs:
 *   role=caster -> the TV screen (this component)
 *   role=guest  -> a player's phone (MixupPlayer)
 */
export default function MixupManager() {
    useWakeLock();
    const searchParams = new URLSearchParams(window.location.search);
    const roomCode = (searchParams.get('room') || '').toUpperCase();
    const name = searchParams.get('name') || 'Caster';

    if (searchParams.get('role') === 'guest') {
        return (
            <>
                <MixupPlayer roomCode={roomCode} playerName={name} />
                {roomCode && <div className="cc-room-code">Room <strong>{roomCode}</strong></div>}
            </>
        );
    }
    return <MixupTV roomCode={roomCode} casterName={name} />;
}

// What the narrator says to open each round
const introLine = (room) => {
    const round = room.round;
    if (round.type === 'meme') return `Round ${room.currentRound}. Meme time! Write the funniest caption you can.`;
    if (round.type === 'draw') return `Round ${room.currentRound}. Pictionary! ${round.drawerName}, you're drawing. Everyone else, get guessing!`;
    return `Round ${room.currentRound}. Trivia time!`;
};

function MixupTV({ roomCode, casterName }) {
    const navigate = useNavigate();
    const [room, setRoom] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const gameState = room?.gameState;

    // 🎨 Background follows the block of rounds, and covers the nav bar on the TV
    useSetBackgroundTheme(mixupTheme(room?.round?.type), true);
    // 🔊 Each player's own sound: when they join, and each time they answer
    usePlayerSounds(room?.roomCode, room?.players);
    // 🔔 Voting is open: chime on the TV, where everyone hears it
    useTvChime(room?.gameState === 'meme_vote' ? `vote-${room.currentRound}` : null);

    // --- SOCKET LISTENERS ---
    useEffect(() => {
        const joinMyRoom = () => socket.emit('joinRoom', { roomCode, playerName: casterName });
        const handleRoomUpdate = (update) => { if (update?.roomCode === roomCode) setRoom(update); };
        const handleJoinError = (msg) => {
            setErrorMessage(msg);
            setTimeout(() => setErrorMessage(''), 5000);
        };
        const handleClosed = ({ message } = {}) => navigate('/home', { state: { toastMessage: message || 'That game has ended.' } });

        socket.on('room_updated', handleRoomUpdate);
        socket.on('joinError', handleJoinError);
        socket.on('room_closed', handleClosed);
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
            socket.off('room_closed', handleClosed);
        };
    }, [roomCode, casterName]);

    // 🏆 The score recap: on the scoreboard headline and read by the narrator
    const recap = useMemo(() => {
        if (gameState !== 'scoreboard' || !room) return null;
        const players = Object.values(room.players).filter((p) => !p.isCaster);
        return scoreRecap({
            players,
            roundHadWinner: players.some((p) => (p.roundPoints || 0) > 0),
            round: room.currentRound,
            isGameOver: !!room.isGameOver,
        });
    }, [gameState, room]);

    // 🎙️ Voice-overs: one key per moment, so each is spoken exactly once
    const n = room?.currentRound;
    let voiceMoment = null;
    if (gameState === 'intro' && room.round) voiceMoment = `intro-${n}`;
    else if (gameState === 'meme_vote') voiceMoment = `vote-${n}`;
    else if (gameState === 'meme_results') voiceMoment = `meme-results-${n}`;
    else if (gameState === 'draw_results') voiceMoment = `draw-results-${n}`;
    else if (gameState === 'trivia' && room.round?.question) voiceMoment = `trivia-${n}`;
    else if (gameState === 'trivia_results') voiceMoment = `trivia-results-${n}`;
    else if (gameState === 'scoreboard') voiceMoment = room.isGameOver ? 'game-over' : `scores-${n}`;

    useEffect(() => {
        stopVoice();
        if (!voiceMoment || !room) return;
        const code = room.roomCode;
        const round = room.round;

        if (voiceMoment.startsWith('intro')) {
            speak(introLine(room), code);
        } else if (voiceMoment.startsWith('vote')) {
            speak('Time to vote! Pick the funniest caption. Not your own!', code);
        } else if (voiceMoment.startsWith('meme-results')) {
            const winners = (round.captions || []).filter((c) => (round.winnerIds || []).includes(c.id));
            if (winners.length === 1) speak([`The funniest caption goes to ${winners[0].name}.`, winners[0].text], code);
            else if (winners.length > 1) speak(`It's a tie! ${winners.map((w) => w.name).join(' and ')} both score.`, code);
            else speak('Nobody wrote a caption that time!', code);
        } else if (voiceMoment.startsWith('draw-results')) {
            speak(round.guessedBy ? `${round.guessedBy} got it! It was ${round.word}.` : `Time's up! It was ${round.word}.`, code);
        } else if (voiceMoment.startsWith('trivia-results')) {
            speak(`The answer is ${round.correctAnswer}.`, code);
        } else if (voiceMoment.startsWith('trivia')) {
            speak(round.question.text, code);
        } else if (recap) {
            speak(recap.spoken, code);
        }
    }, [voiceMoment]);

    // ⏳ Timer music while people are writing, voting, drawing or answering
    const isTimerPhase = ['meme_write', 'meme_vote', 'draw', 'trivia'].includes(gameState);
    useTimerMusic(isTimerPhase, { endTime: room?.endTime, key: `${gameState}-${n}` });

    // Fetch the rules narration while everyone is still joining, so it starts instantly
    const lobbyRoomCode = room?.roomCode;
    useEffect(() => {
        if (lobbyRoomCode) preloadVoice([...MIXUP_RULES_NARRATION, 'Time to vote! Pick the funniest caption. Not your own!'], lobbyRoomCode);
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
        if (gameState === 'lobby') startLobbyMusic();
        setIsSoundLocked(false);
    };

    // 🔁 End of the game: the caster picks what happens next
    const handlePlayAgain = () => {
        startLobbyMusic();
        socket.emit('playAgain', { roomCode: room?.roomCode });
    };
    const handleGoHome = () => {
        socket.emit('endGame', { roomCode: room?.roomCode });
        navigate('/home', { state: { toastMessage: 'Thanks for playing!' } });
    };

    // Leaving the game: stop talking
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
        const playersArray = Object.values(room.players);

        switch (gameState) {
            case 'lobby':
                return <CouchCastLobby title="Temple Mix Up Room Created" roomCode={room.roomCode} players={playersArray} />;
            case 'rules':
                return <MixupRulesTV roomCode={room.roomCode} totalRounds={room.totalRounds} />;
            case 'intro':
                return <RoundIntroTV room={room} />;
            case 'meme_write':
            case 'meme_vote':
            case 'meme_results':
                return <MemeTV room={room} />;
            case 'draw':
            case 'draw_results':
                return <DrawTV room={room} />;
            case 'trivia':
            case 'trivia_results':
                return <TriviaTV room={room} />;
            case 'scoreboard': {
                // Rounds come in blocks of each type: work out what's next from the round number
                const each = room.totalRounds / 3;
                const nextLook = ROUND_LOOKS[['meme', 'draw', 'trivia'][Math.floor(room.currentRound / each)]];
                return (
                    <CouchCastScoreboardTV
                        players={playersArray}
                        isGameOver={room.isGameOver}
                        nextLabel={nextLook ? `Next up: ${nextLook.icon} ${nextLook.title}` : 'Next round coming up...'}
                        headline={recap?.headline}
                        endActions={<GameOverActions onPlayAgain={handlePlayAgain} onGoHome={handleGoHome} />}
                    />
                );
            }
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
            {room?.roomCode && <div className="cc-room-code">Room <strong>{room.roomCode}</strong></div>}
        </Container>
    );
}

