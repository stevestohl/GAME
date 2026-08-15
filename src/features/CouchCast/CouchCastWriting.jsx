import React, { useState } from 'react';
import { Container, Card, Button, Form, Spinner } from 'react-bootstrap';
import { couchCastSocket as socket } from '../../socket';

export default function CouchCastWriting({ 
    roomCode, 
    isJudge, 
    currentPrompt, 
    hasSubmitted,
    hasWriteInCard = true // 👈 We will get this from playerData later!
}) {
    const [selectedCard, setSelectedCard] = useState('');
    const [customAnswer, setCustomAnswer] = useState('');

    // 🃏 DUMMY DATA: Regular cards
    const myCards = [
        "A highly suspicious casserole",
        "My browser history",
        "Unpaid parking tickets",
        "A sudden, overwhelming sense of dread",
        "Just, like, a lot of bees"
    ];

    const handleSubmit = () => {
        const finalAnswer = selectedCard === 'WRITE_IN' ? customAnswer.trim() : selectedCard;
        if (!finalAnswer) return; 
        
        console.log(`[CouchCast] Submitting answer for room ${roomCode}: ${finalAnswer}`);
        socket.emit('submit_answer', { roomCode, answer: finalAnswer, usedWriteIn: selectedCard === 'WRITE_IN' });
    };

    // ==========================================
    // 1. THE JUDGE'S VIEW
    // ==========================================
    if (isJudge) {
        return (
            <Container className="mt-5 d-flex justify-content-center">
                <Card className="shadow-sm w-100 border-warning" style={{ maxWidth: '420px' }}>
                    <Card.Body className="text-center p-5">
                        <Spinner animation="grow" variant="warning" className="mb-4" />
                        <Card.Title className="fw-bold fs-4 text-dark mb-2">The trap is set.</Card.Title>
                        <Card.Text className="text-muted fs-6">
                            Waiting for the peasants to submit their answers. 
                            <br/><br/>
                            <strong>Prompt:</strong> "{currentPrompt}"
                        </Card.Text>
                    </Card.Body>
                </Card>
            </Container>
        );
    }

    // ==========================================
    // 2. PLAYER VIEW (ALREADY SUBMITTED)
    // ==========================================
    if (hasSubmitted) {
        return (
            <Container className="mt-5 d-flex justify-content-center">
                <Card className="shadow-sm w-100 border-success" style={{ maxWidth: '420px' }}>
                    <Card.Body className="text-center p-5">
                        <div className="display-4 mb-3">✅</div>
                        <Card.Title className="fw-bold fs-4 text-dark mb-2">Answer Locked!</Card.Title>
                        <Card.Text className="text-muted fs-6">
                            Look at the TV and wait for the remaining players.
                        </Card.Text>
                    </Card.Body>
                </Card>
            </Container>
        );
    }

    // ==========================================
    // 3. PLAYER VIEW (NEEDS TO SUBMIT)
    // ==========================================
    return (
        <Container className="mt-4 d-flex justify-content-center pb-5">
            <Card className="shadow-sm w-100" style={{ maxWidth: '420px' }}>
                <Card.Header className="bg-primary text-white text-center py-3">
                    <div className="small fw-bold text-uppercase opacity-75 mb-1" style={{ letterSpacing: '2px' }}>
                        The Prompt
                    </div>
                    <div className="fs-5 fw-bold">
                        {currentPrompt || "Loading prompt..."}
                    </div>
                </Card.Header>
                
                <Card.Body>
                    <div className="d-flex flex-column gap-2 mb-4">
                        
                        {/* The Pre-Drawn Cards */}
                        {myCards.map((card, index) => (
                            <Button
                                key={index}
                                variant={selectedCard === card ? 'primary' : 'outline-dark'}
                                className="text-start p-3 fw-semibold text-wrap shadow-sm"
                                onClick={() => setSelectedCard(card)}
                            >
                                {card}
                            </Button>
                        ))}

                        {/* The Consumable "Blank Card" */}
                        {hasWriteInCard && (
                            <div className="mt-2">
                                {selectedCard === 'WRITE_IN' ? (
                                    // Active State: They clicked the blank card and are typing
                                    <div className="p-2 border border-warning rounded shadow-sm bg-light">
                                        <div className="d-flex justify-content-between align-items-center mb-2 px-1">
                                            <small className="fw-bold text-warning text-uppercase" style={{ letterSpacing: '1px' }}>
                                                ✏️ Custom Answer
                                            </small>
                                            {/* Let them cancel and go back to the blank card state */}
                                            <span 
                                                className="text-muted" 
                                                style={{ cursor: 'pointer', fontSize: '12px' }}
                                                onClick={() => {
                                                    setSelectedCard('');
                                                    setCustomAnswer('');
                                                }}
                                            >
                                                ✖ Cancel
                                            </span>
                                        </div>
                                        <Form.Control
                                            as="textarea"
                                            rows={2}
                                            className="fw-bold text-center fs-5 border-0 bg-transparent"
                                            style={{ boxShadow: 'none', resize: 'none' }}
                                            placeholder="Type it here..."
                                            value={customAnswer}
                                            onChange={(e) => setCustomAnswer(e.target.value)}
                                            autoFocus
                                        />
                                    </div>
                                ) : (
                                    // Inactive State: Just looks like a blank dashed card in their hand
                                    <Button
                                        variant="light"
                                        className="w-100 text-center p-3 text-muted fw-bold shadow-sm"
                                        style={{ border: '2px dashed #ccc', backgroundColor: '#f8f9fa' }}
                                        onClick={() => setSelectedCard('WRITE_IN')}
                                    >
                                        -- write-in --
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>

                    <Button 
                        variant="success" 
                        size="lg" 
                        className="w-100 fw-bold py-3 shadow" 
                        disabled={!selectedCard || (selectedCard === 'WRITE_IN' && !customAnswer.trim())}
                        onClick={handleSubmit}
                    >
                        Submit Answer!
                    </Button>
                </Card.Body>
            </Card>
        </Container>
    );
}