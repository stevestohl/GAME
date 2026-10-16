import React, { useState, useEffect } from 'react';
import { Container, Alert, Spinner } from 'react-bootstrap';
import { listsSocket as socket } from '../../socket';

import useWakeLock from '../../hooks/useWakeLock.js';
import { useSetBackgroundTheme, listsTheme } from '../Menu/backgroundTheme.js';
import { speak, stopVoice, preloadVoice, unlockVoice, canPlaySound } from '../../voice.js';
import { startLobbyMusic } from '../CouchCast/lobbyMusic.js';
import { useTimerMusic } from '../../timerMusic.js';

// TV screens (the lobby and scoreboard are shared with Couch Cast)
import CouchCastLobby from '../CouchCast/CouchCastLobby.jsx';
import CouchCastScoreboardTV from '../CouchCast/CouchCastScoreboardTV.jsx';
import { ListCastRulesTV, LIST_CAST_RULES_NARRATION } from './ListRules.jsx';
import { ListCardTV, ListWritingTV, ListBoardTV } from './ListScreensTV.jsx';
import { cardAnnouncement, ALL_CARD_ANNOUNCEMENTS } from './ListCards.jsx';

// Phone controller
import ListPlayer from './ListPlayer.jsx';

/**
 * 📺📝 List Cast. One address, two jobs:
 *   role=caster -> the TV screen (this component)
 *   role=guest  -> a player's phone (ListPlayer)
 */
export default function ListCastManager() {
    useWakeLock();

    const searchParams = new URLSearchParams(window.location.search);
    const urlRoomCode = (searchParams.get('room') || '').toUpperCase();
    const urlPlayerName = searchParams.get('name') || 'Caster';
    const urlRole = searchParams.get('role');

    if (urlRole === 'guest') {
        return (
            <>
                <ListPlayer roomCode={urlRoomCode} playerName={urlPlayerName} mode="cast" />
                {urlRoomCode && (
                    <div className="cc-room-code">
                        Room <strong>{urlRoomCode}</strong>
                    </div>
                )}
            </>
        );
    }

    return <ListCastTV roomCode={urlRoomCode} casterName={urlPlayerName} />;
}

function ListCastTV({ roomCode, casterName }) {
    const [room, setRoom] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const gameState = room?.gameState;

    // 🎨 Background follows the deck, and covers the nav bar on the TV
    useSetBackgroundTheme(listsTheme(room?.expansion), true);

    // --- SOCKET LISTENERS ---
    useEffect(() => {
        // (Re)join our room on every connection: first load, a refresh, or a network blip
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

    // 🎙️ Voice-overs: one key per moment, so each is spoken exactly once
    let voiceMoment = null;
    if (gameState === 'card' && room.card) voiceMoment = `card-${room.currentRound}`;
    else if (gameState === 'writing' && room.category) voiceMoment = `writing-${room.currentRound}`;
    else if (gameState === 'voting') voiceMoment = `voting-${room.currentRound}`;
    else if (gameState === 'scoreboard' && room.isGameOver) voiceMoment = 'game-over';

    useEffect(() => {
        stopVoice();
        if (!voiceMoment || !room) return;
        const code = room.roomCode;

        if (voiceMoment.startsWith('card')) {
            speak(cardAnnouncement(room.card), code);
        } else if (voiceMoment.startsWith('writing')) {
            speak(`${room.category}. Go!`, code);
        } else if (voiceMoment.startsWith('voting')) {
            speak('Time to vote! Does everything left really count?', code);
        } else if (voiceMoment === 'game-over') {
            const champion = Object.values(room.players)
                .filter((p) => !p.isCaster)
                .sort((a, b) => (b.score || 0) - (a.score || 0))[0];
            if (champion && champion.score > 0) speak(`That's the game! ${champion.name} wins with ${champion.score} points. Thanks for playing!`, code);
        }
    }, [voiceMoment]);

    // ⏳ Tick-tock music while everyone writes their lists
    useTimerMusic(gameState === 'writing', { endTime: room?.endTime, key: room?.currentRound });

    // Fetch the rules narration while everyone is still joining, so it starts instantly
    const lobbyRoomCode = room?.roomCode;
    useEffect(() => {
        if (lobbyRoomCode) preloadVoice([...LIST_CAST_RULES_NARRATION, ...ALL_CARD_ANNOUNCEMENTS], lobbyRoomCode);
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
                return <CouchCastLobby title="List Cast Room Created" roomCode={room.roomCode} players={playersArray} />;
            case 'rules':
                return <ListCastRulesTV roomCode={room.roomCode} pointsPerItem={room.pointsPerItem} listSize={room.listSize} />;
            case 'card':
                return <ListCardTV room={room} />;
            case 'writing':
                return <ListWritingTV room={room} />;
            case 'compare':
            case 'voting':
            case 'results':
                return <ListBoardTV room={room} />;
            case 'scoreboard':
                return <CouchCastScoreboardTV players={playersArray} isGameOver={room.isGameOver} nextLabel="Next list coming up..." />;
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
