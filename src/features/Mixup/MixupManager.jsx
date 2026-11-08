import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Alert, Spinner } from 'react-bootstrap';
import { mixupSocket as socket } from '../../socket.js';

import useWakeLock from '../../hooks/useWakeLock.js';
import useRoomGone from '../../hooks/useRoomGone.js';
import ConnectionLost from '../Menu/ConnectionLost.jsx';
import useHideBrowserBar from '../../hooks/useHideBrowserBar.js';
import { useSetBackgroundTheme, mixupTheme } from '../Menu/backgroundTheme.js';
import { speak, stopVoice, preloadVoice, unlockVoice, canPlaySound } from '../../voice.js';
import { startLobbyMusic, lobbyTrackFor } from '../CouchCast/lobbyMusic.js';
import { useTimerMusic, JUDGING_TRACK } from '../../timerMusic.js';
import { scoreRecap } from '../../scoreRecap.js';

import CouchCastLobby from '../CouchCast/CouchCastLobby.jsx';
import CouchCastCasterControls from '../CouchCast/CouchCastCasterControls.jsx';
import CouchCastScoreboardTV from '../CouchCast/CouchCastScoreboardTV.jsx';
import GameOverActions from '../Menu/GameOverActions.jsx';
import { MixupRulesTV, RoundIntroTV, MemeTV, DrawTV, MatchTV, NobodyTV, MIXUP_RULES_NARRATION, ROUND_LOOKS, roundKicker, nobodyLine } from './MixupScreensTV.jsx';
import MixupPlayer from './MixupPlayer.jsx';
import { SnakeCredits } from './SnakeSnack.jsx';
import { usePlayerSounds, useTvChime } from '../../playerSounds.js';

/**
 * 🎪 Temple Mix Up. One address, two jobs:
 *   role=caster -> the TV screen (this component)
 *   role=guest  -> a player's phone (MixupPlayer)
 */
export default function MixupManager() {
    useWakeLock();
    // 📱 iPhone: room to swipe the browser bar away (the TV screen only, not the players' phones)
    useHideBrowserBar(new URLSearchParams(window.location.search).get('role') !== 'guest');
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
    const kicker = roundKicker(room.currentRound, room.totalRounds);
    const opening = kicker === 'Final round!' ? 'Final round!'
        : `${kicker === '⅓ of the way there!' ? 'A third of the way there! ' : kicker === '⅔ of the way there!' ? 'Two thirds of the way there! ' : ''}Round ${room.currentRound}.`;
    if (round.type === 'meme') return `${opening} Meme time! Write the funniest caption you can.`;
    if (round.type === 'draw') return `${opening} Pictionary! ${round.drawerName}, you're drawing. Everyone else, get guessing!`;
    return `${opening} Threefold! Match as many people as you can.${round.judgeName ? ` ${round.judgeName}, you're the judge.` : ''}`;
};

const VOICE_LIST_REVIEW = "Here's a review of the lists!";

const lobbyTrack = lobbyTrackFor('mixup');

function MixupTV({ roomCode, casterName }) {
    const navigate = useNavigate();
    const [room, setRoom] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    useRoomGone(socket, roomCode, !!room);
    const gameState = room?.gameState;

    // 🎨 Background follows the block of rounds, and covers the nav bar on the TV
    useSetBackgroundTheme(mixupTheme(room?.round?.type, !room || room.gameState === 'lobby'), true);
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

    // 🏆 The score recap: on the scoreboard headline and read by the narrator
    const [showCredits, setShowCredits] = useState(false);   // 🎬 the Snake Snack credits, after the final scores
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
    else if (gameState === 'nobody') voiceMoment = `nobody-${n}`;
    else if (gameState === 'meme_vote') voiceMoment = `vote-${n}`;
    else if (gameState === 'meme_results') voiceMoment = `meme-results-${n}`;
    else if (gameState === 'draw_results') voiceMoment = `draw-results-${n}`;
    else if (gameState === 'match_write' && room.round?.topic) voiceMoment = `match-${n}`;
    else if (gameState === 'match_review') voiceMoment = `match-judge-${n}`;
    else if (gameState === 'match_compare') voiceMoment = `list-review-${n}`;
    else if (gameState === 'scoreboard') voiceMoment = room.isGameOver ? 'game-over' : `scores-${n}`;

    useEffect(() => {
        stopVoice();
        if (!voiceMoment || !room) return;
        const code = room.roomCode;
        const round = room.round;

        if (voiceMoment.startsWith('intro')) {
            speak(introLine(room), code);
        } else if (voiceMoment.startsWith('nobody')) {
            speak(nobodyLine(n, room.totalRounds), code);
        } else if (voiceMoment.startsWith('vote')) {
            speak('Time to vote! Pick the funniest caption. Not your own!', code);
        } else if (voiceMoment.startsWith('meme-results')) {
            const winners = (round.captions || []).filter((c) => (round.winnerIds || []).includes(c.id));
            if (round.greatMinds) speak([`Great minds think alike! Double points for ${winners.map((w) => w.name).join(' and ')}!`, winners[0].text], code);
            else if (winners.length === 1) speak([`The funniest caption goes to ${winners[0].name}.`, winners[0].text], code);
            else if (winners.length > 1) speak(`It's a tie! ${winners.map((w) => w.name).join(' and ')} both score.`, code);
            else speak('Nobody wrote a caption that time!', code);
        } else if (voiceMoment.startsWith('draw-results')) {
            speak(round.guessedBy ? `${round.guessedBy} got it! It was ${round.word}.` : `Time's up! It was ${round.word}.`, code);
        } else if (voiceMoment.startsWith('match-judge')) {
            speak(`${round.judgeName}, you're the judge! Check the matches on your phone.`, code);
        } else if (voiceMoment.startsWith('match')) {
            speak(`The list is: ${round.topic}.`, code);
        } else if (voiceMoment.startsWith('list-review')) {
            speak(VOICE_LIST_REVIEW, code);
        } else if (voiceMoment === 'game-over') {
            // 🎬 The final scores get read, then the lobby game's credits roll
            let isCurrent = true;
            let timer;
            Promise.resolve(recap ? speak(recap.spoken, code) : false).then((spoken) => {
                if (isCurrent) timer = setTimeout(() => setShowCredits(true), spoken ? 1000 : 6000);
            });
            return () => {
                isCurrent = false;
                clearTimeout(timer);
            };
        } else if (recap) {
            speak(recap.spoken, code);
        }
        return undefined;
    }, [voiceMoment]);

    // ⏳ Timer music while people are writing, voting, drawing or answering
    // 📋 Then the judging music under Threefold's review of the lists, one track from the judge's turn to the results (no hurry-up tick)
    const isListReview = ['match_review', 'match_compare', 'match_results'].includes(gameState);
    const isTimerPhase = isListReview || ['meme_write', 'meme_vote', 'draw', 'match_write'].includes(gameState);
    useTimerMusic(isTimerPhase, {
        endTime: isListReview ? null : room?.endTime,
        key: isListReview ? `list-review-${n}` : `${gameState}-${n}`,
        trackId: isListReview ? JUDGING_TRACK : gameState === 'match_write' ? 'grandfather-clock' : null,   // ⏰ the list rounds tick away the whole time
    });

    // Fetch the rules narration while everyone is still joining, so it starts instantly
    const lobbyRoomCode = room?.roomCode;
    useEffect(() => {
        if (lobbyRoomCode) preloadVoice([...MIXUP_RULES_NARRATION, 'Time to vote! Pick the funniest caption. Not your own!', VOICE_LIST_REVIEW], lobbyRoomCode);
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

    // 🔁 End of the game: the caster picks what happens next
    const handlePlayAgain = () => {
        setShowCredits(false);
        startLobbyMusic(lobbyTrack);
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
                return <CouchCastLobby title="Temple Mix Up Room Created" roomCode={room.roomCode} players={playersArray} musicTrack={lobbyTrack} spyShow scoreFor={(player) => room.snake?.scores?.[player.name]?.eaten} />;
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
            case 'nobody':
                return <NobodyTV room={room} />;
            case 'match_write':
            case 'match_review':
            case 'match_compare':
            case 'match_results':
                return <MatchTV room={room} />;
            case 'scoreboard': {
                // Rounds come in blocks of each type: work out what's next from the round number
                const each = room.totalRounds / 3;
                const nextLook = ROUND_LOOKS[['meme', 'draw', 'match'][Math.floor(room.currentRound / each)]];
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
            <ConnectionLost socket={socket} />
            {errorMessage && (
                <Alert variant="danger" className="text-center m-2 position-absolute w-100" style={{ zIndex: 10002 }}>
                    {errorMessage}
                </Alert>
            )}
            {renderGamePhase()}
            {showCredits && gameState === 'scoreboard' && <SnakeCredits snake={room?.snake} onDone={() => setShowCredits(false)} />}
            {room && <CouchCastCasterControls />}
            {isSoundLocked && (
                <button type="button" className="cc-sound-button" onClick={handleTurnSoundOn}>
                    🔇 Tap to turn sound back on
                </button>
            )}
            {room?.roomCode && <div className="cc-room-code">Room <strong>{room.roomCode}</strong></div>}
        </Container>
    );
}

