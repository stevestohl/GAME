import React, { useState, useEffect } from 'react';
import { Container, Alert, Spinner } from 'react-bootstrap';
import { couchCastSocket as socket } from "../../socket";

// Phase Components
import CouchCastLobby from './CouchCastLobby.jsx';
import CouchCastWritingTV from './CouchCastWritingTV.jsx';
import CouchCastJudgingTV from './CouchCastJudgingTV.jsx';
import CouchCastWinerREvealTV from './CouchCastWinnerRevealTV.jsx'
//import CouchCastRulesTV from './CouchCastRulesTV.jsx';
import CouchCastScoreboardTV from './CouchCastScoreboardTV.jsx';
//import CouchCastPromptSelectionTV from './CouchCastPromptSelectionTV.jsx';

export default function CouchCastManager() {
    // --- STATE MANAGEMENT ---
    const [gameState, setGameState] = useState('creating'); // Start by creating!
    const [roomData, setRoomData] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");
    
    // Phase-specific state for the TV
    const [endTime, setEndTime] = useState(null);
    const [currentPrompt, setCurrentPrompt] = useState(null);
    const [submissions, setSubmissions] = useState(null);
    const [roundResults, setRoundResults] = useState(null);

    // --- SOCKET LISTENERS ---
    useEffect(() => {
        // 1. Instantly create the room when the TV component mounts!
        socket.emit('createRoom', { playerName: 'Caster' });

        socket.on('roomCreated', ({ roomCode, players }) => {
            console.log(`TV Room Created: ${roomCode}`);
            // We wait for 'room_updated' to actually shift the state
        });

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
                nextHostName: data.nextHostName,
                isGameOver: data.isGameOver
            });
        });

        socket.on('errorMsg', (msg) => {
            setErrorMessage(msg);
            setTimeout(() => setErrorMessage(""), 5000);
        });

        return () => {
            socket.off('roomcreated');
            socket.off('sync_game_state');
            socket.off('room_updated');
            socket.off('writing_phase_started');
            socket.off('start_judging');
            socket.off('round_ended');
            socket.off('errorMsg');
        };
    }, []);

    // --- RENDER LOGIC ---
    const renderGamePhase = () => {
        if (gameState === 'creating' || !roomData) {
            return (
                <div className="text-center mt-5">
                    <Spinner animation="border" variant="primary" />
                    <h3 className="mt-3">Powering up the TV...</h3>
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
                        isHost={false} // TV is never the host!
                    />
                );

            case 'rules':
                return <div><h3>[TV View: Read Rules on Phone]</h3></div>;

            case 'prompt_selection':
                return <div><h3>[TV View: Timer & Judge is picking...]</h3></div>;

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
            // Find the Judge's name to display
                const judgeName = roomData.players[roomData.hostId]?.name || 'The Judge';
                return (
                    <CouchCastJudgingTV 
                        currentPrompt={currentPrompt} 
                        submissions={submissions} 
                        judgeName={judgeName} 
                    />
                );

            case 'winner_reveal':
                return (
                        <CouchCastWinnerRevealTV 
                            currentPrompt={currentPrompt} 
                            winner={roundResults?.winner} 
                            nextHostName={roundResults?.nextHostName} 
                            isGameOver={roundResults?.isGameOver} 
                        />
                    );

            case 'scoreboard':
                return <CouchCastScoreboardTV players={playersArray} />;

            default:
                return <div><h3>Unknown Game State: {gameState}</h3></div>;
        }
    };

    return (
        <Container fluid className="p-0">
            {errorMessage && (
                <Alert variant="danger" className="text-center m-2 position-absolute w-100" style={{ zIndex: 999 }}>
                    {errorMessage}
                </Alert>
            )}
            
            {renderGamePhase()}
        </Container>
    );
}