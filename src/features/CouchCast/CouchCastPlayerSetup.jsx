import React, { useEffect, useState } from 'react';
import { Container, Spinner, Alert, Card, Button } from 'react-bootstrap';
import { couchCastSocket as socket } from '../../socket';

// 🎮 Import your mobile screens
import CouchCastScoreboard from './CouchCastScoreboard.jsx';
import CouchCastPromptSelection from './CouchCastPromptSelection.jsx';
import CouchCastWritingPlayer from './CouchCastWritingPlayer.jsx';
import CouchCastJudging from './CouchCastJudging.jsx'; // 👈 IMPORTED OUR JUDGING COMPONENT

export default function CouchCastPlayerSetup({ roomCode, playerName }) {
    const [gameState, setGameState] = useState('joining');
    const [roomData, setRoomData] = useState(null);
    const [playerData, setPlayerData] = useState(null);
    const [error, setError] = useState('');
    
    const [roundResults, setRoundResults] = useState(null);
    const [submissions, setSubmissions] = useState([]); // 👈 Added state to hold the anonymous answers for the judge

    useEffect(() => {
        // 1. Generate or grab a persistent Player ID for backend reconnection
        let pId = localStorage.getItem('templePlayerId');
        if (!pId) {
            pId = 'player_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('templePlayerId', pId);
        }
        
        // 🚨 Connection logic
        if (!socket.connected) {
            socket.connect();
        }
        
        socket.on('connect', () => {
            socket.emit('joinRoom', { roomCode, playerName, playerId: pId });
        });

        if (socket.connected) {
             socket.emit('joinRoom', { roomCode, playerName, playerId: pId });
        }

        // 3. Socket listeners
        const handleSync = (payload) => {
            setGameState(payload.gameState);
            setRoomData(payload.roomData);
            setPlayerData(payload.playerStatus);
            if (payload.submissions) setSubmissions(payload.submissions);
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

        // 👈 Added listener for when judging starts
        const handleStartJudging = (data) => {
            setGameState(data.gameState);
            setSubmissions(data.submissions);
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
        socket.on('start_judging', handleStartJudging); // 👈 Listening here
        socket.on('round_ended', handleRoundEnded);

        return () => {
            socket.off('sync_game_state', handleSync);
            socket.off('room_updated', handleRoomUpdate);
            socket.off('errorMsg', handleError);
            socket.off('start_judging', handleStartJudging);
            socket.off('round_ended', handleRoundEnded); 
        };
    }, [roomCode, playerName]);

    const handleStartGame = () => {
        socket.emit('showRules', { roomCode });
    };

    // ==========================================
    // RENDER VIEWS BASED ON GAME STATE
    // ==========================================
    
    if (gameState === 'error') {
        return (
            <Container className="mt-5 text-center d-flex justify-content-center">
                <Alert variant="danger" className="fw-bold shadow-sm" style={{ maxWidth: '400px'}}>
                    {error}
                </Alert>
            </Container>
        );
    }

    if (gameState === 'joining' || !roomData || !playerData) {
        return (
            <Container className="mt-5 text-center">
                <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
                <h4 className="mt-3 text-muted">Connecting to room {roomCode}...</h4>
            </Container>
        );
    }

    const isHost = playerData.isPlayerHost;
    const hostPlayer = roomData.hostId ? roomData.players[roomData.hostId] : null;
    const hostName = hostPlayer ? hostPlayer.name : 'the host';

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
                                    <Button variant="success" size="lg" className="w-100 fw-bold py-3 fs-5 shadow-sm" onClick={handleStartGame}>
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
            return (
                <CouchCastPromptSelection 
                    isJudge={isHost} 
                    judgeName={hostName} 
                    roomCode={roomCode} 
                    prompts={roomData.promptOptions} 
                />
            );

        case 'writing':
            return (
                <CouchCastWritingPlayer 
                    roomCode={roomCode}
                    currentPrompt={roomData.currentPrompt}
                    endTime={roomData.endTime}
                    isJudge={isHost}
                    hasSubmitted={playerData.hasSubmitted}
                />
            );

        case 'judging':
             // 👈 WIRED UP THE JUDGE CONTROLLER
             return (
                 <CouchCastJudging 
                     roomCode={roomCode} 
                     isJudge={isHost} 
                     currentPrompt={roomData.currentPrompt} 
                     submissions={submissions} 
                 />
             );

        case 'winner_reveal':
             // 👈 NEW VIEW: Passive phone screen while TV shows fireworks
             const didIWin = roundResults?.winner?.id === playerData.id;
             
             return (
                 <Container className="mt-5 d-flex justify-content-center">
                     <Card className={`text-center shadow-sm w-100 border-0 ${didIWin ? 'bg-success text-white' : 'bg-light'}`} style={{ maxWidth: '400px' }}>
                         <Card.Body className="p-5">
                             {didIWin ? (
                                 <>
                                     <h1 className="display-1 mb-3">🏆</h1>
                                     <h2 className="fw-bold">You Won!</h2>
                                     <p className="fs-5">The judge loved your answer.</p>
                                 </>
                             ) : (
                                 <>
                                     <h1 className="display-1 mb-3">👀</h1>
                                     <h3 className="fw-bold text-dark">Look at the TV!</h3>
                                     <p className="text-muted">
                                         {roundResults?.winner?.name || 'Someone'} won this round.
                                     </p>
                                 </>
                             )}
                         </Card.Body>
                     </Card>
                 </Container>
             );

        case 'scoreboard':
            // The players just wait here passively. The backend timer will automatically 
            // kick everyone back to 'prompt_selection' after a few seconds!
            return (
                <CouchCastScoreboard 
                    playerData={playerData} 
                    players={Object.values(roomData.players)} 
                    isGameOver={roundResults?.isGameOver}
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