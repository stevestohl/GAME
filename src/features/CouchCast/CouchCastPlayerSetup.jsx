import React, { useEffect, useState } from 'react';
import { Container, Spinner, Alert, Card, Button } from 'react-bootstrap';
import { couchCastSocket as socket } from '../../socket';

// 🎮 Import your mobile screens as you build them!
import CouchCastScoreboard from './CouchCastScoreboard.jsx';
// import CouchCastRules from './CouchCastRules';
// import CouchCastPromptSelection from './CouchCastPromptSelection';

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

        const handleRoundEnded = (data) => {
            setGameState(data.gameState);
            setRoundResults({
                winner: data.winner,
                nextHostName: data.nextHostName,
                isGameOver: data.isGameOver
            });
        };

        socket.on('sync_game_state', handleSync);
        socket.on('room_updated', handleRoomUpdate);
        socket.on('errorMsg', handleError);
        socket.on('round_ended', handleRoundEnded);

        // FIX: Cleanup listeners on unmount
        return () => {
            socket.off('sync_game_state', handleSync);
            socket.off('room_updated', handleRoomUpdate);
            socket.off('errorMsg', handleError);
            socket.off('round_ended', handleRoundEnded); 
        };
    }, [roomCode, playerName]);

    // Added function so the VIP Host can start the game from their phone
    const handleStartGame = () => {
        socket.emit('showRules', { roomCode });
    };

    // ==========================================
    // RENDER VIEWS BASED ON GAME STATE
    // ==========================================
    
    // 1. Error State
    if (gameState === 'error') {
        return (
            <Container className="mt-5 text-center d-flex justify-content-center">
                <Alert variant="danger" className="fw-bold shadow-sm" style={{ maxWidth: '400px'}}>
                    {error}
                </Alert>
            </Container>
        );
    }

    // 2. Loading State 
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
                        <Card.Body className="p-4">
                            <h2 className="text-primary fw-bold mb-3">You're In!</h2>
                            <p className="fs-5 text-muted mb-4">Look up at the TV.</p>
                            
                            {/* FIX: Gave the VIP Host the power to start the game! */}
                            {isHost ? (
                                <div className="p-3 border border-warning rounded bg-white shadow-sm">
                                    <p className="fw-bold text-dark mb-3">👑 You are the VIP Host</p>
                                    <Button variant="primary" size="lg" className="w-100 fw-bold py-2" onClick={handleStartGame}>
                                        All In (Start Game)
                                    </Button>
                                </div>
                            ) : (
                                <div className="text-muted small py-2 border border-dashed rounded bg-light">
                                    Waiting for the VIP Host to start the game...
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Container>
            );

        case 'rules':
            return <div className="mt-5 text-center"><h4>[Rules Component Here]</h4></div>;
            // return <CouchCastRules roomCode={roomCode} isHost={isHost} />

        case 'prompt_selection':
            return <div className="mt-5 text-center"><h4>[Prompt Selection Component Here]</h4></div>;
            // return <CouchCastPromptSelection isCastScreen={false} isJudge={isJudge} judgeName={judgeName} roomCode={roomCode} prompts={roomData.promptOptions} />

        case 'writing':
            return <div className="mt-5 text-center"><h4>[Writing Component Here]</h4></div>;
            /* return (
                <CouchCastWriting 
                    roomCode={roomCode} 
                    isJudge={isJudge} 
                    currentPrompt={roomData.currentPrompt} 
                    hasSubmitted={playerData.hasSubmitted}
                    hasWriteInCard={!playerData.hasUsedWriteIn} 
                />
            ); */

        case 'judging':
             return <div className="mt-5 text-center"><h4>[Judging Component Here]</h4></div>;
             /* return (
                    <CouchCastJudging 
                        roomCode={roomCode} 
                        isJudge={isJudge} 
                        currentPrompt={roomData.currentPrompt} 
                        submissions={roomData.submissions} 
                    />
            ); */

        case 'winner_reveal':
             return <div className="mt-5 text-center"><h4>[Winner Reveal Component Here]</h4></div>;
             /* return (
                <CouchCastWinnerReveal 
                    roomCode={roomCode} 
                    isJudge={isJudge} 
                    winner={roundResults?.winner} 
                    nextHostName={roundResults?.nextHostName} 
                    isGameOver={roundResults?.isGameOver} 
                    isWinner={playerData.id === roundResults?.winner?.id} 
                />
            ); */

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