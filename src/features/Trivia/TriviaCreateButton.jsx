import React, { useEffect, useState } from 'react';
import { Card, Form, Button, InputGroup, Modal, Spinner, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { triviaSocket as socket } from '../../socket.js'; 
import { getRandomFunnyName } from '../../funnyNames.js';
import { TRIVIA_DECKS, QUESTION_OPTIONS } from '../../cardDecks.js';
import DeckCard from '../Menu/DeckCard.jsx';
import RoundsPicker from '../Menu/RoundsPicker.jsx';

export function handleCreateTriviaRoom(playerName, navigate, setIsCreatingRoom, expansion = 'core', totalRounds = QUESTION_OPTIONS[0]) {
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

    console.log(`Requesting Trivia Room creation for: ${cleanName} (deck: ${expansion}, questions: ${totalRounds})`);
    socket.emit('createRoom', { hostName: cleanName, expansion, totalRounds });

    socket.once('roomCreated', ({ roomCode }) => {
        console.log(`Trivia room created successfully! Code: ${roomCode}`);
        navigate(`/trivia?room=${roomCode}&role=host&name=${encodeURIComponent(cleanName)}`);
    });
}

export default function TriviaCreateScreen() {
    const navigate = useNavigate();
    const [hostName, setHostName] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [expansion, setExpansion] = useState('core');
    const [totalRounds, setTotalRounds] = useState(QUESTION_OPTIONS[0]);

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
        handleCreateTriviaRoom(trimmed, navigate, setIsCreating, expansion, totalRounds);
    };

    return (
        <div className="page-container">
            <Card className="main-card">
                <Card.Header className="main-card-header">
                    Trivia Setup
                </Card.Header>

                <Card.Body className="p-3">
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

                        {/* 🔢 How many questions */}
                        <Form.Group className="mb-4 text-start">
                            <Form.Label className="fw-bold small text-muted text-uppercase">
                                How Many Questions?
                            </Form.Label>
                            <RoundsPicker
                                label="Questions"
                                options={QUESTION_OPTIONS}
                                value={totalRounds}
                                onChange={setTotalRounds}
                                disabled={isCreating}
                            />
                        </Form.Group>

                        {/* 🃏 Question deck (expansion) */}
                        <Form.Group className="mb-4 text-start">
                            <Form.Label className="fw-bold small text-muted text-uppercase">
                                Question Deck
                            </Form.Label>
                            <Row className="g-2">
                                {TRIVIA_DECKS.map((deck, i) => (
                                    <Col xs={4} key={deck.id}>
                                        <DeckCard
                                            compact
                                            deck={deck}
                                            index={i}
                                            selected={expansion === deck.id}
                                            disabled={isCreating}
                                            onClick={() => setExpansion(deck.id)}
                                            ariaLabel={`Play with the ${deck.title} questions`}
                                        />
                                    </Col>
                                ))}
                            </Row>
                        </Form.Group>

                        <div className="d-flex gap-2">
                            <Button 
                                variant="outline-secondary" 
                                className="w-50 fw-bold"
                                onClick={() => navigate('/temple')}
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