import React, { useEffect, useState } from 'react';
import { Container, Spinner, Alert, Card, Button } from 'react-bootstrap';
import { couchCastSocket as socket } from '../../socket';

// 🎮 Import your mobile screens
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
        // 1. Generate or grab a persistent Player ID for backend reconnection
        let pId = localStorage.getItem('templePlayerId');
        if (!pId) {
            pId = 'player_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('templePlayerId', pId);
        }
        if (!socket.connected) {
                    socket.connect();
                }
        socket.on('connect', () => {
                    socket.emit('joinRoom', { roomCode, playerName, playerId: pId });
                });


        // (If the socket was already connected before this component mounted, emit immediately)
        if (socket.connected) {
             socket.emit('joinRoom', { roomCode, playerName, playerId: pId });
        }

        // 3. Socket listeners
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

        return () => {
            socket.off('sync_game_state', handleSync);
            socket.off('room_updated', handleRoomUpdate);
            socket.off('errorMsg', handleError);
            socket.off('round_ended', handleRoundEnded); 
        };
    }, [roomCode, playerName]);

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
    
    // Find host name dynamically from roomData
    const hostPlayer = roomData.hostId ? roomData.players[roomData.hostId] : null;
    const hostName = hostPlayer ? hostPlayer.name : 'the host';

    // 3. The Switchboard (Mobile UI Navigation)
    switch (gameState) {
        case 'lobby':
            return (
                <Container className="mt-5 d-flex justify-content-center">
                    <Card className="text-center shadow-sm w-100 border-0" style={{ maxWidth: '400px', backgroundColor: '#f8f9fa' }}>
                        <Card.Body className="p-4">
                            <h2 className="text-primary fw-bold mb-3">You're In!</h2>
                            <p className="fs-6 text-muted mb-4">Look up at the TV.</p>
                            
                            {isHost ? (
                                <div className="p-3 border border-warning rounded bg-white shadow-sm">
                                    <p className="fw-bold text-dark mb-3">👑 You are the Room Leader</p>
                                    <Button 
                                        variant="success" 
                                        size="lg" 
                                        className="w-100 fw-bold py-3 fs-5 shadow-sm" 
                                        onClick={handleStartGame}
                                    >
                                        All in!
                                    </Button>
                                </div>
                            ) : (
                                <div className="p-3 border border-dashed rounded bg-light text-muted fs-6">
                                    Waiting for <strong>{hostName}</strong> to start the game...
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Container>
            );

        case 'rules':
            return (
                <Container className="mt-5 pt-4 text-center">
                    <h1 className="text-primary fw-bold mb-3">Welcome to Couch Cast!</h1>
                    <h4 className="text-muted fw-normal">Keep your eyes on the TV to learn how to play.</h4>
                    <Spinner animation="grow" variant="warning" className="mt-5" />
                </Container>
            );

        case 'prompt_selection':
            return <div className="mt-5 text-center"><h4>[Prompt Selection Component Here]</h4></div>;

        case 'writing':
            return <div className="mt-5 text-center"><h4>[Writing Component Here]</h4></div>;

        case 'judging':
             return <div className="mt-5 text-center"><h4>[Judging Component Here]</h4></div>;

        case 'winner_reveal':
             return <div className="mt-5 text-center"><h4>[Winner Reveal Component Here]</h4></div>;

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