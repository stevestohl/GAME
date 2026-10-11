import React, { useState, useEffect } from 'react';
import { Container, Alert, Spinner } from 'react-bootstrap';
import { couchCastSocket as socket } from "../../socket";

// Lock Screen to keep phone screen awake
import useWakeLock from '../../hooks/useWakeLock.js';
import { useSetBackgroundTheme, couchCastTheme } from '../Menu/backgroundTheme.js';
import { speak, stopVoice, preloadVoice } from '../../voice.js';

// TV Phase Components
import CouchCastLobby from './CouchCastLobby.jsx';
import CouchCastWritingTV from './CouchCastWritingTV.jsx';
import CouchCastJudgingTV from './CouchCastJudgingTV.jsx';
import CouchCastWinnerRevealTV from './CouchCastWinnerRevealTV.jsx';
import CouchCastScoreboardTV from './CouchCastScoreboardTV.jsx';
import CouchCastRules, { RULES_NARRATION } from './CouchCastRules.jsx';
import CouchCastPromptSelection from './CouchCastPromptSelection.jsx';

// Player Controller Component
import CouchCastPlayerSetup from './CouchCastPlayerSetup.jsx';

// 🎙️ Narrator lines that never change. They're fetched in the lobby so they start instantly,
// and they give the changing part of each announcement a moment to load behind them.
const VOICE_PROMPT_INTRO = "The prompt is...";
const VOICE_ANSWERS_INTRO = "Time's up! Here are your answers.";
const VOICE_WINNER_INTRO = "And the winner is...";
const vibeLine = (name) => `${name} is setting the vibe.`;

export default function CouchCastManager() {

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
                <CouchCastPlayerSetup roomCode={urlRoomCode} playerName={urlPlayerName} />

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
    const [gameState, setGameState] = useState('creating');
    const [roomData, setRoomData] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");
    
    // Phase-specific state for the TV
    const [endTime, setEndTime] = useState(null);
    const [currentPrompt, setCurrentPrompt] = useState(null);
    const [submissions, setSubmissions] = useState(null);
    const [roundResults, setRoundResults] = useState(null);

    // 🎨 Background matches the room's card deck, and covers the nav bar on the TV
    useSetBackgroundTheme(couchCastTheme(roomData?.expansion), true);

    // 🎙️ Voice-overs: one key per "moment worth announcing", so each is spoken exactly once
    const round = roomData?.currentRound;
    const judgeName = roomData?.players?.[roomData.hostId]?.name;
    let voiceMoment = null;
    if (gameState === 'prompt_selection' && judgeName) voiceMoment = `picking-${round}`;
    else if (gameState === 'writing' && currentPrompt) voiceMoment = `prompt-${round}`;
    else if (gameState === 'judging' && submissions?.length > 0) voiceMoment = `answers-${round}`;
    else if (gameState === 'winner_reveal' && roundResults?.winningSubmission) voiceMoment = `winner-${round}`;
    else if (gameState === 'scoreboard' && roundResults?.isGameOver) voiceMoment = 'game-over';

    useEffect(() => {
        // The screen changed: stop whatever was being said
        stopVoice();
        if (!voiceMoment || !roomData) return;

        const code = roomData.roomCode;
        const promptText = currentPrompt?.text || currentPrompt;

        if (voiceMoment.startsWith('picking')) {
            speak(vibeLine(judgeName), code);
        } else if (voiceMoment.startsWith('prompt')) {
            speak([VOICE_PROMPT_INTRO, promptText], code);
        } else if (voiceMoment.startsWith('answers')) {
            speak([VOICE_ANSWERS_INTRO, ...submissions.map((sub) => sub.answer)], code);
        } else if (voiceMoment.startsWith('winner')) {
            const { playerName, answer } = roundResults.winningSubmission;
            speak([VOICE_WINNER_INTRO, `${answer} That one came from ${playerName}!`], code);
            // Get the next judge's line ready while the confetti falls
            if (!roundResults.isGameOver && roundResults.nextHostName) preloadVoice(vibeLine(roundResults.nextHostName), code);
        } else if (voiceMoment === 'game-over') {
            const champion = Object.values(roomData.players)
                .filter((p) => !p.isCaster)
                .sort((a, b) => (b.score || 0) - (a.score || 0))[0];
            if (champion) speak(`That's the game! ${champion.name} wins with ${champion.score} points. Thanks for playing!`, code);
        }
    }, [voiceMoment]);

    // Fetch the fixed lines while everyone is still joining, so the narrator never starts late
    const lobbyRoomCode = roomData?.roomCode;
    useEffect(() => {
        if (!lobbyRoomCode) return;
        preloadVoice([...RULES_NARRATION, VOICE_PROMPT_INTRO, VOICE_ANSWERS_INTRO, VOICE_WINNER_INTRO], lobbyRoomCode);
    }, [lobbyRoomCode]);

    // The first judge is known once the rules are showing: get their line ready too
    useEffect(() => {
        if (gameState === 'rules' && judgeName && lobbyRoomCode) preloadVoice(vibeLine(judgeName), lobbyRoomCode);
    }, [gameState, judgeName, lobbyRoomCode]);

    // Leaving the game: stop talking
    useEffect(() => stopVoice, []);


    // --- SOCKET LISTENERS (TV ONLY) ---
    useEffect(() => {
        if (urlRoomCode) {
             socket.emit('joinRoom', { roomCode: urlRoomCode, playerName: urlPlayerName });
        } else {
             setErrorMessage("No room code found in the URL!");
        }

        socket.on('sync_game_state', (payload) => {
            setGameState(payload.gameState);
            setRoomData(payload.roomData);
            setEndTime(payload.endTime);
            setCurrentPrompt(payload.currentPrompt);
            setSubmissions(payload.submissions);
            setRoundResults(payload.roundResults);
        });

        socket.on('room_updated', (room) => {
            setRoomData(room);
            setGameState(room.gameState);
            if (room.currentPrompt) setCurrentPrompt(room.currentPrompt);
        });

        socket.on('writing_phase_started', (data) => {
            setGameState(data.gameState);
            setCurrentPrompt(data.prompt);
            setEndTime(data.endTime);
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
                <div className="text-center mt-5">
                    <Spinner animation="border" variant="primary" />
                    <h3 className="mt-3 text-white">Powering up the TV...</h3>
                </div>
            );
        }

        const playersArray = Object.values(roomData.players);

        switch (gameState) {
            case 'lobby':
                return (
                    <CouchCastLobby 
                        roomCode={roomData.roomCode} 
                        players={playersArray} 
                    />
                );

            case 'rules':
                return (
                    <CouchCastRules
                        roomCode={roomData.roomCode}
                    />
                );

            case 'prompt_selection':
                const pickerName = roomData.players[roomData.hostId]?.name || 'The Judge';
                return (
                    <CouchCastPromptSelection 
                        isCastScreen={true} 
                        judgeName={pickerName} 
                        roomCode={roomData.roomCode} 
                        prompts={roomData.promptOptions}
                    />
                );

            case 'writing':
                return (
                    <CouchCastWritingTV 
                        currentPrompt={currentPrompt} 
                        endTime={endTime} 
                        players={playersArray} 
                        hostId={roomData.hostId} 
                    />
                );

            case 'judging':
                const judgeName = roomData.players[roomData.hostId]?.name || 'The Judge';
                return (
                    <CouchCastJudgingTV 
                        currentPrompt={currentPrompt} 
                        submissions={submissions} 
                        judgeName={judgeName} 
                        endTime={roomData.endTime}
                    />
                );

            case 'winner_reveal':
                return (
                    <CouchCastWinnerRevealTV 
                        currentPrompt={currentPrompt} 
                        winner={roundResults?.winner} 
                        winningSubmission={roundResults?.winningSubmission} // 👈 AND PASSED IT HERE
                        nextHostName={roundResults?.nextHostName} 
                        isGameOver={roundResults?.isGameOver} 
                    />
                );

            case 'scoreboard':
                return (
                    <CouchCastScoreboardTV 
                        players={playersArray} 
                        isGameOver={roundResults?.isGameOver} // 👈 Also passed isGameOver here!
                    />
                );

            default:
                return <div><h3 className="text-white">Unknown Game State: {gameState}</h3></div>;
        }
    };

    return (
        <Container fluid className="p-0" style={{ minHeight: '100vh'}}>
            {errorMessage && (
                <Alert variant="danger" className="text-center m-2 position-absolute w-100" style={{ zIndex: 999 }}>
                    {errorMessage}
                </Alert>
            )}
            
            {renderGamePhase()}

            {/* Room code stays in the corner of every TV screen so latecomers can still join */}
            {roomData?.roomCode && (
                <div className="cc-room-code">
                    Room <strong>{roomData.roomCode}</strong>
                </div>
            )}
        </Container>
    );
}