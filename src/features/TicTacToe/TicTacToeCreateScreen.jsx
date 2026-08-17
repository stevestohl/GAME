import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Spinner, InputGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { getRandomFunnyName } from '../../funnyNames.js';
import { tictactoeSocket as socket } from '../../socket.js';

/**
 * Socket.IO helper to create a room and navigate to the manager
 */
export const handleCreateTttRoom = (playerName, navigate, setIsCreating) => {
    if (!socket) {
        console.error("Socket instance is undefined! Check import path in socket.js");
        alert("Unable to connect to game server. Please refresh and try again.");
        if (setIsCreating) setIsCreating(false);
        return;
    }

    if (setIsCreating) setIsCreating(true);

    if (!socket.connected) {
        socket.connect();
    }

    socket.off('roomCreated');

    // Emit real-time room creation event to backend
    socket.emit('createRoom', { hostName: playerName || 'Host' });

    // Listen for room code generation from backend
    socket.on('roomCreated', ({ roomCode }) => {
        if (setIsCreating) setIsCreating(false);
        socket.off('roomCreated');

        navigate(`/tictactoe?room=${roomCode}&role=host&name=${encodeURIComponent(playerName || 'Host')}`);
    });
};

export default function TicTacToeCreateScreen() {
    const navigate = useNavigate();
    const [hostName, setHostName] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        const savedName = localStorage.getItem('templePlayerName');
        setHostName(savedName || getRandomFunnyName());
    }, []);

    const handleRandomizeName = () => {
        const randomName = getRandomFunnyName();
        setHostName(randomName);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const trimmed = hostName.trim();
        if (!trimmed) return;

        localStorage.setItem('templePlayerName', trimmed);
        handleCreateTttRoom(trimmed, navigate, setIsCreating);
    };

    return (
        <div className="d-flex justify-content-center align-items-center p-1" style={{ minHeight: "80vh" }}>
            <Card className="text-center shadow-lg border-0" style={{ maxWidth: "420px", width: "100%" }}>
                <Card.Header 
                    as="h5" 
                    className="d-flex align-items-center justify-content-center border-0 py-2 fw-black tracking-widest text-uppercase fs-6"
                    style={{ backgroundColor: '#014eb6', color: '#f1f2f5', letterSpacing: '0.2em' }}>
                    Tic-Tac-Toe Setup
                </Card.Header>

                <Card.Body className="p-4 text-center">
                    <h4 className="fw-bold text-dark mb-2">Host a Match</h4>
                    <p className="text-muted small mb-4">Enter your nickname to spin up a new game room.</p>

                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-4 text-start">
                            <Form.Label className="fw-bold text-secondary small">Host Name</Form.Label>
                            <InputGroup>
                                <Form.Control 
                                    size="lg"
                                    type="text"
                                    placeholder="Enter your name"
                                    value={hostName}
                                    onChange={(e) => setHostName(e.target.value)}
                                    maxLength={12}
                                    className="text-center fw-bold"
                                    required
                                />
                                <Button 
                                    variant="outline-primary" 
                                    type="button"
                                    onClick={handleRandomizeName}
                                    title="Generate Random Name"
                                    className="px-3 fs-5"
                                >
                                    🎲
                                </Button>
                            </InputGroup>
                        </Form.Group>

                        <Button 
                            variant="primary" 
                            size="lg" 
                            className="w-100 fw-bold shadow-sm py-2 mb-2" 
                            type="submit"
                            disabled={isCreating}
                        >
                            {isCreating ? (
                                <>
                                    <Spinner animation="border" size="sm" className="me-2" />
                                    Creating Room...
                                </>
                            ) : (
                                'Create Room'
                            )}
                        </Button>

                        <Button 
                            variant="outline-secondary" 
                            size="sm" 
                            className="w-100 mt-2"
                            onClick={() => navigate('/')}
                        >
                            Cancel
                        </Button>
                    </Form>
                </Card.Body>
            </Card>
        </div>
    );
}