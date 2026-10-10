import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Form, InputGroup, Spinner } from 'react-bootstrap';
import { couchCastSocket as socket } from '../../socket';

export default function CouchCastWritingPlayer({ roomCode, currentPrompt, endTime, isJudge, hasSubmitted }) {
    const [timeLeft, setTimeLeft] = useState(60);
    const [writeIn, setWriteIn] = useState("");
    
    // NEW: State to hold the real database cards
    const [playerHand, setPlayerHand] = useState([]);

    // Timer Sync
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

    // NEW: Fetch hand from the backend
    useEffect(() => {
        if (!isJudge && !hasSubmitted) {
            socket.emit('request_hand');
            
            socket.on('receive_hand', (data) => {
                setPlayerHand(data.hand);
            });
        }
        
        return () => socket.off('receive_hand');
    }, [isJudge, hasSubmitted]);

    const getPromptText = (p) => {
        if (!p) return "";
        if (typeof p === 'string') return p;
        return p.prompt || p.text || "Unknown Prompt";
    };

    // Tapping a card plays it straight away
    const handlePlayCard = (cardText) => {
        socket.emit('submit_answer', { roomCode, answer: cardText, usedWriteIn: false });
    };

    // The write-in is the only answer that needs a send button
    const handleSendWriteIn = (e) => {
        e.preventDefault();
        const answer = writeIn.trim();
        if (!answer) return;
        socket.emit('submit_answer', { roomCode, answer, usedWriteIn: true });
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
    return (
        <Container className="mt-4 pb-4 d-flex justify-content-center">
            <Card className="shadow-sm w-100 border-0" style={{ maxWidth: '450px' }}>
                <Card.Header className="bg-primary text-white text-center py-4 border-0">
                    <h4 className="mb-0 fw-bold lh-base">{getPromptText(currentPrompt)}</h4>
                </Card.Header>
                
                <Card.Body className="p-4 bg-light">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <span className="fw-bold text-muted text-uppercase small">Tap your answer:</span>
                        <span className={`fw-bold fs-5 ${timeLeft <= 10 ? 'text-danger' : 'text-info'}`}>⏱️ {timeLeft}s</span>
                    </div>

                    <div className="d-flex flex-column gap-2">
                        {/* Render real cards, with a loading state just in case */}
                        {playerHand.length === 0 ? (
                            <div className="text-center py-4">
                                <Spinner animation="border" variant="secondary" />
                                <p className="text-muted mt-2 mb-0">Drawing cards...</p>
                            </div>
                        ) : (
                            playerHand.map((card) => (
                                <Button
                                    key={card._id} // Use Mongo's _id for the key
                                    variant="outline-secondary"
                                    className="text-start p-3 text-wrap fw-bold shadow-sm bg-white"
                                    onClick={() => handlePlayCard(card.text)}
                                >
                                    {card.text}
                                </Button>
                            ))
                        )}
                        
                        {/* Custom Write-In Option: type it, then hit send */}
                        <Card className="shadow-sm mt-2 border-0">
                            <Card.Body className="p-2">
                                <Form onSubmit={handleSendWriteIn}>
                                    <InputGroup>
                                        <Form.Control
                                            type="text"
                                            placeholder="✍️ Custom Write-In..."
                                            value={writeIn}
                                            onChange={(e) => setWriteIn(e.target.value)}
                                            className="fw-bold border-0 shadow-none fs-5 py-2"
                                            maxLength={60}
                                            aria-label="Custom write-in answer"
                                        />
                                        <Button
                                            type="submit"
                                            variant={writeIn.trim() ? 'success' : 'secondary'}
                                            className="fw-bold px-3 rounded"
                                            disabled={!writeIn.trim()}
                                            aria-label="Send write-in answer"
                                        >
                                            Send
                                        </Button>
                                    </InputGroup>
                                </Form>
                            </Card.Body>
                        </Card>
                    </div>
                </Card.Body>
            </Card>
        </Container>
    );
}