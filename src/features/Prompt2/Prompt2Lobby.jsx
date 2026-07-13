import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Container, Card, Badge, Button, Alert, Form, ListGroup } from 'react-bootstrap';
import { prompt2Socket as socket } from '../../socket.js';

export default function Prompt2Lobby() {
    // FIXED: Added () invocation
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // Grab config from URL params sent by Universal Join form
    const roomCode = searchParams.get('room');
    const urlName = searchParams.get('name') || 'Anonymous';
    const role = searchParams.get('role') || 'guest'; 

    const isHost = role === 'host';

    const [players, setPlayers] = useState([]);
    const [error, setError] = useState('');
    const [roomState, setRoomState] = useState(null);
    
    useEffect(() => {
        if (!roomCode) {
            setError('No room code provided!');
            return;
        } 

        if (!socket.connected) {
            console.log("Waiting room socket disconnected. Establishing fresh handshake...");
            socket.connect();
        }

        // Remove pre-existing listener bindings
        socket.off('roomUpdated');
        socket.off('roomStateUpdated');
        socket.off('errorMsg');

        // Tell the server we want to join this room
        socket.emit('joinRoom', { roomCode, playerName: urlName });

        // FIXED: Changed socket.emit to socket.on to properly listen for updates
        socket.on('roomUpdated', (data) => {
            console.log('Lobby updated from Prompt2', data);
            setPlayers(data.players);
        });

        // Listen for gameplay phase transitions from Render backend
        socket.on('roomStateUpdated', (updateRoom) => {
            console.log("Gameplay state update:", updateRoom);
            setRoomState(updateRoom);
        });

        // Listen for any access errors
        socket.on('errorMsg', (msg) => {
            setError(msg);
        });

        // Cleanup connections when the user leaves the page or closes the tab
        return () => {
            socket.off('roomUpdated');
            socket.off('roomStateUpdated');
            socket.off('errorMsg');
        };
    }, [roomCode, urlName]); // FIXED: Closed the useEffect structure correctly with a closing curly brace

    const handleStartGame = () => {
        console.log("Starting Prompt2 game for room:", roomCode);
        socket.emit('startGame', { roomCode });
    };

    return (
        <Container className="mt-5 d-flex justify-content-center">
            <Card className="shadow-sm w-100" style={{ maxWidth: '420px' }}>
                <Card.Body className="text-center">
                    {error && <Alert variant="danger">{error}</Alert>}
                    
                    <Card.Title className="fs-3 fw-bold mb-1 text-success">Waiting Room</Card.Title>
                    <p className="text-muted small mb-4">Game: Judge Style Arena</p>

                    <div className="bg-light p-3 rounded mb-4 border">
                        <span className="text-secondary d-block small fw-bold text-uppercase">Room Code</span>
                        <span className="fs-2 fw-bold text-dark tracking-wide">{roomCode}</span>
                    </div>

                    <h5 className="text-start mb-2 fw-semibold">Players Joined:</h5>
                    <ListGroup className="mb-4 text-start">
                        {players.map((player) => (
                            <ListGroup.Item key={player.id} className="d-flex justify-content-between align-items-center">
                                <span>{player.name}</span>
                                {player.isPlayerHost && (
                                    <Badge bg="primary" className="rounded-pill">Host / Judge</Badge>
                                )}
                            </ListGroup.Item>
                        ))}
                    </ListGroup>

                {isHost ? (
                    <Button 
                        variant="primary" 
                        className="w-100 fw-bold py-2"
                        disabled={players.length < 3}
                        onClick={handleStartGame}
                    >
                        {/* UPDATED: Changed 'Start Game' to 'All in!' */}
                        {players.length < 3 ? 'Waiting for Players (Min 3)' : 'All in!'}
                    </Button>
                ) : (
                    <div className="text-muted small py-2 border border-dashed rounded bg-light">
                        Waiting for the host to start the game...
                    </div>
                )}
                </Card.Body>
            </Card>
        </Container>
    );
}