import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Spinner, InputGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { getRandomFunnyName } from '../../funnyNames.js';
import { tictactoeSocket as socket } from '../../socket.js';

 // This is the socket connection logic needed in the create screen form below
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


    // This is the create screen form 
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
        <div className='page-container'>
            <Card className='main-card'>
                <Card.Header className='main-card-header'>
                    Tic-Tac-Toe Setup
                </Card.Header>

                <Card.Body className="p-4 text-center">
                    <h4 
                        className="fw-bold mb-2"
                        style={{ color: '#014eb6'}}>Host a Match!</h4>
                    <p className="text-muted small mb-4"></p>

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

                    <div className='d-flex gap-2'>
                            <Button 
                                variant="outline-secondary" 
                                className="w-50 fw-bold"
                                onClick={() => navigate('/')}
                            >
                                Back
                            </Button>

                            <Button 
                                variant="primary" 
                                className="w-50 fw-bold"
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
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </div>
    );
}