import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Form, ListGroup } from 'react-bootstrap';
import io from 'socket.io-client'; // Replace with your central socket import if you have one

// Connecting to our prompt2 namespace
const prompt2Socket = io('http://localhost:5000/prompt2'); // Adjust URL/port to match your server

export default function Prompt2Lobby() {
    const [name, setName] = useState('');
    const [roomCode, setRoomCode] = useState('');
    const [roomData, setRoomData] = useState(null); // Holds { host, players, status }
    const [isHost, setIsHost] = useState(false);

    useEffect(() => {
        // Listen for successful room creation/update
        prompt2Socket.on('roomCreated', (data) => {
            setRoomData(data);
        });

        // Clean up listeners on unmount
        return () => {
            prompt2Socket.off('roomCreated');
        };
    }, []);

    const handleCreateRoom = (e) => {
        e.preventDefault();
        if (!name.trim()) return alert('Please enter a name!');

        // Generate a random 4-character room code
        const generatedCode = Math.random().toString(36).substring(2, 6).toUpperCase();
        setRoomCode(generatedCode);
        setIsHost(true);

        // Emit to prompt2_controller.js
        prompt2Socket.emit('createRoom', { roomCode: generatedCode, hostName: name });
    };

    const handleStartGame = () => {
        // This will transition everyone to the active game screen later
        prompt2Socket.emit('startGame', { roomCode });
    };

    // --- STATE 1: Create Room Form ---
    if (!roomData) {
        return (
            <Container className="mt-5 d-flex justify-content-center">
                <Card className="shadow-sm w-100" style={{ maxWidth: '420px' }}>
                    <Card.Body className="text-center">
                        <Card.Title className="fs-3 fw-bold mb-3 text-primary">Prompt2 Setup</Card.Title>
                        <Form onSubmit={handleCreateRoom}>
                            <Form.Group className="mb-3 text-start">
                                <Form.Label className="fw-semibold">Your Name</Form.Label>
                                <Form.Control 
                                    type="text" 
                                    placeholder="Enter name" 
                                    value={name} 
                                    onChange={(e) => setName(e.target.value)} 
                                />
                            </Form.Group>
                            <Button type="submit" variant="primary" className="w-100 fw-bold">
                                Create Room
                            </Button>
                        </Form>
                    </Card.Body>
                </Card>
            </Container>
        );
    }

    // --- STATE 2: Waiting Room Lobby ---
    return (
        <Container className="mt-5 d-flex justify-content-center">
            <Card className="shadow-sm w-100" style={{ maxWidth: '420px' }}>
                <Card.Body className="text-center">
                    <Card.Title className="fs-3 fw-bold mb-1 text-success">Waiting Room</Card.Title>
                    <p className="text-muted small mb-4">Game: Apples-to-Apples Style</p>

                    <div className="bg-light p-3 rounded mb-4 border">
                        <span className="text-secondary d-block small fw-bold text-uppercase">Room Code</span>
                        <span className="fs-2 fw-bold text-dark tracking-wide">{roomCode}</span>
                    </div>

                    <h5 className="text-start mb-2 fw-semibold">Players Joined:</h5>
                    <ListGroup className="mb-4 text-start">
                        {roomData.players.map((player) => (
                            <ListGroup.Item key={player.id} className="d-flex justify-content-between align-items-center">
                                <span>{player.name}</span>
                                {player.name === roomData.host && (
                                    <span className="badge bg-primary rounded-pill">Host</span>
                                )}
                            </ListGroup.Item>
                        ))}
                    </ListGroup>

                    {isHost ? (
                        <Button 
                            variant="success" 
                            className="w-100 fw-bold py-2"
                            disabled={roomData.players.length < 3} // Apples to apples usually needs at least 3 players
                            onClick={handleStartGame}
                        >
                            {roomData.players.length < 3 ? 'Waiting for Players (Min 3)' : 'Start Game'}
                        </Button>
                    ) : (
                        <div className="text-muted italic small animate-pulse">
                            Waiting for the host to start the game...
                        </div>
                    )}
                </Card.Body>
            </Card>
        </Container>
    );
}