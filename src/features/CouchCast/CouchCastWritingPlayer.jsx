import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Form, Spinner } from 'react-bootstrap';
import { couchCastSocket as socket } from '../../socket';

// Temporary dummy deck to test the UI!
const DUMMY_HAND = [
    "A suspicious puddle.",
    "My browser history.",
    "Unpaid parking tickets.",
    "A flock of angry seagulls.",
    "An infinite loop.",
    "Whatever is behind you right now."
];

export default function CouchCastWritingPlayer({ roomCode, currentPrompt, endTime, isJudge, hasSubmitted }) {
    const [timeLeft, setTimeLeft] = useState(60);
    const [selectedCard, setSelectedCard] = useState(null);
    const [writeIn, setWriteIn] = useState("");
    const [isWriteInMode, setIsWriteInMode] = useState(false);

    // Sync timer perfectly with the backend's absolute endTime
    useEffect(() => {
        if (!endTime) return;
        const updateTime = () => {
            const remaining = Math.floor((endTime - Date.now()) / 1000);
            setTimeLeft(remaining > 0 ? remaining : 0);
        };
        updateTime();
        const timer = setInterval(updateTime, 1000);
        return () => clearInterval(timer);
    }, [endTime]);

    const getPromptText = (p) => {
        if (!p) return "";
        if (typeof p === 'string') return p;
        return p.prompt || p.text || "Unknown Prompt";
    };

    const handleSubmit = () => {
        let finalAnswer = "";
        let usedWriteIn = false;

        if (isWriteInMode && writeIn.trim()) {
            finalAnswer = writeIn.trim();
            usedWriteIn = true;
        } else if (selectedCard) {
            finalAnswer = selectedCard;
        } else {
            return; // Safety catch
        }

        // Emit exactly what your couchcast_handler.js is listening for
        socket.emit('submit_answer', { roomCode, answer: finalAnswer, usedWriteIn });
    };

    // ==========================================
    // 1. JUDGE VIEW (Waiting for answers)
    // ==========================================
    if (isJudge) {
        return (
            <Container className="mt-5 d-flex justify-content-center">
                <Card className="shadow-sm w-100 border-primary" style={{ maxWidth: '420px' }}>
                    <Card.Body className="text-center p-5">
                        <h3 className="text-primary fw-bold mb-3">You set the vibe!</h3>
                        <h5 className="text-dark mb-4">"{getPromptText(currentPrompt)}"</h5>
                        <Spinner animation="border" variant="primary" className="mb-3" />
                        <p className="text-muted">Waiting for players to submit their answers...</p>
                        <h4 className={`fw-bold mt-4 ${timeLeft <= 10 ? 'text-danger' : 'text-info'}`}>⏱️ {timeLeft}s</h4>
                    </Card.Body>
                </Card>
            </Container>
        );
    }

    // ==========================================
    // 2. PLAYER VIEW (Answer Locked In)
    // ==========================================
    if (hasSubmitted) {
        return (
            <Container className="mt-5 d-flex justify-content-center">
                <Card className="shadow-sm w-100 bg-success text-white border-0" style={{ maxWidth: '420px' }}>
                    <Card.Body className="text-center p-5">
                        <h1 className="display-1 mb-3">✅</h1>
                        <h2 className="fw-bold mb-3">Answer Locked!</h2>
                        <p className="fs-5">Waiting for the rest of the room...</p>
                    </Card.Body>
                </Card>
            </Container>
        );
    }

    // ==========================================
    // 3. PLAYER VIEW (Currently Writing)
    // ==========================================
    const canSubmit = (isWriteInMode && writeIn.trim().length > 0) || (!isWriteInMode && selectedCard);

    return (
        <Container className="mt-4 pb-4 d-flex justify-content-center">
            <Card className="shadow-sm w-100 border-0" style={{ maxWidth: '450px' }}>
                <Card.Header className="bg-primary text-white text-center py-4 border-0">
                    <h4 className="mb-0 fw-bold lh-base">{getPromptText(currentPrompt)}</h4>
                </Card.Header>
                
                <Card.Body className="p-4 bg-light">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <span className="fw-bold text-muted text-uppercase small">Pick your answer:</span>
                        <span className={`fw-bold fs-5 ${timeLeft <= 10 ? 'text-danger' : 'text-info'}`}>⏱️ {timeLeft}s</span>
                    </div>

                    <div className="d-flex flex-column gap-2 mb-4">
                        {/* Render the dummy hand */}
                        {DUMMY_HAND.map((card, idx) => (
                            <Button
                                key={idx}
                                variant={selectedCard === card && !isWriteInMode ? 'primary' : 'outline-secondary'}
                                className="text-start p-3 text-wrap fw-bold shadow-sm bg-white"
                                onClick={() => {
                                    setSelectedCard(card);
                                    setIsWriteInMode(false);
                                }}
                            >
                                {card}
                            </Button>
                        ))}
                        
                        {/* Custom Write-In Option */}
                        <Card 
                            className={`shadow-sm mt-2 transition-all ${isWriteInMode ? 'border-primary border-3' : 'border-0'}`}
                            onClick={() => setIsWriteInMode(true)}
                            style={{ cursor: 'pointer' }}
                        >
                            <Card.Body className="p-2">
                                <Form.Control
                                    type="text"
                                    placeholder="✍️ Custom Write-In..."
                                    value={writeIn}
                                    onChange={(e) => setWriteIn(e.target.value)}
                                    onFocus={() => setIsWriteInMode(true)}
                                    className="fw-bold border-0 shadow-none fs-5 py-2"
                                    maxLength={60}
                                />
                            </Card.Body>
                        </Card>
                    </div>

                    <Button
                        variant={canSubmit ? 'success' : 'secondary'}
                        size="lg"
                        className="w-100 fw-bold py-3 shadow-sm"
                        onClick={handleSubmit}
                        disabled={!canSubmit}
                    >
                        {canSubmit ? "Lock it in!" : "Select an Answer"}
                    </Button>
                </Card.Body>
            </Card>
        </Container>
    );
}