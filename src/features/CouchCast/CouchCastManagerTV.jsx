import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Alert, Spinner } from 'react-bootstrap';
import { couchCastSocket as socket } from "../../socket";

// Lock Screen to keep phone screen awake
import useWakeLock from '../../hooks/useWakeLock.js';
import useRoomGone from '../../hooks/useRoomGone.js';
import ConnectionLost from '../Menu/ConnectionLost.jsx';
import useHideBrowserBar from '../../hooks/useHideBrowserBar.js';
import { useSetBackgroundTheme, couchCastTheme } from '../Menu/backgroundTheme.js';
import { speak, stopVoice, preloadVoice, unlockVoice, canPlaySound } from '../../voice.js';
import { startLobbyMusic, lobbyTrackFor } from './lobbyMusic.js';
import { useTimerMusic, JUDGING_TRACK } from '../../timerMusic.js';
import { toDeviceTime } from '../../serverClock.js';

// TV Phase Components
import CouchCastLobby from './CouchCastLobby.jsx';
import CouchCastWritingTV from './CouchCastWritingTV.jsx';
import CouchCastJudgingTV from './CouchCastJudgingTV.jsx';
import CouchCastWinnerRevealTV from './CouchCastWinnerRevealTV.jsx';
import CouchCastScoreboardTV from './CouchCastScoreboardTV.jsx';
import CouchCastRules, { RULES_NARRATION } from './CouchCastRules.jsx';
import CouchCastPromptSelection from './CouchCastPromptSelection.jsx';
import CouchCastCasterControls, { CouchCastPausedOverlay } from './CouchCastCasterControls.jsx';

// Player Controller Component
import CouchCastPlayerSetup from './CouchCastPlayerSetup.jsx';
import { fillBlank } from './fillBlank.js';
import { scoreRecap, NEXT_UP_LINES } from '../../scoreRecap.js';
import { FINALE_DRUMROLL_MS } from './CouchCastFinale.jsx';
import GameOverActions from '../Menu/GameOverActions.jsx';
import TowerCredits from './TowerCredits.jsx';
import CouchCastRoundIntro from './CouchCastRoundIntro.jsx';
import { SCENE_MS as ROUND_SCENE_MS } from './RoundCatScene.jsx';
import { usePlayerSounds } from '../../playerSounds.js';
import { AvatarTheme } from '../../avatars.jsx';

// 🎙️ Narrator lines that never change. They're fetched in the lobby so they start instantly,
// and they give the changing part of each announcement a moment to load behind them.
const VOICE_PROMPT_INTRO = "The prompt is...";
const VOICE_WINNER_INTRO = "And the winner is...";
const vibeLine = (name) => `${name} is setting the vibe.`;
const judgingLine = (name) => `${name} is judging.`;
// When the judge runs out of time and a prompt is picked for them
const VOICE_TOO_SLOW = ["Too slow!", "I'm just gonna pick for you."];
// 👻 Nobody answered: one of these (the second one echoes), then on to the next round
const VOICE_ANYONE_THERE = [
    ["Hey, anyone there?"],
    [{ text: 'Hello?' }, { text: 'Hello?', volume: 0.45 }, { text: 'Hello?', volume: 0.2 }],
];
const VOICE_MOVING_ON = "Anyhow, moving on to the next round.";
// 🎬 Between rounds, over the "Round 3" title card (a different one each round)
const ROUND_INTRO_LINES = [
    (n) => `Get ready for round ${n}!`,
    (n) => `Prepare for round ${n}.`,
    (n) => `What will you come up with next? Round ${n}, up ahead.`,
];
const roundIntroLine = (n) => ROUND_INTRO_LINES[n % ROUND_INTRO_LINES.length](n);
const VOICE_MOVING_ON_LAST = "Anyhow, let's see the final scores.";

export default function CouchCastManager() {

    useWakeLock()    
    // 📱 iPhone: room to swipe the browser bar away (the TV screen only, not the players' phones)
    useHideBrowserBar(new URLSearchParams(window.location.search).get('role') !== 'guest');
    
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
    const navigate = useNavigate();
    const [gameState, setGameState] = useState('creating');
    const [roomData, setRoomData] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");
    useRoomGone(socket, urlRoomCode, !!roomData);
    
    // Phase-specific state for the TV (the clocks count down to roomData.endTime)
    const [currentPrompt, setCurrentPrompt] = useState(null);
    const [submissions, setSubmissions] = useState(null);
    const [roundResults, setRoundResults] = useState(null);
    const [promptAutoPicked, setPromptAutoPicked] = useState(false);
    const [showCredits, setShowCredits] = useState(false);   // 🎬 the Tower Party credits, after the final scores

    // 🎨 Background matches the room's card deck, and covers the nav bar on the TV
    useSetBackgroundTheme(couchCastTheme(roomData?.expansion), true);
    // 🔊 Each player's own sound: when they join, and each time they answer
    usePlayerSounds(roomData?.roomCode, roomData?.players);
    const lobbyTrack = lobbyTrackFor('couchCast', roomData?.expansion);
    const hasCrew = !!roomData;   // 🛋️ the Couch Cast crew shows up in every deck
    const crewTheme = ['halloween', 'holiday'].includes(roomData?.expansion) ? roomData.expansion : 'core';

    // 🎙️ Voice-overs: one key per "moment worth announcing", so each is spoken exactly once
    const round = roomData?.currentRound;
    const judgeName = roomData?.players?.[roomData.hostId]?.name;
    let voiceMoment = null;
    if (gameState === 'round_intro' && roomData) voiceMoment = `round-intro-${round}`;
    else if (gameState === 'prompt_selection' && judgeName) voiceMoment = `picking-${round}`;
    else if (gameState === 'writing' && currentPrompt) voiceMoment = `prompt-${round}`;
    else if (gameState === 'judging' && submissions && submissions.length === 0) voiceMoment = `no-answers-${round}`;
    // ⚖️ "Sam is judging", then the judging music plays until they pick
    else if (gameState === 'judging' && submissions?.length && judgeName) voiceMoment = `judging-${round}`;
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
            totalRounds: roomData.totalRounds,
        });
    }, [gameState, roomData, roundResults, round]);
    useEffect(() => {
        // The screen changed: stop whatever was being said
        stopVoice();
        if (!voiceMoment || !roomData) return;

        const code = roomData.roomCode;
        const promptText = currentPrompt?.text || currentPrompt;

        if (voiceMoment.startsWith('round-intro')) {
            // "Get ready for round 3!", then on to the prompts (no voice: a moment to see the card instead)
            let isCurrent = true;
            let timer = null;
            const introRound = round;
            const startedAt = Date.now();
            speak(roundIntroLine(introRound), code).then((spoken) => {
                if (!isCurrent) return;
                // 🐈 With the crew on screen, let their bit with the cat finish too
                const sceneLeft = hasCrew ? ROUND_SCENE_MS - (Date.now() - startedAt) : 0;
                timer = setTimeout(() => socket.emit('round_intro_read', { roomCode: code, round: introRound }), Math.max(spoken ? 600 : 3000, sceneLeft));
            });
            // Get the judge's line ready behind it
            if (judgeName) preloadVoice(vibeLine(judgeName), code);
            return () => {
                isCurrent = false;
                clearTimeout(timer);
            };
        } else if (voiceMoment.startsWith('picking')) {
            speak(vibeLine(judgeName), code);
        } else if (voiceMoment.startsWith('judging')) {
            speak(judgingLine(judgeName), code);
        } else if (voiceMoment.startsWith('prompt')) {
            // The judge never picked: the narrator teases them before reading the prompt
            const lines = promptAutoPicked
                ? [VOICE_TOO_SLOW[Math.floor(Math.random() * VOICE_TOO_SLOW.length)], VOICE_PROMPT_INTRO, promptText]
                : [VOICE_PROMPT_INTRO, promptText];
            speak(lines, code);
            // Get the judge's line ready while everyone writes
            preloadVoice(judgingLine(judgeName), code);
        } else if (voiceMoment.startsWith('winner')) {
            const { playerName, answer } = roundResults.winningSubmission;
            // Read the whole card: the prompt with the winning answer in the blank
            const { sentence } = fillBlank(currentPrompt, answer);
            speak([VOICE_WINNER_INTRO, `${sentence} That one came from ${playerName}!`], code);
            // Get the next judge's line ready while the confetti falls
            if (!roundResults.isGameOver && roundResults.nextHostName) preloadVoice(vibeLine(roundResults.nextHostName), code);
        } else if (voiceMoment.startsWith('scores')) {
            // ⏭️ The scores, then what comes next ("It's half time!"), then straight on to the next round.
            // (No voice at all: give everyone a few seconds to read the scoreboard instead.)
            let isCurrent = true;
            let timer = null;
            const scoresRound = round;
            preloadVoice(roundIntroLine(scoresRound + 1), code);
            speak([recap?.spoken, recap?.nextUp], code).then((spoken) => {
                if (!isCurrent) return;
                timer = setTimeout(() => socket.emit('scores_read', { roomCode: code, round: scoresRound }), spoken ? 300 : 4000);
            });
            return () => {
                isCurrent = false;
                clearTimeout(timer);
            };
        } else if (voiceMoment.startsWith('no-answers')) {
            // 👻 "Hey, anyone there?"... then straight on (no voice: a moment to read the screen instead)
            let isCurrent = true;
            let timer = null;
            const emptyRound = round;
            const call = VOICE_ANYONE_THERE[Math.floor(Math.random() * VOICE_ANYONE_THERE.length)];
            const isLastRound = round >= (roomData.totalRounds || 3);
            speak([...call, isLastRound ? VOICE_MOVING_ON_LAST : VOICE_MOVING_ON], code).then((spoken) => {
                if (!isCurrent) return;
                timer = setTimeout(() => socket.emit('no_answers_read', { roomCode: code, round: emptyRound }), spoken ? 300 : 3000);
            });
            return () => {
                isCurrent = false;
                clearTimeout(timer);
            };
        } else if (voiceMoment === 'game-over') {
            // 🥁 The narrator waits for the drum roll, then announces the champion over the cheers,
            // then the lobby's Tower Party credits roll (here and on every phone)
            let isCurrent = true;
            const timer = setTimeout(() => {
                Promise.resolve(recap ? speak(recap.spoken, code) : null).then(() => {
                    if (!isCurrent) return;
                    setShowCredits(true);
                    socket.emit('credits_roll', { roomCode: code });
                });
            }, FINALE_DRUMROLL_MS + 600);
            return () => {
                isCurrent = false;
                clearTimeout(timer);
            };
        }
        return undefined;
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

    // ⏸️ The caster can pause a running game: the server stops every clock, the phones show "Paused"
    const isPaused = !!roomData?.isPaused;
    const canPause = ['round_intro', 'prompt_selection', 'writing', 'judging', 'winner_reveal'].includes(gameState)
        || (gameState === 'scoreboard' && !roundResults?.isGameOver);
    const handleTogglePause = () => socket.emit('set_paused', { roomCode: roomData?.roomCode, paused: !isPaused });
    useEffect(() => {
        if (isPaused) stopVoice();
    }, [isPaused]);

    // ⏳ Tick-tock music while the judge picks a prompt and while everyone writes, and the judging
    // music while the judge reads the answers (all on the server's clock). It stops for a pause and
    // starts a fresh track when the game resumes.
    const isJudgingMusic = gameState === 'judging' && !!submissions?.length;
    const isTimerPhase = (gameState === 'prompt_selection' || gameState === 'writing' || isJudgingMusic) && !isPaused;
    useTimerMusic(isTimerPhase, {
        endTime: toDeviceTime(roomData?.endTime),   // the music's hurry-up tick runs on this device's clock
        key: `${gameState}-${round}`,
        trackId: isJudgingMusic ? JUDGING_TRACK : null,
        theme: roomData?.expansion === 'halloween' ? 'halloween' : null,   // 🎃 spooky tracks for the Halloween deck
    });

    // Fetch the fixed lines while everyone is still joining, so the narrator never starts late
    const lobbyRoomCode = roomData?.roomCode;
    useEffect(() => {
        if (!lobbyRoomCode) return;
        preloadVoice([...RULES_NARRATION, VOICE_PROMPT_INTRO, VOICE_WINNER_INTRO, ...VOICE_TOO_SLOW, ...NEXT_UP_LINES,
            "Hey, anyone there?", 'Hello?', VOICE_MOVING_ON, VOICE_MOVING_ON_LAST], lobbyRoomCode);
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
                    <CouchCastLobby 
                        roomCode={roomData.roomCode} 
                        players={playersArray} musicTrack={lobbyTrack}
                        crew crewTheme={crewTheme} />
                );

            case 'rules':
                return (
                    <CouchCastRules
                        roomCode={roomData.roomCode}
                        crew crewTheme={crewTheme}
                    />
                );

            case 'round_intro':
                return <CouchCastRoundIntro round={roomData.currentRound} totalRounds={roomData.totalRounds} crew={hasCrew} crewTheme={crewTheme} />;

            case 'prompt_selection':
                const pickerName = roomData.players[roomData.hostId]?.name || 'The Judge';
                return (
                    <CouchCastPromptSelection 
                        isCastScreen={true} 
                        judgeName={pickerName} 
                        roomCode={roomData.roomCode} 
                        prompts={roomData.promptOptions}
                        endTime={roomData.endTime}
                    />
                );

            case 'writing':
                return (
                    <CouchCastWritingTV 
                        currentPrompt={currentPrompt} 
                        endTime={roomData.endTime} 
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
                        headline={recap?.headline}
                        nextLabel={recap?.nextUp}
                        celebrate
                        endActions={<GameOverActions onPlayAgain={handlePlayAgain} onGoHome={handleGoHome} />}
                    />
                );

            default:
                return <div><h3 className="text-white">Unknown Game State: {gameState}</h3></div>;
        }
    };

    return (
        // 🎃 A Halloween-deck game: everyone's avatar shows up in costume
        <AvatarTheme theme={roomData?.expansion === 'halloween' ? 'halloween' : null}>
        <Container fluid className="p-0" style={{ minHeight: '100vh'}}>
            <ConnectionLost socket={socket} />
            {errorMessage && (
                <Alert variant="danger" className="text-center m-2 position-absolute w-100" style={{ zIndex: 10002 }}>
                    {errorMessage}
                </Alert>
            )}
            
            {renderGamePhase()}

            {isPaused && <CouchCastPausedOverlay isCaster />}
            {showCredits && gameState === 'scoreboard' && <TowerCredits tower={roomData?.tower} chase={hasCrew} chaseTheme={crewTheme} onDone={() => setShowCredits(false)} />}
            {roomData && (
                <CouchCastCasterControls canPause={canPause || isPaused} isPaused={isPaused} onTogglePause={handleTogglePause} />
            )}

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
        </AvatarTheme>
    );
}