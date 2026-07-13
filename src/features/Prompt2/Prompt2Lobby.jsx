import React, { useState } from 'react';
import { Container, Card, Button, Form, ListGroup } from 'react-bootstrap';
import { prompt2Socket as socket } from '../../socket.js';

export default function Prompt2Lobby({ name, roomCode, setRoomCode, roomData, isHost }) {
    const [localName, setLocalName] = useState(name);

    const handleCreateRoom = (e) => {
        e.preventDefault();
        if (!localName.trim()) return alert('Please enter a name!');

        const generatedCode = Math.random().toString(36).substring(2, 6).toUpperCase();
        setRoomCode(generatedCode);
        socket.emit('join_room', { roomCode: generatedCode, username: localName });
    };

    const handleStartGame = () => {
        socket.emit('start_game', { roomCode });
    };

    const playersArray = roomData ? Object.entries(roomData.players).map(([id, details]) => ({
        id,
        name: details.username,
        isPlayerHost: roomData.hostId === id
    })) : [];

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
                                    value={localName} 
                                    onChange={(e) => setLocalName(e.target.value)} 
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

    return (
        <Container className="mt-5 d-flex justify-content-center">
            <Card className="shadow-sm w-100" style={{ maxWidth: '420px' }}>
                <Card.Body className="text-center">
                    <Card.Title className="fs-3 fw-bold mb-1 text-success">Waiting Room</Card.Title>
                    <p className="text-muted small mb-4">Game: Judge Style Arena</p>

                    <div className="bg-light p-3 rounded mb-4 border">
                        <span className="text-secondary d-block small fw-bold text-uppercase">Room Code</span>
                        <span className="fs-2 fw-bold text-dark tracking-wide">{roomCode}</span>
                    </div>

                    <h5 className="text-start mb-2 fw-semibold">Players Joined:</h5>
                    <ListGroup className="mb-4 text-start">
                        {playersArray.map((player) => (
                            <ListGroup.Item key={player.id} className="d-flex justify-content-between align-items-center">
                                <span>{player.name}</span>
                                {player.isPlayerHost && (
                                    <span className="badge bg-primary rounded-pill">Host / Judge</span>
                                )}
                            </ListGroup.Item>
                        ))}
                    </ListGroup>

                    {isHost ? (
                        <Button 
                            variant="success" 
                            className="w-100 fw-bold py-2"
                            disabled={playersArray.length < 3}
                            onClick={handleStartGame}
                        >
                            {playersArray.length < 3 ? 'Waiting for Players (Min 3)' : 'Start Game'}
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