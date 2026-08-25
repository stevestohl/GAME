import React, { useState, useEffect } from 'react';
import { Container, Card, Row, Col, ProgressBar, Spinner } from 'react-bootstrap';

export default function CouchCastWritingTV({ currentPrompt, endTime, players, hostId }) {
    const [timeLeft, setTimeLeft] = useState(60);

    // Sync timer perfectly with the backend's absolute endTime
    useEffect(() => {
        if (!endTime) return;
        
        const updateTime = () => {
            const remaining = Math.floor((endTime - Date.now()) / 1000);
            setTimeLeft(remaining > 0 ? remaining : 0);
        };
        
        updateTime(); // Run once immediately
        const timer = setInterval(updateTime, 1000);
        
        return () => clearInterval(timer);
    }, [endTime]);

    const getPromptText = (p) => {
        if (!p) return "";
        if (typeof p === 'string') return p;
        return p.prompt || p.text || "Unknown Prompt";
    };

    // Filter out the TV (Caster) and the Judge (Host) so we only map the writers
    const activeWriters = players.filter(p => p.id !== hostId && !p.isCaster);

    return (
        <Container className="mt-5 pt-3 text-center px-5">
            <h2 className="text-secondary fw-bold mb-3">The Prompt is...</h2>
            
            {/* The Winning Prompt Display */}
            <Card className="shadow bg-primary text-white mb-5 mx-auto" style={{ maxWidth: '900px', borderWidth: '0' }}>
                <Card.Body className="p-5">
                    <h1 className="display-4 fw-bold m-0">{getPromptText(currentPrompt)}</h1>
                </Card.Body>
            </Card>

            {/* TV Sync Timer */}
            <div className="mx-auto mb-5" style={{ maxWidth: '800px' }}>
                <div className="d-flex justify-content-between mb-2">
                    <span className="fw-bold text-muted fs-5">Time Remaining</span>
                    <span className={`fw-bold fs-4 ${timeLeft <= 10 ? 'text-danger' : 'text-primary'}`}>
                        {timeLeft}s
                    </span>
                </div>
                <ProgressBar 
                    animated 
                    now={(timeLeft / 60) * 100} 
                    variant={timeLeft <= 10 ? 'danger' : 'info'} 
                    style={{ height: '20px' }} 
                />
            </div>

            {/* Grid of Players Writing */}
            <Row className="justify-content-center g-4" style={{ maxWidth: '1000px', margin: '0 auto' }}>
                {activeWriters.map(player => (
                    <Col xs={4} md={3} key={player.id}>
                        <Card 
                            className={`shadow-sm h-100 transition-all ${player.hasSubmitted ? 'bg-success text-white border-success' : 'bg-light text-muted border-light'}`}
                            style={{ transform: player.hasSubmitted ? 'scale(1.05)' : 'scale(1)' }}
                        >
                            <Card.Body className="d-flex flex-column align-items-center justify-content-center p-4">
                                <h4 className="fw-bold mb-3">{player.name}</h4>
                                {player.hasSubmitted ? (
                                    <span className="display-6 m-0">✅</span>
                                ) : (
                                    <Spinner animation="grow" variant="secondary" size="sm" />
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        </Container>
    );
}