import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Alert, Spinner } from 'react-bootstrap';
import { reshuffledSocket as socket } from "../../socket";

// Lock Screen to keep phone screen awake
import useWakeLock from '../../hooks/useWakeLock.js';
import { useSetBackgroundTheme, couchCastTheme } from '../Menu/backgroundTheme.js';
import { speak, stopVoice, preloadVoice, unlockVoice, canPlaySound } from '../../voice.js';
import { startLobbyMusic, lobbyTrackFor } from '../CouchCast/lobbyMusic.js';
import { useTimerMusic } from '../../timerMusic.js';

// TV Phase Components
import ReshuffledLobby from './ReshuffledLobby.jsx';
import ReshuffledWritingTV from './ReshuffledWritingTV.jsx';
import ReshuffledJudgingTV from './ReshuffledJudgingTV.jsx';
import ReshuffledWinnerRevealTV from './ReshuffledWinnerRevealTV.jsx';
import ReshuffledScoreboardTV from './ReshuffledScoreboardTV.jsx';
import ReshuffledRules, { RULES_NARRATION } from './ReshuffledRules.jsx';
import ReshuffledPromptSelection from './ReshuffledPromptSelection.jsx';

// Player Controller Component
import ReshuffledPlayerSetup from './ReshuffledPlayerSetup.jsx';
import { fillBlank } from '../CouchCast/fillBlank.js';
import { scoreRecap } from '../../scoreRecap.js';
import GameOverActions from '../Menu/GameOverActions.jsx';
import { usePlayerSounds } from '../../playerSounds.js';

// 🎙️ Narrator lines that never change. They're fetched in the lobby so they start instantly,
// and they give the changing part of each announcement a moment to load behind them.
const VOICE_PROMPT_INTRO = "The prompt is...";
const VOICE_WINNER_INTRO = "And the winner is...";
const vibeLine = (name) => `${name} is setting the vibe.`;
// When the judge runs out of time and a prompt is picked for them
const VOICE_TOO_SLOW = ["Too slow!", "I'm just gonna pick for you."];

export default function ReshuffledManager() {

    useWakeLock()    
    
    // Grab the room code, player name, and role from the URL!
    const searchParams = new URLSearchParams(window.location.search);
    const urlRoomCode = searchParams.get('room');
    const urlPlayerName = searchParams.get('name') || 'Caster';
    const urlRole = searchParams.get('role'); 

    // 🚀 ROUTING CHECK: If this is a guest player, bypass TV mode and load their controller!
    if (urlRole === 'guest') {
        return (
            <>
                <ReshuffledPlayerSetup roomCode={urlRoomCode} playerName={urlPlayerName} />

                {/* Same room code pill as the TV, so players can read it out to latecomers */}
                {urlRoomCode && (
                    <div className="cc-room-code">
                        Room <strong>{urlRoomCode.toUpperCase()}</strong>
                    </div>
                )}
            </>
        );
    }

    // --- TV STATE MANAGEMENT ---
    const navigate = useNavigate();
    const [gameState, setGameState] = useState('creating');
    const [roomData, setRoomData] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");
    
    // Phase-specific state for the TV
    const [endTime, setEndTime] = useState(null);
    const [currentPrompt, setCurrentPrompt] = useState(null);
    const [submissions, setSubmissions] = useState(null);
    const [roundResults, setRoundResults] = useState(null);
    const [promptAutoPicked, setPromptAutoPicked] = useState(false);

    // 🎨 Background matches the room's card deck, and covers the nav bar on the TV
    useSetBackgroundTheme(couchCastTheme(roomData?.expansion), true);
    // 🔊 Each player's own sound: when they join, and each time they answer
    usePlayerSounds(roomData?.roomCode, roomData?.players);
    const lobbyTrack = lobbyTrackFor('reshuffled', roomData?.expansion);

    // 🎙️ Voice-overs: one key per "moment worth announcing", so each is spoken exactly once
    const round = roomData?.currentRound;
    const judgeName = roomData?.players?.[roomData.hostId]?.name;
    let voiceMoment = null;
    if (gameState === 'prompt_selection' && judgeName) voiceMoment = `picking-${round}`;
    else if (gameState === 'writing' && currentPrompt) voiceMoment = `prompt-${round}`;
    // (Nothing is said while the judge reads the answers; the narrator returns for the winner.)
    else if (gameState === 'winner_reveal' && roundResults?.winningSubmission) voiceMoment = `winner-${round}`;
    else if (gameState === 'scoreboard' && roundResults?.isGameOver) voiceMoment = 'game-over';
    else if (gameState === 'scoreboard' && roomData) voiceMoment = `scores-${round}`;

    // 🏆 The score recap: on the scoreboard headline and read by the narrator
    const recap = useMemo(() => {
        if (gameState !== 'scoreboard' || !roomData) return null;
        return scoreRecap({
            players: Object.values(roomData.players).filter((p) => !p.isCaster),
            roundHadWinner: !!roundResults?.winner,
            round,
            isGameOver: !!roundResults?.isGameOver,
        });
    }, [gameState, roomData, roundResults, round]);
    useEffect(() => {
        // The screen changed: stop whatever was being said
        stopVoice();
        if (!voiceMoment || !roomData) return;

        const code = roomData.roomCode;
        const promptText = currentPrompt?.text || currentPrompt;

        if (voiceMoment.startsWith('picking')) {
            speak(vibeLine(judgeName), code);
        } else if (voiceMoment.startsWith('prompt')) {
            // The judge never picked: the narrator teases them before reading the prompt
            const lines = promptAutoPicked
                ? [VOICE_TOO_SLOW[Math.floor(Math.random() * VOICE_TOO_SLOW.length)], VOICE_PROMPT_INTRO, promptText]
                : [VOICE_PROMPT_INTRO, promptText];
            speak(lines, code);
        } else if (voiceMoment.startsWith('winner')) {
            const { playerName, answer } = roundResults.winningSubmission;
            // Read the whole card: the prompt with the winning answer in the blank
            const { sentence } = fillBlank(currentPrompt, answer);
            speak([VOICE_WINNER_INTRO, `${sentence} That one came from ${playerName}!`], code);
            // Get the next judge's line ready while the confetti falls
            if (!roundResults.isGameOver && roundResults.nextHostName) preloadVoice(vibeLine(roundResults.nextHostName), code);
        } else if (voiceMoment === 'game-over' || voiceMoment.startsWith('scores')) {
            if (recap) speak(recap.spoken, code);
        }
    }, [voiceMoment]);

    // 🔁 End of the game: the caster picks what happens next
    const handlePlayAgain = () => {
        startLobbyMusic(lobbyTrack);   // this tap lets the lobby music play again
        socket.emit('playAgain', { roomCode: roomData?.roomCode });
    };
    const handleGoHome = () => {
        socket.emit('endGame', { roomCode: roomData?.roomCode });
        navigate('/home', { state: { toastMessage: 'Thanks for playing!' } });
    };

    // ⏳ Tick-tock music while the judge picks a prompt and while everyone writes.
    // (The judge's pick is a 15-second clock on the screens; writing uses the server's clock.)
    const promptPickEnd = useMemo(() => (gameState === 'prompt_selection' ? Date.now() + 15 * 1000 : null), [gameState, round]);
    const isTimerPhase = gameState === 'prompt_selection' || gameState === 'writing';
    useTimerMusic(isTimerPhase, {
        endTime: gameState === 'writing' ? endTime : promptPickEnd,
        key: `${gameState}-${round}`,
    });

    // Fetch the fixed lines while everyone is still joining, so the narrator never starts late
    const lobbyRoomCode = roomData?.roomCode;
    useEffect(() => {
        if (!lobbyRoomCode) return;
        preloadVoice([...RULES_NARRATION, VOICE_PROMPT_INTRO, VOICE_WINNER_INTRO, ...VOICE_TOO_SLOW], lobbyRoomCode);
    }, [lobbyRoomCode]);

    // The first judge is known once the rules are showing: get their line ready too
    useEffect(() => {
        if (gameState === 'rules' && judgeName && lobbyRoomCode) preloadVoice(vibeLine(judgeName), lobbyRoomCode);
    }, [gameState, judgeName, lobbyRoomCode]);

    // 🔇 After a page refresh the browser mutes us until someone taps the screen.
    // When that happens, show a button that switches the narrator and music back on.
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


    // --- SOCKET LISTENERS (TV ONLY) ---
    useEffect(() => {
        // (Re)join our room on every connection: first load, a page refresh,
        // and any time the network drops and the socket comes back with a new ID.
        const joinMyRoom = () => {
            socket.emit('joinRoom', { roomCode: urlRoomCode, playerName: urlPlayerName });
        };

        if (urlRoomCode) {
            socket.on('connect', joinMyRoom);
            if (socket.connected) {
                joinMyRoom();
            } else {
                // After a page refresh nothing has opened the connection yet
                socket.connect();
            }
        } else {
             setErrorMessage("No room code found in the URL!");
        }

        socket.on('sync_game_state', (payload) => {
            // Only this screen's own room gets to drive it
            if (payload.roomData?.roomCode !== urlRoomCode) return;
            setGameState(payload.gameState);
            setRoomData(payload.roomData);
            setEndTime(payload.endTime);
            setCurrentPrompt(payload.currentPrompt);
            setSubmissions(payload.submissions);
            setRoundResults(payload.roundResults);
            setPromptAutoPicked(!!payload.roomData?.promptAutoPicked);
        });

        socket.on('room_updated', (room) => {
            if (room.roomCode !== urlRoomCode) return;
            setRoomData(room);
            setGameState(room.gameState);
            if (room.currentPrompt) setCurrentPrompt(room.currentPrompt);
            // "Play Again": forget the last game's results
            if (room.gameState === 'lobby') setRoundResults(null);
        });

        socket.on('writing_phase_started', (data) => {
            setGameState(data.gameState);
            setCurrentPrompt(data.prompt);
            setEndTime(data.endTime);
            setPromptAutoPicked(!!data.autoPicked);
        });

        socket.on('start_judging', (data) => {
            setGameState(data.gameState);
            setSubmissions(data.submissions);
        });

        socket.on('round_ended', (data) => {
            setGameState(data.gameState);
            setRoundResults({
                winner: data.winner,
                winningSubmission: data.winningSubmission, // 👈 WE ADDED THIS
                nextHostName: data.nextHostName,
                isGameOver: data.isGameOver
            });
        });

        socket.on('joinError', (msg) => {
            setErrorMessage(msg);
            setTimeout(() => setErrorMessage(""), 5000);
        });

        return () => {
            socket.off('connect', joinMyRoom);
            socket.off('sync_game_state');
            socket.off('room_updated');
            socket.off('writing_phase_started');
            socket.off('start_judging');
            socket.off('round_ended');
            socket.off('errorMsg');
        };
    }, [urlRoomCode, urlPlayerName]);

    // --- TV RENDER LOGIC ---
    const renderGamePhase = () => {
        if (gameState === 'creating' || !roomData) {
            return (
                <div className="fullscreen-gameplay-container justify-content-center">
                    <Spinner animation="border" variant="light" />
                    <h3 className="mt-3 text-white">Powering up the TV...</h3>
                </div>
            );
        }

        const playersArray = Object.values(roomData.players);

        switch (gameState) {
            case 'lobby':
                return (
                    <ReshuffledLobby 
                        roomCode={roomData.roomCode} 
                        players={playersArray} musicTrack={lobbyTrack} />
                );

            case 'rules':
                return (
                    <ReshuffledRules
                        roomCode={roomData.roomCode}
                    />
                );

            case 'prompt_selection':
                const pickerName = roomData.players[roomData.hostId]?.name || 'The Judge';
                return (
                    <ReshuffledPromptSelection 
                        isCastScreen={true} 
                        judgeName={pickerName} 
                        roomCode={roomData.roomCode} 
                        prompts={roomData.promptOptions}
                    />
                );

            case 'writing':
                return (
                    <ReshuffledWritingTV 
                        currentPrompt={currentPrompt} 
                        endTime={endTime} 
                        players={playersArray} 
                        hostId={roomData.hostId} 
                    />
                );

            case 'judging':
                const judgeName = roomData.players[roomData.hostId]?.name || 'The Judge';
                return (
                    <ReshuffledJudgingTV 
                        currentPrompt={currentPrompt} 
                        submissions={submissions} 
                        judgeName={judgeName} 
                        endTime={roomData.endTime}
                    />
                );

            case 'winner_reveal':
                return (
                    <ReshuffledWinnerRevealTV 
                        currentPrompt={currentPrompt} 
                        winner={roundResults?.winner} 
                        winningSubmission={roundResults?.winningSubmission} // 👈 AND PASSED IT HERE
                        nextHostName={roundResults?.nextHostName} 
                        isGameOver={roundResults?.isGameOver} 
                    />
                );

            case 'scoreboard':
                return (
                    <ReshuffledScoreboardTV 
                        players={playersArray} 
                        isGameOver={roundResults?.isGameOver} // 👈 Also passed isGameOver here!
                        headline={recap?.headline}
                        endActions={<GameOverActions onPlayAgain={handlePlayAgain} onGoHome={handleGoHome} />}
                    />
                );

            default:
                return <div><h3 className="text-white">Unknown Game State: {gameState}</h3></div>;
        }
    };

    return (
        <Container fluid className="p-0" style={{ minHeight: '100vh'}}>
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
            {roomData?.roomCode && (
                <div className="cc-room-code">
                    Room <strong>{roomData.roomCode}</strong>
                </div>
            )}
        </Container>
    );
}