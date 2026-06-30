import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Container, Card, ListGroup, Badge, Button, Alert } from 'react-bootstrap';
import socket from './socket.js';

export default function TriviaWaitingRoom() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // Grab configuration from the URL params sent by UniversalJoinForm
    const roomCode = searchParams.get('room');
    const urlName = searchParams.get('name') || 'Anonymous';
    const role = searchParams.get('role') || 'guest'; // 'host' or 'guest'

    const [players, setPlayers] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!roomCode) {
            setError('No room code provided!');
            return;
        }

        // 1. Tell the server we want to join this room
        socket.emit('joinRoom', { roomCode, playerName: urlName });

        // 2. Listen for real-time room synchronization updates
        socket.on('roomUpdated', (data) => {
            console.log("Lobby updated from server:", data);
            setPlayers(data.players);
        });

        // 3. Listen for any access errors (e.g., room doesn't exist)
        socket.on('errorMsg', (msg) => {
            setError(msg);
        });

        // Cleanup connections when the user leaves the page or closes the tab
        return () => {
            socket.off('roomUpdated');
            socket.off('errorMsg');
        };
    }, [roomCode, urlName]);

    if (error) {
        return (
            <Container className="mt-5 text-center" style={{ maxWidth: '400px' }}>
                <Alert variant="danger">{error}</Alert>
                <Button variant="primary" onClick={() => navigate('/')}>Back to Home</Button>
            </Container>
        );
    }

    return (
        <Container className="mt-5 d-flex justify-content-center">
            <Card className="shadow-sm w-100" style={{ maxWidth: '420px' }}>
                <Card.Body className="text-center">
                    <Card.Title className="fs-3 fw-bold mb-1 text-primary">Lobby Waiting Room</Card.Title>
                    <Card.Text className="text-muted small mb-4">Temple-Trivia</Card.Text>

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
                        <Button variant="primary" className="w-100 fw-bold py-2 shadow-sm">
                            Start Game
                        </Button>
                    ) : (
                        <div className="text-muted small py-2 border border-dashed rounded bg-light">
                            ⏳ Waiting for host to launch the match...
                        </div>
                    )}
                </Card.Body>
            </Card>
        </Container>
    );
}