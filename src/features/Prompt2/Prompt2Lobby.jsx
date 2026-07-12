import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Form, ListGroup } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom'; // 🎣 Import this to parse URL strings
import io from 'socket.io-client';

const SOCKET_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/prompt2' 
    : 'https://game-temple-backend.onrender.com/prompt2';

const prompt2Socket = io(SOCKET_URL);

export default function Prompt2Lobby() {
    const [searchParams] = useSearchParams();
    
    // 💡 Pre-fill the name automatically if it was provided on the home screen!
    const [name, setName] = useState(searchParams.get('name') || '');
    const [roomCode, setRoomCode] = useState('');
    const [roomData, setRoomData] = useState(null); 
    const [isHost, setIsHost] = useState(false);

    useEffect(() => {
        // 🔄 Aligned listener: Catching room updates from the backend state machine
        prompt2Socket.on('room_updated', (data) => {
            setRoomData(data);
        });

        // 🔄 Aligned listener: Catching game state change to transition components
        prompt2Socket.on('game_started', (data) => {
            console.log("Game is starting with data:", data);
            // Later you will lift state or use a view switcher here (e.g., setGameState(data.gameState))
        });

        return () => {
            prompt2Socket.off('room_updated');
            prompt2Socket.off('game_started');
        };
    }, []);

    const handleCreateRoom = (e) => {
        e.preventDefault();
        if (!name.trim()) return alert('Please enter a name!');

        // Generate a random 4-character room code
        const generatedCode = Math.random().toString(36).substring(2, 6).toUpperCase();
        setRoomCode(generatedCode);
        setIsHost(true);

        // 🔄 Aligned event: Sending payload expected by registerPrompt2Namespace
        prompt2Socket.emit('join_room', { roomCode: generatedCode, username: name });
    };

    const handleStartGame = () => {
        // 🔄 Aligned event: Sending payload to transition room state
        prompt2Socket.emit('start_game', { roomCode });
    };

    // Transform players object into an array for easy mapping
    const playersArray = roomData ? Object.entries(roomData.players).map(([id, details]) => ({
        id,
        name: details.username
    })) : [];

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
                        {playersArray.map((player) => (
                            <ListGroup.Item key={player.id} className="d-flex justify-content-between align-items-center">
                                <span>{player.name}</span>
                                {isHost && player.name === name && (
                                    <span className="badge bg-primary rounded-pill">Host</span>
                                )}
                            </ListGroup.Item>
                        ))}
                    </ListGroup>

                    {isHost ? (
                        <Button 
                            variant="success" 
                            className="w-100 fw-bold py-2"
                            disabled={playersArray.length < 3} // Apples to apples usually needs at least 3 players
                            onClick={handleStartGame}
                        >
                            {playersArray.length < 3 ? 'Waiting for Players (Min 3)' : 'Start Game'}
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