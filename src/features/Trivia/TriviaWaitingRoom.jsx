import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Container, Card, ListGroup, Badge, Button, Alert } from 'react-bootstrap';
import {triviaSocket as socket } from '../../socket.js';

import RulesScreen from '../../components/RulesScreen.jsx';
import QuestionScreen from '../../components/QuestionScreen.jsx';
import ScoreboardScreen from '../../components/ScoreboardScreen.jsx';

export default function TriviaWaitingRoom() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // Grab configuration from the URL params sent by UniversalJoinForm
    const roomCode = searchParams.get('room');
    const urlName = searchParams.get('name') || 'Anonymous';
    const role = searchParams.get('role') || 'guest'; // 'host' or 'guest'

    const [players, setPlayers] = useState([]);
    const [error, setError] = useState('');
    // Tracks roomState from Render Server
    const [roomState, setRoomState] = useState(null);

    useEffect(() => {
        if (!roomCode) {
            setError('No room code provided!');
            return;
        }

        // Ensure socket connects to namespace
        if(!socket.connected) {
            console.log("Waiting room socket disconnected. Estabilishing fresh handshake...")
            socket.connect()
        }
        // Removes pre-existing listener bindings - looks like double code, but isn't, so keep it
        socket.off('roomUpdated');
        socket.off('roomStateUpdated');
        socket.off('errorMsg');

        // Tell the server we want to join this room            
        socket.emit('joinRoom', { roomCode, playerName: urlName });

        // Listen for real-time room synchronization updates
        socket.on('roomUpdated', (data) => {
            console.log("Lobby updated from trivia server:", data);
            setPlayers(data.players);
        });

        // Listen for gameplay phase transitions from Render backend
        socket.on('roomStateUpdated', (updateRoom) => {
            console.log("Gameplay state update:", updateRoom);
            setRoomState(updateRoom);
        });

        // Listen for any access errors (e.g., room doesn't exist)
        socket.on('errorMsg', (msg) => {
            setError(msg);
        });

        // Cleanup connections when the user leaves the page or closes the tab
        return () => {
            socket.off('roomUpdated');
            socket.off('roomStateUpdated');
            socket.off('errorMsg');
        };
    }, [roomCode, urlName]);

    // Emits activation trigger to backend to pull Questions
    const handleStartGame = () => {
        console.log("Starting trivia match for room: ", roomCode)
        socket.emit('startGame', { roomCode });
    };

    if (error) {
        return (
            <Container className="mt-5 text-center" style={{ maxWidth: '400px' }}>
                <Alert variant="danger">{error}</Alert>
                <Button variant="primary" onClick={() => navigate('/')}>Back to Home</Button>
            </Container>
        );
    }

    // =========================================================================
    // DYNAMIC PHASE CONTROLLER EVALUATION
    // =========================================================================
    if (roomState) {
        switch (roomState.phase) {
            case 'RULES':
                return (
                    <RulesScreen 
                        roomCode={roomCode} 
                        isHost={role === 'host'} 
                    />
                );
                
            case 'QUESTION':
                return (
                    <QuestionScreen 
                        roomCode={roomCode}
                        currentQuestion={roomState.questions[roomState.currentRound]}
                        playerAnswers={roomState.playerAnswers}
                    />
                );
                
            case 'SCOREBOARD':
                return (
                    <ScoreboardScreen 
                        roomCode={roomCode}
                        players={roomState.players}
                        isHost={role === 'host'}
                    />
                );
                
            case 'FINAL_RESULTS':
                return (
                    <Container className="mt-5 text-center" style={{ maxWidth: '420px' }}>
                        <Card className="shadow-sm p-4">
                            <h2 className="text-primary fw-bold">🏆 Game Over!</h2>
                            <p className="text-muted">Final Podiums Go Here</p>
                            <Button variant="primary" onClick={() => navigate('/')}>Return Home</Button>
                        </Card>
                    </Container>
                );
        }
    }

    // =========================================================================
    // DEFAULT LOBBY VIEW (If no phase has been launched yet)
    // =========================================================================
    return (
        <Container className="mt-5 d-flex justify-content-center">
            <Card className="shadow-sm w-100" style={{ maxWidth: '420px' }}>
                <Card.Body className="text-center">
                    <Card.Title className="fs-3 fw-bold mb-4 text-primary">Trivia Waiting Room</Card.Title>
                    {/* <Card.Text className="text-muted small mb-4">Temple-Trivia</Card.Text> */}

                    {/* Room Code Banner */}
                    <div className="bg-light border border-secondary rounded p-3 mb-4">
                        <span className="text-uppercase tracking-wider small fw-bold text-muted d-block mb-1">
                            Room Code
                        </span>
                        <span className="fs-2 fw-black text-dark tracking-widest">{roomCode}</span>
                    </div>

                    {/* Live Player Roster */}
                    <h5 className="text-start fw-bold mb-2 px-1">
                        Players Joined 
                        <Badge bg="secondary" className="ms-2">{players.length}</Badge>
                    </h5>
                    
                    <ListGroup className="mb-4 text-start border border-secondary rounded">
                        {players.map((player) => (
                            <ListGroup.Item 
                                key={player.id} 
                                className="d-flex justify-content-between align-items-center py-2.5 fw-semibold"
                            >
                                <span>{player.name}</span>
                                {player.id === socket.id ? (
                                    <Badge bg="primary">You</Badge>
                                ) : (
                                    <span className="text-muted small">Ready</span>
                                )}
                            </ListGroup.Item>
                        ))}
                    </ListGroup>

                    {/* Action Controls */}
                    {role === 'host' ? (
                        <Button 
                            variant="primary" 
                            className="w-100 fw-bold py-2 shadow-sm"
                            onClick={handleStartGame} // FIX: Connected the click listener
                        >
                            Start Game
                        </Button>
                    ) : (
                        <div className="text-muted small py-2 border border-dashed rounded bg-light">
                            Waiting for host to launch the match...
                        </div>
                    )}
                </Card.Body>
            </Card>
        </Container>
    );
}