import React, { useEffect, useState } from 'react';
import { Container, Spinner, Alert, Card } from 'react-bootstrap';
import { couchCastSocket as socket } from '../../socket';

// 🎮 Import your mobile screens as you build them!
import CouchCastScoreboard from './CouchCastScoreboard.jsx';
import CouchCastRules from './CouchCastRules';
import CouchCastPromptSelection from './CouchCastPromptSelection';

export default function CouchCastPlayerSetup({ roomCode, playerName }) {
    const [gameState, setGameState] = useState('joining');
    const [roomData, setRoomData] = useState(null);
    const [playerData, setPlayerData] = useState(null);
    const [error, setError] = useState('');
    const [roundResults, setRoundResults] = useState(null);

    useEffect(() => {
        // 1. Generate or grab a persistent Player ID for your backend's reconnection logic
        let pId = localStorage.getItem('templePlayerId');
        if (!pId) {
            pId = 'player_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('templePlayerId', pId);
        }

        // 2. Emit the join event to your backend socket handler
        socket.emit('joinRoom', { roomCode, playerName, playerId: pId });

        // 3. Listen for state synchronization from the server
        const handleSync = (payload) => {
            setGameState(payload.gameState);
            setRoomData(payload.roomData);
            setPlayerData(payload.playerStatus);
        };

        const handleRoomUpdate = (room) => {
            setRoomData(room);
            setGameState(room.gameState);
            if (room.players[socket.id]) {
                setPlayerData(room.players[socket.id]);
            }
        };

        const handleError = (msg) => {
            setError(msg);
            setGameState('error');
        };

        socket.on('sync_game_state', handleSync);
        socket.on('room_updated', handleRoomUpdate);
        socket.on('errorMsg', handleError);
        // Add this inside the useEffect:
        socket.on('round_ended', (data) => {
            setGameState(data.gameState);
            setRoundResults({
                winner: data.winner,
                nextHostName: data.nextHostName,
                isGameOver: data.isGameOver
            });
        });

        // Don't forget to clean it up in the return statement!
        socket.off('round_ended');

        // Cleanup listeners on unmount
        return () => {
            socket.off('sync_game_state', handleSync);
            socket.off('room_updated', handleRoomUpdate);
            socket.off('errorMsg', handleError);
        };
    }, [roomCode, playerName]);

    // ==========================================
    // RENDER VIEWS BASED ON GAME STATE
    // ==========================================
    
    // 1. Error State (e.g., room code didn't exist)
    if (gameState === 'error') {
        return (
            <Container className="mt-5 text-center d-flex justify-content-center">
                <Alert variant="danger" className="fw-bold shadow-sm" style={{ maxWidth: '400px'}}>
                    {error}
                </Alert>
            </Container>
        );
    }

    // 2. Loading State (Connecting to server)
    if (gameState === 'joining' || !roomData || !playerData) {
        return (
            <Container className="mt-5 text-center">
                <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
                <h4 className="mt-3 text-muted">Connecting to room {roomCode}...</h4>
            </Container>
        );
    }

    // --- Helper Variables for Game Logic ---
    const isHost = playerData.isPlayerHost;
    const isJudge = socket.id === roomData.hostId;
    const judgeName = roomData.players[roomData.hostId]?.name || 'The Judge';

    // 3. The Switchboard (Mobile UI Navigation)
    switch (gameState) {
        case 'lobby':
            return (
                <Container className="mt-5 d-flex justify-content-center">
                    <Card className="text-center shadow-sm w-100 border-0" style={{ maxWidth: '400px', backgroundColor: '#f8f9fa' }}>
                        <Card.Body className="p-5">
                            <h2 className="text-primary fw-bold mb-3">You're In!</h2>
                            <p className="fs-5 text-muted mb-4">Look up at the TV.</p>
                            {isHost && (
                                <div className="p-2 border border-warning rounded bg-white text-dark fw-bold">
                                    👑 You are the VIP Host
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Container>
            );

        case 'rules':
            // Render the component we built earlier!
            return <div className="mt-5 text-center"><h4>[Rules Component Here]</h4></div>
            // return <CouchCastRules roomCode={roomCode} isHost={isHost} />

        case 'prompt_selection':
            // Render the component we built earlier!
            return <div className="mt-5 text-center"><h4>[Prompt Selection Component Here]</h4></div>
            // return <CouchCastPromptSelection isCastScreen={false} isJudge={isJudge} judgeName={judgeName} roomCode={roomCode} prompts={roomData.promptOptions} />

        case 'writing':
            return (
                <CouchCastWriting 
                    roomCode={roomCode} 
                    isJudge={isJudge} 
                    currentPrompt={roomData.currentPrompt} 
                    hasSubmitted={playerData.hasSubmitted}
                    hasWriteInCard={!playerData.hasUsedWriteIn} 
                />
            );

        case 'judging':
            return (
                    <CouchCastJudging 
                        roomCode={roomCode} 
                        isJudge={isJudge} 
                        currentPrompt={roomData.currentPrompt} 
                        // We pass the anonymous submissions so the judge has buttons to click!
                        submissions={roomData.submissions} 
                    />
            );

        case 'winner_reveal':
            return (
                <CouchCastWinnerReveal 
                    roomCode={roomCode} 
                    isJudge={isJudge} // This automatically points to the NEXT judge!
                    winner={roundResults?.winner} 
                    nextHostName={roundResults?.nextHostName} 
                    isGameOver={roundResults?.isGameOver} 
                    isWinner={playerData.id === roundResults?.winner?.id} 
                />
            );
        case 'scoreboard':
            return (
                    <CouchCastScoreboard 
                        playerData={playerData} 
                        players={Object.values(roomData.players)} 
                    />
                );


        default:
            return (
                <Container className="mt-5 text-center">
                    <Spinner animation="grow" variant="warning" />
                    <h4 className="mt-3 text-muted">Wait for it...</h4>
                </Container>
            );
    }
}