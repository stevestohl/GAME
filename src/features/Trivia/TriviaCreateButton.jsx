import React, { useEffect, useState } from 'react';
import { Card, Form, Button, InputGroup, Modal, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { triviaSocket as socket } from '../../socket.js'; 
import { getRandomFunnyName } from '../../funnyNames.js';

export function handleCreateTriviaRoom(playerName, navigate, setIsCreatingRoom) {
    const cleanName = playerName && playerName.trim() ? playerName.trim() : 'Host';    
    
    if (!socket) {
        console.error("Socket instance is undefined! Check import path in socket.js");
        alert("Unable to connect to game server. Please refresh and try again.");
        if (setIsCreatingRoom) setIsCreatingRoom(false);
        return;
    }
    
    if (setIsCreatingRoom) setIsCreatingRoom(true);
    
    if (!socket.connected) {
        socket.connect();
    }
    
    // Clean up stale listeners
    socket.off('roomCreated');
    socket.off('connect_error');

    socket.once('connect_error', (err) => {
        console.error("Trivia Socket connection error:", err);
        if (setIsCreatingRoom) setIsCreatingRoom(false);
        alert("Could not connect to the Trivia server.");
    });

    console.log(`Requesting Trivia Room creation for: ${cleanName}`);
    socket.emit('createRoom', { hostName: cleanName });

    socket.once('roomCreated', ({ roomCode }) => {
        console.log(`Trivia room created successfully! Code: ${roomCode}`);
        navigate(`/trivia?room=${roomCode}&role=host&name=${encodeURIComponent(cleanName)}`);
    });
}

export default function TriviaCreateScreen() {
    const navigate = useNavigate();
    const [hostName, setHostName] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        const savedName = localStorage.getItem('templePlayerName');
        setHostName(savedName || getRandomFunnyName());
    }, []);

    const handleRandomizeName = () => {
        setHostName(getRandomFunnyName());
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const trimmed = hostName.trim();
        if (!trimmed) return;
        
        localStorage.setItem('templePlayerName', trimmed);
        // Fixed: Call handleCreateTriviaRoom instead of handleCreateTttRoom
        handleCreateTriviaRoom(trimmed, navigate, setIsCreating);
    };

    return (
        <div className="d-flex justify-content-center align-items-center p-1" style={{ minHeight: "80vh" }}>
            <Card className="text-center shadow-lg border-0" style={{ maxWidth: "450px", width: "100%" }}>
                <Card.Header
                    as="h5"
                    className="d-flex align-items-center justify-content-center border-0 py-2 fw-bold text-uppercase fs-6"
                    style={{ backgroundColor: '#014eb6', color: '#f1f2f5', letterSpacing: '0.2em' }}
                >
                    Trivia Setup
                </Card.Header>

                <Card.Body className="p-4">
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-4 text-start">
                            <Form.Label className="fw-bold small text-muted text-uppercase">
                                Your Host Name
                            </Form.Label>
                            <InputGroup>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter your name"
                                    value={hostName}
                                    onChange={(e) => setHostName(e.target.value)}
                                    maxLength={15}
                                    required
                                />
                                <Button variant="outline-secondary" onClick={handleRandomizeName}>
                                    🎲
                                </Button>
                            </InputGroup>
                        </Form.Group>

                        <div className="d-flex gap-2">
                            <Button 
                                variant="outline-secondary" 
                                className="w-50 fw-bold"
                                onClick={() => navigate('/')}
                            >
                                Back
                            </Button>
                            <Button 
                                type="submit" 
                                variant="primary" 
                                className="w-50 fw-bold"
                                disabled={!hostName.trim()}
                            >
                                Create Room
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>

            {/* Creating Room Overlay Modal */}
            <Modal show={isCreating} backdrop="static" keyboard={false} centered>
                <Modal.Body className="d-flex flex-column align-items-center justify-content-center p-4">
                    <Spinner animation="border" variant="primary" className="mb-3" />
                    <h4 className="fw-bold text-dark">Creating Room...</h4>
                    <p className="text-muted small mb-0">Setting up Trivia server...</p>
                </Modal.Body>
            </Modal>
        </div>
    );
}